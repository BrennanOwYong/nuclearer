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
