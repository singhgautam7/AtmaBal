'use client';

import { useEffect, useRef, useState } from 'react';
import type { Place, PlaceType } from '@/data/types';
import 'maplibre-gl/dist/maplibre-gl.css';

/**
 * Real interactive map — MapLibre GL JS with free OpenFreeMap tiles (no Google
 * Maps JS API, no API key). Markers come from the committed real station data.
 * maplibre-gl is dynamically imported so it is code-split and never runs during
 * SSR. Geolocation, when granted, only pans/marks on this device.
 *
 * Marker structure matters: MapLibre positions the marker by writing a
 * `transform: translate(...)` onto the element it owns. So the outer element is
 * left untouched (MapLibre owns it) and a rotated inner teardrop carries the
 * appearance. Selection only restyles the inner div — the element is never
 * replaced — which is why pins no longer jump to the corner on click.
 */

const BENGALURU: [number, number] = [77.5906, 12.9796];

const TYPE_COLOR: Record<PlaceType, string> = {
  women: '#be5a38', // --accent
  police: '#2f6f7b', // --data-domestic
  osc: '#7a6591', // --cat-3
  helpline: '#928779', // --ink-faint
};

function styleInner(inner: HTMLElement, type: PlaceType, selected: boolean) {
  const size = selected ? 26 : 15;
  inner.style.cssText =
    `width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;` +
    `background:${selected ? '#be5a38' : TYPE_COLOR[type]};transform:rotate(-45deg);` +
    `border:${selected ? '3px solid #2a2420' : '2px solid #fff'};` +
    `box-shadow:${selected
      ? '0 0 0 5px rgba(190,90,56,0.30), 0 4px 10px rgba(0,0,0,0.4)'
      : '0 1px 4px rgba(42,36,32,0.35)'};` +
    'transition:width .12s,height .12s;';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MarkerEntry = { marker: any; inner: HTMLElement; type: PlaceType };

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
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
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
      // final width; keep it sized to the container so markers project correctly.
      if (containerRef.current) {
        ro = new ResizeObserver(() => map.resize());
        ro.observe(containerRef.current);
      }
      requestAnimationFrame(() => map.resize());
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
      ro?.disconnect();
      markers.forEach((m) => m.marker.remove());
      markers.clear();
      userMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Add/remove markers to match the filtered places (NOT re-run on selection).
  useEffect(() => {
    const map = mapRef.current;
    const gl = glRef.current;
    if (!map || !gl) return;

    const wanted = new Set(places.filter((p) => p.lat != null && p.lng != null).map((p) => p.id));
    markersRef.current.forEach((entry, id) => {
      if (!wanted.has(id)) {
        entry.marker.remove();
        markersRef.current.delete(id);
      }
    });
    for (const p of places) {
      if (p.lat == null || p.lng == null || markersRef.current.has(p.id)) continue;
      const outer = document.createElement('div');
      outer.style.cursor = 'pointer';
      outer.setAttribute('role', 'button');
      outer.setAttribute('aria-label', p.name);
      outer.title = p.name;
      const inner = document.createElement('div');
      styleInner(inner, p.type, selectedId === p.id);
      outer.appendChild(inner);
      outer.addEventListener('click', () => onSelect(p.id));
      const marker = new gl.Marker({ element: outer, anchor: 'bottom' })
        .setLngLat([p.lng, p.lat])
        .addTo(map);
      markersRef.current.set(p.id, { marker, inner, type: p.type });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, ready]);

  // Restyle for selection (in place — never replace the element) + pan to it.
  useEffect(() => {
    markersRef.current.forEach((entry, id) => styleInner(entry.inner, entry.type, id === selectedId));
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = places.find((x) => x.id === selectedId);
    if (p?.lat != null && p?.lng != null) {
      map.flyTo({ center: [p.lng, p.lat], zoom: Math.max(13, map.getZoom()), speed: 0.7 });
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
      'width:18px;height:18px;border-radius:50%;background:#2f6f7b;' +
      'border:3px solid #fff;box-shadow:0 0 0 6px rgba(47,111,123,0.25);';
    userMarkerRef.current = new gl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);
    map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 13, speed: 0.9 });
  }, [userLocation, ready]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Map of help locations" role="application" />;
}
