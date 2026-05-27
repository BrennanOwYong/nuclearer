/**
 * SiteResults — renders ranked SiteScreening[] cards from an AnalysisResult.
 * Shows: rank, site name + kind badge, verdict badge, friction bars (clamped ≤100%),
 * matrix rows with citation links, regionSummary, nextStudies, and onFocusSite callback.
 */
import React from 'react';
import type { AnalysisResult, SiteScreening, FrictionCategory, Verdict } from '../types';
import { frictionBarWidth } from './utils';

const FRICTION_LABELS: Record<FrictionCategory, string> = {
  grid: 'Grid',
  cooling: 'Cooling',
  permits: 'Permits',
  community: 'Community',
  logistics: 'Logistics',
  hazards: 'Hazards',
};

const FRICTION_CATEGORIES: FrictionCategory[] = [
  'grid',
  'cooling',
  'permits',
  'community',
  'logistics',
  'hazards',
];

function verdictClass(v: Verdict): string {
  return `verdict-badge verdict-badge--${v}`;
}

interface CitationLinksProps {
  citationIds: string[];
  /** Flat lookup: id → url. Build from corpus before rendering. */
  urlMap: Record<string, string>;
}

function CitationLinks({ citationIds, urlMap }: CitationLinksProps): React.ReactElement | null {
  if (!citationIds || citationIds.length === 0) return null;
  return (
    <span className="citation-links">
      {citationIds.map((id) => {
        const url = urlMap[id];
        return url ? (
          <a
            key={id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="citation-link"
            data-testid={`citation-link-${id}`}
          >
            [{id}]
          </a>
        ) : (
          <span key={id} className="citation-link citation-link--missing">
            [{id}]
          </span>
        );
      })}
    </span>
  );
}

interface SiteCardProps {
  site: SiteScreening;
  urlMap: Record<string, string>;
  onFocusSite: (siteId: string) => void;
}

function SiteCard({ site, urlMap, onFocusSite }: SiteCardProps): React.ReactElement {
  return (
    <div
      className={`site-card site-card--${site.verdict}`}
      data-testid={`site-card-${site.siteId}`}
      onClick={() => onFocusSite(site.siteId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onFocusSite(site.siteId);
      }}
      aria-label={`Site ${site.rank}: ${site.siteName} — ${site.verdict}`}
    >
      {/* Header row */}
      <div className="site-card-header">
        <span className="site-rank">#{site.rank}</span>
        <span className="site-name">{site.siteName}</span>
        <span className={`kind-badge kind-badge--${site.kind}`} data-testid={`kind-badge-${site.siteId}`}>
          {site.kind}
        </span>
        <span className={verdictClass(site.verdict)} data-testid={`verdict-badge-${site.siteId}`}>
          {site.verdict.toUpperCase()}
        </span>
      </div>

      {/* Friction bars */}
      <div className="friction-bars" data-testid={`friction-bars-${site.siteId}`}>
        {FRICTION_CATEGORIES.map((cat) => {
          const score = site.frictionScores[cat] ?? 0;
          const width = frictionBarWidth(score);
          return (
            <div key={cat} className="friction-row">
              <span className="friction-label">{FRICTION_LABELS[cat]}</span>
              <div className="friction-track" role="progressbar" aria-valuenow={Math.round(score * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div
                  className={`friction-fill friction-fill--${score > 0.66 ? 'high' : score > 0.33 ? 'mid' : 'low'}`}
                  style={{ width }}
                  data-testid={`friction-${site.siteId}-${cat}`}
                />
              </div>
              <span className="friction-pct">{Math.round(score * 100)}%</span>
            </div>
          );
        })}
      </div>

      {/* Matrix reasons */}
      {site.matrix && site.matrix.length > 0 && (
        <div className="site-matrix" data-testid={`matrix-${site.siteId}`}>
          {site.matrix.map((row, i) => (
            <div
              key={i}
              className={`matrix-row matrix-row--${row.verdict}`}
              data-testid={`matrix-row-${site.siteId}-${i}`}
            >
              <span className="matrix-constraint">{row.constraint}</span>
              <span className={`matrix-verdict matrix-verdict--${row.verdict}`}>{row.verdict}</span>
              <span className="matrix-reason">{row.reason}</span>
              <CitationLinks citationIds={row.citationIds} urlMap={urlMap} />
            </div>
          ))}
        </div>
      )}

      <div className="site-confidence">
        Confidence: <em>{site.confidence}</em>
      </div>
    </div>
  );
}

export interface SiteResultsProps {
  result: AnalysisResult;
  /** All-sources URL map built from corpus. id → url */
  citationUrlMap: Record<string, string>;
  onFocusSite: (siteId: string) => void;
}

export function SiteResults({
  result,
  citationUrlMap,
  onFocusSite,
}: SiteResultsProps): React.ReactElement {
  const hasSites = result.sites && result.sites.length > 0;

  return (
    <div className="site-results" data-testid="site-results">
      {/* Region summary */}
      <p className="region-summary" data-testid="region-summary">
        {result.regionSummary}
      </p>

      {/* No viable sites (e.g. Australia ban) */}
      {!hasSites && (
        <div className="no-sites" data-testid="no-viable-sites">
          <span className="no-sites-icon">⚠</span>
          <strong>No viable sites</strong>
          <p>
            No candidate sites passed screening for this region, reactor, and pathway combination.
            This may indicate a statutory prohibition (e.g. Australia's EPBC/ARPANS ban) or that
            the reactor's envelope cannot be met by available land in this region.
          </p>
        </div>
      )}

      {/* Ranked site cards */}
      {hasSites && (
        <div className="site-cards" data-testid="site-cards">
          {result.sites.map((site) => (
            <SiteCard
              key={site.siteId}
              site={site}
              urlMap={citationUrlMap}
              onFocusSite={onFocusSite}
            />
          ))}
        </div>
      )}

      {/* Next studies */}
      {result.nextStudies && result.nextStudies.length > 0 && (
        <div className="next-studies" data-testid="next-studies">
          <h4 className="next-studies-title">Next Studies</h4>
          <ul>
            {result.nextStudies.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {result.notes && (
        <p className="result-notes" data-testid="result-notes">
          <em>{result.notes}</em>
        </p>
      )}
    </div>
  );
}
