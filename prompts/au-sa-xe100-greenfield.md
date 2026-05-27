# Prompt — au-sa-xe100-greenfield

_Demonstrates: Australia HTGR on ideal-looking land — must return NO VIABLE SITES (EPBC/ARPANS ban), not a physical fail._

**Paste everything below the line into ChatGPT. Return its JSON to Claude as `au-sa-xe100-greenfield`.**

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

Screen the candidate sites in **AU-SA (AUS)** for reactor **xenergy-xe100**, pathway **greenfield**.

## REACTOR ENVELOPE

```json
{
  "id": "xenergy-xe100",
  "company": "X-energy",
  "companyUrl": "https://x-energy.com/reactors/xe-100",
  "model": "Xe-100",
  "type": "SMR",
  "technology": "HTGR",
  "outputMW": 80,
  "footprintHectares": 5,
  "coolingOptions": [
    "dry"
  ],
  "waterNeeds": "Helium-cooled TRISO-fueled pebble-bed; air-cooled condenser (dry cooling) — minimal water footprint; no liquid cooling required",
  "status": "NRC licensing underway; DOE ARDP award; Dow–X-energy Texas project NRC environmental assessment completed May 2026; IPO April 2026",
  "citation": {
    "id": "cite-xenergy-xe100",
    "title": "Xe-100 Reactor — X-energy Product Page",
    "citation": "X-energy — Xe-100 High-Temperature Gas-Cooled Reactor",
    "year": 2024,
    "url": "https://x-energy.com/reactors/xe-100"
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
  "regionId": "AU-SA",
  "regionName": "South Australia",
  "hasRichData": true,
  "facts": [
    {
      "id": "sa-land-arid",
      "category": "land",
      "label": "Land availability",
      "value": "Vast arid/semi-arid land — technically ideal for remote siting",
      "detail": "South Australia covers ~984,000 km² with a population of ~1.8 million, mostly in Adelaide. The interior Eyre Peninsula and Outback SA have enormous tracts of flat, uninhabited land that would satisfy any exclusion-area requirement. On pure land metrics alone, SA is arguably the most suitable Australian state for nuclear siting — yet statutory prohibitions render this moot.",
      "confidence": "high"
    },
    {
      "id": "sa-grid-renewables",
      "category": "grid",
      "label": "Grid and renewable context",
      "value": "High renewable penetration; transmission to NEM East limited",
      "detail": "South Australia regularly achieves 100%+ instantaneous renewable generation (wind + solar). ElectraNet operates the SA transmission system connected to Victoria via Heywood and Murraylink interconnectors. New nuclear baseload would face grid integration challenges in a high-VRE system, though SA has expressed interest in baseload alternatives pending a federal law change.",
      "confidence": "medium"
    },
    {
      "id": "sa-water-scarce",
      "category": "water",
      "label": "Cooling water availability",
      "value": "Coastal sites viable; interior sites face extreme scarcity",
      "detail": "The Spencer Gulf and Great Australian Bight coastlines offer seawater cooling for coastal sites. Interior SA is hyper-arid (< 200 mm/yr median rainfall in the north). No major perennial rivers. The Murray-Darling system is fully allocated under the Murray-Darling Basin Plan. Coastal siting is the only realistic cooling option.",
      "confidence": "high"
    },
    {
      "id": "sa-hazard-stable",
      "category": "hazard",
      "label": "Seismic and geological hazard",
      "value": "Low-to-moderate — some intraplate seismicity in Flinders Ranges",
      "detail": "South Australia is on the stable Australian craton but has notable intraplate seismicity in the Flinders Ranges (e.g. Marryat Creek 1986 M5.7, Burra area). Coastal Eyre Peninsula sites have low seismic hazard. Site-specific seismic characterization would be required under any nuclear regulatory regime — though ARPANSA currently has no authority to licence nuclear plants.",
      "confidence": "medium"
    },
    {
      "id": "sa-population",
      "category": "population",
      "label": "Population density",
      "value": "Extremely low outside Adelaide — favourable on population criteria alone",
      "detail": "The SA Outback and Eyre Peninsula have population densities below 0.1 persons/km². Adelaide (~1.4 M) is geographically isolated. In a world without the statutory ban, SA's remote interior would easily meet any exclusion-area requirement under an Australian nuclear regulatory framework analogous to 10 CFR Part 100.",
      "confidence": "high"
    },
    {
      "id": "sa-pathway-ban",
      "category": "pathway",
      "label": "Statutory feasibility",
      "value": "PROHIBITED — nuclear power plant construction/licensing banned by federal law",
      "detail": "Federal law imposes a dual prohibition: EPBC Act 1999 s.140A bars ministerial approval for any nuclear power plant; ARPANS Act 1998 s.10 bars ARPANSA from issuing a construction or operating licence. South Australia adds a state-level Nuclear Waste Storage Facility (Prohibition) Act 2000. No pathway to nuclear power exists in SA without repeal of Commonwealth legislation. Fatal regardless of site merit.",
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
    "id": "au-sa-port-augusta-northern",
    "country": "AUS",
    "regionId": "AU-SA",
    "name": "Northern Power Station Site / Port Augusta (retired coal brownfield)",
    "kind": "named",
    "lat": -32.55,
    "lng": 137.76,
    "attributes": {
      "availableFootprintHectares": 200,
      "coolingSource": "Spencer Gulf (tidal inlet) — seawater cooling within ~2 km; established cooling water rights from prior coal plant",
      "waterAvailability": "abundant",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "retired coal (brownfield) — state-owned land; demolished; site available for adaptive reuse",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR"
    ],
    "citationIds": [
      "sa-land-arid",
      "sa-grid-renewables",
      "sa-water-scarce",
      "sa-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10"
    ],
    "confidence": "medium"
  },
  {
    "id": "au-sa-port-augusta-playford",
    "country": "AUS",
    "regionId": "AU-SA",
    "name": "Playford B Power Station Site / Port Augusta (retired coal, ElectraNet grid)",
    "kind": "named",
    "lat": -32.54,
    "lng": 137.755,
    "attributes": {
      "availableFootprintHectares": 150,
      "coolingSource": "Spencer Gulf seawater (via Northern Power Station shared cooling infrastructure corridor)",
      "waterAvailability": "abundant",
      "gridDistanceKm": 0,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "retired coal (brownfield) — state land; same Port Paterson precinct as Northern station",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR"
    ],
    "citationIds": [
      "sa-land-arid",
      "sa-grid-renewables",
      "sa-water-scarce",
      "sa-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10"
    ],
    "confidence": "medium"
  },
  {
    "id": "au-sa-eyre-peninsula-spencer-gulf",
    "country": "AUS",
    "regionId": "AU-SA",
    "name": "Eyre Peninsula / Spencer Gulf Coastal Zone (greenfield screen)",
    "kind": "greenfield",
    "lat": -32.562,
    "lng": 137.738,
    "attributes": {
      "availableFootprintHectares": 500,
      "coolingSource": "Spencer Gulf seawater — ~2 km to inlet; established coastal zone",
      "waterAvailability": "abundant",
      "gridDistanceKm": 5,
      "populationDensity": "low",
      "hazards": [
        "seismic-low"
      ],
      "landStatus": "pastoral/Crown land — SA Crown Lands Act; nuclear development statutorily prohibited",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "PWR",
      "BWR",
      "iPWR",
      "SFR"
    ],
    "citationIds": [
      "sa-land-arid",
      "sa-water-scarce",
      "sa-grid-renewables",
      "sa-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10",
      "au-sa-prohibition"
    ],
    "confidence": "medium"
  },
  {
    "id": "au-sa-outback-hyper-arid",
    "country": "AUS",
    "regionId": "AU-SA",
    "name": "SA Outback Interior (greenfield — hyper-arid, remote, no grid)",
    "kind": "greenfield",
    "lat": -30,
    "lng": 136,
    "attributes": {
      "availableFootprintHectares": 5000,
      "coolingSource": "dry/air-cooled only — no surface water; hyper-arid (< 200 mm/yr rainfall)",
      "waterAvailability": "none",
      "gridDistanceKm": 500,
      "populationDensity": "low",
      "hazards": [
        "heat-extreme",
        "seismic-low"
      ],
      "landStatus": "Crown land / pastoral lease — potential Aboriginal heritage overlay; nuclear banned regardless",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "HTGR",
      "microreactor",
      "SFR"
    ],
    "citationIds": [
      "sa-land-arid",
      "sa-water-scarce",
      "sa-hazard-stable",
      "sa-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10"
    ],
    "confidence": "medium"
  },
  {
    "id": "au-sa-osborne-industrial-greenfield",
    "country": "AUS",
    "regionId": "AU-SA",
    "name": "Osborne Industrial Precinct / Adelaide (greenfield screen — Port River)",
    "kind": "greenfield",
    "lat": -34.81,
    "lng": 138.49,
    "attributes": {
      "availableFootprintHectares": 80,
      "coolingSource": "Gulf St Vincent seawater via Port River — existing industrial water intake infrastructure",
      "waterAvailability": "abundant",
      "gridDistanceKm": 1,
      "populationDensity": "high",
      "hazards": [
        "seismic-low",
        "flood-low"
      ],
      "landStatus": "industrial Crown/state land — defence precincts (HMAS Stirling); complex multi-agency permitting; nuclear banned",
      "protectedAreaFlag": false
    },
    "suitableTechnologies": [
      "iPWR",
      "microreactor"
    ],
    "citationIds": [
      "sa-grid-renewables",
      "sa-water-scarce",
      "sa-population",
      "sa-pathway-ban",
      "au-epbc-140a",
      "au-arpans-10",
      "au-sa-prohibition"
    ],
    "confidence": "medium"
  }
]
```


Return ONLY the AnalysisResult JSON for country="AUS", regionId="AU-SA", reactorId="xenergy-xe100", pathway="greenfield".