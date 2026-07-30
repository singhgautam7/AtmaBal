/**
 * Prebuilt static search index. Assembled at build time from the content data +
 * hand-added pages and key terms, so search is fully client-side and offline -
 * no server, no query logging.
 */
import { RIGHTS } from './rights';
import { FIRST_24 } from './first24';
import { HELPLINES, CATEGORY_LABELS } from './helplines';
import { EXPLAINERS } from './explainers';

export interface SearchEntry {
  title: string;
  snippet: string;
  href: string;
  /** Space-joined extra terms to match on (lowercased at search time). */
  keywords: string;
}

const PAGES: SearchEntry[] = [
  { title: 'Where do I start', snippet: 'A gentle front door - one question to point you the right way.', href: '/start', keywords: 'begin help unsure not sure' },
  { title: 'Crime in your city', snippet: 'Honest NCRB crime data by offence type, for 19 metros.', href: '/crime', keywords: 'ncrb statistics rate charge-sheet head' },
  { title: 'Know your options', snippet: 'Your rights and next steps, in plain language.', href: '/options', keywords: 'form scenario rights next steps' },
  { title: 'Get help now', snippet: 'Verified helplines and your nearest police / women’s station.', href: '/map?city=bengaluru', keywords: 'map station police women osc directions near me' },
  { title: 'Helpline directory', snippet: 'Filterable national helplines with tap-to-call.', href: '/helplines', keywords: 'call number phone 112 181 1098 1930 14416' },
  { title: 'In-the-moment tools', snippet: 'Guides, rights cards and templates in one place.', href: '/tools', keywords: 'templates guide first 24 hours' },
  { title: 'First 24 hours', snippet: 'Calm, time-sensitive steps after an incident.', href: '/first-24-hours', keywords: 'evidence medical exam note contact' },
  { title: 'Know your rights', snippet: 'Save-able cards - Zero FIR, free FIR copy, e-FIR, more.', href: '/rights', keywords: 'card police station right' },
  { title: 'Written-complaint template', snippet: 'A fill-in-the-blank FIR-request letter to the police.', href: '/complaint-letter', keywords: 'letter sho application print download' },
  { title: 'Incident log', snippet: 'A dated record you can keep over time.', href: '/incident-log', keywords: 'diary record log evidence' },
  { title: 'Safety planning', snippet: 'A calm checklist for an ongoing unsafe situation.', href: '/safety-plan', keywords: 'leave documents essentials plan domestic' },
  { title: 'How it works', snippet: 'What actually happens when you file an FIR, get a medical exam, or visit a One Stop Centre.', href: '/how-it-works', keywords: 'process explainer expect' },
  { title: 'A minute to breathe', snippet: 'A quiet space to steady yourself.', href: '/grounding', keywords: 'overwhelmed calm breathing grounding' },
  { title: 'Methodology & sources', snippet: 'Where every number comes from, and its limits.', href: '/methodology', keywords: 'source ncrb 2011 principal offence' },
  { title: 'About', snippet: 'What Atma Bal is - independent, non-commercial.', href: '/about', keywords: 'about independent' },
  { title: 'Corrections', snippet: 'Report something wrong or out of date.', href: '/corrections', keywords: 'wrong fix email report' },
];

const KEY_TERMS: SearchEntry[] = [
  { title: 'Zero FIR', snippet: 'File an FIR at ANY police station, wherever it happened.', href: '/rights#zero-fir', keywords: 'jurisdiction any station refuse' },
  { title: 'Free copy of your FIR', snippet: 'You are entitled to a copy of your FIR at no cost.', href: '/rights#free-copy', keywords: 'fir number' },
  { title: 'e-FIR', snippet: 'Report electronically, without going to the station first.', href: '/rights#e-fir', keywords: 'online electronic' },
  { title: 'One Stop Centre (Sakhi)', snippet: 'Walk in for medical, legal, police and counselling help - no FIR needed.', href: '/how-it-works#one-stop-centre', keywords: 'sakhi shelter counselling' },
  { title: 'Medical examination', snippet: 'Free, time-sensitive, and your right.', href: '/how-it-works#medical-exam', keywords: 'hospital evidence rape sexual assault' },
];

export const SEARCH_INDEX: SearchEntry[] = [
  ...PAGES,
  ...KEY_TERMS,
  ...RIGHTS.map((r) => ({ title: r.title, snippet: r.body, href: `/rights#${r.id}`, keywords: `right ${r.tag} ${r.law.section ?? ''}` })),
  ...EXPLAINERS.map((e) => ({ title: e.title, snippet: e.intro, href: `/how-it-works#${e.id}`, keywords: 'process explainer' })),
  ...FIRST_24.map((s) => ({ title: s.title, snippet: s.body.slice(0, 120), href: `/first-24-hours#${s.id}`, keywords: 'first 24 hours' })),
  ...HELPLINES.map((h) => ({
    title: `${h.name} · ${h.number}`,
    snippet: h.whatFor,
    href: '/helplines',
    keywords: `helpline call ${h.number} ${h.categories.map((c) => CATEGORY_LABELS[c]).join(' ')}`,
  })),
];
