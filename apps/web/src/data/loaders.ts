/**
 * Typed loaders around the committed per-city JSON in /data.
 *
 * Build-time imports — bundled into the static export; no runtime fetch, no
 * server. Crime data is real NCRB (2020–2024) for 19 metros; the Get-help map
 * data is Bengaluru only for now.
 */
import citiesJson from '@data/shared/cities.json';
import headModelJson from '@data/shared/head-model.json';

import bengaluru from '@data/bengaluru/crime.json';
import ahmedabad from '@data/ahmedabad/crime.json';
import chennai from '@data/chennai/crime.json';
import coimbatore from '@data/coimbatore/crime.json';
import delhi from '@data/delhi/crime.json';
import ghaziabad from '@data/ghaziabad/crime.json';
import hyderabad from '@data/hyderabad/crime.json';
import indore from '@data/indore/crime.json';
import jaipur from '@data/jaipur/crime.json';
import kanpur from '@data/kanpur/crime.json';
import kochi from '@data/kochi/crime.json';
import kolkata from '@data/kolkata/crime.json';
import kozhikode from '@data/kozhikode/crime.json';
import lucknow from '@data/lucknow/crime.json';
import mumbai from '@data/mumbai/crime.json';
import nagpur from '@data/nagpur/crime.json';
import patna from '@data/patna/crime.json';
import pune from '@data/pune/crime.json';
import surat from '@data/surat/crime.json';

import justiceBengaluru from '@data/bengaluru/justice.json';
import placesBengaluru from '@data/bengaluru/places.json';

import type { CityMeta, CrimeData, HeadModel, JusticeData, PlacesData } from './types';

export const DEFAULT_CITY = 'bengaluru';

const crimeByCity: Record<string, CrimeData> = {
  bengaluru, ahmedabad, chennai, coimbatore, delhi, ghaziabad, hyderabad,
  indore, jaipur, kanpur, kochi, kolkata, kozhikode, lucknow, mumbai, nagpur,
  patna, pune, surat,
} as unknown as Record<string, CrimeData>;

// Disposal ("what happens after") is state-level; only Bengaluru/Karnataka for now.
const justiceByCity: Record<string, JusticeData> = {
  bengaluru: justiceBengaluru as JusticeData,
};

const placesByCity: Record<string, PlacesData> = {
  bengaluru: placesBengaluru as unknown as PlacesData,
};

export function getCrime(city: string = DEFAULT_CITY): CrimeData {
  const data = crimeByCity[city];
  if (!data) throw new Error(`No crime data for city "${city}"`);
  return data;
}

/** All cities' crime data, for the client-side city switcher. */
export function getAllCrime(): Record<string, CrimeData> {
  return crimeByCity;
}

export function getJustice(city: string = DEFAULT_CITY): JusticeData | null {
  return justiceByCity[city] ?? null;
}

export function getPlaces(city: string = DEFAULT_CITY): PlacesData {
  const data = placesByCity[city];
  if (!data) throw new Error(`No places data for city "${city}"`);
  return data;
}

export function getCities(): CityMeta[] {
  return (citiesJson as { cities: CityMeta[] }).cities;
}

export function getHeadModel(): HeadModel {
  return headModelJson as HeadModel;
}
