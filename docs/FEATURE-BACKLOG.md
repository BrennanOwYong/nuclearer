# Feature Backlog — "Keep in View"

Ideas captured for later, not yet scheduled. Ordered by owner interest.

## 1. Cursor-as-footprint + Google-Maps pin-drop siting (COMPLEX)

**Vision (project owner, 2026-05-28):** Selecting a reactor (e.g. NuScale) turns the map cursor into a **circle scaled to that reactor's minimum land/exclusion area**, so you can *see* how much ground it needs before you click. Clicking anywhere **drops a pin** (Google-Maps style) and screens that exact location. Because mouse clicks aren't precise, if the clicked point isn't fully acceptable, the tool **expands a surrounding radius** and screens the neighborhood to find the best nearby spot.

**Why it's compelling:** makes "how much land does this reactor need, and does this spot work" tangible and interactive; the scaled cursor is a strong visual of the reactor-determined footprint.

**Why it's deferred (complexity):**
- Real point-level screening needs continuous geospatial layers (grid, water, protected areas, population) — we currently model *discrete curated candidate sites*, not a continuous raster. A click-anywhere screen would need either a real GIS data layer or a synthesized one.
- Radius "snap to best nearby" implies a spatial search + scoring grid around the click.
- Screen-pixel → km scaling for the cursor circle must track globe zoom/altitude (non-trivial on a 3D globe).
- Most arbitrary clicks legitimately fail (the realistic outcome), so UX must teach that without feeling broken.

**Buildable stepping stones (do these first — see §below in this file):**
- Reactor-scaled **exclusion/footprint ring** drawn on the *selected candidate site* (no click-anywhere; sized by real `footprintHectares`).
- **Land-fit readout** per site (required vs available hectares), scaled per reactor.

## 2. Chat panel (F6 — planned, in original spec, not yet built)

Floating LLM chat grounded in the selected region's corpus, with dynamic layout (globe+dashboard slide left when chat opens). `/api/chat` currently returns 501. Already speced in `docs/superpowers/plans/features/F6-chat-dynamic-layout.md`.

## 3. Globe pins for found sites + reactor-scaled exclusion rings (NEXT, buildable)

Drop a colored pin (pass/caution/fail) on the globe for each candidate site in the shortlist; clicking a result card flies to / focuses its pin. For the selected site, draw a **ring sized to the chosen reactor's footprint + exclusion buffer** — small for a microreactor, large for an EPR — the honest, regulator-credible visual of "the land you must control." This is the realistic version of Feature 1 without click-anywhere.
