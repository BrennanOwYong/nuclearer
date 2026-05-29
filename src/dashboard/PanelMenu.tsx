/**
 * PanelMenu — grouped expandable panel menu for region context
 * (Land & Infrastructure / Legal-RulePack / Hazards & Cooling).
 */
import React, { useState } from 'react';
import type { CountryCorpus, RegionData } from '../types';
import { Panel } from './Panel';
import { groupFactsByCategory, resolveCitation, regionHasBan } from './utils';

export interface FlagshipRegion {
  country: string;
  regionId: string;
  regionName: string;
}

export interface PanelMenuProps {
  country: string | null;
  regionId: string | null;
  corpus: CountryCorpus | undefined;
  region: RegionData | undefined;
  flagshipRegions?: FlagshipRegion[];
  onSelectRegion?: (country: string, regionId: string, regionName: string) => void;
}

// ISO alpha-3 → display name for grouping the roster.
const COUNTRY_NAMES: Record<string, string> = {
  USA: 'United States',
  POL: 'Poland',
  AUS: 'Australia',
};

export function PanelMenu({
  country,
  regionId,
  corpus,
  region,
  flagshipRegions = [],
  onSelectRegion,
}: PanelMenuProps): React.ReactElement {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['Legal-RulePack']));

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  // Roster of all flagship regions that have candidate land — always shown so the
  // user can pick a region without hunting on the globe.
  const byCountry = flagshipRegions.reduce<Record<string, FlagshipRegion[]>>((acc, r) => {
    (acc[r.country] ??= []).push(r);
    return acc;
  }, {});

  const roster = flagshipRegions.length > 0 && (
    <div className="region-roster" data-testid="region-roster">
      <div className="region-roster-title">Regions with available siting data</div>
      {Object.entries(byCountry).map(([cc, regions]) => (
        <div key={cc} className="region-roster-country">
          <span className="region-roster-country-label">{COUNTRY_NAMES[cc] ?? cc}</span>
          <div className="region-roster-chips">
            {regions.map((r) => (
              <button
                key={r.regionId}
                className={`region-chip${r.regionId === regionId ? ' region-chip--active' : ''}`}
                onClick={() => onSelectRegion?.(r.country, r.regionId, r.regionName)}
                data-testid={`region-chip-${r.regionId}`}
                aria-pressed={r.regionId === regionId}
              >
                {r.regionName}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // No region selected yet — show the roster + a prompt.
  if (!country || !regionId) {
    return (
      <div className="panel-menu" data-testid="panel-menu-empty">
        {roster}
        <p className="panel-menu-hint">Pick a region above (or click the globe) to see its siting context.</p>
      </div>
    );
  }

  // Region selected but no rich data
  if (!region || !region.hasRichData) {
    return (
      <div className="panel-menu" data-testid="panel-menu-limited">
        {roster}
        <p className="panel-menu-hint">
          Limited data for this region. Pick a flagship region above.
        </p>
      </div>
    );
  }

  const hasBan = regionHasBan(region);
  const groups = groupFactsByCategory(region.facts);

  return (
    <div className="panel-menu" data-testid="panel-menu">
      {roster}
      {hasBan && (
        <div className="panel-menu-ban-alert" data-testid="ban-alert">
          <span>⚠ Statutory prohibition — nuclear power banned in this jurisdiction.</span>
        </div>
      )}
      {groups.map((group) => (
        <div key={group.groupLabel} className="panel-group">
          <button
            className="panel-group-header"
            onClick={() => toggleGroup(group.groupLabel)}
            aria-expanded={openGroups.has(group.groupLabel)}
          >
            <span>{group.groupLabel}</span>
            <span aria-hidden="true">{openGroups.has(group.groupLabel) ? '▲' : '▼'}</span>
          </button>
          {openGroups.has(group.groupLabel) && (
            <div className="panel-group-body">
              {group.facts.map((fact) => {
                const citation = fact.citationId
                  ? resolveCitation(fact.citationId, corpus)
                  : undefined;
                const isBanFact =
                  fact.category === 'pathway' &&
                  (fact.value.toLowerCase().includes('prohibited') ||
                    fact.value.toLowerCase().includes('ban'));
                return (
                  <Panel
                    key={fact.id}
                    fact={fact}
                    citation={citation}
                    isBanFact={isBanFact}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
      {corpus && (
        <div className="panel-regulator" data-testid="panel-regulator">
          <span>Regulator: </span>
          <strong>{corpus.regulator}</strong>
        </div>
      )}
    </div>
  );
}
