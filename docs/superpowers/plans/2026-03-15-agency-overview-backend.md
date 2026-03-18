# Agency Overview Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Express backend (migrations + query library + route) that powers the Agency Overview tab's KPI cards, pipeline bar, talent mix donut, attention alerts, and roster trend.

**Architecture:** Three migrations evolve the data model (rename `pending`→`submitted`, add `archetype` to profiles, add `closes_at` to boards). A dialect-agnostic query library (`src/lib/agency-overview-queries.js`) exports one named function per data section. A thin Express router (`src/routes/api/agency-overview.js`) calls all seven in parallel and assembles the response.

**Tech Stack:** Node.js 20, Express 5, Knex.js (SQLite dev / PostgreSQL prod), Jest + Supertest

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `migrations/20260316000001_rename_pending_to_submitted_and_expand_statuses.js` | Rename `pending`→`submitted`; add `shortlisted`, `booked`, `passed`; update PG CHECK constraint |
| Create | `migrations/20260316000002_add_archetype_to_profiles.js` | Add nullable `archetype` column to `profiles` |
| Create | `migrations/20260316000003_add_closes_at_to_boards.js` | Add nullable `closes_at` timestamp to `boards` |
| Create | `src/lib/agency-overview-queries.js` | All 7 query functions, no Express deps |
| Create | `src/routes/api/agency-overview.js` | `GET /api/agency/overview` route handler |
| Modify | `src/app.js` | Mount the new router |
| Create | `tests/agency-overview.test.js` | Integration tests for all 7 data sections |

---

## Chunk 1: Migrations

### Task 1: Migration — rename `pending` and expand statuses

**Files:**
- Create: `migrations/20260316000001_rename_pending_to_submitted_and_expand_statuses.js`

- [ ] **Step 1.1: Write the migration file**

```js
// migrations/20260316000001_rename_pending_to_submitted_and_expand_statuses.js

/**
 * Renames the 'pending' application status to 'submitted' and adds
 * three new pipeline statuses: 'shortlisted', 'booked', 'passed'.
 *
 * Valid statuses after migration:
 *   submitted, shortlisted, booked, passed, accepted, declined, archived
 *
 * SQLite: TEXT column with CHECK — data is updated, old constraint is left
 *   in place (SQLite can't ALTER CHECK constraints without table recreation;
 *   app-level validation enforces valid values going forward).
 * PostgreSQL: data is updated, old CHECK constraint is dropped and replaced.
 */

/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  // Step 1 — backfill data (both DBs)
  await knex('applications').where('status', 'pending').update({ status: 'submitted' })

  // Step 2 — PostgreSQL only: replace CHECK constraint to allow all 7 values
  const isPg = knex.client.config.client === 'pg'
  if (isPg) {
    // Find and drop the existing status CHECK constraint by inspecting pg_constraint
    await knex.raw(`
      DO $$
      DECLARE _cname TEXT;
      BEGIN
        SELECT conname INTO _cname
        FROM pg_constraint
        WHERE conrelid = 'applications'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%status%'
        LIMIT 1;
        IF _cname IS NOT NULL THEN
          EXECUTE 'ALTER TABLE applications DROP CONSTRAINT ' || quote_ident(_cname);
        END IF;
      END $$;
    `)
    // Add updated CHECK constraint with all 7 valid values
    await knex.raw(`
      ALTER TABLE applications
        ADD CONSTRAINT applications_status_check
        CHECK (status IN (
          'submitted', 'shortlisted', 'booked', 'passed',
          'accepted', 'declined', 'archived'
        ))
    `)
  }
}

/** @param {import('knex').Knex} knex */
exports.down = async function (knex) {
  // Revert data: rename 'submitted' back to 'pending'
  // (shortlisted/booked/passed rows did not exist before — leave them as-is
  //  since we cannot know which were 'pending' originally)
  await knex('applications').where('status', 'submitted').update({ status: 'pending' })

  const isPg = knex.client.config.client === 'pg'
  if (isPg) {
    await knex.raw(`
      DO $$
      DECLARE _cname TEXT;
      BEGIN
        SELECT conname INTO _cname
        FROM pg_constraint
        WHERE conrelid = 'applications'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%status%'
        LIMIT 1;
        IF _cname IS NOT NULL THEN
          EXECUTE 'ALTER TABLE applications DROP CONSTRAINT ' || quote_ident(_cname);
        END IF;
      END $$;
    `)
    await knex.raw(`
      ALTER TABLE applications
        ADD CONSTRAINT applications_status_check
        CHECK (status IN ('pending', 'accepted', 'archived', 'declined'))
    `)
  }
}
```

- [ ] **Step 1.2: Run the migration and verify**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && npm run migrate
```

Expected: migration runs without error.

```bash
npm run migrate:status
```

Expected: `20260316000001_rename_pending_to_submitted_and_expand_statuses` shows as `Ran`.

- [ ] **Step 1.3: Verify data backfill in dev DB**

```bash
node -e "
const knex = require('./src/db/knex');
knex('applications').where('status','pending').count('* as n').first()
  .then(r => { console.log('pending rows remaining:', r.n); knex.destroy(); });
"
```

Expected: `pending rows remaining: 0`

- [ ] **Step 1.4: Commit**

```bash
git add migrations/20260316000001_rename_pending_to_submitted_and_expand_statuses.js
git commit -m "feat(db): rename pending→submitted and expand application statuses"
```

---

### Task 2: Migration — add `archetype` to profiles

**Files:**
- Create: `migrations/20260316000002_add_archetype_to_profiles.js`

- [ ] **Step 2.1: Write the migration file**

```js
// migrations/20260316000002_add_archetype_to_profiles.js

/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  const hasCol = await knex.schema.hasColumn('profiles', 'archetype')
  if (hasCol) return // idempotent guard

  await knex.schema.alterTable('profiles', (table) => {
    table.string('archetype', 20).nullable()
    // Valid values: 'editorial' | 'runway' | 'commercial' | 'lifestyle'
    // Enforced at application layer; NULL = not yet set
  })
}

/** @param {import('knex').Knex} knex */
exports.down = async function (knex) {
  const hasCol = await knex.schema.hasColumn('profiles', 'archetype')
  if (!hasCol) return

  await knex.schema.alterTable('profiles', (table) => {
    table.dropColumn('archetype')
  })
}
```

- [ ] **Step 2.2: Run and verify**

```bash
npm run migrate && npm run migrate:status
```

Expected: `20260316000002_add_archetype_to_profiles` shows as `Ran`.

```bash
node -e "
const knex = require('./src/db/knex');
knex.schema.hasColumn('profiles','archetype')
  .then(r => { console.log('archetype column exists:', r); knex.destroy(); });
"
```

Expected: `archetype column exists: true`

- [ ] **Step 2.3: Commit**

```bash
git add migrations/20260316000002_add_archetype_to_profiles.js
git commit -m "feat(db): add archetype column to profiles"
```

---

### Task 3: Migration — add `closes_at` to boards

**Files:**
- Create: `migrations/20260316000003_add_closes_at_to_boards.js`

- [ ] **Step 3.1: Write the migration file**

```js
// migrations/20260316000003_add_closes_at_to_boards.js

/**
 * Adds closes_at TIMESTAMP NULL to boards.
 *
 * Semantics: UTC timestamp at which the casting closes (exclusive end).
 * NULL means no deadline. "Closing today" = closes_at falls within the
 * current UTC calendar day [dayStart, dayStart + 24h).
 */

/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  const hasCol = await knex.schema.hasColumn('boards', 'closes_at')
  if (hasCol) return

  await knex.schema.alterTable('boards', (table) => {
    table.timestamp('closes_at').nullable()
  })
}

/** @param {import('knex').Knex} knex */
exports.down = async function (knex) {
  const hasCol = await knex.schema.hasColumn('boards', 'closes_at')
  if (!hasCol) return

  await knex.schema.alterTable('boards', (table) => {
    table.dropColumn('closes_at')
  })
}
```

- [ ] **Step 3.2: Run and verify**

```bash
npm run migrate && npm run migrate:status
```

Expected: all three new migrations show as `Ran`.

```bash
node -e "
const knex = require('./src/db/knex');
knex.schema.hasColumn('boards','closes_at')
  .then(r => { console.log('closes_at column exists:', r); knex.destroy(); });
"
```

Expected: `closes_at column exists: true`

- [ ] **Step 3.3: Commit**

```bash
git add migrations/20260316000003_add_closes_at_to_boards.js
git commit -m "feat(db): add closes_at column to boards"
```

---

## Chunk 2: Query Library

### Task 4: Write `agency-overview-queries.js`

**Files:**
- Create: `src/lib/agency-overview-queries.js`

This file has no Express dependencies. Each function accepts `(db, agencyId)` and returns a plain value. All date arithmetic is done in JS; no dialect-specific SQL date functions are used.

- [ ] **Step 4.1: Write the file**

```js
// src/lib/agency-overview-queries.js
'use strict'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns { dayStart: Date, dayEnd: Date } for the current UTC calendar day.
 * dayEnd is exclusive (start of next day).
 */
function utcDayBounds () {
  const now = new Date()
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dayEnd   = new Date(dayStart.getTime() + 86400000)
  return { dayStart, dayEnd }
}

/**
 * Returns the start of the current UTC calendar month.
 */
function utcMonthStart () {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

/**
 * Returns the count of unreviewed (submitted) applications and how many
 * days ago the oldest one was submitted.
 *
 * @returns {{ count: number, oldestDaysAgo: number|null }}
 */
async function getPendingReview (db, agencyId) {
  const [row] = await db('applications')
    .where({ agency_id: agencyId, status: 'submitted' })
    .select(
      db.raw('COUNT(*) as count'),
      db.raw('MIN(created_at) as oldest_at')
    )

  const count = parseInt(row.count, 10) || 0
  if (count === 0) return { count: 0, oldestDaysAgo: null }

  const oldestDaysAgo = row.oldest_at
    ? Math.floor((Date.now() - new Date(row.oldest_at).getTime()) / 86400000)
    : null

  return { count, oldestDaysAgo }
}

/**
 * Returns the count of active boards and how many close today (UTC).
 *
 * @returns {{ count: number, closingToday: number }}
 */
async function getActiveCastings (db, agencyId) {
  const { dayStart, dayEnd } = utcDayBounds()

  const [totalRow] = await db('boards')
    .where({ agency_id: agencyId, is_active: true })
    .count('* as count')

  const [closingRow] = await db('boards')
    .where({ agency_id: agencyId, is_active: true })
    .where('closes_at', '>=', dayStart)
    .where('closes_at', '<', dayEnd)   // exclusive upper bound
    .count('* as count')

  return {
    count:        parseInt(totalRow.count,   10) || 0,
    closingToday: parseInt(closingRow.count, 10) || 0,
  }
}

/**
 * Returns the roster count (accepted talent with non-null accepted_at),
 * a 7-element cumulative trend array, and new acceptances this month.
 *
 * trend[0] = oldest week, trend[6] = current week (equals `count`).
 *
 * @returns {{ count: number, trend: number[], changeThisMonth: number }}
 */
async function getRosterSize (db, agencyId) {
  const sevenWeeksAgo = new Date(Date.now() - 49 * 86400000)
  const monthStart    = utcMonthStart()

  // Current count — only rows with accepted_at (matches trend invariant)
  const [countRow] = await db('applications')
    .where({ agency_id: agencyId, status: 'accepted' })
    .whereNotNull('accepted_at')
    .count('* as count')
  const count = parseInt(countRow.count, 10) || 0

  // Cumulative base: accepted before the 7-week window
  const [baseRow] = await db('applications')
    .where({ agency_id: agencyId, status: 'accepted' })
    .whereNotNull('accepted_at')
    .where('accepted_at', '<', sevenWeeksAgo)
    .count('* as count')
  const base = parseInt(baseRow.count, 10) || 0

  // Per-week new acceptances within the window (JS bucketing, dialect-agnostic)
  const windowRows = await db('applications')
    .where({ agency_id: agencyId, status: 'accepted' })
    .whereNotNull('accepted_at')
    .where('accepted_at', '>=', sevenWeeksAgo)
    .select('accepted_at')

  const WEEK_MS = 7 * 86400000
  const newPerSlot = [0, 0, 0, 0, 0, 0, 0]
  for (const row of windowRows) {
    const slot = Math.min(6, Math.floor((new Date(row.accepted_at).getTime() - sevenWeeksAgo.getTime()) / WEEK_MS))
    newPerSlot[Math.max(0, slot)]++
  }

  // Build cumulative array
  const trend = []
  let running = base
  for (let i = 0; i < 7; i++) {
    running += newPerSlot[i]
    trend.push(running)
  }

  // Change this month
  const [monthRow] = await db('applications')
    .where({ agency_id: agencyId, status: 'accepted' })
    .whereNotNull('accepted_at')
    .where('accepted_at', '>=', monthStart)
    .count('* as count')
  const changeThisMonth = parseInt(monthRow.count, 10) || 0

  return { count, trend, changeThisMonth }
}

/**
 * Returns placement rate (%) for the current 90-day window and the
 * prior 90-day window ("last season"). Both windows use exclusive upper
 * bounds so no application is counted twice.
 *
 * placementRate = booked / (booked + passed + declined + accepted) × 100
 *
 * @returns {{ current: number, lastSeason: number }}
 */
async function getPlacementRate (db, agencyId) {
  const now    = Date.now()
  const now90  = new Date(now - 90 * 86400000)
  const now180 = new Date(now - 180 * 86400000)

  async function rateForWindow (windowStart, windowEnd) {
    const [row] = await db('applications')
      .where('agency_id', agencyId)
      .where('created_at', '>=', windowStart)
      .where('created_at', '<',  windowEnd)
      .whereIn('status', ['booked', 'passed', 'declined', 'accepted'])
      .select(
        db.raw("SUM(CASE WHEN status = 'booked' THEN 1 ELSE 0 END) as booked"),
        db.raw('COUNT(*) as decided')
      )

    const booked  = parseInt(row.booked,  10) || 0
    const decided = parseInt(row.decided, 10) || 0
    return decided > 0 ? Math.round((booked / decided) * 100) : 0
  }

  const [current, lastSeason] = await Promise.all([
    rateForWindow(now90,  new Date(now)),  // last 90 days
    rateForWindow(now180, now90),          // prior 90 days (no overlap)
  ])

  return { current, lastSeason }
}

/**
 * Returns per-stage counts and share percentages for the casting pipeline.
 * sharePct = stage count / total × 100 (independent rounding; may not sum to 100).
 *
 * @returns {Array<{ label: string, count: number, sharePct: number }>}
 */
async function getPipeline (db, agencyId) {
  const LABEL_MAP = {
    submitted:   'Submitted',
    shortlisted: 'Shortlisted',
    booked:      'Booked',
    passed:      'Passed',
    declined:    'Declined',
  }
  const STAGE_ORDER = ['submitted', 'shortlisted', 'booked', 'passed', 'declined']

  const rows = await db('applications')
    .where('agency_id', agencyId)
    .whereIn('status', STAGE_ORDER)
    .groupBy('status')
    .select('status', db.raw('COUNT(*) as count'))

  // Build a map and compute total
  const countMap = {}
  let total = 0
  for (const row of rows) {
    const c = parseInt(row.count, 10) || 0
    countMap[row.status] = c
    total += c
  }

  if (total === 0) return []

  return STAGE_ORDER.map((status) => {
    const count = countMap[status] || 0
    return {
      label:    LABEL_MAP[status],
      count,
      sharePct: Math.round((count / total) * 100),
    }
  })
}

/**
 * Returns archetype breakdown for accepted talent on the roster.
 * Only accepted applications whose profile has a non-null archetype are included.
 * pct = archetype count / total-with-archetype × 100.
 *
 * @returns {Array<{ name: string, count: number, pct: number }>}
 */
async function getTalentMix (db, agencyId) {
  const rows = await db('applications as a')
    .join('profiles as p', 'p.id', 'a.profile_id')
    .where('a.agency_id', agencyId)
    .where('a.status', 'accepted')
    .whereNotNull('p.archetype')
    .groupBy('p.archetype')
    .select('p.archetype as name', db.raw('COUNT(*) as count'))
    .orderBy('count', 'desc')

  if (rows.length === 0) return []

  const total = rows.reduce((sum, r) => sum + (parseInt(r.count, 10) || 0), 0)
  if (total === 0) return []

  return rows.map((row) => ({
    name:  row.name,
    count: parseInt(row.count, 10),
    pct:   Math.round((parseInt(row.count, 10) / total) * 100),
  }))
}

/**
 * Returns attention alerts for the overview strip.
 * Only alerts with count > 0 are included.
 *
 * @returns {Array<{ type: 'critical'|'warning'|'positive', message: string, count: number, link: string }>}
 */
async function getAlerts (db, agencyId) {
  const { dayStart, dayEnd } = utcDayBounds()
  const cutoff14d   = new Date(Date.now() - 14 * 86400000)
  const twoHoursAgo = new Date(Date.now() - 2 * 3600000)

  const [
    [overdueRow],
    [closingRow],
    [newRow],
  ] = await Promise.all([
    // Critical: submitted applications older than 14 days
    db('applications')
      .where({ agency_id: agencyId, status: 'submitted' })
      .where('created_at', '<=', cutoff14d)
      .count('* as count'),

    // Warning: boards closing today (UTC)
    db('boards')
      .where({ agency_id: agencyId, is_active: true })
      .where('closes_at', '>=', dayStart)
      .where('closes_at', '<', dayEnd)
      .count('* as count'),

    // Positive: new submitted applications in last 2 hours
    db('applications')
      .where({ agency_id: agencyId, status: 'submitted' })
      .where('created_at', '>=', twoHoursAgo)
      .count('* as count'),
  ])

  const overdue  = parseInt(overdueRow.count,  10) || 0
  const closing  = parseInt(closingRow.count,  10) || 0
  const newApps  = parseInt(newRow.count,      10) || 0

  const alerts = []

  if (overdue > 0) {
    alerts.push({
      type:    'critical',
      message: `${overdue} application${overdue === 1 ? '' : 's'} waiting for review for 14+ days`,
      count:   overdue,
      link:    '/dashboard/agency/applicants',
    })
  }

  if (closing > 0) {
    alerts.push({
      type:    'warning',
      message: `${closing} casting${closing === 1 ? '' : 's'} close${closing === 1 ? 's' : ''} today`,
      count:   closing,
      link:    '/dashboard/agency/casting',
    })
  }

  if (newApps > 0) {
    alerts.push({
      type:    'positive',
      message: `${newApps} new application${newApps === 1 ? '' : 's'} in the last 2 hours`,
      count:   newApps,
      link:    '/dashboard/agency/applicants',
    })
  }

  return alerts
}

module.exports = {
  getPendingReview,
  getActiveCastings,
  getRosterSize,
  getPlacementRate,
  getPipeline,
  getTalentMix,
  getAlerts,
}
```

- [ ] **Step 4.2: Smoke-test the module loads without error**

```bash
node -e "const q = require('./src/lib/agency-overview-queries'); console.log(Object.keys(q));"
```

Expected:
```
[
  'getPendingReview', 'getActiveCastings', 'getRosterSize',
  'getPlacementRate', 'getPipeline', 'getTalentMix', 'getAlerts'
]
```

- [ ] **Step 4.3: Commit**

```bash
git add src/lib/agency-overview-queries.js
git commit -m "feat: add agency overview query library"
```

---

## Chunk 3: Route + Mounting

### Task 5: Write the Express route handler

**Files:**
- Create: `src/routes/api/agency-overview.js`

- [ ] **Step 5.1: Write the route file**

```js
// src/routes/api/agency-overview.js
'use strict'

const express   = require('express')
const router    = express.Router()
const knex      = require('../../db/knex')
const { requireRole } = require('../../middleware/auth')
const {
  getPendingReview,
  getActiveCastings,
  getRosterSize,
  getPlacementRate,
  getPipeline,
  getTalentMix,
  getAlerts,
} = require('../../lib/agency-overview-queries')

/**
 * GET /api/agency/overview
 *
 * Returns aggregated KPI, pipeline, talent mix, and alert data
 * for the Agency Overview tab. All 7 queries run in parallel.
 *
 * Auth: requireRole('AGENCY') — also verifies session via ensureSignedIn internally.
 */
router.get('/api/agency/overview', requireRole('AGENCY'), async (req, res) => {
  try {
    const agencyId = req.session.userId

    const [
      pendingReview,
      activeCastings,
      rosterSize,
      placementRate,
      pipeline,
      talentMix,
      alerts,
    ] = await Promise.all([
      getPendingReview(knex,   agencyId),
      getActiveCastings(knex,  agencyId),
      getRosterSize(knex,      agencyId),
      getPlacementRate(knex,   agencyId),
      getPipeline(knex,        agencyId),
      getTalentMix(knex,       agencyId),
      getAlerts(knex,          agencyId),
    ])

    return res.json({
      success: true,
      data: {
        kpis: { pendingReview, activeCastings, rosterSize, placementRate },
        pipeline,
        talentMix,
        alerts,
      },
    })
  } catch (err) {
    console.error('[AgencyOverview] Error:', err)
    return res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

module.exports = router
```

- [ ] **Step 5.2: Smoke-test the module loads without error**

```bash
node -e "require('./src/routes/api/agency-overview'); console.log('OK');"
```

Expected: `OK`

- [ ] **Step 5.3: Commit**

```bash
git add src/routes/api/agency-overview.js
git commit -m "feat: add GET /api/agency/overview route handler"
```

---

### Task 6: Mount the router in `src/app.js`

**Files:**
- Modify: `src/app.js`

- [ ] **Step 6.1: Find where existing agency API routes are required**

Open `src/app.js` and locate the line that looks like:
```js
const agencyApiRoutes = require('./routes/api/agency')
// and
app.use('/', agencyApiRoutes)
```

- [ ] **Step 6.2: Add the new router — require it alongside the existing one**

Add immediately after the `agencyApiRoutes` require line:
```js
const agencyOverviewRoutes = require('./routes/api/agency-overview')
```

And immediately after its `app.use('/', agencyApiRoutes)` line:
```js
app.use('/', agencyOverviewRoutes)
```

- [ ] **Step 6.3: Verify the server starts without error**

```bash
node -e "
const app = require('./src/app');
console.log('app loaded OK');
process.exit(0);
"
```

Expected: `app loaded OK` (no crash)

- [ ] **Step 6.4: Commit**

```bash
git add src/app.js
git commit -m "feat: mount agency-overview router in app"
```

---

## Chunk 4: Integration Tests

### Task 7: Write integration tests

**Files:**
- Create: `tests/agency-overview.test.js`

**Auth note:** `POST /login` requires a Firebase token — it cannot be used with raw email/password in tests. All tests use **session injection** instead: insert a session row directly into the `sessions` table and set a signed `connect.sid` cookie on the supertest agent. The session secret in test environments is `'pholio-secret'` (the `SESSION_SECRET` env var default from `src/config.js`). Session signing uses the `cookie-signature` package (a transitive dependency of `express-session`).

The test suite:
1. Boots the full Express app with real SQLite DB and migrations
2. Seeds using the existing seed file (agency@example.com / talent@example.com)
3. Tests auth enforcement — unauthenticated and wrong-role requests are rejected
4. Tests the happy path — authenticated agency gets the correct response shape
5. Tests zero-state via query functions directly — verifies 0/null/[] values without HTTP
6. Tests data correctness — API values match direct DB queries

- [ ] **Step 7.1: Write the test file**

```js
// tests/agency-overview.test.js
'use strict'

const request   = require('supertest')
const cookieSig = require('cookie-signature')   // transitive dep of express-session
const { v4: uuidv4 } = require('uuid')
const knex      = require('../src/db/knex')
const app       = require('../src/app')
const queries   = require('../src/lib/agency-overview-queries')

// Session secret must match src/config.js default (SESSION_SECRET env var || 'pholio-secret')
const SESSION_SECRET = process.env.SESSION_SECRET || 'pholio-secret'

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  try {
    await knex.raw('UPDATE knex_migrations_lock SET is_locked = 0 WHERE is_locked = 1')
  } catch (_) { /* lock table may not exist yet */ }
  try {
    await knex.migrate.rollback({}, true)
  } catch (_) {
    try { await knex.raw('UPDATE knex_migrations_lock SET is_locked = 0') } catch (__) {}
  }
  await knex.migrate.latest()
  await knex.seed.run()
}, 60000)

afterAll(async () => {
  await knex.destroy()
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a supertest agent with an injected session for the given userId and role.
 * Inserts a session row into the DB and sets a signed connect.sid cookie on the agent.
 * This bypasses Firebase auth entirely.
 */
async function agentWithSession (userId, role) {
  const sid = uuidv4()

  await knex('sessions').insert({
    sid,
    sess: JSON.stringify({
      cookie: { originalMaxAge: null, expires: null, secure: false, httpOnly: true, path: '/' },
      userId,
      role,
    }),
    expired: new Date(Date.now() + 86400000),
  })

  // express-session signs cookies as: s:<sid>.<hmac-sha256>
  const signed  = 's:' + cookieSig.sign(sid, SESSION_SECRET)
  const encoded = encodeURIComponent(signed)

  // Return a function that adds the cookie to any supertest request
  // Usage: await agentReq(request(app).get('/api/agency/overview'))
  return function agentReq (req) {
    return req.set('Cookie', `connect.sid=${encoded}`)
  }
}

// ─── Auth enforcement ─────────────────────────────────────────────────────────

describe('GET /api/agency/overview — auth', () => {
  test('returns 401 when not logged in', async () => {
    const res = await request(app).get('/api/agency/overview')
    expect(res.status).toBe(401)
  })

  test('returns 403 when logged in as TALENT', async () => {
    const talentUser = await knex('users').where({ email: 'talent@example.com' }).first()
    const withCookie = await agentWithSession(talentUser.id, 'TALENT')
    const res = await withCookie(request(app).get('/api/agency/overview'))
    expect(res.status).toBe(403)
  })
})

// ─── Response shape ───────────────────────────────────────────────────────────

describe('GET /api/agency/overview — response shape', () => {
  let res
  let withCookie

  beforeAll(async () => {
    const agencyUser = await knex('users').where({ email: 'agency@example.com' }).first()
    withCookie = await agentWithSession(agencyUser.id, 'AGENCY')
    res = await withCookie(request(app).get('/api/agency/overview'))
  })

  test('returns 200', () => {
    expect(res.status).toBe(200)
  })

  test('top-level shape: success + data', () => {
    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeDefined()
  })

  test('kpis shape', () => {
    const { kpis } = res.body.data
    expect(kpis).toBeDefined()

    // pendingReview
    expect(typeof kpis.pendingReview.count).toBe('number')
    expect(
      kpis.pendingReview.oldestDaysAgo === null ||
      typeof kpis.pendingReview.oldestDaysAgo === 'number'
    ).toBe(true)

    // activeCastings
    expect(typeof kpis.activeCastings.count).toBe('number')
    expect(typeof kpis.activeCastings.closingToday).toBe('number')

    // rosterSize
    expect(typeof kpis.rosterSize.count).toBe('number')
    expect(Array.isArray(kpis.rosterSize.trend)).toBe(true)
    expect(kpis.rosterSize.trend).toHaveLength(7)
    expect(typeof kpis.rosterSize.changeThisMonth).toBe('number')

    // placementRate
    expect(typeof kpis.placementRate.current).toBe('number')
    expect(typeof kpis.placementRate.lastSeason).toBe('number')
  })

  test('pipeline is an array; each entry has label/count/sharePct', () => {
    const { pipeline } = res.body.data
    expect(Array.isArray(pipeline)).toBe(true)
    for (const entry of pipeline) {
      expect(typeof entry.label).toBe('string')
      expect(typeof entry.count).toBe('number')
      expect(typeof entry.sharePct).toBe('number')
    }
  })

  test('talentMix is an array; each entry has name/count/pct', () => {
    const { talentMix } = res.body.data
    expect(Array.isArray(talentMix)).toBe(true)
    for (const entry of talentMix) {
      expect(typeof entry.name).toBe('string')
      expect(typeof entry.count).toBe('number')
      expect(typeof entry.pct).toBe('number')
    }
  })

  test('alerts is an array; each entry has type/message/count/link', () => {
    const { alerts } = res.body.data
    expect(Array.isArray(alerts)).toBe(true)
    for (const alert of alerts) {
      expect(['critical', 'warning', 'positive']).toContain(alert.type)
      expect(typeof alert.message).toBe('string')
      expect(typeof alert.count).toBe('number')
      expect(typeof alert.link).toBe('string')
    }
  })

  test('no field in the response is null (except oldestDaysAgo when pendingReview.count is 0)', () => {
    const { kpis, pipeline, talentMix, alerts } = res.body.data

    expect(kpis.activeCastings.count).not.toBeNull()
    expect(kpis.activeCastings.closingToday).not.toBeNull()
    expect(kpis.rosterSize.count).not.toBeNull()
    expect(kpis.rosterSize.trend).not.toBeNull()
    expect(kpis.rosterSize.changeThisMonth).not.toBeNull()
    expect(kpis.placementRate.current).not.toBeNull()
    expect(kpis.placementRate.lastSeason).not.toBeNull()

    if (kpis.pendingReview.count === 0) {
      expect(kpis.pendingReview.oldestDaysAgo).toBeNull()
    } else {
      expect(kpis.pendingReview.oldestDaysAgo).not.toBeNull()
    }

    expect(pipeline).not.toBeNull()
    expect(talentMix).not.toBeNull()
    expect(alerts).not.toBeNull()
  })
})

// ─── Zero-state (query functions directly) ────────────────────────────────────

describe('query functions — zero state (fresh agency with no data)', () => {
  let freshAgencyId

  beforeAll(async () => {
    freshAgencyId = uuidv4()
    await knex('users').insert({
      id:           freshAgencyId,
      email:        `fresh-${Date.now()}@test.local`,
      role:         'AGENCY',
      display_name: 'Fresh Agency',
      created_at:   knex.fn.now(),
      updated_at:   knex.fn.now(),
    })
  })

  test('getPendingReview returns { count: 0, oldestDaysAgo: null }', async () => {
    const result = await queries.getPendingReview(knex, freshAgencyId)
    expect(result).toEqual({ count: 0, oldestDaysAgo: null })
  })

  test('getActiveCastings returns { count: 0, closingToday: 0 }', async () => {
    const result = await queries.getActiveCastings(knex, freshAgencyId)
    expect(result).toEqual({ count: 0, closingToday: 0 })
  })

  test('getRosterSize returns count:0, 7-element zero trend, changeThisMonth:0', async () => {
    const result = await queries.getRosterSize(knex, freshAgencyId)
    expect(result.count).toBe(0)
    expect(result.trend).toHaveLength(7)
    expect(result.trend.every(v => v === 0)).toBe(true)
    expect(result.changeThisMonth).toBe(0)
  })

  test('getPlacementRate returns { current: 0, lastSeason: 0 }', async () => {
    const result = await queries.getPlacementRate(knex, freshAgencyId)
    expect(result).toEqual({ current: 0, lastSeason: 0 })
  })

  test('getPipeline returns []', async () => {
    const result = await queries.getPipeline(knex, freshAgencyId)
    expect(result).toEqual([])
  })

  test('getTalentMix returns []', async () => {
    const result = await queries.getTalentMix(knex, freshAgencyId)
    expect(result).toEqual([])
  })

  test('getAlerts returns []', async () => {
    const result = await queries.getAlerts(knex, freshAgencyId)
    expect(result).toEqual([])
  })
})

// ─── Data correctness (query functions against seeded data) ───────────────────

describe('query functions — data correctness (seeded agency)', () => {
  let agencyId

  beforeAll(async () => {
    const user = await knex('users').where({ email: 'agency@example.com' }).first()
    agencyId = user.id
  })

  test('pendingReview count matches DB', async () => {
    const [row] = await knex('applications')
      .where({ agency_id: agencyId, status: 'submitted' })
      .count('* as count')
    const expected = parseInt(row.count, 10) || 0

    const result = await queries.getPendingReview(knex, agencyId)
    expect(result.count).toBe(expected)
  })

  test('rosterSize count matches DB (accepted + non-null accepted_at)', async () => {
    const [row] = await knex('applications')
      .where({ agency_id: agencyId, status: 'accepted' })
      .whereNotNull('accepted_at')
      .count('* as count')
    const expected = parseInt(row.count, 10) || 0

    const result = await queries.getRosterSize(knex, agencyId)
    expect(result.count).toBe(expected)
  })

  test('rosterSize trend[6] equals rosterSize.count (spec invariant)', async () => {
    const result = await queries.getRosterSize(knex, agencyId)
    expect(result.trend[6]).toBe(result.count)
  })

  test('pipeline sharePct values sum to approximately 100 (±2) when non-empty', async () => {
    const pipeline = await queries.getPipeline(knex, agencyId)
    if (pipeline.length === 0) return
    const sum = pipeline.reduce((acc, s) => acc + s.sharePct, 0)
    expect(sum).toBeGreaterThanOrEqual(98)
    expect(sum).toBeLessThanOrEqual(102)
  })

  test('placementRate values are integers in range 0–100', async () => {
    const result = await queries.getPlacementRate(knex, agencyId)
    expect(result.current).toBeGreaterThanOrEqual(0)
    expect(result.current).toBeLessThanOrEqual(100)
    expect(result.lastSeason).toBeGreaterThanOrEqual(0)
    expect(result.lastSeason).toBeLessThanOrEqual(100)
    expect(Number.isInteger(result.current)).toBe(true)
    expect(Number.isInteger(result.lastSeason)).toBe(true)
  })
})
```

- [ ] **Step 7.2: Run the tests**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && npx jest tests/agency-overview.test.js --verbose
```

Expected: all tests pass. If a test fails, read the error, fix the relevant query or route code, re-run.

- [ ] **Step 7.3: Run the full test suite to confirm no regressions**

```bash
npm test
```

Expected: all pre-existing tests still pass.

- [ ] **Step 7.4: Commit**

```bash
git add tests/agency-overview.test.js
git commit -m "test: add agency overview backend integration tests"
```

---

## Done

At this point:
- Three migrations are applied and verified
- `src/lib/agency-overview-queries.js` exports 7 tested query functions
- `GET /api/agency/overview` is live, auth-protected, and returns the full spec shape
- Integration tests cover auth enforcement, response shape, null safety, and data correctness

**Next step (out of scope for this plan):** Wire `OverviewPage.jsx` to call this endpoint via React Query, replacing hardcoded demo data.
