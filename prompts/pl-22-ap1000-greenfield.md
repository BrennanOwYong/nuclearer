# Prompt — pl-22-ap1000-greenfield

_Demonstrates: Poland first NPP, Baltic coast (Lubiatowo) — coastal cooling large PWR._

**Paste everything below the line into ChatGPT. Return its JSON to Claude as `pl-22-ap1000-greenfield`.**

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

Screen the candidate sites in **PL-22 (POL)** for reactor **westinghouse-ap1000**, pathway **greenfield**.

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
  "regionId": "PL-22",
  "regionName": "Pomeranian Voivodeship",
  "hasRichData": true,
  "facts": [
    {
      "id": "pl22-land-coastal",
      "category": "land",
      "label": "NPP site — Lubiatowo-Kopalino (Choczewo)",
      "value": "Confirmed: coastal Baltic site, PAA-approved suitability",
      "detail": "The Lubiatowo-Kopalino site in Choczewo commune is Poland's selected location for its first nuclear power plant (three AP1000 units, ~3,750 MWe). PAA confirmed site suitability in January 2026. PEJ submitted a construction-licence application in April 2026. Site is in a forested coastal strip, 1–2 km from the Baltic Sea.",
      "citationId": "pl-site-lubiatowo",
      "confidence": "high"
    },
    {
      "id": "pl22-grid-pse",
      "category": "grid",
      "label": "Grid interconnection",
      "value": "400 kV PSE backbone — long-distance transmission to load centers required",
      "detail": "Poland's transmission system operator (PSE) operates a 400 kV ring through Pomerania. The Choczewo site requires new 400 kV lines (~80 km) to the nearest PSE 400 kV node. PEJ and PSE have agreement on grid reinforcement. Poland's 2040 National Energy and Climate Plan allocates capacity for nuclear baseload on the northern grid.",
      "citationId": "pl-ppej",
      "confidence": "high"
    },
    {
      "id": "pl22-water-baltic",
      "category": "water",
      "label": "Cooling water source",
      "value": "Baltic Sea once-through cooling — ample supply",
      "detail": "The coastal location enables once-through seawater cooling directly from the Baltic Sea, eliminating cooling tower requirements and reducing plant footprint. Baltic salinity (~7 ppt) is much lower than ocean, reducing corrosion risk. Thermal discharge must comply with EU Water Framework Directive requirements.",
      "confidence": "high"
    },
    {
      "id": "pl22-hazard-seismic",
      "category": "hazard",
      "label": "Seismic and geological hazard",
      "value": "Very low seismicity — stable Baltic Shield platform",
      "detail": "Pomerania lies on the stable East European Craton / Baltic Shield margin. Seismic hazard is among the lowest in Europe (PGA < 0.04g at 475-year return period). Coastal site requires assessment of storm surge, subsidence, and sandy-substrate foundation conditions, but seismic risk is not a siting constraint.",
      "confidence": "high"
    },
    {
      "id": "pl22-population",
      "category": "population",
      "label": "Population density near site",
      "value": "Low-density rural coast — favourable for siting",
      "detail": "Choczewo commune has fewer than 6,000 residents. The coastal strip hosting the site is sparsely populated forest/agricultural land. The nearest city (Lębork, ~35,000) is ~25 km away. Low population density satisfies Polish Atomic Law (PAA) emergency planning zone requirements without significant population relocation.",
      "citationId": "pl-prawo-atomowe",
      "confidence": "high"
    },
    {
      "id": "pl22-pathway",
      "category": "pathway",
      "label": "Best-fit pathway",
      "value": "Greenfield NPP — construction licence submitted (2026)",
      "detail": "Poland's first NPP will be greenfield (no prior nuclear infrastructure). The PPEJ programme and Prawo atomowe framework establish the licensing pathway through PAA. PEJ–Westinghouse–Bechtel consortium. First concrete targeted for 2028; first unit commercial operation 2036. Funding mix of state equity, EU Taxonomy financing, and US EXIM Bank support.",
      "citationId": "pl-ppej",
      "confidence": "high"
    }
  ]
}
```


## CANDIDATE SITES (the pool to screen; cite these site/citation ids)

```json
[
  {
    "id": "pl-22-lubiatowo-kopalino",
    "country": "POL",
    "regionId": "PL-22",
    "name": "Lubiatowo-Kopalino (Choczewo NPP site — PEJ / Westinghouse AP1000)",
    "kind": "named",
    "lat": 54.668,
    "lng": 17.776,
    "attributes": {
      "availableFootprintHectares": 700,
      "coolingSource": "Baltic Sea once-through seawater cooling (~7 ppt salinity, 1–2 km from site)",
      "waterAvailability": "abundant",
      "gridDistanceKm": 80,
      "populationDensity": "low",
      "hazards": [
        "seismic-none",
        "storm-surge-low"
      ],
      "landStatus": "state-designated NPP site — PEJ land acquisition in progress; Polish Atomic Law (Prawo atomowe) licensing pathway",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR"
    ],
    "citationIds": [
      "pl22-land-coastal",
      "pl22-grid-pse",
      "pl22-water-baltic",
      "pl22-hazard-seismic",
      "pl22-population",
      "pl-ppej",
      "pl-site-lubiatowo"
    ],
    "confidence": "high"
  },
  {
    "id": "pl-22-zarnowiec",
    "country": "POL",
    "regionId": "PL-22",
    "name": "Żarnowiec Historic NPP Site (Lake Żarnowiec, Gmina Gniewino)",
    "kind": "named",
    "lat": 54.7,
    "lng": 18.1,
    "attributes": {
      "availableFootprintHectares": 400,
      "coolingSource": "Lake Żarnowiec (natural freshwater reservoir, ~14 km²) — pumped-storage hydro also present; limited salinity risk",
      "waterAvailability": "abundant",
      "gridDistanceKm": 50,
      "populationDensity": "low",
      "hazards": [
        "seismic-none"
      ],
      "landStatus": "former state NPP site — partial civil works remain; Polish State Treasury land; reactive if political will returns",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR"
    ],
    "citationIds": [
      "pl22-land-coastal",
      "pl22-grid-pse",
      "pl22-water-baltic",
      "pl22-hazard-seismic",
      "pl-ppej",
      "pl-prawo-atomowe"
    ],
    "confidence": "medium"
  },
  {
    "id": "pl-22-ustka-coast-greenfield",
    "country": "POL",
    "regionId": "PL-22",
    "name": "Eastern Pomerania Coast Greenfield Zone (near Ustka — Słupsk County)",
    "kind": "greenfield",
    "lat": 54.59,
    "lng": 16.6,
    "attributes": {
      "availableFootprintHectares": 300,
      "coolingSource": "Baltic Sea seawater once-through — coastal strip; same low-salinity advantage as Lubiatowo",
      "waterAvailability": "abundant",
      "gridDistanceKm": 50,
      "populationDensity": "low",
      "hazards": [
        "seismic-none",
        "storm-surge-low"
      ],
      "landStatus": "mixed state/private coastal land — Natura 2000 coastal forests nearby; environmental screening required",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR"
    ],
    "citationIds": [
      "pl22-land-coastal",
      "pl22-grid-pse",
      "pl22-water-baltic",
      "pl22-pathway"
    ],
    "confidence": "medium"
  },
  {
    "id": "pl-22-lebork-inland-greenfield",
    "country": "POL",
    "regionId": "PL-22",
    "name": "Inland Pomerania Greenfield Zone (Lębork area — agricultural plateau)",
    "kind": "greenfield",
    "lat": 54.53,
    "lng": 17.75,
    "attributes": {
      "availableFootprintHectares": 200,
      "coolingSource": "Łeba River (small freshwater; limited flow) — cooling tower required; no seawater access",
      "waterAvailability": "limited",
      "gridDistanceKm": 30,
      "populationDensity": "low",
      "hazards": [
        "seismic-none"
      ],
      "landStatus": "agricultural private land — standard PAA permitting; no known protected designation",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "BWR",
      "iPWR",
      "HTGR",
      "SFR",
      "MSR"
    ],
    "citationIds": [
      "pl22-grid-pse",
      "pl22-population",
      "pl22-pathway",
      "pl-prawo-atomowe"
    ],
    "confidence": "medium"
  },
  {
    "id": "pl-22-gdansk-bay-industrial-greenfield",
    "country": "POL",
    "regionId": "PL-22",
    "name": "Gdańsk Bay Industrial Coastal Zone (greenfield screen, Trójmiasto fringe)",
    "kind": "greenfield",
    "lat": 54.56,
    "lng": 18.55,
    "attributes": {
      "availableFootprintHectares": 150,
      "coolingSource": "Baltic/Gdańsk Bay seawater — brackish (less saline than open sea)",
      "waterAvailability": "abundant",
      "gridDistanceKm": 2,
      "populationDensity": "medium",
      "hazards": [
        "seismic-none",
        "flood-low"
      ],
      "landStatus": "industrial port zone — Gdańsk Special Economic Zone; multi-use planning; complex permitting",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "iPWR",
      "BWR",
      "HTGR"
    ],
    "citationIds": [
      "pl22-grid-pse",
      "pl22-water-baltic",
      "pl22-population",
      "pl-prawo-atomowe"
    ],
    "confidence": "medium"
  }
]
```


Return ONLY the AnalysisResult JSON for country="POL", regionId="PL-22", reactorId="westinghouse-ap1000", pathway="greenfield".