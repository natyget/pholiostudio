/**
 * Onboarding Routes (New State Machine)
 * Handles the premium onboarding flow for new talent users
 * State machine: identity -> upload -> confirm -> reveal -> done
 */

const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const knex = require('../db/knex');
const config = require('../config');
const { requireRole } = require('../middleware/auth');
const { addMessage } = require('../middleware/context');
const { 
  onboardingIdentitySchema, 
  onboardingPredictionsSchema
} = require('../lib/validation');
const { upload, processImage } = require('../lib/uploader');
const { analyzePhoto } = require('../lib/ai/photo-analysis');
const { computeProfileCompleteness, updateProfileCompleteness } = require('../lib/profile-completeness');
const { ensureUniqueSlug } = require('../lib/slugify');
const { 
  ensureUserAndDraftProfile,
  verifyGoogleToken,
  normalizeGoogleUser,
  verifyInstagramCode,
  normalizeInstagramUser,
  getLockedAgencyId
} = require('../lib/onboarding/auth-helpers');
const OnboardingAnalytics = require('../lib/analytics/onboarding-events');
const ImageValidator = require('../lib/image-validator');
const fs = require('fs'); // Ensure fs is available for cleanup logic
const {
  getState,
  getCurrentStep,
  transitionTo,
  initialState
} = require('../lib/onboarding/state-machine');

/**
 * Helper to load all data needed for the onboarding view
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Object containing profile, photos, legacyImages, aiAnalysis
 */
async function loadOnboardingData(userId) {
  // Load profile
  const profile = await knex('profiles').where({ user_id: userId }).first();
  if (!profile) return null;

  // Load photos (both profile_photos and images for backward compatibility)
  const profilePhotos = await knex('profile_photos').where({ profile_id: profile.id }).orderBy('created_at', 'asc').catch(() => []);
  const legacyImages = await knex('images').where({ profile_id: profile.id }).orderBy('sort', 'asc').catch(() => []);
  
  // Load AI analysis if available
  const aiAnalysis = await knex('ai_profile_analysis').where({ profile_id: profile.id }).first().catch(() => null);

  return { profile, profilePhotos, legacyImages, aiAnalysis };
}

/**
 * GET /onboarding/design-preview
 * PUBLIC PREVIEW ROUTE - No Auth Required
 * For design verification only
 */
router.get('/onboarding/design-preview', (req, res) => {
  const stage = req.query.step || 'identity'; // toggle via ?step=upload|confirm|goals|reveal
  
  // Mock Data
  const mockProfile = {
    id: 'mock-profile-id',
    first_name: 'Jane',
    last_name: 'Doe',
    city: 'Los Angeles',
    onboarding_stage: stage,
    is_pro: req.query.pro === 'true',
    height_cm: 175,
    weight_kg: 60,
    bust: 34,
    waist: 24,
    hips: 35
  };

  const mockPhotos = [
    { storage_key: 'uploads/mock1.jpg', publicUrl: 'https://via.placeholder.com/400x600?text=Photo+1' },
    { storage_key: 'uploads/mock2.jpg', publicUrl: 'https://via.placeholder.com/400x600?text=Photo+2' }
  ];

  const mockAnalysis = {
    predicted_height_cm: 175,
    predicted_weight_kg: 60,
    predicted_measurements_json: JSON.stringify({ bust: 34, waist: 24, hips: 35 }),
    market_fit_json: JSON.stringify([
      { name: 'Commercial', score: 0.95 },
      { name: 'Editorial', score: 0.85 },
      { name: 'Runway', score: 0.70 }
    ])
  };

  return res.render('onboarding/index', {
    title: 'Design Preview',
    layout: false,
    profile: mockProfile,
    photos: mockPhotos,
    legacyImages: [],
    aiAnalysis: mockAnalysis,
    currentStage: stage,
    isPro: mockProfile.is_pro,
    errors: null,
    submittedData: null
  });
});


/**
 * GET /onboarding
 * DEPRECATED: Redirects to new Casting Call system
 * Old multi-step onboarding has been replaced with 2-minute casting call
 */
router.get('/onboarding', async (req, res, next) => {
  try {
    // Require logged-in TALENT
    if (!req.session || !req.session.userId || req.session.role !== 'TALENT') {
      return res.redirect('/apply');
    }

    // Load profile
    let profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    // If no profile exists, redirect to casting call
    if (!profile) {
      return res.redirect(process.env.NODE_ENV === 'production' ? '/casting' : 'http://localhost:5173/casting');
    }

    // If onboarding already completed, redirect to dashboard
    if (profile.onboarding_completed_at) {
      return res.redirect('/dashboard/talent');
    }

    // Onboarding not complete - redirect to new casting call system
    return res.redirect(process.env.NODE_ENV === 'production' ? '/casting' : 'http://localhost:5173/casting');
  } catch (error) {
    console.error('[Onboarding] Error loading onboarding:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/identity
 * Step 1: Save identity (first_name, last_name, city, optional phone)
 */
router.post('/onboarding/identity', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Validate identity fields
    const parsed = onboardingIdentitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ 
        error: 'Validation failed', 
        errors: parsed.error.flatten().fieldErrors 
      });
    }

    const data = parsed.data;

    // Update profile
    // Update profile via State Machine
    const currentState = getState(profile);
    const updatePayload = transitionTo(currentState, 'upload', { 
        fields_submitted: Object.keys(data) 
    }, knex);

    await knex('profiles')
      .where({ id: profile.id })
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        city: data.city,
        gender: data.gender || null,
        phone: req.body.phone || profile.phone || null,
        ...updatePayload // Includes onboarding_stage + onboarding_state_json
      });

    await OnboardingAnalytics.trackCompletion(profile.id, 'identity');

    return res.redirect(303, '/onboarding');
  } catch (error) {
    console.error('[Onboarding Identity] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/upload
 * Step 2: Upload photo(s) and trigger AI analysis
 */
router.post('/onboarding/upload', requireRole('TALENT'), upload.array('photos', 12), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one photo is required' });
    }

    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const uploadedPhotos = [];
    let primaryStorageKey = profile.photo_key_primary || null;

    const validationErrors = [];

    // Process each uploaded file
    for (const file of req.files) {
      try {
        // Step 1: Pre-validation (Heuristic)
        const validation = await ImageValidator.validate(file.path);
        
        if (!validation.valid) {
            console.warn(`[Upload] Skipped invalid file ${file.originalname}: ${validation.error}`);
            validationErrors.push(`${file.originalname}: ${validation.error}`);
            
            // Clean up temp file
            try { await fs.promises.unlink(file.path); } catch (e) {} 
            continue; 
        }

        // Process image (returns {storageKey, absolutePath, publicUrl})
        const { storageKey, absolutePath, publicUrl } = await processImage(file.path);

        // Create profile_photos record
        const photoId = uuidv4();
        await knex('profile_photos').insert({
          id: photoId,
          profile_id: profile.id,
          storage_key: storageKey,
          kind: 'polaroid',
          created_at: knex.fn.now()
        });

        // Set primary photo key if not set
        if (!primaryStorageKey) {
          primaryStorageKey = storageKey;
        }

        uploadedPhotos.push({
          id: photoId,
          storageKey,
          publicUrl
        });
      } catch (fileError) {
        console.error('[Onboarding Upload] Error processing file:', fileError);
        validationErrors.push(`${file.originalname}: Processing failed`);
      }
    }

    // If no valid photos were uploaded (all rejected), return error UI
    if (uploadedPhotos.length === 0) {
      const { profile: loadedProfile, profilePhotos, legacyImages, aiAnalysis } = await loadOnboardingData(req.session.userId);
      
      return res.render('onboarding/index', {
        title: 'Upload Photos',
        layout: false,
        profile: loadedProfile,
        photos: profilePhotos,
        legacyImages,
        aiAnalysis,
        currentStage: 'upload', // Stay on upload
        isPro: loadedProfile.is_pro || false,
        errors: { photos: validationErrors.length > 0 ? validationErrors.join('. ') : 'Please upload at least one valid photo.' }
      });
    }

    // Update profile with primary photo key and set stage via State Machine
    const currentState = getState(profile);
    const updatePayload = transitionTo(currentState, 'confirm', { 
        photo_count: uploadedPhotos.length 
    }, knex);

    await knex('profiles')
      .where({ id: profile.id })
      .update({
        photo_key_primary: primaryStorageKey,
        analysis_status: 'pending',
        analysis_error: null,
        ...updatePayload
      });

    await OnboardingAnalytics.trackCompletion(profile.id, 'upload', null, { 
      photo_count: uploadedPhotos.length 
    });

    // Trigger AI analysis on the first uploaded photo (synchronous for now)
    if (primaryStorageKey && uploadedPhotos.length > 0) {
      try {
        const analysis = await analyzePhoto({ storageKey: primaryStorageKey });

        // Store analysis results in ai_profile_analysis table
        // Note: analyzePhoto returns { embedding, predictions: { height_cm, weight_lbs, bust, waist, hips, ... }, markets, confidence }
        // We need to convert to the expected format
        const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
        
        // Convert predictions to expected format
        const measurements = {};
        if (analysis.predictions.bust) measurements.bust = analysis.predictions.bust;
        if (analysis.predictions.waist) measurements.waist = analysis.predictions.waist;
        if (analysis.predictions.hips) measurements.hips = analysis.predictions.hips;
        
        // Convert weight_lbs to weight_kg if needed
        let predictedWeightKg = analysis.predictions.weight_kg || null;
        if (!predictedWeightKg && analysis.predictions.weight_lbs) {
          predictedWeightKg = Math.round(analysis.predictions.weight_lbs * 0.453592);
        }
        
        const analysisData = {
          profile_id: profile.id,
          predicted_height_cm: analysis.predictions.height_cm || null,
          predicted_weight_kg: predictedWeightKg,
          predicted_measurements_json: Object.keys(measurements).length > 0 ? JSON.stringify(measurements) : null,
          market_fit_json: (analysis.markets || analysis.market_fit) ? JSON.stringify(analysis.markets || analysis.market_fit) : null,
          confidence_json: analysis.confidence ? JSON.stringify(analysis.confidence) : null,
          embedding_vector: analysis.embedding ? JSON.stringify(analysis.embedding) : null,
          updated_at: knex.fn.now()
        };

        // DEBUG: Verify data types before insert
        console.log('[Onboarding Upload] Preparing to insert analysis for profile:', profile.id);
        console.log('[Onboarding Upload] embedding_vector type:', typeof analysisData.embedding_vector);
        if (analysisData.embedding_vector && typeof analysisData.embedding_vector !== 'string') {
          console.error('[Onboarding Upload] CRITICAL: embedding_vector is NOT a string! Fixing...');
          analysisData.embedding_vector = JSON.stringify(analysisData.embedding_vector);
        }

        // SQLite needs strings (already done above), Postgres handles strings as JSONB automatically.
        // By stringifying explicitly, we avoid the 'pg' driver trying to convert 
        // arrays (like embedding_vector) into Postgres Array literal syntax '{1,2,3}'
        // which causes 'invalid input syntax for type json' errors.

        // Upsert analysis (update if exists, insert if not)
        if (isPostgres) {
          await knex('ai_profile_analysis')
            .insert(analysisData)
            .onConflict('profile_id')
            .merge();
        } else {
          // SQLite doesn't support onConflict, check first then insert or update
          const existing = await knex('ai_profile_analysis').where({ profile_id: profile.id }).first();
          if (existing) {
            // Remove profile_id from update (can't update primary key)
            const { profile_id, ...updateData } = analysisData;
            await knex('ai_profile_analysis')
              .where({ profile_id: profile.id })
              .update(updateData);
          } else {
            await knex('ai_profile_analysis').insert(analysisData);
          }
        }

        // Update profile analysis status
        await knex('profiles')
          .where({ id: profile.id })
          .update({
            analysis_status: 'complete',
            analysis_error: null,
            updated_at: knex.fn.now()
          });
      } catch (analysisError) {
        console.error('[Onboarding Upload] AI analysis error:', analysisError);
        
        // Store error but don't block upload
        await knex('profiles')
          .where({ id: profile.id })
          .update({
            analysis_status: 'failed',
            analysis_error: analysisError.message || 'Analysis failed',
            updated_at: knex.fn.now()
          });
      }
    }

    return res.redirect(303, '/onboarding');
  } catch (error) {
    console.error('[Onboarding Upload] Error:', error);
    return next(error);
  }
});

/**
 * GET /onboarding/predictions
 * AJAX endpoint to get predictions/analysis status
 */
router.get('/onboarding/predictions', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const aiAnalysis = await knex('ai_profile_analysis').where({ profile_id: profile.id }).first().catch(() => null);

    // Parse JSON fields if needed
    let analysisData = null;
    if (aiAnalysis) {
      const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
      analysisData = {
        predicted_height_cm: aiAnalysis.predicted_height_cm,
        predicted_weight_kg: aiAnalysis.predicted_weight_kg,
        predicted_measurements: isPostgres 
          ? aiAnalysis.predicted_measurements_json 
          : (aiAnalysis.predicted_measurements_json ? (typeof aiAnalysis.predicted_measurements_json === 'string' ? JSON.parse(aiAnalysis.predicted_measurements_json) : aiAnalysis.predicted_measurements_json) : null),
        market_fit: isPostgres
          ? aiAnalysis.market_fit_json
          : (aiAnalysis.market_fit_json ? (typeof aiAnalysis.market_fit_json === 'string' ? JSON.parse(aiAnalysis.market_fit_json) : aiAnalysis.market_fit_json) : null),
        confidence: isPostgres
          ? aiAnalysis.confidence_json
          : (aiAnalysis.confidence_json ? (typeof aiAnalysis.confidence_json === 'string' ? JSON.parse(aiAnalysis.confidence_json) : aiAnalysis.confidence_json) : null)
      };
    }

    return res.json({
      analysis_status: profile.analysis_status || 'pending',
      analysis: analysisData,
      error: profile.analysis_error || null
    });
  } catch (error) {
    console.error('[Onboarding Predictions] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/confirm
 * Step 3: Save confirmed predictions (user edits)
 */
router.post('/onboarding/confirm', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Validate predictions (all optional, user can confirm/edit)
    const parsed = onboardingPredictionsSchema.safeParse(req.body);
    if (!parsed.success) {
      const { profile: loadedProfile, profilePhotos, legacyImages, aiAnalysis } = await loadOnboardingData(req.session.userId);
      
      return res.render('onboarding/index', {
        title: 'Complete Your Profile',
        layout: false,
        profile: loadedProfile,
        photos: profilePhotos,
        legacyImages,
        aiAnalysis,
        currentStage: 'confirm', // Force stay on confirm stage
        isPro: loadedProfile.is_pro || false,
        errors: parsed.error.flatten().fieldErrors,
        submittedData: req.body
      });
    }

    const data = parsed.data;


    const updateData = {};

    // Update confirmed values (user confirmed or edited predictions)
    if (data.height_cm !== undefined) updateData.height_cm = data.height_cm;
    if (data.weight_lbs !== undefined) {
      updateData.weight_lbs = data.weight_lbs;
      // Also convert to kg if needed
      if (data.weight_lbs) {
        updateData.weight_kg = Math.round(data.weight_lbs * 0.453592);
      }
    }
    if (data.bust !== undefined) updateData.bust_cm = data.bust;
    if (data.waist !== undefined) updateData.waist_cm = data.waist;
    if (data.hips !== undefined) updateData.hips_cm = data.hips;
    if (data.hair_color !== undefined) updateData.hair_color = data.hair_color || null;
    if (data.eye_color !== undefined) updateData.eye_color = data.eye_color || null;
    if (data.skin_tone !== undefined) updateData.skin_tone = data.skin_tone || null;
    if (req.body.shoe_size !== undefined) updateData.shoe_size = req.body.shoe_size || null;

    // Transition Logic: Confirm -> Goals
    const currentState = getState(profile);
    const transitionPayload = transitionTo(currentState, 'goals', { 
        edits_made: Object.keys(data).length 
    }, knex);

    await knex('profiles')
      .where({ id: profile.id })
      .update({
        ...updateData,
        ...transitionPayload
      });

    await OnboardingAnalytics.trackCompletion(profile.id, 'confirm', null, {
      edits_made: Object.keys(data).length
    });

    return res.redirect(303, '/onboarding');
  } catch (error) {
    console.error('[Onboarding Confirm] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/goals
 * Step 3b: Save goals -> Transition to Reveal
 */
router.post('/onboarding/goals', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Transition: Goals -> Reveal
    const currentState = getState(profile);
    const transitionPayload = transitionTo(currentState, 'reveal', { 
      goals_submitted: true,
      goals: req.body // Save whatever goals data was submitted
    }, knex);

    await knex('profiles')
      .where({ id: profile.id })
      .update(transitionPayload);

    await OnboardingAnalytics.trackCompletion(profile.id, 'goals');

    return res.redirect(303, '/onboarding');
  } catch (error) {
    console.error('[Onboarding Goals] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/complete
 * Step 4: Complete onboarding - compute completeness and redirect
 */
router.post('/onboarding/complete', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      addMessage(req, 'error', 'Profile not found. Please start the onboarding process.');
      return res.status(404).redirect('/apply');
    }

    // Compute and update profile completeness
    const completenessResult = await updateProfileCompleteness(profile.id);

    // Mark onboarding as completing (Phase A done, moving to Phase B on dashboard)
    await knex('profiles')
      .where({ id: profile.id })
      .update({
        onboarding_stage: 'completing', // Changed from 'done' to enable dashboard banner
        onboarding_completed_at: knex.fn.now(), // Still set this to pass middleware check
        updated_at: knex.fn.now()
      });

    // Track final completion and completeness score
    await OnboardingAnalytics.trackCompletion(profile.id, 'reveal', null, {
      completeness: completenessResult.percentage,
      services_locked: completenessResult.servicesLocked
    });

    // Redirect to dashboard with onboarding flag to show banner
    return res.redirect(303, '/dashboard/talent?onboarding=1');
  } catch (error) {
    console.error('[Onboarding Complete] Error:', error);
    return next(error);
  }
});

/**
 * POST /apply/start
 * Phase A: Authenticate user and create minimal draft profile
 * Updated to redirect to /onboarding instead of /apply/essentials
 */
router.post('/apply/start', async (req, res, next) => {
  try {
    const { firebase_token, instagram_oauth_code, email, password } = req.body;
    
    // Get referral agency ID if available
    const lockedAgencyId = getLockedAgencyId(req);
    
    let providerUser = null;
    let authMethod = null;

    // Authenticate user
    if (firebase_token) {
      authMethod = 'google';
      try {
        const decodedToken = await verifyGoogleToken(firebase_token);
        providerUser = normalizeGoogleUser(decodedToken);
      } catch (error) {
        console.error('[Onboarding] Google token verification failed:', error.message);
        addMessage(req, 'error', 'Google authentication failed. Please try again.');
        return res.status(401).redirect('/apply');
      }
    } else if (instagram_oauth_code) {
      authMethod = 'instagram';
      try {
        const instagramData = await verifyInstagramCode(instagram_oauth_code);
        providerUser = normalizeInstagramUser(instagramData);
        providerUser.instagram_handle = instagramData.handle;
        providerUser.uid = instagramData.instagram_id;
      } catch (error) {
        console.error('[Onboarding] Instagram code verification failed:', error.message);
        addMessage(req, 'error', 'Instagram authentication failed. Please try again.');
        return res.status(401).redirect('/apply');
      }
    } else if (email && password) {
      authMethod = 'email';
      addMessage(req, 'error', 'Email/password signup is not yet available. Please use Google Sign-In.');
      return res.status(400).redirect('/apply');
    } else {
      addMessage(req, 'error', 'Authentication required. Please sign in with Google or Instagram.');
      return res.status(400).redirect('/apply');
    }

    if (!providerUser || !providerUser.uid) {
      addMessage(req, 'error', 'Authentication failed. Please try again.');
      return res.status(401).redirect('/apply');
    }

    // Ensure user and draft profile exist
    let user, profile, isNewUser, isNewProfile;
    try {
      const result = await ensureUserAndDraftProfile(providerUser, lockedAgencyId);
      user = result.user;
      profile = result.profile;
      isNewUser = result.isNewUser;
      isNewProfile = result.isNewProfile;

      // Set source_agency_id and visibility_mode if from partner route
      if (lockedAgencyId && isNewProfile) {
        await knex('profiles')
          .where({ id: profile.id })
          .update({
            source_agency_id: lockedAgencyId,
            visibility_mode: 'agency_locked',
            onboarding_stage: 'identity',
            services_locked: true
          });
        profile.source_agency_id = lockedAgencyId;
        profile.visibility_mode = 'agency_locked';
      } else if (isNewProfile) {
        await knex('profiles')
          .where({ id: profile.id })
          .update({
            visibility_mode: 'private_intake',
            onboarding_stage: 'identity',
            services_locked: true
          });
        profile.visibility_mode = 'private_intake';
      }
    } catch (error) {
      console.error('[Onboarding] Error ensuring user/profile:', error);
      addMessage(req, 'error', 'Failed to create account. Please try again.');
      return res.status(500).redirect('/apply');
    }

    // Set session
    req.session.userId = user.id;
    req.session.role = 'TALENT';
    req.session.profileId = profile.id;
    
    // Store referral in session if available
    if (lockedAgencyId) {
      req.session.lockedAgencyId = lockedAgencyId;
    }

    // Save session before redirect
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('[Onboarding] Error saving session:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Track entry into the funnel
    await OnboardingAnalytics.trackEntry(profile.id, 'identity', { 
      source: lockedAgencyId ? 'partner' : 'organic',
      auth_method: authMethod
    });

    // Redirect to onboarding (not /apply/essentials)
    return res.redirect(303, '/onboarding');
  } catch (error) {
    console.error('[Onboarding] Error in POST /apply/start:', error);
    return next(error);
  }
});

module.exports = router;
