# Prompt — pl-30-bwrx300-repower

_Demonstrates: Poland coal-repower (Patnow/Wloclawek BWRX-300 programme)._

**Paste everything below the line into ChatGPT. Return its JSON to Claude as `pl-30-bwrx300-repower`.**

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

Screen the candidate sites in **PL-30 (POL)** for reactor **ge-bwrx-300**, pathway **coal-repower**.

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
  "code": "POL",
  "name": "Poland",
  "regulator": "PAA (Państwowa Agencja Atomistyki)",
  "sources": [
    {
      "id": "pl-ppej",
      "title": "Polish Nuclear Energy Programme (PPEJ)",
      "citation": "Polish Nuclear Energy Programme (Krajowy Program Energetyki Jądrowej)",
      "section": "Key Information",
      "year": 2020,
      "url": "https://pej.pl/en/the-project/key-information/",
      "text": "The Polish Nuclear Energy Programme (PPEJ) was adopted by the Council of Ministers in 2020. It governs the development of nuclear power in Poland, designating Polskie Elektrownie Jądrowe (PEJ) as the state-owned project company for the first NPP at Lubiatowo-Kopalino (Choczewo, Pomerania), deploying three Westinghouse AP1000 units totalling ~3,750 MWe with construction start targeted for 2028.",
      "type": "human-review",
      "confidence": "high"
    },
    {
      "id": "pl-prawo-atomowe",
      "title": "Prawo atomowe (Polish Atomic Law)",
      "citation": "Ustawa z dnia 29 listopada 2000 r. — Prawo atomowe, Dz.U. 2001 nr 3 poz. 18",
      "section": "Art. 4 (licensing by PAA)",
      "year": 2000,
      "url": "https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20010030018",
      "text": "The Act of 29 November 2000 — Atomic Law — establishes the Państwowa Agencja Atomistyki (PAA) as the national nuclear-safety regulator and requires a PAA licence for the construction and operation of any nuclear facility. The current consolidated text (Dz.U. 2026 poz. 1) reflects amendments through 2025.",
      "type": "computable",
      "confidence": "high"
    },
    {
      "id": "pl-site-lubiatowo",
      "title": "Lubiatowo-Kopalino NPP Site Selection (Choczewo, Pomerania)",
      "citation": "Polskie Elektrownie Jądrowe — Site Localization Documentation",
      "section": "Localization",
      "year": 2022,
      "url": "https://pej.pl/en/the-project/localization/",
      "text": "PEJ selected the Lubiatowo-Kopalino site in the Choczewo commune (Pomeranian Voivodeship, PL-22) for Poland's first nuclear power plant. The coastal Baltic location enables once-through seawater cooling. PAA confirmed site suitability in January 2026; a construction-licence application was submitted in April 2026.",
      "type": "human-review",
      "confidence": "high"
    },
    {
      "id": "pl-patnow-smr",
      "title": "ORLEN Synthos Green Energy — BWRX-300 SMR Programme",
      "citation": "ORLEN Synthos Green Energy (OSGE) — SMR Programme Overview",
      "section": "SMR sites",
      "year": 2024,
      "url": "https://osge.com/en/",
      "text": "ORLEN Synthos Green Energy (OSGE), a joint venture of Synthos and ORLEN, is deploying GE Hitachi BWRX-300 small modular reactors across multiple Polish coal-transition sites. The Government of Poland approved six SMR plant locations in 2024. Włocławek is the priority BWRX-300 site; the Pątnów-Konin lignite region (Greater Poland, PL-30) is included in the coal-repower programme.",
      "type": "human-review",
      "confidence": "medium"
    }
  ]
}
```


## REGION FACTS

```json
{
  "country": "POL",
  "regionId": "PL-30",
  "regionName": "Greater Poland Voivodeship",
  "hasRichData": true,
  "facts": [
    {
      "id": "pl30-land-coal-repower",
      "category": "land",
      "label": "Coal-repower potential — Pątnów-Konin lignite complex",
      "value": "Retiring lignite plant with existing switchyard infrastructure",
      "detail": "The Pątnów-Konin lignite complex (ZE PAK) is Poland's largest inland coal-power cluster. Units at Pątnów II and Konin are being phased out under EU climate targets. Existing 220/400 kV switchyards and cooling infrastructure at Gopło Lake make the site a candidate for coal-to-nuclear repowering with BWRX-300 SMRs. The site is included in Poland's approved SMR location decisions (2024).",
      "citationId": "pl-patnow-smr",
      "confidence": "medium"
    },
    {
      "id": "pl30-grid-interior",
      "category": "grid",
      "label": "Grid interconnection",
      "value": "220/400 kV existing coal plant switchyards reusable",
      "detail": "Pątnów has direct 400 kV connections to the PSE grid backbone serving the Poznań and Łódź load centers. Repowering coal capacity with BWRX-300 SMRs (300 MWe/unit) can reuse existing transmission right-of-way. Interior location requires no new long-distance transmission construction, unlike the coastal Pomerania site.",
      "confidence": "medium"
    },
    {
      "id": "pl30-water-goplo",
      "category": "water",
      "label": "Cooling water — Lake Gopło and Warta River",
      "value": "Freshwater cooling lake available but environmentally constrained",
      "detail": "Existing Pątnów plants use Lake Gopło and artificial cooling reservoirs. SMR deployment would need either cooling towers or regulatory approval for continued lake intake. Lake Gopło has ecological sensitivity (Natura 2000 adjacent areas). EU Water Framework Directive requires demonstration of no deterioration of water status.",
      "confidence": "medium"
    },
    {
      "id": "pl30-hazard-seismic",
      "category": "hazard",
      "label": "Seismic and geological hazard",
      "value": "Very low seismicity; subsidence risk from underground mining",
      "detail": "Greater Poland is on stable platform geology with minimal seismic hazard. However, extensive lignite open-pit mining (Pątnów, Konin, Adamów) has created significant subsidence and ground deformation. Site-specific geotechnical assessment required before nuclear siting to rule out void collapse and differential settlement.",
      "confidence": "medium"
    },
    {
      "id": "pl30-population",
      "category": "population",
      "label": "Population density near site",
      "value": "Semi-rural — Konin city (~75,000) within 20 km",
      "detail": "The Pątnów site is approximately 10 km west of Konin city. The emergency planning zone (EPZ) for a BWRX-300 SMR is significantly smaller than for a large PWR, making the proximity to Konin manageable. PAA licensing under Prawo atomowe would require social impact assessment and local government consultation.",
      "citationId": "pl-prawo-atomowe",
      "confidence": "medium"
    },
    {
      "id": "pl30-pathway",
      "category": "pathway",
      "label": "Best-fit pathway",
      "value": "Coal-repower with BWRX-300 SMR — government-approved site",
      "detail": "Poland's Ministry of Climate and Environment approved six SMR plant locations in 2024, covering the coal-transition programme. The Pątnów-Konin region is Poland's flagship coal-repower SMR narrative, pairing OSGE's BWRX-300 programme with ZE PAK's retiring lignite assets. First SMR deployment targeted for ~2035 subject to PAA licensing.",
      "citationId": "pl-patnow-smr",
      "confidence": "medium"
    }
  ]
}
```


## CANDIDATE SITES (the pool to screen; cite these site/citation ids)

```json
[
  {
    "id": "pl-30-patnow-konin",
    "country": "POL",
    "regionId": "PL-30",
    "name": "Pątnów Power Station / Konin (ZE PAK coal-repower candidate)",
    "kind": "named",
    "lat": 52.302,
    "lng": 18.237,
    "attributes": {
      "availableFootprintHectares": 500,
      "coolingSource": "Lake Gopło (artificial cooling reservoir) + Warta River — Natura 2000 environmental constraints apply",
      "waterAvailability": "limited",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-none",
        "subsidence-moderate"
      ],
      "landStatus": "retiring coal (brownfield) — ZE PAK/Pątnów lignite complex; industrial land",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "BWR",
      "iPWR",
      "SFR",
      "MSR"
    ],
    "citationIds": [
      "pl30-land-coal-repower",
      "pl30-grid-interior",
      "pl30-water-goplo",
      "pl30-hazard-seismic",
      "pl30-population",
      "pl-patnow-smr"
    ],
    "confidence": "medium"
  },
  {
    "id": "pl-30-wloclawek-smr",
    "country": "POL",
    "regionId": "PL-30",
    "name": "Włocławek BWRX-300 SMR Site (OSGE priority — Vistula River, Chempark area)",
    "kind": "named",
    "lat": 52.648,
    "lng": 19.068,
    "attributes": {
      "availableFootprintHectares": 80,
      "coolingSource": "Vistula River (Wisła) — major Polish river; sufficient flow for tower cooling; EU WFD applies",
      "waterAvailability": "limited",
      "gridDistanceKm": 2,
      "populationDensity": "medium",
      "hazards": [
        "seismic-none",
        "flood-low"
      ],
      "landStatus": "industrial zone (Chempark / former chemical complex) — brownfield; OSGE government-approved SMR site",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "BWR"
    ],
    "citationIds": [
      "pl30-land-coal-repower",
      "pl30-grid-interior",
      "pl-patnow-smr",
      "pl-prawo-atomowe"
    ],
    "confidence": "medium"
  },
  {
    "id": "pl-30-konin-thermal",
    "country": "POL",
    "regionId": "PL-30",
    "name": "Konin Thermal Power Station (ZE PAK retiring coal — Warta River)",
    "kind": "named",
    "lat": 52.215,
    "lng": 18.267,
    "attributes": {
      "availableFootprintHectares": 200,
      "coolingSource": "Warta River — moderate freshwater flow; tower cooling preferred; Natura 2000 sensitivity lower than Gopło",
      "waterAvailability": "limited",
      "gridDistanceKm": 0,
      "populationDensity": "medium",
      "hazards": [
        "seismic-none",
        "subsidence-low"
      ],
      "landStatus": "retiring coal (brownfield) — ZE PAK Konin plant; industrial/state land",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "BWR",
      "iPWR",
      "HTGR"
    ],
    "citationIds": [
      "pl30-land-coal-repower",
      "pl30-grid-interior",
      "pl30-water-goplo",
      "pl-patnow-smr",
      "pl-prawo-atomowe"
    ],
    "confidence": "medium"
  },
  {
    "id": "pl-30-goplo-west-greenfield",
    "country": "POL",
    "regionId": "PL-30",
    "name": "Lake Gopło Western Shore Greenfield Zone (Greater Poland, new-site corridor)",
    "kind": "greenfield",
    "lat": 52.35,
    "lng": 18.1,
    "attributes": {
      "availableFootprintHectares": 400,
      "coolingSource": "Lake Gopło — freshwater; Natura 2000 constraints limit intake; cooling tower preferred",
      "waterAvailability": "limited",
      "gridDistanceKm": 8,
      "populationDensity": "low",
      "hazards": [
        "seismic-none",
        "subsidence-low"
      ],
      "landStatus": "agricultural private land — Natura 2000 adjacency; Polish EIA and PAA screening required",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "BWR",
      "iPWR",
      "HTGR",
      "SFR"
    ],
    "citationIds": [
      "pl30-grid-interior",
      "pl30-water-goplo",
      "pl30-population",
      "pl-prawo-atomowe"
    ],
    "confidence": "medium"
  },
  {
    "id": "pl-30-warta-uniejow-greenfield",
    "country": "POL",
    "regionId": "PL-30",
    "name": "Warta River Corridor Greenfield Zone (near Uniejów — Greater Poland)",
    "kind": "greenfield",
    "lat": 51.97,
    "lng": 18.78,
    "attributes": {
      "availableFootprintHectares": 300,
      "coolingSource": "Warta River — moderate freshwater; cooling tower required; EU WFD screening",
      "waterAvailability": "limited",
      "gridDistanceKm": 15,
      "populationDensity": "low",
      "hazards": [
        "seismic-none",
        "flood-low"
      ],
      "landStatus": "agricultural private land — no known protected designation; standard Polish EIA required",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "BWR",
      "iPWR",
      "HTGR",
      "MSR"
    ],
    "citationIds": [
      "pl30-grid-interior",
      "pl30-water-goplo",
      "pl30-population",
      "pl30-pathway",
      "pl-prawo-atomowe"
    ],
    "confidence": "medium"
  }
]
```


Return ONLY the AnalysisResult JSON for country="POL", regionId="PL-30", reactorId="ge-bwrx-300", pathway="coal-repower".