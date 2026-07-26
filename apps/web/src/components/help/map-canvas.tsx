'use client';

import { useEffect, useRef, useState } from 'react';
import type { Place, PlaceType } from '@/data/types';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * Real interactive map — MapLibre GL JS with free OpenFreeMap tiles (no Google
 * Maps JS API, no API key; specs). Markers come from the committed real station
 * data. maplibre-gl is dynamically imported inside the effect so it is
 * code-split and never runs during SSR (perf + no `window` on the server).
 *
 * Geolocation, when granted, only pans/marks on this device — it is never sent
 * anywhere. "Directions" still deep-links out to Google Maps on tap (in the list).
 */

const BENGALURU: [number, number] = [77.5906, 12.9796];

const TYPE_COLOR: Record<PlaceType, string> = {
  women: '#be5a38', // --accent
  police: '#2f6f7b', // --data-domestic
  osc: '#7a6591', // --cat-3
  helpline: '#928779', // --ink-faint
};

function pinElement(color: string, selected: boolean): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `width:${selected ? 20 : 15}px;height:${selected ? 20 : 15}px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(42,36,32,0.35);cursor:pointer;transition:width .15s,height .15s;`;
  return el;
}

export function MapCanvas({
  places,
  userLocation,
  selectedId,
  onSelect,
}: {
  places: Place[];
  userLocation: { lat: number; lng: number } | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const glRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  // Init once.
  useEffect(() => {
    let cancelled = false;
    let ro: ResizeObserver | undefined;
    const markers = markersRef.current;
    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      glRef.current = maplibregl;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: BENGALURU,
        zoom: 11,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
      mapRef.current = map;

      // The map often initialises before the flex/absolute container has its
      // final width; without this, MapLibre keeps a stale (tiny) size and every
      // marker projects to the left edge. Resize on every container size change,
      // and once more after paint.
      if (containerRef.current) {
        ro = new ResizeObserver(() => map.resize());
        ro.observe(containerRef.current);
      }
      requestAnimationFrame(() => map.resize());

      // Signal readiness so the marker/location effects (which may have run
      // before this async init finished) attach now. Markers don't need the
      // style/tiles loaded, so flip immediately rather than waiting on 'load'.
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      ro?.disconnect();
      markers.forEach((m) => m.remove());
      markers.clear();
      userMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync station markers when the filtered places change.
  useEffect(() => {
    const map = mapRef.current;
    const gl = glRef.current;
    if (!map || !gl) return;

    const wanted = new Set(places.filter((p) => p.lat != null && p.lng != null).map((p) => p.id));
    // Remove stale.
    markersRef.current.forEach((m, id) => {
      if (!wanted.has(id)) {
        m.remove();
        markersRef.current.delete(id);
      }
    });
    // Add/refresh.
    for (const p of places) {
      if (p.lat == null || p.lng == null) continue;
      const existing = markersRef.current.get(p.id);
      const selected = selectedId === p.id;
      if (existing) {
        existing.getElement().replaceWith(makeMarkerEl(p, selected, onSelect));
        continue;
      }
      const el = makeMarkerEl(p, selected, onSelect);
      const marker = new gl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
      markersRef.current.set(p.id, marker);
    }
  }, [places, selectedId, onSelect, ready]);

  // Pan to selection.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = places.find((x) => x.id === selectedId);
    if (p?.lat != null && p?.lng != null) {
      map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(13, map.getZoom()), speed: 0.8 });
    }
  }, [selectedId, places]);

  // "You are here" marker + fly there.
  useEffect(() => {
    const map = mapRef.current;
    const gl = glRef.current;
    if (!map || !gl || !userLocation) return;
    userMarkerRef.current?.remove();
    const el = document.createElement('div');
    el.setAttribute('aria-label', 'You are here');
    el.style.cssText =
      'width:16px;height:16px;border-radius:50%;background:#2f6f7b;border:3px solid #fff;box-shadow:0 0 0 4px rgba(47,111,123,0.25);';
    userMarkerRef.current = new gl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);
    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 13, speed: 0.9 });
  }, [userLocation, ready]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Map of help locations" role="application" />;
}

function makeMarkerEl(
  place: Place,
  selected: boolean,
  onSelect: (id: string) => void,
): HTMLElement {
  const el = pinElement(TYPE_COLOR[place.type], selected);
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', place.name);
  el.title = place.name;
  el.addEventListener('click', () => onSelect(place.id));
  el.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') onSelect(place.id);
  });
  return el;
}
