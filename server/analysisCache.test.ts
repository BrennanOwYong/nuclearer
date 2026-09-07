/**
 * Unit tests for server/analysisCache.ts
 * Tests: key format; load hit with a temp fixture + miss→null.
 */
import { describe, it, expect } from 'vitest';
import { analysisKey, loadCachedAnalysis } from './analysisCache';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { AnalysisResult, AnalyzeRequest } from '../src/types';

const ANALYSES_DIR = resolve(__dirname, '..', 'data', 'analyses');

describe('analysisKey', () => {
  it('formats key as country_regionId_reactorId_pathway', () => {
    const req: Pick<AnalyzeRequest, 'country' | 'regionId' | 'reactorId' | 'pathway'> = {
      country: 'USA',
      regionId: 'US-WY',
      reactorId: 'ge-bwrx-300',
      pathway: 'coal-repower',
    };
    expect(analysisKey(req)).toBe('USA_US-WY_ge-bwrx-300_coal-repower');
  });

  it('handles greenfield pathway', () => {
    const req: Pick<AnalyzeRequest, 'country' | 'regionId' | 'reactorId' | 'pathway'> = {
      country: 'AUS',
      regionId: 'AU-SA',
      reactorId: 'westinghouse-evinci',
      pathway: 'greenfield',
    };
    expect(analysisKey(req)).toBe('AUS_AU-SA_westinghouse-evinci_greenfield');
  });

  it('matches the documented example: USA_US-WY_ge-bwrx-300_coal-repower', () => {
    const req: Pick<AnalyzeRequest, 'country' | 'regionId' | 'reactorId' | 'pathway'> = {
      country: 'USA',
      regionId: 'US-WY',
      reactorId: 'ge-bwrx-300',
      pathway: 'coal-repower',
    };
    expect(analysisKey(req)).toBe('USA_US-WY_ge-bwrx-300_coal-repower');
  });
});

describe('loadCachedAnalysis', () => {
  const TEST_REQ: Pick<AnalyzeRequest, 'country' | 'regionId' | 'reactorId' | 'pathway'> = {
    country: 'USA',
    regionId: 'US-TEST',
    reactorId: 'test-reactor',
    pathway: 'coal-repower',
  };
  const TEST_KEY = 'USA_US-TEST_test-reactor_coal-repower';
  const TEST_FILE = resolve(ANALYSES_DIR, `${TEST_KEY}.json`);

  const FIXTURE: AnalysisResult = {
    country: 'USA',
    regionId: 'US-TEST',
    reactorId: 'test-reactor',
    pathway: 'coal-repower',
    sites: [],
    regionSummary: 'Test cached result',
    nextStudies: ['study-a'],
    notes: 'Curated test fixture.',
  };

  it('returns null when no cached file exists', () => {
    // Ensure no stale file from a prior test run
    if (existsSync(TEST_FILE)) rmSync(TEST_FILE);
    const result = loadCachedAnalysis(TEST_REQ);
    expect(result).toBeNull();
  });

  it('returns parsed AnalysisResult when a valid fixture file exists', () => {
    mkdirSync(ANALYSES_DIR, { recursive: true });
    writeFileSync(TEST_FILE, JSON.stringify(FIXTURE), 'utf-8');
    try {
      const result = loadCachedAnalysis(TEST_REQ);
      expect(result).not.toBeNull();
      expect(result!.country).toBe('USA');
      expect(result!.regionId).toBe('US-TEST');
      expect(result!.regionSummary).toBe('Test cached result');
    } finally {
      rmSync(TEST_FILE);
    }
  });

  it('returns null when the cached file is malformed JSON', () => {
    mkdirSync(ANALYSES_DIR, { recursive: true });
    writeFileSync(TEST_FILE, '{ this is not valid json !!!', 'utf-8');
    try {
      const result = loadCachedAnalysis(TEST_REQ);
      expect(result).toBeNull();
    } finally {
      rmSync(TEST_FILE);
    }
  });

  it('returns null for an unknown request with no matching file', () => {
    const unknownReq: Pick<AnalyzeRequest, 'country' | 'regionId' | 'reactorId' | 'pathway'> = {
      country: 'XXX',
      regionId: 'XX-ZZ',
      reactorId: 'no-such-reactor',
      pathway: 'greenfield',
    };
    const result = loadCachedAnalysis(unknownReq);
    expect(result).toBeNull();
  });
});
