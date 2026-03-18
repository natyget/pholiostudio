# Reveal Calculations & Architecture Fix

## Problem Analysis

1. **Librarian synthesis happens at Stage 7, but reveal can be shown at Stage 4+**
   - Reveal endpoint is called before synthesis
   - Calculations use incomplete/default data

2. **Calculations don't use industry standards**
   - Radar chart normalizes 0-100 but not against ideal proportions
   - Market tags are static, don't use Scout's visual analysis
   - Model Score calculation exists but needs verification

3. **Reveal is a scrolling stage, not a separate route/state**
   - Should be full-screen overlay
   - Should trigger after Stage 4/6 completion
   - Should have orchestrated animation sequence

## Implementation Plan

### Phase 1: Fix Calculations (Industry Standards)

#### Model Score (40/30/30 Split)
- **40 points**: Profile Completeness (already correct)
- **30 points**: Proportion Balance against industry averages (needs improvement)
- **30 points**: Visual Intel quality from Scout (currently just photo count, needs Scout analysis)

#### Proportions Radar (Industry-Standard Normalization)
**High-Fashion Runway Standard:**
- Height: 175-180cm (5'9" - 5'11") = Ideal center (100%)
- Bust: 32-34" = Ideal center (100%)
- Waist: 24-26" = Ideal center (100%)
- Hips: 34-36" = Ideal center (100%)
- Shoe: US 8-9 = Ideal center (100%)

Normalize against these ideal ranges, not arbitrary min/max.

#### Market Tags (Scout-Based)
Use Scout's visual analysis to assign:
- "Runway Viable" - if Scout detects high-fashion proportions + facial symmetry ≥ 8
- "Commercial Strong" - if Scout detects commercial proportions + market fit ≥ 7
- "Editorial Fit" - if Scout detects editorial potential + facial symmetry ≥ 7.5

### Phase 2: Trigger Librarian Synthesis BEFORE Reveal

**Current:** Synthesis at Stage 7
**New:** Synthesis when Stage 4/6 completes and user is ready for reveal

1. Modify `/api/chat` to detect "finalize" intent at Stage 4/6
2. Trigger Librarian synthesis immediately
3. Return reveal-ready response
4. Frontend transitions to reveal state

### Phase 3: Separate Reveal Route/State

**Current:** Stage 5 component in scrolling container
**New:** Full-screen overlay triggered by state change

1. Add `isRevealing` state to ApplyCinematic
2. When Stage 4/6 completes → set `isRevealing: true`
3. Hide onboarding UI, show reveal overlay
4. Reveal overlay is full-screen, z-index: 9999

### Phase 4: Orchestrated Animation Sequence

**Timeline:**
- 0-1s: Hero Image fades in
- 1-2s: Model Score gauge animates from 0 to calculated value
- 2-3s: Radar chart "blooms" into calculated shape
- 3s+: "Go to Dashboard" button fades in

**Implementation:**
- Use GSAP timeline for sequenced animations
- Each element starts hidden, animates in sequence
- Smooth transitions between states

## Code Changes

### 1. Fix `generateRadarData()` - Industry Standard Normalization

```javascript
// Industry-standard "ideal" proportions for high-fashion runway
const IDEAL_PROPORTIONS = {
  height: { min: 175, max: 180, center: 177.5 }, // cm
  bust: { min: 32, max: 34, center: 33 }, // inches
  waist: { min: 24, max: 26, center: 25 }, // inches
  hips: { min: 34, max: 36, center: 35 }, // inches
  shoe: { min: 8, max: 9, center: 8.5 } // US size
};

function generateRadarData(profile) {
  if (!profile) {
    return {
      labels: ['Height', 'Bust', 'Waist', 'Hips', 'Shoe'],
      values: [0, 0, 0, 0, 0]
    };
  }

  // Calculate deviation from ideal, normalize to 0-100
  // Closer to ideal = higher score (100 = perfect match)
  
  const heightValue = calculateDeviationScore(
    profile.height_cm,
    IDEAL_PROPORTIONS.height.center,
    IDEAL_PROPORTIONS.height.min,
    IDEAL_PROPORTIONS.height.max
  );
  
  const bustValue = calculateDeviationScore(
    parseFloat(profile.bust),
    IDEAL_PROPORTIONS.bust.center,
    IDEAL_PROPORTIONS.bust.min,
    IDEAL_PROPORTIONS.bust.max
  );
  
  // ... similar for waist, hips, shoe
  
  return {
    labels: ['Height', 'Bust', 'Waist', 'Hips', 'Shoe'],
    values: [heightValue, bustValue, waistValue, hipsValue, shoeValue]
  };
}

function calculateDeviationScore(value, ideal, min, max) {
  if (!value) return 0;
  
  // Perfect match = 100
  if (value === ideal) return 100;
  
  // Within ideal range = 80-100
  if (value >= min && value <= max) {
    const range = max - min;
    const distanceFromCenter = Math.abs(value - ideal);
    return 100 - (distanceFromCenter / (range / 2)) * 20;
  }
  
  // Outside ideal range, calculate penalty
  const distanceFromRange = value < min ? min - value : value - max;
  const penaltyRange = (max - min) * 2; // 2x the ideal range
  const penalty = Math.min(80, (distanceFromRange / penaltyRange) * 80);
  
  return Math.max(0, 80 - penalty);
}
```

### 2. Fix `generateMarketTags()` - Scout-Based

```javascript
function generateMarketTags(profile, scoutAnalysis = null) {
  const tags = [];
  
  if (!profile) return tags;

  // Use Scout's visual analysis if available
  const facialSymmetry = scoutAnalysis?.analysis?.facialSymmetryScore || 0;
  const marketFit = scoutAnalysis?.analysis?.marketFitScore || 0;
  
  // Runway Viable: High-fashion proportions + high facial symmetry
  const hasRunwayProportions = profile.height_cm >= 175 && 
    profile.waist && parseFloat(profile.waist) <= 26 &&
    profile.bust && parseFloat(profile.bust) >= 32 && parseFloat(profile.bust) <= 34;
  
  if (hasRunwayProportions && facialSymmetry >= 8) {
    tags.push('Runway Viable');
  }
  
  // Commercial Strong: Commercial proportions + good market fit
  const hasCommercialProportions = profile.bust && profile.waist && profile.hips &&
    parseFloat(profile.bust) >= 30 && parseFloat(profile.bust) <= 38 &&
    parseFloat(profile.waist) >= 24 && parseFloat(profile.waist) <= 30;
  
  if (hasCommercialProportions && marketFit >= 7) {
    tags.push('Commercial Strong');
  }
  
  // Editorial Fit: Strong facial symmetry + editorial proportions
  if (facialSymmetry >= 7.5 && profile.height_cm >= 170) {
    tags.push('Editorial Fit');
  }
  
  // Default if no tags
  if (tags.length === 0) {
    tags.push('Emerging Talent');
  }
  
  return tags;
}
```

### 3. Fix `calculateModelScore()` - Use Scout Visual Intel for Photo Quality

```javascript
function calculateModelScore(profile, images = [], onboardingData = {}) {
  // 1. Completeness Score (0-40 points) - unchanged
  const completeness = calculateProfileCompleteness(profile, images);
  const completenessScore = Math.round((completeness.percentage / 100) * 40);

  // 2. Proportions Balance Score (0-30 points) - use industry standards
  let proportionsScore = 0;
  if (profile.height_cm && profile.bust && profile.waist && profile.hips) {
    // Calculate deviation from ideal proportions (same logic as radar)
    const radarData = generateRadarData(profile);
    const avgRadarScore = radarData.values.reduce((a, b) => a + b, 0) / radarData.values.length;
    proportionsScore = Math.round((avgRadarScore / 100) * 30);
  }

  // 3. Photo Quality Score (0-30 points) - use Scout's visual analysis
  let photoScore = 0;
  const scoutAnalysis = onboardingData.visualIntel || null;
  
  if (scoutAnalysis?.analysis) {
    // Base score from Scout's analysis
    const facialSymmetry = scoutAnalysis.analysis.facialSymmetryScore || 0;
    const marketFit = scoutAnalysis.analysis.marketFitScore || 0;
    const scoutScore = ((facialSymmetry + marketFit) / 2) / 10; // Normalize to 0-1
    photoScore = Math.round(scoutScore * 25); // 0-25 points from Scout
    
    // Bonus for image count
    const imageCount = Array.isArray(images) ? images.length : 0;
    if (imageCount >= 3) photoScore += 5; // +5 points for 3+ images
  } else {
    // Fallback to image count if no Scout analysis
    const imageCount = Array.isArray(images) ? images.length : 0;
    if (imageCount >= 6) photoScore = 30;
    else if (imageCount >= 4) photoScore = 25;
    else if (imageCount >= 2) photoScore = 20;
    else if (imageCount >= 1) photoScore = 15;
  }
  
  photoScore = Math.min(photoScore, 30);

  const totalScore = Math.min(completenessScore + proportionsScore + photoScore, 100);
  
  return {
    modelScore: totalScore,
    scoreBreakdown: {
      completeness: completenessScore,
      proportions: proportionsScore,
      photoQuality: photoScore
    }
  };
}
```

### 4. Trigger Synthesis Before Reveal

Modify `/api/chat` to detect reveal readiness and trigger synthesis:

```javascript
// In POST /api/chat route
if (currentStage === 4 || currentStage === 6) {
  // Check if user is ready for reveal (Maverick says "continue" to reveal)
  if (responseData.action === 'continue' && responseData.stage === 5) {
    // Trigger Librarian synthesis NOW (not at Stage 7)
    await triggerLibrarianSynthesis(req.session.onboardingData, userId, req);
    
    // Set stage to 5 (reveal stage)
    req.session.currentStage = 5;
    
    // Return reveal-ready response
    return res.json({
      message: responseData.message,
      stage: 5,
      action: 'reveal', // New action type
      revealReady: true
    });
  }
}
```

### 5. Frontend: Separate Reveal State

In `ApplyCinematic` component:

```javascript
const [isRevealing, setIsRevealing] = useState(false);
const [showOnboarding, setShowOnboarding] = useState(true);

// When Maverick responds with action: 'reveal'
if (response.action === 'reveal') {
  setIsRevealing(true);
  setShowOnboarding(false);
  // Trigger "The Slam" transition
}

// Render logic
return (
  <>
    {showOnboarding && (
      <div className="onboarding-container">
        {/* Existing stages */}
      </div>
    )}
    {isRevealing && (
      <RevealOverlay onComplete={handleRevealComplete} />
    )}
  </>
);
```

### 6. Orchestrated Animation Sequence

In `RevealOverlay` component:

```javascript
useEffect(() => {
  if (!revealData) return;
  
  const timeline = gsap.timeline();
  
  // 0-1s: Hero Image
  timeline.to('.reveal-hero-image', {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: 'power2.out'
  });
  
  // 1-2s: Model Score
  timeline.to('.reveal-score-gauge', {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: 'power2.out'
  }, '-=0.3'); // Start slightly before hero finishes
  
  // Animate gauge fill
  timeline.to('.gauge-fill', {
    '--gauge-progress': `${revealData.modelScore}%`,
    duration: 1,
    ease: 'power2.out'
  }, '-=0.7');
  
  // 2-3s: Radar Chart
  timeline.to('.reveal-radar-chart', {
    opacity: 1,
    scale: 1,
    duration: 1,
    ease: 'power2.out'
  }, '-=0.3');
  
  // 3s+: Button
  timeline.to('.reveal-button', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.3');
  
}, [revealData]);
```

## Implementation Order

1. ✅ Fix calculations (generateRadarData, generateMarketTags, calculateModelScore)
2. ✅ Update reveal endpoint to trigger synthesis if needed
3. ✅ Create RevealOverlay component (full-screen)
4. ✅ Update ApplyCinematic to use reveal state
5. ✅ Implement orchestrated animations
6. ✅ Test end-to-end flow



