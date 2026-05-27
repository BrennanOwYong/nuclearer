/**
 * Dashboard — floating panel bottom-left, overlapping the globe.
 * Composes PanelMenu (region context) + SiteFinder + SiteResults.
 *
 * Props: { country, regionId } from globe selection (lifted in App.tsx).
 */
import React, { useState, useCallback, useMemo } from 'react';
import type { AnalysisResult } from '../types';
import { getCountryCorpus, getRegionData, getReactors } from '../data/index';
import { PanelMenu } from './PanelMenu';
import { SiteFinder } from './SiteFinder';
import { SiteResults } from './SiteResults';

export interface DashboardProps {
  country: string | null;
  regionId: string | null;
}

type Tab = 'context' | 'find';

// Build a flat citationId → url map from a corpus for SiteResults link resolution.
function buildCitationUrlMap(corpus: ReturnType<typeof getCountryCorpus>): Record<string, string> {
  if (!corpus) return {};
  return Object.fromEntries(corpus.sources.map((s) => [s.id, s.url]));
}

export function Dashboard({ country, regionId }: DashboardProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('context');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const corpus = useMemo(
    () => (country ? getCountryCorpus(country) : undefined),
    [country],
  );
  const region = useMemo(
    () => (country && regionId ? getRegionData(country, regionId) : undefined),
    [country, regionId],
  );
  const reactors = useMemo(() => getReactors(), []);
  const citationUrlMap = useMemo(() => buildCitationUrlMap(corpus), [corpus]);

  const handleResult = useCallback((r: AnalysisResult) => {
    setResult(r);
    setError(null);
    setActiveTab('find');
  }, []);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setResult(null);
  }, []);

  const handleLoading = useCallback((l: boolean) => {
    setLoading(l);
  }, []);

  const handleFocusSite = useCallback((siteId: string) => {
    // F2b will wire globe pin focus via a prop/callback. For now expose via window for E2E.
    if (typeof window !== 'undefined') {
      (window as unknown as { __lastFocusSite?: string }).__lastFocusSite = siteId;
    }
  }, []);

  // Region name for header
  const regionName = region?.regionName ?? regionId ?? null;

  return (
    <div
      className="dashboard"
      data-testid="dashboard"
      role="complementary"
      aria-label="Site Finder Dashboard"
    >
      {/* Header */}
      <div className="dashboard-header">
        <span className="dashboard-title">Nuclear Site Finder</span>
        {regionName && (
          <span className="dashboard-region" data-testid="dashboard-region-name">
            {regionName}
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="dashboard-tabs" role="tablist">
        <button
          className={`dashboard-tab${activeTab === 'context' ? ' dashboard-tab--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'context'}
          onClick={() => setActiveTab('context')}
          data-testid="tab-context"
        >
          Region Context
        </button>
        <button
          className={`dashboard-tab${activeTab === 'find' ? ' dashboard-tab--active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'find'}
          onClick={() => setActiveTab('find')}
          data-testid="tab-find"
        >
          Find Sites
        </button>
      </div>

      {/* Tab content */}
      <div className="dashboard-body">
        {activeTab === 'context' && (
          <PanelMenu
            country={country}
            regionId={regionId}
            corpus={corpus}
            region={region}
          />
        )}

        {activeTab === 'find' && (
          <div className="find-tab-content">
            <SiteFinder
              country={country}
              regionId={regionId}
              reactors={reactors}
              onResult={handleResult}
              onError={handleError}
              onLoading={handleLoading}
            />

            {loading && (
              <div className="find-loading" data-testid="find-loading">
                Screening candidate sites…
              </div>
            )}

            {error && (
              <div className="find-error" data-testid="find-error">
                <strong>Error:</strong> {error}
                {error.includes('501') && (
                  <span className="find-error-note">
                    {' '}(Site screening engine not yet deployed — check back after F5a lands.)
                  </span>
                )}
              </div>
            )}

            {result && !loading && (
              <SiteResults
                result={result}
                citationUrlMap={citationUrlMap}
                onFocusSite={handleFocusSite}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
