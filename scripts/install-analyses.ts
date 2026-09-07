/**
 * Validates the ChatGPT-generated analysis JSON in prompts/<combo>.json against
 * the AnalysisResult contract + the REAL citation corpus, then installs the
 * clean ones into data/analyses/<key>.json (the cache the server serves).
 *
 * Run: npx vite-node scripts/install-analyses.ts
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  getCountryCorpus,
  getRegionData,
  getCandidateSites,
  getReactor,
} from '../src/data/index';
import type { AnalysisResult, FrictionCategory, Verdict } from '../src/types';

const VERDICTS: Verdict[] = ['pass', 'caution', 'fail'];
const FRICTION: FrictionCategory[] = ['grid', 'cooling', 'permits', 'community', 'logistics', 'hazards'];

const promptsDir = join(process.cwd(), 'prompts');
const outDir = join(process.cwd(), 'data', 'analyses');
mkdirSync(outDir, { recursive: true });

// Build the set of citation ids that are REAL for a given combo:
// country corpus source ids + region fact citationIds + candidate-site citationIds + reactor citation id.
function validCitationIds(country: string, regionId: string, reactorId: string): Set<string> {
  const ids = new Set<string>();
  const corpus = getCountryCorpus(country);
  corpus?.sources.forEach((s) => ids.add(s.id));
  const region = getRegionData(country, regionId);
  region?.facts.forEach((f) => f.citationId && ids.add(f.citationId));
  getCandidateSites(country, regionId).forEach((s) => s.citationIds.forEach((c) => ids.add(c)));
  const reactor = getReactor(reactorId);
  if (reactor) ids.add(reactor.citation.id);
  return ids;
}

function analysisKey(d: AnalysisResult): string {
  return `${d.country}_${d.regionId}_${d.reactorId}_${d.pathway}`;
}

const comboFiles = readdirSync(promptsDir).filter(
  (f) => f.endsWith('.json') && f !== 'nuclear_siting_outputs_combined.json',
);

let installed = 0;
const reports: string[] = [];

for (const file of comboFiles) {
  const raw = readFileSync(join(promptsDir, file), 'utf-8');
  let d: AnalysisResult;
  try {
    d = JSON.parse(raw) as AnalysisResult;
  } catch (e) {
    reports.push(`❌ ${file}: invalid JSON — ${(e as Error).message}`);
    continue;
  }

  const problems: string[] = [];
  const warnings: string[] = [];

  // Top-level shape
  for (const k of ['country', 'regionId', 'reactorId', 'pathway', 'sites', 'regionSummary', 'nextStudies', 'notes'] as const) {
    if (!(k in d)) problems.push(`missing top-level "${k}"`);
  }
  if (!Array.isArray(d.sites)) problems.push('sites is not an array');

  const valid = validCitationIds(d.country, d.regionId, d.reactorId);
  const unknownCites = new Set<string>();
  const collectCite = (id: string) => { if (!valid.has(id)) unknownCites.add(id); };

  // Per-site validation
  (d.sites ?? []).forEach((s, i) => {
    for (const k of ['siteId', 'siteName', 'kind', 'lat', 'lng', 'rank', 'verdict', 'frictionScores', 'matrix', 'citationIds', 'confidence'] as const) {
      if (!(k in s)) problems.push(`site[${i}] missing "${k}"`);
    }
    if (!VERDICTS.includes(s.verdict)) problems.push(`site[${i}] bad verdict "${s.verdict}"`);
    for (const cat of FRICTION) {
      const v = s.frictionScores?.[cat];
      if (typeof v !== 'number' || v < 0 || v > 1) problems.push(`site[${i}] frictionScores.${cat}=${v} out of [0,1]`);
    }
    (s.citationIds ?? []).forEach(collectCite);
    (s.matrix ?? []).forEach((m, j) => {
      if (!VERDICTS.includes(m.verdict)) problems.push(`site[${i}].matrix[${j}] bad verdict`);
      if (m.dataBasis !== 'computable' && m.dataBasis !== 'requires-field-study')
        problems.push(`site[${i}].matrix[${j}] bad dataBasis "${m.dataBasis}"`);
      (m.citationIds ?? []).forEach(collectCite);
    });
  });

  if (unknownCites.size > 0) {
    warnings.push(`unknown citation ids (not in corpus): ${[...unknownCites].join(', ')}`);
  }

  const key = analysisKey(d);
  if (problems.length > 0) {
    reports.push(`❌ ${file} [${key}]: ${problems.slice(0, 6).join('; ')}${problems.length > 6 ? ` …(+${problems.length - 6})` : ''}`);
    continue;
  }

  writeFileSync(join(outDir, `${key}.json`), JSON.stringify(d, null, 2), 'utf-8');
  installed += 1;
  const banNote = d.sites.length === 0 ? ' (no viable sites)' : ` (${d.sites.length} sites)`;
  const warnNote = warnings.length ? `  ⚠ ${warnings.join('; ')}` : '';
  reports.push(`✅ ${file} → data/analyses/${key}.json${banNote}${warnNote}`);
}

// eslint-disable-next-line no-console
console.log(reports.join('\n'));
// eslint-disable-next-line no-console
console.log(`\nInstalled ${installed}/${comboFiles.length} analyses.`);
