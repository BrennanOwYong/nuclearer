import type { CandidateSite } from '../../types';

/**
 * Candidate sites for South Australia (AU-SA).
 *
 * ALL candidates carry the EPBC s.140A + ARPANS s.10 ban citations.
 * The site-finder screen returns all-fail for AU-SA per the statutory prohibition.
 * These candidates are prepared to demonstrate what a screen looks like when
 * the legal layer overrides all physical merit.
 *
 * Named sites web-verified:
 * - Northern Power Station (Port Augusta): demolished 2016; site at Port Paterson,
 *   ~6 km south of Port Augusta city centre. Port Augusta city: lat -32.496, lng 137.773.
 *   Northern Power Station was at Port Paterson (approx. lat -32.550, lng 137.760).
 *   Source: Wikipedia Northern Power Station (South Australia); GEM.wiki Northern Augusta power station.
 * - Playford B (Port Augusta): former coal, adjacent to Northern; similar coordinates.
 *   Source: Wikipedia Playford B Power Station.
 *
 * Greenfield zones grounded in AU-SA region facts (au-sa.ts):
 * - Eyre Peninsula coastal zone (Spencer Gulf) — seawater cooling; identified in
 *   nuclearforclimate.com.au and Dutton Coalition nuclear plan as candidate zone.
 *   Potential site SW of Port Augusta: lat -32.562, lng 137.738 (source: nuclearforclimate.com.au
 *   South Australian locations for small nuclear power plants).
 * - Outback interior (hyper-arid) — water:none, dry-cooling only; no protected area specifically,
 *   but indigenous land rights may apply.
 */
export const candidateSitesAUSA: CandidateSite[] = [
  // ── Named: Northern Power Station site (Port Augusta — retired coal, Spencer Gulf) ──
  {
    id: 'au-sa-port-augusta-northern',
    country: 'AUS',
    regionId: 'AU-SA',
    name: 'Northern Power Station Site / Port Augusta (retired coal brownfield)',
    kind: 'named',
    lat: -32.550,  // Port Paterson, ~6 km south of Port Augusta; // executor must verify from Playford/Northern site survey
    lng: 137.760,
    attributes: {
      availableFootprintHectares: 200,
      coolingSource: 'Spencer Gulf (tidal inlet) — seawater cooling within ~2 km; established cooling water rights from prior coal plant',
      waterAvailability: 'abundant', // coastal Spencer Gulf seawater access
      gridDistanceKm: 0,     // ElectraNet 275 kV transmission on-site (former coal plant switchyard)
      populationDensity: 'low', // Port Augusta city (~14,000) is 6 km north
      hazards: ['seismic-low'], // Flinders Ranges intraplate seismicity; site on coastal plain
      landStatus: 'retired coal (brownfield) — state-owned land; demolished; site available for adaptive reuse',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR'],  // legally moot: all fail due to ban
    citationIds: ['sa-land-arid', 'sa-grid-renewables', 'sa-water-scarce', 'sa-pathway-ban', 'au-epbc-140a', 'au-arpans-10'],
    confidence: 'medium',
  },

  // ── Named: Playford B Power Station site (Port Augusta — retired coal) ──
  // Adjacent to Northern Power Station; demolished; same grid/water infrastructure area.
  // Source: Wikipedia Playford B Power Station; GEM.wiki.
  {
    id: 'au-sa-port-augusta-playford',
    country: 'AUS',
    regionId: 'AU-SA',
    name: 'Playford B Power Station Site / Port Augusta (retired coal, ElectraNet grid)',
    kind: 'named',
    lat: -32.540,
    lng: 137.755,  // adjacent to Northern station; // executor must verify exact Playford B site boundary
    attributes: {
      availableFootprintHectares: 150,
      coolingSource: 'Spencer Gulf seawater (via Northern Power Station shared cooling infrastructure corridor)',
      waterAvailability: 'abundant',
      gridDistanceKm: 0,     // ElectraNet 275 kV — shared switchyard with Northern site
      populationDensity: 'low',
      hazards: ['seismic-low'],
      landStatus: 'retired coal (brownfield) — state land; same Port Paterson precinct as Northern station',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR'],  // legally moot
    citationIds: ['sa-land-arid', 'sa-grid-renewables', 'sa-water-scarce', 'sa-pathway-ban', 'au-epbc-140a', 'au-arpans-10'],
    confidence: 'medium',
  },

  // ── Greenfield: Eyre Peninsula coastal zone (Spencer Gulf seawater) ──
  // Identified in nuclearforclimate.com.au SA nuclear locations as potential siting zone.
  // Lat -32.562, lng 137.738 (SW of Port Augusta on Spencer Gulf coast) cited directly.
  // Near ElectraNet transmission lines from decommissioned Northern/Playford plants.
  {
    id: 'au-sa-eyre-peninsula-spencer-gulf',
    country: 'AUS',
    regionId: 'AU-SA',
    name: 'Eyre Peninsula / Spencer Gulf Coastal Zone (greenfield screen)',
    kind: 'greenfield',
    lat: -32.562,  // from nuclearforclimate.com.au SA locations; 2 km from Spencer Gulf inlet
    lng: 137.738,
    attributes: {
      availableFootprintHectares: 500,
      coolingSource: 'Spencer Gulf seawater — ~2 km to inlet; established coastal zone',
      waterAvailability: 'abundant',
      gridDistanceKm: 5,    // on route of ElectraNet transmission from decommissioned Playford/Northern switchyards
      populationDensity: 'low',
      hazards: ['seismic-low'],
      landStatus: 'pastoral/Crown land — SA Crown Lands Act; nuclear development statutorily prohibited',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['PWR', 'BWR', 'iPWR', 'SFR'],  // legally moot
    citationIds: ['sa-land-arid', 'sa-water-scarce', 'sa-grid-renewables', 'sa-pathway-ban', 'au-epbc-140a', 'au-arpans-10', 'au-sa-prohibition'],
    confidence: 'medium',
  },

  // ── Greenfield: Outback SA (hyper-arid, dry-cooling only) ──
  // Remote SA interior; vast Crown land; no surface water; dry cooling required;
  // in practice: no grid connection without major HVDC build;
  // Aboriginal heritage areas may apply in specific parcels.
  {
    id: 'au-sa-outback-hyper-arid',
    country: 'AUS',
    regionId: 'AU-SA',
    name: 'SA Outback Interior (greenfield — hyper-arid, remote, no grid)',
    kind: 'greenfield',
    lat: -30.000,  // representative central SA outback zone; // executor must verify specific parcel + heritage overlay
    lng: 136.000,
    attributes: {
      availableFootprintHectares: 5000,
      coolingSource: 'dry/air-cooled only — no surface water; hyper-arid (< 200 mm/yr rainfall)',
      waterAvailability: 'none',
      gridDistanceKm: 500,  // no NEM connection; nearest ElectraNet node ~500 km; major HVDC build required
      populationDensity: 'low',
      hazards: ['heat-extreme', 'seismic-low'], // > 40°C summer ambient; reduces dry-cooling efficiency
      landStatus: 'Crown land / pastoral lease — potential Aboriginal heritage overlay; nuclear banned regardless',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['HTGR', 'microreactor', 'SFR'],  // legally moot; physical attributes only admit these
    citationIds: ['sa-land-arid', 'sa-water-scarce', 'sa-hazard-stable', 'sa-pathway-ban', 'au-epbc-140a', 'au-arpans-10'],
    confidence: 'medium',
  },

  // ── Greenfield: Adelaide metropolitan fringe (Osborne industrial zone) ──
  // Port River / Osborne industrial precinct near Adelaide; best grid access in SA;
  // Gulf St Vincent seawater cooling viable; but population proximity increases EPZ pressure.
  {
    id: 'au-sa-osborne-industrial-greenfield',
    country: 'AUS',
    regionId: 'AU-SA',
    name: 'Osborne Industrial Precinct / Adelaide (greenfield screen — Port River)',
    kind: 'greenfield',
    lat: -34.810,
    lng: 138.490,  // Osborne / Port River industrial zone, Adelaide NW; // executor must verify EPZ radius for population
    attributes: {
      availableFootprintHectares: 80,
      coolingSource: 'Gulf St Vincent seawater via Port River — existing industrial water intake infrastructure',
      waterAvailability: 'abundant',
      gridDistanceKm: 1,    // ElectraNet 275 kV adjacent industrial precinct
      populationDensity: 'high', // Adelaide metro ~1.4M within EPZ radius — hard population constraint
      hazards: ['seismic-low', 'flood-low'],
      landStatus: 'industrial Crown/state land — defence precincts (HMAS Stirling); complex multi-agency permitting; nuclear banned',
      protectedAreaFlag: false,
    },
    suitableTechnologies: ['iPWR', 'microreactor'],  // legally moot; population constraint also severe
    citationIds: ['sa-grid-renewables', 'sa-water-scarce', 'sa-population', 'sa-pathway-ban', 'au-epbc-140a', 'au-arpans-10', 'au-sa-prohibition'],
    confidence: 'medium',
  },
];
