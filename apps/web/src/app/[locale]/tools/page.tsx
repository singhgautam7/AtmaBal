import { setRequestLocale } from 'next-intl/server';
import type { ComponentType } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { LocaleLink } from '@/components/layout/locale-link';
import { IconShield, IconRights, IconDoc, IconChevronRight } from '@/components/icons';

const TOOLS: { href: string; title: string; desc: string; Icon: ComponentType<{ size?: number }> }[] = [
  {
    href: '/first-24-hours',
    title: 'First 24 hours',
    desc: 'A calm checklist of time-sensitive, optional steps - preserving evidence, the medical exam, who to reach.',
    Icon: IconShield,
  },
  {
    href: '/rights',
    title: 'Know your rights',
    desc: 'Short cards you can save or screenshot - Zero FIR, free FIR copy, e-FIR, a woman officer, One Stop Centre.',
    Icon: IconRights,
  },
  {
    href: '/complaint-letter',
    title: 'Written-complaint template',
    desc: 'A fill-in-the-blank letter to the police asking for an FIR. Print, download, or fill by hand.',
    Icon: IconDoc,
  },
  {
    href: '/incident-log',
    title: 'Incident log',
    desc: 'A blank log to keep over time - dates, witnesses, evidence, complaint references. Print or download.',
    Icon: IconDoc,
  },
];

export default async function ToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-[820px] flex-1 px-5 py-10 sm:px-8">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent-deep">In-the-moment tools</span>
        <h1 className="mt-2 font-display text-[30px] font-normal leading-tight text-ink">Tools you can use right now</h1>
        <p className="mt-3 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
          Practical, private tools for the hours that matter. Everything runs on your device - nothing
          is saved or sent - and works offline once the page has loaded.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {TOOLS.map(({ href, title, desc, Icon }) => (
            <LocaleLink
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-md border border-line bg-surface px-5 py-4 text-ink hover:border-accent-line hover:bg-accent-soft"
            >
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[18px] font-medium leading-tight">{title}</span>
                <span className="mt-0.5 block text-[13.5px] leading-snug text-ink-soft">{desc}</span>
              </span>
              <IconChevronRight size={18} className="flex-none text-ink-faint transition-transform group-hover:translate-x-0.5" />
            </LocaleLink>
          ))}
        </div>
      </main>
      <TrustFooter />
    </div>
  );
}
