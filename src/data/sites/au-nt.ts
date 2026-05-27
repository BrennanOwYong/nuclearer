import type { CandidateSite } from '../../types';

/**
 * Candidate sites for Northern Territory (AU-NT).
 *
 * ALL candidates carry the EPBC s.140A + ARPANS s.10 ban citations.
 * The site-finder screen returns all-fail for AU-NT per the statutory prohibition.
 * The NT also compounds with three independent fatal constraints: grid isolation
 * (no NEM connection), extreme interior water scarcity, and Aboriginal land rights
 * covering ~50% of territory (Aboriginal Land Rights (NT) Act 1976).
 *
 * Named sites web-verified:
 * - Darwin / Channel Island Power Station: Territory Generation gas turbines on Channel
 *   Island, Darwin Harbour. Darwin coords: lat -12.461, lng 130.842.
 *   Channel Island ~12.5°S, 130.9°E. Source: Territory Generation website; Darwin coordinates
 *   from geodatos.net/Australia/Northern Territory/Darwin.
 *
 * Greenfield zones grounded in AU-NT region facts (au-nt.ts):
 * - Barkly Tablelands (remote inland) — flat, low population, no water, no grid
 * - Darwin industrial zone (Channel Island / East Arm) — existing grid; seawater cooling;
 *   but grid too small (DKIS ~600 MW) for any SMR, and population too close for large plant
 */
export const candidateSitesAUNT: CandidateSite[] = [
  // ── Named: Channel Island Power Station site (Darwin — existing grid node) ──
  // Territory Generation gas-turbine station on Channel Island, Darwin Harbour.
  // Only meaningful grid connection point in NT (DKIS ~600 MW peak demand).
  // Named as a conceptual coal/gas-to-nuclear site — no coal plant exists in NT,
  // but this is the only existing grid node with seawater cooling proximity.
  {
    id: 'au-nt-channel-island-darwin',
    country: 'AUS',
    regionId: 'AU-NT',
    name: 'Channel Island Power Station / Darwin (gas turbine site — DKIS grid)',
    kind: 'named',
    lat: -12.500,
    lng: 130.900,  // Channel Island, Darwin Harbour; // executor must verify Territory Generation site boundary
    attributes: {
      availableFootprintHectares: 30,
      coolingSource: 'Darwin Harbour seawater — tidal; tropical cyclone design requirements apply',
      waterAvailability: 'abundant',  // seawater; potable water scarce
      gridDistanceKm: 0,     // DKIS grid hub — but total demand only ~600 MW; any SMR would exceed local absorption
      populationDensity: 'low', // island site; Darwin city (~145,000) 12 km north
      hazards: ['cyclone-high', 'seismic-low'], // Cyclone Tracy (1974); design wind speed ~70 m/s
      landStatus: 'government utility land — Territory Generation; Darwin Harbour marine zone; Commonwealth environmental assessment required',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['microreactor'],  // grid too small for SMR; legally moot regardless
    citationIds: ['nt-grid-isolated', 'nt-pathway-ban', 'au-epbc-140a', 'au-arpans-10'],
    confidence: 'medium',
  },

  // ── Named: Palmerston Industrial Zone (Darwin satellite city — East Arm Port precinct) ──
  // East Arm Port / Palmerston: NT's industrial hub; gas pipelines, LNG export facilities.
  // Existing grid tie to DKIS; Darwin Harbour tidal cooling.
  // Source: Darwin Regional Land Use Plan (DIPE 2015); Port of Darwin industrial zone.
  {
    id: 'au-nt-palmerston-east-arm',
    country: 'AUS',
    regionId: 'AU-NT',
    name: 'East Arm / Palmerston Industrial Zone (Darwin satellite — LNG precinct)',
    kind: 'named',
    lat: -12.550,
    lng: 130.950,  // East Arm Port / Palmerston industrial precinct; // executor must verify DIPE zoning boundary
    attributes: {
      availableFootprintHectares: 100,
      coolingSource: 'Darwin Harbour / East Arm tidal seawater — existing LNG water intake infrastructure nearby',
      waterAvailability: 'abundant',  // seawater only; potable freshwater dependent on Darwin Water
      gridDistanceKm: 5,     // DKIS 132 kV from Darwin; small grid (600 MW) insufficient for SMR output
      populationDensity: 'low', // industrial zone; Palmerston (~32,000) is adjacent
      hazards: ['cyclone-high', 'seismic-low'],
      landStatus: 'industrial Crown land — NT Government; LNG/gas infrastructure; complex permitting; nuclear banned',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['microreactor'],  // legally moot; grid constraint is independent fatal
    citationIds: ['nt-grid-isolated', 'nt-pathway-ban', 'au-epbc-140a', 'au-arpans-10'],
    confidence: 'medium',
  },

  // ── Greenfield: Barkly Tablelands remote interior (hyper-arid, no grid) ──
  // Vast flat grassland; ~19°S, 135°E (Tennant Creek / Barkly Tableland area).
  // Near-zero population; no NEM grid; no perennial water; dry-cooling required;
  // Aboriginal land rights cover significant portions (~50% NT).
  // Source: Barkly Tableland Wikipedia; NT Interior Water resource info (au-interior-water corpus).
  {
    id: 'au-nt-barkly-tablelands-remote',
    country: 'AUS',
    regionId: 'AU-NT',
    name: 'Barkly Tablelands Remote Zone (greenfield — interior outback, no grid/water)',
    kind: 'greenfield',
    lat: -19.500,  // approximate Barkly Tablelands centre; // executor must verify Aboriginal Land Rights overlay
    lng: 135.000,
    attributes: {
      availableFootprintHectares: 10000,
      coolingSource: 'dry/air-cooled only — no perennial surface water; median rainfall < 300 mm/yr; Cambrian Limestone Aquifer stressed',
      waterAvailability: 'none',
      gridDistanceKm: 1000,  // no NEM connection; nearest grid node ~1,000 km; major HVDC build required
      populationDensity: 'low', // ~0.02 persons/km²; Aboriginal communities present
      hazards: ['heat-extreme', 'seismic-low'], // > 40°C summer; reduces dry-cooling efficiency severely
      landStatus: 'NT Crown land / Aboriginal freehold — ~50% of NT is Aboriginal land under Aboriginal Land Rights (NT) Act 1976; FPIC required; nuclear banned',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['microreactor', 'HTGR', 'SFR'],  // legally moot; physical attributes constrain to dry-cool types
    citationIds: ['nt-land-outback', 'nt-grid-isolated', 'nt-water-scarce', 'nt-pathway-ban', 'au-epbc-140a', 'au-arpans-10', 'au-interior-water'],
    confidence: 'medium',
  },

  // ── Greenfield: Katherine River area (NT south of Darwin) ──
  // Katherine is the southern end of the DKIS grid (~315 km from Darwin).
  // Katherine River provides limited freshwater (seasonal tropical).
  // Katherine town ~10,000; Aboriginal communities in surrounding area.
  {
    id: 'au-nt-katherine-river-corridor',
    country: 'AUS',
    regionId: 'AU-NT',
    name: 'Katherine River Corridor (greenfield screen — southern DKIS fringe)',
    kind: 'greenfield',
    lat: -14.467,  // Katherine town coordinates; industrial fringe site on river; // executor must verify seasonal flow data
    lng: 132.264,
    attributes: {
      availableFootprintHectares: 200,
      coolingSource: 'Katherine River — seasonal tropical river; highly variable flow (wet: abundant, dry: minimal); not reliable for continuous cooling',
      waterAvailability: 'limited',  // wet-season abundant; dry-season scarce; cooling tower design required
      gridDistanceKm: 0,    // southern end of DKIS 132 kV; ~600 MW total NT system — grid absorption impossible for any SMR
      populationDensity: 'low', // Katherine town (~10,000); surrounding Aboriginal communities
      hazards: ['flood-high', 'heat-extreme', 'seismic-low'], // Katherine floods frequently in wet season
      landStatus: 'Crown land / pastoral lease — Jawoyn and Dagoman Aboriginal country; FPIC obligations; nuclear banned',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['microreactor'],  // legally moot; grid and water are independent fatal constraints
    citationIds: ['nt-grid-isolated', 'nt-water-scarce', 'nt-pathway-ban', 'au-epbc-140a', 'au-arpans-10', 'au-interior-water'],
    confidence: 'medium',
  },

  // ── Greenfield: Tennant Creek area (remote central NT — mineral province) ──
  // Historic mining hub; rare earth and copper deposits; remotest point from Darwin grid.
  // No water; no grid; representative of why NT is non-viable even before legal ban.
  {
    id: 'au-nt-tennant-creek-remote',
    country: 'AUS',
    regionId: 'AU-NT',
    name: 'Tennant Creek Area (greenfield screen — central NT mineral province)',
    kind: 'greenfield',
    lat: -19.650,
    lng: 134.190,  // Tennant Creek town coordinates; // executor must verify Aboriginal land boundaries
    attributes: {
      availableFootprintHectares: 2000,
      coolingSource: 'dry/air-cooled only — no perennial surface water; Tennant Creek receives ~400 mm/yr rainfall (highly seasonal)',
      waterAvailability: 'none',
      gridDistanceKm: 500,  // isolated diesel micro-grid; not connected to DKIS or NEM
      populationDensity: 'low', // ~3,000 residents; Barkly Tableland Aboriginal communities
      hazards: ['heat-extreme', 'seismic-low'],
      landStatus: 'NT Crown land / Aboriginal land — Warumungu country; pastoral leases; nuclear banned; FPIC required',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['microreactor'],  // legally moot
    citationIds: ['nt-land-outback', 'nt-grid-isolated', 'nt-water-scarce', 'nt-population', 'nt-pathway-ban', 'au-epbc-140a', 'au-arpans-10'],
    confidence: 'medium',
  },
];
