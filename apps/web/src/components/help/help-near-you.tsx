'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import type { CityMeta, PlacesData, Place, PlaceType } from '@/data/types';
import { haversineKm, formatKm } from '@/lib/haversine';
import { cn } from '@/lib/cn';
import { IconPin, IconPhone, IconChevronRight, IconChevronDown, IconLocate } from '@/components/icons';
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
  const dest = p.lat != null && p.lng != null ? `${p.lat},${p.lng}` : `${p.name}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}
const telHref = (phone: string) => phone.replace(/[^0-9]/g, '');

export function HelpNearYou({ allPlaces, cities }: { allPlaces: Record<string, PlacesData>; cities: CityMeta[] }) {
  const t = useTranslations('help');
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();

  const helpCities = cities.filter((c) => c.hasHelp);
  const urlCity = searchParams.get('city');
  const cityId = urlCity && allPlaces[urlCity] ? urlCity : 'bengaluru';
  const cityName = cities.find((c) => c.id === cityId)?.name ?? 'Bengaluru';
  const places = allPlaces[cityId]?.places ?? [];

  const [filter, setFilter] = useState<Filter>('all');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loc, setLoc] = useState<LocState>('idle');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const changeCity = (id: string) => {
    setSelectedId(null);
    setFilter('all');
    router.replace(`/${locale}/map/?city=${id}`);
  };

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t('filters.all') },
    { id: 'women', label: t('filters.women') },
    { id: 'police', label: t('filters.police') },
    { id: 'osc', label: t('filters.osc') },
    { id: 'helpline', label: t('filters.helpline') },
  ];

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) return setLoc('unavailable');
    setLoc('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
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
      const has = p.lat != null && p.lng != null;
      const km = coords && has ? haversineKm(coords, { lat: p.lat!, lng: p.lng! }) : null;
      return { p, km };
    });
    withDist.sort((a, b) => {
      if (a.km != null && b.km != null) return a.km - b.km;
      if (a.km != null) return -1;
      if (b.km != null) return 1;
      const rank = (ty: PlaceType) => (ty === 'women' ? 0 : ty === 'osc' ? 1 : ty === 'police' ? 2 : 3);
      return rank(a.p.type) - rank(b.p.type);
    });
    return withDist.slice(0, LIST_CAP).map(({ p, km }) => (km != null ? { ...p, distanceLabel: formatKm(km) } : p));
  }, [places, filter, coords]);

  const mapPlaces = useMemo(
    () => places.filter((p) => (filter === 'all' || p.type === filter) && p.lat != null && p.lng != null),
    [places, filter],
  );

  // Pin click → highlight AND scroll the matching card into view (both lists).
  useEffect(() => {
    if (!selectedId) return;
    document.querySelectorAll(`[data-place-id="${CSS.escape(selectedId)}"]`).forEach((el) => {
      (el as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [selectedId]);

  const list = (
    <ResultsList places={shown} selectedId={selectedId} onSelect={setSelectedId} cityName={cityName} verified={cityId === 'bengaluru'} />
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#EDEFE7]">
      <div className="absolute inset-0">
        <MapCanvas places={mapPlaces} userLocation={coords} selectedId={selectedId} onSelect={setSelectedId} cityId={cityId} />
      </div>

      {/* Floating chrome: row 1 brand + city + quick exit; row 2 filters (separate) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2.5 p-3.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 shadow-[0_3px_10px_rgba(42,36,32,0.14)]">
            <Logo size="sm" />
            <span className="hidden text-[13px] font-semibold text-ink-faint sm:inline">/ {t('mobileTitle')}</span>
          </span>
          <div className="pointer-events-auto flex items-center gap-2">
            <MapCitySelect cities={helpCities} current={cityId} onChange={changeCity} label={t('changeCity')} />
            <QuickExit variant="floating" />
          </div>
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5">
          {filters.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold shadow-[0_2px_8px_rgba(42,36,32,0.1)]',
                  active ? 'border-accent bg-accent text-white' : 'border-line-strong bg-surface text-ink-soft',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* My location - accent button. Bottom-right on web (zoom is bottom-left, so
          no collision); on mobile just above the sheet. */}
      <button
        type="button"
        onClick={useMyLocation}
        className="pointer-events-auto absolute right-3 bottom-[calc(56%+12px)] z-20 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_rgba(190,90,56,0.4)] hover:bg-accent-deep md:right-4 md:bottom-6"
      >
        <IconLocate size={15} strokeWidth={2} />
        {loc === 'locating' ? t('locating') : t('myLocation')}
      </button>
      {(loc === 'denied' || loc === 'unavailable') && (
        <p className="pointer-events-none absolute right-3 bottom-[calc(56%+54px)] z-20 max-w-[220px] rounded-md bg-surface px-2.5 py-1.5 text-right text-[11px] leading-snug text-accent-deep shadow md:right-4 md:bottom-[64px]">
          {loc === 'denied' ? t('locDenied') : t('locUnavailable')}
        </p>
      )}

      {/* Desktop results panel (filters are NOT here - they float above) */}
      <div className="pointer-events-auto absolute bottom-[92px] left-4 top-[122px] z-10 hidden w-[360px] flex-col overflow-hidden rounded-md border border-line bg-surface shadow-[0_8px_30px_rgba(42,36,32,0.14)] md:flex">
        <div className="flex flex-none items-baseline justify-between border-b border-line px-4 py-3">
          <span className="font-display text-[16px] font-semibold text-ink">{t('nearbyCount', { count: shown.length })}</span>
          <span className="text-[11.5px] text-ink-faint">{t('byDistance')}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{list}</div>
      </div>

      {/* Mobile bottom sheet (list only) */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex max-h-[56%] flex-col rounded-t-[22px] bg-surface shadow-[0_-8px_28px_rgba(42,36,32,0.16)] md:hidden">
        <div className="flex flex-none justify-center py-2.5"><span className="h-1 w-9 rounded-full bg-line-strong" /></div>
        <div className="flex flex-none items-baseline justify-between px-4 pb-2">
          <span className="font-display text-[15px] font-semibold text-ink">{t('nearbyCount', { count: shown.length })}</span>
          <span className="text-[11px] text-ink-faint">{t('byDistance')}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-5 pt-1">{list}</div>
      </div>
    </div>
  );
}

function MapCitySelect({ cities, current, onChange, label }: { cities: CityMeta[]; current: string; onChange: (id: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);
  const name = cities.find((c) => c.id === current)?.name ?? 'Bengaluru';
  const filtered = q ? cities.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) : cities;
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 py-2 text-[12.5px] font-semibold text-ink shadow-[0_3px_10px_rgba(42,36,32,0.14)]">
        <IconPin size={12} className="text-accent" strokeWidth={1.7} />
        {name}
        <IconChevronDown size={10} className="text-ink-faint" strokeWidth={1.7} />
      </button>
      {open && (
        <div role="listbox" className="absolute right-0 top-[42px] w-[220px] rounded-md border border-line-strong bg-surface p-1.5 shadow-[var(--shadow-pop)]">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a city…" aria-label="Search a city"
            className="mb-1.5 w-full rounded-md border border-line bg-paper px-2.5 py-2 text-[13px] text-ink outline-none placeholder:text-ink-faint" />
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.map((c) => (
              <button key={c.id} type="button" role="option" aria-selected={c.id === current} onClick={() => { setOpen(false); setQ(''); onChange(c.id); }}
                className={`flex w-full items-center justify-between rounded-lg px-[11px] py-[9px] text-left ${c.id === current ? 'bg-accent-soft' : 'hover:bg-paper'}`}>
                <span className="block text-[14px] font-medium text-ink">{c.name}</span>
                {c.state && <span className="text-[11px] text-ink-faint">{c.state}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultsList({ places, selectedId, onSelect, cityName, verified }: { places: Place[]; selectedId: string | null; onSelect: (id: string) => void; cityName: string; verified: boolean }) {
  const t = useTranslations('help');
  return (
    <ul className="flex flex-col gap-2.5">
      {places.map((p) => (
        <PlaceCard key={p.id} place={p} selected={selectedId === p.id} onSelect={() => onSelect(p.id)} />
      ))}
      <li className="mt-1 flex flex-col gap-2">
        <LocaleLink href="/grounding" className="flex items-center justify-between rounded-md border border-line bg-surface px-3.5 py-3 text-ink hover:border-accent-line">
          <span>
            <span className="block font-display text-[14px] font-medium">{t('overwhelmed.title')}</span>
            <span className="block text-[11.5px] text-ink-soft">{t('overwhelmed.desc')}</span>
          </span>
          <IconChevronRight size={16} className="text-ink-faint" />
        </LocaleLink>
        <p className="text-[10.5px] leading-snug text-ink-faint">
          {verified ? t('verifiedNote') : `Police stations for ${cityName} are from OpenStreetMap and not yet hand-verified against city police. National helplines apply everywhere.`}
          {' '}
          <LocaleLink href="/methodology" className="underline underline-offset-2">{t('howWeSource')}</LocaleLink>
        </p>
        <p className="text-[10.5px] leading-snug text-ink-faint">{t('safeBrowsingShort')}</p>
      </li>
    </ul>
  );
}

function PlaceCard({ place: p, selected, onSelect }: { place: Place; selected: boolean; onSelect: () => void }) {
  const t = useTranslations('help');
  const isWomen = p.type === 'women';
  const displayName = isWomen && /mahila|women/i.test(p.name) ? `${p.name} (${t('femalePoliceStation')})` : p.name;
  const callable = /[0-9]/.test(p.phone);
  return (
    <li
      data-place-id={p.id}
      onClick={onSelect}
      className={cn('cursor-pointer rounded-md border p-3.5 transition-colors', selected ? 'border-accent bg-accent-soft ring-1 ring-accent' : 'border-line bg-surface hover:border-accent-line')}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="whitespace-nowrap rounded-full px-2 py-[3px] text-[10px] font-bold uppercase tracking-[0.06em] text-white" style={{ background: TAG_COLOR[p.type] }}>
          {t(`types.${p.type}`)}
        </span>
        {p.distanceLabel && <span className="whitespace-nowrap text-[12px] text-ink-faint">{p.distanceLabel}</span>}
      </div>
      <div className="mt-2 font-display text-[15px] font-medium leading-tight text-ink">{displayName}</div>
      {p.type !== 'helpline' && (
        <div className={cn('mt-0.5 text-[12px]', p.addr ? 'text-ink-soft' : 'italic text-ink-faint')}>
          {p.addr || t('addrNotListed')}
        </div>
      )}
      {p.type === 'helpline' && p.addr && <div className="mt-0.5 text-[12px] text-ink-soft">{p.addr}</div>}
      <div className="mt-3 flex gap-2">
        <a href={directionsHref(p)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm border border-line-strong bg-surface px-3 py-2 text-[13px] font-semibold text-ink">
          <IconPin size={14} className="text-accent-deep" strokeWidth={1.7} />
          {t('directions')}
        </a>
        {callable && (
          <a href={`tel:${telHref(p.phone)}`} onClick={(e) => e.stopPropagation()}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm bg-accent px-3 py-2 text-[13px] font-semibold text-white hover:bg-accent-deep">
            <IconPhone size={14} />
            {t('call', { number: p.phone })}
          </a>
        )}
      </div>
    </li>
  );
}
