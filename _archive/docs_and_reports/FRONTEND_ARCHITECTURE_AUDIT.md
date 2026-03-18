# Frontend Architecture Audit Report
**Date:** February 14, 2026
**Status:** ⚠️ CRITICAL - Multiple Competing Implementations Detected

---

## Executive Summary

The Pholio codebase currently contains **THREE distinct frontend implementations** serving overlapping purposes:

1. **Next.js Landing Page** (`landing/`) - 874 MB
2. **React SPA Dashboard** (`client/`) - 410 MB
3. **Legacy EJS Templates** (active: 4 files, archived: 87 files) - 1.1 MB

This creates **conflicting routing, duplicate maintenance burden, and deployment complexity**.

---

## Detailed Findings

### 1. Next.js Landing Page (`landing/`)

**Location:** `/landing`
**Size:** 874 MB (with node_modules)
**Framework:** Next.js 16 + TypeScript + Tailwind 4 + Framer Motion
**Port:** 3001 (dev)
**Status:** ✅ Active, well-structured

#### Contents:
- **App Router Structure:**
  - `app/page.tsx` - Homepage with scrollytelling hero
  - `app/layout.tsx` - Root layout
  - `app/globals.css` - Pholio brand theme (cream/ink/gold)

- **Components:** 25 components in `components/` including:
  - `StageHero.tsx` - Main hero animation
  - `InkTransition.tsx` - Scroll transitions
  - Landing page sections (Hero, Features, Agency, CTA)

- **Design System:**
  - Colors: Cream (#FAF9F6), Ink (#0A0A0A), Gold (#C9A55A)
  - Font: Noto Serif Display
  - Optimized for SEO and marketing

#### Issues:
- ⚠️ Completely isolated - not integrated with Express backend
- ⚠️ No routing integration with main app
- ⚠️ Runs on separate port (3001) vs backend (3000)
- ⚠️ Currently not being served by the Express app

---

### 2. React SPA Dashboard (`client/`)

**Location:** `/client`
**Size:** 410 MB (with node_modules)
**Framework:** React 19 + Vite + React Router 7 + TailwindCSS 3
**Dev Port:** 5173 (Vite proxy to :3000)
**Build Output:** `public/dashboard-app/`
**Status:** ✅ Primary dashboard implementation

#### Route Structure:

**Public Routes** (defined in React Router):
- `/` - HomePage (150 lines)
- `/features` - FeaturesPage (47 lines)
- `/pricing` - PricingPage (46 lines)
- `/pro` - ProPage (123 lines)
- `/press` - PressPage (69 lines)
- `/legal` - LegalPage (55 lines)

**Talent Dashboard Routes:**
- `/dashboard/talent` - Main dashboard
- `/dashboard/talent/profile`
- `/dashboard/talent/media`
- `/dashboard/talent/analytics`
- `/dashboard/talent/applications`
- `/dashboard/talent/settings`
- `/reveal` - Cinematic reveal page

**Agency Dashboard Routes:**
- `/dashboard/agency` - Overview
- `/dashboard/agency/applicants`
- `/dashboard/agency/discover`
- `/dashboard/agency/boards`
- `/dashboard/agency/interviews`
- `/dashboard/agency/reminders`
- `/dashboard/agency/analytics`
- `/dashboard/agency/settings`

**Casting Routes:**
- `/casting` - Casting call page
- `/casting/test` - Test preview
- `/casting/preview-reveal` - Preview reveal

#### Issues:
- ⚠️ **DUPLICATE LANDING PAGE:** React SPA has public routes (`/`, `/features`, `/pricing`, etc.) that COMPETE with Next.js landing page
- ⚠️ Not optimized for SEO (client-side rendering)
- ⚠️ Public marketing pages should NOT be in the application dashboard
- ✅ Well-structured for dashboards (Agency & Talent)
- ✅ Properly integrated with Express backend via Vite proxy

#### Current Integration with Express:
```javascript
// In development: Redirects to Vite dev server (localhost:5173)
if (process.env.NODE_ENV !== 'production') {
  return res.redirect('http://localhost:5173' + req.originalUrl);
}

// In production: Serves built React app from public/dashboard-app/
res.sendFile(path.join(__dirname, '..', 'public', 'dashboard-app', 'index.html'));
```

---

### 3. Legacy EJS Templates

**Location:** `/views` (active), `/archive/ejs-archive-20260212/views` (archived)
**Size:** 1.1 MB
**Framework:** EJS + Express EJS Layouts
**Status:** 🔄 Partially deprecated

#### Active EJS Templates (4 files):
1. **`views/layout.ejs`** - Base layout
2. **`views/auth/login.ejs`** - Login page (9,147 bytes)
3. **`views/auth/partners.ejs`** - Agency signup (8,036 bytes)
4. **`views/errors/500.ejs`** - Error page

#### Archived EJS Templates (87 files):
Located in `/archive/ejs-archive-20260212/views/`:
- `dashboard/talent.ejs` - 111,651 bytes (massive monolith!)
- `dashboard/agency.ejs` - 7,010 bytes
- `dashboard/pdf-customizer.ejs` - 22,481 bytes
- `dashboard/settings.ejs` - 22,821 bytes
- `apply/`, `onboarding/`, `portfolio/`, `public/` sections

#### Still Referenced in Routes:

**Auth Routes** (`src/routes/auth.js`):
- `GET /login` → renders `auth/login.ejs` ✅ Keep
- `GET /signup/agency` → renders `auth/partners.ejs` ✅ Keep

**Onboarding Routes** (`src/routes/onboarding.js`):
- References `onboarding/index` template ⚠️ Template missing!

**Agency Routes** (`src/routes/agency.js`):
- Multiple routes render `dashboard/agency.ejs` ⚠️ Template archived!

**Talent Dashboard Routes** (`src/routes/dashboard-talent.js`):
- References `dashboard/talent.ejs`, `dashboard/settings.ejs` ⚠️ All archived!

**PDF Routes** (`src/routes/pdf.js`):
- `GET /pdf/preview` → renders `pdf/compcard.ejs` ⚠️ Template missing!

#### Issues:
- ❌ **BROKEN ROUTES:** Multiple Express routes reference archived/missing EJS templates
- ❌ Massive technical debt from old monolithic templates (111 KB files!)
- ✅ Auth pages (login/signup) still functional and necessary
- ⚠️ PDF rendering likely broken due to missing templates

---

## Root Cause Analysis

### How Did This Happen?

1. **Phase 1:** Original app built with EJS server-rendered templates
2. **Phase 2:** React SPA introduced for dashboards, but included public pages too
3. **Phase 3:** Next.js landing page created for SEO/marketing
4. **Phase 4:** EJS templates partially archived (Feb 12, 2026) but routes not updated

### Current State Issues:

```
┌─────────────────────────────────────────────┐
│         USER REQUESTS "/"                   │
└─────────────────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   Express Server      │
        │   (Port 3000)         │
        └───────────────────────┘
                    ↓
        ┌───────────────────────────────────┐
        │  Catch-all route redirects to:    │
        │  → DEV: localhost:5173 (Vite)     │
        │  → PROD: public/dashboard-app     │
        └───────────────────────────────────┘
                    ↓
        ┌───────────────────────┐
        │   React SPA           │
        │   Shows HomePage.jsx  │
        │   (NOT OPTIMIZED SEO) │
        └───────────────────────┘

❌ Next.js landing page (port 3001) is NEVER served!
❌ React public pages compete with Next.js
❌ No SEO optimization for marketing pages
```

---

## Architecture Conflicts Matrix

| Route | Next.js Landing | React SPA | EJS | Winner | Status |
|-------|----------------|-----------|-----|--------|--------|
| `/` | ✅ Home | ✅ HomePage | ❌ | **CONFLICT** | 🔴 |
| `/features` | ✅ | ✅ FeaturesPage | ❌ | **CONFLICT** | 🔴 |
| `/pricing` | ✅ | ✅ PricingPage | ❌ | **CONFLICT** | 🔴 |
| `/login` | ❌ | ❌ | ✅ login.ejs | EJS | ✅ |
| `/signup/agency` | ❌ | ❌ | ✅ partners.ejs | EJS | ✅ |
| `/dashboard/talent` | ❌ | ✅ | ⚠️ (archived) | React | ✅ |
| `/dashboard/agency` | ❌ | ✅ | ⚠️ (archived) | React | ✅ |
| `/onboarding` | ❌ | ❌ | ⚠️ (missing) | **BROKEN** | 🔴 |
| `/pdf/preview` | ❌ | ❌ | ⚠️ (missing) | **BROKEN** | 🔴 |

---

## File Size Analysis

```
Total Frontend Codebase: ~1.3 GB

├── landing/              874 MB  (68% of total)
│   └── node_modules/     ~850 MB
│   └── source files      ~24 MB
│
├── client/               410 MB  (32% of total)
│   └── node_modules/     ~380 MB
│   └── source files      ~30 MB
│
└── archive/              1.1 MB  (<1% of total)
    └── ejs-archive-20260212/
        └── 87 EJS files
```

---

## Routes Currently Broken

Based on code analysis, these routes reference missing/archived templates:

### Critical Failures:
1. **`GET /onboarding`** → `onboarding/index.ejs` (MISSING)
2. **`GET /pdf/preview`** → `pdf/compcard.ejs` (MISSING)
3. **`GET /dashboard/agency/*`** → `dashboard/agency.ejs` (ARCHIVED)
4. **`GET /dashboard/talent/*`** → `dashboard/talent.ejs` (ARCHIVED)

### Currently Working (but redirected to React SPA):
- All dashboard routes are handled by React SPA catch-all
- Auth routes (`/login`, `/signup/agency`) work via active EJS

---

## Dependencies Analysis

### Next.js Landing (`landing/package.json`):
```json
{
  "dependencies": {
    "framer-motion": "^12.23.26",
    "gsap": "^3.14.2",
    "lenis": "^1.3.17",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "react": "19.2.3"
  }
}
```

### React SPA (`client/package.json`):
```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@tanstack/react-query": "^5.90.20",
    "chart.js": "^4.5.1",
    "firebase": "^12.9.0",
    "framer-motion": "^12.33.0",
    "react": "^19.2.0",
    "react-router-dom": "^7.13.0",
    "zod": "^4.3.6"
  }
}
```

**Duplicate Dependencies:**
- `react` (19.2.x in both)
- `framer-motion` (12.x in both)
- `lucide-react` (0.563.0 in both)

---

## Recommendations Summary

### Critical Actions (DO NOT DELETE YET):

1. ✅ **Keep Next.js Landing** - For SEO-optimized marketing pages
2. ✅ **Keep React SPA Dashboard** - For Talent/Agency dashboards
3. ✅ **Keep Active EJS** - For auth pages and server-rendered needs
4. ❌ **Remove React Public Routes** - Redundant with Next.js
5. 🔧 **Fix Broken Routes** - Restore missing PDF/onboarding templates OR migrate to React

### Migration Strategy (Next Section)

See "Restructuring Plan" below for detailed implementation steps.

---

## Questions for Resolution

Before we restructure, we need to decide:

1. **Onboarding Flow:**
   - Migrate to React SPA? (recommended)
   - Restore EJS template?
   - Build new in Next.js?

2. **PDF Generation:**
   - Keep server-side EJS rendering for PDFs? (recommended - Puppeteer needs HTML)
   - Migrate to React component that renders server-side?

3. **Portfolio Public Pages:**
   - Current: Server-rendered EJS at `/:slug`
   - Should these move to Next.js for SEO?
   - Or stay server-rendered in Express?

4. **Deployment Strategy:**
   - Should Next.js landing be separate deployment (Vercel)?
   - Or integrate into Express app?
   - Or use Next.js as primary server with Express as API?

---

## Next Steps

See `FRONTEND_RESTRUCTURING_PLAN.md` for detailed migration strategy.
