# Agency Overview Tab — Backend Design Spec

**Date:** 2026-03-15
**Scope:** Backend only (Express routes, DB migrations, query layer)
**Out of scope:** Frontend wiring, Analytics FunnelView, TalentPanel quick actions

---

## Context

The Agency Overview page (`client/src/routes/agency/OverviewPage.jsx`) is UI-complete but entirely hardcoded. It displays static demo data for KPI cards, a pipeline bar, a talent mix donut, an attention strip, and a recent applicants list. None of these sections call the backend.

The frontend API client (`client/src/api/agency.js`) has method stubs that reference backend endpoints — none of those endpoints exist yet. A `getAgencyOverview()` stub will need to be added to `client/src/api/agency.js` when frontend wiring is implemented (out of scope here, but noted for the follow-up task).

This spec covers building the complete backend to power the Overview tab.

---

## Approach

**Hybrid endpoint strategy:**

- `GET /api/agency/overview` — single aggregated endpoint for all KPI/chart/alert data (minimises round trips for above-the-fold content)
- `GET /api/agency/overview/recent-applicants` — kept as a separate endpoint (already exists; paginated/sorted independently)

**Migration dependency:** All 3 migrations below must be applied before the `/api/agency/overview` endpoint returns correct data. The endpoint itself can be deployed before migrations run (it will return empty/zero results), but production data will not populate until all migrations are applied.

---

## Data Model Changes (3 Migrations)

### 1. `rename_pending_to_submitted_and_expand_statuses`

Renames the `pending` application status to `submitted` and adds three new pipeline statuses: `shortlisted`, `booked`, `passed`.

**Valid statuses after migration:** `submitted`, `shortlisted`, `booked`, `passed`, `accepted`, `declined`, `archived`

- **`submitted`** — initial state when a talent applies (renamed from `pending`)
- **`shortlisted`** — agency has expressed interest, wants more info
- **`booked`** — talent placed in a specific casting job (a casting outcome, not roster membership)
- **`passed`** — casting ended without placement
- **`accepted`** — talent signed to the agency's roster (distinct from `booked`)
- **`declined`** — agency rejected the application
- **`archived`** — removed from active view

SQLite stores status as TEXT (no enforced enum). PostgreSQL: drop and recreate the CHECK constraint with all 7 values, then backfill `pending` → `submitted`.

Data backfill:
```sql
UPDATE applications SET status = 'submitted' WHERE status = 'pending';
```

### 2. `add_archetype_to_profiles`

Adds `archetype VARCHAR(20) NULL` to the `profiles` table.

- Valid values: `'editorial'`, `'runway'`, `'commercial'`, `'lifestyle'`
- Existing rows: `NULL` (excluded from Talent Mix calculations until populated)
- Populated by: talent onboarding flow (future work)

### 3. `add_closes_at_to_boards`

Adds `closes_at TIMESTAMP NULL` to the `boards` table. Note: `is_active` already exists on boards (added in migration `20260206000000_update_boards_system_complete.js`) and is used by the `activeCastings` query.

- Existing rows: `NULL` (treated as no deadline)
- Powers: "castings closing today" alert and KPI badge on Active Castings card
- **Semantics:** `closes_at` is the UTC timestamp at which the casting closes (exclusive end). A board with `closes_at = 2026-03-16T00:00:00Z` closes at the start of March 16th — it is no longer accepting submissions after that moment. "Closing today" means `closes_at` falls within the UTC calendar day of the current request.
- **Timezone:** All comparisons are UTC. The server does not localise `closes_at` to any agency timezone.

---

## Status Semantics: `accepted` vs `booked`

These are two distinct concepts in the application lifecycle:

| Status | Meaning | Counted in |
|---|---|---|
| `accepted` | Talent signed to the agency's permanent roster | `rosterSize` |
| `booked` | Talent placed in a specific casting job | `pipeline`, `placementRate` |

A talent can be `accepted` (on roster) without ever being `booked` for a casting. A talent can be `booked` for a casting via a board without being formally `accepted` to the roster. `rosterSize` counts only `accepted` talent. `booked` is a casting pipeline outcome.

---

## API Endpoint

### `GET /api/agency/overview`

**Auth:** `requireRole('AGENCY')` — `requireRole` internally calls `ensureSignedIn`, so no separate `requireAuth()` is needed. This matches the established codebase convention in `src/routes/api/agency.js`.

**Response:**

```json
{
  "success": true,
  "data": {
    "kpis": {
      "pendingReview": { "count": 14, "oldestDaysAgo": 4 },
      "activeCastings": { "count": 6, "closingToday": 2 },
      "rosterSize": { "count": 128, "trend": [112,115,118,119,122,125,128], "changeThisMonth": 3 },
      "placementRate": { "current": 68, "lastSeason": 61 }
    },
    "pipeline": [
      { "label": "Submitted",    "count": 47, "sharePct": 40 },
      { "label": "Shortlisted",  "count": 22, "sharePct": 25 },
      { "label": "Booked",       "count": 12, "sharePct": 15 },
      { "label": "Passed",       "count": 8,  "sharePct": 10 },
      { "label": "Declined",     "count": 11, "sharePct": 10 }
    ],
    "talentMix": [
      { "name": "Editorial",  "count": 45, "pct": 45 },
      { "name": "Runway",     "count": 28, "pct": 28 },
      { "name": "Commercial", "count": 17, "pct": 17 },
      { "name": "Lifestyle",  "count": 10, "pct": 10 }
    ],
    "alerts": [
      { "type": "critical", "message": "4 applications waiting for review for 14+ days", "count": 4, "link": "/dashboard/agency/applicants" },
      { "type": "warning",  "message": "2 castings close today",                          "count": 2, "link": "/dashboard/agency/casting"    },
      { "type": "positive", "message": "3 new applications in the last 2 hours",          "count": 3, "link": "/dashboard/agency/applicants" }
    ]
  }
}
```

**Empty state:** All counts return `0`, `trend` returns `[0,0,0,0,0,0,0]`, arrays return `[]`. Never returns `null` for any field.

---

## Query Plan

All queries are scoped to the authenticated agency's `user.id`. All queries use knex's query builder (not raw SQL) to handle SQLite/PostgreSQL dialect differences automatically. Date comparisons use JS `Date` objects passed as knex parameters — never dialect-specific functions like `DATE('now')` or `CURRENT_DATE`.

### `pendingReview`

```js
db('applications')
  .where({ agency_id: agencyId, status: 'submitted' })
  .select(db.raw('COUNT(*) as count'), db.raw('MIN(created_at) as oldest_at'))
```

`oldestDaysAgo` = `Math.floor((Date.now() - new Date(oldest_at)) / 86400000)`. Returns `{ count: 0, oldestDaysAgo: null }` when no submitted applications.

### `activeCastings`

```js
const now = new Date()
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const todayEnd   = new Date(todayStart.getTime() + 86400000)

const [total] = await db('boards')
  .where({ agency_id: agencyId, is_active: true })
  .count('* as count')

const [closingToday] = await db('boards')
  .where({ agency_id: agencyId, is_active: true })
  .where('closes_at', '>=', todayStart)
  .where('closes_at', '<', todayEnd)   // exclusive upper bound — matches closes_at semantics
  .count('* as count')
```

### `rosterSize`

**Current count:**
```js
db('applications')
  .where({ agency_id: agencyId, status: 'accepted' })
  .count('* as count')
```

**7-week trend** — cumulative count of accepted talent as of the end of each of the last 7 weeks, bucketed by `accepted_at`:

Implementation: fetch all `accepted_at` timestamps within the 7-week window in a single query, then perform all bucketing in JS. This is fully dialect-agnostic and avoids `strftime`/`date_trunc` differences between SQLite and PostgreSQL.

```js
// Step 1 — query: all accepted_at timestamps within the window
const sevenWeeksAgo = new Date(Date.now() - 7 * 7 * 86400000)

const rows = await db('applications')
  .where({ agency_id: agencyId, status: 'accepted' })
  .where('accepted_at', '>=', sevenWeeksAgo)
  .select('accepted_at')

// Step 2 — query: cumulative base count before the window
const [{ count: baseCount }] = await db('applications')
  .where({ agency_id: agencyId, status: 'accepted' })
  .where('accepted_at', '<', sevenWeeksAgo)
  .count('* as count')

// Step 3 — JS bucketing: assign each timestamp to a week slot (0 = oldest, 6 = current)
// weekSlot = Math.floor((accepted_at - sevenWeeksAgo) / (7 * 86400000))
// Clamp to [0, 6]. Count new acceptances per slot.
// Step 4 — JS running sum: cumulative[i] = baseCount + sum(newPerSlot[0..i])
// Result: [cumW0, cumW1, cumW2, cumW3, cumW4, cumW5, cumW6]
```

The output array has exactly 7 elements. Week index 6 (last element) equals `rosterSize.count` **only when all accepted rows have a non-null `accepted_at`**. The `accepted_at` column is nullable; legacy rows with `accepted_at = NULL` are counted in `rosterSize.count` but excluded from the trend queries (both window and base-count). To preserve the invariant, `rosterSize.count` should also add `.whereNotNull('accepted_at')`. Rows with null `accepted_at` are an edge case (they represent pre-migration data) but the implementation must handle them consistently.

`changeThisMonth` = count of applications where `status = 'accepted'` and `accepted_at >= start of current UTC calendar month`. Returns `0` when no acceptances this month.

### `placementRate`

Both `current` and `lastSeason` use the same formula over a **90-day window** so the values are directly comparable. Windows use exclusive upper bounds to prevent boundary records from being counted twice.

```
now90  = now - 90 days
now180 = now - 180 days

current    → created_at >= now90  (last 90 days)
lastSeason → created_at >= now180 AND created_at < now90  (prior 90 days, no overlap)
```

```js
function rateForWindow(db, agencyId, windowStart, windowEnd) {
  return db('applications')
    .where('agency_id', agencyId)
    .where('created_at', '>=', windowStart)
    .where('created_at', '<', windowEnd)   // exclusive upper bound — no boundary overlap
    .whereIn('status', ['booked', 'passed', 'declined', 'accepted'])
    .select(
      db.raw(`SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked`),
      db.raw(`COUNT(*) as decided`)
    )
}
```

`rate` = `decided > 0 ? Math.round((booked / decided) * 100) : 0`

### `pipeline`

```js
db('applications')
  .where('agency_id', agencyId)
  .whereIn('status', ['submitted', 'shortlisted', 'booked', 'passed', 'declined'])
  .groupBy('status')
  .select('status', db.raw('COUNT(*) as count'))
```

Map status names to display labels: `submitted` → "Submitted", `shortlisted` → "Shortlisted", `booked` → "Booked", `passed` → "Passed", `declined` → "Declined".

`sharePct` = `Math.round((stageCount / total) * 100)`. Values may sum to 99 or 101 due to independent rounding — this is acceptable. Do not guarantee sum = 100.

### `talentMix`

```js
db('applications as a')
  .join('profiles as p', 'p.id', 'a.profile_id')
  .where('a.agency_id', agencyId)
  .where('a.status', 'accepted')
  .whereNotNull('p.archetype')
  .groupBy('p.archetype')
  .select('p.archetype as name', db.raw('COUNT(*) as count'))
```

`pct` = `Math.round((archetypeCount / totalWithArchetype) * 100)`. Returns `[]` when no accepted talent has archetype set.

### `alerts`

Three independent queries. Only non-zero results are included in the response array.

**Critical — applications waiting for review 14+ days:**
```js
const cutoff = new Date(Date.now() - 14 * 86400000)
db('applications')
  .where({ agency_id: agencyId, status: 'submitted' })
  .where('created_at', '<=', cutoff)
  .count('* as count')
```
Message: `"${count} application${count === 1 ? '' : 's'} waiting for review for 14+ days"`

**Warning — castings closing today:**
```js
// reuse closingToday count from activeCastings query
```
Message: `"${count} casting${count === 1 ? '' : 's'} close${count === 1 ? 's' : ''} today"`

**Positive — new submitted applications in last 2 hours:**
```js
const twoHoursAgo = new Date(Date.now() - 2 * 3600000)
db('applications')
  .where({ agency_id: agencyId, status: 'submitted' })
  .where('created_at', '>=', twoHoursAgo)
  .count('* as count')
```
Only `status = 'submitted'` applications are counted — this represents genuine new inbound talent, not status changes or re-archived records.

Message: `"${count} new application${count === 1 ? '' : 's'} in the last 2 hours"`

---

## Field Semantics

| Field | Definition | Notes |
|---|---|---|
| `pipeline[n].sharePct` | stage count / total pipeline count × 100 | NOT a conversion rate. May not sum exactly to 100 due to rounding. |
| `rosterSize.trend` | Cumulative accepted-talent count per week for 7 weeks | Bucketed by `accepted_at`, not `created_at` |
| `placementRate.current` | `booked / decided` × 100 for applications created in last 90 days | Comparable to `lastSeason` (same 90-day window size) |
| `placementRate.lastSeason` | Same rate for applications created 91–180 days ago | "Season" approximated as 90 days |
| `talentMix[n].pct` | archetype count / total accepted talent with archetype × 100 | NULL archetype rows excluded |
| `rosterSize.count` | Count of applications with `status = 'accepted'` | `booked` talent excluded — see status semantics above |
| `rosterSize.changeThisMonth` | Count of new `accepted` applications since start of current UTC month | Returns `0` when no acceptances this month |
| `alerts[positive].count` | Count of `submitted` applications created in last 2 hours | `archived`/`declined` excluded; only genuine new inbound |

---

## File Layout

```
migrations/
  20260316000001_rename_pending_to_submitted_and_expand_statuses.js
  20260316000002_add_archetype_to_profiles.js
  20260316000003_add_closes_at_to_boards.js

src/routes/api/
  agency-overview.js          ← Express router, thin handler

src/lib/
  agency-overview-queries.js  ← named query exports, no Express deps

src/app.js (or route mounting file)
  ← mount agency-overview router at /api/agency/overview
```

### `agency-overview-queries.js` exports

```js
getPendingReview(db, agencyId)    → { count, oldestDaysAgo }
getActiveCastings(db, agencyId)   → { count, closingToday }
getRosterSize(db, agencyId)       → { count, trend, changeThisMonth }
getPlacementRate(db, agencyId)    → { current, lastSeason }
getPipeline(db, agencyId)         → [{ label, count, sharePct }]
getTalentMix(db, agencyId)        → [{ name, count, pct }]
getAlerts(db, agencyId)           → [{ type, message, count, link }]
```

Each function accepts the knex instance and `agencyId`, returns a plain object or array, throws on DB error (caught by the route handler).

---

## Error Handling

- Auth failures: handled by `requireAuth` / `requireRole` middleware (401/403)
- DB errors: caught in route handler, returns `{ success: false, error: 'Internal server error' }` with 500
- Empty state (new agency, no data): all counts return `0`, trend returns `[0,0,0,0,0,0,0]`, arrays return `[]` — never `null`

---

## Out of Scope

- Frontend wiring (`OverviewPage.jsx` React Query integration + `getAgencyOverview()` stub in `client/src/api/agency.js`)
- Analytics FunnelView conversion rate endpoint
- TalentPanel quick-action handlers (Accept/Message)
- `under_review` status migration (5th pipeline stage — follow-up task; when added, the pipeline query `IN` clause expands and the alert query gains a second status to check)
