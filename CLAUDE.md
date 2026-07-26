# CLAUDE.md — Atm Bala

> Read this file fully before writing any code. Then read everything in `specs/`
> and `design.md`. Do not begin implementation until you have read all of them.

## What this project is

**Atm Bala** (आत्मबल / ಆತ್ಮಬಲ — "inner strength; the courage to stand for
yourself") is a reference tool for women in India. It is **not** an SOS or
live-tracking app. Its purpose is to help a woman understand, calmly and in her
own time:

1. **What crime looks like in her city** — reported crimes against women, shown
   honestly and legibly, so she can form a realistic picture before she travels
   or moves.
2. **What her options are** — a guided form that maps her situation to concrete
   legal rights and support routes (Zero FIR, e-FIR, One Stop Centres, legal
   aid, POSH), without ever pushing her toward a single "correct" action.
3. **Where to get help now** — verified helpline numbers, nearest police
   station, nearest Mahila (women's) police station, with one-tap dial and
   directions.

The tone throughout is **motivator, not shelter.** The product assumes she is
capable and gives her the information and rights she needs to act for herself.

**Launch scope:** Bengaluru only, English only. Everything is built so more
cities and more languages slot in later without rework.

## Non-negotiable principles

These are safety-critical. Violating them can cause real harm to real people.

1. **No server-side storage of anything a user does.** No backend that receives
   user input. No analytics on what she selects in the form. No cookies that
   track. The site is statically served; there is architecturally no server to
   store her data on. This must remain true, and it is a headline promise shown
   in the UI.
2. **Never invent a legal fact.** Every legal claim (section number, time limit,
   procedure, entitlement) must trace to a source recorded in the data, with a
   `last_reviewed` date. If a fact is not verified, it does not ship. A
   confident-but-wrong answer to a woman in crisis is worse than no answer.
3. **Never present reported-crime counts as a danger ranking.** Higher reported
   crime often means *better* reporting, not more danger. See
   `specs/data-pipeline.md` and `design.md` for how this must be handled. Do not
   build red "danger zone" maps.
4. **The form must always offer a "not deciding yet" path** as a first-class
   outcome, equal in prominence to filing a complaint.
5. **A quick-exit button** is present and persistent on every page.
6. **Everything works offline** for the safety-critical pages (helplines, FIR
   guide) via the service worker, and works on a low-end Android phone on a slow
   connection.

If a requested change conflicts with any of the above, stop and flag it rather
than implementing it.

## Tech stack (decided — do not substitute without asking)

- **Package manager / runner:** Bun.
- **Web app:** Next.js (App Router) + TypeScript, statically exported (SSG). No
  runtime database, no server actions that persist data.
- **Styling:** Tailwind CSS + shadcn/ui. See `design.md` for the design system
  and ``design-assets/`` for reference mockups.
- **Maps:** MapLibre GL JS with free tiles (OpenFreeMap or Protomaps). **Not**
  the Google Maps JS API. Deep-link out to Google Maps only when the user taps
  "Directions".
- **Nearest-station search:** entirely client-side (haversine over a small
  committed GeoJSON). Geolocation never leaves the device.
- **i18n:** `next-intl`, scaffolded now, **English only at launch.** See
  `specs/i18n.md`. Do not add Hindi/Kannada strings yet — leave the structure
  ready.
- **Data source of truth:** a committed **SQLite** database in `pipeline/`.
  Build step exports per-city JSON into the web app. See
  `specs/data-pipeline.md`.
- **Data pipeline:** Python managed with `uv`; `pdfplumber`/`camelot` for NCRB
  tables; `pydantic` for schema validation; `pytest`.
- **Tests:** Vitest (unit), Playwright (e2e).
- **PWA:** service worker with offline caching for safety-critical routes.
- **Hosting:** static deploy on **Cloudflare Pages** (or Vercel) free tier — no
  runtime DB, ≈₹0/month. See `specs/deployment.md`.

## Repository layout

```
atmabal/
├─ CLAUDE.md                  ← this file
├─ design.md                  ← design system + data-legibility rules
├─ specs/
│  ├─ v1-scope.md             ← the definitive v1 feature list
│  ├─ non-goals.md            ← what v1 deliberately does NOT do
│  ├─ data-pipeline.md        ← SQLite → JSON, NCRB ingestion, IPC↔BNS mapping
│  ├─ legal-content.md        ← the options form + legal guides + review trail
│  ├─ i18n.md                 ← language scaffolding + translation rules
│  ├─ deployment.md           ← where/how to deploy (static, free)
│  └─ v2-future.md            ← anonymous area reporting (NOT built in v1)
├─ apps/
│  └─ web/                    ← Next.js app
├─ data/                      ← generated per-city JSON (committed)
├─ content/                   ← MDX legal guides, per-locale
├─ pipeline/                  ← Python: SQLite source of truth + exporters
└─ `design-assets/`/       ← design references / mockups (see below)
```

## Design assets

**``design-assets/``** — PLACEHOLDER. The project owner will place design
references (mockups, a Figma export, a screenshot set, a moodboard, or brand
tokens) at this location. Before building any UI:

1. Check whether ``design-assets/`` exists and contains references.
2. If it does, treat those references as the source of truth for visual design
   and derive the Tailwind theme / tokens from them.
3. If it is still empty, build against the design system described in
   `design.md`, keep components cleanly themeable, and leave a note so the owner
   can reconcile later.

Do not hardcode colors or spacing scattered through components — centralize
design tokens so a later reconciliation with ``design-assets/`` is cheap.

## How to work

- Read `specs/v1-scope.md` for the exact build list and `specs/non-goals.md` for
  the guardrails, before proposing an implementation plan.
- Propose the plan and folder structure first; wait for confirmation before
  generating the full app.
- Follow industry-standard structure and keep everything reusable and typed.
  This is a long-lived, maintained project, not a prototype.
- When in doubt on anything legal or safety-related, flag it — do not guess.
