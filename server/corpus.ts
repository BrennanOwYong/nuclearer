import type { CountryCorpus, RegionData } from '../src/types';

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
 * the body of this function. F1 ships a stub that always throws so callers
 * render the "limited data" state. F3 implements the real lookup.
 */
export function loadCorpus(
  country: string,
  regionId: string,
): { country: CountryCorpus; region: RegionData } {
  throw new CorpusNotFoundError(country, regionId);
}
