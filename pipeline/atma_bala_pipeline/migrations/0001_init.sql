-- Atm Bala — build-time SQLite schema (v1).
-- Portable to Postgres for v2 (see specs/v2-future.md): TEXT ISO-8601 timestamps,
-- no SQLite-only constructs, polymorphic scope via nullable FKs + CHECK.

PRAGMA foreign_keys = ON;

-- ---------- geography ----------
CREATE TABLE IF NOT EXISTS state (
  id          TEXT PRIMARY KEY,               -- 'karnataka'
  name        TEXT NOT NULL,
  country     TEXT NOT NULL DEFAULT 'India',
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS city (
  id          TEXT PRIMARY KEY,               -- 'bengaluru'
  state_id    TEXT NOT NULL REFERENCES state(id),
  name        TEXT NOT NULL,
  is_live     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_city_state ON city(state_id);

CREATE TABLE IF NOT EXISTS female_population (
  id           INTEGER PRIMARY KEY,
  city_id      TEXT NOT NULL REFERENCES city(id),
  year         INTEGER NOT NULL,
  population   INTEGER NOT NULL,
  is_estimated INTEGER NOT NULL DEFAULT 0,
  source_id    INTEGER NOT NULL REFERENCES source(id),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  UNIQUE(city_id, year)
);

-- ---------- provenance ----------
CREATE TABLE IF NOT EXISTS source (
  id           INTEGER PRIMARY KEY,
  kind         TEXT NOT NULL CHECK(kind IN
                 ('ncrb','blr_city_police','census','bbmp_projection',
                  'act','scheme','osm','nominatim','hand_verified','other')),
  title        TEXT NOT NULL,
  url          TEXT,
  publisher    TEXT,
  published_on TEXT,
  retrieved_on TEXT NOT NULL,
  notes        TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

-- ---------- crime ----------
CREATE TABLE IF NOT EXISTS crime_head (
  id            TEXT PRIMARY KEY,
  display_name  TEXT NOT NULL,
  category      TEXT NOT NULL CHECK(category IN
                  ('sexual_assault','assault_modesty','harassment','kidnap_abduction',
                   'cruelty_domestic','dowry','acid_attack','trafficking','cyber','other')),
  scope         TEXT NOT NULL CHECK(scope IN ('public_space','domestic','either')),
  is_child      INTEGER NOT NULL DEFAULT 0,
  ipc_refs      TEXT,
  bns_refs      TEXT,
  regime_notes  TEXT,
  display_order INTEGER NOT NULL DEFAULT 100,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS crime_stat (
  id                  INTEGER PRIMARY KEY,
  city_id             TEXT NOT NULL REFERENCES city(id),
  year                INTEGER NOT NULL,
  head_id             TEXT NOT NULL REFERENCES crime_head(id),
  measure             TEXT NOT NULL CHECK(measure IN ('cases','victims','rate_per_lakh')),
  value               REAL NOT NULL,
  original_head_label TEXT NOT NULL,
  is_computed         INTEGER NOT NULL DEFAULT 0,
  source_id           INTEGER NOT NULL REFERENCES source(id),
  notes               TEXT,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  UNIQUE(city_id, year, head_id, measure)
);
CREATE INDEX IF NOT EXISTS idx_crime_city_year ON crime_stat(city_id, year);
CREATE INDEX IF NOT EXISTS idx_crime_head ON crime_stat(head_id);

CREATE TABLE IF NOT EXISTS disposal_stat (
  id           INTEGER PRIMARY KEY,
  state_id     TEXT REFERENCES state(id),
  city_id      TEXT REFERENCES city(id),
  year         INTEGER NOT NULL,
  head_id      TEXT REFERENCES crime_head(id),
  measure      TEXT NOT NULL CHECK(measure IN
                 ('conviction_rate','acquittal_rate','chargesheet_rate',
                  'pending_investigation_rate','pending_trial_rate','pending_trial_count')),
  value        REAL NOT NULL,
  provisional  INTEGER NOT NULL DEFAULT 1,
  source_id    INTEGER NOT NULL REFERENCES source(id),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  CHECK ( (state_id IS NOT NULL AND city_id IS NULL)
       OR (state_id IS NULL AND city_id IS NOT NULL) )
);

-- ---------- help now ----------
CREATE TABLE IF NOT EXISTS helpline (
  id            INTEGER PRIMARY KEY,
  scope         TEXT NOT NULL CHECK(scope IN ('national','state','city')),
  state_id      TEXT REFERENCES state(id),
  city_id       TEXT REFERENCES city(id),
  name          TEXT NOT NULL,
  number        TEXT NOT NULL,
  category      TEXT NOT NULL CHECK(category IN
                  ('emergency','women','child','cyber','mental_health','osc','legal_aid')),
  hours         TEXT NOT NULL DEFAULT '24x7',
  languages     TEXT,
  description   TEXT,
  source_id     INTEGER NOT NULL REFERENCES source(id),
  last_verified TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 100,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  CHECK ( (scope='national' AND state_id IS NULL AND city_id IS NULL)
       OR (scope='state'    AND state_id IS NOT NULL AND city_id IS NULL)
       OR (scope='city'     AND city_id IS NOT NULL) )
);

CREATE TABLE IF NOT EXISTS station (
  id            INTEGER PRIMARY KEY,
  city_id       TEXT NOT NULL REFERENCES city(id),
  name          TEXT NOT NULL,
  kind          TEXT NOT NULL CHECK(kind IN ('police','mahila','osc')),
  address       TEXT,
  phone         TEXT,
  lat           REAL NOT NULL,
  lng           REAL NOT NULL,
  hand_verified INTEGER NOT NULL DEFAULT 0,
  active        INTEGER NOT NULL DEFAULT 1,
  source_id     INTEGER NOT NULL REFERENCES source(id),
  last_verified TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_station_city ON station(city_id, kind);

-- ---------- legal content ----------
CREATE TABLE IF NOT EXISTS legal_claim (
  id            TEXT PRIMARY KEY,
  headline      TEXT NOT NULL,
  body_md       TEXT NOT NULL,
  regime        TEXT NOT NULL CHECK(regime IN ('ipc_crpc','bns_bnss','both')),
  section_ipc   TEXT,
  section_bns   TEXT,
  scope         TEXT NOT NULL CHECK(scope IN ('public','domestic','workplace','online','all')),
  source_id     INTEGER NOT NULL REFERENCES source(id),
  last_reviewed TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS form_outcome (
  id            TEXT PRIMARY KEY,
  scenario      TEXT NOT NULL CHECK(scenario IN ('public','domestic','workplace','online','undecided')),
  regime        TEXT NOT NULL CHECK(regime IN ('ipc_crpc','bns_bnss')),
  posture       TEXT NOT NULL CHECK(posture IN ('act','understand')),
  title         TEXT NOT NULL,
  intro         TEXT NOT NULL,
  mdx_path      TEXT NOT NULL,
  last_reviewed TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS form_outcome_claim (
  outcome_id    TEXT NOT NULL REFERENCES form_outcome(id),
  claim_id      TEXT NOT NULL REFERENCES legal_claim(id),
  display_order INTEGER NOT NULL DEFAULT 100,
  PRIMARY KEY(outcome_id, claim_id)
);

-- ---------- ingestion bookkeeping ----------
CREATE TABLE IF NOT EXISTS ingest_log (
  id             INTEGER PRIMARY KEY,
  dataset        TEXT NOT NULL,
  city_id        TEXT REFERENCES city(id),
  year           INTEGER,
  source_id      INTEGER REFERENCES source(id),
  content_sha256 TEXT,
  status         TEXT NOT NULL CHECK(status IN ('success','partial','failed','skipped')),
  rows_ingested  INTEGER NOT NULL DEFAULT 0,
  fetched_at     TEXT NOT NULL,
  notes          TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  UNIQUE(dataset, city_id, year, content_sha256)
);
