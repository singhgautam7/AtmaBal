'use client';

import { useMemo, useState } from 'react';
import { IconDownload, IconDoc } from '@/components/icons';

/**
 * Fill-in-the-blank written complaint to the Station House Officer (the format
 * used to ask for an FIR). Entirely client-side: what you type lives only in this
 * tab's memory - nothing is saved or sent. Leave a field blank to print a blank
 * line and fill it by hand. Print/Download need no account.
 */
type Field = { key: string; label: string; placeholder: string; textarea?: boolean };

const FIELDS: Field[] = [
  { key: 'yourName', label: 'Your name', placeholder: 'Full name' },
  { key: 'yourAddress', label: 'Your address', placeholder: 'Where you live' },
  { key: 'yourPhone', label: 'Your phone (optional)', placeholder: 'Contact number' },
  { key: 'station', label: 'Police station', placeholder: 'e.g. Banashankari' },
  { key: 'city', label: 'City / district', placeholder: 'e.g. Bengaluru' },
  { key: 'incidentDate', label: 'Date of incident', placeholder: 'DD Month YYYY' },
  { key: 'incidentTime', label: 'Approx. time', placeholder: 'e.g. around 9 pm' },
  { key: 'incidentPlace', label: 'Place it happened', placeholder: 'Address / area' },
  { key: 'what', label: 'What happened', placeholder: 'Describe in your own words, in order.', textarea: true },
  { key: 'people', label: 'Person(s) involved', placeholder: 'Names / descriptions, if known', textarea: true },
  { key: 'witnesses', label: 'Witness(es), if any', placeholder: 'Names / contacts, if any', textarea: true },
];

const blank = (n = 24) => '_'.repeat(n);

export function ComplaintTool() {
  const [v, setV] = useState<Record<string, string>>({});
  const today = useMemo(
    () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    [],
  );

  const letter = useMemo(() => {
    const g = (k: string, n = 24) => (v[k]?.trim() ? v[k] : blank(n));
    return `${today}

To,
The Station House Officer,
${g('station', 20)} Police Station,
${g('city', 16)}

Subject: Complaint requesting registration of an FIR

Respected Sir / Madam,

I, ${g('yourName', 20)}, resident of ${g('yourAddress', 28)}${
        v.yourPhone?.trim() ? `, phone ${v.yourPhone}` : ''
      }, wish to report the following incident and request that a First Information Report be registered.

On ${g('incidentDate', 16)} at approximately ${g('incidentTime', 12)}, at ${g(
        'incidentPlace',
        24,
      )}, the following happened:

${g('what', 60)}

Person(s) involved: ${g('people', 30)}
Witness(es), if any: ${g('witnesses', 30)}

I request you to register a First Information Report on the basis of this complaint and to investigate the matter. I understand that a complaint about a cognizable offence can be registered at any police station (a Zero FIR), and that I am entitled to a free copy of the FIR.

Yours faithfully,

${g('yourName', 20)}
${v.yourPhone?.trim() ? v.yourPhone : ''}`;
  }, [v, today]);

  const download = () => {
    const blob = new Blob([letter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'complaint-to-SHO.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* Form */}
      <div data-noprint className="flex flex-col gap-3">
        <div className="rounded-md bg-accent-soft px-3.5 py-3 text-[12.5px] leading-snug text-ink">
          <strong className="font-semibold">How to use.</strong> Fill in what you can - the letter on
          the right updates as you type. Then Print it, or Download it as a text file, and take a signed
          copy to the police station. Prefer to write by hand? Just Print it blank and fill the lines in.
          <span className="mt-1 block text-ink-soft">
            Nothing you type is saved or sent - it stays in this tab only, and disappears when you close it.
          </span>
        </div>
        {FIELDS.map((f) =>
          f.textarea ? (
            <label key={f.key} className="text-[12.5px] font-semibold text-ink-soft">
              {f.label}
              <textarea
                rows={f.key === 'what' ? 4 : 2}
                value={v[f.key] ?? ''}
                onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="mt-1 w-full resize-y rounded-md border border-line bg-paper px-3 py-2 text-[13.5px] font-normal text-ink placeholder:text-ink-faint"
              />
            </label>
          ) : (
            <label key={f.key} className="text-[12.5px] font-semibold text-ink-soft">
              {f.label}
              <input
                value={v[f.key] ?? ''}
                onChange={(e) => setV((s) => ({ ...s, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[13.5px] font-normal text-ink placeholder:text-ink-faint"
              />
            </label>
          ),
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-sm bg-accent px-4 py-2.5 text-[13.5px] font-semibold text-white hover:bg-accent-deep"
          >
            <IconDoc size={15} />
            Print
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-sm border border-line-strong bg-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink"
          >
            <IconDownload size={15} />
            Download (.txt)
          </button>
        </div>
      </div>

      {/* Live letter (this is what prints) */}
      <div className="tool-print min-w-0 max-w-full overflow-hidden rounded-md border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <pre className="max-w-full whitespace-pre-wrap break-words font-serif text-[13px] leading-relaxed text-ink [overflow-wrap:anywhere] sm:text-[13.5px]">{letter}</pre>
      </div>
    </div>
  );
}
