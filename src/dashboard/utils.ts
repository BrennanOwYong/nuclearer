/**
 * Pure utility helpers for the finder dashboard.
 * No side effects, no React imports — safe to test with plain Vitest.
 */

import type { FactCategory, RegionFact, SourceSnippet, CountryCorpus, RegionData } from '../types';

// ── Category grouping ────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<FactCategory, string> = {
  land: 'Land & Infrastructure',
  grid: 'Land & Infrastructure',
  water: 'Land & Infrastructure',
  hazard: 'Hazards & Cooling',
  population: 'Land & Infrastructure',
  pathway: 'Legal-RulePack',
};

export interface FactGroup {
  groupLabel: string;
  facts: RegionFact[];
}

/**
 * Groups a flat RegionFact[] into display groups ordered:
 * 1. Land & Infrastructure  2. Legal-RulePack  3. Hazards & Cooling  4. Pathway
 */
export function groupFactsByCategory(facts: RegionFact[]): FactGroup[] {
  const ORDER = ['Land & Infrastructure', 'Legal-RulePack', 'Hazards & Cooling'];
  const map = new Map<string, RegionFact[]>();
  for (const fact of facts) {
    const label = CATEGORY_LABELS[fact.category] ?? fact.category;
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(fact);
  }
  // Sort by declared order, appending any unknown groups after.
  const groups: FactGroup[] = [];
  for (const grpLabel of ORDER) {
    const grpFacts = map.get(grpLabel);
    if (grpFacts && grpFacts.length > 0) groups.push({ groupLabel: grpLabel, facts: grpFacts });
  }
  for (const [grpLabel, grpFacts] of map) {
    if (!ORDER.includes(grpLabel) && grpFacts.length > 0) groups.push({ groupLabel: grpLabel, facts: grpFacts });
  }
  return groups;
}

// ── Citation resolution ──────────────────────────────────────────────────────

/**
 * Resolves a citationId string to the matching SourceSnippet from a corpus,
 * checking both CountryCorpus.sources and (optionally) a merged list.
 * Returns undefined on miss — never throws.
 */
export function resolveCitation(
  id: string,
  corpus: CountryCorpus | undefined,
  extra?: SourceSnippet[],
): SourceSnippet | undefined {
  if (!id) return undefined;
  const all = [...(corpus?.sources ?? []), ...(extra ?? [])];
  return all.find((s) => s.id === id);
}

// ── Friction bar width clamping ──────────────────────────────────────────────

/**
 * Clamps a friction score (0..1) to a CSS-safe width string like "73%".
 * Guarantees output is always in [0, 100].
 */
export function frictionBarWidth(score: number): string {
  const pct = Math.min(100, Math.max(0, Math.round(score * 100)));
  return `${pct}%`;
}

// ── Reactor catalog grouping ─────────────────────────────────────────────────

import type { ReactorModel, ReactorTechnology } from '../types';

export const TECHNOLOGY_LABELS: Record<ReactorTechnology, string> = {
  PWR: 'Large PWR',
  BWR: 'BWR (SMR)',
  iPWR: 'Integral PWR (SMR)',
  HTGR: 'HTGR (gas-cooled)',
  SFR: 'Sodium Fast Reactor',
  MSR: 'Molten Salt Reactor',
  microreactor: 'Microreactor',
};

export interface TechGroup {
  technology: ReactorTechnology;
  label: string;
  companies: CompanyGroup[];
}

export interface CompanyGroup {
  company: string;
  models: ReactorModel[];
}

/**
 * Groups a ReactorModel[] by technology → company → models (cascading picker data).
 */
export function groupReactorsByTech(reactors: ReactorModel[]): TechGroup[] {
  const techMap = new Map<ReactorTechnology, Map<string, ReactorModel[]>>();
  for (const reactor of reactors) {
    if (!techMap.has(reactor.technology)) techMap.set(reactor.technology, new Map());
    const compMap = techMap.get(reactor.technology)!;
    if (!compMap.has(reactor.company)) compMap.set(reactor.company, []);
    compMap.get(reactor.company)!.push(reactor);
  }

  const result: TechGroup[] = [];
  for (const [tech, compMap] of techMap) {
    const companies: CompanyGroup[] = [];
    for (const [company, models] of compMap) {
      companies.push({ company, models });
    }
    result.push({
      technology: tech,
      label: TECHNOLOGY_LABELS[tech] ?? tech,
      companies,
    });
  }
  return result;
}

// ── Ban detection ─────────────────────────────────────────────────────────────

/**
 * Returns true if the region data contains any pathway fact with 'prohibited' or 'ban' in its value (case-insensitive).
 */
export function regionHasBan(region: RegionData | undefined): boolean {
  if (!region) return false;
  return region.facts.some(
    (f) =>
      f.category === 'pathway' &&
      (f.value.toLowerCase().includes('prohibited') || f.value.toLowerCase().includes('ban')),
  );
}
