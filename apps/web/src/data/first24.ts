/**
 * "First 24 hours" - a calm, options-framed guide to time-sensitive steps.
 * Framed as choices, never orders; the "not deciding yet is valid" tone is kept.
 *
 * Only one item makes a legal claim (the right to a medical examination); it
 * carries the same sourced, review-flagged citation used elsewhere. Structured
 * data so hi/kn can be translated later.
 */
import type { LawBasis } from '@/components/tools/review-banner';

const R = '2026-07-26';

export interface Step {
  id: string;
  title: string;
  body: string;
  /** Optional in-app link {href,label}. */
  link?: { href: string; label: string };
  law?: LawBasis;
}

export const FIRST_24: Step[] = [
  {
    id: 'breathe',
    title: 'You do not have to decide everything now',
    body: 'Take a breath. You can keep your options open, tell no one yet, and still do the few things below that are only possible while they are fresh. Choosing to wait, or to only understand your options today, is completely valid.',
    link: { href: '/grounding', label: 'A minute to steady yourself' },
  },
  {
    id: 'safe',
    title: 'If you are in danger right now, call 112',
    body: '112 is the all-India emergency number. If you are not safe, get to a public place or a trusted person first - everything else can wait until you are.',
  },
  {
    id: 'evidence',
    title: 'Keep what is fresh, if you can',
    body: 'Evidence is easiest to preserve early. Screenshot messages, call logs, and social-media posts (with dates visible). Note names, phone numbers, vehicle numbers, and places while you remember them. In a physical or sexual assault, try not to wash or change clothes before a medical exam; if you do change, keep the clothes in a paper (not plastic) bag.',
  },
  {
    id: 'medical',
    title: 'A free medical examination is your right - and it is time-sensitive',
    body: 'You can go to a public hospital for a prompt, free examination and treatment. They cannot turn you away. Going soon matters, because some evidence fades - but it remains your choice.',
    law: {
      act: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
      section: '§184',
      text: 'Medical examination of a survivor of sexual assault is provided for and treated as time-sensitive; public hospitals must not refuse care.',
      source: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
      lastReviewed: R,
    },
  },
  {
    id: 'note',
    title: 'Write down what happened, while you remember',
    body: 'A short account written now - date, time, place, who was involved, and the sequence of events - is easier to recall later and helps if you choose to file. You can keep adding to it over days.',
    link: { href: '/incident-log', label: 'Open a blank incident log' },
  },
  {
    id: 'reach',
    title: 'Reach people who can help - on your terms',
    body: 'A One Stop Centre gives medical, legal, police and counselling help in one place, and you do not need to have filed anything to walk in. The Women Helpline is 181. Telling one trusted person can lift a lot of the weight.',
    link: { href: '/map?city=bengaluru', label: 'Find a centre or station near you' },
  },
  {
    id: 'filing',
    title: 'Filing is a choice you can make now or later',
    body: 'You can file a Zero FIR at any police station, whenever you are ready - it does not have to be today. If you are unsure, you can start by simply understanding what your options are.',
    link: { href: '/options', label: 'See your options' },
  },
];
