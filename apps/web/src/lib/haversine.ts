/**
 * Great-circle distance between two lat/lng points, in kilometres.
 * Used for client-side nearest-station search. Geolocation never leaves the
 * device - this runs entirely in the browser.
 */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371; // km
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Format a km distance the way the UI shows it (e.g. "2.1 km"). */
export function formatKm(km: number): string {
  return `${km.toFixed(1)} km`;
}
