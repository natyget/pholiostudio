# For Talent Page — Design Spec
**Date:** 2026-03-15
**Route:** `/for-talent`
**Status:** Approved (post-review)

---

## Overview

A dedicated marketing page that makes a talent feel like Pholio was built specifically for them — not for agencies, not for the industry, for them. The page has one argument and it runs it cleanly from first scroll to final CTA.

### The Wound

> "Agencies made a decision about you before they finished scrolling. Pholio changes what they see."

The real version: agencies dismissed talent in four seconds based on a Canva PDF. The judgment happened before talent got a chance. Pholio doesn't just improve the presentation — it removes the reason for premature dismissal.

### Tone

**Cold visuals. Warm voice.**

The page looks like the industry — dark, cinematic, editorial. But it speaks like an ally. Specific, honest, on the talent's side. Written as if by someone who has watched a talented model get passed over for a bad PDF and is quietly furious about it on their behalf. Not sympathetic. Not cheerleading. Just precise.

### Audience

Primary: models (fashion, commercial, editorial).
Adjacent: actors, influencers, creative professionals.

### Conversion Goal

Single primary CTA throughout: `Build Your Profile` → `/signup` (or `/onboarding`).

---

## Page Architecture

Five sections in sequence. No branching. No sidebar nav. The argument flows in one direction.

```
Hero → Discoverability → Photo Intelligence → Comp Card → CTA
```

Four full scroll sections. CTA is a single viewport — no scroll driver.

---

## Section 1 — Hero

### Visual

- Full viewport. `#050505` background.
- Cursor-tracked gold spotlight (`rgba(201,165,90,0.6)`, 1000px diameter, spring physics `stiffness: 38, damping: 22`).
- Ambient gold glow pulsing behind the model (keyframe `opacity: 0.07 → 0.13 → 0.07`, 7s loop).
- Film grain overlay (`mix-blend-mode: soft-light`, opacity ~2%).
- Two vertical editorial rule lines (1px, `rgba(201,165,90,0.06)`), left 8% and right 8%.
- Model image: full-height transparent cutout, same treatment as homepage hero (`h-[100vh] w-auto object-contain object-bottom`). Different subject from homepage — this is *her* page. Model faces away from camera, looking off-frame. She is waiting.
  - **Asset dependency (pre-implementation):** A second model cutout PNG is required at `/images/model3-nobg.png`. Do not reuse `/images/model2-nobg.png` — that is the homepage's live asset. If no new asset is ready, use the homepage asset temporarily but rename the reference clearly as `TODO: replace with model3`. Flag for swap before launch. Do not block implementation on this.
- Ghost watermark: none in hero. Starts at Section 2.
- Scroll indicator: animated gold line descending, no text label (same as homepage).
- Header: suppress during hero viewport. In `Header.tsx`, the current suppression logic uses `const isHome = pathname === "/"` in two separate places — one in a `useEffect` and one in a `useMotionValueEvent`. Update **both** to: `const isHeroPage = pathname === "/" || pathname === "/for-talent"`. The `scrollY < window.innerHeight` threshold is compatible with this page's `100vh` sticky hero (inside the `300vh` driver) — no threshold change required.

### Copy

**Headline** (Noto Serif Display, `clamp(3.5rem, 8vw, 7rem)`, white, weight 400, tracking `-0.02em`):
> "They decided in four seconds."

**Body** (Inter, 16px, `rgba(255,255,255,0.6)`, max-width 480px, line-height 1.7):
> "Before you said anything. Before they read your name. Based on a PDF you built in Canva at midnight. Pholio doesn't make you more presentable. It removes the reason they stopped scrolling."

**CTA:** `Build Your Profile` — gold pill button (`background: linear-gradient(135deg, #C9A55A 0%, #A68644 100%)`), rounded-full, `hover:scale-[1.02]`.

**No rotating word wheel. No animated verbs.** The homepage performs. This page speaks.

### Animation

- Entrance: staggered spring fade-up (`stiffness: 62, damping: 20`). Headline first, then body, then CTA.
- Parallax: headline drifts upward as user scrolls away (`useTransform scrollYProgress [0,1] → y [0, -400]`).
- Text opacity fades out between `scrollYProgress 0.3–0.6`.
- Section height: `300vh` (same as homepage hero). Sticky inner viewport.

---

## Section 2 — Discoverability

**Theme:** You were invisible. Now you're not.

### Scroll Driver
`height: 300vh`. Sticky viewport. Four scroll phases (0%, 25%, 50%, 75% of section).

### Visual Concept

An abstracted agency search interface — dark surface, gold filter chips, a talent results grid. Not a literal screenshot of the dashboard. A cinematic rendering of the *act* of being found.

As the user scrolls:
1. Empty search interface — quiet, dark.
2. Filters type in one by one: *Height · Location · Category*.
3. Results grid populates with talent profile cards.
4. One profile receives a gold ring. Not just found. *Selected.*

### Layout Spec

**Search bar:** Centered horizontally, 60% max-width, dark surface `rgba(255,255,255,0.04)`, border `1px solid rgba(201,165,90,0.12)`, border-radius 12px, 48px height. Placeholder text: `Search talent...`. This does not need to be interactive — it is purely illustrative.

**Filter chips:** Horizontal row below search bar. Three chips appearing in sequence on Phase 1:
- `Height: 5'9" – 6'0"`
- `Location: New York`
- `Category: Editorial`

Each chip: `rgba(201,165,90,0.08)` background, `1px solid rgba(201,165,90,0.2)` border, border-radius 20px, Inter 11px, gold text, `letter-spacing: 0.1em`. Animate in with `opacity: 0→1, x: -8→0`, stagger 0.3s between chips.

**Results grid:** 3-column grid, 6 cards visible (2 rows × 3 columns). Each card: 160px × 200px, dark surface, border-radius 8px, `1px solid rgba(255,255,255,0.06)`. Cards contain a silhouette placeholder (blurred grey rectangle for portrait area) + two lines of placeholder text bars beneath. No real identities. On Phase 2, cards fade in card-by-card with `stagger: 0.06s`.

**Selected card (Phase 3):** Center card (or top-left card) gets a gold ring:
- `box-shadow: 0 0 0 2px rgba(201,165,90,0.8), 0 0 20px 4px rgba(201,165,90,0.25)`
- Spring in: `scale 0→1`, `stiffness: 300, damping: 20`
- Followed by a continuous pulse ring: `scale 1→1.4, opacity 0.6→0`, 2s repeat

**Non-selected cards (Phase 3):** `opacity: 0.25` to push focus to selected card.

**Reference:** The filter chip style and card grid can draw from `client/src/routes/agency/DiscoverPage.jsx` for visual consistency — specifically the filter panel and talent card treatments. Do not copy the code directly; adapt the visual language only.

### Beat Structure

| Phase | Scroll % | Copy |
|-------|----------|------|
| 0 | 0–25% | *"Most talent aren't in the room. They're in an inbox, waiting for a reply that isn't coming."* |
| 1 | 25–50% | *"Agencies don't search inboxes. They search databases. If you're not in one, you don't exist."* |
| 2 | 50–75% | *"A complete Pholio profile puts you in every search that matches you — measurements, category, location, availability."* |
| 3 | 75–100% | *"The judgment still happens in four seconds. The difference is now it goes in your favour."* |

### Atmosphere

- Ghost watermark: serif "01" at `opacity: 0.018`, `right: 6%`, vertically centered. Font size: `clamp(18rem, 28vw, 32rem)`, color `#C9A55A`.
- Subtle grid overlay: `rgba(255,255,255,0.02)`, `80px × 80px`.
- Central radial glow: `rgba(201,165,90,0.3)`, `blur(300px)`, `opacity: 0.08`.
- No CTA in this section.

### Animation

- Copy transitions: `AnimatePresence mode="wait"`, `y: 30 → 0, opacity: 0 → 1`, ease `[0.22, 1, 0.36, 1]`.

### Mobile (≤768px)

Static layout. Show Phase 3 state by default (the gold ring on the selected card). No scroll-pinning. Stack copy above the search UI. Total section height: auto.

---

## Section 3 — Photo Intelligence

**Theme:** The wrong photo killed the pitch before you spoke.

### Scroll Driver
`height: 350vh`. Sticky viewport. Four scroll phases.

### Visual Concept

A 4×4 grid of 16 uploaded photos — all good, all plausible editorial/fashion images. The point: *you* cannot tell which four to use. A gold AI scan line passes across the grid. Photos dim one by one — not deleted, set aside. Four remain lit. Badge appears: `AI Selected · 4 of 16`.

### Photo Assets

- **Grid size:** 4 columns × 4 rows = 16 images total.
- **Aspect ratio:** 3:4 portrait (same as a comp card primary photo).
- **Image source:** Use 16 Unsplash photos from the editorial fashion category. Query: `fashion model editorial portrait`. All photos should read as the same talent to support the "your gallery" narrative — select a single Unsplash model/series, or use consistent styling (dark backgrounds, neutral wardrobe) so the grid reads as one person's portfolio rather than a stock mosaic.
- **Practical fallback:** If a consistent single-subject series is unavailable, use a warm-toned editorial aesthetic across all 16 and ensure no two photos have markedly different lighting temperature. The emotional payoff of "four remain lit" requires the dismissed photos to look *good* — not like obvious rejects.
- **Selected 4:** Top-left, top-right, third-row-second-from-left, fourth-row-rightmost (i.e., the four that look most compositionally varied — a close crop, a three-quarter, a full-body, a profile shot).

### Beat Structure

| Phase | Scroll % | Copy |
|-------|----------|------|
| 0 | 0–22% | *"You have good photos. That's not the problem. The problem is you picked them yourself."* |
| 1 | 22–50% | *"Casting directors read photos differently than you do. They're looking at composition, negative space, eye line, posture. Not which one you look prettiest in."* |
| 2 | 50–75% | *"Pholio's photo intelligence reads your gallery the way a casting director does — and selects the four shots that make the case for you."* |
| 3 | 75–100% | *"Not the four you'd choose. The four that work."* |

**Tone note:** Phase 0 is the most important line on the page. "You have good photos. That's not the problem." It validates before it corrects. The page never implies talent did something wrong. The *process* was wrong.

### Scan Line Spec

Reuses the exact mechanism from `SceneCompCard` (homepage). Extract to a shared utility or duplicate:

```css
height: 2px;
background: linear-gradient(90deg, transparent 0%, #C9A55A 25%, #C9A55A 75%, transparent 100%);
box-shadow: 0 0 20px 4px rgba(201,165,90,0.3), 0 0 60px 8px rgba(201,165,90,0.1);
```

- Animates `top`: `0% → 100%` during Phase 1 (`scrollYProgress 0.22 → 0.50` of the `350vh` section).
- Note: SceneCompCard uses `0.22 → 0.45` in a `400vh` section. The timing feel will be slightly faster here due to the shorter total height. If the feel is wrong during implementation, adjust the end value to `0.48`.
- Opacity: fades in at 0.22, fades out at 0.50.

### Phase 3 Transition

The 12 dismissed photos animate to `opacity: 0.08` (not invisible — they persist as a ghost field, making the selected 4 feel pulled from context rather than alone). The four selected photos do *not* rearrange into a 2×2 — they stay in their grid positions and simply remain fully lit. A floating badge appears top-right of the grid:

```
AI Selected · 4 of 16
```

Pill style: `rgba(201,165,90,0.08)` background, `1px solid rgba(201,165,90,0.2)`, Inter 9px, uppercase, `letter-spacing: 0.08em`, gold text. Same treatment as SceneCompCard's AI badge.

> **Design decision change from brainstorm:** Do not rearrange the four photos into a 2×2. Keeping them in their original grid positions is more powerful — it shows the AI found signal within your actual chaos, not that it rebuilt a clean version. The contrast between the dim field and the four lit positions IS the demonstration.

### Atmosphere

- Ghost watermark: serif "02", same spec as "01" in Section 2.
- Film grain stays.
- No CTA in this section.

### Mobile (≤768px)

Static layout. Show Phase 3 state by default: 4 photos lit, 12 dimmed. 2-column grid instead of 4-column. Copy above grid. No scroll-pinning.

---

## Section 4 — Comp Card

**Theme:** The artifact that either builds the case for you — or doesn't.

### Scroll Driver
`height: 300vh`. Sticky viewport. Three scroll phases.

### Visual Concept

A single comp card — large, centered, 3D mouse-tilt (same mechanics as `SceneCompCard`). Unlike the homepage which cycles through four different card designs to show variety, this section shows *one* card *transforming*. Same model, same photos. The card shifts between three market formats as the user scrolls. The transformation signals that Pholio reads your profile and chooses the format — you don't have to know which one you are.

### Card Component Mapping

The four existing components are: `EditorialNoir` (white/light, Georgia serif), `MaisonBlanc` (warm cream, terracotta), `SwissGrid` (pure white, geometric, monospaced), `VelvetRunway` (black, full-bleed cinematic).

| Phase | Format | Component | Visual Character |
|-------|--------|-----------|-----------------|
| 0 | Editorial | `VelvetRunway` | Black, full-bleed, cinematic — Saint Laurent/Tom Ford aesthetic |
| 1 | Commercial | `SwissGrid` | Pure white, geometric, data-forward — Helmut Lang/Vignelli |
| 2 | Lifestyle | `MaisonBlanc` | Warm cream, terracotta accent — relaxed commercial warmth |

`EditorialNoir` is excluded from this section. Its light background would read as a second "commercial" card and undermine the dark → clean → warm narrative arc.

### Beat Structure

| Phase | Scroll % | Card | Copy |
|-------|----------|------|------|
| 0 | 0–33% | `VelvetRunway` | *"This is the object that survives the first impression. It gets downloaded, forwarded, handed across a desk. It either builds the case for you — or it doesn't."* |
| 1 | 33–66% | `SwissGrid` | *"Pholio builds your card from your photos and your market. Editorial talent gets dark and cinematic. Commercial gets clean and direct."* |
| 2 | 66–100% | `MaisonBlanc` | *"The format finds you. You don't have to know which one you are — the platform reads your profile and decides."* |

### Card Annotations

**Phase 0 — Three SVG dashed callout lines:**
- `Hero shot` — right side, `top: 22%`. Callout line extends right (`-right-6`).
- `Measurements` — left side, `top: 58%`. Callout line extends left (`-left-6`).
- `Agency-ready format` — right side, `top: 80%`. Callout line extends right (`-right-6`). Same SVG dash pattern as the other two: `stroke="#C9A55A" strokeDasharray="3 2" opacity="0.35"`.

All three use `AnimatePresence` — enter with `opacity: 0, x: ±6 → 1, 0`, exit with reverse. Delay 0.3s (Hero shot), 0.45s (Measurements), 0.55s (Agency-ready format).

**Phase 1 — Annotations exit. Single badge appears:**

```
Format Matched
```

Pill style: same as AI Selected badge in Section 3. Text: `Format Matched`. This reflects what the platform actually did at Phase 1 — it read the profile and selected a format. Do not use "AI Curated" here; that label belongs to photo selection in Section 3.

**Phase 2 — Badge persists, copy updates. No new annotations.**

### Card Shadow

Heavier than SceneCompCard — this card is the thing, not a demo:
```css
box-shadow: 0 40px 100px -15px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04);
```

### Atmosphere

- Ghost watermark: serif "03", same spec as "01" and "02".
- Accent glow: right side, `rgba(201,165,90,1)` base color, `blur(180px)`, scroll-linked opacity: `useTransform(scrollYProgress, [0, 0.1, 0.5, 0.9, 1], [0.01, 0.1, 0.06, 0.01, 0.01])`. Matches the 5-keyframe pattern from `SceneCompCard.tsx` line 134.
- Warm depth glow: lower-left, `rgba(201,165,90,0.02)`, `blur(200px)`.
- No CTA in this section.

### Mobile (≤768px)

Static layout. Show Phase 0 state (VelvetRunway card). Stack copy above card. No 3D tilt (disable mouse tracking on touch devices). No scroll-pinning.

---

## Section 5 — CTA

**No scroll driver.** Single viewport. The argument is complete. This section does not ask for more time.

### Opening Line

```
YOU'RE UNDER AN HOUR FROM A COMP CARD THAT DOESN'T EMBARRASS YOU.
```

(Inter, 11–13px, `#C9A55A`, `letter-spacing: 0.18em`, uppercase, centered. This is the speed point — an objection killer, not a feature. No elaboration follows it.)

> **Note:** The specific "45 minutes" claim was removed and replaced with "under an hour" — a directionally true statement that avoids a falsifiable time commitment at the moment of conversion.

### Headline

(Noto Serif Display, `clamp(3rem, 7vw, 5rem)`, `#FAF7F2`, weight 400):
> "Stop letting a bad PDF speak for you."

**No subheading.** The page already did the work.

### Buttons

- **Primary:** `Build Your Profile` → `${APP_URL}/signup`. Gold pill. `box-shadow: 0 0 40px rgba(200,169,110,0.15), 0 0 80px rgba(200,169,110,0.06)`.
- **Secondary:** `Back to Home` → `/`. Ghost/outline style. This is a soft exit, not a competing CTA. Linking to `/` is correct — it takes the user to the full product overview if they want more context before committing. Do not link to `#features` (maps to homepage's `SceneCompCard`, which is general-audience framing and breaks the talent-specific register).

### Final Note

(Inter, 12px, `rgba(255,255,255,0.3)`, centered, below buttons):
> "Free to start. No agency required."

Removes cost friction and signals autonomy. Talent on this page have been burned by gatekeepers. This is the right final note.

### Atmosphere

- Central ambient glow: `rgba(201,165,90,0.3)`, `blur(280px)`, `opacity: 0.05`. Slightly larger radius than homepage FinalCTA — this is an arrival, not a transit point.
- Film grain stays. Editorial rule lines stay.
- Ghost watermark: none. The page is done speaking.

---

## Shared Visual Language

All sections inherit these treatments:

| Element | Spec |
|---------|------|
| Background | `#050505` throughout |
| Film grain | SVG fractalNoise, `mix-blend-mode: soft-light`, `opacity: 0.02` |
| Rule lines | 1px vertical, `rgba(201,165,90,0.06)`, left 8% / right 8% |
| Brand gold | `#C9A55A` |
| Serif font | Noto Serif Display (`--font-serif`) |
| Sans font | Inter (`--font-sans`) |
| Standard ease | `[0.22, 1, 0.36, 1]` |
| Spring (entrances) | `stiffness: 62, damping: 20` |
| Spring (cursor) | `stiffness: 38, damping: 22` |
| Copy transitions | `AnimatePresence mode="wait"`, y-offset `30→0` |

---

## Navigation Integration

- Add `For Talent` link to `landing/components/Header.tsx` nav.
- Route: `landing/app/for-talent/page.tsx`
- Client component wrapper: `landing/components/ForTalentClientPage.tsx`
- Scene components: `landing/components/talent/`
  - `TalentHero.tsx`
  - `TalentSceneDiscoverability.tsx`
  - `TalentScenePhotoIntelligence.tsx`
  - `TalentSceneCompCard.tsx`
  - `TalentCTA.tsx`

---

## Mobile Strategy

Total desktop scroll height: `300vh (hero) + 300vh + 350vh + 300vh = 1,250vh` before the CTA. On mobile, this creates ~11,000px of pinned scroll — problematic on iOS Safari due to `position: sticky` edge cases and poor fit for a primary-mobile audience (models aged 18–28).

**Mobile breakpoint: `max-width: 768px`**

All four scroll-driven sections collapse to static layouts. Each section:
- Removes `position: sticky` and the tall scroll driver.
- Displays the terminal phase state by default (Phase 3 for Sections 2 and 3, Phase 0 for Section 4).
- Stacks copy above the visual element.
- Section height: `auto` with `padding: 80px 24px`.

The CTA section is unaffected — it is already a single viewport with no scroll driver.

Implementation pattern: wrap all scroll-driven motion in `useReducedMotion()` check *and* a `isMobile` check. The `useReducedMotion` hook already exists in `SceneCompCard` as a pattern to follow.

---

## Pre-Implementation Dependencies

| Dependency | Blocker? | Notes |
|-----------|---------|-------|
| `/images/model3-nobg.png` (new model cutout, transparent bg) | Soft | Do NOT reuse `/images/model2-nobg.png` (homepage live asset). Temporary placeholder OK but must be named distinctly. Swap before launch. |
| 16 Unsplash fashion photos (consistent subject/style) | Hard | Required for Section 3 emotional payoff; must be selected before Section 3 is built |

---

## What This Page Does Not Do

- **No agency network claims.** Pholio is a discovery platform, not a talent agency. Geographic reach is implied, not stated.
- **No testimonials section.** The argument doesn't need social proof. Testimonials interrupt momentum.
- **No pricing.** Speed and cost objections are handled in the CTA. A pricing section mid-page introduces friction before the argument closes.
- **No feature grid / bullet list.** Every section earns its place with a specific argument. No feature dump.
