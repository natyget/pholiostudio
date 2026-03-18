# Onboarding → Dashboard Connection Verification Report

## Executive Summary

The dashboard **DOES** display data from AI onboarding, but there are **CRITICAL GAPS** in the data pipeline. Several Stage 6 fields (References, Emergency Contacts, Work Eligibility, etc.) are collected but **NOT saved** to the database during profile creation.

---

## Data Flow Architecture

```
AI Onboarding (8 Stages)
  ↓
Session Storage (req.session.onboardingData)
  ↓
Stage 7: Librarian Synthesis
  ↓
createProfileFromSynthesis() → profiles table
  ↓
Dashboard Query → Display
```

---

## Stage-by-Stage Data Collection Analysis

### ✅ Stage 0: Social Auth Entry
- **Collected**: Authentication intent
- **Saved**: N/A (authentication only)

### ✅ Stage 1: Profile Foundation
- **Collected**: `firstName`, `lastName`, `city`, `phone`, `email`
- **Saved**: ✅ `first_name`, `last_name`, `city`, `phone`
- **Dashboard**: ✅ Displays name, city

### ✅ Stage 2: Visual Intel
- **Collected**: Image upload → Scout analysis → `visualIntel` object
- **Saved**: ✅ `hero_image_path` (from `visualIntel.imagePath`)
- **Dashboard**: ✅ Displays hero image

### ✅ Stage 3: Physical Metrics
- **Collected**: `height_cm`, `weight_lbs`, `bust`, `waist`, `hips`, `shoe_size`
- **Saved**: ✅ All fields saved
- **Dashboard**: ✅ Displays height, measurements (bust/waist/hips)

### ✅ Stage 4: Professional Profile
- **Collected**: `bio`, `experience_details`, `experience_level`, `training`, `portfolio_url`
- **Saved**: ✅ `bio_raw`, `bio_curated`, `experience_details`, `experience_level`, `training`, `portfolio_url`
- **Dashboard**: ✅ Displays bio, experience

### ✅ Stage 5: Market Positioning
- **Collected**: `specialties`, social media handles (`instagram_handle`, `twitter_handle`, `tiktok_handle`)
- **Saved**: ✅ `specialties`, `instagram_handle`, `twitter_handle`, `tiktok_handle`
- **Dashboard**: ✅ Displays specialties, social handles (via completion checks)

### ❌ Stage 6: Additional Details
- **Collected** (via Maverick conversation): 
  - References: `reference_name`, `reference_email`, `reference_phone`
  - Emergency Contact: `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`
  - Work Info: `work_eligibility`, `work_status`, `union_membership`
  - Personal: `ethnicity`, `tattoos`, `piercings`
  - Preferences: `comfort_levels`, `previous_representations`
  - Location: `city_secondary`
- **Saved**: ❌ **NONE OF THESE FIELDS ARE SAVED**
- **Dashboard**: ✅ Form fields exist, but data is missing if created via AI onboarding

### ✅ Stage 7: Finalization
- **Collected**: Review & confirmation
- **Saved**: ✅ Triggers `createProfileFromSynthesis()`
- **Dashboard**: ✅ Profile created/updated

---

## Critical Missing Connections

### Missing Fields in `createProfileFromSynthesis()` (src/routes/chat.js:394-434)

The following database fields exist in the schema but are **NOT** being saved when profiles are created via AI onboarding:

#### Stage 6 Fields (All Missing):
1. **References**:
   - `reference_name`
   - `reference_email`
   - `reference_phone`

2. **Emergency Contact**:
   - `emergency_contact_name`
   - `emergency_contact_phone`
   - `emergency_contact_relationship`

3. **Work Information**:
   - `work_eligibility`
   - `work_status`
   - `union_membership`

4. **Personal Details**:
   - `ethnicity`
   - `tattoos`
   - `piercings`

5. **Preferences**:
   - `comfort_levels` (JSON array)
   - `previous_representations` (JSON)

6. **Location**:
   - `city_secondary`

### Impact

- **Data Loss**: Stage 6 data collected during onboarding is **discarded** when the profile is created
- **User Experience**: Users must re-enter Stage 6 information manually in the dashboard
- **Inconsistency**: Manual form profiles have complete data; AI onboarding profiles are incomplete
- **Dashboard Confusion**: Dashboard form fields exist but show empty values even if data was collected

---

## What Works Correctly

### ✅ Data Pipeline (Stages 0-5, 7)
- All data from Stages 0-5 is properly collected, saved, and displayed
- Stage 7 finalization correctly triggers profile creation
- Dashboard correctly queries and displays saved data

### ✅ Dashboard Display
- Dashboard form includes fields for all missing Stage 6 data
- Manual profile creation/update works correctly for all fields
- Profile completeness checks work (though they may be inaccurate for AI-created profiles)

### ✅ Database Schema
- All fields exist in the database schema
- Fields are properly nullable (no constraint violations)

---

## Recommendations

### Priority 1: Fix Stage 6 Data Saving (CRITICAL)

**Action**: Update `createProfileFromSynthesis()` in `src/routes/chat.js` to include Stage 6 fields:

```javascript
const profileData = {
  // ... existing fields ...
  city_secondary: sqlData.city_secondary || onboardingData.city_secondary || null,
  reference_name: sqlData.reference_name || onboardingData.reference_name || null,
  reference_email: sqlData.reference_email || onboardingData.reference_email || null,
  reference_phone: sqlData.reference_phone || onboardingData.reference_phone || null,
  emergency_contact_name: sqlData.emergency_contact_name || onboardingData.emergency_contact_name || null,
  emergency_contact_phone: sqlData.emergency_contact_phone || onboardingData.emergency_contact_phone || null,
  emergency_contact_relationship: sqlData.emergency_contact_relationship || onboardingData.emergency_contact_relationship || null,
  work_eligibility: sqlData.work_eligibility || onboardingData.work_eligibility || null,
  work_status: sqlData.work_status || onboardingData.work_status || null,
  union_membership: sqlData.union_membership || onboardingData.union_membership || null,
  ethnicity: sqlData.ethnicity || onboardingData.ethnicity || null,
  tattoos: sqlData.tattoos || onboardingData.tattoos || null,
  piercings: sqlData.piercings || onboardingData.piercings || null,
  comfort_levels: sqlData.comfort_levels ? (typeof sqlData.comfort_levels === 'string' ? sqlData.comfort_levels : JSON.stringify(sqlData.comfort_levels)) : (onboardingData.comfort_levels ? (Array.isArray(onboardingData.comfort_levels) ? JSON.stringify(onboardingData.comfort_levels) : onboardingData.comfort_levels) : null),
  previous_representations: sqlData.previous_representations ? (typeof sqlData.previous_representations === 'string' ? sqlData.previous_representations : JSON.stringify(sqlData.previous_representations)) : (onboardingData.previous_representations ? (Array.isArray(onboardingData.previous_representations) ? JSON.stringify(onboardingData.previous_representations) : onboardingData.previous_representations) : null),
};
```

### Priority 2: Verify Maverick Data Extraction

**Action**: Ensure Maverick's system prompt explicitly instructs extraction of Stage 6 fields in Rule 8 (DATA EXTRACTION).

**Current**: Rule 8 mentions "Additional Details" but doesn't specify which fields to extract.

**Recommendation**: Add explicit field mapping:
```
- When user provides references (Stage 6), extract: reference_name, reference_email, reference_phone
- When user provides emergency contact (Stage 6), extract: emergency_contact_name, emergency_contact_phone, emergency_contact_relationship
- When user provides work eligibility info (Stage 6), extract: work_eligibility, work_status, union_membership
- When user provides personal details (Stage 6), extract: ethnicity, tattoos, piercings, comfort_levels, previous_representations
- When user provides secondary location (Stage 6), extract: city_secondary
```

### Priority 3: Update Profile Update Logic

**Action**: Also update the "update existing profile" branch in `createProfileFromSynthesis()` (lines 361-375) to include Stage 6 fields.

---

## Field Mapping Reference

| Database Column | Onboarding Data Key | Stage | Status |
|----------------|---------------------|-------|--------|
| `first_name` | `firstName` | 1 | ✅ Saved |
| `last_name` | `lastName` | 1 | ✅ Saved |
| `city` | `city` | 1 | ✅ Saved |
| `city_secondary` | `city_secondary` | 6 | ❌ Missing |
| `phone` | `phone` | 1 | ✅ Saved |
| `height_cm` | `height_cm` | 3 | ✅ Saved |
| `weight_lbs` | `weight_lbs` | 3 | ✅ Saved |
| `bust` | `bust` | 3 | ✅ Saved |
| `waist` | `waist` | 3 | ✅ Saved |
| `hips` | `hips` | 3 | ✅ Saved |
| `shoe_size` | `shoe_size` | 3 | ✅ Saved |
| `bio_raw` | `bio` | 4 | ✅ Saved |
| `bio_curated` | (generated) | 4 | ✅ Saved |
| `specialties` | `specialties` | 5 | ✅ Saved |
| `experience_details` | `experience_details` | 4 | ✅ Saved |
| `experience_level` | `experience_level` | 4 | ✅ Saved |
| `training` | `training` | 4 | ✅ Saved |
| `portfolio_url` | `portfolio_url` | 4 | ✅ Saved |
| `instagram_handle` | `instagram_handle` | 5 | ✅ Saved |
| `twitter_handle` | `twitter_handle` | 5 | ✅ Saved |
| `tiktok_handle` | `tiktok_handle` | 5 | ✅ Saved |
| `hero_image_path` | `visualIntel.imagePath` | 2 | ✅ Saved |
| `reference_name` | `reference_name` | 6 | ❌ Missing |
| `reference_email` | `reference_email` | 6 | ❌ Missing |
| `reference_phone` | `reference_phone` | 6 | ❌ Missing |
| `emergency_contact_name` | `emergency_contact_name` | 6 | ❌ Missing |
| `emergency_contact_phone` | `emergency_contact_phone` | 6 | ❌ Missing |
| `emergency_contact_relationship` | `emergency_contact_relationship` | 6 | ❌ Missing |
| `work_eligibility` | `work_eligibility` | 6 | ❌ Missing |
| `work_status` | `work_status` | 6 | ❌ Missing |
| `union_membership` | `union_membership` | 6 | ❌ Missing |
| `ethnicity` | `ethnicity` | 6 | ❌ Missing |
| `tattoos` | `tattoos` | 6 | ❌ Missing |
| `piercings` | `piercings` | 6 | ❌ Missing |
| `comfort_levels` | `comfort_levels` | 6 | ❌ Missing |
| `previous_representations` | `previous_representations` | 6 | ❌ Missing |
| `vibe_score` | (calculated) | 7 | ✅ Saved |
| `is_unicorn` | (calculated) | 7 | ✅ Saved |
| `vector_summary` | (generated) | 7 | ✅ Saved |

---

## Conclusion

The onboarding → dashboard connection is **partially functional**. Stages 0-5 and 7 work correctly, but **Stage 6 data is completely lost** during profile creation. This is a critical data integrity issue that should be fixed immediately.

**Total Missing Fields**: 13 fields (all from Stage 6)
**Impact**: High (data loss, user re-entry required)
**Fix Complexity**: Low (add fields to `createProfileFromSynthesis`)



