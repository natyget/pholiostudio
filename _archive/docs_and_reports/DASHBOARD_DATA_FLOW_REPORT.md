# Dashboard Data Flow Report

## Issue: Data Not Displaying in Dashboard

**Generated:** $(date)

### Executive Summary

The diagnostic script reveals that:
- ✅ **Database has data** - Profile exists with many populated fields (city, height_cm, eye_color, hair_color, etc.)
- ✅ **Route handler works** - Profile is fetched and passed to template correctly
- ⚠️ **Template binding issue** - Fields are in the database but NOT being populated in `editDefaults`

### Root Cause Identified

**Problem:** The diagnostic shows fields like `eye_color`, `hair_color`, `shoe_size`, etc. have data in the database but the template says "NOT IN editDefaults". This suggests:

1. **The template file may not have been properly updated** with all fields in `editDefaults`
2. **Server needs to be restarted** to pick up template changes
3. **Template syntax error** preventing `editDefaults` from being created correctly

### Current Data Flow Architecture

#### 1. Database Query (Route Handler)
**File:** `src/routes/dashboard-talent.js`
**Line:** ~29

```javascript
const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
```

**Status:** ✅ Correct
- Fetches the profile record from the database
- Uses `first()` to get a single record
- Passes the entire profile object to the template

#### 2. Data Passed to Template
**File:** `src/routes/dashboard-talent.js`
**Line:** ~89-105

```javascript
return res.render('dashboard/talent', {
  title: 'Talent Dashboard',
  profile,        // ← Full profile object passed here
  images,
  completeness,
  stats: { heightFeet: toFeetInches(profile.height_cm) },
  shareUrl,
  user: currentUser,
  currentUser,
  isDashboard: true,
  layout: 'layouts/dashboard',
  allThemes,
  freeThemes,
  proThemes,
  currentTheme,
  baseUrl
});
```

**Status:** ✅ Correct
- Full `profile` object is passed to the template
- No data transformation/filtering happens here

#### 3. Template Data Binding
**File:** `views/dashboard/talent.ejs`
**Line:** 1-7

```javascript
const safeProfile = (typeof profile !== 'undefined' && profile) ? profile : {};
const editDefaults = { 
  city: safeProfile.city || '', 
  city_secondary: safeProfile.city_secondary || '',
  height_cm: safeProfile.height_cm || '', 
  bio: safeProfile.bio_raw || '',
  phone: safeProfile.phone || '',
  first_name: safeProfile.first_name || '',
  last_name: safeProfile.last_name || '',
  bust: safeProfile.bust || '',
  waist: safeProfile.waist || '',
  hips: safeProfile.hips || '',
  shoe_size: safeProfile.shoe_size || '',
  eye_color: safeProfile.eye_color || '',
  hair_color: safeProfile.hair_color || '',
  hair_length: safeProfile.hair_length || '',
  skin_tone: safeProfile.skin_tone || '',
  gender: safeProfile.gender || '',
  date_of_birth: safeProfile.date_of_birth || '',
  age: safeProfile.age || '',
  weight: safeProfile.weight_lbs || safeProfile.weight_kg || '',
  weight_unit: safeProfile.weight_unit || (safeProfile.weight_kg ? 'kg' : 'lbs'),
  weight_kg: safeProfile.weight_kg || '',
  weight_lbs: safeProfile.weight_lbs || '',
  dress_size: safeProfile.dress_size || '',
  experience_level: safeProfile.experience_level || '',
  training: safeProfile.training || '',
  portfolio_url: safeProfile.portfolio_url || '',
  instagram_handle: safeProfile.instagram_handle || '',
  twitter_handle: safeProfile.twitter_handle || '',
  tiktok_handle: safeProfile.tiktok_handle || '',
  availability_travel: safeProfile.availability_travel || '',
  availability_schedule: safeProfile.availability_schedule || '',
  work_eligibility: safeProfile.work_eligibility || '',
  work_status: safeProfile.work_status || '',
  union_membership: safeProfile.union_membership || '',
  ethnicity: safeProfile.ethnicity || '',
  tattoos: safeProfile.tattoos || '',
  piercings: safeProfile.piercings || '',
  reference_name: safeProfile.reference_name || '',
  reference_email: safeProfile.reference_email || '',
  reference_phone: safeProfile.reference_phone || '',
  emergency_contact_name: safeProfile.emergency_contact_name || '',
  emergency_contact_phone: safeProfile.emergency_contact_phone || '',
  emergency_contact_relationship: safeProfile.emergency_contact_relationship || '',
  specialties: safeProfile.specialties || '[]',
  experience_details: safeProfile.experience_details || '{}',
  languages: safeProfile.languages || '[]',
  comfort_levels: safeProfile.comfort_levels || '[]',
  previous_representations: safeProfile.previous_representations || '[]'
};
const formValues = (typeof values !== 'undefined') ? { ...editDefaults, ...values } : editDefaults;
const valueFor = (key) => formValues[key] || '';
```

**Status:** ⚠️ POTENTIAL ISSUE
- `editDefaults` now includes all fields (fixed)
- `valueFor()` function looks up values from `formValues`
- `formValues` is built from `editDefaults` merged with `values` (only present on POST errors)

#### 4. Form Field Rendering
**Example:** `views/dashboard/talent.ejs` Line ~258

```html
<input id="city" name="city" type="text" value="<%= valueFor('city') %>" placeholder="Los Angeles, CA">
```

**Status:** ✅ Correct
- Uses `valueFor('city')` to get the value
- Should return `formValues['city']` which is `editDefaults['city']` which is `safeProfile.city || ''`

### Potential Issues Identified

#### Issue 1: Profile Object Might Be Null/Undefined
**Location:** Template line 1
**Symptom:** If `profile` is null or undefined, `safeProfile` becomes `{}`, and all fields return empty strings
**Check:** Verify that the route handler is actually finding a profile in the database

#### Issue 2: Field Name Mismatches
**Location:** Database schema vs. template field names
**Symptom:** If database column names don't match template field names, values won't populate
**Check:** Verify database column names match what's in `editDefaults`

#### Issue 3: Data Type Issues
**Location:** Template `editDefaults`
**Symptom:** Boolean/number fields might be stored differently than expected
**Check:** 
- Boolean fields (like `tattoos`, `piercings`) might be `true/false` in DB but template expects strings
- Number fields (like `bust`, `waist`, `hips`) might be numbers in DB but template converts to strings

#### Issue 4: JSON Fields
**Location:** `specialties`, `languages`, `comfort_levels`, etc.
**Symptom:** These are JSON strings in the database but might need parsing
**Check:** Template uses them as strings (correct for hidden inputs), but checkbox/language tags might need parsing

### Diagnostic Steps Needed

1. **Verify Profile Exists in Database**
   - Check if `profile` object is null when passed to template
   - Add console.log in route handler to see what profile data looks like

2. **Check Database Column Names**
   - Verify column names match exactly what's in `editDefaults`
   - Check for typos or case sensitivity issues

3. **Verify Data Types**
   - Check if numeric fields are stored as numbers or strings
   - Check if boolean fields are stored as booleans or strings/numbers

4. **Test Template Directly**
   - Render template with mock data to see if binding works
   - Check browser console for JavaScript errors

### Recommended Next Steps

1. Add debug logging in route handler to see what profile data looks like
2. Add debug logging in template to see what safeProfile contains
3. Check browser console for any JavaScript errors
4. Verify database has actual data (not just NULL values)
5. Check if the issue is specific to certain fields or all fields

### Code Locations to Check

- **Route Handler:** `src/routes/dashboard-talent.js` lines 22-105
- **Template Data Binding:** `views/dashboard/talent.ejs` lines 1-60
- **Form Fields:** `views/dashboard/talent.ejs` lines 254+ (various sections)
- **Database Query:** `src/routes/dashboard-talent.js` line 29


### Diagnostic Results

**Database Status:**
- Profile found: ✅ Yes
- Profile ID: bc32f895-49d5-451a-b7c9-1f75b7e2d7c7
- Total fields in profile: 66

**Fields WITH Data (Should Display):**
- ✅ first_name: "Elizabeth"
- ✅ last_name: "Anderson"
- ✅ city: "New York, NY"
- ✅ height_cm: 167
- ✅ eye_color: "Blue"
- ✅ hair_color: "Grey"
- ✅ hair_length: "Long"
- ✅ skin_tone: "Medium"
- ✅ gender: "Female"
- ✅ date_of_birth: "1998-09-07"
- ✅ weight_kg: 65.00
- ✅ weight_lbs: 130.00
- ✅ experience_level: "New Face"
- ✅ availability_schedule: "Full-time"
- ✅ specialties: ["Editorial","Commercial","Runway"]
- ✅ languages: ["English"]

**Fields WITHOUT Data (NULL - Empty is Expected):**
- ❌ city_secondary: NULL
- ❌ phone: NULL
- ❌ bust: NULL
- ❌ waist: NULL
- ❌ hips: NULL
- ❌ shoe_size: NULL
- ❌ training: NULL
- ❌ portfolio_url: NULL
- ❌ instagram_handle: NULL
- ❌ And many more NULL fields...

**Critical Finding:**
The diagnostic script tested `editDefaults` and found that fields like `eye_color`, `hair_color`, `shoe_size` etc. show "NOT IN editDefaults" even though:
1. They exist in the database with values
2. The template code was updated to include them

This suggests the template changes may not have taken effect.

### Recommended Actions

1. **Verify Template File Was Saved**
   - Check `views/dashboard/talent.ejs` line 5-54
   - Ensure `editDefaults` object includes ALL fields
   - Look for syntax errors (missing commas, brackets, etc.)

2. **Restart the Server**
   - Template files are often cached
   - Restart Node.js/nodemon to pick up changes

3. **Check Browser Cache**
   - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
   - Or clear browser cache

4. **Verify Template Syntax**
   - Run: `node -e "const ejs = require('ejs'); const fs = require('fs'); ejs.compile(fs.readFileSync('views/dashboard/talent.ejs', 'utf8')); console.log('✅ Template syntax OK');"`
   - If it errors, there's a syntax issue preventing the template from compiling

5. **Add Debug Logging**
   - Temporarily add console.log in template to see what safeProfile contains
   - Or add logging in route handler to see what's being passed

### Code Locations

- **Route Handler:** `src/routes/dashboard-talent.js` line 29-91
- **Template Data Binding:** `views/dashboard/talent.ejs` line 1-60
- **Form Fields:** Various locations starting around line 254

### Next Steps

1. Check if server was restarted after template changes
2. Verify template file has all fields in editDefaults
3. Test with a hard browser refresh
4. If still not working, add temporary debug logging to see what data is actually in safeProfile
