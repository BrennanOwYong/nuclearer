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
