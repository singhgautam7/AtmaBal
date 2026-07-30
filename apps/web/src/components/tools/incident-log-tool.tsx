'use client';

import { useState } from 'react';
import { IconDownload, IconDoc } from '@/components/icons';

/**
 * A blank incident log a woman can keep over time. Client-side only - rows live
 * in this tab's memory, nothing is saved or sent. Add as many rows as you like;
 * Print it (blank rows print too, to fill by hand) or Download as a CSV/text file.
 */
const COLS = [
  { key: 'when', label: 'Date & time' },
  { key: 'what', label: 'What happened' },
  { key: 'where', label: 'Where' },
  { key: 'witnesses', label: 'Witnesses' },
  { key: 'evidence', label: 'Evidence kept' },
  { key: 'ref', label: 'Complaint / FIR ref.' },
] as const;

type Row = Record<string, string>;
const emptyRow = (): Row => Object.fromEntries(COLS.map((c) => [c.key, '']));

export function IncidentLogTool() {
  const [rows, setRows] = useState<Row[]>(() => [emptyRow(), emptyRow(), emptyRow()]);

  const setCell = (i: number, key: string, val: string) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  const download = () => {
    const esc = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
    const csv = [
      COLS.map((c) => esc(c.label)).join(','),
      ...rows.map((r) => COLS.map((c) => esc(r[c.key] ?? '')).join(',')),
    ].join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'incident-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6">
      <div data-noprint className="mb-4 rounded-md bg-accent-soft px-3.5 py-3 text-[12.5px] leading-snug text-ink">
        <strong className="font-semibold">How to use.</strong> Add a row each time something happens.
        Keeping a dated record - however short - helps you remember clearly and can support a complaint
        later. Print it (blank rows print too), or download it as a file.
        <span className="mt-1 block text-ink-soft">
          Nothing here is saved or sent - it lives in this tab only and disappears when you close it.
        </span>
      </div>

      <div className="tool-print overflow-x-auto rounded-md border border-line bg-white">
        <table className="w-full min-w-[760px] border-collapse text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-line-strong bg-surface text-[11px] uppercase tracking-[0.05em] text-ink-faint">
              {COLS.map((c) => (
                <th key={c.key} className="px-2.5 py-2 font-semibold">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line align-top">
                {COLS.map((c) => (
                  <td key={c.key} className="p-0">
                    <textarea
                      rows={2}
                      value={r[c.key] ?? ''}
                      onChange={(e) => setCell(i, c.key, e.target.value)}
                      className="h-full w-full resize-y border-0 bg-transparent px-2.5 py-2 text-[12.5px] leading-snug text-ink focus:bg-accent-soft focus:outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div data-noprint className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRows((rs) => [...rs, emptyRow()])}
          className="rounded-sm border border-line-strong bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink"
        >
          + Add a row
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-4 py-2 text-[13px] font-semibold text-white hover:bg-accent-deep"
        >
          <IconDoc size={15} />
          Print
        </button>
        <button
          type="button"
          onClick={download}
          className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong bg-surface px-4 py-2 text-[13px] font-semibold text-ink"
        >
          <IconDownload size={15} />
          Download (.csv)
        </button>
      </div>
    </div>
  );
}
