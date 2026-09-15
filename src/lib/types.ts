export const STATUSES = [
  "In Development",
  "Approved",
  "On Hold",
  "Discontinued",
] as const;
export const AREAS = [
  "Oncology",
  "Immunology",
  "Neurology",
  "Cardiology",
  "Rare Diseases",
] as const;
export type Status = (typeof STATUSES)[number];
export type Area = (typeof AREAS)[number];
export interface Candidate {
  id: string;
  name: string;
  code: string;
  area: Area;
  status: Status;
  phase: string;
  description: string;
  mechanismOfAction: string;
  sideEffects: string[];
  route: string;
  modality: string;
  updatedAt: string;
  overview: string;
  safetyNote: string;
}
export type CandidateSummary = Pick<
  Candidate,
  | "id"
  | "name"
  | "code"
  | "area"
  | "status"
  | "phase"
  | "description"
  | "updatedAt"
>;
export interface CandidateQuery {
  q: string;
  status: string;
  area: string;
  sort: "name-asc" | "name-desc" | "updated";
  page: number;
  pageSize: number;
}
export interface CandidatePage {
  items: CandidateSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  portfolio: {
    total: number;
    inDevelopment: number;
    approved: number;
    areas: number;
  };
}
