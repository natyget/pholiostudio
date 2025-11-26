const knex = require('./src/db/knex');

async function verifySeeding() {
  try {
    // 1. Check Agency Account
    const agency = await knex('users').where({ email: 'you@agency.com' }).first();
    console.log('Agency Account:', agency ? 'Found' : 'Not Found');
    if (agency) {
      console.log('Agency Name:', agency.agency_name);
      
      // Update agency name if not set
      if (agency.agency_name !== 'True Modeling Agency') {
        await knex('users')
          .where({ id: agency.id })
          .update({ agency_name: 'True Modeling Agency' });
        console.log('Updated Agency Name to: True Modeling Agency');
      }
    }

    // 2. Check Discoverable Profiles
    // Discoverable profiles are those with is_discoverable=true AND no application to this agency
    const existingApplicationProfileIds = await knex('applications')
      .where({ agency_id: agency.id })
      .pluck('profile_id');

    const discoverableProfiles = await knex('profiles')
      .where({ is_discoverable: true })
      .whereNotIn('id', existingApplicationProfileIds)
      .count('* as count')
      .first();

    console.log('Discoverable Profiles Count:', discoverableProfiles.count);

    // 3. Check Applicants
    const applicants = await knex('applications')
      .where({ agency_id: agency.id })
      .select('status')
      .count('* as count')
      .groupBy('status');

    console.log('Applicants Count by Status:');
    applicants.forEach(app => {
      console.log(`- ${app.status || 'pending'}: ${app.count}`);
    });

    // 4. Sample Profile Check
    const sampleProfile = await knex('profiles').first();
    if (sampleProfile) {
      console.log('Sample Profile:', {
        name: `${sampleProfile.first_name} ${sampleProfile.last_name}`,
        city: sampleProfile.city,
        images: (await knex('images').where({ profile_id: sampleProfile.id })).length
      });
    }

  } catch (error) {
    console.error('Verification Error:', error);
  } finally {
    await knex.destroy();
  }
}

verifySeeding();
