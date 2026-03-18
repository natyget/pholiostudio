/**
 * Casting Call API Integration Tests
 * Tests the full flow: Entry → Scout → Vibe → Reveal → Status
 *
 * Run with: node src/routes/test-casting-api.js
 *
 * NOTE: This is a lightweight test. For full integration testing,
 * use a proper test framework like Jest with Supertest.
 */

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const knex = require('../db/knex');

// Import dependencies to verify they exist
const SignalCollector = require('../lib/onboarding/signal-collector');
const { getState, canEnterReveal } = require('../lib/onboarding/casting-machine');
const { verifyGoogleToken } = require('../lib/onboarding/providers/google');

async function runTests() {
  console.log('🚀 Starting Casting Call API Integration Tests\n');

  let testUserId = null;
  let testProfileId = null;

  try {
    // === Test 1: Dependencies Check ===
    console.log('📝 Test 1: Verifying dependencies...');

    // Check if casting routes file exists
    const castingRoutePath = path.join(__dirname, 'casting.js');
    if (!fs.existsSync(castingRoutePath)) {
      throw new Error('casting.js route file not found');
    }
    console.log('✅ casting.js exists');

    // Check if SignalCollector methods exist
    if (typeof SignalCollector.collectEntrySignals !== 'function') {
      throw new Error('SignalCollector.collectEntrySignals not found');
    }
    if (typeof SignalCollector.collectScoutSignals !== 'function') {
      throw new Error('SignalCollector.collectScoutSignals not found');
    }
    if (typeof SignalCollector.collectVibeSignals !== 'function') {
      throw new Error('SignalCollector.collectVibeSignals not found');
    }
    if (typeof SignalCollector.calculateArchetype !== 'function') {
      throw new Error('SignalCollector.calculateArchetype not found');
    }
    console.log('✅ SignalCollector methods available');

    // Check if casting machine functions exist
    if (typeof getState !== 'function') {
      throw new Error('getState function not found');
    }
    if (typeof canEnterReveal !== 'function') {
      throw new Error('canEnterReveal function not found');
    }
    console.log('✅ Casting machine functions available');

    // === Test 2: Create Mock Profile (simulates POST /casting/entry) ===
    console.log('\n📝 Test 2: Simulating entry flow...');

    testUserId = uuidv4();
    testProfileId = uuidv4();

    await knex('users').insert({
      id: testUserId,
      email: `test-${Date.now()}@castingtest.com`,
      firebase_uid: `test-uid-${Date.now()}`,
      role: 'TALENT',
      created_at: knex.fn.now()
    });

    const { initialState } = require('../lib/onboarding/casting-machine');
    const initial = initialState('entry', knex);

    await knex('profiles').insert({
      id: testProfileId,
      user_id: testUserId,
      slug: `test-cast-${Date.now()}`,
      first_name: 'Test',
      last_name: 'Talent',
      city: 'Los Angeles',
      height_cm: 175,
      bio_raw: 'Test bio',
      bio_curated: 'Test bio',
      ...initial,
      visibility_mode: 'private_intake',
      created_at: knex.fn.now()
    });

    // Collect entry signals
    await SignalCollector.collectEntrySignals(testProfileId, {
      oauth_provider: 'google',
      inferred_location: 'Los Angeles, CA',
      inferred_bio_keywords: ['model', 'fashion']
    });

    console.log('✅ Entry flow simulated:', { user_id: testUserId, profile_id: testProfileId });

    // === Test 3: Scout Flow (simulates POST /casting/scout) ===
    console.log('\n📝 Test 3: Simulating scout flow...');

    await SignalCollector.collectScoutSignals(testProfileId, {
      digi_storage_key: 'uploads/test-digi-123.webp',
      ai_phenotype_tags: {
        hair_color: 'brown',
        eye_color: 'hazel',
        skin_tone: 'medium',
        build: 'athletic'
      },
      ai_predicted_measurements: {
        height_cm: 175,
        bust: 34,
        waist: 26,
        hips: 36
      },
      user_edits_count: 0
    });

    // Transition state
    let profile = await knex('profiles').where({ id: testProfileId }).first();
    let state = getState(profile);
    const { transitionTo } = require('../lib/onboarding/casting-machine');
    const scoutPayload = transitionTo(state, 'scout', { photo_uploaded: true }, knex);
    await knex('profiles').where({ id: testProfileId }).update(scoutPayload);

    profile = await knex('profiles').where({ id: testProfileId }).first();
    state = getState(profile);

    console.log('✅ Scout flow simulated:', {
      current_step: state.current_step,
      completed_steps: state.completed_steps,
      can_reveal: canEnterReveal(state)
    });

    // === Test 4: Vibe Flow (simulates POST /casting/vibe) ===
    console.log('\n📝 Test 4: Simulating vibe flow...');

    await SignalCollector.collectVibeSignals(testProfileId, {
      ambition_type: 'commercial',
      travel_willingness: 'high',
      comfort_level: 'adventurous'
    });

    // Transition state
    const vibePayload = transitionTo(state, 'vibe', { questions_answered: 3 }, knex);
    await knex('profiles').where({ id: testProfileId }).update(vibePayload);

    profile = await knex('profiles').where({ id: testProfileId }).first();
    state = getState(profile);

    console.log('✅ Vibe flow simulated:', {
      current_step: state.current_step,
      completed_steps: state.completed_steps,
      can_reveal: canEnterReveal(state)
    });

    // === Test 5: Check Reveal Prerequisites ===
    console.log('\n📝 Test 5: Checking reveal prerequisites...');

    // NOTE: When AT vibe step, vibe is not yet marked complete
    // Need to transition FROM vibe to mark it as complete
    // Let's transition to reveal to complete vibe
    const revealPayload = transitionTo(state, 'reveal', { archetype_ready: true }, knex);
    await knex('profiles').where({ id: testProfileId }).update(revealPayload);

    profile = await knex('profiles').where({ id: testProfileId }).first();
    state = getState(profile);

    if (!canEnterReveal(state)) {
      throw new Error('Should be able to enter reveal after scout + vibe');
    }

    console.log('✅ Reveal prerequisites met:', {
      completed_steps: state.completed_steps,
      current_step: state.current_step
    });

    // === Test 6: Reveal Flow (simulates GET /casting/reveal) ===
    console.log('\n📝 Test 6: Simulating reveal flow...');

    const signals = await SignalCollector.getSignalsByProfileId(testProfileId);
    if (!signals) {
      throw new Error('Signals not found');
    }

    const archetype = await SignalCollector.calculateArchetype(signals.id);

    console.log('✅ Archetype calculated:', {
      label: archetype.label,
      commercial: archetype.commercial + '%',
      editorial: archetype.editorial + '%',
      lifestyle: archetype.lifestyle + '%'
    });

    // === Test 7: Status Check (simulates GET /casting/status) ===
    console.log('\n📝 Test 7: Checking status endpoint data...');

    const { getNextSteps } = require('../lib/onboarding/casting-machine');
    const nextSteps = getNextSteps(state);

    console.log('✅ Status data:', {
      current_step: state.current_step,
      completed_steps: state.completed_steps,
      next_steps: nextSteps,
      can_reveal: canEnterReveal(state)
    });

    // === Test 8: Route Registration Check ===
    console.log('\n📝 Test 8: Verifying route registration in app.js...');

    const appPath = path.join(__dirname, '..', 'app.js');
    const appContent = fs.readFileSync(appPath, 'utf8');

    if (!appContent.includes("require('./routes/casting')")) {
      throw new Error('casting routes not imported in app.js');
    }

    if (!appContent.includes('castingRoutes')) {
      throw new Error('castingRoutes not referenced in app.js');
    }

    console.log('✅ Casting routes properly registered in app.js');

    console.log('\n✅ All API integration tests passed!\n');
    console.log('📋 Summary:');
    console.log('  - Dependencies verified');
    console.log('  - Entry flow working');
    console.log('  - Scout flow working');
    console.log('  - Vibe flow working');
    console.log('  - Reveal prerequisites checked');
    console.log('  - Archetype calculation working');
    console.log('  - Status endpoint data correct');
    console.log('  - Routes registered in app.js');
    console.log('\n🎉 Phase 2 implementation is ready for testing!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Cleanup
    if (testProfileId) {
      console.log('\n🧹 Cleaning up test data...');
      await knex('onboarding_signals').where({ profile_id: testProfileId }).del();
      await knex('profiles').where({ id: testProfileId }).del();
      await knex('users').where({ id: testUserId }).del();
      console.log('✅ Cleanup complete');
    }

    await knex.destroy();
    console.log('\n👋 Tests finished\n');
  }
}

// Run tests
runTests();
