# CastingPanel Design Spec
**Date:** 2026-03-15
**Status:** Approved

---

## Overview

Replace the ad-hoc candidate drawer in `CastingPage.jsx` with a purpose-built `CastingPanel` component that is visually consistent with the canonical `TalentPanel` used across Discover, Overview, and Roster — but optimised for casting decision-making: stage progression, photo portfolio review, and role-scoped notes.

---

## Context & Motivation

The existing `CastingPage.jsx` has a bespoke 520px drawer (lines 659–742) that diverges from the canonical `TalentPanel` pattern in visual style, animation, and content structure. It uses a tabbed layout (Comp Card / Portfolio / Studio+) and a tween animation, whereas `TalentPanel` uses scrollable sections and spring physics. The goal is to close that gap while giving casting agents a panel purpose-built for their workflow.

The canonical `TalentPanel` (used in Discover, Overview, Roster) provides the visual template:
- 480px wide, fixed right edge
- Spring animation (stiffness 320, damping 32)
- Scrim backdrop (slate-900/40, blur 4px)
- 3-zone layout: Hero → Action Bar → Scrollable Body
- Playfair Display + Inter typography, gold token `#C9A55A`

---

## Component

**File:** `client/src/components/agency/CastingPanel.jsx`
**CSS:** `client/src/components/agency/CastingPanel.css`
**Replaces:** inline drawer in `CastingPage.jsx` (lines 659–742)

### Props

```js
{
  candidate,  // {
              //   id, name, avatar, score, stage, archetype,
              //   height, measurements, location,
              //   portfolio: [{ id, url }]  // empty array shows placeholder
              // }
  casting,    // { id, role, client } — provides context for the notes header
  onClose,    // () => void
  onAction,   // (action, candidate, payload?) => void
              //   action: 'pass' | 'advance' | 'stage-change' | 'message'
              //   payload: new stage string for 'stage-change'
}
```

### Usage in CastingPage

```jsx
<AnimatePresence>
  {drawerCandidate && (
    <CastingPanel
      key={drawerCandidate.id}
      candidate={drawerCandidate}
      casting={activeCasting}
      onClose={() => setDrawerCandidate(null)}
      onAction={handleCandidateAction}
    />
  )}
</AnimatePresence>
```

---

## Zone 1 — Hero (220px)

Full-bleed candidate photo with gradient overlay and casting-specific identity elements.

| Element | Spec |
|---------|------|
| Photo | `w-full h-[220px] object-cover` |
| Gradient | `bg-gradient-to-t from-slate-900/80 to-transparent`, absolute inset |
| Close button | `absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/40 backdrop-blur-sm border border-white/10 text-white` — identical to TalentPanel |
| Name | `font-display text-3xl font-normal text-white tracking-tight` — bottom-left |
| Archetype pill | `text-[0.6rem] font-black uppercase tracking-[0.2em] text-gold-500 bg-white/10 px-2 py-0.5 rounded-full` — below name |
| Match score badge | `✦ {score}% Match` — bottom-right, `text-sm font-semibold text-gold-500 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full` |
| Stage badge | Current stage label (e.g. `APPLIED`) — inline with archetype pill, `bg-white/10 text-white/60 text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded-full`. Intentionally redundant with the action bar's stage-aware button — the hero badge enables instant visual scanning without reading the action bar. |

---

## Zone 2 — Action Bar (56px)

Three buttons that answer: *"what do I do next with this candidate?"*

**Layout:** `flex gap-3 px-6 py-4 bg-white border-b border-slate-100 flex-shrink-0`

| Button | Style | Action |
|--------|-------|--------|
| **Pass** | `flex-shrink-0 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:border-gold-500 hover:text-gold-500 transition-all` | `onAction('pass', candidate)` |
| **Message** | Icon-only (`Mail` 16px), same outlined style as Pass | `onAction('message', candidate)` |
| **→ [Next Stage]** | `flex-1 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:-translate-y-0.5 hover:bg-slate-700 transition-all` | `onAction('advance', candidate)` |

### Stage-aware primary button label

```
stage === 'Applied'     → "Shortlist →"
stage === 'Shortlisted' → "Invite to Interview →"
stage === 'Interview'   → "Make Offer →"
stage === 'Offered'     → "Book →"
stage === 'Booked'      → "✓ Booked"  (disabled, bg-gold-500)
stage === 'Passed'      → "Restore to Applied"  (outlined only, no solid bg)
```

---

## Zone 3 — Body (Scrollable)

Five sections in decision-flow order: quick facts → visual review → notes → signals.

### Section 1 — Stage Selector

Horizontal row of all 5 pipeline stage pills (`Applied → Shortlisted → Interview → Offered → Booked`).

| State | Style |
|-------|-------|
| Current | `bg-gold-500 text-white` |
| Past | `bg-slate-100 text-slate-400` |
| Future | `border border-slate-200 text-slate-300` |

Clicking any pill calls `onAction('stage-change', candidate, newStage)`. Provides direct stage control without leaving the panel.

### Section 2 — Measurements

Identical to `TalentPanel`: 4-column grid.

| Label | Field |
|-------|-------|
| Height | `candidate.height` |
| Measurements | `candidate.measurements` |
| Archetype | `candidate.archetype` |
| Location | `candidate.location` |

Falls back to `—` for missing values. Labels: `text-[0.5625rem] uppercase tracking-widest text-slate-400`. Values: `text-[0.9375rem] font-medium text-slate-800 capitalize`.

### Section 3 — Photo Portfolio

The casting-centrepiece. 2-column grid of candidate photos.

- **Grid:** `grid grid-cols-2 gap-2`
- **Each photo:** `aspect-[2/3] w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity`
- **Source:** `candidate.portfolio[]` — array of image URLs
- **Empty state:** Full-width dashed placeholder — `border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-300` — consistent with TalentPanel empty states
- **Lightbox:** Clicking a photo opens a `position: fixed inset-0 bg-black/90 z-[200] flex items-center justify-center` overlay with the image centred (`max-h-[90vh] max-w-[90vw] object-contain`). Click anywhere on overlay to dismiss.

### Section 4 — Casting Notes

Visually mirrors TalentPanel's notes section, scoped to the current casting role.

- **Header:** `"Notes for {casting.role}"` — italic Playfair Display, `text-base font-medium text-slate-800`
- **Textarea:** Same style as TalentPanel — `bg-[#faf9f7] border border-transparent rounded-lg text-sm resize-none focus:border-gold-500 focus:shadow-[0_0_0_4px_rgba(201,165,90,0.1)] transition-all`
- **State:** Local `useState` for now (no backend persistence yet — consistent with TalentPanel's current implementation). Notes reset when the panel is closed and reopened for a different candidate (component is keyed by `candidate.id`, so state is destroyed on unmount). This is intentional for the current scope.

### Section 5 — AI Signals

Identical to TalentPanel's AI Signals section — 3 hardcoded signal rows with label + strength bar. Consistent visual language across all panels.

---

## Animation & Overlay

Identical to `TalentPanel`:

```js
// Scrim
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}

// Panel
initial={{ x: '100%' }}
animate={{ x: 0 }}
exit={{ x: '100%' }}
transition={{ type: 'spring', stiffness: 320, damping: 32 }}
```

Scrim click calls `onClose()`.

---

## CastingPage Integration

`CastingPage.jsx` changes:
1. Remove inline drawer (lines 659–742) — replaced by `CastingPanel`
2. Add `import CastingPanel from '../../components/agency/CastingPanel'`
3. Add `handleCandidateAction` handler:
   - `'pass'` → `setCandidates` to update stage to `'Passed'` + toast
   - `'advance'` → `setCandidates` to update stage to next in pipeline + toast
   - `'stage-change'` → `setCandidates` to update to specified stage + toast
   - `'message'` → `toast.success('Coming soon')` (no backend yet)
4. Render `<CastingPanel>` inside `<AnimatePresence>` at the bottom of the return

---

## Files Affected

| File | Change |
|------|--------|
| `client/src/components/agency/CastingPanel.jsx` | **New** |
| `client/src/components/agency/CastingPanel.css` | **New** |
| `client/src/routes/agency/CastingPage.jsx` | Remove lines 659–742 (old drawer), add CastingPanel import + render |

---

## Out of Scope

- Backend persistence for casting notes
- Real portfolio data (uses `candidate.portfolio[]` — mock data for now)
- Stage change API calls (local state only, consistent with other panels)
- Studio+ tab (removed — not relevant to the decision-making focus of this panel)
