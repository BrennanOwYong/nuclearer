# Task Delegation — Nuclear Site Intelligence Globe

> Companion to the PRD (`2026-05-27-nuclear-globe-PRD.md`) and the six feature docs in `features/`. This doc is the **execution control plane**: who builds what, in what order, against which frozen contracts, and how deviations/learnings are handled.

## 1. Delegation model (per global working rules)

- **Main session plans; teammates execute.** Each feature = one named task = one branch/worktree (named for the feature, no timestamps). Re-spawning an existing feature name is an error — pick a new name to redo.
- Each delegated agent gets the brief below (contract-shaped, not step-by-step), reads its feature doc + the PRD, and writes a structured result the main session reads on demand.
- **Deviation clause:** if outputs don't align with the brief/contracts, the agent surfaces *why* and *how the different result should be used* — never silently force-fit. Legitimate course-corrections only.
- **Learnings capture:** before starting, read `LEARNINGS.md` (created on first task); on completion, append discovered specifics (correct globe.gl flags, Natural Earth property names, OpenAI/`gpt-5-mini` quirks, verified citation URLs, gotchas).
- **Comms style:** facts and data only — no preamble, no closing narration.

## 2. Frozen contracts (do not renegotiate)

All types/signatures in **PRD §5** and the reconciliations in **PRD §5.1** are frozen. Key seams every executor must honor exactly:

- LOCKED types in `src/types.ts` (F1 authors verbatim).
- Client lookups in `src/data/index.ts` — synchronous, non-throwing, return `undefined` on miss.
- `loadCorpus()` in `server/corpus.ts` — server-only, throws `CorpusNotFoundError`.
- `callModel(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string>`.
- `regionId = feature.properties.iso_3166_2`; `country = adm0_a3`; `regionName = name`.
- Inline `[source-id]` citation tokens → `server/citations.ts` `extractCitationIds(text, validIds)` — single shared helper authored in Wave 1 (F1); both endpoints import it (analyze fills `citationIds`, chat maps ids→`Citation[]`).
- API: `POST /api/analyze` (`AnalyzeRequest`→`AnalysisResult`), `POST /api/chat` (`ChatRequest`→`ChatResponse`).

## 3. Execution sequence — testable vertical slices

Per project-owner directive (2026-05-27): build in stages that are each **runnable and UI-testable** before moving on — validate the UX first, add the LLM reasoning later, tie it together with chat last. This reorders the dependency DAG into demoable checkpoints.

```
Stage 0 — F1 (scaffold/gate) ............ merge to main; nothing compiles without it
Stage 1 — F2 (globe: drag-spin + region select + border highlight)
            ▶ TEST: npm run dev → spin the globe, click regions, see highlight
Stage 2 — F3 (data) + F4 (dashboard panels) + F5a (AddPlant params + "Run analysis" button)
            /api/analyze returns a STUB AnalysisResult fixture (NO LLM yet)
            ▶ TEST: click region → cited panels → pick technology→company→model→pathway→cooling
                     → click Run → stub report (matrix + friction bars) renders
Stage 3 — F5b (real /api/analyze: buildAnalyzePrompt → callModel → parseAndNormalize; replaces stub)
            ▶ TEST: Run analysis returns real cited feasibility; Australia yields a cited `fail`
Stage 4 — F6 (floating chat + dynamic layout, grounded /api/chat)
            ▶ TEST: open chat shifts globe+dashboard left; grounded cited answers; close recenters
Final  — integration polish + full unit/e2e suites green + one live smoke run
```

Within a stage, independent files may be built by parallel agents (e.g. Stage 2: F3 data ∥ F4/F5a UI, the UI working against fixtures + the known flagship region ids `US-WY` / `US-IL` / `PL-22` / `PL-30` / `AU-SA` / `AU-NT`), reconciled before that stage's ▶ TEST checkpoint.

**F5 split:** F5a = AddPlant stepper + AnalysisReport rendering against a **stubbed** `/api/analyze` (Stage 2). F5b = the real reasoning route (Stage 3). The frozen `AnalyzeRequest`/`AnalysisResult` contract is identical for both, so F5a's stub returns a valid `AnalysisResult` fixture and the UI is fully exercised before any reasoning exists.

**Why F1 is a hard gate:** it authors `src/types.ts`, `CorpusNotFoundError`, `callModel`, the client `src/api.ts` wrappers, `server/citations.ts`, and the 501 route + corpus stubs every downstream feature imports. Nothing compiles without it.

## 4. Per-feature briefs

Each brief = **Task / Purpose / Inputs / Required outputs / Done check**. Approach is the feature doc; don't dictate steps.

### F1 — Scaffold, types, proxy *(Wave 1)*
- **Task:** stand up Vite+React+TS + Express proxy skeleton; author `src/types.ts`, `callModel`, `src/api.ts`, corpus + route stubs.
- **Purpose:** the frozen substrate every other feature imports.
- **Inputs:** `features/F1-scaffold-proxy.md`, PRD §5/§5.1/§7. `.env` already has `OPENAI_API_KEY`.
- **Required outputs:** `npm run dev` serves a mounted (blank) app + live Express; `npm test`/`npm run e2e` runnable; `/api/*` return 501; `loadCorpus` stub throws `CorpusNotFoundError`; `/api/health` reports resolved `OPENAI_MODEL`; **`server/citations.ts` `extractCitationIds(text, validIds): string[]`** authored here as the shared util (lift impl + tests from F5's doc). Note for downstream: `App.tsx` needs the small test-mode `onRegionSelected` hook F2 expects.
- **Done check:** smoke E2E green; types match PRD §5 verbatim.

### F2 — Globe + region select *(Wave 2, after F1)*
- **Task:** dark globe.gl globe, admin-1 polygons for USA/POL/AUS, hover + click→highlight, fire `onRegionSelected`.
- **Purpose:** the primary selection surface driving the whole app.
- **Inputs:** `features/F2-globe-region-select.md`, PRD §5.1 (regionId source). Natural Earth admin-1 GeoJSON.
- **Required outputs:** `src/globe/Globe.tsx` + `src/globe/regions.ts`; Vitest-green pure helpers; E2E: click US state → `onRegionSelected('USA', 'US-..', ..)`, highlight visible, non-demo country inert.
- **Done check:** E2E + unit green; emits `iso_3166_2` ids.

### F3 — Data layer + corpus *(Wave 2, after F1)*
- **Task:** real cited `CountryCorpus` (USA/Poland/Australia), flagship `RegionData`, technology-family `reactors.ts`, client lookups in `src/data/index.ts`, real `loadCorpus` impl.
- **Purpose:** the credible, cited substance — and the RAG swap-in seam.
- **Inputs:** `features/F3-data-layer.md`, PRD §4 (reactor families) / §5 / §5.1 / §8. **Web-verify every citation.**
- **Required outputs:** data modules with real URLs (no placeholders — guard test enforces); Australia ban as a `fail`-worthy cited fact; ≥1 reactor per `ReactorTechnology`; lookups non-throwing; `loadCorpus` throws on non-flagship. Vitest green.
- **Done check:** integration test returns well-formed corpus per flagship region, throws for a known non-flagship; citation-integrity + per-technology tests green.

### F4 — Dashboard panels *(Wave 3, after F2+F3)*
- **Task:** floating bottom-left dashboard; cited expandable panels grouped by category; legal/ban panel from corpus sources; limited-data state; "Add plant" button → `onAddPlant`.
- **Purpose:** turns a selected region into readable, cited intelligence.
- **Inputs:** `features/F4-dashboard-panels.md`, PRD §5.1 (import lookups from `src/data/index.ts`).
- **Required outputs:** `Dashboard.tsx`/`PanelMenu.tsx`/`Panel.tsx`; Vitest helpers green; E2E: flagship populates + citation links resolve, non-flagship shows limited-data, Australia ban visible, Add-plant fires.
- **Done check:** E2E + unit green.

### F5 — Add-plant + analysis *(Wave 4, after F3+F4)*
- **Task:** AddPlant stepper (technology→company→model→pathway→cooling→Run), `AnalysisReport`, `/api/analyze` (loadCorpus→buildAnalyzePrompt→callModel json→parse/normalize), guardrails.
- **Purpose:** the headline "explainable feasibility" output.
- **Inputs:** `features/F5-add-plant-analysis.md`, PRD §5/§5.1/§8.
- **Required outputs:** route 200 happy + 404 on `CorpusNotFoundError`; friction scores clamped 0..1; citationIds match corpus; E2E (mocked `/api/analyze`): full flow renders matrix+bars, Australia case yields cited `fail`, bars ≤100%.
- **Done check:** supertest + Vitest + E2E green.

### F6 — Chat + dynamic layout *(Wave 4, after F3+F4)*
- **Task:** `Layout.tsx` center↔shift-left, floating `ChatPanel` + `useChat`, `/api/chat`, Compliance-RAG label, markdown + citations.
- **Purpose:** free-form grounded Q&A + the dynamic-layout behavior.
- **Inputs:** `features/F6-chat-dynamic-layout.md`, PRD §5/§5.1/§8.
- **Required outputs:** route 200 + 404; `useChat` appends user→assistant; E2E (mocked `/api/chat`): opening chat shifts cluster left, answer renders markdown+citation, closing recenters, RAG label present.
- **Done check:** supertest + Vitest + E2E green.

## 5. Integration pass (final)

- **Task:** wire F2+F4+F5+F6 into `App.tsx`/`Layout.tsx`; run the full golden path (PRD §3) live against real OpenAI once; keep CI on mocked LLM.
- **Done check:** spec §8 success criteria all pass; `npm test` + `npm run e2e` green; `npm run dev` serves the working demo; Australia-ban path produces a cited `fail` end-to-end.

## 6. Status log

| Feature | Branch/worktree | Status | Result location |
|---------|-----------------|--------|-----------------|
| F1 | _tbd_ | not started | — |
| F2 | _tbd_ | not started | — |
| F3 | _tbd_ | not started | — |
| F4 | _tbd_ | not started | — |
| F5 | _tbd_ | not started | — |
| F6 | _tbd_ | not started | — |
| Integration | _tbd_ | not started | — |
