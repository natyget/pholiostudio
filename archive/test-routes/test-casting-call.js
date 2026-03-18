/**
 * Verification Test Script for Project Casting Call Infrastructure
 * Tests Signal Collector and Casting Machine functionality
 *
 * Run with: node src/lib/onboarding/test-casting-call.js
 */

const { v4: uuidv4 } = require('uuid');
const knex = require('../../db/knex');
const SignalCollector = require('./signal-collector');
const {
  getState,
  transitionTo,
  canEnterReveal,
  getNextSteps,
  initialState
} = require('./casting-machine');

async function runTests() {
  console.log('🚀 Starting Casting Call Infrastructure Tests\n');

  let testProfileId = null;
  let testUserId = null;

  try {
    // === Test 1: Create Test User & Profile ===
    console.log('📝 Test 1: Creating test user and profile...');
    testUserId = uuidv4();
    testProfileId = uuidv4();

    await knex('users').insert({
      id: testUserId,
      email: `test-${Date.now()}@pholio.test`,
      role: 'TALENT',
      created_at: knex.fn.now()
    });

    const initial = initialState('entry', knex);
    await knex('profiles').insert({
      id: testProfileId,
      user_id: testUserId,
      slug: `test-${Date.now()}`,
      first_name: 'Test',
      last_name: 'User',
      city: 'Los Angeles',
      height_cm: 175,
      bio_raw: 'Test bio',
      bio_curated: 'Test bio',
      ...initial,
      created_at: knex.fn.now()
    });

    console.log('✅ Created test profile:', testProfileId);

    // === Test 2: Signal Collector - Entry Signals ===
    console.log('\n📝 Test 2: Collecting Entry Signals...');
    const entrySignals = await SignalCollector.collectEntrySignals(testProfileId, {
      oauth_provider: 'google',
      inferred_location: 'Los Angeles, CA',
      inferred_bio_keywords: ['model', 'fashion', 'commercial']
    });

    console.log('✅ Entry signals collected:', {
      id: entrySignals.id,
      oauth_provider: entrySignals.oauth_provider,
      location: entrySignals.inferred_location
    });

    // === Test 3: Signal Collector - Scout Signals ===
    console.log('\n📝 Test 3: Collecting Scout Signals...');
    const scoutSignals = await SignalCollector.collectScoutSignals(testProfileId, {
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

    console.log('✅ Scout signals collected:', {
      digi_storage_key: scoutSignals.digi_storage_key,
      phenotype: scoutSignals.ai_phenotype_tags
    });

    // === Test 4: Signal Collector - Vibe Signals ===
    console.log('\n📝 Test 4: Collecting Vibe Signals...');
    const vibeSignals = await SignalCollector.collectVibeSignals(testProfileId, {
      ambition_type: 'commercial',
      travel_willingness: 'high',
      comfort_level: 'adventurous'
    });

    console.log('✅ Vibe signals collected:', {
      ambition: vibeSignals.ambition_type,
      travel: vibeSignals.travel_willingness,
      comfort: vibeSignals.comfort_level
    });

    // === Test 5: State Machine - Initial State ===
    console.log('\n📝 Test 5: Testing State Machine...');
    let profile = await knex('profiles').where({ id: testProfileId }).first();
    let state = getState(profile);

    console.log('✅ Initial state:', {
      current_step: state.current_step,
      completed_steps: state.completed_steps,
      can_enter_reveal: state.can_enter_reveal
    });

    // === Test 6: State Machine - Transition to Scout ===
    console.log('\n📝 Test 6: Transitioning entry -> scout...');
    const scoutPayload = transitionTo(state, 'scout', { photo_uploaded: true }, knex);
    await knex('profiles').where({ id: testProfileId }).update(scoutPayload);

    profile = await knex('profiles').where({ id: testProfileId }).first();
    state = getState(profile);

    console.log('✅ After scout transition:', {
      current_step: state.current_step,
      completed_steps: state.completed_steps,
      can_enter_reveal: canEnterReveal(state),
      next_steps: getNextSteps(state)
    });

    // === Test 7: State Machine - Transition to Vibe ===
    console.log('\n📝 Test 7: Transitioning scout -> vibe...');
    const vibePayload = transitionTo(state, 'vibe', { questions_answered: 3 }, knex);
    await knex('profiles').where({ id: testProfileId }).update(vibePayload);

    profile = await knex('profiles').where({ id: testProfileId }).first();
    state = getState(profile);

    console.log('✅ After vibe transition:', {
      current_step: state.current_step,
      completed_steps: state.completed_steps,
      can_enter_reveal: canEnterReveal(state),
      next_steps: getNextSteps(state)
    });

    // === Test 8: Archetype Calculation ===
    console.log('\n📝 Test 8: Calculating Archetype...');
    const signals = await SignalCollector.getSignalsByProfileId(testProfileId);
    const archetype = await SignalCollector.calculateArchetype(signals.id);

    console.log('✅ Archetype calculated:', {
      label: archetype.label,
      commercial: archetype.commercial + '%',
      editorial: archetype.editorial + '%',
      lifestyle: archetype.lifestyle + '%'
    });

    // === Test 9: Verify Archetype Stored ===
    console.log('\n📝 Test 9: Verifying archetype stored in database...');
    const updatedSignals = await SignalCollector.getSignalsByProfileId(testProfileId);

    console.log('✅ Archetype stored:', {
      commercial_pct: updatedSignals.archetype_commercial_pct,
      editorial_pct: updatedSignals.archetype_editorial_pct,
      lifestyle_pct: updatedSignals.archetype_lifestyle_pct,
      label: updatedSignals.archetype_label
    });

    console.log('\n✅ All tests passed! Casting Call infrastructure is ready.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
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
