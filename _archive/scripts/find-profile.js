const knex = require('./src/db/knex');

async function findProfile() {
  try {
    const profile = await knex('profiles')
      .where({ height_cm: 171 })
      .first();
    console.log('Profile found:', JSON.stringify(profile, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    process.exit(1);
  }
}

findProfile();
