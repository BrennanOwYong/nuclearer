import { describe, it, expect } from 'vitest';
import {
  getCountryCorpus, getRegionData, getReactors, getReactor, listFlagshipRegions,
} from './index';
import type { ReactorModel, ReactorTechnology } from '../types';

const TECHNOLOGIES: ReactorTechnology[] = [
  'PWR', 'BWR', 'iPWR', 'HTGR', 'SFR', 'MSR', 'microreactor',
];

describe('reactor catalog', () => {
  const reactors = getReactors();

  it('includes all surveyed real vendor models', () => {
    const ids = reactors.map((r) => r.id);
    for (const id of [
      'westinghouse-ap1000', 'edf-epr', 'khnp-apr1400',  // PWR large
      'ge-bwrx-300',                                       // BWR SMR
      'nuscale-voygr', 'rr-smr', 'holtec-smr300',          // iPWR SMR
      'xenergy-xe100',                                     // HTGR
      'terrapower-natrium',                                // SFR
      'westinghouse-evinci', 'oklo-aurora',                // microreactor
      'terrestrial-imsr',                                  // MSR
    ]) {
      expect(ids, `missing reactor ${id}`).toContain(id);
    }
  });

  it('covers at least one model for every ReactorTechnology family', () => {
    const present = new Set(reactors.map((r) => r.technology));
    for (const tech of TECHNOLOGIES) {
      expect(present.has(tech), `no model for technology family ${tech}`).toBe(true);
    }
  });

  it('every model is well-formed with a real citation, technology, and companyUrl', () => {
    for (const m of reactors as ReactorModel[]) {
      expect(m.company.length).toBeGreaterThan(0);
      expect(m.model.length).toBeGreaterThan(0);
      expect(['SMR', 'large', 'micro']).toContain(m.type);
      expect(TECHNOLOGIES).toContain(m.technology);
      expect(m.companyUrl).toMatch(/^https?:\/\/.+\..+/);
      expect(m.outputMW).toBeGreaterThan(0);
      expect(m.footprintHectares).toBeGreaterThan(0);
      expect(m.coolingOptions.length).toBeGreaterThan(0);
      expect(m.waterNeeds.length).toBeGreaterThan(0);
      expect(m.status.length).toBeGreaterThan(0);
      expect(m.citation.url).toMatch(/^https?:\/\/.+/);
      expect(m.citation.year).toBeGreaterThan(1900);
    }
  });

  it('getReactor returns by id and undefined for unknown', () => {
    expect(getReactor('ge-bwrx-300')!.outputMW).toBe(300);
    expect(getReactor('nope')).toBeUndefined();
  });
});

describe('lookups', () => {
  it('getCountryCorpus resolves known codes, undefined otherwise', () => {
    expect(getCountryCorpus('USA')!.regulator).toBe('U.S. NRC');
    expect(getCountryCorpus('POL')!.code).toBe('POL');
    expect(getCountryCorpus('AUS')!.code).toBe('AUS');
    expect(getCountryCorpus('XXX')).toBeUndefined();
  });

  it('getRegionData resolves flagship regions, undefined for non-flagship', () => {
    expect(getRegionData('USA', 'US-WY')!.regionName).toBe('Wyoming');
    expect(getRegionData('AUS', 'AU-SA')!.regionName).toBe('South Australia');
    expect(getRegionData('USA', 'US-CA')).toBeUndefined();
  });

  it('listFlagshipRegions lists exactly the six modeled regions', () => {
    const list = listFlagshipRegions();
    expect(list).toHaveLength(6);
    expect(list.map((r) => r.regionId).sort()).toEqual(
      ['AU-NT', 'AU-SA', 'PL-22', 'PL-30', 'US-IL', 'US-WY'],
    );
  });
});
