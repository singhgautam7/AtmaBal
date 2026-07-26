/** Indian-locale number formatting (lakh/crore grouping). */
export function fmtN(value: number): string {
  return Math.round(value).toLocaleString('en-IN');
}

/** Format a measure value: rates get 1 decimal (0 when ≥10), counts are integers. */
export function fmtMeasure(value: number, measure: 'cases' | 'victims' | 'rate'): string {
  if (measure === 'rate') {
    return value >= 10 ? value.toFixed(0) : value.toFixed(1);
  }
  return fmtN(value);
}
