/**
 * PanelMenu — grouped expandable panel menu for region context
 * (Land & Infrastructure / Legal-RulePack / Hazards & Cooling).
 */
import React, { useState } from 'react';
import type { CountryCorpus, RegionData } from '../types';
import { Panel } from './Panel';
import { groupFactsByCategory, resolveCitation, regionHasBan } from './utils';

export interface PanelMenuProps {
  country: string | null;
  regionId: string | null;
  corpus: CountryCorpus | undefined;
  region: RegionData | undefined;
}

export function PanelMenu({ country, regionId, corpus, region }: PanelMenuProps): React.ReactElement {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['Legal-RulePack']));

  function toggleGroup(label: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  // No region selected
  if (!country || !regionId) {
    return (
      <div className="panel-menu panel-menu--empty" data-testid="panel-menu-empty">
        <p className="panel-menu-hint">Click a region on the globe to see site context.</p>
      </div>
    );
  }

  // Region selected but no rich data
  if (!region || !region.hasRichData) {
    return (
      <div className="panel-menu panel-menu--limited" data-testid="panel-menu-limited">
        <p className="panel-menu-hint">
          Limited data for this region. Select a flagship region (Wyoming, Illinois, South Australia, etc.).
        </p>
      </div>
    );
  }

  const hasBan = regionHasBan(region);
  const groups = groupFactsByCategory(region.facts);

  return (
    <div className="panel-menu" data-testid="panel-menu">
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
