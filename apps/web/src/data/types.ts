/**
 * Shapes of the committed per-city JSON in /data. These mirror what the Python
 * pipeline will export (and, later, the zod schemas that validate it on read).
 * Keep in lock-step with pipeline/ models.
 */

export type Scope = 'public' | 'domestic';
export type ScopeFilter = 'all' | Scope;
export type Measure = 'cases' | 'victims' | 'rate';

export interface CrimeHead {
  id: string;
  name: string;
  scope: Scope;
  /** Victims ≈ cases × victimFactor (NCRB reports victims separately). */
  victimFactor: number;
  /** One value per entry in `years`, aligned by index. */
  cases: number[];
}

export interface CrimeData {
  city: string;
  cityName: string;
  years: number[];
  populationLakh: number;
  populationBaseNote: string;
  lastUpdated: string;
  provisional: boolean;
  heads: CrimeHead[];
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
}
