const express = require('express');
const knex = require('../db/knex');
const { requireRole } = require('../middleware/auth');
const { toFeetInches } = require('../lib/stats');
const { talentProfileUpdateSchema } = require('../lib/validation');
const { normalizeMeasurements, curateBio } = require('../lib/curate');
const { addMessage } = require('../middleware/context');
const { upload, processImage } = require('../lib/uploader');
const { sendRejectedApplicantEmail, sendApplicationStatusChangeEmail, sendAgencyInviteEmail } = require('../lib/email');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config');
const { getAllThemes, getFreeThemes, getProThemes, getTheme, getDefaultTheme, getAvailableFonts, getAvailableColorPalettes } = require('../lib/themes');
const { getAllLayoutPresets } = require('../lib/pdf-layouts');
const { ensureUniqueSlug } = require('../lib/slugify');
const { calculateAge, generateSocialMediaUrl, parseSocialMediaHandle, convertKgToLbs, convertLbsToKg } = require('../lib/profile-helpers');
const { calculateProfileCompleteness } = require('../lib/dashboard/completeness');
const { createEditDefaults, normalizeImagePath, safeProfileExtract } = require('../lib/dashboard/template-helpers');
const { getCurrentStep } = require('../lib/onboarding/state-machine');

const router = express.Router();

router.get('/dashboard/talent', requireRole('TALENT'), async (req, res, next) => {
  try {
    console.log('[Dashboard/Talent] Loading profile for user:', {
      userId: req.session.userId,
      role: req.session.role
    });
    
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();

    // Alias new _cm columns to legacy names for template compatibility
    if (profile) {
      if (profile.bust_cm) profile.bust = profile.bust_cm;
      if (profile.waist_cm) profile.waist = profile.waist_cm;
      if (profile.hips_cm) profile.hips = profile.hips_cm;
    }
    
    console.log('[Dashboard/Talent] Profile lookup result:', {
      userId: req.session.userId,
      profileFound: !!profile,
      profileId: profile?.id || null,
      profileSlug: profile?.slug || null,
      profileName: profile ? `${profile.first_name} ${profile.last_name}` : null,
      profileData: profile ? {
        city: profile.city,
        phone: profile.phone,
        height_cm: profile.height_cm,
        gender: profile.gender,
        date_of_birth: profile.date_of_birth,
        weight_lbs: profile.weight_lbs,
        weight_kg: profile.weight_kg,
        bust: profile.bust_cm,
        waist: profile.waist_cm,
        hips: profile.hips_cm,
        shoe_size: profile.shoe_size,
        bio_raw: profile.bio_raw ? (profile.bio_raw.substring(0, 50) + '...') : null
      } : null
    });
    
    if (!profile) {
      // Logged-in user without profile - show dashboard with empty state
      // Don't redirect to /apply since /apply is only for logged-out users
      const currentUser = await knex('users')
        .where({ id: req.session.userId })
        .first();
      
      addMessage(req, 'info', 'Complete your profile to get started! Fill out the form below.');
      
      // Use unified completeness calculation (even for empty profile)
      const emptyCompleteness = calculateProfileCompleteness(null, []);
      
      return res.render('dashboard/talent', {
        title: 'Talent Dashboard',
        profile: null,
        images: [],
        completeness: emptyCompleteness,
        stats: null,
        shareUrl: null,
        user: currentUser,
        currentUser,
        isDashboard: true,
        layout: 'layouts/dashboard',
        allThemes: getAllThemes(),
        freeThemes: getFreeThemes(),
        proThemes: getProThemes(),
        currentTheme: getDefaultTheme(),
        baseUrl: `${req.protocol}://${req.get('host')}`,
        showProfileForm: true // Flag to show profile creation form
      });
    }
    const images = await knex('images').where({ profile_id: profile.id }).orderBy('sort', 'asc');
    
    // Debug: Log image count and paths for troubleshooting
    if (process.env.NODE_ENV === 'development' && images.length > 0) {
      console.log(`[Dashboard] Loaded ${images.length} images for profile ${profile.id}`);
    }

    // Use unified completeness calculation
    // Ensure email is included from users table for completeness check
    const currentUser = await knex('users')
      .where({ id: req.session.userId })
      .first();
    
    const profileForCompleteness = {
      ...profile,
      email: profile.email || currentUser?.email || null
    };
    
    const completeness = calculateProfileCompleteness(profileForCompleteness, images);

    const shareUrl = `${req.protocol}://${req.get('host')}/portfolio/${profile.slug}`;
    
    // Get themes for PDF theme selector modal
    const allThemes = getAllThemes();
    const freeThemes = getFreeThemes();
    const proThemes = getProThemes();
    const currentTheme = profile.pdf_theme || getDefaultTheme();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Check for onboarding mode
    const isOnboarding = req.query.onboarding === '1';
    const onboardingStage = getCurrentStep(profile);
    const showOnboardingBanner = isOnboarding && (onboardingStage === 'draft' || onboardingStage === 'completing');
    
    // Check if profile can be submitted (for submit button enable/disable)
    const { canSubmitProfile } = require('../lib/onboarding/validation');
    const canSubmit = canSubmitProfile(profile, images);

    return res.render('dashboard/talent', {
      title: 'Talent Dashboard',
      profile,
      images,
      completeness,
      stats: { heightFeet: toFeetInches(profile.height_cm) },
      shareUrl,
      user: currentUser,
      currentUser,
      isDashboard: true,
      layout: 'layouts/dashboard',
      allThemes,
      freeThemes,
      proThemes,
      currentTheme,
      baseUrl,
      isOnboarding,
      onboardingStage,
      showOnboardingBanner,
      canSubmit
    });
  } catch (error) {
    // Pass error to centralized error handler
    return next(error);
  }
});

// Settings page route
router.get('/dashboard/settings', requireRole('TALENT'), async (req, res, next) => {
  try {
    const user = await knex('users').where({ id: req.session.userId }).first();
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    return res.render('dashboard/settings', {
      title: 'Settings - Pholio',
      user,
      profile,
      layout: false // Settings uses its own layout
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/dashboard/talent', requireRole('TALENT'), async (req, res, next) => {

  // Preprocess req.body to merge "_other" fields into main fields before validation
  // This is needed because the form submits both the select value and the "_other" text input
  // We need to merge them into the main field before Zod validation
  const processedBody = { ...req.body };
  
  // Merge "Other" fields into main fields
  // If the main field value is "Other" and an "_other" field exists with a value, use the "_other" value
  const otherFieldMappings = [
    { main: 'shoe_size', other: 'shoe_size_other' },
    { main: 'eye_color', other: 'eye_color_other' },
    { main: 'hair_color', other: 'hair_color_other' },
    { main: 'skin_tone', other: 'skin_tone_other' },
    { main: 'work_status', other: 'work_status_other' }
  ];
  
  for (const { main, other } of otherFieldMappings) {
    if (processedBody[main] === 'Other' && processedBody[other] && processedBody[other].trim()) {
      processedBody[main] = processedBody[other].trim();
      console.log(`[Dashboard/Talent POST] Merged "${other}" into "${main}":`, processedBody[main]);
    }
    // Remove the "_other" field to avoid strict validation errors
    delete processedBody[other];
  }
  
  // Handle array fields - HTML forms can send arrays for fields with multiple inputs
  // Extract first non-empty value, or undefined if all empty
  const arrayStringFields = ['city_secondary', 'ethnicity', 'union_membership'];
  for (const field of arrayStringFields) {
    if (Array.isArray(processedBody[field])) {
      // Find first non-empty string in array
      const nonEmptyValue = processedBody[field].find(val => val && val.trim() !== '');
      processedBody[field] = nonEmptyValue || undefined;
    }
  }
  
  // Convert empty strings to undefined for optional fields
  // This is needed because HTML forms send empty strings for empty inputs,
  // but Zod optional() expects undefined, not empty strings
  const optionalFields = [
    'city_secondary', 'phone', 'bust', 'waist', 'hips', 'shoe_size', 'eye_color', 'hair_color',
    'hair_length', 'skin_tone', 'dress_size', 'ethnicity', 'union_membership', 'training',
    'portfolio_url', 'instagram_handle', 'twitter_handle', 'tiktok_handle',
    'reference_name', 'reference_email', 'reference_phone',
    'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
    'work_status', 'bio', 'date_of_birth'
  ];
  
  // Enum fields that need special handling - empty strings should be undefined
  const enumFields = [
    'availability_schedule', 'experience_level', 'gender', 'work_eligibility'
  ];
  
  for (const field of optionalFields) {
    if (processedBody[field] === '') {
      processedBody[field] = undefined;
    }
  }
  
  for (const field of enumFields) {
    if (processedBody[field] === '') {
      processedBody[field] = undefined;
    }
  }
  
  // Handle boolean checkbox fields - convert "true" string to boolean, unchecked to false
  // STRICT: Unchecked checkboxes are stored as false, not undefined, to maintain boolean integrity
  // Checkboxes only send a value when checked, so unchecked state must be inferred from absence
  const booleanCheckboxFields = ['tattoos', 'piercings', 'availability_travel'];
  for (const field of booleanCheckboxFields) {
    if (processedBody[field] === 'true' || processedBody[field] === true || processedBody[field] === 'on') {
      processedBody[field] = true;
    } else if (Array.isArray(processedBody[field])) {
      // Handle case where checkbox might come as array (shouldn't happen, but handle it)
      processedBody[field] = processedBody[field].includes('true') || processedBody[field].includes('on') ? true : false;
    } else if (processedBody[field] === null || processedBody[field] === 'null' || processedBody[field] === 'false') {
      // Convert null/false strings to false boolean
      processedBody[field] = false;
    } else if (!(field in processedBody) || processedBody[field] === '' || processedBody[field] === undefined) {
      // If checkbox is not checked (missing from form submission), set to false
      processedBody[field] = false;
    }
  }
  
  // work_eligibility is a select dropdown, not a checkbox - handle separately
  if (processedBody.work_eligibility === 'Yes') {
    processedBody.work_eligibility = true;
  } else if (processedBody.work_eligibility === 'No') {
    processedBody.work_eligibility = false;
  } else if (processedBody.work_eligibility === '' || processedBody.work_eligibility === undefined) {
    processedBody.work_eligibility = undefined; // Let validation handle required/optional
  }
  
  // Remove fields that aren't in the validation schema to avoid .strict() errors
  // These are UI helper fields or calculated fields that shouldn't be validated
  const fieldsToRemove = [
    'age', // Calculated from date_of_birth, not a form field
    'language_other_input' // UI helper field, not stored directly
  ];
  
  for (const field of fieldsToRemove) {
    delete processedBody[field];
  }
  
  console.log('[Dashboard/Talent POST] Processing profile update request:', {
    userId: req.session.userId,
    bodyKeys: Object.keys(req.body),
    processedBodyKeys: Object.keys(processedBody),
    hasCity: !!processedBody.city,
    hasPhone: !!processedBody.phone,
    hasHeight: !!processedBody.height_cm
  });
  
  const parsed = talentProfileUpdateSchema.safeParse(processedBody);
  if (!parsed.success) {
    console.error('[Dashboard/Talent POST] Validation failed:', {
      errors: parsed.error.flatten().fieldErrors,
      body: processedBody
    });
    const fieldErrors = parsed.error.flatten().fieldErrors;
    try {
      // Ensure userId exists in session
      if (!req.session || !req.session.userId) {
        console.error('[Dashboard/Talent POST] No userId in session');
        addMessage(req, 'error', 'Session expired. Please log in again.');
        return res.redirect('/login');
      }
      
      const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
      const currentUser = await knex('users')
        .where({ id: req.session.userId })
        .first();
      
      // Ensure currentUser exists (should always exist if requireRole passed, but be safe)
      if (!currentUser) {
        console.error('[Dashboard/Talent POST] User not found in database:', req.session.userId);
        addMessage(req, 'error', 'User account not found. Please log in again.');
        return res.redirect('/login');
      }
      
      // Handle case where profile doesn't exist (null check)
      if (!profile) {
        return res.status(422).render('dashboard/talent', {
          title: 'Talent Dashboard',
          profile: null,
          images: [],
          completeness: {
            basics: false,
            imagery: false,
            hero: false
          },
          stats: null,
          shareUrl: null,
          user: currentUser,
          currentUser,
          isDashboard: true,
          layout: 'layouts/dashboard',
          allThemes: getAllThemes(),
          freeThemes: getFreeThemes(),
          proThemes: getProThemes(),
          currentTheme: getDefaultTheme(),
          baseUrl: `${req.protocol}://${req.get('host')}`,
          formErrors: fieldErrors,
          values: processedBody,
          showProfileForm: true
        });
      }
      
      // Profile exists - render with profile data
      const images = await knex('images').where({ profile_id: profile.id }).orderBy('sort');
      // Use unified completeness calculation - ensure email is included
      const profileForCompleteness = {
        ...profile,
        email: profile.email || currentUser?.email || null
      };
      const completeness = calculateProfileCompleteness(profileForCompleteness, images);
      const shareUrl = `${req.protocol}://${req.get('host')}/portfolio/${profile.slug}`;
      
      return res.status(422).render('dashboard/talent', {
        title: 'Talent Dashboard',
        profile,
        images,
        completeness,
        stats: { heightFeet: toFeetInches(profile.height_cm) },
        shareUrl,
        user: currentUser,
        currentUser,
        isDashboard: true,
        layout: 'layouts/dashboard',
        allThemes: getAllThemes(),
        freeThemes: getFreeThemes(),
        proThemes: getProThemes(),
        currentTheme: profile.pdf_theme || getDefaultTheme(),
        baseUrl: `${req.protocol}://${req.get('host')}`,
        formErrors: fieldErrors,
        values: processedBody
      });
    } catch (error) {
      console.error('[Dashboard/Talent POST] Error in validation error handler:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      return next(error);
    }
  }

  try {
    // Ensure userId exists in session
    if (!req.session || !req.session.userId) {
      console.error('[Dashboard/Talent POST] No userId in session');
      addMessage(req, 'error', 'Session expired. Please log in again.');
      return res.redirect('/login');
    }
    
    // Get user record for profile creation if needed
    const currentUser = await knex('users').where({ id: req.session.userId }).first();
    if (!currentUser) {
      console.error('[Dashboard/Talent POST] User not found:', req.session.userId);
      addMessage(req, 'error', 'User account not found. Please log in again.');
      return res.redirect('/login');
    }
    
    let profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    // If profile doesn't exist, create a minimal one with placeholder names
    // The user can update first_name/last_name later via /apply or a full profile form
    if (!profile) {
      console.log('[Dashboard/Talent POST] Profile not found, creating minimal profile for user:', req.session.userId);
      
      // Extract a name from email as placeholder (e.g., "john@example.com" -> "John User")
      const emailParts = currentUser.email.split('@')[0];
      const placeholderFirstName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1).split('.')[0];
      const placeholderLastName = 'User';
      
      // Extract all fields from parsed data (now optional)
      // Note: "_other" fields have already been merged into main fields during preprocessing
      const {
        first_name, last_name, city, city_secondary, height_cm, bio,
        gender, date_of_birth, weight_kg, weight_lbs, dress_size, hair_length, skin_tone,
        languages, availability_travel, availability_schedule, experience_level, training, portfolio_url,
        instagram_handle, twitter_handle, tiktok_handle,
        reference_name, reference_email, reference_phone,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        work_eligibility, work_status, union_membership, ethnicity, tattoos, piercings, comfort_levels, previous_representations,
        phone, bust, waist, hips, shoe_size, eye_color, hair_color, specialties, experience_details
      } = parsed.data;
      
      // Use provided names or placeholders
      const finalFirstName = first_name || placeholderFirstName;
      const finalLastName = last_name || placeholderLastName;
      
      const profileId = uuidv4();
      const slug = await ensureUniqueSlug(knex, 'profiles', `${finalFirstName}-${finalLastName}`);
      
      console.log('[Dashboard/Talent POST] Creating profile with data:', {
        userId: req.session.userId,
        firstName: finalFirstName,
        lastName: finalLastName,
        city: city || null,
        phone: phone || null,
        height_cm: height_cm || null,
        hasBio: !!bio
      });
      
      // Calculate age from date of birth
      let age = null;
      if (date_of_birth) {
        age = calculateAge(date_of_birth);
      }
      
      // Handle weight conversion
      let finalWeightKg = weight_kg || null;
      let finalWeightLbs = weight_lbs || null;
      if (finalWeightKg && !finalWeightLbs) {
        finalWeightLbs = convertKgToLbs(finalWeightKg);
      } else if (finalWeightLbs && !finalWeightKg) {
        finalWeightKg = convertLbsToKg(finalWeightLbs);
      }
      
      // Handle languages - convert to JSON string
      const languagesJson = languages && Array.isArray(languages) && languages.length > 0
        ? JSON.stringify(languages)
        : null;
      
      // Handle specialties - convert to JSON string
      const specialtiesJson = specialties && Array.isArray(specialties) && specialties.length > 0
        ? JSON.stringify(specialties)
        : null;
      
      // Clean social media handles (Free users - no URLs)
      const cleanInstagramHandle = instagram_handle ? parseSocialMediaHandle(instagram_handle) : null;
      const cleanTwitterHandle = twitter_handle ? parseSocialMediaHandle(twitter_handle) : null;
      const cleanTiktokHandle = tiktok_handle ? parseSocialMediaHandle(tiktok_handle) : null;
      
      // Create minimal profile with the form data
      // Use provided values or defaults
      const curatedBio = bio ? curateBio(bio, finalFirstName, finalLastName) : null;
      
      // Database requires certain fields to be non-null, so use placeholders if not provided
      const finalCity = city || 'Not specified';
      const finalHeightCm = height_cm || 0; // Default to 0 if not provided
      const finalBioRaw = bio || ''; // Empty string if not provided
      const finalBioCurated = curatedBio || ''; // Empty string if not provided
      
      await knex('profiles').insert({
        id: profileId,
        user_id: req.session.userId,
        slug,
        first_name: finalFirstName,
        last_name: finalLastName,
        city: finalCity,
        city_secondary: city_secondary || null,
        phone: phone || null,
        height_cm: finalHeightCm,
        bust_cm: bust || null,
        waist_cm: waist || null,
        hips_cm: hips || null,
        shoe_size: shoe_size || null,
        eye_color: eye_color || null,
        hair_color: hair_color || null,
        bio_raw: finalBioRaw,
        bio_curated: finalBioCurated,
        specialties: specialtiesJson,
        experience_details: typeof experience_details === 'string' ? experience_details : (experience_details ? JSON.stringify(experience_details) : null),
        gender: gender || null,
        date_of_birth: date_of_birth || null,
        age: age,
        weight_kg: finalWeightKg,
        weight_lbs: finalWeightLbs,
        dress_size: dress_size || null,
        hair_length: hair_length || null,
        skin_tone: skin_tone || null,
        languages: languagesJson,
        availability_travel: availability_travel || null,
        availability_schedule: availability_schedule || null,
        experience_level: experience_level || null,
        training: training || null,
        portfolio_url: portfolio_url || null,
        instagram_handle: cleanInstagramHandle,
        instagram_url: null, // Free users don't get URLs
        twitter_handle: cleanTwitterHandle,
        twitter_url: null, // Free users don't get URLs
        tiktok_handle: cleanTiktokHandle,
        tiktok_url: null, // Free users don't get URLs
        reference_name: reference_name || null,
        reference_email: reference_email || null,
        reference_phone: reference_phone || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        emergency_contact_relationship: emergency_contact_relationship || null,
        work_eligibility: work_eligibility || null,
        work_status: work_status || null,
        union_membership: union_membership || null,
        ethnicity: ethnicity || null,
        tattoos: tattoos || null,
        piercings: piercings || null,
        comfort_levels: comfort_levels && Array.isArray(comfort_levels) && comfort_levels.length > 0 ? JSON.stringify(comfort_levels) : null,
        previous_representations: typeof previous_representations === 'string' ? previous_representations : (previous_representations ? JSON.stringify(previous_representations) : null),
        is_pro: false,
        pdf_theme: null,
        pdf_customizations: null
      });
      
      console.log('[Dashboard/Talent POST] Created profile successfully:', {
        profileId,
        userId: req.session.userId,
        slug,
        firstName: finalFirstName,
        lastName: finalLastName,
        city: city || null,
        phone: phone || null
      });
      
      // Reload profile
      profile = await knex('profiles').where({ id: profileId }).first();
      
      // Log activity (non-blocking)
      logActivity(req.session.userId, 'profile_updated', {
        profileId: profileId,
        slug: slug,
        action: 'created'
      }).catch(err => {
        console.error('[Dashboard] Error logging activity:', err);
      });
      
      addMessage(req, 'success', 'Profile created! You can update your name and other details anytime.');
      return res.redirect('/dashboard/talent');
    }

    // Profile exists - update it
    // Extract all fields from parsed data (now optional)
    const {
      first_name, last_name, city, city_secondary, height_cm, measurements, bio,
      gender, date_of_birth, weight_kg, weight_lbs, dress_size, hair_length, skin_tone,
      languages, availability_travel, availability_schedule, experience_level, training, portfolio_url,
      instagram_handle, twitter_handle, tiktok_handle,
      reference_name, reference_email, reference_phone, reference_relationship,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
      nationality, union_membership, ethnicity, tattoos, piercings, work_eligibility, work_status,
      phone, bust, waist, hips, shoe_size, eye_color, hair_color, specialties, experience_details,
      comfort_levels, previous_representations
    } = parsed.data;
    
    // Update first_name and last_name if provided, otherwise keep existing
    const updatedFirstName = first_name !== undefined ? first_name : profile.first_name;
    const updatedLastName = last_name !== undefined ? last_name : profile.last_name;
    
    const curatedBio = bio ? curateBio(bio, updatedFirstName, updatedLastName) : profile.bio_curated;
    const cleanedMeasurements = normalizeMeasurements(measurements);
    
    // STRICT: Age is calculated during read/display phase only, never stored in updateData
    // This prevents data desync between age and date_of_birth
    // Age will be recalculated when the profile is read from the database
    
    // Handle weight conversion
    let finalWeightKg = weight_kg || null;
    let finalWeightLbs = weight_lbs || null;
    if (finalWeightKg && !finalWeightLbs) {
      finalWeightLbs = convertKgToLbs(finalWeightKg);
    } else if (finalWeightLbs && !finalWeightKg) {
      finalWeightKg = convertLbsToKg(finalWeightLbs);
    }
    
    // Handle languages - store as JSONB (PostgreSQL) or JSON string (SQLite)
    // STRICT: With JSONB migration, we store arrays/objects directly, not stringified
    const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
    let languagesJson = profile.languages; // Keep existing if not provided
    if (languages !== undefined) {
      if (isPostgres) {
        // PostgreSQL JSONB: store as array/object directly
        languagesJson = (languages && Array.isArray(languages) && languages.length > 0) ? languages : null;
      } else {
        // SQLite: store as JSON string (backward compatibility)
        if (typeof languages === 'string') {
          languagesJson = languages || null;
        } else if (languages && Array.isArray(languages) && languages.length > 0) {
          languagesJson = JSON.stringify(languages);
        } else {
          languagesJson = null;
        }
      }
    }
    
    // Handle specialties - store as JSONB (PostgreSQL) or JSON string (SQLite)
    let specialtiesJson = profile.specialties; // Keep existing if not provided
    if (specialties !== undefined) {
      if (isPostgres) {
        // PostgreSQL JSONB: store as array/object directly
        specialtiesJson = (specialties && Array.isArray(specialties) && specialties.length > 0) ? specialties : null;
      } else {
        // SQLite: store as JSON string (backward compatibility)
        if (typeof specialties === 'string') {
          specialtiesJson = specialties || null;
        } else if (specialties && Array.isArray(specialties) && specialties.length > 0) {
          specialtiesJson = JSON.stringify(specialties);
        } else {
          specialtiesJson = null;
        }
      }
    }
    
    // Handle weight (only if provided in form)
    if (weight_kg === undefined && weight_lbs === undefined) {
      // Keep existing weight values
      finalWeightKg = profile.weight_kg;
      finalWeightLbs = profile.weight_lbs;
    }
    
    // Check if user is Studio+ to determine if we should generate social media URLs
    const isPro = profile.is_pro || false;
    
    // Clean social media handles (only if provided in form)
    let cleanInstagramHandle = profile.instagram_handle;
    let cleanTwitterHandle = profile.twitter_handle;
    let cleanTiktokHandle = profile.tiktok_handle;
    
    if (instagram_handle !== undefined) {
      cleanInstagramHandle = instagram_handle ? parseSocialMediaHandle(instagram_handle) : null;
    }
    if (twitter_handle !== undefined) {
      cleanTwitterHandle = twitter_handle ? parseSocialMediaHandle(twitter_handle) : null;
    }
    if (tiktok_handle !== undefined) {
      cleanTiktokHandle = tiktok_handle ? parseSocialMediaHandle(tiktok_handle) : null;
    }
    
    // STRICT: Social media URLs are derived fields - compute from handles on read, don't store
    // Only update URLs in database if handles changed (for backward compatibility during migration)
    // In future, URLs should be computed in the route handler GET method, not stored
    let finalInstagramUrl = null;
    let finalTwitterUrl = null;
    let finalTiktokUrl = null;
    
    if (isPro) {
      // Studio+ users: Generate URLs from handles (derived field)
      // For now, still update DB for backward compatibility, but ideally compute on read
      if (cleanInstagramHandle) {
        finalInstagramUrl = generateSocialMediaUrl('instagram', cleanInstagramHandle);
      }
      if (cleanTwitterHandle) {
        finalTwitterUrl = generateSocialMediaUrl('twitter', cleanTwitterHandle);
      }
      if (cleanTiktokHandle) {
        finalTiktokUrl = generateSocialMediaUrl('tiktok', cleanTiktokHandle);
      }
    }
    // Free users: URLs remain null (not computed or stored)
    
    // Build update object - only update fields that were provided in the form
    const updateData = {
      updated_at: knex.fn.now()
    };
    
    // Handle name updates - if name changes, we may need to update the slug
    let needsSlugUpdate = false;
    if (first_name !== undefined && first_name !== profile.first_name) {
      updateData.first_name = first_name || null;
      needsSlugUpdate = true;
    }
    if (last_name !== undefined && last_name !== profile.last_name) {
      updateData.last_name = last_name || null;
      needsSlugUpdate = true;
    }
    
    // Only update fields that are explicitly in parsed.data (were submitted in form)
    if (city !== undefined) updateData.city = city || null;
    if (city_secondary !== undefined) updateData.city_secondary = city_secondary || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (height_cm !== undefined) updateData.height_cm = height_cm;
    if (bust !== undefined) updateData.bust_cm = bust || null;
    if (waist !== undefined) updateData.waist_cm = waist || null;
    if (hips !== undefined) updateData.hips_cm = hips || null;
    if (shoe_size !== undefined) updateData.shoe_size = shoe_size || null;
    if (eye_color !== undefined) updateData.eye_color = eye_color || null;
    if (hair_color !== undefined) updateData.hair_color = hair_color || null;
    if (bio !== undefined) {
      updateData.bio_raw = bio;
      updateData.bio_curated = curatedBio;
    }
    if (specialties !== undefined) updateData.specialties = specialtiesJson;
    // Note: experience_details is handled in the JSONB section below (line ~817)
    if (gender !== undefined) updateData.gender = gender || null;
    if (date_of_birth !== undefined) {
      updateData.date_of_birth = date_of_birth || null;
      // STRICT: Age is not stored in updateData - it will be calculated during read/display phase
      // This ensures age always matches date_of_birth and prevents data desync
    }
    if (weight_kg !== undefined || weight_lbs !== undefined) {
      updateData.weight_kg = finalWeightKg;
      updateData.weight_lbs = finalWeightLbs;
    }
    if (dress_size !== undefined) updateData.dress_size = dress_size || null;
    if (hair_length !== undefined) updateData.hair_length = hair_length || null;
    if (skin_tone !== undefined) updateData.skin_tone = skin_tone || null;
    if (languages !== undefined) updateData.languages = languagesJson;
    // STRICT: Boolean fields store false, not null, to maintain boolean integrity
    if (availability_travel !== undefined) updateData.availability_travel = availability_travel === false ? false : (availability_travel || false);
    if (availability_schedule !== undefined) updateData.availability_schedule = availability_schedule || null;
    if (experience_level !== undefined) updateData.experience_level = experience_level || null;
    if (training !== undefined) updateData.training = training || null;
    if (portfolio_url !== undefined) updateData.portfolio_url = portfolio_url || null;
    if (instagram_handle !== undefined) {
      updateData.instagram_handle = cleanInstagramHandle;
      updateData.instagram_url = finalInstagramUrl;
    }
    if (twitter_handle !== undefined) {
      updateData.twitter_handle = cleanTwitterHandle;
      updateData.twitter_url = finalTwitterUrl;
    }
    if (tiktok_handle !== undefined) {
      updateData.tiktok_handle = cleanTiktokHandle;
      updateData.tiktok_url = finalTiktokUrl;
    }
    if (reference_name !== undefined) updateData.reference_name = reference_name || null;
    if (reference_email !== undefined) updateData.reference_email = reference_email || null;
    if (reference_phone !== undefined) updateData.reference_phone = reference_phone || null;
    if (emergency_contact_name !== undefined) updateData.emergency_contact_name = emergency_contact_name || null;
    if (emergency_contact_phone !== undefined) updateData.emergency_contact_phone = emergency_contact_phone || null;
    if (emergency_contact_relationship !== undefined) updateData.emergency_contact_relationship = emergency_contact_relationship || null;
    if (work_eligibility !== undefined) updateData.work_eligibility = work_eligibility || null;
    if (work_status !== undefined) {
      // Note: work_status_other has already been merged into work_status during preprocessing
      updateData.work_status = work_status || null;
    }
    if (union_membership !== undefined) updateData.union_membership = union_membership || null;
    if (ethnicity !== undefined) updateData.ethnicity = ethnicity || null;
    // STRICT: Boolean fields store false, not null, to maintain boolean integrity
    if (tattoos !== undefined) updateData.tattoos = tattoos === false ? false : (tattoos || false);
    if (piercings !== undefined) updateData.piercings = piercings === false ? false : (piercings || false);
    // STRICT: JSONB fields - store arrays/objects directly for PostgreSQL, stringify for SQLite
    if (comfort_levels !== undefined) {
      if (isPostgres) {
        updateData.comfort_levels = (comfort_levels && Array.isArray(comfort_levels) && comfort_levels.length > 0) ? comfort_levels : null;
      } else {
        if (typeof comfort_levels === 'string') {
          updateData.comfort_levels = comfort_levels || null;
        } else if (comfort_levels && Array.isArray(comfort_levels) && comfort_levels.length > 0) {
          updateData.comfort_levels = JSON.stringify(comfort_levels);
        } else {
          updateData.comfort_levels = null;
        }
      }
    }
    if (previous_representations !== undefined) {
      if (isPostgres) {
        updateData.previous_representations = (previous_representations && (typeof previous_representations === 'object' || Array.isArray(previous_representations))) ? previous_representations : null;
      } else {
        if (typeof previous_representations === 'string') {
          updateData.previous_representations = previous_representations || null;
        } else if (previous_representations && (typeof previous_representations === 'object' || Array.isArray(previous_representations))) {
          updateData.previous_representations = JSON.stringify(previous_representations);
        } else {
          updateData.previous_representations = null;
        }
      }
    }
    if (experience_details !== undefined) {
      if (isPostgres) {
        updateData.experience_details = (experience_details && typeof experience_details === 'object') ? experience_details : null;
      } else {
        updateData.experience_details = typeof experience_details === 'string' 
          ? experience_details 
          : (experience_details ? JSON.stringify(experience_details) : null);
      }
    }

    // Update slug if name changed (only if slug was auto-generated from name)
    if (needsSlugUpdate && (first_name !== undefined || last_name !== undefined)) {
      const finalFirstName = first_name !== undefined ? first_name : profile.first_name;
      const finalLastName = last_name !== undefined ? last_name : profile.last_name;
      
      // Only update slug if the current slug matches the old name pattern
      const oldNameSlug = `${profile.first_name}-${profile.last_name}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
      if (profile.slug === oldNameSlug || profile.slug.startsWith(`${oldNameSlug}-`)) {
        const newNameSlug = `${finalFirstName}-${finalLastName}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
        const uniqueSlug = await ensureUniqueSlug(knex, 'profiles', newNameSlug);
        updateData.slug = uniqueSlug;
        console.log('[Dashboard/Talent POST] Updating slug due to name change:', {
          oldSlug: profile.slug,
          newSlug: uniqueSlug,
          oldName: `${profile.first_name} ${profile.last_name}`,
          newName: `${finalFirstName} ${finalLastName}`
        });
      }
    }
    
    await knex('profiles')
      .where({ id: profile.id })
      .update(updateData);
    
    console.log('[Dashboard/Talent POST] Profile updated successfully:', {
      profileId: profile.id,
      userId: req.session.userId,
      updatedFields: Object.keys(updateData),
      slugChanged: !!updateData.slug
    });

    // Fetch updated profile to recalculate completeness
    const updatedProfile = await knex('profiles').where({ id: profile.id }).first();
    const images = await knex('images').where({ profile_id: profile.id }).orderBy('sort', 'asc');
    
    // Recalculate completeness with updated data
    // Note: currentUser is already declared above at line 378
    const profileForCompleteness = {
      ...updatedProfile,
      email: updatedProfile.email || currentUser?.email || null
    };
    const completeness = calculateProfileCompleteness(profileForCompleteness, images);
    
    console.log('[Dashboard/Talent POST] Completeness recalculated:', {
      percentage: completeness.percentage,
      completedSections: Object.values(completeness.sections).filter(s => s.complete).length,
      totalSections: Object.keys(completeness.sections).length
    });

    // Log activity (non-blocking)
    logActivity(req.session.userId, 'profile_updated', {
      profileId: profile.id,
      slug: updateData.slug || profile.slug,
      nameChanged: needsSlugUpdate,
      completenessPercentage: completeness.percentage
    }).catch(err => {
      console.error('[Dashboard] Error logging activity:', err);
    });

    addMessage(req, 'success', `Profile updated successfully. ${completeness.percentage}% complete.`);
    return res.redirect('/dashboard/talent');
  } catch (error) {
    console.error('[Dashboard/Talent POST] Error updating profile:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      userId: req.session.userId,
      body: req.body
    });
    return next(error);
  }
});

router.post('/dashboard/talent/media', requireRole('TALENT'), upload.array('media', 12), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'Please select at least one image to upload.',
        success: false 
      });
    }

    // Ensure userId exists in session
    if (!req.session || !req.session.userId) {
      console.error('[Dashboard/Media Upload] No userId in session');
      return res.status(401).json({ 
        error: 'Session expired. Please log in again.',
        success: false 
      });
    }

    let profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    // If profile doesn't exist, create a minimal one
    if (!profile) {
      console.log('[Dashboard/Media Upload] Profile not found, creating minimal profile for user:', req.session.userId);
      
      try {
        const currentUser = await knex('users').where({ id: req.session.userId }).first();
        if (!currentUser) {
          console.error('[Dashboard/Media Upload] User not found:', req.session.userId);
          return res.status(404).json({ 
            error: 'User not found.',
            success: false 
          });
        }
        
        // Extract a name from email as placeholder
        const emailParts = currentUser.email.split('@')[0];
        const placeholderFirstName = emailParts.charAt(0).toUpperCase() + emailParts.slice(1).split('.')[0];
        const placeholderLastName = 'User';
        
        const profileId = uuidv4();
        const slug = await ensureUniqueSlug(knex, 'profiles', `${placeholderFirstName}-${placeholderLastName}`);
        
        // Database requires certain fields to be non-null, so use placeholders if not provided
        const placeholderCity = 'Not specified';
        const placeholderHeightCm = 0;
        const placeholderBioRaw = '';
        const placeholderBioCurated = '';
        
        await knex('profiles').insert({
          id: profileId,
          user_id: req.session.userId,
          slug,
          first_name: placeholderFirstName,
          last_name: placeholderLastName,
          city: placeholderCity,
          height_cm: placeholderHeightCm,
          bio_raw: placeholderBioRaw,
          bio_curated: placeholderBioCurated,
          is_pro: false,
          pdf_theme: null,
          pdf_customizations: null
        });
        
        console.log('[Dashboard/Media Upload] Created minimal profile:', {
          profileId,
          userId: req.session.userId,
          slug
        });
        
        // Reload profile
        profile = await knex('profiles').where({ id: profileId }).first();
        
        if (!profile) {
          console.error('[Dashboard/Media Upload] Failed to reload created profile');
          return res.status(500).json({ 
            error: 'Failed to create profile. Please try again.',
            success: false 
          });
        }
        
        // Log activity (non-blocking)
        logActivity(req.session.userId, 'profile_created', {
          profileId: profileId,
          slug: slug,
          action: 'created_via_upload'
        }).catch(err => {
          console.error('[Dashboard] Error logging activity:', err);
        });
      } catch (createError) {
        console.error('[Dashboard/Media Upload] Error creating profile:', {
          message: createError.message,
          stack: createError.stack,
          userId: req.session.userId
        });
        return res.status(500).json({ 
          error: 'Failed to create profile. Please try again.',
          success: false,
          details: process.env.NODE_ENV !== 'production' ? createError.message : undefined
        });
      }
    }

    const countResult = await knex('images')
      .where({ profile_id: profile.id })
      .count({ total: '*' })
      .first();
    let nextSort = Number(countResult?.total || 0) + 1;

    const uploadedImages = [];
    let heroSet = false;
    let heroImageId = null;
    let heroImagePath = null;

    for (const file of req.files) {
      try {
        const storedPath = await processImage(file.path);
        const imageId = uuidv4();
        await knex('images').insert({
          id: imageId,
          profile_id: profile.id,
          path: storedPath,
          label: 'Portfolio image',
          sort: nextSort++
        });

        // Set first uploaded image as hero if no hero exists
        if (!profile.hero_image_path && !heroSet && uploadedImages.length === 0) {
          await knex('profiles').where({ id: profile.id }).update({ hero_image_path: storedPath });
          heroSet = true;
          heroImageId = imageId;
          heroImagePath = storedPath;
        }

        uploadedImages.push({
          id: imageId,
          path: storedPath,
          label: 'Portfolio image',
          sort: nextSort - 1,
          profile_id: profile.id,
          created_at: new Date().toISOString()
        });
      } catch (fileError) {
        console.error('[Dashboard/Media Upload] Error processing file:', {
          message: fileError.message,
          stack: fileError.stack,
          fileName: file.originalname,
          fileSize: file.size,
          fileMimetype: file.mimetype,
          profileId: profile.id
        });
        // Continue with other files even if one fails
      }
    }

    if (uploadedImages.length > 0) {
      // Get updated profile to check if hero was set
      const updatedProfile = await knex('profiles').where({ id: profile.id }).first();
      
      const totalImages = Number(countResult?.total || 0) + uploadedImages.length;
      
      // Log activity (non-blocking)
      logActivity(req.session.userId, 'image_uploaded', {
        profileId: profile.id,
        imageCount: uploadedImages.length,
        totalImages: totalImages
      }).catch(err => {
        console.error('[Dashboard] Error logging activity:', err);
      });
      
      return res.json({ 
        success: true,
        message: `Successfully uploaded ${uploadedImages.length} image${uploadedImages.length > 1 ? 's' : ''}.`,
        images: uploadedImages,
        heroImagePath: updatedProfile.hero_image_path,
        totalImages: totalImages
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to upload images. Please try again.',
        success: false 
      });
    }
  } catch (error) {
    console.error('[Dashboard/Media Upload] Error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
      userId: req.session?.userId,
      hasFiles: !!req.files,
      fileCount: req.files?.length || 0
    });
    return res.status(500).json({ 
      error: 'An error occurred while uploading images.',
      success: false,
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

router.put('/dashboard/talent/media/:id/hero', requireRole('TALENT'), async (req, res, next) => {
  try {
    const imageId = req.params.id;
    if (!imageId || typeof imageId !== 'string') {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    // Get the image record to verify ownership
    const image = await knex('images')
      .select('images.*', 'profiles.user_id', 'profiles.id as profile_id')
      .leftJoin('profiles', 'images.profile_id', 'profiles.id')
      .where('images.id', imageId)
      .first();

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Verify the current user owns this image
    if (image.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update profile hero image
    await knex('profiles')
      .where({ id: image.profile_id })
      .update({
        hero_image_path: image.path,
        updated_at: knex.fn.now()
      });

    return res.json({ 
      success: true, 
      message: 'Hero image updated successfully',
      heroImagePath: image.path
    });
  } catch (error) {
    console.error('Set hero image error:', error);
    return res.status(500).json({ error: 'Failed to set hero image' });
  }
});

router.delete('/dashboard/talent/media/:id', requireRole('TALENT'), async (req, res, next) => {
  try {
    const mediaId = req.params.id;
    if (!mediaId || typeof mediaId !== 'string') {
      return res.status(400).json({ error: 'Invalid media ID' });
    }

    // Get the media record to verify ownership
    const media = await knex('images')
      .select('images.*', 'profiles.user_id')
      .leftJoin('profiles', 'images.profile_id', 'profiles.id')
      .where('images.id', mediaId)
      .first();

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Verify the current user owns this media
    if (media.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete the file from disk
    // media.path is like "/uploads/seed/file.webp" (relative to project root)
    // We need to resolve it to absolute path
    let filePath;
    if (media.path.startsWith('/uploads/')) {
      // Path is relative to project root, resolve from project root
      const relativePath = media.path.slice(1); // Remove leading '/'
      filePath = path.join(__dirname, '..', '..', relativePath);
    } else if (media.path.startsWith('/')) {
      // Other absolute path starting with /
      const relativePath = media.path.slice(1);
      filePath = path.join(__dirname, '..', '..', relativePath);
    } else {
      // Relative path, assume it's in uploads directory
      filePath = path.join(config.uploadsDir, media.path);
    }
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      // Log but don't fail if file doesn't exist
      console.warn(`Could not delete file ${filePath}:`, fileError.message);
    }

    // Check if this was the hero image and update profile if needed
    const profile = await knex('profiles').where({ id: media.profile_id }).first();
    let newHeroImagePath = null;
    if (profile && profile.hero_image_path === media.path) {
      // Set hero to next available image, or null
      const nextImage = await knex('images')
        .where({ profile_id: media.profile_id })
        .whereNot('id', mediaId) // Exclude the image we're about to delete
        .orderBy('sort')
        .first();

      newHeroImagePath = nextImage ? nextImage.path : null;
      await knex('profiles')
        .where({ id: media.profile_id })
        .update({
          hero_image_path: newHeroImagePath,
          updated_at: knex.fn.now()
        });
    } else {
      // Keep existing hero image path
      newHeroImagePath = profile?.hero_image_path || null;
    }

    // Delete from database
    await knex('images').where({ id: mediaId }).delete();

    return res.json({ 
      success: true, 
      deleted: mediaId,
      heroImagePath: newHeroImagePath
    });
  } catch (error) {
    console.error('Media delete error:', error);
    return res.status(500).json({ error: 'Failed to delete media' });
  }
});

router.get('/dashboard/talent/analytics', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    if (!profile) {
      // Return empty analytics when no profile exists (instead of 404)
      return res.json({
        success: true,
        analytics: {
          views: {
            total: 0,
            thisWeek: 0,
            thisMonth: 0
          },
          downloads: {
            total: 0,
            thisWeek: 0,
            thisMonth: 0,
            byTheme: []
          }
        }
      });
    }

    // Get analytics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get view counts
    const views = await knex('analytics')
      .where({ profile_id: profile.id, event_type: 'view' })
      .where('created_at', '>=', thirtyDaysAgo)
      .count({ total: '*' })
      .first();

    // Get download counts
    const downloads = await knex('analytics')
      .where({ profile_id: profile.id, event_type: 'download' })
      .where('created_at', '>=', thirtyDaysAgo)
      .count({ total: '*' })
      .first();

    // Get views this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const viewsThisWeek = await knex('analytics')
      .where({ profile_id: profile.id, event_type: 'view' })
      .where('created_at', '>=', weekAgo)
      .count({ total: '*' })
      .first();

    // Get downloads this week
    const downloadsThisWeek = await knex('analytics')
      .where({ profile_id: profile.id, event_type: 'download' })
      .where('created_at', '>=', weekAgo)
      .count({ total: '*' })
      .first();

    // Get views this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const viewsThisMonth = await knex('analytics')
      .where({ profile_id: profile.id, event_type: 'view' })
      .where('created_at', '>=', monthAgo)
      .count({ total: '*' })
      .first();

    // Get downloads this month
    const downloadsThisMonth = await knex('analytics')
      .where({ profile_id: profile.id, event_type: 'download' })
      .where('created_at', '>=', monthAgo)
      .count({ total: '*' })
      .first();

    // Get downloads by theme
    const downloadsByTheme = await knex('analytics')
      .where({ profile_id: profile.id, event_type: 'download' })
      .where('created_at', '>=', thirtyDaysAgo)
      .select(knex.raw('metadata->>\'theme\' as theme'))
      .count({ total: '*' })
      .groupBy('theme');

    return res.json({
      success: true,
      analytics: {
        views: {
          total: Number(views?.total || 0),
          thisWeek: Number(viewsThisWeek?.total || 0),
          thisMonth: Number(viewsThisMonth?.total || 0)
        },
        downloads: {
          total: Number(downloads?.total || 0),
          thisWeek: Number(downloadsThisWeek?.total || 0),
          thisMonth: Number(downloadsThisMonth?.total || 0),
          byTheme: downloadsByTheme.map(item => ({
            theme: item.theme || 'unknown',
            count: Number(item.total || 0)
          }))
        }
      }
    });
  } catch (error) {
    console.error('[Dashboard/Analytics] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to load analytics',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

router.get('/dashboard/talent/activity', requireRole('TALENT'), async (req, res, next) => {
  try {
    // Get recent activities for the user
    const activities = await knex('activities')
      .where({ user_id: req.session.userId })
      .orderBy('created_at', 'desc')
      .limit(10);

    // Format activities
    const formattedActivities = activities.map(activity => {
      const metadata = typeof activity.metadata === 'string' 
        ? JSON.parse(activity.metadata) 
        : activity.metadata || {};
      
      let message = '';
      let icon = '📝';
      
      switch (activity.activity_type) {
        case 'profile_updated':
          message = 'Profile updated';
          icon = '✏️';
          break;
        case 'image_uploaded':
          const imageCount = metadata.imageCount || 1;
          message = `${imageCount} image${imageCount > 1 ? 's' : ''} uploaded`;
          icon = '📷';
          break;
        case 'pdf_downloaded':
          const theme = metadata.theme || 'default';
          message = `PDF downloaded (${theme} theme)`;
          icon = '📄';
          break;
        case 'portfolio_viewed':
          message = 'Portfolio viewed';
          icon = '👁️';
          break;
        default:
          message = 'Activity recorded';
          icon = '📝';
      }
      
      return {
        id: activity.id,
        type: activity.activity_type,
        message,
        icon,
        metadata,
        createdAt: activity.created_at,
        timeAgo: getTimeAgo(activity.created_at)
      };
    });

    return res.json({
      success: true,
      activities: formattedActivities
    });
  } catch (error) {
    console.error('[Dashboard/Activity] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to load activity feed',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

router.get('/api/talent/applications', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles')
      .where({ user_id: req.session.userId })
      .first();

    if (!profile) {
      return res.json([]);
    }

    const applications = await knex('applications')
      .select(
        'applications.*',
        'users.agency_name',
        'users.email as agency_email'
      )
      .leftJoin('users', 'applications.agency_id', 'users.id')
      .where({ profile_id: profile.id })
      .orderBy('applications.created_at', 'desc');

    return res.json(applications.map(app => ({
      id: app.id,
      agencyName: app.agency_name || app.agency_email,
      agencyEmail: app.agency_email,
      status: app.status || 'pending',
      createdAt: app.created_at,
      acceptedAt: app.accepted_at,
      declinedAt: app.declined_at,
      invitedByAgency: !!app.invited_by_agency_id
    })));
  } catch (error) {
    console.error('[Talent Applications API] Error:', error);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

router.post('/api/talent/discoverability', requireRole('TALENT'), async (req, res, next) => {
  try {
    const { isDiscoverable } = req.body;
    const profile = await knex('profiles')
      .where({ user_id: req.session.userId })
      .first();

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Check if user has Pro subscription
    if (!profile.is_pro) {
      return res.status(403).json({ error: 'Studio+ subscription required to enable discoverability' });
    }

    // Update discoverability
    await knex('profiles')
      .where({ id: profile.id })
      .update({ is_discoverable: !!isDiscoverable });

    return res.json({ success: true, isDiscoverable: !!isDiscoverable });
  } catch (error) {
    console.error('[Discoverability API] Error:', error);
    return res.status(500).json({ error: 'Failed to update discoverability' });
  }
});

router.get('/dashboard/pdf-customizer', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    if (!profile) {
      addMessage(req, 'error', 'Profile not found.');
      return res.redirect('/apply');
    }
    
    if (!profile.is_pro) {
      addMessage(req, 'error', 'Studio+ account required to customize PDF comp cards.');
      return res.redirect('/dashboard/talent');
    }
    
    // Load customizations
    let customizations = null;
    if (profile.pdf_customizations) {
      try {
        customizations = typeof profile.pdf_customizations === 'string'
          ? JSON.parse(profile.pdf_customizations)
          : profile.pdf_customizations;
      } catch (err) {
        console.error('Error parsing customizations:', err);
        customizations = null;
      }
    }
    
    // Get current theme
    const currentTheme = profile.pdf_theme || getDefaultTheme();
    const theme = getTheme(currentTheme);
    
    // Get all themes, fonts, color palettes, and layouts
    const allThemes = getAllThemes();
    const freeThemes = getFreeThemes();
    const proThemes = getProThemes();
    const availableFonts = getAvailableFonts();
    const colorPalettes = getAvailableColorPalettes();
    const layoutPresets = getAllLayoutPresets();
    
    const currentUser = await knex('users')
      .where({ id: req.session.userId })
      .first();
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    return res.render('dashboard/pdf-customizer', {
      title: 'PDF Customizer',
      profile,
      customizations: customizations || {},
      currentTheme,
      theme,
      allThemes,
      freeThemes,
      proThemes,
      availableFonts,
      colorPalettes,
      layoutPresets,
      user: currentUser,
      currentUser,
      isDashboard: true,
      layout: 'layouts/dashboard',
      baseUrl,
      profileSlug: profile.slug
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/dashboard/settings', requireRole('TALENT'), async (req, res, next) => {
  try {
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    const currentUser = await knex('users')
      .where({ id: req.session.userId })
      .first();
    
    // Allow settings access even without profile - user can set account preferences
    return res.render('dashboard/settings/index', {
      title: 'Settings',
      profile: profile || null,
      user: currentUser,
      currentUser,
      currentPage: 'settings',
      layout: 'layouts/dashboard',
      section: 'account' // Default section
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/dashboard/settings/:section', requireRole('TALENT'), async (req, res, next) => {
  try {
    const { section } = req.params;
    const validSections = ['account', 'profile', 'notifications', 'privacy', 'billing'];
    
    if (!validSections.includes(section)) {
      addMessage(req, 'error', 'Invalid settings section.');
      return res.redirect('/dashboard/settings');
    }
    
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    const currentUser = await knex('users')
      .where({ id: req.session.userId })
      .first();
    
    // Allow settings access even without profile - user can set account preferences
    return res.render('dashboard/settings/index', {
      title: `${section.charAt(0).toUpperCase() + section.slice(1)} Settings`,
      profile: profile || null,
      user: currentUser,
      currentUser,
      currentPage: 'settings',
      layout: 'layouts/dashboard',
      section
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/dashboard/settings/slug', requireRole('TALENT'), async (req, res, next) => {
  try {
    const { slug } = req.body;
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      addMessage(req, 'error', 'Profile not found.');
      return res.redirect('/dashboard/settings');
    }
    
    if (!slug || slug.trim().length === 0) {
      addMessage(req, 'error', 'Portfolio slug is required.');
      return res.redirect('/dashboard/settings/profile');
    }
    
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    if (cleanSlug !== profile.slug) {
      const uniqueSlug = await ensureUniqueSlug(knex, 'profiles', cleanSlug);
      await knex('profiles')
        .where({ id: profile.id })
        .update({ slug: uniqueSlug, updated_at: knex.fn.now() });
      
      addMessage(req, 'success', 'Portfolio slug updated successfully.');
    }
    
    return res.redirect('/dashboard/settings/profile');
  } catch (error) {
    console.error('[Settings] Error updating slug:', error);
    addMessage(req, 'error', 'Failed to update portfolio slug.');
    return res.redirect('/dashboard/settings/profile');
  }
});

router.post('/dashboard/settings/visibility', requireRole('TALENT'), async (req, res, next) => {
  try {
    const { visibility } = req.body;
    const profile = await knex('profiles').where({ user_id: req.session.userId }).first();
    
    if (!profile) {
      addMessage(req, 'error', 'Profile not found.');
      return res.redirect('/dashboard/settings');
    }
    
    const isPublic = visibility === 'public';
    
    // Check if is_public column exists before updating
    try {
      await knex('profiles')
        .where({ id: profile.id })
        .update({ is_public: isPublic, updated_at: knex.fn.now() });
      
      addMessage(req, 'success', `Portfolio is now ${isPublic ? 'public' : 'private'}.`);
    } catch (updateError) {
      // If column doesn't exist, log warning but don't fail
      if (updateError.code === '42703' || updateError.message?.includes('column "is_public" does not exist')) {
        console.log('[Settings] is_public column does not exist, skipping visibility update');
        addMessage(req, 'info', 'Portfolio visibility feature is not yet available. Your portfolio is currently public.');
      } else {
        throw updateError;
      }
    }
    
    return res.redirect('/dashboard/settings/profile');
  } catch (error) {
    console.error('[Settings] Error updating visibility:', error);
    addMessage(req, 'error', 'Failed to update portfolio visibility.');
    return res.redirect('/dashboard/settings/profile');
  }
});

function getTimeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

async function logActivity(userId, activityType, metadata = {}) {
  try {
    await knex('activities').insert({
      id: uuidv4(),
      user_id: userId,
      activity_type: activityType,
      metadata: JSON.stringify(metadata),
      created_at: knex.fn.now()
    });
  } catch (error) {
    console.error('[Dashboard] Error logging activity:', error);
    // Don't throw - activity logging is non-critical
  }
}

module.exports = router;
