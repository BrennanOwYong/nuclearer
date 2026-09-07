# F5 — Add-plant flow + `/api/analyze` structured analysis

> **Parent PRD:** `docs/superpowers/plans/2026-05-27-nuclear-globe-PRD.md` (LOCKED contracts §5, guardrails §8, testing §9)
> **REQUIRED SUB-SKILL for execution:** `superpowers:subagent-driven-development`. Steps use checkbox (`- [ ]`) syntax.

## Goal

Implement the end-to-end "Add plant" experience: a stepper UI (company → reactor model → pathway → cooling option → Run analysis) that calls `POST /api/analyze`, plus the backend route that loads the cited corpus, builds a guardrailed prompt, calls the model for JSON, and normalizes the response into a `AnalysisResult`. Render that result as a cited pass/caution/fail matrix, friction-score bars per `FrictionCategory`, confidence, next studies, and screen-level notes.

**Dependency note — depends on: F3, F4.**
- **F3** provides `getReactors()` (reactor catalog, imported from `src/data/index.ts` — client-safe, synchronous, non-throwing) and `loadCorpus(country, regionId)` (via `server/corpus.ts`, throwing `CorpusNotFoundError`).
- **F4** owns the Dashboard, which renders this feature's `AddPlant` via its `onAddPlant` slot. F5 does **not** create globe/chat/dashboard-panel files.
- **F1** provides `callModel(messages: ChatMessage[], opts?): Promise<string>` (OpenAI wrapper) and the frozen `src/types.ts`. F1's `server/routes/analyze.ts` 501 stub is **replaced** by this feature.

**Expanded reactor catalog (LOCKED `ReactorModel` additions):** `ReactorModel` now carries `technology: ReactorTechnology` (`'PWR' | 'BWR' | 'iPWR' | 'HTGR' | 'SFR' | 'MSR' | 'microreactor'`) and `companyUrl: string`. The `AddPlant` stepper gains a leading **technology-family** step, then groups by company; the confirm step surfaces the model's `companyUrl` link and its spec `citation`.

**Frozen seams (pinned — these override any assumptions below):**
- `getReactors()` is imported from `src/data/index.ts`. It is **client-safe, synchronous, and non-throwing** — no client re-export shim is needed; `AddPlant.tsx` imports it directly.
- `callModel(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string>`. The route calls it with `{ json: true }` and parses the returned string.
- **Citation extraction (shared with `/api/chat`):** the model emits inline `[source-id]` tokens in its `reason` text. The route derives `MatrixRow.citationIds` by matching those tokens against corpus source ids and dropping non-matches. This lives in a shared helper `extractCitationIds(text, validIds)` in `server/citations.ts` so `/api/chat` (F6) reuses it.

## File structure

| Path | Owner | Action | Purpose |
|------|-------|--------|---------|
| `src/dashboard/AddPlant.tsx` | **F5** | create | Stepper: company → model → pathway → cooling → Run analysis; calls `postAnalyze`. |
| `src/dashboard/AnalysisReport.tsx` | **F5** | create | Renders an `AnalysisResult`: matrix, friction bars, confidence, next studies, notes. |
| `server/routes/analyze.ts` | **F5** | replace (F1 501 stub) | Express handler: `loadCorpus` → `buildAnalyzePrompt` → `callModel` → `parseAndNormalizeAnalysis` → 200; 404 on `CorpusNotFoundError`. |
| `server/prompts/analyze.ts` | **F5** | create | `buildAnalyzePrompt(corpus, region, reactor, pathway, cooling)` → guardrailed prompt messages. |
| `server/analyze.ts` | **F5** | create | `parseAndNormalizeAnalysis(raw, corpus)` → `AnalysisResult` (clamp friction 0..1, validate enums, derive citationIds from inline tokens). |
| `server/citations.ts` | **F5** | create | `extractCitationIds(text, validIds)` — shared inline-`[source-id]` extractor (reused by F6 `/api/chat`). |
| `server/citations.test.ts` | **F5** | create | Vitest unit tests for `extractCitationIds`. |
| `server/analyze.test.ts` | **F5** | create | Vitest unit tests for `parseAndNormalizeAnalysis`. |
| `server/prompts/analyze.test.ts` | **F5** | create | Vitest unit tests for `buildAnalyzePrompt`. |
| `server/routes/analyze.test.ts` | **F5** | create | Vitest + supertest tests for the route (mocked `callModel` / `loadCorpus`). |
| `e2e/add-plant.spec.ts` | **F5** | create | Playwright E2E with mocked `/api/analyze`. |
| `src/data/index.ts` | F3 | import only | `getReactors(): ReactorModel[]` — client-safe, synchronous, non-throwing. |
| `src/api.ts` | F1 | import only | `postAnalyze(body: AnalyzeRequest): Promise<AnalysisResult>`. |
| `src/types.ts` | F1 | import only | LOCKED types (incl. `ReactorTechnology`, `ReactorModel.technology`, `ReactorModel.companyUrl`). |

## Interfaces consumed / produced

**Consumed:**
- `AnalyzeRequest` (LOCKED, `src/types.ts`) — request body shape.
- `loadCorpus(country, regionId): { country: CountryCorpus; region: RegionData }` (F3, `server/corpus.ts`) — throws `CorpusNotFoundError` when data absent.
- `callModel(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string>` (F1) — OpenAI wrapper returning raw model text; called with `{ json: true }`.
- `getReactors(): ReactorModel[]` (F3, `src/data/index.ts`) — client-safe, synchronous, non-throwing reactor catalog for the stepper.
- `postAnalyze(body: AnalyzeRequest): Promise<AnalysisResult>` (F1, `src/api.ts`) — client fetch wrapper.

**Produced:**
- `POST /api/analyze` body `AnalyzeRequest` → `AnalysisResult` (200) / `{ error }` (404 on corpus-not-found, 500 on parse failure).
- `parseAndNormalizeAnalysis(raw, corpus): AnalysisResult` — pure normalizer; derives `citationIds` from inline tokens via `extractCitationIds`.
- `extractCitationIds(text, validIds): string[]` (`server/citations.ts`) — shared inline-`[source-id]` extractor; reused by F6 `/api/chat`.
- `buildAnalyzePrompt(corpus, region, reactor, pathway, cooling): ChatMessageInput[]` — guardrailed prompt builder.
- React `AddPlant` and `AnalysisReport` components.

**Frozen seams (pinned — no longer assumptions):**

```ts
// server/corpus.ts (F3)
export class CorpusNotFoundError extends Error {}
export function loadCorpus(country: string, regionId: string): {
  country: import('../src/types').CountryCorpus;
  region: import('../src/types').RegionData;
};

// server/model.ts (F1) — ChatMessage is the LOCKED type from src/types.ts
export function callModel(
  messages: import('../src/types').ChatMessage[],
  opts?: { json?: boolean },
): Promise<string>;

// src/data/index.ts (F3) — client-safe, synchronous, non-throwing
export function getReactors(): import('../types').ReactorModel[];
```

> **Note on `ChatMessage`:** `buildAnalyzePrompt` returns `ChatMessage[]` (the LOCKED `{ role, content }` type) so it feeds `callModel` directly. The prompt uses `role: 'system'` and `role: 'user'` — both valid `ChatMessage` roles.

---

### Task 1 — `extractCitationIds`: shared inline-token extractor (Vitest TDD)

Pure helper shared with F6's `/api/chat`. The model emits inline `[source-id]` tokens inside prose (a `reason` string, or a chat answer). This function scans the text for `[...]` tokens, keeps only those whose inner id exists in `validIds`, de-duplicates while preserving first-seen order, and drops non-matches.

- [ ] Write `server/citations.test.ts` first (RED):

```ts
import { describe, it, expect } from 'vitest';
import { extractCitationIds } from './citations';

const valid = new Set(['au-epbc-140a', 'us-nrc-10cfr100', 'us-clean-water-act']);

describe('extractCitationIds', () => {
  it('extracts a single matching token', () => {
    expect(extractCitationIds('Banned by federal law [au-epbc-140a].', valid))
      .toEqual(['au-epbc-140a']);
  });

  it('extracts multiple tokens preserving first-seen order', () => {
    expect(extractCitationIds('See [us-nrc-10cfr100] and [us-clean-water-act].', valid))
      .toEqual(['us-nrc-10cfr100', 'us-clean-water-act']);
  });

  it('drops tokens that are not in validIds', () => {
    expect(extractCitationIds('Per [made-up-source] and [au-epbc-140a].', valid))
      .toEqual(['au-epbc-140a']);
  });

  it('de-duplicates repeated tokens', () => {
    expect(extractCitationIds('[au-epbc-140a] ... again [au-epbc-140a].', valid))
      .toEqual(['au-epbc-140a']);
  });

  it('trims whitespace inside the brackets', () => {
    expect(extractCitationIds('cite [ au-epbc-140a ] here', valid))
      .toEqual(['au-epbc-140a']);
  });

  it('returns an empty array when there are no tokens', () => {
    expect(extractCitationIds('No citations here.', valid)).toEqual([]);
    expect(extractCitationIds('', valid)).toEqual([]);
  });

  it('accepts an array of valid ids as well as a Set', () => {
    expect(extractCitationIds('[us-nrc-10cfr100]', ['us-nrc-10cfr100']))
      .toEqual(['us-nrc-10cfr100']);
  });
});
```

- [ ] Run `npx vitest run server/citations.test.ts` — expect FAIL: `Cannot find module './citations'`.
- [ ] Implement `server/citations.ts` (GREEN):

```ts
/**
 * Extracts inline [source-id] citation tokens from model prose, keeping only
 * ids that exist in `validIds`. De-duplicates, preserves first-seen order.
 * Shared by /api/analyze (per matrix-row reason) and /api/chat (whole answer).
 */
export function extractCitationIds(
  text: string,
  validIds: Set<string> | string[],
): string[] {
  const valid = validIds instanceof Set ? validIds : new Set(validIds);
  const seen = new Set<string>();
  const out: string[] = [];
  const re = /\[([^[\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const id = m[1].trim();
    if (valid.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}
```

- [ ] Run `npx vitest run server/citations.test.ts` — expect: `Tests  7 passed`.

---

### Task 2 — `parseAndNormalizeAnalysis`: clamping, enum validation, inline-token citation derivation (Vitest TDD)

Pure function. Takes raw model output (string or parsed object) plus the corpus, and returns a validated `AnalysisResult`. It must:
clamp every `frictionScore` to `0..1`; guarantee all six `FrictionCategory` keys exist (missing → `0`); validate `verdict` is one of `pass|caution|fail` (drop rows with invalid verdicts); validate `confidence` is one of `high|medium|low` (default `low`); **derive each row's `citationIds` by running `extractCitationIds` over its `reason` text** against the corpus ids. If the raw row also carries an explicit `citationIds` array, those are merged in but still filtered to corpus ids; a row with no valid citations is kept with an empty `citationIds`.

- [ ] Write `server/analyze.test.ts` first (RED):

```ts
import { describe, it, expect } from 'vitest';
import { parseAndNormalizeAnalysis } from './analyze';
import type { CountryCorpus, RegionData } from '../src/types';

const corpus: CountryCorpus = {
  code: 'USA',
  name: 'United States',
  regulator: 'U.S. NRC',
  sources: [
    { id: 'us-nrc-10cfr100', title: 'Reactor Site Criteria', citation: '10 CFR Part 100',
      year: 2023, url: 'https://example.gov/10cfr100', text: 'Siting criteria.',
      type: 'computable', confidence: 'high' },
    { id: 'us-clean-water-act', title: 'Clean Water Act §316(b)', citation: 'CWA 316(b)',
      year: 2014, url: 'https://example.gov/cwa316b', text: 'Cooling water intake.',
      type: 'human-review', confidence: 'medium' },
  ],
};
const region: RegionData = {
  country: 'USA', regionId: 'US-TX', regionName: 'Texas', hasRichData: true, facts: [],
};

const baseRaw = {
  matrix: [
    { constraint: 'Seismic siting', verdict: 'pass', reason: 'Stable craton per siting criteria [us-nrc-10cfr100].' },
  ],
  frictionScores: { grid: 0.3, cooling: 0.5, permits: 0.4, community: 0.2, logistics: 0.1, hazards: 0.2 },
  confidence: 'medium',
  nextStudies: ['Site geotechnical survey'],
  notes: 'Screen-level only.',
};

describe('parseAndNormalizeAnalysis', () => {
  it('accepts a JSON string and returns an AnalysisResult', () => {
    const result = parseAndNormalizeAnalysis(JSON.stringify(baseRaw), corpus);
    expect(result.matrix).toHaveLength(1);
    expect(result.matrix[0].verdict).toBe('pass');
    expect(result.confidence).toBe('medium');
    expect(result.notes).toBe('Screen-level only.');
  });

  it('derives citationIds from inline [source-id] tokens in the reason', () => {
    const result = parseAndNormalizeAnalysis(baseRaw, corpus);
    expect(result.matrix[0].citationIds).toEqual(['us-nrc-10cfr100']);
  });

  it('clamps friction scores above 1 down to 1 and below 0 up to 0', () => {
    const raw = { ...baseRaw, frictionScores: { ...baseRaw.frictionScores, grid: 1.7, cooling: -0.4 } };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(result.frictionScores.grid).toBe(1);
    expect(result.frictionScores.cooling).toBe(0);
  });

  it('fills missing friction categories with 0 and includes all six keys', () => {
    const raw = { ...baseRaw, frictionScores: { grid: 0.5 } };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(Object.keys(result.frictionScores).sort())
      .toEqual(['community', 'cooling', 'grid', 'hazards', 'logistics', 'permits']);
    expect(result.frictionScores.permits).toBe(0);
    expect(result.frictionScores.grid).toBe(0.5);
  });

  it('coerces non-numeric friction scores to 0', () => {
    const raw = { ...baseRaw, frictionScores: { ...baseRaw.frictionScores, grid: 'high' as unknown as number } };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(result.frictionScores.grid).toBe(0);
  });

  it('drops matrix rows with an invalid verdict enum', () => {
    const raw = { ...baseRaw, matrix: [
      ...baseRaw.matrix,
      { constraint: 'Bogus', verdict: 'maybe', reason: 'x [us-nrc-10cfr100]' },
    ] };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(result.matrix).toHaveLength(1);
    expect(result.matrix.every(r => ['pass', 'caution', 'fail'].includes(r.verdict))).toBe(true);
  });

  it('defaults an invalid confidence to "low"', () => {
    const raw = { ...baseRaw, confidence: 'certain' };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(result.confidence).toBe('low');
  });

  it('ignores inline tokens that do not match a corpus id, keeping valid ones', () => {
    const raw = { ...baseRaw, matrix: [
      { constraint: 'Cooling', verdict: 'caution',
        reason: 'Intake permit [us-clean-water-act] and a fabricated [us-invented-source].' },
    ] };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(result.matrix[0].citationIds).toEqual(['us-clean-water-act']);
  });

  it('keeps a row even when no inline token matches the corpus (empty array)', () => {
    const raw = { ...baseRaw, matrix: [
      { constraint: 'Grid', verdict: 'fail', reason: 'No source [does-not-exist].' },
    ] };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(result.matrix).toHaveLength(1);
    expect(result.matrix[0].citationIds).toEqual([]);
  });

  it('merges an explicit citationIds array with inline tokens, filtered to corpus ids', () => {
    const raw = { ...baseRaw, matrix: [
      { constraint: 'Combo', verdict: 'pass',
        reason: 'Inline [us-nrc-10cfr100].', citationIds: ['us-clean-water-act', 'bogus'] },
    ] };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(result.matrix[0].citationIds.sort())
      .toEqual(['us-clean-water-act', 'us-nrc-10cfr100']);
  });

  it('throws when raw is not valid JSON', () => {
    expect(() => parseAndNormalizeAnalysis('{not json', corpus)).toThrow();
  });

  it('defaults nextStudies and notes to safe values when absent', () => {
    const raw = { matrix: [], frictionScores: {}, confidence: 'high' };
    const result = parseAndNormalizeAnalysis(raw, corpus);
    expect(result.nextStudies).toEqual([]);
    expect(typeof result.notes).toBe('string');
  });
});
```

- [ ] Run `npx vitest run server/analyze.test.ts` — expect FAIL: `Cannot find module './analyze'` (or `parseAndNormalizeAnalysis is not a function`). (Requires Task 1's `server/citations.ts` to exist.)
- [ ] Implement `server/analyze.ts` (GREEN):

```ts
import type {
  AnalysisResult, CountryCorpus, FrictionCategory, MatrixRow, Verdict, Confidence,
} from '../src/types';
import { extractCitationIds } from './citations';

const FRICTION_CATEGORIES: FrictionCategory[] =
  ['grid', 'cooling', 'permits', 'community', 'logistics', 'hazards'];
const VERDICTS: Verdict[] = ['pass', 'caution', 'fail'];
const CONFIDENCES: Confidence[] = ['high', 'medium', 'low'];

function clamp01(n: unknown): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return Math.min(1, Math.max(0, v));
}

export function parseAndNormalizeAnalysis(
  raw: string | Record<string, unknown>,
  corpus: CountryCorpus,
): AnalysisResult {
  const parsed: Record<string, unknown> =
    typeof raw === 'string' ? JSON.parse(raw) : raw;

  const validIds = new Set(corpus.sources.map(s => s.id));

  // Matrix: drop invalid verdicts; derive citationIds from inline [source-id]
  // tokens in the reason, merged with any explicit citationIds array, all
  // filtered to corpus ids and de-duplicated.
  const rawMatrix = Array.isArray(parsed.matrix) ? parsed.matrix : [];
  const matrix: MatrixRow[] = rawMatrix
    .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
    .filter(r => VERDICTS.includes(r.verdict as Verdict))
    .map(r => {
      const reason = String(r.reason ?? '');
      const inline = extractCitationIds(reason, validIds);
      const explicit = (Array.isArray(r.citationIds) ? r.citationIds : [])
        .map(String)
        .filter(id => validIds.has(id));
      const citationIds = Array.from(new Set([...inline, ...explicit]));
      return {
        constraint: String(r.constraint ?? ''),
        verdict: r.verdict as Verdict,
        reason,
        citationIds,
      };
    });

  // Friction scores: all six keys, clamped 0..1, non-numeric -> 0.
  const rawScores = (parsed.frictionScores ?? {}) as Record<string, unknown>;
  const frictionScores = FRICTION_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = clamp01(rawScores[cat]);
    return acc;
  }, {} as Record<FrictionCategory, number>);

  const confidence: Confidence =
    CONFIDENCES.includes(parsed.confidence as Confidence)
      ? (parsed.confidence as Confidence)
      : 'low';

  const nextStudies = Array.isArray(parsed.nextStudies)
    ? parsed.nextStudies.map(String)
    : [];

  const notes = typeof parsed.notes === 'string' ? parsed.notes : '';

  return { matrix, frictionScores, confidence, nextStudies, notes };
}
```

- [ ] Run `npx vitest run server/analyze.test.ts` — expect: `Test Files  1 passed`, `Tests  12 passed`.

---

### Task 3 — `buildAnalyzePrompt`: guardrails + corpus injection (Vitest TDD)

Builds the system + user messages. The **system** message must encode PRD §8 guardrails verbatim in intent (screen-level only; cite source id + year; separate computable vs human-review; attach confidence; never invent citations) and instruct JSON-only output matching `AnalysisResult`. The **user** message must inject the corpus source ids, the region facts, and the chosen reactor envelope + pathway + cooling.

- [ ] Write `server/prompts/analyze.test.ts` first (RED):

```ts
import { describe, it, expect } from 'vitest';
import { buildAnalyzePrompt } from './analyze';
import type { CountryCorpus, RegionData, ReactorModel } from '../../src/types';

const corpus: CountryCorpus = {
  code: 'AUS', name: 'Australia', regulator: 'ARPANSA',
  sources: [
    { id: 'au-epbc-140a', title: 'EPBC Act prohibition', citation: 'EPBC Act 1999 s.140A',
      section: 's.140A', year: 1999, url: 'https://example.gov.au/epbc',
      text: 'A nuclear power plant must not be approved.', type: 'computable', confidence: 'high' },
  ],
};
const region: RegionData = {
  country: 'AUS', regionId: 'AU-SA', regionName: 'South Australia', hasRichData: true,
  facts: [
    { id: 'au-sa-land', category: 'land', label: 'Land availability', value: 'Abundant',
      detail: 'Vast arid interior.', citationId: 'au-epbc-140a', confidence: 'medium' },
  ],
};
const reactor: ReactorModel = {
  id: 'ge-bwrx-300', company: 'GE-Hitachi', companyUrl: 'https://www.gevernova.com/nuclear',
  model: 'BWRX-300', type: 'SMR', technology: 'BWR',
  outputMW: 300, footprintHectares: 10, coolingOptions: ['tower', 'dry'],
  waterNeeds: 'Moderate', status: 'Licensing in progress',
  citation: { id: 'ge-bwrx-spec', title: 'BWRX-300 spec', citation: 'GEH BWRX-300',
    year: 2023, url: 'https://example.com/bwrx' },
};

describe('buildAnalyzePrompt', () => {
  const messages = buildAnalyzePrompt(corpus, region, reactor, 'greenfield', 'dry');
  const system = messages.find(m => m.role === 'system')!.content;
  const user = messages.find(m => m.role === 'user')!.content;

  it('returns a system and a user message', () => {
    expect(messages.map(m => m.role)).toEqual(['system', 'user']);
  });

  it('system prompt encodes screen-level-only guardrail', () => {
    expect(system.toLowerCase()).toContain('screen-level');
    expect(system.toLowerCase()).not.toMatch(/guarantee licensab/);
  });

  it('system prompt forbids inventing citations and requires source id + year', () => {
    expect(system.toLowerCase()).toContain('never invent');
    expect(system.toLowerCase()).toContain('year');
    expect(system.toLowerCase()).toContain('source id');
  });

  it('system prompt instructs the model to emit inline [source-id] tokens in reasons', () => {
    expect(system).toContain('[source-id]');
  });

  it('system prompt separates computable from human-review', () => {
    expect(system.toLowerCase()).toContain('computable');
    expect(system.toLowerCase()).toContain('human review');
  });

  it('system prompt requires confidence and JSON-only output', () => {
    expect(system.toLowerCase()).toContain('confidence');
    expect(system.toLowerCase()).toContain('json');
  });

  it('user prompt injects every corpus source id', () => {
    expect(user).toContain('au-epbc-140a');
    expect(user).toContain('1999');
  });

  it('user prompt injects region facts and the reactor envelope (incl. technology) + pathway + cooling', () => {
    expect(user).toContain('South Australia');
    expect(user).toContain('BWRX-300');
    expect(user).toContain('BWR');         // technology family
    expect(user).toContain('greenfield');
    expect(user).toContain('dry');
  });
});
```

- [ ] Run `npx vitest run server/prompts/analyze.test.ts` — expect FAIL: `Cannot find module './analyze'`.
- [ ] Implement `server/prompts/analyze.ts` (GREEN):

```ts
import type { CountryCorpus, RegionData, ReactorModel, Pathway, ChatMessage } from '../../src/types';

// Re-exported alias so callers can name the prompt message type if helpful.
// (ChatMessage is the LOCKED { role, content } type; system/user are both valid roles.)
export type ChatMessageInput = ChatMessage;

const SYSTEM_PROMPT = `You are a nuclear siting feasibility screener. You produce SCREEN-LEVEL analysis only.

Hard rules (do not violate):
- Screen-level only. Never say "licensable", "permit-approved", or "guaranteed". Use words like "screen-level indicates" or "warrants review".
- Every material claim must cite a source id + effective year drawn ONLY from the provided corpus.
- Cite by writing the source id inline in the "reason" text as a bracketed token, e.g. "...federal prohibition [au-epbc-140a].". Use ONLY ids listed in the corpus.
- Never invent citations or source ids. If the corpus lacks support for a claim, say so in the reason and omit the bracketed token.
- Separate computable facts from items that require human review; reflect this in confidence and notes.
- Attach an overall confidence ("high" | "medium" | "low").

Output ONLY a single JSON object, no prose, matching exactly this shape:
{
  "matrix": [{ "constraint": string, "verdict": "pass"|"caution"|"fail", "reason": string with inline [source-id] tokens }],
  "frictionScores": { "grid": number, "cooling": number, "permits": number, "community": number, "logistics": number, "hazards": number },
  "confidence": "high"|"medium"|"low",
  "nextStudies": string[],
  "notes": string
}
All frictionScores are 0..1.`;

export function buildAnalyzePrompt(
  corpus: CountryCorpus,
  region: RegionData,
  reactor: ReactorModel,
  pathway: Pathway,
  cooling: string,
): ChatMessage[] {
  const sourceLines = corpus.sources
    .map(s => `- [${s.id}] ${s.citation}${s.section ? ` ${s.section}` : ''} (${s.year}, ${s.type}, confidence: ${s.confidence}): ${s.text}`)
    .join('\n');

  const factLines = region.facts.length
    ? region.facts
        .map(f => `- (${f.category}) ${f.label}: ${f.value} — ${f.detail}${f.citationId ? ` [cite: ${f.citationId}]` : ''} (confidence: ${f.confidence})`)
        .join('\n')
    : '- (no rich region facts; treat as limited-data / screen-level only)';

  const user = `COUNTRY: ${corpus.name} (${corpus.code}), regulator ${corpus.regulator}
REGION: ${region.regionName} (${region.regionId})

CITED CORPUS (use only these source ids):
${sourceLines}

REGION FACTS:
${factLines}

REACTOR ENVELOPE:
- ${reactor.company} ${reactor.model} (${reactor.type}, technology ${reactor.technology}), ${reactor.outputMW} MW, footprint ${reactor.footprintHectares} ha
- cooling options: ${reactor.coolingOptions.join(', ')}; water needs: ${reactor.waterNeeds}; status: ${reactor.status}
- spec citation id: ${reactor.citation.id} (${reactor.citation.year}); vendor: ${reactor.companyUrl}

CHOSEN PARAMETERS:
- pathway: ${pathway}
- cooling: ${cooling}

Produce the screen-level feasibility analysis as the JSON object specified in the system prompt.`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: user },
  ];
}
```

- [ ] Run `npx vitest run server/prompts/analyze.test.ts` — expect: `Tests  8 passed`.

---

### Task 4 — Express route `POST /api/analyze` (Vitest + supertest, mocked `callModel` & `loadCorpus`)

The route replaces F1's 501 stub. It reads an `AnalyzeRequest`, looks up the reactor, calls `loadCorpus` (404 on `CorpusNotFoundError`), builds the prompt, calls `callModel(..., { json: true })`, normalizes, and responds 200 with the `AnalysisResult`. Parse/normalization failures → 500 `{ error }`.

- [ ] Write `server/routes/analyze.test.ts` first (RED):

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

// Mock the F1/F3 collaborators BEFORE importing the router.
vi.mock('../corpus', () => {
  class CorpusNotFoundError extends Error {}
  return {
    CorpusNotFoundError,
    loadCorpus: vi.fn(),
  };
});
vi.mock('../model', () => ({ callModel: vi.fn() }));
vi.mock('../../src/data', () => ({ getReactors: vi.fn() }));

import { loadCorpus, CorpusNotFoundError } from '../corpus';
import { callModel } from '../model';
import { getReactors } from '../../src/data';
import analyzeRouter from './analyze';

const reactor = {
  id: 'ge-bwrx-300', company: 'GE-Hitachi', companyUrl: 'https://www.gevernova.com/nuclear',
  model: 'BWRX-300', type: 'SMR' as const, technology: 'BWR' as const,
  outputMW: 300, footprintHectares: 10, coolingOptions: ['tower', 'dry'],
  waterNeeds: 'Moderate', status: 'Licensing in progress',
  citation: { id: 'ge-bwrx-spec', title: 'spec', citation: 'GEH', year: 2023, url: 'https://x' },
};
const corpus = {
  code: 'USA', name: 'United States', regulator: 'NRC',
  sources: [{ id: 'us-nrc-10cfr100', title: 't', citation: '10 CFR 100', year: 2023,
    url: 'https://x', text: 'x', type: 'computable' as const, confidence: 'high' as const }],
};
const region = { country: 'USA', regionId: 'US-TX', regionName: 'Texas', hasRichData: true, facts: [] };

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/analyze', analyzeRouter);
  return app;
}

const body = { country: 'USA', regionId: 'US-TX', reactorId: 'ge-bwrx-300',
  pathway: 'greenfield', cooling: 'dry' };

beforeEach(() => {
  vi.mocked(getReactors).mockReturnValue([reactor]);
  vi.mocked(loadCorpus).mockReturnValue({ country: corpus, region });
});

describe('POST /api/analyze', () => {
  it('returns 200 with a normalized AnalysisResult on the happy path', async () => {
    vi.mocked(callModel).mockResolvedValue(JSON.stringify({
      matrix: [{ constraint: 'Seismic', verdict: 'pass', reason: 'Stable site [us-nrc-10cfr100].' }],
      frictionScores: { grid: 1.4, cooling: 0.2, permits: 0.3, community: 0.1, logistics: 0.1, hazards: 0.1 },
      confidence: 'medium', nextStudies: ['geo survey'], notes: 'Screen-level only.',
    }));
    const res = await request(makeApp()).post('/api/analyze').send(body);
    expect(res.status).toBe(200);
    expect(res.body.matrix[0].verdict).toBe('pass');
    expect(res.body.matrix[0].citationIds).toEqual(['us-nrc-10cfr100']); // derived from inline token
    expect(res.body.frictionScores.grid).toBe(1); // clamped
    expect(callModel).toHaveBeenCalledWith(expect.any(Array), { json: true });
  });

  it('returns 404 when loadCorpus throws CorpusNotFoundError', async () => {
    vi.mocked(loadCorpus).mockImplementation(() => { throw new CorpusNotFoundError('no data'); });
    const res = await request(makeApp()).post('/api/analyze').send(body);
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 400 when the reactorId is unknown', async () => {
    const res = await request(makeApp()).post('/api/analyze').send({ ...body, reactorId: 'nope' });
    expect(res.status).toBe(400);
  });

  it('returns 500 when the model returns unparseable JSON', async () => {
    vi.mocked(callModel).mockResolvedValue('not json at all');
    const res = await request(makeApp()).post('/api/analyze').send(body);
    expect(res.status).toBe(500);
    expect(res.body.error).toBeTruthy();
  });
});
```

- [ ] Run `npx vitest run server/routes/analyze.test.ts` — expect FAIL (router still the 501 stub / default export shape mismatch).
- [ ] Implement `server/routes/analyze.ts` (GREEN), replacing the F1 501 stub:

```ts
import { Router, type Request, type Response } from 'express';
import type { AnalyzeRequest } from '../../src/types';
import { loadCorpus, CorpusNotFoundError } from '../corpus';
import { callModel } from '../model';
import { getReactors } from '../../src/data';
import { buildAnalyzePrompt } from '../prompts/analyze';
import { parseAndNormalizeAnalysis } from '../analyze';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { country, regionId, reactorId, pathway, cooling } = req.body as AnalyzeRequest;

  if (!country || !regionId || !reactorId || !pathway || !cooling) {
    return res.status(400).json({ error: 'Missing required fields in AnalyzeRequest.' });
  }

  const reactor = getReactors().find(r => r.id === reactorId);
  if (!reactor) {
    return res.status(400).json({ error: `Unknown reactorId: ${reactorId}` });
  }

  let corpus;
  let region;
  try {
    ({ country: corpus, region } = loadCorpus(country, regionId));
  } catch (err) {
    if (err instanceof CorpusNotFoundError) {
      return res.status(404).json({ error: `No corpus for ${country}/${regionId}` });
    }
    return res.status(500).json({ error: 'Corpus load failed.' });
  }

  try {
    const messages = buildAnalyzePrompt(corpus, region, reactor, pathway, cooling);
    const raw = await callModel(messages, { json: true });
    const result = parseAndNormalizeAnalysis(raw, corpus);
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: 'Analysis generation failed.' });
  }
});

export default router;
```

> If F1 already mounts `/api/analyze` in `server/index.ts` pointing at the old stub, confirm the mount imports this default-export router. The mount path is F1-owned; do not duplicate the mount.

- [ ] Run `npx vitest run server/routes/analyze.test.ts` — expect: `Tests  4 passed`.
- [ ] Run the full backend unit suite: `npx vitest run server/` — expect all F5 suites green (`citations`, `analyze`, `prompts/analyze`, `routes/analyze`).

---

### Task 5 — `AddPlant.tsx` stepper component (verified via E2E in Task 7)

A controlled multi-step form. Steps: (1) **technology-family** select (distinct `technology` values from `getReactors()`), (2) **company** select (companies that have a model in the chosen family), (3) **model** select (filtered to chosen family + company), then a **confirm step** showing the model's `companyUrl` link + its spec `citation`, (4) pathway radio (`greenfield` | `coal-repower`), (5) cooling select (from the chosen model's `coolingOptions`), then **Run analysis** which calls `postAnalyze` and lifts the result via `onResult`. Each downstream selection resets when an upstream one changes.

- [ ] Implement `src/dashboard/AddPlant.tsx`:

```tsx
import { useMemo, useState } from 'react';
import type {
  AnalysisResult, AnalyzeRequest, Pathway, ReactorModel, ReactorTechnology,
} from '../types';
import { postAnalyze } from '../api';
import { getReactors } from '../data';

interface AddPlantProps {
  country: string;
  regionId: string;
  onResult: (result: AnalysisResult) => void;
}

const PATHWAYS: Pathway[] = ['greenfield', 'coal-repower'];

export default function AddPlant({ country, regionId, onResult }: AddPlantProps) {
  const reactors = useMemo<ReactorModel[]>(() => getReactors(), []);

  const [technology, setTechnology] = useState<ReactorTechnology | ''>('');
  const [company, setCompany] = useState('');
  const [reactorId, setReactorId] = useState('');
  const [pathway, setPathway] = useState<Pathway>('greenfield');
  const [cooling, setCooling] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: distinct technology families present in the catalog.
  const technologies = useMemo<ReactorTechnology[]>(
    () => Array.from(new Set(reactors.map(r => r.technology))).sort(),
    [reactors],
  );

  // Step 2: companies that offer a model in the chosen family.
  const companies = useMemo(
    () => Array.from(
      new Set(reactors.filter(r => r.technology === technology).map(r => r.company)),
    ).sort(),
    [reactors, technology],
  );

  // Step 3: models matching family + company.
  const models = reactors.filter(r => r.technology === technology && r.company === company);
  const selectedModel = reactors.find(r => r.id === reactorId);

  function resetFrom(level: 'technology' | 'company' | 'model') {
    if (level === 'technology') { setCompany(''); setReactorId(''); setCooling(''); }
    if (level === 'company') { setReactorId(''); setCooling(''); }
    if (level === 'model') { setCooling(''); }
  }

  async function runAnalysis() {
    if (!reactorId || !cooling) return;
    setLoading(true);
    setError('');
    try {
      const body: AnalyzeRequest = { country, regionId, reactorId, pathway, cooling };
      const result = await postAnalyze(body);
      onResult(result);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-plant" data-testid="add-plant">
      <h3>Add plant</h3>

      <label>
        Technology family
        <select
          data-testid="technology-select"
          value={technology}
          onChange={e => { setTechnology(e.target.value as ReactorTechnology); resetFrom('technology'); }}
        >
          <option value="">Select a technology…</option>
          {technologies.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      {technology && (
        <label>
          Company
          <select
            data-testid="company-select"
            value={company}
            onChange={e => { setCompany(e.target.value); resetFrom('company'); }}
          >
            <option value="">Select a company…</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      )}

      {company && (
        <label>
          Model
          <select
            data-testid="model-select"
            value={reactorId}
            onChange={e => { setReactorId(e.target.value); resetFrom('model'); }}
          >
            <option value="">Select a model…</option>
            {models.map(m => <option key={m.id} value={m.id}>{m.model}</option>)}
          </select>
        </label>
      )}

      {selectedModel && (
        <div className="confirm-model" data-testid="confirm-model">
          <p>
            <strong>{selectedModel.company}</strong> {selectedModel.model} — {selectedModel.technology},{' '}
            {selectedModel.outputMW} MW, {selectedModel.status}
          </p>
          <p>
            Vendor:{' '}
            <a data-testid="company-url" href={selectedModel.companyUrl} target="_blank" rel="noreferrer">
              {selectedModel.companyUrl}
            </a>
          </p>
          <p>
            Spec source:{' '}
            <a data-testid="spec-citation" href={selectedModel.citation.url} target="_blank" rel="noreferrer">
              {selectedModel.citation.citation} ({selectedModel.citation.year})
            </a>
          </p>
        </div>
      )}

      {selectedModel && (
        <fieldset data-testid="pathway-group">
          <legend>Pathway</legend>
          {PATHWAYS.map(p => (
            <label key={p}>
              <input
                type="radio"
                name="pathway"
                value={p}
                checked={pathway === p}
                onChange={() => setPathway(p)}
              />
              {p}
            </label>
          ))}
        </fieldset>
      )}

      {selectedModel && (
        <label>
          Cooling
          <select
            data-testid="cooling-select"
            value={cooling}
            onChange={e => setCooling(e.target.value)}
          >
            <option value="">Select cooling…</option>
            {selectedModel.coolingOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      )}

      <button
        type="button"
        data-testid="run-analysis"
        disabled={!reactorId || !cooling || loading}
        onClick={runAnalysis}
      >
        {loading ? 'Running analysis…' : 'Run analysis'}
      </button>

      {error && <p role="alert" className="add-plant-error">{error}</p>}
    </div>
  );
}
```

> **`getReactors` import (pinned):** imported from `../data` (`src/data/index.ts`) — client-safe, synchronous, non-throwing. No re-export shim and no `server/` import.

---

### Task 6 — `AnalysisReport.tsx` renderer (verified via E2E in Task 7)

Renders an `AnalysisResult`: a matrix of pass/caution/fail rows with reasons + citation links, friction-score bars per `FrictionCategory` (width = `score * 100%`, clamped display so it never exceeds 100%), overall confidence, next-studies list, and screen-level notes.

- [ ] Implement `src/dashboard/AnalysisReport.tsx`:

```tsx
import type { AnalysisResult, CountryCorpus, FrictionCategory } from '../types';

interface AnalysisReportProps {
  result: AnalysisResult;
  // Optional corpus map so citation ids render as titled links; falls back to id text.
  citationIndex?: Record<string, { citation: string; url: string }>;
}

const FRICTION_ORDER: FrictionCategory[] =
  ['grid', 'cooling', 'permits', 'community', 'logistics', 'hazards'];

export default function AnalysisReport({ result, citationIndex = {} }: AnalysisReportProps) {
  return (
    <div className="analysis-report" data-testid="analysis-report">
      <h3>Feasibility analysis</h3>
      <p data-testid="analysis-confidence">Confidence: {result.confidence}</p>

      <table className="matrix" data-testid="analysis-matrix">
        <thead>
          <tr><th>Constraint</th><th>Verdict</th><th>Reason</th><th>Sources</th></tr>
        </thead>
        <tbody>
          {result.matrix.map((row, i) => (
            <tr key={i} data-testid="matrix-row" data-verdict={row.verdict}>
              <td>{row.constraint}</td>
              <td className={`verdict verdict-${row.verdict}`}>{row.verdict}</td>
              <td>{row.reason}</td>
              <td>
                {row.citationIds.map(id => {
                  const cite = citationIndex[id];
                  return cite
                    ? <a key={id} href={cite.url} target="_blank" rel="noreferrer">{cite.citation}</a>
                    : <span key={id} className="cite-id">{id}</span>;
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="friction" data-testid="friction-bars">
        <h4>Friction scores</h4>
        {FRICTION_ORDER.map(cat => {
          const score = result.frictionScores[cat] ?? 0;
          const pct = Math.min(100, Math.max(0, score * 100));
          return (
            <div key={cat} className="friction-row" data-testid={`friction-${cat}`}>
              <span className="friction-label">{cat}</span>
              <span className="friction-track">
                <span
                  className="friction-fill"
                  data-testid={`friction-fill-${cat}`}
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="friction-pct">{Math.round(pct)}%</span>
            </div>
          );
        })}
      </div>

      {result.nextStudies.length > 0 && (
        <div className="next-studies" data-testid="next-studies">
          <h4>Recommended next studies</h4>
          <ul>{result.nextStudies.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}

      <p className="notes" data-testid="analysis-notes">{result.notes}</p>
    </div>
  );
}

export type { CountryCorpus };
```

> F4's Dashboard wires `AddPlant`'s `onResult` to state and renders `<AnalysisReport result={...} />`. F5 exposes both as default exports; the Dashboard owns their placement (do not edit Dashboard files).

---

## End-to-end testing requirements

Playwright, with `/api/analyze` **mocked** via `page.route` returning a deterministic fixture so tests never hit live OpenAI. Cover the full add-plant flow, the Australia-ban fatal row, and the friction-bar clamp.

- [ ] Implement `e2e/add-plant.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import type { AnalysisResult } from '../src/types';

const usaResult: AnalysisResult = {
  matrix: [
    { constraint: 'Seismic siting', verdict: 'pass', reason: 'Stable craton.', citationIds: ['us-nrc-10cfr100'] },
    { constraint: 'Cooling water', verdict: 'caution', reason: 'Intake permit warrants review.', citationIds: ['us-clean-water-act'] },
  ],
  frictionScores: { grid: 0.3, cooling: 0.6, permits: 0.4, community: 0.2, logistics: 0.3, hazards: 0.2 },
  confidence: 'medium',
  nextStudies: ['Site geotechnical survey'],
  notes: 'Screen-level only; not a licensing determination.',
};

// Australia returns a fail row citing the statutory ban, plus an over-1 friction
// score to prove client-side clamping at the bar level.
const ausResult: AnalysisResult = {
  matrix: [
    { constraint: 'Statutory prohibition', verdict: 'fail', reason: 'Federal nuclear ban.', citationIds: ['au-epbc-140a'] },
  ],
  frictionScores: { grid: 0.9, cooling: 0.5, permits: 1, community: 0.4, logistics: 1, hazards: 0.3 },
  confidence: 'high',
  notes: 'Screen-level only; fatal statutory constraint.',
  nextStudies: [],
};

async function mockAnalyze(page, payload: AnalysisResult) {
  await page.route('**/api/analyze', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
  });
}

// Helper: drive the expanded stepper (technology -> company -> model -> pathway
// -> cooling) to the Run-analysis click.
async function runAddPlant(
  page, technology: string, company: string, modelLabel: string, pathway: string, cooling: string,
) {
  await page.getByTestId('add-plant').waitFor();
  await page.getByTestId('technology-select').selectOption(technology);
  await page.getByTestId('company-select').selectOption({ label: company });
  await page.getByTestId('model-select').selectOption({ label: modelLabel });
  await page.getByRole('radio', { name: pathway }).check();
  await page.getByTestId('cooling-select').selectOption(cooling);
  await page.getByTestId('run-analysis').click();
}

test.describe('Add-plant flow', () => {
  test('full flow (technology->company->model) renders a matrix, friction bars, and vendor link', async ({ page }) => {
    await mockAnalyze(page, usaResult);
    await page.goto('/');
    // F2/F4: select a USA flagship region to open the dashboard + Add plant.
    await page.getByTestId('region-US-TX').click();
    // Confirm step surfaces the vendor link + spec citation before running.
    await page.getByTestId('add-plant').waitFor();
    await page.getByTestId('technology-select').selectOption('BWR');
    await page.getByTestId('company-select').selectOption({ label: 'GE-Hitachi' });
    await page.getByTestId('model-select').selectOption({ label: 'BWRX-300' });
    await expect(page.getByTestId('confirm-model')).toBeVisible();
    await expect(page.getByTestId('company-url')).toHaveAttribute('href', /https?:\/\//);
    await expect(page.getByTestId('spec-citation')).toBeVisible();
    await page.getByRole('radio', { name: 'greenfield' }).check();
    await page.getByTestId('cooling-select').selectOption('dry');
    await page.getByTestId('run-analysis').click();

    await expect(page.getByTestId('analysis-report')).toBeVisible();
    await expect(page.getByTestId('matrix-row')).toHaveCount(2);
    await expect(page.getByTestId('friction-bars')).toBeVisible();
    await expect(page.getByTestId('analysis-confidence')).toContainText('medium');
  });

  test('Australia + any reactor yields a fail row citing the statutory ban', async ({ page }) => {
    await mockAnalyze(page, ausResult);
    await page.goto('/');
    await page.getByTestId('region-AU-SA').click();
    await runAddPlant(page, 'BWR', 'GE-Hitachi', 'BWRX-300', 'greenfield', 'dry');

    const failRow = page.locator('[data-testid="matrix-row"][data-verdict="fail"]');
    await expect(failRow).toHaveCount(1);
    await expect(failRow).toContainText('Statutory prohibition');
    await expect(failRow).toContainText('au-epbc-140a');
  });

  test('friction bars never exceed 100% even when the score is at/above 1', async ({ page }) => {
    await mockAnalyze(page, ausResult); // permits & logistics are 1.0
    await page.goto('/');
    await page.getByTestId('region-AU-SA').click();
    await runAddPlant(page, 'BWR', 'GE-Hitachi', 'BWRX-300', 'greenfield', 'dry');

    for (const cat of ['grid', 'cooling', 'permits', 'community', 'logistics', 'hazards']) {
      const width = await page.getByTestId(`friction-fill-${cat}`).evaluate(
        el => parseFloat((el as HTMLElement).style.width),
      );
      expect(width).toBeLessThanOrEqual(100);
    }
  });
});
```

- [ ] Run `npx playwright test e2e/add-plant.spec.ts` — expect: `3 passed`. (Region test ids `region-US-TX` / `region-AU-SA` are owned by F2/F4; confirm they match the globe's emitted `regionId`s and adjust the selectors if F2 uses different test-id conventions — surface any mismatch.)

### Optional live smoke test (env-gated)

- [ ] Add to `server/routes/analyze.test.ts` (or a dedicated `*.live.test.ts`) a test wrapped in `describe.runIf(process.env.RUN_LIVE_OPENAI === '1')` that hits the real `callModel` (no mock) for one USA case and asserts the response parses into a valid `AnalysisResult` (matrix is an array, all six friction keys present, confidence in the enum). Default (`RUN_LIVE_OPENAI` unset) → skipped.
- [ ] Verify default skip: `npx vitest run server/routes/analyze.test.ts` shows the live test as skipped; `RUN_LIVE_OPENAI=1 npx vitest run` runs it.

## Definition of done (F5)

- [ ] `npx vitest run server/citations.test.ts server/analyze.test.ts server/prompts/analyze.test.ts server/routes/analyze.test.ts` all green.
- [ ] `npx playwright test e2e/add-plant.spec.ts` green (3 tests).
- [ ] `server/routes/analyze.ts` no longer returns 501; F1's mount points at the new router.
- [ ] `AddPlant.tsx` stepper order is technology family → company → model → confirm (vendor link + spec citation) → pathway → cooling → Run; `getReactors` imported from `src/data`.
- [ ] No globe/chat/dashboard-panel files created or edited by F5.
