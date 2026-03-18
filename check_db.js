const knex = require('./src/db/knex');
async function run() {
  const p = await knex('profiles').orderBy('created_at', 'desc').first();
  console.log('Latest Profile:', {
    id: p.id,
    first_name: p.first_name,
    height_cm: p.height_cm,
    weight_kg: p.weight_kg,
    bust_cm: p.bust_cm,
    waist_cm: p.waist_cm,
    hips_cm: p.hips_cm,
    gender: p.gender
  });
  
  const state = await knex('profiles').select('onboarding_state_json', 'onboarding_stage').where('id', p.id).first();
  console.log('State:', state);
  process.exit();
}
run();
