/**
 * Onboarding Routes
 * Handles the premium onboarding flow for new talent users
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
  onboardingPredictionsSchema, 
  onboardingCompleteSchema 
} = require('../lib/validation');
const { upload, processImage } = require('../lib/uploader');
const { analyzePhoto } = require('../lib/ai/photo-analysis');
const { checkEssentialsComplete } = require('../lib/onboarding/essentials-check');
const { extractReferralAgencyId, setReferralAgency } = require('../lib/onboarding/referral');
const { getPoolStatus, getPoolStatusDescription } = require('../lib/onboarding/pool-status');
const { calculateAge } = require('../lib/profile-helpers');

/**
 * GET /onboarding
 * Render full-screen onboarding experience
 */
router.get('/onboarding', async (req, res, next) => {
  try {
    // If not logged in, redirect to signup
    if (!req.session || !req.session.userId) {
      return res.redirect('/apply');
    }

    // Load profile
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      addMessage(req, 'error', 'Profile not found. Please start the application process.');
      return res.redirect('/apply');
    }

    // If onboarding already completed, redirect to dashboard
    if (profile.onboarding_completed_at) {
      return res.redirect('/dashboard/talent');
    }

    // Load images
    const images = await knex('images').where({ profile_id: profile.id }).orderBy('sort', 'asc');

    // Get pool status
    const poolStatus = getPoolStatus(profile);
    const poolStatusDescription = getPoolStatusDescription(profile);

    // Determine current step based on profile state
    let currentStep = 1;
    if (profile.first_name && profile.last_name && profile.city) {
      currentStep = 2; // Identity complete, move to upload
    }
    if (images.length > 0 && profile.predicted_height_cm) {
      currentStep = 3; // Photo uploaded and analyzed, move to predictions
    }
    if (profile.height_cm && profile.bust && profile.waist && profile.hips) {
      currentStep = 4; // Predictions confirmed, move to market fit
    }
    if (profile.market_fit_rankings) {
      currentStep = 5; // Market fit shown, move to Instagram
    }

    // Render onboarding
    return res.render('onboarding/index', {
      title: 'Complete Your Profile',
      layout: false, // Full-screen, no layout
      profile,
      images,
      photoCount: images.length,
      currentStep,
      poolStatus,
      poolStatusDescription,
      isPro: profile.is_pro || false
    });
  } catch (error) {
    console.error('[Onboarding] Error loading onboarding:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/step/1
 * Step 1: Save identity (firstName, lastName, city, optional gender)
 */
router.post('/onboarding/step/1', requireRole('TALENT'), async (req, res, next) => {
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
    await knex('profiles')
      .where({ id: profile.id })
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        city: data.city,
        gender: data.gender || null,
        onboarding_stage: 'onboarding',
        updated_at: knex.fn.now()
      });

    return res.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding Step 1] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/step/2
 * Step 2: Upload photo and trigger AI analysis
 */
router.post('/onboarding/step/2', requireRole('TALENT'), upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Process and store image
    const storedPath = await processImage(req.file.path);
    const countResult = await knex('images')
      .where({ profile_id: profile.id })
      .count({ total: '*' })
      .first();
    const nextSort = Number(countResult?.total || 0) + 1;

    await knex('images').insert({
      id: uuidv4(),
      profile_id: profile.id,
      path: storedPath,
      label: 'Portfolio image',
      sort: nextSort
    });

    // Set hero image if none exists
    if (!profile.hero_image_path) {
      await knex('profiles').where({ id: profile.id }).update({ hero_image_path: storedPath });
    }

    // Run AI analysis on the uploaded photo
    // Convert relative path to absolute path for analyzePhoto
    const absoluteImagePath = storedPath.startsWith('/uploads/')
      ? path.join(config.uploadsDir, path.basename(storedPath))
      : storedPath;
    
    try {
      const analysis = await analyzePhoto(absoluteImagePath);

      // Store predictions and market fit rankings
      const updateData = {
        predicted_height_cm: analysis.predictions.height_cm || null,
        predicted_weight_lbs: analysis.predictions.weight_lbs || null,
        predicted_bust: analysis.predictions.bust || null,
        predicted_waist: analysis.predictions.waist || null,
        predicted_hips: analysis.predictions.hips || null,
        predicted_hair_color: analysis.predictions.hair_color || null,
        predicted_eye_color: analysis.predictions.eye_color || null,
        predicted_skin_tone: analysis.predictions.skin_tone || null,
        market_fit_rankings: analysis.markets || null,
        photo_embedding: analysis.embedding || null,
        updated_at: knex.fn.now()
      };

      // Store as JSONB for PostgreSQL, JSON string for SQLite
      const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
      if (!isPostgres) {
        if (updateData.market_fit_rankings) {
          updateData.market_fit_rankings = JSON.stringify(updateData.market_fit_rankings);
        }
        if (updateData.photo_embedding) {
          updateData.photo_embedding = JSON.stringify(updateData.photo_embedding);
        }
      }

      await knex('profiles')
        .where({ id: profile.id })
        .update(updateData);

      return res.json({ 
        ok: true, 
        path: storedPath,
        predictions: analysis.predictions,
        markets: analysis.markets
      });
    } catch (analysisError) {
      console.error('[Onboarding Step 2] AI analysis error:', analysisError);
      // Still return success for photo upload, but without predictions
      return res.json({ 
        ok: true, 
        path: storedPath,
        predictions: null,
        markets: null,
        warning: 'Photo uploaded but analysis failed'
      });
    }
  } catch (error) {
    console.error('[Onboarding Step 2] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/step/3
 * Step 3: Save confirmed predictions (user edits)
 */
router.post('/onboarding/step/3', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Validate predictions (all optional, user can confirm/edit)
    const parsed = onboardingPredictionsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ 
        error: 'Validation failed', 
        errors: parsed.error.flatten().fieldErrors 
      });
    }

    const data = parsed.data;
    const updateData = {
      updated_at: knex.fn.now()
    };

    // Update confirmed values (user confirmed or edited predictions)
    if (data.height_cm !== undefined) updateData.height_cm = data.height_cm;
    if (data.weight_lbs !== undefined) updateData.weight_lbs = data.weight_lbs;
    if (data.bust !== undefined) updateData.bust = data.bust;
    if (data.waist !== undefined) updateData.waist = data.waist;
    if (data.hips !== undefined) updateData.hips = data.hips;
    if (data.hair_color !== undefined) updateData.hair_color = data.hair_color || null;
    if (data.eye_color !== undefined) updateData.eye_color = data.eye_color || null;
    if (data.skin_tone !== undefined) updateData.skin_tone = data.skin_tone || null;

    await knex('profiles')
      .where({ id: profile.id })
      .update(updateData);

    return res.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding Step 3] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/step/4
 * Step 4: Market fit (read-only display, no save needed)
 */
router.post('/onboarding/step/4', requireRole('TALENT'), async (req, res, next) => {
  try {
    // Step 4 is read-only, just acknowledge
    return res.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding Step 4] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/step/5
 * Step 5: Connect Instagram (optional)
 */
router.post('/onboarding/step/5', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Instagram connection is optional
    // If instagram_handle is provided, save it
    const { instagram_handle } = req.body;
    if (instagram_handle && typeof instagram_handle === 'string') {
      await knex('profiles')
        .where({ id: profile.id })
        .update({
          instagram_handle: instagram_handle.trim(),
          updated_at: knex.fn.now()
        });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding Step 5] Error:', error);
    return next(error);
  }
});

/**
 * POST /onboarding/complete
 * Complete onboarding - validate essentials and mark as completed
 */
router.post('/onboarding/complete', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      addMessage(req, 'error', 'Profile not found. Please start the onboarding process.');
      return res.status(404).redirect('/apply');
    }

    // Load images for validation
    const images = await knex('images').where({ profile_id: profile.id }).orderBy('sort', 'asc');

    // Validate essentials are complete
    const essentialsCheck = checkEssentialsComplete(profile, images);
    if (!essentialsCheck.ok) {
      addMessage(req, 'error', essentialsCheck.message);
      return res.status(422).redirect('/onboarding');
    }

    // Validate required fields with schema
    const profileData = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      city: profile.city,
      height_cm: profile.height_cm,
      bust: profile.bust,
      waist: profile.waist,
      hips: profile.hips
    };

    const parsed = onboardingCompleteSchema.safeParse(profileData);
    if (!parsed.success) {
      addMessage(req, 'error', 'Please complete all required fields.');
      return res.status(422).redirect('/onboarding');
    }

    // Handle referral agency (if set in session)
    if (req.session.lockedAgencyId) {
      await setReferralAgency(profile.id, req.session.lockedAgencyId);
      delete req.session.lockedAgencyId;
    } else {
      // Try to extract from query/token if available
      const referralAgencyId = await extractReferralAgencyId(req);
      if (referralAgencyId) {
        await setReferralAgency(profile.id, referralAgencyId);
      }
    }

    // Calculate profile completeness (for dashboard widget)
    const { calculateProfileCompleteness } = require('../lib/dashboard/completeness');
    const currentUser = await knex('users').where({ id: req.session.userId }).first();
    const profileForCompleteness = {
      ...profile,
      email: currentUser?.email || null
    };
    const completeness = calculateProfileCompleteness(profileForCompleteness, images);

    // Mark onboarding as completed
    await knex('profiles')
      .where({ id: profile.id })
      .update({
        onboarding_completed_at: knex.fn.now(),
        onboarding_stage: 'completed',
        profile_completeness: completeness.percentage,
        updated_at: knex.fn.now()
      });

    // Redirect to dashboard
    return res.redirect(303, '/dashboard/talent');
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
    const referralAgencyId = await extractReferralAgencyId(req);
    if (referralAgencyId && !req.session.lockedAgencyId) {
      req.session.lockedAgencyId = referralAgencyId;
    }

    // Import auth helpers
    const { 
      verifyGoogleToken, 
      normalizeGoogleUser,
      verifyInstagramCode,
      normalizeInstagramUser,
      getLockedAgencyId,
      ensureUserAndDraftProfile
    } = require('../lib/onboarding/auth-helpers');

    const lockedAgencyId = getLockedAgencyId(req) || referralAgencyId;
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

    // Redirect to onboarding (not /apply/essentials)
    return res.redirect(303, '/onboarding');
  } catch (error) {
    console.error('[Onboarding] Error in POST /apply/start:', error);
    return next(error);
  }
});

module.exports = router;
