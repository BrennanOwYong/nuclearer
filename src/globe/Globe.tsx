// src/globe/Globe.tsx
import { useEffect, useRef } from 'react';
import GlobeGL, { type GlobeInstance } from 'globe.gl';
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
  /** FROZEN globe event (PRD §5). Fired on click of a demo-country admin-1 region. */
  onRegionSelected: (country: string, regionId: string, regionName: string) => void;
  /** Reserved for F6 dynamic layout. Slides the globe container left when true. F2 only accepts/forwards it. */
  shifted?: boolean;
}

declare global {
  interface Window {
    /** E2E hook: lets Playwright point the globe at a small fixture instead of the live CDN. */
    __ADMIN1_URL__?: string;
    /** E2E hook: deterministic programmatic click by regionId. */
    __globeClickRegion?: (regionId: string) => void;
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

    const world = new GlobeGL(el)
      .backgroundColor('#020617')           // near-black space
      .showAtmosphere(true)
      .atmosphereColor('#1e3a8a')
      .atmosphereAltitude(0.18)
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
        el.setAttribute('data-selected-region', regionId);
        onRegionSelected(country, regionId, regionName);
      });

    globeRef.current = world;

    // Globe stays still by default; user drives rotation by dragging. Damping
    // keeps drag-spin smooth. (Auto-rotate disabled per project-owner request.)
    const controls = world.controls();
    controls.autoRotate = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Responsive sizing.
    const resize = () => {
      world.width(el.clientWidth).height(el.clientHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    // Test-only deterministic click + selection mirror.
    // Guarded so it only activates when a test fixture URL is set.
    if (window.__ADMIN1_URL__) {
      window.__globeClickRegion = (regionId: string) => {
        const target = featuresRef.current.find((f) => extractRegion(f).regionId === regionId);
        if (!target) return; // non-demo / filtered-out ids are a no-op
        const { country, regionId: id, regionName } = extractRegion(target);
        selectedId.current = id;
        world.polygonsData(featuresRef.current as object[]);
        el.setAttribute('data-selected-region', id);
        onRegionSelected(country, id, regionName);
      };
    }

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

        // Re-register test helper AFTER features are loaded so __globeClickRegion
        // has access to the populated featuresRef.
        if (window.__ADMIN1_URL__) {
          window.__globeClickRegion = (regionId: string) => {
            const target = featuresRef.current.find((f) => extractRegion(f).regionId === regionId);
            if (!target) return;
            const { country, regionId: id, regionName } = extractRegion(target);
            selectedId.current = id;
            world.polygonsData(featuresRef.current as object[]);
            el.setAttribute('data-selected-region', id);
            onRegionSelected(country, id, regionName);
          };
        }
      })
      .catch((err) => {
        console.error('[Globe] failed to load admin-1 GeoJSON', err);
        el.setAttribute('data-globe-error', 'true');
      });

    return () => {
      cancelled = true;
      window.removeEventListener('resize', resize);
      if (window.__globeClickRegion) {
        delete window.__globeClickRegion;
      }
      try {
        world._destructor();
      } catch {
        // ignore cleanup errors
      }
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
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
}

export default Globe;
