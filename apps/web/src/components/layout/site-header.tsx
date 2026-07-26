import { Logo } from './logo';
import { CitySelector } from './city-selector';

/**
 * Full site header for non-sensitive pages (home, crime dashboard): the diya
 * wordmark and the global city selector.
 *
 * HANDOFF v2: the inline nav links (Crime / Options / Get help) were removed —
 * the hero entry cards are the navigation; only the city dropdown stays.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Logo />
        <CitySelector />
      </div>
    </header>
  );
}
