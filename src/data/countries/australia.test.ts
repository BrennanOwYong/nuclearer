import { describe, it, expect } from 'vitest';
import { australiaCorpus } from './australia';
import type { CountryCorpus, SourceSnippet } from '../../types';

describe('australiaCorpus', () => {
  it('has correct country identity', () => {
    const c: CountryCorpus = australiaCorpus;
    expect(c.code).toBe('AUS');
    expect(c.name).toBe('Australia');
    expect(c.regulator).toBe('ARPANSA');
    expect(c.sources.length).toBeGreaterThanOrEqual(3);
  });

  it('every source snippet is well-formed and really cited', () => {
    for (const s of australiaCorpus.sources as SourceSnippet[]) {
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
});

describe('australiaCorpus statutory ban', () => {
  it('includes EPBC Act 1999 s.140A as a computable, high-confidence prohibition', () => {
    const epbc = australiaCorpus.sources.find((s) => s.id === 'au-epbc-140a');
    expect(epbc).toBeDefined();
    expect(epbc!.citation).toContain('140A');
    expect(epbc!.year).toBe(1999);
    expect(epbc!.type).toBe('computable');
    expect(epbc!.confidence).toBe('high');
    expect(epbc!.url).toContain('austlii');
    expect(epbc!.text.toLowerCase()).toMatch(/prohibit|must not approve|no approval/);
  });

  it('includes ARPANS Act 1998 s.10 prohibition', () => {
    const arpans = australiaCorpus.sources.find((s) => s.id === 'au-arpans-10');
    expect(arpans).toBeDefined();
    expect(arpans!.citation).toContain('10');
    expect(arpans!.year).toBe(1998);
    expect(arpans!.type).toBe('computable');
  });

  it('includes SA state-level prohibition', () => {
    const sa = australiaCorpus.sources.find((s) => s.id === 'au-sa-prohibition');
    expect(sa).toBeDefined();
    expect(sa!.type).toBe('computable');
    expect(sa!.url).toContain('legislation.sa.gov.au');
  });

  it('includes NT interior water scarcity context', () => {
    const water = australiaCorpus.sources.find((s) => s.id === 'au-interior-water');
    expect(water).toBeDefined();
    expect(water!.type).toBe('human-review');
  });
});
