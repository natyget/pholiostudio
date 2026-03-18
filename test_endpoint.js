const knex = require('./src/db/knex');
const { calculateProfileCompleteness } = require('./src/lib/dashboard/completeness');
const { checkEssentialsComplete } = require('./src/lib/onboarding/essentials-check');
const { getCurrentStep, getState } = require('./src/lib/onboarding/state-machine');
const { toFeetInches } = require('./src/lib/profile-helpers');
const { getDefaultTheme, getAllThemes, getFreeThemes, getProThemes } = require('./src/lib/themes');

async function run() {
  const profile = await knex('profiles').where({ id: '64972b29-b4f8-4581-a5b2-9fd5976944bf' }).first();
  const user = await knex('users').where({ id: profile.user_id }).first();
  
  const response = {
    user: { id: user.id, email: user.email, role: user.role },
    profile: null,
    images: [],
    completeness: null,
    subscription: { status: 'active', isPro: false, trialDaysRemaining: 0 },
    themes: { all: getAllThemes(), free: getFreeThemes(), pro: getProThemes(), current: getDefaultTheme() },
    shareUrl: null
  };
  
  response.profile = profile;
  if (response.profile.date_of_birth) {
    const d = new Date(response.profile.date_of_birth);
    if (!isNaN(d.getTime())) {
      response.profile.date_of_birth = d.toISOString().split('T')[0];
    }
  }
  
  if (response.profile.bust_cm) response.profile.bust = response.profile.bust_cm;
  if (response.profile.waist_cm) response.profile.waist = response.profile.waist_cm;
  if (response.profile.hips_cm) response.profile.hips = response.profile.hips_cm;
  
  const images = await knex('images').where({ profile_id: profile.id }).orderBy('sort', 'asc').select('id', 'path', 'label as kind', 'created_at');
  response.images = images.map(img => ({ ...img, path: img.path }));
  
  const profileForCompleteness = { ...profile, email: profile.email || user.email || null };
  const completeness = calculateProfileCompleteness(profileForCompleteness, images);
  response.completeness = completeness;
  
  response.subscription.isPro = profile.is_pro || false;
  response.themes.current = profile.pdf_theme || getDefaultTheme();
  response.shareUrl = `http://localhost:3000/portfolio/${profile.slug}`;
  
  if (profile.height_cm) {
    response.profile.height_display = toFeetInches(profile.height_cm);
  }
  
  const essentialsCheck = checkEssentialsComplete(profile, images);
  const isOnboardingComplete = !!profile.onboarding_completed_at;
  
  response.onboarding = {
    isComplete: isOnboardingComplete,
    stage: getCurrentStep(profile),
    state: getState(profile),
    essentials: essentialsCheck,
    canGenerateCompCard: isOnboardingComplete && essentialsCheck.ok,
    canApplyToAgencies: isOnboardingComplete && essentialsCheck.ok,
    canPublishPortfolio: isOnboardingComplete && essentialsCheck.ok
  };
  
  console.log("SUCCESS!");
  process.exit(0);
}

run().catch(e => { console.error("FAILED:", e); process.exit(1); });
