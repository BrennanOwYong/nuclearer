import { describe, it, expect } from 'vitest';
import { polandCorpus } from './poland';
import type { CountryCorpus, SourceSnippet } from '../../types';

describe('polandCorpus', () => {
  it('has correct country identity', () => {
    const c: CountryCorpus = polandCorpus;
    expect(c.code).toBe('POL');
    expect(c.name).toBe('Poland');
    expect(c.regulator).toBe('PAA (Państwowa Agencja Atomistyki)');
    expect(c.sources.length).toBeGreaterThanOrEqual(3);
  });

  it('every source snippet is well-formed and really cited', () => {
    for (const s of polandCorpus.sources as SourceSnippet[]) {
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

  it('includes the PPEJ programme snippet with pej.pl URL', () => {
    const ppej = polandCorpus.sources.find((s) => s.id === 'pl-ppej');
    expect(ppej).toBeDefined();
    expect(ppej!.url).toContain('pej.pl');
  });

  it('includes Prawo atomowe (Polish Atomic Law)', () => {
    const law = polandCorpus.sources.find((s) => s.id === 'pl-prawo-atomowe');
    expect(law).toBeDefined();
    expect(law!.type).toBe('computable');
    expect(law!.url).toContain('isap.sejm.gov.pl');
  });

  it('includes Lubiatowo-Kopalino site decision', () => {
    const site = polandCorpus.sources.find((s) => s.id === 'pl-site-lubiatowo');
    expect(site).toBeDefined();
    expect(site!.type).toBe('human-review');
  });

  it('includes Patnow SMR programme', () => {
    const smr = polandCorpus.sources.find((s) => s.id === 'pl-patnow-smr');
    expect(smr).toBeDefined();
    expect(smr!.confidence).toBe('medium');
  });
});
