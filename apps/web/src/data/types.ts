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

/** One crime head within a city-year's breakdown (NCRB Table 3B.2). */
export interface CrimeHeadItem {
  id: string;
  name: string;
  /** Offence-type grouping for the scope filter (NOT incident location). */
  scope: 'public' | 'domestic';
  /** POCSO / girl-child heads (labelled so they're not read as adult-women). */
  isChild: boolean;
  /**
   * Reported cases. A number (INCLUDING 0) is a real published figure. `null`
   * means NCRB published no value for this head/city/year - render it as
   * "not available" (absence), NEVER as a zero slice and never folded into
   * "Other offences".
   */
  cases: number | null;
}

/** A city's crime-head composition for one year. */
export interface CrimeHeadYear {
  /** The city's total reported crimes against women that year (NCRB Table 3B.1). */
  total: number;
  items: CrimeHeadItem[];
  /**
   * PRINCIPAL-OFFENCE REMAINDER = total - sum(listed heads). This is REAL data:
   * NCRB counts each FIR under one most-serious head, and we only chart the major
   * heads, so the rest (minor heads NCRB lists) are shown honestly as "Other
   * offences". This is NOT "missing data" - keep it visually distinct from any
   * head whose `cases` is null.
   */
  otherCases: number;
}

export interface CrimeHeads {
  unit: string;
  source: string;
  principalOffenceNote: string;
  regimeNote?: string;
  scopeNote?: string;
  /** Years for which a real head-wise split exists (others: show total only). */
  availableYears: number[];
  byYear: Record<string, CrimeHeadYear>;
}

/**
 * Per-city crime data - real NCRB (2020-2024). Totals + rate + charge-sheeting
 * are the metro-city tables (3B.1); the per-offence split (3B.2) is real for the
 * years in `heads.availableYears`. Rate and charge-sheet are per-year maps: a
 * missing year key means NCRB did not publish that figure - render "not
 * available", never a backfilled value.
 */
export interface CrimeData {
  city: string;
  cityName: string;
  state: string;
  years: number[];
  /** year (string key) -> total reported crimes against women */
  totals: Record<string, number>;
  populationLakh: number | null;
  populationBaseYear: number;
  /** year -> reported cases per lakh women (computed once on the 2011 base). */
  ratePerLakh: Record<string, number>;
  /** year -> charge-sheeting rate %. Sparse: only years NCRB actually publishes. */
  chargesheetRate: Record<string, number>;
  populationBaseNote: string;
  source: string;
  lastUpdated: string;
  lastReviewed: string;
  heads: CrimeHeads;
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
