'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Place, PlaceType } from '@/data/types';
import { haversineKm, formatKm } from '@/lib/haversine';
import { cn } from '@/lib/cn';
import { IconPin, IconPhone, IconChevronRight } from '@/components/icons';
import { LocaleLink } from '@/components/layout/locale-link';
import { QuickExit } from '@/components/layout/quick-exit';
import { Logo } from '@/components/layout/logo';
import { MapCanvas } from './map-canvas';

type Filter = 'all' | PlaceType;
type LocState = 'idle' | 'locating' | 'ok' | 'denied' | 'unavailable';

const TAG_COLOR: Record<PlaceType, string> = {
  women: 'var(--accent)',
  police: 'var(--data-domestic)',
  osc: 'var(--cat-3)',
  helpline: 'var(--ink-soft)',
};

const LIST_CAP = 40;

function directionsHref(p: Place): string {
  const dest = p.lat != null && p.lng != null ? `${p.lat},${p.lng}` : `${p.name} Bengaluru`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

const telHref = (phone: string) => phone.replace(/[^0-9]/g, '');

export function HelpNearYou({ places }: { places: Place[] }) {
  const t = useTranslations('help');
  const [filter, setFilter] = useState<Filter>('all');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loc, setLoc] = useState<LocState>('idle');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t('filters.all') },
    { id: 'women', label: t('filters.women') },
    { id: 'police', label: t('filters.police') },
    { id: 'osc', label: t('filters.osc') },
    { id: 'helpline', label: t('filters.helpline') },
  ];

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      setLoc('unavailable');
      return;
    }
    setLoc('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Held only in component state — never persisted, never transmitted.
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoc('ok');
      },
      (err) => setLoc(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  };

  const shown = useMemo(() => {
    const filtered = places.filter((p) => filter === 'all' || p.type === filter);
    const withDist = filtered.map((p) => {
      const hasCoords = p.lat != null && p.lng != null;
      const km = coords && hasCoords ? haversineKm(coords, { lat: p.lat!, lng: p.lng! }) : null;
      return { p, km };
    });
    withDist.sort((a, b) => {
      if (a.km != null && b.km != null) return a.km - b.km;
      if (a.km != null) return -1;
      if (b.km != null) return 1;
      const rank = (ty: PlaceType) => (ty === 'women' ? 0 : ty === 'osc' ? 1 : ty === 'police' ? 2 : 3);
      return rank(a.p.type) - rank(b.p.type);
    });
    return withDist
      .slice(0, LIST_CAP)
      .map(({ p, km }) => (km != null ? { ...p, distanceLabel: formatKm(km) } : p));
  }, [places, filter, coords]);

  const mapPlaces = useMemo(
    () => places.filter((p) => (filter === 'all' || p.type === filter) && p.lat != null && p.lng != null),
    [places, filter],
  );

  const controls = (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                'whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[12px] font-semibold',
                active
                  ? 'border-accent bg-accent text-white'
                  : 'border-line-strong bg-surface text-ink-soft hover:border-accent-line',
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={useMyLocation}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink hover:border-accent-line"
      >
        <IconPin size={13} className="text-accent" strokeWidth={1.7} />
        {loc === 'locating' ? t('locating') : t('useMyLocation')}
      </button>
      {loc === 'denied' && <p className="text-[11px] leading-snug text-accent-deep">{t('locDenied')}</p>}
      {loc === 'unavailable' && (
        <p className="text-[11px] leading-snug text-accent-deep">{t('locUnavailable')}</p>
      )}
      {loc === 'ok' && <p className="text-[11px] leading-snug text-ink-faint">{t('locationPrivacy')}</p>}
    </div>
  );

  const results = (
    <ResultsList
      places={shown}
      selectedId={selectedId}
      onSelect={setSelectedId}
      footer={
        <div className="flex flex-col gap-2">
          <LocaleLink
            href="/grounding"
            className="flex items-center justify-between rounded-md border border-line bg-surface px-3.5 py-3 text-ink hover:border-accent-line"
          >
            <span>
              <span className="block font-display text-[14px] font-medium">{t('overwhelmed.title')}</span>
              <span className="block text-[11.5px] text-ink-soft">{t('overwhelmed.desc')}</span>
            </span>
            <IconChevronRight size={16} className="text-ink-faint" />
          </LocaleLink>
          <p className="text-[10.5px] leading-snug text-ink-faint">{t('verifiedNote')}</p>
          <p className="text-[10.5px] leading-snug text-ink-faint">{t('safeBrowsingShort')}</p>
        </div>
      }
    />
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#EDEFE7]">
      <div className="absolute inset-0">
        <MapCanvas places={mapPlaces} userLocation={coords} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      {/* Floating top chrome: brand (links home) + quick exit */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3.5 sm:p-4">
        <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 shadow-[0_3px_10px_rgba(42,36,32,0.14)]">
          <Logo size="sm" />
          <span className="hidden text-[13px] font-semibold text-ink-faint sm:inline">
            / {t('mobileTitle')}
          </span>
        </span>
        <div className="pointer-events-auto">
          <QuickExit variant="floating" />
        </div>
      </div>

      {/* Desktop: floating results panel (filters live inside — no overlap) */}
      <div className="pointer-events-auto absolute bottom-5 left-4 top-[76px] z-10 hidden w-[360px] flex-col overflow-hidden rounded-md border border-line bg-surface shadow-[0_8px_30px_rgba(42,36,32,0.14)] md:flex">
        <div className="flex-none border-b border-line px-4 py-3">
          <div className="mb-2.5 flex items-baseline justify-between">
            <span className="font-display text-[16px] font-semibold text-ink">
              {t('nearbyCount', { count: shown.length })}
            </span>
            <span className="text-[11.5px] text-ink-faint">{t('byDistance')}</span>
          </div>
          {controls}
        </div>
        <div className="flex-1 overflow-y-auto p-3">{results}</div>
      </div>

      {/* Mobile: bottom sheet (filters inside the sheet header) */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex max-h-[62%] flex-col rounded-t-[22px] bg-surface shadow-[0_-8px_28px_rgba(42,36,32,0.16)] md:hidden">
        <div className="flex flex-none justify-center py-2.5">
          <span className="h-1 w-9 rounded-full bg-line-strong" />
        </div>
        <div className="flex-none px-4 pb-2">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-display text-[15px] font-semibold text-ink">
              {t('nearbyCount', { count: shown.length })}
            </span>
            <span className="text-[11px] text-ink-faint">{t('byDistance')}</span>
          </div>
          {controls}
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-5 pt-1">{results}</div>
      </div>
    </div>
  );
}

function ResultsList({
  places,
  selectedId,
  onSelect,
  footer,
}: {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  footer: React.ReactNode;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {places.map((p) => (
        <PlaceCard key={p.id} place={p} selected={selectedId === p.id} onSelect={() => onSelect(p.id)} />
      ))}
      <li className="mt-1">{footer}</li>
    </ul>
  );
}

function PlaceCard({
  place: p,
  selected,
  onSelect,
}: {
  place: Place;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations('help');
  const isWomen = p.type === 'women';
  const displayName =
    isWomen && /mahila|women/i.test(p.name) ? `${p.name} (${t('femalePoliceStation')})` : p.name;
  const callable = /[0-9]/.test(p.phone);

  return (
    <li
      onClick={onSelect}
      className={cn(
        'cursor-pointer rounded-md border p-3.5 transition-colors',
        selected ? 'border-accent bg-accent-soft ring-1 ring-accent' : 'border-line bg-surface hover:border-accent-line',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="whitespace-nowrap rounded-full px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.06em] text-white"
          style={{ background: TAG_COLOR[p.type] }}
        >
          {t(`types.${p.type}`)}
        </span>
        {p.distanceLabel && (
          <span className="whitespace-nowrap text-[12px] text-ink-faint">{p.distanceLabel}</span>
        )}
      </div>
      <div className="mt-2 font-display text-[15px] font-medium leading-tight text-ink">
        {displayName}
      </div>
      {p.addr && <div className="mt-0.5 text-[12px] text-ink-soft">{p.addr}</div>}
      <div className="mt-3 flex gap-2">
        <a
          href={directionsHref(p)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-line-strong bg-surface px-3 py-2 text-[13px] font-semibold text-ink"
        >
          <IconPin size={14} className="text-accent-deep" strokeWidth={1.7} />
          {t('directions')}
        </a>
        {callable && (
          <a
            href={`tel:${telHref(p.phone)}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-accent px-3 py-2 text-[13px] font-semibold text-white hover:bg-accent-deep"
          >
            <IconPhone size={14} />
            {t('call', { number: p.phone })}
          </a>
        )}
      </div>
    </li>
  );
}
