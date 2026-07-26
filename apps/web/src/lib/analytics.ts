/**
 * Analytics — intentionally a NO-OP.
 *
 * Atma Bala collects no analytics on user behaviour, and none at all on what a
 * user selects in the options form (specs/non-goals.md). This module exists so
 * that if anyone ever reaches for "let's track X", the only thing available to
 * import does nothing — and this comment explains why. Do not wire a real
 * analytics provider here. CI grep-guards against gtag/plausible/posthog/etc.
 */
export function track(_event: string, _props?: Record<string, unknown>): void {
  // Deliberately empty. See specs/non-goals.md — "No analytics on user behaviour".
}
