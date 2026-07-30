/**
 * National helpline directory. Numbers are India-wide short codes / official
 * lines. Each carries a last_verified date; where a number could not be
 * confidently verified, lastVerified is null and the UI flags it for re-check
 * before launch (never presented as verified).
 *
 * Structured data (English now) so hi/kn can be translated later.
 */
export type HelpCategory =
  | 'emergency'
  | 'domestic_violence'
  | 'women'
  | 'cyber'
  | 'senior'
  | 'child'
  | 'mental_health'
  | 'legal_aid';

export interface Helpline {
  id: string;
  name: string;
  number: string;
  categories: HelpCategory[];
  whatFor: string;
  /** ISO date, or null if it could not be confidently verified (flagged). */
  lastVerified: string | null;
}

export const CATEGORY_LABELS: Record<HelpCategory, string> = {
  emergency: 'Emergency',
  domestic_violence: 'Domestic violence',
  women: "Women's helpline",
  cyber: 'Cyber crime',
  senior: 'Senior citizens',
  child: 'Children',
  mental_health: 'Mental health',
  legal_aid: 'Legal aid',
};

const V = '2026-07-26';

export const HELPLINES: Helpline[] = [
  {
    id: 'emergency-112',
    name: 'Emergency Response Support System',
    number: '112',
    categories: ['emergency'],
    whatFor: 'One number for any emergency - police, fire, ambulance - across India.',
    lastVerified: V,
  },
  {
    id: 'police-100',
    name: 'Police',
    number: '100',
    categories: ['emergency'],
    whatFor: 'Direct police line, if you cannot reach 112.',
    lastVerified: V,
  },
  {
    id: 'women-181',
    name: 'Women Helpline (181)',
    number: '181',
    categories: ['women', 'domestic_violence'],
    whatFor: 'Women in distress, including domestic violence - support, referrals and rescue.',
    lastVerified: V,
  },
  {
    id: 'ncw',
    name: 'National Commission for Women',
    number: '7827170170',
    categories: ['women', 'domestic_violence'],
    whatFor: 'Complaints and guidance on crimes and discrimination against women.',
    lastVerified: null, // exact current number to be re-confirmed before launch
  },
  {
    id: 'cyber-1930',
    name: 'Cyber Crime Helpline',
    number: '1930',
    categories: ['cyber'],
    whatFor: 'Report online financial fraud and cyber crime, including image-based abuse.',
    lastVerified: V,
  },
  {
    id: 'child-1098',
    name: 'Childline',
    number: '1098',
    categories: ['child'],
    whatFor: 'Children in need of care and protection - 24x7.',
    lastVerified: V,
  },
  {
    id: 'senior-14567',
    name: 'Elderline',
    number: '14567',
    categories: ['senior'],
    whatFor: 'Senior citizens - emotional support, abuse, and access to services.',
    lastVerified: V,
  },
  {
    id: 'telemanas-14416',
    name: 'Tele-MANAS',
    number: '14416',
    categories: ['mental_health'],
    whatFor: 'Free 24x7 mental-health support in multiple languages.',
    lastVerified: V,
  },
  {
    id: 'kiran',
    name: 'KIRAN Mental Health Helpline',
    number: '1800-599-0019',
    categories: ['mental_health'],
    whatFor: 'Mental-health support, distress and crisis - toll-free, 24x7.',
    lastVerified: V,
  },
  {
    id: 'nalsa-15100',
    name: 'NALSA Legal Aid',
    number: '15100',
    categories: ['legal_aid'],
    whatFor: 'Free legal aid and advice through Legal Services Authorities.',
    lastVerified: V,
  },
];
