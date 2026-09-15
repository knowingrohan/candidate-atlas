# Candidate Atlas

A drug-candidate explorer built for the **Merck Senior Frontend Engineer challenge** using **Next.js App Router, TypeScript, and Tailwind CSS**.

Browse a fictional portfolio, search by candidate name, combine status and therapeutic-area filters, and open a dedicated candidate profile. This is a working application with real HTTP endpoints backed by an in-memory mock repository.

## Run locally

Prerequisites: Node.js 20.9+ (Node 22 LTS recommended) and npm. No API keys, database, or environment variables are required.

```bash
npm ci
npm run dev
```

Open http://localhost:3000. To demonstrate the production build:

```bash
npm run build
npm start
```

The archive excludes dependencies and build output; `npm ci` installs the exact dependency versions recorded in `package-lock.json`.

## Verify

```bash
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
```

The E2E suite starts a development server automatically when port 3000 is free, or reuses a running local server. For production E2E verification, run `npm run build` and `npm start` before `npm run test:e2e`. In a minimal Linux CI environment use `npx playwright install --with-deps chromium`.

## Requirements covered

| Challenge requirement                   | Implementation                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Next.js, TypeScript, Tailwind           | App Router, strict TypeScript, Tailwind v4                                                        |
| Homepage with name, status, description | Searchable candidate library with 24 synthetic records                                            |
| Search by name                          | Case-insensitive, 300 ms debounced search; Enter submits immediately                              |
| View details on a separate page         | `/candidates/[id]` with mechanism, side effects, stage, modality, administration                  |
| Mock API                                | `GET /api/candidates` and `GET /api/candidates/[id]`, backed by JSON                              |
| Large-data architecture                 | Server-side filtering/sorting/pagination, page-size cap, summary payloads, replaceable repository |
| Testing                                 | Vitest query/repository/HTTP tests; Playwright browser and axe accessibility checks               |
| Documentation                           | This README, architecture decisions, and API contract                                             |

## Experience

- Status and therapeutic-area filters combine with name search.
- Sorting supports A–Z, Z–A, and most recently updated.
- Search, filters, sorting, and page are encoded in the URL for reload and sharing.
- Detail links preserve the query; “Back to candidates” restores the result context.
- Search and filter changes reset to page one. Out-of-range result pages are clamped by the API.
- Loading skeletons, empty results, recoverable API errors, missing records, and a route error boundary are implemented.
- Previous requests are aborted and guarded against stale responses. Requests time out after 10 seconds.
- Keyboard focus, skip navigation, labeled controls, live result counts, reduced-motion support, and responsive layouts are included.
- Status meaning is expressed in text as well as color.

## Project map

```text
src/
  app/
    api/candidates/route.ts        HTTP listing endpoint and validation
    api/candidates/[id]/route.ts   HTTP detail endpoint
    candidates/[id]/page.tsx       Server-rendered profile
    candidates/[id]/loading.tsx    Route loading UI
    page.tsx                      Library entry point
    error.tsx                     Route recovery
    not-found.tsx                 Missing-record recovery
  components/
    explorer.tsx                  Search, filters, results, pagination
    shell.tsx                     Responsive workspace layout
    status-badge.tsx              Shared status treatment
  data/candidates.json             Synthetic mock records
  lib/
    types.ts                      Domain and HTTP result types
    query.ts                      Shared URL parsing and serialization
    repository.ts                 Replaceable mock data adapter
    use-candidates.ts             Cancellable HTTP request lifecycle
 tests/                           Vitest contract and repository tests
 e2e/                             Playwright journeys and accessibility checks
 docs/                            Architecture, API, walkthrough, verification
```

## Important boundaries

All candidate names, scientific targets, observations, and approval statuses are **fictional**. No medical or regulatory claims are made.

The mock repository scans and sorts a small in-memory dataset. It is **not** a benchmarked large-data database. The architecture bounds browser payloads and isolates storage access so a production repository can use indexed queries and cursor pagination. See [architecture](docs/ARCHITECTURE.md) for limitations and migration choices.

Authentication, editing, real clinical datasets, and analytics are intentionally outside the assignment’s scope. The application does not persist user data or send telemetry added by this application. Next.js itself has framework telemetry; set `NEXT_TELEMETRY_DISABLED=1` to disable it.

## Further reading

- [Architecture and trade-offs](docs/ARCHITECTURE.md)
- [API contract](docs/API.md)
- [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Next.js testing guidance](https://nextjs.org/docs/app/guides/testing/vitest)
