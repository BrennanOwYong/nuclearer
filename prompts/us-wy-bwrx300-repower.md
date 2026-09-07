# Prompt — us-wy-bwrx300-repower

_Demonstrates: Headline coal-to-nuclear repower (Naughton/Kemmerer) — should rank a strong PASS on existing switchyard/water._

**Paste everything below the line into ChatGPT. Return its JSON to Claude as `us-wy-bwrx300-repower`.**

---

You are the reasoning engine of a PLANNING & VISUALISATION tool used by nuclear reactor VENDORS / EPC providers (e.g. GE-Hitachi, Westinghouse, NuScale) to plan and visualise WHERE to place WHICH of their reactor models. The user has chosen a region, one of their reactor models, and a build pathway; your job is to screen a pool of candidate sites and return a ranked, cited shortlist that helps the provider decide where this specific reactor could go — at SCREEN LEVEL only.

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

Screen the candidate sites in **US-WY (USA)** for reactor **ge-bwrx-300**, pathway **coal-repower**.

## REACTOR ENVELOPE

```json
{
  "id": "ge-bwrx-300",
  "company": "GE Vernova Hitachi Nuclear Energy",
  "companyUrl": "https://www.gevernova.com/nuclear/carbon-free-power/bwrx-300-small-modular-reactor",
  "model": "BWRX-300",
  "type": "SMR",
  "technology": "BWR",
  "outputMW": 300,
  "footprintHectares": 4,
  "coolingOptions": [
    "once-through",
    "tower"
  ],
  "waterNeeds": "Natural-circulation BWR; conventional steam cycle; site-dependent cooling (once-through or cooling tower)",
  "status": "NRC pre-application; CNSC review underway; deployments in progress (Ontario Power Generation Darlington, TVA Clinch River)",
  "citation": {
    "id": "cite-ge-bwrx-300",
    "title": "BWRX-300 General Description",
    "citation": "GE Vernova Hitachi Nuclear Energy — BWRX-300 General Description (Doc 005N9751)",
    "year": 2024,
    "url": "https://www.gevernova.com/content/dam/gevernova-nuclear/global/en_us/documents/carbon-free-power/005N9751-BWRX-300-General-Description.pdf"
  }
}
```


## COUNTRY LAW CORPUS (cite these source ids)

```json
{
  "code": "USA",
  "name": "United States",
  "regulator": "U.S. NRC",
  "sources": [
    {
      "id": "us-nrc-10cfr100",
      "title": "Reactor Site Criteria",
      "citation": "10 CFR Part 100",
      "section": "Part 100",
      "year": 2024,
      "url": "https://www.ecfr.gov/current/title-10/chapter-I/part-100",
      "text": "Establishes the NRC criteria used to evaluate the suitability of proposed sites for stationary power and testing reactors, including exclusion area, low-population zone, and population-center distance requirements.",
      "type": "computable",
      "confidence": "high"
    },
    {
      "id": "us-nrc-100-21",
      "title": "Non-seismic siting criteria — exclusion area and low-population zone",
      "citation": "10 CFR 100.21",
      "section": "100.21",
      "year": 2024,
      "url": "https://www.ecfr.gov/current/title-10/chapter-I/part-100/subpart-B/section-100.21",
      "text": "Requires an exclusion area under the applicant's control and a low-population zone around the reactor. Limits population density and use characteristics of the site environs to ensure radiation doses remain within acceptable limits in design-basis accidents.",
      "type": "computable",
      "confidence": "high"
    },
    {
      "id": "us-nepa",
      "title": "National Environmental Policy Act",
      "citation": "42 U.S.C. §4321 et seq.",
      "section": "§4321",
      "year": 1969,
      "url": "https://uscode.house.gov/view.xhtml?path=/prelim@title42/chapter55&edition=prelim",
      "text": "Requires federal agencies to prepare an Environmental Impact Statement (EIS) for any major federal action (including NRC licensing of nuclear facilities) significantly affecting the quality of the human environment. A mandatory human-review milestone in all U.S. nuclear siting proceedings.",
      "type": "human-review",
      "confidence": "high"
    },
    {
      "id": "us-cwa-316b",
      "title": "Clean Water Act §316(b) — Cooling Water Intake Structures",
      "citation": "33 U.S.C. §1326(b)",
      "section": "§1326(b)",
      "year": 1972,
      "url": "https://www.epa.gov/cooling-water-intakes/regulations-cooling-water-intake-structures-cwa-316b",
      "text": "Requires that the location, design, construction, and capacity of cooling water intake structures reflect the best technology available for minimizing adverse environmental impact. Applies to once-through cooling systems at nuclear and fossil-fuel power plants, adding permitting friction to river or lake sites.",
      "type": "human-review",
      "confidence": "high"
    }
  ]
}
```


## REGION FACTS

```json
{
  "country": "USA",
  "regionId": "US-WY",
  "regionName": "Wyoming",
  "hasRichData": true,
  "facts": [
    {
      "id": "wy-land-coal-repower",
      "category": "land",
      "label": "Coal-repower site availability",
      "value": "Retiring coal plants with existing grid infrastructure",
      "detail": "TerraPower's Natrium reactor is under construction at the retiring Naughton coal plant near Kemmerer (groundbreaking April 2026), demonstrating brownfield coal-to-nuclear repowering on existing switchyard interconnects. Wyoming has additional retiring coal capacity at Dave Johnston and Wyodak plants.",
      "confidence": "high"
    },
    {
      "id": "wy-grid-baseload",
      "category": "grid",
      "label": "Grid interconnection",
      "value": "Existing high-voltage ties at retiring coal nodes",
      "detail": "Coal-plant retirements transfer existing 230–500 kV transmission rights-of-way to successor generators, significantly reducing interconnection friction. Wyoming is in the Western Interconnection (WECC/NorthernGrid). Retiring coal capacity ~2,000 MW available for SMR repowering by 2035.",
      "confidence": "high"
    },
    {
      "id": "wy-water-arid",
      "category": "water",
      "label": "Water availability for cooling",
      "value": "Semi-arid; dry or hybrid cooling required",
      "detail": "Wyoming's high desert interior averages 250–380 mm annual precipitation. North Platte and Green River systems have senior water rights already allocated. Once-through cooling is impractical; dry or hybrid cooling towers are the viable path. CWA §316(b) imposes permitting friction on any intake structure.",
      "citationId": "us-cwa-316b",
      "confidence": "medium"
    },
    {
      "id": "wy-hazard-seismic",
      "category": "hazard",
      "label": "Seismic context",
      "value": "Low-to-moderate seismicity (interior West)",
      "detail": "Western Wyoming has moderate seismic hazard (PGA 0.1–0.2g at 2% in 50 years per USGS). Site-specific geotechnical and seismic characterization is required under NRC 10 CFR Part 100 for any new reactor. The Kemmerer area is in a low-hazard zone favourable for siting.",
      "citationId": "us-nrc-10cfr100",
      "confidence": "medium"
    },
    {
      "id": "wy-population",
      "category": "population",
      "label": "Population density",
      "value": "Very low (~2 persons/km²)",
      "detail": "Wyoming is the least-populous US state (~580,000 residents in 253,000 km²). The Kemmerer area has fewer than 3,000 residents. Low population density easily satisfies the exclusion-area and low-population-zone requirements under 10 CFR 100.21 without requiring large land acquisitions.",
      "citationId": "us-nrc-100-21",
      "confidence": "high"
    },
    {
      "id": "wy-pathway",
      "category": "pathway",
      "label": "Best-fit pathway",
      "value": "Coal-repower (brownfield) — strong momentum",
      "detail": "Retiring coal capacity + existing grid make coal-repower the strongest pathway. TerraPower Natrium at Kemmerer (345 MWe, SFR) is in active construction under NRC construction permit; DOE ARDP cost-share up to $2 billion. Greenfield SMR siting is also viable in southern Wyoming given land availability and low population.",
      "confidence": "high"
    }
  ]
}
```


## CANDIDATE SITES (the pool to screen; cite these site/citation ids)

```json
[
  {
    "id": "us-wy-naughton-kemmerer",
    "country": "USA",
    "regionId": "US-WY",
    "name": "Naughton Plant / Kemmerer (TerraPower Natrium site)",
    "kind": "named",
    "lat": 41.7571,
    "lng": -110.5974,
    "attributes": {
      "availableFootprintHectares": 180,
      "coolingSource": "Hams Fork River (dry/hybrid cooling tower; once-through impractical)",
      "waterAvailability": "limited",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "retiring coal (brownfield) — PacifiCorp Naughton Plant; private/industrial",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "SFR",
      "BWR",
      "iPWR",
      "HTGR",
      "MSR"
    ],
    "citationIds": [
      "wy-land-coal-repower",
      "wy-grid-baseload",
      "wy-water-arid",
      "wy-pathway"
    ],
    "confidence": "high"
  },
  {
    "id": "us-wy-dave-johnston-glenrock",
    "country": "USA",
    "regionId": "US-WY",
    "name": "Dave Johnston Plant / Glenrock (retiring coal brownfield)",
    "kind": "named",
    "lat": 42.8396,
    "lng": -105.7769,
    "attributes": {
      "availableFootprintHectares": 280,
      "coolingSource": "North Platte River (existing cooling water rights; CWA §316(b) friction)",
      "waterAvailability": "limited",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "retiring coal (brownfield) — PacifiCorp Dave Johnston; private/industrial",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "BWR",
      "iPWR",
      "SFR",
      "MSR",
      "HTGR"
    ],
    "citationIds": [
      "wy-land-coal-repower",
      "wy-grid-baseload",
      "wy-water-arid",
      "us-cwa-316b"
    ],
    "confidence": "high"
  },
  {
    "id": "us-wy-wyodak-gillette",
    "country": "USA",
    "regionId": "US-WY",
    "name": "Wyodak Plant / Gillette (retiring coal brownfield, Campbell County)",
    "kind": "named",
    "lat": 44.2886,
    "lng": -105.3851,
    "attributes": {
      "availableFootprintHectares": 350,
      "coolingSource": "Belle Fourche River (limited; dry cooling preferred; CWA §316(b) applies)",
      "waterAvailability": "limited",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "retiring coal (brownfield) — PacifiCorp/Black Hills Wyodak; private/industrial",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "BWR",
      "iPWR",
      "SFR",
      "HTGR",
      "MSR",
      "microreactor"
    ],
    "citationIds": [
      "wy-land-coal-repower",
      "wy-grid-baseload",
      "wy-water-arid",
      "us-cwa-316b"
    ],
    "confidence": "high"
  },
  {
    "id": "us-wy-rawlins-blm-greenfield",
    "country": "USA",
    "regionId": "US-WY",
    "name": "Southern Wyoming BLM Zone — Carbon County (greenfield, Rawlins corridor)",
    "kind": "greenfield",
    "lat": 41.79,
    "lng": -107.8,
    "attributes": {
      "availableFootprintHectares": 1000,
      "coolingSource": "dry/air-cooled only — no perennial surface water; arid high desert",
      "waterAvailability": "none",
      "gridDistanceKm": 5,
      "populationDensity": "low",
      "hazards": [
        "seismic-low",
        "wind-high"
      ],
      "landStatus": "BLM federal land (public surface) — federal ROD permitting required",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "HTGR",
      "microreactor",
      "SFR"
    ],
    "citationIds": [
      "wy-land-coal-repower",
      "wy-water-arid",
      "wy-population",
      "us-nepa"
    ],
    "confidence": "medium"
  },
  {
    "id": "us-wy-wind-river-jeffrey-city",
    "country": "USA",
    "regionId": "US-WY",
    "name": "Wind River Basin / Jeffrey City BLM Zone (greenfield, Fremont County)",
    "kind": "greenfield",
    "lat": 42.49,
    "lng": -107.83,
    "attributes": {
      "availableFootprintHectares": 800,
      "coolingSource": "dry/air-cooled only — Wind River flows seasonally; no reliable intake source",
      "waterAvailability": "none",
      "gridDistanceKm": 20,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "BLM federal land — historic uranium mining; brownfield characterization may be needed",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "HTGR",
      "microreactor",
      "SFR"
    ],
    "citationIds": [
      "wy-land-coal-repower",
      "wy-water-arid",
      "wy-population",
      "us-nepa"
    ],
    "confidence": "medium"
  },
  {
    "id": "us-wy-casper-north-platte-greenfield",
    "country": "USA",
    "regionId": "US-WY",
    "name": "Casper Area / North Platte River Corridor (greenfield, Natrona County)",
    "kind": "greenfield",
    "lat": 42.69,
    "lng": -106.35,
    "attributes": {
      "availableFootprintHectares": 500,
      "coolingSource": "North Platte River — senior water rights constrained; hybrid cooling preferred",
      "waterAvailability": "limited",
      "gridDistanceKm": 8,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "BLM/private mix — state trust lands and BLM parcels; NRC siting study required",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "SFR",
      "BWR",
      "iPWR",
      "HTGR",
      "MSR"
    ],
    "citationIds": [
      "wy-land-coal-repower",
      "wy-water-arid",
      "wy-grid-baseload",
      "us-cwa-316b",
      "us-nepa"
    ],
    "confidence": "medium"
  }
]
```


Return ONLY the AnalysisResult JSON for country="USA", regionId="US-WY", reactorId="ge-bwrx-300", pathway="coal-repower".