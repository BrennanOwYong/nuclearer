/**
 * Panel — single expandable region-fact card with optional citation link.
 */
import React, { useState } from 'react';
import type { RegionFact, SourceSnippet } from '../types';

export interface PanelProps {
  fact: RegionFact;
  citation?: SourceSnippet;
  isBanFact?: boolean;
}

export function Panel({ fact, citation, isBanFact = false }: PanelProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`panel-card${isBanFact ? ' panel-card--ban' : ''}`}
      data-testid={`panel-${fact.id}`}
    >
      <button
        className="panel-header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`panel-body-${fact.id}`}
      >
        <span className="panel-label">{fact.label}</span>
        <span className="panel-value" title={fact.value}>
          {isBanFact ? '⚠ ' : ''}
          {fact.value}
        </span>
        <span className="panel-chevron" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="panel-body" id={`panel-body-${fact.id}`}>
          <p className="panel-detail">{fact.detail}</p>
          {citation && (
            <a
              className="panel-cite-link"
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`cite-link-${citation.id}`}
            >
              {citation.citation}
              {citation.section ? ` § ${citation.section}` : ''} ({citation.year})
            </a>
          )}
          <span className={`panel-confidence panel-confidence--${fact.confidence}`}>
            {fact.confidence} confidence
          </span>
        </div>
      )}
    </div>
  );
}
