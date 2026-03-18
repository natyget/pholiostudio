# Agency Dashboard UI Consistency Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the agency dashboard's visual language by consolidating the design token system and replacing hardcoded color/spacing/typography values across all agency CSS and JSX files with canonical CSS custom property references.

**Architecture:** Token-first sweep — update `agency-tokens.css` once with correct canonical values, then walk every agency CSS and JSX file replacing hardcoded values with token references. No component structure changes; this is a values-only pass.

**Tech Stack:** CSS custom properties, React JSX inline styles, Vite dev server for visual verification

---

## Substitution Reference (use this throughout all tasks)

| Hardcoded value | Replace with | Notes |
|---|---|---|
| `#B8956A` (old primary gold) | `var(--ag-gold)` | After token update ag-gold = #C9A55A |
| `#C9A55A` (correct gold) | `var(--ag-gold)` | |
| `rgba(184, 149, 106, X)` | `rgba(201, 165, 90, X)` or appropriate `var(--ag-gold-*)` | Update the RGB triple |
| `#A6845C` (old gold hover) | `var(--ag-gold-hover)` | |
| `#b08d45` (alt gold hover) | `var(--ag-gold-hover)` | |
| `#0f172a` (slate dark) | `var(--ag-text-0)` | Shifts to warm #1A1815 |
| `#64748b` (slate secondary) | `var(--ag-text-2)` | Shifts to warm #6B6560 |
| `#1A1815` (already correct) | `var(--ag-text-0)` | Tokenize even if correct |
| `#6B6560` (already correct) | `var(--ag-text-2)` | Tokenize even if correct |
| `#FAF8F5` | `var(--ag-surface-0)` | Canvas bg |
| `#FFFFFF` in card/sidebar context | `var(--ag-surface-1)` | Not for modals/overlays |
| `rgba(26,24,21,0.08)` | `var(--ag-border)` | Default border |
| `rgba(26,24,21,0.14)` | `var(--ag-border-strong)` | Hover/active border |
| `'Playfair Display', Georgia, serif` | `var(--ag-font-display)` | |
| `'Inter', -apple-system, ...` | `var(--ag-font-body)` | |
| `border-radius: 6px` on buttons | `border-radius: var(--ag-radius-md)` | |
| `border-radius: 10px` on buttons | `border-radius: var(--ag-radius-md)` | |
| `border-radius: 12px` on buttons | `border-radius: var(--ag-radius-md)` | NOT on cards (12px on cards = --ag-radius-lg, keep) |
| Custom `box-shadow` on modals | `var(--ag-shadow-lg)` | Modal shadows only |
| `padding: 24px` on standard cards | `padding: var(--ag-card-pad)` | |
| `padding: 32px` on large cards | `padding: var(--ag-card-pad-lg)` | |
| `var(--ag-ease)` (old — spring curve) | `var(--ag-ease-spring)` | After rename in tokens |
| `var(--ag-border-hover)` | `var(--ag-border-strong)` | After rename in tokens |
| `var(--ag-font-serif)` | `var(--ag-font-display)` | After rename in tokens |
| `var(--ag-font-sans)` | `var(--ag-font-body)` | After rename in tokens |

**CSS variable references in JSX inline styles:** Use string syntax — `style={{ color: 'var(--ag-gold)' }}`. This is valid; browsers resolve CSS variables in inline styles.

---

## Chunk 1: Token Foundation

### Task 1: Update agency-tokens.css

**Files:**
- Modify: `client/src/styles/agency-tokens.css`
- Modify: `client/src/styles/agency-dark-overrides.css` (if exists — has old-gold rgba values and border-hover refs)

- [ ] **Step 1: Read the current files**

```bash
cat -n "client/src/styles/agency-tokens.css"
cat "client/src/styles/agency-dark-overrides.css" 2>/dev/null && echo "FILE EXISTS" || echo "FILE NOT FOUND"
```

- [ ] **Step 2: Pre-flight — check alias cascade for dark-theme pages before touching tokens**

```bash
grep -rn "var(--agency-gold)\|var(--ag-gold)\|var(--agency-border-hover)\|var(--ag-border-hover)" \
  client/src/routes/agency/DiscoverPage.css \
  client/src/routes/agency/DiscoverPage.jsx \
  client/src/routes/agency/AnalyticsPage.css \
  client/src/routes/agency/AnalyticsPage.jsx \
  client/src/styles/agency-dark-overrides.css 2>/dev/null
```

Review the output. If DiscoverPage or AnalyticsPage dark-theme CSS uses `var(--agency-gold)` or `var(--ag-gold)` in contexts where the gold shift from `#B8956A` → `#C9A55A` would be visually wrong (e.g., a dark background muted glow that relies on the dimmer gold), note those selectors. They may need the gold set to `var(--ag-gold-dim)` instead. Do NOT proceed past this step until the cascade impact is understood.

- [ ] **Step 3: Apply gold token changes in agency-tokens.css**

```css
/* BEFORE */
--ag-gold: #B8956A;
--ag-gold-dim: rgba(184, 149, 106, 0.65);
--ag-gold-muted: rgba(184, 149, 106, 0.15);
--ag-gold-ghost: rgba(184, 149, 106, 0.08);
--ag-gold-hover: #A6845C;

/* AFTER */
--ag-gold: #C9A55A;
--ag-gold-dim: rgba(201, 165, 90, 0.65);
--ag-gold-muted: rgba(201, 165, 90, 0.12);
--ag-gold-ghost: rgba(201, 165, 90, 0.08);
--ag-gold-hover: #B8956A;
```

- [ ] **Step 4: Update surface-2 in agency-tokens.css**

```css
/* BEFORE */
--ag-surface-2: #FFFFFF;

/* AFTER */
--ag-surface-2: #F5F2EE;
```

- [ ] **Step 5: Update borders — RENAME and ADD in agency-tokens.css**

```css
/* BEFORE */
--ag-border: rgba(26,24,21,0.08);
--ag-border-hover: rgba(26,24,21,0.14);
--ag-border-gold: rgba(184,149,106,0.3);

/* AFTER */
--ag-border: rgba(26,24,21,0.08);
--ag-border-strong: rgba(26,24,21,0.14);          /* renamed from --ag-border-hover */
--ag-border-hover: rgba(26,24,21,0.14);            /* keep alias during migration */
--ag-border-gold: rgba(201,165,90,0.25);           /* UPDATE — existing token, new gold value */
--ag-border-error: rgba(220,38,38,0.5);
--ag-border-warning: rgba(234,179,8,0.5);
--ag-border-success: rgba(34,197,94,0.5);
```

- [ ] **Step 6: Update shadow-gold in agency-tokens.css**

```css
/* BEFORE */
--ag-shadow-gold: 0 0 20px rgba(184,149,106,0.12);

/* AFTER */
--ag-shadow-gold: 0 0 20px rgba(201,165,90,0.15);
```

- [ ] **Step 7: Rename font tokens and ADD size tokens in agency-tokens.css**

```css
/* BEFORE */
--ag-font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;
--ag-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--ag-font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;

/* AFTER */
--ag-font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
--ag-font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--ag-font-mono: 'SF Mono', 'Fira Code', 'Consolas', monospace;
/* aliases for backward compatibility during migration */
--ag-font-serif: var(--ag-font-display);
--ag-font-sans: var(--ag-font-body);

/* ADD text size tokens after font family block */
--ag-text-hero: 3.5rem;
--ag-text-h1: 2.5rem;
--ag-text-section: 1.125rem;
--ag-text-card: 1rem;
--ag-text-body: 0.875rem;
--ag-text-label: 0.6875rem;
--ag-text-mono: 0.8125rem;
```

If there is an existing `--font-display: var(--ag-font-serif)` line in the legacy alias block, update it to:
```css
--font-display: var(--ag-font-display);
```
This avoids a triple-indirection chain.

- [ ] **Step 8: UPDATE motion tokens and RENAME --ag-ease in agency-tokens.css**

```css
/* BEFORE */
--ag-ease: cubic-bezier(0.16, 1, 0.3, 1);
--ag-duration-fast: 150ms;
--ag-duration: 250ms;
--ag-duration-slow: 500ms;

/* AFTER */
--ag-ease-spring: cubic-bezier(0.16, 1, 0.3, 1);   /* renamed — this IS a spring curve */
--ag-ease: cubic-bezier(0.4, 0, 0.2, 1);             /* new standard ease */
--ag-duration-fast: 150ms;
--ag-duration: 200ms;                                 /* was 250ms — aligning to actual usage */
--ag-duration-slow: 400ms;                            /* was 500ms — snappier feel */
```

- [ ] **Step 9: ADD new radius, spacing, and z-index tokens in agency-tokens.css**

After the existing `--ag-radius-lg: 12px` line, add:
```css
--ag-radius-xl: 20px;
--ag-radius-full: 100px;
```

After the radius block, add a spacing section:
```css
/* Spacing */
--ag-page-x: 40px;
--ag-page-y: 48px;
--ag-card-pad: 24px;
--ag-card-pad-lg: 32px;
--ag-gap: 24px;
--ag-gap-sm: 16px;
```

After spacing, add a z-index section:
```css
/* Z-index scale */
--ag-z-base: 1;
--ag-z-dropdown: 20;
--ag-z-panel: 40;
--ag-z-modal: 100;
--ag-z-toast: 200;
```

- [ ] **Step 10: Fix agency-dark-overrides.css if it exists**

If `agency-dark-overrides.css` was found in Step 1:
- Replace any `rgba(184, 149, 106, X)` or `rgba(184,149,106,X)` with `rgba(201, 165, 90, X)` (same opacity, updated RGB)
- Replace any `var(--ag-border-hover)` with `var(--ag-border-strong)` (or leave the alias — both work during migration)

- [ ] **Step 11: Verify --agency-border-hover alias chain still resolves**

```bash
grep -n "agency-border-hover\|agency-primary\|agency-gold" client/src/styles/agency-tokens.css | head -30
```

Confirm `--agency-border-hover: var(--ag-border-hover)` still exists in the legacy aliases block. Since `--ag-border-hover` is kept as a backward-compat alias (Step 5), the full chain `--agency-border-hover` → `--ag-border-hover` → `rgba(26,24,21,0.14)` remains valid.

- [ ] **Step 12: Commit**

```bash
git add client/src/styles/agency-tokens.css
git add client/src/styles/agency-dark-overrides.css 2>/dev/null || true
git commit -m "feat: update agency-tokens.css with canonical values, renames, and new tokens"
```

---

### Task 2: Clean up variables.css

**Files:**
- Modify: `client/src/styles/variables.css`

- [ ] **Step 1: Read the current file**

```bash
cat -n "client/src/styles/variables.css"
```

- [ ] **Step 2: Check each agency-specific token for use outside agency files**

```bash
grep -rn "var(--color-primary)\|var(--color-gold" \
  client/src/routes/talent/ \
  client/src/components/talent/ \
  client/src/routes/casting/ \
  landing/ \
  --include="*.css" --include="*.jsx" --include="*.tsx" -l 2>/dev/null
```

```bash
grep -rn "var(--color-text-dark)\|var(--color-text-slate)" \
  client/src/routes/talent/ \
  client/src/components/talent/ \
  client/src/routes/casting/ \
  landing/ \
  --include="*.css" --include="*.jsx" --include="*.tsx" -l 2>/dev/null
```

- [ ] **Step 3: Remove only the confirmed agency-only tokens**

For each token listed below, check the grep results from Step 2:
- If the token appears in talent/casting/landing files → **KEEP it** and add an inline comment: `/* also used by talent dashboard — do not remove */`
- If the token appears in agency files only (or not at all) → **REMOVE it**

Tokens to evaluate for removal:
- `--color-primary: #C9A55A`
- `--color-primary-hover: #b08d45`
- `--color-gold-400`, `--color-gold-500`, `--color-gold-600`
- `--color-text-dark: #0f172a`
- `--color-text-slate: #64748b`

Add this comment at the top of any block you modify:
```css
/* Agency dashboard design tokens have moved to agency-tokens.css.
   Tokens below are retained for talent dashboard and landing page only. */
```

- [ ] **Step 4: Verify talent dashboard still compiles**

```bash
cd "client" && npm run build 2>&1 | tail -30
```

Expected: Build succeeds (or fails only on unrelated issues, not missing token errors).

- [ ] **Step 5: Commit**

```bash
git add client/src/styles/variables.css
git commit -m "feat: remove agency-duplicating tokens from variables.css"
```

---

## Chunk 2: Shared Components

### Task 3: AgencyButton

**Files:**
- Modify: `client/src/components/agency/ui/AgencyButton.css`
- Modify: `client/src/components/agency/ui/AgencyButton.jsx`

- [ ] **Step 1: Read both files**

```bash
cat -n "client/src/components/agency/ui/AgencyButton.css"
cat -n "client/src/components/agency/ui/AgencyButton.jsx"
```

- [ ] **Step 2: In AgencyButton.css — replace all hardcoded values with tokens**

Apply the substitution reference table. Key changes:
- All gold hex values → `var(--ag-gold)` or `var(--ag-gold-hover)`
- All dark text → `var(--ag-text-0)`
- All secondary text → `var(--ag-text-2)`
- **All** `border-radius` values on button selectors → `var(--ag-radius-md)` (8px)
- Transition durations → `var(--ag-duration)` or `var(--ag-duration-fast)`
- `var(--ag-ease)` if present → `var(--ag-ease-spring)` (buttons typically want spring feel) or `var(--ag-ease)` for simple hover fades

- [ ] **Step 3: In AgencyButton.jsx — replace hardcoded inline style colors**

Replace any `style={{ color: '#C9A55A' }}` or similar:
- `'#C9A55A'` → `'var(--ag-gold)'`
- `'#0f172a'` → `'var(--ag-text-0)'`
- `'#64748b'` → `'var(--ag-text-2)'`

- [ ] **Step 4: Verify no forbidden values remain**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106\|border-radius: [0-9]*px" \
  client/src/components/agency/ui/AgencyButton.css \
  client/src/components/agency/ui/AgencyButton.jsx
```

Expected: 0 matches (or only inside comments).

- [ ] **Step 5: Commit**

```bash
git add client/src/components/agency/ui/AgencyButton.css client/src/components/agency/ui/AgencyButton.jsx
git commit -m "refactor: tokenize AgencyButton colors and border radius"
```

---

### Task 4: AgencyCard and AgencyStatCard

**Files:**
- Modify: `client/src/components/agency/ui/AgencyCard.css`
- Modify: `client/src/components/agency/ui/AgencyCard.jsx`
- Modify: `client/src/components/agency/ui/AgencyStatCard.css`
- Modify: `client/src/components/agency/ui/AgencyStatCard.jsx`

- [ ] **Step 1: Read all four files**

```bash
cat -n "client/src/components/agency/ui/AgencyCard.css"
cat -n "client/src/components/agency/ui/AgencyCard.jsx"
cat -n "client/src/components/agency/ui/AgencyStatCard.css"
cat -n "client/src/components/agency/ui/AgencyStatCard.jsx"
```

- [ ] **Step 2: In AgencyCard.css — apply substitutions**

- All hardcoded gold → `var(--ag-gold)` / `var(--ag-gold-hover)`
- All hardcoded dark text → `var(--ag-text-0)`
- Card padding `24px` → `var(--ag-card-pad)`
- Card padding `32px` → `var(--ag-card-pad-lg)`
- `border-radius: 8px` on card → `var(--ag-radius-md)`
- `border-radius: 12px` on card → `var(--ag-radius-lg)` (NOT button rule — this is a card)
- `border-radius: 20px` → `var(--ag-radius-xl)`
- Surface colors (`#FFFFFF`, `#FAF8F5`) → `var(--ag-surface-1)`, `var(--ag-surface-0)`
- Border values → `var(--ag-border)`, `var(--ag-border-strong)`

- [ ] **Step 3: In AgencyStatCard.css — apply substitutions**

Same pattern. The gradient using `#C9A55A` → update to `var(--ag-gold)`.

- [ ] **Step 4: In AgencyCard.jsx and AgencyStatCard.jsx — tokenize inline styles**

Replace any hardcoded hex colors in `style={{}}` props with `'var(--ag-*)'` references.

- [ ] **Step 5: Verify no forbidden values remain**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/components/agency/ui/AgencyCard.css \
  client/src/components/agency/ui/AgencyCard.jsx \
  client/src/components/agency/ui/AgencyStatCard.css \
  client/src/components/agency/ui/AgencyStatCard.jsx
```

Expected: 0 matches.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/agency/ui/AgencyCard.css client/src/components/agency/ui/AgencyCard.jsx \
  client/src/components/agency/ui/AgencyStatCard.css client/src/components/agency/ui/AgencyStatCard.jsx
git commit -m "refactor: tokenize AgencyCard and AgencyStatCard colors and spacing"
```

---

### Task 5: Remaining UI Components

**Files:**
- Modify: `client/src/components/agency/ui/AgencyEmptyState.css`
- Modify: `client/src/components/agency/ui/AgencyEmptyState.jsx`
- Modify: `client/src/components/agency/ui/MatchScore.module.css`
- Modify: `client/src/components/agency/ui/MatchScore.jsx`
- Modify: `client/src/components/agency/ui/TalentMatchRing.jsx`
- Modify: `client/src/components/agency/ui/TalentStatusBadge.jsx`
- Modify: `client/src/components/agency/ui/TalentTypePill.jsx`

- [ ] **Step 1: Read all files**

```bash
cat -n "client/src/components/agency/ui/AgencyEmptyState.css"
cat -n "client/src/components/agency/ui/AgencyEmptyState.jsx"
cat -n "client/src/components/agency/ui/MatchScore.module.css"
cat -n "client/src/components/agency/ui/MatchScore.jsx"
cat -n "client/src/components/agency/ui/TalentMatchRing.jsx"
cat -n "client/src/components/agency/ui/TalentStatusBadge.jsx"
cat -n "client/src/components/agency/ui/TalentTypePill.jsx"
```

- [ ] **Step 2: Apply substitutions to each file**

`TalentStatusBadge.jsx`: `#64748b` for neutral status → `var(--ag-text-2)`, `#C9A55A` → `var(--ag-gold)`, `#0f172a` → `var(--ag-text-0)`

`TalentMatchRing.jsx`: SVG stroke/fill `#C9A55A` → `style={{ stroke: 'var(--ag-gold)' }}` or `style={{ fill: 'var(--ag-gold)' }}`

`MatchScore.module.css`: `#C9A55A` → `var(--ag-gold)`, `#0f172a` → `var(--ag-text-0)`

- [ ] **Step 3: Verify no forbidden values remain**

```bash
grep -rn "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/components/agency/ui/AgencyEmptyState.css \
  client/src/components/agency/ui/AgencyEmptyState.jsx \
  client/src/components/agency/ui/MatchScore.module.css \
  client/src/components/agency/ui/MatchScore.jsx \
  client/src/components/agency/ui/TalentMatchRing.jsx \
  client/src/components/agency/ui/TalentStatusBadge.jsx \
  client/src/components/agency/ui/TalentTypePill.jsx
```

Expected: 0 matches.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/agency/ui/
git commit -m "refactor: tokenize remaining agency UI components"
```

---

### Task 6: TalentPanel and CastingPanel

**Files:**
- Modify: `client/src/components/agency/TalentPanel.css`
- Modify: `client/src/components/agency/TalentPanel.jsx`
- Modify: `client/src/components/agency/CastingPanel.css`
- Modify: `client/src/components/agency/CastingPanel.jsx`

- [ ] **Step 1: Read all four files**

```bash
cat -n "client/src/components/agency/TalentPanel.css"
cat -n "client/src/components/agency/TalentPanel.jsx"
cat -n "client/src/components/agency/CastingPanel.css"
cat -n "client/src/components/agency/CastingPanel.jsx"
```

- [ ] **Step 2: Scan for ALL hardcoded hex values in these files (not just the primary 5)**

```bash
grep -n "#[0-9A-Fa-f]\{3,6\}" \
  client/src/components/agency/TalentPanel.css \
  client/src/components/agency/CastingPanel.css
```

This reveals ALL hex values in scope (not just the primary forbidden set). Map each one to its appropriate token using the substitution table and your judgment for surface/border values.

- [ ] **Step 3: Apply substitutions to TalentPanel.css and CastingPanel.css**

Work through every hex value found in Step 2:
- Gold values → `var(--ag-gold)` family
- Dark text → `var(--ag-text-0)` through `var(--ag-text-4)` as appropriate
- Surface backgrounds → `var(--ag-surface-0)` through `var(--ag-surface-4)`
- Border values → `var(--ag-border)` or `var(--ag-border-strong)`
- Panel shadow → `var(--ag-shadow-lg)`
- Panel border radius: 20px → `var(--ag-radius-xl)`, 12px → `var(--ag-radius-lg)`
- Card padding 24px → `var(--ag-card-pad)`

- [ ] **Step 4: Apply substitutions to TalentPanel.jsx and CastingPanel.jsx**

- `CastingPanel.jsx`: 1 match — `#C9A55A` icon color → `'var(--ag-gold)'`
- `TalentPanel.jsx`: 2 matches — replace hardcoded gold/text values

- [ ] **Step 5: Verify all hex values are tokenized**

```bash
grep -n "#[0-9A-Fa-f]\{3,6\}" \
  client/src/components/agency/TalentPanel.css \
  client/src/components/agency/CastingPanel.css
```

Expected: Only structural colors (e.g., transparent, semantic one-off values) remain — no brand palette hex codes.

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/components/agency/TalentPanel.css \
  client/src/components/agency/TalentPanel.jsx \
  client/src/components/agency/CastingPanel.css \
  client/src/components/agency/CastingPanel.jsx
```

Expected: 0 matches.

- [ ] **Step 6: Commit**

```bash
git add client/src/components/agency/TalentPanel.css client/src/components/agency/TalentPanel.jsx \
  client/src/components/agency/CastingPanel.css client/src/components/agency/CastingPanel.jsx
git commit -m "refactor: tokenize TalentPanel and CastingPanel colors and spacing"
```

---

### Task 7: Nav Components and Remaining Agency Components

**Files:**
- Modify: `client/src/components/agency/nav/UserDropdown.css`
- Modify: `client/src/components/agency/nav/UserDropdown.jsx`
- Modify: `client/src/components/agency/nav/MessagesDropdown.css`
- Modify: `client/src/components/agency/nav/MessagesDropdown.jsx`
- Modify: `client/src/components/agency/nav/NotificationsDropdown.css`
- Modify: `client/src/components/agency/nav/NotificationsDropdown.jsx`
- Modify (if matches found): `ActivityTimeline.jsx`, `BulkActionToolbar.jsx`, `ConfirmationDialog.jsx`, `DueReminders.jsx`, `FilterPresetManager.jsx`, `InterviewCard.jsx`, `InterviewList.jsx`, `InterviewScheduler.jsx`, `InterviewSection.jsx`, `MessageThread.jsx`, `NotesPanel.jsx`, `ReminderCard.jsx`, `ReminderCreator.jsx`, `ReminderList.jsx`, `ReminderSection.jsx`, `TagManager.jsx`, `TagRemovalModal.jsx`, `TagSelector.jsx`, `TagSelectorModal.jsx`

- [ ] **Step 1: Read nav component CSS files**

```bash
cat -n "client/src/components/agency/nav/UserDropdown.css"
cat -n "client/src/components/agency/nav/MessagesDropdown.css"
cat -n "client/src/components/agency/nav/NotificationsDropdown.css"
```

- [ ] **Step 2: Read nav component JSX files**

```bash
cat -n "client/src/components/agency/nav/UserDropdown.jsx"
cat -n "client/src/components/agency/nav/MessagesDropdown.jsx"
cat -n "client/src/components/agency/nav/NotificationsDropdown.jsx"
```

- [ ] **Step 3: Apply substitutions to all nav component files**

Apply the full substitution table. Dropdown background → `var(--ag-surface-1)`. Dropdown shadow → `var(--ag-shadow-md)`.

- [ ] **Step 4: Scan remaining component JSX for hardcoded values**

```bash
grep -rn "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/components/agency/ActivityTimeline.jsx \
  client/src/components/agency/BulkActionToolbar.jsx \
  client/src/components/agency/ConfirmationDialog.jsx \
  client/src/components/agency/DueReminders.jsx \
  client/src/components/agency/FilterPresetManager.jsx \
  client/src/components/agency/InterviewCard.jsx \
  client/src/components/agency/InterviewList.jsx \
  client/src/components/agency/InterviewScheduler.jsx \
  client/src/components/agency/InterviewSection.jsx \
  client/src/components/agency/MessageThread.jsx \
  client/src/components/agency/NotesPanel.jsx \
  client/src/components/agency/ReminderCard.jsx \
  client/src/components/agency/ReminderCreator.jsx \
  client/src/components/agency/ReminderList.jsx \
  client/src/components/agency/ReminderSection.jsx \
  client/src/components/agency/TagManager.jsx \
  client/src/components/agency/TagRemovalModal.jsx \
  client/src/components/agency/TagSelector.jsx \
  client/src/components/agency/TagSelectorModal.jsx
```

- [ ] **Step 5: Fix each file that has matches**

Apply substitution table for each. Read the file first if you haven't already.

- [ ] **Step 6: Verify entire components/agency/ directory is clean**

```bash
grep -rn "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/components/agency/ \
  --include="*.css" --include="*.jsx" --include="*.module.css"
```

Expected: 0 matches.

- [ ] **Step 7: Commit**

```bash
git add client/src/components/agency/
git commit -m "refactor: tokenize all remaining agency component colors"
```

---

## Chunk 3: High-Density Route Pages

### Task 8: Pre-sweep alias audit (run before touching any route page)

- [ ] **Step 1: Confirm --agency-* gold cascade won't break dark pages**

```bash
grep -rn "var(--agency-gold)\|--agency-gold\|rgba(184" \
  client/src/routes/agency/DiscoverPage.css \
  client/src/routes/agency/AnalyticsPage.css \
  client/src/styles/agency-dark-overrides.css 2>/dev/null
```

If any dark-theme context uses `--agency-gold` for a background, glow, or muted accent that should stay dim (the old `#B8956A`), those references should be updated to `var(--ag-gold-dim)` or a specific `rgba(201,165,90,X)` value with reduced opacity rather than inheriting the full `#C9A55A` brightness. Fix those before proceeding.

- [ ] **Step 2: Confirm no old --ag-ease references will behave incorrectly after rename**

```bash
grep -rn "var(--ag-ease)\b" \
  client/src/routes/agency/ \
  client/src/components/agency/ \
  client/src/layouts/ \
  --include="*.css" --include="*.jsx"
```

For each match, verify: is this a spring-feel transition (button bounces, panel slides, hover scale) or a standard ease (color fades, opacity changes)? Spring-feel → update to `var(--ag-ease-spring)`. Standard → `var(--ag-ease)` (correct after rename). Fix any that need updating.

---

### Task 9: OverviewPage (highest density — 56 CSS + 18 JSX matches)

**Files:**
- Modify: `client/src/routes/agency/OverviewPage.css`
- Modify: `client/src/routes/agency/OverviewPage.jsx`

- [ ] **Step 1: Read both files**

```bash
cat -n "client/src/routes/agency/OverviewPage.css"
cat -n "client/src/routes/agency/OverviewPage.jsx"
```

- [ ] **Step 2: In OverviewPage.css — apply full substitution sweep by section**

Work methodically through the file. Key targeted changes:
1. All `#C9A55A` → `var(--ag-gold)`
2. All `#0f172a` → `var(--ag-text-0)`
3. All `#64748b` → `var(--ag-text-2)`
4. Button selectors: `border-radius: 10px` or `border-radius: 12px` → `var(--ag-radius-md)`
5. Modal `box-shadow` with custom values → `var(--ag-shadow-lg)`
6. Page-level wrapper: `padding: 0 40px 48px` → `padding: 0 var(--ag-page-x) var(--ag-page-y)`
7. Standard card padding `24px` → `var(--ag-card-pad)`. Large card `32px` → `var(--ag-card-pad-lg)`
8. Grid gaps `24px` → `var(--ag-gap)`
9. Font family declarations → `var(--ag-font-display)` or `var(--ag-font-body)`
10. **Do NOT change the hero heading's `font-size: 3.5rem`** — this is an intentional design exception for OverviewPage only (map to `var(--ag-text-hero)` instead of removing)

- [ ] **Step 3: In OverviewPage.jsx — tokenize inline styles**

18 matches, mostly chart/SVG colors:
- `fill: '#C9A55A'` → `fill: 'var(--ag-gold)'`
- `color: '#0f172a'` → `color: 'var(--ag-text-0)'`
- `color: '#64748b'` → `color: 'var(--ag-text-2)'`
- `stroke: '#C9A55A'` → `stroke: 'var(--ag-gold)'`
- For data arrays like `colors: ['#C9A55A', '#other', ...]`, replace only the gold entry

- [ ] **Step 4: Verify OverviewPage is clean**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/routes/agency/OverviewPage.css \
  client/src/routes/agency/OverviewPage.jsx
```

Expected: 0 matches.

- [ ] **Step 5: Confirm hero heading is preserved**

```bash
grep -n "text-hero\|3\.5rem\|hero" client/src/routes/agency/OverviewPage.css
```

Expected: The hero heading selector still has `font-size: var(--ag-text-hero)` or `font-size: 3.5rem` (either is acceptable — tokenizing it is preferred).

- [ ] **Step 6: Visual check — start dev server if not running**

```bash
npm run dev:all
```

Navigate to `/dashboard/agency`. Confirm: overview layout intact, bento grid correct, gold correct, hero title still large (56px).

- [ ] **Step 7: Commit**

```bash
git add client/src/routes/agency/OverviewPage.css client/src/routes/agency/OverviewPage.jsx
git commit -m "refactor: tokenize OverviewPage colors, spacing, and button radius"
```

---

### Task 10: DiscoverPage (gold + font family only — dark theme preserved)

**Files:**
- Modify: `client/src/routes/agency/DiscoverPage.css`
- Modify: `client/src/routes/agency/DiscoverPage.jsx`

- [ ] **Step 1: Read both files**

```bash
cat -n "client/src/routes/agency/DiscoverPage.css"
cat -n "client/src/routes/agency/DiscoverPage.jsx"
```

- [ ] **Step 2: In DiscoverPage.css — update gold values AND font family tokens ONLY**

Scope is strictly limited. The dark `#010100` background, custom dark shadows, and layout values stay completely untouched.

Changes allowed:
- `#C9A55A` → `var(--ag-gold)` (8 instances)
- `rgba(184,149,106, X)` → `rgba(201,165,90, X)` (update RGB triple only, preserve opacity)
- `rgba(201,165,90, X)` — already correct RGB, tokenize as appropriate `var(--ag-gold-*)` variant
- Font family declarations: `'Playfair Display', Georgia, serif` → `var(--ag-font-display)`, `'Inter', ...` → `var(--ag-font-body)`

Changes NOT allowed:
- Background colors
- Custom `box-shadow` values (dark context)
- Spacing or layout values
- Any color that is not specifically gold or a font family

- [ ] **Step 3: In DiscoverPage.jsx — gold values only (3 instances)**

Replace the 3 hardcoded `#C9A55A` instances with `'var(--ag-gold)'`. Leave everything else.

- [ ] **Step 4: Verify DiscoverPage gold is updated, dark theme intact**

```bash
grep -n "#B8956A\|184, 149, 106\|184,149,106" \
  client/src/routes/agency/DiscoverPage.css \
  client/src/routes/agency/DiscoverPage.jsx
```

Expected: 0 matches (old gold values gone).

```bash
grep -n "#010100\|cosmic\|nebula\|dark" client/src/routes/agency/DiscoverPage.css | head -5
```

Expected: These values still exist — confirms dark theme is untouched.

- [ ] **Step 5: Visual check**

Navigate to `/dashboard/agency/discover`. Dark cosmic theme intact. Gold elements (search glow, active filters, panel accents) show slightly brighter `#C9A55A` — intentional.

- [ ] **Step 6: Commit**

```bash
git add client/src/routes/agency/DiscoverPage.css client/src/routes/agency/DiscoverPage.jsx
git commit -m "refactor: update DiscoverPage gold to canonical C9A55A (dark theme preserved)"
```

---

### Task 11: AnalyticsPage and CastingPage

**Files:**
- Modify: `client/src/routes/agency/AnalyticsPage.css`
- Modify: `client/src/routes/agency/AnalyticsPage.jsx`
- Modify: `client/src/routes/agency/CastingPage.css`
- Modify: `client/src/routes/agency/CastingPage.jsx`

- [ ] **Step 1: Read all four files**

```bash
cat -n "client/src/routes/agency/AnalyticsPage.css"
cat -n "client/src/routes/agency/AnalyticsPage.jsx"
cat -n "client/src/routes/agency/CastingPage.css"
cat -n "client/src/routes/agency/CastingPage.jsx"
```

- [ ] **Step 2: AnalyticsPage.css (17 matches) and AnalyticsPage.jsx (2 matches)**

Apply full substitution table. If AnalyticsPage has any dark-themed sections, apply the same restricted scope as DiscoverPage for those sections (gold + font family only; dark bg stays).

- [ ] **Step 3: CastingPage.css (1 match) and CastingPage.jsx (17 matches)**

`CastingPage.jsx` has the highest JSX concentration. Apply substitutions carefully for each of the 17 inline style instances:
- `#0f172a` text colors → `var(--ag-text-0)`
- `#C9A55A` gold accents → `var(--ag-gold)`
- `#64748b` secondary text → `var(--ag-text-2)`

- [ ] **Step 4: Verify both pages are clean**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/routes/agency/AnalyticsPage.css \
  client/src/routes/agency/AnalyticsPage.jsx \
  client/src/routes/agency/CastingPage.css \
  client/src/routes/agency/CastingPage.jsx
```

Expected: 0 matches.

- [ ] **Step 5: Commit**

```bash
git add client/src/routes/agency/AnalyticsPage.css client/src/routes/agency/AnalyticsPage.jsx \
  client/src/routes/agency/CastingPage.css client/src/routes/agency/CastingPage.jsx
git commit -m "refactor: tokenize AnalyticsPage and CastingPage colors"
```

---

## Chunk 4: Remaining Pages and Final Verification

### Task 12: InterviewsPage and RemindersPage

**Files:**
- Modify: `client/src/routes/agency/InterviewsPage.css`
- Modify: `client/src/routes/agency/InterviewsPage.jsx`
- Modify: `client/src/routes/agency/RemindersPage.css`
- Modify: `client/src/routes/agency/RemindersPage.jsx`

- [ ] **Step 1: Read all four files**

```bash
cat -n "client/src/routes/agency/InterviewsPage.css"
cat -n "client/src/routes/agency/InterviewsPage.jsx"
cat -n "client/src/routes/agency/RemindersPage.css"
cat -n "client/src/routes/agency/RemindersPage.jsx"
```

- [ ] **Step 2: Apply substitutions to all four files**

Both pages use `--agency-*` legacy aliases. After the token update, these cascade correctly — but also tokenize any remaining hardcoded values directly. Additionally:
- Page wrapper padding → `padding: 0 var(--ag-page-x) var(--ag-page-y)`
- `var(--agency-spacing-xl)` card padding references → `var(--ag-card-pad)` directly
- Page H1 heading font-size: confirm it is `2.5rem` or update to `var(--ag-text-h1)`

- [ ] **Step 3: Verify both pages are clean**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/routes/agency/InterviewsPage.css \
  client/src/routes/agency/InterviewsPage.jsx \
  client/src/routes/agency/RemindersPage.css \
  client/src/routes/agency/RemindersPage.jsx
```

Expected: 0 matches.

- [ ] **Step 4: Commit**

```bash
git add client/src/routes/agency/InterviewsPage.css client/src/routes/agency/InterviewsPage.jsx \
  client/src/routes/agency/RemindersPage.css client/src/routes/agency/RemindersPage.jsx
git commit -m "refactor: tokenize InterviewsPage and RemindersPage"
```

---

### Task 13: SettingsPage, ApplicantsPage, and BoardsPage

**Files:**
- Modify: `client/src/routes/agency/SettingsPage.css`
- Modify: `client/src/routes/agency/SettingsPage.jsx`
- Modify: `client/src/routes/agency/ApplicantsPage.jsx`
- Modify: `client/src/routes/agency/BoardsPage.css`
- Modify: `client/src/routes/agency/BoardsPage.jsx`

- [ ] **Step 1: Read all files**

```bash
cat -n "client/src/routes/agency/SettingsPage.css"
cat -n "client/src/routes/agency/SettingsPage.jsx"
cat -n "client/src/routes/agency/ApplicantsPage.jsx"
cat -n "client/src/routes/agency/BoardsPage.css"
cat -n "client/src/routes/agency/BoardsPage.jsx"
```

- [ ] **Step 2: Apply substitutions**

`SettingsPage.jsx`: 1 match — `#C9A55A` default brand color → `'var(--ag-gold)'`

`ApplicantsPage.jsx`: 1 match — `#C9A55A` status color → `'var(--ag-gold)'`

CSS files: apply full substitution table plus page-level padding standardization.

- [ ] **Step 3: Verify all three pages are clean**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/routes/agency/SettingsPage.css \
  client/src/routes/agency/SettingsPage.jsx \
  client/src/routes/agency/ApplicantsPage.jsx \
  client/src/routes/agency/BoardsPage.css \
  client/src/routes/agency/BoardsPage.jsx
```

Expected: 0 matches.

- [ ] **Step 4: Commit**

```bash
git add client/src/routes/agency/SettingsPage.css client/src/routes/agency/SettingsPage.jsx \
  client/src/routes/agency/ApplicantsPage.jsx \
  client/src/routes/agency/BoardsPage.css client/src/routes/agency/BoardsPage.jsx
git commit -m "refactor: tokenize SettingsPage, ApplicantsPage, and BoardsPage"
```

---

### Task 14: RosterPage, ActivityPage, MessagesPage, SignedPage, PlaceholderPage

**Files:**
- Modify: `client/src/routes/agency/RosterPage.css`
- Modify: `client/src/routes/agency/RosterPage.jsx`
- Modify: `client/src/routes/agency/ActivityPage.css`
- Modify: `client/src/routes/agency/ActivityPage.jsx`
- Modify: `client/src/routes/agency/MessagesPage.css`
- Modify: `client/src/routes/agency/MessagesPage.jsx`
- Modify: `client/src/routes/agency/SignedPage.css`
- Modify: `client/src/routes/agency/SignedPage.jsx`
- Modify: `client/src/routes/agency/PlaceholderPage.css`

- [ ] **Step 1: Scan all files for matches**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/routes/agency/RosterPage.css \
  client/src/routes/agency/RosterPage.jsx \
  client/src/routes/agency/ActivityPage.css \
  client/src/routes/agency/ActivityPage.jsx \
  client/src/routes/agency/MessagesPage.css \
  client/src/routes/agency/MessagesPage.jsx \
  client/src/routes/agency/SignedPage.css \
  client/src/routes/agency/SignedPage.jsx \
  client/src/routes/agency/PlaceholderPage.css
```

- [ ] **Step 2: Read each file that has matches, then apply substitutions**

For files with 0 matches, skip. For files with matches: read the file first (`cat -n`), then apply the substitution table.

- [ ] **Step 3: Verify all five pages are clean**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/routes/agency/RosterPage.css \
  client/src/routes/agency/RosterPage.jsx \
  client/src/routes/agency/ActivityPage.css \
  client/src/routes/agency/ActivityPage.jsx \
  client/src/routes/agency/MessagesPage.css \
  client/src/routes/agency/MessagesPage.jsx \
  client/src/routes/agency/SignedPage.css \
  client/src/routes/agency/SignedPage.jsx \
  client/src/routes/agency/PlaceholderPage.css
```

Expected: 0 matches.

- [ ] **Step 4: Commit**

```bash
git add client/src/routes/agency/RosterPage.css client/src/routes/agency/RosterPage.jsx \
  client/src/routes/agency/ActivityPage.css client/src/routes/agency/ActivityPage.jsx \
  client/src/routes/agency/MessagesPage.css client/src/routes/agency/MessagesPage.jsx \
  client/src/routes/agency/SignedPage.css client/src/routes/agency/SignedPage.jsx \
  client/src/routes/agency/PlaceholderPage.css
git commit -m "refactor: tokenize RosterPage, ActivityPage, MessagesPage, SignedPage, PlaceholderPage"
```

---

### Task 15: AgencyLayout

**Files:**
- Modify: `client/src/layouts/AgencyLayout.jsx`
- Modify: `client/src/layouts/AgencyLayout.css` (if exists)

- [ ] **Step 1: Read files**

```bash
cat -n "client/src/layouts/AgencyLayout.jsx"
ls "client/src/layouts/"
```

- [ ] **Step 2: Apply substitutions to AgencyLayout.jsx**

Replace hardcoded hex colors in inline styles with token references.

Replace transition durations in inline styles:
- `200ms` → use `var(--ag-duration)` if appropriate
- `300ms` (panel slide) → `var(--ag-duration-slow)`

- [ ] **Step 3: Apply substitutions to AgencyLayout.css if it exists**

Full substitution sweep.

- [ ] **Step 4: Verify AgencyLayout is clean**

```bash
grep -n "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/layouts/AgencyLayout.jsx
```

Expected: 0 matches.

- [ ] **Step 5: Commit**

```bash
git add client/src/layouts/AgencyLayout.jsx
git commit -m "refactor: tokenize AgencyLayout transitions and colors"
```

---

### Task 16: Final Verification

- [ ] **Step 1: Comprehensive grep — ALL forbidden values across entire agency dashboard**

```bash
grep -rn "#B8956A\|#C9A55A\|#0f172a\|#64748b\|#1A1815\|#6B6560\|184, 149, 106" \
  client/src/routes/agency/ \
  client/src/components/agency/ \
  client/src/layouts/AgencyLayout.jsx \
  client/src/styles/agency-tokens.css \
  --include="*.css" --include="*.jsx" --include="*.module.css"
```

Expected: **0 matches.** If any remain, fix them before proceeding.

- [ ] **Step 2: Check that old token names have no unconverted references**

```bash
grep -rn "var(--ag-font-serif)\|var(--ag-font-sans)\|var(--ag-border-hover)\b" \
  client/src/routes/agency/ \
  client/src/components/agency/ \
  client/src/layouts/ \
  --include="*.css" --include="*.jsx"
```

Expected: 0 matches (alias names still exist in tokens but pages should use the new names).

- [ ] **Step 3: Verify --ag-ease usage is semantically correct**

```bash
grep -rn "var(--ag-ease)\b" \
  client/src/routes/agency/ \
  client/src/components/agency/ \
  client/src/layouts/ \
  --include="*.css" --include="*.jsx"
```

For each match: confirm this is a standard ease transition (color fade, opacity change). Spring-feel transitions should use `var(--ag-ease-spring)`. Fix any that are wrong.

- [ ] **Step 4: Visual inspection — start dev server**

```bash
npm run dev:all
```

Visit each route and confirm visually:
- [ ] `/dashboard/agency` — OverviewPage: layout intact, gold correct, hero title still large (56px / 3.5rem)
- [ ] `/dashboard/agency/discover` — DiscoverPage: dark theme intact, gold slightly brighter
- [ ] `/dashboard/agency/interviews` — InterviewsPage: consistent light theme
- [ ] `/dashboard/agency/reminders` — RemindersPage: consistent
- [ ] `/dashboard/agency/settings` — SettingsPage: consistent
- [ ] `/dashboard/agency/roster` — RosterPage: consistent
- [ ] `/dashboard/agency/analytics` — AnalyticsPage: consistent
- [ ] `/dashboard/agency/applicants` — ApplicantsPage: consistent
- [ ] `/dashboard/agency/boards` — BoardsPage: consistent
- [ ] `/dashboard/agency/activity` — ActivityPage: consistent
- [ ] `/dashboard/agency/messages` — MessagesPage: consistent
- [ ] `/dashboard/agency/casting` — CastingPage: consistent
- [ ] `/dashboard/agency/signed` — SignedPage: consistent
- [ ] Shared components (stat cards, buttons, panels, dropdowns): gold consistent across all pages

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "refactor: complete agency dashboard UI consistency token sweep"
```
