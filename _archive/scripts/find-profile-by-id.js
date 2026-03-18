const knex = require('./src/db/knex');

async function findProfileById() {
  try {
    const profile = await knex('profiles')
      .where({ user_id: '60009e68-0a58-4995-9436-2aca5ca69813' })
      .first();
    console.log('Profile found:', JSON.stringify(profile, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    process.exit(1);
  }
}

findProfileById();
