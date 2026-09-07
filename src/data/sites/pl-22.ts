import type { CandidateSite } from '../../types';

/**
 * Candidate sites for Pomeranian Voivodeship, Poland (PL-22).
 *
 * Named sites web-verified:
 * - Lubiatowo-Kopalino (Choczewo): The GEM.wiki / PEJ documentation places the site
 *   in Gmina Choczewo, ~2 km from the Baltic coast; Lubiatowo village is at approx.
 *   54.668°N, 17.776°E (source: Wikipedia Lubiatowo, Pomeranian Voivodeship; GEM.wiki
 *   Lubiatowo-Kopalino nuclear power plant). Site is ~1–2 km inland from the Baltic.
 *   Used: lat 54.668, lng 17.776. // executor must verify exact site centroid from PEJ EIA docs.
 *
 * Greenfield zones grounded in PL-22 region facts (pl-pomerania.ts):
 * - Eastern Pomerania coast (Ustka area) — Baltic seawater cooling; low population; PSE grid
 * - Inland Pomerania near Lębork — limited cooling, 400 kV PSE within reach, low population
 */
export const candidateSitesPL22: CandidateSite[] = [
  // ── Named: Lubiatowo-Kopalino — PAA-confirmed NPP site (PEJ / Westinghouse AP1000) ──
  {
    id: 'pl-22-lubiatowo-kopalino',
    country: 'POL',
    regionId: 'PL-22',
    name: 'Lubiatowo-Kopalino (Choczewo NPP site — PEJ / Westinghouse AP1000)',
    kind: 'named',
    lat: 54.668,  // Lubiatowo village coordinates; site is ~1 km south of Baltic shoreline
    lng: 17.776,  // // executor must verify exact centroid from PEJ EIA documentation
    attributes: {
      availableFootprintHectares: 700,  // large greenfield coastal strip (PEJ site boundary)
      coolingSource: 'Baltic Sea once-through seawater cooling (~7 ppt salinity, 1–2 km from site)',
      waterAvailability: 'abundant',
      gridDistanceKm: 80,   // new 400 kV lines to PSE backbone (Lębork/Gdańsk nodes) planned; ~80 km
      populationDensity: 'low', // Choczewo commune <6,000 residents; Lębork (~35,000) 25 km away
      hazards: ['seismic-none', 'storm-surge-low'], // Baltic Shield margin; very low seismicity; coastal storm-surge assessment needed
      landStatus: 'state-designated NPP site — PEJ land acquisition in progress; Polish Atomic Law (Prawo atomowe) licensing pathway',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR'],
    citationIds: ['pl22-land-coastal', 'pl22-grid-pse', 'pl22-water-baltic', 'pl22-hazard-seismic', 'pl22-population', 'pl-ppej', 'pl-site-lubiatowo'],
    confidence: 'high',
  },

  // ── Named: Żarnowiec — historic NPP site (construction halted 1990) ──
  // Construction of 4 × VVER-440 began 1982; halted 1990; site preserved, partial infrastructure remains.
  // Located on Lake Żarnowiec (natural cooling reservoir), Wejherowo County.
  // Coordinates: ~54.7°N, 18.0°E (Żarnowiec village, Gmina Gniewino, Wejherowo County).
  // Source: World Nuclear Association "Nuclear Power in Poland"; Wikipedia Żarnowiec Nuclear Power Plant.
  {
    id: 'pl-22-zarnowiec',
    country: 'POL',
    regionId: 'PL-22',
    name: 'Żarnowiec Historic NPP Site (Lake Żarnowiec, Gmina Gniewino)',
    kind: 'named',
    lat: 54.700,  // Żarnowiec village, Wejherowo County; // executor must verify from site survey
    lng: 18.100,
    attributes: {
      availableFootprintHectares: 400,
      coolingSource: 'Lake Żarnowiec (natural freshwater reservoir, ~14 km²) — pumped-storage hydro also present; limited salinity risk',
      waterAvailability: 'abundant',
      gridDistanceKm: 50,   // PSE 400 kV line to Gdańsk/Gdynia load center; ~50 km; // executor must verify
      populationDensity: 'low', // Gniewino commune <10,000; coastal rural
      hazards: ['seismic-none'],
      landStatus: 'former state NPP site — partial civil works remain; Polish State Treasury land; reactive if political will returns',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR'],
    citationIds: ['pl22-land-coastal', 'pl22-grid-pse', 'pl22-water-baltic', 'pl22-hazard-seismic', 'pl-ppej', 'pl-prawo-atomowe'],
    confidence: 'medium',
  },

  // ── Greenfield: Eastern Pomerania coast near Ustka ──
  // Baltic coastline 100 km east of Lubiatowo; low population; seawater cooling viable;
  // 400 kV PSE corridor passes through Słupsk (~50 km east).
  // Source layers: PSE ENTSO-E transmission map; EU Natura 2000 database (coastal forest areas).
  {
    id: 'pl-22-ustka-coast-greenfield',
    country: 'POL',
    regionId: 'PL-22',
    name: 'Eastern Pomerania Coast Greenfield Zone (near Ustka — Słupsk County)',
    kind: 'greenfield',
    lat: 54.590,  // rural coastal zone ~15 km west of Ustka; // executor must verify Natura 2000 boundaries
    lng: 16.600,
    attributes: {
      availableFootprintHectares: 300,
      coolingSource: 'Baltic Sea seawater once-through — coastal strip; same low-salinity advantage as Lubiatowo',
      waterAvailability: 'abundant',
      gridDistanceKm: 50,   // PSE 400 kV line via Słupsk substation ~50 km east; // executor must verify
      populationDensity: 'low',
      hazards: ['seismic-none', 'storm-surge-low'],
      landStatus: 'mixed state/private coastal land — Natura 2000 coastal forests nearby; environmental screening required',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR'],
    citationIds: ['pl22-land-coastal', 'pl22-grid-pse', 'pl22-water-baltic', 'pl22-pathway'],
    confidence: 'medium',
  },

  // ── Greenfield: Inland Pomerania — Lębork area (dry/tower cooling) ──
  // Agricultural inland zone ~25 km south of Lubiatowo; lower water access (no Baltic);
  // some river drainage (Łeba River); PSE 400 kV backbone within 30 km;
  // small SMR / HTGR more appropriate (no once-through).
  {
    id: 'pl-22-lebork-inland-greenfield',
    country: 'POL',
    regionId: 'PL-22',
    name: 'Inland Pomerania Greenfield Zone (Lębork area — agricultural plateau)',
    kind: 'greenfield',
    lat: 54.530,
    lng: 17.750,  // agricultural plateau south of Lębork city; // executor must verify parcel
    attributes: {
      availableFootprintHectares: 200,
      coolingSource: 'Łeba River (small freshwater; limited flow) — cooling tower required; no seawater access',
      waterAvailability: 'limited',
      gridDistanceKm: 30,   // PSE 400 kV via Lębork substation; // executor must verify
      populationDensity: 'low', // rural; Lębork city (~35,000) is ~20 km north
      hazards: ['seismic-none'],
      landStatus: 'agricultural private land — standard PAA permitting; no known protected designation',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['BWR', 'iPWR', 'HTGR', 'SFR', 'MSR'],
    citationIds: ['pl22-grid-pse', 'pl22-population', 'pl22-pathway', 'pl-prawo-atomowe'],
    confidence: 'medium',
  },

  // ── Greenfield: Trójmiejski coastline near Gdańsk Bay (industrial zone) ──
  // Gdańsk Bay coast near industrial Gdynia port area; existing deep-water infrastructure;
  // 400 kV PSE near Gdańsk (0 km). Higher population proximity requires larger exclusion analysis.
  {
    id: 'pl-22-gdansk-bay-industrial-greenfield',
    country: 'POL',
    regionId: 'PL-22',
    name: 'Gdańsk Bay Industrial Coastal Zone (greenfield screen, Trójmiasto fringe)',
    kind: 'greenfield',
    lat: 54.560,
    lng: 18.550,  // industrial coastal fringe south of Gdynia; // executor must verify Natura 2000 and EPZ radius
    attributes: {
      availableFootprintHectares: 150,
      coolingSource: 'Baltic/Gdańsk Bay seawater — brackish (less saline than open sea)',
      waterAvailability: 'abundant',
      gridDistanceKm: 2,    // PSE 400 kV in Gdańsk area directly adjacent
      populationDensity: 'medium', // Trójmiejski metro (>750,000); exclusion zone analysis critical
      hazards: ['seismic-none', 'flood-low'],
      landStatus: 'industrial port zone — Gdańsk Special Economic Zone; multi-use planning; complex permitting',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['iPWR', 'BWR', 'HTGR'],
    citationIds: ['pl22-grid-pse', 'pl22-water-baltic', 'pl22-population', 'pl-prawo-atomowe'],
    confidence: 'medium',
  },
];
