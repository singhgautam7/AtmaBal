# Atma Bal (आत्मबल)

> "Inner strength; the courage to stand for yourself."

A calm, editorial reference tool for women in India — to understand what local
crime data actually says, know their rights in plain language, and find real
help. **Motivator, not shelter.** Multi-city by design, launching with Bengaluru,
English only.

This is **not** an SOS or live-tracking app. See [`CLAUDE.md`](CLAUDE.md) and
[`specs/`](specs/) for the full scope and the safety-critical principles.

## Architecture in one line

A **statically exported** Next.js site. There is **no runtime backend and no
database in production** — a build-time SQLite source of truth exports per-city
JSON that the static site reads. "We store nothing" is therefore an architectural
fact, not a promise: nothing you do in the app is transmitted or stored.

## Repository layout

```
atmabal/
├─ apps/web/        Next.js (App Router) + TypeScript + Tailwind — the site
├─ data/            committed per-city JSON, consumed by the web app
├─ pipeline/        Python (uv): SQLite source of truth + JSON exporters (later step)
├─ specs/           the definitive scope + safety rules
├─ design.md        design system + data-legibility rules
└─ design-assets/   local-only design references (gitignored)
```

## Getting started

```bash
bun install
bun run dev      # http://localhost:3000  → redirects to /en
```

Other scripts:

```bash
bun run build      # static export to apps/web/out
bun run lint
bun run typecheck
bun run test       # Vitest (unit)
bun run e2e        # Playwright
```

## Safety-critical invariants (do not break)

- No server-side storage of anything a user does; no analytics on behaviour.
- The options form is 100% client-side.
- No legal fact ships without a source + review date.
- No red "danger" maps, no single per-area safety score.
- A persistent quick-exit button on every sensitive page.
- Safety-critical pages work offline.

See [`CLAUDE.md`](CLAUDE.md) for the complete list.
