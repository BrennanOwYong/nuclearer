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

## 3. Execution waves (dependency DAG)

```
Wave 1:  F1 (scaffold, types, proxy, stubs)        ── must merge before anything else
Wave 2:  F2 (globe)        ∥  F3 (data + corpus)    ── parallel, both depend only on F1
Wave 3:  F4 (dashboard)                              ── depends on F2 + F3
Wave 4:  F5 (add-plant+analyze)  ∥  F6 (chat+layout) ── parallel, both depend on F3 + F4
Final:   Integration pass (golden path + Australia-ban E2E, full unit + e2e suites green)
```

**Why F1 is a hard gate:** it authors `src/types.ts`, the `CorpusNotFoundError` class, the `callModel` helper, the client `src/api.ts` wrappers, and the 501 route + corpus stubs every downstream feature imports. Nothing compiles without it.

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
