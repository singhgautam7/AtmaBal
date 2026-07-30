/**
 * Plain-language "what actually happens when you..." explainers. Reassuring and
 * options-framed. Any legal specifics REUSE the existing flagged BNSS citations
 * (see data/options.tsx / data/rights.ts) - no new section numbers are invented.
 *
 * ⚠️ Legal points are a first draft pending human review (source + last_reviewed
 * shown); structured data so hi/kn can be translated later.
 */
import type { LawBasis } from '@/components/tools/review-banner';

const R = '2026-07-26';
const BNSS = 'Bharatiya Nagarik Suraksha Sanhita, 2023';

export interface Explainer {
  id: string;
  title: string;
  intro: string;
  steps: string[];
  reassure: string;
  law?: LawBasis;
}

export const EXPLAINERS: Explainer[] = [
  {
    id: 'filing-fir',
    title: 'What happens when you file an FIR',
    intro: 'An FIR (First Information Report) is simply the police writing down your report of a serious offence, so it becomes an official record and an investigation can begin.',
    steps: [
      'You tell the police what happened - in your own words, spoken or in writing. You can bring a written complaint (there is a fill-in-the-blank template on this site).',
      'The officer writes it down. For many offences against women, this is done by a woman police officer, and it can be at a place you feel safe.',
      'It is read back to you. Check it, and only sign once it matches what you said.',
      'You get a copy - free of cost - and an FIR number to keep. That number is how you follow up.',
      'If a station says the offence did not happen in their area, you can still insist on a Zero FIR - it is registered anywhere and transferred later.',
    ],
    reassure: 'You can take a trusted person with you, and you can file whenever you are ready - it does not have to be the same day.',
    law: {
      act: BNSS,
      section: '§173',
      text: 'Information about a cognizable offence is recorded (registered irrespective of area - Zero FIR); a free copy is given to the informant.',
      source: BNSS,
      lastReviewed: R,
    },
  },
  {
    id: 'medical-exam',
    title: 'What happens at a medical examination',
    intro: 'After a physical or sexual assault, a medical examination checks and treats any injuries and can collect evidence. It is your right, it is free, and it is your choice.',
    steps: [
      'Go to a public hospital - they cannot turn you away, and you do not need to have filed an FIR first.',
      'The examination happens with your consent, and can be done by or in the presence of a woman.',
      'The doctor treats injuries, and - if you agree - documents them and collects samples that can serve as evidence.',
      'Going soon matters, because some evidence fades with time and washing. If you can, try not to bathe or change clothes beforehand.',
      'You can ask a trusted person or a support worker to be with you.',
    ],
    reassure: 'You decide how much happens. You can accept treatment and decline evidence collection, or change your mind at any point.',
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
    title: 'What happens at a One Stop Centre',
    intro: 'A One Stop Centre (Sakhi) brings medical help, police assistance, legal aid and counselling together in one place, so you do not have to run between offices.',
    steps: [
      'You can walk in - no FIR or paperwork is needed to just talk to someone.',
      'A case worker listens, in private, and explains the choices in front of you.',
      'From there you can get medical help, help to file a complaint, free legal aid, and counselling - whichever you want.',
      'If you need somewhere safe to stay for a short while, many centres can arrange temporary shelter.',
      'Everything is free, and you choose what to take up and what to leave.',
    ],
    reassure: 'Nothing is forced. A One Stop Centre is often the gentlest first step because you can simply ask questions and decide later.',
  },
];
