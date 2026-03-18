const knex = require('./src/db/knex');

async function checkLastProfile() {
  try {
    const profile = await knex('profiles')
      .orderBy('updated_at', 'desc')
      .first();
    console.log('Last updated profile:', JSON.stringify(profile, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    process.exit(1);
  }
}

checkLastProfile();
