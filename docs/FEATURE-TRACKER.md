# Nuclearer — Feature Tracker

Single source of truth for what's built, what's next, and what's on the roadmap. Status legend:
**✅ Done** · **🔜 Next (buildable now)** · **📋 Planned (product roadmap)** · **🧊 Backlog (deferred / complex)**

> Note: the screening engine already produces *screen-level friction scores* across grid / cooling / permits / community / logistics / hazards. Several "Planned" items below are about turning a given gate from a coarse proxy into a **dedicated, data-backed module** (its own dataset, scorer, and evidence output).

---

## ✅ Done (shipped to `main`)

| # | Feature | Notes |
|---|---------|-------|
| D1 | Interactive 3D globe (spin/zoom, admin-1 region select + highlight) | globe.gl |
| D2 | Region roster + fly-to camera | dashboard buttons jump the globe |
| D3 | Region Context — cited panels (land/legal/hazards) + ban alert | every fact sourced |
| D4 | Reactor catalog (12 models / 7 families) + cascading picker | real cited specs |
| D5 | Find Sites — site-finder analysis (ranked, scored, cited) | the headline |
| D6 | Per-reactor tailoring (different reactor → different shortlist) | footprint/cooling driven |
| D7 | Fatal-flaw / no-viable-sites detection (statutory ban) | Australia EPBC/ARPANS |
| D8 | Citations everywhere + RAG-ready corpus seam | `loadCorpus()` swap-in |
| D9 | Curated-answer cache (vetted LLM results, deterministic fallback) | demo-stable |
| D10 | Results modal + larger dashboard typography | latest |

---

## 🔜 Next (buildable now, high demo value)

| # | Feature | What it adds | Rough effort |
|---|---------|--------------|--------------|
| N1 | **Globe pins for found sites** | drop pass/caution/fail pins; click a result card → fly to its pin | S |
| N2 | **Reactor-scaled exclusion/footprint ring** | draw the land a reactor must control, sized by real footprint (eVinci tiny → EPR huge) | S–M |
| N3 | **"Land fit" readout per site** | required ha (reactor + buffer) vs available ha → fits/tight/insufficient | S |
| N4 | **Chat panel (F6)** | floating LLM Q&A grounded in the region corpus; dynamic layout slide-left | M (speced) |
| N5 | **Live LLM for uncached combos** | any region+reactor gets LLM-quality reasoning, not just the 7 curated | M |

---

## 📋 Planned — product roadmap (from POC pain-point analysis)

Each maps to a real bottleneck that kills nuclear projects. Intensity = POC's how-much-it-hurts score.

| # | Feature | Pain point | Intensity | What it is |
|---|---------|-----------|:--:|------------|
| P1 | **Grid interconnection plausibility scorer** | #1 grid reality | 10 | beyond proximity: queue position, upgrade-burden proxy, existing-switchyard advantage; flags repower sites |
| P2 | **RulePack engine + versioning** | #2 permitting | 9 | computable jurisdiction rules + "requires human review" flags, with effective dates & change logs |
| P3 | **Cooling/water permit-trigger engine** | #3 water | 9 | withdrawal/discharge permit flags, drought/heat overlays; dry vs wet pathway classifier (partial today) |
| P4 | **Population & emergency-planning scorer** | #4 social license | 8 | population bands, sensitive receptors, access/evacuation practicality, EPZ sizing per reactor |
| P5 | **Zoning & entitlements screener** | #5 zoning | 8 | allowed-use check + rezoning-friction score |
| P6 | **Geohazard overlay engine** | #6 hazards | 7 | seismic/flood/liquefaction multi-hazard coupling + evidence appendix |
| **P7** | **🚚 Supply-chain / construction-logistics tracker** | **#7 logistics** | 7 | **ports/rail/roads, heavy-haul & oversize-corridor feasibility, laydown footprint; the "can you physically get the components there" check** |
| P8 | **Site scarcity index + optioning workflow tracker** | #8 competition | 6 | scarcity scoring + outreach status, exclusivity clocks, milestone gating |
| P9 | **Evidence-pack / dossier export** | credibility (POC §8) | — | per-site PDF/HTML: maps, requirements matrix, risk register, next-studies |
| P10 | **Real geospatial data layers** | foundation | — | live parcels, grid nodes, water bodies, protected areas, population — replaces curated candidate pool |
| P11 | **Multi-jurisdiction expansion** | coverage | — | beyond USA / Poland / Australia |

---

## 🧊 Backlog (deferred — complex)

| # | Feature | Why deferred |
|---|---------|--------------|
| B1 | **Cursor-as-footprint + click-anywhere pin-drop + radius search** | needs continuous GIS raster + px↔km scaling on a 3D globe + spatial search; see `FEATURE-BACKLOG.md` §1 |

---

## On "supply-chain tracker" specifically (P7)

This wasn't previously tracked — it lives in the POC's pain-point list as **construction logistics** (#7). For a nuclear build, moving reactor pressure vessels, steam generators, and turbines is a real siting constraint: you need port/rail/heavy-haul access and oversize-load corridors, or the site is a non-starter regardless of grid or water. Today the engine scores "logistics" as a coarse friction gate; **P7 would make it a dedicated module** — transport-corridor feasibility, heavy-haul routing proxies, and laydown-area checks against the reactor's component sizes — and feed the evidence pack (P9).

If you want this as the next build instead of the visual features (N1–N3), say so and I'll spec it.
