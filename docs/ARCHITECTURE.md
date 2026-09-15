# Architecture and engineering decisions

## Product framing

The primary user is a research colleague looking for a candidate and reviewing its program details. The main journey is **find → narrow → inspect → return**. A dense library makes comparisons easier than large marketing cards. On narrow screens each row becomes a compact card-like list item without horizontal scrolling.

The design uses a dark research-workspace rail, cool neutral surfaces, teal emphasis, and restrained status colors. Typography and spacing carry the hierarchy. Four aggregate counts summarize the entire portfolio; filtered result counts are shown separately to avoid conflating the two.

The mock program names and scientific details are synthetic. The UI labels the dataset at both library and profile level.

## Request path

1. The library reads query state from `useSearchParams`.
2. The search field debounces input by 300 ms. Enter and clear actions are immediate.
3. A URL update triggers a request to `/api/candidates`.
4. The handler validates parameters and invokes `CandidateRepository.list`.
5. The adapter filters, deterministically sorts, clamps the page, and projects only summary fields.
6. The browser renders at most 50 records; the default is eight.
7. A detail page resolves its record server-side from the same repository.

The detail Server Component calls the repository directly rather than making an HTTP request back into its own Next.js server. The HTTP detail endpoint exists as a reusable API contract. This avoids an extra network hop and hard-coded deployment origins.

## State ownership

| State                       | Owner             | Reason                                           |
| --------------------------- | ----------------- | ------------------------------------------------ |
| Search, filters, sort, page | URL               | Shareable, reloadable, preserves list context    |
| Uncommitted search text     | Search field      | Immediate typing without a request per keystroke |
| Current HTTP result/error   | `useCandidates`   | Local lifecycle, no global store required        |
| Candidate records           | Server repository | Full dataset stays off the client                |
| Retry attempt               | Request hook      | Explicit retry without changing the user’s query |

`router.replace` avoids filling browser history with each debounced edit. Navigating into a candidate creates a normal history entry. Both browser Back and the explicit return link restore the latest search context. The use of replace means Back does not undo each individual filter edit; this is a deliberate trade-off.

## Async correctness

Each query/retry has a unique request key. The UI only consumes a result with the current key. Effect cleanup aborts the outgoing fetch and marks its completion inactive, so an obsolete response cannot replace a newer result even if cancellation occurs late. A 10-second timer bounds an unresponsive request. Unmounting cleans up both the timer and request.

During updates the results show a skeleton rather than stale clickable rows under new filter labels. Portfolio counts retain the last known successful summary during ordinary query changes. There is no cache library because this screen has one small, read-only request lifecycle; TanStack Query would become appropriate with multiple shared resources, mutations, caching, or background synchronization.

## Scaling: what is solved and what is not

**Implemented:** bounded response and DOM size; filtering on the server; summary/detail separation; stable secondary sorting by ID; O(1) mock detail lookup; a typed storage interface; cancellation; no per-row detail prefetch.

**Mock limitation:** listing is O(n) filtering plus O(m log m) sorting in memory, with O(m) temporary allocations. JSON is loaded into each server process. There is no claim that this adapter itself supports millions of records.

For a production dataset:

- Replace the in-memory adapter with database queries. Keep query parsing, HTTP contracts, and UI intact initially.
- Use an index strategy matched to observed queries. Substring name search may require a trigram or search index; a standard B-tree alone does not solve arbitrary substring matching.
- Use keyset/cursor pagination for deep browsing with a stable compound ordering such as `(name, id)` or `(updated_at, id)`. This changes the pagination contract and UI; do not pretend offset and cursor pagination are interchangeable.
- Avoid exact counts for every request if they become expensive. Cache or precompute portfolio summaries and decide whether filtered exact counts are needed.
- Add authorization, audit needs, observability, rate limiting, and security review based on the actual deployment and data sensitivity.
- Add virtualization only if the product requires long continuous scrolling. It adds little value when eight records are rendered per page.

## Validation and errors

API input is strict: invalid enums, non-integer pages, page sizes outside 1–50, and search strings longer than 100 characters return 400. Browser URLs normalize invalid values to defaults so hand-edited links remain usable. Unknown query keys are ignored. Search is treated as a literal string, never a regular expression.

The server clamps pages beyond the last result page. The pagination UI reflects the effective page in the API response. The requested URL may still contain an out-of-range page until the next interaction; this is documented behavior, not a hidden redirect.

The listing endpoint masks unexpected errors with a generic message. Unknown detail IDs return an HTTP API 404 and invoke Next.js `notFound()` in the profile route. Next.js can stream route UI, so the visible not-found page and HTTP status should be assessed separately from the API’s explicit 404.

## Accessibility and performance

Semantic lists and links expose each candidate as one coherent navigation target. Labeled native selects provide keyboard behavior without a custom combobox. Focus indicators, status text, an in-page skip link, live result messages, and reduced-motion behavior are explicit.

There are no externally loaded fonts, decorative raster images, or heavy charting packages. System fonts keep rendering independent of a font service. The library shell is prerendered; the interactive result body fetches after hydration. Profiles are rendered on the server. For a production public catalogue, server-rendering initial results would improve first-content latency and indexing; a private research tool may prioritize authenticated API integration instead.

Automated axe checks are useful regression checks, not a complete accessibility audit. Manual screen-reader testing, assistive technology coverage, and measured production performance remain follow-up work.

## Testing strategy

Vitest covers the pure query contract, repository behavior, and route handler results. Playwright exercises the actual application, including Server Components; this follows the Next.js guidance that async Server Components are better covered through E2E tests than Vitest component rendering.

The suite targets user behavior and architectural boundaries: intersecting filters, page resets, summary-only payloads, invalid API input, missing records, error recovery, stale requests, keyboard access, and mobile overflow. It avoids snapshots tied to visual markup.
