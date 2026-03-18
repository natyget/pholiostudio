# Agency Analytics Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing API-driven analytics stub with a static-data funnel health dashboard answering "Is my pipeline working?"

**Architecture:** All components live in two files — `AnalyticsPage.jsx` (components + static data) and `AnalyticsPage.css` (all styles). No new dependencies; all SVG is inline. State lives in the top-level `AnalyticsPage` component and flows down as props.

**Tech Stack:** React 19, Framer Motion (motion, AnimatePresence), Lucide React, React Router Link, inline SVG

**Spec:** `docs/superpowers/specs/2026-03-14-agency-analytics-design.md`

---

## File Structure

| File | Operation | Responsibility |
|------|-----------|---------------|
| `client/src/routes/agency/AnalyticsPage.jsx` | **Rewrite** | All components + all static data |
| `client/src/routes/agency/AnalyticsPage.css` | **Create** | All styles for Analytics page |

`AnalyticsPage.jsx` internal structure (top to bottom):
1. Imports
2. `ICON_MAP` — static Lucide icon lookup
3. `SIGNALS`, `FUNNEL_DATA`, `VELOCITY_DATA`, `ROSTER_DATA` — static data keyed by range
4. `VELOCITY_THRESHOLDS` + `getDaysColor()` helper
5. `AnalyticsSubHeader` component
6. `SignalCard` + `AISignalStrip` components
7. `ConversionBadge` + `StageBlock` + `FunnelConnector` + `FunnelView` components
8. `VelocityRow` + `PipelineVelocityTable` components
9. `RosterGrowthPanel` component
10. `AnalyticsPage` default export

---

## Chunk 1: CSS file, static data, AnalyticsSubHeader, AISignalStrip

### Task 1: Create the CSS file

**Files:**
- Create: `client/src/routes/agency/AnalyticsPage.css`

- [ ] **Step 1.1: Create the CSS file with all styles**

```css
/* ============================================================
   PHOLIO AGENCY — Analytics Page
   ============================================================ */

/* ── Page shell ── */
.an-page {
  padding: 0 40px 48px;
  background: #FAF8F5;
  min-height: 100%;
}

/* ── Sub-header ── */
.an-subheader {
  position: sticky;
  top: 0;
  z-index: 40;
  background: #FAF8F5;
  border-bottom: 1px solid #EDE9E4;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 -40px;
  padding: 0 40px;
}

.an-range-pill {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid transparent;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.an-range-pill:hover { background: rgba(0,0,0,0.03); color: #0f172a; }
.an-range-pill.active { background: #0f172a; color: #ffffff; border-color: #0f172a; }

/* ── AI Signal Strip ── */
.an-signals {
  display: flex;
  gap: 16px;
  padding: 32px 0 0;
}

.an-signal-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid;
}
.an-signal-card--positive { background: rgba(22,163,74,0.06);  border-color: rgba(22,163,74,0.18); }
.an-signal-card--warning  { background: rgba(217,119,6,0.06);  border-color: rgba(217,119,6,0.18); }
.an-signal-card--critical { background: rgba(220,38,38,0.06);  border-color: rgba(220,38,38,0.18); }
.an-signal-card--neutral  { background: rgba(0,0,0,0.02);      border-color: rgba(0,0,0,0.06);    }

.an-signal-icon { display: flex; align-items: center; }
.an-signal-card--positive .an-signal-icon { color: #16a34a; }
.an-signal-card--warning  .an-signal-icon { color: #d97706; }
.an-signal-card--critical .an-signal-icon { color: #dc2626; }
.an-signal-card--neutral  .an-signal-icon { color: #94a3b8; }

.an-signal-text { font-size: 13px; line-height: 1.5; color: #0f172a; margin: 0; flex: 1; }
.an-signal-cta  { font-size: 12px; font-weight: 600; color: inherit; text-decoration: none; }
.an-signal-cta:hover { text-decoration: underline; }

/* ── Section / Panel shared ── */
.an-section-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 500;
  color: #0f172a;
  margin: 0 0 24px;
}
.an-panel-title {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  font-weight: 500;
  color: #0f172a;
  margin: 0 0 4px;
}
.an-panel-subtitle { font-size: 13px; color: #64748b; margin: 0 0 20px; }

/* ── Funnel View ── */
.an-funnel {
  margin-top: 24px;
  background: #ffffff;
  border: 1px solid #EDE9E4;
  border-radius: 16px;
  padding: 24px;
}

.an-funnel-row {
  display: flex;
  align-items: center;
}

.an-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border-radius: 12px;
  position: relative;
  cursor: default;
  transition: background 0.15s;
}
.an-stage:hover { background: rgba(0,0,0,0.02); }

.an-stage-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #64748b;
  text-transform: uppercase;
}
.an-stage-count {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 500;
  color: #0f172a;
  line-height: 1;
}
.an-stage-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid;
  font-size: 11px;
  font-weight: 600;
}
.an-stage-badge-dot { width: 5px; height: 5px; border-radius: 50%; }

.an-stage-connector {
  width: 48px;
  height: 48px;
  overflow: visible;
  flex-shrink: 0;
}

.an-stage-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  background: #0f172a;
  color: #ffffff;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
  pointer-events: none;
  font-size: 12px;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.an-stage-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #0f172a;
}

/* ── Zone 3 (split panels) ── */
.an-zone3 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}
.an-panel {
  background: #ffffff;
  border: 1px solid #EDE9E4;
  border-radius: 16px;
  padding: 24px;
}

/* ── Velocity Table ── */
.an-velocity-table { display: flex; flex-direction: column; }
.an-velocity-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #F1F0EE;
}
.an-velocity-row:last-child { border-bottom: none; }
.an-velocity-label { font-size: 13px; color: #0f172a; }
.an-days-chip {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.an-days-chip--green { background: rgba(22,163,74,0.10);  color: #16a34a; }
.an-days-chip--amber { background: rgba(217,119,6,0.10);  color: #d97706; }
.an-days-chip--red   { background: rgba(220,38,38,0.10);  color: #dc2626; }
.an-velocity-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

/* ── Roster Growth Panel ── */
.an-roster-count {
  font-family: 'Playfair Display', serif;
  font-size: 40px;
  font-weight: 500;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 12px;
}
.an-roster-caption { font-size: 11px; color: #94a3b8; margin: 8px 0 20px; }

.an-composition { display: flex; flex-direction: column; gap: 16px; }
.an-comp-group  { display: flex; flex-direction: column; gap: 8px; }
.an-comp-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.an-comp-pills { display: flex; flex-wrap: wrap; gap: 6px; }

.an-comp-pill {
  position: relative;
  overflow: hidden;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid #EDE9E4;
  background: #ffffff;
}
.an-comp-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: rgba(201,165,90,0.15);
  pointer-events: none;
}
.an-comp-text {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 500;
  color: #0f172a;
  white-space: nowrap;
}
```

- [ ] **Step 1.2: Verify the file was created**

```bash
ls client/src/routes/agency/AnalyticsPage.css
```
Expected: file listed.

---

### Task 2: Write static data + scaffold AnalyticsPage.jsx

**Files:**
- Rewrite: `client/src/routes/agency/AnalyticsPage.jsx`

- [ ] **Step 2.1: Replace the entire file with imports, data, and a placeholder export**

```jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock, TrendingDown, UserCheck, Zap, TrendingUp, AlertCircle,
  ArrowDown, ArrowUp, Minus,
} from 'lucide-react';
import './AnalyticsPage.css';

/* ─── Icon map (avoids dynamic imports) ─── */
const ICON_MAP = { Clock, TrendingDown, UserCheck, Zap, TrendingUp, AlertCircle };

/* ─── Static data ─────────────────────────────────────────── */
const SIGNALS = {
  '30d': [
    { variant: 'critical', icon: 'Clock',       text: '4 applicants have been in Under Review for 14+ days.', cta: { label: 'View them', to: '/dashboard/agency/applicants' } },
    { variant: 'warning',  icon: 'TrendingDown', text: 'Invite → application rate dropped from 38% to 21% this month.', cta: null },
    { variant: 'positive', icon: 'UserCheck',   text: '2 new talent signed this month — roster at an all-time high of 24.', cta: null },
  ],
  '90d': [
    { variant: 'warning',  icon: 'TrendingDown', text: 'Under Review stage is averaging 18 days — up from 11 days last quarter.', cta: null },
    { variant: 'positive', icon: 'UserCheck',   text: '6 new signings over 90 days. Roster grew from 18 to 24.', cta: null },
    { variant: 'positive', icon: 'Zap',         text: 'Shortlisted → Signed conversion is 60% — your strongest stage.', cta: null },
  ],
  '6m': [
    { variant: 'warning',  icon: 'AlertCircle', text: 'Overall pipeline conversion is 6.3% (invites → signed). Industry benchmark is ~10%.', cta: null },
    { variant: 'positive', icon: 'TrendingUp',  text: 'Roster grew 33% over 6 months (18 → 24 talent).', cta: null },
    { variant: 'positive', icon: 'UserCheck',   text: 'Editorial talent now 42% of roster — up from 28% in September.', cta: null },
  ],
};

const FUNNEL_DATA = {
  '30d': [
    { id: 'invited',   label: 'Invites Sent',  count: 48  },
    { id: 'applied',   label: 'Applied',        count: 12  },
    { id: 'review',    label: 'Under Review',   count: 8   },
    { id: 'shortlist', label: 'Shortlisted',    count: 5   },
    { id: 'signed',    label: 'Signed',         count: 3   },
  ],
  '90d': [
    { id: 'invited',   label: 'Invites Sent',  count: 124 },
    { id: 'applied',   label: 'Applied',        count: 47  },
    { id: 'review',    label: 'Under Review',   count: 31  },
    { id: 'shortlist', label: 'Shortlisted',    count: 18  },
    { id: 'signed',    label: 'Signed',         count: 6   },
  ],
  '6m': [
    { id: 'invited',   label: 'Invites Sent',  count: 241 },
    { id: 'applied',   label: 'Applied',        count: 89  },
    { id: 'review',    label: 'Under Review',   count: 62  },
    { id: 'shortlist', label: 'Shortlisted',    count: 29  },
    { id: 'signed',    label: 'Signed',         count: 9   },
  ],
};

const VELOCITY_DATA = {
  '30d': [
    { transition: 'Applied → Under Review',     avgDays: 2,  trend: 'better' },
    { transition: 'Under Review → Shortlisted', avgDays: 18, trend: 'worse'  },
    { transition: 'Shortlisted → Signed',       avgDays: 4,  trend: 'same'   },
  ],
  '90d': [
    { transition: 'Applied → Under Review',     avgDays: 3,  trend: 'same'   },
    { transition: 'Under Review → Shortlisted', avgDays: 11, trend: 'better' },
    { transition: 'Shortlisted → Signed',       avgDays: 6,  trend: 'worse'  },
  ],
  '6m': [
    { transition: 'Applied → Under Review',     avgDays: 4,  trend: 'worse'  },
    { transition: 'Under Review → Shortlisted', avgDays: 13, trend: 'same'   },
    { transition: 'Shortlisted → Signed',       avgDays: 5,  trend: 'better' },
  ],
};

// ROSTER_DATA is keyed by range for consistency; all ranges share the same snapshot data.
// RosterGrowthPanel reads ROSTER_DATA[range] passed in from AnalyticsPage.
const _rosterSnapshot = {
  currentCount: 24,
  growth: [
    { month: 'Apr', count: 14 }, { month: 'May', count: 15 },
    { month: 'Jun', count: 15 }, { month: 'Jul', count: 16 },
    { month: 'Aug', count: 17 }, { month: 'Sep', count: 18 },
    { month: 'Oct', count: 19 }, { month: 'Nov', count: 20 },
    { month: 'Dec', count: 21 }, { month: 'Jan', count: 22 },
    { month: 'Feb', count: 23 }, { month: 'Mar', count: 24 },
  ],
  composition: {
    type:   [{ label: 'Editorial', pct: 42 }, { label: 'Commercial', pct: 29 }, { label: 'Runway', pct: 17 }, { label: 'Fitness', pct: 12 }],
    gender: [{ label: 'Female', pct: 71 }, { label: 'Male', pct: 21 }, { label: 'Non-binary', pct: 8 }],
  },
};
const ROSTER_DATA = { '30d': _rosterSnapshot, '90d': _rosterSnapshot, '6m': _rosterSnapshot };

/* ─── Helpers ─────────────────────────────────────────────── */
const VELOCITY_THRESHOLDS = {
  'Applied → Under Review':     { green: 3, amber: 7  },
  'Under Review → Shortlisted': { green: 7, amber: 14 },
  'Shortlisted → Signed':       { green: 5, amber: 10 },
};
function getDaysColor(transition, days) {
  const t = VELOCITY_THRESHOLDS[transition];
  if (!t) return 'neutral';
  if (days <= t.green) return 'green';
  if (days <= t.amber) return 'amber';
  return 'red';
}

/* ─── Placeholder ─────────────────────────────────────────── */
export default function AnalyticsPage() {
  return <div className="an-page"><p style={{ padding: 32 }}>Building…</p></div>;
}
```

- [ ] **Step 2.2: Start dev server and verify the page loads without errors**

```bash
# In project root
npm run dev:all
```

Navigate to `http://localhost:5173/dashboard/agency/analytics`. Expected: "Building…" text, no console errors.

- [ ] **Step 2.3: Commit scaffolding**

```bash
git add client/src/routes/agency/AnalyticsPage.jsx client/src/routes/agency/AnalyticsPage.css
git commit -m "feat(analytics): scaffold CSS and static data"
```

---

### Task 3: Build AnalyticsSubHeader

**Files:**
- Modify: `client/src/routes/agency/AnalyticsPage.jsx`

- [ ] **Step 3.1: Add AnalyticsSubHeader component above the placeholder export**

```jsx
/* ─── AnalyticsSubHeader ───────────────────────────────────── */
const RANGES = [
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '6m',  label: '6M'  },
];

function AnalyticsSubHeader({ range, onRangeChange }) {
  return (
    <div className="an-subheader">
      {RANGES.map((r) => (
        <button
          key={r.key}
          className={`an-range-pill ${range === r.key ? 'active' : ''}`}
          onClick={() => onRangeChange(r.key)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3.2: Wire into AnalyticsPage — replace the placeholder export**

```jsx
export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  return (
    <div className="an-page">
      <AnalyticsSubHeader range={range} onRangeChange={setRange} />
    </div>
  );
}
```

- [ ] **Step 3.3: Visual check**

Navigate to `/dashboard/agency/analytics`. Expected: sticky sub-header with 30D / 90D / 6M pills. Clicking 30D should highlight it dark; clicking 90D should switch highlight. Sub-header should stick at top when scrolling.

---

### Task 4: Build AISignalStrip

**Files:**
- Modify: `client/src/routes/agency/AnalyticsPage.jsx`

- [ ] **Step 4.1: Add SignalCard and AISignalStrip components**

Add below the `AnalyticsSubHeader` function:

```jsx
/* ─── AISignalStrip ────────────────────────────────────────── */
const NEUTRAL_SIGNAL = { variant: 'neutral', icon: null, text: 'No signal for this period.', cta: null };

function SignalCard({ signal, index }) {
  const Icon = ICON_MAP[signal.icon] ?? null;
  return (
    <motion.div
      className={`an-signal-card an-signal-card--${signal.variant}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <div className="an-signal-icon">
        {Icon && <Icon size={18} />}
      </div>
      <p className="an-signal-text">{signal.text}</p>
      {signal.cta && (
        <Link to={signal.cta.to} className="an-signal-cta">
          {signal.cta.label} →
        </Link>
      )}
    </motion.div>
  );
}

function AISignalStrip({ range }) {
  const raw = SIGNALS[range] ?? [];
  const items = [...raw];
  while (items.length < 3) items.push(NEUTRAL_SIGNAL);
  return (
    <div className="an-signals">
      {items.slice(0, 3).map((signal, i) => (
        <SignalCard key={i} signal={signal} index={i} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4.2: Add AISignalStrip to AnalyticsPage render**

```jsx
export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  return (
    <div className="an-page">
      <AnalyticsSubHeader range={range} onRangeChange={setRange} />
      <AISignalStrip range={range} />
    </div>
  );
}
```

- [ ] **Step 4.3: Visual check**

Expected: three colored signal cards below the sub-header. 30D should show one red card (4 applicants stalled), one amber (rate dropped), one green (roster high). Switching to 90D should re-render with amber + two green cards. Cards should fade + slide in on range change.

- [ ] **Step 4.4: Commit**

```bash
git add client/src/routes/agency/AnalyticsPage.jsx
git commit -m "feat(analytics): add AISignalStrip with Framer Motion"
```

---

## Chunk 2: FunnelView, PipelineVelocityTable, RosterGrowthPanel, final wiring

> **Depends on Chunk 1.** All static data constants (`FUNNEL_DATA`, `VELOCITY_DATA`, `ROSTER_DATA`, `SIGNALS`), helpers (`getDaysColor`, `VELOCITY_THRESHOLDS`), `ICON_MAP`, and the CSS file are defined there. All tasks in this chunk add components to the same `AnalyticsPage.jsx` file being built incrementally.

### Task 5: Build FunnelView

**Files:**
- Modify: `client/src/routes/agency/AnalyticsPage.jsx`

- [ ] **Step 5.1: Add ConversionBadge, StageBlock, FunnelConnector, and FunnelView**

Add below the `AISignalStrip` function:

```jsx
/* ─── FunnelView ───────────────────────────────────────────── */
function ConversionBadge({ count, prevCount }) {
  if (prevCount == null || prevCount === 0) return null;
  const pct = Math.round((count / prevCount) * 100);
  const color = pct >= 50 ? '#16a34a' : pct >= 25 ? '#d97706' : '#dc2626';
  return (
    <span
      className="an-stage-badge"
      style={{ color, borderColor: color + '33', background: color + '0f' }}
    >
      <span className="an-stage-badge-dot" style={{ background: color }} />
      {pct}%
    </span>
  );
}

function StageBlock({ stage, prevCount, index }) {
  const [hovered, setHovered] = useState(false);
  const pct = prevCount != null && prevCount > 0
    ? Math.round((stage.count / prevCount) * 100)
    : null;
  return (
    <motion.div
      className="an-stage"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 55, damping: 16, delay: index * 0.06 }}
    >
      <span className="an-stage-label">{stage.label}</span>
      <span className="an-stage-count">{stage.count}</span>
      <ConversionBadge count={stage.count} prevCount={prevCount} />
      {hovered && (
        <div className="an-stage-tooltip">
          <strong>{stage.label}</strong>
          <span>{stage.count} total</span>
          {pct !== null && <span>{pct}% conversion</span>}
        </div>
      )}
    </motion.div>
  );
}

function FunnelConnector({ receivingCount, maxCount, index }) {
  // strokeWidth maps receivingCount linearly to [2, 10]
  const strokeWidth = 2 + ((receivingCount / Math.max(maxCount, 1)) * 8);
  return (
    <svg
      className="an-stage-connector"
      viewBox="0 0 48 48"
    >
      <motion.path
        d="M 0 24 L 44 24"
        stroke="rgba(201,165,90,0.4)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.4 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
      />
      <polygon points="40,20 48,24 40,28" fill="rgba(201,165,90,0.4)" />
    </svg>
  );
}

function FunnelView({ range }) {
  const stages = FUNNEL_DATA[range] ?? [];
  const maxCount = Math.max(...stages.map((s) => s.count), 1);
  return (
    <div className="an-funnel">
      <h2 className="an-section-title">Pipeline Funnel</h2>
      <div className="an-funnel-row">
        {stages.map((stage, i) => (
          <React.Fragment key={stage.id}>
            <StageBlock
              stage={stage}
              prevCount={i > 0 ? stages[i - 1].count : null}
              index={i}
            />
            {i < stages.length - 1 && (
              <FunnelConnector
                receivingCount={stages[i + 1].count}
                maxCount={maxCount}
                index={i}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5.2: Add FunnelView to AnalyticsPage render**

```jsx
export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  return (
    <div className="an-page">
      <AnalyticsSubHeader range={range} onRangeChange={setRange} />
      <AISignalStrip range={range} />
      <FunnelView range={range} />
    </div>
  );
}
```

- [ ] **Step 5.3: Visual check**

Expected: Five stage blocks (Invites Sent → Applied → Under Review → Shortlisted → Signed) with counts and conversion badges. "Invites Sent" should have no badge. Gold arrows between stages; thicker arrows for higher-volume transitions. Hovering a stage shows a dark tooltip. Switching time ranges updates numbers. Stage blocks spring in from below, arrows draw in after.

- [ ] **Step 5.4: Commit**

```bash
git add client/src/routes/agency/AnalyticsPage.jsx
git commit -m "feat(analytics): add FunnelView with SVG connectors and tooltips"
```

---

### Task 6: Build PipelineVelocityTable

**Files:**
- Modify: `client/src/routes/agency/AnalyticsPage.jsx`

- [ ] **Step 6.1: Add VelocityRow and PipelineVelocityTable**

Add below the `FunnelView` function:

```jsx
/* ─── PipelineVelocityTable ────────────────────────────────── */
const TREND_CONFIG = {
  better: { Icon: ArrowDown, label: 'faster', color: '#16a34a' },
  worse:  { Icon: ArrowUp,   label: 'slower', color: '#dc2626' },
  same:   { Icon: Minus,     label: 'same',   color: '#64748b' },
};

function VelocityRow({ row, index }) {
  const color = getDaysColor(row.transition, row.avgDays);
  const { Icon, label, color: trendColor } = TREND_CONFIG[row.trend] ?? TREND_CONFIG.same;
  return (
    <motion.div
      className="an-velocity-row"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
    >
      <span className="an-velocity-label">{row.transition}</span>
      <span className={`an-days-chip an-days-chip--${color}`}>{row.avgDays}d</span>
      <span className="an-velocity-trend" style={{ color: trendColor }}>
        <Icon size={12} /> {label}
      </span>
    </motion.div>
  );
}

function PipelineVelocityTable({ range }) {
  const rows = VELOCITY_DATA[range] ?? [];
  return (
    <div className="an-panel">
      <h3 className="an-panel-title">Pipeline Velocity</h3>
      <p className="an-panel-subtitle">Avg days between stages</p>
      <div className="an-velocity-table">
        {rows.map((row, i) => (
          <VelocityRow key={row.transition} row={row} index={i} />
        ))}
      </div>
    </div>
  );
}
```

---

### Task 7: Build RosterGrowthPanel

**Files:**
- Modify: `client/src/routes/agency/AnalyticsPage.jsx`

- [ ] **Step 7.1: Add RosterGrowthPanel**

Add below the `PipelineVelocityTable` function:

```jsx
/* ─── RosterGrowthPanel ────────────────────────────────────── */
const CHART_W  = 600;
const CHART_H  = 90;
const LABEL_H  = 20;
const SVG_H    = CHART_H + LABEL_H;

function RosterGrowthPanel({ range }) {
  const { currentCount, growth, composition } = ROSTER_DATA[range] ?? ROSTER_DATA['30d'];
  const maxDomain = Math.max(...growth.map((d) => d.count)) * 1.2;

  const toX = (i) => (i / Math.max(growth.length - 1, 1)) * CHART_W; // guard: avoids ÷0 if length=1
  const toY = (count) => CHART_H - (count / maxDomain) * CHART_H;

  const lineD = growth
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.count)}`)
    .join(' ');

  const fillD =
    `${lineD} L ${toX(growth.length - 1)} ${CHART_H} L ${toX(0)} ${CHART_H} Z`;

  return (
    <div className="an-panel">
      <h3 className="an-panel-title">Roster Growth</h3>
      <div className="an-roster-count">{currentCount}</div>

      <svg
        viewBox={`0 0 ${CHART_W} ${SVG_H}`}
        style={{ width: '100%', height: 110, display: 'block' }}
        preserveAspectRatio="none"
      >
        {/* Gold fill under line */}
        <path d={fillD} fill="rgba(201,165,90,0.12)" />

        {/* Animated line */}
        <motion.path
          d={lineD}
          fill="none"
          stroke="#C9A55A"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        {/* Month labels */}
        {growth.map((d, i) => (
          <text
            key={d.month}
            x={toX(i)}
            y={SVG_H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="#94a3b8"
            fontFamily="Inter, sans-serif"
          >
            {d.month}
          </text>
        ))}
      </svg>

      <p className="an-roster-caption">
        Roster data reflects current snapshot — unaffected by time range.
      </p>

      <div className="an-composition">
        {[
          { groupLabel: 'By type',   items: composition.type,   baseDelay: 0 },
          { groupLabel: 'By gender', items: composition.gender, baseDelay: composition.type.length },
        ].map(({ groupLabel, items, baseDelay }) => (
          <div key={groupLabel} className="an-comp-group">
            <span className="an-comp-label">{groupLabel}</span>
            <div className="an-comp-pills">
              {items.map((item, i) => (
                <motion.div
                  key={item.label}
                  className="an-comp-pill"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (baseDelay + i) * 0.04, duration: 0.2 }}
                >
                  <div className="an-comp-fill" style={{ width: `${item.pct}%` }} />
                  <span className="an-comp-text">{item.label} {item.pct}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 8: Wire Zone 3 and finalize AnalyticsPage

**Files:**
- Modify: `client/src/routes/agency/AnalyticsPage.jsx`

- [ ] **Step 8.1: Replace the AnalyticsPage export with the final version**

```jsx
export default function AnalyticsPage() {
  const [range, setRange] = useState('30d');
  return (
    <div className="an-page">
      <AnalyticsSubHeader range={range} onRangeChange={setRange} />
      <AISignalStrip range={range} />
      <FunnelView range={range} />
      <div className="an-zone3">
        <PipelineVelocityTable range={range} />
        <RosterGrowthPanel range={range} />
      </div>
    </div>
  );
}
```

- [ ] **Step 8.2: Full visual verification checklist**

Navigate to `http://localhost:5173/dashboard/agency/analytics` and verify:

- [ ] Sub-header is sticky — scrolling the page leaves it pinned at the top
- [ ] `30D` pill is selected by default (dark background)
- [ ] Clicking `90D` or `6M` updates signal cards and funnel in place
- [ ] Signal cards: red, amber, green variants for 30D; amber + two green for 90D
- [ ] "View them →" link is present on the critical card (30D)
- [ ] Funnel: five stages, "Invites Sent" has no badge, all others show conversion %
- [ ] 30D funnel: Invites 48, Applied 12 (25% — red), Under Review 8 (67% — green), Shortlisted 5 (63% — green), Signed 3 (60% — green)
- [ ] SVG arrows draw in after stage blocks appear; thicker arrows for higher-volume transitions
- [ ] Hovering a stage block shows a dark tooltip (stage name, count, conversion %)
- [ ] Velocity table: 30D shows "Applied → Under Review" 2d (green), "Under Review → Shortlisted" 18d (red), "Shortlisted → Signed" 4d (green)
- [ ] Trend indicators: "↓ faster" in green, "↑ slower" in red, "→ same" in slate
- [ ] Roster Growth: "24" displayed prominently above the chart
- [ ] Gold area chart visible; line draws in on page load
- [ ] Month labels (Apr–Mar) visible below chart
- [ ] Caption "Roster data reflects current snapshot…" visible in light grey
- [ ] Composition pills: type group (Editorial 42%, Commercial 29%, Runway 17%, Fitness 12%) + gender group
- [ ] Each pill has a proportional gold fill bar behind the text
- [ ] Page background is warm cream (#FAF8F5)
- [ ] Page looks correct on the "Overview" aesthetic — white cards with subtle borders

- [ ] **Step 8.3: Commit final implementation**

```bash
git add client/src/routes/agency/AnalyticsPage.jsx
git commit -m "feat(analytics): complete Analytics page — funnel, velocity, roster growth"
```
