const knex = require('./src/db/knex');

async function verifySchema() {
  try {
    console.log('Verifying boards system schema...\n');

    // Check boards table
    const boards = await knex('boards').select('*').limit(1);
    console.log('✓ Boards table exists and is accessible');

    // Check board_requirements table
    const requirements = await knex('board_requirements').select('*').limit(1);
    console.log('✓ Board requirements table exists');

    // Check board_scoring_weights table
    const weights = await knex('board_scoring_weights').select('*').limit(1);
    console.log('✓ Board scoring weights table exists');

    // Check board_applications table
    const boardApps = await knex('board_applications').select('*').limit(1);
    console.log('✓ Board applications table exists');

    // Check application_notes table
    const notes = await knex('application_notes').select('*').limit(1);
    console.log('✓ Application notes table exists');

    // Check application_tags table
    const tags = await knex('application_tags').select('*').limit(1);
    console.log('✓ Application tags table exists');

    console.log('\n✅ All required tables exist and are accessible!');
    console.log('\nYou can now start the server with: npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('❌ Schema verification failed:', error.message);
    process.exit(1);
  }
}

verifySchema();
