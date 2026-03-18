# Canonical Talent Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 bugs in the existing `TalentPanel` component, then wire it into DiscoverPage and OverviewPage to replace their inconsistent inline panels.

**Architecture:** Three shared sub-components (`TalentTypePill`, `TalentStatusBadge`, `TalentMatchRing`) plus one canonical `TalentPanel` drawer are already built and wired into RosterPage. This plan fixes the panel's remaining bugs and wires the two remaining pages (Discover, Overview). ApplicantsPage is a stub with no talent rows — no wiring needed there.

**Tech Stack:** React 19, Framer Motion, Lucide React, Sonner (all existing). Plain CSS. No new dependencies.

---

## File Map

| File | Status | This plan |
|---|---|---|
| `client/src/components/agency/ui/TalentTypePill.jsx` | ✅ Complete | No changes |
| `client/src/components/agency/ui/TalentStatusBadge.jsx` | ✅ Complete | No changes |
| `client/src/components/agency/ui/TalentMatchRing.jsx` | ✅ Complete | No changes |
| `client/src/components/agency/TalentPanel.jsx` | ⚠️ 5 bugs | Fix in Task 1 |
| `client/src/components/agency/TalentPanel.css` | ✅ Complete | Add 1 rule in Task 1 |
| `client/src/routes/agency/RosterPage.jsx` | ✅ Already wired | No changes |
| `client/src/routes/agency/DiscoverPage.jsx` | ❌ Uses inline DetailPanel + ResonanceRing | Wire in Task 2 |
| `client/src/routes/agency/OverviewPage.jsx` | ❌ Uses inline modal + MatchScore | Wire in Task 3 |

---

## Chunk 1: Fix TalentPanel

### Task 1: Fix TalentPanel — 5 bugs

**Spec reference:** `docs/superpowers/specs/2026-03-14-talent-panel-design.md`

**Files:**
- Modify: `client/src/components/agency/TalentPanel.jsx`
- Modify: `client/src/components/agency/TalentPanel.css`

**Bugs to fix:**

| # | Bug | Location in file |
|---|---|---|
| 1 | No `onAction` prop — buttons fire nothing | Action bar buttons, no onClick |
| 2 | Measurements use hardcoded fallbacks (`talent.height \|\| '178'`) instead of `talent.measurements?.height` | Lines 130–143 |
| 3 | Photo fallback shows blank div — should show initials | Line 62 |
| 4 | Bio shows `"..."` even for null/short bios | Line 210 |
| 5 | Notes state doesn't reset when a different talent is opened | No `useEffect` on `talent.id` |

---

- [ ] **Step 1: Add `onAction` prop and wire all action bar buttons**

In `TalentPanel.jsx`, add `onAction` to the component signature and add a `handleAction` helper. Then wire every button in Zone 2.

Find this line:
```jsx
export const TalentPanel = ({ talent, context = 'roster', onClose }) => {
```

Replace with:
```jsx
export const TalentPanel = ({ talent, context = 'roster', onClose, onAction }) => {
```

Then, immediately after the state declarations (after `const [bioExpanded, setBioExpanded] = useState(false);`), add:
```jsx
  const handleAction = (action) => {
    if (onAction) {
      onAction(action, talent);
    } else {
      toast.success('Coming soon');
    }
  };
```

Add the Sonner import at the top of the file (after the existing imports):
```jsx
import { toast } from 'sonner';
```

Then replace every `<button>` in Zone 2 (`.tp-action-bar`) to include `onClick` calls:

Replace the entire `{/* ZONE 2: ACTION BAR */}` block with:
```jsx
        {/* ZONE 2: ACTION BAR */}
        <div className="tp-action-bar">
          {context === 'discover' && (
            <button className="tp-btn tp-btn--primary" onClick={() => handleAction('invite')}>
              <UserPlus size={16} /> Invite
            </button>
          )}
          {['applicants', 'overview'].includes(context) && (
            <button className="tp-btn tp-btn--primary" onClick={() => handleAction('accept')}>
              <Check size={16} /> Accept
            </button>
          )}
          {context === 'roster' && (
            <button className="tp-btn tp-btn--primary" onClick={() => handleAction('download-comp-card')}>
              <Download size={16} /> Comp Card
            </button>
          )}
          {['applicants', 'overview', 'roster'].includes(context) && (
            <button className="tp-btn tp-btn--secondary" onClick={() => handleAction('message')}>
              <MessageCircle size={16} /> Message
            </button>
          )}
          {context === 'applicants' && (
            <button className="tp-btn tp-btn--secondary" onClick={() => handleAction('shortlist')}>
              <Star size={16} /> Shortlist
            </button>
          )}
          <button className="tp-btn tp-btn--secondary tp-btn--icon" title="Add to Board" onClick={() => handleAction('add-to-board')}>
            <LayoutGrid size={16} />
          </button>
          {context === 'applicants' && (
            <button className="tp-btn tp-btn--secondary tp-btn--icon tp-btn--danger" title="Reject" onClick={() => handleAction('reject')}>
              <XCircle size={16} />
            </button>
          )}
        </div>
```

- [ ] **Step 2: Fix measurements data path**

Find and replace the entire measurements block (4 chips) in Zone 3. Locate this:
```jsx
          {/* Measurements Strip */}
          <div className="tp-measurements">
            <div className="tp-measure-chip">
              <span className="tp-measure-label">Height</span>
              <span className="tp-measure-value">{talent.height || '178'}</span>
            </div>
            <div className="tp-measure-chip">
              <span className="tp-measure-label">Bust</span>
              <span className="tp-measure-value">{talent.bust || '84'}</span>
            </div>
            <div className="tp-measure-chip">
              <span className="tp-measure-label">Waist</span>
              <span className="tp-measure-value">{talent.waist || '60'}</span>
            </div>
            <div className="tp-measure-chip">
              <span className="tp-measure-label">Hips</span>
              <span className="tp-measure-value">{talent.hips || '89'}</span>
            </div>
          </div>
```

Replace with:
```jsx
          {/* Measurements Strip */}
          <div className="tp-measurements">
            {[
              { label: 'Height', value: talent.measurements?.height },
              { label: 'Bust',   value: talent.measurements?.bust   },
              { label: 'Waist',  value: talent.measurements?.waist  },
              { label: 'Hips',   value: talent.measurements?.hips   },
            ].map(({ label, value }) => (
              <div key={label} className="tp-measure-chip">
                <span className="tp-measure-label">{label}</span>
                <span className="tp-measure-value">{value ?? '—'}</span>
              </div>
            ))}
          </div>
```

- [ ] **Step 3: Add initials fallback for missing photos**

First add the helper function just before the `if (!talent) return null;` line:
```jsx
  const getInitials = (name) => {
    const parts = (name || '').trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] || '') + (parts[1][0] || '')
      : (parts[0]?.[0] || '') + (parts[0]?.[1] || '');
  };
```

Then find:
```jsx
          ) : (
            <div className="tp-hero-img" style={{ background: '#EDE9E4' }} />
          )}
```

Replace with:
```jsx
          ) : (
            <div className="tp-hero-fallback">
              {getInitials(talent.name).toUpperCase()}
            </div>
          )}
```

Then add the CSS rule to `TalentPanel.css` (append at the end of the file):
```css
.tp-hero-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 500;
  color: #9A7030;
  background: #EDE9E4;
}
```

- [ ] **Step 4: Fix bio null and short-bio handling**

Find:
```jsx
          {/* Bio */}
          <section className="tp-section">
            <header className="tp-section-header">Bio</header>
            <div className="tp-bio-content">
              <div className="tp-bio-text">
                {bioExpanded ? talent.bio : `${(talent.bio || '').slice(0, 120)}...`}
              </div>
              <div className="tp-bio-toggle" onClick={() => setBioExpanded(!bioExpanded)}>
                {bioExpanded ? (
                  <><ChevronUp size={14} /> Show Less</>
                ) : (
                  <><ChevronDown size={14} /> Read Full Bio</>
                )}
              </div>
            </div>
          </section>
```

Replace with:
```jsx
          {/* Bio */}
          {talent.bio && (
            <section className="tp-section">
              <header className="tp-section-header">Bio</header>
              <div className="tp-bio-content">
                <div className="tp-bio-text">
                  {bioExpanded ? talent.bio : talent.bio.slice(0, 120)}
                  {talent.bio.length > 120 && !bioExpanded && '…'}
                </div>
                {talent.bio.length > 120 && (
                  <div className="tp-bio-toggle" onClick={() => setBioExpanded(!bioExpanded)}>
                    {bioExpanded ? (
                      <><ChevronUp size={14} /> Show Less</>
                    ) : (
                      <><ChevronDown size={14} /> Read Full Bio</>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
```

- [ ] **Step 5: Reset state when talent changes**

Add a `useEffect` directly after the state declarations (after `const [bioExpanded, setBioExpanded] = useState(false);` and before `const getInitials`):

```jsx
  useEffect(() => {
    setEditingNote(false);
    setNoteDraft('');
    setNotes([]);
    setBioExpanded(false);
  }, [talent?.id]);
```

Add `useEffect` to the React import at the top of the file. Find:
```jsx
import React, { useState } from 'react';
```
Replace with:
```jsx
import React, { useState, useEffect } from 'react';
```

- [ ] **Step 6: Verify the fix**

Run the dev server:
```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && npm run dev:all
```

Navigate to `http://localhost:5173/dashboard/agency/roster` in a browser.
- Click any talent row → panel slides in ✅
- Click "Comp Card" → Sonner toast shows "Coming soon" ✅
- Close panel, open a different talent → notes/bio state resets ✅
- Talent with no photo → shows initials over cream bg ✅

- [ ] **Step 7: Commit**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy"
git add client/src/components/agency/TalentPanel.jsx client/src/components/agency/TalentPanel.css
git commit -m "fix(TalentPanel): add onAction, fix measurements, initials fallback, bio handling, state reset"
```

---

## Chunk 2: Wire DiscoverPage

### Task 2: Replace DiscoverPage's inline DetailPanel and ResonanceRing with TalentPanel

**Files:**
- Modify: `client/src/routes/agency/DiscoverPage.jsx`

**What to remove:** The inline `ResonanceRing` component (lines ~148–174) and `DetailPanel` component (lines ~246–330), and the `<ResonanceRing>` usage inside the card.

**Data shape gap:** DiscoverPage talent objects use `first`/`last` (not `name`), `archetype` (not `type`), `match` (not `matchScore`), `city` (not `location`), `photo` (not `photoUrl`), and flat `height`/`bust`/`waist`/`hips` (not nested under `measurements`). An adapter function will normalize this before passing to TalentPanel.

- [ ] **Step 1: Add imports**

At the top of `DiscoverPage.jsx`, find the existing import block. Add these two imports after the last existing import:
```jsx
import { TalentPanel } from '../../components/agency/TalentPanel';
import { TalentMatchRing } from '../../components/agency/ui/TalentMatchRing';
```

- [ ] **Step 2: Add the talent adapter function**

Find the line `const [selectedTalent, setSelectedTalent] = useState(null);` (around line 337). Directly above it, add:

```jsx
  // Maps DiscoverPage talent shape → canonical TalentObject for TalentPanel
  const toTalentObject = (t) => t ? ({
    id:       t.id,
    name:     `${t.first} ${t.last}`,
    photoUrl: t.photo || null,
    type:     (t.archetype || 'editorial').toLowerCase(),
    status:   'available',
    location: t.city || null,
    matchScore: t.match || 0,
    measurements: {
      height: t.height || null,
      bust:   t.bust   || null,
      waist:  t.waist  || null,
      hips:   t.hips   || null,
    },
    bio:      t.bio || null,
    experience: t.experience || null,
  }) : null;
```

- [ ] **Step 3: Remove the inline ResonanceRing component**

Find and delete the entire `ResonanceRing` function (approximately lines 148–174). It starts with:
```jsx
function ResonanceRing({ match, size = 36 }) {
```
and ends with its closing `}`. Delete the entire function.

- [ ] **Step 4: Replace ResonanceRing usage in TalentCard with TalentMatchRing**

Find (in the TalentCard JSX, around line 208):
```jsx
          <ResonanceRing match={talent.match} />
```
Replace with:
```jsx
          <TalentMatchRing score={talent.match || 0} size="md" />
```

- [ ] **Step 5: Remove the inline DetailPanel component**

Find and delete the entire `DetailPanel` function (approximately lines 246–330). It starts with:
```jsx
function DetailPanel({ talent, onClose }) {
```
and ends with its closing `}`. Delete the entire function.

- [ ] **Step 6: Replace the DetailPanel usage with TalentPanel**

Find (around lines 517–521):
```jsx
        {selectedTalent && (
          <DetailPanel
            talent={selectedTalent}
            onClose={() => setSelectedTalent(null)}
```

The full block ends a few lines later with `/>` or `</DetailPanel>`. Replace the entire `{selectedTalent && (<DetailPanel ... />)}` block with:

```jsx
        <AnimatePresence>
          {selectedTalent && (
            <TalentPanel
              talent={toTalentObject(selectedTalent)}
              context="discover"
              onClose={() => setSelectedTalent(null)}
            />
          )}
        </AnimatePresence>
```

**Note:** If the original code already wraps in `<AnimatePresence>`, replace that entire `<AnimatePresence>` block rather than nesting them. Check the surrounding lines — if `<AnimatePresence>` already exists there, replace from `<AnimatePresence>` to `</AnimatePresence>` with the block above.

- [ ] **Step 7: Verify**

Navigate to `http://localhost:5173/dashboard/agency/discover`.
- Talent cards show the `TalentMatchRing` in the top-right ✅
- Click a card → TalentPanel slides in from right ✅
- Hero shows talent photo and name ✅
- Action bar shows "Invite" as primary button ✅
- Close button works ✅

- [ ] **Step 8: Commit**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy"
git add client/src/routes/agency/DiscoverPage.jsx
git commit -m "feat(DiscoverPage): replace inline DetailPanel/ResonanceRing with canonical TalentPanel"
```

---

## Chunk 3: Wire OverviewPage

### Task 3: Replace OverviewPage's inline modal and MatchScore with TalentPanel

**Files:**
- Modify: `client/src/routes/agency/OverviewPage.jsx`

**What to remove:** The inline `{selected && (<div className="ov-modal-overlay">...</div>)}` block (lines ~593–699) and `MatchScore` usages.

**Data shape gap:** OverviewPage talent objects use `name` (✅), `archetype` (not `type`), `match` (not `matchScore`), `city` (not `location`), `avatar` (not `photoUrl`), flat `height`/`bust`/`waist`/`hips`, and `status` (✅). An adapter normalizes before passing to TalentPanel.

- [ ] **Step 1: Add imports**

Find the import block at the top of `OverviewPage.jsx`. Replace the existing MatchScore import:
```jsx
import MatchScore from '../../components/agency/ui/MatchScore';
```
with:
```jsx
import { TalentPanel } from '../../components/agency/TalentPanel';
import { TalentMatchRing } from '../../components/agency/ui/TalentMatchRing';
```

Also add `AnimatePresence` to the existing framer-motion import. Find:
```jsx
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
```
Replace with:
```jsx
import { motion, useMotionValue, useTransform, animate, useReducedMotion, AnimatePresence } from 'framer-motion';
```

- [ ] **Step 2: Add the talent adapter function**

Find the line `const [selected, setSelected] = useState(null);` (around line 252). Directly above it, add:

```jsx
  // Maps OverviewPage applicant shape → canonical TalentObject for TalentPanel
  const toTalentObject = (t) => t ? ({
    id:       t.id,
    name:     t.name,
    photoUrl: t.avatar || null,
    type:     (t.archetype || 'editorial').toLowerCase(),
    status:   t.status || 'submitted',
    location: t.city || null,
    matchScore: t.match || 0,
    measurements: {
      height: t.height || null,
      bust:   t.bust   || null,
      waist:  t.waist  || null,
      hips:   t.hips   || null,
    },
    bio:      t.bio || null,
    experience: null,
  }) : null;
```

- [ ] **Step 3: Replace MatchScore with TalentMatchRing in the applicant list**

Find (around line 551):
```jsx
                  <MatchScore score={t.match} size="md" />
```
Replace with:
```jsx
                  <TalentMatchRing score={t.match || 0} size="sm" />
```

- [ ] **Step 4: Remove the inline modal block**

Find the large `{selected && (...)}` block that starts around line 593:
```jsx
      {selected && (
        <div className="ov-modal-overlay" onClick={() => setSelected(null)}>
```
and ends with:
```jsx
      )}
```
(approximately line 699, just before the closing `</motion.div>` of the page).

Delete the entire block from `{selected && (` through its closing `)}`.

- [ ] **Step 5: Add TalentPanel in its place**

In the same location where the modal block was removed (just before the final `</motion.div>` that closes the page), add:

```jsx
      <AnimatePresence>
        {selected && (
          <TalentPanel
            talent={toTalentObject(selected)}
            context="overview"
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
```

- [ ] **Step 6: Clean up orphaned CSS (optional but recommended)**

After wiring, search `OverviewPage.css` for classes starting with `ov-modal-` and delete those rule blocks. They are no longer used. Run the dev server first to confirm the page renders correctly before deleting.

**Classes to delete from `OverviewPage.css`:** `.ov-modal-overlay`, `.ov-modal`, `.ov-modal-hero`, `.ov-modal-img`, `.ov-modal-grad`, `.ov-modal-close`, `.ov-modal-match-badge`, `.ov-modal-match-ring`, `.ov-modal-match-text`, `.ov-modal-match-val`, `.ov-modal-match-label`, `.ov-modal-body`, `.ov-modal-name-row`, `.ov-modal-name`, `.ov-modal-status-dot`, `.ov-modal-tags`, `.ov-modal-badge`, `.ov-modal-location`, `.ov-modal-applied`, `.ov-modal-stats`, `.ov-modal-stat`, `.ov-modal-stat-label`, `.ov-modal-stat-val`, `.ov-modal-bio`, `.ov-modal-actions-wrap`, `.ov-modal-actions`, `.ov-modal-btn`.

- [ ] **Step 7: Verify**

Navigate to `http://localhost:5173/dashboard/agency` (Overview).
- Recent applicant rows show `TalentMatchRing` ✅
- Click an applicant row → TalentPanel slides in from right ✅
- Action bar shows "Accept" (primary) and "Message" ✅
- Close button and scrim click both close panel ✅
- No orphaned MatchScore import error in console ✅

- [ ] **Step 8: Commit**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy"
git add client/src/routes/agency/OverviewPage.jsx client/src/routes/agency/OverviewPage.css
git commit -m "feat(OverviewPage): replace inline modal/MatchScore with canonical TalentPanel"
```

---

## Final Verification

- [ ] Run dev server: `npm run dev:all`
- [ ] Visit `/dashboard/agency` — Overview: TalentPanel opens on click, correct buttons ✅
- [ ] Visit `/dashboard/agency/discover` — Discover: TalentPanel opens on click, Invite button ✅
- [ ] Visit `/dashboard/agency/roster` — Roster: TalentPanel already works (unchanged) ✅
- [ ] Open three different talents across pages — each panel has consistent visual style ✅
- [ ] Switch between talents — notes/bio state resets cleanly ✅
- [ ] Action bar buttons fire Sonner toast "Coming soon" ✅
- [ ] No console errors about missing imports ✅
