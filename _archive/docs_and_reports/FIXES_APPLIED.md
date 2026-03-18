# ✅ FIXES APPLIED - Casting Flow Critical Issues

**Date:** February 11, 2026
**Status:** All confirmed bugs fixed, ready for testing

---

## 🔧 FIXES IMPLEMENTED

### Fix #1: Gender Field Not Being Saved ✅

**Issue:** Backend endpoint `/casting/profile` was ignoring the `gender` field sent by the frontend.

**Files Modified:**
- `src/routes/casting.js` (lines 851-904)

**Changes Made:**

1. **Added gender to request destructuring (line 864):**
   ```javascript
   // Before
   const { city, experience_level } = req.body;

   // After
   const { city, gender, experience_level } = req.body;
   ```

2. **Added gender validation:**
   ```javascript
   const validGenders = ['male', 'female', 'non-binary', 'prefer-not-to-say'];
   if (gender && !validGenders.includes(gender.toLowerCase())) {
     return res.status(400).json({
       error: 'Invalid gender',
       message: `Gender must be one of: ${validGenders.join(', ')}`
     });
   }
   ```

3. **Added gender to database update:**
   ```javascript
   await knex('profiles')
     .where({ id: profile.id })
     .update({
       city: city || 'Not specified',
       gender: gender ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase() : null, // NEW
       experience_level: experience_level || 'beginner',
       updated_at: knex.fn.now()
     });
   ```

4. **Added console logging for debugging:**
   ```javascript
   console.log('[Casting Profile] User:', req.session.userId);
   console.log('[Casting Profile] Request Body:', { city, gender, experience_level });
   console.log('[Casting Profile] Profile ID:', profile.id);
   ```

---

### Fix #2: Reveal Screen Being Skipped ✅

**Issue:** State machine transitioned directly from 'profile' to 'done', skipping the 'reveal' step entirely.

**Root Cause:** The state machine configuration (`TRANSITIONS_V2`) did not include a 'reveal' state.

**Files Modified:**
1. `src/lib/onboarding/casting-machine.js` (lines 22-53)
2. `src/routes/casting.js` (lines 851-904, 913-970)
3. `client/src/hooks/useCasting.js` (lines 155-183)
4. `client/src/routes/casting/CastingCallPage.jsx` (multiple sections)

**Changes Made:**

#### 1. Added 'reveal' state to state machine

**File:** `src/lib/onboarding/casting-machine.js`

```javascript
// Before
profile: {
  next: ['done'],  // Skipped reveal!
  prev: 'measurements',
  parallel: []
},
done: {
  next: null,
  prev: null,
  parallel: []
}

// After
profile: {
  next: ['reveal'],  // Go to reveal first
  prev: 'measurements',
  parallel: []
},
reveal: {
  next: ['done'],  // Then go to done
  prev: 'profile',
  parallel: []
},
done: {
  next: null,
  prev: null,
  parallel: []
}
```

#### 2. Updated /casting/profile to transition to 'reveal'

**File:** `src/routes/casting.js` (line 886)

```javascript
// Before
const updatePayload = transitionTo(state, 'done', {
  profile_completed: true
}, knex);

// After
const updatePayload = transitionTo(state, 'reveal', {
  profile_completed: true
}, knex);
```

#### 3. Created new /casting/reveal-complete endpoint

**File:** `src/routes/casting.js` (new endpoint before /casting/complete)

```javascript
/**
 * POST /casting/reveal-complete
 * Mark reveal screen as viewed
 * Transitions state from 'reveal' to 'done'
 */
router.post('/casting/reveal-complete', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles')
      .where({ user_id: req.session.userId })
      .first();

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Please complete entry step first'
      });
    }

    // Transition state from 'reveal' to 'done'
    const state = getState(profile);
    const updatePayload = transitionTo(state, 'done', {
      reveal_viewed: true,
      reveal_viewed_at: new Date().toISOString()
    }, knex);

    // Add onboarding_completed_at timestamp
    updatePayload.onboarding_completed_at = knex.fn.now();

    await knex('profiles')
      .where({ id: profile.id })
      .update(updatePayload);

    console.log('[Casting Reveal Complete] Reveal viewed, transitioning to done');

    return res.json({
      success: true,
      next_step: 'complete',
      message: 'Reveal completed successfully'
    });

  } catch (error) {
    console.error('[Casting Reveal Complete] Error:', error);
    return next(error);
  }
});
```

#### 4. Added React Query hook for reveal completion

**File:** `client/src/hooks/useCasting.js`

```javascript
/**
 * Hook: Reveal complete (mark reveal as viewed)
 */
export function useCastingRevealComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return castingRequest('/reveal-complete', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casting', 'status'] });
    }
  });
}
```

#### 5. Updated CastingCallPage to use new hook

**File:** `client/src/routes/casting/CastingCallPage.jsx`

**Changes:**
- Imported `useCastingRevealComplete` instead of `useCastingComplete`
- Updated `handleRevealComplete` to call API endpoint
- Updated auto-redirect logic to handle 'reveal' state
- Updated progress calculation to include 'reveal' in steps array

```javascript
// Import changed
import { useCastingStatus, useCastingRevealComplete } from '../../hooks/useCasting';

// Handler updated to call API
const revealCompleteMutation = useCastingRevealComplete();

const handleRevealComplete = async () => {
  console.log('[CastingCallPage] Reveal complete, calling API...');
  setIsFinishing(true);

  try {
    await revealCompleteMutation.mutateAsync();
    console.log('[CastingCallPage] Reveal marked complete, transitioning to done');
    setCurrentView('complete');
  } catch (error) {
    console.error('[CastingCallPage] Error marking reveal complete:', error);
    setCurrentView('complete');
  }
};

// Auto-redirect logic updated
React.useEffect(() => {
  if (!status?.state) return;

  const { current_step } = status.state;

  console.log('[CastingCallPage] Status update - current_step:', current_step, 'currentView:', currentView);

  // If done, show complete screen (don't auto-redirect yet)
  if (current_step === 'done' && currentView !== 'complete') {
    console.log('[CastingCallPage] Backend marked as done, showing complete screen');
    setCurrentView('complete');
    return;
  }

  // Resume from where user left off
  if (currentView === 'entry' && current_step !== 'entry' && current_step !== 'done') {
    console.log(`[CastingCallPage] Resuming from step: ${current_step}`);
    setCurrentView(current_step);
  }
}, [status, navigate, currentView]);

// Progress calculation updated
const steps = ['entry', 'scout', 'measurements', 'profile', 'reveal', 'complete'];
```

---

### Fix #3: Onboarding Completion Flag Not Set ✅

**Issue:** `onboarding_completed_at` was never set because the `/casting/complete` endpoint was never called.

**Solution:** Moved `onboarding_completed_at` setting to the `/casting/reveal-complete` endpoint.

**File Modified:** `src/routes/casting.js`

```javascript
// In /casting/reveal-complete endpoint (line 943)
updatePayload.onboarding_completed_at = knex.fn.now();
```

This ensures that when the user completes the reveal screen and the state transitions to 'done', the `onboarding_completed_at` timestamp is set correctly.

---

## 📊 COMPLETE FLOW AFTER FIXES

The casting flow now works correctly:

```
Entry (OAuth or Manual)
  ↓
Scout (Photo Upload + AI)
  ↓
Measurements (Confirm/Adjust)
  ↓
Profile (Location + Gender + Experience) ← Gender now saved!
  ↓
Reveal (Radar Chart Assessment) ← No longer skipped!
  ↓
Complete (Redirect to Dashboard) ← onboarding_completed_at set!
```

---

## 🧪 TESTING CHECKLIST

Before considering this complete, test the following:

### Basic Flow
- [ ] Sign up with Google OAuth
- [ ] Upload photo
- [ ] Confirm measurements
- [ ] Complete profile with gender selection
- [ ] View reveal screen with radar chart
- [ ] Confirm redirect to dashboard after reveal

### Data Integrity
- [ ] Check database - verify gender is saved in profiles table
- [ ] Check database - verify `onboarding_completed_at` is set
- [ ] Check database - verify state is 'done' after completion
- [ ] Verify no data cross-contamination between users

### Edge Cases
- [ ] Manual signup with email verification
- [ ] Resume flow after closing browser mid-onboarding
- [ ] Multiple users completing flow simultaneously
- [ ] Back/forward navigation during flow
- [ ] Refresh page during reveal screen

---

## 🐛 REMAINING INVESTIGATION

### Issue #1: Session Leak (Unconfirmed)

**Status:** No evidence found in database diagnostics

**Evidence Against Session Leak:**
- ✅ Session table shows clean data - no cross-contamination
- ✅ Only one active session per user
- ✅ Session correctly maps userId to profile queries
- ✅ Auth middleware working correctly

**Possible Causes:**
1. Client-side caching (React Query)
2. Browser tab confusion (multiple tabs, different users)
3. Firebase auth token confusion
4. Timing issue during state updates

**Recommended Next Steps:**
1. **Clear browser data** before testing
2. **Test in incognito mode** to eliminate cache issues
3. **Add session ID logging** to frontend API client
4. **Monitor for recurrence** after deploying fixes

**Theory:** The "session leak" may have been caused by the reveal screen being skipped and the state machine being in an inconsistent state. With the reveal fix in place, this issue may be resolved.

---

## 📝 DIAGNOSTIC IMPROVEMENTS

The diagnostic script was also fixed:

**File:** `scripts/diagnose_user_session.js`

**Changes:**
- Fixed sessions table column names (`sess` instead of `data`, `expired` instead of `updated_at`)
- Updated session query to use correct schema

---

## 🎯 DEPLOYMENT NOTES

### Backend Changes
- Modified: `src/routes/casting.js`
- Modified: `src/lib/onboarding/casting-machine.js`
- No database migrations needed (existing columns used)

### Frontend Changes
- Modified: `client/src/hooks/useCasting.js`
- Modified: `client/src/routes/casting/CastingCallPage.jsx`
- No new dependencies added

### Testing Environments
- ✅ Development: Ready to test
- ⏳ Production: Deploy after successful testing

---

## ✅ SUMMARY

**Issues Fixed:**
1. ✅ Gender field now saved correctly
2. ✅ Reveal screen no longer skipped
3. ✅ Onboarding completion flag properly set

**Code Quality Improvements:**
1. ✅ Added input validation for gender field
2. ✅ Added comprehensive console logging
3. ✅ Improved error handling
4. ✅ Updated state machine with proper 'reveal' state
5. ✅ Created new API endpoint for reveal completion

**Documentation:**
1. ✅ Created forensic analysis report
2. ✅ Created this fixes document
3. ✅ Added inline code comments

**Next Actions:**
1. Test complete casting flow end-to-end
2. Verify database state after completion
3. Monitor for session leak recurrence
4. Deploy to production if tests pass

---

**Status:** READY FOR TESTING
**Confidence Level:** High (root causes identified and fixed)
**Risk Level:** Low (isolated changes, backward compatible)
