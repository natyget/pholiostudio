/**
 * Dashboard Talent Onboarding Routes - Phase B
 * Handles profile completion (draft save and submit)
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const knex = require('../db/knex');
const { requireRole } = require('../middleware/auth');
const { addMessage } = require('../middleware/context');
const { onboardingDraftSchema, onboardingSubmitSchema } = require('../lib/validation');
const { canSubmitProfile } = require('../lib/onboarding/validation');
const { upsertApplication } = require('../lib/onboarding/application-helpers');
const { runOnboardingPipeline } = require('../lib/onboarding/pipeline');
const { calculateAge, convertKgToLbs, convertLbsToKg } = require('../lib/profile-helpers');
const { transitionTo, getState } = require('../lib/onboarding/state-machine');
const { curateBio } = require('../lib/curate');
const { ensureUniqueSlug } = require('../lib/slugify');

/**
 * POST /dashboard/talent/onboarding/save
 * Phase B: Draft save (partial profile fields)
 * - Accept partial profile fields (no strict schema)
 * - Update profiles table with provided fields
 * - Keep onboarding_stage='completing'
 */
router.post('/dashboard/talent/onboarding/save', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      addMessage(req, 'error', 'Profile not found. Please start the onboarding process.');
      return res.status(404).redirect('/apply');
    }

    // Validate with permissive draft schema
    const parsed = onboardingDraftSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      addMessage(req, 'error', 'Some fields are invalid. Please check your input.');
      return res.status(422).redirect('/dashboard/talent?onboarding=1');
    }

    const data = parsed.data;

    // Prepare update object (only include fields that were provided)
    const updateData = {
      updated_at: knex.fn.now()
    };

    // Handle each field if provided
    if (data.first_name !== undefined) updateData.first_name = data.first_name || null;
    if (data.last_name !== undefined) updateData.last_name = data.last_name || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.city_secondary !== undefined) updateData.city_secondary = data.city_secondary || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.height_cm !== undefined) updateData.height_cm = data.height_cm || null;
    if (data.bust !== undefined) updateData.bust = data.bust || null;
    if (data.waist !== undefined) updateData.waist = data.waist || null;
    if (data.hips !== undefined) updateData.hips = data.hips || null;
    if (data.shoe_size !== undefined) updateData.shoe_size = data.shoe_size || null;
    if (data.eye_color !== undefined) updateData.eye_color = data.eye_color || null;
    if (data.hair_color !== undefined) updateData.hair_color = data.hair_color || null;
    if (data.hair_length !== undefined) updateData.hair_length = data.hair_length || null;
    if (data.skin_tone !== undefined) updateData.skin_tone = data.skin_tone || null;
    if (data.gender !== undefined) updateData.gender = data.gender || null;
    if (data.date_of_birth !== undefined) {
      updateData.date_of_birth = data.date_of_birth || null;
      // Calculate age from date of birth
      if (data.date_of_birth) {
        updateData.age = calculateAge(data.date_of_birth);
      } else {
        updateData.age = null;
      }
    }
    if (data.weight_kg !== undefined) updateData.weight_kg = data.weight_kg || null;
    if (data.weight_lbs !== undefined) updateData.weight_lbs = data.weight_lbs || null;
    if (data.dress_size !== undefined) updateData.dress_size = data.dress_size || null;
    if (data.bio !== undefined) {
      updateData.bio_raw = data.bio;
      updateData.bio_curated = curateBio(data.bio, profile.first_name, profile.last_name);
    }
    if (data.specialties !== undefined) {
      const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
      if (isPostgres) {
        updateData.specialties = (data.specialties && Array.isArray(data.specialties) && data.specialties.length > 0) ? data.specialties : null;
      } else {
        updateData.specialties = data.specialties && Array.isArray(data.specialties) && data.specialties.length > 0 ? JSON.stringify(data.specialties) : null;
      }
    }
    if (data.languages !== undefined) {
      const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
      if (isPostgres) {
        updateData.languages = (data.languages && Array.isArray(data.languages) && data.languages.length > 0) ? data.languages : null;
      } else {
        updateData.languages = data.languages && Array.isArray(data.languages) && data.languages.length > 0 ? JSON.stringify(data.languages) : null;
      }
    }
    if (data.comfort_levels !== undefined) {
      const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
      if (isPostgres) {
        updateData.comfort_levels = (data.comfort_levels && Array.isArray(data.comfort_levels) && data.comfort_levels.length > 0) ? data.comfort_levels : null;
      } else {
        updateData.comfort_levels = data.comfort_levels && Array.isArray(data.comfort_levels) && data.comfort_levels.length > 0 ? JSON.stringify(data.comfort_levels) : null;
      }
    }
    if (data.availability_travel !== undefined) updateData.availability_travel = data.availability_travel || false;
    if (data.availability_schedule !== undefined) updateData.availability_schedule = data.availability_schedule || null;
    if (data.experience_level !== undefined) updateData.experience_level = data.experience_level || null;
    if (data.training !== undefined) updateData.training = data.training || null;
    if (data.portfolio_url !== undefined) updateData.portfolio_url = data.portfolio_url || null;
    if (data.instagram_handle !== undefined) updateData.instagram_handle = data.instagram_handle || null;
    if (data.twitter_handle !== undefined) updateData.twitter_handle = data.twitter_handle || null;
    if (data.tiktok_handle !== undefined) updateData.tiktok_handle = data.tiktok_handle || null;
    if (data.reference_name !== undefined) updateData.reference_name = data.reference_name || null;
    if (data.reference_email !== undefined) updateData.reference_email = data.reference_email || null;
    if (data.reference_phone !== undefined) updateData.reference_phone = data.reference_phone || null;
    if (data.emergency_contact_name !== undefined) updateData.emergency_contact_name = data.emergency_contact_name || null;
    if (data.emergency_contact_phone !== undefined) updateData.emergency_contact_phone = data.emergency_contact_phone || null;
    if (data.emergency_contact_relationship !== undefined) updateData.emergency_contact_relationship = data.emergency_contact_relationship || null;
    if (data.work_eligibility !== undefined) updateData.work_eligibility = data.work_eligibility || null;
    if (data.work_status !== undefined) updateData.work_status = data.work_status || null;
    if (data.union_membership !== undefined) updateData.union_membership = data.union_membership || null;
    if (data.ethnicity !== undefined) updateData.ethnicity = data.ethnicity || null;
    if (data.tattoos !== undefined) updateData.tattoos = data.tattoos || false;
    if (data.piercings !== undefined) updateData.piercings = data.piercings || false;

    // Update profile
    await knex('profiles')
      .where({ id: profile.id })
      .update(updateData);

    // Keep onboarding_stage as 'completing' (don't change it)
    // updateData doesn't include onboarding_stage, so it stays as is

    addMessage(req, 'success', 'Profile draft saved successfully.');
    return res.redirect('/dashboard/talent?onboarding=1');
  } catch (error) {
    console.error('[Dashboard/Onboarding Save] Error:', error);
    return next(error);
  }
});

/**
 * POST /dashboard/talent/onboarding/submit
 * Phase B: Final submit (strict validation, trigger Phase C)
 * - Validate required fields using onboardingSubmitSchema
 * - Validate minimum photos (>= 6)
 * - Set onboarding_stage='submitted', submitted_at=now()
 * - Create/upsert application if partner_agency_id exists
 * - Enqueue Phase C pipeline jobs (fire-and-forget)
 * - Redirect to /onboarding/status
 */
router.post('/dashboard/talent/onboarding/submit', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      addMessage(req, 'error', 'Profile not found. Please start the onboarding process.');
      return res.status(404).redirect('/apply');
    }

    // Load images for validation
    const images = await knex('images').where({ profile_id: profile.id }).orderBy('sort', 'asc');

    // Validate required fields
    const parsed = onboardingSubmitSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      addMessage(req, 'error', 'Please complete all required fields before submitting.');
      return res.status(422).redirect('/dashboard/talent?onboarding=1');
    }

    // Validate profile can be submitted (required fields + minimum photos)
    const validationResult = canSubmitProfile(profile, images);
    if (!validationResult.ok) {
      const missingParts = [];
      if (validationResult.missing_fields.length > 0) {
        missingParts.push(`missing fields: ${validationResult.missing_fields.join(', ')}`);
      }
      if (!validationResult.has_enough_photos) {
        missingParts.push(`minimum ${validationResult.min_photos} photos required (you have ${validationResult.photo_count})`);
      }
      
      addMessage(req, 'error', `Cannot submit profile: ${missingParts.join(', ')}.`);
      return res.status(422).redirect('/dashboard/talent?onboarding=1');
    }

    // Set onboarding_stage to 'submitted'
    // Transition: Completing -> Submitted
    const currentState = getState(profile);
    const transitionPayload = transitionTo(currentState, 'submitted', {}, knex);

    await knex('profiles')
      .where({ id: profile.id })
      .update({
        ...transitionPayload,
        submitted_at: knex.fn.now(),
        updated_at: knex.fn.now()
      });

    // Create/upsert application if partner_agency_id exists
    if (profile.partner_agency_id) {
      try {
        await upsertApplication(profile.id, profile.partner_agency_id);
      } catch (appError) {
        console.error('[Dashboard/Onboarding Submit] Error creating application:', appError);
        // Don't fail the whole request if application creation fails
      }
    }

    // Enqueue Phase C pipeline (fire-and-forget async)
    // Use setImmediate to run in next tick, don't block user flow
    setImmediate(async () => {
      try {
        console.log('[Dashboard/Onboarding Submit] Enqueueing Phase C pipeline for profile:', profile.id);
        await runOnboardingPipeline(profile.id);
        console.log('[Dashboard/Onboarding Submit] Phase C pipeline completed for profile:', profile.id);
      } catch (pipelineError) {
        console.error('[Dashboard/Onboarding Submit] Phase C pipeline error:', pipelineError);
        // Log error but don't throw - pipeline errors don't affect user flow
        // Profile remains in 'submitted' state (can be retried later if needed)
      }
    });

    // Redirect to onboarding status page
    return res.redirect(303, '/onboarding/status');
  } catch (error) {
    console.error('[Dashboard/Onboarding Submit] Error:', error);
    return next(error);
  }
});

module.exports = router;
