# Nuclear Site Intelligence Globe — Design Spec

*Date: 2026-05-27*
*Status: approved-pending-review*

## 1. Purpose

A browser-based demo that proves a platform can **make nuclear adoption easier for countries** by speeding up site surveying. The user selects a region on an interactive 3D globe, chooses a reactor vendor/model, and the system produces an **explainable, cited feasibility analysis** plus a free-form chat assistant — all grounded in **real, cited law and vendor specs**.

This is a **demo**: data is curated and hardcoded, but reasoning is live (OpenAI) and citations are real. It must not look fake. It frames a future product described in `POC_Summary_Nuclear_Site_Intelligence.md` (site intelligence + evidence packs); this spec implements a credible visual/interactive slice, not the full engine.

The original globe concept is inspired by World Monitor (`koala73/worldmonitor`), but we build **fresh** with the same core library (globe.gl) to avoid its AGPL/commercial license and the bulk of unused OSINT/news UI.

## 2. Scope

**Demo countries:** USA, Poland, Australia.
- **USA** — all three pathways; well-known regulator (NRC); active coal-to-nuclear repower momentum.
- **Poland** — coal-heavy grid with active SMR + large new-build programs; strong "repower" narrative.
- **Australia** — the "looks ideal, fails on cited law" case: vast open desert land, but nuclear power is **federally prohibited** (EPBC Act 1999 s.140A; ARPANS Act 1998 s.10) plus state bans, grid distance, and interior water scarcity. Demonstrates the platform catching non-obvious fatal constraints.

**Region granularity:** admin-1 (states / provinces / voivodeships / territories) via Natural Earth GeoJSON. Clicking identifies the specific region and highlights it with a drawn border + fill.

**Region depth:** ~2–3 **flagship regions per country** with richly modeled, cited data. All other regions render a clean **"limited data / screen-level only"** state.

**Out of scope (YAGNI):** real geospatial/parcel data, the full scoring engine, dossier export, authentication, jurisdictions beyond the three, the flat-map mode.

## 3. Architecture

```
Browser (Vite + React + TS)
  ├── Globe (globe.gl / Three.js)        — admin-1 polygons, click-to-select + highlight
  ├── Dashboard (floating, bottom-left)  — cited data panels + "Add plant" flow + analysis output
  └── Chat (floating, right)             — free-form Q&A; toggles dynamic layout
        │
        ▼  POST /api/analyze , POST /api/chat
  Node proxy (Express)                   — holds OPENAI_API_KEY; never exposed to browser
        ├── loadCorpus(country, region)  — INTEGRATION SEAM for real Compliance RAG repo
        └── OpenAI SDK → OPENAI_MODEL (default gpt-5-mini)
```

**Why a proxy:** the OpenAI key must never reach the browser. The proxy's `loadCorpus()` is the single seam where the user's real compliance RAG pipeline replaces the hardcoded corpus later — same input/output contract.

## 4. Components

### 4.1 Globe
- Full-planet dark 3D globe (globe.gl).
- Admin-1 GeoJSON polygons for the three demo countries (others may render as a base layer, non-interactive or country-level only).
- Hover: subtle highlight. Click: identify region from polygon `properties` (name/code), draw a distinct **selected border + fill**, emit `regionSelected(country, region)`.

### 4.2 Dashboard (floating, bottom-left, overlapping globe)
- Populates on `regionSelected`.
- **Cited data panels**, rendered as a clickable menu of items → expand each for detail + citation:
  - *Land & Infrastructure* (grid nodes/corridors, water bodies, land availability, logistics, population)
  - *Legal / RulePack* (siting exclusions, zoning, EIA/ESIA triggers, water permits, **bans/prohibitions** — incl. Australia's statutory ban, with citations + effective dates)
  - *Hazards & Cooling* (seismic, flood, drought/heat, cooling options)
  - *Pathway Suitability* (SMR / coal-repower / large new-build)
- **"Add plant" flow:** button → choose **company → reactor model** → confirm **parameters** (pathway: greenfield vs coal-repower; cooling option) → **Run analysis**.
- **Analysis output:** structured, cited feasibility report — pass/fail matrix by constraint, friction scores by category (grid, cooling, permits, community, logistics), confidence levels, **screen-level language**, next-step studies.

### 4.3 Chat (floating, right) + dynamic layout
- Floating button toggles the chat panel.
- **Default:** globe + dashboard centered. **Chat open:** globe+dashboard container slides **left** (CSS flex + transition); chat occupies the right. **Chat closed:** recenters.
- Free-form questions answered by the model, grounded in the selected region's corpus + any completed analysis. Labeled as backed by the **Compliance RAG pipeline**. Renders markdown + inline citations.

## 5. Data model

- `data/countries/<country>.ts` — country-level **legal RulePack corpus**: array of cited source snippets `{ id, title, citation, section, year, url, text, type: 'computable' | 'human-review', confidence }`.
- `data/regions/<region>.ts` — flagship-region facts: land/infrastructure, grid, water, hazards, population, pathway notes — each fact cite-able.
- `data/reactors.ts` — vendor **design-envelope catalog**: `{ company, model, type, outputMW, footprint, coolingOptions, waterNeeds, status, citation, url }` for real models (NuScale VOYGR, GE-Hitachi BWRX-300, Westinghouse AP1000/AP300, X-energy Xe-100, EDF EPR/Nuward, Rolls-Royce SMR, etc.).
- Regions without a file → "limited data" state.

All cited content must come from **real, verifiable sources** researched during build (law name + section + year + URL; vendor spec sheets). No invented citations.

## 6. LLM grounding & contracts

**`POST /api/analyze`** — body `{ country, region, company, model, pathway, cooling }`. Server loads corpus via `loadCorpus()`, builds a prompt (region facts + reactor envelope + RulePack), calls OpenAI, returns structured JSON: `{ matrix: [{constraint, verdict, reason, citationIds}], frictionScores: {category: 0..1}, confidence, nextStudies: [], notes }`.

**`POST /api/chat`** — body `{ country, region, question, history }`. Loads same corpus, returns `{ answer (markdown), citations: [] }`.

**System-prompt guardrails (from POC §10):**
- **Screen-level only** — never claim "licensable," "permit-approved," or "guaranteed."
- Every material claim **cites a source + effective date** from the provided corpus.
- Separate **computable** facts from **"requires human review"** items.
- Attach **confidence** and data provenance; label assumptions.
- If the corpus lacks support for a claim, say so rather than inventing.

## 7. Tech stack

- **Frontend:** Vite + React + TypeScript; globe.gl (Three.js) via a ref-mounted container; CSS for floating panels + dynamic layout.
- **Backend:** minimal Express (Node) proxy; `openai` SDK; env: `OPENAI_API_KEY` (already set), `OPENAI_MODEL` (default `gpt-5-mini`).
- **Geo data:** Natural Earth admin-1 GeoJSON (filtered to demo countries).

## 8. Success criteria

1. Globe renders; the three demo countries' regions are clickable and highlight with borders on selection.
2. Selecting a flagship region populates the dashboard with cited, expandable data panels.
3. "Add plant" → pick company/model → confirm params → "Run analysis" returns a structured, cited feasibility report with screen-level language.
4. Australia's analysis surfaces the statutory ban as a fatal/cited constraint.
5. Chat opens as a floating panel; opening it slides globe+dashboard left; closing recenters. Answers are grounded and cite real sources.
6. The OpenAI key stays server-side; `loadCorpus()` is a clean swap-in seam for the real RAG.

## 9. Open items

- Exact `gpt-5-mini` model string verified at first run; `OPENAI_MODEL` makes it a one-line swap.
- Final flagship-region selection per country chosen during the data-research step.
- Git repo not yet initialized for this project; init when build begins.
