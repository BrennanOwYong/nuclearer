# F3 — Data layer (country corpus, region facts, reactor catalog) + `loadCorpus`

> **Parent PRD:** `docs/superpowers/plans/2026-05-27-nuclear-globe-PRD.md`
> **Design spec:** `docs/superpowers/specs/2026-05-27-nuclear-site-intelligence-globe-design.md`
> **REQUIRED EXECUTION SUB-SKILL:** `superpowers:subagent-driven-development` (steps use `- [ ]` checkboxes; write tests first per `superpowers:test-driven-development`).

## Goal

Provide the demo's entire hardcoded-but-credible knowledge base: per-country legal **RulePack** corpora (`CountryCorpus`/`SourceSnippet`), richly modeled **flagship-region** facts (`RegionData`/`RegionFact[]`), a real-vendor **reactor catalog** (`ReactorModel[]`), the data lookups (`getCountryCorpus`, `getRegionData`, `getReactors`, `listFlagshipRegions`), and the **real** `loadCorpus(country, regionId)` implementation that returns `{ country, region }` or throws `CorpusNotFoundError` for non-flagship regions. Every citation is **real and verifiable** (law name + section + year + URL; vendor spec sheet URL) — no invented sources.

## Dependency note

**Depends on: F1** (Wave 2, runs in parallel with F2). F1 ships:
- `src/types.ts` — the LOCKED contracts (`Citation`, `SourceSnippet`, `CountryCorpus`, `FactCategory`, `RegionFact`, `RegionData`, `ReactorType`, `ReactorTechnology`, `ReactorModel`, etc.). F3 imports these **verbatim** and never redefines them. The `ReactorModel` now carries two added LOCKED fields (use verbatim):
  - `technology: ReactorTechnology` where `ReactorTechnology = 'PWR' | 'BWR' | 'iPWR' | 'HTGR' | 'SFR' | 'MSR' | 'microreactor'`
  - `companyUrl: string` — the vendor's own product/company URL.
- `server/corpus.ts` — a **stub** `loadCorpus` plus the `CorpusNotFoundError` class. **F3 replaces the stub body with the real implementation but KEEPS the `CorpusNotFoundError` class exactly as F1 defined it** (callers in F5/F6 catch it to render the "limited data" state).

If F1's `CorpusNotFoundError` signature differs from what this doc assumes (see Task 7), do NOT redefine it — adapt the `throw` call to F1's actual constructor and surface the discrepancy per the deviation clause.

## File structure

| Path | Owner | Purpose |
|------|-------|---------|
| `src/data/countries/usa.ts` | **F3 (new)** | `CountryCorpus` for USA — NRC RulePack source snippets |
| `src/data/countries/poland.ts` | **F3 (new)** | `CountryCorpus` for Poland — PAA / PPEJ RulePack |
| `src/data/countries/australia.ts` | **F3 (new)** | `CountryCorpus` for Australia — incl. the statutory **ban** snippets (EPBC s.140A, ARPANS s.10) |
| `src/data/regions/us-wy.ts` | **F3 (new)** | Wyoming `RegionData` (coal-repower flagship) |
| `src/data/regions/us-il.ts` | **F3 (new)** | Illinois `RegionData` (nuclear-friendly flagship) |
| `src/data/regions/pl-pomerania.ts` | **F3 (new)** | Pomeranian Voivodeship `RegionData` (first NPP site) |
| `src/data/regions/pl-greater-poland.ts` | **F3 (new)** | Greater Poland (Pątnów/Konin coal-repower) `RegionData` |
| `src/data/regions/au-sa.ts` | **F3 (new)** | South Australia `RegionData` (ideal land, fatal ban) |
| `src/data/regions/au-nt.ts` | **F3 (new)** | Northern Territory `RegionData` (outback, ban + water scarcity) |
| `src/data/reactors.ts` | **F3 (new)** | `ReactorModel[]` vendor catalog |
| `src/data/index.ts` | **F3 (new)** | Registries + lookups: `getCountryCorpus`, `getRegionData`, `getReactors`, `listFlagshipRegions` |
| `server/corpus.ts` | **F1 stub → F3 real** | Real `loadCorpus`; keep F1's `CorpusNotFoundError` class |
| `src/data/*.test.ts`, `server/corpus.test.ts` | **F3 (new)** | Vitest unit tests (one per task below) |

**Do NOT touch** globe files (`src/globe/*`, F2), dashboard (`src/dashboard/*`, F4), chat/analysis route files (`src/chat/*`, `server/routes/*`, F5/F6).

## Flagship regions (chosen + justification)

**`regionId = feature.properties.iso_3166_2`** — confirmed. F2 emits this exact property (ISO 3166-2, e.g. `US-WY`) as the `regionId` in `onRegionSelected`, and `getRegionData`'s key MUST be that value. **Task 1 below still verifies the value is populated for the six chosen regions in F2's filtered GeoJSON** (Natural Earth occasionally has empty/variant `iso_3166_2` cells); if any chosen region's cell is blank or differs, use the GeoJSON's actual value and note the deviation.

| Country | Region | ID (expected `iso_3166_2`) | Why |
|---------|--------|------|-----|
| USA | **Wyoming** | `US-WY` | Flagship coal-to-nuclear **repower** case — TerraPower's Natrium plant is being built at the retiring Naughton coal site near Kemmerer. Showcases the `coal-repower` pathway on real momentum. |
| USA | **Illinois** | `US-IL` | Most nuclear-friendly large grid (largest US nuclear fleet, strong baseload + transmission). Showcases `greenfield`/`large` new-build with favorable grid + water (Great Lakes / river cooling). |
| Poland | **Pomeranian Voivodeship** | `PL-22` | Site of Poland's **first** NPP (Lubiatowo-Kopalino, Choczewo commune; AP1000 ×3). Coastal Baltic cooling. The headline Polish new-build story. |
| Poland | **Greater Poland Voivodeship** | `PL-30` | Pątnów/Konin lignite complex — Poland's flagship **coal-repower** SMR narrative (BWRX-300 program with ZE PAK/Orlen). Contrasts the coastal large-build with an interior repower. |
| Australia | **South Australia** | `AU-SA` | The "looks ideal, fails on cited law" hero case: vast open arid land, but federal **statutory ban** (EPBC s.140A, ARPANS s.10) **plus** SA's own state prohibition. Surfaces a `fail`-worthy cited fact. |
| Australia | **Northern Territory** | `AU-NT` | Outback emptiness that *looks* perfect for siting, but compounds the federal ban with extreme interior **water scarcity** and **grid distance**. Reinforces the "non-obvious fatal constraint" demo. |

3 USA candidates were considered (WY, IL, TX); TX dropped to keep 2/country and because WY+IL already cover repower + favorable-grid. Surface any GeoID mismatch per the deviation clause rather than silently renumbering.

## Data research checklist

> **EXECUTOR: every citation below must be opened and verified before use.** For each: confirm the law/section still exists at the URL, confirm the year (enactment or current compilation), and confirm vendor figures against the linked spec sheet. If a URL 404s or a figure differs, update it and note the change — **never leave a placeholder URL and never invent a source.** Tests in Task 8 fail the build if any `url`/`citation` is empty or looks like a placeholder.

### USA corpus (`usa.ts`) — regulator "U.S. NRC", code `USA`
- [ ] **NRC reactor site criteria** — `10 CFR Part 100`, year **2024** (current compilation). URL **VERIFIED**: `https://www.ecfr.gov/current/title-10/chapter-I/part-100` — `type: 'computable'`, `confidence: 'high'`, id `us-nrc-10cfr100`.
- [ ] **NRC population/exclusion-area siting** — `10 CFR 100.21` (non-seismic siting criteria, exclusion area & low-population zone). URL `https://www.ecfr.gov/current/title-10/chapter-I/part-100/subpart-B/section-100.21` — verify section number, id `us-nrc-100-21`.
- [ ] **NEPA environmental review trigger** — National Environmental Policy Act of 1969, `42 U.S.C. §4321 et seq.` URL `https://www.epa.gov/laws-regulations/summary-national-environmental-policy-act` (executor: prefer the eCFR/USC primary source `https://uscode.house.gov/` — verify). id `us-nepa`, year 1969, `type: 'human-review'`.
- [ ] **Clean Water Act §316(b)** cooling-water intake (once-through siting friction) — `33 U.S.C. §1326(b)`. URL `https://www.epa.gov/cwa-404` (executor: verify correct CWA 316(b) page on epa.gov). id `us-cwa-316b`, `type: 'human-review'`.

### Poland corpus (`poland.ts`) — regulator "PAA (Państwowa Agencja Atomistyki)", code `POL`
- [ ] **Polish Nuclear Energy Programme (PPEJ)** — government programme, current update. URL **VERIFIED (program/operator)**: `https://pej.pl/en/the-project/key-information/` — id `pl-ppej`, year 2020 (programme adopted; verify latest update year), `type: 'human-review'`, `confidence: 'high'`.
- [ ] **Atomic Law (Prawo atomowe)** — Act of 29 Nov 2000, Journal of Laws (licensing by PAA). URL `https://isap.sejm.gov.pl/` (executor: find the consolidated `Prawo atomowe` text on ISAP and copy the exact Dz.U. reference + year). id `pl-prawo-atomowe`, `type: 'computable'`.
- [ ] **First NPP site decision (Lubiatowo-Kopalino, Choczewo, Pomerania)** — PEJ siting. URL `https://pej.pl/en/the-project/localization/` (executor: verify exact localization page URL). id `pl-site-lubiatowo`, `type: 'human-review'`.
- [ ] **Pątnów/Konin coal-repower SMR program** — ZE PAK / Orlen Synthos Green Energy BWRX-300. URL `https://www.osge.pl/en/` (executor: verify a stable OSGE or world-nuclear-news page). id `pl-patnow-smr`, `type: 'human-review'`, `confidence: 'medium'`.

### Australia corpus (`australia.ts`) — regulator "ARPANSA", code `AUS`  **(BAN must surface as a `fail`-worthy cited fact)**
- [ ] **EPBC Act 1999 s.140A — "No approval for certain nuclear installations"** (Minister must not approve a nuclear power plant). URL **VERIFIED**: `https://www5.austlii.edu.au/au/legis/cth/consol_act/epabca1999588/s140a.html` — id `au-epbc-140a`, year **1999**, `type: 'computable'`, `confidence: 'high'`. **This snippet's text must quote the prohibition.**
- [ ] **ARPANS Act 1998 s.10 — "Prohibition on certain nuclear installations"** (CEO must not licence a nuclear power plant; cf. s.10(2)). URL **VERIFIED**: `http://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/arpansa1998487/s10.html` — id `au-arpans-10`, year **1998**, `type: 'computable'`, `confidence: 'high'`.
- [ ] **South Australia state prohibition** — Nuclear Waste Storage Facility (Prohibition) Act 2000 (SA) and/or relevant SA bar on nuclear power facilities. URL `https://www.legislation.sa.gov.au/` (executor: locate the exact SA Act + section and copy the legislation.sa.gov.au URL). id `au-sa-prohibition`, `type: 'computable'`, `confidence: 'medium'`.
- [ ] **NT / interior water scarcity context** (supports the water-scarcity `fail`/`caution` fact for AU-NT) — Bureau of Meteorology aridity or a Geoscience Australia water resources page. URL `http://www.bom.gov.au/` (executor: pick a stable BoM/Geoscience page). id `au-interior-water`, `type: 'human-review'`, `confidence: 'low'`.

### Reactor catalog (`reactors.ts`) — survey of technology families, one+ real vendor offering each
> Each entry carries the LOCKED `ReactorType` (`'SMR' | 'large' | 'micro'`) **and** the new `technology: ReactorTechnology` and `companyUrl`. Verify every `companyUrl`, every `citation.url` (spec sheet), and every numeric field against the vendor's own page; **flag any numeric field you cannot confirm as "executor must verify" rather than fabricating.** All 7 `ReactorTechnology` families must be covered.

**PWR — large**
- [ ] **Westinghouse AP1000** — id `westinghouse-ap1000`, `type: 'large'`, `technology: 'PWR'`, `outputMW: 1110` (net MWe; 3415 MWt). `companyUrl` **VERIFIED**: `https://westinghousenuclear.com/energy-systems/ap1000-pwr/overview/`. `citation.url` = same overview page. `status: "Operating (Vogtle 3&4); NRC design certified"`, `confidence: 'high'`.
- [ ] **EDF EPR** — id `edf-epr`, `type: 'large'`, `technology: 'PWR'`, `outputMW: 1650` (executor: confirm EPR ~1650 MWe figure on the cited page). `companyUrl` `https://www.edf.fr/en/the-edf-group/sustainable-production/new-nuclear` (executor: find a stable EDF EPR spec page). `status: "Operating (Flamanville 3, Taishan, OL3)"`, `confidence: 'high'`.
- [ ] **KHNP APR1400** — id `khnp-apr1400`, `type: 'large'`, `technology: 'PWR'`, `outputMW: 1400` (net MWe; 3983–4000 MWt — verify). `companyUrl` `https://www.khnp.co.kr/eng/` (executor: confirm stable KHNP English page). `citation.url` **VERIFIED (NRC design cert)**: `https://www.nrc.gov/reactors/new-reactors/large-lwr/design-cert/apr1400` (executor: prefer a KHNP spec sheet if found). `status: "NRC design certified (2019); operating in Korea/UAE"`, `confidence: 'high'`.

**BWR — SMR**
- [ ] **GE-Hitachi BWRX-300** — id `ge-bwrx-300`, `type: 'SMR'`, `technology: 'BWR'`, `outputMW: 300`, natural-circulation BWR. `companyUrl` **VERIFIED**: `https://www.gevernova.com/nuclear/carbon-free-power/bwrx-300-small-modular-reactor`. `citation.url` = general-description PDF `https://www.gevernova.com/content/dam/gevernova-nuclear/global/en_us/documents/carbon-free-power/005N9751-BWRX-300-General-Description.pdf` (footprint from there). `status: "NRC pre-application; deployments in progress"`.

**iPWR (integral PWR) — SMR**
- [ ] **NuScale VOYGR** — id `nuscale-voygr`, `type: 'SMR'`, `technology: 'iPWR'`, `outputMW: 77` (per module; 250 MWth). `companyUrl` **VERIFIED**: `https://www.nuscalepower.com/products/nuscale-power-module`. `citation.url` = spec PDF `https://www.nuscalepower.com/hubfs/NPM-technical-specifications.pdf` (copy `footprintHectares`/`waterNeeds`). `status: "NRC Standard Design Approval for 77 MWe (2025)"`.
- [ ] **Rolls-Royce SMR** — id `rr-smr`, `type: 'SMR'`, `technology: 'iPWR'` (executor: it is a close-coupled 3-loop PWR — if you judge it conventional-PWR rather than integral, use `'PWR'` and note it), `outputMW: 470`. `companyUrl` **VERIFIED**: `https://www.rolls-royce-smr.com/`. `citation.url` = `https://gda.rolls-royce-smr.com/our-technology`. `status: "UK GDA in progress"`.
- [ ] **Holtec SMR-300** — id `holtec-smr300`, `type: 'SMR'`, `technology: 'iPWR'` (two-loop pressurized light-water; integral SG/pressurizer), `outputMW: 300` (~320 MWe / 1050 MWth — verify). `companyUrl` **VERIFIED**: `https://holtecinternational.com/products-and-services/smr/`. `citation.url` = technical bulletin `https://holtecinternational.com/wp-content/uploads/2025/01/HTB-085-SMR-300-Rev-5.pdf` (executor: confirm latest revision; footprint ~5 acres single / ~8 acres twin → convert to hectares). `status: "ONR GDA / NRC pre-application"`, `confidence: 'medium'`.

**HTGR**
- [ ] **X-energy Xe-100** — id `xenergy-xe100`, `type: 'SMR'`, `technology: 'HTGR'`, `outputMW: 80` (per module; ~200 MWth), helium-cooled / TRISO-X, `coolingOptions: ["dry"]` (gas-cooled, minimal water). `companyUrl` **VERIFIED**: `https://x-energy.com/reactors/xe-100`. `citation.url` = same. `status: "NRC licensing; DOE ARDP award"`.

**SFR (sodium fast)**
- [ ] **TerraPower Natrium** — id `terrapower-natrium`, `type: 'SMR'` (executor: 345 MWe → use `'SMR'`; it is not micro and below large new-build — note the classification), `technology: 'SFR'`, `outputMW: 345` (boostable to 500 MWe via molten-salt storage), sodium-cooled (not water — `coolingOptions` reflect the steam-cycle/storage side; `waterNeeds` "site-dependent steam cycle"). `companyUrl` **VERIFIED**: `https://www.terrapower.com/natrium/`. `citation.url` = technology PDF `https://www.terrapower.com/downloads/Natrium_Technology.pdf`. `status: "NRC construction permit under review; Kemmerer WY site"`, `confidence: 'high'`.

**microreactor**
- [ ] **Westinghouse eVinci** — id `westinghouse-evinci`, `type: 'micro'`, `technology: 'microreactor'`, `outputMW: 5` (heat-pipe microreactor; verify 5 MWe). `companyUrl` **VERIFIED domain**: `https://westinghousenuclear.com/` (executor: locate the eVinci product page, e.g. `/new-plants/evinci-microreactor/`, and use it for both `companyUrl` and `citation.url`). `status: "Targeting market readiness ~2027"`, `confidence: 'medium'`.
- [ ] **Oklo Aurora** — id `oklo-aurora`, `type: 'micro'`, `technology: 'microreactor'` (liquid-metal-cooled metal-fueled fast microreactor; `technology: 'microreactor'` is correct for the family field), `outputMW: 75` (up to 75 MWe per current design — verify; earlier design was 1.5 MWe). `companyUrl` **VERIFIED**: `https://oklo.com/`. `citation.url` = `https://oklo.com/energy/default.aspx` (executor: confirm the stable energy/product page). `status: "NRC pre-application; Aurora-INL groundbreaking 2025"`, `confidence: 'medium'`.

**MSR (molten salt)**
- [ ] **Terrestrial Energy IMSR** — id `terrestrial-imsr`, `type: 'SMR'`, `technology: 'MSR'`, `outputMW: 195` (per core; IMSR400 pairs two → 390 MWe net on ~7 ha). `companyUrl` **VERIFIED**: `https://www.terrestrialenergy.com/` (executor: confirm domain + locate the IMSR technology page for `citation.url`). `status: "CNSC Vendor Design Review phase 2 complete (2023); NRC/CNSC review"`, `confidence: 'medium'`.

## Interfaces consumed / produced

**Consumes (from F1, import — never redefine):**
- `src/types.ts`: `Citation`, `SourceType`, `Confidence`, `SourceSnippet`, `CountryCorpus`, `FactCategory`, `RegionFact`, `RegionData`, `ReactorType`, `ReactorModel`.
- `server/corpus.ts`: `CorpusNotFoundError` (class) — re-thrown, not redefined.

**Produces:**
- Country corpora: `usaCorpus`, `polandCorpus`, `australiaCorpus` (typed `CountryCorpus`).
- Region data modules exporting one `RegionData` const each.
- `reactors: ReactorModel[]` in `reactors.ts`.
- `src/data/index.ts` lookups — **all synchronous and NON-throwing: they return `undefined` (or `[]`) on a miss, never throw.** Safe to import from the browser/client:
  - `getCountryCorpus(code: string): CountryCorpus | undefined`
  - `getRegionData(country: string, regionId: string): RegionData | undefined`
  - `getReactors(): ReactorModel[]`
  - `getReactor(id: string): ReactorModel | undefined`
  - `listFlagshipRegions(): { country: string; regionId: string; regionName: string }[]`
- `server/corpus.ts`: real `loadCorpus(country, regionId): { country: CountryCorpus; region: RegionData }` — **the ONLY throwing accessor, and it stays server-only.** It composes the non-throwing lookups and throws `CorpusNotFoundError` on a miss. Never import `server/corpus.ts` into client code.

---

### Task 1 — Confirm F1 contracts + GeoJSON region IDs

- [ ] Open `src/types.ts` and confirm the imported type names/fields match PRD §5 verbatim. Note the exact export style (named exports expected).
- [ ] Open `server/corpus.ts` (F1 stub) and record the exact `CorpusNotFoundError` constructor signature (e.g. `new CorpusNotFoundError(country, regionId)` vs `(message)`). Task 7 must match it.
- [ ] Locate F2's filtered Natural Earth admin-1 GeoJSON (search `git grep -l "iso_3166_2\|admin-1\|naturalearth" src`). **`regionId = feature.properties.iso_3166_2` is the confirmed contract** — verify each of the six chosen regions has a populated `iso_3166_2` cell (`US-WY`, `US-IL`, `PL-22`, `PL-30`, `AU-SA`, `AU-NT`). If any cell is blank/variant, use the GeoJSON's actual value for that region's module `regionId` + `getRegionData` key and note the deviation.
- [ ] Run: `npx tsc --noEmit` → **expected:** compiles clean against existing F1 code (no F3 files yet). If F1 not merged, coordinate per wave order.

### Task 2 — USA country corpus (TDD)

- [ ] Write `src/data/countries/usa.test.ts` first:

```ts
import { describe, it, expect } from 'vitest';
import { usaCorpus } from './usa';
import type { CountryCorpus, SourceSnippet } from '../../types';

describe('usaCorpus', () => {
  it('has correct country identity', () => {
    const c: CountryCorpus = usaCorpus;
    expect(c.code).toBe('USA');
    expect(c.name).toBe('United States');
    expect(c.regulator).toBe('U.S. NRC');
    expect(c.sources.length).toBeGreaterThanOrEqual(3);
  });

  it('every source snippet is well-formed and really cited', () => {
    for (const s of usaCorpus.sources as SourceSnippet[]) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.citation.length).toBeGreaterThan(0);
      expect(s.year).toBeGreaterThan(1900);
      expect(s.year).toBeLessThanOrEqual(new Date().getFullYear());
      expect(s.url).toMatch(/^https?:\/\/.+/);
      expect(s.text.length).toBeGreaterThan(0);
      expect(['computable', 'human-review']).toContain(s.type);
      expect(['high', 'medium', 'low']).toContain(s.confidence);
    }
  });

  it('includes the NRC reactor site criteria snippet', () => {
    const nrc = usaCorpus.sources.find((s) => s.id === 'us-nrc-10cfr100');
    expect(nrc).toBeDefined();
    expect(nrc!.citation).toContain('10 CFR Part 100');
    expect(nrc!.url).toContain('ecfr.gov');
  });
});
```

- [ ] Run `npx vitest run src/data/countries/usa.test.ts` → **expected:** fails (module not found / red).
- [ ] Create `src/data/countries/usa.ts` using the verified citations in the research checklist. Real snippet template (executor verifies/finishes the remaining snippets):

```ts
import type { CountryCorpus } from '../../types';

export const usaCorpus: CountryCorpus = {
  code: 'USA',
  name: 'United States',
  regulator: 'U.S. NRC',
  sources: [
    {
      id: 'us-nrc-10cfr100',
      title: 'Reactor Site Criteria',
      citation: '10 CFR Part 100',
      section: 'Part 100',
      year: 2024,
      url: 'https://www.ecfr.gov/current/title-10/chapter-I/part-100',
      text:
        'Establishes the NRC criteria used to evaluate the suitability of proposed sites for ' +
        'stationary power and testing reactors, including exclusion area, low-population zone, ' +
        'and population-center distance requirements.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'us-nrc-100-21',
      title: 'Non-seismic siting criteria',
      citation: '10 CFR 100.21',
      section: '100.21',
      year: 2024,
      url: 'https://www.ecfr.gov/current/title-10/chapter-I/part-100/subpart-B/section-100.21',
      text:
        'Requires an exclusion area and a low-population zone around the reactor and limits the ' +
        'population density and use characteristics of the site environs.',
      type: 'computable',
      confidence: 'high',
    },
    // executor: add us-nepa (NEPA 42 U.S.C. §4321, human-review) and
    // us-cwa-316b (Clean Water Act §316(b), human-review) per the research checklist.
  ],
};
```

- [ ] Run `npx vitest run src/data/countries/usa.test.ts` → **expected:** all green.

### Task 3 — Poland country corpus (TDD)

- [ ] Write `src/data/countries/poland.test.ts` mirroring Task 2's structure: assert `code === 'POL'`, `regulator === 'PAA (Państwowa Agencja Atomistyki)'`, the same well-formedness loop, and that a `pl-ppej` snippet exists with `url` containing `pej.pl`.
- [ ] Run `npx vitest run src/data/countries/poland.test.ts` → **expected:** red.
- [ ] Create `src/data/countries/poland.ts` with snippets `pl-ppej` (VERIFIED url `https://pej.pl/en/the-project/key-information/`), `pl-prawo-atomowe`, `pl-site-lubiatowo`, `pl-patnow-smr` per the research checklist (executor verifies the unverified URLs/years).
- [ ] Run `npx vitest run src/data/countries/poland.test.ts` → **expected:** green.

### Task 4 — Australia country corpus + ban (TDD)

- [ ] Write `src/data/countries/australia.test.ts`: assert `code === 'AUS'`, `regulator === 'ARPANSA'`, the well-formedness loop, **and the ban is present and computable:**

```ts
import { describe, it, expect } from 'vitest';
import { australiaCorpus } from './australia';

describe('australiaCorpus statutory ban', () => {
  it('includes EPBC Act 1999 s.140A as a computable, high-confidence prohibition', () => {
    const epbc = australiaCorpus.sources.find((s) => s.id === 'au-epbc-140a');
    expect(epbc).toBeDefined();
    expect(epbc!.citation).toContain('140A');
    expect(epbc!.year).toBe(1999);
    expect(epbc!.type).toBe('computable');
    expect(epbc!.confidence).toBe('high');
    expect(epbc!.url).toContain('austlii');
    expect(epbc!.text.toLowerCase()).toMatch(/prohibit|must not approve|no approval/);
  });

  it('includes ARPANS Act 1998 s.10 prohibition', () => {
    const arpans = australiaCorpus.sources.find((s) => s.id === 'au-arpans-10');
    expect(arpans).toBeDefined();
    expect(arpans!.citation).toContain('10');
    expect(arpans!.year).toBe(1998);
    expect(arpans!.type).toBe('computable');
  });
});
```

- [ ] Run `npx vitest run src/data/countries/australia.test.ts` → **expected:** red.
- [ ] Create `src/data/countries/australia.ts`:

```ts
import type { CountryCorpus } from '../../types';

export const australiaCorpus: CountryCorpus = {
  code: 'AUS',
  name: 'Australia',
  regulator: 'ARPANSA',
  sources: [
    {
      id: 'au-epbc-140a',
      title: 'No approval for certain nuclear installations',
      citation: 'EPBC Act 1999 (Cth) s.140A',
      section: '140A',
      year: 1999,
      url: 'https://www5.austlii.edu.au/au/legis/cth/consol_act/epabca1999588/s140a.html',
      text:
        'The Environment Minister must not approve an action consisting of or involving the ' +
        'construction or operation of a nuclear power plant (or fuel-fabrication, enrichment, ' +
        'or reprocessing facility). A federal statutory prohibition on nuclear power.',
      type: 'computable',
      confidence: 'high',
    },
    {
      id: 'au-arpans-10',
      title: 'Prohibition on certain nuclear installations',
      citation: 'ARPANS Act 1998 (Cth) s.10',
      section: '10',
      year: 1998,
      url: 'http://www.austlii.edu.au/cgi-bin/viewdoc/au/legis/cth/consol_act/arpansa1998487/s10.html',
      text:
        'Nothing in the Act authorises the construction or operation of a nuclear power plant, ' +
        'and the CEO of ARPANSA must not issue a licence for one (s.10(2)).',
      type: 'computable',
      confidence: 'high',
    },
    // executor: add au-sa-prohibition (SA state Act) and au-interior-water per the research checklist.
  ],
};
```

- [ ] Run `npx vitest run src/data/countries/australia.test.ts` → **expected:** green.

### Task 5 — Flagship region modules (TDD)

- [ ] Write `src/data/regions/regions.test.ts` validating all six region modules in one schema loop:

```ts
import { describe, it, expect } from 'vitest';
import { usWyoming } from './us-wy';
import { usIllinois } from './us-il';
import { plPomerania } from './pl-pomerania';
import { plGreaterPoland } from './pl-greater-poland';
import { auSouthAustralia } from './au-sa';
import { auNorthernTerritory } from './au-nt';
import type { RegionData, FactCategory } from '../../types';

const ALL: RegionData[] = [
  usWyoming, usIllinois, plPomerania, plGreaterPoland, auSouthAustralia, auNorthernTerritory,
];
const CATEGORIES: FactCategory[] = ['land', 'grid', 'water', 'hazard', 'population', 'pathway'];

describe('flagship region data', () => {
  it.each(ALL.map((r) => [r.regionName, r] as const))('%s is well-formed and rich', (_n, r) => {
    expect(r.country).toMatch(/^[A-Z]{3}$/);
    expect(r.regionId.length).toBeGreaterThan(0);
    expect(r.regionName.length).toBeGreaterThan(0);
    expect(r.hasRichData).toBe(true);
    expect(r.facts.length).toBeGreaterThanOrEqual(6);
    const cats = new Set(r.facts.map((f) => f.category));
    for (const cat of CATEGORIES) expect(cats.has(cat)).toBe(true); // every category represented
    for (const f of r.facts) {
      expect(f.id).toMatch(/^[a-z0-9-]+$/);
      expect(CATEGORIES).toContain(f.category);
      expect(f.label.length).toBeGreaterThan(0);
      expect(f.value.length).toBeGreaterThan(0);
      expect(f.detail.length).toBeGreaterThan(0);
      expect(['high', 'medium', 'low']).toContain(f.confidence);
      if (f.citationId !== undefined) expect(f.citationId.length).toBeGreaterThan(0);
    }
  });

  it('Australian flagship regions carry a fail-worthy ban fact citing EPBC s.140A', () => {
    for (const r of [auSouthAustralia, auNorthernTerritory]) {
      const ban = r.facts.find((f) => f.category === 'pathway' && f.citationId === 'au-epbc-140a');
      expect(ban, `${r.regionName} must surface the statutory ban`).toBeDefined();
      expect(ban!.value.toLowerCase()).toMatch(/prohibit|banned|not permitted|fail/);
    }
  });
});
```

- [ ] Run `npx vitest run src/data/regions/regions.test.ts` → **expected:** red.
- [ ] Create the six region modules. Each exports a `RegionData` const with `hasRichData: true` and at least one `RegionFact` per category (`land`, `grid`, `water`, `hazard`, `population`, `pathway`), `citationId` pointing into the matching country corpus where applicable. Example shape (US-WY):

```ts
import type { RegionData } from '../../types';

export const usWyoming: RegionData = {
  country: 'USA',
  regionId: 'US-WY',
  regionName: 'Wyoming',
  hasRichData: true,
  facts: [
    {
      id: 'wy-land-coal-repower',
      category: 'land',
      label: 'Coal-repower site availability',
      value: 'Retiring coal sites with existing grid ties',
      detail:
        'TerraPower Natrium is under construction at the retiring Naughton coal plant near ' +
        'Kemmerer, demonstrating brownfield coal-to-nuclear repowering on existing interconnects.',
      citationId: undefined, // executor: cite a TerraPower/DOE source added to usaCorpus if used
      confidence: 'medium',
    },
    {
      id: 'wy-grid-baseload',
      category: 'grid',
      label: 'Grid interconnection',
      value: 'Existing high-voltage ties at retiring coal nodes',
      detail: 'Coal-repower reuses transmission rights-of-way, lowering interconnection friction.',
      confidence: 'medium',
    },
    {
      id: 'wy-water-arid',
      category: 'water',
      label: 'Water availability',
      value: 'Semi-arid; dry/hybrid cooling favored',
      detail: 'Limited surface water in the high desert favors dry or hybrid cooling options.',
      citationId: 'us-cwa-316b',
      confidence: 'medium',
    },
    {
      id: 'wy-hazard-seismic',
      category: 'hazard',
      label: 'Seismic context',
      value: 'Low-to-moderate seismicity (interior West)',
      detail: 'Site-specific seismic characterization required under 10 CFR Part 100.',
      citationId: 'us-nrc-10cfr100',
      confidence: 'medium',
    },
    {
      id: 'wy-population',
      category: 'population',
      label: 'Population density',
      value: 'Very low (~2 persons/km^2)',
      detail: 'Sparse population eases exclusion-area and low-population-zone siting under 100.21.',
      citationId: 'us-nrc-100-21',
      confidence: 'high',
    },
    {
      id: 'wy-pathway',
      category: 'pathway',
      label: 'Best-fit pathway',
      value: 'Coal-repower (brownfield)',
      detail: 'Retiring coal capacity + existing grid make coal-repower the strongest pathway.',
      confidence: 'high',
    },
  ],
};
```

For **au-sa** and **au-nt**, the `pathway` fact MUST encode the ban as fail-worthy, e.g.:

```ts
    {
      id: 'sa-pathway-ban',
      category: 'pathway',
      label: 'Statutory feasibility',
      value: 'PROHIBITED — nuclear power banned',
      detail:
        'Federal law bars approval and licensing of any nuclear power plant (EPBC s.140A; ' +
        'ARPANS s.10); South Australia adds a state-level prohibition. Fatal regardless of land.',
      citationId: 'au-epbc-140a',
      confidence: 'high',
    },
```

- [ ] Run `npx vitest run src/data/regions/regions.test.ts` → **expected:** green.

### Task 6 — Reactor catalog + lookups (TDD)

- [ ] Write `src/data/index.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  getCountryCorpus, getRegionData, getReactors, getReactor, listFlagshipRegions,
} from './index';
import type { ReactorModel, ReactorTechnology } from '../types';

const TECHNOLOGIES: ReactorTechnology[] = [
  'PWR', 'BWR', 'iPWR', 'HTGR', 'SFR', 'MSR', 'microreactor',
];

describe('reactor catalog', () => {
  const reactors = getReactors();

  it('includes all surveyed real vendor models', () => {
    const ids = reactors.map((r) => r.id);
    for (const id of [
      'westinghouse-ap1000', 'edf-epr', 'khnp-apr1400',  // PWR large
      'ge-bwrx-300',                                      // BWR SMR
      'nuscale-voygr', 'rr-smr', 'holtec-smr300',         // iPWR SMR
      'xenergy-xe100',                                    // HTGR
      'terrapower-natrium',                               // SFR
      'westinghouse-evinci', 'oklo-aurora',               // microreactor
      'terrestrial-imsr',                                 // MSR
    ]) {
      expect(ids, `missing reactor ${id}`).toContain(id);
    }
  });

  it('covers at least one model for every ReactorTechnology family', () => {
    const present = new Set(reactors.map((r) => r.technology));
    for (const tech of TECHNOLOGIES) {
      expect(present.has(tech), `no model for technology family ${tech}`).toBe(true);
    }
  });

  it('every model is well-formed with a real citation, technology, and companyUrl', () => {
    for (const m of reactors as ReactorModel[]) {
      expect(m.company.length).toBeGreaterThan(0);
      expect(m.model.length).toBeGreaterThan(0);
      expect(['SMR', 'large', 'micro']).toContain(m.type);
      expect(TECHNOLOGIES).toContain(m.technology);
      expect(m.companyUrl).toMatch(/^https?:\/\/.+\..+/);
      expect(m.outputMW).toBeGreaterThan(0);
      expect(m.footprintHectares).toBeGreaterThan(0);
      expect(m.coolingOptions.length).toBeGreaterThan(0);
      expect(m.waterNeeds.length).toBeGreaterThan(0);
      expect(m.status.length).toBeGreaterThan(0);
      expect(m.citation.url).toMatch(/^https?:\/\/.+/);
      expect(m.citation.year).toBeGreaterThan(1900);
    }
  });

  it('getReactor returns by id and undefined for unknown', () => {
    expect(getReactor('ge-bwrx-300')!.outputMW).toBe(300);
    expect(getReactor('nope')).toBeUndefined();
  });
});

describe('lookups', () => {
  it('getCountryCorpus resolves known codes, undefined otherwise', () => {
    expect(getCountryCorpus('USA')!.regulator).toBe('U.S. NRC');
    expect(getCountryCorpus('POL')!.code).toBe('POL');
    expect(getCountryCorpus('AUS')!.code).toBe('AUS');
    expect(getCountryCorpus('XXX')).toBeUndefined();
  });

  it('getRegionData resolves flagship regions, undefined for non-flagship', () => {
    expect(getRegionData('USA', 'US-WY')!.regionName).toBe('Wyoming');
    expect(getRegionData('AUS', 'AU-SA')!.regionName).toBe('South Australia');
    expect(getRegionData('USA', 'US-CA')).toBeUndefined();
  });

  it('listFlagshipRegions lists exactly the six modeled regions', () => {
    const list = listFlagshipRegions();
    expect(list).toHaveLength(6);
    expect(list.map((r) => r.regionId).sort()).toEqual(
      ['AU-NT', 'AU-SA', 'PL-22', 'PL-30', 'US-IL', 'US-WY'],
    );
  });
});
```

- [ ] Run `npx vitest run src/data/index.test.ts` → **expected:** red.
- [ ] Create `src/data/reactors.ts` — `export const reactors: ReactorModel[]` with the **12 surveyed models** spanning all 7 `ReactorTechnology` families (use the research checklist; executor fills `footprintHectares`/`waterNeeds` from each spec sheet and marks any unconfirmed numeric with a `// executor must verify` comment). Each entry sets both `type` (LOCKED `ReactorType`) and the new `technology` + `companyUrl`. Example two entries:

```ts
import type { ReactorModel } from '../types';

export const reactors: ReactorModel[] = [
  {
    id: 'ge-bwrx-300',
    company: 'GE-Hitachi',
    model: 'BWRX-300',
    type: 'SMR',
    technology: 'BWR',
    companyUrl: 'https://www.gevernova.com/nuclear/carbon-free-power/bwrx-300-small-modular-reactor',
    outputMW: 300,
    footprintHectares: 4, // executor must verify from general-description PDF
    coolingOptions: ['once-through', 'tower'],
    waterNeeds: 'Conventional steam cycle; site-dependent (once-through or cooling tower)',
    status: 'NRC pre-application; multiple deployments in progress',
    citation: {
      id: 'cite-ge-bwrx-300',
      title: 'BWRX-300 General Description',
      citation: 'GE Vernova Hitachi — BWRX-300 General Description',
      year: 2024,
      url: 'https://www.gevernova.com/content/dam/gevernova-nuclear/global/en_us/documents/carbon-free-power/005N9751-BWRX-300-General-Description.pdf',
    },
  },
  {
    id: 'nuscale-voygr',
    company: 'NuScale',
    model: 'VOYGR (NuScale Power Module, 77 MWe)',
    type: 'SMR',
    technology: 'iPWR',
    companyUrl: 'https://www.nuscalepower.com/products/nuscale-power-module',
    outputMW: 77,
    footprintHectares: 14, // executor must verify from NPM technical-specifications PDF
    coolingOptions: ['tower', 'once-through'],
    waterNeeds: 'Light-water; passive cooling pool stores >=72h decay-heat removal',
    status: 'NRC Standard Design Approval for 77 MWe (2025)',
    citation: {
      id: 'cite-nuscale-voygr',
      title: 'NuScale Power Module — technical specifications',
      citation: 'NuScale — NuScale Power Module technical specifications',
      year: 2025,
      url: 'https://www.nuscalepower.com/hubfs/NPM-technical-specifications.pdf',
    },
  },
  // executor: add the remaining 10 from the research checklist —
  //   PWR/large:   westinghouse-ap1000, edf-epr, khnp-apr1400
  //   iPWR/SMR:    rr-smr, holtec-smr300
  //   HTGR:        xenergy-xe100 (coolingOptions ['dry'], helium)
  //   SFR:         terrapower-natrium (sodium-cooled; type 'SMR' for 345 MWe — see checklist note)
  //   micro:       westinghouse-evinci, oklo-aurora
  //   MSR:         terrestrial-imsr
];
```

- [ ] Create `src/data/index.ts`:

```ts
import type { CountryCorpus, RegionData, ReactorModel } from '../types';
import { usaCorpus } from './countries/usa';
import { polandCorpus } from './countries/poland';
import { australiaCorpus } from './countries/australia';
import { usWyoming } from './regions/us-wy';
import { usIllinois } from './regions/us-il';
import { plPomerania } from './regions/pl-pomerania';
import { plGreaterPoland } from './regions/pl-greater-poland';
import { auSouthAustralia } from './regions/au-sa';
import { auNorthernTerritory } from './regions/au-nt';
import { reactors } from './reactors';

const COUNTRIES: Record<string, CountryCorpus> = {
  USA: usaCorpus,
  POL: polandCorpus,
  AUS: australiaCorpus,
};

const REGIONS: RegionData[] = [
  usWyoming, usIllinois, plPomerania, plGreaterPoland, auSouthAustralia, auNorthernTerritory,
];

export function getCountryCorpus(code: string): CountryCorpus | undefined {
  return COUNTRIES[code];
}

export function getRegionData(country: string, regionId: string): RegionData | undefined {
  return REGIONS.find((r) => r.country === country && r.regionId === regionId);
}

export function getReactors(): ReactorModel[] {
  return reactors;
}

export function getReactor(id: string): ReactorModel | undefined {
  return reactors.find((r) => r.id === id);
}

export function listFlagshipRegions(): { country: string; regionId: string; regionName: string }[] {
  return REGIONS.map((r) => ({
    country: r.country,
    regionId: r.regionId,
    regionName: r.regionName,
  }));
}
```

- [ ] Run `npx vitest run src/data/index.test.ts` → **expected:** green.

### Task 7 — Real `loadCorpus` impl (TDD)

- [ ] Write `server/corpus.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { loadCorpus, CorpusNotFoundError } from './corpus';

describe('loadCorpus', () => {
  it('returns matched country + region for a flagship region', () => {
    const { country, region } = loadCorpus('USA', 'US-WY');
    expect(country.code).toBe('USA');
    expect(country.regulator).toBe('U.S. NRC');
    expect(region.regionId).toBe('US-WY');
    expect(region.hasRichData).toBe(true);
  });

  it('returns Australia ban corpus for AU-SA', () => {
    const { country, region } = loadCorpus('AUS', 'AU-SA');
    expect(country.sources.some((s) => s.id === 'au-epbc-140a')).toBe(true);
    expect(region.facts.some((f) => f.citationId === 'au-epbc-140a')).toBe(true);
  });

  it('throws CorpusNotFoundError for a known non-flagship region', () => {
    expect(() => loadCorpus('USA', 'US-CA')).toThrow(CorpusNotFoundError);
  });

  it('throws CorpusNotFoundError for an unknown country', () => {
    expect(() => loadCorpus('XXX', 'X-01')).toThrow(CorpusNotFoundError);
  });
});
```

- [ ] Run `npx vitest run server/corpus.test.ts` → **expected:** red (stub still throws/returns differently).
- [ ] Replace the stub body in `server/corpus.ts`. **KEEP F1's `CorpusNotFoundError` class declaration unchanged**; only rewrite `loadCorpus`. Match F1's constructor signature recorded in Task 1:

```ts
import type { CountryCorpus, RegionData } from '../src/types';
import { getCountryCorpus, getRegionData } from '../src/data';

// CorpusNotFoundError: defined by F1 in this file — DO NOT redefine. Shown for context only.
// export class CorpusNotFoundError extends Error { ... }   // <- keep F1's version

export function loadCorpus(
  country: string,
  regionId: string,
): { country: CountryCorpus; region: RegionData } {
  const corpus = getCountryCorpus(country);
  const region = getRegionData(country, regionId);
  if (!corpus || !region) {
    // adapt args to F1's actual CorpusNotFoundError constructor (see Task 1)
    throw new CorpusNotFoundError(country, regionId);
  }
  return { country: corpus, region };
}
```

- [ ] If F1 imported the stub's `loadCorpus` elsewhere with a different relative path for `src/data`, fix the import path only. Run `npx vitest run server/corpus.test.ts` → **expected:** green.

### Task 8 — Citation-integrity guard test (no placeholder URLs)

- [ ] Write `src/data/citations.test.ts` that walks **all** corpora + reactor citations and fails on any empty or placeholder URL/citation:

```ts
import { describe, it, expect } from 'vitest';
import { usaCorpus } from './countries/usa';
import { polandCorpus } from './countries/poland';
import { australiaCorpus } from './countries/australia';
import { getReactors } from './index';

const PLACEHOLDER = /(example\.com|TODO|FIXME|placeholder|xxx|\bTBD\b|localhost|^https?:\/\/$)/i;

function assertCite(url: string, cite: string, where: string) {
  expect(url, `${where}: empty url`).toBeTruthy();
  expect(cite, `${where}: empty citation`).toBeTruthy();
  expect(url, `${where}: url must be http(s)`).toMatch(/^https?:\/\/.+\..+/);
  expect(PLACEHOLDER.test(url), `${where}: placeholder url "${url}"`).toBe(false);
  expect(PLACEHOLDER.test(cite), `${where}: placeholder citation "${cite}"`).toBe(false);
}

describe('citation integrity', () => {
  it('no corpus source has an empty or placeholder citation/url', () => {
    for (const c of [usaCorpus, polandCorpus, australiaCorpus]) {
      for (const s of c.sources) assertCite(s.url, s.citation, `${c.code}/${s.id}`);
    }
  });

  it('no reactor citation or companyUrl is empty or placeholder', () => {
    for (const m of getReactors()) {
      assertCite(m.citation.url, m.citation.citation, `reactor/${m.id}/citation`);
      // companyUrl must also be a real vendor URL (no second cite string to check)
      expect(m.companyUrl, `reactor/${m.id}: empty companyUrl`).toBeTruthy();
      expect(m.companyUrl, `reactor/${m.id}: companyUrl must be http(s)`).toMatch(/^https?:\/\/.+\..+/);
      expect(PLACEHOLDER.test(m.companyUrl), `reactor/${m.id}: placeholder companyUrl "${m.companyUrl}"`).toBe(false);
    }
  });
});
```

- [ ] Run `npx vitest run src/data/citations.test.ts` → **expected:** green (any placeholder left in by mistake turns this red).

### Task 9 — Full suite + typecheck

- [ ] Run `npx vitest run` → **expected:** all F3 data/server tests pass.
- [ ] Run `npx tsc --noEmit` → **expected:** zero type errors (confirms verbatim use of F1 types).

## End-to-end testing requirements

F3 has **no UI** — its "E2E" is integration at the Vitest/server-seam level, asserting the frozen `loadCorpus` contract end-to-end across every flagship region and the not-found path. Add `server/corpus.e2e.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { loadCorpus, CorpusNotFoundError } from './corpus';
import { listFlagshipRegions } from '../src/data';
import type { FactCategory } from '../src/types';

const CATEGORIES: FactCategory[] = ['land', 'grid', 'water', 'hazard', 'population', 'pathway'];

describe('loadCorpus integration across all flagship regions', () => {
  it.each(listFlagshipRegions().map((r) => [r.regionName, r] as const))(
    'returns well-formed CountryCorpus + RegionData for %s',
    (_name, r) => {
      const { country, region } = loadCorpus(r.country, r.regionId);

      // CountryCorpus well-formed
      expect(country.code).toBe(r.country);
      expect(country.name.length).toBeGreaterThan(0);
      expect(country.regulator.length).toBeGreaterThan(0);
      expect(country.sources.length).toBeGreaterThan(0);

      // RegionData well-formed + rich
      expect(region.regionId).toBe(r.regionId);
      expect(region.hasRichData).toBe(true);
      const cats = new Set(region.facts.map((f) => f.category));
      for (const cat of CATEGORIES) expect(cats.has(cat)).toBe(true);

      // every fact citationId, when present, resolves into the country corpus
      const sourceIds = new Set(country.sources.map((s) => s.id));
      for (const f of region.facts) {
        if (f.citationId) {
          expect(sourceIds.has(f.citationId), `${r.regionName}/${f.id} dangling citationId ${f.citationId}`)
            .toBe(true);
        }
      }
    },
  );

  it('Australia flagship regions surface the statutory ban end-to-end', () => {
    for (const regionId of ['AU-SA', 'AU-NT']) {
      const { country, region } = loadCorpus('AUS', regionId);
      expect(country.sources.some((s) => s.id === 'au-epbc-140a')).toBe(true);
      expect(region.facts.some((f) => f.citationId === 'au-epbc-140a')).toBe(true);
    }
  });

  it('throws CorpusNotFoundError for a known non-flagship region (US-CA)', () => {
    expect(() => loadCorpus('USA', 'US-CA')).toThrow(CorpusNotFoundError);
  });
});
```

- [ ] Run `npx vitest run server/corpus.e2e.test.ts` → **expected:** all green (this is the contract F5/F6 depend on). The dangling-`citationId` check above is the integration safety net tying region facts back to real, cited sources.
