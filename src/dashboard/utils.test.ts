import { describe, it, expect } from 'vitest';
import {
  groupFactsByCategory,
  groupReactorsByTech,
  resolveCitation,
  frictionBarWidth,
  regionHasBan,
} from './utils';
import type { RegionFact, CountryCorpus, RegionData, ReactorModel } from '../types';

// ── frictionBarWidth ─────────────────────────────────────────────────────────

describe('frictionBarWidth', () => {
  it('converts 0 to "0%"', () => expect(frictionBarWidth(0)).toBe('0%'));
  it('converts 1 to "100%"', () => expect(frictionBarWidth(1)).toBe('100%'));
  it('rounds mid-values', () => expect(frictionBarWidth(0.735)).toBe('74%'));
  it('clamps above 1 to "100%"', () => expect(frictionBarWidth(1.5)).toBe('100%'));
  it('clamps below 0 to "0%"', () => expect(frictionBarWidth(-0.1)).toBe('0%'));
  it('handles 0.5 → "50%"', () => expect(frictionBarWidth(0.5)).toBe('50%'));
});

// ── groupFactsByCategory ─────────────────────────────────────────────────────

const SAMPLE_FACTS: RegionFact[] = [
  { id: 'f1', category: 'land', label: 'Land', value: 'good', detail: '', confidence: 'high' },
  { id: 'f2', category: 'grid', label: 'Grid', value: 'ok', detail: '', confidence: 'medium' },
  { id: 'f3', category: 'hazard', label: 'Hazard', value: 'low', detail: '', confidence: 'high' },
  { id: 'f4', category: 'pathway', label: 'Pathway', value: 'PROHIBITED — banned', detail: '', confidence: 'high' },
  { id: 'f5', category: 'water', label: 'Water', value: 'limited', detail: '', confidence: 'medium' },
];

describe('groupFactsByCategory', () => {
  it('groups land/grid/water under "Land & Infrastructure"', () => {
    const groups = groupFactsByCategory(SAMPLE_FACTS);
    const li = groups.find((g) => g.groupLabel === 'Land & Infrastructure');
    expect(li).toBeDefined();
    expect(li!.facts.map((f) => f.id)).toContain('f1');
    expect(li!.facts.map((f) => f.id)).toContain('f2');
    expect(li!.facts.map((f) => f.id)).toContain('f5');
  });

  it('groups hazard under "Hazards & Cooling"', () => {
    const groups = groupFactsByCategory(SAMPLE_FACTS);
    const hc = groups.find((g) => g.groupLabel === 'Hazards & Cooling');
    expect(hc).toBeDefined();
    expect(hc!.facts.map((f) => f.id)).toContain('f3');
  });

  it('groups pathway under "Legal-RulePack"', () => {
    const groups = groupFactsByCategory(SAMPLE_FACTS);
    const lr = groups.find((g) => g.groupLabel === 'Legal-RulePack');
    expect(lr).toBeDefined();
    expect(lr!.facts.map((f) => f.id)).toContain('f4');
  });

  it('returns empty array for empty input', () => {
    expect(groupFactsByCategory([])).toEqual([]);
  });
});

// ── resolveCitation ──────────────────────────────────────────────────────────

const MOCK_CORPUS: CountryCorpus = {
  code: 'AUS',
  name: 'Australia',
  regulator: 'ARPANSA',
  sources: [
    {
      id: 'au-epbc-140a',
      title: 'EPBC s.140A',
      citation: 'EPBC Act 1999 s.140A',
      year: 1999,
      url: 'https://example.com/epbc',
      text: 'Prohibits nuclear power plant approval.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'au-arpans-10',
      title: 'ARPANS s.10',
      citation: 'ARPANS Act 1998 s.10',
      year: 1998,
      url: 'https://example.com/arpans',
      text: 'Bars ARPANSA from issuing nuclear plant licences.',
      type: 'computable',
      confidence: 'high',
    },
  ],
};

describe('resolveCitation', () => {
  it('resolves a known id', () => {
    const result = resolveCitation('au-epbc-140a', MOCK_CORPUS);
    expect(result?.id).toBe('au-epbc-140a');
    expect(result?.url).toBe('https://example.com/epbc');
  });

  it('returns undefined for unknown id', () => {
    expect(resolveCitation('not-real', MOCK_CORPUS)).toBeUndefined();
  });

  it('returns undefined when corpus is undefined', () => {
    expect(resolveCitation('au-epbc-140a', undefined)).toBeUndefined();
  });

  it('checks extra sources list if not in corpus', () => {
    const extra = [
      {
        id: 'extra-src',
        title: 'Extra',
        citation: 'Extra cite',
        year: 2020,
        url: 'https://extra.com',
        text: 'Extra text',
        type: 'human-review' as const,
        confidence: 'low' as const,
      },
    ];
    const result = resolveCitation('extra-src', MOCK_CORPUS, extra);
    expect(result?.id).toBe('extra-src');
  });
});

// ── groupReactorsByTech ──────────────────────────────────────────────────────

const MOCK_REACTORS: ReactorModel[] = [
  {
    id: 'r1',
    company: 'Westinghouse',
    companyUrl: 'https://wec.com',
    model: 'AP1000',
    type: 'large',
    technology: 'PWR',
    outputMW: 1110,
    footprintHectares: 6,
    coolingOptions: ['tower'],
    waterNeeds: 'high',
    status: 'operating',
    citation: { id: 'c1', title: 'T', citation: 'C', year: 2024, url: 'https://x.com' },
  },
  {
    id: 'r2',
    company: 'GE Hitachi',
    companyUrl: 'https://geh.com',
    model: 'BWRX-300',
    type: 'SMR',
    technology: 'BWR',
    outputMW: 300,
    footprintHectares: 4,
    coolingOptions: ['tower'],
    waterNeeds: 'moderate',
    status: 'NRC review',
    citation: { id: 'c2', title: 'T', citation: 'C', year: 2024, url: 'https://x.com' },
  },
  {
    id: 'r3',
    company: 'Westinghouse',
    companyUrl: 'https://wec.com',
    model: 'eVinci',
    type: 'micro',
    technology: 'microreactor',
    outputMW: 5,
    footprintHectares: 0.8,
    coolingOptions: ['dry'],
    waterNeeds: 'none',
    status: 'development',
    citation: { id: 'c3', title: 'T', citation: 'C', year: 2024, url: 'https://x.com' },
  },
];

describe('groupReactorsByTech', () => {
  it('returns one group per distinct technology', () => {
    const groups = groupReactorsByTech(MOCK_REACTORS);
    const techs = groups.map((g) => g.technology);
    expect(techs).toContain('PWR');
    expect(techs).toContain('BWR');
    expect(techs).toContain('microreactor');
    expect(groups.length).toBe(3);
  });

  it('nests companies inside each tech group', () => {
    const groups = groupReactorsByTech(MOCK_REACTORS);
    const pwr = groups.find((g) => g.technology === 'PWR')!;
    expect(pwr.companies.length).toBe(1);
    expect(pwr.companies[0].company).toBe('Westinghouse');
    expect(pwr.companies[0].models.length).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(groupReactorsByTech([])).toEqual([]);
  });
});

// ── regionHasBan ─────────────────────────────────────────────────────────────

describe('regionHasBan', () => {
  it('returns true when pathway fact has PROHIBITED in value', () => {
    const region: RegionData = {
      country: 'AUS',
      regionId: 'AU-SA',
      regionName: 'South Australia',
      hasRichData: true,
      facts: [
        {
          id: 'sa-pathway',
          category: 'pathway',
          label: 'Statutory feasibility',
          value: 'PROHIBITED — nuclear power plant construction/licensing banned',
          detail: '',
          confidence: 'high',
        },
      ],
    };
    expect(regionHasBan(region)).toBe(true);
  });

  it('returns false for regions without a ban', () => {
    const region: RegionData = {
      country: 'USA',
      regionId: 'US-WY',
      regionName: 'Wyoming',
      hasRichData: true,
      facts: [
        {
          id: 'wy-pathway',
          category: 'pathway',
          label: 'Best-fit pathway',
          value: 'Coal-repower (brownfield) — strong momentum',
          detail: '',
          confidence: 'high',
        },
      ],
    };
    expect(regionHasBan(region)).toBe(false);
  });

  it('returns false when region is undefined', () => {
    expect(regionHasBan(undefined)).toBe(false);
  });
});
