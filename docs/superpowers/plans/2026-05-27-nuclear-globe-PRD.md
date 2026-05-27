# PRD — Nuclear Site Intelligence Globe (Demo)

> **Source design:** `docs/superpowers/specs/2026-05-27-nuclear-site-intelligence-globe-design.md`
> **For agentic workers:** Each feature has its own sub-doc in `docs/superpowers/plans/features/`. REQUIRED SUB-SKILL for execution: `superpowers:subagent-driven-development`. Steps in feature docs use checkbox (`- [ ]`) syntax.

## 1. Product summary

A browser demo proving a platform can **speed up nuclear site surveying** for countries. User rotates an interactive 3D globe, clicks a **sub-national region** (state/province), reviews **cited** land + legal data, picks a **reactor vendor/model**, and runs an **explainable, cited feasibility analysis**. A floating **chat** answers free-form questions grounded in the same cited corpus (the swap-in seam for the user's real Compliance RAG pipeline).

**Demo, not product:** curated/hardcoded data, but **live reasoning (OpenAI)** and **real citations**. It must not look fake.

## 2. Goals & non-goals

**Goals**
- Visually credible, interactive globe with region-level selection + border highlight.
- Cited, expandable dashboard data per flagship region.
- Vendor-model "Add plant" flow → structured cited feasibility analysis.
- Floating chat with dynamic layout (globe+dashboard recenter ↔ shift-left).
- Clean `loadCorpus()` seam for the real RAG repo. OpenAI key stays server-side.

**Non-goals (YAGNI):** real geospatial/parcel data, full scoring engine, dossier export, auth, jurisdictions beyond USA/Poland/Australia, flat-map mode.

## 3. Personas & key flow

**Primary user:** a nuclear project BD/siting lead evaluating where a given reactor could feasibly go.

**Golden path:**
`load globe → click region (highlights) → dashboard populates (cited panels) → "Add plant" → pick company → pick model → confirm pathway+cooling → Run analysis → cited pass/fail matrix + friction scores + next studies → open chat → ask follow-up → grounded cited answer`.

## 4. Demo data scope

- **Countries:** USA, Poland, Australia. Australia must surface its **statutory ban** (EPBC Act 1999 s.140A; ARPANS Act 1998 s.10) as a fatal, cited constraint.
- **Regions:** admin-1 via Natural Earth GeoJSON; **2–3 flagship regions/country** richly modeled, others = "limited data" state.
- **Reactors:** a catalog that **surveys the common reactor technology families** and, for each, links to a **real company offering** with **ingested, cited specs** from the vendor's own pages. Cover at minimum:
  - **Large PWR** — Westinghouse AP1000, EDF EPR, KHNP APR1400
  - **SMR (BWR)** — GE-Hitachi BWRX-300
  - **SMR (integral PWR)** — NuScale VOYGR, Rolls-Royce SMR, Holtec SMR-300
  - **HTGR (gas, pebble/TRISO)** — X-energy Xe-100
  - **SFR (sodium fast + molten-salt storage)** — TerraPower Natrium
  - **Microreactor** — Westinghouse eVinci, Oklo Aurora
  - **MSR (molten salt)** — Terrestrial Energy IMSR
  Each `ReactorModel` carries its `technology` family, a `companyUrl`, and a `citation` to the real spec sheet (outputMW, footprint, cooling, status). No invented figures — flag any unverified field for the executor to confirm.
- All citations must be **real and verifiable** (law name + section + year + URL; vendor spec sheets). No invented sources.

## 5. LOCKED shared contracts

> These types and signatures are FROZEN. Every feature doc and task must use these exact names. Defined in `src/types.ts` (Feature F1).

```ts
// ---- Citations & corpus ----
export type SourceType = 'computable' | 'human-review';
export type Confidence = 'high' | 'medium' | 'low';

export interface Citation {
  id: string;            // stable, e.g. "us-nrc-10cfr100"
  title: string;
  citation: string;      // human-readable cite, e.g. "10 CFR Part 100"
  section?: string;
  year: number;
  url: string;
}

export interface SourceSnippet extends Citation {
  text: string;          // the quoted/paraphrased provision
  type: SourceType;
  confidence: Confidence;
}

export interface CountryCorpus {
  code: string;          // ISO alpha-3, e.g. "USA"
  name: string;
  regulator: string;     // e.g. "U.S. NRC"
  sources: SourceSnippet[];
}

// ---- Region facts ----
export type FactCategory = 'land' | 'grid' | 'water' | 'hazard' | 'population' | 'pathway';

export interface RegionFact {
  id: string;
  category: FactCategory;
  label: string;
  value: string;
  detail: string;
  citationId?: string;   // references a SourceSnippet.id or Citation.id
  confidence: Confidence;
}

export interface RegionData {
  country: string;       // ISO alpha-3
  regionId: string;      // admin-1 code from GeoJSON properties
  regionName: string;
  hasRichData: boolean;  // false => "limited data" state
  facts: RegionFact[];
}

// ---- Reactor catalog ----
export type ReactorType = 'SMR' | 'large' | 'micro';
export type ReactorTechnology = 'PWR' | 'BWR' | 'iPWR' | 'HTGR' | 'SFR' | 'MSR' | 'microreactor';

export interface ReactorModel {
  id: string;            // e.g. "ge-bwrx-300"
  company: string;
  companyUrl: string;    // real vendor site
  model: string;
  type: ReactorType;          // deployment class
  technology: ReactorTechnology; // reactor family
  outputMW: number;
  footprintHectares: number;
  coolingOptions: string[];   // e.g. ["once-through","tower","dry"]
  waterNeeds: string;
  status: string;             // e.g. "Design certification in progress"
  citation: Citation;         // real spec-sheet source
}

// ---- Analysis ----
export type Verdict = 'pass' | 'caution' | 'fail';
export type FrictionCategory = 'grid' | 'cooling' | 'permits' | 'community' | 'logistics' | 'hazards';
export type Pathway = 'greenfield' | 'coal-repower';

export interface MatrixRow {
  constraint: string;
  verdict: Verdict;
  reason: string;
  citationIds: string[];
}

export interface AnalysisResult {
  matrix: MatrixRow[];
  frictionScores: Record<FrictionCategory, number>; // each 0..1
  confidence: Confidence;
  nextStudies: string[];
  notes: string;            // screen-level caveats
}

// ---- API request bodies ----
export interface AnalyzeRequest {
  country: string;
  regionId: string;
  reactorId: string;
  pathway: Pathway;
  cooling: string;
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
export interface ChatRequest {
  country: string;
  regionId: string;
  question: string;
  history: ChatMessage[];
}
export interface ChatResponse { answer: string; citations: Citation[]; } // answer is markdown
```

**API endpoints (frozen):**
- `POST /api/analyze` — body `AnalyzeRequest` → `AnalysisResult` (200) / `{ error }` (4xx/5xx).
- `POST /api/chat` — body `ChatRequest` → `ChatResponse`.

**Globe event (frozen):** globe emits `onRegionSelected(country: string, regionId: string, regionName: string)`.

**Corpus seam (frozen):** server-side
`loadCorpus(country: string, regionId: string): { country: CountryCorpus; region: RegionData }`.
This is the ONLY function the real RAG repo replaces. It must throw a typed `CorpusNotFoundError` when data is absent so callers render the "limited data" state.

### 5.1 Cross-feature reconciliations (FROZEN — resolve agent assumptions)

These pin the seams the parallel feature docs each guessed at. They override any conflicting assumption inside a feature doc.

- **Client-side lookups live in `src/data/index.ts`** (owned by F3) and are **synchronous, browser-safe, and NON-throwing** — they return `undefined` on miss: `getCountryCorpus(country): CountryCorpus | undefined`, `getRegionData(country, regionId): RegionData | undefined`, `getReactors(): ReactorModel[]`, `listFlagshipRegions(): {country,regionId,regionName}[]`. F4/F5 import these (NOT the server seam). The throwing `loadCorpus()` in `server/corpus.ts` is **server-only** (used by `/api/analyze` + `/api/chat`) and wraps the same data.
- **`callModel` signature (F1, frozen):** `callModel(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string>`. Returns the model's text (raw JSON string when `opts.json`). F5 calls it with `{ json: true }` and parses; F6 calls it without. No other shape.
- **`regionId` source (frozen):** `regionId = feature.properties.iso_3166_2` from Natural Earth admin-1 (e.g. `US-WY`, `PL-22`, `AU-SA`); `country = feature.properties.adm0_a3`; `regionName = feature.properties.name`. F3's region keys and F2's emitted ids MUST both use `iso_3166_2`. The first F3 task verifies these against F2's actual GeoJSON before authoring region files.
- **Citation convention (frozen, both endpoints):** the model is instructed to emit inline `[source-id]` tokens that match `SourceSnippet.id`/`Citation.id` in the provided corpus. The single shared helper is **`extractCitationIds(text: string, validIds: string[]): string[]` in `server/citations.ts`**, authored in **Wave 1 (F1 scaffold)** as a neutral util (F5's feature doc carries a ready implementation + tests to lift into F1). It matches tokens against the corpus and **drops any that don't match** (enforces "never invent citations"). `/api/analyze` uses it directly to fill `MatrixRow.citationIds`; `/api/chat` calls it then maps the returned ids to `Citation[]` from the corpus sources. Neither endpoint defines its own extractor.
- **Frontend deps:** `react-markdown` (chat answer rendering) is approved and added to the stack.

## 6. Feature map (build order / dependencies)

| ID | Feature | Depends on | Sub-doc |
|----|---------|-----------|---------|
| **F1** | Scaffold, types, Node proxy, env wiring | — | `features/F1-scaffold-proxy.md` |
| **F2** | Globe + admin-1 region select & highlight | F1 | `features/F2-globe-region-select.md` |
| **F3** | Data layer (country corpus, region facts, reactor catalog) + `loadCorpus` | F1 | `features/F3-data-layer.md` |
| **F4** | Dashboard cited panels (expandable menu) | F2, F3 | `features/F4-dashboard-panels.md` |
| **F5** | Add-plant flow + `/api/analyze` structured analysis | F3, F4 | `features/F5-add-plant-analysis.md` |
| **F6** | Floating chat + dynamic layout + `/api/chat` | F3, F4 | `features/F6-chat-dynamic-layout.md` |

Wave 1: F1. Wave 2: F2 ∥ F3. Wave 3: F4. Wave 4: F5 ∥ F6.

## 7. Tech stack

- **Frontend:** Vite + React + TypeScript; `globe.gl` (Three.js) ref-mounted; CSS for floating panels + dynamic layout.
- **Backend:** Express (Node) proxy; `openai` SDK. Env: `OPENAI_API_KEY` (already set), `OPENAI_MODEL` (default `gpt-5-mini`).
- **Geo:** Natural Earth admin-1 GeoJSON, filtered to the 3 countries.
- **Testing:** Vitest (unit) + Playwright (E2E). Each feature doc lists its own E2E acceptance scenarios.

## 8. LLM guardrails (apply to /api/analyze and /api/chat system prompts)

- **Screen-level only** — never "licensable," "permit-approved," or "guaranteed."
- Every material claim **cites a source id + effective year** from the provided corpus.
- Separate **computable** facts from **"requires human review."**
- Attach **confidence**; if corpus lacks support, say so — never invent citations.

## 9. Global testing strategy

- **Unit (Vitest):** data-file schema validation, `loadCorpus` (hit + `CorpusNotFoundError`), prompt builders, `AnalysisResult` parsing/normalization (friction scores clamped 0..1), reactor/region lookups.
- **E2E (Playwright):** the golden path (§3) plus the Australia-ban scenario. LLM endpoints are **mocked** in E2E (deterministic fixtures) so tests don't depend on live OpenAI; one optional live smoke test gated behind an env flag.
- **Definition of done (whole demo):** all success criteria in spec §8 pass; `npm test` (unit) and `npm run e2e` green; `npm run dev` serves the app with the proxy.

## 10. Open items

- Verify exact `gpt-5-mini` string at first run (`OPENAI_MODEL` swap).
- Final flagship-region picks chosen during F3 research.
- `git init` at build start (repo not yet initialized).
