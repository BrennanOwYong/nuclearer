import type { CandidateSite } from '../../types';

/**
 * Candidate sites for Wyoming (US-WY).
 *
 * Named sites web-verified:
 * - Naughton/Kemmerer (TerraPower Natrium): lat 41.7571, lng -110.5974
 *   Source: GEM.wiki / VirtualGlobetrotting (Naughton Power Plant article)
 * - Dave Johnston / Glenrock: lat 42.8396, lng -105.7769
 *   Source: GEM.wiki Dave Johnston Power Plant article
 * - Wyodak / Gillette: lat 44.2886, lng -105.3851
 *   Source: GEM.wiki Wyodak Power Plant article
 *
 * Greenfield zones grounded in US-WY region facts (us-wy.ts):
 * - Southern WY corridor near Rawlins (existing 230 kV, BLM land, very low population)
 * - Wind River basin / Jeffrey City area (BLM, low pop, existing HV corridor remnants)
 */
export const candidateSitesUSWY: CandidateSite[] = [
  // ── Named: Naughton / Kemmerer — TerraPower Natrium (under construction) ──
  {
    id: 'us-wy-naughton-kemmerer',
    country: 'USA',
    regionId: 'US-WY',
    name: 'Naughton Plant / Kemmerer (TerraPower Natrium site)',
    kind: 'named',
    lat: 41.7571,
    lng: -110.5974,
    attributes: {
      availableFootprintHectares: 180,
      coolingSource: 'Hams Fork River (dry/hybrid cooling tower; once-through impractical)',
      waterAvailability: 'limited',
      gridDistanceKm: 0,        // existing 230 kV switchyard on-site (PacifiCorp NorthernGrid)
      populationDensity: 'low', // Kemmerer ~2,700 residents; Lincoln County ~19,000
      hazards: ['seismic-low'], // PGA 0.05–0.1g at 2%/50yr (Kemmerer area)
      landStatus: 'retiring coal (brownfield) — PacifiCorp Naughton Plant; private/industrial',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['SFR', 'BWR', 'iPWR', 'HTGR', 'MSR'],
    citationIds: ['wy-land-coal-repower', 'wy-grid-baseload', 'wy-water-arid', 'wy-pathway'],
    confidence: 'high',
  },

  // ── Named: Dave Johnston Plant / Glenrock — retiring coal, North Platte River ──
  {
    id: 'us-wy-dave-johnston-glenrock',
    country: 'USA',
    regionId: 'US-WY',
    name: 'Dave Johnston Plant / Glenrock (retiring coal brownfield)',
    kind: 'named',
    lat: 42.8396,
    lng: -105.7769,
    attributes: {
      availableFootprintHectares: 280,
      coolingSource: 'North Platte River (existing cooling water rights; CWA §316(b) friction)',
      waterAvailability: 'limited',
      gridDistanceKm: 0,        // existing 230 kV switchyard on-site (PacifiCorp)
      populationDensity: 'low', // Glenrock ~2,400 residents; Converse County ~17,000
      hazards: ['seismic-low'],
      landStatus: 'retiring coal (brownfield) — PacifiCorp Dave Johnston; private/industrial',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['BWR', 'iPWR', 'SFR', 'MSR', 'HTGR'],
    citationIds: ['wy-land-coal-repower', 'wy-grid-baseload', 'wy-water-arid', 'us-cwa-316b'],
    confidence: 'high',
  },

  // ── Named: Wyodak Plant / Gillette — retiring coal, large footprint ──
  {
    id: 'us-wy-wyodak-gillette',
    country: 'USA',
    regionId: 'US-WY',
    name: 'Wyodak Plant / Gillette (retiring coal brownfield, Campbell County)',
    kind: 'named',
    lat: 44.2886,
    lng: -105.3851,
    attributes: {
      availableFootprintHectares: 350,
      coolingSource: 'Belle Fourche River (limited; dry cooling preferred; CWA §316(b) applies)',
      waterAvailability: 'limited',
      gridDistanceKm: 0,        // existing 230 kV switchyard (PacifiCorp/Black Hills)
      populationDensity: 'low', // Gillette ~32,000 — largest nearby city; site is rural
      hazards: ['seismic-low'],
      landStatus: 'retiring coal (brownfield) — PacifiCorp/Black Hills Wyodak; private/industrial',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['BWR', 'iPWR', 'SFR', 'HTGR', 'MSR', 'microreactor'],
    citationIds: ['wy-land-coal-repower', 'wy-grid-baseload', 'wy-water-arid', 'us-cwa-316b'],
    confidence: 'high',
  },

  // ── Greenfield: Southern Wyoming BLM corridor near Rawlins ──
  // Carbon County; BLM land; 230 kV transmission (TransWest/PacifiCorp) within 5 km;
  // very low population; no perennial rivers → dry/hybrid cooling only.
  // Source layers: USGS NLCD (land cover), BLM surface-management map, WECC transmission atlas.
  {
    id: 'us-wy-rawlins-blm-greenfield',
    country: 'USA',
    regionId: 'US-WY',
    name: 'Southern Wyoming BLM Zone — Carbon County (greenfield, Rawlins corridor)',
    kind: 'greenfield',
    lat: 41.7900,  // approximate center of BLM zone SW of Rawlins; // executor must verify exact parcel
    lng: -107.8000,
    attributes: {
      availableFootprintHectares: 1000, // BLM surface; large parcel; // executor must verify acreage from BLM LR2000
      coolingSource: 'dry/air-cooled only — no perennial surface water; arid high desert',
      waterAvailability: 'none',
      gridDistanceKm: 5,     // 230 kV TransWest/PacifiCorp corridor approximately 5 km east
      populationDensity: 'low', // Carbon County density ~0.4 persons/km²
      hazards: ['seismic-low', 'wind-high'], // high-wind desert; seismic negligible
      landStatus: 'BLM federal land (public surface) — federal ROD permitting required',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['HTGR', 'microreactor', 'SFR'],
    citationIds: ['wy-land-coal-repower', 'wy-water-arid', 'wy-population', 'us-nepa'],
    confidence: 'medium',
  },

  // ── Greenfield: Wind River Basin / Jeffrey City corridor ──
  // Fremont County; BLM land (historic uranium mining area); existing HV line remnants;
  // very low population; semi-arid, no perennial river cooling → dry only.
  {
    id: 'us-wy-wind-river-jeffrey-city',
    country: 'USA',
    regionId: 'US-WY',
    name: 'Wind River Basin / Jeffrey City BLM Zone (greenfield, Fremont County)',
    kind: 'greenfield',
    lat: 42.4900,  // Jeffrey City area, Fremont County; // executor must verify exact parcel centroid
    lng: -107.8300,
    attributes: {
      availableFootprintHectares: 800,
      coolingSource: 'dry/air-cooled only — Wind River flows seasonally; no reliable intake source',
      waterAvailability: 'none',
      gridDistanceKm: 20,   // nearest 230 kV (~20 km to Muddy Creek substation area); // executor must verify
      populationDensity: 'low', // Fremont County <40,000 total; Jeffrey City ghost town
      hazards: ['seismic-low'],
      landStatus: 'BLM federal land — historic uranium mining; brownfield characterization may be needed',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['HTGR', 'microreactor', 'SFR'],
    citationIds: ['wy-land-coal-repower', 'wy-water-arid', 'wy-population', 'us-nepa'],
    confidence: 'medium',
  },

  // ── Greenfield: North Platte River corridor near Casper ──
  // Natrona County; private/BLM mix; 230 kV on existing corridor (PacifiCorp);
  // North Platte offers limited river cooling (senior rights held); low-medium population density.
  {
    id: 'us-wy-casper-north-platte-greenfield',
    country: 'USA',
    regionId: 'US-WY',
    name: 'Casper Area / North Platte River Corridor (greenfield, Natrona County)',
    kind: 'greenfield',
    lat: 42.6900,  // rural area north of Casper toward Salt Creek; // executor must verify
    lng: -106.3500,
    attributes: {
      availableFootprintHectares: 500,
      coolingSource: 'North Platte River — senior water rights constrained; hybrid cooling preferred',
      waterAvailability: 'limited',
      gridDistanceKm: 8,    // 230 kV PacifiCorp lines in North Platte corridor
      populationDensity: 'low', // Casper (~58,000) is 30+ km south; rural site
      hazards: ['seismic-low'],
      landStatus: 'BLM/private mix — state trust lands and BLM parcels; NRC siting study required',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['SFR', 'BWR', 'iPWR', 'HTGR', 'MSR'],
    citationIds: ['wy-land-coal-repower', 'wy-water-arid', 'wy-grid-baseload', 'us-cwa-316b', 'us-nepa'],
    confidence: 'medium',
  },
];
