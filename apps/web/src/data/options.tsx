/**
 * Options-form outcome content.
 *
 * ⚠️ LEGAL CONTENT — PENDING HUMAN REVIEW. Every "law behind this" entry carries a
 * source + lastReviewed date (the review trail required by CLAUDE.md /
 * specs/legal-content.md), but these are an authored FIRST DRAFT and MUST be
 * checked by a qualified person (lawyer / DLSA volunteer / One Stop Centre NGO)
 * before launch. Citations are the post-1-July-2024 BNS/BNSS regime; for incidents
 * before that date the rights are the same in substance but section numbers differ
 * (IPC/CrPC) — the form flags this rather than guessing the old number.
 *
 * Section numbers appear ONLY inside the expandable reveal, never as a headline.
 */
import type { ComponentType } from 'react';
import {
  IconChat,
  IconCam,
  IconRights,
  IconDoc,
  IconShield,
  IconHelp,
  IconHeart,
} from '@/components/icons';

export type Scenario =
  | 'rape'
  | 'home'
  | 'dowry'
  | 'work'
  | 'stalking'
  | 'image_abuse'
  | 'street'
  | 'acid'
  | 'kidnapping'
  | 'trafficking'
  | 'pocso'
  | 'unsure';

export type Regime = 'ipc_crpc' | 'bns_bnss';

export interface LawRef {
  act: string;
  section: string;
  text: string;
  source: string;
  lastReviewed: string;
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

/** The full ordered scenario list, used to build the step-1 chips. */
export const SCENARIOS: Scenario[] = [
  'rape',
  'home',
  'dowry',
  'work',
  'stalking',
  'image_abuse',
  'street',
  'acid',
  'kidnapping',
  'trafficking',
  'pocso',
  'unsure',
];

const R = '2026-07-26';
const bns = (section: string, act: string, text: string, source: string): LawRef => ({
  act,
  section,
  text,
  source,
  lastReviewed: R,
  regime: 'bns_bnss',
});

/* ------------------------------- reusable, sourced outcome cards ---------- */

const notDeciding: OutcomeCard = {
  tag: 'Equally valid',
  title: 'Not deciding yet — talk it through first',
  Icon: IconHeart,
  highlight: true,
  action: null,
  law: null,
  desc: 'Completely okay. Speak with a counsellor to think it over. No form, no report, no pressure to act — call the Women Helpline on 181 whenever you like.',
};

const zeroFir: OutcomeCard = {
  tag: 'File a report',
  title: 'File a Zero FIR — at any police station',
  Icon: IconDoc,
  action: 'How it works',
  desc: 'You can file an FIR at ANY police station, no matter where it happened — they must register it, and refusal can be escalated in writing to the Superintendent of Police.',
  law: bns(
    'BNSS §173(1), (2), (4)',
    'Bharatiya Nagarik Suraksha Sanhita, 2023',
    'Police must register information about a cognizable offence irrespective of jurisdiction (Zero FIR); you are entitled to a free copy (§173(2)); refusal can be escalated to the SP (§173(4)).',
    'Bharatiya Nagarik Suraksha Sanhita 2023',
  ),
};

const medicalExam: OutcomeCard = {
  tag: 'Your right',
  title: 'Free, immediate medical examination',
  Icon: IconShield,
  action: 'What to expect',
  desc: 'You have a right to prompt, free medical examination and treatment. A hospital cannot turn you away, and the exam is time-sensitive evidence.',
  law: bns(
    'BNSS §184',
    'Bharatiya Nagarik Suraksha Sanhita, 2023',
    'Medical examination of a survivor of sexual assault is provided for and treated as time-sensitive; public hospitals must not refuse care.',
    'Bharatiya Nagarik Suraksha Sanhita 2023',
  ),
};

const oneStopCentre: OutcomeCard = {
  tag: 'Support in one place',
  title: 'One Stop Centre (Sakhi)',
  Icon: IconHelp,
  action: 'Find the nearest',
  desc: 'Free medical, legal, police and counselling help under one roof. Often the right first stop. No FIR needed to walk in.',
  law: null,
};

const legalAid: OutcomeCard = {
  tag: 'Free legal help',
  title: 'Free legal aid',
  Icon: IconRights,
  action: 'Check eligibility',
  desc: 'A lawyer at no cost, through the District Legal Services Authority — every woman is entitled, regardless of income.',
  law: bns(
    'LSA Act §12(c)',
    'Legal Services Authorities Act, 1987',
    'Every woman is entitled to free legal services regardless of income.',
    'Legal Services Authorities Act 1987',
  ),
};

const preserveEvidence: OutcomeCard = {
  tag: 'Protect your case',
  title: 'Preserve the evidence first',
  Icon: IconCam,
  action: 'How to save proof',
  desc: "Don't delete anything. Screenshot messages, save links, note usernames, dates and witnesses — records make a complaint far stronger.",
  law: bns(
    'BSA §63',
    'Bharatiya Sakshya Adhiniyam, 2023',
    'Electronic records are admissible as evidence. Keeping originals with dates and device details strengthens a complaint.',
    'Bharatiya Sakshya Adhiniyam 2023',
  ),
};

const cyberCell: OutcomeCard = {
  tag: 'Report it',
  title: 'Complain to the Cyber Crime cell',
  Icon: IconChat,
  action: 'Start online',
  desc: 'File on the National Cyber Crime Reporting Portal or at your local cyber police station — you can do it online.',
  law: bns(
    'IT Act §66E, §67 · BNS §78',
    'Information Technology Act, 2000 + Bharatiya Nyaya Sanhita, 2023',
    'Capturing/sharing private images and obscene electronic material are offences under the IT Act; online stalking falls under BNS §78. They can be pursued together.',
    'IT Act 2000; Bharatiya Nyaya Sanhita 2023',
  ),
};

const counsellor: OutcomeCard = {
  tag: 'No pressure',
  title: 'Talk it through with a counsellor',
  Icon: IconChat,
  action: 'Talk to someone',
  desc: 'A Sakhi counsellor can help you think, with no report and no next step required.',
  law: null,
};

/* --------------------------------- per-scenario outcomes ------------------ */

export const OUTCOMES: Record<Scenario, OutcomeCard[]> = {
  rape: [
    zeroFir,
    medicalExam,
    {
      tag: 'The offence',
      title: 'Rape is a serious criminal offence',
      Icon: IconRights,
      action: 'What the law says',
      desc: 'You do not have to decide about a trial now — but you have the right to report, to a medical exam, and to legal aid whenever you are ready.',
      law: bns(
        'BNS §63–§64 (and §70 gang rape)',
        'Bharatiya Nyaya Sanhita, 2023',
        'Rape is defined in BNS §63 and punished under §64; gang rape under §70. A survivor’s statement should be recorded by a woman officer, with support persons allowed.',
        'Bharatiya Nyaya Sanhita 2023',
      ),
    },
    notDeciding,
  ],
  home: [
    {
      tag: 'Civil remedy',
      title: 'Protection, residence & maintenance orders',
      Icon: IconShield,
      action: 'How to apply',
      desc: 'You can get a protection order, stay in your home, and claim maintenance — without filing a criminal case.',
      law: bns(
        'PWDVA §18 · §19 · §20',
        'Protection of Women from Domestic Violence Act, 2005',
        'Protection (§18), residence (§19) and monetary relief (§20) can be sought through a Protection Officer or Magistrate. No FIR required.',
        'Protection of Women from Domestic Violence Act 2005',
      ),
    },
    oneStopCentre,
    {
      tag: 'If you choose',
      title: 'Criminal complaint for cruelty',
      Icon: IconDoc,
      action: 'What it involves',
      desc: 'Cruelty by a husband or his relatives is a criminal offence you can report when you are ready.',
      law: bns(
        'BNS §85 & §86',
        'Bharatiya Nyaya Sanhita, 2023',
        'Cruelty by a husband or relatives (formerly IPC 498A) is defined under BNS §85 and §86.',
        'Bharatiya Nyaya Sanhita 2023',
      ),
    },
    notDeciding,
  ],
  dowry: [
    {
      tag: 'Report it',
      title: 'Dowry demands are illegal',
      Icon: IconDoc,
      action: 'How to complain',
      desc: 'Giving, taking or demanding dowry is a criminal offence — you can complain to the police or a Dowry Prohibition Officer.',
      law: bns(
        'Dowry Prohibition Act §3–§4',
        'Dowry Prohibition Act, 1961',
        'Demanding dowry is punishable under §4; giving/taking under §3. Complaints can go to the police or a Dowry Prohibition Officer.',
        'Dowry Prohibition Act 1961',
      ),
    },
    {
      tag: 'Civil remedy',
      title: 'Protection & maintenance (DV Act)',
      Icon: IconShield,
      action: 'How to apply',
      desc: 'Dowry harassment is domestic violence — you can seek protection, residence and maintenance orders without a criminal case.',
      law: bns(
        'PWDVA §3, §18–§20',
        'Protection of Women from Domestic Violence Act, 2005',
        'Dowry-related harassment falls within the definition of domestic violence (§3); protection and monetary relief follow under §18–§20.',
        'Protection of Women from Domestic Violence Act 2005',
      ),
    },
    oneStopCentre,
    notDeciding,
  ],
  work: [
    {
      tag: 'Report at work',
      title: 'Complain to the Internal Committee',
      Icon: IconDoc,
      action: 'How to file',
      desc: 'Your workplace must have a committee to hear this confidentially and act within a set time — parallel to, and separate from, any criminal route.',
      law: bns(
        'POSH Act §4 & §9',
        'Sexual Harassment of Women at Workplace Act, 2013 (POSH)',
        'Every workplace with 10+ employees must have an Internal Committee (§4); a complaint can be filed within 3 months, extendable (§9).',
        'Sexual Harassment of Women at Workplace Act 2013',
      ),
    },
    legalAid,
    oneStopCentre,
    notDeciding,
  ],
  stalking: [
    {
      tag: 'Report it',
      title: 'Stalking is a criminal offence',
      Icon: IconDoc,
      action: 'How to report',
      desc: 'Following you, or repeatedly contacting or monitoring you online, is stalking — you can file an FIR (at any station).',
      law: bns(
        'BNS §78',
        'Bharatiya Nyaya Sanhita, 2023',
        'Stalking — including monitoring a woman’s use of the internet or electronic communication — is an offence under BNS §78 (formerly IPC 354D).',
        'Bharatiya Nyaya Sanhita 2023',
      ),
    },
    preserveEvidence,
    legalAid,
    notDeciding,
  ],
  image_abuse: [
    cyberCell,
    preserveEvidence,
    {
      tag: 'Your right',
      title: 'Get the content taken down',
      Icon: IconShield,
      action: 'How takedown works',
      desc: 'Non-consensual private images can be reported for urgent removal; platforms and intermediaries must act on a valid complaint.',
      law: bns(
        'IT Act §66E, §67A · IT Rules 2021',
        'Information Technology Act, 2000 (+ Intermediary Rules 2021)',
        'Capturing/publishing private images (§66E) and sexually explicit material (§67A) are offences; intermediaries must remove such content on notice under the 2021 Rules.',
        'IT Act 2000; IT (Intermediary Guidelines) Rules 2021',
      ),
    },
    notDeciding,
  ],
  street: [
    {
      tag: 'Report it',
      title: 'Street harassment is punishable',
      Icon: IconDoc,
      action: 'What the law covers',
      desc: 'Unwelcome words, gestures, touching, or following in public are offences — you can report them at any police station.',
      law: bns(
        'BNS §75 (sexual harassment) · §79 (insult to modesty)',
        'Bharatiya Nyaya Sanhita, 2023',
        'Sexual harassment (§75, formerly IPC 354A) and word/gesture/act intended to insult modesty (§79, formerly IPC 509) are criminal offences.',
        'Bharatiya Nyaya Sanhita 2023',
      ),
    },
    oneStopCentre,
    legalAid,
    notDeciding,
  ],
  acid: [
    zeroFir,
    {
      tag: 'Your right',
      title: 'Free treatment & victim compensation',
      Icon: IconShield,
      action: 'What you can claim',
      desc: 'Hospitals (public and private) must provide free treatment to acid-attack survivors, and you can claim compensation under the victim compensation scheme.',
      law: bns(
        'BNS §124(1)–(2)',
        'Bharatiya Nyaya Sanhita, 2023',
        'Acid attack (§124(1)) and attempt (§124(2)) are grave offences (formerly IPC 326A/326B). Free treatment and victim compensation are directed by law and Supreme Court guidelines.',
        'Bharatiya Nyaya Sanhita 2023',
      ),
    },
    legalAid,
    notDeciding,
  ],
  kidnapping: [
    {
      tag: 'Urgent',
      title: 'Call 112 and file a Zero FIR',
      Icon: IconDoc,
      action: 'How it works',
      desc: 'For an ongoing abduction, call 112 now. Kidnapping and abduction are serious offences — an FIR can be filed at any police station.',
      law: bns(
        'BNS §137 · §87',
        'Bharatiya Nyaya Sanhita, 2023',
        'Kidnapping is dealt with under BNS §137; abduction/kidnapping to compel marriage or for illicit intercourse under §87 (formerly IPC 366).',
        'Bharatiya Nyaya Sanhita 2023',
      ),
    },
    oneStopCentre,
    legalAid,
    notDeciding,
  ],
  trafficking: [
    {
      tag: 'Get to safety',
      title: 'Rescue & report — you are the victim, not the offender',
      Icon: IconShield,
      action: 'How to get help',
      desc: 'Call 112 or the Women Helpline (181). Anti-Human-Trafficking Units, One Stop Centres and NGOs can help with rescue, shelter and rehabilitation.',
      law: bns(
        'BNS §143 · Immoral Traffic (Prevention) Act, 1956',
        'Bharatiya Nyaya Sanhita, 2023 + ITPA 1956',
        'Trafficking of persons is an offence under BNS §143 (formerly IPC 370); the ITPA 1956 governs commercial sexual exploitation. The trafficked person is a victim, entitled to protection.',
        'Bharatiya Nyaya Sanhita 2023; Immoral Traffic (Prevention) Act 1956',
      ),
    },
    oneStopCentre,
    legalAid,
    notDeciding,
  ],
  pocso: [
    {
      tag: 'Report now',
      title: 'Report — reporting child abuse is mandatory',
      Icon: IconDoc,
      action: 'How to report',
      desc: 'Call Childline 1098 or the police. Under POCSO, anyone who knows of child sexual abuse is legally required to report it; the child’s identity is protected.',
      law: bns(
        'POCSO Act §19 (+ special courts)',
        'Protection of Children from Sexual Offences Act, 2012',
        'POCSO §19 makes reporting of child sexual offences mandatory; cases are tried in Special Courts with child-friendly procedures.',
        'Protection of Children from Sexual Offences Act 2012',
      ),
    },
    medicalExam,
    oneStopCentre,
    notDeciding,
  ],
  unsure: [
    counsellor,
    {
      tag: 'Learn',
      title: 'Understand your rights first',
      Icon: IconRights,
      action: 'Read the guides',
      desc: 'Plain-language guides to what the law offers — so you decide from a place of knowing.',
      law: bns(
        'LSA Act §12(c)',
        'Legal Services Authorities Act, 1987',
        'Free legal advice is your right, even just to understand your options.',
        'Legal Services Authorities Act 1987',
      ),
    },
    oneStopCentre,
    notDeciding,
  ],
};
