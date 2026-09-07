import { describe, it, expect } from 'vitest';
import { loadCorpus, CorpusNotFoundError } from './corpus';
import { listFlagshipRegions } from '../src/data/index';
import type { FactCategory } from '../src/types';

const CATEGORIES: FactCategory[] = ['land', 'grid', 'water', 'hazard', 'population', 'pathway'];

describe('loadCorpus integration across all flagship regions', () => {
  it.each(listFlagshipRegions().map((r) => [r.regionName, r] as const))(
    'returns well-formed CountryCorpus + RegionData for %s',
    (_name, r) => {
      const { country, region } = loadCorpus(r.country, r.regionId);

      // CountryCorpus well-formed
      expect(country.code).toBe(r.country);
      expect(country.name.length).toBeGreaterThan(0);
      expect(country.regulator.length).toBeGreaterThan(0);
      expect(country.sources.length).toBeGreaterThan(0);

      // RegionData well-formed + rich
      expect(region.regionId).toBe(r.regionId);
      expect(region.hasRichData).toBe(true);
      const cats = new Set(region.facts.map((f) => f.category));
      for (const cat of CATEGORIES) expect(cats.has(cat)).toBe(true);

      // every fact citationId, when present, resolves into the country corpus
      const sourceIds = new Set(country.sources.map((s) => s.id));
      for (const f of region.facts) {
        if (f.citationId) {
          expect(
            sourceIds.has(f.citationId),
            `${r.regionName}/${f.id} dangling citationId ${f.citationId}`,
          ).toBe(true);
        }
      }
    },
  );

  it('Australia flagship regions surface the statutory ban end-to-end', () => {
    for (const regionId of ['AU-SA', 'AU-NT']) {
      const { country, region } = loadCorpus('AUS', regionId);
      expect(country.sources.some((s) => s.id === 'au-epbc-140a')).toBe(true);
      expect(region.facts.some((f) => f.citationId === 'au-epbc-140a')).toBe(true);
    }
  });

  it('throws CorpusNotFoundError for a known non-flagship region (US-CA)', () => {
    expect(() => loadCorpus('USA', 'US-CA')).toThrow(CorpusNotFoundError);
  });
});
