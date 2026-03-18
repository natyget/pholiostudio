# Casting Call Flow Documentation

**Last Updated:** 2026-02-11
**Status:** Active
**Version:** v2 (Linear Flow)

---

## Overview

Pholio uses a **"2-Minute Casting Call"** onboarding system for new talent users. This replaced the older multi-step identity-based onboarding in early 2025.

### Active Flow

```
Entry → Scout → Measurements → Profile → Complete
```

**Total Steps:** 4 core steps
**Estimated Time:** ~2 minutes
**User Type:** TALENT role only

---

## Step-by-Step Breakdown

### 1. **Entry** (`/casting/entry`)
**Purpose:** Authentication and account creation
**Methods:**
- Google OAuth (recommended)
- Manual email signup with verification

**Data Collected:**
- Firebase UID or email/password
- Display name (from OAuth or manual input)

**State Transition:**
- OAuth → Immediately advances to `scout`
- Manual → Requires email verification via `verification_pending` → `scout`

**Backend Route:** `POST /casting/entry`
**Client Component:** `CastingEntry.jsx`

---

### 2. **Scout** (`/casting/scout`)
**Purpose:** Visual interview - single headshot photo upload with AI analysis
**User Action:** Upload 1 natural light headshot (no filters, no sunglasses)

**AI Processing:**
- Analyzes photo for phenotype (hair color, eye color, skin tone)
- Predicts measurements (height, bust, waist, hips, weight)
- Stores predictions in `step_data.scout`

**Data Collected:**
- Photo storage key
- AI predictions (height_cm, weight_lbs, bust, waist, hips)
- Appearance traits (hair_color, eye_color, skin_tone)

**State Transition:** `scout` → `measurements`

**Backend Route:** `POST /casting/scout`
**Client Component:** `CastingScout.jsx`

---

### 3. **Measurements** (`/casting/measurements`)
**Purpose:** Confirm or adjust AI-predicted measurements
**User Action:** Review and adjust height, weight, bust, waist, hips using precision dials

**Features:**
- Unit toggle (Imperial ↔ Metric)
- AI predictions pre-filled
- Visual "AI Badge" shows which values came from Scout
- Sequential wizard: height → weight → bust → waist → hips → review

**Data Saved:**
- `height_cm`, `weight_kg`, `bust_cm`, `waist_cm`, `hips_cm`
- Converted to profile fields: `height_cm`, `weight_kg`, `weight_lbs`, `bust`, `waist`, `hips`

**State Transition:** `measurements` → `profile`

**Backend Route:** `POST /casting/measurements`
**Client Component:** `CastingMeasurements.jsx`

---

### 4. **Profile** (`/casting/profile`)
**Purpose:** Collect location and experience level
**User Action:** Enter city/location and select experience level

**Data Collected:**
- `city` (location string, autocomplete from CITIES dataset)
- `experience_level` (beginner | intermediate | professional)

**State Transition:** `profile` → `done`

**Backend Route:** `POST /casting/profile`
**Client Component:** `CastingProfile.jsx`

---

### 5. **Complete** (`/casting/complete`)
**Purpose:** Finalize casting call and unlock dashboard
**Backend Action:**
- Sets `onboarding_completed_at` timestamp
- Transitions state to `done`
- Unlocks dashboard access

**Redirect:** `/dashboard/talent?casting_complete=1`

**Backend Route:** `POST /casting/complete`
**Client Component:** Auto-redirect view in `CastingCallPage.jsx`

---

## State Machine

**Location:** `src/lib/onboarding/casting-machine.js`

### State Structure
```json
{
  "version": "v2_casting_call",
  "current_step": "scout",
  "completed_steps": ["entry"],
  "step_data": {
    "entry": { "auth_method": "google", "updated_at": "2026-02-11T10:30:00Z" },
    "scout": {
      "photo_url": "...",
      "predictions": { "height_cm": 175, ... },
      "updated_at": "2026-02-11T10:32:00Z"
    }
  },
  "started_at": "2026-02-11T10:30:00Z"
}
```

### Transitions
```
entry → [scout, verification_pending]
verification_pending → scout
scout → measurements
measurements → profile
profile → done
done → (terminal)
```

### Functions
- `getState(profile)` - Deserialize state from `onboarding_state_json`
- `getCurrentStep(profile)` - Get current step name
- `transitionTo(state, targetStep, stepData, knex)` - Build update payload for transition
- `canComplete(state)` - Check if all prerequisites met for completion
- `canTransitionTo(from, to, completedSteps)` - Validate transition

---

## Database Schema

### Profile Fields (Casting-Related)
```sql
-- State tracking
onboarding_stage VARCHAR(50)              -- Legacy: current step name
onboarding_state_json JSON/TEXT           -- New: full state object
onboarding_completed_at TIMESTAMP         -- Completion timestamp

-- Data collected during flow
first_name, last_name, city, phone
height_cm, weight_kg, weight_lbs
bust, waist, hips
photo_key_primary                         -- Storage key for Scout photo
analysis_status                           -- 'pending' | 'complete' | 'failed'
```

### Signals Table (Optional - Legacy)
The `onboarding_signals` table was used for archetype calculation but is no longer part of the core flow.

---

## Deprecated Routes

### ⚠️ Vibe Step (Removed)
**Original Purpose:** 3-question psychographic assessment (ambition, travel, comfort level)
**Status:** Commented out in `src/routes/casting.js`
**Reason:** Not used in current linear flow

### ⚠️ Reveal Step (Removed)
**Original Purpose:** Calculate and display model archetype (commercial/editorial/lifestyle)
**Status:** Commented out in `src/routes/casting.js`
**Reason:** Depended on Vibe step; archetype calculation moved to post-onboarding

### ⚠️ Old Onboarding System
**Routes:** `/onboarding/*` (identity, upload, confirm, goals)
**Status:** Redirects to `/casting` but POST routes still exist for backward compatibility
**State Machine:** `src/lib/onboarding/state-machine.js` (kept for legacy data)
**Reason:** Replaced by faster casting call flow

---

## Client-Side Implementation

### Main Controller
**File:** `client/src/routes/casting/CastingCallPage.jsx`

**Responsibilities:**
- Manages `currentView` state (entry | scout | measurements | profile | complete)
- Handles step transitions via callbacks
- Auto-resumes from `current_step` if user returns mid-flow
- Auto-redirects to dashboard when `current_step === 'done'`

### API Hooks
**File:** `client/src/hooks/useCasting.js`

**Available Hooks:**
```javascript
useCastingStatus()         // GET /casting/status - polls every 5s
useCastingEntry()          // POST /casting/entry
useCastingScout()          // POST /casting/scout
useCastingMeasurements()   // POST /casting/measurements
useCastingProfile()        // POST /casting/profile
useCastingComplete()       // POST /casting/complete
```

---

## Common Issues & Debugging

### Issue: User stuck in "verification_pending"
**Cause:** Manual email signup without verification
**Solution:** Check `users.email_verified` field. For dev: use code `000000` to bypass.

### Issue: AI predictions not showing
**Cause:** Scout analysis failed or photo_key_primary not set
**Debug:** Check `profiles.analysis_status` (should be 'complete')
**Fix:** Retry photo upload or check Groq API key

### Issue: Can't complete casting call
**Cause:** Not all steps completed
**Debug:** Check `onboarding_state_json.completed_steps` array
**Required:** `['entry', 'scout', 'measurements', 'profile']`

### Issue: State machine transition error
**Cause:** Invalid state transition
**Debug:** Check console for `[StateMachine] Invalid transition` warnings
**Fix:** Ensure transitions follow linear flow (no skipping)

---

## Testing

### Manual Testing Flow
1. Start at `/casting` (logged out)
2. Sign in with Google (or manual email)
3. Upload headshot → Verify AI predictions appear
4. Adjust measurements → Verify calculations (metric ↔ imperial)
5. Enter location + experience → Complete
6. Verify redirect to `/dashboard/talent?casting_complete=1`

### Backend Testing
```bash
# Check state for a profile
SELECT onboarding_stage, onboarding_state_json FROM profiles WHERE id = '...';

# Verify completion
SELECT onboarding_completed_at FROM profiles WHERE id = '...';
```

---

## Migration Notes

### From Old Onboarding to Casting Call

If a user started the old onboarding (`identity` step) but didn't complete:
1. Their `onboarding_stage` will be one of: identity, upload, confirm, goals
2. The `/onboarding` route will redirect them to `/casting`
3. The casting flow will initialize a NEW state starting at `entry`
4. Old data (first_name, last_name) will be preserved if already set

**Recommendation:** For users with `onboarding_stage IN ('identity', 'upload')` and no photos, consider a data migration to reset them to the new flow.

---

## Future Enhancements

Planned features (not yet implemented):
- Video polaroid upload (in addition to photo)
- Multi-photo upload for Scout (analyze best photo)
- Archetype reveal as post-onboarding feature
- Instagram photo import for Scout

---

## Related Files

**Backend:**
- `src/routes/casting.js` - All casting call routes
- `src/lib/onboarding/casting-machine.js` - State machine logic
- `src/lib/onboarding/signal-collector.js` - Signals storage (legacy)
- `src/lib/ai/photo-analysis.js` - Groq AI integration

**Client:**
- `client/src/routes/casting/CastingCallPage.jsx` - Main controller
- `client/src/routes/casting/CastingEntry.jsx` - Step 1 component
- `client/src/routes/casting/CastingScout.jsx` - Step 2 component
- `client/src/routes/casting/CastingMeasurements.jsx` - Step 3 component
- `client/src/routes/casting/CastingProfile.jsx` - Step 4 component
- `client/src/hooks/useCasting.js` - API hooks

**Styling:**
- `client/src/routes/casting/CastingCinematic.css` - Cinematic UI styles

---

## Contact

For questions or issues with the casting flow, refer to:
- **Design Docs:** `docs/CASTING_CALL_PHASE2_COMPLETE.md`
- **Architecture:** `CLAUDE.md`
- **Issues:** Report at https://github.com/anthropics/claude-code/issues
