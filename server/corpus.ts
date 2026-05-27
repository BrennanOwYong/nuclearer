import type { CountryCorpus, RegionData } from '../src/types';
import { getCountryCorpus, getRegionData } from '../src/data/index';

export class CorpusNotFoundError extends Error {
  readonly country: string;
  readonly regionId: string;
  constructor(country: string, regionId: string) {
    super(`No corpus for country="${country}" region="${regionId}"`);
    this.name = 'CorpusNotFoundError';
    this.country = country;
    this.regionId = regionId;
  }
}

/**
 * INTEGRATION SEAM (frozen contract). The real Compliance RAG repo replaces
 * the body of this function. Returns the matching CountryCorpus and RegionData
 * for a flagship region, or throws CorpusNotFoundError for unknown country/region.
 * Server-only: never import this from client code.
 */
export function loadCorpus(
  country: string,
  regionId: string,
): { country: CountryCorpus; region: RegionData } {
  const corpus = getCountryCorpus(country);
  const region = getRegionData(country, regionId);
  if (!corpus || !region) {
    throw new CorpusNotFoundError(country, regionId);
  }
  return { country: corpus, region };
}
