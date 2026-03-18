# For Talent Page v2 — Design Spec

**Date:** 2026-03-17
**Status:** Approved
**Replaces:** `2026-03-15-for-talent-page-design.md`

---

## Goal

Redesign the `/for-talent` marketing page to convert talent to Pholio signups. The page must feel categorically different from the main landing page (`/`) while sharing the same typography and color palette. Each chapter must have a completely different visual grammar — no two sections share a structural pattern.

## Narrative Arc

**Aspiration → Problem → Intelligence → Identity → Proof → Action**

The page makes a single argument: *The industry dismissed you before you had a chance to show what you're worth. Pholio changes what they see, how they find you, and what you leave in their hands.*

## Design Constraints

- **Typography:** Noto Serif Display (headings), Inter (body) — same as all Pholio pages
- **Colors:** `#050505` dark, `#FAF8F5` cream, `#C9A55A` gold, white — same palette
- **Rule:** No two chapters share the same layout structure, background, or motion grammar
- **Landing page delta:** `/for-talent` must feel unmistakably different from `/`. The landing page is all-dark cinematic with side-by-side columns. This page uses alternating backgrounds and each section has its own structural DNA.
- **Mobile:** All scroll-driven sections collapse to static Phase 3 state at ≤768px

---

## Page Architecture

| # | Chapter | Grammar | Background | Height |
|---|---------|---------|-----------|--------|
| 1 | Hero | Kinetic typography only | Cream `#FAF8F5` | 100vh |
| 2 | Discoverability | Scroll-scene: UI rises from below | Dark `#050505` | 350vh |
| 3 | Photo Intelligence | Scroll-scene: AI scan cinema | Dark `#050505` | 350vh |
| 4 | Comp Card | Scroll-scene: object study | Dark `#050505` | 350vh |
| 5 | Pholio ID / Apple Wallet | Clinical product reveal | White `#FFFFFF` | 100vh |
| 6 | Analytics | Numbers-first marquee | Dark `#050505` | 100vh |
| 7 | CTA | Minimal single action | Cream `#FAF8F5` | 100vh |
| — | MarketingFooter | — | Cream `#FAF8F5` | — |

---

## Chapter 1 — Hero: Kinetic Typography

### Visual Grammar
Pure typographic statement. No model image, no cursor spotlight, no UI chrome. Text fills the frame. Cream (`#FAF8F5`) background — the visual shock of entering a light page after the dark footer of other Pholio pages.

### Layout
- Section height: `100vh`, `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content: center`
- **No `useScroll`, no `useTransform`, no `useSpring` cursor tracking, no scroll driver** — this is a fully static section
- Remove: the `180vh` height driver, `sectionRef`/`useScroll`/`useTransform`, the cursor spotlight `mousemove` listener, `useSpring` for `mx`/`my`/`cursorX`/`cursorY`, the model image, `FilmGrain`, `GhostWatermark`, `RuleLines`, the `ctaVisible` scroll guard
- The headline copy `"They decided / in four seconds."` is **intentionally kept** from the previous hero — same words, completely different visual grammar (cream background, no model, pure type on light)
- No `FilmGrain`, no `GhostWatermark`, no `RuleLines`

### Content

**Headline (top block):**
```
They decided
in four seconds.
```
- Font: Noto Serif Display, weight 400
- Size: `clamp(3.8rem, 10vw, 9rem)`
- Color: `#1A1815` (near-black on cream)
- Line height: 0.94
- Letter spacing: `-0.03em`
- Entrance: staggered lines, each `opacity: 0→1, y: 24→0`, delay 0.1s per line

**Sub-headline (below, italic):**
```
Make those seconds count.
```
- Font: Noto Serif Display, weight 400, italic
- Size: `clamp(1.6rem, 4vw, 3.2rem)`
- Color: `#C9A55A`
- Entrance: `opacity: 0→1, y: 16→0`, delay 0.35s after headline

**CTA (below sub-headline, 40px margin-top):**
- Single pill button: "Build your profile — free"
- Background: `#1A1815`, color: `#FAF8F5`
- Href: `${APP_URL}/signup`
- Entrance: `opacity: 0→1`, delay 0.55s

**Scroll indicator (bottom-center, absolute):**
- Small vertical line + "scroll" text in uppercase, 10px, `#C9A55A` at 40% opacity
- `animate: y [0, 6, 0]` loop, 2s duration

### Animation
All entrance animations triggered by `mounted` state (same pattern as TalentHero). `useReducedMotion` guard: if true, skip all entrance animation transforms (opacity still animates).

---

## Chapter 2 — Discoverability: Scroll-Scene

### Visual Grammar
350vh scroll driver. Headline fills screen at Phase 0, shrinks as agency search UI rises from below via `useTransform`. Dark `#050505`. Same implementation as current `TalentSceneDiscoverability.tsx` — **no structural changes needed**.

### Copy Changes Only
- Eyebrow: "Discoverability" (keep)
- Headline: "You were invisible." (keep)
- Phase copy updates:
  - Phase 0: "Most talent aren't in the room. They're in an inbox, waiting for a reply that isn't coming."
  - Phase 1: "Agencies don't search inboxes. They search databases."
  - Phase 2: "A complete profile puts you in every search that matches you."
  - Phase 3: "The judgment still happens in four seconds. Now it goes in your favour."

### File
`landing/components/talent/TalentSceneDiscoverability.tsx` — no structural changes

---

## Chapter 3 — Photo Intelligence: AI Scan Cinema

### Visual Grammar
350vh scroll driver. 4×4 photo grid with AI scan line sweeping top-to-bottom. 4 photos selected (light), 12 dimmed to near-invisible. Dark `#050505`. Same implementation as current `TalentScenePhotoIntelligence.tsx` — **no structural changes needed**.

### File
`landing/components/talent/TalentScenePhotoIntelligence.tsx` — no structural changes

---

## Chapter 4 — Comp Card: Object Study

### Visual Grammar
350vh scroll driver. Single comp card centered, 3D mouse-tilt, hover glare, cycles through three format variants (VelvetRunway → SwissGrid → MaisonBlanc). Dark `#050505`. Same implementation as current `TalentSceneCompCard.tsx` — **no structural changes needed**.

### File
`landing/components/talent/TalentSceneCompCard.tsx` — no structural changes

---

## Chapter 5 — Pholio ID / Apple Wallet: Clinical Product Reveal

### Visual Grammar
**The most visually distinct section on the page.** Pure white (`#FFFFFF`) background. Apple product page aesthetic. No film grain, no ghost watermarks, no gold glow, no dark atmosphere. Clinical, still, minimal. The starkness is the statement.

This is a **concept preview** — the feature is coming, not yet live.

### Layout
- Height: `100vh`, `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content: center`
- No scroll driver — static single viewport
- `overflow: hidden` to contain phone entrance

### Content

**Eyebrow (top, centered):**
```
PHOLIO ID
```
- Font: Inter, weight 600
- Size: `0.6875rem`
- Letter spacing: `0.2em`
- Color: `#C9A55A`
- Margin bottom: `1.5rem`

**Headline (centered):**
```
Your identity,
always in your pocket.
```
- Font: Noto Serif Display, weight 400
- Size: `clamp(2.8rem, 6vw, 5.2rem)`
- Color: `#1A1815`
- Line height: 1.05
- Letter spacing: `-0.025em`
- Margin bottom: `2.5rem`

**iPhone Frame (centered):**
- Outer frame: `width: 290px`, `height: 590px` — proportions match iPhone 14 screen ratio (~1:2.03 after insets)
- CSS-drawn phone frame structure:
  ```
  <div> // outer shell: border-radius: 46px, border: 11px solid #1A1815, background: #000, position: relative, overflow: hidden
    <div> // notch bar: height: 28px, background: #000, display: flex, align-items: center, justify-content: center
      <div> // pill notch: width: 80px, height: 24px, background: #1A1815, border-radius: 12px
    </div>
    <div> // screen area: flex: 1, overflow: hidden, background: #f2f2f7 (iOS light gray)
      // Wallet content here
    </div>
    <div> // home indicator: height: 20px, background: #000, display: flex, align-items: center, justify-content: center
      <div> // bar: width: 80px, height: 4px, background: rgba(255,255,255,0.35), border-radius: 2px
    </div>
  </div>
  ```
- No side buttons drawn — frame is front-face only

**Inside the screen area — iOS Wallet UI simulation:**
- Top status bar: `height: 20px`, `background: #f2f2f7`, has small left text "9:41" (Inter 600, 10px, #1A1815) and right icons dots (simplified)
- Wallet header: `height: 36px`, `padding: 0 16px`, `display: flex`, `align-items: center`, `justify-content: space-between`. Left: "Wallet" in SF-style Inter 700, 17px, #1A1815. Right: "+" circle icon placeholder (18px, #007AFF blue for iOS authenticity)
- Primary pass (centered in screen, margin: 8px 12px):

**Pholio Pass card (the primary Wallet pass):**
- `border-radius: 16px`, `overflow: hidden`, `box-shadow: 0 8px 24px rgba(0,0,0,0.18)`
- Header bar: `height: 56px`, background: `linear-gradient(135deg, #C9A55A 0%, #A6845C 100%)`, `padding: 0 14px`, `display: flex`, `align-items: center`, `justify-content: space-between`
  - Left: "PHOLIO" wordmark — Inter 700, 13px, white, letter-spacing 0.2em
  - Right: circular talent thumbnail, `width: 36px`, `height: 36px`, `border-radius: 50%`, `border: 2px solid rgba(255,255,255,0.4)`, `object-fit: cover`. Use a gray placeholder background if no image.
- Card body: white background, `padding: 12px 14px`
  - Name row: "Sofia M." — Inter 600, 15px, `#1A1815`
  - Market row: "Editorial · New York" — Inter 400, 11px, `#6B6560`
  - Measurements: "5'10\" · Size 2 · Brown/Brown" — Inter 400, 10px, `#6B6560` (warm gray — **not** `#94a3b8`)
  - Divider: `1px solid #f1f5f9`, `margin: 10px 0`
  - QR code: `64×64px` SVG QR placeholder (black squares on white), centered with `margin: 0 auto`
  - QR caption: "Scan to view portfolio" — Inter 400, 9px, `#94a3b8`, centered
  - Portfolio URL: "pholio.studio/sofia-m" — Inter 500, 10px, `#C9A55A`, centered, margin-top 4px

**Two peeking passes below (iOS Wallet stack simulation):**
- Two divs, each: `height: 20px`, `border-radius: 16px`, `margin-top: -10px`, staggered inset (`margin: 0 8px` / `margin: 0 16px`)
- Colors: `rgba(201,165,90,0.4)` and `rgba(201,165,90,0.2)` — gives depth illusion without detail

**Add to Wallet button (below iPhone frame, 28px margin-top):**
- **Do NOT use Apple's official "Add to Apple Wallet" trademark badge** — Apple's usage terms require it to link to a functional `.pkpass`. Since this is a concept preview, use a custom-designed button that visually resembles the Apple badge without being the official SVG asset.
- Custom button spec: `height: 44px`, `width: 165px`, `border-radius: 8px`, `background: #000`, `display: flex`, `align-items: center`, `justify-content: center`, `gap: 8px`
  - Left: Apple logo SVG icon (the bitten-apple, white, 18px — this is a generic icon, not trademarked)
  - Text block: two lines — "Add to" in Inter 400, 10px, white; "Apple Wallet" in Inter 600, 15px, white
- `cursor: pointer`, `opacity: 0.85`, hover `opacity: 1`, `transition: opacity 0.2s`
- `href="#"` wrapping `<a>` — no-op for concept preview

**Coming soon note (below badge, 12px margin-top):**
```
Coming soon. Sign up to be first.
```
- Font: Inter 400
- Size: `0.75rem`
- Color: `#94a3b8`

### Animation
On scroll-into-view (`useInView(ref, { once: true, amount: 0.3 })` — note: Framer Motion uses `amount`, not `threshold`):
- iPhone frame: `y: 48→0, opacity: 0→1`, spring `stiffness: 80, damping: 20`
- Headline: `y: 20→0, opacity: 0→1`, duration 0.6s, delay 0.1s
- Wallet badge: `opacity: 0→1`, delay 0.5s

`useReducedMotion` guard: skip transforms, opacity-only.

### File
**New file:** `landing/components/talent/TalentSceneWallet.tsx`

---

## Chapter 6 — Analytics: Numbers-First Marquee

### Visual Grammar
Dark `#050505`. No scroll driver, no sticky mechanic, no UI rising. Just massive numbers stated as facts. Completely different from the three scroll-scenes. A horizontal auto-scrolling marquee of stat blocks, with one mini proof element below.

### Layout
- Height: `100vh`, centered vertically
- No `FilmGrain` (breaks the grammar differentiation)
- `GhostWatermark label="04"` — the watermark labels track **dark scroll-scene index** (01/02/03 are the three scroll-scenes; 04 is this fourth dark scene). They are scene-index labels, not page-section-index labels.

### Content

**Eyebrow (top, centered):**
```
WHO'S LOOKING
```
- Font: Inter 600
- Size: `0.6875rem`
- Letter spacing: `0.2em`
- Color: `#C9A55A`

**Headline (centered):**
```
Agencies are searching.
The question is whether they find you.
```
- Font: Noto Serif Display, weight 400
- Size: `clamp(2rem, 4.5vw, 3.8rem)`
- Color: white
- Line height: 1.1
- Letter spacing: `-0.025em`
- Margin bottom: `3rem`

**Stat marquee (full-width, auto-scrolling, no user interaction):**
Six stat blocks, duplicated for seamless loop. CSS `animation: marquee 28s linear infinite`.

Stat block structure (each):
```
[ NUMBER ]
[ Label line 1 ]
[ Label line 2 ]
```

Six stats:
1. `23` / "Agency scouts" / "searched this week"
2. `4.2s` / "Average time casting directors" / "spend on a profile"
3. `78%` / "Of viewed profiles" / "get saved to boards"
4. `3×` / "More callbacks with" / "a complete comp card"
5. `<1hr` / "Time to build" / "your full profile"
6. `140+` / "Agencies actively" / "searching on Pholio"

Number style: Noto Serif Display, `clamp(3rem, 7vw, 6rem)`, `#C9A55A`, weight 400
Label style: Inter 400, `0.8rem`, `rgba(255,255,255,0.45)`, line-height 1.5
Each stat block: `flex-shrink: 0`, width `200px`, `padding: 0 40px`, border-right `1px solid rgba(255,255,255,0.06)`

**Mini proof element (below marquee, 48px margin-top, centered):**
A single notification-style card:
- Background: `rgba(255,255,255,0.04)`, border: `1px solid rgba(255,255,255,0.08)`, border-radius `12px`
- Padding: `14px 20px`, `display: inline-flex`, `align-items: center`, `gap: 12px`
- Left: eye icon (Lucide `Eye`, 16px, `#C9A55A`)
- Text: "Wilhelmina Models viewed your profile · 3 hours ago" — Inter 400, 13px, `rgba(255,255,255,0.6)`
- Entrance: `useInView`, `opacity: 0→1, y: 8→0`, delay 0.2s

### Marquee Container Structure

The marquee requires a specific two-layer structure for seamless looping:

```tsx
// Outer container — clips overflow
<div style={{ width: "100%", overflow: "hidden" }}>
  {/* Inner track — holds TWO copies of the six blocks side by side */}
  <div
    style={{
      display: "flex",
      width: "max-content",
      animation: "marquee 28s linear infinite",
      // animation-play-state: paused when prefersReducedMotion
    }}
  >
    {/* Copy 1 */}
    {STATS.map(stat => <StatBlock key={`a-${stat.number}`} {...stat} />)}
    {/* Copy 2 — identical, creates seamless loop */}
    {STATS.map(stat => <StatBlock key={`b-${stat.number}`} {...stat} />)}
  </div>
</div>
```

CSS keyframe (add via `<style>` tag or global CSS):
```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); } /* -50% of max-content = one full set */
}
```

### Animation
- Marquee: CSS `animation: marquee 28s linear infinite` on the inner track div
- Headline + eyebrow: `useInView(ref, { once: true, amount: 0.3 })`, `opacity: 0→1, y: 16→0`
- Notification card: `useInView`, `opacity: 0→1, y: 8→0`, delay 0.2s
- `useReducedMotion`: set `animation-play-state: paused` on the marquee track, skip y transforms

### File
**New file:** `landing/components/talent/TalentSceneAnalytics.tsx`

---

## Chapter 7 — CTA: Minimal Single Action

### Visual Grammar
Cream (`#FAF8F5`) background — bookends the hero's cream. No card, no dark panel, no cinematic effects. One centered block, nothing else.

### Layout
- Height: `100vh`, centered
- No scroll driver
- No `FilmGrain`, `GhostWatermark`, or dark elements

### Content

**Eyebrow:**
```
YOUR NEXT CHAPTER
```
- Inter 600, `0.6875rem`, `#C9A55A`, letter-spacing `0.2em`

**Headline:**
```
Start for free.
No agency required.
```
- Noto Serif Display, weight 400
- Size: `clamp(3rem, 7vw, 6.5rem)`
- Color: `#1A1815`
- Line height: 0.96
- Letter spacing: `-0.03em`

**CTA button:**
- "Build Your Profile" — background `#1A1815`, color `#FAF8F5`, pill shape
- Font: Inter 600, `0.8125rem`, letter-spacing `0.08em`, uppercase
- Padding: `16px 40px`
- Href: `${APP_URL}/signup`
- Hover: subtle scale `1.02`

**Fine print (below button, 16px margin-top):**
```
Takes less than an hour.
```
- Inter 400, `0.75rem`, `#94a3b8`

### Animation
`useInView(ref, { once: true, amount: 0.3 })`. Headline staggered lines `y: 20→0, opacity: 0→1`. Button `opacity: 0→1`, delay 0.3s.
`useReducedMotion` guard: skip y transforms.

### File
`landing/components/talent/TalentCTA.tsx` — **full rewrite**
- Current file has: dark `#050505` background, "Stop letting a bad PDF speak for you." headline, two buttons (primary + secondary "Back to Home")
- New file: cream `#FAF8F5` background, "Start for free. / No agency required." headline, **one button only** (secondary "Back to Home" link is deliberately removed)

---

## Assembly: ForTalentClientPage.tsx

```tsx
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
      <main>
        <TalentHero />
        <TalentSceneDiscoverability />
        <TalentScenePhotoIntelligence />
        <TalentSceneCompCard />
        <TalentSceneWallet />
        <TalentSceneAnalytics />
        <TalentCTA />
        <MarketingFooter />
      </main>
    </SmoothScroll>
  );
}
```

Note: `main` gets `style={{ backgroundColor: "#FAF8F5" }}` (cream — matches chapter 1 and 7). This prevents paint flashes between sections if any section background fails to render. Each individual section still owns its own background via inline `style` or `className`.

---

## Files Changed

| File | Action |
|------|--------|
| `landing/components/talent/TalentHero.tsx` | Full rewrite — cream bg, kinetic type, no model |
| `landing/components/talent/TalentSceneDiscoverability.tsx` | Copy update only |
| `landing/components/talent/TalentScenePhotoIntelligence.tsx` | No changes |
| `landing/components/talent/TalentSceneCompCard.tsx` | No changes |
| `landing/components/talent/TalentSceneWallet.tsx` | **New file** |
| `landing/components/talent/TalentSceneAnalytics.tsx` | **New file** |
| `landing/components/talent/TalentCTA.tsx` | Full rewrite — cream bg, minimal |
| `landing/components/ForTalentClientPage.tsx` | Add 2 new imports, add cream `#FAF8F5` background to `<main>` |

---

## Out of Scope

- Backend integration for Wallet pass generation (`.pkpass`) — this is a frontend-only concept preview
- Real analytics data — stats are illustrative copy
- Mobile-specific breakpoint CSS — same pattern as existing sections (≤768px collapses to static)
- Testimonials, pricing, agency network claims — deliberately excluded; page is focused on talent conversion
