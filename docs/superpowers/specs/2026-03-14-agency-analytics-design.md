# Agency Analytics Page — Design Spec
**Date:** 2026-03-14
**Status:** Approved
**Scope:** Frontend only — static data, no backend wiring

---

## Purpose

The Analytics page is a **funnel health tool**, not a business health tool. Agencies do not process revenue or manage bookings on Pholio — that lives in back-office tools. The single job of this page:

> "Is my pipeline working?"

Three sub-questions:
1. Are talents invited from Discover actually applying?
2. How fast are applicants moving through the pipeline?
3. Is my roster growing, and does it reflect the talent I want?

---

## Non-Goals

- Revenue, commissions, booking calendar — out of scope
- Per-talent performance rankings
- Client or market breakdown
- Export or reporting features

---

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│  SUB-HEADER: Time range selector (30D / 90D / 6M)   │
├─────────────────────────────────────────────────────┤
│  ZONE 1: AI Signal Strip (3 cards, horizontal)       │
├─────────────────────────────────────────────────────┤
│  ZONE 2: Funnel View (full width)                    │
│  Invites → Applied → Under Review → Shortlisted →   │
│  Signed, with volume + conversion % per stage        │
├──────────────────────────┬──────────────────────────┤
│  ZONE 3A: Pipeline       │  ZONE 3B: Roster          │
│  Velocity Table          │  Growth Chart             │
│  (avg days per stage)    │  + Composition Breakdown  │
└──────────────────────────┴──────────────────────────┘
```

---

## Components

### `AnalyticsSubHeader`
- Sticky sub-header rendered inside `AnalyticsPage`, below the AgencyLayout topbar
- `position: sticky; top: 0; z-index: 40` (AgencyLayout topbar is `z-index: 60`)
- Time range pill selector: **30D / 90D / 6M**
- **Default selected range on mount: `'30d'`**
- Selected range stored in local `useState` in `AnalyticsPage`; passed as prop to all child components
- Warm cream background (`#FAF8F5`), subtle bottom border (`1px solid #EDE9E4`), 48px height

---

### `AISignalStrip`
Three horizontally-arranged signal cards in a `display: flex; gap: 16px` row.

**Card structure:**
- Icon (Lucide, 18px)
- One sentence of insight text
- Optional CTA: a React Router `<Link>` to a path specified per signal in the `SIGNALS` array

**Signal variants and colors:**
| Variant | Background | Border | Icon color | Example |
|---------|------------|--------|------------|---------|
| `positive` | `rgba(22,163,74,0.06)` | `rgba(22,163,74,0.18)` | `#16a34a` | Roster at all-time high |
| `warning` | `rgba(217,119,6,0.06)` | `rgba(217,119,6,0.18)` | `#d97706` | Conversion rate dropped |
| `critical` | `rgba(220,38,38,0.06)` | `rgba(220,38,38,0.18)` | `#dc2626` | Applicants stalled |

**Icon resolution:** Use a static map — do NOT use dynamic imports from lucide-react. Declare a `const ICON_MAP = { Clock, TrendingDown, UserCheck, Zap, TrendingUp, AlertCircle }` at the top of the file and resolve icon strings via `ICON_MAP[signal.icon]`.

**State key casing:** The `useState` value is always lowercase: `'30d'`, `'90d'`, `'6m'`. Pill labels (`30D`, `90D`, `6M`) are display-only strings separate from the key.

**Static SIGNALS array:**
```js
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
}
```

**Empty/fewer-than-3 state:** The strip always renders exactly 3 cards. If an API response returns fewer, remaining slots show a neutral placeholder card (`variant: 'neutral'`, text: "No signal for this period."). Maximum is 3 — extra signals are silently dropped.

**Animations:** Cards fade in with staggered delay: `delay: index * 0.08s`, `duration: 0.3s`, `y: 8 → 0`.

---

### `FunnelView`
Full-width horizontal funnel. Five stages in a flex row with SVG connectors between them.

**Stage block contents:**
- Stage label: uppercase, 10px, `#64748b`, letter-spacing 0.08em
- Volume count: 32px Playfair Display, `#0f172a`
- Conversion badge (all stages except first):
  - Formula: **`Math.round((ownCount / previousCount) * 100)`** — stage-to-stage, not cumulative
  - Color: green `#16a34a` if ≥ 50%, amber `#d97706` if 25–49%, red `#dc2626` if < 25%
  - Shown as `"25%"` with a colored dot prefix

**Funnel layout:**
- Container: `display: flex; align-items: center`
- Stage blocks: `flex: 1` (equal width, no fixed px)
- Connectors: each is a fixed `width: 48px` SVG element rendered between stage blocks; `height: 48px; overflow: visible`

**SVG connecting arrows:**
- Each connector is a `<svg width="48" height="48">` with a horizontal `<line>` from `(0, 24)` to `(44, 24)` (leaving 4px for arrowhead)
- Arrowhead: a separate `<polygon points="40,20 48,24 40,28" />` (filled triangle, right-pointing)
- `stageCount` in the formula = the count value of the **right-side stage** (the one receiving volume)
- Stroke width: `strokeWidth = 2 + ((stageCount / maxCount) * 8)`, range 2–10px, where `maxCount = Math.max(...stages.map(s => s.count))`
- Color: `#C9A55A` at 40% opacity (`rgba(201,165,90,0.4)`)
- Funnel container must NOT have `overflow: hidden` — tooltips must be able to overflow

**Hover tooltip on stage blocks:**
- Each stage block: `position: relative`; tooltip child: `position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); z-index: 20`
- Implemented as a CSS-positioned `<div>` with `opacity` + `translateY` transition; no external tooltip library; no edge-clamping
- Content: stage name, raw count, conversion % (if applicable)
- **No delta vs previous period** — static data has no prior-period structure

**Static data shape:**
```js
const FUNNEL_DATA = {
  '30d': [
    { id: 'invited',   label: 'Invites Sent',  count: 48 },
    { id: 'applied',   label: 'Applied',        count: 12 },
    { id: 'review',    label: 'Under Review',   count: 8  },
    { id: 'shortlist', label: 'Shortlisted',    count: 5  },
    { id: 'signed',    label: 'Signed',         count: 3  },
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
}
```

**Animations:** Stage blocks slide up + fade in, staggered left-to-right (`delay: index * 0.06s`). SVG arrows draw in (stroke-dashoffset animation) after stage blocks complete.

---

### `PipelineVelocityTable`
Left panel in Zone 3. One row per transition between pipeline stages (3 rows total).

**Columns:**
1. Stage transition label (e.g., "Applied → Under Review")
2. Avg days chip — colored background based on threshold
3. Trend indicator — `↓ faster` (green) / `→ same` (slate) / `↑ slower` (red)

**Color thresholds:**
| Transition | Green (healthy) | Amber (slow) | Red (critical) |
|------------|----------------|--------------|----------------|
| Applied → Under Review | ≤ 3 days | 4–7 days | > 7 days |
| Under Review → Shortlisted | ≤ 7 days | 8–14 days | > 14 days |
| Shortlisted → Signed | ≤ 5 days | 6–10 days | > 10 days |

**Static data shape:**
```js
const VELOCITY_DATA = {
  '30d': [
    { transition: 'Applied → Under Review',      avgDays: 2,  trend: 'better' },
    { transition: 'Under Review → Shortlisted',  avgDays: 18, trend: 'worse'  },
    { transition: 'Shortlisted → Signed',        avgDays: 4,  trend: 'same'   },
  ],
  '90d': [
    { transition: 'Applied → Under Review',      avgDays: 3,  trend: 'same'   },
    { transition: 'Under Review → Shortlisted',  avgDays: 11, trend: 'better' },
    { transition: 'Shortlisted → Signed',        avgDays: 6,  trend: 'worse'  },
  ],
  '6m': [
    { transition: 'Applied → Under Review',      avgDays: 4,  trend: 'worse'  },
    { transition: 'Under Review → Shortlisted',  avgDays: 13, trend: 'same'   },
    { transition: 'Shortlisted → Signed',        avgDays: 5,  trend: 'better' },
  ],
}
```

---

### `RosterGrowthPanel`
Right panel in Zone 3. Two sub-sections stacked vertically.

**Sub-section A — Growth Sparkline:**
- SVG line chart, 100% width × 120px height
- X-axis: last 12 calendar months, 3-letter abbreviations, evenly spaced
- **Y-axis domain: always starts at 0**, top of domain = `max(counts) * 1.2` (20% headroom)
- Gold line (`#C9A55A`, stroke 2px) with gold fill under the line (`rgba(201,165,90,0.12)`)
- **Interpolation: linear** — straight segments between data points (no curve smoothing)
- **Null/missing data points:** the static `ROSTER_DATA.growth` array contains no nulls; null-handling rule is a no-op for static data and can be implemented if wired to a real API later
- **Fill path construction (contiguous data):** after drawing the line with `M x0 y0 L x1 y1 ... L xN yN`, close the fill by appending `L xN yBaseline L x0 yBaseline Z` where `yBaseline` is the SVG y-coordinate for value 0
- No gridlines, no Y-axis labels — intentionally minimal
- Current roster count displayed as a large number above the chart (32px Playfair Display)
- **Caption below chart:** `"Roster data reflects current snapshot — unaffected by time range."` in 11px `#94a3b8`
- Animation: SVG path draws in via stroke-dashoffset over 0.8s on mount

**Sub-section B — Composition Breakdown:**
Two rows of pills, labeled "By type" and "By gender":

- Each pill: `"Label XX%"` text + a proportional fill bar behind the text
  - Pill container: `position: relative; overflow: hidden`
  - Fill bar: `position: absolute; left: 0; top: 0; bottom: 0; width: pct%; background: rgba(201,165,90,0.15)` — sits behind the text label
  - Text: `position: relative; z-index: 1`
  - E.g., "Editorial 42%" with a 42%-wide gold tint fill behind the text

**Static data shape:**
```js
const ROSTER_DATA = {
  '30d': {
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
  },
  // '90d' and '6m' use same growth/composition (roster snapshot doesn't change by time range)
}
```

---

## Aesthetic

Inherits from the Overview page warm cream aesthetic:
- Page background: `#FAF8F5`
- Cards/panels: `#FFFFFF`, `border: 1px solid #EDE9E4`, `border-radius: 16px`
- Headings: Playfair Display
- Body/labels: Inter
- Gold accent: `#C9A55A`
- Primary text: `#0f172a`; secondary text: `#64748b`
- Page padding: 40px horizontal, 32px vertical (top), 24px between zones

---

## Animation Summary

| Element | Type | Config |
|---------|------|--------|
| Signal cards | Fade + slide up | stagger 0.08s, duration 0.3s |
| Funnel stage blocks | Fade + slide up | stagger 0.06s, `transition: { type: 'spring', stiffness: 55, damping: 16 }` (no duration) |
| Funnel SVG arrows | stroke-dashoffset draw | after stage blocks, duration 0.5s |
| Velocity table rows | Fade + slide up | stagger 0.05s |
| Sparkline path | stroke-dashoffset draw | duration 0.8s ease-in-out |
| Composition pills | Scale + fade | stagger 0.04s |

All via Framer Motion. No CSS-only animations.

---

## Files

| File | Operation | Notes |
|------|-----------|-------|
| `client/src/routes/agency/AnalyticsPage.jsx` | Rewrite | Currently a stub placeholder |
| `client/src/routes/agency/AnalyticsPage.css` | Create | — |

No new dependencies. Uses Lucide React (existing) and Framer Motion (existing). All SVG is hand-crafted inline — no chart library required.
