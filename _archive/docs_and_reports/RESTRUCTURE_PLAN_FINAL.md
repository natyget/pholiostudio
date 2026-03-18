# Frontend Restructuring - Final Implementation Plan
**Date:** February 14, 2026
**Strategy:** Separate Domains (The "Pro" Setup)

---

## Architecture Decision: APPROVED ✅

### Marketing Site: `www.pholio.com`
- **Technology:** Next.js 16
- **Hosting:** Vercel (native Next.js support, Edge network)
- **Location:** `landing/` directory
- **Routes:** `/`, `/features`, `/pricing`, `/pro`, `/press`, `/legal`
- **Purpose:** SEO-optimized marketing pages, instant load times

### Web Application: `app.pholio.com`
- **Technology:** React SPA + Express API
- **Hosting:** Current provider (Netlify/Railway/Render)
- **Location:** `client/` (React) + `src/` (Express)
- **Routes:**
  - `/dashboard/talent/*` - Talent dashboard
  - `/dashboard/agency/*` - Agency dashboard
  - `/casting/*` - Casting calls (includes onboarding)
  - `/reveal` - Cinematic reveal
  - `/login`, `/signup/*` - Auth (EJS)
  - `/portfolio/:slug` - Public portfolios (EJS)
  - `/pdf/*` - PDF generation (EJS)
  - `/api/*` - JSON API
  - `/uploads/*` - Static files

### Onboarding Decision: ✅ Use `/casting` (not `/onboarding`)
- `/onboarding` is the OLD version → will be DELETED
- `/casting` is the CURRENT version → will be KEPT

### Portfolio Pages: ✅ Keep EJS server-rendered
- Already working
- SEO-friendly (server-rendered HTML)
- Dynamic per-user

---

## Why This Is The Best Approach

### ✅ Benefits of Separate Domains:

1. **Performance:**
   - Marketing site on Vercel Edge (global CDN, instant loads)
   - Heavy dashboard logic isolated from marketing site
   - No bundling/routing conflicts

2. **Simplicity:**
   - No "Frankenstein" code trying to merge Next.js + Express
   - Each app optimized for its purpose
   - Clear separation of concerns

3. **Scalability:**
   - Scale marketing and app independently
   - Different hosting providers for different needs
   - Easier to upgrade/migrate each piece

4. **Developer Experience:**
   - Simple deployment pipelines
   - No complex proxy configurations
   - Clear project boundaries

5. **Cost Efficiency:**
   - Vercel free tier perfect for Next.js landing
   - App backend only runs when needed (serverless)

---

## Cross-Domain Considerations

### 1. Navigation Between Domains

**Marketing → App (Call-to-Action buttons):**
```javascript
// landing/components/CTAButton.tsx
<a href="https://app.pholio.com/signup">
  Get Started
</a>

<a href="https://app.pholio.com/login">
  Sign In
</a>
```

**App → Marketing (branding, help links):**
```javascript
// client/src/components/Header.jsx
<a href="https://www.pholio.com/features">
  Learn More
</a>

<a href="https://www.pholio.com/pricing">
  Upgrade
</a>
```

### 2. Authentication & Sessions

**Session cookies must work across subdomains:**

```javascript
// src/app.js - Express session config
app.use(session({
  // ... other config
  cookie: {
    domain: '.pholio.com',  // Works for www. and app.
    secure: true,            // HTTPS only
    sameSite: 'lax',         // Allow cross-subdomain
    httpOnly: true
  }
}));
```

**Firebase auth already works across domains** (token-based).

### 3. CORS Configuration

```javascript
// src/app.js - CORS for API calls from www.pholio.com
const cors = require('cors');
app.use(cors({
  origin: [
    'https://www.pholio.com',
    'https://app.pholio.com',
    'http://localhost:3001',  // Next.js dev
    'http://localhost:5173'   // React dev
  ],
  credentials: true
}));
```

### 4. Environment Variables

**Landing (Next.js):**
```bash
# landing/.env.local
NEXT_PUBLIC_APP_URL=https://app.pholio.com
NEXT_PUBLIC_API_URL=https://app.pholio.com/api
```

**App (Express + React):**
```bash
# .env
MARKETING_SITE_URL=https://www.pholio.com
APP_URL=https://app.pholio.com
COOKIE_DOMAIN=.pholio.com
```

### 5. Analytics & Tracking

**Shared Google Analytics across both domains:**
```javascript
// Both sites use same GA4 property
const GA_TRACKING_ID = 'G-XXXXXXXXXX';

// Track cross-domain navigation
gtag('config', GA_TRACKING_ID, {
  'linker': {
    'domains': ['www.pholio.com', 'app.pholio.com']
  }
});
```

---

## Implementation Plan (Updated for Separate Domains)

### Phase 1: ✅ COMPLETE
- Audit completed
- Architecture decided
- This plan created

---

### Phase 2: Cleanup React SPA (1-2 hours)

**Goal:** Remove duplicate marketing pages from React app since Next.js will handle them on separate domain.

#### 2.1 Remove Public Routes

**Edit `client/src/App.jsx`:**

```diff
- import PublicLayout from './layouts/PublicLayout';
- import HomePage from './routes/public/HomePage';
- import FeaturesPage from './routes/public/FeaturesPage';
- import PublicPricingPage from './routes/public/PricingPage';
- import ProPage from './routes/public/ProPage';
- import PressPage from './routes/public/PressPage';
- import LegalPage from './routes/public/LegalPage';

function App() {
  return (
    <ErrorBoundary>
      <Toaster richColors position="top-right" />
      <Routes>
-       {/* Public Routes */}
-       <Route element={<PublicLayout />}>
-         <Route path="/" element={<HomePage />} />
-         <Route path="/features" element={<FeaturesPage />} />
-         <Route path="/pricing" element={<PublicPricingPage />} />
-         <Route path="/pro" element={<ProPage />} />
-         <Route path="/press" element={<PressPage />} />
-         <Route path="/legal" element={<LegalPage />} />
-       </Route>

        {/* Casting Call - Standalone (no dashboard layout) */}
        <Route path="/casting" element={<CastingCallPage />} />
```

#### 2.2 Archive Public Components

```bash
mkdir -p archive/react-public-pages-20260214
mv client/src/routes/public/ archive/react-public-pages-20260214/
mv client/src/layouts/PublicLayout.jsx archive/react-public-pages-20260214/
mv client/src/components/public/ archive/react-public-pages-20260214/
```

#### 2.3 Update Links to Point to Marketing Site

**Find all internal links to marketing pages:**
```bash
grep -r "to=\"/features\|to=\"/pricing\|to=\"/pro" client/src/
```

**Update to external links:**
```javascript
// Before
<Link to="/features">Features</Link>

// After (use environment variable)
<a href={`${import.meta.env.VITE_MARKETING_URL}/features`}>Features</a>
```

**Add to `client/.env`:**
```bash
VITE_MARKETING_URL=http://localhost:3001
```

**Add to `client/.env.production`:**
```bash
VITE_MARKETING_URL=https://www.pholio.com
```

---

### Phase 3: Clean Up Backend Routes (1-2 hours)

**Goal:** Remove broken/old routes, restore needed templates.

#### 3.1 Delete Old Onboarding Route (Use /casting Instead)

**Archive old onboarding:**
```bash
mv src/routes/onboarding.js archive/routes-backup-20260214/
mv src/routes/onboarding-old.js archive/routes-backup-20260214/
mv src/routes/onboarding-status.js archive/routes-backup-20260214/
```

**Remove from `src/app.js`:**
```diff
- const onboardingRoutes = require('./routes/onboarding');
- const onboardingStatusRoutes = require('./routes/onboarding-status');

- app.use('/', onboardingRoutes);
- app.use('/', onboardingStatusRoutes);
```

**Verify `/casting` route is working:**
```bash
# Should be registered in src/app.js
grep "castingRoutes" src/app.js
```

#### 3.2 Restore PDF Templates (Needed for Server-Side Rendering)

```bash
mkdir -p views/pdf
cp archive/ejs-archive-20260212/views/pdf/compcard.ejs views/pdf/
```

**Test PDF generation works:**
```bash
# Start server
npm run dev

# Visit (should render template, not error)
curl http://localhost:3000/pdf/preview
```

#### 3.3 Remove Dead Dashboard EJS Routes

These routes try to render archived templates but are never reached (React SPA handles them):

**Archive dead route files:**
```bash
mv src/routes/dashboard-talent.js archive/routes-backup-20260214/
mv src/routes/dashboard-agency.js.backup archive/routes-backup-20260214/
mv src/routes/dashboard-talent.js.backup archive/routes-backup-20260214/
```

**Remove from `src/app.js`:**
```diff
- const dashboardTalentRoutes = require('./routes/talent/index');
- app.use('/', requireOnboardingComplete, dashboardTalentRoutes);
```

**Keep these routes (still needed):**
- `src/routes/talent/index.js` - API routes for `/api/talent/*`
- `src/routes/agency.js` - API routes for `/api/agency/*`

#### 3.4 Update Express Catch-All for Separate Domains

**Edit `src/app.js` (around line 564):**

```javascript
// OLD: Catch-all serves React SPA for ALL routes
app.get('*', (req, res, next) => {
  // Don't intercept API routes or uploads
  if (req.url.startsWith('/api/') ||
      req.url.startsWith('/uploads/') ||
      req.url.startsWith('/portfolio/') ||
      req.url.startsWith('/stripe/')) {
    return next();
  }

  // Development: Redirect to Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    return res.redirect('http://localhost:5173' + req.originalUrl);
  }

  // Production: Serve React app
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard-app', 'index.html'));
});
```

**NEW: Only serve React SPA for app routes:**

```javascript
// Serve React SPA only for dashboard/casting/reveal routes
app.get([
  '/dashboard/*',
  '/casting/*',
  '/reveal'
], (req, res) => {
  // Development: Redirect to Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    return res.redirect('http://localhost:5173' + req.originalUrl);
  }

  // Production: Serve React app
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard-app', 'index.html'));
});

// Catch-all for unknown routes → 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
```

---

### Phase 4: Update Next.js Landing for Separate Domain (30 min)

**Goal:** Configure Next.js for standalone deployment on Vercel.

#### 4.1 Update Environment Variables

**Create `landing/.env.local`:**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Create `landing/.env.production`:**
```bash
NEXT_PUBLIC_APP_URL=https://app.pholio.com
NEXT_PUBLIC_API_URL=https://app.pholio.com/api
```

#### 4.2 Update CTA Links to Point to App Domain

**Find all CTAs in landing page:**
```bash
cd landing
grep -r "href=\"/signup\|href=\"/login" components/ app/
```

**Update to use environment variable:**

```typescript
// landing/components/CTAButton.tsx
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

<a href={`${appUrl}/signup`}>
  Get Started
</a>

<a href={`${appUrl}/login`}>
  Sign In
</a>
```

#### 4.3 Configure Vercel Deployment

**Create `landing/vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.pholio.com",
    "NEXT_PUBLIC_API_URL": "https://app.pholio.com/api"
  }
}
```

---

### Phase 5: Update CORS & Session Configuration (30 min)

#### 5.1 Update CORS for Separate Domains

**Edit `src/app.js`:**

```javascript
const cors = require('cors');

// Determine allowed origins based on environment
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev
  'http://localhost:3001',  // Next.js dev
];

if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(
    'https://www.pholio.com',      // Marketing site
    'https://app.pholio.com'       // App site
  );
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

#### 5.2 Update Session Cookie for Cross-Subdomain

**Edit `src/app.js` (session configuration):**

```javascript
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // Allow cookies across subdomains
    domain: process.env.NODE_ENV === 'production' ? '.pholio.com' : undefined
  }
}));
```

#### 5.3 Add Environment Variables

**Add to `.env`:**
```bash
# Domain configuration
MARKETING_SITE_URL=http://localhost:3001
APP_URL=http://localhost:3000
COOKIE_DOMAIN=localhost
```

**Add to production `.env`:**
```bash
# Domain configuration
MARKETING_SITE_URL=https://www.pholio.com
APP_URL=https://app.pholio.com
COOKIE_DOMAIN=.pholio.com
```

---

### Phase 6: Update Documentation (30 min)

#### 6.1 Update CLAUDE.md

**Add section on architecture:**

```markdown
## Architecture

### Separate Domain Strategy

Pholio uses a separate domain strategy for optimal performance:

- **Marketing Site:** www.pholio.com (Next.js on Vercel)
  - Landing page, features, pricing, press, legal
  - SEO-optimized, Edge-cached, instant load times

- **Web Application:** app.pholio.com (React SPA + Express on Netlify/Render)
  - Talent/Agency dashboards, casting calls, auth
  - Dynamic, authenticated, API-driven

### Development URLs

- Next.js landing: http://localhost:3001
- Express backend: http://localhost:3000
- React frontend: http://localhost:5173 (proxies to :3000)

### Running Both

```bash
# Terminal 1: Express backend
npm run dev

# Terminal 2: React frontend
npm run client:dev

# Terminal 3: Next.js landing
cd landing && npm run dev
```

## Cross-Domain Navigation

Links between domains use environment variables:
- Marketing → App: `NEXT_PUBLIC_APP_URL`
- App → Marketing: `VITE_MARKETING_URL`
```

#### 6.2 Update README.md

**Add deployment section:**

```markdown
## Deployment

### Marketing Site (www.pholio.com)

Deployed to Vercel from `landing/` directory:

```bash
cd landing
vercel --prod
```

### Web App (app.pholio.com)

Deployed to Netlify/Render from root directory:

```bash
# Build frontend
npm run client:build

# Deploy (Netlify auto-detects Express)
netlify deploy --prod
```
```

---

### Phase 7: Deploy & Test (2-3 hours)

#### 7.1 Deploy Marketing Site to Vercel

```bash
cd landing

# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Test preview URL
# Check all pages load: /, /features, /pricing, /pro, /press, /legal
# Check CTAs point to app domain

# Deploy to production (www.pholio.com)
vercel --prod
```

**Configure custom domain in Vercel dashboard:**
- Add domain: www.pholio.com
- Configure DNS: Add CNAME record pointing to Vercel

#### 7.2 Deploy App to Current Host

**Build React SPA:**
```bash
cd client
npm run build
cd ..
```

**Deploy to Netlify (or current host):**
```bash
# If using Netlify CLI
netlify deploy --prod

# If using git-based deployment
git push origin main
```

**Configure custom domain:**
- Add domain: app.pholio.com
- Configure DNS: Add CNAME record

#### 7.3 End-to-End Testing

**Test marketing site (www.pholio.com):**
- [ ] Homepage loads
- [ ] Features page loads
- [ ] Pricing page loads
- [ ] "Get Started" button → app.pholio.com/signup
- [ ] "Sign In" button → app.pholio.com/login
- [ ] Lighthouse score > 90

**Test app site (app.pholio.com):**
- [ ] Login page loads
- [ ] Signup page loads
- [ ] Can log in and reach dashboard
- [ ] Talent dashboard works
- [ ] Agency dashboard works
- [ ] Casting calls work
- [ ] Reveal page works
- [ ] PDF generation works
- [ ] Portfolio pages work (/:slug)

**Test cross-domain:**
- [ ] Session persists across www. and app.
- [ ] Navigation between domains works
- [ ] CORS allows API calls from marketing site
- [ ] Analytics tracks across both domains

---

## Implementation Checklist

### ✅ Phase 1: Audit & Planning
- [x] Audit completed
- [x] Architecture decided
- [x] Plan created

### 🔄 Phase 2: Cleanup React SPA (Next)
- [ ] Remove public routes from `client/src/App.jsx`
- [ ] Archive `client/src/routes/public/`
- [ ] Archive `client/src/layouts/PublicLayout.jsx`
- [ ] Archive `client/src/components/public/`
- [ ] Update internal links to external (marketing site)
- [ ] Add `VITE_MARKETING_URL` to `.env`
- [ ] Test dashboards still load
- [ ] Commit: `git commit -am "Remove duplicate public routes from React SPA"`

### ⏳ Phase 3: Clean Up Backend Routes
- [ ] Archive old onboarding routes
- [ ] Remove onboarding routes from `src/app.js`
- [ ] Verify `/casting` works
- [ ] Restore PDF templates from archive
- [ ] Test PDF generation
- [ ] Archive dead dashboard EJS routes
- [ ] Update Express catch-all (only serve React for app routes)
- [ ] Test 404s return JSON, not HTML
- [ ] Commit: `git commit -am "Clean up backend routes"`

### ⏳ Phase 4: Update Next.js Landing
- [ ] Create `landing/.env.local` with app URL
- [ ] Create `landing/.env.production` with app URL
- [ ] Update CTA links to use `NEXT_PUBLIC_APP_URL`
- [ ] Create `landing/vercel.json` config
- [ ] Test locally (npm run dev)
- [ ] Commit: `git commit -am "Configure Next.js for separate domain"`

### ⏳ Phase 5: Update CORS & Sessions
- [ ] Update CORS allowed origins
- [ ] Update session cookie domain
- [ ] Add environment variables (MARKETING_SITE_URL, APP_URL)
- [ ] Test CORS in development (localhost:3001 → localhost:3000)
- [ ] Commit: `git commit -am "Configure cross-domain CORS and sessions"`

### ⏳ Phase 6: Update Documentation
- [ ] Update CLAUDE.md with architecture section
- [ ] Update README.md with deployment instructions
- [ ] Document development workflow
- [ ] Commit: `git commit -am "Update documentation"`

### ⏳ Phase 7: Deploy & Test
- [ ] Deploy Next.js to Vercel
- [ ] Configure www.pholio.com DNS
- [ ] Test marketing site on Vercel preview
- [ ] Deploy app to current host
- [ ] Configure app.pholio.com DNS
- [ ] Run full E2E tests
- [ ] Monitor for errors
- [ ] Commit: `git commit -am "Deploy separate domains"`

---

## Timeline

| Phase | Time | Status |
|-------|------|--------|
| Phase 1 | ✅ Done | Complete |
| Phase 2 | 1-2h | Ready to start |
| Phase 3 | 1-2h | Waiting |
| Phase 4 | 30m | Waiting |
| Phase 5 | 30m | Waiting |
| Phase 6 | 30m | Waiting |
| Phase 7 | 2-3h | Waiting |
| **Total** | **6-9h** | **~1 day** |

---

## Success Metrics

After deployment:
- ✅ www.pholio.com loads from Vercel Edge (instant)
- ✅ app.pholio.com loads React SPA
- ✅ No 404 errors
- ✅ No CORS errors in console
- ✅ Sessions work across subdomains
- ✅ Navigation between domains seamless
- ✅ Lighthouse SEO score > 90 on www.pholio.com
- ✅ All dashboards functional
- ✅ PDF generation works
- ✅ Portfolio pages work

---

## Ready to Start!

Say "Proceed with Phase 2" and I'll begin implementing the cleanup! 🚀
