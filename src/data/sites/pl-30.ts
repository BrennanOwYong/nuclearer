import type { CandidateSite } from '../../types';

/**
 * Candidate sites for Greater Poland Voivodeship, Poland (PL-30).
 *
 * Named sites web-verified:
 * - Pątnów Power Station (ZE PAK, Konin): lat 52.302, lng 18.237
 *   Source: globalenergyobservatory.org/geoid/40612; GEM.wiki Patnow power station
 * - Włocławek (OSGE priority BWRX-300 SMR site): city coordinates lat 52.648, lng 19.068
 *   Source: geodatos.net/Poland/Wloclawek; World Nuclear News "Site of Poland's first SMR selected"
 *   Note: PL-30 is Greater Poland Voivodeship. Włocławek city is in Kuyavian-Pomeranian
 *   Voivodeship (PL-04). However, the OSGE programme ties this site to the broader
 *   Polish coal-transition context; it is included here as a named site because the
 *   pl-patnow-smr corpus source (pl-30 region) explicitly references Włocławek as the
 *   priority BWRX-300 site alongside the Pątnów region. DEVIATION: Włocławek's strict
 *   administrative regionId is PL-04, not PL-30. Included here per the corpus reference
 *   in pl-30 region facts; the site file carries regionId PL-30 as authored in corpus.
 *   The F5a screening engine should note this administrative nuance.
 *
 * Greenfield zones grounded in PL-30 region facts (pl-greater-poland.ts):
 * - Gopło Lake western shore (new siting zone separate from Pątnów plant)
 * - Warta River corridor near Konin (inland, tower cooling)
 */
export const candidateSitesPL30: CandidateSite[] = [
  // ── Named: Pątnów Power Station — retiring lignite, Konin (ZE PAK) ──
  {
    id: 'pl-30-patnow-konin',
    country: 'POL',
    regionId: 'PL-30',
    name: 'Pątnów Power Station / Konin (ZE PAK coal-repower candidate)',
    kind: 'named',
    lat: 52.302,
    lng: 18.237,
    attributes: {
      availableFootprintHectares: 500,
      coolingSource: 'Lake Gopło (artificial cooling reservoir) + Warta River — Natura 2000 environmental constraints apply',
      waterAvailability: 'limited', // Natura 2000 sensitivity limits intake; tower cooling preferred
      gridDistanceKm: 0,    // existing 220/400 kV switchyards on-site (PSE backbone)
      populationDensity: 'low', // Konin city (~75,000) is ~10 km east; plant site is semi-rural
      hazards: ['seismic-none', 'subsidence-moderate'], // lignite open-pit subsidence risk requires geotechnical study
      landStatus: 'retiring coal (brownfield) — ZE PAK/Pątnów lignite complex; industrial land',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['BWR', 'iPWR', 'SFR', 'MSR'],
    citationIds: ['pl30-land-coal-repower', 'pl30-grid-interior', 'pl30-water-goplo', 'pl30-hazard-seismic', 'pl30-population', 'pl-patnow-smr'],
    confidence: 'medium',
  },

  // ── Named: Włocławek (OSGE priority BWRX-300 SMR site, Vistula River) ──
  // ADMINISTRATIVE NOTE: Włocławek is in PL-04 (Kuyavian-Pomeranian Voivodeship).
  // The pl-patnow-smr corpus source explicitly mentions Włocławek as the priority BWRX-300 site
  // under the same OSGE programme referenced in PL-30 region facts. Site included in PL-30 pool
  // per corpus alignment. See DEVIATION note in file header.
  {
    id: 'pl-30-wloclawek-smr',
    country: 'POL',
    regionId: 'PL-30',
    name: 'Włocławek BWRX-300 SMR Site (OSGE priority — Vistula River, Chempark area)',
    kind: 'named',
    lat: 52.648,
    lng: 19.068,  // Włocławek city center; exact Chempark industrial zone site pending OSGE disclosure
    attributes: {
      availableFootprintHectares: 80,  // compact BWRX-300 SMR (~4 ha per unit); industrial zone
      coolingSource: 'Vistula River (Wisła) — major Polish river; sufficient flow for tower cooling; EU WFD applies',
      waterAvailability: 'limited',    // river cooling viable but EU Water Framework Directive compliance required
      gridDistanceKm: 2,    // PSE 400 kV near Włocławek; existing industrial grid connection
      populationDensity: 'medium', // Włocławek city ~110,000 — BWRX-300 smaller EPZ makes this manageable
      hazards: ['seismic-none', 'flood-low'], // Vistula floodplain; site on elevated bank
      landStatus: 'industrial zone (Chempark / former chemical complex) — brownfield; OSGE government-approved SMR site',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['BWR'],  // BWRX-300 specifically; compact EPZ suits industrial zone
    citationIds: ['pl30-land-coal-repower', 'pl30-grid-interior', 'pl-patnow-smr', 'pl-prawo-atomowe'],
    confidence: 'medium',
  },

  // ── Named: Konin Thermal Power Station — retiring lignite (Konin ZE PAK) ──
  // Separate from Pątnów; smaller plant on Warta River, Konin; retiring units.
  // GEM.wiki Konin power station.
  {
    id: 'pl-30-konin-thermal',
    country: 'POL',
    regionId: 'PL-30',
    name: 'Konin Thermal Power Station (ZE PAK retiring coal — Warta River)',
    kind: 'named',
    lat: 52.215,  // Konin power station, southern Konin; // executor must verify from GEM.wiki Konin power station coordinates
    lng: 18.267,
    attributes: {
      availableFootprintHectares: 200,
      coolingSource: 'Warta River — moderate freshwater flow; tower cooling preferred; Natura 2000 sensitivity lower than Gopło',
      waterAvailability: 'limited',
      gridDistanceKm: 0,    // existing coal plant switchyard on-site
      populationDensity: 'medium', // Konin city periphery; SMR smaller EPZ advantageous
      hazards: ['seismic-none', 'subsidence-low'],
      landStatus: 'retiring coal (brownfield) — ZE PAK Konin plant; industrial/state land',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['BWR', 'iPWR', 'HTGR'],
    citationIds: ['pl30-land-coal-repower', 'pl30-grid-interior', 'pl30-water-goplo', 'pl-patnow-smr', 'pl-prawo-atomowe'],
    confidence: 'medium',
  },

  // ── Greenfield: Gopło Lake western shore (new siting zone) ──
  // West shore of Lake Gopło away from existing Pątnów plant; lake cooling option;
  // PSE 400 kV accessible from existing Pątnów switchyard (5 km); low population density.
  {
    id: 'pl-30-goplo-west-greenfield',
    country: 'POL',
    regionId: 'PL-30',
    name: 'Lake Gopło Western Shore Greenfield Zone (Greater Poland, new-site corridor)',
    kind: 'greenfield',
    lat: 52.350,
    lng: 18.100,  // western shore of Lake Gopło, rural agricultural land; // executor must verify Natura 2000 boundary
    attributes: {
      availableFootprintHectares: 400,
      coolingSource: 'Lake Gopło — freshwater; Natura 2000 constraints limit intake; cooling tower preferred',
      waterAvailability: 'limited',
      gridDistanceKm: 8,    // 400 kV PSE switchyard at Pątnów ~8 km east; // executor must verify
      populationDensity: 'low',
      hazards: ['seismic-none', 'subsidence-low'],
      landStatus: 'agricultural private land — Natura 2000 adjacency; Polish EIA and PAA screening required',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['BWR', 'iPWR', 'HTGR', 'SFR'],
    citationIds: ['pl30-grid-interior', 'pl30-water-goplo', 'pl30-population', 'pl-prawo-atomowe'],
    confidence: 'medium',
  },

  // ── Greenfield: Warta River corridor near Uniejów (inland, tower cooling) ──
  // Uniejów geothermal zone; Warta River provides modest freshwater cooling;
  // 400 kV PSE line runs nearby (~15 km to Kalisz node); very low population.
  {
    id: 'pl-30-warta-uniejow-greenfield',
    country: 'POL',
    regionId: 'PL-30',
    name: 'Warta River Corridor Greenfield Zone (near Uniejów — Greater Poland)',
    kind: 'greenfield',
    lat: 51.970,
    lng: 18.780,  // rural Warta River terrace south of Uniejów; // executor must verify flood zone
    attributes: {
      availableFootprintHectares: 300,
      coolingSource: 'Warta River — moderate freshwater; cooling tower required; EU WFD screening',
      waterAvailability: 'limited',
      gridDistanceKm: 15,   // 400 kV PSE via Kalisz substation; // executor must verify
      populationDensity: 'low',
      hazards: ['seismic-none', 'flood-low'],
      landStatus: 'agricultural private land — no known protected designation; standard Polish EIA required',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['BWR', 'iPWR', 'HTGR', 'MSR'],
    citationIds: ['pl30-grid-interior', 'pl30-water-goplo', 'pl30-population', 'pl30-pathway', 'pl-prawo-atomowe'],
    confidence: 'medium',
  },
];
