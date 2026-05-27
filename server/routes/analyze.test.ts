/**
 * Integration tests for POST /api/analyze
 * Tests: 200 computed; 200 served-from-cache; 404 unknown region/reactor; 400 bad request.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { AnalysisResult } from '../../src/types';
import analyzeRouter from './analyze';

const ANALYSES_DIR = resolve(__dirname, '..', '..', 'data', 'analyses');
const CACHE_KEY = 'USA_US-WY_ge-bwrx-300_coal-repower-TEST';
const CACHE_FILE = resolve(ANALYSES_DIR, `${CACHE_KEY}.json`);

// Express app for testing
const app = express();
app.use(express.json());
app.use('/api/analyze', analyzeRouter);

describe('POST /api/analyze — computed result', () => {
  it('returns 200 with an AnalysisResult for a valid WY + BWRX-300 + coal-repower request', async () => {
    const resp = await request(app)
      .post('/api/analyze')
      .send({ country: 'USA', regionId: 'US-WY', reactorId: 'ge-bwrx-300', pathway: 'coal-repower' })
      .expect(200)
      .expect('Content-Type', /json/);

    const body = resp.body as AnalysisResult;
    expect(body.country).toBe('USA');
    expect(body.regionId).toBe('US-WY');
    expect(body.reactorId).toBe('ge-bwrx-300');
    expect(body.pathway).toBe('coal-repower');
    expect(Array.isArray(body.sites)).toBe(true);
    expect(typeof body.regionSummary).toBe('string');
    expect(Array.isArray(body.nextStudies)).toBe(true);
    expect(typeof body.notes).toBe('string');
  });

  it('returns sites[] with correct schema per SiteScreening', async () => {
    const resp = await request(app)
      .post('/api/analyze')
      .send({ country: 'USA', regionId: 'US-WY', reactorId: 'ge-bwrx-300', pathway: 'coal-repower' })
      .expect(200);

    const body = resp.body as AnalysisResult;
    for (const site of body.sites) {
      expect(typeof site.siteId).toBe('string');
      expect(typeof site.siteName).toBe('string');
      expect(['named', 'greenfield']).toContain(site.kind);
      expect(typeof site.lat).toBe('number');
      expect(typeof site.lng).toBe('number');
      expect(typeof site.rank).toBe('number');
      expect(['pass', 'caution', 'fail']).toContain(site.verdict);
      expect(site.frictionScores).toBeDefined();
      // All friction scores 0..1
      for (const score of Object.values(site.frictionScores as Record<string, number>)) {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1);
      }
      // Matrix rows have dataBasis
      for (const row of site.matrix) {
        expect(['computable', 'requires-field-study']).toContain(row.dataBasis);
      }
    }
  });

  it('returns 200 with sites:[] for Australia (ban in force)', async () => {
    const resp = await request(app)
      .post('/api/analyze')
      .send({ country: 'AUS', regionId: 'AU-SA', reactorId: 'ge-bwrx-300', pathway: 'greenfield' })
      .expect(200);

    const body = resp.body as AnalysisResult;
    expect(body.sites).toHaveLength(0);
    expect(body.regionSummary).toContain('au-epbc-140a');
  });
});

describe('POST /api/analyze — cache wins', () => {
  const FIXTURE: AnalysisResult = {
    country: 'USA',
    regionId: 'US-WY',
    reactorId: 'ge-bwrx-300',
    pathway: 'coal-repower',
    sites: [],
    regionSummary: 'CURATED CACHE HIT — this should be returned verbatim',
    nextStudies: ['curated-study'],
    notes: 'Curated human-reviewed fixture.',
  };

  // Use a special cache key that matches a real request but we write a fixture for it
  const CACHE_TEST_KEY = 'USA_US-WY_ge-bwrx-300_greenfield';
  const CACHE_TEST_FILE = resolve(ANALYSES_DIR, `${CACHE_TEST_KEY}.json`);
  const CACHE_FIXTURE: AnalysisResult = {
    country: 'USA',
    regionId: 'US-WY',
    reactorId: 'ge-bwrx-300',
    pathway: 'greenfield',
    sites: [],
    regionSummary: 'CURATED CACHE HIT greenfield',
    nextStudies: [],
    notes: 'Cache test.',
  };

  beforeAll(() => {
    mkdirSync(ANALYSES_DIR, { recursive: true });
    writeFileSync(CACHE_TEST_FILE, JSON.stringify(CACHE_FIXTURE), 'utf-8');
    void FIXTURE; // referenced only to avoid lint
  });

  afterAll(() => {
    if (existsSync(CACHE_TEST_FILE)) rmSync(CACHE_TEST_FILE);
  });

  it('returns the curated cached result instead of computing', async () => {
    const resp = await request(app)
      .post('/api/analyze')
      .send({ country: 'USA', regionId: 'US-WY', reactorId: 'ge-bwrx-300', pathway: 'greenfield' })
      .expect(200);

    const body = resp.body as AnalysisResult;
    expect(body.regionSummary).toBe('CURATED CACHE HIT greenfield');
    expect(body.nextStudies).toHaveLength(0);
    expect(body.notes).toBe('Cache test.');
  });
});

describe('POST /api/analyze — 404 for unknown region/reactor', () => {
  it('returns 404 for an unknown region', async () => {
    const resp = await request(app)
      .post('/api/analyze')
      .send({ country: 'USA', regionId: 'US-CA', reactorId: 'ge-bwrx-300', pathway: 'greenfield' })
      .expect(404);

    expect(resp.body).toHaveProperty('error');
    expect(typeof resp.body.error).toBe('string');
  });

  it('returns 404 for an unknown country', async () => {
    const resp = await request(app)
      .post('/api/analyze')
      .send({ country: 'XXX', regionId: 'XX-01', reactorId: 'ge-bwrx-300', pathway: 'greenfield' })
      .expect(404);

    expect(resp.body).toHaveProperty('error');
  });

  it('returns 404 for an unknown reactorId', async () => {
    const resp = await request(app)
      .post('/api/analyze')
      .send({ country: 'USA', regionId: 'US-WY', reactorId: 'nonexistent-reactor-xyz', pathway: 'greenfield' })
      .expect(404);

    expect(resp.body).toHaveProperty('error');
    expect(resp.body.error).toContain('nonexistent-reactor-xyz');
  });
});

describe('POST /api/analyze — 400 validation', () => {
  it('returns 400 when country is missing', async () => {
    await request(app)
      .post('/api/analyze')
      .send({ regionId: 'US-WY', reactorId: 'ge-bwrx-300', pathway: 'coal-repower' })
      .expect(400);
  });

  it('returns 400 when pathway is invalid', async () => {
    await request(app)
      .post('/api/analyze')
      .send({ country: 'USA', regionId: 'US-WY', reactorId: 'ge-bwrx-300', pathway: 'unknown-pathway' })
      .expect(400);
  });

  it('returns 400 when body is empty', async () => {
    await request(app)
      .post('/api/analyze')
      .send({})
      .expect(400);
  });
});

// Clean up any stale cache file created at module init
afterAll(() => {
  if (existsSync(CACHE_FILE)) rmSync(CACHE_FILE);
});
