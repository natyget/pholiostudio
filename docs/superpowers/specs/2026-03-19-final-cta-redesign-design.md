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

## Imports

```tsx
"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
```

`APP_URL` declared at module top-level, outside the component:
```tsx
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
```

Easing constants declared at module top-level:
```tsx
const ease = [0.22, 1, 0.36, 1] as const;      // ease-out-quint: used for all elements except rule lines
const easeExpo = [0.16, 1, 0.3, 1] as const;   // ease-out-expo: used only for rule lines
```

The distinction is intentional: rule lines use the snappier expo curve for a crisper reveal; text uses the softer quint for editorial grace.

---

## Layout

- **Section element:** `<section ref={ref}>`, `position: "relative"`, `overflow: "hidden"`
- **Min-height:** `min-height: "100vh"` (not `height: "100vh"` — allows content to expand on short viewports rather than clipping)
- **Background:** `backgroundColor: "#050505"`
- **Content centering:** `display: "flex"`, `flexDirection: "column"`, `alignItems: "center"`, `justifyContent: "center"`, `padding: "80px 24px"`
- **Max content width:** `maxWidth: "900px"`, `margin: "0 auto"`, `textAlign: "center"`, `position: "relative"`, `zIndex: 10`

---

## Z-Index Layering (bottom to top)

| Layer | z-index | Notes |
|---|---|---|
| Base background color | — | section `backgroundColor` |
| Radial glow div | 0 | absolute, pointer-events: none |
| Grain texture div | 1 | absolute inset-0, pointer-events: none |
| Top rule line | 2 | absolute top-0 |
| Bottom rule line | 2 | absolute bottom-0 |
| Content wrapper div | 10 | relative, wraps all text and button |

---

## Background Treatment

### Radial Glow
```tsx
<div
  aria-hidden="true"
  style={{
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    height: 600,
    background: "radial-gradient(ellipse at center, rgba(201,165,90,0.03) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  }}
/>
```

### Grain Texture
The exact data URI string below is the same one used in `TalentCTA.tsx` and other landing sections:
```tsx
<div
  aria-hidden="true"
  style={{
    position: "absolute",
    inset: 0,
    opacity: 0.025,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    backgroundSize: "150px 150px",
    pointerEvents: "none",
    zIndex: 1,
  }}
/>
```

### Rule Lines (top and bottom)

Two `motion.div` elements. Under normal motion, they animate on `inView`. Under `useReducedMotion`, they skip the entrance animation and render at full scale unconditionally — the `initial` and `animate` props are replaced with a static `style={{ scaleX: 1 }}`.

**Normal motion pattern:**
```tsx
<motion.div
  aria-hidden="true"
  style={{
    position: "absolute",
    top: 0, // or bottom: 0 for the second line
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(to right, transparent, #C9A55A, transparent)",
    transformOrigin: "center",
    zIndex: 2,
  }}
  initial={{ scaleX: 0 }}
  animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
  transition={{ duration: 0.8, ease: easeExpo }}
/>
```

**Reduced motion pattern** (when `prefersReducedMotion` is `true`): replace the `motion.div` with a plain `<div>` at full scale, no animation:
```tsx
<div
  aria-hidden="true"
  style={{
    position: "absolute",
    top: 0, // or bottom: 0
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(to right, transparent, #C9A55A, transparent)",
    zIndex: 2,
  }}
/>
```

---

## Typography Hierarchy

### 1. Eyebrow Label
- Font: Inter (`var(--font-sans)`), `0.6875rem`, weight 600
- Transform: uppercase, `0.18em` letter-spacing
- Color: `#C9A55A`
- Content: `"YOUR NEXT CHAPTER"`
- Margin below: `1.5rem`
- Animation: `opacity: 0 → 1`, duration `0.5s`, easing `ease`, delay `0s`

### 2. Headline
- Uses `.font-editorial` class (defined in `landing/app/globals.css` — sets Noto Serif Display, weight 400, letter-spacing −0.02em, line-height 1.05)
- Override `fontSize: "clamp(4rem, 8vw, 7.5rem)"` and `lineHeight: 1.0` inline to take precedence over the class defaults
- Color: `#FAF7F2` (cream)
- Two lines, each a `motion.span` with `display: "block"`:

**Line 1:** plain text, cream
```
"The career you want"
```

**Line 2:** mixed — plain cream text + italic gold word
```tsx
<motion.span style={{ display: "block" }} ...>
  {"starts "}
  <span className="font-editorial-italic" style={{ color: "#C9A55A" }}>
    here.
  </span>
</motion.span>
```
The word `"here."` (including the period) is the italic gold anchor. `"starts "` (with trailing space) is plain cream. `.font-editorial-italic` is defined in `landing/app/globals.css` (sets Noto Serif Display italic, weight 400).

### 3. Subline
- Font: Inter, `0.9375rem`, weight 400
- Color: `rgba(241, 245, 249, 0.55)`
- `maxWidth: "480px"`, `margin: "2rem auto 0"`
- Content: `"Join the platform top agencies use to discover verified talent."`

### 4. CTA Button
- Element: `<motion.a>` — `className="btn-gold rounded-full"` is placed directly on the `motion.a` element (not a wrapper). `motion.a` accepts both `MotionProps` and `AnchorHTMLAttributes<HTMLAnchorElement>` and is fully TypeScript-compatible.
- Text: `"Create Your Profile Free"`
- `href={`${APP_URL}/signup`}`
- `style={{ marginTop: "2.5rem", display: "inline-flex" }}`

### 5. Fine Print
- Font: Inter, `0.75rem`, weight 400
- Color: `rgba(255, 255, 255, 0.22)`
- Content: `"Free to join · No credit card · Takes under an hour"`
- `style={{ marginTop: "1rem" }}`

---

## Motion

`inView` is derived from `useInView(ref, { once: true, margin: "-100px" })` where `ref` is on the `<section>`.

`prefersReducedMotion` is derived from `useReducedMotion()`.

When `prefersReducedMotion` is `true`:
- All `y` values → `0` (no vertical movement)
- All `scale` → `1` (no scale)
- Rule lines → plain `<div>` at full scale, no entrance animation (see above)
- Only `opacity` animates

| Element | Normal animation | Config |
|---|---|---|
| Eyebrow | `opacity: 0 → 1` | `0.5s`, `ease`, delay `0s` |
| Headline line 1 | `y: 28 → 0, opacity: 0 → 1` | spring `{ stiffness: 62, damping: 20 }`, delay `0.08s` |
| Headline line 2 | `y: 28 → 0, opacity: 0 → 1` | spring `{ stiffness: 62, damping: 20 }`, delay `0.18s` |
| Subline | `y: 20 → 0, opacity: 0 → 1` | spring `{ stiffness: 62, damping: 20 }`, delay `0.28s` |
| CTA button | `y: 16 → 0, opacity: 0 → 1, scale: 0.96 → 1` | spring `{ stiffness: 62, damping: 20 }`, delay `0.38s` |
| Fine print | `opacity: 0 → 1` | `0.5s`, `ease`, delay `0.5s` |

Each animating element uses:
```tsx
initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 28 }}
animate={inView ? { opacity: 1, y: 0 } : {}}
transition={{ ... }}
```

---

## Constraints

- No external assets, images, or third-party visual dependencies
- All motion via Framer Motion — already in `landing/package.json`
- All custom classes (`.btn-gold`, `.font-editorial`, `.font-editorial-italic`) are defined in `landing/app/globals.css`
- Must pass `next build` without TypeScript errors
- Full replacement of existing `FinalCTA.tsx` — do not extend or reference the old component
