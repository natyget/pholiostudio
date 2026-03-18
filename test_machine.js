const knex = require('./src/db/knex');
const { transitionTo, canComplete } = require('./src/lib/onboarding/casting-machine');

async function verifyStateTransitions() {
  console.log('Testing transition from legacy identity state to completed flow...');
  
  let state = {
    version: 'v2_casting_call',
    current_step: 'identity',
    completed_steps: [],
    step_data: {}
  };
  
  // 1. identity -> scout
  console.log('\n--- Transition 1: identity -> scout ---');
  let payload = transitionTo(state, 'scout', {}, knex);
  state = typeof payload.onboarding_state_json === 'string' 
    ? JSON.parse(payload.onboarding_state_json) 
    : payload.onboarding_state_json;
  console.log('New state:', state);
  
  // 2. scout -> measurements
  console.log('\n--- Transition 2: scout -> measurements ---');
  payload = transitionTo(state, 'measurements', {}, knex);
  state = typeof payload.onboarding_state_json === 'string' 
    ? JSON.parse(payload.onboarding_state_json) 
    : payload.onboarding_state_json;
  console.log('New state:', state);
  
  // 3. measurements -> profile
  console.log('\n--- Transition 3: measurements -> profile ---');
  payload = transitionTo(state, 'profile', {}, knex);
  state = typeof payload.onboarding_state_json === 'string' 
    ? JSON.parse(payload.onboarding_state_json) 
    : payload.onboarding_state_json;
  console.log('New state:', state);
  
  // 4. canComplete
  console.log('\n--- Checking canComplete ---');
  const result = canComplete(state);
  console.log('canComplete(state) result:', result);
  
  if (result) {
    console.log('SUCCESS: State machine correctly tracks completed_steps from identity and allows completion.');
  } else {
    console.error('FAILURE: State machine still prevents completion.');
  }
  
  process.exit(0);
}

verifyStateTransitions();
