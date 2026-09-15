import rawCandidates from "@/data/candidates.json";
import type {
  Candidate,
  CandidatePage,
  CandidateQuery,
  CandidateSummary,
} from "./types";
/** Server-only consumers import this module; the complete dataset never enters client bundles. */
const candidates = rawCandidates as Candidate[];
const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
const portfolio = {
  total: candidates.length,
  inDevelopment: candidates.filter((c) => c.status === "In Development").length,
  approved: candidates.filter((c) => c.status === "Approved").length,
  areas: new Set(candidates.map((c) => c.area)).size,
};
export interface CandidateRepository {
  list(query: CandidateQuery): Promise<CandidatePage>;
  findById(id: string): Promise<Candidate | undefined>;
}
/** Replace this adapter with indexed DB queries without changing UI or HTTP contracts. */
export const candidateRepository: CandidateRepository = {
  async list(query) {
    const search = query.q.toLocaleLowerCase("en");
    const filtered = candidates.filter(
      (c) =>
        (!search || c.name.toLocaleLowerCase("en").includes(search)) &&
        (!query.status || c.status === query.status) &&
        (!query.area || c.area === query.area),
    );
    filtered.sort((a, b) => {
      const order =
        query.sort === "updated"
          ? b.updatedAt.localeCompare(a.updatedAt)
          : a.name.localeCompare(b.name, "en");
      return (
        (query.sort === "name-desc" ? -order : order) ||
        a.id.localeCompare(b.id)
      );
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / query.pageSize));
    const page = Math.min(query.page, totalPages);
    const items: CandidateSummary[] = filtered
      .slice((page - 1) * query.pageSize, page * query.pageSize)
      .map(
        ({ id, name, code, area, status, phase, description, updatedAt }) => ({
          id,
          name,
          code,
          area,
          status,
          phase,
          description,
          updatedAt,
        }),
      );
    return {
      items,
      total: filtered.length,
      page,
      pageSize: query.pageSize,
      totalPages,
      portfolio,
    };
  },
  async findById(id) {
    return byId.get(id);
  },
};
