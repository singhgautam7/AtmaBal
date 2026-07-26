"""Pipeline tests: models validate the committed JSON, and migrations build the
schema. Run with `uv run pytest`."""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

import pytest

from atma_bala_pipeline import db as dbmod
from atma_bala_pipeline.models import CrimeData, PlacesData

REPO = Path(__file__).resolve().parents[2]
DATA = REPO / "data" / "bengaluru"


def test_crime_json_validates() -> None:
    data = json.loads((DATA / "crime.json").read_text())
    model = CrimeData(**data)
    # Every head's series is aligned to the year axis (enforced by the model).
    assert all(len(h.cases) == len(model.years) for h in model.heads)


def test_places_json_validates() -> None:
    data = json.loads((DATA / "places.json").read_text())
    model = PlacesData(**data)
    assert model.places, "expected at least one place"
    # Stations carry coordinates; helplines don't.
    for p in model.places:
        if p.type == "helpline":
            assert p.lat is None
        else:
            assert p.lat is not None and p.lng is not None


def test_places_have_provenance() -> None:
    data = json.loads((DATA / "places.json").read_text())
    for p in PlacesData(**data).places:
        assert p.source, f"{p.id} missing source"
        assert p.lastVerified, f"{p.id} missing lastVerified"


def test_migrations_build_schema(tmp_path: Path) -> None:
    conn = sqlite3.connect(tmp_path / "t.db")
    conn.row_factory = sqlite3.Row
    ran = dbmod.migrate(conn)
    assert ran, "expected at least one migration to apply"
    tables = {r["name"] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    for expected in ("state", "city", "crime_stat", "station", "helpline", "ingest_log", "source"):
        assert expected in tables


def test_migrations_are_idempotent(tmp_path: Path) -> None:
    conn = sqlite3.connect(tmp_path / "t.db")
    conn.row_factory = sqlite3.Row
    dbmod.migrate(conn)
    assert dbmod.migrate(conn) == []  # nothing new the second time


@pytest.mark.parametrize("geojson", [DATA / "stations.geojson"])
def test_geojson_shape(geojson: Path) -> None:
    fc = json.loads(geojson.read_text())
    assert fc["type"] == "FeatureCollection"
    assert fc["features"]
    lng, lat = fc["features"][0]["geometry"]["coordinates"]
    assert 77 < lng < 78 and 12 < lat < 14  # Bengaluru
