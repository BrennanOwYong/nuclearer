# Nuclearer

**Screen-level site intelligence for nuclear builds. Spin the globe, pick a reactor, and see which sites survive the fatal constraints before you spend months finding out the hard way.**

→ See it in action: https://brennanowyong.github.io/nuclearer/

<!-- Screenshot/GIF placeholder: drop a capture of the globe + dashboard here.
<p align="center"><img src="docs/assets/screenshot.png" alt="Nuclearer globe and site-finder dashboard" width="800"></p>
-->

## The problem

Nuclear projects are delayed or killed less by the availability of land and more by the availability of a **site readiness bundle** ([POC_Summary_Nuclear_Site_Intelligence.md](POC_Summary_Nuclear_Site_Intelligence.md)):

- grid interconnection feasibility (queue, upgrades, timeline)
- cooling and water constraints (rights, discharge limits, drought/heat)
- zoning and entitlements (rezoning likelihood)
- environmental permitting triggers (Environmental Impact Assessment / Environmental and Social Impact Assessment, EIA/ESIA)
- hazards (seismic, flood, liquefaction, multi-hazard coupling)
- security and emergency planning practicality
- social/political acceptance and litigation risk

Teams waste months pursuing sites that fail on one or two fatal constraints discovered late. The constraints differ across the three build pathways: Small Modular Reactors (SMRs), coal-to-nuclear repower, and large new build.

Nuclearer surfaces those constraints in week one, as a **screen-level down-selection with citations**, so teams spend field-study money only on sites that survive the first cut. It never claims a site is permit-approved or licensable; every conclusion carries a confidence level, provenance, and a next-studies list, per the operational guardrails in the POC summary (section 10).

## What it does

1. **Interactive 3D globe.** Click a region and the camera flies there. Selected regions highlight; a region roster gives one-click navigation.
2. **Region context, cited.** A floating glassmorphic dashboard shows expandable fact panels for the selected region: land availability, legal and permitting context, hazards. Each fact links to its source and carries a confidence level. Statutory bans trigger an explicit alert.
3. **Reactor catalog.** 12 reactor models across 7 families, each with footprint, cooling, and logistics specs, with citations.
4. **Find Sites.** Pick a reactor and run a screening analysis for the region: a ranked shortlist of candidate sites, each with
   - friction bars across grid, cooling, permits, community, and logistics
   - a pass/caution/fail verdict badge
   - a per-constraint matrix with reasons and citations
   - a confidence level and a next-studies list (what field work must verify)
5. **Per-reactor tailoring.** A different reactor produces a different shortlist; the screening weighs footprint, cooling strategy, and logistics against the region's constraints.
6. **Fatal-flaw detection.** Regions with a statutory ban return no viable sites and say why, with the statute cited.

## How it was built

**Stack:** React 18 + TypeScript + Vite on the frontend, [globe.gl](https://globe.gl/) / three.js for the globe, Express on the backend, the OpenAI SDK for LLM reasoning, react-markdown for rendered analysis text, Vitest for unit tests and Playwright for end-to-end tests.

**Architecture:**

```
src/globe/       3D globe (globe.gl + three.js), region selection, fly-to camera
src/dashboard/   Floating panel: region roster, fact panels, reactor picker,
                 site finder, results modal
server/          Express API
  ├─ sitefinder.ts      screening analysis orchestration
  ├─ openai.ts          LLM reasoning path for uncached region+reactor combos
  ├─ analysisCache.ts   curated-answer cache: vetted results served
  │                     deterministically, LLM as fallback
  ├─ citations.ts       citation resolution
  └─ corpus.ts          loadCorpus() seam: region legal corpus, built as the
                        attachment point for a future legal-RAG pipeline
data/analyses/   curated (vetted) analysis results
```

Two design decisions carry the credibility requirement from the POC summary:

- **Curated cache over raw LLM output.** Vetted analyses serve deterministically from `data/analyses/`; the LLM path handles uncached region+reactor combos. Demos never depend on a live model call, and vetted answers never drift.
- **Citations as a first-class type.** Every fact panel, matrix row, and reactor spec carries citation links resolved through `server/citations.ts`. The `loadCorpus()` seam in `server/corpus.ts` isolates where region legal text enters the system, so a Retrieval-Augmented Generation (RAG, retrieving source documents to ground model output) pipeline over real statute can replace the static corpus without touching the screening logic.

## Run it locally

```bash
npm install
npm run dev        # Vite frontend + Express server, concurrently
```

Optional: set `OPENAI_API_KEY` in `.env` to enable the live LLM path for uncached combos. Cached (curated) analyses work without it.

```bash
npm test           # Vitest unit tests
npm run e2e        # Playwright end-to-end tests
npm run build      # type-check + production build
```

## What's next

Roadmap detail lives in [docs/FEATURE-TRACKER.md](docs/FEATURE-TRACKER.md). Ranked by the pain-point intensities in the POC summary:

**Next (buildable now):**
- Globe pins for found sites
- Reactor-scaled exclusion/footprint rings (radius derived from regulatory source-term/dose rules, NRC 10 CFR 100)
- Land-fit readout per site (required vs available hectares)
- Chat panel: LLM Q&A grounded in the region corpus, every answer cited
- Live LLM reasoning for uncached combos, every claim citing statute

**Planned:**
- Grid interconnection plausibility scorer (the #1 pain point, intensity 10/10)
- RulePack engine with versioning: jurisdiction rules as computable tests with citations and effective dates
- Cooling/water permit-trigger engine
- Population and emergency-planning-zone (EPZ) scorer
- Zoning and entitlements screener
- Geohazard overlay engine
- Supply-chain / construction-logistics tracker
- Site scarcity index and optioning workflow
- Evidence-pack / dossier export per site
- Real geospatial data layers (parcels, grid, water, protected areas)
- Multi-jurisdiction expansion (each jurisdiction is a new legal corpus)

## References

- [POC_Summary_Nuclear_Site_Intelligence.md](POC_Summary_Nuclear_Site_Intelligence.md), problem statement, credibility requirements, and operational guardrails
- [docs/FEATURE-TRACKER.md](docs/FEATURE-TRACKER.md), single source of truth for shipped features and roadmap
