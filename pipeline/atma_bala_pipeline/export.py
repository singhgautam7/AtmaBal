"""Export the SQLite source of truth to committed per-city JSON in ../data/.
The static web app reads these files; there is no runtime DB."""

from __future__ import annotations

import json
import math
import sqlite3
from pathlib import Path

from .db import PIPELINE_DIR
from .models import Place, PlacesData

DATA_DIR = PIPELINE_DIR.parent / "data"
CENTER = (12.9796, 77.5906)  # Vidhana Soudha — stable default ordering only

_TYPE_FROM_KIND = {"mahila": "women", "osc": "osc", "police": "police"}


def _km(a: tuple[float, float], b: tuple[float, float]) -> float:
    R = 6371
    dlat = math.radians(b[0] - a[0])
    dlng = math.radians(b[1] - a[1])
    x = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(dlng / 2) ** 2)
    return 2 * R * math.asin(min(1, math.sqrt(x)))


def export_places(conn: sqlite3.Connection, city_id: str = "bengaluru") -> dict:
    stations = conn.execute(
        "SELECT * FROM station WHERE city_id=? AND active=1", (city_id,)
    ).fetchall()
    helplines = conn.execute(
        "SELECT * FROM helpline WHERE active=1 ORDER BY display_order", ()
    ).fetchall()

    women = [s for s in stations if s["kind"] == "mahila"]
    osc = [s for s in stations if s["kind"] == "osc"]
    police = sorted((s for s in stations if s["kind"] == "police"),
                    key=lambda s: _km(CENTER, (s["lat"], s["lng"])))

    places: list[dict] = []

    def add_station(s, ptype: str) -> None:
        places.append(Place(
            id=f"{ptype}-{len(places)}", type=ptype, name=s["name"], addr=s["address"] or "",
            phone=s["phone"] or "", lat=s["lat"], lng=s["lng"], distanceLabel="",
            handVerified=bool(s["hand_verified"]), lastVerified=s["last_verified"],
            source=f"source#{s['source_id']}",
        ).model_dump())

    for s in women:
        add_station(s, "women")
    for s in osc:
        add_station(s, "osc")
    for s in police:
        add_station(s, "police")
    for h in helplines:
        places.append(Place(
            id=f"helpline-{len(places)}", type="helpline", name=h["name"],
            addr=h["description"] or "", phone=h["number"], distanceLabel="Call from anywhere",
            handVerified=True, lastVerified=h["last_verified"], source=f"source#{h['source_id']}",
        ).model_dump())

    payload = PlacesData(
        city=city_id,
        source="OpenStreetMap (Overpass) + Nominatim; women stations & OSC hand-checked",
        lastUpdated=max((s["last_verified"] for s in stations), default=""),
        places=[Place(**p) for p in places],
    )

    out_dir = DATA_DIR / city_id
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "places.json").write_text(
        json.dumps(payload.model_dump(), ensure_ascii=False, indent=1)
    )

    features = [
        {"type": "Feature",
         "geometry": {"type": "Point", "coordinates": [p["lng"], p["lat"]]},
         "properties": {"id": p["id"], "name": p["name"], "type": p["type"]}}
        for p in places if p["lat"] is not None
    ]
    (out_dir / "stations.geojson").write_text(
        json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False, indent=1)
    )
    return {"places": len(places), "geojson_features": len(features)}


def export_crime(conn: sqlite3.Connection) -> dict:
    """Write per-city crime.json (real NCRB totals) + shared/cities.json."""
    HEAD_NOTE = (
        "NCRB does not publish a per-offence breakdown at city level for this city in "
        "the sourced tables; the city total and its multi-year trend are shown. Per-head "
        "data will be added when parsed from NCRB head-wise tables."
    )
    cities = conn.execute(
        "SELECT DISTINCT c.id, c.name, c.is_live,"
        " (SELECT s.name FROM state s WHERE s.id=c.state_id) state"
        " FROM city c JOIN crime_city_year y ON y.city_id=c.id ORDER BY c.name"
    ).fetchall()

    index = []
    written = 0
    for c in cities:
        rows = conn.execute(
            "SELECT year, cases, population_lakh, rate_per_lakh, chargesheet_rate"
            " FROM crime_city_year WHERE city_id=? ORDER BY year", (c["id"],)
        ).fetchall()
        if not rows:
            continue
        latest = rows[-1]
        payload = {
            "city": c["id"], "cityName": c["name"], "state": c["state"] or "",
            "years": [r["year"] for r in rows],
            "totals": {str(r["year"]): r["cases"] for r in rows},
            "populationLakh": latest["population_lakh"],
            "ratePerLakh": latest["rate_per_lakh"],
            "chargesheetRate": latest["chargesheet_rate"],
            "populationBaseNote": "Population base is Census 2011 (lakhs); NCRB rates use this base.",
            "source": "NCRB Crime in India (2022–2024), via OpenCity (data.opencity.in)",
            "lastUpdated": "NCRB Crime in India 2024",
            "hasHeadBreakdown": False,
            "headBreakdownNote": HEAD_NOTE,
        }
        out = DATA_DIR / c["id"]
        out.mkdir(parents=True, exist_ok=True)
        (out / "crime.json").write_text(json.dumps(payload, ensure_ascii=False, indent=1))
        written += 1
        has_help = (DATA_DIR / c["id"] / "places.json").exists()
        index.append({"id": c["id"], "name": c["name"], "state": c["state"] or "",
                      "isLive": bool(c["is_live"]), "hasCrime": True, "hasHelp": has_help})

    (DATA_DIR / "shared").mkdir(parents=True, exist_ok=True)
    (DATA_DIR / "shared" / "cities.json").write_text(json.dumps(
        {"cities": index, "comingSoon": False,
         "note": "Crime data (NCRB) available for all listed metros; Get-help map currently Bengaluru only."},
        ensure_ascii=False, indent=1))
    return {"cities": written}


def verify(conn: sqlite3.Connection) -> list[str]:
    """Assert the review trail: nothing user-facing ships without provenance."""
    problems: list[str] = []
    checks = [
        ("station", "last_verified", "source_id"),
        ("helpline", "last_verified", "source_id"),
        ("legal_claim", "last_reviewed", "source_id"),
        ("form_outcome", "last_reviewed", None),
        ("crime_stat", None, "source_id"),
    ]
    for table, date_col, src_col in checks:
        conds = []
        if date_col:
            conds.append(f"({date_col} IS NULL OR {date_col}='')")
        if src_col:
            conds.append(f"{src_col} IS NULL")
        if not conds:
            continue
        n = conn.execute(
            f"SELECT COUNT(*) c FROM {table} WHERE {' OR '.join(conds)}"
        ).fetchone()["c"]
        if n:
            problems.append(f"{table}: {n} row(s) missing source/review date")
    return problems
