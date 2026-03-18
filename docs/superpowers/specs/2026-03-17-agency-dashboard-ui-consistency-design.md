# Agency Dashboard UI Consistency Sprint — Design Spec

**Date:** 2026-03-17
**Scope:** Agency dashboard frontend only (`client/src/routes/agency/`, `client/src/components/agency/`, `client/src/styles/`)
**Approach:** Token-First — fix the design token system once, then sweep all pages

---

## Problem Statement

The agency dashboard has two competing design token systems (`agency-tokens.css` and `variables.css`) that have diverged over time, resulting in:

- Two different gold values in use (`#B8956A` vs `#C9A55A`)
- Two different dark text colors (`#1A1815` vs `#0f172a`)
- Two different secondary text colors (`#6B6560` vs `#64748b`)
- Button border radius ranging from 6px to 12px with no standard
- Page-level padding inconsistencies (24px, 32px, 40px used interchangeably)
- Modal/panel shadows that bypass the token system entirely
- Transition durations scattered between 150ms, 200ms, 250ms, 300ms, 350ms
- Hardcoded color values in both CSS files and JSX inline styles

---

## Scope & Constraints

- **DiscoverPage background stays dark** — `#010100` warm black cosmic theme is an intentional design exception. Only its gold values and typography tokens are updated.
- **OverviewPage 3.5rem hero title stays** — deliberate hero treatment for the overview page only.
- **No visual redesign** — this is a consistency pass, not a redesign. Layout, component structure, and visual identity are preserved.
- **`variables.css` is not deleted** — it serves the talent dashboard and landing page. Only the agency-specific values listed in Section 5 are removed from it.

---

## Section 1: Token System Changes

All changes are made to `client/src/styles/agency-tokens.css`. This section explicitly marks each change as: **UPDATE** (existing token changed), **RENAME** (existing token given new name), **ADD** (net-new token), or **REMOVE** (token deleted).

### Color Tokens

| Action | Token | Value | Notes |
|---|---|---|---|
| **UPDATE** | `--ag-gold` | `#C9A55A` | Was `#B8956A` — this is a deliberate change |
| **UPDATE** | `--ag-gold-hover` | `#B8956A` | Was `#A6845C` — old primary becomes hover |
| **KEEP** | `--ag-gold-dim` | (unchanged) | Existing token, no change |
| **KEEP** | `--ag-gold-ghost` | (unchanged) | Existing token, no change |
| **ADD** | `--ag-gold-muted` | `rgba(201,165,90,0.12)` | Subtle gold tint, net-new |
| **KEEP** | `--ag-text-0` | `#1A1815` | Already correct |
| **KEEP** | `--ag-text-1` | `#3D3A36` | Already correct |
| **KEEP** | `--ag-text-2` | `#6B6560` | Already correct |
| **KEEP** | `--ag-text-3` | (unchanged) | Existing token, no change |
| **KEEP** | `--ag-text-4` | (unchanged) | Existing token, no change |
| **KEEP** | `--ag-surface-0` | `#FAF8F5` | Already correct |
| **KEEP** | `--ag-surface-1` | `#FFFFFF` | Already correct |
| **UPDATE** | `--ag-surface-2` | `#F5F2EE` | Was `#FFFFFF` — hover surface |
| **KEEP** | `--ag-surface-3` | (unchanged) | Existing token, no change |
| **KEEP** | `--ag-surface-4` | (unchanged) | Existing token, no change |
| **KEEP** | `--ag-border` | `rgba(26,24,21,0.08)` | Already correct |
| **RENAME** | `--ag-border-hover` → `--ag-border-strong` | `rgba(26,24,21,0.14)` | Rename only, value unchanged |
| **ADD** | `--ag-border-gold` | `rgba(201,165,90,0.25)` | Net-new — gold accent border |
| **ADD** | `--ag-border-error` | `rgba(220,38,38,0.5)` | Net-new — error state |
| **ADD** | `--ag-border-warning` | `rgba(234,179,8,0.5)` | Net-new — warning state |
| **ADD** | `--ag-border-success` | `rgba(34,197,94,0.5)` | Net-new — success state |

**Legacy `--agency-*` alias block (lines 74–119):** Keep the alias block intact. After `--ag-gold` is updated to `#C9A55A`, all `--agency-*` aliases that cascade through `var(--ag-gold)` will automatically inherit the new value — this is the intended behavior. Before implementing, run a grep for `var(--agency-gold)` and `var(--agency-border-hover)` across all agency page CSS and JSX files to confirm no dark-theme pages (DiscoverPage, AnalyticsPage) will be visually broken by the gold cascade. If conflicts are found, scope those aliases out of the cascade for dark pages.

### Typography Tokens

| Action | Token | Value |
|---|---|---|
| **RENAME** | `--ag-font-serif` → `--ag-font-display` | `'Playfair Display', Georgia, serif` |
| **RENAME** | `--ag-font-sans` → `--ag-font-body` | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` |
| **KEEP** | `--ag-font-mono` | `'SF Mono', 'Fira Code', 'Consolas', monospace` |
| **ADD** | `--ag-text-hero` | `3.5rem` — OverviewPage H1 only, net-new |
| **ADD** | `--ag-text-h1` | `2.5rem` — all other page headings, net-new |
| **ADD** | `--ag-text-section` | `1.125rem` — section headings, net-new |
| **ADD** | `--ag-text-card` | `1rem` — card titles, net-new |
| **ADD** | `--ag-text-body` | `0.875rem` — body text, net-new |
| **ADD** | `--ag-text-label` | `0.6875rem` — labels, uppercase, net-new |
| **ADD** | `--ag-text-mono` | `0.8125rem` — data/mono text, net-new |

**Note on renames:** After renaming `--ag-font-serif` → `--ag-font-display` and `--ag-font-sans` → `--ag-font-body`, grep all agency CSS and JSX files for the old names and update every reference as part of the sweep.

### Spacing Tokens (all net-new ADD)

| Token | Value | Usage |
|---|---|---|
| `--ag-page-x` | `40px` | Page horizontal padding |
| `--ag-page-y` | `48px` | Page bottom padding |
| `--ag-card-pad` | `24px` | Standard card inner padding |
| `--ag-card-pad-lg` | `32px` | Large / hero card inner padding |
| `--ag-gap` | `24px` | Section and grid gap |
| `--ag-gap-sm` | `16px` | Tight gap between small elements |

### Border Radius Tokens

| Action | Token | Value | Usage |
|---|---|---|---|
| **KEEP** | `--ag-radius-sm` | `4px` | Tags, badges |
| **KEEP** | `--ag-radius-md` | `8px` | Cards, inputs, **all buttons** |
| **KEEP** | `--ag-radius-lg` | `12px` | Large cards |
| **ADD** | `--ag-radius-xl` | `20px` | Modals, side panels, net-new |
| **ADD** | `--ag-radius-full` | `100px` | Pills, chips, net-new |

**Button rule:** All buttons across all agency pages use `border-radius: var(--ag-radius-md)`. No exceptions.

### Shadow Tokens

| Action | Token | Value |
|---|---|---|
| **KEEP** | `--ag-shadow-sm` | `0 1px 3px rgba(26,24,21,0.06)` |
| **KEEP** | `--ag-shadow-md` | `0 4px 20px rgba(26,24,21,0.08)` |
| **KEEP** | `--ag-shadow-lg` | `0 12px 40px rgba(26,24,21,0.12)` |
| **UPDATE** | `--ag-shadow-gold` | `0 0 20px rgba(201,165,90,0.15)` | Was `rgba(184,149,106,0.12)` — updated to new gold |

**Modal rule:** All modals use `var(--ag-shadow-lg)`. No custom `box-shadow` values in page-level CSS for modals.

### Motion Tokens

| Action | Token | Old Value | New Value | Rationale |
|---|---|---|---|---|
| **KEEP** | `--ag-duration-fast` | `150ms` | `150ms` | No change |
| **UPDATE** | `--ag-duration` | `250ms` | `200ms` | Aligning to actual most-used value across pages |
| **UPDATE** | `--ag-duration-slow` | `500ms` | `400ms` | Tightening for snappier feel |
| **RENAME** | `--ag-ease` → `--ag-ease-spring` | `cubic-bezier(0.16, 1, 0.3, 1)` | (value unchanged) | Current `--ag-ease` is actually a spring curve; rename to be accurate |
| **ADD** | `--ag-ease` | `cubic-bezier(0.4, 0, 0.2, 1)` | Net-new — standard Material easing for default transitions |

**Breaking change note:** `--ag-ease` is being reassigned from a spring curve to a standard ease. After renaming the old `--ag-ease` to `--ag-ease-spring`, grep all agency CSS and JSX for `var(--ag-ease)` and verify each usage is appropriate for standard easing. Spring-feel transitions should be updated to `var(--ag-ease-spring)`.

### Z-Index Tokens (all net-new ADD)

| Token | Value |
|---|---|
| `--ag-z-base` | `1` |
| `--ag-z-dropdown` | `20` |
| `--ag-z-panel` | `40` |
| `--ag-z-modal` | `100` |
| `--ag-z-toast` | `200` |

---

## Section 2: Typography Scale

Applied uniformly to all agency pages. DiscoverPage is exempt from heading size tokens (dark theme exception) but uses the same font family tokens.

| Role | Size Token | Weight | Font Token |
|---|---|---|---|
| Hero H1 (OverviewPage only) | `--ag-text-hero` | 300 | `--ag-font-display` italic |
| Page H1 (all other pages) | `--ag-text-h1` | 300 | `--ag-font-display` |
| Section heading | `--ag-text-section` | 600 | `--ag-font-body` |
| Card title | `--ag-text-card` | 600 | `--ag-font-body` |
| Body | `--ag-text-body` | 400 | `--ag-font-body` |
| Label | `--ag-text-label` | 500 | `--ag-font-body`, uppercase, 0.06em tracking |
| Mono / data | `--ag-text-mono` | 400 | `--ag-font-mono` |

---

## Section 3: Spacing, Border & Shadow Rules

- **Page padding:** All agency page wrappers use `padding: 0 var(--ag-page-x) var(--ag-page-y)`. No hardcoded pixel values at page level.
- **Card padding:** Standard cards use `padding: var(--ag-card-pad)`. Large/hero cards use `padding: var(--ag-card-pad-lg)`.
- **Gaps:** All grid and flex gaps use `var(--ag-gap)` or `var(--ag-gap-sm)`.
- **Borders:** All `border-color` values reference token variables. No hardcoded `rgba()` border values in page CSS.
- **Shadows:** Cards rest on `--ag-shadow-sm`, lift to `--ag-shadow-md` on hover. Panels and modals use `--ag-shadow-lg`.

---

## Section 4: Page & Component Sweep

Changes proceed in this order. Both `.css` files **and** `.jsx` files are in scope wherever hardcoded values are used.

### Priority 1 — Token foundation
1. `client/src/styles/agency-tokens.css` — implement all Section 1 changes
2. `client/src/styles/variables.css` — remove agency-specific values (see Section 5)

### Priority 2 — Shared components (highest leverage)
3. `AgencyStatCard.css` / `AgencyStatCard.jsx`
4. `AgencyCard.css` / `AgencyCard.jsx`
5. All button components in `client/src/components/agency/`
6. Form elements in `client/src/components/ui/forms/`

### Priority 3 — Agency page CSS + JSX files
7. `OverviewPage.css` + `OverviewPage.jsx` — gold, text colors, button radius, modal shadows
8. `DiscoverPage.css` + `DiscoverPage.jsx` — gold values only; dark bg/layout/custom shadows stay
9. `AnalyticsPage.css` + `AnalyticsPage.jsx` — full color/spacing sweep
10. `InterviewsPage.css` + `InterviewsPage.jsx`
11. `RemindersPage.css` + `RemindersPage.jsx`
12. `SettingsPage.css` + `SettingsPage.jsx`
13. `ApplicantsPage.css` + `ApplicantsPage.jsx`
14. `BoardsPage.css` + `BoardsPage.jsx`
15. `RosterPage.css` + `RosterPage.jsx`
16. `ActivityPage.css` / `MessagesPage.css` / `CastingPage.css` / `SignedPage.css` — sweep whatever CSS/JSX files exist

### Priority 4 — Layout
17. `AgencyLayout.jsx` + `AgencyLayout.css` — transition durations, inline styles

---

## Section 5: `variables.css` Cleanup

Remove the following entries from `variables.css` and add a comment above the block:

```css
/* Agency dashboard design tokens have moved to agency-tokens.css */
```

Entries to remove:
- `--color-primary` (duplicates `--ag-gold`)
- `--color-gold-*` variants that duplicate `--ag-gold` family
- Any `--color-text-*` or `--color-surface-*` values that duplicate `--ag-text-*` / `--ag-surface-*`

Entries to keep: Anything used exclusively by the talent dashboard (`/routes/talent/`) or landing page (`landing/`). Before removing any token, grep for its usage to confirm it is not referenced outside agency files.

---

## Success Criteria

- [ ] `agency-tokens.css` is the single source of truth — all tokens are explicitly marked as KEEP/UPDATE/ADD/REMOVE per this spec
- [ ] Zero instances of `#B8956A`, `#0f172a`, `#64748b` in any agency CSS or JSX file (verified by grep)
- [ ] All buttons across all agency pages have `border-radius: var(--ag-radius-md)`
- [ ] All page-level wrappers use `--ag-page-x` and `--ag-page-y` for padding
- [ ] All card padding uses `--ag-card-pad` or `--ag-card-pad-lg`
- [ ] All modals use `--ag-shadow-lg` — no custom `box-shadow` values in agency CSS for modals
- [ ] `--ag-ease` (old spring curve) is renamed to `--ag-ease-spring`; all former references updated
- [ ] `--ag-border-hover` is renamed to `--ag-border-strong`; all former references updated
- [ ] `--ag-font-serif` / `--ag-font-sans` are renamed to `--ag-font-display` / `--ag-font-body`; all former references updated
- [ ] DiscoverPage dark theme is visually unchanged except gold values updated to `#C9A55A`
- [ ] Legacy `--agency-*` alias block audited — no dark-theme breakage from gold cascade
- [ ] No layout shifts or unintended visual regressions on any agency page
