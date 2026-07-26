/**
 * Options-form outcome content (ported from the design concept).
 *
 * This is *content*, kept out of the UI-string catalog (specs/i18n.md). Every
 * "law behind this" entry carries a `source` and `lastReviewed` date — the
 * review trail required by CLAUDE.md and specs/legal-content.md. Section numbers
 * appear ONLY inside the reveal, never as a headline.
 *
 * ⚠️ Provenance: these are the concept's illustrative citations (BNS/BNSS-era,
 * i.e. on/after 1 July 2024). They are structured correctly and sourced to the
 * named Acts, but must be checked by a qualified reviewer before launch. IPC/CrPC
 * citations for incidents *before* 1 July 2024 are intentionally NOT invented
 * here — where only a BNS citation is verified, we show a regime note rather than
 * guess a section number.
 */
import type { ComponentType } from 'react';
import {
  IconChat,
  IconCam,
  IconRights,
  IconDoc,
  IconShield,
  IconHelp,
} from '@/components/icons';

export type Scenario = 'public' | 'home' | 'work' | 'online' | 'unsure';
export type Regime = 'ipc_crpc' | 'bns_bnss';

export interface LawRef {
  act: string;
  section: string;
  text: string;
  /** Review trail — the source and the date it was last checked. */
  source: string;
  lastReviewed: string;
  /** Regime the cited sections belong to. */
  regime: Regime;
}

export interface OutcomeCard {
  tag: string;
  title: string;
  desc: string;
  action: string | null;
  Icon: ComponentType<{ size?: number }>;
  highlight?: boolean;
  law: LawRef | null;
}

const REVIEWED = '2026-05-01';

/** The "not deciding yet" path — first-class, present in every scenario. */
const notDeciding: OutcomeCard = {
  tag: 'Equally valid',
  title: 'Not deciding yet — talk it through first',
  Icon: IconHelp,
  highlight: true,
  action: null,
  law: null,
  desc: 'Completely okay. Speak with a counsellor to think it over. No form, no report, no pressure to act — call the Women Helpline on 181 whenever you like.',
};

export const OUTCOMES: Record<Scenario, OutcomeCard[]> = {
  online: [
    {
      tag: 'Report it',
      title: 'Complain to the Cyber Crime cell',
      Icon: IconChat,
      action: 'Start online',
      desc: 'File on the National Cyber Crime portal or at your local cyber police station — you can do it online.',
      law: {
        act: 'IT Act, 2000 + BNS, 2023',
        section: 'IT Act s.66E & s.67 · BNS s.78 (stalking)',
        text: 'Capturing or sharing private images, and obscene electronic material, are offences under the IT Act; online stalking falls under BNS s.78. They can be pursued together.',
        source: 'Information Technology Act 2000; Bharatiya Nyaya Sanhita 2023',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    {
      tag: 'Protect your case',
      title: 'Preserve the evidence first',
      Icon: IconCam,
      action: 'How to save proof',
      desc: "Don't delete anything. Screenshot messages, save links, note usernames and dates — screens are proof.",
      law: {
        act: 'Bharatiya Sakshya Adhiniyam, 2023',
        section: 's.63 (electronic records)',
        text: 'Electronic records are admissible as evidence. Keeping originals with dates and device details makes a complaint far stronger.',
        source: 'Bharatiya Sakshya Adhiniyam 2023',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    {
      tag: 'Free legal help',
      title: 'Free legal aid',
      Icon: IconRights,
      action: 'Check eligibility',
      desc: 'A lawyer at no cost to guide the complaint, through the District Legal Services Authority.',
      law: {
        act: 'Legal Services Authorities Act, 1987',
        section: 's.12(c)',
        text: 'Every woman is entitled to free legal services regardless of income.',
        source: 'Legal Services Authorities Act 1987',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    notDeciding,
  ],
  public: [
    {
      tag: 'File a report',
      title: 'File a Zero FIR',
      Icon: IconDoc,
      action: 'How it works',
      desc: 'You can file an FIR at ANY police station, no matter where it happened — they must register it.',
      law: {
        act: 'BNSS, 2023',
        section: 's.173',
        text: 'Police must register information about a cognizable offence irrespective of jurisdiction — the basis of the Zero FIR.',
        source: 'Bharatiya Nagarik Suraksha Sanhita 2023',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    {
      tag: 'Your right',
      title: 'Free, immediate medical exam',
      Icon: IconShield,
      action: 'What to expect',
      desc: 'You have a right to a prompt, free medical examination and care. A hospital cannot turn you away.',
      law: {
        act: 'BNSS, 2023',
        section: 's.184 (medical examination)',
        text: 'Medical examination of a survivor is provided for and treated as time-sensitive evidence; public hospitals must not refuse care.',
        source: 'Bharatiya Nagarik Suraksha Sanhita 2023',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    {
      tag: 'Support in one place',
      title: 'One Stop Centre (Sakhi)',
      Icon: IconHelp,
      action: 'Find the nearest',
      desc: 'Free medical, legal, police and counselling help under one roof. No FIR needed to walk in.',
      law: null,
    },
    notDeciding,
  ],
  home: [
    {
      tag: 'Civil remedy',
      title: 'Protection & residence orders',
      Icon: IconShield,
      action: 'How to apply',
      desc: 'You can get a protection order, stay in your home, and claim maintenance — without filing a criminal case.',
      law: {
        act: 'Protection of Women from Domestic Violence Act, 2005',
        section: 's.18 · s.19 · s.20',
        text: 'Protection (s.18), residence (s.19) and monetary relief (s.20) can be sought through a Protection Officer or Magistrate. No FIR required.',
        source: 'Protection of Women from Domestic Violence Act 2005',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    {
      tag: 'Support in one place',
      title: 'One Stop Centre (Sakhi)',
      Icon: IconHelp,
      action: 'Find the nearest',
      desc: 'Free counselling, legal aid, medical help and temporary shelter under one roof.',
      law: null,
    },
    {
      tag: 'If you choose',
      title: 'Criminal complaint for cruelty',
      Icon: IconDoc,
      action: 'What it involves',
      desc: 'Cruelty by a husband or his relatives is a criminal offence you can report when you are ready.',
      law: {
        act: 'BNS, 2023',
        section: 's.85 & s.86',
        text: 'Cruelty by a husband or relatives (formerly IPC 498A) is defined under BNS s.85 and s.86.',
        source: 'Bharatiya Nyaya Sanhita 2023',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    notDeciding,
  ],
  work: [
    {
      tag: 'Report at work',
      title: 'Complain to the Internal Committee',
      Icon: IconDoc,
      action: 'How to file',
      desc: 'Your workplace must have a committee to hear this confidentially and act within a set time.',
      law: {
        act: 'Sexual Harassment of Women at Workplace Act, 2013 (POSH)',
        section: 's.4 & s.9',
        text: 'Every workplace with 10+ employees must have an Internal Committee (s.4); a complaint can be filed within 3 months, extendable (s.9).',
        source: 'Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act 2013',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    {
      tag: 'Free legal help',
      title: 'Free legal aid',
      Icon: IconRights,
      action: 'Check eligibility',
      desc: 'Free advice or representation through the District Legal Services Authority.',
      law: {
        act: 'Legal Services Authorities Act, 1987',
        section: 's.12(c)',
        text: 'Every woman is entitled to free legal services regardless of income.',
        source: 'Legal Services Authorities Act 1987',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    {
      tag: 'Support in one place',
      title: 'One Stop Centre (Sakhi)',
      Icon: IconHelp,
      action: 'Find the nearest',
      desc: 'Counselling and legal guidance if you would like to talk it through first.',
      law: null,
    },
    notDeciding,
  ],
  unsure: [
    {
      tag: 'No pressure',
      title: 'Talk it through with a counsellor',
      Icon: IconChat,
      action: 'Talk to someone',
      desc: 'A Sakhi counsellor can help you think, with no report and no next step required.',
      law: null,
    },
    {
      tag: 'Learn',
      title: 'Understand your rights first',
      Icon: IconRights,
      action: 'Read the guides',
      desc: 'Plain-language guides to what the law offers — so you decide from a place of knowing.',
      law: {
        act: 'Legal Services Authorities Act, 1987',
        section: 's.12(c)',
        text: 'Free legal advice is your right, even just to understand your options.',
        source: 'Legal Services Authorities Act 1987',
        lastReviewed: REVIEWED,
        regime: 'bns_bnss',
      },
    },
    {
      tag: 'Support in one place',
      title: 'One Stop Centre (Sakhi)',
      Icon: IconHelp,
      action: 'Find the nearest',
      desc: 'Everything in one place, whenever you feel ready — including someone to simply listen.',
      law: null,
    },
    notDeciding,
  ],
};
