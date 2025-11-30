const express = require('express');
const knex = require('../db/knex');
const { addMessage } = require('../middleware/context');
const { requireAuth, requireRole } = require('../middleware/auth');
const { upload, processImage } = require('../lib/uploader');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Middleware to ensure user is authenticated
router.use(requireAuth);

// GET /onboarding/select-role - Role selection page
router.get('/select-role', async (req, res) => {
  const user = await knex('users').where({ id: req.session.userId }).first();
  
  // If user already has a role, redirect to their dashboard
  if (user && user.role) {
    if (user.role === 'TALENT') {
      return res.redirect('/dashboard/talent');
    }
    if (user.role === 'AGENCY') {
      return res.redirect('/dashboard/agency');
    }
  }
  
  res.locals.currentPage = 'onboarding';
  return res.render('onboarding/select-role', {
    title: 'How will you use Pholio?',
    layout: 'layout',
    currentPage: 'onboarding'
  });
});

// POST /onboarding/select-role - Save user's role selection
router.post('/select-role', async (req, res) => {
  const { role } = req.body;
  
  if (!role || !['TALENT', 'AGENCY'].includes(role.toUpperCase())) {
    return res.status(400).json({
      success: false,
      errors: { role: ['Please select a valid role.'] }
    });
  }
  
  try {
    const userRole = role.toUpperCase();
    
    // Update user role
    await knex('users')
      .where({ id: req.session.userId })
      .update({ role: userRole });
    
    // Update session
    req.session.role = userRole;
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Redirect based on role
    if (userRole === 'TALENT') {
      return res.json({
        success: true,
        redirect: '/apply'
      });
    } else if (userRole === 'AGENCY') {
      return res.json({
        success: true,
        redirect: '/onboarding/agency'
      });
    }
  } catch (error) {
    console.error('[Onboarding] Error saving role:', error);
    return res.status(500).json({
      success: false,
      errors: { role: ['Failed to save role selection. Please try again.'] }
    });
  }
});

// GET /onboarding/agency - Agency onboarding wizard (Step 1)
router.get('/agency', requireRole('AGENCY'), async (req, res) => {
  const user = await knex('users').where({ id: req.session.userId }).first();
  
  res.locals.currentPage = 'onboarding';
  return res.render('onboarding/agency', {
    title: 'Agency Onboarding',
    layout: 'layout',
    currentPage: 'onboarding',
    user: user,
    step: 1
  });
});

// POST /onboarding/agency/step1 - Save agency identity
router.post('/agency/step1', requireRole('AGENCY'), upload.single('logo'), async (req, res) => {
  const { agency_name, agency_website, agency_instagram_handle, agency_location } = req.body;
  
  // Validate required fields
  if (!agency_name || !agency_name.trim()) {
    return res.status(400).json({
      success: false,
      errors: { agency_name: ['Agency name is required.'] }
    });
  }
  
  try {
    const updates = {
      agency_name: agency_name.trim()
    };
    if (agency_website) updates.agency_website = agency_website.trim();
    if (agency_instagram_handle) updates.agency_instagram_handle = agency_instagram_handle.trim().replace('@', '');
    if (agency_location) updates.agency_location = agency_location.trim();
    
    // Handle logo upload
    if (req.file) {
      try {
        // Process and resize logo (square crop, max 500x500)
        const storedPath = await processImage(req.file.path);
        updates.agency_logo_path = storedPath;
      } catch (logoError) {
        console.error('[Onboarding] Error processing logo:', logoError);
        // Continue without logo if processing fails
      }
    }
    
    await knex('users')
      .where({ id: req.session.userId })
      .update(updates);
    
    return res.json({ success: true, redirect: '/onboarding/agency/step2' });
  } catch (error) {
    console.error('[Onboarding] Error saving step 1:', error);
    return res.status(500).json({
      success: false,
      errors: { general: ['Failed to save. Please try again.'] }
    });
  }
});

// GET /onboarding/agency/step2 - Verification step
router.get('/agency/step2', requireRole('AGENCY'), async (req, res) => {
  res.locals.currentPage = 'onboarding';
  return res.render('onboarding/agency-step2', {
    title: 'Verify Your Agency',
    layout: 'layout',
    currentPage: 'onboarding',
    step: 2
  });
});

// POST /onboarding/agency/step2 - Save verification (optional)
router.post('/agency/step2', requireRole('AGENCY'), upload.single('verification_document'), async (req, res) => {
  const verification_type = req.body.verification_type;
  const verification_linkedin_url = req.body.verification_linkedin_url;
  
  try {
    const updates = {};
    
    // If LinkedIn verification provided
    if (verification_type === 'linkedin' && verification_linkedin_url) {
      updates.verification_linkedin_url = verification_linkedin_url.trim();
    }
    
    // Handle document upload
    if (verification_type === 'document' && req.file) {
      try {
        const storedPath = await processImage(req.file.path);
        updates.verification_document_path = storedPath;
      } catch (docError) {
        console.error('[Onboarding] Error processing verification document:', docError);
        // Continue without document if processing fails
      }
    }
    
    // Note: is_verified stays false until admin approves
    // For now, we just store the verification data
    
    if (Object.keys(updates).length > 0) {
      await knex('users')
        .where({ id: req.session.userId })
        .update(updates);
    }
    
    return res.json({ success: true, redirect: '/onboarding/agency/step3' });
  } catch (error) {
    console.error('[Onboarding] Error saving step 2:', error);
    return res.status(500).json({
      success: false,
      errors: { general: ['Failed to save. Please try again.'] }
    });
  }
});

// GET /onboarding/agency/step3 - Preferences step
router.get('/agency/step3', requireRole('AGENCY'), async (req, res) => {
  res.locals.currentPage = 'onboarding';
  return res.render('onboarding/agency-step3', {
    title: 'Your Preferences',
    layout: 'layout',
    currentPage: 'onboarding',
    step: 3
  });
});

// POST /onboarding/agency/step3 - Save preferences
router.post('/agency/step3', requireRole('AGENCY'), async (req, res) => {
  const { tags, markets } = req.body;
  
  try {
    const updates = {};
    if (tags && Array.isArray(tags)) {
      updates.agency_tags = JSON.stringify(tags);
    }
    if (markets && Array.isArray(markets)) {
      updates.agency_markets = JSON.stringify(markets);
    }
    
    await knex('users')
      .where({ id: req.session.userId })
      .update(updates);
    
    return res.json({ success: true, redirect: '/onboarding/agency/step4' });
  } catch (error) {
    console.error('[Onboarding] Error saving step 3:', error);
    return res.status(500).json({
      success: false,
      errors: { general: ['Failed to save. Please try again.'] }
    });
  }
});

// GET /onboarding/agency/step4 - Team invite step
router.get('/agency/step4', requireRole('AGENCY'), async (req, res) => {
  res.locals.currentPage = 'onboarding';
  return res.render('onboarding/agency-step4', {
    title: 'Invite Your Team',
    layout: 'layout',
    currentPage: 'onboarding',
    step: 4
  });
});

// POST /onboarding/agency/step4 - Complete onboarding
router.post('/agency/step4', requireRole('AGENCY'), async (req, res) => {
  const { team_emails } = req.body;
  
  try {
    // Team invites can be handled later via email service
    // For now, we just store them or queue them for sending
    // You can implement email invitation logic here
    
    // Add success message
    addMessage(req, 'success', 'Welcome to Pholio! Your agency profile is set up.');
    
    return res.json({ 
      success: true, 
      redirect: '/dashboard/agency',
      message: 'Welcome to Pholio! Your agency profile is set up.'
    });
  } catch (error) {
    console.error('[Onboarding] Error completing onboarding:', error);
    return res.status(500).json({
      success: false,
      errors: { general: ['Failed to complete setup. Please try again.'] }
    });
  }
});

module.exports = router;

