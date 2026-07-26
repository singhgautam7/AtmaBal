# design.md — Design system & data legibility

> The UI is how people get in; the honest, maintained data is what keeps the site
> alive and trustworthy. Modern design is necessary but it is the *copyable*
> part — do not let polish paper over the interpretation rules below.

## Design references

Before building UI, check **``design-assets/``** (placeholder — the owner will
drop mockups / Figma export / brand tokens there). If present, it is the source
of truth for visual design and you derive the Tailwind theme from it. If empty,
build against this document and keep everything cleanly themeable via centralized
tokens, so reconciliation later is cheap. Never scatter raw colors/spacing across
components.

## Brand & voice
- **Name:** Atma Bala (आत्मबल / ಆತ್ಮಬಲ) — "inner strength; the courage to stand
  for yourself." The hero section explains the meaning and the intent: this is a
  tool to help her stand for herself, **motivator not shelter**.
- **Say plainly it's for women — on the hero.** The hero must state this is a
  place for women in India. Naming the audience is safe on a marketing hero and
  builds trust.
- **But keep the plumbing discreet (safety).** Being obviously a
  women's-crime-and-safety tool is itself a risk on a monitored device. So:
  neutral `<title>`, neutral favicon, neutral URL/share preview — nothing in the
  browser chrome that flags the subject to someone looking over her shoulder or
  through her history.
- **Scope, not identity: multi-city from the start.** Bengaluru is the launch
  city, not the brand. Include a **city selector** (Bengaluru live; others
  "coming soon") and copy like "starting with Bengaluru."
- **Tone:** calm, capable, respectful, non-alarmist. Never fear-mongering
  (fear-based safety UI is exactly what we're improving on), never
  condescending.

## The single most important rule: lead with a sentence, not a chart
Every data view **opens with one plain-language sentence**; the chart sits
underneath as supporting evidence. Most people never decode a chart; nearly
everyone reads one sentence.

> e.g. "Reported harassment in public spaces in Bengaluru rose ~18% from 2019 to
> 2024, while overall reporting also increased — so part of this reflects more
> women coming forward, not only more incidents."

## Crime view = an analytics dashboard
Treat this page like a real analytics platform, not a single chart.
- **Design to the real NCRB structure.** Chapter 3B is metro-city level, so
  Bengaluru is covered, across multiple years. Each crime head carries THREE
  measures — **cases registered, number of victims, rate per lakh women** — so
  charts must offer a **measure toggle** between the three. Rate is the honest
  cross-year comparison.
- **Crime heads (rape IS included — do not omit sexual violence):** rape,
  molestation (assault/outrage of modesty), insult to modesty, kidnapping &
  abduction, cruelty by husband/relatives (498A), dowry deaths, acid attack &
  attempt, abetment to suicide, trafficking, cyber crimes against women,
  POCSO/child rape, immoral traffic, dowry prohibition. Heads sparse at city
  level should degrade gracefully, not render empty charts.
- **Lands on the FULL dashboard** — all charts visible at once, with a
  plain-language headline sentence at the top summarising the key trend.
- **Multiple chart types:** line (trends over time), bar/grouped bar (year or
  category comparison), pie or stacked bar (composition/share by crime head),
  plus "big number" stat cards (total, rate, YoY change, most-common head).
- **Multiple years:** include a year slider / range selector so the whole
  dashboard moves across all available years, not just the latest.
- **Multiple filters** across the top: crime head/category (multi-select), year
  range, and a **Public spaces / Domestic / All** filter that **defaults to
  All** — this is now just ONE filter among several, NOT the top-level frame.
  (Keep it because it stops the travel use-case from being swamped by
  domestic-cruelty cases, which are ~42% of the total — but it no longer
  dominates the page.)
- **The "what happens after / justice" data is a SECTION of this dashboard**
  (chargesheeting, conviction vs acquittal, pending trial), framed as system
  accountability, city figures provisional (see below).
- Every chart carries the reporting caveat. Colour-blind-safe; legible at 360px;
  no red heat-maps; no city-vs-city comparison; no single "safety score".
- **Transparency (trust):** dashboard footer cites the **data source** (NCRB
  "Crime in India" + Bengaluru city police open data) with a **"Data last
  updated: <month year>"** date; a one-line **"how to read this"** note; a
  plain-language **Methodology** link (crime-head mapping + population base); and
  a small per-chart **download/share** affordance so figures can be cited.

## The "what happens after" panel (justice / disposal) — v1
NCRB disposal tables let us show not just how many cases are filed but what
filing leads to: chargesheeting rate, **conviction vs acquittal**, cases pending
investigation, cases pending trial. (Karnataka 2023: ~92% of disposed cases
ended in acquittal; tens of thousands pending trial.)
- **Framing is everything:** present as **system accountability** — "this is how
  the system is performing, which is why steps like preserving evidence and
  getting legal aid matter" — NEVER as "don't bother reporting." It's an argument
  for support, not for silence.
- **Granularity caveat:** conviction/pendency is cleanest at STATE level. Whether
  NCRB breaks it to Bengaluru-city per-category must be verified at parse time;
  until then, label city-level disposal figures **provisional** and fall back to
  Karnataka-state framing where city data isn't available.

## Data-legibility rules (non-negotiable — tie to `data-pipeline.md`)
1. **No red danger maps.** No choropleth painting wards red; no single "safety
   score" per area. These trigger both the stigma trap and the reporting-bias
   trap. Use **trend direction** and **comparison-to-average** instead of an
   absolute heat scale.
2. **Always show an anchor.** Every number sits next to a reference: this area vs
   city average, or this year vs 5-year trend. A bare number is meaningless to a
   non-specialist.
3. **Reporting caveat inline**, right next to the number — not in a footer.
4. **Public-space vs domestic kept visually separate.** Travel view defaults to
   public-space offences.
5. **No cross-city comparison.** NCRB explicitly warns that crime rates of
   different states/metros are NOT comparable (different reporting practices,
   population bases). Compare **Bengaluru to itself over time only** — never
   Bengaluru vs Delhi/Mumbai.
6. **Use the official reporting-bias framing.** On the 2023 release, Karnataka
   police and activists publicly attributed the ~40% rise in crimes against
   women (2021→2023) to greater awareness and reporting, not a real surge. State
   this in-product, near the trend line — it's the clearest, source-backed way to
   make "numbers up ≠ danger up" land.

## Layout & responsiveness
- **Mobile-first, designed at 360px.** Desktop is the enhancement, not the base.
- **Charts must work at 360px** — legible labels, no horizontal scroll, no
  reliance on hover (touch has no hover).
- Safety-critical actions (call, quick-exit, directions) reachable one-handed.

## Accessibility (not optional — users may be one-handed, at night, stressed)
- Colour-blind-safe palettes; **never encode meaning by colour alone** (pair with
  label/shape/text).
- **44px minimum tap targets.**
- Real screen-reader labels on every control and data point.
- Sufficient contrast; respects reduced-motion.

## Key UI elements
- **Global city dropdown in the header on EVERY page** (Bengaluru only for now;
  must visibly show **"More cities coming soon"**; built for multiple cities).
  It's a site-wide control, not a maps-only one.
- **Map / "Get help near you" page:** nearest police station, nearest Mahila
  thana, and helplines. Client-side location (never leaves device), MapLibre +
  free tiles, "Directions" deep-links to Google Maps on tap. Filter by type
  (police station / mahila thana / helpline).
## Quick exit vs the grounding page (two DIFFERENT things — do not merge)

These solve two different needs. Merging them breaks the safety feature.

### Quick exit = a true panic button (safety-critical)
- Appears **only on sensitive pages** (options form, legal guides, get-help, and
  v2 reporting) — NOT on the hero or general crime-data views.
- On tap (and on **Esc** key): **instantly** replaces the current tab with a
  genuinely **neutral, unrelated site** (e.g. Google or a weather page). No
  interstitial, no animation, no message, nothing that references this site or
  women's safety. Speed and camouflage are the whole point — the danger is
  someone seeing the screen *right now*, and closing the browser outright looks
  more suspicious than switching to weather.
- First appearance gets a tiny "leave this site quickly" label so it isn't a
  mystery button.
- Pair with a short, honest **"browsing safely"** note on sensitive pages: quick
  exit does NOT erase history; on a monitored device, clearing history / using
  private browsing matters. (Every DV resource stresses this.)

### Grounding page = "Take a moment" (a real page, reachable by choice)
- A calm, reassuring page — gentle breathing animation, "you're going to be
  okay" — with clear actions: go to home, call the Mahila helpline, call a
  mental-health line.
- Linked **gently** from the help and options pages for someone who *chooses* to
  slow down. This is NOT what the quick-exit button triggers.
- This is where the warmth-and-reassurance instinct belongs; putting it on the
  escape hatch would keep a women's-safety screen visible at the exact moment it
  needed to vanish.
- **Helpline cards:** big tap-to-call, visible `last_verified` date.
- **Station finder:** client-side nearest result; "Directions" deep-links to
  Google Maps on tap only.
- **Options form:** stepwise, calm, one decision at a time; "not deciding yet"
  visually equal to other outcomes; print/save on the result.
- **Trust footer:** who's behind it, contact, corrections link, (optional) repo
  link, and the "we store nothing / no server, no analytics" statement — which is
  architecturally true here, not just a claim.

## Performance
- Perf budget for a **low-end Android on 3G.** Ship minimal JS; static pages;
  subset fonts; lazy-load the map. The user is not on a flagship phone.
