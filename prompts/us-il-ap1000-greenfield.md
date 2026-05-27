# Prompt — us-il-ap1000-greenfield

_Demonstrates: Large PWR on greenfield — needs big footprint + cooling water; favors river/lake sites._

**Paste everything below the line into ChatGPT. Return its JSON to Claude as `us-il-ap1000-greenfield`.**

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

Screen the candidate sites in **US-IL (USA)** for reactor **westinghouse-ap1000**, pathway **greenfield**.

## REACTOR ENVELOPE

```json
{
  "id": "westinghouse-ap1000",
  "company": "Westinghouse Electric",
  "companyUrl": "https://westinghousenuclear.com/energy-systems/ap1000-pwr/overview/",
  "model": "AP1000",
  "type": "large",
  "technology": "PWR",
  "outputMW": 1110,
  "footprintHectares": 6,
  "coolingOptions": [
    "once-through",
    "tower"
  ],
  "waterNeeds": "Conventional light-water; passive safety cooling requires large water tank (~2.3M gallons in IRWST); once-through or cooling tower",
  "status": "NRC Design Certified (2011, revised 2017); operating at Vogtle Units 3 & 4 (USA)",
  "citation": {
    "id": "cite-westinghouse-ap1000",
    "title": "AP1000 PWR Overview — Westinghouse Nuclear",
    "citation": "Westinghouse Electric — AP1000 PWR Product Page",
    "year": 2024,
    "url": "https://westinghousenuclear.com/energy-systems/ap1000-pwr/overview/"
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
  "regionId": "US-IL",
  "regionName": "Illinois",
  "hasRichData": true,
  "facts": [
    {
      "id": "il-land-sites",
      "category": "land",
      "label": "Available greenfield/brownfield sites",
      "value": "Existing nuclear campus expansions and brownfield industrial sites",
      "detail": "Illinois hosts 6 operating nuclear plants (11 units, ~11 GWe). Exelon/Constellation campuses (Braidwood, Byron, Dresden, Lasalle, Quad Cities, Clinton) have proven nuclear construction infrastructure. Brownfield sites at retired plants (Zion) also available. State's Climate and Equitable Jobs Act (2021) explicitly supports nuclear.",
      "confidence": "high"
    },
    {
      "id": "il-grid-nuclear",
      "category": "grid",
      "label": "Grid interconnection",
      "value": "Largest US nuclear fleet; excellent high-voltage transmission",
      "detail": "Illinois is in PJM Interconnection (Mid-Atlantic/Midwest market). The state generates ~55% of electricity from nuclear — the highest share of any US state. Transmission 345–765 kV backbone connects nuclear plants to Chicago load center. Interconnection queue for nuclear expansions at existing campuses is well-understood.",
      "confidence": "high"
    },
    {
      "id": "il-water-lakes",
      "category": "water",
      "label": "Cooling water availability",
      "value": "Excellent — Lake Michigan, Illinois River, large impoundment lakes",
      "detail": "Illinois benefits from Lake Michigan access (Chicago metro), the Illinois River, and large man-made cooling lakes (Clinton Lake, Braidwood Lake). Once-through cooling is viable at existing river/lake sites, subject to CWA §316(b) intake permits. Cooling towers are proven at Illinois sites (Dresden, Braidwood).",
      "citationId": "us-cwa-316b",
      "confidence": "high"
    },
    {
      "id": "il-hazard-seismic",
      "category": "hazard",
      "label": "Seismic context",
      "value": "Low seismicity (central US craton)",
      "detail": "Northern and central Illinois sit on the stable North American craton. USGS PSHA shows PGA < 0.05g at 2% in 50 years for most of the state. Southern Illinois near New Madrid Seismic Zone has higher hazard (site-specific evaluation required per 10 CFR 100).",
      "citationId": "us-nrc-10cfr100",
      "confidence": "high"
    },
    {
      "id": "il-population",
      "category": "population",
      "label": "Population density",
      "value": "Mixed — rural central/northern sites satisfy 10 CFR 100.21",
      "detail": "Rural areas (Clinton, Braidwood, Byron, Lasalle) have low enough population density to meet NRC exclusion-area and low-population-zone requirements. Chicago metro (~10 M) is excluded as a new-build host. Existing campuses have pre-established emergency planning zones, streamlining licensing for expansions.",
      "citationId": "us-nrc-100-21",
      "confidence": "high"
    },
    {
      "id": "il-pathway",
      "category": "pathway",
      "label": "Best-fit pathway",
      "value": "Greenfield on existing nuclear campuses — pro-nuclear regulatory environment",
      "detail": "Illinois is the most nuclear-friendly large-grid state in the US. The 2021 Climate and Equitable Jobs Act extended nuclear subsidies. Constellation has expressed interest in new nuclear at existing sites. Large AP1000 or SMR (BWRX-300/VOYGR) at existing campuses is the strongest pathway — infrastructure, community acceptance, and regulator familiarity all favour expansion.",
      "confidence": "high"
    }
  ]
}
```


## CANDIDATE SITES (the pool to screen; cite these site/citation ids)

```json
[
  {
    "id": "us-il-braidwood",
    "country": "USA",
    "regionId": "US-IL",
    "name": "Braidwood Clean Energy Center (Constellation Energy, operating)",
    "kind": "named",
    "lat": 41.2434,
    "lng": -88.2297,
    "attributes": {
      "availableFootprintHectares": 400,
      "coolingSource": "Braidwood Lake (man-made cooling lake) + Illinois River drainage; CWA §316(b) applies",
      "waterAvailability": "abundant",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "operating nuclear campus — Constellation Energy private land; brownfield expansion",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR",
      "MSR"
    ],
    "citationIds": [
      "il-land-sites",
      "il-grid-nuclear",
      "il-water-lakes",
      "il-hazard-seismic",
      "il-population",
      "us-cwa-316b"
    ],
    "confidence": "high"
  },
  {
    "id": "us-il-clinton",
    "country": "USA",
    "regionId": "US-IL",
    "name": "Clinton Clean Energy Center (Constellation Energy, operating BWR)",
    "kind": "named",
    "lat": 40.1719,
    "lng": -88.8339,
    "attributes": {
      "availableFootprintHectares": 700,
      "coolingSource": "Clinton Lake (man-made cooling reservoir, 11,000 acres); river basin supply",
      "waterAvailability": "abundant",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "operating nuclear campus — Constellation Energy; existing NRC license; expansion viable",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR",
      "MSR"
    ],
    "citationIds": [
      "il-land-sites",
      "il-grid-nuclear",
      "il-water-lakes",
      "il-population",
      "us-nrc-10cfr100"
    ],
    "confidence": "high"
  },
  {
    "id": "us-il-dresden",
    "country": "USA",
    "regionId": "US-IL",
    "name": "Dresden Clean Energy Center (Constellation Energy, Morris — Grundy County)",
    "kind": "named",
    "lat": 41.3901,
    "lng": -88.2701,
    "attributes": {
      "availableFootprintHectares": 250,
      "coolingSource": "Illinois River + Dresden Island cooling pond; CWA §316(b) intake permitted",
      "waterAvailability": "abundant",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "operating nuclear campus — Constellation Energy; brownfield SMR expansion candidate",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR",
      "MSR"
    ],
    "citationIds": [
      "il-land-sites",
      "il-grid-nuclear",
      "il-water-lakes",
      "il-population",
      "us-cwa-316b"
    ],
    "confidence": "high"
  },
  {
    "id": "us-il-quad-cities",
    "country": "USA",
    "regionId": "US-IL",
    "name": "Quad Cities Clean Energy Center (Constellation Energy, Cordova IL)",
    "kind": "named",
    "lat": 41.7261,
    "lng": -90.3103,
    "attributes": {
      "availableFootprintHectares": 400,
      "coolingSource": "Mississippi River (once-through + cooling towers); CWA §316(b) intake permitted",
      "waterAvailability": "abundant",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low",
        "flood-moderate"
      ],
      "landStatus": "operating nuclear campus — Constellation Energy; large-footprint expansion viable",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR",
      "MSR"
    ],
    "citationIds": [
      "il-land-sites",
      "il-grid-nuclear",
      "il-water-lakes",
      "il-population",
      "us-cwa-316b"
    ],
    "confidence": "high"
  },
  {
    "id": "us-il-clinton-lake-greenfield",
    "country": "USA",
    "regionId": "US-IL",
    "name": "Clinton Lake Rural Zone (greenfield, DeWitt County — expansion corridor)",
    "kind": "greenfield",
    "lat": 40.14,
    "lng": -88.9,
    "attributes": {
      "availableFootprintHectares": 600,
      "coolingSource": "Clinton Lake drainage basin; Sangamon River system; tower cooling preferred",
      "waterAvailability": "abundant",
      "gridDistanceKm": 5,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "agricultural private land — State of Illinois Climate & Equitable Jobs Act supportive; NRC siting study required",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR",
      "MSR",
      "HTGR"
    ],
    "citationIds": [
      "il-land-sites",
      "il-grid-nuclear",
      "il-water-lakes",
      "il-pathway",
      "us-nepa"
    ],
    "confidence": "medium"
  },
  {
    "id": "us-il-western-mississippi-greenfield",
    "country": "USA",
    "regionId": "US-IL",
    "name": "Western IL Mississippi River Corridor (greenfield, Henderson/Mercer County)",
    "kind": "greenfield",
    "lat": 41,
    "lng": -90.75,
    "attributes": {
      "availableFootprintHectares": 800,
      "coolingSource": "Mississippi River — once-through or tower; CWA §316(b) intake permitting required",
      "waterAvailability": "abundant",
      "gridDistanceKm": 10,
      "populationDensity": "low",
      "hazards": [
        "flood-moderate",
        "seismic-low"
      ],
      "landStatus": "agricultural private land — state nuclear-supportive policy; large-footprint viable",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR",
      "MSR"
    ],
    "citationIds": [
      "il-land-sites",
      "il-grid-nuclear",
      "il-water-lakes",
      "il-pathway",
      "us-cwa-316b",
      "us-nepa"
    ],
    "confidence": "medium"
  }
]
```


Return ONLY the AnalysisResult JSON for country="USA", regionId="US-IL", reactorId="westinghouse-ap1000", pathway="greenfield".