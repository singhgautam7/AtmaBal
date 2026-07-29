"""REAL NCRB crime ingestion — metropolitan-city totals (crimes against women).

Reproduces exactly how the committed `data/<city>/crime.json` files were built.
Pulls NCRB "Crime in India" metro-city tables from OpenCity's CKAN
(data.opencity.in) as machine-readable CSV/XLSX — far more reliable than parsing
the master PDFs:

  * Crime in India 2022 → "Crimes Against Women in Metros 2022" (CSV): 2020–2022
  * Crime in India 2024 → TABLE 3B.1 metros (XLSX): 2022–2024 + rate + chargesheet

These are merged into per-city totals 2020–2024. NCRB does NOT publish a clean
per-offence split at city level in these tables, so v1 ships the verified total +
trend; the head-wise split (fragile PDF tables, double-count risk) is a separate,
documented job — see ncrb.py.

Run: `uv run atmabal ingest-ncrb-metros` (writes crime_city_year + emits JSON).
"""

from __future__ import annotations

import csv
import io
import re
import sqlite3
from datetime import date

import httpx

UA = "AtmaBal/0.1 (github.com/singhgautam7/AtmaBal)"
CKAN = "https://data.opencity.in/api/3/action/package_show"

# Resolve resource download URLs by (dataset id, resource name) at run time, so a
# re-published resource keeps working.
DATASETS = {
    "crime-in-india-2022": "Crimes Against Women in Metros 2022",  # CSV, 2020-22
    "crime-in-india-2024": "Metropolitan Cities - Crime Against Women (IPC/BNS+SLL)",  # XLSX, 22-24
}


def _resource_url(dataset: str, name: str) -> str | None:
    r = httpx.get(CKAN, params={"id": dataset}, headers={"User-Agent": UA}, timeout=45)
    r.raise_for_status()
    for res in r.json()["result"]["resources"]:
        if res.get("name") == name:
            return res.get("url")
    return None


def _clean_city(s: str) -> tuple[str, str | None]:
    state = None
    m = re.search(r"\((.*?)\)", s)
    if m:
        state = m.group(1).strip()
    name = re.sub(r"\s*\(.*?\)\s*", "", s).strip()
    return name, state


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def fetch_metros() -> dict[str, dict]:
    """Return {slug: {name, state, totals:{year:int}, pop, cs:{year:float}}}.

    IMPORTANT (data integrity): each NCRB volume reports the charge-sheeting rate
    for its OWN report year only - the 2022 volume gives the 2022 rate, the 2024
    volume the 2024 rate. We therefore key charge-sheet by that year and NEVER
    copy one year's figure onto the others. Years with no published rate stay
    absent, and render as "not available". Rate/lakh is NOT stored here; it is a
    deterministic function of cases and the 2011 base, computed once in ingest().
    """
    import openpyxl

    cities: dict[str, dict] = {}

    def _c(name):
        return cities.setdefault(_slug(name),
                                 {"name": name, "state": None, "totals": {}, "pop": None, "cs": {}})

    # 2022 CSV: 2020-2022 case counts, 2011 population, and the 2022 charge-sheet rate.
    url = _resource_url("crime-in-india-2022", DATASETS["crime-in-india-2022"])
    if url:
        txt = httpx.get(url, headers={"User-Agent": UA}, timeout=60).text
        for row in csv.DictReader(io.StringIO(txt)):
            name, _ = _clean_city(row[list(row.keys())[0]])
            if name.upper().startswith("TOTAL"):
                continue
            c = _c(name)
            for y in ("2020", "2021", "2022"):
                if row.get(y, "").strip().isdigit():
                    c["totals"][int(y)] = int(row[y])
            try:
                c["pop"] = float(row["Population (in lakhs 2011)"])
            except (KeyError, ValueError, TypeError):
                pass
            try:
                c["cs"][2022] = round(float(row["Chargesheet rate (%)"]), 1)  # 2022 volume => 2022
            except (KeyError, ValueError, TypeError):
                pass

    # 2024 XLSX (Table 3B.1): 2022-2024 case counts + 2011 pop + the 2024 charge-sheet rate.
    url = _resource_url("crime-in-india-2024", DATASETS["crime-in-india-2024"])
    if url:
        data = httpx.get(url, headers={"User-Agent": UA}, timeout=60).content
        wb = openpyxl.load_workbook(io.BytesIO(data), data_only=True)
        rows = list(wb.worksheets[0].iter_rows(values_only=True))
        hdr = next(i for i, r in enumerate(rows) if r and r[0] == "SL")
        for r in rows[hdr + 1:]:
            if not r or not isinstance(r[1], str):
                continue
            name, state = _clean_city(r[1])
            if name.upper().startswith("TOTAL"):
                continue
            c = _c(name)
            c["name"] = name
            if state:
                c["state"] = state
            for yi, yr in enumerate((2022, 2023, 2024)):
                if isinstance(r[2 + yi], (int, float)):
                    c["totals"][yr] = int(r[2 + yi])
            if isinstance(r[5], (int, float)):
                c["pop"] = float(r[5])
            if isinstance(r[7], (int, float)):
                c["cs"][2024] = round(float(r[7]), 1)  # 2024 volume => 2024

    # Normalise "Delhi City" -> "delhi"
    if "delhi-city" in cities:
        cities["delhi"] = cities.pop("delhi-city")
        cities["delhi"]["name"] = "Delhi"
    return cities


def ingest(conn: sqlite3.Connection) -> dict:
    from ..db import upsert_source

    today = date.today().isoformat()
    cities = fetch_metros()
    src = upsert_source(conn, kind="ncrb",
                        title="NCRB Crime in India 2022–2024 (metro-city tables, via OpenCity)",
                        url="https://data.opencity.in", retrieved_on=today)

    n = 0
    for slug, c in cities.items():
        conn.execute(
            "INSERT OR IGNORE INTO state(id,name) VALUES (?,?)",
            (_slug(c["state"] or "unknown"), c["state"] or "Unknown"),
        )
        conn.execute(
            "INSERT OR IGNORE INTO city(id,state_id,name,is_live) VALUES (?,?,?,?)",
            (slug, _slug(c["state"] or "unknown"), c["name"], 1 if slug == "bengaluru" else 0),
        )
        for year, cases in c["totals"].items():
            # Rate = cases / 2011-female-population (NCRB's own base), computed
            # per year - a single, verifiable source (matches NCRB's published
            # rate for 2022 & 2024). Charge-sheet is stored ONLY for the year its
            # source volume actually reports; other years stay NULL (-> "not
            # available"). Never copy one year's charge-sheet across others.
            rate = round(cases / c["pop"], 1) if c.get("pop") else None
            conn.execute(
                "INSERT OR REPLACE INTO crime_city_year"
                "(city_id,year,cases,population_lakh,rate_per_lakh,chargesheet_rate,source_id)"
                " VALUES (?,?,?,?,?,?,?)",
                (slug, year, cases, c["pop"], rate, c["cs"].get(year), src),
            )
            n += 1
    conn.execute(
        "INSERT INTO ingest_log(dataset,source_id,status,rows_ingested,fetched_at)"
        " VALUES ('ncrb_metros',?,?,?,?)",
        (src, "success", n, today),
    )
    conn.commit()
    return {"status": "success", "cities": len(cities), "rows": n}
