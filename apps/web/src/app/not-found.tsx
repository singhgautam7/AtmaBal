import { Diya } from '@/components/brand/diya';
import { defaultLocale } from '@/i18n/routing';

/**
 * 404 (Next emits it as out/404.html for the static host, which Cloudflare Pages
 * serves for unknown routes). Renders inside the root layout's document shell, so
 * no <html> here. Branded-but-calm; the tab TITLE stays neutral (root layout's
 * "Local Info & Resources") per the discreet-plumbing rule.
 */
const L = `/${defaultLocale}`;

const LINKS = [
  { href: `${L}/`, label: 'Home' },
  { href: `${L}/crime/`, label: 'Crime data' },
  { href: `${L}/options/`, label: 'Know your options' },
  { href: `${L}/map/?city=bengaluru`, label: 'Get help' },
];

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-paper px-6 py-16 text-center"
    >
      <Diya size={56} />
      <div>
        <h1 className="font-display text-[26px] font-medium leading-tight text-ink">This page isn&apos;t here</h1>
        <p className="mx-auto mt-2 max-w-[420px] text-[15px] leading-relaxed text-ink-soft">
          The link may be old or mistyped - nothing is wrong on your side. Here are the ways back in.
        </p>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-2.5">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="rounded-full border border-accent-line bg-surface px-4 py-2 text-[13.5px] font-semibold text-accent-deep hover:bg-accent-soft"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </main>
  );
}
