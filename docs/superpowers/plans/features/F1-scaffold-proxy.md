# F1 — Scaffold, types, Node proxy, env wiring

**Goal:** Stand up a runnable skeleton. `npm run dev` serves a blank-but-mounted React app and a live Express proxy. `/api/analyze` and `/api/chat` return HTTP 501, `server/corpus.ts`'s `loadCorpus` throws `CorpusNotFoundError`, and `callModel` can reach OpenAI. `src/types.ts` holds the frozen LOCKED contracts. `src/api.ts` client wrappers exist and are unit-tested against a mocked `fetch`.

**Depends on:** none. (F2–F6 depend on this.)

> Execution sub-skill: `superpowers:subagent-driven-development`. Steps use checkbox (`- [ ]`) syntax. Real code in every code step — no placeholders.

---

## File structure

| File | Responsibility |
|------|----------------|
| `package.json` | Deps + scripts: `dev` (Vite ∥ Express via `concurrently`), `test` (Vitest), `e2e` (Playwright), `build`, `server`. |
| `tsconfig.json` | TS config for both browser (`src/`) and node (`server/`) sources. |
| `vite.config.ts` | Vite + React plugin; dev `/api` proxy → Express on `:8787`. |
| `vitest.config.ts` | Vitest unit config (`jsdom` env, globals). |
| `playwright.config.ts` | Playwright E2E config; `webServer` boots `npm run dev`. |
| `index.html` | Vite entry HTML mounting `#root`. |
| `src/main.tsx` | React DOM bootstrap rendering `<App/>`. |
| `src/App.tsx` | Shell composing layout + feature components (stubbed empty placeholders). |
| `src/types.ts` | **LOCKED** shared contracts (PRD §5), verbatim. |
| `src/api.ts` | `postAnalyze` / `postChat` fetch wrappers. |
| `src/api.test.ts` | Vitest unit tests for `postAnalyze`/`postChat` with mocked `fetch`. |
| `server/index.ts` | Express app: JSON middleware, mounts `/api/analyze` + `/api/chat`, listens on `PORT`. |
| `server/openai.ts` | OpenAI client init from `OPENAI_API_KEY`; `callModel(messages, opts?)` reading `OPENAI_MODEL`. |
| `server/openai.test.ts` | Vitest unit tests for `callModel` with mocked OpenAI client. |
| `server/corpus.ts` | `class CorpusNotFoundError` + STUB `loadCorpus` that always throws it (F3 implements real one). |
| `server/corpus.test.ts` | Vitest unit test asserting the stub throws `CorpusNotFoundError`. |
| `server/routes/analyze.ts` | STUB Express router → HTTP 501 (F5 implements). |
| `server/routes/chat.ts` | STUB Express router → HTTP 501 (F6 implements). |
| `e2e/smoke.spec.ts` | Playwright smoke: app loads, no console errors, `/api/*` probes return 501. |
| `.env` | Append `OPENAI_MODEL=gpt-5-mini` (file already exists with `OPENAI_API_KEY`). |
| `.gitignore` | Ignore `node_modules`, `dist`, test artifacts. |

---

## Interfaces consumed / produced

**Consumes:** none (root feature).

**Produces (other features import these):**
- All LOCKED types from `src/types.ts`: `SourceType`, `Confidence`, `Citation`, `SourceSnippet`, `CountryCorpus`, `FactCategory`, `RegionFact`, `RegionData`, `ReactorType`, `ReactorModel`, `Verdict`, `FrictionCategory`, `Pathway`, `MatrixRow`, `AnalysisResult`, `AnalyzeRequest`, `ChatMessage`, `ChatRequest`, `ChatResponse`.
- `server/corpus.ts`: `CorpusNotFoundError`, stub `loadCorpus(country, regionId)`.
- `server/openai.ts`: `callModel(messages, opts?)`, `openai` client.
- `src/api.ts`: `postAnalyze(req: AnalyzeRequest): Promise<AnalysisResult>`, `postChat(req: ChatRequest): Promise<ChatResponse>`.
- Stub routers `server/routes/analyze.ts`, `server/routes/chat.ts` (501) — replaced by F5/F6.
- Stub `src/App.tsx` shell — feature components slotted by F2/F4/F6.

---

### Task 1 — Initialize repo, package.json, install deps

- [ ] `git init` in the project root if not already a repo:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && git rev-parse --is-inside-work-tree 2>/dev/null || git init
  ```
- [ ] Create `package.json`:
  ```json
  {
    "name": "nuclear-site-intelligence-globe",
    "private": true,
    "version": "0.1.0",
    "type": "module",
    "scripts": {
      "dev": "concurrently -k -n vite,server -c cyan,magenta \"vite\" \"npm run server\"",
      "server": "tsx watch server/index.ts",
      "build": "tsc -b && vite build",
      "preview": "vite preview",
      "test": "vitest run",
      "test:watch": "vitest",
      "e2e": "playwright test"
    },
    "dependencies": {
      "express": "^4.19.2",
      "openai": "^4.67.0",
      "react": "^18.3.1",
      "react-dom": "^18.3.1"
    },
    "devDependencies": {
      "@playwright/test": "^1.47.0",
      "@types/express": "^4.17.21",
      "@types/node": "^20.14.0",
      "@types/react": "^18.3.3",
      "@types/react-dom": "^18.3.0",
      "@vitejs/plugin-react": "^4.3.1",
      "concurrently": "^8.2.2",
      "dotenv": "^16.4.5",
      "jsdom": "^25.0.0",
      "tsx": "^4.19.0",
      "typescript": "^5.5.4",
      "vite": "^5.4.0",
      "vitest": "^2.1.0"
    }
  }
  ```
- [ ] Install:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npm install
  ```
  Expected: `node_modules/` created, `package-lock.json` written, no `ERR!` lines.
- [ ] Install Playwright browser (Chromium only is enough for smoke):
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx playwright install chromium
  ```
  Expected: ends with a line confirming Chromium is installed (or already present).

---

### Task 2 — `.gitignore` and `.env` model var

- [ ] Create `.gitignore`:
  ```gitignore
  node_modules/
  dist/
  .env
  test-results/
  playwright-report/
  .DS_Store
  *.log
  ```
- [ ] Append `OPENAI_MODEL` to the existing `.env` (do NOT overwrite the existing `OPENAI_API_KEY` line):
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && grep -q '^OPENAI_MODEL=' .env || printf '\nOPENAI_MODEL=gpt-5-mini\n' >> .env
  ```
- [ ] Verify both keys present (values redacted):
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && grep -oE '^(OPENAI_API_KEY|OPENAI_MODEL)=' .env
  ```
  Expected:
  ```
  OPENAI_API_KEY=
  OPENAI_MODEL=
  ```

---

### Task 3 — TypeScript + Vite + Vitest + Playwright config

- [ ] Create `tsconfig.json` (covers both `src/` browser code and `server/` node code):
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "useDefineForClassFields": true,
      "lib": ["ES2022", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "moduleResolution": "Bundler",
      "esModuleInterop": true,
      "allowImportingTsExtensions": false,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "skipLibCheck": true,
      "types": ["node", "vitest/globals"]
    },
    "include": ["src", "server", "e2e", "*.config.ts"]
  }
  ```
- [ ] Create `vite.config.ts` — React plugin + `/api` proxy to Express on `:8787`:
  ```ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  });
  ```
- [ ] Create `vitest.config.ts`:
  ```ts
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'server/**/*.test.ts'],
    },
  });
  ```
- [ ] Create `playwright.config.ts` — boots `npm run dev` and points at the Vite URL:
  ```ts
  import { defineConfig } from '@playwright/test';

  export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    use: {
      baseURL: 'http://localhost:5173',
      trace: 'on-first-retry',
    },
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  });
  ```

---

### Task 4 — LOCKED types (`src/types.ts`)

> These are FROZEN per PRD §5. Copy VERBATIM. This file is owned by F1; F2–F6 import from it.

- [ ] Create `src/types.ts`:
  ```ts
  // ---- Citations & corpus ----
  export type SourceType = 'computable' | 'human-review';
  export type Confidence = 'high' | 'medium' | 'low';

  export interface Citation {
    id: string;            // stable, e.g. "us-nrc-10cfr100"
    title: string;
    citation: string;      // human-readable cite, e.g. "10 CFR Part 100"
    section?: string;
    year: number;
    url: string;
  }

  export interface SourceSnippet extends Citation {
    text: string;          // the quoted/paraphrased provision
    type: SourceType;
    confidence: Confidence;
  }

  export interface CountryCorpus {
    code: string;          // ISO alpha-3, e.g. "USA"
    name: string;
    regulator: string;     // e.g. "U.S. NRC"
    sources: SourceSnippet[];
  }

  // ---- Region facts ----
  export type FactCategory = 'land' | 'grid' | 'water' | 'hazard' | 'population' | 'pathway';

  export interface RegionFact {
    id: string;
    category: FactCategory;
    label: string;
    value: string;
    detail: string;
    citationId?: string;   // references a SourceSnippet.id or Citation.id
    confidence: Confidence;
  }

  export interface RegionData {
    country: string;       // ISO alpha-3
    regionId: string;      // admin-1 code from GeoJSON properties
    regionName: string;
    hasRichData: boolean;  // false => "limited data" state
    facts: RegionFact[];
  }

  // ---- Reactor catalog ----
  export type ReactorType = 'SMR' | 'large' | 'micro';

  export interface ReactorModel {
    id: string;            // e.g. "ge-bwrx-300"
    company: string;
    model: string;
    type: ReactorType;
    outputMW: number;
    footprintHectares: number;
    coolingOptions: string[];   // e.g. ["once-through","tower","dry"]
    waterNeeds: string;
    status: string;             // e.g. "Design certification in progress"
    citation: Citation;
  }

  // ---- Analysis ----
  export type Verdict = 'pass' | 'caution' | 'fail';
  export type FrictionCategory = 'grid' | 'cooling' | 'permits' | 'community' | 'logistics' | 'hazards';
  export type Pathway = 'greenfield' | 'coal-repower';

  export interface MatrixRow {
    constraint: string;
    verdict: Verdict;
    reason: string;
    citationIds: string[];
  }

  export interface AnalysisResult {
    matrix: MatrixRow[];
    frictionScores: Record<FrictionCategory, number>; // each 0..1
    confidence: Confidence;
    nextStudies: string[];
    notes: string;            // screen-level caveats
  }

  // ---- API request bodies ----
  export interface AnalyzeRequest {
    country: string;
    regionId: string;
    reactorId: string;
    pathway: Pathway;
    cooling: string;
  }

  export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
  export interface ChatRequest {
    country: string;
    regionId: string;
    question: string;
    history: ChatMessage[];
  }
  export interface ChatResponse { answer: string; citations: Citation[]; } // answer is markdown
  ```
- [ ] Typecheck the file compiles cleanly:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx tsc --noEmit
  ```
  Expected: no output, exit code 0. (Will fail only if other not-yet-created files are referenced — they are not yet, so this should pass once `src/types.ts` exists alone; re-run after Task 8.)

---

### Task 5 — `src/api.ts` client wrappers (TDD)

> Write the test first, watch it fail, then implement.

- [ ] Create the failing test `src/api.test.ts`:
  ```ts
  import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
  import { postAnalyze, postChat } from './api';
  import type { AnalyzeRequest, AnalysisResult, ChatRequest, ChatResponse } from './types';

  const analyzeReq: AnalyzeRequest = {
    country: 'USA',
    regionId: 'US-WY',
    reactorId: 'ge-bwrx-300',
    pathway: 'coal-repower',
    cooling: 'tower',
  };

  const analyzeResult: AnalysisResult = {
    matrix: [{ constraint: 'grid', verdict: 'pass', reason: 'ok', citationIds: ['x'] }],
    frictionScores: { grid: 0.2, cooling: 0.3, permits: 0.4, community: 0.1, logistics: 0.2, hazards: 0.1 },
    confidence: 'medium',
    nextStudies: ['seismic survey'],
    notes: 'screen-level only',
  };

  const chatReq: ChatRequest = {
    country: 'USA',
    regionId: 'US-WY',
    question: 'Is this feasible?',
    history: [],
  };

  const chatResp: ChatResponse = { answer: 'Maybe.', citations: [] };

  describe('postAnalyze', () => {
    beforeEach(() => { vi.restoreAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });

    it('POSTs JSON to /api/analyze and returns parsed AnalysisResult', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(analyzeResult), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const out = await postAnalyze(analyzeReq);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/analyze');
      expect(init.method).toBe('POST');
      expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
      expect(JSON.parse(init.body)).toEqual(analyzeReq);
      expect(out).toEqual(analyzeResult);
    });

    it('throws on non-2xx with the server error message', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'boom' }), { status: 500, headers: { 'Content-Type': 'application/json' } }),
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(postAnalyze(analyzeReq)).rejects.toThrow('boom');
    });
  });

  describe('postChat', () => {
    beforeEach(() => { vi.restoreAllMocks(); });
    afterEach(() => { vi.restoreAllMocks(); });

    it('POSTs JSON to /api/chat and returns parsed ChatResponse', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(chatResp), { status: 200, headers: { 'Content-Type': 'application/json' } }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const out = await postChat(chatReq);

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/chat');
      expect(JSON.parse(init.body)).toEqual(chatReq);
      expect(out).toEqual(chatResp);
    });
  });
  ```
- [ ] Run it and confirm it FAILS (module not found / not implemented):
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx vitest run src/api.test.ts
  ```
  Expected: failure — `Failed to resolve import "./api"` or similar.
- [ ] Implement `src/api.ts`:
  ```ts
  import type { AnalyzeRequest, AnalysisResult, ChatRequest, ChatResponse } from './types';

  async function postJson<TReq, TRes>(url: string, body: TReq): Promise<TRes> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      let message = `Request to ${url} failed with ${res.status}`;
      try {
        const data = (await res.json()) as { error?: string };
        if (data && typeof data.error === 'string') message = data.error;
      } catch {
        // non-JSON error body; keep default message
      }
      throw new Error(message);
    }
    return (await res.json()) as TRes;
  }

  export function postAnalyze(req: AnalyzeRequest): Promise<AnalysisResult> {
    return postJson<AnalyzeRequest, AnalysisResult>('/api/analyze', req);
  }

  export function postChat(req: ChatRequest): Promise<ChatResponse> {
    return postJson<ChatRequest, ChatResponse>('/api/chat', req);
  }
  ```
- [ ] Run again and confirm it PASSES:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx vitest run src/api.test.ts
  ```
  Expected: `3 passed`.

---

### Task 6 — React shell (`index.html`, `src/main.tsx`, `src/App.tsx`)

> `App.tsx` is the composing shell. F2/F4/F6 own the real Globe/Dashboard/Chat/Layout components; here we leave clearly-labeled empty placeholders so the app mounts without importing not-yet-created files.

- [ ] Create `index.html` in project root:
  ```html
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Nuclear Site Intelligence Globe</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```
- [ ] Create `src/main.tsx`:
  ```tsx
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import App from './App';

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  ```
- [ ] Create `src/App.tsx` (shell with placeholders — no imports of F2/F4/F6 files yet):
  ```tsx
  import React from 'react';

  // Shell composing the app layout. Feature components slot in here:
  //   F2 -> <Globe/>, F4 -> <Dashboard/>, F6 -> <Layout/> + <Chat/>.
  // Until then these are labeled empty placeholders so the app mounts cleanly.
  export default function App(): React.ReactElement {
    return (
      <div data-testid="app-shell" style={{ width: '100vw', height: '100vh', background: '#05070d', color: '#e6edf3' }}>
        <div data-testid="globe-slot" />
        <div data-testid="dashboard-slot" />
        <div data-testid="chat-slot" />
      </div>
    );
  }
  ```

---

### Task 7 — OpenAI client + `callModel` (TDD)

> `callModel` wraps the OpenAI SDK, reading the model from `OPENAI_MODEL` (default `gpt-5-mini`). Test mocks the SDK so no live calls run in CI.

- [ ] Create the failing test `server/openai.test.ts`:
  ```ts
  import { describe, it, expect, vi, beforeEach } from 'vitest';

  const createMock = vi.fn();

  vi.mock('openai', () => {
    return {
      default: class {
        chat = { completions: { create: createMock } };
      },
    };
  });

  describe('callModel', () => {
    beforeEach(() => {
      vi.resetModules();
      createMock.mockReset();
      process.env.OPENAI_API_KEY = 'test-key';
      delete process.env.OPENAI_MODEL;
    });

    it('sends messages and returns the assistant content', async () => {
      createMock.mockResolvedValue({ choices: [{ message: { content: 'hello world' } }] });
      const { callModel } = await import('./openai');

      const out = await callModel([{ role: 'user', content: 'hi' }]);

      expect(createMock).toHaveBeenCalledTimes(1);
      const arg = createMock.mock.calls[0][0];
      expect(arg.messages).toEqual([{ role: 'user', content: 'hi' }]);
      expect(out).toBe('hello world');
    });

    it('defaults the model to gpt-5-mini when OPENAI_MODEL is unset', async () => {
      createMock.mockResolvedValue({ choices: [{ message: { content: 'x' } }] });
      const { callModel } = await import('./openai');

      await callModel([{ role: 'user', content: 'hi' }]);

      expect(createMock.mock.calls[0][0].model).toBe('gpt-5-mini');
    });

    it('uses OPENAI_MODEL when set, and passes through opts', async () => {
      process.env.OPENAI_MODEL = 'gpt-test';
      createMock.mockResolvedValue({ choices: [{ message: { content: '{}' } }] });
      const { callModel } = await import('./openai');

      await callModel([{ role: 'user', content: 'hi' }], { temperature: 0, responseFormat: 'json' });

      const arg = createMock.mock.calls[0][0];
      expect(arg.model).toBe('gpt-test');
      expect(arg.temperature).toBe(0);
      expect(arg.response_format).toEqual({ type: 'json_object' });
    });

    it('returns empty string when the model returns no content', async () => {
      createMock.mockResolvedValue({ choices: [{ message: { content: null } }] });
      const { callModel } = await import('./openai');

      const out = await callModel([{ role: 'user', content: 'hi' }]);
      expect(out).toBe('');
    });
  });
  ```
- [ ] Run it and confirm it FAILS:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx vitest run server/openai.test.ts
  ```
  Expected: failure — cannot resolve `./openai`.
- [ ] Implement `server/openai.ts`:
  ```ts
  import 'dotenv/config';
  import OpenAI from 'openai';

  export interface ChatTurn {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  export interface CallModelOpts {
    temperature?: number;
    /** When 'json', requests a JSON-object response from the model. */
    responseFormat?: 'json' | 'text';
    maxTokens?: number;
  }

  export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  /**
   * Calls the configured chat model and returns the assistant message content.
   * Model is read from OPENAI_MODEL (default 'gpt-5-mini') at call time.
   */
  export async function callModel(messages: ChatTurn[], opts: CallModelOpts = {}): Promise<string> {
    const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
    const res = await openai.chat.completions.create({
      model,
      messages,
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      ...(opts.maxTokens !== undefined ? { max_tokens: opts.maxTokens } : {}),
      ...(opts.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}),
    });
    return res.choices[0]?.message?.content ?? '';
  }
  ```
- [ ] Run again and confirm it PASSES:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx vitest run server/openai.test.ts
  ```
  Expected: `4 passed`.

---

### Task 8 — Corpus seam stub + route stubs (TDD for corpus)

> `loadCorpus` is the integration seam. F1 ships ONLY the error class + a stub that always throws; F3 implements the real lookup. Route stubs return 501 until F5/F6.

- [ ] Create the failing test `server/corpus.test.ts`:
  ```ts
  import { describe, it, expect } from 'vitest';
  import { loadCorpus, CorpusNotFoundError } from './corpus';

  describe('loadCorpus stub', () => {
    it('always throws CorpusNotFoundError (F3 implements the real lookup)', () => {
      expect(() => loadCorpus('USA', 'US-WY')).toThrow(CorpusNotFoundError);
    });

    it('error carries the requested country and regionId', () => {
      try {
        loadCorpus('AUS', 'AU-NT');
        throw new Error('expected throw');
      } catch (e) {
        expect(e).toBeInstanceOf(CorpusNotFoundError);
        const err = e as CorpusNotFoundError;
        expect(err.country).toBe('AUS');
        expect(err.regionId).toBe('AU-NT');
        expect(err.name).toBe('CorpusNotFoundError');
      }
    });
  });
  ```
- [ ] Run it and confirm it FAILS:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx vitest run server/corpus.test.ts
  ```
  Expected: failure — cannot resolve `./corpus`.
- [ ] Implement `server/corpus.ts` (stub — F3 replaces the body of `loadCorpus`):
  ```ts
  import type { CountryCorpus, RegionData } from '../src/types';

  export class CorpusNotFoundError extends Error {
    readonly country: string;
    readonly regionId: string;
    constructor(country: string, regionId: string) {
      super(`No corpus for country="${country}" region="${regionId}"`);
      this.name = 'CorpusNotFoundError';
      this.country = country;
      this.regionId = regionId;
    }
  }

  /**
   * INTEGRATION SEAM (frozen contract). The real Compliance RAG repo replaces
   * the body of this function. F1 ships a stub that always throws so callers
   * render the "limited data" state. F3 implements the real lookup.
   */
  export function loadCorpus(
    country: string,
    regionId: string,
  ): { country: CountryCorpus; region: RegionData } {
    throw new CorpusNotFoundError(country, regionId);
  }
  ```
- [ ] Run again and confirm it PASSES:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx vitest run server/corpus.test.ts
  ```
  Expected: `2 passed`.
- [ ] Create `server/routes/analyze.ts` (STUB → 501; F5 implements):
  ```ts
  import { Router } from 'express';

  // STUB router. F5 replaces this with the real /api/analyze handler
  // (loadCorpus -> build prompt -> callModel -> AnalysisResult).
  const router = Router();

  router.post('/', (_req, res) => {
    res.status(501).json({ error: 'Not implemented: /api/analyze (Feature F5)' });
  });

  export default router;
  ```
- [ ] Create `server/routes/chat.ts` (STUB → 501; F6 implements):
  ```ts
  import { Router } from 'express';

  // STUB router. F6 replaces this with the real /api/chat handler
  // (loadCorpus -> build prompt -> callModel -> ChatResponse).
  const router = Router();

  router.post('/', (_req, res) => {
    res.status(501).json({ error: 'Not implemented: /api/chat (Feature F6)' });
  });

  export default router;
  ```

---

### Task 9 — Express server (`server/index.ts`)

- [ ] Create `server/index.ts`:
  ```ts
  import 'dotenv/config';
  import express from 'express';
  import analyzeRouter from './routes/analyze';
  import chatRouter from './routes/chat';

  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, model: process.env.OPENAI_MODEL || 'gpt-5-mini' });
  });

  app.use('/api/analyze', analyzeRouter);
  app.use('/api/chat', chatRouter);

  const PORT = Number(process.env.PORT) || 8787;
  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });

  export default app;
  ```
- [ ] Full typecheck now that all files exist:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npx tsc --noEmit
  ```
  Expected: no output, exit code 0.
- [ ] Run the full unit suite:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npm test
  ```
  Expected: 3 test files pass (`api.test.ts`, `openai.test.ts`, `corpus.test.ts`), `9 passed` total.

---

### Task 10 — Boot `npm run dev` and verify the proxy + 501 routes

- [ ] Start dev (Vite + Express via concurrently) in the background:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npm run dev
  ```
  Expected: log lines `[server] listening on http://localhost:8787` and Vite `Local: http://localhost:5173/`.
- [ ] Verify Vite serves the app shell (mounted `#root`):
  ```bash
  curl -s http://localhost:5173/ | grep -o 'id="root"'
  ```
  Expected: `id="root"`.
- [ ] Verify the `/api` proxy reaches Express (health):
  ```bash
  curl -s http://localhost:5173/api/health
  ```
  Expected JSON: `{"ok":true,"model":"gpt-5-mini"}`.
- [ ] Verify `/api/analyze` returns 501 through the proxy:
  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:5173/api/analyze -H 'Content-Type: application/json' -d '{}'
  ```
  Expected: `501`.
- [ ] Verify `/api/chat` returns 501 through the proxy:
  ```bash
  curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:5173/api/chat -H 'Content-Type: application/json' -d '{}'
  ```
  Expected: `501`.
- [ ] Stop the dev server (Ctrl-C / kill the process group).

---

## End-to-end testing requirements

Playwright smoke test verifying the skeleton is alive. The `webServer` in `playwright.config.ts` boots `npm run dev` automatically.

- [ ] Create `e2e/smoke.spec.ts`:
  ```ts
  import { test, expect, request } from '@playwright/test';

  test('app shell loads at the dev URL with no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/');
    await expect(page.getByTestId('app-shell')).toBeVisible();
    await expect(page.getByTestId('globe-slot')).toBeAttached();

    expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
  });

  test('proxied /api/health returns ok and the configured model', async () => {
    const ctx = await request.newContext({ baseURL: 'http://localhost:5173' });
    const res = await ctx.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    await ctx.dispose();
  });

  test('POST /api/analyze and /api/chat return 501 until F5/F6 implement them', async () => {
    const ctx = await request.newContext({ baseURL: 'http://localhost:5173' });

    const analyze = await ctx.post('/api/analyze', { data: {} });
    expect(analyze.status()).toBe(501);

    const chat = await ctx.post('/api/chat', { data: {} });
    expect(chat.status()).toBe(501);

    await ctx.dispose();
  });
  ```
- [ ] Run the smoke suite:
  ```bash
  cd /mnt/c/Users/brenn/Documents/fairy_dust && npm run e2e
  ```
  Expected: `3 passed`.

**Notes for later features:**
- LLM endpoints (`/api/analyze`, `/api/chat`) are **mocked in E2E** in F5/F6 — deterministic fixtures via Playwright route interception or a test-mode flag on the server, so the golden-path and Australia-ban E2E scenarios never depend on live OpenAI. One optional **live** smoke test is gated behind an env flag (per PRD §9).
- `callModel`'s live reachability is covered by `/api/health` (config) here; an actual live OpenAI round-trip is intentionally NOT asserted in CI to keep the suite hermetic.

---

## Definition of done (F1)

- [ ] `npm test` green (api/openai/corpus unit tests).
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run dev` serves the mounted React shell on `:5173` and Express on `:8787`; `/api` proxy works.
- [ ] `/api/analyze` + `/api/chat` return 501; `loadCorpus` throws `CorpusNotFoundError`.
- [ ] `npm run e2e` green (smoke).
- [ ] `.env` has both `OPENAI_API_KEY` (pre-existing) and `OPENAI_MODEL=gpt-5-mini`.
- [ ] `src/types.ts` contains the LOCKED contracts verbatim.
