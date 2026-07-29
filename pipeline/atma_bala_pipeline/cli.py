"""`atmabal` CLI (typer). Build-time data commands."""

from __future__ import annotations

from pathlib import Path

import typer

from . import db as dbmod
from . import export as exportmod

app = typer.Typer(add_completion=False, help="Atm Bala data pipeline (SQLite -> JSON).")


def _seed_geography(conn) -> None:
    conn.execute("INSERT OR IGNORE INTO state(id,name) VALUES ('karnataka','Karnataka')")
    conn.execute(
        "INSERT OR IGNORE INTO city(id,state_id,name,is_live) VALUES ('bengaluru','karnataka','Bengaluru',1)"
    )
    conn.commit()


@app.command()
def init() -> None:
    """Create/upgrade the SQLite schema and seed geography."""
    conn = dbmod.connect()
    ran = dbmod.migrate(conn)
    _seed_geography(conn)
    typer.echo(f"migrations applied: {ran or 'none (up to date)'}")


@app.command("ingest-stations")
def ingest_stations() -> None:
    """REAL: fetch Bengaluru stations from OSM (Overpass) + Nominatim into SQLite."""
    from .ingest import stations_osm

    conn = dbmod.connect()
    dbmod.migrate(conn)
    _seed_geography(conn)
    result = stations_osm.ingest(conn)
    typer.echo(f"stations: {result}")


@app.command("ingest-ncrb-metros")
def ingest_ncrb_metros() -> None:
    """REAL: fetch NCRB metro-city crime totals (2020–2024) from OpenCity CSV/XLSX."""
    from .ingest import ncrb_metros

    conn = dbmod.connect()
    dbmod.migrate(conn)
    _seed_geography(conn)
    result = ncrb_metros.ingest(conn)
    typer.echo(f"ncrb metros: {result}")


@app.command("ingest-ncrb-headwise")
def ingest_ncrb_headwise() -> None:
    """REAL: parse NCRB Table 3B.2 (2024 master PDF) -> per-head crime_stat for 19 metros."""
    from .ingest import ncrb_headwise

    conn = dbmod.connect()
    dbmod.migrate(conn)
    _seed_geography(conn)
    result = ncrb_headwise.ingest(conn)
    typer.echo(f"ncrb head-wise: {result}")


@app.command("ingest-ncrb")
def ingest_ncrb(pdf: Path, year: int) -> None:
    """Parse an NCRB city-wise 'Crime in India' PDF into crime_stat rows (per-head)."""
    from .ingest import ncrb

    conn = dbmod.connect()
    dbmod.migrate(conn)
    _seed_geography(conn)
    result = ncrb.ingest(conn, pdf, year)
    typer.echo(f"ncrb {year}: {result}")


@app.command()
def export() -> None:
    """Write ../data/<city>/{places.json,crime.json} + shared/cities.json from SQLite."""
    conn = dbmod.connect()
    places = exportmod.export_places(conn)
    crime = exportmod.export_crime(conn)
    typer.echo(f"exported places: {places}; crime: {crime}")


@app.command()
def verify() -> None:
    """Fail if any user-facing row lacks a source or review date."""
    conn = dbmod.connect()
    problems = exportmod.verify(conn)
    if problems:
        for p in problems:
            typer.echo(f"  ✗ {p}", err=True)
        raise typer.Exit(code=1)
    typer.echo("✓ every row has a source + review date")


if __name__ == "__main__":
    app()
