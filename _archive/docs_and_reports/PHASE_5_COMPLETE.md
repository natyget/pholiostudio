# Phase 5 Complete: CORS & Session Configuration ✅
**Date:** February 14, 2026
**Branch:** `frontend-restructure`
**Commit:** (next commit)

---

## What Was Done

### 1. Updated CORS Configuration

**File: `src/app.js`**

**Before (single origin):**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

**After (multiple origins with environment detection):**
```javascript
// Determine allowed origins based on environment
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server (React SPA)
  'http://localhost:3001',  // Next.js dev server (Landing page)
];

// Add production origins if in production
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(
    'https://www.pholio.studio',      // Marketing site (Next.js)
    'https://app.pholio.studio'       // App site (this server)
  );
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

**Why this matters:**
- Development: Allows requests from both Vite (React) and Next.js dev servers
- Production: Allows requests from marketing site (www.pholio.studio) to app site (app.pholio.studio)
- `credentials: true` allows cookies to be sent cross-origin

**Without this change:**
- Marketing site CTAs would fail with CORS errors
- No cookies could be shared between domains
- Login/signup flows would break

---

### 2. Updated Session Cookie Configuration

**File: `src/app.js`**

**Before (no domain setting):**
```javascript
cookie: {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.nodeEnv === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 7
}
```

**After (with cross-subdomain support):**
```javascript
cookie: {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.nodeEnv === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 7,
  // Allow cookies across subdomains (www.pholio.studio and app.pholio.studio)
  domain: config.nodeEnv === 'production' ? '.pholio.studio' : undefined
}
```

**Cookie Settings Explained:**
- `httpOnly: true` - Cookie cannot be accessed by JavaScript (XSS protection)
- `sameSite: 'lax'` - Cookie sent on same-site and top-level navigation (CSRF protection)
- `secure: true` (prod) - Cookie only sent over HTTPS
- `maxAge: 7 days` - Cookie expires after 7 days
- `domain: '.pholio.studio'` (prod) - Cookie works on www.pholio.studio AND app.pholio.studio

**Why the dot prefix?**
- `.pholio.studio` includes all subdomains (www, app, api, etc.)
- `pholio.studio` (no dot) would only work on the root domain
- `undefined` (dev) means cookie only works on localhost (correct for dev)

**Without this change:**
- Session created on www.pholio.studio would not work on app.pholio.studio
- Users would have to login separately on each subdomain
- Authentication state would not persist across navigation

---

### 3. Added Environment Variables

**File: `.env`** (Development)

```bash
# Domain Configuration (for separate domain architecture)
MARKETING_SITE_URL=http://localhost:3001
APP_URL=http://localhost:3000
COOKIE_DOMAIN=localhost
```

**File: `.env.production.example`** (Production Template)

```bash
# Domain Configuration (for separate domain architecture)
MARKETING_SITE_URL=https://www.pholio.studio
APP_URL=https://app.pholio.studio
COOKIE_DOMAIN=.pholio.studio
```

**Variables Explained:**
- `MARKETING_SITE_URL` - URL of Next.js landing page (for redirects, links)
- `APP_URL` - URL of Express/React app (current server)
- `COOKIE_DOMAIN` - Domain for session cookies

**Usage (future):**
```javascript
// Redirect to marketing site
res.redirect(process.env.MARKETING_SITE_URL + '/pricing');

// Generate links in emails
const signupLink = `${process.env.APP_URL}/signup`;
```

---

## Files Changed

### Modified
```
src/app.js              (CORS + session config)
.env                    (added domain variables)
```

### Created
```
.env.production.example (production config template)
```

---

## CORS Flow (Visual)

### Development
```
Browser @ localhost:3001 (Next.js)
   ↓ Fetch API call
   ↓ Origin: http://localhost:3001
Server @ localhost:3000 (Express)
   ↓ CORS check: Is origin in allowedOrigins?
   ↓ YES → localhost:3001 is allowed
   ✅ Response sent with CORS headers
```

### Production
```
Browser @ www.pholio.studio (Next.js)
   ↓ Fetch API call
   ↓ Origin: https://www.pholio.studio
Server @ app.pholio.studio (Express)
   ↓ CORS check: Is origin in allowedOrigins?
   ↓ YES → www.pholio.studio is allowed
   ✅ Response sent with CORS headers
```

### Without CORS Fix
```
Browser @ www.pholio.studio
   ↓ Fetch API call
Server @ app.pholio.studio
   ↓ CORS check: Is origin in allowedOrigins?
   ↓ NO → only localhost:5173 is allowed
   ❌ CORS error in browser console
```

---

## Session Cookie Flow (Visual)

### With Cross-Subdomain Cookie (After Phase 5)

```
Step 1: User visits www.pholio.studio
   ↓ Clicks "Get Started"
   ↓ Redirected to app.pholio.studio/signup

Step 2: User signs up at app.pholio.studio/signup
   ↓ Express creates session
   ↓ Sets cookie with domain=.pholio.studio
   ✅ Cookie: session=abc123; Domain=.pholio.studio

Step 3: User completes onboarding
   ↓ Still at app.pholio.studio/casting
   ✅ Cookie sent: session=abc123 (domain matches)

Step 4: User clicks "Pricing" link
   ↓ Navigates to www.pholio.studio/pricing
   ✅ Cookie sent: session=abc123 (domain matches!)
   ✅ User still logged in on marketing site
```

### Without Cross-Subdomain Cookie (Before Phase 5)

```
Step 1-2: Same as above
   Cookie: session=abc123; Domain=app.pholio.studio (no dot!)

Step 3: User at app.pholio.studio/casting
   ✅ Cookie sent (domain matches)

Step 4: User navigates to www.pholio.studio
   ❌ Cookie NOT sent (different subdomain)
   ❌ User appears logged out
```

---

## Security Considerations

### CORS Security
✅ **Good Practices Applied:**
- Explicitly list allowed origins (no wildcards)
- Only production domains in production
- `credentials: true` only for trusted origins

❌ **Avoided Anti-Patterns:**
- `origin: '*'` (allows any site - BAD!)
- `origin: true` (reflects request origin - BAD!)
- Not validating origins before setting CORS headers

### Cookie Security
✅ **Good Practices Applied:**
- `httpOnly: true` - JavaScript cannot access (XSS protection)
- `secure: true` in production - HTTPS only
- `sameSite: 'lax'` - CSRF protection
- Domain restricted to `.pholio.studio` (not `.com` - too broad!)

❌ **Avoided Anti-Patterns:**
- `sameSite: 'none'` without good reason
- `domain: .com` (way too broad!)
- No `httpOnly` flag (vulnerable to XSS)

---

## Testing Checklist

### ✅ Development Testing
- [ ] Start Express: `npm run dev` (port 3000)
- [ ] Start React SPA: `npm run client:dev` (port 5173)
- [ ] Start Next.js: `cd landing && npm run dev` (port 3001)
- [ ] Visit Next.js: http://localhost:3001
- [ ] Open browser console (Network tab)
- [ ] Click "Get Started" → redirects to localhost:3000/signup
- [ ] Check for CORS errors → Should be NONE ✅
- [ ] Check cookies → Should see session cookie ✅

### ✅ CORS Testing (Production)
```bash
# Test CORS from marketing site
curl -H "Origin: https://www.pholio.studio" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://app.pholio.studio/api/health

# Should return:
# Access-Control-Allow-Origin: https://www.pholio.studio
# Access-Control-Allow-Credentials: true
```

### ✅ Cookie Testing (Production)
1. Visit www.pholio.studio
2. Click "Get Started" → app.pholio.studio/signup
3. Sign up and login
4. Open DevTools → Application → Cookies
5. Check session cookie:
   - Domain: `.pholio.studio` ✅
   - Secure: true ✅
   - HttpOnly: true ✅
   - SameSite: Lax ✅

6. Navigate back to www.pholio.studio
7. Check cookies → Session cookie still there ✅
8. User appears logged in ✅

---

## Common Issues & Solutions

### Issue 1: CORS Error in Production
**Symptom:**
```
Access to fetch at 'https://app.pholio.studio/api/...' from origin 'https://www.pholio.studio'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Solution:**
- Check `NODE_ENV` is set to `production`
- Verify `www.pholio.studio` is in `allowedOrigins`
- Check request includes `credentials: 'include'`

### Issue 2: Session Not Persisting Across Subdomains
**Symptom:**
- Login on app.pholio.studio works
- Navigate to www.pholio.studio → appears logged out

**Solution:**
- Check cookie domain is `.pholio.studio` (with dot)
- Verify `NODE_ENV=production`
- Check both domains use HTTPS (secure cookies)

### Issue 3: Cookie Not Set in Development
**Symptom:**
- No session cookie appears in DevTools

**Solution:**
- Check `domain: undefined` in development (not `.localhost`)
- Verify Express session middleware is running
- Check for session store errors in console

---

## Environment Configuration Reference

### Development (.env)
```bash
NODE_ENV=development
MARKETING_SITE_URL=http://localhost:3001
APP_URL=http://localhost:3000
COOKIE_DOMAIN=localhost

# CORS allows: localhost:5173, localhost:3001
# Cookie domain: undefined (localhost only)
```

### Production (.env or Vercel/Netlify env vars)
```bash
NODE_ENV=production
MARKETING_SITE_URL=https://www.pholio.studio
APP_URL=https://app.pholio.studio
COOKIE_DOMAIN=.pholio.studio

# CORS allows: www.pholio.studio, app.pholio.studio
# Cookie domain: .pholio.studio (all subdomains)
```

---

## Next Steps: Phase 6

Ready to start **Phase 6: Update Documentation** (~30 minutes):

1. **Update CLAUDE.md** with new architecture
2. **Update README.md** with deployment instructions
3. **Document development workflow**
4. **Add troubleshooting guide**

Should I proceed with Phase 6? Just say "proceed with phase 6"! 🚀

---

## Rollback Instructions (If Needed)

If CORS/sessions break:

```bash
# Revert Phase 5 commit
git revert <commit-hash>

# Or manually restore
git checkout HEAD~1 -- src/app.js
git checkout HEAD~1 -- .env
```

---

## Summary

✅ **Phase 5 Complete!**

- Updated CORS to allow multiple origins (4 allowed)
- Updated session cookies for cross-subdomain support
- Added domain configuration environment variables
- Created production config template

**CORS:** Marketing site can now call app site API
**Sessions:** Cookies work across www and app subdomains
**Security:** Maintained httpOnly, secure, sameSite protections

**Time Taken:** ~20 minutes
**Status:** Ready for Phase 6
**Branch:** `frontend-restructure`
