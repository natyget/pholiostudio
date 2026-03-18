# Canonical Talent Panel — Design Spec
**Date:** 2026-03-14
**Status:** Approved
**Scope:** Frontend only — static/mock data, no backend wiring

---

## Purpose

Replace four inconsistent talent-viewer implementations scattered across the agency dashboard (Overview, Discover, Applicants, Roster) with one canonical component system. The system has three layers:

1. **Shared atomic sub-components** — used in list layouts across all pages
2. **`<TalentPanel>`** — a canonical right-side detail drawer opened from any page
3. **Page-level wiring** — each page replaces its current panel/modal and inline pills/badges with the shared components

The goal is visual consistency: an agency director clicking a talent anywhere in the dashboard sees the same panel, the same action quality, and the same information hierarchy.

---

## Non-Goals

- Backend wiring for notes (design for persistence, implement as frontend state)
- Real AI insights (static mock data)
- New data fields not already present in existing pages
- Changes to page-level list layouts (rows, grids, masonry stay as-is)
- Responsive / mobile breakpoint handling (desktop-only scope)

---

## `TalentObject` Shape

All pages pass a talent object with the following shape. Fields marked `?` are optional; the panel must handle missing values gracefully (show `—` for measurements, skip sections with no data).

```js
{
  id:           string,
  name:         string,
  photoUrl:     string | null,
  type:         'editorial' | 'runway' | 'commercial' | 'fitness' | 'plus',
  status:       'available' | 'submitted' | 'underReview' | 'shortlisted' | 'booked' | 'inactive',
  location:     string | null,
  matchScore:   number,          // 0–100
  measurements: {
    height: number | null,       // cm
    bust:   number | null,       // cm
    waist:  number | null,       // cm
    hips:   number | null,       // cm
  },
  bio:          string | null,
  experience:   string | null,   // e.g. "Established", "New Face"
}
```

Each page constructs this object from its existing data shape before passing it to `<TalentPanel>`. No new API calls are required.

---

## Component Architecture

```
client/src/components/agency/
├── TalentPanel.jsx          ← new: canonical detail drawer
├── TalentPanel.css          ← new: panel styles
└── ui/
    ├── TalentTypePill.jsx   ← new: shared type pill
    ├── TalentStatusBadge.jsx ← new: shared status badge
    └── TalentMatchRing.jsx  ← new: unified match indicator

Edited pages:
  client/src/routes/agency/OverviewPage.jsx
  client/src/routes/agency/DiscoverPage.jsx
  client/src/routes/agency/ApplicantsPage.jsx
  client/src/routes/agency/RosterPage.jsx
```

---

## Shared Sub-components

### `TalentTypePill`

**File:** `client/src/components/agency/ui/TalentTypePill.jsx`

**Props:**
```js
{ type: 'editorial' | 'runway' | 'commercial' | 'fitness' | 'plus', dark?: boolean }
```

**Color map (light background — default):**

| Type | Text | Background |
|---|---|---|
| editorial | `#7C3AED` | `rgba(124,58,237,0.09)` |
| commercial | `#047857` | `rgba(4,120,87,0.09)` |
| runway | `#9A7030` | `rgba(201,165,90,0.12)` |
| fitness | `#1D4ED8` | `rgba(29,78,216,0.09)` |
| plus | `#B91C1C` | `rgba(185,28,28,0.08)` |

**Dark background override** (`dark` prop = true, used on Discover cards):
- Text: `rgba(255,255,255,0.85)`
- Background: `rgba(255,255,255,0.07)`

**Styles:** `font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; padding: 3px 8px; border-radius: 20px; display: inline-flex; align-items: center;`

**Label display:** Capitalize the `type` string — `editorial` → `Editorial`.

---

### `TalentStatusBadge`

**File:** `client/src/components/agency/ui/TalentStatusBadge.jsx`

**Props:**
```js
{ status: 'available' | 'submitted' | 'underReview' | 'shortlisted' | 'booked' | 'inactive' }
```

**Structure:** `<span class="ts-badge ts-badge--{status}"><span class="ts-dot" /> {label}</span>`

**Status map:**

| Status | Label | Dot color | Pulse |
|---|---|---|---|
| available | Available | `#16a34a` | yes |
| submitted | Submitted | `#64748b` | no |
| underReview | Under Review | `#C9A55A` | no |
| shortlisted | Shortlisted | `#0f172a` | no |
| booked | On Booking | `#10b981` | no |
| inactive | Inactive | `#94a3b8` | no |

**Styles:** `font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 5px; color: inherit;`
Dot: `width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;` — background matches dot color from table.

**Pulse animation (available only):** CSS `@keyframes ts-pulse` on the dot element:
```css
@keyframes ts-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(1.6); }
}
.ts-badge--available .ts-dot {
  animation: ts-pulse 1.8s ease-in-out infinite;
}
```

---

### `TalentMatchRing`

**File:** `client/src/components/agency/ui/TalentMatchRing.jsx`

**Props:**
```js
{ score: number, size?: 'sm' | 'md' }
```

Replaces both `ResonanceRing` (Discover) and `MatchScore` (Overview). One SVG radial progress ring with score in center.

**Sizes:**
| Size | Outer diameter | Stroke width | Font size |
|---|---|---|---|
| `sm` (default) | 32px | 2.5px | 9px |
| `md` | 44px | 3px | 11px |

**Ring geometry:**
- `radius = (outerDiameter / 2) - strokeWidth`
- `circumference = 2 * Math.PI * radius`
- Background track: `stroke: rgba(0,0,0,0.07)`
- Progress arc: `stroke-dasharray = circumference`, `stroke-dashoffset = circumference * (1 - score / 100)`

**Color by score:**
| Score | Stroke color | Shadow |
|---|---|---|
| ≥ 90 | `#C9A55A` | `filter: drop-shadow(0 0 3px rgba(201,165,90,0.5))` |
| 75–89 | `rgba(201,165,90,0.55)` | none |
| < 75 | `#94a3b8` | none |

**Center text:** Score integer (e.g. `85`), same color as arc, `font-weight: 600`, size from table above.

**Animation on mount:** Use Framer Motion `motion.circle` on the progress arc:
```jsx
<motion.circle
  initial={{ pathLength: 0 }}
  animate={{ pathLength: score / 100 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
  // strokeDasharray and strokeDashoffset computed from pathLength via Framer
/>
```
Use `pathLength` prop (Framer Motion handles the stroke-dasharray math internally). Do NOT manually compute stroke-dashoffset when using Framer's `pathLength`.

---

## `TalentPanel` Component

**File:** `client/src/components/agency/TalentPanel.jsx`

### Props

```js
{
  talent:   TalentObject | null,
  context:  'discover' | 'applicants' | 'roster' | 'overview',
  onClose:  () => void,
  onAction: (action: string, talent: TalentObject) => void,
}
```

`onAction` is called with an action string when any action button is clicked. Since no backend is wired, the default behaviour is a Sonner toast: `toast.success('Coming soon')`. Consumers can override with real handlers when ready.

When `talent` is `null`, return `null` — panel is not rendered.

### Context vs. Overview Clarification

The Overview page shows **recent applicants** (pending talent), not signed roster talent. Therefore `context="overview"` shows applicant-appropriate actions (Accept, Message) — a quick-decision set optimised for the compact dashboard widget. The full `context="applicants"` page adds Shortlist and Reject for more deliberate management. Both are correct; they differ in action depth, not page type.

---

### Layout

```
┌─────────────────────────────┐  ← 480px fixed, right-anchored
│  ZONE 1: Hero (220px)       │  ← non-scrolling (sticky top)
│  photo · name · type · loc  │
│  [×] close button           │
├─────────────────────────────┤
│  ZONE 2: Action Bar (56px)  │  ← sticky below hero
│  [Primary] [Secondary] [⊞] [✕?] │
├─────────────────────────────┤
│  ZONE 3: Scrollable body    │
│  ─ Measurements strip       │
│  ─ AI Signals               │
│  ─ Notes                    │
│  ─ Bio (collapsed)          │
└─────────────────────────────┘
```

**Overlay:** `position: fixed; inset: 0; z-index: 200`.
- Scrim div: `position: fixed; inset: 0; background: rgba(0,0,0,0.28); z-index: 200;` — clicking scrim calls `onClose`.
- Panel: `position: fixed; top: 0; right: 0; bottom: 0; width: 480px; background: #FFFFFF; z-index: 201; overflow: hidden; display: flex; flex-direction: column; box-shadow: -4px 0 24px rgba(0,0,0,0.08);`

**Z-index context:** AgencyLayout sidebar is `z-index: 50`; topbar `z-index: 60`. Panel at `201` safely overlays both.

**Animation:** Framer Motion `AnimatePresence` wraps the scrim + panel pair.
- Panel: `initial={{ x: 480 }}` → `animate={{ x: 0 }}` → `exit={{ x: 480 }}`, `transition={{ type: 'spring', stiffness: 320, damping: 32 }}`. This is intentionally stiffer than the project-standard `55/16` — a drawer snapping into place should feel crisp, not floaty.
- Scrim: `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}` → `exit={{ opacity: 0 }}`, `transition={{ duration: 0.2 }}` (Framer Motion tween, not CSS).

---

### Zone 1 — Hero

`height: 220px; position: relative; overflow: hidden; flex-shrink: 0;`

**Photo:** `<img src={talent.photoUrl} ... />` — `object-fit: cover; width: 100%; height: 100%;`

**Photo fallback** (null or broken `photoUrl`): Warm cream `#EDE9E4` background with centered talent initials in Playfair Display 28px, color `#9A7030`. Extract initials by splitting `name` on the first space: `name.split(' ')[0][0] + (name.split(' ')[1]?.[0] || name.split(' ')[0][1] || '')` — e.g. `"Sofia Reyes"` → `"SR"`, `"Madonna"` → `"MA"`.

**Bottom gradient overlay:** `position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%); pointer-events: none;`

**Close button:** `position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; background: rgba(0,0,0,0.35); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;` Lucide `X` icon, 16px, white. Hover: `background: rgba(0,0,0,0.5)`. Calls `onClose`.

**Identity block** (`position: absolute; bottom: 16px; left: 16px; right: 48px;`):
- Name: Playfair Display, 22px, white, `font-weight: 500`, `line-height: 1.2`, `margin-bottom: 6px`
- Row: `<TalentTypePill type={...} dark />` + `<TalentStatusBadge status={...} />` (white text — use `dark` prop on TypePill; StatusBadge inherits white from parent color context)
- Location: `<MapPin size={11} />` + city string, `font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 5px; display: flex; align-items: center; gap: 4px;`

---

### Zone 2 — Action Bar

`height: 56px; background: #FFFFFF; border-bottom: 1px solid #EDE9E4; padding: 0 16px; display: flex; align-items: center; gap: 8px; flex-shrink: 0;`

**Context → button configuration:**

| Context | Primary (gold filled) | Secondary (ghost) | Icon-only 1 | Icon-only 2 |
|---|---|---|---|---|
| `discover` | Invite (`UserPlus`) | — | Add to Board (`LayoutGrid`) | — |
| `applicants` | Accept (`Check`) | Shortlist (`Star`) | Add to Board (`LayoutGrid`) | Reject (`XCircle`, destructive) |
| `roster` | Download Comp Card (`Download`) | Message (`MessageCircle`) | Add to Board (`LayoutGrid`) | — |
| `overview` | Accept (`Check`) | Message (`MessageCircle`) | Add to Board (`LayoutGrid`) | — |

All buttons call `onAction(actionString, talent)`. Action strings: `'invite'`, `'accept'`, `'shortlist'`, `'reject'`, `'message'`, `'download-comp-card'`, `'add-to-board'`.

**Primary button styles:** `background: #C9A55A; color: #FFFFFF; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; padding: 0 14px; height: 36px; display: flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;` Hover: `background: #B8956A; transition: background 0.15s ease;`

**Secondary button styles:** `background: transparent; border: 1px solid #EDE9E4; color: #0f172a; border-radius: 8px; font-size: 13px; font-weight: 500; padding: 0 14px; height: 36px; display: flex; align-items: center; gap: 6px; cursor: pointer; white-space: nowrap;` Hover: `background: rgba(0,0,0,0.03);`

**Add to Board (icon-only):** `width: 36px; height: 36px; border-radius: 8px; border: 1px solid #EDE9E4; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer;` Lucide `LayoutGrid` icon, 16px, `#64748b`. Hover: `background: rgba(0,0,0,0.03);`

**Reject (icon-only, destructive):** Same icon-only style as Add to Board, but `border-color: rgba(220,38,38,0.2); color: #dc2626;`. Hover: `background: rgba(220,38,38,0.05);`. Placed last (rightmost). Lucide `XCircle` icon, 16px.

---

### Zone 3 — Scrollable Body

`flex: 1; overflow-y: auto; padding: 20px 16px 32px;`

Scrollbar: `scrollbar-width: thin; scrollbar-color: #EDE9E4 transparent;`

---

#### 3A — Measurements Strip

`display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 24px;`

Fields in order: Height, Bust, Waist, Hips.

Each chip: `background: #FAF8F5; border: 1px solid #EDE9E4; border-radius: 10px; padding: 10px 8px; text-align: center;`
- Label: `font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; display: block;`
- Value: `font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 500; color: #0f172a; margin-top: 2px; display: block;`
- Null fallback: show `—` as value.

---

#### 3B — AI Signals

`margin-bottom: 24px;`

**Section header pattern** (reused across 3B, 3C, 3D):
```
display: flex; align-items: center; gap: 6px; margin-bottom: 10px;
font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;
```

Header: `<Zap size={13} color="#C9A55A" />` + `"AI Signals"`

**Static mock signals:**
```js
const AI_SIGNALS = [
  { icon: 'Target',      text: 'Matches 3 open castings based on measurements and type.' },
  { icon: 'TrendingUp',  text: 'Applied to 4 agencies in the past 6 months — actively seeking.' },
  { icon: 'AlertCircle', text: 'Profile 78% complete — missing runway experience and second language.' },
]

const SIGNAL_ICON_MAP = { Target, TrendingUp, AlertCircle }
```

Do NOT use dynamic imports. Resolve via `SIGNAL_ICON_MAP[signal.icon]`.

Each signal row: `display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-bottom: 1px solid #F1F0EE;` Last row: no border.
- Icon: 14px, `color: #C9A55A; flex-shrink: 0; margin-top: 1px;`
- Text: `font-size: 12px; line-height: 1.5; color: #0f172a;`

---

#### 3C — Notes

`margin-bottom: 24px;`

Header: `<PenLine size={13} />` + `"Notes"` (same header style as 3B, icon color `#94a3b8`).

**State:**
```js
const [notes, setNotes] = useState([])       // [{ text: string, timestamp: Date }]
const [draft, setDraft] = useState('')
const [editing, setEditing] = useState(false)
```

State resets when the panel closes (`talent` becomes null) — no persistence across sessions.

**Empty + not editing:** Single row with text `"Add a note…"`. `font-size: 13px; color: #94a3b8; font-style: italic; cursor: pointer; padding: 8px 0;` Clicking sets `editing: true`.

**Editing mode:**
- `<textarea>` with `min-height: 80px; resize: none; width: 100%; border: 1px solid #EDE9E4; border-radius: 8px; padding: 10px 12px; font-size: 13px; font-family: Inter, sans-serif; outline: none;`. Focus: `border-color: #C9A55A; box-shadow: 0 0 0 3px rgba(201,165,90,0.1);`
- Below textarea: `margin-top: 8px; display: flex; gap: 8px;`
  - Save button: same primary button style as action bar but `font-size: 12px; height: 30px; padding: 0 12px`. Disabled + muted when `draft.trim() === ''`. On click: push `{ text: draft.trim(), timestamp: new Date() }` to notes, clear draft, set `editing: false`.
  - Cancel button: ghost text `font-size: 12px; color: #64748b; background: none; border: none; cursor: pointer; padding: 0 8px;`. On click: clear draft, set `editing: false`.

**Saved notes display** (rendered above the textarea/empty state):
Each entry: `border-left: 2px solid #EDE9E4; padding: 4px 0 4px 12px; margin-bottom: 10px;`
- Timestamp: `font-size: 11px; color: #94a3b8; margin-bottom: 2px;` Format: `"Mar 14, 2026 · 3:42 PM"` (use `new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })`).
- Text: `font-size: 13px; color: #0f172a; line-height: 1.5;`

When `notes.length > 0` and not editing: show `"+ Add another note"` text button below entries. `font-size: 12px; color: #C9A55A; background: none; border: none; cursor: pointer; padding: 4px 0;` On click: set `editing: true`.

---

#### 3D — Bio

`margin-bottom: 8px;`

Header: `"Bio"` only (no icon), same header style.

If `talent.bio` is null or empty: don't render this section.

**Collapse behaviour:** Always starts collapsed. Show first 100 characters + `"…"` when collapsed.

**Toggle button** (inline, after truncated text): `<button>` with `<ChevronDown size={12} />` / `<ChevronUp size={12} />`. `background: none; border: none; color: #C9A55A; cursor: pointer; padding: 0 0 0 4px; vertical-align: middle;`

**Expand animation:** Framer Motion on the hidden overflow section:
```jsx
<motion.div
  initial={{ height: 0, opacity: 0 }}
  animate={{ height: 'auto', opacity: 1 }}
  exit={{ height: 0, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 200, damping: 28 }}
  style={{ overflow: 'hidden' }}
>
  {/* full bio text */}
</motion.div>
```
Use `AnimatePresence` around this block.

Bio text: `font-size: 13px; line-height: 1.65; color: #64748b;`

---

## Replacing Existing Panel Implementations

### DiscoverPage
- Remove the existing right-side `TalentDetailPanel` JSX and its associated CSS
- Import and render `<TalentPanel context="discover" talent={selectedTalent} onClose={() => setSelectedTalent(null)} onAction={(action, t) => toast.success('Coming soon')} />`
- Replace `dc-card-type` pill JSX with `<TalentTypePill type={...} dark />`
- Replace `ResonanceRing` usages with `<TalentMatchRing score={...} size="md" />`

### RosterPage
- Remove the existing `TalentDetailPanel` component and its CSS
- Import and render `<TalentPanel context="roster" talent={selectedTalent} onClose={...} onAction={...} />`
- Replace inline type pill JSX in `RosterRow` and `RosterCard` with `<TalentTypePill type={...} />`
- Replace inline status badge JSX with `<TalentStatusBadge status={...} />`

### OverviewPage
- Remove the existing applicant modal/panel JSX (if present) or add panel as new
- Import and render `<TalentPanel context="overview" talent={selectedTalent} onClose={...} onAction={...} />`
- Replace `MatchScore` usages with `<TalentMatchRing score={...} size="sm" />`

### ApplicantsPage
- Import and render `<TalentPanel context="applicants" talent={selectedTalent} onClose={...} onAction={...} />`
- Replace any inline type/status rendering with `<TalentTypePill />` and `<TalentStatusBadge />`

---

## Aesthetic

Inherits from agency dashboard warm cream aesthetic:
- Page background: `#FAF8F5`
- Panel background: `#FFFFFF`
- Section borders: `1px solid #EDE9E4`
- Headings: Playfair Display
- Body/labels: Inter
- Gold accent: `#C9A55A`
- Primary text: `#0f172a`; secondary: `#64748b`; tertiary: `#94a3b8`

---

## Animation Summary

| Element | Type | Config |
|---|---|---|
| Panel enter/exit | Slide from right (Framer spring) | `stiffness: 320, damping: 32` |
| Scrim enter/exit | Fade (Framer tween) | `duration: 0.2` |
| Match ring arc | Framer `pathLength` tween | `duration: 0.6, ease: 'easeOut'` on mount |
| Status badge pulse | CSS `@keyframes` on dot | `1.8s ease-in-out infinite`, available only |
| Bio expand/collapse | Framer height spring | `stiffness: 200, damping: 28` |

---

## Files

| File | Operation |
|---|---|
| `client/src/components/agency/TalentPanel.jsx` | Create |
| `client/src/components/agency/TalentPanel.css` | Create |
| `client/src/components/agency/ui/TalentTypePill.jsx` | Create |
| `client/src/components/agency/ui/TalentStatusBadge.jsx` | Create |
| `client/src/components/agency/ui/TalentMatchRing.jsx` | Create |
| `client/src/routes/agency/DiscoverPage.jsx` | Edit |
| `client/src/routes/agency/RosterPage.jsx` | Edit |
| `client/src/routes/agency/OverviewPage.jsx` | Edit |
| `client/src/routes/agency/ApplicantsPage.jsx` | Edit |

No new dependencies. Uses Lucide React and Framer Motion (both existing). Sonner (existing) for action toasts.
