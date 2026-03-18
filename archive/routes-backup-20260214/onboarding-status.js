/**
 * Onboarding Status Routes - Phase C
 * Displays job status and overall progress
 */

const express = require('express');
const router = express.Router();
const knex = require('../db/knex');
const { requireRole } = require('../middleware/auth');
const { getCurrentStep } = require('../lib/onboarding/state-machine');

/**
 * GET /onboarding/status
 * Phase C: Display onboarding job status
 * - Load profile with onboarding_stage
 * - Display status (submitted, processing, processed)
 * - Show progress (if jobs table exists) or simple status
 * - Auto-redirect to dashboard when processed
 */
router.get('/onboarding/status', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      return res.redirect('/apply');
    }

    const onboardingStage = getCurrentStep(profile);

    // Auto-redirect to dashboard if processed
    if (onboardingStage === 'processed') {
      return res.redirect('/dashboard/talent');
    }

    // Calculate progress based on stage
    let progress = 0;
    let statusMessage = '';
    let statusDetails = [];

    switch (onboardingStage) {
      case 'submitted':
        progress = 25;
        statusMessage = 'Profile submitted for processing';
        statusDetails = ['Profile submitted', 'Waiting to start processing...'];
        break;
      case 'processing':
        progress = 50;
        statusMessage = 'Processing your profile';
        statusDetails = [
          'Analyzing images...',
          'Generating insights...',
          'Creating your comp card...'
        ];
        break;
      case 'processed':
        progress = 100;
        statusMessage = 'Processing complete!';
        statusDetails = ['Your profile has been processed successfully'];
        break;
      default:
        progress = 0;
        statusMessage = 'Draft profile';
        statusDetails = ['Complete your profile to submit'];
    }

    // Check if processed_at is set (confirms completion)
    const isProcessed = onboardingStage === 'processed' || profile.processed_at !== null;

    return res.render('onboarding/status', {
      title: 'Onboarding Status',
      profile,
      onboardingStage,
      progress,
      statusMessage,
      statusDetails,
      isProcessed,
      submittedAt: profile.submitted_at,
      processedAt: profile.processed_at,
      layout: 'layouts/dashboard',
      user: req.currentUser,
      currentUser: req.currentUser,
      isDashboard: true
    });
  } catch (error) {
    console.error('[Onboarding Status] Error:', error);
    return next(error);
  }
});

module.exports = router;
