/**
 * Builds self-contained, ready-to-paste prompts for each demo param combo.
 * Each prompt bundles the hardcoded laws + region facts + candidate sites +
 * reactor envelope + the exact AnalysisResult output schema, so pasting it into
 * the ChatGPT website returns JSON that drops straight into the analysis cache.
 *
 * Run:  npx vite-node scripts/build-prompts.ts
 * Out:  prompts/<combo-id>.md   (one per combo)
 *
 * This is the manual twin of the future server-side generator (same prompt body;
 * swap "write file" for "call API").
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  getCountryCorpus,
  getRegionData,
  getCandidateSites,
  getReactor,
} from '../src/data/index';
import type { Pathway } from '../src/types';

interface Combo {
  id: string;
  country: string;
  regionId: string;
  reactorId: string;
  pathway: Pathway;
  why: string; // what this combo demonstrates
}

const COMBOS: Combo[] = [
  { id: 'us-wy-bwrx300-repower', country: 'USA', regionId: 'US-WY', reactorId: 'ge-bwrx-300', pathway: 'coal-repower', why: 'Headline coal-to-nuclear repower (Naughton/Kemmerer) — should rank a strong PASS on existing switchyard/water.' },
  { id: 'us-il-ap1000-greenfield', country: 'USA', regionId: 'US-IL', reactorId: 'westinghouse-ap1000', pathway: 'greenfield', why: 'Large PWR on greenfield — needs big footprint + cooling water; favors river/lake sites.' },
  { id: 'us-wy-evinci-greenfield', country: 'USA', regionId: 'US-WY', reactorId: 'westinghouse-evinci', pathway: 'greenfield', why: 'Microreactor — dry-cooled, tiny footprint; should unlock remote/off-grid land a large plant cannot use. Contrast with combo #1 same region.' },
  { id: 'pl-30-bwrx300-repower', country: 'POL', regionId: 'PL-30', reactorId: 'ge-bwrx-300', pathway: 'coal-repower', why: 'Poland coal-repower (Patnow/Wloclawek BWRX-300 programme).' },
  { id: 'pl-22-ap1000-greenfield', country: 'POL', regionId: 'PL-22', reactorId: 'westinghouse-ap1000', pathway: 'greenfield', why: 'Poland first NPP, Baltic coast (Lubiatowo) — coastal cooling large PWR.' },
  { id: 'au-sa-xe100-greenfield', country: 'AUS', regionId: 'AU-SA', reactorId: 'xenergy-xe100', pathway: 'greenfield', why: 'Australia HTGR on ideal-looking land — must return NO VIABLE SITES (EPBC/ARPANS ban), not a physical fail.' },
  { id: 'au-nt-evinci-greenfield', country: 'AUS', regionId: 'AU-NT', reactorId: 'westinghouse-evinci', pathway: 'greenfield', why: 'Outback microreactor (looks perfect: empty, off-grid) — still blocked by the statutory ban. Proves the screen is law-aware, not rubber-stamping open land.' },
];

const SYSTEM = `You are the reasoning engine of a PLANNING & VISUALISATION tool used by nuclear reactor VENDORS / EPC providers (e.g. GE-Hitachi, Westinghouse, NuScale) to plan and visualise WHERE to place WHICH of their reactor models. The user has chosen a region, one of their reactor models, and a build pathway; your job is to screen a pool of candidate sites and return a ranked, cited shortlist that helps the provider decide where this specific reactor could go — at SCREEN LEVEL only.

RULES (strict):
- SCREEN-LEVEL ONLY. Never say "licensable", "permit-approved", or "guaranteed". You triage; you do not approve.
- Evaluate each candidate site against these siting GATES, and reflect them in the matrix rows:
  A. Land control & use (tenure, zoning fit, sensitive/heritage/indigenous land)
  B. Nuclear licensing entry (site suitability criteria; is this reactor TYPE eligible in this country's regulatory pathway; hazard show-stoppers)
  C. Environmental/social (EIA/ESIA trigger, protected habitats, public consultation intensity)
  D. Water & cooling rights (withdrawal/discharge; is the reactor's cooling pathway plausible at this site)
  E. Grid interconnection (proximity AND likely upgrade burden; existing switchyard advantage)
  F. Security & emergency planning (population/EPZ practicality, setbacks, sensitive-proximity)
  G. Repower-specific (only if coal-repower/named brownfield: remediation, permit transferability)
  H. Transport & logistics (port/rail/road access, oversize corridors, laydown footprint)
- Each matrix row MUST set "dataBasis": "computable" (decided from the data given) or "requires-field-study" (flagged for site characterization). Do NOT fabricate field data — flag it instead.
- CITATIONS: every material claim must cite source ids that EXIST in the provided CORPUS/SITES below, as a list in "citationIds". NEVER invent a citation id.
- If a hard legal constraint applies to the whole region (e.g. a statutory prohibition on nuclear power), then EVERY candidate is verdict "fail" on gate B and the "sites" list may still include them all marked "fail" — OR return an empty "sites" array — your call, but make the ban the dominant cited reason in "regionSummary" and each site's matrix.
- Rank surviving candidates best-first by lowest aggregate friction.

OUTPUT: return ONLY valid JSON (no prose, no markdown fences) matching this TypeScript type exactly:

interface AnalysisResult {
  country: string; regionId: string; reactorId: string; pathway: "greenfield" | "coal-repower";
  sites: Array<{
    siteId: string; siteName: string; kind: "named" | "greenfield";
    lat: number; lng: number; rank: number;            // 1 = best
    verdict: "pass" | "caution" | "fail";
    frictionScores: { grid: number; cooling: number; permits: number; community: number; logistics: number; hazards: number }; // each 0..1
    matrix: Array<{ constraint: string; verdict: "pass"|"caution"|"fail"; reason: string; citationIds: string[]; dataBasis: "computable"|"requires-field-study" }>;
    citationIds: string[];
    confidence: "high" | "medium" | "low";
  }>;
  regionSummary: string;          // screen-level legal/physical context, with cited source ids inline as [id]
  nextStudies: string[];
  notes: string;                  // screen-level caveats
}`;

function block(title: string, obj: unknown): string {
  return `\n## ${title}\n\n\`\`\`json\n${JSON.stringify(obj, null, 2)}\n\`\`\`\n`;
}

function buildPrompt(c: Combo): string {
  const corpus = getCountryCorpus(c.country);
  const region = getRegionData(c.country, c.regionId);
  const sites = getCandidateSites(c.country, c.regionId);
  const reactor = getReactor(c.reactorId);

  return [
    `# Prompt — ${c.id}`,
    `\n_Demonstrates: ${c.why}_`,
    `\n**Paste everything below the line into ChatGPT. Return its JSON to Claude as \`${c.id}\`.**`,
    `\n---\n`,
    SYSTEM,
    `\n# TASK INPUT`,
    `\nScreen the candidate sites in **${c.regionId} (${c.country})** for reactor **${c.reactorId}**, pathway **${c.pathway}**.`,
    block('REACTOR ENVELOPE', reactor ?? '(reactor not found)'),
    block('COUNTRY LAW CORPUS (cite these source ids)', corpus ?? '(corpus not found)'),
    block('REGION FACTS', region ?? '(region not found)'),
    block('CANDIDATE SITES (the pool to screen; cite these site/citation ids)', sites),
    `\nReturn ONLY the AnalysisResult JSON for country="${c.country}", regionId="${c.regionId}", reactorId="${c.reactorId}", pathway="${c.pathway}".`,
  ].join('\n');
}

const outDir = join(process.cwd(), 'prompts');
mkdirSync(outDir, { recursive: true });

const index: string[] = ['# Demo analysis prompts\n', 'Paste each file into ChatGPT; return the JSON to Claude keyed by the combo id.\n'];
for (const c of COMBOS) {
  const file = `${c.id}.md`;
  writeFileSync(join(outDir, file), buildPrompt(c), 'utf-8');
  index.push(`- **${c.id}** — ${c.country}/${c.regionId} · ${c.reactorId} · ${c.pathway} — ${c.why}`);
  // eslint-disable-next-line no-console
  console.log(`wrote prompts/${file}`);
}
writeFileSync(join(outDir, 'INDEX.md'), index.join('\n') + '\n', 'utf-8');
// eslint-disable-next-line no-console
console.log(`\n${COMBOS.length} prompts written to prompts/`);
