# For Talent Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/for-talent` marketing page that converts models to signups by running a single argument: "Agencies dismissed you in four seconds based on a bad PDF. Pholio fixes the reason they stopped scrolling."

**Architecture:** Five sections — Hero (accusation), Discoverability (scroll-driven search UI), Photo Intelligence (AI scan over a photo grid), Comp Card (card format transformation), CTA — assembled in `ForTalentClientPage.tsx` following the existing `ClientPage.tsx` pattern. All scroll-driven sections pin for desktop and collapse to static layouts on mobile.

**Tech Stack:** Next.js 15, React 19, Framer Motion (scroll-driven animation, spring physics, AnimatePresence), Lenis smooth scroll, TypeScript, Tailwind CSS 4, existing comp card components (`VelvetRunway`, `SwissGrid`, `MaisonBlanc`).

**Spec:** `docs/superpowers/specs/2026-03-15-for-talent-page-design.md`

**Note on testing:** The `landing/` app has no jest/vitest setup. Verification uses `npm run build` (TypeScript compilation) and `npm run lint` after each commit. Visual verification is done in the dev server (`cd landing && npm run dev`).

---

## Chunk 1: Foundation — Route, Wrappers, Shared Utilities, Header

### Task 1: Create the page route

**Files:**
- Create: `landing/app/for-talent/page.tsx` (server component — holds metadata)
- Create: `landing/components/ForTalentClientPage.tsx` (client component — holds all sections)

**Pattern note:** Secondary pages in this codebase (e.g. `about-us/page.tsx`) use `"use client"` directly in the route file without a dynamic wrapper. The `PageWrapper → ClientPage` three-layer pattern is ONLY for the homepage because of its Preloader. The talent page has no Preloader, so it follows the simpler two-file pattern: server route (for metadata) + client component (for browser APIs).

- [ ] **Step 1: Create the route file (server component)**

```tsx
// landing/app/for-talent/page.tsx
// Server component — do NOT add "use client" here (metadata requires server component)
import ForTalentClientPage from "@/components/ForTalentClientPage";

export const metadata = {
  title: "For Talent — Pholio",
  description:
    "Agencies decided in four seconds. Pholio changes what they see. Build a professional portfolio and AI-curated comp card in under an hour.",
};

export default function ForTalentPage() {
  return <ForTalentClientPage />;
}
```

- [ ] **Step 2: Create the client page shell (empty sections for now)**

```tsx
// landing/components/ForTalentClientPage.tsx
"use client";

import SmoothScroll from "@/components/SmoothScroll";
import MarketingFooter from "@/components/MarketingFooter";

export default function ForTalentClientPage() {
  return (
    <SmoothScroll>
      <main style={{ backgroundColor: "#050505" }}>
        {/* Sections will be added in subsequent tasks */}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-sans)",
          }}
        >
          for-talent page — coming soon
        </div>
        <MarketingFooter />
      </main>
    </SmoothScroll>
  );
}
```

- [ ] **Step 3: Verify build passes**

```bash
cd landing && npm run build
```
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add landing/app/for-talent/page.tsx landing/components/ForTalentClientPage.tsx
git commit -m "feat: add /for-talent route and client page shell"
```

---

### Task 2: Create shared talent section utilities

**Files:**
- Create: `landing/components/talent/shared.tsx`

These three presentational components are reused in every scroll section. Extracting them eliminates duplication across five files.

- [ ] **Step 1: Create the shared utilities file**

```tsx
// landing/components/talent/shared.tsx
"use client";

// ── FilmGrain ───────────────────────────────────────────────────────
// SVG fractalNoise overlay. Identical to SceneCompCard treatment.
export function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light"
      style={{
        opacity: 0.02,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "150px 150px",
      }}
    />
  );
}

// ── RuleLines ───────────────────────────────────────────────────────
// Two vertical 1px gold editorial rule lines at 8% from each edge.
export function RuleLines() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
    >
      <div
        style={{
          position: "absolute",
          left: "8%",
          top: 0,
          bottom: 0,
          width: 1,
          background:
            "linear-gradient(to bottom, transparent, rgba(201,165,90,0.06) 30%, rgba(201,165,90,0.06) 70%, transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "8%",
          top: 0,
          bottom: 0,
          width: 1,
          background:
            "linear-gradient(to bottom, transparent, rgba(201,165,90,0.04) 40%, rgba(201,165,90,0.04) 60%, transparent)",
        }}
      />
    </div>
  );
}

// ── GhostWatermark ──────────────────────────────────────────────────
// Near-invisible serif chapter marker ("01", "02", "03") at right edge.
export function GhostWatermark({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-[1] select-none"
      style={{
        right: "6%",
        top: "50%",
        transform: "translateY(-50%)",
        opacity: 0.018,
      }}
    >
      <span
        className="font-editorial"
        style={{
          fontSize: "clamp(18rem, 28vw, 32rem)",
          lineHeight: 0.8,
          color: "#C9A55A",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── AiBadge ─────────────────────────────────────────────────────────
// Small pill badge used in Section 3 (AI Selected) and Section 4 (Format Matched).
export function AiBadge({ label }: { label: string }) {
  return (
    <span
      className="text-[9px] uppercase tracking-[0.08em] font-semibold px-2 py-1 rounded-full flex items-center gap-1.5"
      style={{
        color: "#C9A55A",
        backgroundColor: "rgba(201,165,90,0.08)",
        border: "1px solid rgba(201,165,90,0.2)",
        backdropFilter: "blur(8px)",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="8" height="8" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 1l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5L8 1z"
          fill="#C9A55A"
          opacity="0.8"
        />
      </svg>
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd landing && npm run build 2>&1 | grep -E "error|Error" | head -20
```
Expected: No TypeScript errors related to new file.

- [ ] **Step 3: Commit**

```bash
git add landing/components/talent/shared.tsx
git commit -m "feat: add shared talent section utilities (FilmGrain, RuleLines, GhostWatermark, AiBadge)"
```

---

### Task 3: Update Header nav and hero-suppression logic

**Files:**
- Modify: `landing/components/Header.tsx` (lines 74, 89, 108–114)

The header has two places where `const isHome = pathname === "/"` gates the hero-suppression logic. Both must be updated. The nav `links` array must receive a new `FOR TALENT` entry.

- [ ] **Step 1: Update the `useEffect` isHome check (line 74)**

Find:
```tsx
      const isHome = pathname === "/";

      if (isHome && currentScroll < vh) {
```
Replace with:
```tsx
      const isHeroPage = pathname === "/" || pathname === "/for-talent";

      if (isHeroPage && currentScroll < vh) {
```

- [ ] **Step 2: Update the `useMotionValueEvent` isHome check (line 89)**

Find:
```tsx
    const isHome = pathname === "/";
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1000;

    // Hide header if on homepage and within first 100vh
    if (isHome && latest < vh) {
```
Replace with:
```tsx
    const isHeroPage = pathname === "/" || pathname === "/for-talent";
    const vh = typeof window !== 'undefined' ? window.innerHeight : 1000;

    // Hide header if on a hero page and within first 100vh
    if (isHeroPage && latest < vh) {
```

- [ ] **Step 3: Add FOR TALENT to the nav links array (line 108)**

Find:
```tsx
  const links = [
    { label: "ABOUT", href: "/about-us" },
    { label: "CAREERS", href: "/careers" },
    { label: "PLATFORM", href: "/#platform" },
    { label: "FOR AGENCIES", href: "/#agencies" },
    { label: "STUDIO+", href: "/#studio-plus" },
  ];
```
Replace with:
```tsx
  const links = [
    { label: "ABOUT", href: "/about-us" },
    { label: "CAREERS", href: "/careers" },
    { label: "FOR TALENT", href: "/for-talent" },
    { label: "FOR AGENCIES", href: "/#agencies" },
    { label: "PLATFORM", href: "/#platform" },
    { label: "STUDIO+", href: "/#studio-plus" },
  ];
```

- [ ] **Step 4: Also add FOR TALENT to the mobile menu** (the mobile menu iterates the same `links` array — no additional change needed since it uses the same `links` variable).

- [ ] **Step 5: Verify lint and build**

```bash
cd landing && npm run lint && npm run build
```
Expected: No errors. The header now suppresses on `/for-talent` during the first viewport.

- [ ] **Step 6: Commit**

```bash
git add landing/components/Header.tsx
git commit -m "feat: add For Talent nav link and extend hero suppression to /for-talent"
```

---

## Chunk 2: TalentHero

### Task 4: Build TalentHero component

**Files:**
- Create: `landing/components/talent/TalentHero.tsx`

TalentHero is a simplified Hero (no word wheel, no preloader dependency). It uses `useInView` for entrance and `useScroll`/`useTransform` for parallax and fade-out. The sticky pattern is `height: 300vh` with the viewport pinned at `top: 0`.

- [ ] **Step 1: Create TalentHero.tsx**

```tsx
// landing/components/talent/TalentHero.tsx
"use client";

import { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimation,
} from "framer-motion";
import { FilmGrain, RuleLines } from "@/components/talent/shared";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const ease = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const itemUp = {
  hidden: { y: 28, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 62, damping: 20 },
  },
};

export default function TalentHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Auto-start on mount (no preloader dependency)
  useEffect(() => {
    const timeout = setTimeout(() => controls.start("visible"), 100);
    return () => clearTimeout(timeout);
  }, [controls]);

  // Scroll-driven parallax and fade
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const textSpring = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });
  const textY = useTransform(textSpring, [0, 1], [0, -400]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.6], [1, 0]);
  const uiOpacity = useTransform(scrollYProgress, [0.5, 0.7], [1, 0]);
  const heroOpacity = useTransform(scrollYProgress, [0.75, 0.95], [1, 0]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.12, 1]);

  // Cursor spotlight
  const mouseX = useMotionValue(
    typeof window !== "undefined" ? window.innerWidth / 2 : 800
  );
  const mouseY = useMotionValue(
    typeof window !== "undefined" ? window.innerHeight / 2 : 400
  );
  const spotX = useSpring(mouseX, { stiffness: 38, damping: 22 });
  const spotY = useSpring(mouseY, { stiffness: 38, damping: 22 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative z-10" style={{ height: "300vh" }}>
      <motion.div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        style={{ opacity: heroOpacity, backgroundColor: "#050505" }}
      >
        {/* ── Film grain ── */}
        <FilmGrain />

        {/* ── Rule lines ── */}
        <RuleLines />

        {/* ── Ambient glow (always-on) ── */}
        <motion.div
          className="absolute inset-0 z-[14] pointer-events-none"
          animate={{ opacity: [0.07, 0.13, 0.07] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(201, 165, 90, 0.4) 0%, transparent 70%)",
          }}
        />

        {/* ── Cursor spotlight ── */}
        <motion.div
          className="absolute z-[15] pointer-events-none rounded-full"
          animate={{ opacity: [0.13, 0.22, 0.13] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 1000,
            height: 1000,
            left: -500,
            top: -500,
            x: spotX,
            y: spotY,
            background:
              "radial-gradient(circle, rgba(201, 165, 90, 0.6) 0%, transparent 70%)",
          }}
        />

        {/* ── Model image ── */}
        {/* TODO: Replace /images/model2-nobg.png with /images/model3-nobg.png before launch */}
        <motion.div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
          <motion.div
            className="w-full h-full relative flex items-end justify-center pb-6"
            style={{ scale: imageScale }}
          >
            <img
              src="/images/model2-nobg.png"
              alt="Fashion model"
              className="h-[100vh] w-auto object-contain object-bottom"
            />
          </motion.div>
        </motion.div>

        {/* ── Copy ── */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={containerVariants}
            className="relative w-full h-full max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col justify-center"
          >
            <motion.div
              style={{ y: textY, opacity: textOpacity, willChange: "transform" }}
              className="max-w-2xl"
            >
              {/* Eyebrow */}
              <motion.p
                variants={itemUp}
                className="text-label mb-6"
                style={{ color: "#C9A55A" }}
              >
                For Talent
              </motion.p>

              {/* Headline */}
              <motion.h1
                variants={itemUp}
                className="font-editorial mb-8"
                style={{
                  fontSize: "clamp(3.5rem, 8vw, 7rem)",
                  color: "#FFFFFF",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.04,
                }}
              >
                They decided
                <br />
                <span className="font-editorial-italic" style={{ color: "#C9A55A" }}>
                  in four seconds.
                </span>
              </motion.h1>

              {/* Body */}
              <motion.p
                variants={itemUp}
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  maxWidth: 480,
                  letterSpacing: "-0.005em",
                  marginBottom: "2.5rem",
                }}
              >
                Before you said anything. Before they read your name. Based on a PDF
                you built in Canva at midnight. Pholio doesn&apos;t make you more
                presentable. It removes the reason they stopped scrolling.
              </motion.p>

              {/* CTA */}
              <motion.div variants={itemUp} style={{ opacity: uiOpacity }} className="pointer-events-auto">
                <a
                  href={`${APP_URL}/signup`}
                  className="relative inline-flex items-center justify-center text-[11px] font-bold tracking-[0.15em] uppercase px-7 py-3.5 rounded-full overflow-hidden group transition-transform duration-300 hover:scale-[1.02]"
                  style={{
                    background:
                      "linear-gradient(135deg, #C9A55A 0%, #A68644 100%)",
                    color: "#050505",
                    boxShadow: "0 4px 20px rgba(201, 165, 90, 0.25)",
                    textDecoration: "none",
                  }}
                >
                  <span className="relative z-10">Build Your Profile</span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(135deg, #DFBE76 0%, #C9A55A 100%)",
                    }}
                  />
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 pointer-events-none"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <motion.div
            className="w-[1px] h-12"
            style={{
              background:
                "linear-gradient(to bottom, transparent, #C9A55A, transparent)",
              transformOrigin: "top",
            }}
            animate={{ scaleY: [0, 1, 0], y: [0, 20, 40], opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 2: Wire TalentHero into ForTalentClientPage**

Edit `landing/components/ForTalentClientPage.tsx`:

Find:
```tsx
        {/* Sections will be added in subsequent tasks */}
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-sans)",
          }}
        >
          for-talent page — coming soon
        </div>
```
Replace with:
```tsx
        <TalentHero />
```

Add import at top of file (after `SmoothScroll` import):
```tsx
import TalentHero from "@/components/talent/TalentHero";
```

- [ ] **Step 3: Verify build and lint**

```bash
cd landing && npm run lint && npm run build
```
Expected: Passes. Visit `http://localhost:3001/for-talent` in dev server. Should show hero with golden headline, cursor spotlight, scroll-linked parallax.

- [ ] **Step 4: Commit**

```bash
git add landing/components/talent/TalentHero.tsx landing/components/ForTalentClientPage.tsx
git commit -m "feat: build TalentHero section — accusation headline with cursor spotlight and scroll parallax"
```

---

## Chunk 3: TalentSceneDiscoverability

### Task 5: Build TalentSceneDiscoverability

**Files:**
- Create: `landing/components/talent/TalentSceneDiscoverability.tsx`

This is the most bespoke component. It renders a cinematic search interface that animates through four phases as the user scrolls through a 300vh sticky section. Left column holds the copy; right column holds the animated search UI.

- [ ] **Step 1: Create TalentSceneDiscoverability.tsx**

```tsx
// landing/components/talent/TalentSceneDiscoverability.tsx
"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { FilmGrain, RuleLines, GhostWatermark } from "@/components/talent/shared";

const ease = [0.22, 1, 0.36, 1] as const;

const PHASES = [
  {
    key: "invisible",
    copy: "Most talent aren't in the room. They're in an inbox, waiting for a reply that isn't coming.",
  },
  {
    key: "database",
    copy: "Agencies don't search inboxes. They search databases. If you're not in one, you don't exist.",
  },
  {
    key: "profile",
    copy: "A complete Pholio profile puts you in every search that matches you — measurements, category, location, availability.",
  },
  {
    key: "selected",
    copy: "The judgment still happens in four seconds. The difference is now it goes in your favour.",
  },
];

const FILTER_CHIPS = [
  "Height: 5\u20189\u201d \u2013 6\u20180\u201d",
  "Location: New York",
  "Category: Editorial",
];

// 6 placeholder talent cards (2 rows × 3 columns)
// Positions: [0]=top-left, [1]=top-center, [2]=top-right, [3]=bottom-left, [4]=bottom-center, [5]=bottom-right
// Card at index 4 (bottom-center) is the "selected" card
const CARDS = [0, 1, 2, 3, 4, 5];
const SELECTED_INDEX = 4;

export default function TalentSceneDiscoverability() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.75) setPhase(3);
    else if (v >= 0.5) setPhase(2);
    else if (v >= 0.25) setPhase(1);
    else setPhase(0);
  });

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: prefersReducedMotion ? "auto" : "300vh" }}
    >
      <div
        className={prefersReducedMotion ? "relative" : "sticky top-0 h-screen overflow-hidden"}
        style={{ backgroundColor: "#050505" }}
      >
        {/* ── Atmosphere ── */}
        <FilmGrain />
        <RuleLines />
        <GhostWatermark label="01" />

        {/* Grid overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Central radial glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          aria-hidden="true"
          style={{
            width: 1000,
            height: 800,
            background:
              "radial-gradient(circle, rgba(201,165,90,0.3) 0%, transparent 50%)",
            opacity: 0.08,
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 h-full flex items-center">
          <div className="mx-auto max-w-[1240px] w-full px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[42fr_58fr] gap-10 lg:gap-16 items-center">

              {/* ── LEFT: Copy ── */}
              <div className="flex flex-col items-start">
                {/* Eyebrow */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    style={{
                      width: 24,
                      height: 1,
                      backgroundColor: "#C9A55A",
                      opacity: 0.6,
                    }}
                  />
                  <span
                    className="text-label"
                    style={{ color: "#C9A55A", fontSize: "0.6875rem" }}
                  >
                    Discoverability
                  </span>
                </div>

                {/* Headline */}
                <h2
                  className="font-editorial mb-5"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
                    color: "#FFFFFF",
                    fontWeight: 400,
                    lineHeight: 1.04,
                    letterSpacing: "-0.02em",
                  }}
                >
                  You were
                  <br />
                  <span className="font-editorial-italic" style={{ color: "#C9A55A" }}>
                    invisible.
                  </span>
                </h2>

                {/* Phase copy */}
                <div style={{ minHeight: 80, maxWidth: 400 }}>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={PHASES[phase].key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.45, ease }}
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {PHASES[phase].copy}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Phase dots */}
                <div className="mt-6 flex items-center gap-2">
                  {PHASES.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor:
                          i === phase
                            ? "#C9A55A"
                            : "rgba(255,255,255,0.12)",
                        width: i === phase ? 20 : 6,
                      }}
                      transition={{ duration: 0.4, ease }}
                      style={{ height: 2, borderRadius: 1 }}
                    />
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Search Interface ── */}
              <div className="relative flex flex-col gap-3">

                {/* Search bar */}
                <div
                  style={{
                    width: "100%",
                    height: 48,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(201,165,90,0.12)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    gap: 10,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{ opacity: 0.3, flexShrink: 0 }}
                  >
                    <circle
                      cx="7"
                      cy="7"
                      r="5"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M11 11l2.5 2.5"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: 13,
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    Search talent...
                  </span>
                </div>

                {/* Filter chips — appear on Phase 1+ */}
                <div
                  style={{ display: "flex", gap: 8, flexWrap: "wrap", minHeight: 32 }}
                >
                  <AnimatePresence>
                    {phase >= 1 &&
                      FILTER_CHIPS.map((chip, i) => (
                        <motion.div
                          key={chip}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{
                            duration: 0.3,
                            delay: i * 0.12,
                            ease,
                          }}
                          style={{
                            padding: "4px 12px",
                            borderRadius: 20,
                            backgroundColor: "rgba(201,165,90,0.08)",
                            border: "1px solid rgba(201,165,90,0.2)",
                            color: "#C9A55A",
                            fontSize: 11,
                            fontFamily: "var(--font-sans)",
                            letterSpacing: "0.08em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {chip}
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>

                {/* Results grid — 3 columns × 2 rows */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                  }}
                >
                  {CARDS.map((_, i) => {
                    const isSelected = i === SELECTED_INDEX;
                    const isVisible = phase >= 2;
                    const isDimmed = phase >= 3 && !isSelected;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: isVisible
                            ? isDimmed
                              ? 0.25
                              : 1
                            : 0,
                        }}
                        transition={{
                          duration: 0.4,
                          delay: isVisible ? i * 0.06 : 0,
                          ease,
                        }}
                        style={{
                          height: 200,
                          borderRadius: 8,
                          backgroundColor: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          overflow: "hidden",
                          position: "relative",
                          boxShadow:
                            isSelected && phase >= 3
                              ? "0 0 0 2px rgba(201,165,90,0.8), 0 0 20px 4px rgba(201,165,90,0.25)"
                              : "none",
                          transition: "box-shadow 0.4s ease",
                        }}
                      >
                        {/* Portrait placeholder */}
                        <div
                          style={{
                            height: "68%",
                            backgroundColor: "rgba(255,255,255,0.05)",
                            borderRadius: "4px 4px 0 0",
                          }}
                        />
                        {/* Text bars */}
                        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                          <div
                            style={{
                              height: 7,
                              width: "65%",
                              backgroundColor: "rgba(255,255,255,0.1)",
                              borderRadius: 3,
                            }}
                          />
                          <div
                            style={{
                              height: 6,
                              width: "45%",
                              backgroundColor: "rgba(255,255,255,0.06)",
                              borderRadius: 3,
                            }}
                          />
                        </div>

                        {/* Gold ring pulse (selected card, phase 3) */}
                        {isSelected && phase >= 3 && (
                          <motion.div
                            className="absolute inset-0 rounded-[8px]"
                            animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{
                              border: "2px solid rgba(201,165,90,0.5)",
                              pointerEvents: "none",
                            }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile static layout ── */}
      {/* On mobile (≤768px), the sticky section is suppressed via className;
          the static content below is shown instead.
          This is handled by the responsive grid collapsing the columns
          and the section height being auto on mobile. */}
    </section>
  );
}
```

- [ ] **Step 2: Wire into ForTalentClientPage**

In `ForTalentClientPage.tsx`, add after `<TalentHero />`:
```tsx
<TalentSceneDiscoverability />
```
Add import:
```tsx
import TalentSceneDiscoverability from "@/components/talent/TalentSceneDiscoverability";
```

- [ ] **Step 3: Verify build and lint**

```bash
cd landing && npm run lint && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add landing/components/talent/TalentSceneDiscoverability.tsx landing/components/ForTalentClientPage.tsx
git commit -m "feat: build TalentSceneDiscoverability — scroll-driven search UI with phase transitions"
```

---

## Chunk 4: TalentScenePhotoIntelligence

### Task 6: Build TalentScenePhotoIntelligence

**Files:**
- Create: `landing/components/talent/TalentScenePhotoIntelligence.tsx`

A 4×4 photo grid with a gold AI scan line. As the user scrolls through the `350vh` sticky section, the scan line crosses the grid, 12 photos dim to `opacity: 0.08`, and 4 remain lit. A badge appears at Phase 3.

**Photo grid:** 16 placeholder fashion photos. The implementer must select 16 Unsplash photos that read as a consistent editorial portfolio (same model or consistent aesthetic). The array below uses Unsplash photo IDs — replace with actual selected IDs before launch.

- [ ] **Step 1: Create TalentScenePhotoIntelligence.tsx**

```tsx
// landing/components/talent/TalentScenePhotoIntelligence.tsx
"use client";

import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import { FilmGrain, RuleLines, GhostWatermark, AiBadge } from "@/components/talent/shared";

const ease = [0.22, 1, 0.36, 1] as const;

const PHASES = [
  {
    key: "good-photos",
    copy: "You have good photos. That's not the problem. The problem is you picked them yourself.",
  },
  {
    key: "casting-read",
    copy: "Casting directors read photos differently than you do. They're looking at composition, negative space, eye line, posture. Not which one you look prettiest in.",
  },
  {
    key: "ai-selects",
    copy: "Pholio's photo intelligence reads your gallery the way a casting director does — and selects the four shots that make the case for you.",
  },
  {
    key: "four-that-work",
    copy: "Not the four you'd choose. The four that work.",
  },
];

// 16 photo grid.
// Replace these Unsplash photo IDs with a consistent editorial series.
// Query to use: https://unsplash.com/s/photos/fashion-model-editorial-portrait
// All 16 should read as the same talent's portfolio — same model or consistent aesthetic.
// FORMAT: https://images.unsplash.com/photo-{ID}?w=300&h=400&fit=crop&crop=faces,center&auto=format
const PHOTO_IDS = [
  "1529898329022-1b60a77f8f26", // replace with editorial fashion photo
  "1515886657613-9f3515b0c78f",
  "1488426862026-3ee34a7d66df",
  "1534528741775-53994a69daeb",
  "1485875437342-9b39470b3d95",
  "1509631179647-0177331693ae",
  "1524504388940-b1c1722653e1",
  "1463453091185-61582044d556",
  "1496440788671-ee1e8b25e368",
  "1500648767791-00dcc994a43e",
  "1507003211169-0a1dd7228f2d",
  "1438761681033-6461ffad8d80",
  "1494790108377-be9c29b29330",
  "1552058544-f2b08422138a",
  "1542596768-5d1d21f1cf98",
  "1506794778202-cad84cf45f1d",
];

// Indices of the 4 "AI selected" photos
// Chosen for compositional variety: close crop (0), three-quarter (5), full-body (10), profile (15)
const SELECTED_INDICES = new Set([0, 5, 10, 15]);

export default function TalentScenePhotoIntelligence() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.75) setPhase(3);
    else if (v >= 0.5) setPhase(2);
    else if (v >= 0.22) setPhase(1);
    else setPhase(0);
  });

  // Scan line: traverses grid top→bottom during Phase 1 (scrollProgress 0.22→0.50)
  const scanTop = useTransform(
    scrollYProgress,
    [0.22, 0.50],
    ["0%", "100%"]
  );
  const scanOpacity = useTransform(
    scrollYProgress,
    [0.20, 0.24, 0.46, 0.50],
    [0, 1, 1, 0]
  );

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: prefersReducedMotion ? "auto" : "350vh" }}
    >
      <div
        className={
          prefersReducedMotion ? "relative" : "sticky top-0 h-screen overflow-hidden"
        }
        style={{ backgroundColor: "#050505" }}
      >
        {/* ── Atmosphere ── */}
        <FilmGrain />
        <RuleLines />
        <GhostWatermark label="02" />

        {/* ── Content ── */}
        <div className="relative z-10 h-full flex items-center">
          <div className="mx-auto max-w-[1240px] w-full px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[38fr_62fr] gap-10 lg:gap-16 items-center">

              {/* ── LEFT: Copy ── */}
              <div className="flex flex-col items-start">
                {/* Eyebrow */}
                <div className="mb-4 flex items-center gap-3">
                  <div
                    style={{ width: 24, height: 1, backgroundColor: "#C9A55A", opacity: 0.6 }}
                  />
                  <span className="text-label" style={{ color: "#C9A55A", fontSize: "0.6875rem" }}>
                    Photo Intelligence
                  </span>
                </div>

                {/* Headline */}
                <h2
                  className="font-editorial mb-5"
                  style={{
                    fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
                    color: "#FFFFFF",
                    fontWeight: 400,
                    lineHeight: 1.04,
                    letterSpacing: "-0.02em",
                  }}
                >
                  The wrong photo
                  <br />
                  <span className="font-editorial-italic" style={{ color: "#C9A55A" }}>
                    killed the pitch.
                  </span>
                </h2>

                {/* Phase copy */}
                <div style={{ minHeight: 100, maxWidth: 380 }}>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={PHASES[phase].key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      transition={{ duration: 0.45, ease }}
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {PHASES[phase].copy}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Phase dots */}
                <div className="mt-6 flex items-center gap-2">
                  {PHASES.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor:
                          i === phase ? "#C9A55A" : "rgba(255,255,255,0.12)",
                        width: i === phase ? 20 : 6,
                      }}
                      transition={{ duration: 0.4, ease }}
                      style={{ height: 2, borderRadius: 1 }}
                    />
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Photo grid ── */}
              <div className="relative">

                {/* AI badge — appears at Phase 3 */}
                <div style={{ height: 32, display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 8 }}>
                  <AnimatePresence>
                    {phase >= 3 && (
                      <motion.div
                        key="ai-badge"
                        initial={{ opacity: 0, y: 6, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.92 }}
                        transition={{ duration: 0.35, ease }}
                      >
                        <AiBadge label="AI Selected · 4 of 16" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Photo grid container */}
                <div
                  style={{ position: "relative" }}
                >
                  {/* 4×4 grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 6,
                    }}
                  >
                    {PHOTO_IDS.map((id, i) => {
                      const isSelected = SELECTED_INDICES.has(i);
                      const isDimmed = phase >= 3 && !isSelected;
                      const hasScanEffect = phase === 1;

                      return (
                        <motion.div
                          key={id}
                          animate={{
                            opacity: isDimmed ? 0.08 : 1,
                          }}
                          transition={{ duration: 0.5, delay: isDimmed ? i * 0.02 : 0, ease }}
                          style={{
                            aspectRatio: "3/4",
                            borderRadius: 4,
                            overflow: "hidden",
                            position: "relative",
                            backgroundColor: "rgba(255,255,255,0.06)",
                          }}
                        >
                          {/* Use Unsplash CDN for demo. Replace with actual curated photos before launch. */}
                          <img
                            src={`https://images.unsplash.com/photo-${id}?w=300&h=400&fit=crop&crop=faces,center&auto=format&q=60`}
                            alt=""
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={(e) => {
                              // Fallback if Unsplash URL fails
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* AI scan line — traverses the grid during Phase 1 */}
                  {!prefersReducedMotion && (
                    <motion.div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 2,
                        top: scanTop,
                        opacity: scanOpacity,
                        background:
                          "linear-gradient(90deg, transparent 0%, #C9A55A 25%, #C9A55A 75%, transparent 100%)",
                        boxShadow:
                          "0 0 20px 4px rgba(201,165,90,0.3), 0 0 60px 8px rgba(201,165,90,0.1)",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into ForTalentClientPage**

Add after `<TalentSceneDiscoverability />`:
```tsx
<TalentScenePhotoIntelligence />
```
Add import:
```tsx
import TalentScenePhotoIntelligence from "@/components/talent/TalentScenePhotoIntelligence";
```

- [ ] **Step 3: Verify build and lint**

```bash
cd landing && npm run lint && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add landing/components/talent/TalentScenePhotoIntelligence.tsx landing/components/ForTalentClientPage.tsx
git commit -m "feat: build TalentScenePhotoIntelligence — AI scan line over 4x4 photo grid"
```

---

## Chunk 5: TalentSceneCompCard

### Task 7: Build TalentSceneCompCard

**Files:**
- Create: `landing/components/talent/TalentSceneCompCard.tsx`

This reuses the three existing card components (`VelvetRunway`, `SwissGrid`, `MaisonBlanc`) in a `300vh` sticky section. Three phases: Editorial (VelvetRunway, dark) → Commercial (SwissGrid, white geometric) → Lifestyle (MaisonBlanc, warm cream). Mouse-tracked 3D tilt. SVG callout annotations on Phase 0, "Format Matched" badge on Phases 1–2.

- [ ] **Step 1: Create TalentSceneCompCard.tsx**

```tsx
// landing/components/talent/TalentSceneCompCard.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useSpring,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  VelvetRunway,
  MaisonBlanc,
  SwissGrid,
} from "@/components/compcard";
import { FilmGrain, RuleLines, GhostWatermark, AiBadge } from "@/components/talent/shared";

const ease = [0.22, 1, 0.36, 1] as const;

const PHASES = [
  {
    key: "artifact",
    card: VelvetRunway,
    eyebrow: "Comp Card",
    headline: ["The artifact that", "decides."],
    body: "This is the object that survives the first impression. It gets downloaded, forwarded, handed across a desk. It either builds the case for you — or it doesn\u2019t.",
  },
  {
    key: "commercial",
    card: SwissGrid,
    eyebrow: "Format Selection",
    headline: ["Your market,", "your card."],
    body: "Pholio builds your card from your photos and your market. Editorial talent gets dark and cinematic. Commercial gets clean and direct.",
  },
  {
    key: "lifestyle",
    card: MaisonBlanc,
    eyebrow: "Format Selection",
    headline: ["The format", "finds you."],
    body: "You don\u2019t have to know which one you are \u2014 the platform reads your profile and decides.",
  },
];

export default function TalentSceneCompCard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardAreaRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  // ── Mouse 3D tilt ────────────────────────────────────────────────
  const springCfg = { damping: 25, stiffness: 180 };
  const mx = useSpring(0, springCfg);
  const my = useSpring(0, springCfg);
  const rotX = useTransform(my, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [8, -8]);
  const rotY = useTransform(mx, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [-8, 8]);
  const glareX = useTransform(mx, [-0.5, 0.5], ["110%", "-110%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["110%", "-110%"]);
  const glareOp = useTransform(mx, [-0.5, 0.5], [0, 0.15]);
  const [hovered, setHovered] = useState(false);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardAreaRef.current || prefersReducedMotion) return;
      const r = cardAreaRef.current.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    },
    [mx, my, prefersReducedMotion]
  );
  const onLeave = useCallback(() => {
    setHovered(false);
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  // ── Scroll ───────────────────────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.66) setPhase(2);
    else if (v >= 0.33) setPhase(1);
    else setPhase(0);
  });

  // ── Card kinematics ──────────────────────────────────────────────
  const cardY = useTransform(
    scrollYProgress,
    [0, 0.06, 0.9, 1],
    prefersReducedMotion ? [0, 0, 0, 0] : [60, 0, 0, 80]
  );
  const cardRotZ = useTransform(
    scrollYProgress,
    [0, 0.06, 0.35, 0.66, 1],
    prefersReducedMotion ? [0, 0, 0, 0, 0] : [3, 1.5, -1, 0.5, 3]
  );
  const cardScale = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0.84, 1, 1, 0.85]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.04, 0.92, 1], [0, 1, 1, 0]);

  // ── Atmosphere ───────────────────────────────────────────────────
  const glowOp = useTransform(
    scrollYProgress,
    [0, 0.1, 0.5, 0.9, 1],
    [0.01, 0.1, 0.06, 0.01, 0.01]
  );
  const textY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [20, -20]
  );

  const p = PHASES[phase];
  const CardComponent = p.card;

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: prefersReducedMotion ? "auto" : "300vh" }}
    >
      <div
        className={prefersReducedMotion ? "relative" : "sticky top-0 h-screen overflow-hidden"}
        style={{ backgroundColor: "#050505" }}
      >
        {/* ── Atmosphere ── */}
        <FilmGrain />
        <RuleLines />
        <GhostWatermark label="03" />

        {/* Accent glow — right side */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            right: "5%",
            top: "38%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            filter: "blur(180px)",
            backgroundColor: "#C9A55A",
            opacity: glowOp,
          }}
        />

        {/* Warm depth glow — lower-left */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            left: "-6%",
            bottom: "18%",
            width: 350,
            height: 350,
            borderRadius: "50%",
            filter: "blur(200px)",
            backgroundColor: "rgba(201,165,90,0.02)",
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 h-full flex items-center">
          <div className="mx-auto max-w-[1240px] w-full px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:gap-16 lg:grid-cols-[38fr_62fr] items-center">

              {/* ── LEFT: Narrative ── */}
              <motion.div className="flex flex-col items-start" style={{ y: textY }}>

                {/* Eyebrow */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={p.key + "-e"}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35, ease }}
                    className="mb-3 flex items-center gap-3"
                  >
                    <div style={{ width: 24, height: 1, backgroundColor: "#C9A55A", opacity: 0.6 }} />
                    <span className="text-label" style={{ color: "#C9A55A", fontSize: "0.6875rem" }}>
                      {p.eyebrow}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* Headline */}
                <div style={{ minHeight: 95, marginBottom: "1rem" }}>
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={p.key + "-h"}
                      initial={{ opacity: 0, y: 28 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -18 }}
                      transition={{ duration: 0.5, ease }}
                      className="font-editorial"
                      style={{
                        fontSize: "clamp(2rem, 4vw, 3.2rem)",
                        color: "#FFFFFF",
                        fontWeight: 400,
                        lineHeight: 1.04,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {p.headline[0]}
                      <br />
                      <span className="font-editorial-italic" style={{ color: "#C9A55A" }}>
                        {p.headline[1]}
                      </span>
                    </motion.h2>
                  </AnimatePresence>
                </div>

                {/* Body */}
                <div style={{ minHeight: 72, maxWidth: 370, marginBottom: "2rem" }}>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={p.key + "-p"}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.4, delay: 0.06, ease }}
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "14px",
                        lineHeight: 1.65,
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {p.body}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Phase markers */}
                <div className="flex items-center gap-2">
                  {PHASES.map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        backgroundColor: i === phase ? "#C9A55A" : "rgba(255,255,255,0.12)",
                        width: i === phase ? 20 : 6,
                      }}
                      transition={{ duration: 0.4, ease }}
                      style={{ height: 2, borderRadius: 1 }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* ── RIGHT: Card ── */}
              <div className="relative flex justify-center lg:justify-end">
                <div
                  ref={cardAreaRef}
                  style={{ perspective: 1200, transformStyle: "preserve-3d" }}
                  onMouseMove={onMove}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={onLeave}
                >
                  {/* Format Matched badge — Phases 1 and 2 */}
                  <AnimatePresence>
                    {phase >= 1 && (
                      <motion.div
                        key="format-badge"
                        initial={{ opacity: 0, y: 8, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.92 }}
                        transition={{ duration: 0.35, ease }}
                        className="absolute -top-8 right-0 pointer-events-none z-10"
                      >
                        <AiBadge label="Format Matched" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    style={{
                      y: cardY,
                      rotateZ: cardRotZ,
                      rotateX: rotX,
                      rotateY: rotY,
                      scale: cardScale,
                      opacity: cardOpacity,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Card container */}
                    <div
                      className="relative rounded-[6px] overflow-hidden"
                      style={{
                        width: 400,
                        height: 600,
                        boxShadow:
                          "0 40px 100px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
                        maxWidth: "85vw",
                        willChange: "transform, opacity",
                      }}
                    >
                      {/* Cross-fade between card formats */}
                      {PHASES.map((phaseItem, i) => {
                        const Card = phaseItem.card;
                        const shouldMount = Math.abs(i - phase) <= 1;
                        if (!shouldMount) return <div key={i} className="absolute inset-0" />;
                        return (
                          <motion.div
                            key={i}
                            className="absolute inset-0"
                            initial={false}
                            animate={{ opacity: i === phase ? 1 : 0 }}
                            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                            style={{ pointerEvents: i === phase ? "auto" : "none" }}
                          >
                            <Card />
                          </motion.div>
                        );
                      })}

                      {/* Hover glare */}
                      {hovered && !prefersReducedMotion && (
                        <motion.div
                          className="pointer-events-none absolute inset-0 z-40 rounded-[6px]"
                          style={{
                            background:
                              "radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, transparent 55%)",
                            x: glareX,
                            y: glareY,
                            opacity: glareOp,
                            mixBlendMode: "overlay",
                          }}
                        />
                      )}
                    </div>

                    {/* Phase 0 SVG callout annotations */}
                    <AnimatePresence>
                      {phase === 0 && (
                        <>
                          {/* Hero shot — right side, top 22% */}
                          <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="absolute hidden sm:flex items-center gap-2 pointer-events-none"
                            style={{ top: "22%", right: -6, transform: "translateX(100%)" }}
                          >
                            <svg width="28" height="1">
                              <line x1="0" y1="0.5" x2="28" y2="0.5" stroke="#C9A55A" strokeWidth="1" strokeDasharray="3 2" opacity="0.35" />
                            </svg>
                            <span style={{ fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
                              Hero shot
                            </span>
                          </motion.div>

                          {/* Measurements — left side, top 58% */}
                          <motion.div
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 6 }}
                            transition={{ duration: 0.4, delay: 0.45 }}
                            className="absolute hidden sm:flex items-center gap-2 pointer-events-none flex-row-reverse"
                            style={{ top: "58%", left: -6, transform: "translateX(-100%)" }}
                          >
                            <svg width="28" height="1">
                              <line x1="28" y1="0.5" x2="0" y2="0.5" stroke="#C9A55A" strokeWidth="1" strokeDasharray="3 2" opacity="0.35" />
                            </svg>
                            <span style={{ fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
                              Measurements
                            </span>
                          </motion.div>

                          {/* Agency-ready format — right side, top 80% */}
                          <motion.div
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.4, delay: 0.55 }}
                            className="absolute hidden sm:flex items-center gap-2 pointer-events-none"
                            style={{ top: "80%", right: -6, transform: "translateX(100%)" }}
                          >
                            <svg width="28" height="1">
                              <line x1="0" y1="0.5" x2="28" y2="0.5" stroke="#C9A55A" strokeWidth="1" strokeDasharray="3 2" opacity="0.35" />
                            </svg>
                            <span style={{ fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)" }}>
                              Agency-ready format
                            </span>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into ForTalentClientPage**

Add after `<TalentScenePhotoIntelligence />`:
```tsx
<TalentSceneCompCard />
```
Add import:
```tsx
import TalentSceneCompCard from "@/components/talent/TalentSceneCompCard";
```

- [ ] **Step 3: Verify the compcard index exports include VelvetRunway, MaisonBlanc, SwissGrid**

```bash
cat "/path/to/landing/components/compcard/index.ts"
```
Expected: All three are exported. If not, add the missing exports.

- [ ] **Step 4: Verify build and lint**

```bash
cd landing && npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add landing/components/talent/TalentSceneCompCard.tsx landing/components/ForTalentClientPage.tsx
git commit -m "feat: build TalentSceneCompCard — 3-format card transformation with annotations and Format Matched badge"
```

---

## Chunk 6: TalentCTA + Final Assembly

### Task 8: Build TalentCTA

**Files:**
- Create: `landing/components/talent/TalentCTA.tsx`

Single-viewport CTA. Opens with the speed objection killer in gold uppercase. Headline in serif. Two buttons. Final note.

- [ ] **Step 1: Create TalentCTA.tsx**

```tsx
// landing/components/talent/TalentCTA.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FilmGrain, RuleLines } from "@/components/talent/shared";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ease = [0.22, 1, 0.36, 1] as const;

export default function TalentCTA() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-32 md:py-48 overflow-hidden"
      style={{ backgroundColor: "#050505" }}
    >
      {/* ── Atmosphere ── */}
      <FilmGrain />
      <RuleLines />

      {/* Central ambient glow — slightly larger than FinalCTA to signal arrival */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        aria-hidden="true"
        style={{
          width: 900,
          height: 700,
          background: "radial-gradient(circle, rgba(201,165,90,0.3) 0%, transparent 50%)",
          filter: "blur(280px)",
          opacity: 0.05,
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 lg:px-8 text-center">

        {/* Speed objection killer — the first thing they read */}
        <motion.p
          className="mb-10 block"
          style={{
            color: "#C9A55A",
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(0.625rem, 1.2vw, 0.8125rem)",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, ease }}
        >
          You&apos;re under an hour from a comp card that doesn&apos;t embarrass you.
        </motion.p>

        {/* Headline */}
        <motion.h2
          className="font-editorial mb-12 leading-[1.05]"
          style={{
            fontSize: "clamp(3rem, 7vw, 5rem)",
            color: "#FAF7F2",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease }}
        >
          Stop letting a bad PDF
          <br />
          <span className="font-editorial-italic" style={{ color: "#C9A55A" }}>
            speak for you.
          </span>
        </motion.h2>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          {/* Primary CTA */}
          <a
            href={`${APP_URL}/signup`}
            className="relative inline-flex items-center justify-center text-[11px] font-bold tracking-[0.15em] uppercase px-8 py-4 rounded-full overflow-hidden group transition-transform duration-300 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #C9A55A 0%, #A68644 100%)",
              color: "#050505",
              boxShadow:
                "0 0 40px rgba(200,169,110,0.15), 0 0 80px rgba(200,169,110,0.06)",
              textDecoration: "none",
            }}
          >
            <span className="relative z-10">Build Your Profile</span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "linear-gradient(135deg, #DFBE76 0%, #C9A55A 100%)",
              }}
            />
          </a>

          {/* Secondary CTA */}
          <a
            href="/"
            className="inline-flex items-center justify-center text-[11px] font-medium tracking-[0.15em] uppercase px-8 py-4 rounded-full transition-all duration-300"
            style={{
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.12)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(201,165,90,0.4)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#C9A55A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLAnchorElement).style.color =
                "rgba(255,255,255,0.6)";
            }}
          >
            Back to Home
          </a>
        </motion.div>

        {/* Final note */}
        <motion.p
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "0.75rem",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.02em",
          }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease }}
        >
          Free to start. No agency required.
        </motion.p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire TalentCTA into ForTalentClientPage and finalize assembly**

Replace the entire `ForTalentClientPage.tsx` with the final assembled version:

```tsx
// landing/components/ForTalentClientPage.tsx
"use client";

import SmoothScroll from "@/components/SmoothScroll";
import TalentHero from "@/components/talent/TalentHero";
import TalentSceneDiscoverability from "@/components/talent/TalentSceneDiscoverability";
import TalentScenePhotoIntelligence from "@/components/talent/TalentScenePhotoIntelligence";
import TalentSceneCompCard from "@/components/talent/TalentSceneCompCard";
import TalentCTA from "@/components/talent/TalentCTA";
import MarketingFooter from "@/components/MarketingFooter";

export default function ForTalentClientPage() {
  return (
    <SmoothScroll>
      <main style={{ backgroundColor: "#050505" }}>
        {/* ── HERO — The accusation ───────────────────────────────── */}
        <TalentHero />

        {/* ── DISCOVERABILITY — You were invisible ────────────────── */}
        <TalentSceneDiscoverability />

        {/* ── PHOTO INTELLIGENCE — The wrong photo killed the pitch ── */}
        <TalentScenePhotoIntelligence />

        {/* ── COMP CARD — The artifact that decides ───────────────── */}
        <TalentSceneCompCard />

        {/* ── CTA — Stop letting a bad PDF speak for you ──────────── */}
        <TalentCTA />

        {/* ── FOOTER ──────────────────────────────────────────────── */}
        <MarketingFooter />
      </main>
    </SmoothScroll>
  );
}
```

- [ ] **Step 3: Full build and lint verification**

```bash
cd landing && npm run lint && npm run build
```
Expected: Clean build. Zero TypeScript errors. Zero lint errors.

- [ ] **Step 4: Smoke check in dev server**

```bash
cd landing && npm run dev
```
Visit `http://localhost:3001/for-talent`. Verify:
- [ ] Header hidden on initial load, appears after scrolling past hero
- [ ] Hero shows headline "They decided in four seconds" with gold italic
- [ ] Cursor spotlight tracks mouse
- [ ] Scroll through all 4 sticky sections — copy transitions at correct scroll positions
- [ ] Discoverability: filter chips appear at Phase 1, cards at Phase 2, gold ring at Phase 3
- [ ] Photo Intelligence: scan line traverses at Phase 1, photos dim at Phase 3
- [ ] Comp Card: VelvetRunway at Phase 0 (dark), SwissGrid at Phase 1 (white), MaisonBlanc at Phase 2 (warm)
- [ ] Annotations visible at Comp Card Phase 0, Format Matched badge at Phase 1+
- [ ] CTA section: speed line in gold caps, serif headline, two buttons, final note
- [ ] Footer renders
- [ ] Mobile (resize to 375px): sections stack, no broken scroll pinning, Phase 3 states shown

- [ ] **Step 5: Commit**

```bash
git add landing/components/talent/TalentCTA.tsx landing/components/ForTalentClientPage.tsx
git commit -m "feat: build TalentCTA and assemble complete /for-talent page"
```

---

### Task 9: Update MarketingFooter "For Talent" link

**Files:**
- Modify: `landing/components/MarketingFooter.tsx`

The footer's PLATFORM section currently links "For Talent" to the casting app URL. It should link to the new `/for-talent` marketing page instead.

- [ ] **Step 1: Update the footer link**

In `MarketingFooter.tsx`, find:
```tsx
    { label: "For Talent", href: `${APP_URL}/casting` },
```
Replace with:
```tsx
    { label: "For Talent", href: "/for-talent" },
```

- [ ] **Step 2: Verify build**

```bash
cd landing && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add landing/components/MarketingFooter.tsx
git commit -m "fix: update footer For Talent link to /for-talent marketing page"
```

---

## Post-Launch: Photo Asset Swap

Before the page goes to production, the 16 Unsplash placeholder photo IDs in `TalentScenePhotoIntelligence.tsx` must be replaced with a curated editorial series. The implementer should:

1. Select a single Unsplash model series (search: `fashion model editorial portrait`) that gives at least 16 photos with consistent subject, lighting temperature, and wardrobe.
2. Copy the Unsplash photo IDs into the `PHOTO_IDS` array in `TalentScenePhotoIntelligence.tsx`.
3. Verify the four `SELECTED_INDICES` (0, 5, 10, 15) represent compositionally varied shots (close crop, three-quarter, full-body, profile). Adjust if not.
4. Also swap the model image in `TalentHero.tsx` from `/images/model2-nobg.png` to a new transparent-background PNG at `/images/model3-nobg.png`.
5. Commit with message: `asset: swap talent page photos with final editorial series`.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `landing/app/for-talent/page.tsx` | Create | Next.js route, metadata |
| `landing/components/ForTalentPageWrapper.tsx` | Create | Dynamic import wrapper (no SSR) |
| `landing/components/ForTalentClientPage.tsx` | Create | Section assembly, SmoothScroll |
| `landing/components/talent/shared.tsx` | Create | FilmGrain, RuleLines, GhostWatermark, AiBadge |
| `landing/components/talent/TalentHero.tsx` | Create | Hero section — accusation headline |
| `landing/components/talent/TalentSceneDiscoverability.tsx` | Create | Scroll-driven search UI |
| `landing/components/talent/TalentScenePhotoIntelligence.tsx` | Create | AI scan over photo grid |
| `landing/components/talent/TalentSceneCompCard.tsx` | Create | 3-format card transformation |
| `landing/components/talent/TalentCTA.tsx` | Create | Final CTA with speed line |
| `landing/components/Header.tsx` | Modify | Add FOR TALENT nav link, extend hero suppression |
| `landing/components/MarketingFooter.tsx` | Modify | Fix For Talent href |
