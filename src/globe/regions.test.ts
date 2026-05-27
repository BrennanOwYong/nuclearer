// src/globe/regions.test.ts
import { describe, it, expect } from 'vitest';
import {
  DEMO_COUNTRY_CODES,
  filterToDemoCountries,
  extractRegion,
  loadAdmin1GeoJson,
  highlightStateFor,
  polygonCapColorFor,
  polygonStrokeColorFor,
  polygonSideColorFor,
  polygonAltitudeFor,
  type Admin1FeatureCollection,
} from './regions';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function feat(adm0_a3: string, name: string, iso_3166_2 = '', adm1_code = 'X'): Admin1FeatureCollection['features'][number] {
  return { type: 'Feature', properties: { adm0_a3, iso_3166_2, adm1_code, name }, geometry: {} };
}

// ---------------------------------------------------------------------------
// DEMO_COUNTRY_CODES
// ---------------------------------------------------------------------------

describe('DEMO_COUNTRY_CODES', () => {
  it('contains exactly USA, POL, AUS', () => {
    expect([...DEMO_COUNTRY_CODES]).toEqual(['USA', 'POL', 'AUS']);
  });
});

// ---------------------------------------------------------------------------
// filterToDemoCountries
// ---------------------------------------------------------------------------

describe('filterToDemoCountries', () => {
  const fc: Admin1FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      feat('USA', 'California'),
      feat('CAN', 'Ontario'),     // not a demo country
      feat('POL', 'Mazowieckie'),
      feat('FRA', 'Bretagne'),    // not a demo country
      feat('AUS', 'New South Wales'),
    ],
  };

  it('keeps only USA, POL, AUS features', () => {
    const out = filterToDemoCountries(fc);
    expect(out.map((f) => f.properties.adm0_a3)).toEqual(['USA', 'POL', 'AUS']);
  });

  it('returns empty array when no demo features present', () => {
    const none: Admin1FeatureCollection = { type: 'FeatureCollection', features: [feat('CAN', 'Ontario')] };
    expect(filterToDemoCountries(none)).toEqual([]);
  });

  it('tolerates a missing features array', () => {
    expect(filterToDemoCountries({ type: 'FeatureCollection' } as unknown as Admin1FeatureCollection)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// extractRegion
// ---------------------------------------------------------------------------

describe('extractRegion', () => {
  it('uses adm0_a3 / iso_3166_2 / name for identity', () => {
    const f = {
      type: 'Feature' as const,
      properties: { adm0_a3: 'USA', iso_3166_2: 'US-CA', adm1_code: 'USA-3514', name: 'California' },
      geometry: {},
    };
    expect(extractRegion(f)).toEqual({ country: 'USA', regionId: 'US-CA', regionName: 'California' });
  });

  it('falls back to adm1_code when iso_3166_2 is empty', () => {
    const f = {
      type: 'Feature' as const,
      properties: { adm0_a3: 'AUS', iso_3166_2: '', adm1_code: 'AUS-0815', name: 'Jervis Bay Territory' },
      geometry: {},
    };
    expect(extractRegion(f)).toEqual({ country: 'AUS', regionId: 'AUS-0815', regionName: 'Jervis Bay Territory' });
  });

  it('trims whitespace-only iso_3166_2 before falling back', () => {
    const f = {
      type: 'Feature' as const,
      properties: { adm0_a3: 'POL', iso_3166_2: '   ', adm1_code: 'POL-1', name: 'Mazowieckie' },
      geometry: {},
    };
    expect(extractRegion(f).regionId).toBe('POL-1');
  });
});

// ---------------------------------------------------------------------------
// loadAdmin1GeoJson
// ---------------------------------------------------------------------------

describe('loadAdmin1GeoJson', () => {
  it('fetches, parses, and filters to demo countries', async () => {
    const body = {
      type: 'FeatureCollection',
      features: [
        feat('USA', 'California'),
        feat('CAN', 'Ontario'),
        feat('AUS', 'New South Wales'),
      ],
    };
    const fakeFetch = (async () =>
      ({ ok: true, json: async () => body }) as unknown as Response) as typeof fetch;

    const out = await loadAdmin1GeoJson('http://example.test/x.geojson', fakeFetch);
    expect(out.map((f) => f.properties.adm0_a3)).toEqual(['USA', 'AUS']);
  });

  it('throws when the response is not ok', async () => {
    const fakeFetch = (async () =>
      ({ ok: false, status: 503, json: async () => ({}) }) as unknown as Response) as typeof fetch;
    await expect(loadAdmin1GeoJson('http://example.test/x.geojson', fakeFetch)).rejects.toThrow(/503/);
  });
});

// ---------------------------------------------------------------------------
// highlightStateFor
// ---------------------------------------------------------------------------

describe('highlightStateFor', () => {
  const f = { type: 'Feature' as const, properties: { adm0_a3: 'USA', iso_3166_2: 'US-CA', adm1_code: 'USA-1', name: 'California' }, geometry: {} };

  it('is selected when feature id matches selectedId (selected wins over hovered)', () => {
    expect(highlightStateFor(f, 'US-CA', 'US-CA')).toBe('selected');
  });
  it('is hovered when feature id matches hoveredId and is not selected', () => {
    expect(highlightStateFor(f, 'US-CA', null)).toBe('hovered');
  });
  it('is none otherwise', () => {
    expect(highlightStateFor(f, 'US-NY', 'US-NY')).toBe('none');
  });
});

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

describe('style helpers', () => {
  it('returns distinct cap colors per state', () => {
    const none = polygonCapColorFor('none');
    const hovered = polygonCapColorFor('hovered');
    const selected = polygonCapColorFor('selected');
    expect(new Set([none, hovered, selected]).size).toBe(3);
  });
  it('selected stroke differs from none stroke', () => {
    expect(polygonStrokeColorFor('selected')).not.toBe(polygonStrokeColorFor('none'));
  });
  it('side color is a string for every state', () => {
    (['none', 'hovered', 'selected'] as const).forEach((s) =>
      expect(typeof polygonSideColorFor(s)).toBe('string'),
    );
  });
  it('selected sits at a higher altitude than none/hovered', () => {
    expect(polygonAltitudeFor('selected')).toBeGreaterThan(polygonAltitudeFor('hovered'));
    expect(polygonAltitudeFor('hovered')).toBeGreaterThanOrEqual(polygonAltitudeFor('none'));
  });
});
