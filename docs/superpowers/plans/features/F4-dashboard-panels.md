# F4 — Dashboard Cited Panels (Expandable Menu) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the floating bottom-left Dashboard that, on a selected region, looks up `RegionData` and either renders a clean "limited data" state or renders region facts grouped into four cited panels (Land & Infrastructure, Legal/RulePack, Hazards & Cooling, Pathway Suitability) as a clickable menu where each item expands to show detail + its resolved citation, plus an "Add plant" button slot.

**Architecture:** Two Vitest-tested pure helpers (`groupFactsByCategory`, `resolveCitation`) handle the logic of mapping the flat `RegionFact[]` into the four UI panels and resolving a fact's `citationId` against the `CountryCorpus`. Three React components (`Dashboard`, `PanelMenu`, `Panel`) consume those helpers plus F3's `getRegionData` / `getCountryCorpus` lookups and render the panels. UI behavior is verified end-to-end with Playwright; the helpers are unit-tested with Vitest. The Dashboard exposes an `onAddPlant` callback prop (the AddPlant component is F5 and is NOT built here — only the button/slot that fires the callback).

**Tech Stack:** Vite + React + TypeScript; Vitest (pure logic); Playwright (UI E2E). CSS for the floating panel.

**Depends on:** F2 (globe emits `onRegionSelected(country, regionId, regionName)` which the app wires into the Dashboard's `country` / `regionId` props) and F3 (data layer: `getRegionData`, `getCountryCorpus`, flagship region data, the Australia ban source snippet).

---

## File structure

| Path | Create / Modify | Responsibility |
|------|-----------------|----------------|
| `src/dashboard/panelCategories.ts` | Create | Pure helpers + panel-category config: `PanelKey`, `PANELS`, `groupFactsByCategory`, `resolveCitation`. F4-owned support module. |
| `src/dashboard/Dashboard.tsx` | Create | F4-OWNED. Floating bottom-left container. Props `{ country, regionId, onAddPlant }`. Looks up `RegionData` + `CountryCorpus`; renders limited-data state OR `PanelMenu`; renders "Add plant" button. |
| `src/dashboard/PanelMenu.tsx` | Create | F4-OWNED. Renders the four `Panel`s from grouped facts; owns expand/collapse state (which fact item is open). |
| `src/dashboard/Panel.tsx` | Create | F4-OWNED. One category panel: a clickable menu of fact items; an expanded item shows `detail` + resolved `Citation` (title, citation string, year, url link). |
| `src/dashboard/dashboard.css` | Create | Floating-panel + menu styling (bottom-left overlap of globe). |
| `src/dashboard/panelCategories.test.ts` | Create | Vitest unit tests for `groupFactsByCategory` + `resolveCitation`. |
| `e2e/dashboard.spec.ts` | Create | Playwright E2E for panel population, expand+citation link, limited-data state, Add-plant callback, Australia ban visible in Legal panel. |

## Interfaces consumed / produced

**Consumes (LOCKED types from F1 `src/types.ts`, used VERBATIM):**

```ts
import type {
  RegionData,
  RegionFact,
  FactCategory,
  CountryCorpus,
  SourceSnippet,
  Citation,
} from '../types';
```

- `RegionData` — `{ country, regionId, regionName, hasRichData, facts }`. `hasRichData === false` => limited-data state.
- `RegionFact` — `{ id, category, label, value, detail, citationId?, confidence }`. `category` is a `FactCategory` (`'land' | 'grid' | 'water' | 'hazard' | 'population' | 'pathway'`).
- `CountryCorpus` — `{ code, name, regulator, sources: SourceSnippet[] }`.
- `SourceSnippet extends Citation` — so each source carries `id, title, citation, section?, year, url`.
- `Citation` — `{ id, title, citation, section?, year, url }`.

**Consumes (F3 data-layer lookups):**

```ts
import { getRegionData, getCountryCorpus } from '../data/loadCorpus';
// getRegionData(country: string, regionId: string): RegionData | undefined
// getCountryCorpus(country: string): CountryCorpus | undefined
```

> **F3 contract assumption:** F4 needs synchronous, client-safe lookups `getRegionData` and `getCountryCorpus` exported from `src/data/loadCorpus`. The server-side `loadCorpus()` seam (PRD §5) is F3's responsibility; F4 only consumes the two client lookups. If F3 names them differently or only exposes the throwing `loadCorpus`, see the Deviation note at the end of this plan.

**Produces:**

- `Dashboard` React component with props `{ country: string; regionId: string; onAddPlant: () => void }`. **Callback contract:** clicking the "Add plant" button invokes `onAddPlant()` with no arguments. The AddPlant UI (company/model/params/run) is F5 and mounts behind this callback — F4 does NOT create it.
- `groupFactsByCategory(facts: RegionFact[]): Record<PanelKey, RegionFact[]>` — pure, exported for reuse/testing.
- `resolveCitation(citationId: string | undefined, corpus: CountryCorpus | undefined): Citation | undefined` — pure, exported for reuse/testing.

---

### Task 1: Panel-category config + `groupFactsByCategory` (Vitest)

Maps the flat `RegionFact[]` (keyed by the six `FactCategory` values) into the four UI panels from spec §4.2. Mapping:
- **Land & Infrastructure** ← `land`, `grid`, `population`
- **Legal / RulePack** ← (no `FactCategory` is legal; legal content lives in the corpus `SourceSnippet`s, surfaced separately in the Dashboard — see Task 4). This task only groups the fact-backed panels.
- **Hazards & Cooling** ← `hazard`, `water`
- **Pathway Suitability** ← `pathway`

**Files:**
- Create: `src/dashboard/panelCategories.ts`
- Test: `src/dashboard/panelCategories.test.ts`

- [ ] **Step 1: Write the failing test**

`src/dashboard/panelCategories.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { groupFactsByCategory, PANELS } from './panelCategories';
import type { RegionFact } from '../types';

const facts: RegionFact[] = [
  { id: 'f-land', category: 'land', label: 'Land', value: 'vast', detail: 'open desert', confidence: 'high' },
  { id: 'f-grid', category: 'grid', label: 'Grid', value: '500kV node 40km', detail: 'corridor', confidence: 'medium' },
  { id: 'f-pop', category: 'population', label: 'Population', value: 'sparse', detail: 'low density', confidence: 'high' },
  { id: 'f-haz', category: 'hazard', label: 'Seismic', value: 'low', detail: 'stable craton', confidence: 'high' },
  { id: 'f-water', category: 'water', label: 'Water', value: 'scarce', detail: 'interior arid', confidence: 'medium' },
  { id: 'f-path', category: 'pathway', label: 'Pathway', value: 'greenfield', detail: 'SMR viable', confidence: 'low' },
];

describe('groupFactsByCategory', () => {
  it('routes land, grid and population facts into the land panel', () => {
    const grouped = groupFactsByCategory(facts);
    expect(grouped.land.map((f) => f.id)).toEqual(['f-land', 'f-grid', 'f-pop']);
  });

  it('routes hazard and water facts into the hazard panel', () => {
    const grouped = groupFactsByCategory(facts);
    expect(grouped.hazard.map((f) => f.id)).toEqual(['f-haz', 'f-water']);
  });

  it('routes pathway facts into the pathway panel', () => {
    const grouped = groupFactsByCategory(facts);
    expect(grouped.pathway.map((f) => f.id)).toEqual(['f-path']);
  });

  it('leaves the legal panel empty (legal content comes from the corpus, not facts)', () => {
    const grouped = groupFactsByCategory(facts);
    expect(grouped.legal).toEqual([]);
  });

  it('returns every panel key even when no facts match', () => {
    const grouped = groupFactsByCategory([]);
    expect(Object.keys(grouped).sort()).toEqual(['hazard', 'land', 'legal', 'pathway']);
    expect(grouped.land).toEqual([]);
  });

  it('exposes exactly the four panels in display order', () => {
    expect(PANELS.map((p) => p.key)).toEqual(['land', 'legal', 'hazard', 'pathway']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/dashboard/panelCategories.test.ts`
Expected: FAIL — `Failed to resolve import "./panelCategories"` / "groupFactsByCategory is not a function".

- [ ] **Step 3: Write minimal implementation**

`src/dashboard/panelCategories.ts`:

```ts
import type { FactCategory, RegionFact } from '../types';

/** UI panel keys (spec §4.2). Distinct from the six FactCategory values. */
export type PanelKey = 'land' | 'legal' | 'hazard' | 'pathway';

export interface PanelConfig {
  key: PanelKey;
  title: string;
  /** FactCategory values routed into this panel. Empty => corpus-driven (legal). */
  categories: FactCategory[];
}

/** The four dashboard panels, in display order. */
export const PANELS: PanelConfig[] = [
  { key: 'land', title: 'Land & Infrastructure', categories: ['land', 'grid', 'population'] },
  { key: 'legal', title: 'Legal / RulePack', categories: [] },
  { key: 'hazard', title: 'Hazards & Cooling', categories: ['hazard', 'water'] },
  { key: 'pathway', title: 'Pathway Suitability', categories: ['pathway'] },
];

/**
 * Group a region's flat facts into the four UI panels.
 * Preserves the input order of facts within each panel.
 * The legal panel is always empty here — legal/ban content is sourced from the
 * CountryCorpus and rendered separately by the Dashboard.
 */
export function groupFactsByCategory(facts: RegionFact[]): Record<PanelKey, RegionFact[]> {
  const result: Record<PanelKey, RegionFact[]> = {
    land: [],
    legal: [],
    hazard: [],
    pathway: [],
  };
  // Build a reverse lookup: FactCategory -> PanelKey
  const catToPanel = new Map<FactCategory, PanelKey>();
  for (const panel of PANELS) {
    for (const cat of panel.categories) {
      catToPanel.set(cat, panel.key);
    }
  }
  for (const fact of facts) {
    const panelKey = catToPanel.get(fact.category);
    if (panelKey) {
      result[panelKey].push(fact);
    }
  }
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/dashboard/panelCategories.test.ts`
Expected: PASS — 6 passed.

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/panelCategories.ts src/dashboard/panelCategories.test.ts
git commit -m "feat(F4): add panel-category config and groupFactsByCategory helper"
```

---

### Task 2: `resolveCitation` helper (Vitest)

Resolves a `RegionFact.citationId` (or any citation id) against a `CountryCorpus.sources` array. `SourceSnippet extends Citation`, so a matched source already satisfies the `Citation` shape. Returns `undefined` for a missing id, an unknown id, or a missing corpus.

**Files:**
- Modify: `src/dashboard/panelCategories.ts`
- Modify: `src/dashboard/panelCategories.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `src/dashboard/panelCategories.test.ts`:

```ts
import { resolveCitation } from './panelCategories';
import type { CountryCorpus } from '../types';

const corpus: CountryCorpus = {
  code: 'AUS',
  name: 'Australia',
  regulator: 'ARPANSA',
  sources: [
    {
      id: 'au-epbc-140a',
      title: 'EPBC Act 1999 s.140A',
      citation: 'Environment Protection and Biodiversity Conservation Act 1999 (Cth) s 140A',
      section: 's 140A',
      year: 1999,
      url: 'https://www.legislation.gov.au/Details/C2021C00182',
      text: 'The Minister must not approve a nuclear power plant.',
      type: 'human-review',
      confidence: 'high',
    },
  ],
};

describe('resolveCitation', () => {
  it('resolves a known citation id to its Citation', () => {
    const cite = resolveCitation('au-epbc-140a', corpus);
    expect(cite?.title).toBe('EPBC Act 1999 s.140A');
    expect(cite?.year).toBe(1999);
    expect(cite?.url).toBe('https://www.legislation.gov.au/Details/C2021C00182');
  });

  it('returns undefined for an unknown id', () => {
    expect(resolveCitation('nope', corpus)).toBeUndefined();
  });

  it('returns undefined when citationId is undefined', () => {
    expect(resolveCitation(undefined, corpus)).toBeUndefined();
  });

  it('returns undefined when corpus is undefined', () => {
    expect(resolveCitation('au-epbc-140a', undefined)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/dashboard/panelCategories.test.ts`
Expected: FAIL — "resolveCitation is not a function" (export missing).

- [ ] **Step 3: Write minimal implementation**

Append to `src/dashboard/panelCategories.ts`:

```ts
import type { Citation, CountryCorpus } from '../types';

/**
 * Resolve a citation id against a country corpus's sources.
 * SourceSnippet extends Citation, so a matched source already is a Citation.
 * Returns undefined for a missing/unknown id or a missing corpus.
 */
export function resolveCitation(
  citationId: string | undefined,
  corpus: CountryCorpus | undefined,
): Citation | undefined {
  if (!citationId || !corpus) return undefined;
  return corpus.sources.find((s) => s.id === citationId);
}
```

> Note: `import type { CountryCorpus }` may already exist from earlier edits — if TypeScript reports a duplicate import, merge `Citation` and `CountryCorpus` into the existing `import type` line at the top of the file instead of adding a second one.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/dashboard/panelCategories.test.ts`
Expected: PASS — 10 passed (6 from Task 1 + 4 here).

- [ ] **Step 5: Commit**

```bash
git add src/dashboard/panelCategories.ts src/dashboard/panelCategories.test.ts
git commit -m "feat(F4): add resolveCitation helper"
```

---

### Task 3: `Panel` component — clickable menu of fact items with expandable detail + citation

One category panel. Renders its `title` and a list of fact items as buttons. Clicking a fact toggles its expanded detail, which shows `fact.detail` and, if a citation resolves, a citation block (title, citation string, year, and an external `url` link). Expand state is controlled by the parent (`PanelMenu`) so only one item is open at a time across the whole menu.

**Files:**
- Create: `src/dashboard/Panel.tsx`

- [ ] **Step 1: Write the component**

`src/dashboard/Panel.tsx`:

```tsx
import type { CountryCorpus, RegionFact } from '../types';
import type { PanelKey } from './panelCategories';
import { resolveCitation } from './panelCategories';

export interface PanelProps {
  panelKey: PanelKey;
  title: string;
  facts: RegionFact[];
  corpus: CountryCorpus | undefined;
  /** id of the currently expanded fact (across the whole menu), or null. */
  expandedFactId: string | null;
  onToggleFact: (factId: string) => void;
  /**
   * Optional extra rows rendered above the facts (used by the Legal panel to
   * surface corpus-sourced ban/prohibition entries that are not RegionFacts).
   */
  extraItems?: React.ReactNode;
}

export function Panel({
  panelKey,
  title,
  facts,
  corpus,
  expandedFactId,
  onToggleFact,
  extraItems,
}: PanelProps) {
  return (
    <section className="dash-panel" data-panel={panelKey}>
      <h3 className="dash-panel__title">{title}</h3>
      <ul className="dash-panel__list">
        {extraItems}
        {facts.map((fact) => {
          const isOpen = expandedFactId === fact.id;
          const cite = resolveCitation(fact.citationId, corpus);
          return (
            <li key={fact.id} className="dash-item" data-fact-id={fact.id}>
              <button
                type="button"
                className="dash-item__header"
                aria-expanded={isOpen}
                onClick={() => onToggleFact(fact.id)}
              >
                <span className="dash-item__label">{fact.label}</span>
                <span className="dash-item__value">{fact.value}</span>
              </button>
              {isOpen && (
                <div className="dash-item__detail" data-testid="fact-detail">
                  <p className="dash-item__detail-text">{fact.detail}</p>
                  <p className="dash-item__confidence">Confidence: {fact.confidence}</p>
                  {cite ? (
                    <div className="dash-citation" data-testid="fact-citation">
                      <span className="dash-citation__title">{cite.title}</span>
                      <span className="dash-citation__cite">
                        {cite.citation} ({cite.year})
                      </span>
                      <a
                        className="dash-citation__link"
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        Source
                      </a>
                    </div>
                  ) : (
                    fact.citationId && (
                      <p className="dash-citation dash-citation--missing">
                        Citation unavailable
                      </p>
                    )
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Type-check the component compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/dashboard/Panel.tsx`. (Behavior is verified in Task 6 E2E.)

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/Panel.tsx
git commit -m "feat(F4): add Panel component with expandable fact items + citation"
```

---

### Task 4: `PanelMenu` component — renders the four panels, owns expand state, surfaces legal/ban items

`PanelMenu` groups the region's facts (via `groupFactsByCategory`), owns the single "which fact is expanded" state, and renders one `Panel` per entry in `PANELS`. For the **Legal / RulePack** panel it derives menu items from the `CountryCorpus.sources` (the law/ban snippets), passing them as `extraItems`. Ban/prohibition snippets (matched by `type === 'human-review'` combined with prohibition keywords in their text) are flagged with a visible "PROHIBITION" badge so Australia's statutory ban is unmistakable.

**Files:**
- Create: `src/dashboard/PanelMenu.tsx`

- [ ] **Step 1: Write the component**

`src/dashboard/PanelMenu.tsx`:

```tsx
import { useState } from 'react';
import type { CountryCorpus, RegionData, SourceSnippet } from '../types';
import { PANELS, groupFactsByCategory } from './panelCategories';
import { Panel } from './Panel';

export interface PanelMenuProps {
  region: RegionData;
  corpus: CountryCorpus | undefined;
}

/** Heuristic: does this source describe a ban/prohibition? */
function isProhibition(source: SourceSnippet): boolean {
  const haystack = `${source.title} ${source.text}`.toLowerCase();
  return /prohibit|ban|must not|forbidden|not permit/.test(haystack);
}

export function PanelMenu({ region, corpus }: PanelMenuProps) {
  const [expandedFactId, setExpandedFactId] = useState<string | null>(null);
  const grouped = groupFactsByCategory(region.facts);

  const toggle = (factId: string) =>
    setExpandedFactId((current) => (current === factId ? null : factId));

  const legalSources = corpus?.sources ?? [];

  return (
    <div className="dash-menu" data-testid="panel-menu">
      {PANELS.map((panel) => {
        const extraItems =
          panel.key === 'legal'
            ? legalSources.map((source) => {
                const isOpen = expandedFactId === source.id;
                const banned = isProhibition(source);
                return (
                  <li
                    key={source.id}
                    className="dash-item dash-item--legal"
                    data-fact-id={source.id}
                    data-prohibition={banned ? 'true' : 'false'}
                  >
                    <button
                      type="button"
                      className="dash-item__header"
                      aria-expanded={isOpen}
                      onClick={() => toggle(source.id)}
                    >
                      <span className="dash-item__label">
                        {banned && (
                          <span className="dash-badge dash-badge--ban" data-testid="ban-badge">
                            PROHIBITION
                          </span>
                        )}
                        {source.title}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="dash-item__detail" data-testid="fact-detail">
                        <p className="dash-item__detail-text">{source.text}</p>
                        <p className="dash-item__confidence">
                          {source.type === 'human-review' ? 'Requires human review' : 'Computable'}{' '}
                          · Confidence: {source.confidence}
                        </p>
                        <div className="dash-citation" data-testid="fact-citation">
                          <span className="dash-citation__title">{source.title}</span>
                          <span className="dash-citation__cite">
                            {source.citation} ({source.year})
                          </span>
                          <a
                            className="dash-citation__link"
                            href={source.url}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            Source
                          </a>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })
            : undefined;

        return (
          <Panel
            key={panel.key}
            panelKey={panel.key}
            title={panel.title}
            facts={grouped[panel.key]}
            corpus={corpus}
            expandedFactId={expandedFactId}
            onToggleFact={toggle}
            extraItems={extraItems}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check the component compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/dashboard/PanelMenu.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/dashboard/PanelMenu.tsx
git commit -m "feat(F4): add PanelMenu with expand state and legal/ban surfacing"
```

---

### Task 5: `Dashboard` component + CSS — floating container, limited-data state, Add-plant button

The top-level F4 component. Looks up `RegionData` via `getRegionData` and `CountryCorpus` via `getCountryCorpus`. If no region resolves OR `hasRichData === false`, renders the clean limited-data state. Otherwise renders `PanelMenu`. Always renders (when a region is selected) the "Add plant" button wired to `onAddPlant`.

**Files:**
- Create: `src/dashboard/Dashboard.tsx`
- Create: `src/dashboard/dashboard.css`

- [ ] **Step 1: Write the component**

`src/dashboard/Dashboard.tsx`:

```tsx
import './dashboard.css';
import { getCountryCorpus, getRegionData } from '../data/loadCorpus';
import { PanelMenu } from './PanelMenu';

export interface DashboardProps {
  country: string;
  regionId: string;
  onAddPlant: () => void;
}

export function Dashboard({ country, regionId, onAddPlant }: DashboardProps) {
  const region = getRegionData(country, regionId);
  const corpus = getCountryCorpus(country);

  const limited = !region || region.hasRichData === false;
  const regionName = region?.regionName ?? regionId;

  return (
    <aside className="dashboard" data-testid="dashboard">
      <header className="dashboard__header">
        <h2 className="dashboard__region">{regionName}</h2>
        <span className="dashboard__country">{corpus?.name ?? country}</span>
      </header>

      {limited ? (
        <div className="dashboard__limited" data-testid="limited-data">
          <p className="dashboard__limited-title">Limited data — screen-level only</p>
          <p className="dashboard__limited-body">
            This region is not richly modeled in the demo corpus. Select a flagship region
            for cited land, legal, hazard and pathway panels.
          </p>
        </div>
      ) : (
        <PanelMenu region={region} corpus={corpus} />
      )}

      <footer className="dashboard__footer">
        <button
          type="button"
          className="dashboard__add-plant"
          data-testid="add-plant"
          onClick={onAddPlant}
        >
          + Add plant
        </button>
      </footer>
    </aside>
  );
}
```

- [ ] **Step 2: Write the CSS**

`src/dashboard/dashboard.css`:

```css
.dashboard {
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 360px;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(12, 16, 24, 0.92);
  color: #e6edf3;
  border: 1px solid rgba(120, 160, 220, 0.25);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  font-family: system-ui, sans-serif;
  z-index: 10;
}

.dashboard__header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-bottom: 1px solid rgba(120, 160, 220, 0.2);
  padding-bottom: 8px;
}
.dashboard__region { margin: 0; font-size: 18px; }
.dashboard__country { font-size: 12px; opacity: 0.7; }

.dashboard__limited {
  padding: 12px;
  border: 1px dashed rgba(180, 180, 180, 0.4);
  border-radius: 8px;
}
.dashboard__limited-title { margin: 0 0 6px; font-weight: 600; }
.dashboard__limited-body { margin: 0; font-size: 13px; opacity: 0.8; }

.dash-menu { display: flex; flex-direction: column; gap: 10px; }
.dash-panel__title { margin: 0 0 4px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.75; }
.dash-panel__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }

.dash-item__header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  border: 1px solid rgba(120, 160, 220, 0.18);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
.dash-item__header:hover { background: rgba(255, 255, 255, 0.08); }
.dash-item__value { opacity: 0.75; }

.dash-item__detail {
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.4;
}
.dash-item__confidence { opacity: 0.65; font-size: 11px; }

.dash-citation { display: flex; flex-direction: column; gap: 2px; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(120, 160, 220, 0.18); }
.dash-citation__title { font-weight: 600; }
.dash-citation__cite { opacity: 0.8; }
.dash-citation__link { color: #6ea8ff; }
.dash-citation--missing { opacity: 0.6; }

.dash-badge--ban {
  display: inline-block;
  margin-right: 6px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #b3261e;
  border-radius: 4px;
}

.dashboard__footer { border-top: 1px solid rgba(120, 160, 220, 0.2); padding-top: 8px; }
.dashboard__add-plant {
  width: 100%;
  padding: 10px;
  background: #2b6cff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.dashboard__add-plant:hover { background: #1f57d6; }
```

- [ ] **Step 3: Type-check the component compiles**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/dashboard/Dashboard.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/dashboard/Dashboard.tsx src/dashboard/dashboard.css
git commit -m "feat(F4): add Dashboard floating container with limited-data state and Add-plant slot"
```

---

### Task 6: Playwright E2E — panel population, expand+citation, limited-data, Add-plant, Australia ban

Drives the Dashboard in a real browser. To isolate F4 from the globe (F2) and avoid depending on F2 selection wiring, the test mounts the Dashboard on a small harness route `/__f4` that renders `<Dashboard>` with `country`/`regionId` taken from URL query params and an `onAddPlant` that writes a marker into the DOM. Real F3 data is used (the data layer is a build dependency); the flagship region ids below MUST be replaced with the actual ids F3 chose for its USA flagship region and the Australia flagship region — see the harness comment.

**Files:**
- Create: `e2e/dashboard.spec.ts`
- Modify: `src/main.tsx` (add the `/__f4` test harness route — guarded so it does not affect the production golden path)

- [ ] **Step 1: Add the test harness route**

In `src/main.tsx`, add a minimal harness that renders the Dashboard when `window.location.pathname === '/__f4'`. This reads `country` and `regionId` from the query string and records Add-plant clicks in `#add-plant-fired`:

```tsx
// --- F4 E2E harness (renders only on the /__f4 path; production app unaffected) ---
import { Dashboard } from './dashboard/Dashboard';

function F4Harness() {
  const params = new URLSearchParams(window.location.search);
  const country = params.get('country') ?? '';
  const regionId = params.get('regionId') ?? '';
  const [fired, setFired] = useState(false);
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#05080f' }}>
      <Dashboard country={country} regionId={regionId} onAddPlant={() => setFired(true)} />
      {fired && <div id="add-plant-fired">fired</div>}
    </div>
  );
}

// In the render bootstrap, branch on the path:
//   const root = window.location.pathname === '/__f4' ? <F4Harness /> : <App />;
//   createRoot(document.getElementById('root')!).render(root);
```

> `useState` must be imported from `react` at the top of `main.tsx` if not already. Keep the existing `<App />` render for every other path.

- [ ] **Step 2: Write the E2E spec**

`e2e/dashboard.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

// NOTE: replace these ids with the actual flagship/limited region ids from F3.
// USA_FLAGSHIP must be a region where RegionData.hasRichData === true.
// AUS_FLAGSHIP must be the Australia flagship region whose corpus contains the
// EPBC/ARPANS statutory-ban source snippet.
// LIMITED must be any region id with no flagship data (hasRichData === false or no file).
const USA_FLAGSHIP = { country: 'USA', regionId: 'US-WY' };
const AUS_FLAGSHIP = { country: 'AUS', regionId: 'AU-SA' };
const LIMITED = { country: 'USA', regionId: 'US-RI' };

function harnessUrl(sel: { country: string; regionId: string }): string {
  return `/__f4?country=${sel.country}&regionId=${sel.regionId}`;
}

test('flagship region populates the four cited panels', async ({ page }) => {
  await page.goto(harnessUrl(USA_FLAGSHIP));
  await expect(page.getByTestId('dashboard')).toBeVisible();
  await expect(page.getByTestId('panel-menu')).toBeVisible();
  await expect(page.getByText('Land & Infrastructure')).toBeVisible();
  await expect(page.getByText('Legal / RulePack')).toBeVisible();
  await expect(page.getByText('Hazards & Cooling')).toBeVisible();
  await expect(page.getByText('Pathway Suitability')).toBeVisible();
  await expect(page.getByTestId('limited-data')).toHaveCount(0);
});

test('clicking a menu item expands detail and shows a citation link with a real url', async ({ page }) => {
  await page.goto(harnessUrl(USA_FLAGSHIP));
  // Click the first fact item in the Land panel.
  const firstItem = page.locator('[data-panel="land"] .dash-item__header').first();
  await firstItem.click();
  await expect(page.getByTestId('fact-detail').first()).toBeVisible();
  const citationLink = page.getByTestId('fact-citation').first().locator('a.dash-citation__link');
  await expect(citationLink).toBeVisible();
  const href = await citationLink.getAttribute('href');
  expect(href).toMatch(/^https?:\/\//);
});

test('a non-flagship region shows the limited-data state', async ({ page }) => {
  await page.goto(harnessUrl(LIMITED));
  await expect(page.getByTestId('limited-data')).toBeVisible();
  await expect(page.getByText('Limited data — screen-level only')).toBeVisible();
  await expect(page.getByTestId('panel-menu')).toHaveCount(0);
});

test('the Add-plant button fires onAddPlant', async ({ page }) => {
  await page.goto(harnessUrl(USA_FLAGSHIP));
  await expect(page.locator('#add-plant-fired')).toHaveCount(0);
  await page.getByTestId('add-plant').click();
  await expect(page.locator('#add-plant-fired')).toHaveText('fired');
});

test('Australia statutory ban is visible in the Legal panel', async ({ page }) => {
  await page.goto(harnessUrl(AUS_FLAGSHIP));
  const legalPanel = page.locator('[data-panel="legal"]');
  await expect(legalPanel).toBeVisible();
  // The prohibition badge must be present in the legal panel.
  await expect(legalPanel.getByTestId('ban-badge').first()).toBeVisible();
  // Expand the banned item and confirm a cited source link.
  const banItem = legalPanel.locator('[data-prohibition="true"] .dash-item__header').first();
  await banItem.click();
  await expect(legalPanel.getByTestId('fact-citation').first().locator('a')).toBeVisible();
  // The EPBC / ARPANS ban text should be referenced.
  await expect(legalPanel.getByText(/EPBC|ARPANS|prohibit|must not/i).first()).toBeVisible();
});
```

- [ ] **Step 3: Run the E2E suite**

Run: `npm run e2e -- e2e/dashboard.spec.ts`
Expected: 5 passed. (The dev server + proxy must be running per the project's Playlist `webServer` config from F1; if `npm run e2e` does not auto-start it, run `npm run dev` in another shell first.)

- [ ] **Step 4: Commit**

```bash
git add e2e/dashboard.spec.ts src/main.tsx
git commit -m "test(F4): add Playwright E2E for dashboard panels, citations, limited-data, ban, add-plant"
```

---

## End-to-end testing requirements

Verified by `e2e/dashboard.spec.ts` (Task 6), running against real F3 data (or an F3-supplied fixture if F3 exposes one) via the `/__f4` harness route:

1. **Flagship region populates panels** — navigating to a `hasRichData === true` region renders the `panel-menu` with all four panels: Land & Infrastructure, Legal / RulePack, Hazards & Cooling, Pathway Suitability. No limited-data state.
2. **Expand + citation link** — clicking a menu item reveals its `fact-detail` and a `fact-citation` block containing an `<a>` whose `href` matches `^https?://` (a real URL from the corpus).
3. **Limited-data state** — a non-flagship region renders the "Limited data — screen-level only" panel and NO `panel-menu`.
4. **Add-plant callback** — clicking the `add-plant` button fires `onAddPlant` (asserted via the harness's `#add-plant-fired` marker).
5. **Australia ban** — for the Australia flagship region, the Legal panel shows a `PROHIBITION` badge (`ban-badge`); expanding the banned item shows a cited source link and surfaces the EPBC/ARPANS statutory-ban text.

**Unit (Vitest)** coverage (Tasks 1–2): `groupFactsByCategory` routes the six `FactCategory` values into the correct UI panels and always returns all four keys; `resolveCitation` resolves known ids and returns `undefined` for missing id / unknown id / missing corpus.

Full-suite commands:
- Unit: `npx vitest run` — expected: all dashboard tests pass (10 in `panelCategories.test.ts`).
- E2E: `npm run e2e -- e2e/dashboard.spec.ts` — expected: 5 passed.

---

## Deviation note (read before Task 5 / Task 6)

This plan assumes F3 exports two synchronous, client-safe lookups from `src/data/loadCorpus`: `getRegionData(country, regionId): RegionData | undefined` and `getCountryCorpus(country): CountryCorpus | undefined`. The PRD §5 freezes only the server-side `loadCorpus()` seam (which throws `CorpusNotFoundError`), not the client lookups. If F3 instead exposes only the throwing `loadCorpus` or names the client lookups differently:

- **Why it matters:** the Dashboard must render synchronously on region selection and must degrade to the limited-data state when data is absent — it cannot let a thrown `CorpusNotFoundError` bubble into render.
- **How to use the different result:** wrap whatever F3 provides in a thin adapter inside `src/dashboard/` (e.g. `getRegionData = (c, r) => { try { return loadCorpus(c, r).region; } catch { return undefined; } }`), keeping the `RegionData | undefined` / `CountryCorpus | undefined` contract the components depend on unchanged. Surface the actual F3 export names back to the planning session rather than renaming F3's exports. Likewise, replace the placeholder region ids (`US-WY`, `AU-SA`, `US-RI`) in the E2E spec with the real flagship/limited ids F3 selected.
