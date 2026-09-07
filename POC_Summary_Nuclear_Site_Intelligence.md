# POC Summary: Site Intelligence for SMR, Coal-to-Nuclear Repower, and Large Nuclear New Build

*Objective: deliver a short-build proof of concept (POC) that shortlists credible sites, cites vendor construction specs and local legalities, and produces an explainable evidence pack.*

---

## 1. Executive summary
This concept is **not** a generic “land listings” product. It is a **site intelligence + evidence-pack** system that helps nuclear project teams **down-select feasible sites faster** by combining:

- **Land + infrastructure data** (parcels, zoning, hazards, grid, water, logistics, population)
- **Local legal and permitting constraints** (jurisdiction “RulePacks”)
- **Vendor/EPC construction design envelopes** (design “Envelopes”)

The POC should output ranked candidate sites with traceable reasons, clearly separating **screen-level conclusions** from items that require **field studies** and **regulator engagement**.

---

## 2. Problem statement
Nuclear projects are delayed or killed less by the availability of land and more by the availability of a **“site readiness bundle”**:

- grid interconnection feasibility (queue, upgrades, timeline)
- cooling and water constraints (rights, discharge limits, drought/heat)
- zoning and entitlements (rezoning likelihood)
- environmental permitting triggers (EIA/ESIA)
- hazards (seismic, flood, liquefaction, multi-hazard coupling)
- security and emergency planning practicality
- social/political acceptance (and litigation risk)

Teams waste months pursuing sites that fail on one or two fatal constraints discovered late.

The system must work across **three build pathways** and their design variants:

- **SMRs (Small Modular Reactors)**: modular construction envelopes, potential flexibility and different cooling strategies; still subject to licensing, grid, and security realities.
- **Coal-to-nuclear repower (repurpose/refurbish coal sites)**: leverages transferable infrastructure (switchyard, water intakes, industrial zoning) but has legacy constraints (contamination, legacy permits, community politics).
- **Large nuclear plants (traditional new build or expansion)**: larger footprints, stronger cooling needs, and high regulatory scrutiny; often better suited to coastal/river sites and established energy corridors.

---

## 3. What the output must include (credibility requirement)
The deliverable must explicitly reference and **cite**:

- **Vendor/EPC construction specs (Design Envelopes)**  
  Footprint ranges (incl. laydown and security perimeter), cooling assumptions, logistics constraints, and any stated hazard/geotech tolerances.
- **Local legalities (RulePacks)**  
  Siting exclusions and buffers, zoning/entitlement rules, EIA/ESIA triggers, water withdrawal/discharge permits, emergency planning considerations, and security/safeguards expectations.
- **Land + infrastructure data**  
  Parcels, zoning, ownership indicators, grid nodes/corridors, water bodies, hazards, protected areas, population, logistics networks, industrial adjacency.

And then produce an **explainable analysis**:
- ranked shortlist
- per-site pass/fail matrix
- confidence levels
- next-step study plan (what must be verified by field work)

**Note:** frame results as **screen-level** down-selection and risk triage. Do **not** claim guaranteed licensability.

---

## 4. Plant types and siting implications (minimum model)

| Build pathway | What changes vs baseline | Primary siting drivers |
|---|---|---|
| **SMR** | Often smaller footprint; modular logistics; some designs enable more flexible cooling/dispatch; licensing novelty can be higher | Interconnection feasibility; local permitting pathway; cooling approach; logistics (ports/rail/roads); community/political risk |
| **Coal-to-nuclear repower** | Reuses switchyard/interconnect; industrial zoning; water infrastructure; workforce familiarity; but legacy contamination and constraints | Existing grid rights and upgrade needs; brownfield remediation; legacy permits; water intake/discharge; local politics; transport access |
| **Large nuclear new build** | Larger footprint; stronger cooling and environmental sensitivities; longer schedules and more scrutiny | Cooling water and discharge limits; geohazards; emergency planning practicality; zoning; long-lead logistics; political acceptance |

---

## 5. Ranked pain points and what a POC can move

Scale:
- **Intensity (1–10):** how strongly it delays/kills projects in practice
- **Needle move:** impact a POC can realistically deliver in weeks

| Rank | Pain point / friction area | Intensity | Why it slows adoption | Best POC lever | Needle move |
|---:|---|---:|---|---|---|
| 1 | **Grid interconnection reality** (queue, upgrades, timeline) | 10 | Lines nearby ≠ capacity; queue delays and upgrade capex dominate schedules | Interconnect plausibility scorer + repower shortlist | **High** |
| 2 | **Permitting pathway uncertainty** (jurisdiction-specific) | 9 | Discretionary approvals and EIA triggers create schedule/litigation risk | RulePack MVP + site requirements matrix | **High** |
| 3 | **Cooling & water constraints** (rights, discharge limits, drought/heat) | 9 | Water access isn’t permission; discharge limits and climate extremes reduce feasible sites | Cooling classifier + permit-trigger flags | **Med–High** |
| 4 | **Social license / population & emergency planning practicality** | 8 | Opposition and evacuation practicality can stall projects for years | Population + sensitive receptor + access/evacuation proxy score | **Medium** |
| 5 | **Zoning & entitlements** (rezoning likelihood) | 8 | Incompatible land use creates long and uncertain approval cycles | Zoning screener + entitlement friction score | **Med–High** |
| 6 | **Geohazards / multi-hazard coupling** | 7 | Triggers expensive characterization; can be fatal late | Hazard overlay engine + evidence appendix export | **Medium** |
| 7 | **Construction logistics** (ports/rail/roads, heavy haul, laydown) | 7 | Movement/staging can be a hidden blocker | Logistics score + footprint envelope checker | **Medium** |
| 8 | **Competition for sites + optioning** | 6 | Grid-adjacent parcels attract competing bidders | Scarcity index + optioning workflow tracker | **Low–Med** |

---

## 6. Solution overview (what you’re building)
- **Site Intelligence Engine:** takes a region and returns ranked candidate sites with explainability.
- **Design Envelope Library:** vendor/EPC specs captured as machine-readable constraints with citations.
- **Jurisdiction RulePack:** computable rules plus “requires human review” notes, with citations and effective dates.
- **Evidence Pack Generator:** exports a dossier per site (maps, requirements matrix, risk register, next studies).

---

## 7. Recommended POC scope (to ship fast)
Constrain the POC to:
- **One starting jurisdiction** (legal citations must be real and maintainable).
- **Three pathway archetypes:** one SMR envelope, one coal-repower envelope, one large new-build envelope (expand later).
- **Shortlist workflow:** screen → rank → export dossier for top sites.

**Note:** if parcel ownership data is hard, use site polygons or grid cells for the first demo; keep the evidence pack structure unchanged.

---

## 8. POC deliverables (short-build projects)

### POC A: SMR/Repower/Large Site Screener (map + ranked shortlist)
- Hard No filters (protected areas, high-risk hazards, zoning incompatibility where available)
- Friction scoring by category (grid, cooling, permits, community, logistics)
- Explainability: what data and rules drove each score
- Export: top sites table + per-site dossier (HTML/PDF)

### POC B: RulePack MVP (1 jurisdiction)
- 30–40 requirements captured as computable tests or human-review flags
- Citations, effective dates, confidence per requirement
- Auto-generated requirements matrix per site

### POC C: Coal-to-nuclear Repower Finder
- Identify retired/retiring fossil sites with existing switchyards and industrial zoning
- Flag legacy risks (contamination proxies if data exists; protected areas; flood/seismic)
- Produce repower candidate dossiers

(Optional) **Optioning workflow tracker**: outreach status, exclusivity clocks, milestone gating.

---

## 9. Technical blueprint (minimal architecture)
- **Data pipeline:** ingest, normalize, cache geospatial layers (parcels, zoning, hazards, grid, water, protected areas, population, logistics).
- **Constraint model:** hard constraints (boolean) + friction scores (0..1 by category) + pathway-specific weights.
- **Explainability store:** for each site: features, rules, datasets, and confidence that produced the score.
- **Outputs:** interactive map UI (Leaflet/Mapbox) + exportable dossiers.

---

## 10. Operational guardrails (avoid losing trust)
- Never claim “permit-approved” or “licensable” results; use **screen-level** language.
- Label assumptions explicitly; attach confidence and data provenance.
- Separate computable rules from discretionary/human-review items.
- Version-control RulePacks and Design Envelopes (change logs + effective dates).

---

## 11. Expert outreach plan (validate intelligently)
Goal: learn fatal flaws, workflow, buyer, and what outputs are actionable. Focus on bottlenecks, not reactor physics.

### Minimum vocabulary to learn (to keep calls high-signal)
- site screening vs site characterization  
- interconnection queue and upgrade costs  
- EIA/ESIA triggers  
- brownfield/repower vs greenfield  
- cooling: once-through, tower, hybrid, dry  
- safety case and hazard evaluation  
- emergency planning practicality  
- safeguards/security  

### High-signal questions
1. Where do projects most commonly stall: grid, permitting, EIA, community, financing, or supply chain?  
2. What are your top 5 fatal flaws you wish you could screen out in week 1?  
3. Which constraints are computable from public/commercial data vs always require field studies?  
4. What evidence convinces internal decision-makers a site is worth spending money on?  
5. Who owns and pays for site selection: vendor, utility, EPC, or government?  
6. For SMR vs repower vs large new-build, what changes most in siting priorities (cooling, footprint, logistics, social acceptance)?  
7. How do you trade off fast-to-permit vs fast-to-interconnect vs best economics?  
8. What would make you trust a third-party shortlist, and what would disqualify it immediately?  

---

## 12. Action plan (2–4 weeks to a credible demo)

### Week 1: define scope and assemble data
- Pick starting jurisdiction; document initial RulePack sources (with citations).
- Select 3 pathway archetypes (SMR, repower, large) and collect Design Envelope specs (with citations).
- Assemble baseline geospatial layers; build ingestion/cache pipeline.

### Week 2: build scoring + explainability
- Implement hard constraints and friction scoring categories.
- Add pathway-specific weighting profiles (SMR vs repower vs large).
- Persist explainability metadata (rules/datasets/features/confidence).

### Week 3: build outputs (map + dossiers)
- Map UI with ranked shortlist and filters.
- Export per-site evidence pack (requirements matrix + maps + risk register + next studies).

### Week 4: validate with 5–10 expert interviews
- Run calls; revise RulePack and scoring weights.
- Capture “what would make this actionable” requirements and integrate top 3 into demo.

---

## 13. Open questions for further exploration
- Which buyer persona is fastest: SMR vendor BD, utility developer, EPC, or government site program?
- Which jurisdictions give best speed-to-value (available data + clearer pathways)?
- How to model interconnection feasibility beyond proximity (queue data availability, utility interconnect maps)?
- How to represent design variants like molten-salt heat transfer and thermal storage without false precision?
- What liability/insurance posture is needed for screen-level outputs vs deeper dossier services?

---

*Prepared for: Bi Zinfo*
