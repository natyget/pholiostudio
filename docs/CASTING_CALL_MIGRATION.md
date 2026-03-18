# Migration to Casting Call System - Complete ✅

**Date:** February 5, 2026  
**Status:** COMPLETE

---

## 🎯 Objective

Replace the old `/apply/onboarding` multi-step form with the new **"2-Minute Casting Call"** system for all new talent signups.

---

## 📝 Changes Made

### 1. **Updated `/apply` Route** ✅
**File:** `src/routes/apply.js`

**Changes:**
- `/apply` now redirects to `/casting` instead of rendering the old onboarding form
- `/apply/:agencySlug` redirects to `/casting` while preserving `lockedAgencyId` in session
- Logged-in users with incomplete onboarding are redirected to `/casting`

**Before:**
```javascript
// Rendered apply/index-onboarding.ejs
return res.render('apply/index-onboarding', { ... });
```

**After:**
```javascript
// Redirects to new casting call system
return res.redirect('/casting');
```

---

### 2. **Updated `/onboarding` Route** ✅
**File:** `src/routes/onboarding.js`

**Changes:**
- GET `/onboarding` now redirects to `/casting` for users with incomplete onboarding
- Marked as DEPRECATED with clear comments
- Completed onboarding users still redirect to dashboard

**Before:**
```javascript
// Rendered full-screen multi-step onboarding
return res.render('onboarding/index', { ... });
```

**After:**
```javascript
// Redirects to new casting call system
return res.redirect('/casting');
```

---

## 🔄 User Flow (New)

```
┌─────────────────────────────────────────────────────┐
│  User visits /apply or /apply/:agencySlug           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Redirect to /casting                                │
│  (Session preserves lockedAgencyId if applicable)   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Casting Call Entry (React SPA)                      │
│  - Google OAuth via Firebase                         │
│  - POST /casting/entry creates user + profile        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Scout (Photo Upload) OR Vibe (3 Questions)          │
│  - User chooses which to do first                    │
│  - Can complete in any order                         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Reveal (Archetype Display)                          │
│  - Animated radar chart                              │
│  - Commercial/Editorial/Lifestyle percentages        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Redirect to /dashboard/talent                       │
│  - Onboarding complete                               │
└─────────────────────────────────────────────────────┘
```

---

## 🗂️ Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `src/routes/apply.js` | Modified | Redirects to `/casting` |
| `src/routes/onboarding.js` | Modified | Redirects to `/casting` |
| `src/routes/casting.js` | Modified | Added GET route to redirect to Vite frontend |
| `client/.env.local` | Created | Firebase configuration template |

---

## 🔧 Technical Details

### Backend Redirect Flow

When a user visits `http://localhost:3000/casting`:
1. Express backend receives the request
2. GET `/casting` route redirects to `http://localhost:5173/casting`
3. Vite dev server serves the React app
4. React Router loads `CastingCallPage` component

### API Endpoints (Already Implemented)

All backend API endpoints are ready:
- `POST /casting/entry` - OAuth authentication
- `POST /casting/scout` - Photo upload + AI analysis
- `POST /casting/vibe` - 3-question assessment
- `GET /casting/reveal` - Archetype calculation
- `GET /casting/status` - State polling

---

## 🚀 What's Next

### Frontend Setup Required:

1. **Install Dependencies** (in `client/` directory):
   ```bash
   cd client
   npm install firebase react-dropzone chart.js react-chartjs-2
   ```

2. **Configure Firebase** (create `client/.env.local`):
   ```bash
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Test the Flow**:
   ```bash
   # Start both servers
   npm run dev:all
   
   # Visit http://localhost:3000/apply
   # Should redirect to http://localhost:5173/casting
   ```

---

## ✅ Verification Checklist

- [x] `/apply` redirects to `/casting`
- [x] `/apply/:agencySlug` redirects to `/casting` with session preserved
- [x] `/onboarding` redirects to `/casting` for incomplete users
- [x] Completed users redirect to dashboard
- [ ] Frontend dependencies installed
- [ ] Firebase configured
- [ ] End-to-end flow tested

---

## 📚 Related Documentation

- **Phase 2 (Backend):** `docs/CASTING_CALL_PHASE2_COMPLETE.md`
- **Phase 3 (Frontend):** `docs/CASTING_CALL_PHASE3_COMPLETE.md`
- **Installation Guide:** `docs/CASTING_CALL_PHASE3_INSTALL.md`

---

## 🎉 Benefits

1. **Faster Onboarding:** 2 minutes vs 10+ minutes
2. **Modern UX:** React SPA with smooth animations
3. **AI-Powered:** Automatic measurements and archetype detection
4. **Non-Linear Flow:** Users choose their own path (Scout or Vibe first)
5. **Brand-Compliant:** Luxury editorial styling with gold gradients

---

**Migration Complete!** 🚀
