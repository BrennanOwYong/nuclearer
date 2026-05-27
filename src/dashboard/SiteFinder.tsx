/**
 * SiteFinder — reactor picker (technology → company → model) + pathway select + "Find sites" button.
 * Calls postAnalyze and surfaces result (or error/loading) via callbacks.
 */
import React, { useState, useCallback } from 'react';
import type { ReactorModel, ReactorTechnology, Pathway, AnalysisResult } from '../types';
import { groupReactorsByTech } from './utils';
import { postAnalyze } from '../api';

export interface SiteFinderProps {
  country: string | null;
  regionId: string | null;
  reactors: ReactorModel[];
  onResult: (result: AnalysisResult) => void;
  onError: (msg: string) => void;
  onLoading: (loading: boolean) => void;
}

export function SiteFinder({
  country,
  regionId,
  reactors,
  onResult,
  onError,
  onLoading,
}: SiteFinderProps): React.ReactElement {
  const techGroups = groupReactorsByTech(reactors);

  const [selectedTech, setSelectedTech] = useState<ReactorTechnology | ''>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [pathway, setPathway] = useState<Pathway>('greenfield');
  const [loading, setLoading] = useState(false);

  // Derived: companies for selected tech
  const companyOptions =
    selectedTech !== ''
      ? (techGroups.find((g) => g.technology === selectedTech)?.companies ?? [])
      : [];

  // Derived: models for selected company
  const modelOptions =
    selectedCompany !== ''
      ? (companyOptions.find((c) => c.company === selectedCompany)?.models ?? [])
      : [];

  function handleTechChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedTech(e.target.value as ReactorTechnology | '');
    setSelectedCompany('');
    setSelectedModelId('');
  }

  function handleCompanyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedCompany(e.target.value);
    setSelectedModelId('');
  }

  function handleModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedModelId(e.target.value);
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!country || !regionId || !selectedModelId) return;

      setLoading(true);
      onLoading(true);
      try {
        const result = await postAnalyze({
          country,
          regionId,
          reactorId: selectedModelId,
          pathway,
        });
        onResult(result);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
        onLoading(false);
      }
    },
    [country, regionId, selectedModelId, pathway, onResult, onError, onLoading],
  );

  const canSubmit = !!country && !!regionId && !!selectedModelId && !loading;

  // Find selected model to show specs preview
  const selectedModel = modelOptions.find((m) => m.id === selectedModelId);

  return (
    <form
      className="site-finder"
      onSubmit={handleSubmit}
      data-testid="site-finder-form"
    >
      <h3 className="site-finder-title">Find Sites</h3>

      {(!country || !regionId) && (
        <p className="site-finder-hint" data-testid="site-finder-no-region">
          Select a region on the globe first.
        </p>
      )}

      <div className="site-finder-pickers">
        {/* Technology family */}
        <label className="site-finder-label" htmlFor="sf-tech">
          Technology family
        </label>
        <select
          id="sf-tech"
          className="site-finder-select"
          value={selectedTech}
          onChange={handleTechChange}
          data-testid="select-technology"
          disabled={!country || !regionId}
        >
          <option value="">— Select technology —</option>
          {techGroups.map((g) => (
            <option key={g.technology} value={g.technology}>
              {g.label}
            </option>
          ))}
        </select>

        {/* Company */}
        <label className="site-finder-label" htmlFor="sf-company">
          Company
        </label>
        <select
          id="sf-company"
          className="site-finder-select"
          value={selectedCompany}
          onChange={handleCompanyChange}
          data-testid="select-company"
          disabled={selectedTech === '' || companyOptions.length === 0}
        >
          <option value="">— Select company —</option>
          {companyOptions.map((c) => (
            <option key={c.company} value={c.company}>
              {c.company}
            </option>
          ))}
        </select>

        {/* Model */}
        <label className="site-finder-label" htmlFor="sf-model">
          Reactor model
        </label>
        <select
          id="sf-model"
          className="site-finder-select"
          value={selectedModelId}
          onChange={handleModelChange}
          data-testid="select-model"
          disabled={selectedCompany === '' || modelOptions.length === 0}
        >
          <option value="">— Select model —</option>
          {modelOptions.map((m) => (
            <option key={m.id} value={m.id}>
              {m.model} ({m.outputMW} MWe)
            </option>
          ))}
        </select>

        {/* Reactor specs mini-preview */}
        {selectedModel && (
          <div className="site-finder-specs" data-testid="reactor-specs">
            <span className="specs-item">{selectedModel.outputMW} MWe</span>
            <span className="specs-sep">·</span>
            <span className="specs-item">{selectedModel.footprintHectares} ha</span>
            <span className="specs-sep">·</span>
            <span className="specs-item">{selectedModel.coolingOptions.join(', ')} cooling</span>
            <a
              href={selectedModel.citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="specs-cite"
              data-testid="reactor-citation-link"
            >
              [{selectedModel.citation.id}]
            </a>
          </div>
        )}

        {/* Pathway */}
        <label className="site-finder-label" htmlFor="sf-pathway">
          Pathway
        </label>
        <select
          id="sf-pathway"
          className="site-finder-select"
          value={pathway}
          onChange={(e) => setPathway(e.target.value as Pathway)}
          data-testid="select-pathway"
        >
          <option value="greenfield">Greenfield</option>
          <option value="coal-repower">Coal-repower (brownfield)</option>
        </select>
      </div>

      <button
        type="submit"
        className={`site-finder-btn${loading ? ' site-finder-btn--loading' : ''}`}
        disabled={!canSubmit}
        data-testid="find-sites-btn"
      >
        {loading ? 'Searching…' : 'Find sites'}
      </button>
    </form>
  );
}
