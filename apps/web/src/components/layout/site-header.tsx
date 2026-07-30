import { Logo } from './logo';
import { CitySelector } from './city-selector';
import { LocaleLink } from './locale-link';
import { IconSearch } from '@/components/icons';

/**
 * Full site header. The city selector appears only where it drives content
 * (the crime dashboard). On the home page it's hidden - choosing a city there
 * would just jump to /crime, so there's nothing to select against (owner's note).
 */
export function SiteHeader({ showCity = false }: { showCity?: boolean }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Logo />
        <div className="flex items-center gap-2">
          {showCity && <CitySelector />}
          <LocaleLink
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft hover:bg-accent-soft"
          >
            <IconSearch size={18} />
          </LocaleLink>
        </div>
      </div>
    </header>
  );
}
