# FinalCTA Redesign — Design Spec
**Date:** 2026-03-19
**File:** `landing/components/FinalCTA.tsx`
**Status:** Approved

---

## Overview

Replace the existing `FinalCTA.tsx` with a new conversion-focused section that serves both talent and agency audiences, skewing talent-first, while staying true to Pholio's editorial luxury brand philosophy.

The single primary conversion action is talent onboarding/signup.

---

## Visual Direction

**Approach:** Oversized editorial type on an atmospheric dark background — pure typographic confidence with subtle environmental warmth.

The section is the natural landing point of the main landing page. It should feel like a luxury brand campaign's final spread: immersive, confident, unhurried — yet with clear conversion intent.

---

## Layout

- **Height:** `100vh`, content vertically and horizontally centered
- **Background:** Deep velvet-black `#050505` — continuous with the site's base background
- **Max content width:** ~900px, centered
- **Overflow:** hidden

---

## Background Treatment

1. **Base color:** `#050505`
2. **Grain texture:** SVG fractalNoise overlay at `2.5%` opacity, `150px` tile — same pattern used across the landing site
3. **Radial glow:** Single centered radial gradient, gold `rgba(201, 165, 90, 0.03)` — barely perceptible warmth, not a spotlight
4. **Rule lines:** 1px gold gradient lines (`transparent → #C9A55A → transparent`) at the top and bottom edges of the section. Each animates outward from center to full width on scroll entry.

---

## Typography Hierarchy

### 1. Eyebrow Label
- Font: Inter, `0.6875rem`, weight 600
- Transform: uppercase, `0.18em` letter-spacing
- Color: `#C9A55A` (gold)
- Content: `"YOUR NEXT CHAPTER"`
- Margin below: `1.5rem`

### 2. Headline
- Font: Noto Serif Display, `clamp(4rem, 8vw, 7.5rem)`
- Weight: 400
- Tracking: `−0.03em`
- Line height: `1.0`
- Color: `#FAF7F2` (cream)
- Two lines, each rendered as an independent `motion.span` for staggered animation:
  - Line 1: `"The career you want"`
  - Line 2: `"starts "` + italic gold span `"here."`
- The word `"starts"` is rendered in italic Noto Serif Display, color `#C9A55A` — the emotional anchor

### 3. Subline
- Font: Inter, `0.9375rem`, weight 400
- Color: `rgba(241, 245, 249, 0.55)` (muted cream)
- Max-width: `480px`, centered
- Content: `"Join the platform top agencies use to discover verified talent."`
- Margin above: `2rem`

### 4. CTA Button
- Class: `.btn-gold` + `rounded-full` (existing global styles)
- Text: `"Create Your Profile Free"`
- Margin above: `2.5rem`
- `href`: `${APP_URL}/signup`

### 5. Fine Print
- Font: Inter, `0.75rem`, weight 400
- Color: `rgba(255, 255, 255, 0.22)`
- Content: `"Free to join · No credit card · Takes under an hour"`
- Margin above: `1rem`

---

## Motion

All animations triggered by `useInView` with `{ once: true, margin: "-100px" }`.

| Element | Animation | Duration / Config |
|---|---|---|
| Top + bottom rule lines | `scaleX: 0 → 1` (transform-origin: center) | `0.8s`, `ease-out-expo` |
| Eyebrow | `opacity: 0 → 1` | `0.5s`, ease |
| Headline line 1 | `y: 28 → 0, opacity: 0 → 1` | spring `stiffness: 62, damping: 20`, delay `0.08s` |
| Headline line 2 | `y: 28 → 0, opacity: 0 → 1` | spring `stiffness: 62, damping: 20`, delay `0.18s` |
| Subline | `y: 20 → 0, opacity: 0 → 1` | spring `stiffness: 62, damping: 20`, delay `0.28s` |
| CTA button | `y: 16 → 0, opacity: 0 → 1, scale: 0.96 → 1` | spring `stiffness: 62, damping: 20`, delay `0.38s` |
| Fine print | `opacity: 0 → 1` | `0.5s`, ease, delay `0.5s` |

`useReducedMotion` must be respected: when true, all `y` offsets and `scale` are set to `0`/`1` respectively, only opacity animates.

---

## Component API

```tsx
// No props required — self-contained
export default function FinalCTA() {}
```

Uses `process.env.NEXT_PUBLIC_APP_URL` with fallback to `"http://localhost:3000"`.

---

## Constraints

- No external assets, images, or third-party visual dependencies
- All motion via Framer Motion (`motion`, `useInView`, `useReducedMotion`) — already installed
- Styles inline or via existing global CSS classes (`.btn-gold`, `.font-editorial`, `.font-editorial-italic`, `.text-label`)
- Must pass `next build` without TypeScript errors
- Replaces `FinalCTA.tsx` in full — do not extend the existing component
