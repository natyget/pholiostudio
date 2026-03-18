# Frontend Restructuring Plan
**Date:** February 14, 2026
**Goal:** Standardize architecture with Next.js for marketing, React SPA for dashboards

---

## Target Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REQUEST                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │     Reverse Proxy / Load Balancer    │
        │         (Nginx / Vercel Edge)        │
        └──────────────────────────────────────┘
                           ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌───────────────────┐          ┌────────────────────────┐
│  Next.js Landing  │          │   Express Backend API  │
│   (Port 3001)     │          │      (Port 3000)       │
│                   │          │                        │
│  Routes:          │          │  Routes:               │
│  • /              │          │  • /api/*              │
│  • /features      │          │  • /login              │
│  • /pricing       │          │  • /signup/*           │
│  • /pro           │          │  • /uploads/*          │
│  • /press         │          │  • /portfolio/:slug    │
│  • /legal         │          │  • /pdf/*              │
│                   │          │  • /onboarding         │
│  SEO Optimized ✅ │          │                        │
│  Static Gen ✅    │          │  + Serves React SPA:   │
│                   │          │  • /dashboard/talent/* │
└───────────────────┘          │  • /dashboard/agency/* │
                               │  • /casting/*          │
                               │  • /reveal             │
                               │                        │
                               │  From: public/         │
                               │    dashboard-app/      │
                               └────────────────────────┘
```

### Routing Responsibility Matrix

| Route Pattern | Handler | Technology | Purpose | SEO |
|--------------|---------|------------|---------|-----|
| `/` | Next.js | SSG/SSR | Marketing homepage | ✅ |
| `/features` | Next.js | SSG | Features page | ✅ |
| `/pricing` | Next.js | SSG | Public pricing | ✅ |
| `/pro` | Next.js | SSG | Pro tier marketing | ✅ |
| `/press` | Next.js | SSG | Press/media | ✅ |
| `/legal` | Next.js | SSG | Legal/terms | ✅ |
| `/login` | Express EJS | SSR | Auth page | ❌ |
| `/signup/*` | Express EJS | SSR | Signup flows | ❌ |
| `/onboarding` | Express EJS | SSR | Wizard flow | ❌ |
| `/portfolio/:slug` | Express EJS | SSR | Public portfolios | ✅ |
| `/pdf/*` | Express EJS | SSR | PDF generation | ❌ |
| `/api/*` | Express JSON | API | Backend API | ❌ |
| `/uploads/*` | Express Static | Files | Media files | ❌ |
| `/dashboard/talent/*` | React SPA | CSR | Talent dashboard | ❌ |
| `/dashboard/agency/*` | React SPA | CSR | Agency dashboard | ❌ |
| `/casting/*` | React SPA | CSR | Casting calls | ❌ |
| `/reveal` | React SPA | CSR | Cinematic reveal | ❌ |

---

## Implementation Strategy

### Phase 1: Audit & Document ✅ COMPLETE
- [x] Identify all frontend implementations
- [x] Document routing conflicts
- [x] Analyze file sizes and dependencies
- [x] Map current vs. target architecture

---

### Phase 2: Cleanup React SPA (Remove Public Routes)

**Goal:** Remove duplicate public pages from React SPA since Next.js will handle them.

#### 2.1 Remove Public Routes from React Router

**Files to modify:**

1. **`client/src/App.jsx`**
   ```diff
   - import PublicLayout from './layouts/PublicLayout';
   - import HomePage from './routes/public/HomePage';
   - import FeaturesPage from './routes/public/FeaturesPage';
   - import PublicPricingPage from './routes/public/PricingPage';
   - import ProPage from './routes/public/ProPage';
   - import PressPage from './routes/public/PressPage';
   - import LegalPage from './routes/public/LegalPage';

   <Routes>
   -  {/* Public Routes */}
   -  <Route element={<PublicLayout />}>
   -    <Route path="/" element={<HomePage />} />
   -    <Route path="/features" element={<FeaturesPage />} />
   -    <Route path="/pricing" element={<PublicPricingPage />} />
   -    <Route path="/pro" element={<ProPage />} />
   -    <Route path="/press" element={<PressPage />} />
   -    <Route path="/legal" element={<LegalPage />} />
   -  </Route>
   ```

#### 2.2 Archive Public Components

**Move to archive:**
```bash
mkdir -p archive/react-public-pages-20260214
mv client/src/routes/public/ archive/react-public-pages-20260214/
mv client/src/layouts/PublicLayout.jsx archive/react-public-pages-20260214/
mv client/src/components/public/ archive/react-public-pages-20260214/
```

**Estimated savings:** ~50 KB source code, cleaner SPA focus

#### 2.3 Update React Router Base

The React SPA should ONLY handle dashboard routes:
- Start path: `/dashboard/*`
- No root `/` route
- No public marketing routes

---

### Phase 3: Integrate Next.js Landing with Express

**Goal:** Serve Next.js landing page as the primary public-facing site.

#### Option A: Reverse Proxy (Recommended for Development)

**Using Nginx or similar:**
```nginx
# Nginx config
server {
  listen 80;
  server_name localhost;

  # Marketing pages → Next.js
  location ~ ^/(features|pricing|pro|press|legal)$ {
    proxy_pass http://localhost:3001;
  }

  location / {
    # Try Next.js first
    proxy_pass http://localhost:3001;
    # If 404, fallback to Express
    proxy_intercept_errors on;
    error_page 404 = @express;
  }

  location @express {
    proxy_pass http://localhost:3000;
  }

  # API routes → Express
  location ~ ^/(api|login|signup|onboarding|portfolio|pdf|uploads|dashboard|casting|reveal) {
    proxy_pass http://localhost:3000;
  }
}
```

**Development workflow:**
1. Run Next.js: `cd landing && npm run dev` (port 3001)
2. Run Express: `npm run dev` (port 3000)
3. Run React SPA: `npm run client:dev` (port 5173, proxied to 3000)
4. Access via Nginx: `http://localhost:80`

#### Option B: Next.js as Primary Server with Express API Routes

**Integrate Express into Next.js:**
```javascript
// landing/server.js (custom server)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const expressApp = require('../src/app'); // Your Express app

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: './landing' });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server = express();

  // Mount Express routes with /api prefix
  server.use('/api', expressApp);
  server.use('/login', expressApp);
  server.use('/signup', expressApp);
  server.use('/onboarding', expressApp);
  server.use('/portfolio', expressApp);
  server.use('/pdf', expressApp);
  server.use('/uploads', expressApp);
  server.use('/dashboard', expressApp);
  server.use('/casting', expressApp);
  server.use('/reveal', expressApp);

  // All other routes → Next.js
  server.get('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
```

**Update package.json:**
```json
{
  "scripts": {
    "dev": "node landing/server.js",
    "build": "cd landing && npm run build",
    "start": "NODE_ENV=production node landing/server.js"
  }
}
```

**Pros:**
- Single server process
- Single port (3000)
- Easier deployment
- Next.js handles static files, Express handles API

**Cons:**
- More complex setup
- Harder to separate concerns
- Custom server loses some Next.js optimizations

#### Option C: Static Export Next.js + Express Serves It

**Build Next.js as static HTML:**
```javascript
// landing/next.config.ts
const nextConfig = {
  output: 'export',
  distDir: '../public/landing',
};
```

**Express serves static Next.js build:**
```javascript
// src/app.js
app.use(express.static(path.join(__dirname, '..', 'public', 'landing')));

// Fallback for React SPA
app.get('/dashboard/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard-app', 'index.html'));
});
```

**Build process:**
```bash
# Build Next.js to public/landing
cd landing && npm run build && cd ..

# Build React SPA to public/dashboard-app
cd client && npm run build && cd ..

# Start Express (serves both)
npm start
```

**Pros:**
- Simplest deployment (single Express server)
- No reverse proxy needed
- Works on Netlify/Vercel serverless

**Cons:**
- Loses Next.js SSR benefits (if any)
- Static export only (no dynamic SSR)

---

### Phase 4: Fix Broken EJS Routes

**Goal:** Restore or migrate routes that reference missing templates.

#### 4.1 PDF Templates (RESTORE)

**Action:** Copy PDF templates from archive back to active views
```bash
mkdir -p views/pdf
cp archive/ejs-archive-20260212/views/pdf/compcard.ejs views/pdf/
```

**Reason:** PDF generation needs server-side HTML rendering (Puppeteer). EJS is appropriate here.

**Files affected:**
- `src/routes/pdf.js` (already expects `pdf/compcard.ejs`)

#### 4.2 Onboarding Templates (MIGRATE TO REACT)

**Current state:** `src/routes/onboarding.js` tries to render `onboarding/index.ejs` (missing)

**Recommended action:** Build onboarding wizard in React SPA

**New React route:**
```javascript
// client/src/App.jsx
<Route path="/onboarding" element={<OnboardingWizard />} />
```

**Backend changes:**
```javascript
// src/routes/onboarding.js
router.get('/', requireAuth, (req, res) => {
  // Redirect to React SPA onboarding
  res.redirect('/dashboard/talent/onboarding');
});
```

**OR restore EJS template:**
```bash
mkdir -p views/onboarding
cp archive/ejs-archive-20260212/views/onboarding/index.ejs views/onboarding/
```

#### 4.3 Dashboard Routes (ALREADY HANDLED BY REACT)

**Current state:**
- `src/routes/agency.js` tries to render `dashboard/agency.ejs` (archived)
- `src/routes/dashboard-talent.js` tries to render `dashboard/talent.ejs` (archived)

**Action:** These routes should REDIRECT to React SPA, not render EJS

**Fix:**
```javascript
// src/routes/agency.js
router.get('/dashboard/agency', requireAuth, requireRole('AGENCY'), (req, res) => {
  // Don't render EJS - let React SPA handle it
  // Just verify auth and let the catch-all serve React
  next(); // Falls through to React SPA catch-all
});

// OR explicitly redirect in development
if (process.env.NODE_ENV !== 'production') {
  return res.redirect('http://localhost:5173/dashboard/agency');
}
res.sendFile(path.join(__dirname, '..', 'public', 'dashboard-app', 'index.html'));
```

**Better approach:** Remove these routes entirely and let React Router handle them client-side.

---

### Phase 5: Deploy Strategy

#### Development (Current State)
```bash
# Terminal 1: Express backend
npm run dev  # Port 3000

# Terminal 2: React SPA
npm run client:dev  # Port 5173 (proxies to 3000)

# Terminal 3: Next.js landing (NEW)
cd landing && npm run dev  # Port 3001

# Optional Terminal 4: Nginx reverse proxy
nginx -c nginx.conf  # Port 80 (routes to 3001 or 3000)
```

#### Production (Option C - Static Export)
```bash
# Build Next.js landing to public/landing
cd landing && npm run build && cd ..

# Build React SPA to public/dashboard-app
npm run client:build

# Run migrations
npm run migrate

# Start single Express server (serves both + API)
npm start  # Port 3000
```

**Netlify deployment:**
```toml
# netlify.toml
[build]
  command = "cd landing && npm run build && cd .. && npm run client:build && npm run migrate"
  publish = "public"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/dashboard/*"
  to = "/dashboard-app/index.html"
  status = 200

[[redirects]]
  from = "/*"
  to = "/landing/:splat"
  status = 200
```

---

### Phase 6: Consolidate Dependencies

#### Before Restructure:
- `landing/node_modules` - 850 MB
- `client/node_modules` - 380 MB
- **Total:** 1.23 GB

#### After (Option: Monorepo with Workspaces):

**Move to monorepo structure:**
```
pholio/
├── package.json (root - workspace manager)
├── packages/
│   ├── backend/  (Express API)
│   ├── landing/  (Next.js)
│   └── dashboard/ (React SPA - renamed from client)
└── node_modules/ (shared)
```

**Root package.json:**
```json
{
  "name": "pholio-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:landing\" \"npm run dev:dashboard\"",
    "dev:backend": "npm run dev --workspace=backend",
    "dev:landing": "npm run dev --workspace=landing",
    "dev:dashboard": "npm run dev --workspace=dashboard",
    "build": "npm run build --workspace=landing && npm run build --workspace=dashboard"
  },
  "devDependencies": {
    "concurrently": "^9.2.1"
  }
}
```

**Benefits:**
- Shared `node_modules` (deduplicates `react`, `framer-motion`, etc.)
- Single `npm install` at root
- Coordinated versioning
- ~200-300 MB savings from deduplication

**Drawbacks:**
- More complex project structure
- Harder to understand for new developers
- May complicate deployment if packages need separate deployments

---

## Migration Checklist

### Pre-Migration (DO NOT DELETE YET)
- [ ] Create branch: `git checkout -b frontend-restructure`
- [ ] Backup current state: `git commit -am "Backup before restructure"`
- [ ] Document all current routes: `grep -r "app.get\|app.post" src/routes/`
- [ ] Test current functionality: Run all tests (`npm test`)

### Phase 2: Cleanup React SPA
- [ ] Remove public routes from `client/src/App.jsx`
- [ ] Archive public components: `mv client/src/routes/public/ archive/`
- [ ] Archive public layouts: `mv client/src/layouts/PublicLayout.jsx archive/`
- [ ] Test React SPA still loads dashboards
- [ ] Commit: `git commit -am "Remove duplicate public routes from React SPA"`

### Phase 3: Integrate Next.js
- [ ] Choose integration strategy (A, B, or C)
- [ ] Implement chosen strategy
- [ ] Test Next.js serves `/`, `/features`, `/pricing`, etc.
- [ ] Test Express still serves `/api/*`, `/login`, `/dashboard/*`
- [ ] Update CLAUDE.md with new architecture
- [ ] Commit: `git commit -am "Integrate Next.js landing page"`

### Phase 4: Fix Broken Routes
- [ ] Restore PDF templates: `cp archive/.../pdf/ views/`
- [ ] Test PDF generation: Visit `/pdf/preview`
- [ ] Decide on onboarding strategy (React or EJS)
- [ ] Implement onboarding migration
- [ ] Test onboarding flow
- [ ] Remove/update dead agency/talent EJS routes
- [ ] Commit: `git commit -am "Fix broken EJS routes"`

### Phase 5: Deploy
- [ ] Test production build: `npm run build`
- [ ] Test production server: `NODE_ENV=production npm start`
- [ ] Verify all routes work in production mode
- [ ] Update deployment docs (NETLIFY_DEPLOYMENT.md)
- [ ] Deploy to staging
- [ ] QA testing on staging
- [ ] Deploy to production

### Phase 6: Cleanup (AFTER SUCCESSFUL DEPLOY)
- [ ] Delete archived EJS files: `rm -rf archive/ejs-archive-20260212/`
- [ ] Delete React public routes archive: `rm -rf archive/react-public-pages-20260214/`
- [ ] Delete backup route files: `rm src/routes/*.backup`
- [ ] Update package.json scripts
- [ ] Commit: `git commit -am "Final cleanup after restructure"`

---

## Migration Scripts

### Script 1: Archive React Public Routes
```bash
#!/bin/bash
# archive-react-public.sh

ARCHIVE_DIR="archive/react-public-pages-$(date +%Y%m%d)"
mkdir -p "$ARCHIVE_DIR"

echo "Archiving React public routes to $ARCHIVE_DIR..."

# Move public routes
[ -d "client/src/routes/public" ] && mv client/src/routes/public "$ARCHIVE_DIR/"

# Move public layout
[ -f "client/src/layouts/PublicLayout.jsx" ] && mv client/src/layouts/PublicLayout.jsx "$ARCHIVE_DIR/"

# Move public components
[ -d "client/src/components/public" ] && mv client/src/components/public "$ARCHIVE_DIR/"

echo "✅ Archived React public routes"
echo "📁 Location: $ARCHIVE_DIR"
ls -lh "$ARCHIVE_DIR"
```

### Script 2: Restore PDF Templates
```bash
#!/bin/bash
# restore-pdf-templates.sh

echo "Restoring PDF templates from archive..."

ARCHIVE_PDF="archive/ejs-archive-20260212/views/pdf"
TARGET_PDF="views/pdf"

if [ -d "$ARCHIVE_PDF" ]; then
  mkdir -p "$TARGET_PDF"
  cp -r "$ARCHIVE_PDF"/* "$TARGET_PDF/"
  echo "✅ Restored PDF templates to $TARGET_PDF"
  ls -lh "$TARGET_PDF"
else
  echo "❌ PDF archive not found at $ARCHIVE_PDF"
  exit 1
fi
```

### Script 3: Test Route Coverage
```bash
#!/bin/bash
# test-routes.sh

echo "Testing critical routes..."

BASE_URL="http://localhost:3000"

routes=(
  "/"
  "/features"
  "/pricing"
  "/login"
  "/signup/agency"
  "/api/health"
  "/dashboard/talent"
  "/dashboard/agency"
)

for route in "${routes[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$route")
  if [ "$status" = "200" ] || [ "$status" = "302" ]; then
    echo "✅ $route - $status"
  else
    echo "❌ $route - $status"
  fi
done
```

---

## Rollback Plan

If migration fails:

```bash
# Rollback to pre-migration state
git reset --hard HEAD~N  # N = number of commits since backup

# Or revert specific commits
git revert <commit-hash>

# Restore from backup branch
git checkout main
git merge backup-branch --strategy=ours
```

---

## Success Criteria

### Functional Requirements
- [ ] All marketing pages (`/`, `/features`, `/pricing`) load from Next.js
- [ ] All dashboard routes load from React SPA
- [ ] Auth pages (`/login`, `/signup`) work via EJS
- [ ] PDF generation works
- [ ] Onboarding flow works
- [ ] All API routes functional
- [ ] File uploads work
- [ ] Public portfolios (`/:slug`) work

### Performance Requirements
- [ ] Landing page Lighthouse score > 90 (SEO)
- [ ] Dashboard loads in < 2s (LCP)
- [ ] No broken routes (404s)
- [ ] No console errors

### Developer Experience
- [ ] Clear separation of concerns (landing vs dashboard vs API)
- [ ] Single `npm run dev:all` command starts everything
- [ ] Documentation updated (CLAUDE.md, README.md)
- [ ] No duplicate code between Next.js and React

---

## Timeline Estimate

| Phase | Estimated Time | Risk Level |
|-------|---------------|------------|
| Phase 2: Cleanup React SPA | 2 hours | 🟢 Low |
| Phase 3: Integrate Next.js | 4-6 hours | 🟡 Medium |
| Phase 4: Fix Broken Routes | 3-4 hours | 🟡 Medium |
| Phase 5: Deploy & Test | 2-3 hours | 🟠 High |
| Phase 6: Cleanup | 1 hour | 🟢 Low |
| **Total** | **12-16 hours** | 🟡 **Medium** |

---

## Questions Before Starting

1. **Which integration strategy do you prefer?**
   - [ ] Option A: Reverse Proxy (Nginx)
   - [ ] Option B: Next.js Custom Server
   - [ ] Option C: Static Export (Recommended)

2. **Onboarding flow decision:**
   - [ ] Migrate to React SPA (recommended)
   - [ ] Restore EJS template
   - [ ] Rebuild in Next.js

3. **Portfolio pages (`/:slug`):**
   - [ ] Keep server-rendered EJS (current)
   - [ ] Migrate to Next.js dynamic routes
   - [ ] Migrate to React SPA

4. **Deployment target:**
   - [ ] Netlify (serverless)
   - [ ] Vercel (Next.js optimized)
   - [ ] Traditional VPS (Nginx + PM2)
   - [ ] Other: _______________

---

## Recommendation

**Recommended Path:**

1. **Use Option C (Static Export)** for simplest deployment
   - Build Next.js as static HTML to `public/landing/`
   - Express serves both landing + dashboard + API
   - Single deployment target (Netlify/Vercel)

2. **Migrate onboarding to React SPA**
   - Better UX (no page reloads)
   - Consistent with dashboard experience
   - Easier to maintain (single codebase for all dashboards)

3. **Keep portfolios as server-rendered EJS**
   - Dynamic per user (not static)
   - SEO still works with server-rendered HTML
   - No need to migrate if working

4. **Restore PDF templates**
   - Puppeteer needs server-side HTML
   - EJS is appropriate here
   - Low risk, high value

5. **Timeline:** Plan for 2-day sprint (12-16 hours)

---

Ready to proceed? Confirm your answers to the "Questions Before Starting" and we'll begin implementation!
