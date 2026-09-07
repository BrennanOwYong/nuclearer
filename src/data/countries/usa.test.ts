import { describe, it, expect } from 'vitest';
import { usaCorpus } from './usa';
import type { CountryCorpus, SourceSnippet } from '../../types';

describe('usaCorpus', () => {
  it('has correct country identity', () => {
    const c: CountryCorpus = usaCorpus;
    expect(c.code).toBe('USA');
    expect(c.name).toBe('United States');
    expect(c.regulator).toBe('U.S. NRC');
    expect(c.sources.length).toBeGreaterThanOrEqual(3);
  });

  it('every source snippet is well-formed and really cited', () => {
    for (const s of usaCorpus.sources as SourceSnippet[]) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.citation.length).toBeGreaterThan(0);
      expect(s.year).toBeGreaterThan(1900);
      expect(s.year).toBeLessThanOrEqual(new Date().getFullYear());
      expect(s.url).toMatch(/^https?:\/\/.+/);
      expect(s.text.length).toBeGreaterThan(0);
      expect(['computable', 'human-review']).toContain(s.type);
      expect(['high', 'medium', 'low']).toContain(s.confidence);
    }
  });

  it('includes the NRC reactor site criteria snippet', () => {
    const nrc = usaCorpus.sources.find((s) => s.id === 'us-nrc-10cfr100');
    expect(nrc).toBeDefined();
    expect(nrc!.citation).toContain('10 CFR Part 100');
    expect(nrc!.url).toContain('ecfr.gov');
  });

  it('includes NEPA and CWA snippets', () => {
    const nepa = usaCorpus.sources.find((s) => s.id === 'us-nepa');
    expect(nepa).toBeDefined();
    expect(nepa!.type).toBe('human-review');

    const cwa = usaCorpus.sources.find((s) => s.id === 'us-cwa-316b');
    expect(cwa).toBeDefined();
    expect(cwa!.type).toBe('human-review');
  });
});
