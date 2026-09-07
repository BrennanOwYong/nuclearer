# Stage 2 — Site-Finder Model (supersedes the F4/F5a "single-report" framing)

> Authoritative for Stage 2. Contracts frozen in PRD §5 + `src/types.ts` (site-finder shapes: `CandidateSite`, `SiteScreening`, `AnalysisResult.sites[]`). This doc overrides any conflicting detail in `features/F4-*.md` / `features/F5-add-plant-analysis.md`.

## 1. The model (project-owner decision, 2026-05-27)

User picks **region + reactor**; the platform **finds the land**. It filters a *prepared pool* of candidate sites by the reactor's design envelope, ranks them, and reasons live with citations. Two kinds of candidate land:

- **`named`** — real, citable sites: retiring coal plants, existing nuclear, industrial/brownfield zones (favor `coal-repower`, large/SMR).
- **`greenfield`** — unused land zones characterized by *real* regional attributes (grid-corridor proximity, water, terrain/climate, population, protected-area boundaries, land status). Reactor choice decides the winner: micro/HTGR (dry-cooled, tiny) unlock remote/off-grid land; SMR wants mid-size + modest water; large PWR wants coastal/river + big footprint + cooling water.

**Two-tier data (the "middle ground"):** prepared = cheap cited *attributes per candidate* (F3b, lazy per region); live = *filter → rank → reason* on (region+reactor). Synthesis, not lookup.

**Credibility:** named sites real + cited; greenfield candidates have real, cited *layers/attributes* and are labeled screen-level + confidence (plausible zone + sources, not a fabricated address). Australia returns **0 viable sites** (all `fail`, EPBC/ARPANS ban cited).

## 2. The flow (Stage 2 = stubbed reasoning; Stage 3 = live LLM)

```
globe click → region set in dashboard
  → pick reactor (filter by technology family OR company → model)
  → pick pathway (greenfield | coal-repower)
  → "Find sites"  →  POST /api/analyze (AnalyzeRequest)
       server: load region's CandidateSite[] → filter by reactor.suitableTechnologies
               + envelope-vs-attributes → rank by friction → AnalysisResult.sites[]
  → dashboard renders ranked shortlist (verdict, friction bars, cited reasons)
  → globe drops a pin per found site; clicking a card focuses its pin
```

Stage 2 `/api/analyze` is a **deterministic stub** (no OpenAI): the filter + rank + a templated `matrix`/`regionSummary`. Stage 3 (F5b) swaps the templated reasoning for `callModel` over the same inputs — identical `AnalysisResult` contract, so the UI is unchanged.

## 3. F3b — candidate-sites data layer (DATA COLLECTION)

**Files (own):** `src/data/sites/<regionId>.ts` (a `CandidateSite[]` per flagship region), extend `src/data/index.ts` with `getCandidateSites(country, regionId): CandidateSite[]` (sync, non-throwing, `[]` on miss), and have server `loadCorpus` (or a sibling `loadSites`) expose the pool server-side.

**Per flagship region (US-WY, US-IL, PL-22, PL-30, AU-SA, AU-NT): ~5–10 candidates**, mixing `named` + `greenfield`. Each `CandidateSite` per PRD §5 `src/types.ts` shape:
- **`named`**: tie to real sites already in the corpus — e.g. US-WY **Naughton/Kemmerer** (TerraPower Natrium), PL-30 **Pątnów/Konin** + **Włocławek** (BWRX-300), existing nuclear/industrial zones. Real lat/lng, real `landStatus`, `citationIds` into the F3 corpus.
- **`greenfield`**: real-attribute-grounded zones — e.g. AU outback (huge footprint, `waterAvailability: 'none'`, dry-cooling only → micro/HTGR only, but `protectedAreaFlag`/ban dominate), US-WY/IL near transmission + river. Cite the layer sources (protected-area maps, transmission/water datasets) used in F3's corpora; `confidence: 'medium'`, screen-level.
- `suitableTechnologies`: the reactor families the land's attributes admit (e.g. no-water site → `['HTGR','microreactor','SFR']`; coastal big-footprint → `['PWR']` too).

**Tests (Vitest):** schema shape per region file; `getCandidateSites` lookup; citation-integrity (no empty/placeholder url; every `citationId` resolves in the region/country corpus); each region has ≥1 `named` and ≥1 `greenfield`; Australia candidates all carry the ban citation. `npx tsc --noEmit` clean.

**Web-verify** named-site facts (real coal/nuclear/industrial sites + coordinates). Flag any unconfirmed numeric `// executor must verify`.

## 4. F5a — `/api/analyze` filter + rank (stubbed reasoning, no LLM)

**Files (own):** `server/routes/analyze.ts` (implement, replace 501), `server/sitefinder.ts` (`screenSites(region, reactor, pathway, candidates): SiteScreening[]` — pure, unit-tested). Imports F3b `getCandidateSites`, F3 `getReactor`, `loadCorpus`.

Logic (deterministic, Stage 2):
- Filter candidates to those whose `suitableTechnologies` include the reactor's `technology` AND match `pathway` (coal-repower → `named` brownfield/coal; greenfield → `greenfield` or any).
- Score friction 0..1 per `FrictionCategory` from attribute-vs-envelope deltas (gridDistanceKm, water vs reactor cooling need, footprint vs `reactor.footprintHectares`, population, hazards, protected/legal).
- Verdict: `fail` if a hard constraint trips (protected area, statutory ban, footprint/water impossible), else `caution`/`pass` by aggregate friction. Rank by ascending friction.
- `matrix` rows + `regionSummary`: **templated** strings (Stage 2), each carrying real `citationIds` from the corpus. Empty `sites: []` when all fail (Australia).
- On `CorpusNotFoundError` / unknown region → 404.

**Tests:** Vitest for `screenSites` (filter correctness, friction clamped 0..1, ranking, Australia→empty/all-fail, footprint/water hard-fails); supertest route 200 + 404. E2E covered with F4.

## 5. F4 — finder dashboard

**Files (own):** `src/dashboard/Dashboard.tsx`, `SiteFinder.tsx` (reactor pickers: technology→company→model, pathway, "Find sites"), `SiteResults.tsx` (ranked `SiteScreening` cards: verdict badge, friction bars, cited reasons, `onFocusSite(siteId)`), `Panel.tsx`/`PanelMenu.tsx` (region legal/physical context from corpus, incl. ban). Imports F3 `getCountryCorpus`/`getRegionData`, F3b `getReactors`, `src/api.ts` `postAnalyze`.

Props: `{ country, regionId }` from globe selection. Floating bottom-left per `UI guidelines.png`. Limited-data state when region has no candidate pool.

**E2E (Playwright, mocked `/api/analyze`):** select region → pick reactor (tech→company→model) → Find sites → ranked cards render with friction bars (≤100%) + citation links; switching reactor (e.g. microreactor vs large PWR) changes the shortlist; Australia shows **0 viable sites + cited ban**; clicking a card fires `onFocusSite`.

## 6. F2b — globe pins (integration, small)

Globe accepts `sites: {siteId,lat,lng,verdict}[]` + `onPinClick`; drops colored pins (pass/caution/fail) for found sites; `onFocusSite` from a result card centers/zooms its pin. Add to `Globe.tsx` props (additive, keeps F2 contract).

## 7. Delegation / waves

```
Wave 2a (now):  F3b candidate-sites data  ── depends on updated contract (merged to main)
Wave 2b:        F4 finder dashboard  ∥  F5a /api/analyze filter+rank
                  (build against F3b data; F4 may use a small site fixture until F3b merges)
Wave 2c:        F2b globe pins + wire region→dashboard→results→pins → ▶ STAGE 2 TEST
Stage 3:        F5b live reasoning (replace stub with callModel)  →  ▶ STAGE 3 TEST
Stage 4:        F6 chat
```

Briefs are contract-shaped (PRD §5 + this doc); deviation + learnings protocol per `2026-05-27-TASK-DELEGATION.md` §1.
