# `pipeline/` — data pipeline (SQLite → committed JSON)

Python, managed with **uv**. This is a **build-time** job only: it fetches and
validates source data into a committed SQLite database (`atmabal.db`), then
exports small per-city JSON into `../data/`, which the static web app reads.
There is **no runtime database** — see `specs/data-pipeline.md`.

## Setup

```bash
cd pipeline
uv sync --extra dev          # create venv + install
```

## Commands

```bash
uv run atmabal init                 # create/upgrade the SQLite schema (migrations)
uv run atmabal ingest-stations      # REAL: fetch Bengaluru stations from OSM (Overpass) + Nominatim
uv run atmabal ingest-ncrb <pdf>    # parse an NCRB "Crime in India" city table (pdfplumber)
uv run atmabal export               # write ../data/<city>/*.json + stations.geojson
uv run atmabal verify               # assert every legal/helpline/stat row has a source + review date
uv run pytest                       # tests
```

## What is real vs. pending

- **Stations / One Stop Centre / helplines — REAL.** `ingest-stations` pulls live
  data from OpenStreetMap (Overpass `amenity=police` over the Bengaluru bbox) and
  geocodes the Sakhi OSC via Nominatim, exactly as committed in
  `../data/bengaluru/places.json` + `stations.geojson`. OSM tags Mahila (women's)
  stations sparsely — only the tagged ones are marked `women`; the rest are
  hand-verification pending, per spec.
- **Crime counts — ingestion built, data pending.** `ingest-ncrb` parses the
  city-wise "Crime in India" tables from `data.opencity.in`. Until it is run
  against the source PDFs, `../data/bengaluru/crime.json` holds illustrative
  seed values (the UI says so). No number ships without a `source` row.

## Ingestion bookkeeping

Every fetch is recorded in the `ingest_log` table with a `content_sha256` so a
re-run of an already-ingested (dataset, city, year) is detected and skipped
instead of duplicated.

## The two hard data problems (see specs/data-pipeline.md)

- **IPC → BNS break (1 Jul 2024):** every `crime_stat` row stores its
  `original_head_label`; `crime_head` carries both `ipc_refs` and `bns_refs`. The
  cross-regime map is populated when the 2024 volume lands.
- **Head-name drift across years:** handled by the canonical `crime_head` table +
  a per-year `original_head_label`.
