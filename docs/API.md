# Mock API contract

## GET /api/candidates

| Parameter  | Default    | Accepted values                                                                     |
| ---------- | ---------- | ----------------------------------------------------------------------------------- |
| `q`        | Empty      | Literal case-insensitive substring of candidate name, trimmed, up to 100 characters |
| `status`   | All        | `In Development`, `Approved`, `On Hold`, `Discontinued`                             |
| `area`     | All        | `Oncology`, `Immunology`, `Neurology`, `Cardiology`, `Rare Diseases`                |
| `sort`     | `name-asc` | `name-asc`, `name-desc`, `updated`                                                  |
| `page`     | `1`        | Integer from 1 to 1,000,000; effective page clamped to last result page             |
| `pageSize` | `8`        | Integer from 1 to 50                                                                |

All filters are combined with AND. Unknown query keys are ignored. Invalid values return 400. Empty results have `total: 0`, `page: 1`, `totalPages: 1`, and an empty items array.

Example:

```bash
curl 'http://localhost:3000/api/candidates?q=ader&status=In%20Development'
```

Response shape:

```json
{
  "items": [
    {
      "id": "ca-001",
      "name": "Aderinib",
      "code": "AT-1001",
      "area": "Oncology",
      "status": "In Development",
      "phase": "Phase II",
      "description": "An oral small-molecule candidate being studied in solid tumor models.",
      "updatedAt": "2026-08-28"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 8,
  "totalPages": 1,
  "portfolio": { "total": 24, "inDevelopment": 16, "approved": 3, "areas": 5 }
}
```

`portfolio` contains unfiltered whole-portfolio counts. `total` is the filtered result count. The response uses `Cache-Control: no-store` for predictable mock behavior.

## GET /api/candidates/:id

```bash
curl 'http://localhost:3000/api/candidates/ca-001'
```

Returns a full candidate with the summary fields plus `mechanismOfAction`, `sideEffects`, `route`, `modality`, `overview`, and `safetyNote`. All data is fictional.

An unknown ID returns status 404:

```json
{ "error": "Candidate not found." }
```

## Errors

| Status | Meaning                                           |
| ------ | ------------------------------------------------- |
| 400    | Invalid list query parameter                      |
| 404    | Candidate ID not found                            |
| 500    | Unexpected listing failure; generic error message |

Example validation response:

```json
{ "error": "Invalid pageSize." }
```
