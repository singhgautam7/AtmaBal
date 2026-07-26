import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Logo } from '@/components/layout/logo';
import { OptionsForm } from '@/components/options/options-form';

export default async function OptionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('options');
  return (
    <main id="main" className="mx-auto max-w-[960px] px-5 py-6 sm:px-8">
      <div className="mb-2 flex items-center justify-between">
        <Logo size="sm" />
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {t('eyebrow')}
        </span>
      </div>
      <OptionsForm />
    </main>
  );
}
