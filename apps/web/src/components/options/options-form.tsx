'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconLock,
  IconRights,
  IconPhone,
} from '@/components/icons';
import { QuickExit } from '@/components/layout/quick-exit';
import { SafeBrowsingNote } from '@/components/layout/safe-browsing-note';
import { LocaleLink } from '@/components/layout/locale-link';
import { OUTCOMES, SCENARIOS, type Scenario, type Regime, type LawRef } from '@/data/options';

type When = 'before' | 'after' | 'unsure';
type Safe = 'yes' | 'no' | 'skip';
type Posture = 'act' | 'understand';

const TOTAL_STEPS = 4;

export function OptionsForm() {
  const t = useTranslations('options');

  const [step, setStep] = useState(1);
  const [showOutcome, setShowOutcome] = useState(false);
  const [what, setWhat] = useState<Scenario | null>(null);
  const [when, setWhen] = useState<When | null>(null);
  const [safe, setSafe] = useState<Safe | null>(null);
  const [posture, setPosture] = useState<Posture | null>(null);
  const [openLaw, setOpenLaw] = useState<number | null>(null);

  const canContinue =
    (step === 1 && what) ||
    (step === 2 && when) ||
    step === 3 || // "are you safe" is optional
    (step === 4 && posture);

  const goBack = () => {
    if (showOutcome) {
      setShowOutcome(false);
      setStep(TOTAL_STEPS);
      return;
    }
    if (step > 1) setStep((s) => s - 1);
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else setShowOutcome(true);
  };

  const restart = () => {
    setStep(1);
    setShowOutcome(false);
    setWhat(null);
    setWhen(null);
    setSafe(null);
    setPosture(null);
    setOpenLaw(null);
  };

  const filledSteps = showOutcome ? TOTAL_STEPS : step;

  return (
    <div className="mx-auto max-w-[720px]">
      {/* Header: back + quick exit */}
      <div className="flex items-center justify-between">
        {step > 1 || showOutcome ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-soft hover:text-accent-deep"
          >
            <IconChevronLeft size={18} />
            {t('back')}
          </button>
        ) : (
          <span />
        )}
        <QuickExit />
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              i < filledSteps ? 'bg-accent' : 'bg-line-strong',
            )}
          />
        ))}
        <span className="whitespace-nowrap text-[11px] font-semibold text-ink-faint">
          {showOutcome
            ? t('stepOf', { current: TOTAL_STEPS, total: TOTAL_STEPS })
            : t('stepOf', { current: step, total: TOTAL_STEPS })}
        </span>
      </div>

      {showOutcome && what ? (
        <Outcome
          what={what}
          regime={whenToRegime(when)}
          posture={posture ?? 'act'}
          openLaw={openLaw}
          setOpenLaw={setOpenLaw}
          onRestart={restart}
        />
      ) : (
        <div className="mt-5">
          {step === 1 && (
            <StepRadio
              title={t('step1.title')}
              help={t('step1.help')}
              options={SCENARIOS.map((id) => ({ id, label: t(`what.${id}`) }))}
              value={what}
              onChange={(v) => setWhat(v as Scenario)}
            />
          )}
          {step === 2 && (
            <StepRadio
              title={t('step2.title')}
              help={t('step2.help')}
              options={(['after', 'before', 'unsure'] as When[]).map((id) => ({
                id,
                label: t(`when.${id}`),
              }))}
              value={when}
              onChange={(v) => setWhen(v as When)}
            />
          )}
          {step === 3 && (
            <>
              <StepRadio
                title={t('step3.title')}
                help={t('step3.help')}
                options={(['yes', 'no', 'skip'] as Safe[]).map((id) => ({
                  id,
                  label: t(`safe.${id}`),
                }))}
                value={safe}
                onChange={(v) => setSafe(v as Safe)}
              />
              {safe === 'no' && (
                <div className="mt-3 rounded-md border border-accent-line bg-accent-soft px-4 py-3.5">
                  <p className="text-[13px] leading-snug text-ink">{t('step3.immediateHelp')}</p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    <a
                      href="tel:112"
                      className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-3.5 py-2 text-[13px] font-semibold text-white"
                    >
                      <IconPhone size={14} />
                      {t('step3.callNow')}
                    </a>
                    <LocaleLink
                      href="/grounding"
                      className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink"
                    >
                      {t('step3.takeMoment')}
                    </LocaleLink>
                  </div>
                </div>
              )}
            </>
          )}
          {step === 4 && (
            <StepRadio
              title={t('step4.title')}
              help={t('step4.help')}
              options={(['act', 'understand'] as Posture[]).map((id) => ({
                id,
                label: t(`posture.${id}`),
              }))}
              value={posture}
              onChange={(v) => setPosture(v as Posture)}
            />
          )}

          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue}
            className="mt-5 w-full rounded-md bg-accent px-4 py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {step === TOTAL_STEPS ? t('seeOptions') : t('continue')}
          </button>

          <PrivacyNote className="mt-4" />
          <SafeBrowsingNote className="mt-3" />
        </div>
      )}
    </div>
  );
}

function whenToRegime(when: When | null): Regime | 'unsure' {
  if (when === 'before') return 'ipc_crpc';
  if (when === 'after') return 'bns_bnss';
  return 'unsure';
}

/* --------------------------------------------------------------- steps ---- */

function StepRadio({
  title,
  help,
  options,
  value,
  onChange,
}: {
  title: string;
  help: string;
  options: { id: string; label: string }[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <h1 className="font-display text-[24px] font-normal leading-snug text-ink">{title}</h1>
      <p className="mt-2.5 text-[14px] leading-snug text-ink-soft">{help}</p>
      <div className="mt-4 flex flex-col gap-2.5" role="radiogroup" aria-label={title}>
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md border px-[15px] py-3.5 text-left transition-colors',
                active ? 'border-accent-line bg-accent-soft' : 'border-line bg-surface',
              )}
            >
              <span className="flex-1 text-[15px] font-medium leading-snug text-ink">
                {o.label}
              </span>
              <span
                className={cn(
                  'flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full border-2',
                  active ? 'border-accent bg-accent' : 'border-line-strong bg-transparent',
                )}
              >
                {active && (
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M3 7.5l2.6 2.6L11 4.5" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- outcome ---- */

function Outcome({
  what,
  regime,
  posture,
  openLaw,
  setOpenLaw,
  onRestart,
}: {
  what: Scenario;
  regime: Regime | 'unsure';
  posture: Posture;
  openLaw: number | null;
  setOpenLaw: (i: number | null) => void;
  onRestart: () => void;
}) {
  const t = useTranslations('options');
  let cards = OUTCOMES[what];
  // "Just understand today" → surface the no-pressure paths first.
  if (posture === 'understand') {
    cards = [...cards].sort((a, b) => Number(!!b.highlight) - Number(!!a.highlight));
  }

  return (
    <div className="mt-5">
      <div className="text-[13px] font-semibold text-accent-deep">
        {t(`outcome.context.${what}`)}
      </div>
      <h1 className="mt-2 max-w-[560px] font-display text-[28px] font-normal leading-tight text-ink sm:text-[30px]">
        {t('outcome.title')}
      </h1>
      <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed text-ink-soft">
        {t('outcome.lede')}
      </p>

      <p className="mt-4 rounded-md border border-line bg-surface px-3.5 py-2.5 text-[12px] leading-snug text-ink-soft">
        {t(`regimeNote.${regime}`)}
      </p>
      <p className="mt-2 rounded-md px-3.5 py-2.5 text-[11.5px] leading-snug text-ink-soft" style={{ border: '1px solid rgba(201,154,46,0.4)', background: 'rgba(201,154,46,0.1)' }}>
        {t('outcome.reviewNote')}
      </p>

      {/* In-the-moment tools - handy right from an outcome. */}
      <div className="mt-4 flex flex-wrap gap-2 text-[12.5px]">
        <LocaleLink href="/first-24-hours" className="rounded-full border border-accent-line px-3 py-1.5 font-semibold text-accent-deep hover:bg-accent-soft">
          First 24 hours
        </LocaleLink>
        <LocaleLink href="/rights" className="rounded-full border border-accent-line px-3 py-1.5 font-semibold text-accent-deep hover:bg-accent-soft">
          Know your rights
        </LocaleLink>
        <LocaleLink href="/complaint-letter" className="rounded-full border border-accent-line px-3 py-1.5 font-semibold text-accent-deep hover:bg-accent-soft">
          Complaint template
        </LocaleLink>
        <LocaleLink href="/incident-log" className="rounded-full border border-accent-line px-3 py-1.5 font-semibold text-accent-deep hover:bg-accent-soft">
          Incident log
        </LocaleLink>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {cards.map((card, i) => (
          <article
            key={i}
            className={cn(
              'flex flex-col rounded-md border p-5',
              card.highlight ? 'border-accent-line bg-accent-soft' : 'border-line bg-surface',
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-10 w-10 flex-none items-center justify-center rounded-xl',
                  card.highlight ? 'bg-accent text-white' : 'bg-accent-soft text-accent-deep',
                )}
              >
                <card.Icon size={20} />
              </span>
              <span
                className={cn(
                  'text-[11px] font-semibold uppercase tracking-[0.1em]',
                  card.highlight ? 'text-accent-deep' : 'text-ink-faint',
                )}
              >
                {card.tag}
              </span>
            </div>
            <h2 className="mt-4 font-display text-[20px] font-medium leading-snug text-ink">
              {card.title}
            </h2>
            <p className="mt-2 text-[14px] leading-snug text-ink-soft">{card.desc}</p>

            {card.law && (
              <LawReveal
                law={card.law}
                open={openLaw === i}
                onToggle={() => setOpenLaw(openLaw === i ? null : i)}
              />
            )}

            {card.action && (
              <span className="mt-3.5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent-deep">
                {card.action}
                <IconChevronRight size={15} strokeWidth={1.8} />
              </span>
            )}
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-surface px-4 py-2.5 text-[13px] font-semibold text-ink"
        >
          <IconRights size={15} />
          Print / save this
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="no-print text-[13px] font-semibold text-ink-soft hover:text-accent-deep"
        >
          {t('startOver')}
        </button>
      </div>

      <PrivacyNote className="mt-5" />
      <SafeBrowsingNote className="mt-3" />
    </div>
  );
}

function LawReveal({
  law,
  open,
  onToggle,
}: {
  law: LawRef;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations('options.outcome');
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-3.5 flex w-full items-center justify-between border-t border-line pt-3 text-[13px] font-semibold text-ink-soft"
      >
        <span className="inline-flex items-center gap-1.5">
          <IconRights size={14} />
          {t('lawBehind')}
        </span>
        <span className={cn('inline-flex text-ink-faint transition-transform', open && 'rotate-180')}>
          <IconChevronDown size={14} strokeWidth={1.8} />
        </span>
      </button>
      {open && (
        <div className="mt-2.5 rounded-sm border border-line bg-paper px-3.5 py-3">
          <div className="text-[12.5px] font-bold text-ink">{law.act}</div>
          <div className="mt-0.5 text-[12px] font-semibold text-accent-deep">{law.section}</div>
          <p className="mt-2 text-[12.5px] leading-snug text-ink-soft">{law.text}</p>
          <p className="mt-2 text-[10.5px] leading-snug text-ink-faint">{t('lawCurrentNote')}</p>
          <p className="mt-1.5 text-[10.5px] leading-snug text-ink-faint">
            Source: {law.source} · Reviewed {law.lastReviewed}
          </p>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- misc ---- */

function PrivacyNote({ className }: { className?: string }) {
  const t = useTranslations('options');
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <IconLock className="flex-none text-ink-faint" />
      <span className="text-[12px] leading-snug text-ink-faint">{t('privacy')}</span>
    </div>
  );
}
