import type { CountryCorpus, RegionData, ReactorModel, CandidateSite } from '../types';
import { usaCorpus } from './countries/usa';
import { polandCorpus } from './countries/poland';
import { australiaCorpus } from './countries/australia';
import { usWyoming } from './regions/us-wy';
import { usIllinois } from './regions/us-il';
import { plPomerania } from './regions/pl-pomerania';
import { plGreaterPoland } from './regions/pl-greater-poland';
import { auSouthAustralia } from './regions/au-sa';
import { auNorthernTerritory } from './regions/au-nt';
import { reactors } from './reactors';
import { candidateSitesUSWY } from './sites/us-wy';
import { candidateSitesUSIL } from './sites/us-il';
import { candidateSitesPL22 } from './sites/pl-22';
import { candidateSitesPL30 } from './sites/pl-30';
import { candidateSitesAUSA } from './sites/au-sa';
import { candidateSitesAUNT } from './sites/au-nt';

const COUNTRIES: Record<string, CountryCorpus> = {
  USA: usaCorpus,
  POL: polandCorpus,
  AUS: australiaCorpus,
};

const CANDIDATE_SITES: CandidateSite[][] = [
  candidateSitesUSWY,
  candidateSitesUSIL,
  candidateSitesPL22,
  candidateSitesPL30,
  candidateSitesAUSA,
  candidateSitesAUNT,
];

const REGIONS: RegionData[] = [
  usWyoming,
  usIllinois,
  plPomerania,
  plGreaterPoland,
  auSouthAustralia,
  auNorthernTerritory,
];

/** Returns the CountryCorpus for the given ISO alpha-3 code, or undefined on miss. Never throws. */
export function getCountryCorpus(code: string): CountryCorpus | undefined {
  return COUNTRIES[code];
}

/** Returns the RegionData for the given country + regionId, or undefined on miss. Never throws. */
export function getRegionData(country: string, regionId: string): RegionData | undefined {
  return REGIONS.find((r) => r.country === country && r.regionId === regionId);
}

/** Returns the full reactor catalog. Never throws. */
export function getReactors(): ReactorModel[] {
  return reactors;
}

/** Returns the ReactorModel for the given id, or undefined on miss. Never throws. */
export function getReactor(id: string): ReactorModel | undefined {
  return reactors.find((r) => r.id === id);
}

/**
 * Returns a flat list of all flagship regions with their country, regionId, and name.
 * Safe to call from the browser/client. Never throws.
 */
export function listFlagshipRegions(): { country: string; regionId: string; regionName: string }[] {
  return REGIONS.map((r) => ({
    country: r.country,
    regionId: r.regionId,
    regionName: r.regionName,
  }));
}

/**
 * Returns the prepared candidate-site pool for the given country + regionId.
 * Safe to call from the browser/client. Never throws. Returns [] on miss.
 */
export function getCandidateSites(country: string, regionId: string): CandidateSite[] {
  for (const pool of CANDIDATE_SITES) {
    if (pool.length > 0 && pool[0].country === country && pool[0].regionId === regionId) {
      return pool;
    }
  }
  return [];
}
