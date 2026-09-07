# Nuclearer — Voiceover / Talking-Points Script

*Word-for-word narration to read aloud while screen-recording. ~3.5 min. Left column = what you SAY. Right column = what you DO on screen. Pause where you see ⏸.*

> Setup before recording: `npm run dev` → http://localhost:5173. Have the page loaded with the globe visible, nothing selected. Dashboard sitting center-bottom.

---

## 0 · COLD OPEN (0:00–0:18)

**SAY:**
> "Nuclear projects don't usually die because there's no land. They die because — six months and millions of dollars in — someone discovers the grid can't take the power, or the water rights don't exist, or the law forbids it outright. This is a tool that catches those fatal flaws on day one."

**DO:** Slow drag to spin the globe. Let it sit on the Americas.

⏸

---

## 1 · THE THESIS (0:18–0:35)

**SAY:**
> "The idea is simple. You don't go hunting for land and hope a reactor fits. You bring a reactor — a specific model from a specific company — and the platform tells you where it fits, where it doesn't, and why. And every answer is backed by the actual law and the vendor's own spec sheet."

**DO:** Gesture across the globe; hover a US state so it highlights.

⏸

---

## 2 · PICK A MARKET (0:35–1:05)

**SAY:**
> "Let's say I'm developing in the United States. I'll start in Wyoming."

**DO:** In the dashboard's **Region Context** tab, click the **Wyoming** button. Globe flies to Wyoming, region highlights.

**SAY:**
> "The platform immediately gives me the ground truth for this region — not marketing, the real regulatory and physical picture. Here's the licensing pathway, the grid, the water situation, the hazards. And every single fact is cited."

**DO:** Expand the **Legal / RulePack** panel. Click one citation link → the real NRC source opens (or show the link).

**SAY:**
> "That's the research a siting analyst would spend weeks pulling together — here in seconds, with sources."

⏸

---

## 3 · BRING A REACTOR (1:05–1:45)

**SAY:**
> "Now I bring my product. I'm repowering a retiring coal site, so I'll choose the coal-repower pathway, and let's go with GE-Hitachi's BWRX-300 — a 300-megawatt small modular reactor."

**DO:** Switch to **Find Sites** tab. Select pathway **Coal-repower** → technology **BWR** → company **GE-Hitachi** → model **BWRX-300**. Pause on the spec preview.

**SAY:**
> "Notice it pulls the reactor's real design envelope — footprint, cooling, water needs. That envelope becomes the search filter. Let's find sites."

**DO:** Click **Find sites**. Ranked cards appear.

**SAY:**
> "And there's the shortlist — ranked, scored, and explained. The top site is the Naughton coal plant near Kemmerer. It passes because the switchyard's already there and the land's already industrial."

**DO:** Point to the rank-1 card. Run your cursor over the **friction bars**.

**SAY:**
> "These bars are the friction across every siting gate — grid, cooling, permits, community, logistics, hazards. And down here, every conclusion gives its reason, its source, and — importantly — whether it's something we computed or something that still needs a field study. The tool never pretends to know more than it does."

**DO:** Point to a matrix row showing a citation and the `requires-field-study` tag.

⏸

---

## 4 · THE REACTOR CHANGES THE ANSWER (1:45–2:20)

**SAY:**
> "Here's where it gets powerful. The land a reactor can use depends entirely on the reactor. Watch what happens if I swap the BWRX-300 for a microreactor — Westinghouse's eVinci."

**DO:** Change model to **eVinci** (microreactor), pathway **Greenfield**. Click **Find sites** again.

**SAY:**
> "Different shortlist. The eVinci is under one hectare and air-cooled — no water needed — so it unlocks remote, dry, off-grid land that a big water-cooled plant could never use. Same region, completely different siting answer, because the hardware is different. That's the 'which reactor goes where' decision, made visual."

⏸

---

## 5 · THE MONEY MOMENT — CATCH THE FATAL FLAW (2:20–3:00)

**SAY:**
> "But the most valuable thing a tool like this can do is tell you *no* — before you've spent a dollar. Look at Australia."

**DO:** Click **South Australia** in the region roster. Globe flies there. The red **ban alert** appears.

**SAY:**
> "On paper, this is perfect — endless empty land. But watch."

**DO:** Find Sites → pick any reactor → **Find sites**.

**SAY:**
> "No viable sites. Every candidate fails — not on geography, on law. Australia has a federal statutory prohibition on nuclear power, and the tool cites the exact acts: the EPBC Act and the ARPANS Act. A developer could've spent months chasing that outback land. The platform kills it in one click, with the receipts."

⏸

---

## 6 · CLOSE (3:00–3:25)

**SAY:**
> "So that's the platform. Real reactors, real laws, real sites — every claim cited, and the whole reasoning engine is built to plug straight into a live compliance database. It turns the first, most expensive phase of nuclear siting — figuring out where a reactor can actually go — from months of consultants into minutes. That's how you make nuclear easier to build."

**DO:** Pull back to the full globe view. Hold. End.

---

## Quick reference — exact click order (keep on a second screen)

1. Region Context → **Wyoming**
2. Legal/RulePack panel → expand → click a citation
3. Find Sites → Coal-repower → BWR → GE-Hitachi → BWRX-300 → **Find sites**
4. Point at rank-1 card, friction bars, a cited matrix row + field-study tag
5. Model → **eVinci** + Greenfield → **Find sites**
6. Region Context → **South Australia** → (ban alert) → Find Sites → any reactor → **Find sites** → "No viable sites"
7. Zoom out, hold, end.

## Timing cheatsheet
- Cold open 18s · Thesis 17s · Pick market 30s · Bring reactor 40s · Reactor-changes-answer 35s · Fatal flaw 40s · Close 25s → **~3:25 total**

## If a click misbehaves on camera
- Site results are served from a vetted cache for these exact combos, so they're identical every take — you can re-record any segment and it'll match.
- The "no viable sites" result for Australia is deterministic; safe to re-run.
