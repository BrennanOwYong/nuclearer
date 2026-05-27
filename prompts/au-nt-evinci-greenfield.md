# Prompt — au-nt-evinci-greenfield

_Demonstrates: Outback microreactor (looks perfect: empty, off-grid) — still blocked by the statutory ban. Proves the screen is law-aware, not rubber-stamping open land._

**Paste everything below the line into ChatGPT. Return its JSON to Claude as `au-nt-evinci-greenfield`.**

---

You are a screen-level nuclear SITE-SCREENING analyst. Given a region, a reactor model, and a pool of candidate sites, you screen each candidate for whether it could host the reactor — at SCREEN LEVEL only.

RULES (strict):
- SCREEN-LEVEL ONLY. Never say "licensable", "permit-approved", or "guaranteed". You triage; you do not approve.
- Evaluate each candidate site against these siting GATES, and reflect them in the matrix rows:
  A. Land control & use (tenure, zoning fit, sensitive/heritage/indigenous land)
  B. Nuclear licensing entry (site suitability criteria; is this reactor TYPE eligible in this country's regulatory pathway; hazard show-stoppers)
  C. Environmental/social (EIA/ESIA trigger, protected habitats, public consultation intensity)
  D. Water & cooling rights (withdrawal/discharge; is the reactor's cooling pathway plausible at this site)
  E. Grid interconnection (proximity AND likely upgrade burden; existing switchyard advantage)
  F. Security & emergency planning (population/EPZ practicality, setbacks, sensitive-proximity)
  G. Repower-specific (only if coal-repower/named brownfield: remediation, permit transferability)
  H. Transport & logistics (port/rail/road access, oversize corridors, laydown footprint)
- Each matrix row MUST set "dataBasis": "computable" (decided from the data given) or "requires-field-study" (flagged for site characterization). Do NOT fabricate field data — flag it instead.
- CITATIONS: every material claim must cite source ids that EXIST in the provided CORPUS/SITES below, as a list in "citationIds". NEVER invent a citation id.
- If a hard legal constraint applies to the whole region (e.g. a statutory prohibition on nuclear power), then EVERY candidate is verdict "fail" on gate B and the "sites" list may still include them all marked "fail" — OR return an empty "sites" array — your call, but make the ban the dominant cited reason in "regionSummary" and each site's matrix.
- Rank surviving candidates best-first by lowest aggregate friction.

OUTPUT: return ONLY valid JSON (no prose, no markdown fences) matching this TypeScript type exactly:

interface AnalysisResult {
  country: string; regionId: string; reactorId: string; pathway: "greenfield" | "coal-repower";
  sites: Array<{
    siteId: string; siteName: string; kind: "named" | "greenfield";
    lat: number; lng: number; rank: number;            // 1 = best
    verdict: "pass" | "caution" | "fail";
    frictionScores: { grid: number; cooling: number; permits: number; community: number; logistics: number; hazards: number }; // each 0..1
    matrix: Array<{ constraint: string; verdict: "pass"|"caution"|"fail"; reason: string; citationIds: string[]; dataBasis: "computable"|"requires-field-study" }>;
    citationIds: string[];
    confidence: "high" | "medium" | "low";
  }>;
  regionSummary: string;          // screen-level legal/physical context, with cited source ids inline as [id]
  nextStudies: string[];
  notes: string;                  // screen-level caveats
}

# TASK INPUT

Screen the candidate sites in **AU-NT (AUS)** for reactor **westinghouse-evinci**, pathway **greenfield**.

## REACTOR ENVELOPE

```json
{
  "id": "westinghouse-evinci",
  "company": "Westinghouse Electric",
  "companyUrl": "https://westinghousenuclear.com/innovation/evinci-microreactor/",
  "model": "eVinci Microreactor",
  "type": "micro",
  "technology": "microreactor",
  "outputMW": 5,
  "footprintHectares": 0.8,
  "coolingOptions": [
    "dry"
  ],
  "waterNeeds": "Heat-pipe cooled; no water cooling required; fully air-cooled — ideal for remote sites with no water access",
  "status": "In development; DOE Preliminary Safety Design Report approved June 2025; test reactor targeting INL NRIC-DOME 2026; commercial readiness ~2027",
  "citation": {
    "id": "cite-westinghouse-evinci",
    "title": "eVinci Microreactor — Westinghouse Nuclear",
    "citation": "Westinghouse Electric — eVinci Microreactor Product Page",
    "year": 2025,
    "url": "https://westinghousenuclear.com/innovation/evinci-microreactor/"
  }
}
```


## COUNTRY LAW CORPUS (cite these source ids)

```json
{
  "code": "AUS",
  "name": "Australia",
  "regulator": "ARPANSA",
  "sources": [
    {
      "id": "au-epbc-140a",
      "title": "No approval for certain nuclear installations",
      "citation": "Environment Protection and Biodiversity Conservation Act 1999 (Cth) s.140A",
      "section": "140A",
      "year": 1999,
      "url": "https://www5.austlii.edu.au/au/legis/cth/consol_act/epabca1999588/s140a.html",
      "text": "Section 140A of the EPBC Act 1999 provides that the Environment Minister must not approve an action consisting of or involving the construction or operation of a nuclear power plant, a nuclear fuel fabrication plant, a uranium enrichment facility, or a nuclear reprocessing facility. This is a federal statutory prohibition on nuclear power generation in Australia.",
      "type": "computable",
      "confidence": "high"
    },
    {
      "id": "au-arpans-10",
      "title": "Prohibition on certain nuclear installations",
      "citation": "Australian Radiation Protection and Nuclear Safety Act 1998 (Cth) s.10",
      "section": "10",
      "year": 1998,
      "url": "http://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/arpansa1998487/s10.html",
      "text": "Section 10 of the ARPANS Act 1998 provides that nothing in the Act authorises the construction or operation of a nuclear power plant. Under s.10(2), the CEO of ARPANSA must not issue a licence for the construction or operation of a nuclear power plant or a nuclear fuel fabrication plant. This prohibition is complementary to EPBC s.140A and operates at the regulatory-licensing level.",
      "type": "computable",
      "confidence": "high"
    },
    {
      "id": "au-sa-prohibition",
      "title": "Nuclear Waste Storage Facility (Prohibition) Act 2000 (SA)",
      "citation": "Nuclear Waste Storage Facility (Prohibition) Act 2000 (SA)",
      "section": "ss. 4–6",
      "year": 2000,
      "url": "https://www.legislation.sa.gov.au/lz?path=%2FC%2FA%2FNUCLEAR+WASTE+STORAGE+FACILITY+%28PROHIBITION%29+ACT+2000",
      "text": "South Australia's Nuclear Waste Storage Facility (Prohibition) Act 2000 prohibits the construction or operation of any nuclear waste storage facility, and the import or transport of nuclear waste for delivery to such a facility within South Australia. While focused on waste storage, this SA state-level prohibition reinforces the federal ban (EPBC s.140A; ARPANS s.10) that bars nuclear power plant construction in Australia. The SA Electricity Act 1996 also excludes nuclear from authorised electricity generation.",
      "type": "computable",
      "confidence": "high"
    },
    {
      "id": "au-interior-water",
      "title": "Northern Territory — Climate and Water Resources",
      "citation": "Bureau of Meteorology — Northern Territory Climate",
      "section": "Climate overview",
      "year": 2024,
      "url": "https://www.bom.gov.au/location/australia/northern-territory",
      "text": "The Northern Territory is predominantly arid to semi-arid. Interior regions receive median annual rainfall of less than 300 mm. Groundwater in the Cambrian Limestone Aquifer (primary inland water source) is under increasing stress. Available surface water is highly seasonal (wet-season only), making sustained large-volume cooling water extraction extremely difficult at interior nuclear plant sites.",
      "type": "human-review",
      "confidence": "low"
    }
  ]
}
```


## REGION FACTS

```json
{
  "country": "AUS",
  "regionId": "AU-NT",
  "regionName": "Northern Territory",
  "hasRichData": true,
  "facts": [
    {
      "id": "nt-land-outback",
      "category": "land",
      "label": "Land availability",
      "value": "Enormous outback land mass — apparently ideal for remote siting",
      "detail": "The Northern Territory covers ~1.35 million km² with a population of only ~250,000 (~0.18 persons/km²). The interior is almost entirely unpopulated. Vast flat areas of the Barkly Tablelands and Tanami Desert would satisfy any exclusion-area requirement on land metrics alone. However, land rights under the Aboriginal Land Rights Act 1976 (Cth) cover ~50% of NT land, adding consultation obligations even if nuclear were legal.",
      "confidence": "high"
    },
    {
      "id": "nt-grid-isolated",
      "category": "grid",
      "label": "Grid interconnection",
      "value": "Isolated Darwin-Katherine grid — NOT connected to NEM",
      "detail": "The NT operates the Darwin-Katherine Interconnected System (DKIS), a small, isolated grid of ~600 MW peak demand. There is no electrical connection to the National Electricity Market (NEM). Any nuclear plant output could not be exported to eastern Australia without a new multi-thousand-km HVDC transmission link (~$3–5B). The grid is far too small to absorb any SMR or large reactor output locally.",
      "confidence": "high"
    },
    {
      "id": "nt-water-scarce",
      "category": "water",
      "label": "Cooling water availability",
      "value": "Extreme scarcity — interior has no perennial surface water",
      "detail": "Interior NT (south of Katherine) has median annual rainfall of 100–300 mm, almost entirely in the wet season (Dec–Mar). No perennial rivers exist in the southern interior. The Cambrian Limestone Aquifer (the primary inland water resource) is under increasing stress from agriculture and gas development. Nuclear cooling (even dry cooling requires some water) would compete with scarce groundwater in a stressed aquifer.",
      "citationId": "au-interior-water",
      "confidence": "high"
    },
    {
      "id": "nt-hazard-stable",
      "category": "hazard",
      "label": "Seismic and geological hazard",
      "value": "Low seismicity on stable craton; extreme heat a cooling challenge",
      "detail": "The NT craton has very low seismic hazard. However, extreme ambient temperatures (interior regularly > 40°C in summer) significantly reduce dry-cooling efficiency and require larger cooling systems. Cyclone risk in the Darwin-Katherine corridor adds structural design requirements for coastal or near-coast sites.",
      "confidence": "medium"
    },
    {
      "id": "nt-population",
      "category": "population",
      "label": "Population density",
      "value": "Near-zero in interior; Aboriginal community land rights apply",
      "detail": "Interior NT has densities below 0.02 persons/km². Darwin (~145,000) is the only significant urban centre. ~50% of NT land is Aboriginal freehold under the Aboriginal Land Rights (Northern Territory) Act 1976. Free, prior and informed consent from Traditional Owners would be required for any nuclear facility on Aboriginal land, independent of the federal statutory ban.",
      "confidence": "high"
    },
    {
      "id": "nt-pathway-ban",
      "category": "pathway",
      "label": "Statutory feasibility",
      "value": "PROHIBITED — federal nuclear ban applies; compounded by grid isolation and water scarcity",
      "detail": "The same federal dual prohibition applies as in all Australian states: EPBC Act 1999 s.140A (no ministerial approval) and ARPANS Act 1998 s.10 (no ARPANSA licence). Beyond the legal barrier, the NT compounds with three independent fatal constraints: no connection to the NEM, extreme interior water scarcity, and Aboriginal land rights covering ~50% of territory. Nuclear deployment in the NT is not a viable pathway under any foreseeable regulatory reform scenario.",
      "citationId": "au-epbc-140a",
      "confidence": "high"
    }
  ]
}
```


## CANDIDATE SITES (the pool to screen; cite these site/citation ids)

```json
[
  {
    "id": "au-nt-channel-island-darwin",
    "country": "AUS",
    "regionId": "AU-NT",
    "name": "Channel Island Power Station / Darwin (gas turbine site — DKIS grid)",
    "kind": "named",
    "lat": -12.5,
    "lng": 130.9,
    "attributes": {
      "availableFootprintHectares": 30,
      "coolingSource": "Darwin Harbour seawater — tidal; tropical cyclone design requirements apply",
      "waterAvailability": "abundant",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "cyclone-high",
        "seismic-low"
      ],
      "landStatus": "government utility land — Territory Generation; Darwin Harbour marine zone; Commonwealth environmental assessment required",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "microreactor"
    ],
    "citationIds": [
      "nt-grid-isolated",
      "nt-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10"
    ],
    "confidence": "medium"
  },
  {
    "id": "au-nt-palmerston-east-arm",
    "country": "AUS",
    "regionId": "AU-NT",
    "name": "East Arm / Palmerston Industrial Zone (Darwin satellite — LNG precinct)",
    "kind": "named",
    "lat": -12.55,
    "lng": 130.95,
    "attributes": {
      "availableFootprintHectares": 100,
      "coolingSource": "Darwin Harbour / East Arm tidal seawater — existing LNG water intake infrastructure nearby",
      "waterAvailability": "abundant",
      "gridDistanceKm": 5,
      "populationDensity": "low",
      "hazards": [
        "cyclone-high",
        "seismic-low"
      ],
      "landStatus": "industrial Crown land — NT Government; LNG/gas infrastructure; complex permitting; nuclear banned",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "microreactor"
    ],
    "citationIds": [
      "nt-grid-isolated",
      "nt-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10"
    ],
    "confidence": "medium"
  },
  {
    "id": "au-nt-barkly-tablelands-remote",
    "country": "AUS",
    "regionId": "AU-NT",
    "name": "Barkly Tablelands Remote Zone (greenfield — interior outback, no grid/water)",
    "kind": "greenfield",
    "lat": -19.5,
    "lng": 135,
    "attributes": {
      "availableFootprintHectares": 10000,
      "coolingSource": "dry/air-cooled only — no perennial surface water; median rainfall < 300 mm/yr; Cambrian Limestone Aquifer stressed",
      "waterAvailability": "none",
      "gridDistanceKm": 1000,
      "populationDensity": "low",
      "hazards": [
        "heat-extreme",
        "seismic-low"
      ],
      "landStatus": "NT Crown land / Aboriginal freehold — ~50% of NT is Aboriginal land under Aboriginal Land Rights (NT) Act 1976; FPIC required; nuclear banned",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "microreactor",
      "HTGR",
      "SFR"
    ],
    "citationIds": [
      "nt-land-outback",
      "nt-grid-isolated",
      "nt-water-scarce",
      "nt-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10",
      "au-interior-water"
    ],
    "confidence": "medium"
  },
  {
    "id": "au-nt-katherine-river-corridor",
    "country": "AUS",
    "regionId": "AU-NT",
    "name": "Katherine River Corridor (greenfield screen — southern DKIS fringe)",
    "kind": "greenfield",
    "lat": -14.467,
    "lng": 132.264,
    "attributes": {
      "availableFootprintHectares": 200,
      "coolingSource": "Katherine River — seasonal tropical river; highly variable flow (wet: abundant, dry: minimal); not reliable for continuous cooling",
      "waterAvailability": "limited",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "flood-high",
        "heat-extreme",
        "seismic-low"
      ],
      "landStatus": "Crown land / pastoral lease — Jawoyn and Dagoman Aboriginal country; FPIC obligations; nuclear banned",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "microreactor"
    ],
    "citationIds": [
      "nt-grid-isolated",
      "nt-water-scarce",
      "nt-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10",
      "au-interior-water"
    ],
    "confidence": "medium"
  },
  {
    "id": "au-nt-tennant-creek-remote",
    "country": "AUS",
    "regionId": "AU-NT",
    "name": "Tennant Creek Area (greenfield screen — central NT mineral province)",
    "kind": "greenfield",
    "lat": -19.65,
    "lng": 134.19,
    "attributes": {
      "availableFootprintHectares": 2000,
      "coolingSource": "dry/air-cooled only — no perennial surface water; Tennant Creek receives ~400 mm/yr rainfall (highly seasonal)",
      "waterAvailability": "none",
      "gridDistanceKm": 500,
      "populationDensity": "low",
      "hazards": [
        "heat-extreme",
        "seismic-low"
      ],
      "landStatus": "NT Crown land / Aboriginal land — Warumungu country; pastoral leases; nuclear banned; FPIC required",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "microreactor"
    ],
    "citationIds": [
      "nt-land-outback",
      "nt-grid-isolated",
      "nt-water-scarce",
      "nt-population",
      "nt-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10"
    ],
    "confidence": "medium"
  }
]
```


Return ONLY the AnalysisResult JSON for country="AUS", regionId="AU-NT", reactorId="westinghouse-evinci", pathway="greenfield".