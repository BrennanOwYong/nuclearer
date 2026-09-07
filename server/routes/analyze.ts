import { Router, type Request, type Response } from 'express';
import type { AnalyzeRequest, Pathway } from '../../src/types';
import { loadCorpus, CorpusNotFoundError } from '../corpus';
import { getCandidateSites, getReactor } from '../../src/data/index';
import { screenSites, buildAnalysisResult } from '../sitefinder';
import { loadCachedAnalysis } from '../analysisCache';
import { australiaCorpus } from '../../src/data/countries/australia';

const router = Router();

function isValidPathway(p: unknown): p is Pathway {
  return p === 'greenfield' || p === 'coal-repower';
}

/** Detect the Australia nuclear ban by checking for EPBC/ARPANS sources. */
function countryHasNuclearBan(countryCode: string): boolean {
  if (countryCode === 'AUS') {
    return australiaCorpus.sources.some(
      (s) => s.id === 'au-epbc-140a' || s.id === 'au-arpans-10',
    );
  }
  return false;
}

function getBanCitationIds(countryCode: string): string[] {
  if (countryCode === 'AUS') {
    const banIds = ['au-epbc-140a', 'au-arpans-10', 'au-sa-prohibition'];
    return banIds.filter((id) => australiaCorpus.sources.some((s) => s.id === id));
  }
  return [];
}

router.post('/', (req: Request, res: Response): void => {
  const body = req.body as Partial<AnalyzeRequest>;

  // Validate required fields
  const { country, regionId, reactorId, pathway } = body;
  if (!country || typeof country !== 'string') {
    res.status(400).json({ error: 'Missing or invalid field: country' });
    return;
  }
  if (!regionId || typeof regionId !== 'string') {
    res.status(400).json({ error: 'Missing or invalid field: regionId' });
    return;
  }
  if (!reactorId || typeof reactorId !== 'string') {
    res.status(400).json({ error: 'Missing or invalid field: reactorId' });
    return;
  }
  if (!isValidPathway(pathway)) {
    res.status(400).json({ error: 'Missing or invalid field: pathway (must be "greenfield" or "coal-repower")' });
    return;
  }

  const validatedReq: AnalyzeRequest = { country, regionId, reactorId, pathway, cooling: body.cooling };

  // ── Cached analysis wins ────────────────────────────────────────────────
  const cached = loadCachedAnalysis(validatedReq);
  if (cached !== null) {
    res.status(200).json(cached);
    return;
  }

  // ── Load corpus + reactor ───────────────────────────────────────────────
  let corpus: ReturnType<typeof loadCorpus>;
  try {
    corpus = loadCorpus(country, regionId);
  } catch (err) {
    if (err instanceof CorpusNotFoundError) {
      res.status(404).json({ error: `No data for country="${country}" region="${regionId}"` });
      return;
    }
    res.status(500).json({ error: 'Internal server error loading corpus' });
    return;
  }

  const reactor = getReactor(reactorId);
  if (!reactor) {
    res.status(404).json({ error: `Unknown reactorId: "${reactorId}"` });
    return;
  }

  // ── Run site-finder ─────────────────────────────────────────────────────
  const candidateSites = getCandidateSites(country, regionId);
  const screened = screenSites(reactor, pathway, candidateSites, corpus);

  const legalBan = countryHasNuclearBan(country);
  const banCitationIds = getBanCitationIds(country);

  const result = buildAnalysisResult(
    country,
    regionId,
    reactor,
    pathway,
    screened,
    corpus,
    legalBan,
    banCitationIds,
  );

  res.status(200).json(result);
});

export default router;
