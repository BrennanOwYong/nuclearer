import { describe, it, expect } from 'vitest';
import { loadCorpus, CorpusNotFoundError } from './corpus';

describe('loadCorpus', () => {
  it('returns matched country + region for a flagship region', () => {
    const { country, region } = loadCorpus('USA', 'US-WY');
    expect(country.code).toBe('USA');
    expect(country.regulator).toBe('U.S. NRC');
    expect(region.regionId).toBe('US-WY');
    expect(region.hasRichData).toBe(true);
  });

  it('returns Australia ban corpus for AU-SA', () => {
    const { country, region } = loadCorpus('AUS', 'AU-SA');
    expect(country.sources.some((s) => s.id === 'au-epbc-140a')).toBe(true);
    expect(region.facts.some((f) => f.citationId === 'au-epbc-140a')).toBe(true);
  });

  it('throws CorpusNotFoundError for a known non-flagship region', () => {
    expect(() => loadCorpus('USA', 'US-CA')).toThrow(CorpusNotFoundError);
  });

  it('throws CorpusNotFoundError for an unknown country', () => {
    expect(() => loadCorpus('XXX', 'X-01')).toThrow(CorpusNotFoundError);
  });

  it('error carries the requested country and regionId', () => {
    try {
      loadCorpus('AUS', 'AU-VIC');
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(CorpusNotFoundError);
      const err = e as CorpusNotFoundError;
      expect(err.country).toBe('AUS');
      expect(err.regionId).toBe('AU-VIC');
      expect(err.name).toBe('CorpusNotFoundError');
    }
  });
});
