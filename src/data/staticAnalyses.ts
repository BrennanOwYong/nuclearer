import type { AnalysisResult, AnalyzeRequest } from '../types';
import wyomingBwrx from '../../data/analyses/USA_US-WY_ge-bwrx-300_coal-repower.json';
import wyomingEvinci from '../../data/analyses/USA_US-WY_westinghouse-evinci_greenfield.json';
import illinoisAp1000 from '../../data/analyses/USA_US-IL_westinghouse-ap1000_greenfield.json';
import pomeraniaAp1000 from '../../data/analyses/POL_PL-22_westinghouse-ap1000_greenfield.json';
import greaterPolandBwrx from '../../data/analyses/POL_PL-30_ge-bwrx-300_coal-repower.json';
import southAustraliaXe100 from '../../data/analyses/AUS_AU-SA_xenergy-xe100_greenfield.json';
import northernTerritoryEvinci from '../../data/analyses/AUS_AU-NT_westinghouse-evinci_greenfield.json';

const ANALYSES: Record<string, AnalysisResult> = {
  'USA_US-WY_ge-bwrx-300_coal-repower': wyomingBwrx as AnalysisResult,
  'USA_US-WY_westinghouse-evinci_greenfield': wyomingEvinci as AnalysisResult,
  'USA_US-IL_westinghouse-ap1000_greenfield': illinoisAp1000 as AnalysisResult,
  'POL_PL-22_westinghouse-ap1000_greenfield': pomeraniaAp1000 as AnalysisResult,
  'POL_PL-30_ge-bwrx-300_coal-repower': greaterPolandBwrx as AnalysisResult,
  'AUS_AU-SA_xenergy-xe100_greenfield': southAustraliaXe100 as AnalysisResult,
  'AUS_AU-NT_westinghouse-evinci_greenfield': northernTerritoryEvinci as AnalysisResult,
};

export function getStaticAnalysis(req: AnalyzeRequest): AnalysisResult | null {
  return ANALYSES[`${req.country}_${req.regionId}_${req.reactorId}_${req.pathway}`] ?? null;
}
