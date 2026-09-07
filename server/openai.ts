import 'dotenv/config';
import OpenAI from 'openai';
import type { ChatMessage } from '../src/types';

export interface CallModelOpts {
  /** When true, requests a JSON-object response from the model (maps to opts.json per PRD §5.1). */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Calls the configured chat model and returns the assistant message content as a string.
 * Model is read from OPENAI_MODEL (default 'gpt-5-mini') at call time.
 *
 * Frozen signature (PRD §5.1):
 *   callModel(messages: ChatMessage[], opts?: { json?: boolean }): Promise<string>
 */
export async function callModel(messages: ChatMessage[], opts: CallModelOpts = {}): Promise<string> {
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
  const res = await openai.chat.completions.create({
    model,
    messages,
    ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    ...(opts.maxTokens !== undefined ? { max_tokens: opts.maxTokens } : {}),
    ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
  });
  return res.choices[0]?.message?.content ?? '';
}
