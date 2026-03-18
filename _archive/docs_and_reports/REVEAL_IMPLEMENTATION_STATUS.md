# Reveal Implementation Status

## ✅ Completed

### Backend Calculations Fixed

1. **`generateRadarData()`** - Industry-Standard Normalization
   - Uses ideal proportions: 175-180cm height, 32-34" bust, 24-26" waist, 34-36" hips, US 8-9 shoe
   - Perfect match = 100, within ideal range = 80-100, outside = 0-80
   - Normalized against high-fashion runway standards

2. **`generateMarketTags()`** - Scout-Based Analysis
   - "Runway Viable" - High-fashion proportions + facial symmetry ≥ 8
   - "Commercial Strong" - Commercial proportions + market fit ≥ 7
   - "Editorial Fit" - Facial symmetry ≥ 7.5 + height ≥ 170cm
   - Uses Scout's visual analysis (facialSymmetryScore, marketFitScore)

3. **`calculateModelScore()`** - 40/30/30 Split
   - 40 points: Profile Completeness (unchanged)
   - 30 points: Proportion Balance (uses radar normalization)
   - 30 points: Photo Quality (uses Scout's visual analysis, not just image count)

## 🔄 In Progress

### Trigger Librarian Synthesis BEFORE Reveal

**Current:** Synthesis triggered at Stage 7 (`action === 'complete'`)
**Target:** Synthesis triggered when reveal is requested (before Stage 5/reveal)

**Implementation Options:**

**Option A: Trigger in `/api/chat/reveal` endpoint**
- When reveal endpoint is called, check if synthesis exists
- If not, trigger synthesis, then return reveal data
- Pros: Simple, self-contained
- Cons: Reveal endpoint becomes slower (synthesis is async)

**Option B: Trigger when Stage 4/6 completes**
- Detect "reveal ready" intent in `/api/chat`
- Trigger synthesis immediately
- Return `action: 'reveal'` to frontend
- Pros: Cleaner separation, synthesis happens before reveal request
- Cons: More complex logic in chat endpoint

**Option C: Hybrid - Trigger in reveal endpoint with caching**
- Reveal endpoint checks for synthesis in session
- If not present, trigger synthesis and cache result
- Return reveal data
- Pros: Flexible, handles edge cases
- Cons: More complex

**Recommended: Option A** (simplest, most reliable)

## 📋 Pending

### 1. Separate Reveal Route/State

**Current:** Stage 5 component in scrolling container
**Target:** Full-screen overlay, separate state

**Changes Needed:**
- Add `isRevealing` state to `ApplyCinematic`
- Create `RevealOverlay` component (full-screen, z-index: 9999)
- Hide onboarding UI when `isRevealing === true`
- Remove `PersonalizedRevealStage` from stage switch
- Update Stage 4/6 completion to trigger reveal state

**Files to Modify:**
- `views/apply/index-cinematic.ejs` - Add reveal state, overlay component
- `public/styles/apply-cinematic.css` - Add reveal overlay styles

### 2. Orchestrated Animation Sequence

**Target Timeline:**
- 0-1s: Hero Image fades in
- 1-2s: Model Score gauge animates from 0 to calculated value
- 2-3s: Radar chart "blooms" into calculated shape
- 3s+: "Go to Dashboard" button fades in

**Implementation:**
- Use GSAP timeline for sequenced animations
- Each element starts hidden (`opacity: 0`, `scale: 0.95`)
- Animate in sequence with staggered delays
- Smooth transitions between states

### 3. Update Stage Flow Logic

**Current:**
- Stage 4/6 → Stage 5 (PersonalizedRevealStage component)
- Stage 7 → Finalization → Dashboard

**Target:**
- Stage 4/6 → Trigger synthesis → Reveal state (full-screen overlay)
- Reveal complete → Dashboard (no Stage 7)

**Changes Needed:**
- Modify `/api/chat` to detect reveal readiness
- Return `action: 'reveal'` instead of `stage: 5`
- Frontend sets `isRevealing: true` on `action: 'reveal'`
- Remove Stage 7 finalization (happens after reveal)

## Implementation Priority

1. ✅ **Backend Calculations** (DONE)
2. 🔄 **Trigger Synthesis Before Reveal** (IN PROGRESS)
3. 📋 **Separate Reveal State** (PENDING)
4. 📋 **Orchestrated Animations** (PENDING)
5. 📋 **Update Stage Flow** (PENDING)

## Next Steps

1. Update `/api/chat/reveal` to trigger synthesis if needed
2. Create `RevealOverlay` component (full-screen)
3. Add `isRevealing` state to `ApplyCinematic`
4. Implement GSAP animation timeline
5. Update Stage 4/6 completion logic
6. Remove Stage 7 (or keep for backward compatibility)



