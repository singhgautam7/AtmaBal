import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { TrustFooter } from '@/components/layout/trust-footer';
import { LocaleLink } from '@/components/layout/locale-link';
import {
  IconChart,
  IconRights,
  IconHelp,
  IconHeart,
  IconChevronRight,
} from '@/components/icons';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <Hero />
      <TrustFooter />
    </div>
  );
}

const ENTRIES: {
  key: 'crime' | 'options' | 'help' | 'overwhelmed';
  href: string;
  Icon: ComponentType<{ size?: number }>;
}[] = [
  { key: 'crime', href: '/crime', Icon: IconChart },
  { key: 'options', href: '/options', Icon: IconRights },
  { key: 'help', href: '/help', Icon: IconHelp },
  { key: 'overwhelmed', href: '/grounding', Icon: IconHeart },
];

function Hero() {
  const t = useTranslations('hero');
  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] flex-1 px-5 sm:px-8">
      <div className="grid items-center gap-10 py-12 sm:py-16 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
        {/* Statement */}
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent-deep">
            {t('eyebrow')}
          </div>
          <h1 className="mt-4 max-w-[460px] font-display text-[32px] font-normal leading-[1.28] text-ink sm:text-[40px]">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-[460px] text-[16px] leading-relaxed text-ink-soft sm:text-[17px]">
            {t('lede')}
          </p>
          <p className="mt-5 text-[14px] text-ink-faint">{t('cityNote')}</p>
        </div>

        {/* Entry cards */}
        <div className="flex flex-col gap-3">
          {ENTRIES.map(({ key, href, Icon }) => (
            <LocaleLink
              key={key}
              href={href}
              className="group flex items-center gap-4 rounded-md border border-line bg-surface px-5 py-[18px] text-ink transition-colors hover:border-accent-line hover:bg-accent-soft"
            >
              <span className="flex h-[46px] w-[46px] flex-none items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
                <Icon size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[19px] font-medium leading-tight">
                  {t(`entries.${key}.title`)}
                </span>
                <span className="mt-0.5 block text-[14px] leading-snug text-ink-soft">
                  {t(`entries.${key}.desc`)}
                </span>
              </span>
              <IconChevronRight
                size={20}
                className="flex-none text-ink-faint transition-transform group-hover:translate-x-0.5"
              />
            </LocaleLink>
          ))}
          <p className="mt-1 px-1 text-[12.5px] leading-snug text-ink-faint">
            {t('reassurance')}
          </p>
        </div>
      </div>
    </main>
  );
}
