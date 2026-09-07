# Nuclearer — Feature Tracker

Single source of truth for what's built, what's next, and what's on the roadmap.

**Build status:** ✅ Done · 🔜 Next (buildable now) · 📋 Planned · 🧊 Backlog (deferred/complex)

**Compliance dependency** (who owns it):
- **🔴 Regulatory — YOURS.** Core output is a legal/permitting judgment that must be cross-checked against statute & regulator docs. Plugs into your **legal-RAG pipeline** (via the `loadCorpus()` seam). You own these.
- **🟢 Delegatable.** Core is an external data feed, market signal, or visualization — no legal interpretation. Hand to a teammate/vendor with a data source.
- **🟡 Mixed.** A delegatable data layer feeding a regulatory judgment — split it: delegate the data, you keep the rule.

> The screening engine already emits screen-level friction across grid/cooling/permits/community/logistics/hazards. Many items below upgrade one gate from a coarse proxy into a dedicated module.

---

## ✅ Done (shipped to `main`)

| # | Feature | Dependency |
|---|---------|:--:|
| D1 | Interactive 3D globe (spin/zoom, region select + highlight) | 🟢 |
| D2 | Region roster + fly-to camera | 🟢 |
| D3 | Region Context — cited panels (land/legal/hazards) + ban alert | 🔴 |
| D4 | Reactor catalog (12 models / 7 families) + picker | 🟢 |
| D5 | Find Sites — site-finder analysis (ranked, scored, cited) | 🟡 |
| D6 | Per-reactor tailoring (different reactor → different shortlist) | 🟢 |
| D7 | Fatal-flaw / no-viable-sites detection (statutory ban) | 🔴 |
| D8 | Citations everywhere + RAG-ready corpus seam | 🔴 |
| D9 | Curated-answer cache (vetted LLM results, deterministic fallback) | 🟢 |
| D10 | Results modal + larger dashboard typography | 🟢 |

---

## 🔜 Next (buildable now)

| # | Feature | Dependency | Owner |
|---|---------|:--:|-------|
| N1 | Globe pins for found sites | 🟢 | delegate |
| N2 | Reactor-scaled **exclusion/footprint ring** | 🔴 | **you** — exclusion-area radius derives from regulatory source-term/dose rules (NRC 10 CFR 100) |
| N3 | "Land fit" readout per site (required vs available ha) | 🟢 | delegate |
| N4 | Chat panel (F6) — LLM Q&A grounded in region corpus | 🔴 | **you** — answers must cite real law (legal RAG) |
| N5 | Live LLM reasoning for uncached combos | 🔴 | **you** — every claim cites statute (legal RAG) |

---

## 📋 Planned — product roadmap (from POC pain points)

| # | Feature | Pain | Int. | Dependency | Owner |
|---|---------|------|:--:|:--:|-------|
| P1 | Grid interconnection plausibility scorer | grid | 10 | 🟢 | **delegate** — grid/queue data |
| P2 | **RulePack engine + versioning** | permitting | 9 | 🔴 | **you** — the core legal feature |
| P3 | Cooling/water **permit-trigger** engine | water | 9 | 🟡 | **you** keep permit rules · delegate hydrology data |
| P4 | Population & **emergency-planning (EPZ)** scorer | social | 8 | 🟡 | **you** keep EPZ sizing rules · delegate population data |
| P5 | **Zoning & entitlements** screener | zoning | 8 | 🔴 | **you** — local land-use law |
| P6 | Geohazard overlay engine | hazards | 7 | 🟡 | delegate hazard data · **you** keep regulatory accept/reject thresholds |
| P7 | 🚚 **Supply-chain / construction-logistics tracker** | logistics | 7 | 🟢 | **delegate** — Bloomberg/transport data |
| P8 | Site scarcity index + optioning workflow | competition | 6 | 🟢 | **delegate** — market/CRM data |
| P9 | Evidence-pack / dossier export | credibility | — | 🟡 | **you** own requirements matrix · delegate PDF/layout |
| P10 | Real geospatial data layers (parcels/grid/water/protected) | foundation | — | 🟢 | **delegate** — GIS data |
| P11 | Multi-jurisdiction expansion | coverage | — | 🔴 | **you** — each jurisdiction = new legal corpus |

---

## 🧊 Backlog (deferred — complex)

| # | Feature | Dependency |
|---|---------|:--:|
| B1 | Cursor-as-footprint + click-anywhere pin-drop + radius search | 🟡 (GIS raster + regulatory exclusion radius) |

---

## 🔴 Your scope — regulatory features (legal-RAG)

These need cross-checking against regulatory/statute docs; they ride your existing legal-RAG pipeline through `loadCorpus()`:

- **D3 / D7 / D8** — cited region context, statutory-ban detection, the citation backbone *(done)*
- **N2** — exclusion-area ring (the radius is a regulatory derivation)
- **N4 / N5** — chat + live reasoning (every answer cites law)
- **P2** — RulePack engine + versioning *(the heart of compliance)*
- **P3** — water/discharge permit triggers (you keep the rules)
- **P4** — EPZ sizing rules
- **P5** — zoning/entitlement law
- **P9** — the regulatory requirements-matrix in the dossier
- **P11** — new-jurisdiction legal corpora

---

## 🟢 Delegation roster — non-regulatory features (external data/tooling)

Each is a data-feed or visualization problem with a clear external source. Hand off with the source named.

| Feature | Delegate to (external source/tool) |
|---------|-----------------------------------|
| **P7 Supply-chain / logistics** | **Bloomberg Terminal** (commodities, shipping, vendor lead-times) + transport-corridor / heavy-haul routing data |
| **P1 Grid interconnection** | **ISO/RTO interconnection-queue feeds** (PJM, MISO, CAISO, ERCOT) or a grid-data product like **Hitachi Velocity Suite / GridStatus** — queue position + upgrade-burden proxies |
| **P6 / P10 Geohazard + geospatial layers** | **Geospatial/hazard data services** — USGS (seismic), FEMA (flood), **Regrid** (parcels), plus catastrophe-risk feeds (Moody's RMS / Munich Re NATHAN) for the hazard overlays |
| P8 Scarcity + optioning | Land/real-estate market data + a CRM (outreach, exclusivity clocks) |
| N1 Globe pins · N3 Land-fit · P9 layout | Frontend/data-viz — pure engineering |

**You asked for 2 more delegatable examples beyond the Bloomberg supply-chain tracker:**
1. **Grid interconnection (P1)** → an **ISO/RTO queue-data terminal** (PJM/MISO/CAISO feeds or GridStatus). Pure utility data — proximity, queue depth, upgrade-cost proxies — no legal interpretation.
2. **Geohazard + geospatial layers (P6/P10)** → **hazard/GIS data services** (USGS seismic, FEMA flood, Regrid parcels). The *data overlay* is delegatable; you keep only the regulatory accept/reject threshold.

(Bonus: **P8 optioning/scarcity** → a real-estate market feed + CRM.)
