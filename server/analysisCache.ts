import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AnalysisResult, AnalyzeRequest } from '../src/types';

// ESM-safe __dirname (the server runs as ES modules, where __dirname is undefined).
const moduleDir = dirname(fileURLToPath(import.meta.url));

/**
 * Returns a stable cache key for an analysis request.
 * Format: `${country}_${regionId}_${reactorId}_${pathway}`
 * Example: `USA_US-WY_ge-bwrx-300_coal-repower`
 */
export function analysisKey(req: Pick<AnalyzeRequest, 'country' | 'regionId' | 'reactorId' | 'pathway'>): string {
  return `${req.country}_${req.regionId}_${req.reactorId}_${req.pathway}`;
}

/**
 * Attempts to load a curated (human-reviewed) analysis result from
 * `data/analyses/<key>.json`. Returns null if the file is missing or unparseable.
 * The cached file ALWAYS wins over a computed result.
 */
export function loadCachedAnalysis(req: Pick<AnalyzeRequest, 'country' | 'regionId' | 'reactorId' | 'pathway'>): AnalysisResult | null {
  const key = analysisKey(req);
  // Resolve relative to project root (one level up from server/)
  const filePath = resolve(moduleDir, '..', 'data', 'analyses', `${key}.json`);
  try {
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as AnalysisResult;
    return parsed;
  } catch {
    return null;
  }
}
