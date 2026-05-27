/**
 * Unit tests for server/sitefinder.ts
 * Tests: filter correctness, friction clamped 0..1, ranking,
 * Australia → empty sites + ban cited, footprint/water hard-fails.
 */
import { describe, it, expect } from 'vitest';
import { screenSites, buildAnalysisResult } from './sitefinder';
import type { ReactorModel, CandidateSite, CountryCorpus, RegionData } from '../src/types';

// ─── Minimal corpus fixtures ─────────────────────────────────────────────────

const USA_CORPUS: CountryCorpus = {
  code: 'USA',
  name: 'United States',
  regulator: 'U.S. NRC',
  sources: [
    {
      id: 'us-nrc-10cfr100',
      title: 'Reactor Site Criteria',
      citation: '10 CFR Part 100',
      year: 2024,
      url: 'https://www.ecfr.gov/current/title-10/chapter-I/part-100',
      text: 'Site criteria.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'us-nrc-100-21',
      title: 'Non-seismic siting criteria',
      citation: '10 CFR 100.21',
      year: 2024,
      url: 'https://www.ecfr.gov/',
      text: 'LPZ.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'us-nepa',
      title: 'NEPA',
      citation: '42 U.S.C. §4321',
      year: 1969,
      url: 'https://uscode.house.gov/',
      text: 'EIS required.',
      type: 'human-review',
      confidence: 'high',
    },
    {
      id: 'us-cwa-316b',
      title: 'CWA §316(b)',
      citation: '33 U.S.C. §1326(b)',
      year: 1972,
      url: 'https://www.epa.gov/',
      text: 'Cooling water intake.',
      type: 'human-review',
      confidence: 'high',
    },
  ],
};

const WY_REGION: RegionData = {
  country: 'USA',
  regionId: 'US-WY',
  regionName: 'Wyoming',
  hasRichData: true,
  facts: [
    { id: 'wy-land-coal-repower', category: 'land', label: 'Coal repower', value: 'Yes', detail: '', confidence: 'high' },
    { id: 'wy-grid-baseload', category: 'grid', label: 'Grid', value: 'Good', detail: '', confidence: 'high' },
    { id: 'wy-water-arid', category: 'water', label: 'Water', value: 'Semi-arid', detail: '', citationId: 'us-cwa-316b', confidence: 'medium' },
    { id: 'wy-population', category: 'population', label: 'Pop', value: 'Low', detail: '', citationId: 'us-nrc-100-21', confidence: 'high' },
    { id: 'wy-hazard-seismic', category: 'hazard', label: 'Seismic', value: 'Low', detail: '', citationId: 'us-nrc-10cfr100', confidence: 'medium' },
    { id: 'wy-pathway', category: 'pathway', label: 'Pathway', value: 'Coal repower', detail: '', confidence: 'high' },
  ],
};

const USA_CONTEXT = { country: USA_CORPUS, region: WY_REGION };

// Australia corpus with ban
const AUS_CORPUS: CountryCorpus = {
  code: 'AUS',
  name: 'Australia',
  regulator: 'ARPANSA',
  sources: [
    {
      id: 'au-epbc-140a',
      title: 'EPBC s.140A',
      citation: 'EPBC Act 1999 s.140A',
      year: 1999,
      url: 'https://www5.austlii.edu.au/',
      text: 'Nuclear power plant prohibited.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'au-arpans-10',
      title: 'ARPANS s.10',
      citation: 'ARPANS Act 1998 s.10',
      year: 1998,
      url: 'http://www.austlii.edu.au/',
      text: 'No licence for nuclear power plant.',
      type: 'computable',
      confidence: 'high',
    },
  ],
};

const SA_REGION: RegionData = {
  country: 'AUS',
  regionId: 'AU-SA',
  regionName: 'South Australia',
  hasRichData: true,
  facts: [
    { id: 'sa-land-arid', category: 'land', label: 'Land', value: 'Arid', detail: '', confidence: 'high' },
    { id: 'sa-pathway-ban', category: 'pathway', label: 'Ban', value: 'Nuclear banned', detail: '', citationId: 'au-epbc-140a', confidence: 'high' },
  ],
};

const AUS_CONTEXT = { country: AUS_CORPUS, region: SA_REGION };

// ─── Reactor fixtures ─────────────────────────────────────────────────────────

const BWRX: ReactorModel = {
  id: 'ge-bwrx-300',
  company: 'GE Vernova Hitachi',
  companyUrl: 'https://www.gevernova.com/',
  model: 'BWRX-300',
  type: 'SMR',
  technology: 'BWR',
  outputMW: 300,
  footprintHectares: 4,
  coolingOptions: ['once-through', 'tower'],
  waterNeeds: 'Conventional cooling tower or once-through',
  status: 'Pre-application',
  citation: { id: 'cite-bwrx', title: 'BWRX', citation: 'GE doc', year: 2024, url: 'https://gevernova.com/' },
};

const HTGR_REACTOR: ReactorModel = {
  id: 'xenergy-xe100',
  company: 'X-energy',
  companyUrl: 'https://x-energy.com/',
  model: 'Xe-100',
  type: 'SMR',
  technology: 'HTGR',
  outputMW: 80,
  footprintHectares: 13,
  coolingOptions: ['dry'],
  waterNeeds: 'Minimal — helium-cooled; dry cooling capable',
  status: 'Pre-application',
  citation: { id: 'cite-xe100', title: 'Xe-100', citation: 'X-energy doc', year: 2024, url: 'https://x-energy.com/' },
};

const LARGE_PWR: ReactorModel = {
  id: 'westinghouse-ap1000',
  company: 'Westinghouse',
  companyUrl: 'https://westinghousenuclear.com/',
  model: 'AP1000',
  type: 'large',
  technology: 'PWR',
  outputMW: 1110,
  footprintHectares: 6,
  coolingOptions: ['once-through', 'tower'],
  waterNeeds: 'High-volume conventional PWR cooling',
  status: 'NRC Design Certified',
  citation: { id: 'cite-ap1000', title: 'AP1000', citation: 'WEC doc', year: 2024, url: 'https://westinghousenuclear.com/' },
};

// ─── Candidate site fixtures ──────────────────────────────────────────────────

const COAL_SITE: CandidateSite = {
  id: 'us-wy-test-coal',
  country: 'USA',
  regionId: 'US-WY',
  name: 'Test Coal Plant (Wyoming)',
  kind: 'named',
  lat: 41.76,
  lng: -110.6,
  attributes: {
    availableFootprintHectares: 200,
    coolingSource: 'Hams Fork River (dry/hybrid)',
    waterAvailability: 'limited',
    gridDistanceKm: 0,
    populationDensity: 'low',
    hazards: ['seismic-low'],
    landStatus: 'retiring coal (brownfield)',
    protectedAreaFlag: false,
  },
  suitableTechnologies: ['BWR', 'SFR', 'iPWR', 'HTGR', 'MSR'],
  citationIds: ['wy-land-coal-repower', 'wy-grid-baseload'],
  confidence: 'high',
};

const GREENFIELD_SITE: CandidateSite = {
  id: 'us-wy-test-greenfield',
  country: 'USA',
  regionId: 'US-WY',
  name: 'Test Greenfield Zone (Wyoming BLM)',
  kind: 'greenfield',
  lat: 41.79,
  lng: -107.8,
  attributes: {
    availableFootprintHectares: 1000,
    coolingSource: 'dry/air-cooled only',
    waterAvailability: 'none',
    gridDistanceKm: 5,
    populationDensity: 'low',
    hazards: ['seismic-low'],
    landStatus: 'BLM federal land',
    protectedAreaFlag: false,
  },
  suitableTechnologies: ['HTGR', 'microreactor', 'SFR'],
  citationIds: ['wy-water-arid'],
  confidence: 'medium',
};

const PROTECTED_SITE: CandidateSite = {
  id: 'us-wy-test-protected',
  country: 'USA',
  regionId: 'US-WY',
  name: 'Test Protected Area Site',
  kind: 'greenfield',
  lat: 43.0,
  lng: -109.0,
  attributes: {
    availableFootprintHectares: 500,
    coolingSource: 'river',
    waterAvailability: 'abundant',
    gridDistanceKm: 10,
    populationDensity: 'low',
    hazards: [],
    landStatus: 'national park',
    protectedAreaFlag: true,
  },
  suitableTechnologies: ['BWR', 'HTGR', 'SFR'],
  citationIds: [],
  confidence: 'medium',
};

// Site with tiny footprint — fails footprint hard constraint for large reactor
const TINY_FOOTPRINT_SITE: CandidateSite = {
  id: 'us-wy-test-tiny',
  country: 'USA',
  regionId: 'US-WY',
  name: 'Test Tiny Footprint Site',
  kind: 'named',
  lat: 42.0,
  lng: -106.0,
  attributes: {
    availableFootprintHectares: 2, // < 4 ha needed by BWRX-300
    coolingSource: 'river',
    waterAvailability: 'abundant',
    gridDistanceKm: 0,
    populationDensity: 'low',
    hazards: [],
    landStatus: 'retiring coal (brownfield)',
    protectedAreaFlag: false,
  },
  suitableTechnologies: ['BWR', 'SFR', 'iPWR'],
  citationIds: [],
  confidence: 'medium',
};

// Australia candidate (physically fine but legally banned)
const AU_SITE: CandidateSite = {
  id: 'au-sa-test-site',
  country: 'AUS',
  regionId: 'AU-SA',
  name: 'Test AU-SA Site (Port Augusta)',
  kind: 'named',
  lat: -32.5,
  lng: 137.76,
  attributes: {
    availableFootprintHectares: 200,
    coolingSource: 'Spencer Gulf seawater',
    waterAvailability: 'abundant',
    gridDistanceKm: 0,
    populationDensity: 'low',
    hazards: ['seismic-low'],
    landStatus: 'retired coal (brownfield)',
    protectedAreaFlag: false,
  },
  suitableTechnologies: ['BWR', 'iPWR', 'SFR', 'HTGR', 'PWR'],
  citationIds: ['au-epbc-140a', 'au-arpans-10'],
  confidence: 'medium',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('screenSites — filter correctness', () => {
  it('returns only sites whose suitableTechnologies includes the reactor technology', () => {
    // LARGE_PWR.technology = 'PWR'; COAL_SITE supports BWR/SFR/iPWR/HTGR/MSR but NOT PWR
    // GREENFIELD_SITE supports HTGR/microreactor/SFR but NOT PWR
    const results = screenSites(LARGE_PWR, 'greenfield', [COAL_SITE, GREENFIELD_SITE], USA_CONTEXT);
    const ids = results.map((r) => r.siteId);
    expect(ids).not.toContain('us-wy-test-coal');
    expect(ids).not.toContain('us-wy-test-greenfield');
  });

  it('coal-repower pathway only keeps named brownfield/coal sites', () => {
    const results = screenSites(BWRX, 'coal-repower', [COAL_SITE, GREENFIELD_SITE], USA_CONTEXT);
    const ids = results.map((r) => r.siteId);
    expect(ids).toContain('us-wy-test-coal');
    expect(ids).not.toContain('us-wy-test-greenfield'); // greenfield kind, also no BWR tech
  });

  it('greenfield pathway includes all matching technology sites regardless of kind', () => {
    const results = screenSites(BWRX, 'greenfield', [COAL_SITE, GREENFIELD_SITE], USA_CONTEXT);
    // COAL_SITE supports BWR; GREENFIELD_SITE does NOT support BWR → only COAL_SITE passes tech filter
    const ids = results.map((r) => r.siteId);
    expect(ids).toContain('us-wy-test-coal');
  });
});

describe('screenSites — friction scores clamped 0..1', () => {
  it('all friction scores are between 0 and 1 inclusive', () => {
    const results = screenSites(BWRX, 'coal-repower', [COAL_SITE], USA_CONTEXT);
    expect(results.length).toBe(1);
    const scores = Object.values(results[0].frictionScores);
    for (const score of scores) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it('all friction scores are between 0 and 1 for greenfield site', () => {
    const results = screenSites(HTGR_REACTOR, 'greenfield', [GREENFIELD_SITE], USA_CONTEXT);
    expect(results.length).toBe(1);
    const scores = Object.values(results[0].frictionScores);
    for (const score of scores) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });
});

describe('screenSites — ranking', () => {
  it('ranks sites ascending by aggregate friction (rank 1 = best)', () => {
    // COAL_SITE has grid=0, GREENFIELD_SITE has grid=5km (non-zero)
    // For BWR+greenfield pathway: only COAL_SITE passes tech filter (no BWR in GREENFIELD suitableTechnologies)
    // Use two coal sites with different grid distances to test ranking
    const nearSite: CandidateSite = {
      ...COAL_SITE,
      id: 'near',
      attributes: { ...COAL_SITE.attributes, gridDistanceKm: 0 },
    };
    const farSite: CandidateSite = {
      ...COAL_SITE,
      id: 'far',
      attributes: { ...COAL_SITE.attributes, gridDistanceKm: 30 },
    };
    const results = screenSites(BWRX, 'coal-repower', [farSite, nearSite], USA_CONTEXT);
    expect(results[0].rank).toBe(1);
    expect(results[0].siteId).toBe('near');
    expect(results[1].rank).toBe(2);
    expect(results[1].siteId).toBe('far');
  });

  it('assigns sequential ranks starting at 1', () => {
    const siteA: CandidateSite = { ...COAL_SITE, id: 'a' };
    const siteB: CandidateSite = { ...COAL_SITE, id: 'b' };
    const siteC: CandidateSite = { ...COAL_SITE, id: 'c' };
    const results = screenSites(BWRX, 'coal-repower', [siteA, siteB, siteC], USA_CONTEXT);
    const ranks = results.map((r) => r.rank).sort((a, b) => a - b);
    expect(ranks).toEqual([1, 2, 3]);
  });
});

describe('screenSites — Australia ban → empty sites[]', () => {
  it('returns empty array for AU-SA regardless of candidate quality', () => {
    const results = screenSites(BWRX, 'greenfield', [AU_SITE], AUS_CONTEXT);
    expect(results).toHaveLength(0);
  });

  it('returns empty array even when multiple physically fine candidates exist', () => {
    const site2: CandidateSite = { ...AU_SITE, id: 'au-sa-site-2' };
    const results = screenSites(BWRX, 'greenfield', [AU_SITE, site2], AUS_CONTEXT);
    expect(results).toHaveLength(0);
  });
});

describe('screenSites — footprint hard-fail', () => {
  it('marks site as fail when footprint is smaller than reactor requirement', () => {
    // BWRX needs 4 ha; TINY_FOOTPRINT_SITE has 2 ha
    const results = screenSites(BWRX, 'coal-repower', [TINY_FOOTPRINT_SITE], USA_CONTEXT);
    expect(results.length).toBe(1);
    expect(results[0].verdict).toBe('fail');
    expect(results[0].frictionScores.logistics).toBe(1);
  });
});

describe('screenSites — cooling water hard-fail', () => {
  it('marks BWR site as fail when waterAvailability is none', () => {
    const dryOnlySite: CandidateSite = {
      ...COAL_SITE,
      id: 'dry-coal',
      attributes: { ...COAL_SITE.attributes, waterAvailability: 'none' },
    };
    const results = screenSites(BWRX, 'coal-repower', [dryOnlySite], USA_CONTEXT);
    expect(results.length).toBe(1);
    expect(results[0].verdict).toBe('fail');
    expect(results[0].frictionScores.cooling).toBe(1);
  });

  it('HTGR (dry-cooled) passes even when waterAvailability is none', () => {
    // GREENFIELD_SITE has waterAvailability:'none' and supports HTGR
    const results = screenSites(HTGR_REACTOR, 'greenfield', [GREENFIELD_SITE], USA_CONTEXT);
    expect(results.length).toBe(1);
    expect(results[0].verdict).not.toBe('fail');
    expect(results[0].frictionScores.cooling).toBeLessThan(1);
  });
});

describe('screenSites — protected area hard-fail', () => {
  it('marks site as fail when protectedAreaFlag is true', () => {
    // PROTECTED_SITE supports BWR tech
    const results = screenSites(BWRX, 'greenfield', [PROTECTED_SITE], USA_CONTEXT);
    expect(results.length).toBe(1);
    expect(results[0].verdict).toBe('fail');
    expect(results[0].frictionScores.permits).toBe(1);
  });
});

describe('screenSites — MatrixRow dataBasis field', () => {
  it('all MatrixRow entries have a dataBasis field', () => {
    const results = screenSites(BWRX, 'coal-repower', [COAL_SITE], USA_CONTEXT);
    expect(results.length).toBeGreaterThan(0);
    for (const site of results) {
      for (const row of site.matrix) {
        expect(['computable', 'requires-field-study']).toContain(row.dataBasis);
      }
    }
  });
});

describe('buildAnalysisResult — Australia ban in regionSummary and notes', () => {
  it('includes ban citation ids in regionSummary for Australia', () => {
    const result = buildAnalysisResult(
      'AUS', 'AU-SA', BWRX, 'greenfield', [], AUS_CONTEXT, true, ['au-epbc-140a', 'au-arpans-10'],
    );
    expect(result.sites).toHaveLength(0);
    expect(result.regionSummary).toContain('au-epbc-140a');
    expect(result.regionSummary).toContain('au-arpans-10');
    expect(result.notes).toContain('au-epbc-140a');
  });

  it('notes clarify ban is a legal constraint, not physical', () => {
    const result = buildAnalysisResult(
      'AUS', 'AU-SA', BWRX, 'greenfield', [], AUS_CONTEXT, true, ['au-epbc-140a'],
    );
    expect(result.notes).toContain('legal constraint');
    // Notes must say it is NOT a physical fail (ban is legal, not physical)
    expect(result.notes.toLowerCase()).toContain('not a physical');
  });
});
