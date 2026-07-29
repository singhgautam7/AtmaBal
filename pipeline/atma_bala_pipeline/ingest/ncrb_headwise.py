"""REAL NCRB per-crime-head ingestion for the 19 metropolitan cities.

Source: NCRB "Crime in India 2024", Volume 1, **Table 3B.2** ("IPC/BNS & SLL
Crimes against Women - Crime Head-wise & City-wise"), pages 397-424 of the master
PDF on OpenCity. NCRB does NOT publish this split as a clean CSV/XLSX (the
metro XLSX, Table 3B.1, is totals only), and the dedicated head-wise CSV/PDF
resources cover the *non-metro* city tier - so this table must be read from the
master PDF. NCRB publishes it per year, so head-wise data is currently 2024 only.

The table is wide and straddles pages, so we do NOT trust naive parsing: for every
head we extract all 19 metros' incidence ("Total"/"I") and assert the sum equals
NCRB's own printed "TOTAL CITIES" figure for that column. A mismatch raises - we
would rather ingest nothing than ship a wrong number.

PRINCIPAL-OFFENCE RULE: NCRB counts each FIR under a single most-serious head, so
heads never double-count; the sum of all heads equals the city's Crime-against-
Women total (verified: Table 3B.2's per-city grand total == Table 3B.1's total).
The web app charts the major heads and shows the rest as an honest "Other
offences" remainder (total - sum of listed heads) - see export.export_crime.

Run: `uv run atmabal ingest-ncrb-headwise` (writes crime_head + crime_stat, 2024).
"""

from __future__ import annotations

import io
import re
import sqlite3
from datetime import date

import httpx

UA = "AtmaBal/0.1 (github.com/singhgautam7/AtmaBal)"
YEAR = 2024
# 2024 master, Volume 1 (contains Table 3B.2).
PDF_URL = ("https://data.opencity.in/dataset/7d883875-921a-4820-b298-713c6219bd90/"
           "resource/46f760f4-dcf4-4f95-85c9-2225e2f7bbe8/download/vol1-crimeinindia2024.pdf")

# The 19 metros appear as rows 1..19 in Table 3B.2, in this fixed order.
METRO_SLUGS = ["ahmedabad", "bengaluru", "chennai", "coimbatore", "delhi", "ghaziabad",
               "hyderabad", "indore", "jaipur", "kanpur", "kochi", "kolkata", "kozhikode",
               "lucknow", "mumbai", "nagpur", "patna", "pune", "surat"]

# (head_id, display, category, scope, is_child, page, col) - col = 0-based index of the
# head's incidence within a data row's numbers. IPC/BNS pages are 2 blocks of
# [IPC,BNS,Total,V,R] (block1 Total=2, block2 Total=7); SLL pages are blocks of
# [Total,V,R] (block k Total=3k). Pages are 0-based (pdfplumber) in the master PDF.
HEADS = [
    ("cruelty",          "Cruelty by husband or relatives", "cruelty_domestic", "domestic", 0, 410, 7),
    ("molestation",      "Assault to outrage modesty",      "assault_modesty",  "public",   0, 401, 2),
    ("kidnap_abduction", "Kidnapping & abduction of women", "kidnap_abduction", "either",   0, 416, 2),
    ("rape",             "Rape",                            "sexual_assault",   "either",   0, 397, 2),
    ("stalking",         "Stalking",                        "harassment",       "public",   0, 407, 2),
    ("insult_modesty",   "Insult to modesty of women",      "assault_modesty",  "public",   0, 409, 2),
    ("sexual_harassment","Sexual harassment",               "harassment",       "public",   0, 403, 2),
    ("dowry_deaths",     "Dowry deaths",                    "dowry",            "domestic", 0, 410, 2),
    ("acid_attack",      "Acid attack",                     "acid_attack",      "public",   0, 415, 7),
    ("trafficking",      "Immoral traffic (ITPA)",          "trafficking",      "either",   0, 419, 0),
    ("cyber",            "Cyber crimes against women",      "cyber",            "either",   0, 421, 3),
    ("pocso_girls",      "POCSO (girl-child victims)",      "sexual_assault",   "either",   1, 422, 0),
]

_SRC = "NCRB Crime in India 2024, Table 3B.2 (Crime against Women, crime head-wise, metros)"


def _page_matrix(page) -> tuple[list[list[float]], list[float]]:
    """Rows 1..19 (numbers only) and the 'TOTAL CITIES' row for a single page."""
    rows: dict[int, list[float]] = {}
    total: list[float] | None = None
    for line in (page.extract_text() or "").splitlines():
        s = line.strip()
        if s.startswith("TOTAL CITIES"):
            total = [float(x) for x in re.findall(r"\d+\.\d+|\d+", s)]
            continue
        m = re.match(r"^(\d{1,2})\s+(.*)", s)
        if not m:
            continue
        sl = int(m.group(1))
        if not 1 <= sl <= 19 or sl in rows:
            continue
        vals = [float(x) for x in re.findall(r"\d+\.\d+|\d+", m.group(2))]
        if vals:
            rows[sl] = vals
    return [rows[i] for i in range(1, 20)], (total or [])


def fetch_headwise() -> dict[str, dict[str, int]]:
    """Return {slug: {head_id: cases}} for 2024, validated against NCRB totals."""
    import pdfplumber

    data = httpx.get(PDF_URL, headers={"User-Agent": UA}, timeout=180).content
    pdf = pdfplumber.open(io.BytesIO(data))
    cache = {p: _page_matrix(pdf.pages[p]) for p in {h[5] for h in HEADS}}

    out: dict[str, dict[str, int]] = {s: {} for s in METRO_SLUGS}
    for hid, _disp, _cat, _scope, _child, page, col in HEADS:
        mat, total = cache[page]
        colvals = [int(r[col]) for r in mat]
        got, exp = sum(colvals), int(total[col])
        if got != exp:  # never ship an unvalidated number
            raise ValueError(f"3B.2 validation failed for {hid} (p{page} c{col}): {got} != {exp}")
        for slug, v in zip(METRO_SLUGS, colvals):
            out[slug][hid] = v
    return out


def ingest(conn: sqlite3.Connection) -> dict:
    from ..db import upsert_source

    today = date.today().isoformat()
    by_city = fetch_headwise()
    src = upsert_source(conn, kind="ncrb", title=_SRC,
                        url="https://data.opencity.in", retrieved_on=today)

    for order, (hid, disp, cat, scope, child, _p, _c) in enumerate(HEADS):
        conn.execute(
            "INSERT OR REPLACE INTO crime_head"
            "(id,display_name,category,scope,is_child,display_order) VALUES (?,?,?,?,?,?)",
            (hid, disp, cat, scope, child, order),
        )

    n = 0
    for slug, heads in by_city.items():
        for hid, cases in heads.items():
            conn.execute(
                "INSERT OR REPLACE INTO crime_stat"
                "(city_id,year,head_id,measure,value,original_head_label,is_computed,source_id)"
                " VALUES (?,?,?,?,?,?,0,?)",
                (slug, YEAR, hid, "cases", float(cases), dict((h[0], h[1]) for h in HEADS)[hid], src),
            )
            n += 1
    conn.execute(
        "INSERT INTO ingest_log(dataset,year,source_id,status,rows_ingested,fetched_at)"
        " VALUES ('ncrb_headwise',?,?,?,?,?)",
        (YEAR, src, "success", n, today),
    )
    conn.commit()
    return {"status": "success", "year": YEAR, "cities": len(by_city), "rows": n}
