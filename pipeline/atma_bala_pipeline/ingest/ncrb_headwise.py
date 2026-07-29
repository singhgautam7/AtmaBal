"""REAL NCRB per-crime-head ingestion for the 19 metropolitan cities.

Source: NCRB "Crime in India", **Table 3B.2** ("Crimes against Women - Crime
Head-wise & City-wise"), read from the master PDF (Volume 1) on OpenCity. NCRB
does NOT publish this split as a clean CSV/XLSX (the metro XLSX, Table 3B.1, is
totals only), and its standalone head-wise city PDF covers the *non-metro* tier -
so the metros' split must be read from the master. NCRB publishes it per report
year, so we ingest the 2022, 2023 and 2024 volumes (2020-2021 have no such volume
-> those years stay "not available", never interpolated).

IPC -> BNS MAPPING (important, do not "simplify"): the 2022 and 2023 volumes label
heads by the OLD IPC sections; the 2024 volume uses the new BNS sections (BNS took
effect 1 Jul 2024). We map both regimes onto ONE consistent set of head ids
(`rape`, `cruelty`, ...) so a head is comparable across years, while keeping the
per-regime column layout below and storing the regime on each row. A head we can't
confidently isolate for a given year is simply omitted (it stays inside the honest
"Other offences" remainder computed in export) - never invented.

VALIDATION: the table is wide and straddles pages, so for every head we assert our
19-city sum equals NCRB's printed "TOTAL CITIES" for that column. A mismatch raises
- we would rather ingest nothing than ship a wrong number.

PRINCIPAL-OFFENCE RULE: NCRB counts each FIR under a single most-serious head, so
heads never double-count; the sum of all heads equals the city's CAW total
(verified: 3B.2's per-city grand total == 3B.1's total). export.export_crime shows
the charted heads plus an honest "Other offences" remainder.

Run: `uv run atmabal ingest-ncrb-headwise` (writes crime_head + crime_stat).
"""

from __future__ import annotations

import io
import re
import sqlite3
from datetime import date

import httpx

UA = "AtmaBal/0.1 (github.com/singhgautam7/AtmaBal)"
RES = "https://data.opencity.in/dataset/{ds}/resource/{rid}/download/{fn}"

# Rows 1..19 of Table 3B.2 are the 19 metros, in this fixed order.
METRO_SLUGS = ["ahmedabad", "bengaluru", "chennai", "coimbatore", "delhi", "ghaziabad",
               "hyderabad", "indore", "jaipur", "kanpur", "kochi", "kolkata", "kozhikode",
               "lucknow", "mumbai", "nagpur", "patna", "pune", "surat"]

# Canonical head taxonomy: id -> (display, category, scope, is_child).
HEAD_META = {
    "cruelty": ("Cruelty by husband or relatives", "cruelty_domestic", "domestic", 0),
    "molestation": ("Assault to outrage modesty", "assault_modesty", "public", 0),
    "kidnap_abduction": ("Kidnapping & abduction of women", "kidnap_abduction", "either", 0),
    "rape": ("Rape", "sexual_assault", "either", 0),
    "pocso_girls": ("POCSO (girls under 18)", "sexual_assault", "either", 1),
    "trafficking": ("Immoral traffic (ITPA)", "trafficking", "either", 0),
    "sexual_harassment": ("Sexual harassment", "harassment", "public", 0),
    "stalking": ("Stalking", "harassment", "public", 0),
    "insult_modesty": ("Insult to modesty of women", "assault_modesty", "public", 0),
    "cyber": ("Cyber crimes against women", "cyber", "either", 0),
    "dowry_deaths": ("Dowry deaths", "dowry", "domestic", 0),
    "acid_attack": ("Acid attack", "acid_attack", "public", 0),
}

# Per-year 3B.2 geometry. `pdf` = (dataset id, resource id, filename). `cols` maps
# head_id -> (pdf_page_0based, col_index_in_datarow). `label` = NCRB's original
# section label for that regime (stored on the row for traceability).
#
# 2022 & 2023 (IPC): each head is a [I,V,R] triplet; col = index of I. Same layout.
# 2024 (BNS): IPC/BNS/Total/V/R blocks; block1 Total=idx2, block2 Total=idx7.
_IPC_COLS = {"rape": (323, 3), "molestation": (325, 0), "insult_modesty": (326, 0),
             "cruelty": (318, 9), "dowry_deaths": (317, 3), "kidnap_abduction": (319, 0),
             "trafficking": (327, 0), "cyber": (329, 0), "pocso_girls": (330, 0)}
_IPC_LABELS = {"rape": "Rape (Sec.376 IPC)", "molestation": "Assault on Women with Intent to Outrage her Modesty (Sec.354 IPC)",
               "insult_modesty": "Insult to the Modesty of Women (Sec.509 IPC)", "cruelty": "Cruelty by Husband or his Relatives (Sec.498A IPC)",
               "dowry_deaths": "Dowry Deaths (Sec.304B IPC)", "kidnap_abduction": "Kidnapping & Abduction of Women",
               "trafficking": "Immoral Traffic (Prevention) Act 1956", "cyber": "Cyber Crimes/IT Act (Women Centric)",
               "pocso_girls": "POCSO Act (Girl Child Victims)"}
_BNS_COLS = {"cruelty": (410, 7), "molestation": (401, 2), "kidnap_abduction": (416, 2), "rape": (397, 2),
             "stalking": (407, 2), "insult_modesty": (409, 2), "sexual_harassment": (403, 2), "dowry_deaths": (410, 2),
             "acid_attack": (415, 7), "trafficking": (419, 0), "cyber": (421, 3), "pocso_girls": (422, 0)}

YEARS = {
    2022: {"regime": "ipc", "cols": _IPC_COLS, "labels": _IPC_LABELS,
           "pdf": ("b2d3ff5c-b109-42ad-afe0-b244c26505cd", "b70cf1ea-442a-4b23-9216-399f07e6379b", "2f0461a6-7f09-47f1-ae1e-43b68d888599.pdf")},
    2023: {"regime": "ipc", "cols": _IPC_COLS, "labels": _IPC_LABELS,
           "pdf": ("40449a25-7fb3-4e38-91b9-f834af6078e2", "b7c71212-9463-4407-ab63-f349403a75b6", "4f02eaf8-5d55-43d9-9a23-09cd724b5566.pdf")},
    2024: {"regime": "bns", "cols": _BNS_COLS,
           "labels": {k: "BNS 2024 (Table 3B.2)" for k in _BNS_COLS},
           "pdf": ("7d883875-921a-4820-b298-713c6219bd90", "46f760f4-dcf4-4f95-85c9-2225e2f7bbe8", "vol1-crimeinindia2024.pdf")},
}


def _page_matrix(page):
    rows, total = {}, []
    for line in (page.extract_text() or "").splitlines():
        s = line.strip()
        if s.startswith("TOTAL CITIE"):
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
    return [rows[i] for i in range(1, 20)], total


def fetch_year(year: int) -> dict[str, dict[str, int]]:
    import pdfplumber
    cfg = YEARS[year]
    data = httpx.get(RES.format(ds=cfg["pdf"][0], rid=cfg["pdf"][1], fn=cfg["pdf"][2]),
                     headers={"User-Agent": UA}, timeout=240).content
    pdf = pdfplumber.open(io.BytesIO(data))
    cache = {p: _page_matrix(pdf.pages[p]) for p in {pg for pg, _ in cfg["cols"].values()}}
    out: dict[str, dict[str, int]] = {s: {} for s in METRO_SLUGS}
    for hid, (pg, col) in cfg["cols"].items():
        mat, total = cache[pg]
        colvals = [int(r[col]) for r in mat]
        got, exp = sum(colvals), int(total[col])
        if got != exp:
            raise ValueError(f"{year} 3B.2 validation failed for {hid} (p{pg} c{col}): {got} != {exp}")
        for slug, v in zip(METRO_SLUGS, colvals):
            out[slug][hid] = v
    return out


def ingest(conn: sqlite3.Connection) -> dict:
    from ..db import upsert_source
    today = date.today().isoformat()
    total_rows = 0
    for order, (hid, (disp, cat, scope, child)) in enumerate(HEAD_META.items()):
        conn.execute(
            "INSERT OR REPLACE INTO crime_head(id,display_name,category,scope,is_child,display_order)"
            " VALUES (?,?,?,?,?,?)", (hid, disp, cat, scope, child, order))
    for year, cfg in YEARS.items():
        src = upsert_source(conn, kind="ncrb",
                            title=f"NCRB Crime in India {year}, Table 3B.2 ({cfg['regime'].upper()}, metros head-wise)",
                            url="https://data.opencity.in", retrieved_on=today)
        by_city = fetch_year(year)
        for slug, heads in by_city.items():
            for hid, cases in heads.items():
                conn.execute(
                    "INSERT OR REPLACE INTO crime_stat"
                    "(city_id,year,head_id,measure,value,original_head_label,is_computed,source_id)"
                    " VALUES (?,?,?,?,?,?,0,?)",
                    (slug, year, hid, "cases", float(cases), cfg["labels"].get(hid, ""), src))
                total_rows += 1
        conn.execute("INSERT INTO ingest_log(dataset,year,source_id,status,rows_ingested,fetched_at)"
                     " VALUES ('ncrb_headwise',?,?,?,?,?)", (year, src, "success", len(by_city) * len(cfg["cols"]), today))
    conn.commit()
    return {"status": "success", "years": list(YEARS), "rows": total_rows}
