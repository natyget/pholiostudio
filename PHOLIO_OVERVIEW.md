# Pholio — Project Overview

> *"We believe your career should be defined by your face, not your formatting."*

Pholio is a premium talent management platform for the modelling and fashion industry. It connects talent (models) with agencies through a curated, AI-assisted experience built on editorial-luxury aesthetics. The product is split into two distinct apps: a **Next.js landing site** and a **React SPA** that houses all authenticated experiences (login, onboarding, talent dashboard, agency dashboard).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Landing page | Next.js 14 (App Router), TypeScript, Framer Motion, GSAP |
| App (SPA) | React + Vite, React Router v6, Framer Motion |
| Auth | Firebase Authentication (email/password + Google OAuth) |
| Backend session | Custom Express API — Firebase ID token verified server-side, session cookie returned |
| Styling | Vanilla CSS variables + Tailwind utility classes (landing only) |
| Data fetching | React Query (`useCasting`, `talentApi`) |
| Analytics charts | Recharts (AreaChart, RadialBarChart) |

**Brand colour:** Pholio Gold `#C9A55A` / `#C9A84C`
**Typefaces:** Playfair Display (serif/editorial), Inter (sans)

---

## 1. Landing Page (`/landing`)

A standalone Next.js marketing site served separately from the app. Sections render in full-page scroll segments with Framer Motion scroll-driven animations and a Lenis smooth-scroll wrapper (`SmoothScroll`).

### Preloader
A branded preloader (`Preloader.tsx`) locks the page until assets are ready, then fires `onComplete` to fade in the main content.

### Hero
**File:** `landing/components/Hero.tsx`

Full-viewport, dark (`#050505`) cinematic opener.

- **Giant wordmark** — "PHOLIO" rendered at `28vw` in Playfair Display with a gold text-stroke, parallaxed out on scroll.
- **Animated word wheel** — bottom-right cycling ticker rotating through: *Present → Connect → Curate → Discover → Book* every 2.4 s, driven by a wrap-aware spring animation.
- **Cursor spotlight** — a 1000 px gold radial gradient follows the mouse via spring-damped `useMotionValue`.
- **Ambient gold orb** — pulsing background glow regardless of mouse position (fallback for mobile).
- **Nav chrome** (overlaid, `z-30`) — left: Platform / For Agencies / Studio+; right: Log In + **Get Scouted** (gold pill CTA → `/onboarding`).
- **Scroll indicator** — animated gold hairline that fades out after 15 % scroll.
- The hero section spans `300vh` with a sticky inner frame so content parallaxes naturally.

### Belief Section
**File:** `landing/components/BeliefSection.tsx`

Dark full-bleed typographic statement:

> *"We believe your career should be defined by your **face**, not your **formatting**."*

Gold italic emphasis on "face" and "formatting". A `100 px` vertical gold rule animates in beneath the text on scroll entry.

### Product Scenes (scroll sections)

| Section | File | What it shows |
|---|---|---|
| Comp Card | `SceneCompCard.tsx` | Interactive digital comp card with model stats |
| Horizontal Portfolios | `SceneHorizontalPortfolios.tsx` | GSAP-pinned horizontal scroll of portfolio images |
| Studio Web | `SceneStudioWeb.tsx` | `studio+` website product preview |
| Agency View | `SceneAgencyView.tsx` | Pixel-faithful replica of the agency Overview dashboard embedded in a browser mockup |
| Curated by Intelligence | `SceneCurated.tsx` | Two-column: editorial headline + grayscale editorial photo with a floating testimonial card |

**Curated section detail:**
- Headline: *"Curated / by Intelligence."* (gold italic on second line)
- Feature grid: AI Curated Selections · Real-time Analytics
- Testimonial overlay: *"Pholio optimised my portfolio in seconds. The decision was immediate."* — Marcello Russo, Head of Casting, Elite Milan

### Pricing Section
**File:** `landing/components/PricingSection.tsx`

Three-tier pricing on a cream (`var(--color-cream)`) background with a gold top-divider.

| Tier | Price | Key features |
|---|---|---|
| **Free** | $0 / mo | 10-image portfolio, AI archetype analysis, basic comp card, public profile, basic analytics |
| **Studio+** ⭐ | $9.99 / mo (or $7.99 billed yearly) | Everything Free + unlimited images, 5 comp card themes, QR codes, agency discovery, priority applications, custom `.studio` URL, advanced analytics |
| **Enterprise** | Custom ("Let's talk.") | Unlimited talent seats, white-label comp cards, dedicated account manager, custom API, SLA |

A monthly/yearly toggle animates the Studio+ price with `AnimatePresence`. Yearly billing shows a "Save 20%" badge.

### Marketing Footer
**File:** `landing/components/MarketingFooter.tsx`

Final CTA section + standard footer links.

---

## 2. Login Page (`/login`)

**File:** `client/src/routes/auth/LoginPage.jsx`
**Layout wrapper:** `AuthLayout` (centres the card on a dark background with a paper-grain texture overlay at 2 % opacity)

### Visual design
- Serif heading *"Welcome back."* rendered with an animated gold gradient via `GradientText`.
- Subtitle: *"Sign in to your Pholio account."*
- Two social buttons side-by-side (pill layout, 48 px tall, rounded-12): **Google** and **Instagram**.
  - Instagram is currently a placeholder (no OAuth wired) — clicking does nothing.
- Gold hairline divider labelled *"Or Continue With"*.
- Email + password form inputs (52 px, rounded-12, gold focus ring on active).
- Lock icon inside password field (decorative).
- **Forgot Password?** link triggers `sendPasswordResetEmail` from Firebase; shows a green success banner on dispatch.
- Gold **LOGIN** button (uppercase, letter-spacing 0.08 em, 52 px tall, shadow on hover).
- Link to `/onboarding` for new users.

### Auth flow
1. User authenticates with Firebase (email/password or Google popup).
2. Firebase ID token is sent via `POST /api/login` with `{ firebase_token }`.
3. Backend verifies the token, sets a session cookie, and returns `{ redirect }`.
4. Client performs `window.location.href = data.redirect` (full reload to pick up cookie).
5. Already-authenticated users on page mount are auto-redirected to `/dashboard/talent`.

### Error handling
Firebase error codes are mapped to user-friendly messages (invalid credentials, too-many-requests, invalid email, etc.).

---

## 3. Onboarding — The Casting Call (`/onboarding`)

**Orchestrator:** `client/src/routes/onboarding/CastingCallPage.jsx`
**Styling:** `CastingCinematic.css` — dark (`faf9f7` → `f5f4f2`) gradient container with two ambient floating orbs.

The onboarding is a **5-step linear cinematic wizard** with a progress bar at the bottom:

```
Entry (auth) → Scout (photo) → Measurements → Profile → Complete → /reveal
```

State is persisted on the backend via `useCastingStatus` / `useCastingComplete`. If a user drops off and returns, they resume from their last completed step.

### Step 1 — Entry (`CastingEntry.jsx`)

Cinematic dark-background screen. Headline (via `ThinkingText`): *"Let's get you **seen**"*.

**Account creation options:**
- **Google** — Firebase `signInWithPopup`, ID token sent to `/api/casting/entry`.
- **Instagram** — placeholder, shows a toast ("Instagram signup coming soon!").
- **Email** — triggers a 5-sub-step sequential form:
  1. *"What is your name?"* — full-width minimal input
  2. *"And your email?"*
  3. *"Create a password"* — with show/hide toggle
  4. *"Verify your email"* — link sent via Firebase; user clicks "I've Verified" to reload auth state
  5. *"Your gender?"* — Female / Male / Non-Binary / Prefer not to say (one tap selection)

Each sub-step is a full-screen fade/spring transition. A `ThinkingText` component typewriter-animates the question with `*italic*` gold emphasis. A gold hairline divider (`CinematicDivider`) separates the heading from the input card. Keyboard-first: pressing Enter advances to the next sub-step.

A sub-step progress value is reported up to the orchestrator to animate the bottom progress bar within the Entry phase.

### Step 2 — Scout (`CastingScout.jsx`)

Photo upload step — the model submits their primary photo (analysed by the backend AI).

### Step 3 — Measurements (`CastingMeasurements.jsx`)

Structured form collecting physical measurements (height, bust, waist, hips, shoe size). The collected data is stored in local orchestrator state for use in the Reveal step.

### Step 4 — Profile (`CastingProfile.jsx`)

Additional profile details (location, experience, etc.), gated on gender from the Entry step.

### Step 5 — Complete

A brief "You're all set." screen, then `navigate('/reveal')` fires after 1.5 s. The reveal page (`RevealPage.jsx`) presents the new talent's AI-generated profile in a dramatic animated reveal.

---

## 4. Talent Dashboard (`/dashboard/talent`)

**Layout:** `DashboardLayoutShell` → left sidebar navigation + main content area.

### Overview Tab
**File:** `client/src/routes/talent/OverviewPage.jsx`

- **Hero greeting** — `"Good morning/afternoon/evening, {first_name}!"` in a dark-to-gold gradient heading.
- **Quick actions** — two buttons:
  - *Download Comp Card* (gold, calls `/api/talent/comp-card/download`)
  - *Add to Apple Wallet* (white/outlined, calls `/talent/apple-wallet`)
- **Agency Engagement Hero** (`AgencyEngagementHero`) — shows a real-time activity stream of recent agency views.
- **Performance Summary** (`PerformanceSummary`) — view counts, weekly growth, agency interest score.
- **Right sidebar** (`RightSidebar`) — Action Centre with next priority action (e.g. "Update Profile").

Data is fetched from `talentApi.getOverview()` with graceful fallback to zero-state values on error. A skeleton loader (`SkeletonOverview`) shows during the fetch.

### Other Talent Routes

| Route | Page | Purpose |
|---|---|---|
| `/dashboard/talent/profile` | `ProfilePage.jsx` | Full model profile editor (54 KB component) |
| `/dashboard/talent/media` | `MediaPage.jsx` | Photo/video portfolio manager |
| `/dashboard/talent/analytics` | `AnalyticsPage.jsx` | View/engagement analytics |
| `/dashboard/talent/applications` | `ApplicationsPage.jsx` | Casting applications tracker |
| `/dashboard/talent/settings` | `SettingsPage.jsx` | Account & notification settings |
| `/pricing` | `PricingPage.jsx` | In-app upsell to Studio+ |

---

## 5. Agency Dashboard (`/dashboard/agency`)

**Layout:** `AgencyLayout` — a distinct shell with an agency-specific header (search, messages, notification icons with calibrated contrast) and left navigation.

### Overview Tab
**File:** `client/src/routes/agency/OverviewPage.jsx`

Full editorial dashboard built on a CSS variable design system (`OverviewPage.css`). All major elements use Framer Motion staggered entrance animations and respect `prefers-reduced-motion`.

**Hero section:**
- Time-aware greeting: *"Good morning/afternoon/evening, Sarah."*
- Sub-line: *"Here's where your roster stands today."*
- Two lines animate in with staggered clip-path reveals (`inset(0 0 100% 0)` → `inset(0 0 0% 0)`).

**KPI Bento Grid (4 cards):**

| Card | Metric | Visual |
|---|---|---|
| Pending Review | 14 | Animated count-up number; gold urgent border |
| Active Castings | 6 | "2 closing today" amber badge; row of 6 dots (2 glowing gold) |
| Roster Size | 128 | Animated count-up; mini area chart (Recharts) with gold gradient fill; "↑ 3 this month" |
| Placement Rate | 68% | Radial bar chart (gold arc) with pulsing halo; "↑ from 61% last season" |

**Row 2 — Applications + Promo card:**
- **New Applications** (47 total) — list of 5 talent cards, each with avatar, name, archetype badge, city, time applied, and a colour-coded match-score pill (green ≥90 %, amber ≥75 %, grey else). A gold avatar ring indicates "submitted" (new) status. Status dots (gold, slate, green) reflect pipeline stage.
- Clicking a row opens a **Quick View Modal** (spring scale-in from `0.96`): hero image, frosted-glass match-score ring badge, measurements grid, bio, and four action buttons — Accept / Under Review / Decline / Add Note.
- **Dark editorial Promo card** — *"Explore New Talent"* with CSS particle system (6 animated `<span>` particles), two ambient glows, and a shimmer-effect CTA linking to the Discover tab.

**Row 3 — Casting Pipeline + Talent Mix:**
- **Casting Pipeline** — animated stacked horizontal bar: Submitted (47) · Under Review (22, pulsing golden) · Shortlisted (12) · Booked (8, green) · Passed (11). Hover reveals a tooltip. Legend below is interactive.
- **Talent Mix** — SVG donut chart (`ArchetypeDonut`) showing Editorial 45 % / Runway 28 % / Commercial 17 % / Lifestyle 10 %. Segments animate in sequentially with a 120 ms stagger. An insight line calls out the highest-demand archetype and flags the lowest-roster type with a "consider scouting" link.

### Other Agency Routes

| Route | Page | Purpose |
|---|---|---|
| `/dashboard/agency/casting` | `CastingPage.jsx` | Create & manage casting calls (51 KB) |
| `/dashboard/agency/applicants` | `ApplicantsPage.jsx` | Full applicant review table |
| `/dashboard/agency/discover` | `DiscoverPage.jsx` | AI talent discovery (aurora background) |
| `/dashboard/agency/boards` | `BoardsPage.jsx` | Curated talent shortlist boards |
| `/dashboard/agency/signed` | `SignedPage.jsx` | Signed talent roster |
| `/dashboard/agency/interviews` | `InterviewsPage.jsx` | Interview scheduler |
| `/dashboard/agency/reminders` | `RemindersPage.jsx` | Task & reminder tracker |
| `/dashboard/agency/analytics` | `AnalyticsPage.jsx` | Agency-level performance analytics |
| `/dashboard/agency/settings` | `SettingsPage.jsx` | Agency account settings |

---

## Routing Summary

```
/ → /dashboard/talent (redirect)

# Standalone
/onboarding               CastingCallPage (no layout shell)
/reveal                   RevealPage

# Auth layout (centred card, dark bg)
/login                    LoginPage

# Talent dashboard (DashboardLayoutShell)
/dashboard/talent         OverviewPage
/dashboard/talent/profile ProfilePage
/dashboard/talent/media   MediaPage
...

# Agency dashboard (AgencyLayout)
/dashboard/agency         OverviewPage (agency)
/dashboard/agency/casting CastingPage
/dashboard/agency/discover DiscoverPage
...
```

---

## Key Design Principles

1. **Pholio Gold** (`#C9A55A`) is the single accent colour — used for CTAs, active states, charts, focus rings, and typographic emphasis throughout every screen.
2. **Editorial typography** — Playfair Display for display/heading text; Inter for body and UI labels.
3. **Motion-first** — every section transition, card entrance, and data visualisation uses spring or ease-out animations. All animations check `prefers-reduced-motion`.
4. **Two-audience product** — the same Firebase auth token grants access to either the talent SPA or the agency SPA; route guards and session data determine which dashboard is presented.
5. **AI at the core** — archetype analysis, portfolio curation, talent matching scores, and smart discovery are the engine behind the product's value proposition.
