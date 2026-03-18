const knex = require('./src/db/knex');

async function checkOnboardingCompletedAt() {
  try {
    const profile = await knex('profiles')
      .where({ user_id: '60009e68-0a58-4995-9436-2aca5ca69813' })
      .first();
    console.log('onboarding_completed_at:', profile.onboarding_completed_at);
    process.exit(0);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    process.exit(1);
  }
}

checkOnboardingCompletedAt();
