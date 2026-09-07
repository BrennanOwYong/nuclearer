import type { CandidateSite } from '../../types';

/**
 * Candidate sites for Illinois (US-IL).
 *
 * Named sites web-verified:
 * - Braidwood Nuclear: lat 41.2434, lng -88.2297
 *   Source: GEM.wiki / Wikipedia Braidwood Nuclear Generating Station
 * - Clinton Power Station: lat 40.1719, lng -88.8339
 *   Source: Wikipedia Clinton Power Station / GEM.wiki
 * - Dresden Nuclear: lat 41.3901, lng -88.2701
 *   Source: GEM.wiki Dresden nuclear power plant
 * - Quad Cities Nuclear (Cordova): lat 41.7261, lng -90.3103
 *   Source: GEM.wiki / gridinfo.com Quad Cities Generating Station
 *
 * Greenfield zones grounded in US-IL region facts (us-il.ts):
 * - Rural Clinton Lake area (DeWitt County) — expansion adjacent existing nuclear
 * - Mississippi River corridor (western IL) — existing grid; river cooling
 */
export const candidateSitesUSIL: CandidateSite[] = [
  // ── Named: Braidwood Nuclear — operating nuclear campus, Will County ──
  {
    id: 'us-il-braidwood',
    country: 'USA',
    regionId: 'US-IL',
    name: 'Braidwood Clean Energy Center (Constellation Energy, operating)',
    kind: 'named',
    lat: 41.2434,
    lng: -88.2297,
    attributes: {
      availableFootprintHectares: 400,  // 4,457-acre (1,804 ha) site; large footprint available
      coolingSource: 'Braidwood Lake (man-made cooling lake) + Illinois River drainage; CWA §316(b) applies',
      waterAvailability: 'abundant',
      gridDistanceKm: 0,        // 345 kV ComEd/PJM on-site
      populationDensity: 'low', // Braceville township; Will County suburban fringe; EPZ established
      hazards: ['seismic-low'],  // central craton; PGA < 0.05g
      landStatus: 'operating nuclear campus — Constellation Energy private land; brownfield expansion',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR', 'MSR'],
    citationIds: ['il-land-sites', 'il-grid-nuclear', 'il-water-lakes', 'il-hazard-seismic', 'il-population', 'us-cwa-316b'],
    confidence: 'high',
  },

  // ── Named: Clinton Power Station — operating nuclear, DeWitt County ──
  {
    id: 'us-il-clinton',
    country: 'USA',
    regionId: 'US-IL',
    name: 'Clinton Clean Energy Center (Constellation Energy, operating BWR)',
    kind: 'named',
    lat: 40.1719,
    lng: -88.8339,
    attributes: {
      availableFootprintHectares: 700,  // large rural site; Clinton Lake ~11,000 acres
      coolingSource: 'Clinton Lake (man-made cooling reservoir, 11,000 acres); river basin supply',
      waterAvailability: 'abundant',
      gridDistanceKm: 0,        // 345 kV MISO/PJM interconnect on-site
      populationDensity: 'low', // DeWitt County rural; Clinton city (~7,200) well outside EPZ
      hazards: ['seismic-low'],
      landStatus: 'operating nuclear campus — Constellation Energy; existing NRC license; expansion viable',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR', 'MSR'],
    citationIds: ['il-land-sites', 'il-grid-nuclear', 'il-water-lakes', 'il-population', 'us-nrc-10cfr100'],
    confidence: 'high',
  },

  // ── Named: Dresden Nuclear — operating nuclear, Grundy County ──
  {
    id: 'us-il-dresden',
    country: 'USA',
    regionId: 'US-IL',
    name: 'Dresden Clean Energy Center (Constellation Energy, Morris — Grundy County)',
    kind: 'named',
    lat: 41.3901,
    lng: -88.2701,
    attributes: {
      availableFootprintHectares: 250,
      coolingSource: 'Illinois River + Dresden Island cooling pond; CWA §316(b) intake permitted',
      waterAvailability: 'abundant',
      gridDistanceKm: 0,        // 345 kV ComEd/PJM on-site
      populationDensity: 'low', // Morris, IL (~14,000); rural Grundy County; established EPZ
      hazards: ['seismic-low'],
      landStatus: 'operating nuclear campus — Constellation Energy; brownfield SMR expansion candidate',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR', 'MSR'],
    citationIds: ['il-land-sites', 'il-grid-nuclear', 'il-water-lakes', 'il-population', 'us-cwa-316b'],
    confidence: 'high',
  },

  // ── Named: Quad Cities Nuclear — operating nuclear, Rock Island County ──
  {
    id: 'us-il-quad-cities',
    country: 'USA',
    regionId: 'US-IL',
    name: 'Quad Cities Clean Energy Center (Constellation Energy, Cordova IL)',
    kind: 'named',
    lat: 41.7261,
    lng: -90.3103,
    attributes: {
      availableFootprintHectares: 400,
      coolingSource: 'Mississippi River (once-through + cooling towers); CWA §316(b) intake permitted',
      waterAvailability: 'abundant',
      gridDistanceKm: 0,        // 345 kV MidAmerican/PJM on-site
      populationDensity: 'low', // Cordova rural; Quad Cities metro (400k+) is 20+ miles south
      hazards: ['seismic-low', 'flood-moderate'], // Mississippi River floodplain risk
      landStatus: 'operating nuclear campus — Constellation Energy; large-footprint expansion viable',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR', 'MSR'],
    citationIds: ['il-land-sites', 'il-grid-nuclear', 'il-water-lakes', 'il-population', 'us-cwa-316b'],
    confidence: 'high',
  },

  // ── Greenfield: Clinton Lake expansion zone — DeWitt/Logan County rural ──
  // Adjacent to Clinton Power Station site; rural farmland; existing 345 kV grid nearby;
  // Clinton Lake provides cooling supply; low population density.
  {
    id: 'us-il-clinton-lake-greenfield',
    country: 'USA',
    regionId: 'US-IL',
    name: 'Clinton Lake Rural Zone (greenfield, DeWitt County — expansion corridor)',
    kind: 'greenfield',
    lat: 40.1400,
    lng: -88.9000,  // rural farmland west of Clinton Lake; // executor must verify specific parcel
    attributes: {
      availableFootprintHectares: 600,
      coolingSource: 'Clinton Lake drainage basin; Sangamon River system; tower cooling preferred',
      waterAvailability: 'abundant',
      gridDistanceKm: 5,    // 345 kV MISO line within 5 km of Clinton campus
      populationDensity: 'low',
      hazards: ['seismic-low'],
      landStatus: 'agricultural private land — State of Illinois Climate & Equitable Jobs Act supportive; NRC siting study required',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR', 'MSR', 'HTGR'],
    citationIds: ['il-land-sites', 'il-grid-nuclear', 'il-water-lakes', 'il-pathway', 'us-nepa'],
    confidence: 'medium',
  },

  // ── Greenfield: Western Illinois Mississippi River corridor (Henderson/Mercer County) ──
  // Rural floodplain terrace above flood; 345 kV Ameren/PJM corridor; Mississippi cooling;
  // very low population density; agricultural land.
  {
    id: 'us-il-western-mississippi-greenfield',
    country: 'USA',
    regionId: 'US-IL',
    name: 'Western IL Mississippi River Corridor (greenfield, Henderson/Mercer County)',
    kind: 'greenfield',
    lat: 41.0000,
    lng: -90.7500,  // rural Henderson/Mercer County terrace above flood zone; // executor must verify FEMA FIRM map
    attributes: {
      availableFootprintHectares: 800,
      coolingSource: 'Mississippi River — once-through or tower; CWA §316(b) intake permitting required',
      waterAvailability: 'abundant',
      gridDistanceKm: 10,   // Ameren 345 kV corridor approximately 10 km from rural center; // executor must verify
      populationDensity: 'low', // Henderson County ~7,300 total; Mercer County ~15,000
      hazards: ['flood-moderate', 'seismic-low'], // FEMA Zone AE floodplain proximity; terrace siting needed
      landStatus: 'agricultural private land — state nuclear-supportive policy; large-footprint viable',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR', 'MSR'],
    citationIds: ['il-land-sites', 'il-grid-nuclear', 'il-water-lakes', 'il-pathway', 'us-cwa-316b', 'us-nepa'],
    confidence: 'medium',
  },
];
