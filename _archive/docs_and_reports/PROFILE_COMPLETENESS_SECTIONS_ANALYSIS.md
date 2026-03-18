# Profile Completeness Sections Analysis

**Generated:** 2025-01-27

## Executive Summary

This report analyzes the 8 profile completeness sections used in the talent dashboard to track profile completion status. These sections are used to calculate overall profile completeness percentage and guide users through completing their profiles.

---

## Table of Contents

1. [Section Overview](#section-overview)
2. [Section Definitions](#section-definitions)
3. [Field Mapping](#field-mapping)
4. [Completeness Logic](#completeness-logic)
5. [UI Implementation](#ui-implementation)
6. [Data Flow](#data-flow)
7. [Issues & Recommendations](#issues--recommendations)

---

## 1. Section Overview

The talent dashboard uses **8 completeness sections** to track profile completion:

1. **Personal Information** (`personalInfo`)
2. **Physical Profile** (`physicalProfile`)
3. **Experience & Training** (`experienceTraining`)
4. **Skills & Lifestyle** (`skillsLifestyle`)
5. **Comfort & Boundaries** (`comfortBoundaries`)
6. **Availability & Locations** (`availabilityLocations`)
7. **Social & Portfolio** (`socialPortfolio`)
8. **Applications & Matches** (`applicationsMatches`) - Always marked complete

**Implementation Note:** There are TWO implementations of completeness logic:
1. **Backend:** `src/lib/dashboard/completeness.js` - Used by route handlers (simpler logic)
2. **Frontend Template:** `views/dashboard/talent.ejs` - Inline helper functions (more detailed messages)

The template functions (`getPersonalInfoStatus()`, etc.) provide more granular status messages and are what's actually displayed to users in the UI.

Each section has a status (`complete` or `incomplete`) and a message describing what's missing or confirming completion.

---

## 2. Section Definitions

### Section 1: Personal Information (`personalInfo`)

**Implementation:** 
- **Backend:** `src/lib/dashboard/completeness.js` (lines ~32-39)
- **Template:** `views/dashboard/talent.ejs` (lines ~115-123)

**Required Fields (ALL required):**
- `first_name` (string)
- `last_name` (string)
- `email` (string) - **Note:** Comes from `users` table, not `profiles`
- `phone` (string)
- `city` (string)

**Completeness Logic (Template):**
```javascript
function getPersonalInfoStatus() {
  const required = ['first_name', 'last_name', 'email', 'phone', 'city'];
  const missing = required.filter(field => !safeProfile[field]);
  if (missing.length === 0) return { status: 'complete', message: 'Complete' };
  if (missing.includes('first_name') || missing.includes('last_name')) return { status: 'incomplete', message: 'Missing name' };
  if (missing.includes('email')) return { status: 'incomplete', message: 'Missing email' };
  if (missing.includes('phone')) return { status: 'incomplete', message: 'Missing phone' };
  return { status: 'incomplete', message: 'Missing ' + missing[0] };
}
```

**Database Fields:**
- `profiles.first_name`
- `profiles.last_name`
- `users.email` (from `users` table join - **IMPORTANT:** May not be in profile object)
- `profiles.phone`
- `profiles.city`

**UI Location:** First accordion section "Personal Info" in talent dashboard form

**Status Messages:**
- Complete: `"Complete"`
- Missing name: `"Missing name"`
- Missing email: `"Missing email"`
- Missing phone: `"Missing phone"`
- Other: `"Missing [field_name]"`

---

### Section 2: Physical Profile (`physicalProfile`)

**Implementation:**
- **Backend:** `src/lib/dashboard/completeness.js` (lines ~41-47)
- **Template:** `views/dashboard/talent.ejs` (lines ~125-132)

**Required Fields (ALL required):**
- `height_cm` (number)
- `bust` (number)
- `waist` (number)
- `hips` (number)
- **Note:** `shoe_size` is NOT required in template logic (only height + 3 measurements)

**Completeness Logic (Template):**
```javascript
function getPhysicalProfileStatus() {
  const required = ['height_cm', 'bust', 'waist', 'hips'];
  const missing = required.filter(field => !safeProfile[field]);
  if (missing.length === 0) return { status: 'complete', message: 'Complete' };
  if (missing.includes('height_cm')) return { status: 'incomplete', message: 'Missing height' };
  if (missing.includes('bust') || missing.includes('waist') || missing.includes('hips')) return { status: 'incomplete', message: 'Missing measurements' };
  return { status: 'incomplete', message: 'Incomplete' };
}
```

**Database Fields:**
- `profiles.height_cm`
- `profiles.bust`
- `profiles.waist`
- `profiles.hips`
- `profiles.shoe_size` (optional - not checked)

**UI Location:** Second accordion section "Physical Profile"

**Status Messages:**
- Complete: `"Complete"`
- Missing height: `"Missing height"`
- Missing measurements: `"Missing measurements"`
- Other: `"Incomplete"`

**Notes:**
- Only 4 fields required (height + 3 measurements)
- `shoe_size` is NOT included in requirements
- Weight (`weight_lbs` or `weight_kg`) is NOT included in requirements (optional field)

---

### Section 3: Experience & Training (`experienceTraining`)

**Location:** `src/lib/dashboard/completeness.js` (lines ~33-37)

**Required Fields (at least ONE of):**
- `experience_level` (string)
- `experience_details` (JSON string)
- `training` (string)

**Completeness Logic:**
```javascript
statuses.experienceTraining = {
  status: (safeProfile.experience_level || safeProfile.experience_details || safeProfile.training) ? 'complete' : 'incomplete',
  message: (safeProfile.experience_level || safeProfile.experience_details || safeProfile.training) ? 'Complete' : 'Add experience or training'
};
```

**Database Fields:**
- `profiles.experience_level`
- `profiles.experience_details` (JSON string)
- `profiles.training`

**UI Location:** Third accordion section "Experience & Training"

**Notes:**
- Only ONE field needs to be filled for completion (OR logic, not AND)
- `experience_details` is stored as JSON string in database

---

### Section 4: Skills & Lifestyle (`skillsLifestyle`)

**Location:** `src/lib/dashboard/completeness.js` (lines ~39-46)

**Required Fields (at least ONE of):**
- `specialties` (JSON array - must have at least 1 item)
- `languages` (JSON array - must have at least 1 item)
- `ethnicity` (string)
- `tattoos` (boolean - can be `false`, just must not be `null`)
- `piercings` (boolean - can be `false`, just must not be `null`)

**Completeness Logic:**
```javascript
statuses.skillsLifestyle = {
  status: (safeProfile.specialties && JSON.parse(safeProfile.specialties || '[]').length > 0 || safeProfile.languages && JSON.parse(safeProfile.languages || '[]').length > 0 || safeProfile.ethnicity || safeProfile.tattoos !== null || safeProfile.piercings !== null) ? 'complete' : 'incomplete',
  message: (safeProfile.specialties && JSON.parse(safeProfile.specialties || '[]').length > 0 || safeProfile.languages && JSON.parse(safeProfile.languages || '[]').length > 0 || safeProfile.ethnicity || safeProfile.tattoos !== null || safeProfile.piercings !== null) ? 'Complete' : 'Add skills or lifestyle details'
};
```

**Database Fields:**
- `profiles.specialties` (JSON string array)
- `profiles.languages` (JSON string array)
- `profiles.ethnicity`
- `profiles.tattoos` (boolean)
- `profiles.piercings` (boolean)

**UI Location:** Fourth accordion section "Skills & Lifestyle"

**Notes:**
- Complex OR logic - only ONE field needs to have data
- JSON arrays must be parsed and checked for length
- Boolean fields must not be `null` (but can be `false`)

---

### Section 5: Comfort & Boundaries (`comfortBoundaries`)

**Implementation:**
- **Backend:** `src/lib/dashboard/completeness.js` (lines ~62-63)
- **Template:** `views/dashboard/talent.ejs` (lines ~146-150)

**Required Fields:**
- `comfort_levels` (JSON string - checked as truthy, not parsed)

**Completeness Logic (Template):**
```javascript
function getComfortBoundariesStatus() {
  const hasComfort = safeProfile.comfort_levels;
  if (hasComfort) return { status: 'complete', message: 'Complete' };
  return { status: 'incomplete', message: 'Set comfort levels' };
}
```

**Database Fields:**
- `profiles.comfort_levels` (JSON string array)

**UI Location:** Fifth accordion section "Comfort & Boundaries"

**Status Messages:**
- Complete: `"Complete"`
- Incomplete: `"Set comfort levels"`

**Notes:**
- Template checks if field exists (truthy), not if array has items
- Backend logic parses JSON and checks length, but template doesn't
- JSON string like `"[]"` (empty array) would be marked complete (truthy string)
- Examples: `["Editorial", "Swimwear", "Lingerie"]`

---

### Section 6: Availability & Locations (`availabilityLocations`)

**Location:** `src/lib/dashboard/completeness.js` (lines ~55-60)

**Required Fields (at least ONE of):**
- `availability_schedule` (string)
- `availability_travel` (boolean - can be `false`, just must not be `null`)
- `city` (string)
- `city_secondary` (string)

**Completeness Logic:**
```javascript
statuses.availabilityLocations = {
  status: (safeProfile.availability_schedule || safeProfile.availability_travel !== null || safeProfile.city || safeProfile.city_secondary) ? 'complete' : 'incomplete',
  message: (safeProfile.availability_schedule || safeProfile.availability_travel !== null || safeProfile.city || safeProfile.city_secondary) ? 'Complete' : 'Set availability or add locations'
};
```

**Database Fields:**
- `profiles.availability_schedule`
- `profiles.availability_travel` (boolean)
- `profiles.city`
- `profiles.city_secondary`

**UI Location:** Sixth accordion section "Availability & Locations"

**Notes:**
- OR logic - only ONE field needs data
- `city` is also checked in Section 1 (Personal Info), creating overlap
- `availability_travel` can be `false` (just not `null`)

---

### Section 7: Social & Portfolio (`socialPortfolio`)

**Location:** `src/lib/dashboard/completeness.js` (lines ~62-68)

**Required Fields (at least ONE of):**
- At least 1 image in `images` array
- `portfolio_url` (string)
- `instagram_handle` (string)
- `twitter_handle` (string)
- `tiktok_handle` (string)

**Completeness Logic:**
```javascript
statuses.socialPortfolio = {
  status: (safeImages.length > 0 || safeProfile.portfolio_url || safeProfile.instagram_handle || safeProfile.twitter_handle || safeProfile.tiktok_handle) ? 'complete' : 'incomplete',
  message: (safeImages.length > 0 || safeProfile.portfolio_url || safeProfile.instagram_handle || safeProfile.twitter_handle || safeProfile.tiktok_handle) ? 'Complete' : 'Add images or social links'
};
```

**Database Fields:**
- `images` table (counted via join)
- `profiles.portfolio_url`
- `profiles.instagram_handle`
- `profiles.twitter_handle`
- `profiles.tiktok_handle`

**UI Location:** Seventh accordion section "Social & Portfolio"

**Notes:**
- Requires at least 1 image OR at least 1 social link
- Images come from separate `images` table (not profile fields)
- Social handles are optional fields

---

### Section 8: References & Emergency (`referencesEmergency`)

**Location:** `src/lib/dashboard/completeness.js` (lines ~70-76)

**Required Fields (ALL required):**
- `reference_name` (string)
- `reference_email` (string)
- `emergency_contact_name` (string)
- `emergency_contact_phone` (string)

**Completeness Logic:**
```javascript
statuses.referencesEmergency = {
  status: (safeProfile.reference_name && safeProfile.reference_email && safeProfile.emergency_contact_name && safeProfile.emergency_contact_phone) ? 'complete' : 'incomplete',
  message: (safeProfile.reference_name && safeProfile.reference_email && safeProfile.emergency_contact_name && safeProfile.emergency_contact_phone) ? 'Complete' : 'Add references or emergency contact'
};
```

**Database Fields:**
- `profiles.reference_name`
- `profiles.reference_email`
- `profiles.emergency_contact_name`
- `profiles.emergency_contact_phone`

**UI Location:** Eighth accordion section "References & Emergency Contact"

**Notes:**
- ALL 4 fields are required (AND logic)
- Reference phone (`reference_phone`) is NOT required
- Emergency contact relationship (`emergency_contact_relationship`) is NOT required

---

## 3. Field Mapping

### Complete Field Inventory by Section

| Section | Required Fields | Optional Fields | Database Tables |
|---------|----------------|-----------------|-----------------|
| **Personal Info** | first_name, last_name, email, phone, city | - | `profiles`, `users` |
| **Physical Profile** | height_cm, bust, waist, hips, shoe_size | weight_lbs, weight_kg, dress_size, eye_color, hair_color, hair_length, skin_tone, gender, date_of_birth, age | `profiles` |
| **Experience & Training** | experience_level OR experience_details OR training | - | `profiles` |
| **Skills & Lifestyle** | specialties OR languages OR ethnicity OR tattoos OR piercings | - | `profiles` |
| **Comfort & Boundaries** | comfort_levels (array with ≥1 item) | - | `profiles` |
| **Availability & Locations** | availability_schedule OR availability_travel OR city OR city_secondary | - | `profiles` |
| **Social & Portfolio** | images (≥1) OR portfolio_url OR instagram_handle OR twitter_handle OR tiktok_handle | - | `profiles`, `images` |
| **References & Emergency** | reference_name, reference_email, emergency_contact_name, emergency_contact_phone | reference_phone, emergency_contact_relationship | `profiles` |

---

## 4. Completeness Logic

### Overall Calculation

The overall completeness percentage is calculated as:

```javascript
const completedSections = Object.values(statuses).filter(s => s.status === 'complete').length;
const totalSections = Object.keys(statuses).length; // 8
const percentage = Math.round((completedSections / totalSections) * 100);
```

**Result:**
- Returns object with `sections`, `percentage`, and `isComplete` (boolean)
- `isComplete` is `true` only when `percentage === 100`

### Logic Patterns

1. **AND Logic (All Required):**
   - Section 1 (Personal Info): All 5 fields required
   - Section 2 (Physical Profile): All 5 fields required
   - Section 8 (References & Emergency): All 4 fields required

2. **OR Logic (At Least One):**
   - Section 3 (Experience & Training): At least one field
   - Section 4 (Skills & Lifestyle): At least one field
   - Section 6 (Availability & Locations): At least one field
   - Section 7 (Social & Portfolio): At least one field

3. **Array Logic (Non-Empty Array):**
   - Section 4 (Skills & Lifestyle): Arrays must have length > 0
   - Section 5 (Comfort & Boundaries): Array must have length > 0

4. **Boolean Logic (Not Null):**
   - Section 4: `tattoos` and `piercings` can be `false`, but not `null`
   - Section 6: `availability_travel` can be `false`, but not `null`

---

## 5. UI Implementation

### Dashboard Template (`views/dashboard/talent.ejs`)

The completeness sections are displayed in an accordion UI:

1. **Accordion Structure:**
   - Each section is a `.talent-accordion__item` with `data-section` attribute
   - Sections are collapsible/expandable
   - Status badge shows "Complete" or "Incomplete" message

2. **Status Display:**
   ```ejs
   <span class="talent-accordion__status talent-accordion__status--<%= sectionStatuses.personalInfo.status %>">
     <%= sectionStatuses.personalInfo.message %>
   </span>
   ```

3. **Section Order:**
   - Personal Information (Section 1)
   - Physical Profile (Section 2)
   - Experience & Training (Section 3)
   - Skills & Lifestyle (Section 4)
   - Comfort & Boundaries (Section 5)
   - Availability & Locations (Section 6)
   - Social & Portfolio (Section 7)
   - References & Emergency Contact (Section 8)

4. **Form Fields:**
   - Each section contains form fields for its respective data
   - Fields are grouped logically within each accordion item
   - All fields submit together via single form POST to `/dashboard/talent`

---

## 6. Data Flow

### Completeness Calculation Flow

```
1. User visits /dashboard/talent
   ↓
2. Route handler (dashboard-talent.js) fetches profile + images
   ↓
3. calculateProfileCompleteness(profile, images) is called
   ↓
4. Function checks each of 8 sections
   ↓
5. Returns { sections: {...}, percentage: number, isComplete: boolean }
   ↓
6. Data passed to EJS template
   ↓
7. Template renders accordion with status badges
   ↓
8. User sees completion percentage and section statuses
```

### Profile Update Flow

```
1. User submits form in any accordion section
   ↓
2. POST /dashboard/talent (with all form data)
   ↓
3. Route handler validates and updates profile
   ↓
4. calculateProfileCompleteness() called again
   ↓
5. Updated completeness returned in response
   ↓
6. User redirected back to dashboard
   ↓
7. Updated status badges displayed
```

---

## 7. Issues & Recommendations

### Issues Identified

1. **Field Overlap:**
   - `city` is checked in both Section 1 (Personal Info) AND Section 6 (Availability & Locations)
   - This creates logical confusion - should `city` be in one section only?

2. **Inconsistent Logic:**
   - Section 1, 2, 8 use AND logic (all required)
   - Sections 3, 4, 6, 7 use OR logic (at least one)
   - Section 5 uses array logic (non-empty array)
   - No clear pattern or documentation for why different sections use different logic

3. **Missing Fields in Completeness:**
   - `weight_lbs` / `weight_kg` are NOT included in Section 2 requirements (even though they're in the form)
   - `reference_phone` is NOT required in Section 8 (even though it's in the form)
   - `emergency_contact_relationship` is NOT required in Section 8 (even though it's in the form)

4. **Email Source Confusion:**
   - Section 1 requires `email`, but it comes from `users` table, not `profiles` table
   - The completeness function receives `profile` object, but may not have `email` field
   - Need to verify how `email` is accessed in completeness calculation

5. **JSON Parsing Safety:**
   - Sections 4, 5 parse JSON strings without error handling
   - If JSON is malformed, `JSON.parse()` will throw error
   - Should wrap in try-catch or use safe parsing

6. **Boolean Null Handling:**
   - Sections 4, 6 check for `!== null` for boolean fields
   - This is correct (allows `false`), but logic could be clearer
   - Could use explicit `!== null && !== undefined` check

### Recommendations

1. **Clarify Field Ownership:**
   - Document which section "owns" each field
   - Remove `city` from Section 6 if it's already in Section 1 (or vice versa)
   - Consider adding `city_secondary` as primary location field for Section 6

2. **Standardize Completeness Logic:**
   - Document the rationale for AND vs OR logic
   - Consider making all sections use consistent patterns
   - OR create clear guidelines for when to use each pattern

3. **Add Missing Fields:**
   - Decide if `weight` should be required for Section 2
   - Decide if `reference_phone` and `emergency_contact_relationship` should be required for Section 8
   - Update completeness logic accordingly

4. **Fix Email Access:**
   - Ensure `email` is included in profile object passed to completeness function
   - OR update completeness function to accept user object separately
   - Verify email is correctly accessed in dashboard route

5. **Add Error Handling:**
   - Wrap JSON.parse calls in try-catch blocks
   - Provide fallback values for malformed JSON
   - Log errors for debugging

6. **Improve Documentation:**
   - Add JSDoc comments to completeness function
   - Document which fields are required vs optional for each section
   - Document the logic pattern (AND/OR/Array) for each section

7. **Consider Section Priority:**
   - Some sections are more critical than others (e.g., Personal Info vs Social & Portfolio)
   - Consider weighted completeness scoring
   - OR provide "essential" vs "optional" section categorization

---

## 8. Section Status Examples

### Complete Profile Example

```javascript
{
  sections: {
    personalInfo: { status: 'complete', message: 'Complete' },
    physicalProfile: { status: 'complete', message: 'Complete' },
    experienceTraining: { status: 'complete', message: 'Complete' },
    skillsLifestyle: { status: 'complete', message: 'Complete' },
    comfortBoundaries: { status: 'complete', message: 'Complete' },
    availabilityLocations: { status: 'complete', message: 'Complete' },
    socialPortfolio: { status: 'complete', message: 'Complete' },
    referencesEmergency: { status: 'complete', message: 'Complete' }
  },
  percentage: 100,
  isComplete: true
}
```

### Incomplete Profile Example (50% Complete)

```javascript
{
  sections: {
    personalInfo: { status: 'complete', message: 'Complete' },
    physicalProfile: { status: 'complete', message: 'Complete' },
    experienceTraining: { status: 'complete', message: 'Complete' },
    skillsLifestyle: { status: 'complete', message: 'Complete' },
    comfortBoundaries: { status: 'incomplete', message: 'Set comfort levels' },
    availabilityLocations: { status: 'incomplete', message: 'Set availability or add locations' },
    socialPortfolio: { status: 'incomplete', message: 'Add images or social links' },
    referencesEmergency: { status: 'incomplete', message: 'Add references or emergency contact' }
  },
  percentage: 50,
  isComplete: false
}
```

---

**End of Report**

