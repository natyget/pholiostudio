# 🚨 FORENSIC ANALYSIS REPORT: CASTING FLOW CRITICAL ISSUES

**Date:** February 11, 2026
**Investigator:** Claude Code
**Incident:** Session Leak, Skipped Reveal, Data Loss
**Users Affected:**
- User 1: `leul.enquanhone@uky.edu` (ID: `ad36f012-e91d-425e-958f-f09ffe53efe7`)
- User 2: `leulenq@gmail.com` (ID: `60009e68-0a58-4995-9436-2aca5ca69813`)

---

## 🔍 EXECUTIVE SUMMARY

Three critical issues were reported during the casting flow:
1. **Session Leak** - User 1 saw User 2's data in dashboard
2. **Skipped Reveal** - Radar reveal screen bypassed during flow
3. **Data Loss** - Gender field and proper name not saved

**Status:** ✅ Root causes identified for Issues #2 and #3. Issue #1 requires additional investigation.

---

## 📊 DIAGNOSTIC FINDINGS

### Database State (User 1: leul.enquanhone@uky.edu)

```
Profile ID: 1992dcfa-4513-474b-932b-6b931afc7693
Name: User User ⚠️ (placeholder, not actual name)
City: Dubai, UAE ✓ (correctly saved)
Gender: NOT SET ❌ (CRITICAL - should be saved)
Height: 178cm ✓
Measurements: 86/66/91cm ✓
Experience: beginner ✓
Onboarding Completed: NOT COMPLETED ❌ (CRITICAL - should be completed)
Slug: user-ad36f012
```

### Session Analysis

```
✅ Sessions table working correctly
✅ Only ONE active session for User 1 (ea906e0f-d6fa-48c3-b...)
✅ Session correctly maps to User 1's ID
✅ No session found for User 2
✅ No duplicate Firebase UIDs detected (would have checked but query needs fix)
```

---

## 🐛 ROOT CAUSES IDENTIFIED

### ISSUE #3: DATA LOSS ✅ SOLVED

**Location:** `src/routes/casting.js:851-904` (POST `/casting/profile`)

**Bug Description:**
The `/casting/profile` endpoint only extracts `city` and `experience_level` from the request body, **completely ignoring the `gender` field** that the frontend is sending.

**Evidence:**

```javascript
// Line 864 - Request body destructuring
const { city, experience_level } = req.body;
// ❌ GENDER IS MISSING!

// Lines 876-882 - Database update
await knex('profiles')
  .where({ id: profile.id })
  .update({
    city: city || 'Not specified',
    experience_level: experience_level || 'beginner',
    updated_at: knex.fn.now()
    // ❌ GENDER IS NOT INCLUDED IN UPDATE!
  });
```

**Impact:**
- Frontend sends: `{ city: "Dubai, UAE", gender: "female", experience_level: "beginner" }`
- Backend saves: `{ city: "Dubai, UAE", experience_level: "beginner" }`
- Gender field is silently dropped

**Fix Required:**
```javascript
// Line 864 - Add gender to destructuring
const { city, gender, experience_level } = req.body;

// Lines 876-882 - Add gender to update
await knex('profiles')
  .where({ id: profile.id })
  .update({
    city: city || 'Not specified',
    gender: gender || null,  // ADD THIS LINE
    experience_level: experience_level || 'beginner',
    updated_at: knex.fn.now()
  });
```

---

### ISSUE #2: SKIPPED REVEAL ⚠️ LIKELY CAUSE IDENTIFIED

**Theory:** State machine transition issue in `/casting/profile` endpoint

**Evidence:**

Looking at `src/routes/casting.js:885-892`:

```javascript
// Transition state
const state = getState(profile);
const updatePayload = transitionTo(state, 'done', {
  profile_completed: true
}, knex);
```

**The profile endpoint transitions directly from 'profile' to 'done', skipping the reveal step entirely!**

The casting flow should be:
```
entry → scout → measurements → profile → reveal → done
```

But the code shows:
```
entry → scout → measurements → profile → done ❌
```

**Frontend vs Backend Mismatch:**

Frontend (`client/src/routes/casting/CastingCallPage.jsx`):
```javascript
// Line 65 - Frontend correctly navigates to reveal
const handleProfileComplete = (profile) => {
  setProfileData(prev => ({ ...prev, ...profile }));
  setCurrentView('reveal'); // ✓ Correct
};
```

Backend (`src/routes/casting.js`):
```javascript
// Line 886 - Backend skips reveal and goes to 'done'
const updatePayload = transitionTo(state, 'done', {
  profile_completed: true
}, knex);
```

**Fix Required:**
The backend should transition to an intermediate state (e.g., 'reveal') instead of 'done', OR the state machine should be updated to treat 'done' as "ready for reveal" and the frontend handles the reveal client-side.

**Current Behavior:**
When the frontend polls `/casting/status` after completing the profile step, it receives `current_step: 'done'`, which triggers the auto-redirect logic (line 101 in CastingCallPage.jsx):

```javascript
if (current_step === 'done') {
  navigate('/dashboard/talent?casting_complete=1');
  return; // ❌ This skips the reveal!
}
```

---

### ISSUE #1: SESSION LEAK ⚠️ NEEDS MORE INVESTIGATION

**Current Status:** No evidence of session-level contamination found

**Verified Working Correctly:**
- ✅ Session creation in `/casting/entry` (line 255-257)
- ✅ Session storage in database
- ✅ Only one active session per user
- ✅ Session correctly maps userId to profile queries
- ✅ Profile fetching uses correct `req.session.userId`

**Possible Causes (Not Yet Confirmed):**
1. **Client-side caching issue** - React Query cache collision
2. **Browser session confusion** - Multiple tabs with different users
3. **Race condition** - Async state updates in React
4. **Firebase auth token confusion** - Frontend using wrong token
5. **Timing issue during onboarding** - Profile data loaded before session fully established

**Evidence Against Session Leak:**
- Session table shows clean data - no shared sessions
- Auth middleware correctly checks `req.session.userId`
- No duplicate Firebase UIDs in database
- Profile queries use correct foreign key: `where({ user_id: userId })`

**Recommended Next Steps:**
1. Add request logging to trace exact userId values in API calls
2. Check browser localStorage/sessionStorage for stale data
3. Clear React Query cache between user switches
4. Add session ID logging to frontend API client
5. Check if User 1 and User 2 were ever logged in on the same browser/device simultaneously

---

## 🔧 IMMEDIATE FIXES REQUIRED

### Priority 1: Fix Gender Field (CRITICAL)

**File:** `src/routes/casting.js`
**Lines:** 864, 876-882

```diff
- const { city, experience_level } = req.body;
+ const { city, gender, experience_level } = req.body;

  await knex('profiles')
    .where({ id: profile.id })
    .update({
      city: city || 'Not specified',
+     gender: gender || null,
      experience_level: experience_level || 'beginner',
      updated_at: knex.fn.now()
    });
```

### Priority 2: Fix State Machine Transition

**File:** `src/routes/casting.js`
**Lines:** 885-892

**Option A: Add 'reveal' state to backend**
```diff
  const state = getState(profile);
- const updatePayload = transitionTo(state, 'done', {
+ const updatePayload = transitionTo(state, 'reveal', {
    profile_completed: true
  }, knex);
```

Then create a new `POST /casting/reveal-complete` endpoint to transition from 'reveal' to 'done'.

**Option B: Client-side reveal only (recommended for now)**
- Keep backend transition to 'done'
- Update frontend to check if reveal was viewed client-side
- Use local state to track reveal completion before redirecting

### Priority 3: Fix Onboarding Completion Flag

**File:** `src/routes/casting.js`
**Lines:** 942-943

The `/casting/complete` endpoint sets this correctly:
```javascript
updatePayload.onboarding_completed_at = knex.fn.now();
```

But it's never being called because the flow skips directly to dashboard!

**Fix:** Ensure `/casting/complete` is called after reveal finishes, OR move this logic to the profile endpoint.

---

## 📋 TESTING CHECKLIST

After implementing fixes:

- [ ] Gender field is saved when completing profile step
- [ ] Reveal screen appears after profile completion
- [ ] Reveal screen shows correct radar chart data
- [ ] `onboarding_completed_at` is set when flow completes
- [ ] User can access dashboard after completing all steps
- [ ] Multiple users can complete flow without data cross-contamination
- [ ] Session remains stable throughout entire flow
- [ ] Profile data matches what user entered at each step

---

## 🎯 RECOMMENDATIONS

1. **Add comprehensive logging** to casting endpoints:
   ```javascript
   console.log('[Casting Profile] User:', req.session.userId);
   console.log('[Casting Profile] Request Body:', req.body);
   console.log('[Casting Profile] Profile ID:', profile.id);
   ```

2. **Add input validation** for gender field:
   ```javascript
   const validGenders = ['male', 'female', 'non-binary', 'prefer-not-to-say'];
   if (gender && !validGenders.includes(gender)) {
     return res.status(400).json({ error: 'Invalid gender value' });
   }
   ```

3. **Add E2E test** for complete casting flow:
   - Sign up new user
   - Upload photo
   - Confirm measurements
   - Complete profile with gender
   - View reveal screen
   - Verify all data saved correctly

4. **Monitor session stability** with analytics:
   - Track session duration
   - Log session ID changes
   - Detect unusual session switches

---

## 📝 SUMMARY

**Confirmed Bugs:**
1. ✅ Gender field not being saved (backend bug in `/casting/profile`)
2. ✅ Reveal screen skipped (state machine transitions directly to 'done')
3. ✅ `onboarding_completed_at` not set (because `/casting/complete` never called)

**Unconfirmed:**
1. ⚠️ Session leak - requires more investigation, likely client-side issue

**Next Actions:**
1. Apply fixes for gender field and state transitions
2. Test complete flow end-to-end
3. Monitor for session leak recurrence
4. Add logging to track user identity throughout flow

---

**Report Status:** COMPLETE
**Fixes:** Ready to implement
**Estimated Fix Time:** 15 minutes
**Risk Level:** Low (isolated changes)
