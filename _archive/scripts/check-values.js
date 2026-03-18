const knex = require('./src/db/knex');

async function checkLastProfileValues() {
  try {
    const profile = await knex('profiles')
      .orderBy('updated_at', 'desc')
      .first();
    console.log('Values:', {
      id: profile.id,
      height_cm: profile.height_cm,
      weight_kg: profile.weight_kg,
      weight_lbs: profile.weight_lbs,
      bust: profile.bust,
      waist: profile.waist,
      hips: profile.hips,
      updated_at: profile.updated_at
    });
    process.exit(0);
  } catch (error) {
    console.error('Error fetching values:', error.message);
    process.exit(1);
  }
}

checkLastProfileValues();
