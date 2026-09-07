# F6 — Floating Chat + Dynamic Layout + /api/chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a floating, region-grounded chat assistant (backed by the Compliance RAG pipeline) plus a dynamic layout that shifts the globe+dashboard cluster left when chat opens, served by a real `POST /api/chat` endpoint replacing F1's 501 stub.

**Architecture:** A server prompt builder (`buildChatPrompt`) injects guardrails + the loaded corpus + chat history into the system/user messages; the Express route loads the corpus via `loadCorpus`, builds the prompt, calls `callModel`, and returns the LOCKED `ChatResponse`. On the frontend, a `useChat` reducer hook holds `ChatMessage[]` history and posts `ChatRequest` via `postChat`; `ChatPanel` renders markdown answers with clickable citation links; `Layout` lifts a `chatOpen` boolean that toggles a CSS class transitioning the centered cluster to a left-shifted position and feeds the Globe's `shifted` prop.

**Tech Stack:** React + TypeScript (Vite), `react-markdown` for answer rendering; Express + `openai` (mocked in unit tests); Vitest + Supertest for backend/hook units; Playwright (mocked `/api/chat`) for UI + layout E2E.

**Depends on:** F3 (data layer + `loadCorpus`, `CorpusNotFoundError`), F4 (Dashboard component to wrap). **Integrates:** F2 (Globe `shifted` prop). **Consumes from F1:** `callModel`, `src/types.ts`, `src/api.ts` `postChat`, route registration in `server/app.ts`.

---

## File structure

| File | Responsibility | Action |
|------|----------------|--------|
| `server/prompts/chat.ts` | `buildChatPrompt(corpus, region, question, history)` → `{ system, user }` messages with guardrails + corpus + history | Create |
| `server/prompts/chat.test.ts` | Vitest unit tests for `buildChatPrompt` (guardrails, corpus, history injection) | Create |
| `server/routes/chat.ts` | Express handler: `loadCorpus` → `buildChatPrompt` → `callModel` → `ChatResponse`; 404 on `CorpusNotFoundError` | Create (replaces F1's 501 stub) |
| `server/routes/chat.test.ts` | Supertest route tests with mocked `callModel` + `loadCorpus` (200 + 404) | Create |
| `src/chat/useChat.ts` | Reducer hook: holds `ChatMessage[]`, `send(question)` appends user then assistant message via `postChat` | Create |
| `src/chat/useChat.test.ts` | Vitest reducer tests (append user, append assistant, citations exposed) | Create |
| `src/chat/ChatPanel.tsx` | Floating panel: toggle button, message list (markdown + citation links), input box, "Compliance RAG pipeline" label | Create |
| `src/layout/Layout.tsx` | Dynamic-layout container: lifts `chatOpen`, wraps Globe + Dashboard cluster, toggles `shifted` CSS class + feeds Globe `shifted` prop, renders ChatPanel | Create |
| `src/layout/Layout.css` | Flex layout + `.shifted` transition styles | Create |
| `tests/e2e/chat-layout.spec.ts` | Playwright E2E (mocked `/api/chat`): open shifts cluster left, send renders markdown answer + citation link, close recenters, RAG label visible | Create |

---

## Interfaces consumed / produced

**Consumed (do NOT redefine — import VERBATIM):**

- From `src/types.ts` (F1): `ChatRequest`, `ChatResponse`, `ChatMessage`, `Citation`, `CountryCorpus`, `RegionData`, `SourceSnippet`.
- From `server/corpus.ts` (F3): `loadCorpus(country: string, regionId: string): { country: CountryCorpus; region: RegionData }` and `CorpusNotFoundError` (thrown when data absent).
- From `server/openai.ts` (F1): `callModel(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string>` — returns the model's text completion.
- From `src/api.ts` (F1): `postChat(req: ChatRequest): Promise<ChatResponse>`.
- From `src/Globe.tsx` (F2): `Globe` component accepting a `shifted: boolean` prop + `onRegionSelected` callback.
- From `src/Dashboard.tsx` (F4): `Dashboard` component.

> If `callModel`'s exact signature in F1 differs (e.g. it accepts a single prompt string rather than a message array), see the Deviation note at the end of Task 2 and adapt `buildChatPrompt`'s return shape to match — surface the mismatch rather than silently reshaping.

**Produced:**

- `POST /api/chat` endpoint: body `ChatRequest` → `ChatResponse` (200, `answer` is markdown) / `{ error: string }` (404 on `CorpusNotFoundError`, 400 on bad body, 500 otherwise).
- `buildChatPrompt(corpus, region, question, history)` (server prompt builder).
- `useChat()` hook, `ChatPanel` component, `Layout` component (the dynamic-layout container).

---

### Task 1: `buildChatPrompt` — guardrails + corpus + history injection

**Files:**
- Create: `server/prompts/chat.ts`
- Test: `server/prompts/chat.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// server/prompts/chat.test.ts
import { describe, it, expect } from 'vitest';
import { buildChatPrompt } from './chat';
import type { CountryCorpus, RegionData, ChatMessage } from '../../src/types';

const corpus: CountryCorpus = {
  code: 'AUS',
  name: 'Australia',
  regulator: 'ARPANSA',
  sources: [
    {
      id: 'aus-epbc-140a',
      title: 'EPBC Act 1999 s.140A',
      citation: 'EPBC Act 1999 s.140A',
      section: '140A',
      year: 1999,
      url: 'https://www.legislation.gov.au/Details/C2021C00182',
      text: 'The Minister must not approve a nuclear power plant.',
      type: 'human-review',
      confidence: 'high',
    },
  ],
};

const region: RegionData = {
  country: 'AUS',
  regionId: 'AU-SA',
  regionName: 'South Australia',
  hasRichData: true,
  facts: [
    {
      id: 'au-sa-land',
      category: 'land',
      label: 'Land availability',
      value: 'Abundant arid land',
      detail: 'Vast sparsely populated interior.',
      citationId: 'aus-epbc-140a',
      confidence: 'high',
    },
  ],
};

describe('buildChatPrompt', () => {
  it('injects guardrails into the system message', () => {
    const { system } = buildChatPrompt(corpus, region, 'Can I build here?', []);
    expect(system).toMatch(/screen-level/i);
    expect(system).toMatch(/never invent|do not invent/i);
    expect(system).toMatch(/source id/i);
    expect(system).toMatch(/year/i);
    expect(system).toMatch(/Compliance RAG/i);
  });

  it('injects the corpus sources (id + year) and region facts into the user message', () => {
    const { user } = buildChatPrompt(corpus, region, 'Can I build here?', []);
    expect(user).toContain('aus-epbc-140a');
    expect(user).toContain('1999');
    expect(user).toContain('South Australia');
    expect(user).toContain('Abundant arid land');
    expect(user).toContain('Can I build here?');
  });

  it('injects prior chat history transcript into the user message', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'What is the regulator?' },
      { role: 'assistant', content: 'ARPANSA [aus-epbc-140a].' },
    ];
    const { user } = buildChatPrompt(corpus, region, 'And the ban?', history);
    expect(user).toContain('What is the regulator?');
    expect(user).toContain('ARPANSA [aus-epbc-140a].');
    expect(user).toContain('And the ban?');
  });

  it('returns a system+user message pair', () => {
    const result = buildChatPrompt(corpus, region, 'q', []);
    expect(result).toHaveProperty('system');
    expect(result).toHaveProperty('user');
    expect(typeof result.system).toBe('string');
    expect(typeof result.user).toBe('string');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run server/prompts/chat.test.ts`
Expected: FAIL with "Failed to resolve import './chat'" / "buildChatPrompt is not a function".

- [ ] **Step 3: Write minimal implementation**

```ts
// server/prompts/chat.ts
import type { CountryCorpus, RegionData, ChatMessage } from '../../src/types';

export interface ChatPrompt {
  system: string;
  user: string;
}

const GUARDRAILS = `You are the chat assistant for a nuclear site-intelligence demo, backed by the Compliance RAG pipeline.

Follow these rules strictly:
- SCREEN-LEVEL ONLY. Never say a site is "licensable", "permit-approved", "approved", or "guaranteed". Frame everything as screen-level, preliminary findings that require human review.
- Every material claim MUST cite a source id and its effective year drawn from the PROVIDED CORPUS below, formatted inline as [source-id] (e.g. [aus-epbc-140a]).
- NEVER invent citations or sources. Only cite source ids that appear in the provided corpus.
- Separate computable facts from items that require human review.
- Attach a confidence level to material claims.
- If the corpus lacks support for a claim, say so plainly rather than guessing or inventing.
- Answer in concise Markdown.`;

function formatSources(corpus: CountryCorpus): string {
  return corpus.sources
    .map(
      (s) =>
        `- [${s.id}] ${s.title} — ${s.citation}${
          s.section ? ` §${s.section}` : ''
        } (${s.year}) [${s.type}, confidence: ${s.confidence}] ${s.url}\n  "${s.text}"`,
    )
    .join('\n');
}

function formatFacts(region: RegionData): string {
  if (!region.hasRichData || region.facts.length === 0) {
    return '(No rich data for this region — limited-data state. Say so if asked for specifics.)';
  }
  return region.facts
    .map(
      (f) =>
        `- (${f.category}) ${f.label}: ${f.value} — ${f.detail}${
          f.citationId ? ` [cite: ${f.citationId}]` : ''
        } (confidence: ${f.confidence})`,
    )
    .join('\n');
}

function formatHistory(history: ChatMessage[]): string {
  if (history.length === 0) return '(no prior messages)';
  return history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
}

export function buildChatPrompt(
  corpus: CountryCorpus,
  region: RegionData,
  question: string,
  history: ChatMessage[],
): ChatPrompt {
  const user = `COUNTRY: ${corpus.name} (${corpus.code}); regulator: ${corpus.regulator}
REGION: ${region.regionName} (${region.regionId})

CORPUS SOURCES (cite ONLY these ids):
${formatSources(corpus)}

REGION FACTS:
${formatFacts(region)}

CONVERSATION SO FAR:
${formatHistory(history)}

CURRENT QUESTION:
${question}`;

  return { system: GUARDRAILS, user };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run server/prompts/chat.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Commit**

```bash
git add server/prompts/chat.ts server/prompts/chat.test.ts
git commit -m "feat(F6): buildChatPrompt with guardrails, corpus, and history injection"
```

---

### Task 2: `POST /api/chat` Express route (Supertest, mocked callModel + loadCorpus)

**Files:**
- Create: `server/routes/chat.ts` (replaces F1's 501 stub)
- Test: `server/routes/chat.test.ts`
- Modify: `server/app.ts` (re-point `/api/chat` to the new router — see Step 5)

- [ ] **Step 1: Write the failing test**

```ts
// server/routes/chat.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock the corpus seam and the model caller BEFORE importing the router.
vi.mock('../corpus', () => {
  class CorpusNotFoundError extends Error {}
  return {
    CorpusNotFoundError,
    loadCorpus: vi.fn(),
  };
});
vi.mock('../openai', () => ({
  callModel: vi.fn(),
}));

import { loadCorpus, CorpusNotFoundError } from '../corpus';
import { callModel } from '../openai';
import { chatRouter } from './chat';

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/chat', chatRouter);
  return app;
}

const corpus = {
  code: 'USA',
  name: 'United States',
  regulator: 'U.S. NRC',
  sources: [
    {
      id: 'us-nrc-10cfr100',
      title: '10 CFR Part 100',
      citation: '10 CFR Part 100',
      year: 1962,
      url: 'https://www.nrc.gov/reading-rm/doc-collections/cfr/part100/',
      text: 'Reactor site criteria.',
      type: 'human-review',
      confidence: 'high',
    },
  ],
};
const region = {
  country: 'USA',
  regionId: 'US-TX',
  regionName: 'Texas',
  hasRichData: true,
  facts: [],
};

const validBody = {
  country: 'USA',
  regionId: 'US-TX',
  question: 'Where can I site here?',
  history: [],
};

beforeEach(() => {
  vi.mocked(loadCorpus).mockReset();
  vi.mocked(callModel).mockReset();
});

describe('POST /api/chat', () => {
  it('returns 200 with a ChatResponse on success', async () => {
    vi.mocked(loadCorpus).mockReturnValue({ country: corpus, region } as any);
    vi.mocked(callModel).mockResolvedValue(
      'Screen-level finding: review [us-nrc-10cfr100].',
    );

    const res = await request(makeApp()).post('/api/chat').send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.answer).toContain('us-nrc-10cfr100');
    expect(Array.isArray(res.body.citations)).toBe(true);
    // citations are derived from the source ids the model actually cited
    expect(res.body.citations.map((c: any) => c.id)).toContain('us-nrc-10cfr100');
    expect(vi.mocked(callModel)).toHaveBeenCalledOnce();
  });

  it('returns 404 when loadCorpus throws CorpusNotFoundError', async () => {
    vi.mocked(loadCorpus).mockImplementation(() => {
      throw new CorpusNotFoundError('no data');
    });

    const res = await request(makeApp()).post('/api/chat').send(validBody);

    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
    expect(vi.mocked(callModel)).not.toHaveBeenCalled();
  });

  it('returns 400 when the body is missing required fields', async () => {
    const res = await request(makeApp())
      .post('/api/chat')
      .send({ country: 'USA' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  it('returns 500 when callModel rejects', async () => {
    vi.mocked(loadCorpus).mockReturnValue({ country: corpus, region } as any);
    vi.mocked(callModel).mockRejectedValue(new Error('openai down'));

    const res = await request(makeApp()).post('/api/chat').send(validBody);

    expect(res.status).toBe(500);
    expect(res.body.error).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run server/routes/chat.test.ts`
Expected: FAIL with "Failed to resolve import './chat'" / "chatRouter is not exported".

- [ ] **Step 3: Write minimal implementation**

```ts
// server/routes/chat.ts
import { Router, type Request, type Response } from 'express';
import { loadCorpus, CorpusNotFoundError } from '../corpus';
import { callModel } from '../openai';
import { buildChatPrompt } from '../prompts/chat';
import type { ChatRequest, ChatResponse, Citation, ChatMessage } from '../../src/types';

export const chatRouter = Router();

function isValidBody(b: unknown): b is ChatRequest {
  if (typeof b !== 'object' || b === null) return false;
  const r = b as Record<string, unknown>;
  return (
    typeof r.country === 'string' &&
    typeof r.regionId === 'string' &&
    typeof r.question === 'string' &&
    Array.isArray(r.history)
  );
}

// Derive returned citations from the source ids the model actually cited inline,
// e.g. [us-nrc-10cfr100]. Never invent: only ids present in the corpus are kept.
function extractCitations(answer: string, sources: { id: string }[]): Citation[] {
  const cited = new Set<string>();
  const re = /\[([a-z0-9-]+)\]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer)) !== null) cited.add(m[1]);
  return (sources as Citation[]).filter((s) => cited.has(s.id));
}

chatRouter.post('/', async (req: Request, res: Response) => {
  if (!isValidBody(req.body)) {
    return res.status(400).json({ error: 'Invalid ChatRequest body' });
  }
  const { country, regionId, question, history } = req.body as ChatRequest;

  let loaded;
  try {
    loaded = loadCorpus(country, regionId);
  } catch (err) {
    if (err instanceof CorpusNotFoundError) {
      return res.status(404).json({ error: 'Corpus not found for region' });
    }
    return res.status(500).json({ error: 'Failed to load corpus' });
  }

  try {
    const { system, user } = buildChatPrompt(
      loaded.country,
      loaded.region,
      question,
      history as ChatMessage[],
    );
    const answer = await callModel([
      { role: 'system', content: system },
      { role: 'user', content: user },
    ]);
    const citations = extractCitations(answer, loaded.country.sources);
    const body: ChatResponse = { answer, citations };
    return res.status(200).json(body);
  } catch {
    return res.status(500).json({ error: 'Chat generation failed' });
  }
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run server/routes/chat.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Wire the router into the app (replace F1 stub)**

In `server/app.ts`, F1 registered a 501 stub for `/api/chat`. Replace that registration with the real router. Find the stub (it returns `res.status(501)`), remove it, and register the router:

```ts
// server/app.ts — add near the other route imports
import { chatRouter } from './routes/chat';

// ...where routes are mounted, REPLACE the 501 chat stub with:
app.use('/api/chat', chatRouter);
```

- [ ] **Step 6: Run the full server unit suite to confirm no stub test regressions**

Run: `npx vitest run server/`
Expected: PASS (chat route + prompt tests green; any F1 stub test for `/api/chat` should have been removed/updated — if a 501 assertion remains, delete that obsolete test).

- [ ] **Step 7: Commit**

```bash
git add server/routes/chat.ts server/routes/chat.test.ts server/app.ts
git commit -m "feat(F6): implement POST /api/chat route (loadCorpus -> buildChatPrompt -> callModel)"
```

> **Deviation note (callModel signature):** This task assumes F1's `callModel` accepts a `{ role, content }[]` message array. If F1 implemented `callModel(prompt: string)` instead, adapt by joining `system + '\n\n' + user` into one string and update both `chat.ts` and the route test's mock assertion accordingly — then note the adaptation in the task PR. Do not silently leave a broken import.

---

### Task 3: `useChat` reducer hook (Vitest: appends user then assistant)

**Files:**
- Create: `src/chat/useChat.ts`
- Test: `src/chat/useChat.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/chat/useChat.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../api', () => ({
  postChat: vi.fn(),
}));

import { postChat } from '../api';
import { useChat } from './useChat';

beforeEach(() => {
  vi.mocked(postChat).mockReset();
});

describe('useChat', () => {
  it('appends the user message immediately then the assistant reply', async () => {
    vi.mocked(postChat).mockResolvedValue({
      answer: 'Screen-level: review [us-nrc-10cfr100].',
      citations: [
        {
          id: 'us-nrc-10cfr100',
          title: '10 CFR Part 100',
          citation: '10 CFR Part 100',
          year: 1962,
          url: 'https://www.nrc.gov/',
        },
      ],
    });

    const { result } = renderHook(() =>
      useChat({ country: 'USA', regionId: 'US-TX' }),
    );

    expect(result.current.messages).toHaveLength(0);

    await act(async () => {
      await result.current.send('Where can I site here?');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toEqual({
      role: 'user',
      content: 'Where can I site here?',
    });
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toContain('us-nrc-10cfr100');
    expect(result.current.citations).toHaveLength(1);
  });

  it('posts the prior history (excluding the in-flight question) to postChat', async () => {
    vi.mocked(postChat).mockResolvedValue({ answer: 'A1', citations: [] });

    const { result } = renderHook(() =>
      useChat({ country: 'USA', regionId: 'US-TX' }),
    );

    await act(async () => {
      await result.current.send('Q1');
    });

    vi.mocked(postChat).mockResolvedValue({ answer: 'A2', citations: [] });

    await act(async () => {
      await result.current.send('Q2');
    });

    const secondCallArg = vi.mocked(postChat).mock.calls[1][0];
    expect(secondCallArg.question).toBe('Q2');
    expect(secondCallArg.history).toEqual([
      { role: 'user', content: 'Q1' },
      { role: 'assistant', content: 'A1' },
    ]);
    expect(result.current.messages).toHaveLength(4);
  });

  it('sets loading true while a request is in flight then false', async () => {
    let resolve!: (v: { answer: string; citations: [] }) => void;
    vi.mocked(postChat).mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }) as Promise<{ answer: string; citations: never[] }>,
    );

    const { result } = renderHook(() =>
      useChat({ country: 'USA', regionId: 'US-TX' }),
    );

    act(() => {
      void result.current.send('Q');
    });

    await waitFor(() => expect(result.current.loading).toBe(true));

    await act(async () => {
      resolve({ answer: 'done', citations: [] });
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/chat/useChat.test.ts`
Expected: FAIL with "Failed to resolve import './useChat'" / "useChat is not a function".

- [ ] **Step 3: Write minimal implementation**

```ts
// src/chat/useChat.ts
import { useReducer, useCallback } from 'react';
import { postChat } from '../api';
import type { ChatMessage, Citation } from '../types';

interface ChatState {
  messages: ChatMessage[];
  citations: Citation[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'send'; content: string }
  | { type: 'reply'; content: string; citations: Citation[] }
  | { type: 'error'; error: string };

const initialState: ChatState = {
  messages: [],
  citations: [],
  loading: false,
  error: null,
};

function reducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case 'send':
      return {
        ...state,
        loading: true,
        error: null,
        messages: [...state.messages, { role: 'user', content: action.content }],
      };
    case 'reply':
      return {
        ...state,
        loading: false,
        citations: action.citations,
        messages: [
          ...state.messages,
          { role: 'assistant', content: action.content },
        ],
      };
    case 'error':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

export interface UseChatArgs {
  country: string;
  regionId: string;
}

export interface UseChat {
  messages: ChatMessage[];
  citations: Citation[];
  loading: boolean;
  error: string | null;
  send: (question: string) => Promise<void>;
}

export function useChat({ country, regionId }: UseChatArgs): UseChat {
  const [state, dispatch] = useReducer(reducer, initialState);

  const send = useCallback(
    async (question: string) => {
      // Snapshot history BEFORE appending the in-flight question.
      const history = state.messages;
      dispatch({ type: 'send', content: question });
      try {
        const res = await postChat({ country, regionId, question, history });
        dispatch({
          type: 'reply',
          content: res.answer,
          citations: res.citations,
        });
      } catch (err) {
        dispatch({
          type: 'error',
          error: err instanceof Error ? err.message : 'Chat failed',
        });
      }
    },
    [country, regionId, state.messages],
  );

  return {
    messages: state.messages,
    citations: state.citations,
    loading: state.loading,
    error: state.error,
    send,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/chat/useChat.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add src/chat/useChat.ts src/chat/useChat.test.ts
git commit -m "feat(F6): useChat reducer hook (append user then assistant, post prior history)"
```

---

### Task 4: `ChatPanel` component (markdown answers + citation links + RAG label)

**Files:**
- Create: `src/chat/ChatPanel.tsx`
- Verified via: Task 6 Playwright E2E (no standalone unit test — behavior is DOM/layout, covered by E2E per stack rules).

- [ ] **Step 1: Ensure `react-markdown` is installed**

Run: `npm ls react-markdown || npm install react-markdown`
Expected: `react-markdown@<version>` present in dependency tree.

- [ ] **Step 2: Write the component**

```tsx
// src/chat/ChatPanel.tsx
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChat } from './useChat';
import type { Citation } from '../types';

export interface ChatPanelProps {
  open: boolean;
  onToggle: () => void;
  country: string;
  regionId: string;
}

function CitationLinks({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <ul className="chat-citations" data-testid="chat-citations">
      {citations.map((c) => (
        <li key={c.id}>
          <a href={c.url} target="_blank" rel="noopener noreferrer" data-citation-id={c.id}>
            {c.citation} ({c.year})
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ChatPanel({ open, onToggle, country, regionId }: ChatPanelProps) {
  const { messages, citations, loading, error, send } = useChat({ country, regionId });
  const [draft, setDraft] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q || loading) return;
    setDraft('');
    void send(q);
  };

  return (
    <>
      <button
        type="button"
        className="chat-toggle"
        data-testid="chat-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        {open ? 'Close chat' : 'Open chat'}
      </button>

      {open && (
        <aside className="chat-panel" data-testid="chat-panel" aria-label="Chat assistant">
          <header className="chat-header">
            <h2>Site Intelligence Chat</h2>
            <p className="chat-rag-label" data-testid="chat-rag-label">
              Powered by Compliance RAG pipeline
            </p>
          </header>

          <div className="chat-messages" data-testid="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message chat-message--${m.role}`} data-role={m.role}>
                {m.role === 'assistant' ? (
                  <div className="chat-markdown">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
            ))}
            {loading && <p className="chat-loading" data-testid="chat-loading">Thinking…</p>}
            {error && <p className="chat-error" role="alert">{error}</p>}
            <CitationLinks citations={citations} />
          </div>

          <form className="chat-input" onSubmit={submit}>
            <input
              type="text"
              data-testid="chat-input"
              placeholder="Ask about this region…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" data-testid="chat-send" disabled={loading}>
              Send
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
```

- [ ] **Step 3: Type-check the component**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/chat/ChatPanel.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/chat/ChatPanel.tsx package.json package-lock.json
git commit -m "feat(F6): ChatPanel with markdown answers, citation links, and RAG label"
```

---

### Task 5: `Layout` dynamic container (centered ↔ shifted-left) + Globe `shifted` prop

**Files:**
- Create: `src/layout/Layout.tsx`
- Create: `src/layout/Layout.css`
- Verified via: Task 6 Playwright E2E (layout shift assertions).

- [ ] **Step 1: Write the layout styles**

```css
/* src/layout/Layout.css */
.layout {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* The globe+dashboard cluster. Default = centered. */
.layout__cluster {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.4s ease, width 0.4s ease;
  transform: translateX(0);
}

/* Chat open: cluster shifts left, occupying ~60% so chat takes the right. */
.layout--chat-open .layout__cluster {
  width: 60%;
  transform: translateX(0);
  justify-content: center;
}

/* Chat panel docks to the right; hidden width when closed is handled by ChatPanel render. */
.layout--chat-open .chat-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 40%;
  height: 100%;
}

.chat-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}
```

- [ ] **Step 2: Write the layout component**

```tsx
// src/layout/Layout.tsx
import { useState } from 'react';
import { Globe } from '../Globe';
import { Dashboard } from '../Dashboard';
import { ChatPanel } from '../chat/ChatPanel';
import './Layout.css';

export function Layout() {
  const [chatOpen, setChatOpen] = useState(false);
  const [selected, setSelected] = useState<{ country: string; regionId: string } | null>(null);

  return (
    <div
      className={`layout${chatOpen ? ' layout--chat-open' : ''}`}
      data-testid="layout"
      data-chat-open={chatOpen}
    >
      <div className="layout__cluster" data-testid="layout-cluster">
        <Globe
          shifted={chatOpen}
          onRegionSelected={(country, regionId) => setSelected({ country, regionId })}
        />
        <Dashboard />
      </div>

      <ChatPanel
        open={chatOpen}
        onToggle={() => setChatOpen((o) => !o)}
        country={selected?.country ?? ''}
        regionId={selected?.regionId ?? ''}
      />
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/layout/Layout.tsx`. (If F2's `Globe` prop name or `onRegionSelected` arity differs, align the call here to F2's exported signature and note the adjustment — the LOCKED globe event is `onRegionSelected(country, regionId, regionName)`, so accept and ignore the third arg if present.)

- [ ] **Step 4: Mount `Layout` as the app root**

In `src/App.tsx` (created by F1), render `Layout` as the top-level component:

```tsx
// src/App.tsx
import { Layout } from './layout/Layout';

export default function App() {
  return <Layout />;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/layout/Layout.tsx src/layout/Layout.css src/App.tsx
git commit -m "feat(F6): dynamic Layout container with chatOpen shift + Globe shifted prop"
```

---

### Task 6: End-to-end tests (Playwright, mocked /api/chat)

**Files:**
- Create: `tests/e2e/chat-layout.spec.ts`

- [ ] **Step 1: Write the E2E spec**

```ts
// tests/e2e/chat-layout.spec.ts
import { test, expect } from '@playwright/test';

const FIXTURE = {
  answer:
    'Screen-level finding: siting requires human review. Key constraint cited below. [us-nrc-10cfr100]',
  citations: [
    {
      id: 'us-nrc-10cfr100',
      title: '10 CFR Part 100',
      citation: '10 CFR Part 100',
      year: 1962,
      url: 'https://www.nrc.gov/reading-rm/doc-collections/cfr/part100/',
    },
  ],
};

test.beforeEach(async ({ page }) => {
  // Deterministic mock of the chat endpoint.
  await page.route('**/api/chat', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FIXTURE),
    });
  });
  await page.goto('/');
});

test('opening chat shifts the globe+dashboard cluster left', async ({ page }) => {
  const layout = page.getByTestId('layout');
  const cluster = page.getByTestId('layout-cluster');

  await expect(layout).toHaveAttribute('data-chat-open', 'false');
  const before = await cluster.boundingBox();

  await page.getByTestId('chat-toggle').click();

  await expect(layout).toHaveAttribute('data-chat-open', 'true');
  await expect(layout).toHaveClass(/layout--chat-open/);
  await expect(page.getByTestId('chat-panel')).toBeVisible();

  // Cluster narrows (width shrinks to make room for chat on the right).
  await expect
    .poll(async () => (await cluster.boundingBox())!.width)
    .toBeLessThan(before!.width);
});

test('sending a question renders a markdown answer with a clickable citation link', async ({
  page,
}) => {
  await page.getByTestId('chat-toggle').click();

  await page.getByTestId('chat-input').fill('Where can I site a reactor?');
  await page.getByTestId('chat-send').click();

  const messages = page.getByTestId('chat-messages');
  await expect(messages).toContainText('Screen-level finding');

  const citationLink = page.locator('a[data-citation-id="us-nrc-10cfr100"]');
  await expect(citationLink).toBeVisible();
  await expect(citationLink).toHaveAttribute(
    'href',
    'https://www.nrc.gov/reading-rm/doc-collections/cfr/part100/',
  );
});

test('closing chat recenters the cluster', async ({ page }) => {
  const layout = page.getByTestId('layout');
  const cluster = page.getByTestId('layout-cluster');

  await page.getByTestId('chat-toggle').click();
  await expect(layout).toHaveAttribute('data-chat-open', 'true');
  const openWidth = (await cluster.boundingBox())!.width;

  await page.getByTestId('chat-toggle').click();
  await expect(layout).toHaveAttribute('data-chat-open', 'false');
  await expect(page.getByTestId('chat-panel')).toHaveCount(0);

  // Cluster widens back toward full width on close.
  await expect
    .poll(async () => (await cluster.boundingBox())!.width)
    .toBeGreaterThan(openWidth);
});

test('chat shows the Compliance RAG pipeline label', async ({ page }) => {
  await page.getByTestId('chat-toggle').click();
  await expect(page.getByTestId('chat-rag-label')).toHaveText(
    'Powered by Compliance RAG pipeline',
  );
});
```

- [ ] **Step 2: Run the E2E suite**

Run: `npm run e2e -- chat-layout.spec.ts`
Expected: PASS (4 passed). The Playwright config (from F1) must start the Vite dev server; the `page.route` mock intercepts `/api/chat` so no live OpenAI is hit.

- [ ] **Step 3: Run the full unit suite as a regression gate**

Run: `npx vitest run`
Expected: PASS (all F6 unit tests green; no regressions in F1–F5 suites).

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/chat-layout.spec.ts
git commit -m "test(F6): E2E for chat layout shift, markdown answer + citation, recenter, RAG label"
```

---

## End-to-end testing requirements

All E2E runs use a **mocked `/api/chat`** (deterministic fixture via Playwright `page.route`) — no live OpenAI dependency. Required scenarios (implemented in `tests/e2e/chat-layout.spec.ts`):

1. **Open shifts cluster left** — clicking the chat toggle sets `data-chat-open="true"`, adds the `layout--chat-open` class, makes `chat-panel` visible, and shrinks the `layout-cluster` bounding-box width (asserts a layout class change AND a bounding-box change).
2. **Send renders a markdown answer with a citation link** — typing a question and clicking Send shows the fixture's markdown answer in `chat-messages` and renders a clickable `a[data-citation-id="us-nrc-10cfr100"]` whose `href` matches the fixture citation URL.
3. **Close recenters** — toggling chat off restores `data-chat-open="false"`, removes the panel, and widens the cluster bounding box back toward full width.
4. **Compliance RAG label** — the panel displays exactly "Powered by Compliance RAG pipeline" (`chat-rag-label`).

**Live smoke (optional, gated):** per PRD §9, an optional live `/api/chat` smoke test may run behind an env flag; it is NOT part of the default `npm run e2e` gate and is out of scope for this feature's required tests.
