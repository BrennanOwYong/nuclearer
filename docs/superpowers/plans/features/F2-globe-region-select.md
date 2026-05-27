# F2 — Globe + admin-1 region select & highlight

> **Parent PRD:** `docs/superpowers/plans/2026-05-27-nuclear-globe-PRD.md` (§5 LOCKED contracts, §6 feature map, §9 testing).
> **Execution sub-skill:** `superpowers:subagent-driven-development`. Steps use `- [ ]` checkboxes; every code step contains complete, real code (no placeholders).

## Goal

Render a dark full-planet 3D globe (`globe.gl` / Three.js) showing Natural Earth **admin-1** polygons filtered to **USA, Poland, Australia**. Hover applies a subtle highlight; clicking a region draws a distinct selected border + fill and invokes the frozen callback `onRegionSelected(country, regionId, regionName)`. All region-identity and styling logic lives in pure, unit-tested helpers in `regions.ts`; the React/Three.js wiring in `Globe.tsx` is verified via Playwright E2E (we do **not** unit-test Three.js rendering).

## Dependency note

**Depends on: F1** (scaffold, `src/types.ts`, `src/App.tsx` shell, Vite + Vitest + Playwright config, `package.json`). F2 imports the LOCKED `RegionData`-adjacent identity contract from F1's `src/types.ts` and is mounted by F1's `App.tsx`. This plan assumes F1 is complete. If F1 is not yet merged, the executing agent must surface that as a blocker rather than re-scaffolding (F1 owns those files).

## File structure

F2 **OWNS ONLY** these two files. It must not create data files (F3 territory), the dashboard (F4), or modify F1-owned files (`src/types.ts`, `src/App.tsx` shell, Vite/test configs) except where F1's contract explicitly invites a child to be mounted.

| File | Responsibility |
|------|---------------|
| `src/globe/regions.ts` | **Pure logic, no React, no DOM.** Type for an admin-1 GeoJSON `Feature`/`FeatureCollection`; the set of demo ISO alpha-3 codes; `filterToDemoCountries(fc)`; `extractRegion(feature)` → `{ country, regionId, regionName }`; `loadAdmin1GeoJson(url, fetchImpl?)` (fetch + filter); polygon style/highlight helpers (`polygonCapColorFor`, `polygonStrokeColorFor`, `polygonSideColorFor`, `polygonAltitudeFor`) driven by a `HighlightState`. All deterministic and Vitest-tested. |
| `src/globe/Globe.tsx` | **React component.** Mounts `globe.gl` into a ref'd `<div>`, loads + filters GeoJSON via `regions.ts`, wires `onPolygonHover`/`onPolygonClick`, maintains hovered/selected state, and calls the `onRegionSelected` prop on click of a demo region. Props: `{ onRegionSelected: (country: string, regionId: string, regionName: string) => void; shifted?: boolean }`. Verified via E2E only. |

## Interfaces consumed / produced

### Consumed (from F1 — do not redefine)

- `src/types.ts` exports the LOCKED contracts (PRD §5). F2 consumes the field names that define region identity: `RegionData.country` (ISO alpha-3), `RegionData.regionId` (admin-1 code from GeoJSON properties), `RegionData.regionName`. `extractRegion` produces exactly those three fields so downstream features (F4) can key off them without translation.
- F1's `src/App.tsx` mounts `<Globe onRegionSelected={...} shifted={...} />`. F2 does **not** edit `App.tsx`; it only exports the component.

### Produced (F2's public surface)

```ts
// src/globe/Globe.tsx
export interface GlobeProps {
  /** FROZEN globe event (PRD §5). Fired on click of a demo-country admin-1 region. */
  onRegionSelected: (country: string, regionId: string, regionName: string) => void;
  /** Reserved for F6 dynamic layout. Slides the globe container left when true. F2 only accepts/forwards it. */
  shifted?: boolean;
}
export function Globe(props: GlobeProps): JSX.Element;
```

```ts
// src/globe/regions.ts — public surface consumed by Globe.tsx (and tests)
export const DEMO_COUNTRY_CODES: readonly string[]; // ['USA','POL','AUS']
export interface Admin1Properties { /* see Task 1 */ }
export interface Admin1Feature { type: 'Feature'; properties: Admin1Properties; geometry: unknown; }
export interface Admin1FeatureCollection { type: 'FeatureCollection'; features: Admin1Feature[]; }
export interface RegionIdentity { country: string; regionId: string; regionName: string; }
export type HighlightState = 'none' | 'hovered' | 'selected';

export function filterToDemoCountries(fc: Admin1FeatureCollection): Admin1Feature[];
export function extractRegion(feature: Admin1Feature): RegionIdentity;
export function loadAdmin1GeoJson(url: string, fetchImpl?: typeof fetch): Promise<Admin1Feature[]>;
export function highlightStateFor(feature: Admin1Feature, hoveredId: string | null, selectedId: string | null): HighlightState;
export function polygonCapColorFor(state: HighlightState): string;
export function polygonStrokeColorFor(state: HighlightState): string;
export function polygonSideColorFor(state: HighlightState): string;
export function polygonAltitudeFor(state: HighlightState): number;
```

## Natural Earth admin-1 GeoJSON source

Use the **Natural Earth 1:50m Admin-1 States/Provinces** dataset, served as GeoJSON. Concrete, stable source: the `geojson-maps` / `world-atlas`-style mirror published by Natural Earth's vector repo. Two equivalent options:

- **npm (preferred for determinism / offline build):** `npm i geojson-world` is too coarse (country-level). For admin-1 use the file from `nvkelso/natural-earth-vector` at path `geojson/ne_50m_admin_1_states_provinces.geojson`. Vendor it once into the **app's public assets** (F1 owns `public/`, so F2 fetches from a URL, it does not commit the file): `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson`.
- **Runtime default URL used by `Globe.tsx`:** `const ADMIN1_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson';` — overridable via prop-less module constant so E2E can intercept and replace it with a small fixture (see E2E section).

**Property fields (Natural Earth admin-1 schema) used for identity:**

- `adm0_a3` — ISO alpha-3 country code (e.g. `"USA"`, `"POL"`, `"AUS"`). Used to **filter** to demo countries and to populate `country`.
- `iso_3166_2` — stable admin-1 code (e.g. `"US-CA"`, `"PL-MZ"`, `"AU-NSW"`). Used as `regionId`. This is the most stable identifier and is what F3/F4 will key region data on.
- `name` — human-readable region name (e.g. `"California"`). Used as `regionName`.
- **Fallback:** some Natural Earth rows have empty `iso_3166_2`. When blank, fall back to `adm1_code` (always present, e.g. `"USA-3514"`) so `regionId` is never empty. `extractRegion` must implement this fallback.

---

## Task 1 — `regions.ts`: GeoJSON types + demo-country constant (Vitest)

- [ ] Create `src/globe/regions.ts` with the GeoJSON types and demo-country set:

```ts
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
```

- [ ] Create the test file `src/globe/regions.test.ts` and add the constant test:

```ts
// src/globe/regions.test.ts
import { describe, it, expect } from 'vitest';
import { DEMO_COUNTRY_CODES } from './regions';

describe('DEMO_COUNTRY_CODES', () => {
  it('contains exactly USA, POL, AUS', () => {
    expect([...DEMO_COUNTRY_CODES]).toEqual(['USA', 'POL', 'AUS']);
  });
});
```

- [ ] Run the test. **Command:** `npm run test -- src/globe/regions.test.ts`
  **Expected output (tail):** `Test Files  1 passed (1)` and `Tests  1 passed (1)`.

## Task 2 — `filterToDemoCountries` (Vitest, TDD)

- [ ] **Write the failing test first** in `src/globe/regions.test.ts`:

```ts
import { filterToDemoCountries, type Admin1FeatureCollection } from './regions';

function feat(adm0_a3: string, name: string): any {
  return { type: 'Feature', properties: { adm0_a3, iso_3166_2: '', adm1_code: 'X', name }, geometry: {} };
}

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
    expect(filterToDemoCountries({ type: 'FeatureCollection' } as any)).toEqual([]);
  });
});
```

- [ ] Run it and confirm it **fails** (function not implemented).
  **Command:** `npm run test -- src/globe/regions.test.ts`
  **Expected:** failure referencing `filterToDemoCountries is not a function`.

- [ ] **Implement** in `src/globe/regions.ts`:

```ts
const DEMO_SET = new Set<string>(DEMO_COUNTRY_CODES);

/** Keep only admin-1 features whose country (adm0_a3) is a demo country. */
export function filterToDemoCountries(fc: Admin1FeatureCollection): Admin1Feature[] {
  if (!fc || !Array.isArray(fc.features)) return [];
  return fc.features.filter((f) => DEMO_SET.has(f?.properties?.adm0_a3));
}
```

- [ ] Run the test. **Expected (tail):** `Tests  4 passed (4)` (the 1 constant test + 3 filter tests).

## Task 3 — `extractRegion` with `iso_3166_2` → `adm1_code` fallback (Vitest, TDD)

- [ ] **Write the failing test** in `src/globe/regions.test.ts`:

```ts
import { extractRegion } from './regions';

describe('extractRegion', () => {
  it('uses adm0_a3 / iso_3166_2 / name for identity', () => {
    const f: any = {
      type: 'Feature',
      properties: { adm0_a3: 'USA', iso_3166_2: 'US-CA', adm1_code: 'USA-3514', name: 'California' },
      geometry: {},
    };
    expect(extractRegion(f)).toEqual({ country: 'USA', regionId: 'US-CA', regionName: 'California' });
  });

  it('falls back to adm1_code when iso_3166_2 is empty', () => {
    const f: any = {
      type: 'Feature',
      properties: { adm0_a3: 'AUS', iso_3166_2: '', adm1_code: 'AUS-0815', name: 'Jervis Bay Territory' },
      geometry: {},
    };
    expect(extractRegion(f)).toEqual({ country: 'AUS', regionId: 'AUS-0815', regionName: 'Jervis Bay Territory' });
  });

  it('trims whitespace-only iso_3166_2 before falling back', () => {
    const f: any = {
      type: 'Feature',
      properties: { adm0_a3: 'POL', iso_3166_2: '   ', adm1_code: 'POL-1', name: 'Mazowieckie' },
      geometry: {},
    };
    expect(extractRegion(f).regionId).toBe('POL-1');
  });
});
```

- [ ] Run and confirm **failure** (`extractRegion is not a function`).

- [ ] **Implement** in `src/globe/regions.ts`:

```ts
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
```

- [ ] Run the test. **Expected (tail):** `Tests  7 passed (7)`.

## Task 4 — `loadAdmin1GeoJson` (fetch + filter, injectable fetch) (Vitest, TDD)

- [ ] **Write the failing test** in `src/globe/regions.test.ts` (inject a fake `fetch` so the unit test is deterministic and offline):

```ts
import { loadAdmin1GeoJson } from './regions';

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
```

- [ ] Run and confirm **failure**.

- [ ] **Implement** in `src/globe/regions.ts`:

```ts
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
```

- [ ] Run the test. **Expected (tail):** `Tests  9 passed (9)`.

## Task 5 — Highlight-state helpers + style functions (Vitest, TDD)

These encode the visual contract: unselected demo regions get a dim translucent cap + subtle stroke; hovered regions brighten; the selected region gets a distinct accent border + fill and a slight altitude lift. Colors are dark-theme accent values (cyan accent on near-black globe).

- [ ] **Write the failing test** in `src/globe/regions.test.ts`:

```ts
import {
  highlightStateFor,
  polygonCapColorFor,
  polygonStrokeColorFor,
  polygonSideColorFor,
  polygonAltitudeFor,
} from './regions';

describe('highlightStateFor', () => {
  const f: any = { properties: { adm0_a3: 'USA', iso_3166_2: 'US-CA', adm1_code: 'USA-1', name: 'California' } };

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
```

- [ ] Run and confirm **failure**.

- [ ] **Implement** in `src/globe/regions.ts`:

```ts
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
```

- [ ] Run the full unit suite for this file. **Command:** `npm run test -- src/globe/regions.test.ts`
  **Expected (tail):** `Test Files  1 passed (1)` and `Tests  15 passed (15)`.

## Task 6 — `Globe.tsx` component wiring (verified via E2E)

> Three.js/`globe.gl` rendering is **not** unit-tested. This task is verified by the Playwright suite in the next section. Implement against the `globe.gl` API exactly as below.

- [ ] Confirm `globe.gl` is a dependency (F1 may or may not have added it). **Command:** `npm ls globe.gl`
  **Expected:** a version line, e.g. `globe.gl@2.x.x`. If it errors with `(empty)`/not found, install it: `npm i globe.gl` and re-run `npm ls globe.gl`. (`globe.gl` bundles `three`; no separate install needed.)

- [ ] Create `src/globe/Globe.tsx`:

```tsx
// src/globe/Globe.tsx
import { useEffect, useRef } from 'react';
import Globe, { type GlobeInstance } from 'globe.gl';
import {
  loadAdmin1GeoJson,
  extractRegion,
  highlightStateFor,
  polygonCapColorFor,
  polygonStrokeColorFor,
  polygonSideColorFor,
  polygonAltitudeFor,
  type Admin1Feature,
} from './regions';

/** Default Natural Earth 1:50m admin-1 source. Overridable for tests via window.__ADMIN1_URL__. */
const DEFAULT_ADMIN1_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson';

export interface GlobeProps {
  /** FROZEN globe event (PRD §5). */
  onRegionSelected: (country: string, regionId: string, regionName: string) => void;
  /** Reserved for F6 dynamic layout. */
  shifted?: boolean;
}

declare global {
  interface Window {
    /** E2E hook: lets Playwright point the globe at a small fixture instead of the live CDN. */
    __ADMIN1_URL__?: string;
  }
}

export function Globe({ onRegionSelected, shifted = false }: GlobeProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  // Mutable hover/selection ids; we re-trigger styling imperatively via globe.polygonsData(...).
  const hoveredId = useRef<string | null>(null);
  const selectedId = useRef<string | null>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const featuresRef = useRef<Admin1Feature[]>([]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const world = new Globe(el)
      .backgroundColor('#020617')           // near-black space
      .showAtmosphere(true)
      .atmosphereColor('#1e3a8a')
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .polygonAltitude((d: object) =>
        polygonAltitudeFor(highlightStateFor(d as Admin1Feature, hoveredId.current, selectedId.current)),
      )
      .polygonCapColor((d: object) =>
        polygonCapColorFor(highlightStateFor(d as Admin1Feature, hoveredId.current, selectedId.current)),
      )
      .polygonSideColor((d: object) =>
        polygonSideColorFor(highlightStateFor(d as Admin1Feature, hoveredId.current, selectedId.current)),
      )
      .polygonStrokeColor((d: object) =>
        polygonStrokeColorFor(highlightStateFor(d as Admin1Feature, hoveredId.current, selectedId.current)),
      )
      .onPolygonHover((poly: object | null) => {
        const next = poly ? extractRegion(poly as Admin1Feature).regionId : null;
        if (next === hoveredId.current) return;
        hoveredId.current = next;
        // Re-feed data to force a restyle pass.
        world.polygonsData(featuresRef.current as object[]);
      })
      .onPolygonClick((poly: object) => {
        const { country, regionId, regionName } = extractRegion(poly as Admin1Feature);
        selectedId.current = regionId;
        world.polygonsData(featuresRef.current as object[]);
        onRegionSelected(country, regionId, regionName);
      });

    globeRef.current = world;

    // Responsive sizing.
    const resize = () => {
      world.width(el.clientWidth).height(el.clientHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    // Load + filter admin-1 polygons, then feed the globe.
    const url = window.__ADMIN1_URL__ ?? DEFAULT_ADMIN1_URL;
    let cancelled = false;
    loadAdmin1GeoJson(url)
      .then((features) => {
        if (cancelled) return;
        featuresRef.current = features;
        world.polygonsData(features as object[]);
        // Test signal: data is loaded and interactive.
        el.setAttribute('data-globe-ready', 'true');
      })
      .catch((err) => {
        console.error('[Globe] failed to load admin-1 GeoJSON', err);
        el.setAttribute('data-globe-error', 'true');
      });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
      world._destructor?.();
      el.replaceChildren();
      globeRef.current = null;
    };
    // onRegionSelected intentionally read fresh via closure; effect runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="globe-canvas"
      className={shifted ? 'globe globe--shifted' : 'globe'}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default Globe;
```

- [ ] Type-check the component compiles. **Command:** `npx tsc --noEmit`
  **Expected:** no output and exit code 0 (clean type-check). If F1's `tsconfig` excludes test files from `tsc`, that's fine — the unit tests run under Vitest.

- [ ] Run the unit suite once more to confirm `regions.ts` is unaffected. **Command:** `npm run test -- src/globe/regions.test.ts`
  **Expected (tail):** `Tests  15 passed (15)`.

## End-to-end testing requirements

E2E lives in F1's Playwright setup (e.g. `e2e/` with `playwright.config.ts`). F2 adds **one spec file** `e2e/globe.spec.ts` and **one fixture** `e2e/fixtures/admin1-mini.geojson`. The globe is driven through real browser interaction; we never assert on Three.js internals.

### Determinism: mock the GeoJSON fetch with a small fixture

The live Natural Earth file is large and network-dependent. For deterministic E2E, intercept the GeoJSON request (or set the `window.__ADMIN1_URL__` hook) so the globe loads a tiny fixture containing exactly: one USA region (California), one POL region, one AUS region, and **one non-demo country** region (Canada/Ontario) that must be filtered out and therefore not clickable.

- [ ] Create the fixture `e2e/fixtures/admin1-mini.geojson` (geometries are minimal valid polygons; coordinates only need to be valid, not accurate):

```json
{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature",
      "properties": { "adm0_a3": "USA", "iso_3166_2": "US-CA", "adm1_code": "USA-3521", "name": "California" },
      "geometry": { "type": "Polygon", "coordinates": [[[-124,42],[-114,42],[-114,32],[-124,32],[-124,42]]] } },
    { "type": "Feature",
      "properties": { "adm0_a3": "POL", "iso_3166_2": "PL-MZ", "adm1_code": "POL-1", "name": "Mazowieckie" },
      "geometry": { "type": "Polygon", "coordinates": [[[20,53],[22,53],[22,51],[20,51],[20,53]]] } },
    { "type": "Feature",
      "properties": { "adm0_a3": "AUS", "iso_3166_2": "AU-NSW", "adm1_code": "AUS-2", "name": "New South Wales" },
      "geometry": { "type": "Polygon", "coordinates": [[[141,-29],[153,-29],[153,-37],[141,-37],[141,-29]]] } },
    { "type": "Feature",
      "properties": { "adm0_a3": "CAN", "iso_3166_2": "CA-ON", "adm1_code": "CAN-9", "name": "Ontario" },
      "geometry": { "type": "Polygon", "coordinates": [[[-95,56],[-75,56],[-75,42],[-95,42],[-95,56]]] } }
  ]
}
```

- [ ] Create `e2e/globe.spec.ts`. The spec (a) routes the admin-1 URL to the fixture, (b) installs a `window.__regionSelected` spy that the page captures from the `onRegionSelected` callback, (c) waits for `data-globe-ready`, then asserts mount, click-selection, highlight, and the non-demo no-op.

> **Test hook contract (define here, F1's `App.tsx` already wires `onRegionSelected`):** the app, when running under test, must forward `onRegionSelected` args onto `window.__regionSelected`. If F1's `App.tsx` does not already expose this, the spec installs it by intercepting at the component boundary via an `addInitScript` that defines `window.__regionSelected = (...args) => (window.__lastRegion = args)` and relies on the app calling it. Because F2 must not edit `App.tsx`, the canonical hook is the **`window` custom event** the spec listens for: the spec sets `window.__ADMIN1_URL__` and reads selection via a `globe:region-selected` CustomEvent. To keep F2 self-contained, `Globe.tsx`'s `onRegionSelected` is provided by `App.tsx`; for the test we assert via the visible highlight + a `data-selected-region` attribute the test sets through the callback. The deterministic, F2-owned signal is: **after click, the clicked polygon's selected styling is active and `window.__lastRegion` holds `[country, regionId, regionName]`.** (See `addInitScript` below — this requires F1's `App.tsx` to call `window.__lastRegion = [...]` inside its `onRegionSelected` handler when `import.meta.env.MODE === 'test'`; flag this dependency to F1 if absent.)

```ts
// e2e/globe.spec.ts
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures', 'admin1-mini.geojson'), 'utf8');

test.describe('F2 globe region select', () => {
  test.beforeEach(async ({ page }) => {
    // Point the globe at the tiny fixture and install a selection spy.
    await page.addInitScript(() => {
      // @ts-expect-error test hook
      window.__ADMIN1_URL__ = 'https://fixture.test/admin1.geojson';
      // @ts-expect-error test hook
      window.__lastRegion = null;
      // App.tsx (F1) must, in test mode, do: window.__lastRegion = [country, regionId, regionName]
    });
    // Serve the fixture body for the fixture URL.
    await page.route('https://fixture.test/admin1.geojson', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: fixture }),
    );
    await page.goto('/');
  });

  test('globe canvas mounts and becomes ready', async ({ page }) => {
    const canvas = page.getByTestId('globe-canvas');
    await expect(canvas).toBeVisible();
    // WebGL canvas element rendered by globe.gl/three.
    await expect(canvas.locator('canvas')).toHaveCount(1);
    await expect(canvas).toHaveAttribute('data-globe-ready', 'true', { timeout: 15_000 });
  });

  test('clicking a USA state fires onRegionSelected with country=USA', async ({ page }) => {
    const canvas = page.getByTestId('globe-canvas');
    await expect(canvas).toHaveAttribute('data-globe-ready', 'true', { timeout: 15_000 });

    // Programmatically invoke the polygon click for the California feature via the globe instance,
    // because picking exact screen pixels on a rotating WebGL globe is flaky. We expose the click
    // path deterministically through the globe.gl onPolygonClick handler by simulating it:
    await page.evaluate(() => {
      // Re-dispatch by finding the California feature and calling the registered handler is internal;
      // instead we rely on the app exposing the selection. Click center of the globe after orienting
      // California toward the camera is non-deterministic, so the spec asserts on the test hook that
      // the app populated once a click occurs. For a robust deterministic path, Globe.tsx exposes
      // a window.__globeClickRegion(id) test helper (see note).
    });

    // Deterministic click via the test helper exposed by Globe.tsx in test mode (see Task 6 note).
    await page.evaluate(() => (window as any).__globeClickRegion?.('US-CA'));
    await expect.poll(async () => page.evaluate(() => (window as any).__lastRegion?.[0])).toBe('USA');
    await expect
      .poll(async () => page.evaluate(() => (window as any).__lastRegion?.[1]))
      .toBe('US-CA');
  });

  test('selected region renders highlight styling', async ({ page }) => {
    const canvas = page.getByTestId('globe-canvas');
    await expect(canvas).toHaveAttribute('data-globe-ready', 'true', { timeout: 15_000 });
    await page.evaluate(() => (window as any).__globeClickRegion?.('US-CA'));
    // Globe.tsx records the selected id on the mount node for assertion.
    await expect(canvas).toHaveAttribute('data-selected-region', 'US-CA', { timeout: 5_000 });
  });

  test('clicking a non-demo country does nothing (filtered out)', async ({ page }) => {
    const canvas = page.getByTestId('globe-canvas');
    await expect(canvas).toHaveAttribute('data-globe-ready', 'true', { timeout: 15_000 });
    // Ontario (CAN) was filtered out, so its id is not in polygonsData and the helper is a no-op.
    await page.evaluate(() => (window as any).__globeClickRegion?.('CA-ON'));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as any).__lastRegion)).toBeNull();
    await expect(canvas).not.toHaveAttribute('data-selected-region', 'CA-ON');
  });
});
```

- [ ] To make the click deterministic (clicking exact pixels on a rotating WebGL globe is flaky), add a **test-mode helper** to `Globe.tsx` that drives the same selection code path the real `onPolygonClick` uses. Add inside the `useEffect`, right after `globeRef.current = world;`:

```tsx
    // Test-only deterministic click + selection mirror. Guarded so it never ships behavior to prod UX.
    if (import.meta.env.MODE === 'test' || window.__ADMIN1_URL__) {
      (window as unknown as Record<string, unknown>).__globeClickRegion = (regionId: string) => {
        const target = featuresRef.current.find((f) => extractRegion(f).regionId === regionId);
        if (!target) return; // non-demo / filtered-out ids are a no-op
        const { country, regionId: id, regionName } = extractRegion(target);
        selectedId.current = id;
        world.polygonsData(featuresRef.current as object[]);
        el.setAttribute('data-selected-region', id);
        onRegionSelected(country, id, regionName);
      };
    }
```

  And extend the real `.onPolygonClick(...)` handler to also set the attribute for parity:

```tsx
      .onPolygonClick((poly: object) => {
        const { country, regionId, regionName } = extractRegion(poly as Admin1Feature);
        selectedId.current = regionId;
        world.polygonsData(featuresRef.current as object[]);
        el.setAttribute('data-selected-region', regionId);
        onRegionSelected(country, regionId, regionName);
      })
```

- [ ] Run the E2E suite. **Command:** `npm run e2e -- globe.spec.ts`
  **Expected (tail):** `4 passed` with the dev server + proxy started by Playwright's `webServer` config (F1 owns that config).

### E2E acceptance checklist (maps to spec §8.1)

- [ ] Globe canvas mounts (a `<canvas>` exists inside `[data-testid="globe-canvas"]`) and reaches `data-globe-ready="true"`.
- [ ] Clicking a USA state fires `onRegionSelected` with `country="USA"`, `regionId="US-CA"`, and a non-empty `regionName` (captured via the `window.__lastRegion` test hook).
- [ ] The selected region shows highlight styling (asserted via `data-selected-region` mirror attribute, since cap-color is WebGL-internal).
- [ ] Clicking a non-demo country (Ontario, filtered out) is a no-op: `window.__lastRegion` stays `null` and no `data-selected-region="CA-ON"` is set.

---

## Notes for the executing agent

- **Do not** add region *content* (facts, citations) — that is F3. F2 only emits identity (`country`, `regionId`, `regionName`).
- **Do not** edit `src/App.tsx` or `src/types.ts`. If the E2E test hook (`window.__lastRegion` set inside `App.tsx`'s `onRegionSelected` under test mode) is missing, surface it to F1 as a required ~3-line addition; do not implement it inside F2-owned files.
- Read prior learnings (correct `globe.gl` constructor signature, whether `three` needs separate install, exact `iso_3166_2` blanks in the real NE file) before starting, and append discovered specifics on completion.
- The `globe.gl` import is the default export factory: `import Globe from 'globe.gl'; const world = new Globe(domEl)`. The chained setters (`.polygonsData`, `.polygonCapColor`, etc.) each return the instance.
