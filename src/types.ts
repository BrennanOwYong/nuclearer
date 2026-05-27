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

// ---- Analysis ----
export type Verdict = 'pass' | 'caution' | 'fail';
export type FrictionCategory = 'grid' | 'cooling' | 'permits' | 'community' | 'logistics' | 'hazards';
export type Pathway = 'greenfield' | 'coal-repower';

export interface MatrixRow {
  constraint: string;
  verdict: Verdict;
  reason: string;
  citationIds: string[];
}

export interface AnalysisResult {
  matrix: MatrixRow[];
  frictionScores: Record<FrictionCategory, number>; // each 0..1
  confidence: Confidence;
  nextStudies: string[];
  notes: string;            // screen-level caveats
}

// ---- API request bodies ----
export interface AnalyzeRequest {
  country: string;
  regionId: string;
  reactorId: string;
  pathway: Pathway;
  cooling: string;
}

export interface ChatMessage { role: 'user' | 'assistant'; content: string; }
export interface ChatRequest {
  country: string;
  regionId: string;
  question: string;
  history: ChatMessage[];
}
export interface ChatResponse { answer: string; citations: Citation[]; } // answer is markdown
