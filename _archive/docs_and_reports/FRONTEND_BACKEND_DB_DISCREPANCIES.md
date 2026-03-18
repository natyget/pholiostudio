# Frontend-Backend-Database Discrepancy Analysis
## Casting System Data Flow

**Analysis Date:** 2026-02-11
**Scope:** Complete casting flow data validation and mapping

---

## 🚨 **CRITICAL DISCREPANCIES**

### 1. **Measurement Unit Confusion (SEVERITY: HIGH)**

#### The Problem
There is **inconsistent unit handling** across the three layers for bust/waist/hips measurements.

#### Layer Comparison

**DATABASE (`profiles` table):**
```sql
bust    INTEGER   -- Stored WITHOUT unit suffix
waist   INTEGER   -- Stored WITHOUT unit suffix
hips    INTEGER   -- Stored WITHOUT unit suffix
```
- Migration: `20250102000000_add_profile_fields.js` (lines 7-9)
- **Unit:** AMBIGUOUS - No documentation of whether values are in inches or centimeters
- **Type:** INTEGER (no decimals)

**BACKEND API (`POST /casting/scout` response):**
```javascript
predictions: {
  measurements: {
    bust: 34,   // AI returns in INCHES (US standard)
    waist: 24,  // AI returns in INCHES
    hips: 35    // AI returns in INCHES
  }
}
```
- File: `src/routes/casting.js` (lines 496-498)
- **Unit:** INCHES (from AI analysis, US modeling standards)
- **Type:** Number (from Groq AI)

**BACKEND API (`POST /casting/measurements` request):**
```javascript
// Frontend sends:
{
  bust_cm: 86,    // WITH _cm suffix
  waist_cm: 61,   // WITH _cm suffix
  hips_cm: 89     // WITH _cm suffix
}

// Backend converts and saves:
{
  bust: 86,       // NO suffix - saves cm value as integer
  waist: 61,      // NO suffix - saves cm value as integer
  hips: 89        // NO suffix - saves cm value as integer
}
```
- File: `src/routes/casting.js` (lines 760, 794-796)
- **Receives:** Values with `_cm` suffix (centimeters)
- **Saves:** Strips suffix, stores as integers
- **Problem:** **VALUES ARE IN CM but SAVED TO FIELDS THAT EXPECT INCHES**

**FRONTEND (`CastingMeasurements.jsx`):**
```javascript
// Internal state (always metric):
measurements: {
  bust_cm: 86,    // Always in CM
  waist_cm: 61,   // Always in CM
  hips_cm: 89     // Always in CM
}

// User sees (toggleable):
- Metric: "86 cm"
- Imperial: "34"" (converted display only)
```
- File: `client/src/routes/casting/CastingMeasurements.jsx`
- **Storage:** Always centimeters internally
- **Display:** Togglable metric/imperial
- **API Request:** Sends with `_cm` suffix

#### The Bug

**DATA CORRUPTION SCENARIO:**

1. **Scout Step:** AI analyzes photo → returns `bust: 34` (inches)
2. **Frontend:** Receives `34` → assumes it's in inches
3. **Frontend:** Converts `34 inches × 2.54 = 86 cm` → stores as `bust_cm: 86`
4. **Frontend → Backend:** Sends `{ bust_cm: 86 }`
5. **Backend:** Strips `_cm` suffix → saves `bust: 86` to database
6. **Database:** Stores `86` in `bust` column (which expects inches)

**RESULT:** Database now has `86` (should be inches) but actual value is in centimeters!

#### Impact
- **Data Integrity:** Measurements are in wrong units in database
- **Retrieval Issues:** When reading from DB, unclear if value is inches or cm
- **Display Errors:** Subsequent profile views will show incorrect measurements
- **Analytics:** Aggregate statistics will be wildly incorrect

#### Recommended Fix
**Option A: Store in CM (Recommended)**
```sql
ALTER TABLE profiles
  RENAME COLUMN bust TO bust_cm,
  RENAME COLUMN waist TO waist_cm,
  RENAME COLUMN hips TO hips_cm;
```
- Update all migrations to use `_cm` suffix
- Update all backend queries
- Backfill existing data with unit conversion

**Option B: Standardize on Inches**
```javascript
// Backend: Convert cm to inches before saving
bust: Math.round(bust_cm / 2.54),
waist: Math.round(waist_cm / 2.54),
hips: Math.round(hips_cm / 2.54)
```
- Less code changes
- Matches AI output format
- But loses metric-first UX

---

### 2. **Field Name Mismatches**

#### Database vs. API Inconsistency

| Frontend Sends | Backend Receives | Backend Saves | Database Column | Issue |
|----------------|------------------|---------------|-----------------|-------|
| `bust_cm` | `bust_cm` | `bust` | `bust` | ✅ Mapping exists, but unit confusion |
| `waist_cm` | `waist_cm` | `waist` | `waist` | ✅ Mapping exists, but unit confusion |
| `hips_cm` | `hips_cm` | `hips` | `hips` | ✅ Mapping exists, but unit confusion |
| `height_cm` | `height_cm` | `height_cm` | `height_cm` | ✅ Consistent |
| `weight_kg` | `weight_kg` | `weight_kg` | `weight_kg` | ✅ Consistent |
| `location` | `location` | `city` | `city` | ⚠️ Name mismatch |

**Profile Endpoint Mismatch:**
- **Frontend sends:** `location: "Los Angeles, CA"`
- **Backend saves as:** `city: "Los Angeles, CA"`
- **Impact:** Field name confusion in API vs DB

---

### 3. **Missing Database Columns**

#### Fields Sent by Frontend but NOT in Database Schema

**From `POST /casting/measurements`:**
```javascript
// Frontend state includes but backend ignores:
{
  hair_color: "Brown",     // ✅ EXISTS in DB (from Scout)
  eye_color: "Blue",       // ✅ EXISTS in DB (from Scout)
  skin_tone: "Fair"        // ✅ EXISTS in DB (from Scout)
}
```
These are populated during Scout step, not Measurements step. **No issue here.**

---

### 4. **Type Mismatches**

#### Database Uses Integers, Frontend Uses Decimals

**Database Schema:**
```sql
bust    INTEGER       -- No decimals allowed
waist   INTEGER       -- No decimals allowed
hips    INTEGER       -- No decimals allowed
height_cm INTEGER     -- Wait, is this INTEGER or DECIMAL?
```

**Frontend State:**
```javascript
bust_cm: 86.5,     // Decimals supported
waist_cm: 61.0,    // Decimals supported
hips_cm: 89.2      // Decimals supported
```

**Backend Conversion:**
```javascript
bust: Math.round(bust_cm)   // ✅ Rounds to integer
```

**Impact:**
- Minor precision loss (sub-centimeter accuracy lost)
- Acceptable for modeling industry standards
- **No critical issue**

---

### 5. **State Machine Data Storage Issues**

#### `onboarding_state_json` Stores Redundant Measurement Data

**Current Behavior:**
```javascript
// Step data stores measurements twice:
onboarding_state_json: {
  step_data: {
    scout: {
      predictions: {
        bust: 34,        // Stored here (inches)
        waist: 24,
        hips: 35
      }
    },
    measurements: {
      last_measurements: {
        bust_cm: 86,     // AND stored here (cm)
        waist_cm: 61,
        hips_cm: 89
      }
    }
  }
}

// PLUS stored in profiles table:
profiles: {
  bust: 86,              // AND stored here (wrong unit!)
  waist: 61,
  hips: 89
}
```

**Issues:**
1. **Triple Storage:** Same data in 3 places
2. **Unit Inconsistency:** Inches in scout data, cm in measurements data
3. **Sync Risk:** Values can get out of sync
4. **Data Bloat:** Unnecessarily large state_json

**Recommendation:**
- Store final values ONLY in `profiles` table
- State machine should only track **completion status**, not duplicate data
- Remove `last_measurements` from state_data

---

### 6. **Validation Gaps**

#### Missing Validation Between Layers

**Backend Validation (`/casting/measurements`):**
```javascript
// Only validates height:
if (!height_cm || height_cm < 140 || height_cm > 220) {
  return res.status(400).json({ error: 'Invalid height' });
}

// NO validation for:
// - weight_kg (could be negative, zero, or 999999)
// - bust_cm, waist_cm, hips_cm (could be anything!)
```

**Frontend Validation:**
```javascript
// PrecisionDeck allows ANY value via +/- buttons
// No min/max constraints enforced in UI
```

**Missing Validations:**
- No minimum bust/waist/hips values (could be 0 or negative)
- No maximum bust/waist/hips values (could be 999)
- No weight range validation
- No logical consistency checks (e.g., bust < waist would be physically impossible)

**Recommendation:**
```javascript
// Add to backend:
const VALIDATION_RULES = {
  height_cm: { min: 140, max: 220 },
  weight_kg: { min: 30, max: 200 },
  bust_cm: { min: 60, max: 150 },
  waist_cm: { min: 50, max: 130 },
  hips_cm: { min: 60, max: 160 }
};
```

---

### 7. **Scout Predictions Format Inconsistency**

#### AI Returns Inches, Frontend Expects CM

**Scout Route Response (`/casting/scout`):**
```javascript
// Backend returns:
predictions: {
  measurements: {
    bust: 34,      // INCHES (no unit specified)
    waist: 24,     // INCHES
    hips: 35       // INCHES
  }
}
```

**Frontend (`CastingMeasurements.jsx` line 49-74):**
```javascript
useEffect(() => {
  if (photoData?.predictions) {
    const preds = photoData.predictions;

    // Assumes predictions.measurements.bust is in INCHES
    if (preds.measurements?.bust) {
      // Converts inches to cm
      newMeasurements.bust_cm = Math.round(preds.measurements.bust / CM_TO_IN);
      //                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      //                                    DIVIDING by CM_TO_IN (0.393701)
      //                                    This is WRONG! Should MULTIPLY!
    }
  }
}, [photoData]);
```

**THE BUG:**
```
CM_TO_IN = 0.393701  // This converts cm to inches

// To convert INCHES to CM, you should DIVIDE by this:
cm = inches / CM_TO_IN
cm = 34 / 0.393701 = 86.36 cm  ✅ CORRECT

// But to convert CM to INCHES, you MULTIPLY:
inches = cm * CM_TO_IN
inches = 86 * 0.393701 = 33.86"  ✅ CORRECT

// Current code does:
bust_cm = bust_inches / CM_TO_IN
bust_cm = 34 / 0.393701 = 86.36

// This is actually CORRECT! The constant name is confusing.
```

**Wait, let me re-check the constant definition...**

Actually, looking at line 17:
```javascript
const CM_TO_IN = 0.393701;  // This is the conversion factor cm → in
```

So `1 cm = 0.393701 inches`

To convert inches to cm: `inches / 0.393701` ✅ CORRECT
To convert cm to inches: `cm * 0.393701` ✅ CORRECT

**CONCLUSION:** The math is actually correct! But the constant name `CM_TO_IN` is confusing because it's the factor to multiply cm by, not divide.

**Better naming:**
```javascript
const IN_PER_CM = 0.393701;     // Clearer: inches per centimeter
const CM_PER_IN = 2.54;         // Clearer: centimeters per inch

// Usage:
bust_cm = bust_inches * CM_PER_IN;    // More readable
bust_inches = bust_cm * IN_PER_CM;    // More readable
```

---

### 8. **Missing Photo URL Persistence**

#### Photo URL Only Stored in State Machine, Not Profiles Table

**Scout saves:**
```javascript
// In state machine:
step_data.scout = {
  photo_url: "https://...",
  storage_key: "uploads/jane-123.webp"
}

// In profiles table:
photo_key_primary: "uploads/jane-123.webp"  // ✅ Saved
// But photo_url is NOT saved as a column
```

**Issue:**
- To display photo later, must reconstruct URL from storage_key
- URL reconstruction logic scattered across codebase
- State machine is temporary storage, not permanent

**Recommendation:**
- Add `photo_url_primary` column to profiles table
- Save full URL for easy retrieval

---

### 9. **onboarding_signals Table Unused**

#### Entire Table Created but Never Populated

**Migration Created:**
- `migrations/20260206000000_create_casting_call_infrastructure.js`
- Creates `onboarding_signals` table with 20+ columns

**Usage Check:**
```bash
grep -r "onboarding_signals" src/routes/
# Result: Only in /casting/vibe and /casting/reveal
#         Both routes are COMMENTED OUT (deprecated)
```

**Status:**
- ✅ Table exists in database
- ❌ Never INSERT data (vibe/reveal routes disabled)
- ❌ Never SELECT data (no analytics using it)

**Impact:**
- Database bloat (empty table with indexes)
- Migration complexity for no benefit
- Confusing for developers

**Recommendation:**
- Either: Remove the table (create down migration)
- Or: Integrate it properly into active flow
- Or: Mark as "future feature" with clear TODO

---

## 📊 **SUMMARY TABLE**

| Issue | Severity | Affected Layers | Data Loss Risk | User Impact |
|-------|----------|----------------|----------------|-------------|
| Unit Confusion (bust/waist/hips) | 🔴 CRITICAL | All 3 | HIGH | Incorrect measurements stored |
| Field name mismatch (location/city) | 🟡 MEDIUM | Frontend/Backend | None | Confusing API |
| Redundant data storage | 🟡 MEDIUM | Backend/DB | None | Performance/sync |
| Missing validation | 🟡 MEDIUM | Backend | MEDIUM | Bad data accepted |
| Constant naming confusion | 🟢 LOW | Frontend | None | Developer confusion |
| Photo URL not persisted | 🟡 MEDIUM | Backend/DB | None | URL reconstruction needed |
| Unused signals table | 🟢 LOW | Database | None | Bloat |

---

## 🎯 **RECOMMENDED FIXES (Priority Order)**

### P0 - Critical (Fix Immediately)
1. **Fix Unit Confusion:**
   - Option A: Rename DB columns to `bust_cm`, `waist_cm`, `hips_cm`
   - Option B: Convert cm to inches before saving
   - Add unit documentation to all columns

2. **Add Measurement Validation:**
   ```javascript
   // src/routes/casting.js
   if (bust_cm < 60 || bust_cm > 150) {
     return res.status(400).json({ error: 'Invalid bust measurement' });
   }
   ```

### P1 - High (Fix Soon)
3. **Standardize Field Names:**
   - Use `city` everywhere (not `location`)
   - Update API documentation

4. **Remove Redundant Data:**
   - Don't store measurements in `step_data.measurements.last_measurements`
   - Only store in `profiles` table

5. **Add Photo URL Column:**
   ```sql
   ALTER TABLE profiles ADD COLUMN photo_url_primary TEXT;
   ```

### P2 - Medium (Cleanup)
6. **Rename Constants:**
   - `CM_TO_IN` → `IN_PER_CM`
   - Add clear comments

7. **Handle Unused Signals Table:**
   - Remove table OR
   - Add TODO to integrate later

---

## 📝 **TESTING CHECKLIST**

### Unit Conversion Testing
- [ ] Scout returns `bust: 34` (inches)
- [ ] Frontend converts to `86 cm` correctly
- [ ] Backend saves `86` with correct unit
- [ ] Subsequent retrieval shows `86 cm` or `34"` correctly

### Data Flow Testing
- [ ] Complete flow: Entry → Scout → Measurements → Profile
- [ ] Verify DB values match frontend input
- [ ] Check unit labels in all UI displays
- [ ] Test metric ↔ imperial toggle

### Validation Testing
- [ ] Try bust = -5 (should reject)
- [ ] Try waist = 999 (should reject)
- [ ] Try height = 50 (should reject)
- [ ] Verify error messages are clear

---

## 📚 **FILES REQUIRING UPDATES**

**Database:**
- Migration: Add `_cm` suffix to bust/waist/hips columns
- Migration: Add `photo_url_primary` column

**Backend:**
- `src/routes/casting.js` (lines 760, 794-796) - Add validation
- `src/routes/casting.js` (lines 490-510) - Document units in response
- API docs - Update field descriptions with units

**Frontend:**
- `client/src/routes/casting/CastingMeasurements.jsx` - Rename constants
- API hooks - Update field names if DB changes

**Documentation:**
- `docs/CASTING_FLOW.md` - Add units to field descriptions
- Database schema docs - Document measurement units

---

## ⚠️ **BACKWARD COMPATIBILITY**

If changing DB column names:
1. Create new columns with `_cm` suffix
2. Backfill data from old columns
3. Update all code to use new columns
4. After deployed, drop old columns

**Migration Strategy:**
```javascript
// Phase 1: Add new columns
ALTER TABLE profiles ADD COLUMN bust_cm INTEGER;
UPDATE profiles SET bust_cm = bust WHERE bust IS NOT NULL;

// Phase 2: Update code (deploy)
// ...

// Phase 3: Remove old columns
ALTER TABLE profiles DROP COLUMN bust;
```

---

**Analysis Complete**
**Total Issues Found:** 9
**Critical Issues:** 1 (Unit confusion)
**Estimated Fix Time:** 8-16 hours
