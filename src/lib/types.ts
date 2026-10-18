export type Area = "idoc" | "cpi";
export type Origin = "community" | "user";
export type Provenance = "community" | "verified" | "open";
export type SourceKind = "email" | "monitoring" | "other" | "community";

export type SourceLink = {
  title: string;
  url: string;
};

export type LibraryEntry = {
  id: string;
  area: Area;
  title: string;
  summary: string;
  errorText: string;
  signatures: string[];
  steps: string[];
  sources: SourceLink[];
  statusCode?: string;
  landscapeNote?: string;
};

export type CaseSummary = {
  id: string;
  createdAt: string;
  updatedAt: string;
  area: Area;
  origin: Origin;
  provenance: Provenance;
  source: SourceKind;
  title: string;
  summary: string;
  errorText: string;
  signatures: string[];
  statusCode: string | null;
  messageType: string | null;
  idocType: string | null;
  partner: string | null;
  iflow: string | null;
  adapter: string | null;
  landscapeNote: string | null;
  verifiedNote: string | null;
  researchDraft: string | null;
  sortOrder: number;
};

export type CaseRecord = CaseSummary & {
  steps: string[];
  sources: SourceLink[];
};

export type SearchHit = CaseSummary & {
  score: number;
  strong: boolean;
};
