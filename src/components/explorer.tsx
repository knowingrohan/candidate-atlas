"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownAZ,
  ArrowRight,
  ArrowUpRight,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  CheckCheck,
  Layers3,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { AREAS, STATUSES, type CandidateQuery } from "@/lib/types";
import { DEFAULT_QUERY, parseQuery, serializeQuery } from "@/lib/query";
import { useCandidates } from "@/lib/use-candidates";
import { StatusBadge } from "./status-badge";

function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (q: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    // Browser history and clear-all actions must also update the editable field.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(value);
    clearTimeout(timer.current);
  }, [value]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function commit(value: string) {
    clearTimeout(timer.current);
    onChange(value);
  }
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        commit(draft);
      }}
      className="search-field"
    >
      <Search size={19} className="shrink-0 text-slate-400" />
      <label htmlFor="candidate-search" className="sr-only">
        Search candidates by name
      </label>
      <input
        id="candidate-search"
        type="search"
        maxLength={100}
        autoComplete="off"
        placeholder="Search candidates by name…"
        value={draft}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => onChange(next), 300);
        }}
      />
      {draft && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft("");
            commit("");
          }}
          className="icon-button"
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
}
export function ResultsSkeleton() {
  return (
    <div aria-label="Loading candidates" role="status" className="space-y-0">
      <span className="sr-only">Loading candidates</span>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className="flex h-[108px] items-center gap-6 border-b border-slate-100 px-6"
        >
          <div className="skeleton h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-4 w-1/4 rounded" />
            <div className="skeleton h-3 w-3/5 rounded" />
          </div>
          <div className="skeleton hidden h-7 w-28 rounded-full sm:block" />
        </div>
      ))}
    </div>
  );
}
export function Explorer() {
  const router = useRouter();
  const params = useSearchParams();
  const query = parseQuery(new URLSearchParams(params.toString()));
  const queryString = serializeQuery(query);
  const { data, portfolio, loading, error, retry } = useCandidates(queryString);
  const currentQuery = useRef(query);
  useEffect(() => {
    currentQuery.current = parseQuery(new URLSearchParams(queryString));
  }, [queryString]);
  const update = useCallback(
    (patch: Partial<CandidateQuery>) => {
      const next = { ...currentQuery.current, ...patch, page: patch.page ?? 1 };
      currentQuery.current = next;
      const qs = serializeQuery(next);
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router],
  );
  const changeSearch = useCallback((q: string) => update({ q }), [update]);
  const activeFilters = Boolean(query.q || query.status || query.area);
  const stats = data?.portfolio ?? portfolio;
  const back = queryString ? `?${queryString}` : "";
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">THE RESEARCH PORTFOLIO</p>
          <h1 className="page-title">
            Candidate library<span className="text-teal-600">.</span>
          </h1>
          <p className="mt-3 text-base text-slate-500">
            Explore drug candidates. Follow the science.
          </p>
        </div>
        <div className="hidden items-center gap-2 pb-1 text-sm text-slate-500 sm:flex">
          <FlaskConical size={16} /> Discovery to approval
        </div>
      </div>
      <section
        aria-label="Portfolio overview"
        className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        {[
          {
            label: "Total candidates",
            value: stats?.total,
            icon: Layers3,
            caption: "Across the portfolio",
            color: "text-slate-600 bg-slate-100",
          },
          {
            label: "In development",
            value: stats?.inDevelopment,
            icon: FlaskConical,
            caption: "Active research programs",
            color: "text-blue-700 bg-blue-50",
          },
          {
            label: "Approved",
            value: stats?.approved,
            icon: CheckCheck,
            caption: "In the demo portfolio",
            color: "text-teal-700 bg-teal-50",
          },
          {
            label: "Therapeutic areas",
            value: stats?.areas,
            icon: ArrowUpRight,
            caption: "Connected by discovery",
            color: "text-violet-700 bg-violet-50",
          },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-600">{stat.label}</p>
              <span className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon size={17} />
              </span>
            </div>
            <p className="mt-1 text-[2rem] font-semibold tracking-tight text-slate-900">
              {stat.value ?? "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">{stat.caption}</p>
          </div>
        ))}
      </section>
      <section
        aria-label="Candidate search and results"
        className="results-panel"
      >
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              All candidates{" "}
              {data && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {data.total}
                </span>
              )}
            </h2>
            <span className="hidden text-xs text-slate-500 sm:block">
              Fictional portfolio
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <SearchField value={query.q} onChange={changeSearch} />
            <div className="filter-select">
              <SlidersHorizontal size={15} className="text-slate-400" />
              <label className="sr-only" htmlFor="status">
                Filter by status
              </label>
              <select
                id="status"
                value={query.status}
                onChange={(e) => update({ status: e.target.value })}
              >
                <option value="">All statuses</option>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="filter-select">
              <label className="sr-only" htmlFor="area">
                Filter by therapeutic area
              </label>
              <select
                id="area"
                value={query.area}
                onChange={(e) => update({ area: e.target.value })}
              >
                <option value="">All therapeutic areas</option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
          {activeFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>Filtered by</span>
              {query.q && <span className="filter-chip">Name: {query.q}</span>}
              {query.status && (
                <span className="filter-chip">{query.status}</span>
              )}
              {query.area && <span className="filter-chip">{query.area}</span>}
              <button
                className="ml-1 font-medium text-teal-800 underline underline-offset-4"
                onClick={() =>
                  update({
                    ...DEFAULT_QUERY,
                    sort: query.sort,
                    pageSize: query.pageSize,
                  })
                }
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/60 px-5 py-3 sm:px-6">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-slate-500"
          >
            {loading
              ? "Finding candidates…"
              : error
                ? "Results unavailable"
                : `${data?.total ?? 0} candidates${activeFilters ? " match your filters" : " in your library"}`}
          </p>
          <div className="flex items-center gap-2">
            <ArrowDownAZ size={15} className="text-slate-400" />
            <label htmlFor="sort" className="sr-only">
              Sort candidates
            </label>
            <select
              id="sort"
              className="sort-select"
              value={query.sort}
              onChange={(e) =>
                update({ sort: e.target.value as CandidateQuery["sort"] })
              }
            >
              <option value="name-asc">Name: A–Z</option>
              <option value="name-desc">Name: Z–A</option>
              <option value="updated">Recently updated</option>
            </select>
          </div>
        </div>
        <div aria-busy={loading}>
          {loading ? (
            <ResultsSkeleton />
          ) : error ? (
            <div className="empty-state" role="alert">
              <AlertCircle size={30} className="text-amber-600" />
              <h3>Unable to load candidates</h3>
              <p>{error}</p>
              <button className="primary-button" onClick={retry}>
                <RotateCcw size={16} />
                Try again
              </button>
            </div>
          ) : data?.items.length === 0 ? (
            <div className="empty-state">
              <Search size={30} className="text-slate-400" />
              <h3>No candidates found</h3>
              <p>Try another name or broaden your filters.</p>
              <button
                className="primary-button"
                onClick={() => update(DEFAULT_QUERY)}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="table-heading" aria-hidden="true">
                <span>DRUG CANDIDATE</span>
                <span>THERAPEUTIC AREA</span>
                <span>STATUS</span>
                <span>STAGE</span>
                <span />
              </div>
              <ul
                aria-label="Drug candidates"
                className="divide-y divide-slate-100"
              >
                {data?.items.map((c) => (
                  <li key={c.id}>
                    <Link
                      prefetch={false}
                      href={`/candidates/${c.id}${back}`}
                      className="candidate-row"
                      aria-label={`View ${c.name}, ${c.status}`}
                    >
                      <div className="flex min-w-0 gap-3.5">
                        <div className="candidate-monogram" aria-hidden="true">
                          {c.name.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <h3 className="font-semibold text-slate-900">
                              {c.name}
                            </h3>
                            <span className="font-mono text-xs text-slate-500">
                              {c.code}
                            </span>
                          </div>
                          <p className="candidate-description">
                            {c.description}
                          </p>
                        </div>
                      </div>
                      <span className="area-text">{c.area}</span>
                      <span>
                        <StatusBadge status={c.status} />
                      </span>
                      <span className="text-sm text-slate-500">{c.phase}</span>
                      <ArrowRight
                        size={17}
                        className="row-arrow text-slate-400"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        {data && data.total > 0 && (
          <div className="pagination-bar">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-800">
                {(data.page - 1) * data.pageSize + 1}–
                {Math.min(data.page * data.pageSize, data.total)}
              </span>{" "}
              of {data.total}
            </p>
            <nav aria-label="Pagination" className="flex items-center gap-3">
              <button
                className="page-button"
                disabled={data.page === 1}
                onClick={() => update({ page: data.page - 1 })}
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="text-sm text-slate-600">
                Page{" "}
                <span className="font-medium text-slate-900">{data.page}</span>{" "}
                of {data.totalPages}
              </span>
              <button
                className="page-button"
                disabled={data.page === data.totalPages}
                onClick={() => update({ page: data.page + 1 })}
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </nav>
          </div>
        )}
      </section>
      <p className="mt-5 text-xs leading-5 text-slate-500">
        All candidate names, development statuses, and scientific details are
        synthetic. Not intended for clinical use.
      </p>
    </>
  );
}
