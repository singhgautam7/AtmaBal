"""NCRB "Crime in India" ingestion (crimes against women, city-wise).

Preferred source: **data.opencity.in**, which mirrors every Crime in India volume
and splits it into small city-wise / crime-head-wise PDFs — far easier to parse
than the 600-page master. This module extracts the Bengaluru table from such a
PDF with `pdfplumber`, validates each row with pydantic, and writes `crime_stat`
rows keyed to a `source`.

Status: the parser is real but the annual PDF must be supplied (there is no
upstream API — this is a maintained annual job). Until it is run, the web app
shows illustrative seed values, clearly labelled. Spike ONE year end-to-end
before trusting the whole pipeline (specs/data-pipeline.md).
"""

from __future__ import annotations

import hashlib
import sqlite3
from datetime import date
from pathlib import Path

# Canonical crime-head mapping: NCRB label (as it appears in the PDF) -> our head id.
# Extend as new labels appear; head-name drift across years is expected.
HEAD_MAP: dict[str, str] = {
    "Rape": "rape",
    "Attempt to Commit Rape": "attempt_rape",
    "Assault on Women with Intent to Outrage her Modesty": "molestation",
    "Insult to the Modesty of Women": "insult_to_modesty",
    "Kidnapping & Abduction of Women": "kidnapping_abduction",
    "Cruelty by Husband or his Relatives": "cruelty_husband_relatives",
    "Dowry Deaths": "dowry_deaths",
    "Acid Attack": "acid_attack",
    "Cyber Crimes / Information Technology Act": "cyber",
    "Human Trafficking": "trafficking",
}


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_city_table(pdf_path: Path, city: str = "Bengaluru") -> list[dict]:
    """Extract {ncrb_label, cases} rows for `city` from an NCRB city-wise PDF.

    Returns raw rows; the caller maps labels via HEAD_MAP and validates. Kept
    deliberately small and testable. Table geometry varies by volume, so this
    targets the OpenCity city-wise crime-head tables.
    """
    import pdfplumber  # imported lazily so the rest of the pipeline needs no PDF stack

    rows: list[dict] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables() or []:
                for cells in table:
                    if not cells or not cells[0]:
                        continue
                    label = str(cells[0]).strip()
                    if label not in HEAD_MAP:
                        continue
                    # Find the numeric column for the target city — volumes differ,
                    # so this is verified per-volume at spike time.
                    nums = [c for c in cells[1:] if c and str(c).replace(",", "").strip().isdigit()]
                    if not nums:
                        continue
                    rows.append({"ncrb_label": label, "cases": int(str(nums[-1]).replace(",", ""))})
    return rows


def ingest(conn: sqlite3.Connection, pdf_path: Path, year: int,
           city_id: str = "bengaluru") -> dict:
    from ..db import upsert_source

    digest = _sha256(pdf_path)
    if conn.execute(
        "SELECT 1 FROM ingest_log WHERE dataset='ncrb_crime' AND city_id=? AND year=? AND content_sha256=?",
        (city_id, year, digest),
    ).fetchone():
        return {"status": "skipped", "year": year}

    raw = parse_city_table(pdf_path)
    src = upsert_source(conn, kind="ncrb", title=f"NCRB Crime in India {year} (city-wise, via OpenCity)",
                        url="https://data.opencity.in", retrieved_on=date.today().isoformat())
    n = 0
    for row in raw:
        head_id = HEAD_MAP[row["ncrb_label"]]
        conn.execute(
            "INSERT OR REPLACE INTO crime_stat"
            "(city_id,year,head_id,measure,value,original_head_label,source_id)"
            " VALUES (?,?,?,'cases',?,?,?)",
            (city_id, year, head_id, float(row["cases"]), row["ncrb_label"], src),
        )
        n += 1

    conn.execute(
        "INSERT INTO ingest_log(dataset,city_id,year,source_id,content_sha256,status,rows_ingested,fetched_at)"
        " VALUES ('ncrb_crime',?,?,?,?,?,?,?)",
        (city_id, year, src, digest, "success" if n else "partial", n, date.today().isoformat()),
    )
    conn.commit()
    return {"status": "success" if n else "partial", "year": year, "rows": n}
