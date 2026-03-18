# Dashboard Field Architecture Report
## Complete Data Flow Analysis: Form → Validation → Database → Display

**Generated:** 2025-01-21  
**Scope:** Talent Dashboard Profile Form Fields  
**Purpose:** Map every field through the entire pipeline from form submission to database storage to UI display

---

## 📋 Executive Summary

This report documents the complete lifecycle of each profile field in the Talent Dashboard, tracking data flow from:
1. **Form Submission** (`views/dashboard/talent.ejs`)
2. **Preprocessing** (`src/routes/dashboard-talent.js`)
3. **Validation** (`src/lib/validation.js` → `talentProfileUpdateSchema`)
4. **Database Storage** (`profiles` table via Knex)
5. **Display/Read** (`views/dashboard/talent.ejs` → `editDefaults`)

**Total Fields Tracked:** 47 fields  
**Validation Schema:** `talentProfileUpdateSchema` (Zod)  
**Database Table:** `profiles` (PostgreSQL/Neon)

---

## 🔄 Field Processing Pipeline

```
┌─────────────────┐
│  HTML Form      │  →  name="field_name" value="..."
│  (talent.ejs)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Preprocessing  │  →  Array normalization, empty string → undefined,
│  (dashboard-    │      boolean conversion, "Other" field merging
│   talent.js)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │  →  Zod schema validation (type checking, transforms)
│  (validation.js)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Database       │  →  Knex query: UPDATE profiles SET field = value
│  (Neon/PG)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Display        │  →  valueFor('field') → editDefaults → safeProfile
│  (talent.ejs)   │
└─────────────────┘
```

---

## 📊 Field-by-Field Analysis

### **Section 1: Personal Information**

#### `first_name`
- **Form Field:** `<input name="first_name">`
- **Validation:** `nameSchema.optional()` - String, 1-60 chars, trimmed
- **Preprocessing:** None (direct pass-through)
- **Database:** `profiles.first_name` (VARCHAR, NOT NULL in base schema)
- **Display:** `valueFor('first_name')` → `editDefaults.first_name`
- **Special Logic:** 
  - Triggers slug update if changed (`needsSlugUpdate = true`)
  - Slug regenerated if it matches old name pattern
- **Completeness:** Required for "Personal Info" section

#### `last_name`
- **Form Field:** `<input name="last_name">`
- **Validation:** `nameSchema.optional()` - String, 1-60 chars, trimmed
- **Preprocessing:** None
- **Database:** `profiles.last_name` (VARCHAR, NOT NULL)
- **Display:** `valueFor('last_name')` → `editDefaults.last_name`
- **Special Logic:** Triggers slug update if changed
- **Completeness:** Required for "Personal Info" section

#### `city`
- **Form Field:** `<input name="city" autocomplete="address-level2">`
- **Validation:** `nameSchema.optional()` - String, 1-60 chars
- **Preprocessing:** Empty string → `undefined` (via `optionalFields`)
- **Database:** `profiles.city` (VARCHAR, NOT NULL in base, nullable after migration)
- **Display:** `valueFor('city')` → `editDefaults.city`
- **Special Logic:** 
  - Primary location (used in hero subtitle)
  - Can be verified via IP geolocation (takes precedence in `createProfileFromSynthesis`)
- **Completeness:** Required for "Personal Info" section

#### `city_secondary`
- **Form Field:** `<input name="city_secondary" autocomplete="address-level2">`
- **Validation:** `nameSchema.optional()` - String, max 100 chars (from migration)
- **Preprocessing:** 
  - **Array Normalization:** If array `['', '']` → extract first non-empty or `undefined`
  - Empty string → `undefined`
- **Database:** `profiles.city_secondary` (VARCHAR(100), nullable)
- **Display:** `valueFor('city_secondary')` → `editDefaults.city_secondary`
- **Completeness:** Optional field

#### `phone`
- **Form Field:** `<input name="phone" type="tel" autocomplete="tel" required>`
- **Validation:** `phoneSchema.optional()` - String, max 20 chars, trimmed
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.phone` (VARCHAR(20), nullable)
- **Display:** `valueFor('phone')` → `editDefaults.phone`
- **Special Logic:**
  - Form has `required` attribute (client-side)
  - Validation marks as optional (server-side)
  - Shows Google Auth badge next to field if `googlePhotoURL` exists
  - Visual indicator: Red asterisk + warning message if empty
- **Completeness:** Required for "Personal Info" section
- **Data Source:** Can come from Google OAuth (`googlePhone`) or AI onboarding

#### `email`
- **Form Field:** ❌ **Not in form** (managed by Firebase Auth)
- **Validation:** Not validated in profile update (comes from `users` table)
- **Database:** `users.email` (VARCHAR, UNIQUE, NOT NULL) - **NOT in `profiles` table**
- **Display:** Accessed via `currentUser.email` from route handler
- **Special Logic:** Used for completeness calculation (Personal Info requires email)

---

### **Section 2: Physical Profile**

#### `height_cm`
- **Form Field:** `<input name="height_cm" type="number" min="120" max="220">`
- **Validation:** `heightSchema.optional()` - Number, 120-220 range
- **Preprocessing:** None (number type preserved)
- **Database:** `profiles.height_cm` (INTEGER, NOT NULL in base, nullable after migration)
- **Display:** `valueFor('height_cm')` → `editDefaults.height_cm`
  - **Issue:** `0` is valid but hidden (needs `parseInt(value) > 0` check)
- **Special Logic:**
  - Can come from Scout's visual estimates during AI onboarding
  - Displayed in hero stats: `"123 cm"`
- **Completeness:** Required for "Physical Profile" section

#### `weight` / `weight_kg` / `weight_lbs`
- **Form Field:** 
  - `<input name="weight" type="number">` (main input)
  - `<input name="weight_unit" type="select">` (lbs/kg selector)
  - Hidden: `<input name="weight_kg">` and `<input name="weight_lbs">`
- **Validation:** 
  - `weightSchema` - Number, 30-440 range, optional
  - `weight_kg`: `weightSchema.optional()`
  - `weight_lbs`: `weightSchema.optional()`
- **Preprocessing:** None (handled client-side via JavaScript)
- **Database:** 
  - `profiles.weight_kg` (DECIMAL(5,2), nullable)
  - `profiles.weight_lbs` (DECIMAL(5,2), nullable)
- **Display:** `valueFor('weight')` → shows `weight_lbs` or `weight_kg` based on unit
- **Special Logic:**
  - **Conversion Logic:** If `weight_kg` provided → auto-calculate `weight_lbs` (and vice versa)
  - `convertKgToLbs()` and `convertLbsToKg()` helper functions
  - If neither provided, keeps existing values from profile
- **Completeness:** Not explicitly checked (part of physical metrics)

#### `bust`
- **Form Field:** `<input name="bust" type="number" min="20" max="60" step="0.5">`
- **Validation:** `bustSchema.optional()` - Preprocesses string → number, range 20-60
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.bust` (INTEGER, nullable)
- **Display:** `valueFor('bust')` → `editDefaults.bust`
- **Special Logic:** Displayed in hero stats: `"32-28-36"`
- **Completeness:** Required for "Physical Profile" section

#### `waist`
- **Form Field:** `<input name="waist" type="number" min="20" max="50" step="0.5">`
- **Validation:** `waistSchema.optional()` - Number, range 20-50
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.waist` (INTEGER, nullable)
- **Display:** `valueFor('waist')` → `editDefaults.waist`
- **Completeness:** Required for "Physical Profile" section

#### `hips`
- **Form Field:** `<input name="hips" type="number" min="25" max="60" step="0.5">`
- **Validation:** `hipsSchema.optional()` - Number, range 25-60
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.hips` (INTEGER, nullable)
- **Display:** `valueFor('hips')` → `editDefaults.hips`
- **Completeness:** Required for "Physical Profile" section

#### `shoe_size`
- **Form Field:** `<select name="shoe_size">` with "Other" option + `<input name="shoe_size_other">`
- **Validation:** `z.string().trim().max(10).optional()`
- **Preprocessing:** 
  - **"Other" Merge:** If `shoe_size === 'Other'` and `shoe_size_other` exists → merge into `shoe_size`
  - Empty string → `undefined`
- **Database:** `profiles.shoe_size` (VARCHAR(10), nullable)
- **Display:** `valueFor('shoe_size')` → `editDefaults.shoe_size`
- **Completeness:** Not explicitly required (optional physical metric)

---

### **Section 3: Personal Details**

#### `gender`
- **Form Field:** `<select name="gender">` - Options: Male, Female, Non-binary, Other, Prefer not to say
- **Validation:** `genderSchema` - Enum of valid options, optional
- **Preprocessing:** Empty string → `undefined` (via `enumFields`)
- **Database:** `profiles.gender` (VARCHAR, nullable)
- **Display:** `valueFor('gender')` → `editDefaults.gender`
- **Data Source:** Can come from Google OAuth (`googleGender`) or AI onboarding
- **Completeness:** Not explicitly required (optional personal detail)

#### `date_of_birth`
- **Form Field:** `<input name="date_of_birth" type="date">`
- **Validation:** `dateOfBirthSchema.optional()` - String (ISO date), validates not in future
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.date_of_birth` (DATE, nullable)
- **Display:** `valueFor('date_of_birth')` → `editDefaults.date_of_birth`
- **Special Logic:**
  - **Auto-calculates `age`:** `calculateAge(date_of_birth)` function
  - Age is read-only field in form (auto-calculated)
  - **Priority:** Google-verified DOB (`googleBirthday`) takes precedence in `createProfileFromSynthesis`
- **Completeness:** Not explicitly required (optional)

#### `age`
- **Form Field:** `<input name="age" type="number" readonly>` (Auto-calculated)
- **Validation:** ❌ **Not in validation schema** (removed in preprocessing)
- **Preprocessing:** **Removed** from `processedBody` (calculated field)
- **Database:** `profiles.age` (INTEGER, nullable) - Calculated from `date_of_birth`
- **Display:** `valueFor('age')` → `editDefaults.age`
- **Special Logic:** Calculated server-side: `age = calculateAge(date_of_birth)`

#### `dress_size`
- **Form Field:** `<input name="dress_size" type="text" placeholder="6 US">`
- **Validation:** `dressSizeSchema.optional()` - String, max 10 chars
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.dress_size` (VARCHAR(10), nullable)
- **Display:** `valueFor('dress_size')` → `editDefaults.dress_size`

#### `eye_color`
- **Form Field:** `<select name="eye_color">` with "Other" option + `<input name="eye_color_other">`
- **Validation:** `z.string().trim().max(30).optional()`
- **Preprocessing:**
  - **"Other" Merge:** If `eye_color === 'Other'` → merge `eye_color_other` into `eye_color`
  - Empty string → `undefined`
- **Database:** `profiles.eye_color` (VARCHAR(30), nullable)
- **Display:** `valueFor('eye_color')` → `editDefaults.eye_color`

#### `hair_color`
- **Form Field:** `<select name="hair_color">` with "Other" option + `<input name="hair_color_other">`
- **Validation:** `z.string().trim().max(30).optional()`
- **Preprocessing:**
  - **"Other" Merge:** Similar to `eye_color`
  - Empty string → `undefined`
- **Database:** `profiles.hair_color` (VARCHAR(30), nullable)
- **Display:** `valueFor('hair_color')` → `editDefaults.hair_color`

#### `hair_length`
- **Form Field:** `<select name="hair_length">` - Options: Short, Medium, Long, Very Long
- **Validation:** `hairLengthSchema.optional()` - Enum validation
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.hair_length` (VARCHAR(20), nullable)
- **Display:** `valueFor('hair_length')` → `editDefaults.hair_length`

#### `skin_tone`
- **Form Field:** `<select name="skin_tone">` with "Other" option + `<input name="skin_tone_other">`
- **Validation:** `skinToneSchema.optional()` - String, max 50 chars
- **Preprocessing:**
  - **"Other" Merge:** Similar pattern
  - Empty string → `undefined`
- **Database:** `profiles.skin_tone` (VARCHAR(50), nullable)
- **Display:** `valueFor('skin_tone')` → `editDefaults.skin_tone`

---

### **Section 4: Professional Profile**

#### `experience_level`
- **Form Field:** `<select name="experience_level">` - Options: Beginner, Intermediate, Experienced, Professional
- **Validation:** `experienceLevelSchema.optional()` - Enum validation
- **Preprocessing:** Empty string → `undefined` (via `enumFields`)
- **Database:** `profiles.experience_level` (VARCHAR(30), nullable)
- **Display:** `valueFor('experience_level')` → `editDefaults.experience_level`
- **Completeness:** Part of "Experience & Training" section

#### `training`
- **Form Field:** `<textarea name="training">`
- **Validation:** `trainingSchema.optional()` - String, max 500 chars
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.training` (TEXT, nullable)
- **Display:** `valueFor('training')` → `editDefaults.training`
- **Completeness:** Part of "Experience & Training" section

#### `experience_details`
- **Form Field:** ❓ **Dynamic form fields** (managed by JavaScript `setupExperienceDetails()`)
- **Validation:** `z.union([z.string().transform(JSON.parse), z.record(), z.null()]).optional()`
- **Preprocessing:** None (already JSON string from form)
- **Database:** `profiles.experience_details` (TEXT/JSONB, nullable)
- **Display:** `valueFor('experience_details')` → parsed from JSON string
- **Special Logic:**
  - Stored as JSON string in database
  - Client-side JavaScript manages dynamic input fields
  - Structured as: `{ "type": "...", "description": "...", ... }`

#### `specialties`
- **Form Field:** Multiple checkboxes `<input name="specialties" type="checkbox" value="...">`
- **Validation:** `z.array(z.string()).optional()`
- **Preprocessing:** None (array from checkboxes)
- **Database:** `profiles.specialties` (TEXT, nullable) - Stored as JSON string
- **Display:** `valueFor('specialties')` → parsed from JSON string → `safeJsonValue()`
- **Special Logic:**
  - **JSON Stringification:** `specialtiesJson = JSON.stringify(specialties)`
  - **Display:** Parsed back to array for checkboxes
- **Completeness:** Part of "Skills & Lifestyle" section (OR logic: at least one of specialties/languages/ethnicity/lifestyle)

---

### **Section 5: Skills & Lifestyle**

#### `languages`
- **Form Field:** Dynamic dropdown managed by `setupLanguageDropdown()` JavaScript
- **Validation:** `languagesSchema.optional()` - `z.array(z.string()).optional()`
- **Preprocessing:** None (array from form)
- **Database:** `profiles.languages` (TEXT, nullable) - Stored as JSON string
- **Display:** `valueFor('languages')` → `safeJsonValue()` → parsed array
- **Special Logic:**
  - **JSON Stringification:** `languagesJson = JSON.stringify(languages)`
  - Client-side JS manages adding/removing languages
- **Completeness:** Part of "Skills & Lifestyle" section

#### `ethnicity`
- **Form Field:** `<input name="ethnicity" type="text" placeholder="Optional">`
- **Validation:** `ethnicitySchema.optional()` - String, max 100 chars
- **Preprocessing:**
  - **Array Normalization:** If array `['', '']` → extract first non-empty or `undefined`
  - Empty string → `undefined`
- **Database:** `profiles.ethnicity` (VARCHAR(100), nullable)
- **Display:** `valueFor('ethnicity')` → `editDefaults.ethnicity`
- **Completeness:** Part of "Skills & Lifestyle" section

#### `tattoos`
- **Form Field:** `<input name="tattoos" type="checkbox" value="true">` (Liquid Gold Toggle)
- **Validation:** `tattoosSchema.optional()` - `z.union([z.boolean(), z.string().transform(...)]).optional()`
- **Preprocessing:**
  - `'true'` → `true` (boolean)
  - `null` / `'null'` / `'false'` → `undefined`
  - Missing → `undefined`
- **Database:** `profiles.tattoos` (BOOLEAN, nullable)
- **Display:** `valueFor('tattoos')` → `editDefaults.tattoos` → checkbox checked state
- **Completeness:** Part of "Skills & Lifestyle" section

#### `piercings`
- **Form Field:** `<input name="piercings" type="checkbox" value="true">` (Liquid Gold Toggle)
- **Validation:** `piercingsSchema.optional()` - Same as `tattoos`
- **Preprocessing:** Same as `tattoos`
- **Database:** `profiles.piercings` (BOOLEAN, nullable)
- **Display:** `valueFor('piercings')` → checkbox checked state
- **Completeness:** Part of "Skills & Lifestyle" section

#### `comfort_levels`
- **Form Field:** Multiple checkboxes `<input name="comfort_levels" type="checkbox" value="...">`
- **Validation:** `z.array(z.string()).optional()`
- **Preprocessing:** None (array from checkboxes)
- **Database:** `profiles.comfort_levels` (TEXT, nullable) - Stored as JSON string
- **Display:** `valueFor('comfort_levels')` → `safeJsonValue()` → parsed array
- **Special Logic:**
  - **JSON Stringification:** `JSON.stringify(comfort_levels)`
  - Values: `["Swimwear", "Lingerie", "Implied Nudity", "Not Comfortable"]`
- **Completeness:** Part of "Comfort & Boundaries" section (requires non-empty array)

---

### **Section 6: Availability & Locations**

#### `availability_travel`
- **Form Field:** `<input name="availability_travel" type="checkbox" value="true">`
- **Validation:** `availabilityTravelSchema.optional()` - `z.union([z.boolean(), z.string()]).optional()`
- **Preprocessing:**
  - `'true'` → `true` (boolean)
  - `null` / missing → `undefined`
- **Database:** `profiles.availability_travel` (BOOLEAN, nullable)
- **Display:** `valueFor('availability_travel')` → checkbox checked state
- **Completeness:** Part of "Availability & Locations" section (requires both `hasAvailability` and `hasLocation`)

#### `availability_schedule`
- **Form Field:** `<select name="availability_schedule">` - Options: Full-time, Part-time, Flexible, Weekends only
- **Validation:** `availabilityScheduleSchema.optional()` - Enum validation
- **Preprocessing:** Empty string → `undefined` (via `enumFields`)
- **Database:** `profiles.availability_schedule` (VARCHAR(30), nullable)
- **Display:** `valueFor('availability_schedule')` → `editDefaults.availability_schedule`
- **Completeness:** Part of "Availability & Locations" section

---

### **Section 7: Social & Portfolio**

#### `portfolio_url`
- **Form Field:** `<input name="portfolio_url" type="url">`
- **Validation:** `portfolioUrlSchema.optional()` - URL validation, max 255 chars
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.portfolio_url` (VARCHAR(255), nullable)
- **Display:** `valueFor('portfolio_url')` → `editDefaults.portfolio_url`
- **Completeness:** Part of "Social & Portfolio" section

#### `instagram_handle` / `instagram_url`
- **Form Field:** `<input name="instagram_handle" type="text">`
- **Validation:** `socialMediaHandleSchema.optional()` - String, max 100 chars
- **Preprocessing:**
  - **Cleaning:** `parseSocialMediaHandle(instagram_handle)` - Removes @, URLs, etc.
  - Empty string → `null`
- **Database:** 
  - `profiles.instagram_handle` (VARCHAR(100), nullable)
  - `profiles.instagram_url` (VARCHAR(255), nullable) - **Generated for Studio+ users only**
- **Display:** `valueFor('instagram_handle')` → `editDefaults.instagram_handle`
- **Special Logic:**
  - **Studio+ Only URLs:** If `is_pro === true` → `generateSocialMediaUrl('instagram', handle)`
  - Free users: URLs cleared to `null`
- **Completeness:** Part of "Social & Portfolio" section

#### `twitter_handle` / `twitter_url`
- **Form Field:** `<input name="twitter_handle" type="text">`
- **Validation:** `socialMediaHandleSchema.optional()`
- **Preprocessing:** Same as Instagram (cleaned via `parseSocialMediaHandle`)
- **Database:** `profiles.twitter_handle`, `profiles.twitter_url` (nullable)
- **Display:** `valueFor('twitter_handle')`
- **Special Logic:** Same Studio+ URL generation logic

#### `tiktok_handle` / `tiktok_url`
- **Form Field:** `<input name="tiktok_handle" type="text">`
- **Validation:** `socialMediaHandleSchema.optional()`
- **Preprocessing:** Same as Instagram/Twitter
- **Database:** `profiles.tiktok_handle`, `profiles.tiktok_url` (nullable)
- **Display:** `valueFor('tiktok_handle')`
- **Special Logic:** Same Studio+ URL generation logic

---

### **Section 8: References & Emergency Contact**

#### `reference_name`
- **Form Field:** `<input name="reference_name" type="text">`
- **Validation:** `referenceNameSchema.optional()` - String, max 100 chars
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.reference_name` (VARCHAR(100), nullable)
- **Display:** `valueFor('reference_name')` → `editDefaults.reference_name`
- **Completeness:** Required for "References & Emergency" section

#### `reference_email`
- **Form Field:** `<input name="reference_email" type="email">`
- **Validation:** `referenceEmailSchema.optional()` - Email validation, max 255 chars, or empty string
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.reference_email` (VARCHAR(255), nullable)
- **Display:** `valueFor('reference_email')` → `editDefaults.reference_email`
- **Completeness:** Required for "References & Emergency" section

#### `reference_phone`
- **Form Field:** `<input name="reference_phone" type="tel">`
- **Validation:** `referencePhoneSchema.optional()` - String, max 20 chars
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.reference_phone` (VARCHAR(20), nullable)
- **Display:** `valueFor('reference_phone')` → `editDefaults.reference_phone`
- **Completeness:** Required for "References & Emergency" section

#### `emergency_contact_name`
- **Form Field:** `<input name="emergency_contact_name" type="text">`
- **Validation:** `emergencyContactNameSchema.optional()` - String, max 100 chars
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.emergency_contact_name` (VARCHAR(100), nullable)
- **Display:** `valueFor('emergency_contact_name')` → `editDefaults.emergency_contact_name`
- **Completeness:** Required for "References & Emergency" section

#### `emergency_contact_phone`
- **Form Field:** `<input name="emergency_contact_phone" type="tel">`
- **Validation:** `emergencyContactPhoneSchema.optional()` - String, max 20 chars
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.emergency_contact_phone` (VARCHAR(20), nullable)
- **Display:** `valueFor('emergency_contact_phone')` → `editDefaults.emergency_contact_phone`
- **Completeness:** Required for "References & Emergency" section

#### `emergency_contact_relationship`
- **Form Field:** `<input name="emergency_contact_relationship" type="text">`
- **Validation:** `emergencyContactRelationshipSchema.optional()` - String, max 50 chars
- **Preprocessing:** Empty string → `undefined`
- **Database:** `profiles.emergency_contact_relationship` (VARCHAR(50), nullable)
- **Display:** `valueFor('emergency_contact_relationship')` → `editDefaults.emergency_contact_relationship`
- **Completeness:** Not explicitly required (relationship is optional)

---

### **Section 9: Work & Legal Information**

#### `work_eligibility`
- **Form Field:** `<select name="work_eligibility">` - Options: Yes, No
- **Validation:** `z.enum(['Yes', 'No']).optional()` - But converted to boolean
- **Preprocessing:**
  - `'Yes'` → `true` (boolean)
  - `'No'` → `false` (boolean)
  - Empty → `undefined`
- **Database:** `profiles.work_eligibility` (BOOLEAN, nullable)
- **Display:** `valueFor('work_eligibility')` → converted back to 'Yes'/'No' for select
- **Completeness:** Required for "References & Emergency" section

#### `work_status`
- **Form Field:** `<select name="work_status">` with "Other" option + `<input name="work_status_other">`
- **Validation:** `z.string().trim().max(50).optional()`
- **Preprocessing:**
  - **"Other" Merge:** If `work_status === 'Other'` → merge `work_status_other` into `work_status`
  - Empty string → `undefined`
- **Database:** `profiles.work_status` (VARCHAR(50), nullable)
- **Display:** `valueFor('work_status')` → `editDefaults.work_status`
- **Completeness:** Not explicitly required (optional work info)

#### `union_membership`
- **Form Field:** `<input name="union_membership" type="text" placeholder="SAG-AFTRA, AEA, etc.">`
- **Validation:** `unionMembershipSchema.optional()` - String, max 100 chars
- **Preprocessing:**
  - **Array Normalization:** If array → extract first non-empty or `undefined`
  - Empty string → `undefined`
- **Database:** `profiles.union_membership` (VARCHAR(100), nullable)
- **Display:** `valueFor('union_membership')` → `editDefaults.union_membership`

#### `previous_representations`
- **Form Field:** ❓ **Dynamic form fields** (managed by JavaScript `setupPreviousRepresentation()`)
- **Validation:** `z.union([z.string().transform(JSON.parse), z.array(z.object(...)), z.null()]).optional()`
- **Preprocessing:** None (already JSON string from form)
- **Database:** `profiles.previous_representations` (TEXT/JSONB, nullable) - Stored as JSON string
- **Display:** `valueFor('previous_representations')` → parsed from JSON string
- **Special Logic:**
  - Structured as array of objects: `[{ has_manager: true, manager_name: "...", ... }]`
  - Client-side JS manages dynamic input fields

---

### **Section 10: Bio & Content**

#### `bio` / `bio_raw` / `bio_curated`
- **Form Field:** `<textarea name="bio">`
- **Validation:** `bioSchema.optional()` - String, 10-600 chars, trimmed
- **Preprocessing:** None
- **Database:** 
  - `profiles.bio_raw` (TEXT, NOT NULL in base) - User's raw input
  - `profiles.bio_curated` (TEXT, NOT NULL in base) - AI-refined version
- **Display:** 
  - `valueFor('bio')` → shows `bio_raw` in textarea
  - `bio_curated` displayed in read-only "AI-Refined Bio" well (if exists)
- **Special Logic:**
  - **Auto-Curation:** `curateBio(bio, firstName, lastName)` function generates `bio_curated`
  - Both stored on update: `updateData.bio_raw = bio; updateData.bio_curated = curatedBio;`
  - `bio_curated` displayed separately in UI (gold-accented well)

---

## 🔧 Special Processing Patterns

### **1. "Other" Field Merging**
Fields with "Other" dropdown options automatically merge the `_other` input into the main field:
- `shoe_size` + `shoe_size_other`
- `eye_color` + `eye_color_other`
- `hair_color` + `hair_color_other`
- `skin_tone` + `skin_tone_other`
- `work_status` + `work_status_other`

**Preprocessing Logic:**
```javascript
if (processedBody[main] === 'Other' && processedBody[other] && processedBody[other].trim()) {
  processedBody[main] = processedBody[other].trim();
  delete processedBody[other]; // Remove helper field
}
```

### **2. Array Field Normalization**
Some fields arrive as arrays from HTML forms (multiple inputs with same name):
- `city_secondary: ['', '']` → Extract first non-empty → `undefined`
- `ethnicity: ['', '']` → Extract first non-empty → `undefined`
- `union_membership: ['', '']` → Extract first non-empty → `undefined`

**Preprocessing Logic:**
```javascript
if (Array.isArray(processedBody[field])) {
  const nonEmptyValue = processedBody[field].find(val => val && val.trim() !== '');
  processedBody[field] = nonEmptyValue || undefined;
}
```

### **3. Boolean Checkbox Handling**
Checkboxes only send a value when checked, so unchecked state must be inferred:
- `tattoos`, `piercings`, `availability_travel`

**Preprocessing Logic:**
```javascript
if (processedBody[field] === 'true' || processedBody[field] === true) {
  processedBody[field] = true;
} else {
  processedBody[field] = undefined; // Unchecked = undefined (not false)
}
```

### **4. JSON Field Stringification**
Array/Object fields stored as JSON strings in database:
- `specialties` → `JSON.stringify(specialties)`
- `languages` → `JSON.stringify(languages)`
- `comfort_levels` → `JSON.stringify(comfort_levels)`
- `experience_details` → `JSON.stringify(experience_details)` (if object)
- `previous_representations` → `JSON.stringify(previous_representations)` (if object)

**Storage Logic:**
```javascript
if (field !== undefined) {
  updateData.field = Array.isArray(field) || typeof field === 'object'
    ? JSON.stringify(field)
    : field; // Already a string
}
```

**Display Logic:**
```javascript
const safeJsonValue = (val) => {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
};
```

### **5. Weight Conversion**
Weight fields auto-convert between kg and lbs:
- If `weight_kg` provided → calculate `weight_lbs`
- If `weight_lbs` provided → calculate `weight_kg`
- If neither provided → keep existing values

**Conversion Logic:**
```javascript
if (finalWeightKg && !finalWeightLbs) {
  finalWeightLbs = convertKgToLbs(finalWeightKg);
} else if (finalWeightLbs && !finalWeightKg) {
  finalWeightKg = convertLbsToKg(finalWeightLbs);
}
```

### **6. Social Media URL Generation (Studio+ Only)**
Studio+ users (`is_pro === true`) get auto-generated URLs from handles:
- Free users: Handles only, URLs cleared to `null`
- Studio+ users: URLs generated via `generateSocialMediaUrl(platform, handle)`

**Logic:**
```javascript
if (isPro && cleanInstagramHandle && !finalInstagramUrl) {
  finalInstagramUrl = generateSocialMediaUrl('instagram', cleanInstagramHandle);
} else if (!isPro) {
  finalInstagramUrl = null; // Free users don't get URLs
}
```

### **7. Slug Auto-Update**
If `first_name` or `last_name` changes, slug may be regenerated:
- Only if current slug matches old name pattern
- Uses `ensureUniqueSlug()` to avoid conflicts

**Logic:**
```javascript
const oldNameSlug = `${profile.first_name}-${profile.last_name}`.toLowerCase();
if (profile.slug === oldNameSlug || profile.slug.startsWith(`${oldNameSlug}-`)) {
  const newSlug = await ensureUniqueSlug(knex, 'profiles', newNameSlug);
  updateData.slug = newSlug;
}
```

---

## 🔗 Data Source Priority (AI Onboarding → Dashboard)

Fields can be populated from multiple sources. Priority order:

### **1. Verified System Data (Highest Priority)**
- `city` → IP geolocation verified city (from `onboardingData.ipGeolocation`)
- `phone` → Google OAuth verified phone (`onboardingData.googlePhone`)
- `gender` → Google OAuth verified gender (`onboardingData.googleGender`)
- `date_of_birth` → Google OAuth verified DOB (`onboardingData.googleBirthday`)
- `hero_image_path` → Scout visual analysis image path

### **2. Librarian Synthesis (AI Onboarding)**
All conversational onboarding fields come from `synthesis.sql` (single source of truth):
- Physical metrics: `height_cm`, `weight_kg`, `weight_lbs`, `bust`, `waist`, `hips`, `shoe_size`
- Professional: `experience_level`, `training`, `specialties`, `experience_details`
- Social: `instagram_handle`, `twitter_handle`, `tiktok_handle`, `portfolio_url`
- References: `reference_name`, `reference_email`, `reference_phone`
- Emergency: `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`
- Work: `work_eligibility`, `work_status`, `union_membership`
- Preferences: `comfort_levels`, `previous_representations`, `ethnicity`, `tattoos`, `piercings`

### **3. Manual Dashboard Entry (Current Form)**
User can manually update any field via dashboard form, which overwrites AI onboarding data.

---

## 📈 Completeness Calculation

Profile completeness is calculated by `calculateProfileCompleteness()` in `src/lib/dashboard/completeness-unified.js`:

### **Section 1: Personal Info** (Strict AND logic)
- ✅ `first_name` AND `last_name` AND `email` AND `phone` AND `city`

### **Section 2: Physical Profile** (Strict AND logic)
- ✅ `height_cm` > 0 AND `bust` AND `waist` AND `hips`

### **Section 3: Experience & Training** (OR logic)
- ✅ `experience_level` OR `training`

### **Section 4: Skills & Lifestyle** (OR logic)
- ✅ `specialties` (non-empty array) OR `languages` (non-empty array) OR `ethnicity` OR `tattoos` OR `piercings`

### **Section 5: Comfort & Boundaries** (Array check)
- ✅ `comfort_levels` is non-empty array

### **Section 6: Availability & Locations** (AND logic)
- ✅ `hasAvailability` (travel OR schedule) AND `hasLocation` (city OR city_secondary)

### **Section 7: Social & Portfolio** (AND logic)
- ✅ `hasSocial` (any social handle) AND `hasPortfolio` (portfolio_url)

### **Section 8: References & Emergency** (Strict AND logic)
- ✅ `reference_name` AND `reference_email` AND `reference_phone` AND `emergency_contact_name` AND `emergency_contact_phone` AND `work_eligibility === true`

**Total Sections:** 8 completeness sections (excludes "Applications & Matches" display-only section)

---

## ⚠️ Known Issues & Edge Cases

### **1. Truthiness Logic**
- **Issue:** `0` and `false` values are falsy but valid data
- **Fix:** `safeValue()` helper checks `!== null && !== undefined` (preserves `0` and `false`)

### **2. JSON Field Corruption**
- **Issue:** JSON strings from DB might be parsed incorrectly
- **Fix:** `safeJsonValue()` helper handles both string and object/array types

### **3. Array Field Duplication**
- **Issue:** Some fields arrive as arrays `['', '']` from form
- **Fix:** Array normalization extracts first non-empty value

### **4. Boolean Null Handling**
- **Issue:** Unchecked checkboxes sent as `null` instead of `undefined`
- **Fix:** Preprocessing converts `null` → `undefined` for Zod optional fields

### **5. Height Display Issue**
- **Issue:** `height_cm: 0` is valid but hidden in form
- **Fix:** Added `parseInt(value) > 0` check to prevent hiding valid `0` values

---

## 🔍 Field Mapping Reference

| Form Field | Validation Schema | Database Column | Type | Completeness Section |
|------------|------------------|-----------------|------|---------------------|
| `first_name` | `nameSchema.optional()` | `profiles.first_name` | VARCHAR | Personal Info ✅ |
| `last_name` | `nameSchema.optional()` | `profiles.last_name` | VARCHAR | Personal Info ✅ |
| `city` | `nameSchema.optional()` | `profiles.city` | VARCHAR | Personal Info ✅ |
| `city_secondary` | `nameSchema.optional()` | `profiles.city_secondary` | VARCHAR(100) | - |
| `phone` | `phoneSchema.optional()` | `profiles.phone` | VARCHAR(20) | Personal Info ✅ |
| `height_cm` | `heightSchema.optional()` | `profiles.height_cm` | INTEGER | Physical Profile ✅ |
| `weight` / `weight_kg` / `weight_lbs` | `weightSchema.optional()` | `profiles.weight_kg`, `profiles.weight_lbs` | DECIMAL(5,2) | - |
| `bust` | `bustSchema.optional()` | `profiles.bust` | INTEGER | Physical Profile ✅ |
| `waist` | `waistSchema.optional()` | `profiles.waist` | INTEGER | Physical Profile ✅ |
| `hips` | `hipsSchema.optional()` | `profiles.hips` | INTEGER | Physical Profile ✅ |
| `shoe_size` | `z.string().max(10).optional()` | `profiles.shoe_size` | VARCHAR(10) | - |
| `gender` | `genderSchema` | `profiles.gender` | VARCHAR | - |
| `date_of_birth` | `dateOfBirthSchema.optional()` | `profiles.date_of_birth` | DATE | - |
| `age` | ❌ (removed) | `profiles.age` | INTEGER | - |
| `dress_size` | `dressSizeSchema.optional()` | `profiles.dress_size` | VARCHAR(10) | - |
| `eye_color` | `z.string().max(30).optional()` | `profiles.eye_color` | VARCHAR(30) | - |
| `hair_color` | `z.string().max(30).optional()` | `profiles.hair_color` | VARCHAR(30) | - |
| `hair_length` | `hairLengthSchema.optional()` | `profiles.hair_length` | VARCHAR(20) | - |
| `skin_tone` | `skinToneSchema.optional()` | `profiles.skin_tone` | VARCHAR(50) | - |
| `experience_level` | `experienceLevelSchema.optional()` | `profiles.experience_level` | VARCHAR(30) | Experience & Training ✅ |
| `training` | `trainingSchema.optional()` | `profiles.training` | TEXT | Experience & Training ✅ |
| `experience_details` | `z.union([z.string(), z.record()]).optional()` | `profiles.experience_details` | TEXT/JSONB | - |
| `specialties` | `z.array(z.string()).optional()` | `profiles.specialties` | TEXT (JSON) | Skills & Lifestyle ✅ |
| `languages` | `z.array(z.string()).optional()` | `profiles.languages` | TEXT (JSON) | Skills & Lifestyle ✅ |
| `ethnicity` | `ethnicitySchema.optional()` | `profiles.ethnicity` | VARCHAR(100) | Skills & Lifestyle ✅ |
| `tattoos` | `tattoosSchema.optional()` | `profiles.tattoos` | BOOLEAN | Skills & Lifestyle ✅ |
| `piercings` | `piercingsSchema.optional()` | `profiles.piercings` | BOOLEAN | Skills & Lifestyle ✅ |
| `comfort_levels` | `z.array(z.string()).optional()` | `profiles.comfort_levels` | TEXT (JSON) | Comfort & Boundaries ✅ |
| `availability_travel` | `availabilityTravelSchema.optional()` | `profiles.availability_travel` | BOOLEAN | Availability & Locations ✅ |
| `availability_schedule` | `availabilityScheduleSchema.optional()` | `profiles.availability_schedule` | VARCHAR(30) | Availability & Locations ✅ |
| `portfolio_url` | `portfolioUrlSchema.optional()` | `profiles.portfolio_url` | VARCHAR(255) | Social & Portfolio ✅ |
| `instagram_handle` | `socialMediaHandleSchema.optional()` | `profiles.instagram_handle` | VARCHAR(100) | Social & Portfolio ✅ |
| `instagram_url` | ❌ (not in form) | `profiles.instagram_url` | VARCHAR(255) | - |
| `twitter_handle` | `socialMediaHandleSchema.optional()` | `profiles.twitter_handle` | VARCHAR(100) | Social & Portfolio ✅ |
| `twitter_url` | ❌ (not in form) | `profiles.twitter_url` | VARCHAR(255) | - |
| `tiktok_handle` | `socialMediaHandleSchema.optional()` | `profiles.tiktok_handle` | VARCHAR(100) | Social & Portfolio ✅ |
| `tiktok_url` | ❌ (not in form) | `profiles.tiktok_url` | VARCHAR(255) | - |
| `reference_name` | `referenceNameSchema.optional()` | `profiles.reference_name` | VARCHAR(100) | References & Emergency ✅ |
| `reference_email` | `referenceEmailSchema.optional()` | `profiles.reference_email` | VARCHAR(255) | References & Emergency ✅ |
| `reference_phone` | `referencePhoneSchema.optional()` | `profiles.reference_phone` | VARCHAR(20) | References & Emergency ✅ |
| `emergency_contact_name` | `emergencyContactNameSchema.optional()` | `profiles.emergency_contact_name` | VARCHAR(100) | References & Emergency ✅ |
| `emergency_contact_phone` | `emergencyContactPhoneSchema.optional()` | `profiles.emergency_contact_phone` | VARCHAR(20) | References & Emergency ✅ |
| `emergency_contact_relationship` | `emergencyContactRelationshipSchema.optional()` | `profiles.emergency_contact_relationship` | VARCHAR(50) | - |
| `work_eligibility` | `z.enum(['Yes', 'No']).optional()` | `profiles.work_eligibility` | BOOLEAN | References & Emergency ✅ |
| `work_status` | `z.string().max(50).optional()` | `profiles.work_status` | VARCHAR(50) | - |
| `union_membership` | `unionMembershipSchema.optional()` | `profiles.union_membership` | VARCHAR(100) | - |
| `previous_representations` | `z.union([z.string(), z.array(z.object())]).optional()` | `profiles.previous_representations` | TEXT/JSONB | - |
| `bio` | `bioSchema.optional()` | `profiles.bio_raw`, `profiles.bio_curated` | TEXT | - |

---

## 🎯 Recommendations

### **1. Data Consistency**
- ✅ All fields correctly mapped through pipeline
- ✅ Validation schemas match database types
- ✅ Preprocessing handles edge cases (arrays, nulls, booleans)

### **2. Completeness Logic**
- ✅ Unified in `completeness-unified.js` (no split-brain)
- ✅ Strict AND logic for critical sections
- ✅ OR logic for optional depth sections

### **3. Display Logic**
- ✅ `safeValue()` preserves falsy but valid values (`0`, `false`)
- ✅ `safeJsonValue()` handles JSON string parsing
- ✅ `valueFor()` provides fallback empty string for display

### **4. Potential Improvements**
1. **Email Field:** Currently not editable (Firebase-managed) - consider adding to form with validation
2. **Age Field:** Read-only calculated field - could be removed from form entirely
3. **Measurements Field:** Old field removed, but still referenced in some code - ensure cleanup
4. **Reference Relationship:** Field exists in schema but not used in completeness - add if needed

---

**End of Report**



