/**
 * Typed loaders around the committed per-city JSON in /data.
 *
 * These are build-time imports — the data is bundled into the static export;
 * there is no runtime fetch and no server. When the pipeline lands, a zod parse
 * will be added here so a bad export fails the build instead of shipping a
 * runtime crash.
 */
import crimeBengaluru from '@data/bengaluru/crime.json';
import justiceBengaluru from '@data/bengaluru/justice.json';
import placesBengaluru from '@data/bengaluru/places.json';
import citiesJson from '@data/shared/cities.json';

import type {
  CityMeta,
  CrimeData,
  JusticeData,
  PlacesData,
} from './types';

const crimeByCity: Record<string, CrimeData> = {
  bengaluru: crimeBengaluru as CrimeData,
};

const justiceByCity: Record<string, JusticeData> = {
  bengaluru: justiceBengaluru as JusticeData,
};

const placesByCity: Record<string, PlacesData> = {
  bengaluru: placesBengaluru as PlacesData,
};

export const DEFAULT_CITY = 'bengaluru';

export function getCrime(city: string = DEFAULT_CITY): CrimeData {
  const data = crimeByCity[city];
  if (!data) throw new Error(`No crime data for city "${city}"`);
  return data;
}

export function getJustice(city: string = DEFAULT_CITY): JusticeData {
  const data = justiceByCity[city];
  if (!data) throw new Error(`No justice data for city "${city}"`);
  return data;
}

export function getPlaces(city: string = DEFAULT_CITY): PlacesData {
  const data = placesByCity[city];
  if (!data) throw new Error(`No places data for city "${city}"`);
  return data;
}

export function getCities(): CityMeta[] {
  return (citiesJson as { cities: CityMeta[] }).cities;
}
