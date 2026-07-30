/**
 * Know-your-rights cards - the short facts a woman carries into a police station.
 *
 * ⚠️ LEGAL CONTENT - PENDING HUMAN REVIEW (CLAUDE.md / specs/legal-content.md).
 * Citations are the post-1-July-2024 BNS/BNSS regime and reuse the same sources
 * already authored in data/options.tsx. They are a first draft with sources noted
 * and MUST be checked by a qualified person before launch. Accuracy is critical
 * here - these are the things she relies on at the counter.
 *
 * Content is kept as structured data (English now) so hi/kn can be added by
 * translating the strings, not rewriting the page (specs/i18n.md).
 */
import type { LawBasis } from '@/components/tools/review-banner';

const R = '2026-07-26';
const BNSS = 'Bharatiya Nagarik Suraksha Sanhita, 2023';

export interface RightCard {
  id: string;
  /** Short chip, e.g. "Your right". */
  tag: string;
  /** The right, stated plainly (the headline of the card). */
  title: string;
  /** One or two sentences she can act on. */
  body: string;
  law: LawBasis;
}

export const RIGHTS: RightCard[] = [
  {
    id: 'zero-fir',
    tag: 'Your right',
    title: 'You can file a Zero FIR at ANY police station',
    body: 'It does not matter where the incident happened or which station you are in - they must register your complaint. If they refuse, you can escalate in writing to the Superintendent of Police.',
    law: {
      act: BNSS,
      section: '§173(1), (4)',
      text: 'Information about a cognizable offence is registered irrespective of the area where the offence took place (Zero FIR); refusal can be escalated to the Superintendent of Police.',
      source: BNSS,
      lastReviewed: R,
    },
  },
  {
    id: 'free-copy',
    tag: 'Your right',
    title: 'A copy of your FIR is your right - and it is free',
    body: 'Once your FIR is registered, you are entitled to a copy at no cost, given to you promptly. Ask for it and keep it safe - you will need the FIR number.',
    law: {
      act: BNSS,
      section: '§173(2)',
      text: 'A copy of the recorded information (the FIR) is given free of cost to the informant.',
      source: BNSS,
      lastReviewed: R,
    },
  },
  {
    id: 'e-fir',
    tag: 'Your right',
    title: 'You can report electronically (e-FIR)',
    body: 'Information about an offence can be given by electronic means, without going to the station first. If you do, you are expected to sign it within three days for it to be taken on record.',
    law: {
      act: BNSS,
      section: '§173(1)',
      text: 'Information may be given by electronic communication; it is taken on record on being signed within three days by the person giving it.',
      source: BNSS,
      lastReviewed: R,
    },
  },
  {
    id: 'female-officer',
    tag: 'Your right',
    title: 'A woman officer, and privacy, when you give your statement',
    body: 'For sexual offences your statement is recorded by a woman police officer, and you can ask for it to be recorded at your home or a place you feel safe, with a support person present. You can ask others to step away.',
    law: {
      act: BNSS,
      section: '§176, §183',
      text: 'For specified offences against women, the survivor’s statement is recorded by a woman police officer / woman magistrate, and may be recorded at her residence or a place of her choice.',
      source: BNSS,
      lastReviewed: R,
    },
  },
  {
    id: 'medical-exam',
    tag: 'Your right',
    title: 'A free, immediate medical examination',
    body: 'You have a right to a prompt, free medical examination and treatment. A public hospital cannot turn you away, and the examination is time-sensitive evidence - going soon matters.',
    law: {
      act: BNSS,
      section: '§184',
      text: 'Medical examination of a survivor of sexual assault is provided for and treated as time-sensitive; public hospitals must not refuse care.',
      source: BNSS,
      lastReviewed: R,
    },
  },
  {
    id: 'one-stop-centre',
    tag: 'Support, no FIR needed',
    title: 'A One Stop Centre will help you walk in - no FIR required',
    body: 'One Stop Centres (Sakhi) give free medical, legal, police and counselling help under one roof. You do not need to have filed anything to walk in and just talk.',
    law: {
      act: 'One Stop Centre (Sakhi) Scheme',
      text: 'A government scheme (Ministry of Women & Child Development) providing integrated support to women affected by violence, in public or private space, without any requirement to file a complaint first.',
      source: 'Ministry of Women & Child Development, One Stop Centre Scheme',
      lastReviewed: R,
    },
  },
];
