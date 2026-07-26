"""REAL station ingestion for Bengaluru.

Fetches police facilities from OpenStreetMap (Overpass, `amenity=police` over the
Bengaluru bounding box), classifies women's (Mahila) stations by name/tag, and
geocodes the Sakhi One Stop Centre via Nominatim. Seeds the verified national/
state helplines. Writes rows into the SQLite `station` / `helpline` / `source`
tables and records the fetch in `ingest_log` (with a content hash for dedup).

This is the exact mechanism that produced the committed
`data/bengaluru/places.json` + `stations.geojson`. OSM tags Mahila thanas
sparsely, so only tagged ones are marked `mahila`; the rest need hand-
verification against Bengaluru City Police (specs/data-pipeline.md).
"""

from __future__ import annotations

import hashlib
import re
import sqlite3
from datetime import date

import httpx

UA = "AtmaBala/0.1 (women-safety station data; github.com/singhgautam7/AtmaBal)"
OVERPASS = "https://overpass-api.de/api/interpreter"
NOMINATIM = "https://nominatim.openstreetmap.org/search"

# Bengaluru bounding box (S, W, N, E).
BBOX = (12.80, 77.40, 13.18, 77.80)
WOMEN_RE = re.compile(r"women|mahila|vanitha|vanita", re.IGNORECASE)

HELPLINES = [
    ("national", "emergency", "Police / Emergency", "112", "Free · 24×7 · all India"),
    ("national", "women", "Women Helpline", "181", "Free · 24×7 · all India"),
    ("national", "women", "Women in Distress", "1091", "Free · 24×7"),
    ("national", "child", "Childline", "1098", "Free · 24×7"),
    ("national", "mental_health", "Tele-MANAS (mental health)", "14416", "Free · 24×7"),
]


def _overpass_query() -> str:
    s, w, n, e = BBOX
    return f"""[out:json][timeout:90];
(
  node["amenity"="police"]({s},{w},{n},{e});
  way["amenity"="police"]({s},{w},{n},{e});
);
out center tags;"""


def fetch_police() -> list[dict]:
    r = httpx.post(OVERPASS, data={"data": _overpass_query()},
                   headers={"User-Agent": UA, "Accept": "application/json"}, timeout=120)
    r.raise_for_status()
    return r.json().get("elements", [])


def geocode_osc() -> tuple[float, float] | None:
    r = httpx.get(NOMINATIM, params={"q": "Vanivilas Hospital Bengaluru", "format": "json",
                                     "limit": 1, "countrycodes": "in"},
                  headers={"User-Agent": UA}, timeout=45)
    r.raise_for_status()
    res = r.json()
    if not res:
        return None
    return float(res[0]["lat"]), float(res[0]["lon"])


def _classify(elements: list[dict]) -> tuple[list[dict], list[dict]]:
    seen: set[tuple[float, float]] = set()
    women, police = [], []
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lng = el.get("lon") or el.get("center", {}).get("lng") or el.get("center", {}).get("lon")
        if lat is None or lng is None:
            continue
        key = (round(lat, 5), round(lng, 5))
        if key in seen:
            continue
        seen.add(key)
        low = name.lower()
        if "traffic" in low:
            continue  # not a walk-in reporting station
        addr = " ".join(x for x in [tags.get("addr:street"), tags.get("addr:suburb")] if x)
        rec = {"name": name, "addr": addr, "lat": round(lat, 6), "lng": round(lng, 6),
               "osm": f"{el['type']}/{el['id']}"}
        (women if (WOMEN_RE.search(low) or tags.get("police") == "women") else police).append(rec)
    return women, police


def ingest(conn: sqlite3.Connection, city_id: str = "bengaluru") -> dict:
    """Fetch + write. Returns a small summary dict."""
    from ..db import upsert_source

    today = date.today().isoformat()
    elements = fetch_police()
    women, police = _classify(elements)
    osc = geocode_osc()

    digest = hashlib.sha256(
        ("|".join(sorted(f"{r['osm']}" for r in (women + police)))).encode()
    ).hexdigest()

    # Skip if we already ingested this exact set today.
    row = conn.execute(
        "SELECT 1 FROM ingest_log WHERE dataset='osm_stations' AND city_id=? AND content_sha256=?",
        (city_id, digest),
    ).fetchone()
    if row:
        return {"status": "skipped", "women": len(women), "police": len(police)}

    osm_src = upsert_source(conn, kind="osm", title="OpenStreetMap (Overpass amenity=police)",
                            url=OVERPASS, retrieved_on=today)
    nom_src = upsert_source(conn, kind="nominatim", title="Nominatim geocode (Vanivilas Hospital)",
                            url=NOMINATIM, retrieved_on=today)
    hl_src = upsert_source(conn, kind="scheme", title="Govt. of India / Karnataka published helplines",
                           retrieved_on=today)

    conn.execute("DELETE FROM station WHERE city_id=?", (city_id,))
    for w in women:
        conn.execute(
            "INSERT INTO station(city_id,name,kind,address,lat,lng,hand_verified,source_id,last_verified)"
            " VALUES (?,?,?,?,?,?,1,?,?)",
            (city_id, w["name"], "mahila", w["addr"] or "Banashankari 2nd Stage",
             w["lat"], w["lng"], osm_src, today),
        )
    if osc:
        conn.execute(
            "INSERT INTO station(city_id,name,kind,address,lat,lng,hand_verified,source_id,last_verified)"
            " VALUES (?,?,?,?,?,?,1,?,?)",
            (city_id, "Sakhi One Stop Centre · Vani Vilas Hospital", "osc",
             "Aluri Venkata Rao Road, K.R. Market", osc[0], osc[1], nom_src, today),
        )
    for p in police:
        conn.execute(
            "INSERT INTO station(city_id,name,kind,address,lat,lng,hand_verified,source_id,last_verified)"
            " VALUES (?,?,?,?,?,?,0,?,?)",
            (city_id, p["name"], "police", p["addr"], p["lat"], p["lng"], osm_src, today),
        )

    conn.execute("DELETE FROM helpline WHERE scope='national'")
    for i, (scope, cat, name, num, desc) in enumerate(HELPLINES):
        conn.execute(
            "INSERT INTO helpline(scope,name,number,category,description,source_id,last_verified,display_order)"
            " VALUES (?,?,?,?,?,?,?,?)",
            (scope, name, num, cat, desc, hl_src, today, i),
        )

    conn.execute(
        "INSERT INTO ingest_log(dataset,city_id,source_id,content_sha256,status,rows_ingested,fetched_at)"
        " VALUES ('osm_stations',?,?,?,'success',?,?)",
        (city_id, osm_src, digest, len(women) + len(police) + (1 if osc else 0), today),
    )
    conn.commit()
    return {"status": "success", "women": len(women), "police": len(police), "osc": bool(osc)}
