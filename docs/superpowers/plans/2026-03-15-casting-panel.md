# CastingPanel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bespoke candidate drawer in `CastingPage.jsx` (lines 659–742) with a purpose-built `CastingPanel` component that matches the canonical `TalentPanel` visual DNA but is optimised for casting decision-making.

**Architecture:** `CastingPanel` is a self-contained component (JSX + CSS) following the same 3-zone (Hero / Action Bar / Body) pattern as `TalentPanel`. It is rendered inside `AnimatePresence` in `CastingPage`, keyed by `candidate.id` so local state resets automatically on candidate change. No backend calls — all state is local.

**Tech Stack:** React 19, Framer Motion (spring physics), Lucide React icons, Sonner toasts, custom CSS (cp-* class namespace)

**Spec:** `docs/superpowers/specs/2026-03-15-casting-panel-design.md`
**Reference:** `client/src/components/agency/TalentPanel.jsx` + `TalentPanel.css`

---

## Chunk 1: CSS File

### Task 1: Create CastingPanel.css

**Files:**
- Create: `client/src/components/agency/CastingPanel.css`

- [ ] **Step 1: Create the CSS file with all cp-* rules**

```css
/* CastingPanel — casting-specific detail panel */
/* Follows TalentPanel.css naming conventions (cp-* namespace) */

/* ── Scrim & Shell ─────────────────────────────────────────── */
.casting-panel-scrim {
  position: fixed;
  inset: 0;
  background: rgba(8, 12, 20, 0.4);
  backdrop-filter: blur(4px);
  z-index: 200;
}

.casting-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px;
  background: #FFFFFF;
  z-index: 201;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* ── Zone 1: Hero ───────────────────────────────────────────── */
.cp-hero {
  position: relative;
  height: 220px;
  flex-shrink: 0;
  background: #EDE9E4;
  overflow: hidden;
}

.cp-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cp-hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, transparent 55%);
}

.cp-hero-fallback {
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

.cp-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
  z-index: 10;
  backdrop-filter: blur(4px);
}

.cp-close-btn:hover {
  background: rgba(15, 23, 42, 0.7);
}

.cp-hero-identity {
  position: absolute;
  bottom: 14px;
  left: 16px;
  right: 16px;
}

.cp-name {
  font-family: 'Playfair Display', serif;
  font-size: 26px;
  font-weight: 400;
  color: #FFFFFF;
  letter-spacing: -0.025em;
  margin: 0 0 6px;
  line-height: 1.15;
}

.cp-hero-pills {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cp-pill {
  font-size: 0.6rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 9999px;
}

.cp-pill--archetype {
  color: #C9A55A;
}

.cp-pill--stage {
  color: rgba(255, 255, 255, 0.6);
}

.cp-score-badge {
  position: absolute;
  bottom: 14px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #C9A55A;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  padding: 4px 12px;
  border-radius: 9999px;
}

/* ── Zone 2: Action Bar ─────────────────────────────────────── */
.cp-action-bar {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: #FFFFFF;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
  align-items: center;
}

.cp-btn {
  height: 38px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.18s;
  border: 1px solid transparent;
  flex-shrink: 0;
}

.cp-btn--pass {
  background: transparent;
  border-color: #e2e8f0;
  color: #475569;
}

.cp-btn--pass:hover {
  border-color: #C9A55A;
  color: #C9A55A;
}

.cp-btn--message {
  background: transparent;
  border-color: #e2e8f0;
  color: #475569;
  width: 38px;
  padding: 0;
}

.cp-btn--message:hover {
  border-color: #C9A55A;
  color: #C9A55A;
}

.cp-btn--advance {
  flex: 1;
  background: #1e293b;
  color: #FFFFFF;
  font-weight: 600;
}

.cp-btn--advance:hover:not(:disabled) {
  background: #334155;
  transform: translateY(-1px);
}

.cp-btn--advance:disabled {
  background: #C9A55A;
  cursor: default;
}

.cp-btn--restore {
  flex: 1;
  background: transparent;
  border-color: #e2e8f0;
  color: #475569;
}

.cp-btn--restore:hover {
  border-color: #C9A55A;
  color: #C9A55A;
}

/* ── Zone 3: Body ───────────────────────────────────────────── */
.cp-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px 40px;
}

.cp-body::-webkit-scrollbar {
  width: 4px;
}

.cp-body::-webkit-scrollbar-track {
  background: transparent;
}

.cp-body::-webkit-scrollbar-thumb {
  background: #EDE9E4;
  border-radius: 2px;
}

/* Stage Selector */
.cp-stage-selector {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.cp-stage-pill {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 5px 10px;
  border-radius: 9999px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
  line-height: 1;
}

.cp-stage-pill--current {
  background: #C9A55A;
  color: #FFFFFF;
  border-color: #C9A55A;
}

.cp-stage-pill--past {
  background: #f1f5f9;
  color: #94a3b8;
  border-color: #f1f5f9;
}

.cp-stage-pill--future {
  background: transparent;
  color: #cbd5e1;
  border-color: #e2e8f0;
}

.cp-stage-pill:hover:not(.cp-stage-pill--current) {
  border-color: #C9A55A;
  color: #C9A55A;
}

/* Measurements */
.cp-measurements {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.cp-measure-chip {
  background: #FAF8F5;
  border: 1px solid #EDE9E4;
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
}

.cp-measure-label {
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  display: block;
}

.cp-measure-value {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  margin-top: 3px;
  display: block;
  text-transform: capitalize;
}

/* Sections */
.cp-section {
  margin-bottom: 24px;
}

.cp-section-header {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

/* Photo Portfolio */
.cp-portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.cp-portfolio-photo {
  aspect-ratio: 2/3;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  display: block;
}

.cp-portfolio-photo:hover {
  opacity: 0.88;
}

.cp-portfolio-empty {
  aspect-ratio: 2/3;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #cbd5e1;
}

/* Lightbox */
.cp-lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cp-lightbox-img {
  max-height: 90vh;
  max-width: 90vw;
  object-fit: contain;
  border-radius: 4px;
}

/* Notes */
.cp-notes-header {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  font-weight: 500;
  font-style: italic;
  color: #0f172a;
  margin-bottom: 10px;
}

.cp-note-textarea {
  width: 100%;
  min-height: 90px;
  background: #faf9f7;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: #0f172a;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
}

.cp-note-textarea:focus {
  border-color: #C9A55A;
  box-shadow: 0 0 0 4px rgba(201, 165, 90, 0.1);
}

/* AI Signals */
.cp-signal-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #F1F0EE;
}

.cp-signal-row:last-child {
  border-bottom: none;
}

.cp-signal-icon {
  color: #C9A55A;
  flex-shrink: 0;
  margin-top: 2px;
}

.cp-signal-text {
  font-size: 12.5px;
  line-height: 1.5;
  color: #0f172a;
}
```

- [ ] **Step 2: Commit CSS file**

```bash
git add client/src/components/agency/CastingPanel.css
git commit -m "feat: add CastingPanel.css — cp-* styles for casting panel zones"
```

---

## Chunk 2: CastingPanel Component

### Task 2: Create CastingPanel.jsx

**Files:**
- Create: `client/src/components/agency/CastingPanel.jsx`

- [ ] **Step 1: Create the component file**

```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Zap, Target, TrendingUp, AlertCircle, PenLine } from 'lucide-react';
import './CastingPanel.css';

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Booked'];

const AI_SIGNALS = [
  { icon: Target,      text: 'Matches 3 open castings based on measurements and type.' },
  { icon: TrendingUp,  text: 'Applied to 4 agencies in the past 6 months — actively seeking.' },
  { icon: AlertCircle, text: 'Profile 78% complete — missing runway experience and second language.' },
];

function getInitials(name) {
  const parts = (name || '').trim().split(' ');
  return parts.length > 1
    ? (parts[0][0] || '') + (parts[1][0] || '')
    : (parts[0]?.[0] || '');
}

function getAdvanceLabel(stage) {
  switch (stage) {
    case 'Applied':     return 'Shortlist →';
    case 'Shortlisted': return 'Invite to Interview →';
    case 'Interview':   return 'Make Offer →';
    case 'Offered':     return 'Book →';
    case 'Booked':      return '✓ Booked';
    case 'Passed':      return 'Restore to Applied';
    default:            return 'Advance →';
  }
}

export const CastingPanel = ({ candidate, casting, onClose, onAction }) => {
  const [noteDraft, setNoteDraft] = useState('');
  const [lightboxUrl, setLightboxUrl] = useState(null);

  useEffect(() => {
    setNoteDraft('');
    setLightboxUrl(null);
  }, [candidate?.id]);

  if (!candidate) return null;

  const currentStageIndex = STAGES.indexOf(candidate.stage);
  const isPassed = candidate.stage === 'Passed';
  const isBooked = candidate.stage === 'Booked';

  const handleAction = (action, payload) => {
    if (onAction) onAction(action, candidate, payload);
  };

  const portfolio = candidate.portfolio || [];

  return (
    <>
      {/* Scrim */}
      <motion.div
        className="casting-panel-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="casting-panel"
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      >
        {/* ── ZONE 1: HERO ── */}
        <div className="cp-hero">
          {candidate.avatar ? (
            <>
              <img src={candidate.avatar} className="cp-hero-img" alt={candidate.name} />
              <div className="cp-hero-gradient" />
            </>
          ) : (
            <div className="cp-hero-fallback">
              {getInitials(candidate.name).toUpperCase()}
            </div>
          )}

          <button className="cp-close-btn" onClick={onClose} aria-label="Close panel">
            <X size={18} />
          </button>

          <div className="cp-hero-identity">
            <h2 className="cp-name">{candidate.name}</h2>
            <div className="cp-hero-pills">
              {candidate.archetype && (
                <span className="cp-pill cp-pill--archetype">{candidate.archetype}</span>
              )}
              <span className="cp-pill cp-pill--stage">{candidate.stage}</span>
            </div>
          </div>

          {candidate.score != null && (
            <div className="cp-score-badge">✦ {candidate.score}% Match</div>
          )}
        </div>

        {/* ── ZONE 2: ACTION BAR ── */}
        <div className="cp-action-bar">
          <button
            className="cp-btn cp-btn--pass"
            onClick={() => handleAction('pass')}
          >
            Pass
          </button>

          <button
            className="cp-btn cp-btn--message"
            title="Message"
            onClick={() => handleAction('message')}
          >
            <Mail size={16} />
          </button>

          {isPassed ? (
            <button
              className="cp-btn cp-btn--restore"
              onClick={() => handleAction('stage-change', 'Applied')}
            >
              Restore to Applied
            </button>
          ) : (
            <button
              className="cp-btn cp-btn--advance"
              disabled={isBooked}
              onClick={() => !isBooked && handleAction('advance')}
            >
              {getAdvanceLabel(candidate.stage)}
            </button>
          )}
        </div>

        {/* ── ZONE 3: BODY ── */}
        <div className="cp-body">

          {/* Stage Selector */}
          <div className="cp-stage-selector">
            {STAGES.map((stage, idx) => {
              let cls = 'cp-stage-pill';
              if (stage === candidate.stage) cls += ' cp-stage-pill--current';
              else if (idx < currentStageIndex) cls += ' cp-stage-pill--past';
              else cls += ' cp-stage-pill--future';
              return (
                <button
                  key={stage}
                  className={cls}
                  onClick={() => stage !== candidate.stage && handleAction('stage-change', stage)}
                >
                  {stage}
                </button>
              );
            })}
          </div>

          {/* Measurements */}
          <div className="cp-measurements">
            {[
              { label: 'Height',       value: candidate.height       },
              { label: 'Measurements', value: candidate.measurements },
              { label: 'Archetype',    value: candidate.archetype    },
              { label: 'Location',     value: candidate.location     },
            ].map(({ label, value }) => (
              <div key={label} className="cp-measure-chip">
                <span className="cp-measure-label">{label}</span>
                <span className="cp-measure-value">{value ?? '—'}</span>
              </div>
            ))}
          </div>

          {/* Photo Portfolio */}
          <section className="cp-section">
            <header className="cp-section-header">
              <span>Portfolio</span>
            </header>
            <div className="cp-portfolio-grid">
              {portfolio.length === 0 ? (
                <>
                  <div className="cp-portfolio-empty">No photos</div>
                  <div className="cp-portfolio-empty">No photos</div>
                </>
              ) : (
                portfolio.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    className="cp-portfolio-photo"
                    alt=""
                    onClick={() => setLightboxUrl(photo.url)}
                  />
                ))
              )}
            </div>
          </section>

          {/* Casting Notes */}
          <section className="cp-section">
            <header className="cp-section-header">
              <PenLine size={13} />
              {casting?.role ? `Notes for ${casting.role}` : 'Notes'}
            </header>
            <div className="cp-notes-header" aria-hidden="true">
              {casting?.role ? `Notes for ${casting.role}` : 'Casting Notes'}
            </div>
            <textarea
              className="cp-note-textarea"
              placeholder="Add casting notes..."
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={4}
            />
          </section>

          {/* AI Signals */}
          <section className="cp-section">
            <header className="cp-section-header">
              <Zap size={13} color="#C9A55A" />
              AI Signals
            </header>
            <div>
              {AI_SIGNALS.map((signal, idx) => (
                <div key={idx} className="cp-signal-row">
                  <signal.icon size={14} className="cp-signal-icon" />
                  <span className="cp-signal-text">{signal.text}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            className="cp-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl(null)}
          >
            <img
              src={lightboxUrl}
              className="cp-lightbox-img"
              alt="Portfolio"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CastingPanel;
```

- [ ] **Step 2: Commit the component**

```bash
git add client/src/components/agency/CastingPanel.jsx
git commit -m "feat: add CastingPanel component — 3-zone casting-optimised talent panel"
```

---

## Chunk 3: CastingPage Integration

### Task 3: Wire CastingPanel into CastingPage.jsx

**Files:**
- Modify: `client/src/routes/agency/CastingPage.jsx`

There are three sub-steps: (a) add portfolio mock data, (b) add `handleCandidateAction`, (c) swap the old drawer for `<CastingPanel>`.

- [ ] **Step 1: Add portfolio URLs to INITIAL_CANDIDATES**

In `CastingPage.jsx`, find the `INITIAL_CANDIDATES` array (lines 52–60). Add a `portfolio` field to each candidate. Use Unsplash URLs that already appear elsewhere in the file so no new network requests are needed.

Replace the entire `INITIAL_CANDIDATES` const with:

```js
const INITIAL_CANDIDATES = [
  {
    id: 101, name: 'Amara Johnson', archetype: 'editorial', score: 98,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=faces',
    stage: 'Applied', height: "5'10\"", location: 'Milan, IT', measurements: '34-24-35',
    portfolio: [
      { id: 1, url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop' },
      { id: 2, url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=600&fit=crop' },
      { id: 3, url: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=600&fit=crop' },
      { id: 4, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop' },
    ],
  },
  {
    id: 102, name: 'Sofia Chen', archetype: 'runway', score: 94,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop&crop=faces',
    stage: 'Applied', height: "5'11\"", location: 'Paris, FR', measurements: '33-23-34',
    portfolio: [
      { id: 1, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop' },
      { id: 2, url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop' },
    ],
  },
  {
    id: 103, name: 'Zara Williams', archetype: 'commercial', score: 88,
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=faces',
    stage: 'Shortlisted', height: "5'8\"", location: 'New York, US', measurements: '35-25-36',
    portfolio: [],
  },
  {
    id: 104, name: 'Elena Marcus', archetype: 'editorial', score: 91,
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=faces',
    stage: 'Interview', height: "5'9\"", location: 'London, UK', measurements: '34-24-35',
    portfolio: [
      { id: 1, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop' },
      { id: 2, url: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400&h=600&fit=crop' },
    ],
  },
  {
    id: 105, name: 'Mia Thompson', archetype: 'lifestyle', score: 85,
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=600&fit=crop&crop=faces',
    stage: 'Offered', height: "5'7\"", location: 'LA, US', measurements: '35-26-37',
    portfolio: [],
  },
  {
    id: 106, name: 'Jordan Lee', archetype: 'editorial', score: 96,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop&crop=faces',
    stage: 'Applied', height: "5'10\"", location: 'Tokyo, JP', measurements: '33-22-33',
    portfolio: [
      { id: 1, url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=600&fit=crop' },
      { id: 2, url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=600&fit=crop' },
      { id: 3, url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop' },
    ],
  },
  {
    id: 107, name: 'Naomi Adeyemi', archetype: 'runway', score: 92,
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=faces',
    stage: 'Applied', height: "5'11\"", location: 'Lagos, NG', measurements: '34-23-35',
    portfolio: [],
  },
];
```

- [ ] **Step 2: Add the CastingPanel import**

At the top of `CastingPage.jsx`, after the existing imports, add:

```js
import CastingPanel from '../../components/agency/CastingPanel';
```

- [ ] **Step 3: Add `handleCandidateAction` inside the main component**

Find the `CastingPage` component function and add this handler alongside the existing state declarations. Place it after the `setCandidates` state is declared.

The `STAGES` const already exists at module level (line 62). The handler uses it:

```js
const handleCandidateAction = (action, candidate, payload) => {
  if (action === 'pass') {
    setCandidates(prev =>
      prev.map(c => c.id === candidate.id ? { ...c, stage: 'Passed' } : c)
    );
    setDrawerCandidate(prev => prev ? { ...prev, stage: 'Passed' } : prev);
    toast.success(`${candidate.name} passed`);
  } else if (action === 'advance') {
    const next = STAGES[STAGES.indexOf(candidate.stage) + 1];
    if (!next) return;
    setCandidates(prev =>
      prev.map(c => c.id === candidate.id ? { ...c, stage: next } : c)
    );
    setDrawerCandidate(prev => prev ? { ...prev, stage: next } : prev);
    toast.success(`${candidate.name} advanced to ${next}`);
  } else if (action === 'stage-change') {
    const newStage = payload;
    setCandidates(prev =>
      prev.map(c => c.id === candidate.id ? { ...c, stage: newStage } : c)
    );
    setDrawerCandidate(prev => prev ? { ...prev, stage: newStage } : prev);
    toast.success(`${candidate.name} moved to ${newStage}`);
  } else if (action === 'message') {
    toast.success('Coming soon');
  }
};
```

- [ ] **Step 4: Remove the old drawer (lines 659–742) and add CastingPanel**

The old drawer lives inside the `return (...)` of `CastingPage`. It is the second `<AnimatePresence>` block (after the Bulk Action Bar block). It starts at:

```jsx
      {/* ═══ Candidate Drawer ═══ */}
      <AnimatePresence>
        {drawerCandidate && (
          <>
            <motion.div className="fixed bg-slate-900/40 backdrop-blur-sm z-40" ...
```

and ends at the closing `</AnimatePresence>` on line 742.

Replace that entire block with:

```jsx
      {/* ═══ Candidate Panel ═══ */}
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

- [ ] **Step 5: Remove unused imports left by the old drawer**

Check the import line for `ImageIcon` and `Sparkles` — they were used only in the old drawer and Focus Review mode tabs. `Sparkles` is used in the old drawer hero (`<Sparkles size={10} />`). `ImageIcon` is used in the Studio+ tab placeholder. Both are still used by Focus Review Mode (`ImageIcon` is used there too). Verify before removing:

- `Sparkles` — search in remaining JSX. If only appeared in the deleted drawer, remove it from the import.
- `Mail` — used in old drawer; the new `CastingPanel` imports its own `Mail`, so remove from `CastingPage.jsx` import if no longer used.

To check: grep for `Sparkles` and `Mail` in CastingPage.jsx after the edit. Remove only if they appear zero times in the remaining file.

- [ ] **Step 6: Commit integration changes**

```bash
git add client/src/routes/agency/CastingPage.jsx
git commit -m "feat: wire CastingPanel into CastingPage, replace bespoke drawer"
```

- [ ] **Step 7: Visual verification**

Start the dev server (`npm run dev:all`) and open `http://localhost:5173/dashboard/agency/casting`.

Check:
1. Click any candidate card → CastingPanel slides in from right with spring animation
2. Scrim is visible (blurred backdrop)
3. Hero shows candidate photo, name, archetype pill, stage pill, and match score badge
4. Action bar shows Pass, Message (icon), and stage-aware advance button
5. Body shows stage selector pills (current = gold, past = muted, future = outlined)
6. Measurements 4-column grid renders correctly
7. Candidates with portfolio show photos in 2-column grid; candidates without show dashed placeholders
8. Clicking a portfolio photo opens the lightbox; clicking the lightbox closes it
9. Notes textarea is editable; label shows "Notes for [role]"
10. AI Signals section renders 3 rows with gold icons
11. Clicking Pass → stage changes to Passed + toast, advance button changes to "Restore to Applied"
12. Clicking Shortlist → stage moves to Shortlisted + toast; button text updates to "Invite to Interview →"
13. Clicking a stage pill in the stage selector → stage updates + toast
14. Closing the panel (X button or scrim click) → panel slides out
15. Reopening a different candidate → notes field is empty (state reset)
