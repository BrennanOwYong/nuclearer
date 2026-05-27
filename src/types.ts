// ---- Citations & corpus ----
export type SourceType = 'computable' | 'human-review';
export type Confidence = 'high' | 'medium' | 'low';

export interface Citation {
  id: string;            // stable, e.g. "us-nrc-10cfr100"
  title: string;
  citation: string;      // human-readable cite, e.g. "10 CFR Part 100"
  section?: string;
  year: number;
  url: string;
}

export interface SourceSnippet extends Citation {
  text: string;          // the quoted/paraphrased provision
  type: SourceType;
  confidence: Confidence;
}

export interface CountryCorpus {
  code: string;          // ISO alpha-3, e.g. "USA"
  name: string;
  regulator: string;     // e.g. "U.S. NRC"
  sources: SourceSnippet[];
}

// ---- Region facts ----
export type FactCategory = 'land' | 'grid' | 'water' | 'hazard' | 'population' | 'pathway';

export interface RegionFact {
  id: string;
  category: FactCategory;
  label: string;
  value: string;
  detail: string;
  citationId?: string;   // references a SourceSnippet.id or Citation.id
  confidence: Confidence;
}

export interface RegionData {
  country: string;       // ISO alpha-3
  regionId: string;      // admin-1 code from GeoJSON properties
  regionName: string;
  hasRichData: boolean;  // false => "limited data" state
  facts: RegionFact[];
}

// ---- Reactor catalog ----
export type ReactorType = 'SMR' | 'large' | 'micro';
export type ReactorTechnology = 'PWR' | 'BWR' | 'iPWR' | 'HTGR' | 'SFR' | 'MSR' | 'microreactor';

export interface ReactorModel {
  id: string;            // e.g. "ge-bwrx-300"
  company: string;
  companyUrl: string;    // real vendor site
  model: string;
  type: ReactorType;          // deployment class
  technology: ReactorTechnology; // reactor family
  outputMW: number;
  footprintHectares: number;
  coolingOptions: string[];   // e.g. ["once-through","tower","dry"]
  waterNeeds: string;
  status: string;             // e.g. "Design certification in progress"
  citation: Citation;         // real spec-sheet source
}

// ---- Analysis: site-finder model ----
// The platform takes (region + reactor) and FINDS the land: it filters a prepared
// pool of candidate sites by the reactor's design envelope, then ranks + reasons live.
export type Verdict = 'pass' | 'caution' | 'fail';
export type FrictionCategory = 'grid' | 'cooling' | 'permits' | 'community' | 'logistics' | 'hazards';
export type Pathway = 'greenfield' | 'coal-repower';
export type SiteKind = 'named' | 'greenfield'; // reuse a known site vs unused land

export interface MatrixRow {
  constraint: string;
  verdict: Verdict;
  reason: string;
  citationIds: string[];
}

// Prepared candidate-land attributes (the cheap source-layer values, F3b data).
export interface SiteAttributes {
  availableFootprintHectares: number;
  coolingSource: string;        // e.g. "river: Hams Fork", "coastal", "dry/air-cooled only", "none on-site"
  waterAvailability: 'abundant' | 'limited' | 'none';
  gridDistanceKm: number;       // to nearest suitable transmission
  populationDensity: 'low' | 'medium' | 'high';
  hazards: string[];            // e.g. ["seismic-low","flood-moderate"]
  landStatus: string;           // e.g. "retiring coal (brownfield)", "BLM federal land", "crown land"
  protectedAreaFlag: boolean;
}

// A prepared candidate site in the pool (named brownfield OR greenfield zone).
export interface CandidateSite {
  id: string;
  country: string;              // ISO alpha-3
  regionId: string;             // iso_3166_2 of the parent admin-1
  name: string;
  kind: SiteKind;
  lat: number;
  lng: number;
  attributes: SiteAttributes;
  suitableTechnologies: ReactorTechnology[]; // which reactor families this land fits
  citationIds: string[];        // into corpus + source-layer citations
  confidence: Confidence;
}

// Live per-site screening result (reactor envelope vs site attributes vs law).
export interface SiteScreening {
  siteId: string;
  siteName: string;
  kind: SiteKind;
  lat: number;
  lng: number;
  rank: number;                 // 1 = best fit
  verdict: Verdict;
  frictionScores: Record<FrictionCategory, number>; // each 0..1
  matrix: MatrixRow[];          // why: envelope vs attributes vs RulePack
  citationIds: string[];
  confidence: Confidence;
}

export interface AnalysisResult {
  country: string;
  regionId: string;
  reactorId: string;
  pathway: Pathway;
  sites: SiteScreening[];       // ranked shortlist; [] => no viable sites (e.g. Australia ban)
  regionSummary: string;        // screen-level legal/physical context for the region
  nextStudies: string[];
  notes: string;                // screen-level caveats
}

// ---- API request bodies ----
export interface AnalyzeRequest {
  country: string;
  regionId: string;
  reactorId: string;
  pathway: Pathway;
  cooling?: string;             // optional global preference; cooling is judged per candidate site
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
export interface ChatRequest {
  country: string;
  regionId: string;
  question: string;
  history: ChatMessage[];
}
export interface ChatResponse { answer: string; citations: Citation[]; } // answer is markdown
