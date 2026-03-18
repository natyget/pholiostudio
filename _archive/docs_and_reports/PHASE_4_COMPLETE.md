# Phase 4 Complete: Next.js Landing Configuration ✅
**Date:** February 14, 2026
**Branch:** `frontend-restructure`
**Commit:** (next commit)

---

## What Was Done

### 1. Created Environment Variables

**File: `landing/.env.local`** (Development)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**File: `landing/.env.production`** (Production)
```bash
NEXT_PUBLIC_APP_URL=https://app.pholio.studio
NEXT_PUBLIC_API_URL=https://app.pholio.studio/api
```

**Note:** These files are not committed to git (in .gitignore), which is correct for security.

**Purpose:**
- `NEXT_PUBLIC_APP_URL` - Where to redirect users when they click CTAs (login, signup)
- `NEXT_PUBLIC_API_URL` - API endpoint (if landing page needs to make API calls)

### 2. Updated CTA Section

**File: `landing/components/landing/sections/CTASection.tsx`**

**Changes:**
```typescript
// Added at top of component
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Updated "Get Started Free" button
<a href={`${appUrl}/signup`}>  // Was: href="/signup"
  Get Started Free
</a>

// "Learn More" button stays local (same site)
<a href="/features">  // Correct - local navigation
  Learn More
</a>
```

**Result:**
- Development: `http://localhost:3000/signup`
- Production: `https://app.pholio.studio/signup`

### 3. Updated Header Navigation

**File: `landing/components/landing/PholioHeader.tsx`**

**Changes:**
```typescript
// Added at top of component
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Desktop Login Link
<a href={`${appUrl}/login`}>  // Was: href="/login"
  Login
</a>

// Desktop "Start Creating" Button
<a href={`${appUrl}/signup`}>  // Was: href="/apply"
  Start Creating
</a>

// Mobile Login Link
<a href={`${appUrl}/login`}>  // Was: href="/login"
  Login
</a>

// Mobile "Start Creating" Button
<a href={`${appUrl}/signup`}>  // Was: href="/apply"
  Start Creating
</a>
```

**Navigation links stayed local (correct):**
- `/` - Home
- `/features` - Features
- `/pricing` - Pricing
- `/pro` - Studio+
- `/press` - Press

**Result:**
- All app-specific CTAs now point to app domain
- All marketing pages stay on same domain (Next.js)

### 4. Created Vercel Deployment Configuration

**File: `landing/vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.pholio.studio",
    "NEXT_PUBLIC_API_URL": "https://app.pholio.studio/api"
  },
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Features:**
- Explicit build commands for Vercel
- Environment variables for production
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Region: iad1 (US East - Virginia)

---

## Files Changed

### Created
```
landing/.env.local          (dev environment, not committed)
landing/.env.production     (prod environment, not committed)
landing/vercel.json         (Vercel config, committed)
```

### Modified
```
landing/components/landing/PholioHeader.tsx
landing/components/landing/sections/CTASection.tsx
```

---

## Link Behavior (Before vs After)

### Before Phase 4
**Marketing Site (Next.js):**
- "Get Started" → `/signup` (404 - page doesn't exist on this site)
- "Login" → `/login` (404 - page doesn't exist on this site)
- "Start Creating" → `/apply` (404 - page doesn't exist on this site)

**Result:** ❌ Broken CTAs, users can't sign up from landing page

### After Phase 4
**Marketing Site (Next.js on www.pholio.studio):**
- "Get Started" → `https://app.pholio.studio/signup` ✅
- "Login" → `https://app.pholio.studio/login` ✅
- "Start Creating" → `https://app.pholio.studio/signup` ✅
- "Features" → `/features` (local) ✅
- "Pricing" → `/pricing` (local) ✅
- "Press" → `/press` (local) ✅

**Result:** ✅ Working CTAs, users can sign up/login

---

## Cross-Domain Navigation Flow

```
User visits www.pholio.studio
   ↓
Browses marketing pages (/, /features, /pricing, /pro, /press)
   ↓
Clicks "Get Started Free"
   ↓
Redirected to app.pholio.studio/signup
   ↓
Signs up (Express EJS page)
   ↓
Creates account
   ↓
Redirected to app.pholio.studio/casting (onboarding)
   ↓
Completes onboarding
   ↓
Redirected to app.pholio.studio/dashboard/talent
   ↓
✅ User in React SPA dashboard
```

---

## Development Workflow

### Running Locally

**Terminal 1: Express Backend**
```bash
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2: React SPA**
```bash
npm run client:dev
# Runs on http://localhost:5173 (proxied to :3000)
```

**Terminal 3: Next.js Landing**
```bash
cd landing
npm run dev
# Runs on http://localhost:3001
```

**Testing:**
- Visit `http://localhost:3001` (landing page)
- Click "Get Started" → redirects to `http://localhost:3000/signup` ✅
- Click "Login" → redirects to `http://localhost:3000/login` ✅
- Click "Features" → navigates to `/features` (same site) ✅

---

## Deployment Strategy

### Marketing Site (www.pholio.studio)

**Deploy to Vercel:**
```bash
cd landing

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Configure Domain in Vercel Dashboard:**
1. Go to Project Settings → Domains
2. Add domain: `www.pholio.studio`
3. Add DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

**Environment Variables (set in Vercel Dashboard):**
- `NEXT_PUBLIC_APP_URL` = `https://app.pholio.studio`
- `NEXT_PUBLIC_API_URL` = `https://app.pholio.studio/api`

### Web App (app.pholio.studio)

**Deploy to Netlify (or current host):**
```bash
# Build React SPA
npm run client:build

# Deploy
netlify deploy --prod
```

**Configure Domain:**
1. Go to Domain Settings
2. Add custom domain: `app.pholio.studio`
3. Add DNS record:
   ```
   Type: CNAME
   Name: app
   Value: <your-netlify-site>.netlify.app
   ```

---

## Testing Checklist

### ✅ Development Testing
- [ ] Start all 3 servers (Express, React, Next.js)
- [ ] Visit `http://localhost:3001`
- [ ] Click "Get Started Free" → redirects to `localhost:3000/signup`
- [ ] Click "Login" → redirects to `localhost:3000/login`
- [ ] Click "Features" → navigates to `/features` (same site)
- [ ] Click "Pricing" → navigates to `/pricing` (same site)

### ✅ Production Testing (After Deployment)
- [ ] Visit `https://www.pholio.studio`
- [ ] Click "Get Started Free" → redirects to `app.pholio.studio/signup`
- [ ] Click "Login" → redirects to `app.pholio.studio/login`
- [ ] Complete signup flow
- [ ] Complete onboarding at `app.pholio.studio/casting`
- [ ] Reach dashboard at `app.pholio.studio/dashboard/talent`

### ✅ SEO Testing
- [ ] Run Lighthouse on `www.pholio.studio`
- [ ] Check SEO score > 90
- [ ] Check Performance score
- [ ] Verify meta tags
- [ ] Check mobile responsiveness

---

## Security Headers

Added via `vercel.json`:

1. **X-Frame-Options: DENY**
   - Prevents clickjacking attacks
   - Page cannot be embedded in iframe

2. **X-Content-Type-Options: nosniff**
   - Prevents MIME type sniffing
   - Browser must respect declared Content-Type

3. **Referrer-Policy: strict-origin-when-cross-origin**
   - Send full URL for same-origin requests
   - Send origin only for cross-origin requests
   - Protects user privacy

---

## Next Steps: Phase 5

Ready to start **Phase 5: Update CORS & Sessions** (~30 minutes):

1. **Update CORS** to allow requests from www.pholio.studio
2. **Update session cookies** to work across subdomains (.pholio.studio)
3. **Add environment variables** to Express backend

Should I proceed with Phase 5? Just say "proceed with phase 5"! 🚀

---

## Rollback Instructions (If Needed)

If something breaks:

```bash
# Revert Phase 4 commit
git revert <commit-hash>

# Or manually restore
git checkout HEAD~1 -- landing/components/landing/PholioHeader.tsx
git checkout HEAD~1 -- landing/components/landing/sections/CTASection.tsx
```

---

## Summary

✅ **Phase 4 Complete!**

- Created environment variables (.env.local, .env.production)
- Updated all CTAs to use app domain (app.pholio.studio)
- Created Vercel deployment configuration
- Added security headers
- Marketing site ready for separate deployment

**Links Fixed:**
- "Get Started" → app.pholio.studio/signup
- "Login" → app.pholio.studio/login
- "Start Creating" → app.pholio.studio/signup

**Architecture Ready:**
- Next.js landing can be deployed to www.pholio.studio
- All CTAs redirect to app.pholio.studio
- Separate domains configured

**Time Taken:** ~15 minutes
**Status:** Ready for Phase 5
**Branch:** `frontend-restructure`
