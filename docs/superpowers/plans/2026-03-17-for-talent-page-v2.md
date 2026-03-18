# For Talent Page v2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/for-talent` page so each section has completely different visual grammar, add an Apple Wallet / Pholio ID section and an analytics marquee section, and make the page feel categorically different from the main landing page.

**Architecture:** Seven chapters, each with its own structural DNA — cream kinetic-type hero, three existing dark scroll-scenes, pure-white iPhone Wallet reveal, dark numbers marquee, cream minimal CTA. Two new components created (`TalentSceneWallet`, `TalentSceneAnalytics`), two existing components fully rewritten (`TalentHero`, `TalentCTA`), one copy-only update (`TalentSceneDiscoverability`), and the page shell updated.

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion 11, Tailwind CSS 4, Lucide React. Working directory: `landing/`. Build command: `cd landing && npm run build`.

---

## File Map

| File | Action |
|------|--------|
| `landing/components/talent/TalentHero.tsx` | Full rewrite |
| `landing/components/talent/TalentCTA.tsx` | Full rewrite |
| `landing/components/talent/TalentSceneDiscoverability.tsx` | Copy update only (4 strings) |
| `landing/components/talent/TalentSceneWallet.tsx` | **New file** |
| `landing/components/talent/TalentSceneAnalytics.tsx` | **New file** |
| `landing/components/ForTalentClientPage.tsx` | Add 2 imports, update main bg |

---

## Chunk 1: Hero + CTA Rewrites

---

### Task 1: Rewrite TalentHero — cream, kinetic typography

**Files:**
- Modify: `landing/components/talent/TalentHero.tsx` (full rewrite)

**What it replaces:** The current hero is `180vh` sticky with a dark `#050505` background, full-bleed model image, cursor spotlight using `useSpring`/`useMotionValue`, `useScroll`/`useTransform` scroll driver, and `FilmGrain`. ALL of that is removed.

**What the new hero is:** A static `100vh` section with cream (`#FAF8F5`) background. No scroll driver, no cursor tracking, no model image, no FilmGrain. Just typography — staggered entrance on mount. Same headline copy ("They decided in four seconds.") but completely different visual grammar.

---

- [ ] **Step 1: Verify current build passes before touching anything**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully` and `✓ Generating static pages`

---

- [ ] **Step 2: Overwrite TalentHero.tsx with the new implementation**

Write the following to `landing/components/talent/TalentHero.tsx`:

```tsx
// landing/components/talent/TalentHero.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ease = [0.22, 1, 0.36, 1] as const;

export default function TalentHero() {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Explicit delays match spec: line1=0, line2=0.12, sub-headline=0.35, CTA=0.55
  // Do NOT use i * 0.12 — that under-delays the sub-headline (0.24 instead of 0.35)
  const DELAYS = [0, 0.12, 0.35, 0.55];

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: DELAYS[i], ease },
    }),
  };

  return (
    <section
      style={{
        height: "100vh",
        backgroundColor: "#FAF8F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        {/* Line 1 */}
        <motion.h1
          custom={0}
          variants={itemVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          className="font-editorial"
          style={{
            fontSize: "clamp(3.8rem, 10vw, 9rem)",
            color: "#1A1815",
            fontWeight: 400,
            lineHeight: 0.94,
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          They decided
        </motion.h1>

        {/* Line 2 */}
        <motion.span
          custom={1}
          variants={itemVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          className="font-editorial"
          style={{
            fontSize: "clamp(3.8rem, 10vw, 9rem)",
            color: "#1A1815",
            fontWeight: 400,
            lineHeight: 0.94,
            letterSpacing: "-0.03em",
            display: "block",
            marginBottom: "1.5rem",
          }}
        >
          in four seconds.
        </motion.span>

        {/* Sub-headline */}
        <motion.p
          custom={2}
          variants={itemVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          className="font-editorial-italic"
          style={{
            fontSize: "clamp(1.6rem, 4vw, 3.2rem)",
            color: "#C9A55A",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 2.5rem 0",
          }}
        >
          Make those seconds count.
        </motion.p>

        {/* CTA */}
        <motion.a
          custom={3}
          variants={itemVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          href={`${APP_URL}/signup`}
          className="transition-transform duration-300 hover:scale-[1.02]"
          style={{
            backgroundColor: "#1A1815",
            color: "#FAF8F5",
            fontFamily: "var(--font-sans)",
            fontWeight: 600,
            fontSize: "0.8125rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderRadius: "100px",
            padding: "14px 36px",
            display: "inline-block",
            textDecoration: "none",
          }}
        >
          Build your profile — free
        </motion.a>
      </div>

      {/* Scroll indicator — always rendered; y bob disabled for reduced motion */}
      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <motion.div
          animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 1,
            height: 32,
            backgroundColor: "#C9A55A",
            opacity: 0.4,
            borderRadius: 1,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.625rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C9A55A",
            opacity: 0.4,
          }}
        >
          scroll
        </span>
      </div>
    </section>
  );
}
```

---

- [ ] **Step 3: Verify build still passes**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully` — zero TypeScript errors. If you see a type error, fix it before continuing.

---

- [ ] **Step 4: Commit**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && git add landing/components/talent/TalentHero.tsx && git commit -m "refactor: rewrite TalentHero — cream bg, kinetic type, no model

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Rewrite TalentCTA — cream, single action

**Files:**
- Modify: `landing/components/talent/TalentCTA.tsx` (full rewrite)

**What it replaces:** Current CTA has dark `#050505` background, `FilmGrain`, `RuleLines`, ambient gold glow, headline "Stop letting a bad PDF speak for you.", and TWO buttons (primary "Build Your Profile" + secondary "Back to Home"). All of that is removed.

**What the new CTA is:** Cream (`#FAF8F5`) background. No FilmGrain, no RuleLines, no ambient glow. New headline "Start for free. / No agency required." Single button only — the "Back to Home" secondary link is deliberately removed. Fine print: "Takes less than an hour." `useInView` entrance animation.

---

- [ ] **Step 1: Overwrite TalentCTA.tsx with the new implementation**

Write the following to `landing/components/talent/TalentCTA.tsx`:

```tsx
// landing/components/talent/TalentCTA.tsx
"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ease = [0.22, 1, 0.36, 1] as const;

export default function TalentCTA() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const lineVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, delay: i * 0.1, ease },
    }),
  };

  return (
    <section
      ref={ref}
      style={{
        height: "100vh",
        backgroundColor: "#FAF8F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      {/* Eyebrow */}
      <motion.p
        custom={0}
        variants={lineVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "0.6875rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#C9A55A",
          marginBottom: "1.5rem",
        }}
      >
        Your Next Chapter
      </motion.p>

      {/* Headline line 1 */}
      <motion.h2
        custom={1}
        variants={lineVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="font-editorial"
        style={{
          fontSize: "clamp(3rem, 7vw, 6.5rem)",
          color: "#1A1815",
          fontWeight: 400,
          lineHeight: 0.96,
          letterSpacing: "-0.03em",
          margin: 0,
        }}
      >
        Start for free.
      </motion.h2>

      {/* Headline line 2 */}
      <motion.span
        custom={2}
        variants={lineVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="font-editorial"
        style={{
          fontSize: "clamp(3rem, 7vw, 6.5rem)",
          color: "#1A1815",
          fontWeight: 400,
          lineHeight: 0.96,
          letterSpacing: "-0.03em",
          display: "block",
          marginBottom: "2.5rem",
        }}
      >
        No agency required.
      </motion.span>

      {/* Single CTA — "Back to Home" secondary link is intentionally removed */}
      <motion.a
        custom={3}
        variants={lineVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        href={`${APP_URL}/signup`}
        className="transition-transform duration-300 hover:scale-[1.02]"
        style={{
          backgroundColor: "#1A1815",
          color: "#FAF8F5",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "0.8125rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          borderRadius: "100px",
          padding: "16px 40px",
          display: "inline-block",
          textDecoration: "none",
          marginBottom: "1rem",
        }}
      >
        Build Your Profile
      </motion.a>

      {/* Fine print */}
      <motion.p
        custom={4}
        variants={lineVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: "0.75rem",
          color: "#94a3b8",
          margin: 0,
        }}
      >
        Takes less than an hour.
      </motion.p>
    </section>
  );
}
```

---

- [ ] **Step 2: Verify build passes**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully`

---

- [ ] **Step 3: Commit**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && git add landing/components/talent/TalentCTA.tsx && git commit -m "refactor: rewrite TalentCTA — cream bg, single action, new copy

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: Discoverability Copy + Wallet Section

---

### Task 3: Update TalentSceneDiscoverability — copy strings only

**Files:**
- Modify: `landing/components/talent/TalentSceneDiscoverability.tsx` (4 string changes, no structural changes)

No layout, animation, or structure changes. Only the four `copy` strings in the `PHASES` array are updated.

---

- [ ] **Step 1: Open the file and locate the PHASES array**

The array starts around line 17 in the current file. It looks like:

```tsx
const PHASES = [
  { key: "invisible", copy: "Most talent aren't in the room. They're in an inbox, waiting for a reply that isn't coming." },
  { key: "database", copy: "Agencies don't search inboxes. They search databases." },
  { key: "profile", copy: "A complete profile puts you in every search that matches you." },
  { key: "selected", copy: "The judgment still happens in four seconds. Now it goes in your favour." },
];
```

These are already the correct strings from the spec. **Verify** they match exactly. If they already match, skip to the commit step.

---

- [ ] **Step 2: If strings don't match, update them**

Replace the `PHASES` array with:

```tsx
const PHASES = [
  {
    key: "invisible",
    copy: "Most talent aren't in the room. They're in an inbox, waiting for a reply that isn't coming.",
  },
  {
    key: "database",
    copy: "Agencies don't search inboxes. They search databases.",
  },
  {
    key: "profile",
    copy: "A complete profile puts you in every search that matches you.",
  },
  {
    key: "selected",
    copy: "The judgment still happens in four seconds. Now it goes in your favour.",
  },
];
```

---

- [ ] **Step 3: Verify build passes**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run build 2>&1 | tail -10
```

---

- [ ] **Step 4: Commit (even if no changes — still confirms clean state)**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && git add landing/components/talent/TalentSceneDiscoverability.tsx && git commit -m "copy: update TalentSceneDiscoverability phase copy strings

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>" --allow-empty
```

---

### Task 4: Create TalentSceneWallet — Pholio ID / Apple Wallet reveal

**Files:**
- Create: `landing/components/talent/TalentSceneWallet.tsx`

**What this is:** A pure-white (`#FFFFFF`) `100vh` section. No FilmGrain, no scroll driver, no dark atmosphere. The most visually distinct section on the page. Shows a CSS-drawn iPhone frame with a simulated iOS Wallet screen containing a Pholio pass (gold header, talent info, QR code placeholder). Below the phone: a custom "Add to Apple Wallet"-style button (NOT Apple's official trademarked badge) and "Coming soon" note. Entrance via `useInView`.

**iPhone frame structure:**
- Outer: `290×590px`, `border-radius: 46px`, `border: 11px solid #1A1815`, `background: #000`
- Inside top: notch bar (`height: 28px`, black), pill notch (`80×24px`)
- Inside middle: screen area (`flex: 1`, `background: #f2f2f7`) containing iOS status bar, Wallet header, pass stack
- Inside bottom: home indicator bar (`height: 20px`, black), with pill (`80×4px`, white 35% opacity)

**QR code:** Decorative SVG made of rectangles — not a real scannable code.

**Apple logo:** Generic bitten-apple SVG path — this is a commonly available icon, NOT Apple's trademarked badge asset.

---

- [ ] **Step 1: Create the file**

Write the following to `landing/components/talent/TalentSceneWallet.tsx`:

```tsx
// landing/components/talent/TalentSceneWallet.tsx
"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

// Decorative QR code SVG (not scannable — visual placeholder only)
function QrCodePlaceholder() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Top-left finder */}
      <rect x="2" y="2" width="20" height="20" rx="2" fill="#1A1815" />
      <rect x="6" y="6" width="12" height="12" rx="1" fill="white" />
      <rect x="9" y="9" width="6" height="6" fill="#1A1815" />
      {/* Top-right finder */}
      <rect x="42" y="2" width="20" height="20" rx="2" fill="#1A1815" />
      <rect x="46" y="6" width="12" height="12" rx="1" fill="white" />
      <rect x="49" y="9" width="6" height="6" fill="#1A1815" />
      {/* Bottom-left finder */}
      <rect x="2" y="42" width="20" height="20" rx="2" fill="#1A1815" />
      <rect x="6" y="46" width="12" height="12" rx="1" fill="white" />
      <rect x="9" y="49" width="6" height="6" fill="#1A1815" />
      {/* Data dots */}
      <rect x="26" y="2" width="4" height="4" fill="#1A1815" />
      <rect x="32" y="2" width="4" height="4" fill="#1A1815" />
      <rect x="26" y="8" width="4" height="4" fill="#1A1815" />
      <rect x="38" y="8" width="4" height="4" fill="#1A1815" />
      <rect x="26" y="14" width="4" height="4" fill="#1A1815" />
      <rect x="2" y="26" width="4" height="4" fill="#1A1815" />
      <rect x="8" y="26" width="4" height="4" fill="#1A1815" />
      <rect x="26" y="26" width="4" height="4" fill="#1A1815" />
      <rect x="38" y="26" width="4" height="4" fill="#1A1815" />
      <rect x="50" y="26" width="4" height="4" fill="#1A1815" />
      <rect x="56" y="26" width="4" height="4" fill="#1A1815" />
      <rect x="2" y="32" width="4" height="4" fill="#1A1815" />
      <rect x="14" y="32" width="4" height="4" fill="#1A1815" />
      <rect x="26" y="32" width="4" height="4" fill="#1A1815" />
      <rect x="44" y="32" width="4" height="4" fill="#1A1815" />
      <rect x="2" y="38" width="4" height="4" fill="#1A1815" />
      <rect x="26" y="44" width="4" height="4" fill="#1A1815" />
      <rect x="44" y="44" width="4" height="4" fill="#1A1815" />
      <rect x="32" y="50" width="4" height="4" fill="#1A1815" />
      <rect x="50" y="50" width="4" height="4" fill="#1A1815" />
      <rect x="44" y="56" width="4" height="4" fill="#1A1815" />
      <rect x="56" y="56" width="4" height="4" fill="#1A1815" />
    </svg>
  );
}

// Generic Apple logo SVG path (not Apple's trademarked badge)
function AppleLogo() {
  return (
    <svg
      width="16"
      height="20"
      viewBox="0 0 814 1000"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-155.8-96.8C111 633.4 79.4 518.8 79.4 409.2c0-194.3 127.6-297.5 253.7-297.5 66.1 0 121.2 43.4 162.6 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  );
}

export default function TalentSceneWallet() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      style={{
        height: "100vh",
        backgroundColor: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "0 24px",
      }}
    >
      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "0.6875rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#C9A55A",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        Pholio ID
      </motion.p>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="font-editorial"
        style={{
          fontSize: "clamp(2.8rem, 6vw, 5.2rem)",
          color: "#1A1815",
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          textAlign: "center",
          marginBottom: "2.5rem",
        }}
      >
        Your identity,
        <br />
        always in your pocket.
      </motion.h2>

      {/* iPhone frame */}
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 48 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 48 }}
        transition={{
          // `duration` is ignored when type:"spring" — removed to avoid misleading code
          delay: 0.2,
          type: "spring",
          stiffness: 80,
          damping: 20,
        }}
        style={{
          width: 290,
          height: 590,
          borderRadius: 46,
          border: "11px solid #1A1815",
          backgroundColor: "#000",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Notch bar */}
        <div
          style={{
            height: 28,
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 80,
              height: 24,
              backgroundColor: "#1A1815",
              borderRadius: 12,
            }}
          />
        </div>

        {/* Screen area */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#f2f2f7",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* iOS status bar */}
          <div
            style={{
              height: 20,
              backgroundColor: "#f2f2f7",
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 10,
                color: "#1A1815",
              }}
            >
              9:41
            </span>
            {/* Signal bars + battery (decorative) */}
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end" }}>
              {[4, 7, 10].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: h,
                    backgroundColor: "#1A1815",
                    borderRadius: 1,
                  }}
                />
              ))}
              <div
                style={{
                  width: 14,
                  height: 7,
                  border: "1px solid #1A1815",
                  borderRadius: 2,
                  marginLeft: 3,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 1,
                    top: 1,
                    right: 2,
                    bottom: 1,
                    backgroundColor: "#1A1815",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Wallet app header */}
          <div
            style={{
              height: 36,
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: 17,
                color: "#1A1815",
              }}
            >
              Wallet
            </span>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "#007AFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: 16,
                  lineHeight: 1,
                  marginTop: -1,
                  fontFamily: "var(--font-sans)",
                }}
              >
                +
              </span>
            </div>
          </div>

          {/* Pass stack */}
          <div
            style={{
              flex: 1,
              padding: "4px 10px 0",
              overflow: "hidden",
            }}
          >
            {/* Primary Pholio pass */}
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                position: "relative",
                zIndex: 3,
              }}
            >
              {/* Pass header — gold gradient */}
              <div
                style={{
                  height: 56,
                  background: "linear-gradient(135deg, #C9A55A 0%, #A6845C 100%)",
                  padding: "0 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "white",
                    letterSpacing: "0.2em",
                  }}
                >
                  PHOLIO
                </span>
                {/* Talent photo placeholder */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                />
              </div>

              {/* Pass body */}
              <div style={{ backgroundColor: "white", padding: "12px 14px" }}>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#1A1815",
                    marginBottom: 2,
                  }}
                >
                  Sofia M.
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: 11,
                    color: "#6B6560",
                    marginBottom: 1,
                  }}
                >
                  Editorial · New York
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontWeight: 400,
                    fontSize: 10,
                    color: "#6B6560",
                    marginBottom: 10,
                  }}
                >
                  5&apos;10&quot; · Size 2 · Brown/Brown
                </div>
                <div
                  style={{ height: 1, backgroundColor: "#f1f5f9", marginBottom: 10 }}
                />
                {/* QR code */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <QrCodePlaceholder />
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 9,
                      color: "#94a3b8",
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    Scan to view portfolio
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 500,
                      fontSize: 10,
                      color: "#C9A55A",
                      marginTop: 2,
                    }}
                  >
                    pholio.studio/sofia-m
                  </div>
                </div>
              </div>
            </div>

            {/* Peeking pass 1 */}
            <div
              style={{
                height: 20,
                borderRadius: 16,
                backgroundColor: "rgba(201,165,90,0.4)",
                margin: "-10px 8px 0",
                position: "relative",
                zIndex: 2,
              }}
            />
            {/* Peeking pass 2 */}
            <div
              style={{
                height: 20,
                borderRadius: 16,
                backgroundColor: "rgba(201,165,90,0.2)",
                margin: "-10px 16px 0",
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>
        </div>

        {/* Home indicator */}
        <div
          style={{
            height: 20,
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 80,
              height: 4,
              backgroundColor: "rgba(255,255,255,0.35)",
              borderRadius: 2,
            }}
          />
        </div>
      </motion.div>

      {/* Custom "Add to Apple Wallet"-style button */}
      <motion.a
        href="#"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 0.85 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        whileHover={{ opacity: 1 }}
        aria-label="Add to Apple Wallet — coming soon"
        style={{
          marginTop: 28,
          height: 44,
          width: 165,
          borderRadius: 8,
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          textDecoration: "none",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <AppleLogo />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              fontSize: 10,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            Add to
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: 15,
              color: "white",
              lineHeight: 1.2,
            }}
          >
            Apple Wallet
          </span>
        </div>
      </motion.a>

      {/* Coming soon note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: "0.75rem",
          color: "#94a3b8",
          marginTop: 12,
          textAlign: "center",
        }}
      >
        Coming soon. Sign up to be first.
      </motion.p>
    </section>
  );
}
```

---

- [ ] **Step 2: Verify build passes**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully` — no TypeScript errors.

**Common issue:** If you get `Property 'amount' does not exist` from `useInView` — this is unexpected since Framer Motion 11 supports it. If it fails, replace `amount: 0.3` with `margin: "-80px"`.

---

- [ ] **Step 3: Commit**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && git add landing/components/talent/TalentSceneWallet.tsx && git commit -m "feat: add TalentSceneWallet — Pholio ID Apple Wallet concept preview

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: Analytics Section + Assembly

---

### Task 5: Create TalentSceneAnalytics — numbers-first marquee

**Files:**
- Create: `landing/components/talent/TalentSceneAnalytics.tsx`

**What this is:** Dark `#050505` section (`100vh`). No scroll driver, no sticky mechanic. A full-width auto-scrolling CSS marquee of 6 stat blocks (duplicated for seamless loop). Headline above, notification card below. `GhostWatermark label="04"` (scene-index 4 — the fourth dark section on the page after the three scroll-scenes). No `FilmGrain`.

**Marquee structure:** Outer `overflow: hidden` div → inner `width: max-content` flex div with **two full copies** of the 6 stat blocks → `@keyframes talent-marquee` translateX from `0` to `-50%`. The `-50%` moves exactly one set of blocks offscreen because the inner div is `200%` of one set.

**Important:** The CSS keyframe is injected via a `<style>` tag inside the component. The class name is `talent-analytics-marquee` to avoid collisions with any other marquee on the page.

---

- [ ] **Step 1: Create the file**

Write the following to `landing/components/talent/TalentSceneAnalytics.tsx`:

```tsx
// landing/components/talent/TalentSceneAnalytics.tsx
"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import { GhostWatermark } from "@/components/talent/shared";

const ease = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { number: "23", label1: "Agency scouts", label2: "searched this week" },
  { number: "4.2s", label1: "Average time casting directors", label2: "spend on a profile" },
  { number: "78%", label1: "Of viewed profiles", label2: "get saved to boards" },
  { number: "3×", label1: "More callbacks with", label2: "a complete comp card" },
  { number: "<1hr", label1: "Time to build", label2: "your full profile" },
  { number: "140+", label1: "Agencies actively", label2: "searching on Pholio" },
];

function StatBlock({
  number,
  label1,
  label2,
}: {
  number: string;
  label1: string;
  label2: string;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        width: 200,
        padding: "0 40px",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="font-editorial"
        style={{
          fontSize: "clamp(3rem, 7vw, 6rem)",
          color: "#C9A55A",
          fontWeight: 400,
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 400,
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.5,
        }}
      >
        {label1}
        <br />
        {label2}
      </div>
    </div>
  );
}

export default function TalentSceneAnalytics() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      style={{
        height: "100vh",
        backgroundColor: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Scene index watermark (04 = 4th dark section) */}
      <GhostWatermark label="04" />

      {/* Eyebrow */}
      <motion.p
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        transition={{ duration: 0.5, ease }}
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
          fontSize: "0.6875rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#C9A55A",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        Who&apos;s Looking
      </motion.p>

      {/* Headline */}
      <motion.h2
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
        transition={{ duration: 0.6, delay: 0.1, ease }}
        className="font-editorial"
        style={{
          fontSize: "clamp(2rem, 4.5vw, 3.8rem)",
          color: "white",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-0.025em",
          textAlign: "center",
          marginBottom: "3rem",
          padding: "0 24px",
        }}
      >
        Agencies are searching.
        <br />
        <span style={{ color: "rgba(255,255,255,0.5)" }}>
          The question is whether they find you.
        </span>
      </motion.h2>

      {/* Marquee — outer clips overflow, inner animates */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ width: "100%", overflow: "hidden", marginBottom: "3rem" }}
      >
        <div
          className="talent-analytics-marquee"
          style={{
            display: "flex",
            width: "max-content",
            animationPlayState: prefersReducedMotion ? "paused" : "running",
          }}
        >
          {/* Copy 1 */}
          {STATS.map((stat) => (
            <StatBlock key={`a-${stat.number}`} {...stat} />
          ))}
          {/* Copy 2 — identical, enables seamless loop */}
          {STATS.map((stat) => (
            <StatBlock key={`b-${stat.number}`} {...stat} />
          ))}
        </div>
      </motion.div>

      {/* Notification card */}
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        style={{
          backgroundColor: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "14px 20px",
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Eye size={16} color="#C9A55A" />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 400,
            fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Wilhelmina Models viewed your profile · 3 hours ago
        </span>
      </motion.div>

      {/* Marquee keyframe — injected inline to avoid global CSS dependency */}
      <style>{`
        @keyframes talent-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .talent-analytics-marquee {
          animation: talent-marquee 28s linear infinite;
        }
      `}</style>
    </section>
  );
}
```

---

- [ ] **Step 2: Verify build passes**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully`

---

- [ ] **Step 3: Commit**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && git add landing/components/talent/TalentSceneAnalytics.tsx && git commit -m "feat: add TalentSceneAnalytics — numbers marquee, agency proof

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 6: Update ForTalentClientPage — wire everything together

**Pre-condition:** Tasks 4 and 5 must be complete before this task. Task 6 imports `TalentSceneWallet` and `TalentSceneAnalytics` — if those files don't exist, the build will fail with a module-not-found error.

**Files:**
- Modify: `landing/components/ForTalentClientPage.tsx`

**Changes:**
1. Add import for `TalentSceneWallet`
2. Add import for `TalentSceneAnalytics`
3. Change `<main style={{ backgroundColor: "#050505" }}>` to `<main style={{ backgroundColor: "#FAF8F5" }}>` — cream fallback prevents paint flash between light sections
4. Insert `<TalentSceneWallet />` after `<TalentSceneCompCard />`
5. Insert `<TalentSceneAnalytics />` after `<TalentSceneWallet />`

---

- [ ] **Step 1: Overwrite ForTalentClientPage.tsx**

Write the following to `landing/components/ForTalentClientPage.tsx`:

```tsx
// landing/components/ForTalentClientPage.tsx
"use client";

import SmoothScroll from "@/components/SmoothScroll";
import TalentHero from "@/components/talent/TalentHero";
import TalentSceneDiscoverability from "@/components/talent/TalentSceneDiscoverability";
import TalentScenePhotoIntelligence from "@/components/talent/TalentScenePhotoIntelligence";
import TalentSceneCompCard from "@/components/talent/TalentSceneCompCard";
import TalentSceneWallet from "@/components/talent/TalentSceneWallet";
import TalentSceneAnalytics from "@/components/talent/TalentSceneAnalytics";
import TalentCTA from "@/components/talent/TalentCTA";
import MarketingFooter from "@/components/MarketingFooter";

export default function ForTalentClientPage() {
  return (
    <SmoothScroll>
      {/*
        Cream fallback prevents paint flash when transitioning between
        the light hero/wallet/CTA sections and the dark scroll-scenes.
        Each section owns its own background colour.
      */}
      <main style={{ backgroundColor: "#FAF8F5" }}>
        {/* Ch.1 — Cream kinetic typography */}
        <TalentHero />

        {/* Ch.2 — Dark scroll-scene: agency search */}
        <TalentSceneDiscoverability />

        {/* Ch.3 — Dark scroll-scene: AI photo intelligence */}
        <TalentScenePhotoIntelligence />

        {/* Ch.4 — Dark scroll-scene: comp card object study */}
        <TalentSceneCompCard />

        {/* Ch.5 — White clinical product reveal: Pholio ID / Apple Wallet */}
        <TalentSceneWallet />

        {/* Ch.6 — Dark numbers marquee: agency proof */}
        <TalentSceneAnalytics />

        {/* Ch.7 — Cream minimal single action */}
        <TalentCTA />

        <MarketingFooter />
      </main>
    </SmoothScroll>
  );
}
```

---

- [ ] **Step 2: Run full build and verify all 7 sections render**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run build 2>&1 | tail -15
```

Expected output:
```
✓ Compiled successfully
Route (app)
├ ○ /
├ ○ /about-us
├ ○ /careers
├ ○ /for-talent        ← this must appear
└ ○ /privacy
✓ Generating static pages
```

Zero TypeScript errors, zero missing import errors.

---

- [ ] **Step 3: Run lint to confirm no unused imports or type issues**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run lint 2>&1 | grep -E "error|warning" | head -20
```

Expected: No new errors introduced by the changes. Pre-existing lint warnings (e.g., the circular JSON issue in eslint.config.mjs) are acceptable and pre-existing.

---

- [ ] **Step 4: Commit the assembly**

```bash
cd "/Users/lenquanhone/Pholio_NEW copy" && git add landing/components/ForTalentClientPage.tsx && git commit -m "feat: wire for-talent page v2 — 7-chapter layout complete

Add TalentSceneWallet + TalentSceneAnalytics, update main bg to cream,
reorder sections per chapter-based redesign spec.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Final Verification

After all 6 tasks are complete:

- [ ] Full build passes: `cd "/Users/lenquanhone/Pholio_NEW copy/landing" && npm run build`
- [ ] No new TypeScript errors
- [ ] `/for-talent` route appears in the build output
- [ ] 7 chapters render in correct order: Hero (cream) → Discoverability (dark) → Photo Intelligence (dark) → Comp Card (dark) → Wallet (white) → Analytics (dark) → CTA (cream) → Footer

---

## What Was NOT Changed

- `TalentScenePhotoIntelligence.tsx` — untouched
- `TalentSceneCompCard.tsx` — untouched
- `shared.tsx` — untouched
- `landing/app/for-talent/page.tsx` — untouched (metadata stays the same)
- `landing/components/Header.tsx` — untouched (already has `/for-talent` nav link)
- `landing/components/MarketingFooter.tsx` — untouched (already links to `/for-talent`)
