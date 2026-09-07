/**
 * server/sitefinder.ts
 *
 * Deterministic (no LLM) site-finder engine — Stage 2.
 * screenSites() filters the candidate-site pool by reactor envelope + pathway,
 * scores friction per FrictionCategory, assigns verdicts, ranks, and builds
 * an AnalysisResult with templated MatrixRows + real citationIds.
 */

import type {
  ReactorModel,
  Pathway,
  CandidateSite,
  SiteScreening,
  SiteAttributes,
  FrictionCategory,
  Verdict,
  MatrixRow,
  AnalysisResult,
} from '../src/types';
import type { CountryCorpus, RegionData } from '../src/types';
import { extractCitationIds } from './citations';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Clamp a number to [0, 1]. */
function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Collect ALL valid citation ids from a corpus+region for use as the
 * validation set when running extractCitationIds.
 */
function buildValidIdSet(corpus: { country: CountryCorpus; region: RegionData }): Set<string> {
  const ids = new Set<string>();
  for (const s of corpus.country.sources) ids.add(s.id);
  for (const f of corpus.region.facts) {
    ids.add(f.id);
    if (f.citationId) ids.add(f.citationId);
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Friction scoring
// ---------------------------------------------------------------------------

interface FrictionResult {
  scores: Record<FrictionCategory, number>;
  hardFail: boolean;
  hardFailReasons: string[];
}

function scoreFriction(site: CandidateSite, reactor: ReactorModel): FrictionResult {
  const a: SiteAttributes = site.attributes;
  const scores: Partial<Record<FrictionCategory, number>> = {};
  let hardFail = false;
  const hardFailReasons: string[] = [];

  // ── grid ──────────────────────────────────────────────────────────────────
  // 0 km → 0 friction; 50 km → ~1 friction (major new line needed)
  scores.grid = clamp(a.gridDistanceKm / 50);

  // ── cooling ────────────────────────────────────────────────────────────────
  // "dry" reactors (HTGR, microreactor) are fine with waterAvailability:'none'
  // large PWR / BWR need at least 'limited'; truly need 'abundant' for full score
  const dryOkTechs: typeof reactor.technology[] = ['HTGR', 'microreactor'];
  const isDryOk = dryOkTechs.includes(reactor.technology);

  if (a.waterAvailability === 'none') {
    if (isDryOk) {
      scores.cooling = 0.1; // slight friction for dry-only
    } else {
      // physically impossible to cool this reactor without water
      hardFail = true;
      hardFailReasons.push('Insufficient cooling water: reactor requires water; site has none');
      scores.cooling = 1;
    }
  } else if (a.waterAvailability === 'limited') {
    scores.cooling = isDryOk ? 0.1 : 0.5;
  } else {
    // 'abundant'
    scores.cooling = 0;
  }

  // ── permits ────────────────────────────────────────────────────────────────
  if (a.protectedAreaFlag) {
    hardFail = true;
    hardFailReasons.push('Protected area: statutory siting restriction');
    scores.permits = 1;
  } else {
    // Land-status friction: brownfield < federal < crown/aboriginal
    const ls = a.landStatus.toLowerCase();
    if (ls.includes('brownfield') || ls.includes('retiring coal') || ls.includes('industrial')) {
      scores.permits = 0.1;
    } else if (ls.includes('blm') || ls.includes('federal') || ls.includes('state')) {
      scores.permits = 0.4;
    } else if (ls.includes('crown') || ls.includes('pastoral') || ls.includes('aboriginal')) {
      scores.permits = 0.6;
    } else {
      scores.permits = 0.3;
    }
  }

  // ── community ──────────────────────────────────────────────────────────────
  const communityMap: Record<typeof a.populationDensity, number> = {
    low: 0.1,
    medium: 0.45,
    high: 0.9,
  };
  scores.community = communityMap[a.populationDensity];

  // ── logistics (footprint) ──────────────────────────────────────────────────
  const footprintNeeded = reactor.footprintHectares;
  const footprintAvail = a.availableFootprintHectares;
  if (footprintAvail < footprintNeeded) {
    hardFail = true;
    hardFailReasons.push(
      `Insufficient footprint: reactor needs ${footprintNeeded} ha; site has ${footprintAvail} ha`,
    );
    scores.logistics = 1;
  } else {
    // Comfortable surplus → low friction; tight → higher
    const ratio = footprintNeeded / footprintAvail; // 0 → very comfortable; 1 → exact fit
    scores.logistics = clamp(ratio * 0.5); // max 0.5 friction for exact fit
  }

  // ── hazards ────────────────────────────────────────────────────────────────
  let hazardScore = 0;
  for (const h of a.hazards) {
    if (h.includes('high') || h.includes('extreme')) hazardScore += 0.35;
    else if (h.includes('moderate') || h.includes('medium')) hazardScore += 0.2;
    else hazardScore += 0.05; // low
  }
  scores.hazards = clamp(hazardScore);

  return {
    scores: scores as Record<FrictionCategory, number>,
    hardFail,
    hardFailReasons,
  };
}

// ---------------------------------------------------------------------------
// Australia legal ban detection
// ---------------------------------------------------------------------------

/** True if the corpus contains the EPBC s.140A or ARPANS s.10 prohibition. */
function hasAustralianNuclearBan(corpus: CountryCorpus): boolean {
  return corpus.sources.some(
    (s) => s.id === 'au-epbc-140a' || s.id === 'au-arpans-10',
  );
}

/** Collect the ban citation ids present in the corpus. */
function australianBanCitationIds(corpus: CountryCorpus): string[] {
  const banIds = ['au-epbc-140a', 'au-arpans-10', 'au-sa-prohibition'];
  return banIds.filter((id) => corpus.sources.some((s) => s.id === id));
}

// ---------------------------------------------------------------------------
// Pathway filter
// ---------------------------------------------------------------------------

function siteMatchesPathway(site: CandidateSite, pathway: Pathway): boolean {
  if (pathway === 'coal-repower') {
    // Must be a named brownfield/coal site
    return (
      site.kind === 'named' &&
      (site.attributes.landStatus.toLowerCase().includes('coal') ||
        site.attributes.landStatus.toLowerCase().includes('brownfield') ||
        site.attributes.landStatus.toLowerCase().includes('industrial'))
    );
  }
  // greenfield pathway: greenfield zones, but named sites can also apply
  return true;
}

// ---------------------------------------------------------------------------
// Verdict assignment
// ---------------------------------------------------------------------------

function assignVerdict(
  hardFail: boolean,
  legalBan: boolean,
  frictionScores: Record<FrictionCategory, number>,
): Verdict {
  if (legalBan || hardFail) return 'fail';
  const aggregate = Object.values(frictionScores).reduce((a, b) => a + b, 0);
  const avg = aggregate / Object.keys(frictionScores).length;
  if (avg <= 0.3) return 'pass';
  if (avg <= 0.6) return 'caution';
  return 'fail'; // very high aggregate friction also fails
}

// ---------------------------------------------------------------------------
// MatrixRow builder
// ---------------------------------------------------------------------------

function buildMatrixRows(
  site: CandidateSite,
  reactor: ReactorModel,
  friction: FrictionResult,
  validIds: Set<string>,
  legalBan: boolean,
  banCitationIds: string[],
): MatrixRow[] {
  const rows: MatrixRow[] = [];

  // ── Siting gate: legal / permits ──────────────────────────────────────────
  if (legalBan) {
    rows.push({
      constraint: 'Regulatory / Legal',
      verdict: 'fail',
      reason:
        `Statutory nuclear prohibition in force [${banCitationIds.join('] [')}]. ` +
        'No ministerial approval can be granted for construction or operation of a nuclear power plant.',
      citationIds: extractCitationIds(
        banCitationIds.map((id) => `[${id}]`).join(' '),
        validIds,
      ),
      dataBasis: 'computable',
    });
  } else if (site.attributes.protectedAreaFlag) {
    rows.push({
      constraint: 'Regulatory / Permits',
      verdict: 'fail',
      reason: 'Site falls within a protected or restricted area; NRC exclusion-area criteria cannot be satisfied.',
      citationIds: extractCitationIds('[us-nrc-10cfr100] [us-nrc-100-21]', validIds),
      dataBasis: 'computable',
    });
  } else {
    const permitVerdict: Verdict = friction.scores.permits <= 0.3 ? 'pass' : 'caution';
    rows.push({
      constraint: 'Regulatory / Permits',
      verdict: permitVerdict,
      reason:
        `Land status: "${site.attributes.landStatus}". ` +
        (permitVerdict === 'pass'
          ? 'Brownfield/industrial designation reduces permitting friction; successor-generator ROW may be available.'
          : 'Federal or Crown land requires additional regulatory review and environmental permitting.'),
      citationIds: extractCitationIds('[us-nrc-10cfr100] [us-nepa]', validIds),
      dataBasis: 'computable',
    });
  }

  // ── Siting gate: cooling / water ──────────────────────────────────────────
  {
    const coolingVerdict: Verdict =
      friction.hardFail && friction.hardFailReasons.some((r) => r.includes('cooling'))
        ? 'fail'
        : friction.scores.cooling <= 0.2
          ? 'pass'
          : 'caution';

    rows.push({
      constraint: 'Cooling Water Adequacy',
      verdict: coolingVerdict,
      reason:
        `Site cooling source: "${site.attributes.coolingSource}". Water availability: ${site.attributes.waterAvailability}. ` +
        `Reactor ${reactor.model} requires: ${reactor.waterNeeds}. ` +
        (coolingVerdict === 'fail'
          ? 'Water physically insufficient for this reactor technology at this site.'
          : coolingVerdict === 'caution'
            ? 'Limited water availability — dry/hybrid cooling required; field-verification of capacity needed.'
            : 'Sufficient cooling water available.'),
      citationIds: extractCitationIds('[us-cwa-316b] [wy-water-arid]', validIds),
      dataBasis: coolingVerdict === 'fail' ? 'computable' : 'requires-field-study',
    });
  }

  // ── Siting gate: footprint / logistics ────────────────────────────────────
  {
    const logisticsVerdict: Verdict =
      friction.hardFail && friction.hardFailReasons.some((r) => r.includes('footprint'))
        ? 'fail'
        : friction.scores.logistics <= 0.2
          ? 'pass'
          : 'caution';

    rows.push({
      constraint: 'Site Footprint',
      verdict: logisticsVerdict,
      reason:
        `Available footprint: ${site.attributes.availableFootprintHectares} ha. ` +
        `Reactor requires: ~${reactor.footprintHectares} ha. ` +
        (logisticsVerdict === 'fail'
          ? 'Site physically too small for this reactor.'
          : logisticsVerdict === 'caution'
            ? 'Footprint tight; layout optimization and on-site exclusion-area mapping required.'
            : 'Footprint comfortably accommodates reactor and exclusion area.'),
      citationIds: extractCitationIds('[us-nrc-10cfr100]', validIds),
      dataBasis: logisticsVerdict === 'fail' ? 'computable' : 'requires-field-study',
    });
  }

  // ── Siting gate: grid ─────────────────────────────────────────────────────
  {
    const gridVerdict: Verdict =
      friction.scores.grid <= 0.1 ? 'pass' : friction.scores.grid <= 0.5 ? 'caution' : 'fail';

    rows.push({
      constraint: 'Grid Interconnection',
      verdict: gridVerdict,
      reason:
        `Distance to suitable transmission: ${site.attributes.gridDistanceKm} km. ` +
        (gridVerdict === 'pass'
          ? 'Existing HV switchyard on-site or immediately adjacent — minimal interconnection cost.'
          : gridVerdict === 'caution'
            ? 'New transmission line segment required; interconnection study and queue position needed.'
            : 'Significant new transmission infrastructure required.'),
      citationIds: extractCitationIds('[wy-grid-baseload]', validIds),
      dataBasis: gridVerdict === 'fail' ? 'requires-field-study' : 'computable',
    });
  }

  // ── Siting gate: community / exclusion zone ───────────────────────────────
  {
    const communityVerdict: Verdict =
      friction.scores.community <= 0.2 ? 'pass' : friction.scores.community <= 0.6 ? 'caution' : 'fail';

    rows.push({
      constraint: 'Population / Exclusion Zone',
      verdict: communityVerdict,
      reason:
        `Population density: ${site.attributes.populationDensity}. ` +
        (communityVerdict === 'pass'
          ? 'Very low population density; 10 CFR 100 exclusion area and LPZ readily satisfied.'
          : communityVerdict === 'caution'
            ? 'Medium density — EPZ planning and community engagement required; LPZ analysis needed.'
            : 'High population density; EPZ radius would encompass large populations.'),
      citationIds: extractCitationIds('[us-nrc-100-21]', validIds),
      dataBasis: communityVerdict === 'fail' ? 'computable' : 'requires-field-study',
    });
  }

  // ── Siting gate: hazards ──────────────────────────────────────────────────
  {
    const hazardVerdict: Verdict =
      friction.scores.hazards <= 0.1 ? 'pass' : friction.scores.hazards <= 0.4 ? 'caution' : 'fail';

    rows.push({
      constraint: 'Natural Hazards',
      verdict: hazardVerdict,
      reason:
        `Identified hazards: ${site.attributes.hazards.length > 0 ? site.attributes.hazards.join(', ') : 'none identified'}. ` +
        (hazardVerdict === 'pass'
          ? 'Low hazard profile; site-specific geotechnical characterization required under 10 CFR 100.'
          : hazardVerdict === 'caution'
            ? 'Moderate hazards present; detailed probabilistic risk assessment and foundation engineering required.'
            : 'High hazard(s) may preclude or substantially complicate siting.'),
      citationIds: extractCitationIds('[us-nrc-10cfr100] [wy-hazard-seismic]', validIds),
      dataBasis: 'requires-field-study',
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Main export: screenSites
// ---------------------------------------------------------------------------

/**
 * Deterministic site-finder engine (Stage 2, no LLM).
 *
 * @param reactor  The selected reactor model.
 * @param pathway  'greenfield' | 'coal-repower'.
 * @param sites    Prepared candidate-site pool for the region.
 * @param corpus   Country + region corpus (for legal checks and citation ids).
 * @returns        Ranked SiteScreening[]; empty when all fail (e.g. Australia ban).
 */
export function screenSites(
  reactor: ReactorModel,
  pathway: Pathway,
  sites: CandidateSite[],
  corpus: { country: CountryCorpus; region: RegionData },
): SiteScreening[] {
  const validIds = buildValidIdSet(corpus);
  const legalBan = hasAustralianNuclearBan(corpus.country);
  const banCitationIds = legalBan ? australianBanCitationIds(corpus.country) : [];

  // Filter by technology compatibility and pathway
  const candidates = sites.filter((site) => {
    if (!site.suitableTechnologies.includes(reactor.technology)) return false;
    if (!siteMatchesPathway(site, pathway)) return false;
    return true;
  });

  // Score, assess verdict, build screening results
  const screened: Array<SiteScreening & { aggregate: number }> = candidates.map((site) => {
    const friction = scoreFriction(site, reactor);
    const verdict = assignVerdict(friction.hardFail, legalBan, friction.scores);
    const matrix = buildMatrixRows(site, reactor, friction, validIds, legalBan, banCitationIds);

    // Collect site citation ids (from site data + matrix rows), validate them
    const allCiteText = [
      ...site.citationIds.map((id) => `[${id}]`),
      ...matrix.flatMap((row) => row.citationIds.map((id) => `[${id}]`)),
    ].join(' ');
    const citationIds = extractCitationIds(allCiteText, validIds);

    const aggregate = Object.values(friction.scores).reduce((a, b) => a + b, 0);

    return {
      siteId: site.id,
      siteName: site.name,
      kind: site.kind,
      lat: site.lat,
      lng: site.lng,
      rank: 0, // assigned after sort
      verdict,
      frictionScores: friction.scores,
      matrix,
      citationIds,
      confidence: site.confidence,
      aggregate,
    };
  });

  // Rank ascending by aggregate friction (rank 1 = best / lowest friction)
  screened.sort((a, b) => a.aggregate - b.aggregate);
  screened.forEach((s, i) => {
    s.rank = i + 1;
  });

  // Return only non-fail sites if any pass/caution; for Australia return all (all-fail)
  // For display purposes we always return all screened (including fails) — the UI can filter.
  // Per spec: sites:[] means no viable sites → return empty array when ban is in force
  // and there are no pass/caution sites (which will be all of them for Australia).
  if (legalBan) {
    return []; // statutory ban → 0 viable sites per spec
  }

  // Strip internal aggregate field before returning
  return screened.map(({ aggregate: _aggregate, ...rest }) => rest);
}

// ---------------------------------------------------------------------------
// buildAnalysisResult
// ---------------------------------------------------------------------------

/**
 * Builds the full AnalysisResult from screenSites output + corpus.
 */
export function buildAnalysisResult(
  country: string,
  regionId: string,
  reactor: ReactorModel,
  pathway: Pathway,
  sites: SiteScreening[],
  corpus: { country: CountryCorpus; region: RegionData },
  legalBan: boolean,
  _banCitationIds: string[],
): AnalysisResult {
  const regionName = corpus.region.regionName;

  const regionSummary = legalBan
    ? `${regionName} (${country}) is subject to a federal statutory prohibition on nuclear power plant ` +
      `construction and operation. The EPBC Act 1999 s.140A [au-epbc-140a] bars ministerial approval ` +
      `for any nuclear power plant. The ARPANS Act 1998 s.10 [au-arpans-10] bars ARPANSA from issuing ` +
      `a licence for construction or operation of a nuclear power plant. No siting assessment can ` +
      `proceed until these prohibitions are repealed by the Australian Parliament. 0 viable sites identified.`
    : `${regionName} (${country}) — screen-level siting assessment for ${reactor.company} ${reactor.model} ` +
      `(${reactor.technology}, ${reactor.outputMW} MW, ~${reactor.footprintHectares} ha footprint). ` +
      `Pathway: ${pathway}. ` +
      `${sites.length} candidate site(s) assessed. ` +
      `${sites.filter((s) => s.verdict === 'pass').length} pass, ` +
      `${sites.filter((s) => s.verdict === 'caution').length} caution, ` +
      `${sites.filter((s) => s.verdict === 'fail').length} fail. ` +
      `All results are screen-level only and require field study, NRC/regulatory review, and independent verification.`;

  const nextStudies = legalBan
    ? [
        'Monitor Australian parliamentary process for potential repeal of EPBC s.140A and ARPANS s.10.',
        'Track Coalition nuclear policy developments and any legislative reform timeline.',
      ]
    : [
        'Site-specific geotechnical and seismic characterization (10 CFR Part 100 / equivalent).',
        'Cooling water availability and intake permitting study (CWA §316(b) / equivalent).',
        'Grid interconnection feasibility study with WECC/relevant ISO.',
        'Environmental Impact Statement scoping under NEPA (or equivalent).',
        'Community engagement and socioeconomic impact assessment.',
        `Reactor vendor pre-application consultation with ${reactor.company}.`,
      ];

  const notes = legalBan
    ? `SCREEN-LEVEL ONLY. Statutory prohibition (EPBC s.140A [au-epbc-140a]; ARPANS s.10 [au-arpans-10]) ` +
      `renders all physical siting merits moot. This is a legal constraint, not a physical one — ` +
      `these sites are NOT marked as physical fails.`
    : `SCREEN-LEVEL ONLY. All results are indicative and based on prepared candidate-site attribute layers. ` +
      `No site has been independently surveyed or licensed. Figures labeled "executor must verify" require ` +
      `field confirmation before use in formal siting studies. Confidence ratings reflect data-layer quality, ` +
      `not regulatory approval likelihood.`;

  return {
    country,
    regionId,
    reactorId: reactor.id,
    pathway,
    sites,
    regionSummary,
    nextStudies,
    notes,
  };
}
