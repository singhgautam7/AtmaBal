'use client';

import { useState } from 'react';
import { IconDoc } from '@/components/icons';

/**
 * A calm, printable safety-planning checklist for someone in an ongoing unsafe
 * situation. Options-framed and non-alarmist - "things some people find helpful",
 * not instructions. Ticks and notes live in this tab's memory only; nothing is
 * saved or sent. Print to keep a copy (blank items print too).
 */
const SECTIONS: { title: string; note?: string; items: string[]; fill?: string[] }[] = [
  {
    title: 'Papers worth keeping safe',
    note: 'Copies (photos on your phone or paper) are enough - keep them somewhere you can reach.',
    items: [
      'Your ID (Aadhaar / voter card / passport)',
      'Bank passbook / ATM card details',
      'Marriage certificate, if any',
      'Children’s birth certificates and school papers',
      'Property or rent papers',
      'Prescriptions and medical records',
      'Important phone numbers, written on paper too',
    ],
  },
  {
    title: 'A small bag, kept somewhere safe',
    note: 'With a trusted person or a place you can get to quickly, if you ever need to leave in a hurry.',
    items: [
      'Some money set aside',
      'A spare set of keys',
      'Phone charger / power bank',
      'A few days of any medicines',
      'A change of clothes (and for your children)',
      'Comfort items for children',
    ],
  },
  {
    title: 'People and places',
    note: 'Fill these in only if it feels safe to write them down.',
    items: [],
    fill: [
      'A person I can call any time',
      'A safe place I could go',
      'A code word with a friend that means "I need help"',
    ],
  },
  {
    title: 'If and when you decide to leave',
    note: 'Only ever on your own terms - there is no rush and no wrong choice.',
    items: [
      'Pick a time when it feels safest',
      'Keep some money and the small bag ready',
      'Know which exits you can use',
      'Tell one trusted person your plan',
      'Save 112 and the Women Helpline (181) in your phone',
      'Keep your phone charged',
    ],
  },
];

export function SafetyChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <div className="mt-6">
      <div data-noprint className="mb-4 rounded-md bg-accent-soft px-3.5 py-3 text-[12.5px] leading-snug text-ink">
        These are options, not orders - take what is useful and leave the rest. Nothing you tick or write
        is saved or sent; it stays in this tab only. You can print a copy to keep somewhere safe.
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-2.5 inline-flex min-h-[40px] items-center gap-1.5 rounded-sm bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-deep"
        >
          <IconDoc size={15} />
          Print this checklist
        </button>
      </div>

      <div className="tool-print flex flex-col gap-4">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-lg border border-line bg-surface p-5" style={{ breakInside: 'avoid' }}>
            <h2 className="font-display text-[18px] font-medium text-ink">{s.title}</h2>
            {s.note && <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">{s.note}</p>}
            <ul className="mt-3 flex flex-col gap-2">
              {s.items.map((it) => (
                <li key={it}>
                  <label className="flex min-h-[36px] cursor-pointer items-start gap-2.5 text-[14px] leading-snug text-ink">
                    <input
                      type="checkbox"
                      checked={!!checked[it]}
                      onChange={(e) => setChecked((c) => ({ ...c, [it]: e.target.checked }))}
                      className="mt-0.5 h-[18px] w-[18px] flex-none accent-accent"
                    />
                    <span>{it}</span>
                  </label>
                </li>
              ))}
              {s.fill?.map((f) => (
                <li key={f} className="text-[13px]">
                  <div className="font-semibold text-ink-soft">{f}</div>
                  <input
                    value={notes[f] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [f]: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[13.5px] text-ink"
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
