import { Diya } from '@/components/brand/diya';

/**
 * Instant navigation feedback: this Suspense fallback shows the moment a route
 * under /[locale] is requested, while its chunk/data resolve - so a click never
 * leaves a blank screen. A calm diya inside a slow spinning ring; neutral, no
 * alarming text.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-paper">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
        <Diya size={30} />
      </div>
      <span className="text-[12px] tracking-[0.04em] text-ink-faint">Loading…</span>
    </div>
  );
}
