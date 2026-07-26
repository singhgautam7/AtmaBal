/**
 * Quick-exit behaviour (safety-critical — see design.md "Quick exit").
 *
 * On tap or Esc, instantly replace the current tab with a neutral, unrelated
 * page. No interstitial, no animation, nothing that references this site. The
 * weather query is themed to the current city so the destination looks natural.
 *
 * `replace()` (not `assign()`) so this site isn't left in the back-stack of the
 * neutral page. It cannot erase history — the UI says so honestly elsewhere.
 */
export function quickExit(cityName = 'Bengaluru'): void {
  const q = encodeURIComponent(`weather ${cityName}`.trim());
  try {
    window.location.replace(`https://www.google.com/search?q=${q}`);
  } catch {
    // Last-resort fallback if replace() is blocked for any reason.
    window.location.href = 'https://www.google.com';
  }
}
