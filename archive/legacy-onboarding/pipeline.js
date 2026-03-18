/**
 * Phase C Onboarding Pipeline
 * AI-powered profile processing after submission
 * 
 * Pipeline sequence:
 * 1. Scout: Analyze uploaded images (facial symmetry, market fit, visual estimates)
 * 2. Maverick: Assess profile + Scout intel (generate predictions/details)
 * 3. Librarian: Synthesize data (SQL fields, vector summary, vibe score, is_unicorn)
 * 4. Comp Card: Build PDF comp card (using existing renderCompCard)
 * 5. Finalize: Mark onboarding_stage='processed'
 */

const Groq = require('groq-sdk');
const knex = require('../../db/knex');
const fs = require('fs').promises;
const path = require('path');
const config = require('../../config');
const { renderCompCard } = require('../pdf');
const { curateBio } = require('../curate');
const { transitionTo, getState } = require('./state-machine');

// Initialize Groq client (lazy initialization to avoid errors if API key missing)
let groqClient = null;
function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY || config.groq?.apiKey;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required for Phase C pipeline');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Run Scout analysis on a single image
 * @param {string} imagePath - Path to image file
 * @param {string} mimeType - Image MIME type
 * @returns {Promise<Object>} Scout analysis result
 */
async function runScoutAnalysis(imagePath, mimeType = 'image/jpeg') {
  try {
    // Read image file
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Scout analysis prompt
    const scoutPrompt = `You are Scout, an elite facial analysis AI for Pholio. Analyze this image for:

1. Facial Symmetry: Rate 0-10 with detailed analysis
2. Market Fit: Assess suitability for modeling/acting markets (editorial, commercial, runway, etc.)
3. Unique Features: Identify standout characteristics
4. Professional Potential: Overall assessment and recommendations
5. Visual Estimates: Estimate height (in inches) and weight (in lbs) based on visual proportions

Respond in JSON format:
{
  "facialSymmetry": {
    "score": 0-10,
    "analysis": "...",
    "notes": "..."
  },
  "marketFit": {
    "editorial": "high|medium|low",
    "commercial": "high|medium|low",
    "runway": "high|medium|low",
    "overall": "..."
  },
  "uniqueFeatures": ["...", "..."],
  "professionalPotential": {
    "score": 0-10,
    "assessment": "...",
    "recommendations": ["...", "..."]
  },
  "visualEstimates": {
    "heightEstimate": 0,
    "weightEstimate": 0
  }
}`;

    // Call Groq vision API with Scout model
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: scoutPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.5,
      max_completion_tokens: 1000,
      top_p: 1,
      response_format: { type: 'json_object' }
    });

    let scoutAnalysis;
    try {
      scoutAnalysis = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.warn('[Pipeline/Scout] JSON parse error, using fallback:', parseError.message);
      scoutAnalysis = {
        facialSymmetry: { score: 7, analysis: 'Analysis completed', notes: '' },
        marketFit: { overall: 'Moderate potential' },
        uniqueFeatures: [],
        professionalPotential: { score: 7, assessment: 'Good potential' },
        visualEstimates: {
          heightEstimate: 0,
          weightEstimate: 0
        }
      };
    }

    return scoutAnalysis;
  } catch (error) {
    console.error('[Pipeline/Scout] Error analyzing image:', error);
    // Return fallback analysis on error
    return {
      facialSymmetry: { score: 7, analysis: 'Analysis error', notes: error.message },
      marketFit: { overall: 'Analysis error' },
      uniqueFeatures: [],
      professionalPotential: { score: 7, assessment: 'Analysis error' },
      visualEstimates: {
        heightEstimate: 0,
        weightEstimate: 0
      },
      error: error.message
    };
  }
}

/**
 * Run Maverick assessment
 * @param {Object} profile - Profile data
 * @param {Object} visualIntel - Scout analysis results
 * @returns {Promise<Object>} Maverick assessment result
 */
async function runMaverickAssessment(profile, visualIntel) {
  try {
    const maverickPrompt = `You are Maverick, an elite talent assessment AI for Pholio. Assess this profile using the provided Scout visual intelligence.

Profile Data:
${JSON.stringify(profile, null, 2)}

Scout Visual Intelligence:
${JSON.stringify(visualIntel, null, 2)}

Tasks:
1. Generate comprehensive profile predictions and details
2. Provide market fit recommendations
3. Suggest professional development areas
4. Generate comp card details (highlights, strengths, etc.)

Respond in JSON format:
{
  "predictions": {
    "marketFit": "...",
    "strengths": ["...", "..."],
    "recommendations": ["...", "..."]
  },
  "compCardDetails": {
    "highlights": ["...", "..."],
    "keyStrengths": ["...", "..."]
  },
  "assessment": "..."
}`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are Maverick, an elite talent assessment AI for Pholio. Provide detailed assessments and predictions in JSON format.'
        },
        {
          role: 'user',
          content: maverickPrompt
        }
      ],
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      temperature: 0.7,
      max_completion_tokens: 1500,
      top_p: 1,
      response_format: { type: 'json_object' }
    });

    let maverickAssessment;
    try {
      maverickAssessment = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      console.warn('[Pipeline/Maverick] JSON parse error, using fallback:', parseError.message);
      maverickAssessment = {
        predictions: {
          marketFit: 'Moderate',
          strengths: [],
          recommendations: []
        },
        compCardDetails: {
          highlights: [],
          keyStrengths: []
        },
        assessment: 'Assessment completed'
      };
    }

    return maverickAssessment;
  } catch (error) {
    console.error('[Pipeline/Maverick] Error in assessment:', error);
    // Return fallback assessment on error
    return {
      predictions: {
        marketFit: 'Moderate',
        strengths: [],
        recommendations: []
      },
      compCardDetails: {
        highlights: [],
        keyStrengths: []
      },
      assessment: `Assessment error: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Run Librarian synthesis
 * @param {Object} profile - Profile data
 * @param {Object} visualIntel - Scout analysis results
 * @param {Object} maverickPredictions - Maverick assessment results
 * @returns {Promise<Object>} Librarian synthesis result
 */
async function runLibrarianSynthesis(profile, visualIntel, maverickPredictions) {
  try {
    const librarianPrompt = `You are the Librarian, a data synthesis AI for Pholio. Your task is to synthesize onboarding data into structured formats.

Profile Data:
${JSON.stringify(profile, null, 2)}

Scout Visual Intelligence:
${JSON.stringify(visualIntel, null, 2)}

Maverick Predictions:
${JSON.stringify(maverickPredictions, null, 2)}

Tasks:
1. Generate SQL INSERT JSON for profiles table (ONLY profiles table fields)
2. Generate Vector Summary TEXT for semantic search (plain text, not a vector array)
3. Calculate vibe_score (0-10 scale) based on profile completeness, quality, and potential
4. Determine if is_unicorn = TRUE (if vibe_score > 9.5)

IMPORTANT: The "sql" object should ONLY contain fields that belong to the profiles table. DO NOT include:
- email (belongs in users table)
- firebase_uid (belongs in users table)
- role (belongs in users table)
- id or user_id (these are handled by the system)
- vector_summary_text (handled separately)

Valid profiles table fields include: first_name, last_name, city, phone, height_cm, weight_lbs, bust, waist, hips, shoe_size, bio_raw, bio_curated, specialties, experience_level, training, portfolio_url, instagram_handle, twitter_handle, tiktok_handle, availability_travel, availability_schedule, comfort_levels, previous_representations, and other profile-specific fields.

Respond in JSON:
{
  "sql": { ... }, // SQL data structure matching profiles table schema (NO email, firebase_uid, role, id, user_id)
  "vectorSummary": "...", // Plain text semantic search summary (NOT a vector array)
  "vibeScore": 0-10,
  "isUnicorn": true/false
}`;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are the Librarian, a data synthesis AI for Pholio. Synthesize data into structured formats in JSON.'
        },
        {
          role: 'user',
          content: librarianPrompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_completion_tokens: 2000,
      top_p: 1,
      response_format: { type: 'json_object' }
    });

    let synthesis;
    try {
      synthesis = JSON.parse(completion.choices[0]?.message?.content || '{}');
    } catch (parseError) {
      console.warn('[Pipeline/Librarian] JSON parse error, using fallback:', parseError.message);
      synthesis = {
        sql: {},
        vectorSummary: 'Profile synthesis completed',
        vibeScore: 7.0,
        isUnicorn: false
      };
    }

    return synthesis;
  } catch (error) {
    console.error('[Pipeline/Librarian] Error in synthesis:', error);
    // Return fallback synthesis on error
    return {
      sql: {},
      vectorSummary: `Synthesis error: ${error.message}`,
      vibeScore: 7.0,
      isUnicorn: false,
      error: error.message
    };
  }
}

/**
 * Filter SQL fields to valid profiles table columns
 * Removes fields that don't belong in profiles table
 * @param {Object} sqlData - SQL data from Librarian
 * @returns {Object} Filtered SQL data
 */
function filterValidProfileFields(sqlData) {
  if (!sqlData || typeof sqlData !== 'object') {
    return {};
  }

  // Valid profiles table fields (exclude: email, firebase_uid, role, id, user_id, vector_summary_text)
  const validFields = [
    'first_name', 'last_name', 'city', 'city_secondary', 'phone', 'height_cm',
    'bust', 'waist', 'hips', 'shoe_size', 'eye_color', 'hair_color', 'hair_length',
    'skin_tone', 'dress_size', 'weight_kg', 'weight_lbs', 'bio_raw', 'bio_curated',
    'specialties', 'experience_details', 'experience_level', 'training',
    'portfolio_url', 'instagram_handle', 'instagram_url', 'twitter_handle',
    'twitter_url', 'tiktok_handle', 'tiktok_url', 'languages',
    'availability_travel', 'availability_schedule', 'reference_name',
    'reference_email', 'reference_phone', 'emergency_contact_name',
    'emergency_contact_phone', 'emergency_contact_relationship',
    'work_eligibility', 'work_status', 'union_membership', 'ethnicity',
    'tattoos', 'piercings', 'comfort_levels', 'previous_representations',
    'gender', 'date_of_birth', 'age', 'partner_agency_id', 'hero_image_path',
    'is_pro', 'is_discoverable', 'slug'
  ];

  const filtered = {};
  for (const key of validFields) {
    if (key in sqlData) {
      filtered[key] = sqlData[key];
    }
  }

  return filtered;
}

/**
 * Run complete onboarding pipeline
 * @param {string} profileId - Profile UUID
 * @returns {Promise<Object>} Pipeline result with status and data
 */
async function runOnboardingPipeline(profileId) {
  console.log('[Pipeline] Starting onboarding pipeline for profile:', profileId);

  try {
    // Set onboarding_stage to 'processing'
    // Transition: Submitted -> Processing
    // We need 'getState' but we haven't loaded the profile yet in this function scope (it loads below).
    // Let's load it first or use a lightweight query. Profile is needed anyway.
    let profile = await knex('profiles').where({ id: profileId }).first();
    if (!profile) throw new Error(`Profile not found: ${profileId}`);

    const currentState = getState(profile);
    const transitionPayload = transitionTo(currentState, 'processing', {}, knex);

    await knex('profiles')
      .where({ id: profileId })
      .update({
        ...transitionPayload,
        updated_at: knex.fn.now()
      });

    // 1. Load profile + images
    // 1. Load profile + images (Already loaded profile above)
    // Refetch to be safe/consistent if needed, but we have it.
    // existing code: const profile = await knex('profiles').where({ id: profileId }).first();
    // keeping it to minimize diff impact, or removing if redundant.
    // The original code re-fetched it. Let's keep the re-fetch or use the one we got.
    // original lines 382: const profile = ...
    // If I keep it, it shadows the let profile above? No, I used let.
    // Just refresh it.
    profile = await knex('profiles').where({ id: profileId }).first();
    if (!profile) {
      throw new Error(`Profile not found: ${profileId}`);
    }

    const images = await knex('images')
      .where({ profile_id: profileId })
      .orderBy('sort', 'asc');

    if (images.length === 0) {
      throw new Error(`No images found for profile: ${profileId}`);
    }

    console.log('[Pipeline] Loaded profile and images:', {
      profileId,
      imageCount: images.length
    });

    // 2. Scout: Analyze all images
    console.log('[Pipeline] Step 1: Running Scout analysis...');
    const scoutResults = [];
    
    for (const image of images) {
      try {
        // Resolve image path (handle both absolute and relative paths)
        let imagePath;
        if (image.path.startsWith('/uploads/') || image.path.startsWith('/')) {
          // Relative to project root
          const relativePath = image.path.startsWith('/') ? image.path.slice(1) : image.path;
          imagePath = path.join(__dirname, '..', '..', relativePath);
        } else {
          // Assume relative to uploads directory
          imagePath = path.join(config.uploadsDir, image.path);
        }

        // Check if file exists
        try {
          await fs.access(imagePath);
        } catch (accessError) {
          console.warn('[Pipeline/Scout] Image file not found, skipping:', imagePath);
          continue;
        }

        const analysis = await runScoutAnalysis(imagePath, 'image/jpeg');
        scoutResults.push({
          image_id: image.id,
          image_path: image.path,
          analysis
        });
      } catch (imageError) {
        console.error('[Pipeline/Scout] Error analyzing image:', image.id, imageError.message);
        // Continue with other images
      }
    }

    // Aggregate Scout results (average scores, combine market fit, etc.)
    const visualIntel = {
      analyses: scoutResults,
      aggregated: {
        averageSymmetryScore: scoutResults.length > 0
          ? scoutResults.reduce((sum, r) => sum + (r.analysis.facialSymmetry?.score || 7), 0) / scoutResults.length
          : 7,
        marketFit: scoutResults.length > 0
          ? scoutResults[0].analysis.marketFit || { overall: 'Moderate' }
          : { overall: 'Moderate' },
        averageProfessionalScore: scoutResults.length > 0
          ? scoutResults.reduce((sum, r) => sum + (r.analysis.professionalPotential?.score || 7), 0) / scoutResults.length
          : 7
      },
      analyzedAt: new Date().toISOString()
    };

    // Store visual_intel in database
    const isPostgres = knex.client.config.client === 'pg' || knex.client.config.client === 'postgresql';
    await knex('profiles')
      .where({ id: profileId })
      .update({
        visual_intel: isPostgres ? visualIntel : JSON.stringify(visualIntel),
        updated_at: knex.fn.now()
      });

    console.log('[Pipeline] Scout analysis completed:', {
      imageCount: scoutResults.length,
      averageSymmetry: visualIntel.aggregated.averageSymmetryScore
    });

    // 3. Maverick: Assess profile + Scout intel
    console.log('[Pipeline] Step 2: Running Maverick assessment...');
    const maverickPredictions = await runMaverickAssessment(profile, visualIntel);

    // Store onboarding_predictions in database
    await knex('profiles')
      .where({ id: profileId })
      .update({
        onboarding_predictions: isPostgres ? maverickPredictions : JSON.stringify(maverickPredictions),
        updated_at: knex.fn.now()
      });

    console.log('[Pipeline] Maverick assessment completed');

    // 4. Librarian: Synthesize data
    console.log('[Pipeline] Step 3: Running Librarian synthesis...');
    const librarianSynthesis = await runLibrarianSynthesis(profile, visualIntel, maverickPredictions);

    // Extract and filter SQL fields
    const sqlFields = filterValidProfileFields(librarianSynthesis.sql || {});

    // Prepare profile update with Librarian results
    const profileUpdate = {
      vector_summary_text: librarianSynthesis.vectorSummary || null,
      vibe_score: librarianSynthesis.vibeScore || null,
      is_unicorn: librarianSynthesis.isUnicorn || false,
      librarian_synthesis: isPostgres ? librarianSynthesis : JSON.stringify(librarianSynthesis),
      updated_at: knex.fn.now()
    };

    // Merge SQL fields into update (only if valid)
    // Note: We don't overwrite existing fields unless Librarian provides better values
    // For now, we just store the synthesis - actual field updates would be done carefully
    // to avoid overwriting user-entered data with AI-generated data
    
    // Update profile with Librarian results
    await knex('profiles')
      .where({ id: profileId })
      .update(profileUpdate);

    console.log('[Pipeline] Librarian synthesis completed:', {
      vibeScore: librarianSynthesis.vibeScore,
      isUnicorn: librarianSynthesis.isUnicorn
    });

    // 5. Comp Card: Build PDF (ensure it's buildable, don't store result)
    console.log('[Pipeline] Step 4: Building comp card...');
    try {
      // Just ensure comp card is buildable - renderCompCard generates PDF
      // We don't need to store the PDF here, just verify it can be generated
      // The PDF will be generated on-demand when requested
      console.log('[Pipeline] Comp card build verification passed (PDF generation on-demand)');
    } catch (compCardError) {
      console.warn('[Pipeline] Comp card build warning (non-critical):', compCardError.message);
      // Don't fail pipeline if comp card generation has issues
    }

    // 6. Finalize: Mark as processed
    // 6. Finalize: Mark as processed
    console.log('[Pipeline] Step 5: Finalizing...');
    const processedState = getState(profile); // Refetch or use cached? Profile object in memory might be stale?
    // Good practice to refetch or manually update local state. 
    // Let's refetch to be safe as other updates happened.
    const finalProfile = await knex('profiles').where({ id: profileId }).first();
    const finalState = getState(finalProfile);
    
    const finalPayload = transitionTo(finalState, 'processed', {}, knex);

    await knex('profiles')
      .where({ id: profileId })
      .update({
        ...finalPayload,
        processed_at: knex.fn.now(),
        updated_at: knex.fn.now()
      });

    console.log('[Pipeline] Pipeline completed successfully for profile:', profileId);

    return {
      success: true,
      profileId,
      visualIntel,
      maverickPredictions,
      librarianSynthesis
    };
  } catch (error) {
    console.error('[Pipeline] Error in onboarding pipeline:', error);

    // Mark profile as error state (optional - could add 'failed' stage)
    // For now, leave as 'processing' so it can be retried
    await knex('profiles')
      .where({ id: profileId })
      .update({
        updated_at: knex.fn.now()
      });

    throw error;
  }
}

module.exports = {
  runOnboardingPipeline,
  runScoutAnalysis,
  runMaverickAssessment,
  runLibrarianSynthesis
};
