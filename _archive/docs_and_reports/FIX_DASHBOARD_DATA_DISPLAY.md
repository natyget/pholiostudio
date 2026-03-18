# DASHBOARD DATA DISPLAY DEBUG & FIX

## Issue
User reports that all form fields are empty even though data exists in the database.

## Debugging Steps Added

1. **Enhanced Logging in Route Handler** (`src/routes/dashboard-talent.js`)
   - Added detailed profile data logging when profile is found
   - Logs sample field values: city, phone, height_cm, gender, date_of_birth, weight, measurements, bio

2. **Template Debug Logging** (`views/dashboard/talent.ejs`)
   - Added console.log in EJS template to verify data reception
   - Logs profile type, keys, and sample values

## Potential Issues to Check

1. **Profile Not Found**
   - Check console logs for "Profile lookup result"
   - Verify `req.session.userId` matches database user_id

2. **Data Not Passing**
   - Verify `res.render('dashboard/talent', { profile, ... })` includes profile
   - Check if profile is null/undefined at render time

3. **Template Extraction**
   - Verify `safeProfile` is correctly extracted
   - Check if `editDefaults` values are populated
   - Ensure `valueFor()` function is working

4. **Field Mapping**
   - Verify database column names match EJS template field names
   - Check for case sensitivity issues (e.g., `first_name` vs `firstName`)

## Verification Commands

Run these in browser console when dashboard loads:
```javascript
// Check if profile data exists
console.log('Profile:', typeof profile, profile);

// Check safeProfile extraction
// (This will be visible in server logs if debug logging is enabled)

// Check form field values
document.querySelectorAll('input, select, textarea').forEach(field => {
  if (field.value) {
    console.log(field.name || field.id, ':', field.value);
  }
});
```

## Next Steps

1. Check server console logs when loading `/dashboard/talent`
2. Check browser console for any JavaScript errors
3. Verify database query returns data
4. Test form submission to see if data saves correctly



