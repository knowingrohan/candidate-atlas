import { AREAS, STATUSES, type CandidateQuery } from "./types";
export class QueryError extends Error {}
export const DEFAULT_QUERY: CandidateQuery = {
  q: "",
  status: "",
  area: "",
  sort: "name-asc",
  page: 1,
  pageSize: 8,
};
/** Shared parsing keeps the browser and API contract consistent. API requests are strict. */
export function parseQuery(
  params: URLSearchParams,
  strict = false,
): CandidateQuery {
  const fail = (message: string) => {
    if (strict) throw new QueryError(message);
  };
  let q = (params.get("q") ?? "").trim();
  if (q.length > 100) {
    fail("Search must be 100 characters or fewer.");
    q = q.slice(0, 100);
  }
  let status = params.get("status") ?? "";
  if (status && !STATUSES.includes(status as never)) {
    fail("Invalid status.");
    status = "";
  }
  let area = params.get("area") ?? "";
  if (area && !AREAS.includes(area as never)) {
    fail("Invalid therapeutic area.");
    area = "";
  }
  let sort = params.get("sort") ?? "name-asc";
  if (!["name-asc", "name-desc", "updated"].includes(sort)) {
    fail("Invalid sort order.");
    sort = "name-asc";
  }
  const integer = (key: string, fallback: number, max: number) => {
    const raw = params.get(key);
    if (raw === null) return fallback;
    if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > max) {
      fail(`Invalid ${key}.`);
      return fallback;
    }
    return Number(raw);
  };
  return {
    q,
    status,
    area,
    sort: sort as CandidateQuery["sort"],
    page: integer("page", 1, 1_000_000),
    pageSize: integer("pageSize", 8, 50),
  };
}
export function serializeQuery(query: CandidateQuery): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(query) as (keyof CandidateQuery)[]) {
    if (query[key] !== DEFAULT_QUERY[key]) params.set(key, String(query[key]));
  }
  return params.toString();
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
