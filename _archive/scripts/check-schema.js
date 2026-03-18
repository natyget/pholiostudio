const knex = require('./src/db/knex');

async function checkSchema() {
  try {
    const columns = await knex('profiles').columnInfo();
    console.log('Columns in profiles table:', JSON.stringify(columns, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error fetching column info:', error.message);
    process.exit(1);
  }
}

checkSchema();
