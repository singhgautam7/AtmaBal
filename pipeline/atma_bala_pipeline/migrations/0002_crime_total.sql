-- Per-city, per-year TOTAL crimes against women (real NCRB metro-city tables).
-- NCRB does not publish a clean per-offence split at city level in these tables,
-- so v1's dashboard is driven by these verified totals + rate + chargesheet.
-- (The per-head crime_stat table remains for when head-wise data is parsed.)

CREATE TABLE IF NOT EXISTS crime_city_year (
  id               INTEGER PRIMARY KEY,
  city_id          TEXT NOT NULL REFERENCES city(id),
  year             INTEGER NOT NULL,
  cases            INTEGER NOT NULL,
  population_lakh  REAL,
  rate_per_lakh    REAL,
  chargesheet_rate REAL,
  source_id        INTEGER NOT NULL REFERENCES source(id),
  created_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at       TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  UNIQUE(city_id, year)
);
CREATE INDEX IF NOT EXISTS idx_crime_city_year_city ON crime_city_year(city_id);
