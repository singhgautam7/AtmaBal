'use client';

import { useState } from 'react';
import { LocaleLink } from '@/components/layout/locale-link';
import { IconChevronRight, IconChevronLeft } from '@/components/icons';

/**
 * A gentle front door, distinct from the options form: one soft question (with a
 * small second step for a couple of branches) that routes to the right tool or
 * guide. "Not sure" is always offered. Nothing is stored; it is only navigation.
 */
type Choice = { label: string; desc: string; href?: string; next?: Choice[] };

const ROOT: Choice[] = [
  { label: 'Something just happened to me', desc: 'Calm, time-sensitive steps for the first hours.', href: '/first-24-hours' },
  { label: 'I want to understand my options', desc: 'Your rights and next steps, in plain language.', href: '/options' },
  { label: 'I need to reach someone now', desc: 'Helplines you can call, and help near you.', next: [
    { label: 'Call a helpline', desc: 'Filter by what you need, tap to call.', href: '/helplines' },
    { label: 'Find a station or centre near me', desc: 'Nearest police, women’s station, One Stop Centre.', href: '/map?city=bengaluru' },
  ] },
  { label: 'I want to know my rights', desc: 'Short cards you can save - Zero FIR, free FIR copy, more.', href: '/rights' },
  { label: 'I want to keep a record', desc: 'Write a complaint, or start an incident log.', next: [
    { label: 'Write a complaint to the police', desc: 'A fill-in-the-blank FIR-request letter.', href: '/complaint-letter' },
    { label: 'Keep an incident log', desc: 'A dated record you can add to over time.', href: '/incident-log' },
  ] },
  { label: 'I’m in an unsafe situation', desc: 'A calm plan for staying and leaving safely.', href: '/safety-plan' },
  { label: 'I just need to breathe', desc: 'A quiet minute to steady yourself.', href: '/grounding' },
  { label: 'Not sure yet', desc: 'That’s completely okay - see everything in one place.', href: '/tools' },
];

export function StartFlow() {
  const [branch, setBranch] = useState<Choice[] | null>(null);
  const list = branch ?? ROOT;

  return (
    <div className="mt-6">
      {branch && (
        <button
          type="button"
          onClick={() => setBranch(null)}
          className="mb-3 inline-flex items-center gap-1 text-[13px] font-semibold text-accent-deep"
        >
          <IconChevronLeft size={15} strokeWidth={1.8} />
          Back
        </button>
      )}
      <div className="flex flex-col gap-2.5">
        {list.map((c) =>
          c.href ? (
            <LocaleLink
              key={c.label}
              href={c.href}
              className="group flex min-h-[64px] items-center gap-4 rounded-md border border-line bg-surface px-5 py-3.5 text-ink hover:border-accent-line hover:bg-accent-soft"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[17px] font-medium leading-tight">{c.label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{c.desc}</span>
              </span>
              <IconChevronRight size={18} className="flex-none text-ink-faint transition-transform group-hover:translate-x-0.5" />
            </LocaleLink>
          ) : (
            <button
              key={c.label}
              type="button"
              onClick={() => setBranch(c.next!)}
              className="group flex min-h-[64px] items-center gap-4 rounded-md border border-line bg-surface px-5 py-3.5 text-left text-ink hover:border-accent-line hover:bg-accent-soft"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[17px] font-medium leading-tight">{c.label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-soft">{c.desc}</span>
              </span>
              <IconChevronRight size={18} className="flex-none text-ink-faint transition-transform group-hover:translate-x-0.5" />
            </button>
          ),
        )}
      </div>
    </div>
  );
}
