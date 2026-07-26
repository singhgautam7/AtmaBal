import { Logo } from './logo';
import { CitySelector } from './city-selector';

/**
 * Full site header. The city selector appears only where it drives content
 * (the crime dashboard). On the home page it's hidden — choosing a city there
 * would just jump to /crime, so there's nothing to select against (owner's note).
 */
export function SiteHeader({ showCity = false }: { showCity?: boolean }) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Logo />
        {showCity ? <CitySelector /> : <span />}
      </div>
    </header>
  );
}
