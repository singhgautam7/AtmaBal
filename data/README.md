# `data/` — committed, generated per-city JSON

This directory is the **build output** of the pipeline (`pipeline/`, added in a
later step): the SQLite source of truth is exported here as small per-city JSON,
and the static web app reads these files at build time. See
`specs/data-pipeline.md`.

Committing the JSON is deliberate: a bad NCRB parse shows up as a **reviewable
git diff**, and offline caching works because everything is a static file.

> **Provenance note for v1:** the figures currently in these files are the
> **illustrative seed values from the design concept**, not yet NCRB-parsed
> data. They exist so the app builds and renders against realistic shapes. The
> Python pipeline replaces them with sourced, validated rows. Nothing here should
> be cited as real crime data until that lands — the UI already says "illustrative
> for concept".

## Files (per city, e.g. `bengaluru/`)

| file | contents |
|------|----------|
| `crime.json` | reported crime: years, heads (id, name, scope, victim factor, cases per year), denominator |
| `justice.json` | disposal / "what happens after" — state-level, provisional |
| `places.json` | helplines + police/mahila stations, each with `last_verified` |

Shared, city-invariant data lives in `shared/`.
