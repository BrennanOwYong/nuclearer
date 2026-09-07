// src/globe/regions.ts

/** ISO alpha-3 codes for the three demo countries (PRD §4). */
export const DEMO_COUNTRY_CODES = ['USA', 'POL', 'AUS'] as const;

/** Natural Earth ne_50m_admin_1 properties subset we rely on. */
export interface Admin1Properties {
  adm0_a3: string;        // ISO alpha-3 country code
  iso_3166_2: string;     // admin-1 code, e.g. "US-CA" (may be empty)
  adm1_code: string;      // always-present fallback id, e.g. "USA-3514"
  name: string;           // region display name
  [key: string]: unknown; // tolerate the many other NE fields
}

export interface Admin1Feature {
  type: 'Feature';
  properties: Admin1Properties;
  geometry: unknown;
}

export interface Admin1FeatureCollection {
  type: 'FeatureCollection';
  features: Admin1Feature[];
}

export interface RegionIdentity {
  country: string;
  regionId: string;
  regionName: string;
}

export type HighlightState = 'none' | 'hovered' | 'selected';

const DEMO_SET = new Set<string>(DEMO_COUNTRY_CODES);

/** Keep only admin-1 features whose country (adm0_a3) is a demo country. */
export function filterToDemoCountries(fc: Admin1FeatureCollection): Admin1Feature[] {
  if (!fc || !Array.isArray(fc.features)) return [];
  return fc.features.filter((f) => DEMO_SET.has(f?.properties?.adm0_a3));
}

/**
 * Rough centroid (average of all vertices) of a Polygon/MultiPolygon feature.
 * Good enough for positioning the camera (fly-to), not for exact labeling.
 */
export function featureCentroid(feature: Admin1Feature): { lat: number; lng: number } {
  let sumLng = 0;
  let sumLat = 0;
  let n = 0;
  const walk = (coords: unknown): void => {
    if (
      Array.isArray(coords) &&
      typeof coords[0] === 'number' &&
      typeof coords[1] === 'number'
    ) {
      sumLng += coords[0] as number;
      sumLat += coords[1] as number;
      n += 1;
    } else if (Array.isArray(coords)) {
      for (const c of coords) walk(c);
    }
  };
  walk((feature.geometry as { coordinates?: unknown })?.coordinates);
  if (n === 0) return { lat: 0, lng: 0 };
  return { lat: sumLat / n, lng: sumLng / n };
}

/** Derive stable {country, regionId, regionName} from a Natural Earth admin-1 feature. */
export function extractRegion(feature: Admin1Feature): RegionIdentity {
  const p = feature.properties;
  const iso = (p.iso_3166_2 ?? '').trim();
  const regionId = iso.length > 0 ? iso : p.adm1_code;
  return {
    country: p.adm0_a3,
    regionId,
    regionName: p.name,
  };
}

/**
 * Fetch the Natural Earth admin-1 GeoJSON and return only demo-country features.
 * fetchImpl is injectable for tests; defaults to the global fetch.
 */
export async function loadAdmin1GeoJson(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Admin1Feature[]> {
  const res = await fetchImpl(url);
  if (!res.ok) {
    throw new Error(`Failed to load admin-1 GeoJSON: HTTP ${res.status}`);
  }
  const fc = (await res.json()) as Admin1FeatureCollection;
  return filterToDemoCountries(fc);
}

/** Compute the highlight state for a feature given current hovered/selected region ids. */
export function highlightStateFor(
  feature: Admin1Feature,
  hoveredId: string | null,
  selectedId: string | null,
): HighlightState {
  const id = extractRegion(feature).regionId;
  if (selectedId !== null && id === selectedId) return 'selected';
  if (hoveredId !== null && id === hoveredId) return 'hovered';
  return 'none';
}

// Dark-theme palette (near-black globe, cyan accent for selection).
export function polygonCapColorFor(state: HighlightState): string {
  switch (state) {
    case 'selected': return 'rgba(56, 189, 248, 0.55)'; // cyan-400 fill
    case 'hovered':  return 'rgba(148, 163, 184, 0.35)'; // slate hover
    default:         return 'rgba(100, 116, 139, 0.12)'; // dim default
  }
}

export function polygonStrokeColorFor(state: HighlightState): string {
  switch (state) {
    case 'selected': return '#38bdf8'; // bright cyan border
    case 'hovered':  return '#cbd5e1';
    default:         return '#475569';
  }
}

export function polygonSideColorFor(state: HighlightState): string {
  return state === 'selected' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.15)';
}

export function polygonAltitudeFor(state: HighlightState): number {
  switch (state) {
    case 'selected': return 0.06;
    case 'hovered':  return 0.02;
    default:         return 0.01;
  }
}
