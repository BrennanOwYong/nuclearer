import { describe, it, expect } from 'vitest';
import { usWyoming } from './us-wy';
import { usIllinois } from './us-il';
import { plPomerania } from './pl-pomerania';
import { plGreaterPoland } from './pl-greater-poland';
import { auSouthAustralia } from './au-sa';
import { auNorthernTerritory } from './au-nt';
import type { RegionData, FactCategory } from '../../types';

const ALL: RegionData[] = [
  usWyoming, usIllinois, plPomerania, plGreaterPoland, auSouthAustralia, auNorthernTerritory,
];
const CATEGORIES: FactCategory[] = ['land', 'grid', 'water', 'hazard', 'population', 'pathway'];

describe('flagship region data', () => {
  it.each(ALL.map((r) => [r.regionName, r] as const))('%s is well-formed and rich', (_n, r) => {
    expect(r.country).toMatch(/^[A-Z]{3}$/);
    expect(r.regionId.length).toBeGreaterThan(0);
    expect(r.regionName.length).toBeGreaterThan(0);
    expect(r.hasRichData).toBe(true);
    expect(r.facts.length).toBeGreaterThanOrEqual(6);
    const cats = new Set(r.facts.map((f) => f.category));
    for (const cat of CATEGORIES) expect(cats.has(cat)).toBe(true); // every category represented
    for (const f of r.facts) {
      expect(f.id).toMatch(/^[a-z0-9-]+$/);
      expect(CATEGORIES).toContain(f.category);
      expect(f.label.length).toBeGreaterThan(0);
      expect(f.value.length).toBeGreaterThan(0);
      expect(f.detail.length).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(f.confidence);
      if (f.citationId !== undefined) expect(f.citationId.length).toBeGreaterThan(0);
    }
  });

  it('Australian flagship regions carry a fail-worthy ban fact citing EPBC s.140A', () => {
    for (const r of [auSouthAustralia, auNorthernTerritory]) {
      const ban = r.facts.find((f) => f.category === 'pathway' && f.citationId === 'au-epbc-140a');
      expect(ban, `${r.regionName} must surface the statutory ban`).toBeDefined();
      expect(ban!.value.toLowerCase()).toMatch(/prohibit|banned|not permitted|fail/);
    }
  });

  it('Wyoming has correct regionId and country', () => {
    expect(usWyoming.regionId).toBe('US-WY');
    expect(usWyoming.country).toBe('USA');
  });

  it('Illinois has correct regionId and country', () => {
    expect(usIllinois.regionId).toBe('US-IL');
    expect(usIllinois.country).toBe('USA');
  });

  it('Pomerania has correct regionId and country', () => {
    expect(plPomerania.regionId).toBe('PL-22');
    expect(plPomerania.country).toBe('POL');
  });

  it('Greater Poland has correct regionId and country', () => {
    expect(plGreaterPoland.regionId).toBe('PL-30');
    expect(plGreaterPoland.country).toBe('POL');
  });

  it('South Australia has correct regionId and country', () => {
    expect(auSouthAustralia.regionId).toBe('AU-SA');
    expect(auSouthAustralia.country).toBe('AUS');
  });

  it('Northern Territory has correct regionId and country', () => {
    expect(auNorthernTerritory.regionId).toBe('AU-NT');
    expect(auNorthernTerritory.country).toBe('AUS');
  });
});
