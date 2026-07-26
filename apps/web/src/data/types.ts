/**
 * Shapes of the committed per-city JSON in /data. These mirror what the Python
 * pipeline will export (and, later, the zod schemas that validate it on read).
 * Keep in lock-step with pipeline/ models.
 */

export type Scope = 'public' | 'domestic';
export type ScopeFilter = 'all' | Scope;
export type Measure = 'cases' | 'victims' | 'rate';

/**
 * Shared illustrative offence-mix model. NCRB doesn't publish a per-offence split
 * at city level for major metros, so the per-head breakdown is modelled: each
 * head has a per-year share of the (real) city total. City totals, rates and
 * charge-sheeting are real; only the split across offence types is illustrative.
 */
export interface HeadModelEntry {
  id: string;
  name: string;
  scope: Scope;
  victimFactor: number;
  /** Share of the city total per year (aligned to HeadModel.years). */
  share: number[];
}

export interface HeadModel {
  years: number[];
  illustrative: boolean;
  note: string;
  heads: HeadModelEntry[];
}

export interface CrimeHead {
  id: string;
  name: string;
  scope: Scope;
  /** Victims ≈ cases × victimFactor (NCRB reports victims separately). */
  victimFactor: number;
  /** One value per entry in `years`, aligned by index. */
  cases: number[];
}

/**
 * Per-city crime data — real NCRB totals (2020–2024). NCRB does not publish a
 * clean per-offence split at city level in the sourced tables, so v1 ships the
 * verified city total + multi-year trend; the per-head breakdown is a pipeline
 * job (see headBreakdownNote).
 */
export interface CrimeData {
  city: string;
  cityName: string;
  state: string;
  years: number[];
  /** year (string key) -> total reported crimes against women */
  totals: Record<string, number>;
  populationLakh: number | null;
  ratePerLakh: number | null;
  chargesheetRate: number | null;
  populationBaseNote: string;
  source: string;
  lastUpdated: string;
  hasHeadBreakdown: boolean;
  headBreakdownNote: string;
}

export interface JusticeData {
  scope: 'state' | 'city';
  scopeName: string;
  year: number;
  provisional: boolean;
  source: string;
  convictionRate: number;
  pendingInvestigationRate: number;
  pendingTrialRate: number;
  pendingTrialCountLabel: string;
}

export type PlaceType = 'women' | 'police' | 'osc' | 'helpline';

export interface Place {
  id: string;
  type: PlaceType;
  name: string;
  addr: string;
  phone: string;
  lat?: number;
  lng?: number;
  distanceLabel: string;
  handVerified: boolean;
  lastVerified: string;
  /** Provenance (e.g. "OSM node/123", "Nominatim"). Surfaced/citable. */
  source?: string;
}

export interface PlacesData {
  city: string;
  places: Place[];
}

export interface CityMeta {
  id: string;
  name: string;
  state: string;
  isLive: boolean;
  hasCrime: boolean;
  hasHelp: boolean;
}
