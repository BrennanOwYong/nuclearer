# Nuclearer — Demo Walkthrough & Presentation Script

*A planning & visualisation platform that helps reactor vendors / developers decide **where to place which reactor**, and proves a site is worth pursuing — or fatally flawed — in minutes instead of months.*

**Run it:** `npm run dev` → http://localhost:5173 (Vite UI :5173, API :8787).

---

## The one-line thesis (open the video with this)

> "You don't go hunting for land and hope a reactor fits. You bring a reactor, and the platform tells you **where it fits, where it doesn't, and why — with the law and the vendor specs cited.**"

The core idea: nuclear projects die late on fatal flaws (grid, water, permitting, a statutory ban) discovered after months of work. This tool does **screen-level down-selection up front** — region + reactor in, a ranked, cited shortlist out.

---

## Feature-by-feature: what it is · user flow · how it speeds planning

### 1. Interactive 3D globe
- **What:** A dark, draggable 3D globe (globe.gl). Clickable sub-national regions (admin-1: states / provinces / voivodeships) for the three demo countries — USA, Poland, Australia. Still by default; you drag to spin, scroll to zoom; hover highlights a region, click selects it.
- **User flow:** Land on the page → drag to orient → hover a US state → click it.
- **Speeds planning:** A single global canvas to reason about *where* — no spreadsheets, no switching tools. Sub-national granularity matters because nuclear siting is decided at the state/grid-region level, not the country level.

### 2. Region roster (dashboard buttons)
- **What:** The dashboard lists every region that has siting data, as clickable buttons grouped by country (US: Wyoming, Illinois · Poland: Pomerania, Greater Poland · Australia: South Australia, Northern Territory). Clicking one **flies the globe to that region and highlights it.**
- **User flow:** In "Region Context", click **Wyoming** → globe animates to Wyoming, region outlined → context loads.
- **Speeds planning:** Jump straight to the regions with usable data; no hunting on the globe. Mirrors how a developer picks a target market first.

### 3. Region Context — cited ground truth
- **What:** For the selected region, expandable panels grouped into **Land & Infrastructure**, **Legal / RulePack**, **Hazards & Cooling** — each fact carries a citation link to the real source (NRC rules, national nuclear law, hazard data) and a confidence level. Shows the regulator. A red **statutory-ban alert** appears where nuclear is prohibited (Australia: EPBC Act s.140A + ARPANS Act s.10).
- **User flow:** Select a region → expand "Legal / RulePack" → click a citation → see the real law. Select South Australia → ban alert fires.
- **Speeds planning:** The regulatory + physical reality of a region, pre-assembled and sourced — the research a siting analyst would spend weeks compiling.

### 4. Reactor catalog & cascading picker (per-vendor specs)
- **What:** A catalog of **12 real reactor models across 7 technology families** (PWR, BWR, iPWR-SMR, HTGR, SFR, MSR, microreactor), each with **real, cited design specs**: output (MWe), **land footprint (hectares)**, cooling options, and water needs. You pick **pathway → technology family → company → model**; a mini-spec preview shows the chosen reactor's footprint/cooling + a citation.
- **Land specs are real and per-vendor** — e.g. eVinci microreactor **0.8 ha / dry-cooled**, BWRX-300 **4 ha**, AP1000 **6 ha**, EPR **40 ha**, APR1400 **50 ha**.
- **User flow:** "Find Sites" tab → Pathway (greenfield / coal-repower) → Technology (e.g. BWR) → Company (GE-Hitachi) → Model (BWRX-300) → see its specs.
- **Speeds planning:** The vendor's own envelope becomes the search filter — no manual cross-referencing of spec sheets against sites.

### 5. Find Sites — the site-finder analysis (headline feature)
- **What:** Hit **Find sites** → the platform screens a prepared pool of **candidate sites** (real named brownfields/industrial sites + plausible greenfield zones) against the chosen reactor's envelope and the region's laws, returning a **ranked shortlist**. Each site card shows:
  - **Rank** + **site name** + **kind badge** (named / greenfield)
  - **Verdict**: pass / caution / fail
  - **Friction bars** across six gates: grid, cooling, permits, community, logistics, hazards
  - **Reasoning matrix**: each row = constraint · verdict · plain-English reason · **citation** · and **dataBasis** tag (`computable` vs `requires-field-study` — honest about what's screened vs what still needs fieldwork)
  - **Confidence**, plus a region summary, recommended **next studies**, and screen-level caveats.
- **User flow:** Pick reactor → Find sites → read the ranked cards → click citations to verify → click a card to focus it.
- **Speeds planning:** Turns "evaluate this region" into a ranked, evidence-backed shortlist in seconds, with the reasons and sources attached — exactly the "evidence pack" a developer needs to decide where to spend money.

### 6. Reactor choice changes the answer (tailored per parameter)
- **What:** The same region returns **different shortlists for different reactors**, because footprint, cooling, and water needs differ. A dry-cooled microreactor (eVinci, Xe-100) passes water-scarce/remote land that a large water-cooled PWR fails; a large PWR wants coastal/river sites with room for a big footprint.
- **User flow:** In Wyoming, run **BWRX-300 (coal-repower)** → note the shortlist. Switch to **eVinci (greenfield)** → a *different* set of viable sites appears.
- **Speeds planning:** Instantly shows which of a vendor's products fits where — the core "which reactor goes where" decision, side by side.

### 7. Fatal-flaw / no-viable-sites detection (the Australia case)
- **What:** Run any reactor in **South Australia or Northern Territory** → **"No viable sites"**, every candidate failing on the **statutory ban** (EPBC/ARPANS), cited — not a vague error, a sourced legal show-stopper. Land that looks physically perfect (empty outback) is correctly rejected on law.
- **User flow:** Australia region → pick any reactor → Find sites → no-viable result with the ban cited.
- **Speeds planning:** Catches the single most expensive mistake — pursuing a site that can never be licensed — in one click. This is the money moment of the demo.

### 8. Everything is cited (and RAG-ready)
- **What:** Every material claim — region facts, reactor specs, screening reasons — links to a real source (law section + year + URL, or vendor spec sheet). The reasoning is generated by an LLM over a curated, cited corpus; the server's corpus loader is a **drop-in seam for a real compliance RAG pipeline** (swap hardcoded corpus → live retrieval, same interface).
- **Speeds planning / builds trust:** Decision-makers can verify every claim. Screen-level language throughout (never "licensable/approved") keeps it credible and litigation-safe.

### 9. Curated-answer cache (demo reliability + real reasoning)
- **What:** For the curated demo combinations, the server serves a **human-reviewed, LLM-generated analysis** from cache (instant, deterministic, same every time you present); any other combination falls back to a live deterministic screening engine. So the demo never depends on a live API call mid-presentation, yet the answers are real LLM reasoning over real sources.
- **Speeds planning (product story):** In production this is exactly the pattern — cache vetted analyses, generate on demand for new combos.

---

## Suggested video run-of-show (≈3–4 min)

1. **Hook (15s):** thesis line over the spinning globe.
2. **Pick a market (20s):** click **Wyoming** from the roster → globe flies in → open Region Context, expand a law, click a citation. "Real laws, real sources."
3. **Bring a reactor (25s):** Find Sites → coal-repower → GE-Hitachi BWRX-300. Show the spec preview (4 ha, cooling). Hit **Find sites** → ranked shortlist. Walk one card: verdict, friction bars, a cited reason, the `requires-field-study` tag.
4. **Reactor changes the answer (30s):** switch to **eVinci microreactor** → different shortlist. "Smaller, dry-cooled — it unlocks land a large plant can't use."
5. **Catch the fatal flaw (30s):** click **South Australia** → ban alert. Run any reactor → **No viable sites**, EPBC/ARPANS cited. "Months of wasted effort, avoided in one click."
6. **Close (20s):** "Every claim is cited; the engine is RAG-ready. This is screen-level down-selection that turns months into minutes."

---

## Current limitations to be honest about (and what's next)

- **On the globe today** the found sites show as **dashboard cards**, not yet pins on the map. *Next build:* pins + a **reactor-scaled exclusion/footprint ring** (small for eVinci, large for EPR) — the visual of "the land you must control." (See `FEATURE-BACKLOG.md` §3.)
- **Chat panel** (ask free-form questions about a region) is speced but **not yet built** (`/api/chat` is a stub). (`FEATURE-BACKLOG.md` §2.)
- **Cursor-as-footprint + click-anywhere pin-drop with radius search** is a wanted future feature, deferred for complexity. (`FEATURE-BACKLOG.md` §1.)
- Data covers **3 countries × 6 flagship regions**; other regions show a limited-data state by design.
