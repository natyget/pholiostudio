// Debug script to check dashboard data flow
// Run this to see what data is being passed to the template

const knex = require('./src/db/knex');

(async () => {
  try {
    console.log('=== DASHBOARD DATA FLOW DIAGNOSTIC ===\n');
    
    // Simulate what happens in the route handler
    console.log('1. Checking database connection...');
    const testQuery = await knex.raw('SELECT 1');
    console.log('✅ Database connected\n');
    
    // Get a sample profile (use first profile found)
    console.log('2. Fetching profile from database...');
    const profile = await knex('profiles').first();
    
    if (!profile) {
      console.log('❌ No profiles found in database');
      await knex.destroy();
      return;
    }
    
    console.log('✅ Profile found');
    console.log(`   Profile ID: ${profile.id}`);
    console.log(`   User ID: ${profile.user_id}`);
    console.log(`   Name: ${profile.first_name || 'NULL'} ${profile.last_name || 'NULL'}\n`);
    
    // Simulate template logic
    console.log('3. Simulating template data binding...');
    const safeProfile = profile || {};
    console.log(`   safeProfile type: ${typeof safeProfile}`);
    console.log(`   safeProfile keys count: ${Object.keys(safeProfile).length}`);
    
    // Test editDefaults
    console.log('\n4. Testing editDefaults object...');
    const editDefaults = {
      city: safeProfile.city || '',
      height_cm: safeProfile.height_cm || '',
      phone: safeProfile.phone || '',
      bust: safeProfile.bust || '',
      waist: safeProfile.waist || '',
      specialties: safeProfile.specialties || '[]'
    };
    
    console.log('   editDefaults values:');
    Object.keys(editDefaults).forEach(key => {
      const value = editDefaults[key];
      const source = safeProfile[key];
      const status = source ? '✅' : '❌';
      console.log(`   ${status} ${key.padEnd(20)}: editDefaults="${value}" (source: ${source === null ? 'NULL' : source === undefined ? 'UNDEFINED' : source})`);
    });
    
    // Test valueFor function
    console.log('\n5. Testing valueFor() function...');
    const formValues = editDefaults;
    const valueFor = (key) => formValues[key] || '';
    
    const testFields = ['city', 'height_cm', 'phone', 'bust', 'waist', 'specialties', 'nonexistent'];
    testFields.forEach(field => {
      const result = valueFor(field);
      const status = result ? '✅' : '❌';
      console.log(`   ${status} valueFor('${field}') = "${result}"`);
    });
    
    // Check specific problematic fields
    console.log('\n6. Checking specific fields from database...');
    const problematicFields = [
      'city', 'city_secondary', 'phone', 'bust', 'waist', 'hips',
      'shoe_size', 'eye_color', 'hair_color', 'instagram_handle',
      'experience_level', 'training', 'languages', 'specialties'
    ];
    
    problematicFields.forEach(field => {
      const dbValue = profile[field];
      const editDefaultValue = safeProfile[field] || '';
      const valueForResult = valueFor(field);
      
      console.log(`\n   Field: ${field}`);
      console.log(`     DB value: ${dbValue === null ? 'NULL' : dbValue === undefined ? 'UNDEFINED' : dbValue} (type: ${typeof dbValue})`);
      console.log(`     safeProfile[field]: ${safeProfile[field] === null ? 'NULL' : safeProfile[field] === undefined ? 'UNDEFINED' : safeProfile[field]}`);
      console.log(`     editDefaults[field]: ${editDefaults[field] || 'NOT IN editDefaults'}`);
      console.log(`     valueFor('${field}'): "${valueForResult}"`);
    });
    
    console.log('\n=== DIAGNOSIS ===\n');
    
    // Check if profile has data
    const hasData = Object.values(profile).some(val => val !== null && val !== undefined && val !== '');
    if (!hasData) {
      console.log('❌ Profile object exists but appears to have no data (all fields are null/undefined/empty)');
    } else {
      console.log('✅ Profile object has data');
    }
    
    // Check if fields match
    const sampleField = 'city';
    if (profile[sampleField] && !editDefaults[sampleField]) {
      console.log(`❌ Field "${sampleField}" exists in profile but not in editDefaults`);
    } else if (!profile[sampleField] && editDefaults[sampleField]) {
      console.log(`⚠️  Field "${sampleField}" is in editDefaults but NULL in profile`);
    } else {
      console.log(`✅ Field "${sampleField}" mapping appears correct`);
    }
    
    await knex.destroy();
    console.log('\n✅ Diagnostic complete');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    await knex.destroy();
    process.exit(1);
  }
})();



