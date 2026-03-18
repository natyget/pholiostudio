# Reveal Frontend Refactor - Implementation Plan

## Status: Backend Complete ✅

1. ✅ **Calculations Fixed** - Industry standards, Scout-based tags, 40/30/30 split
2. ✅ **Synthesis Trigger** - Reveal endpoint triggers synthesis if needed

## Frontend Refactor Required

### Current Architecture
- `PersonalizedRevealStage` is a stage component (case 5 in renderStage)
- Renders in scrolling `.chat-container`
- Shows all elements at once with staggered animations

### Target Architecture
- `RevealOverlay` is a full-screen overlay (z-index: 9999)
- Separate state: `isRevealing` (boolean)
- Orchestrated sequence: Hero (0-1s) → Score (1-2s) → Radar (2-3s) → Button (3s+)
- Onboarding UI hidden when `isRevealing === true`

## Implementation Steps

### Step 1: Create RevealOverlay Component
- Extract logic from `PersonalizedRevealStage`
- Make it full-screen (position: fixed, z-index: 9999)
- Start with all elements hidden (opacity: 0)

### Step 2: Add State Management
- Add `isRevealing` state to `ApplyCinematic`
- Add `showOnboarding` state (default: true)
- Update render logic to conditionally show onboarding vs reveal

### Step 3: Update Stage Flow
- Remove case 5 (PersonalizedRevealStage) from renderStage
- When Stage 4/6 completes with action: 'continue' and stage: 5, set `isRevealing: true`
- Hide onboarding UI when revealing

### Step 4: Implement Orchestrated Animations
- GSAP timeline: Hero (0-1s) → Score (1-2s) → Radar (2-3s) → Button (3s+)
- Each element starts hidden, animates in sequence
- Celebration animation for ALL scores (varying intensity)

### Step 5: Update CSS
- Add `.reveal-overlay` styles (full-screen, fixed positioning)
- Add `.onboarding-exit` animation ("The Slam" - blur + fade to black)
- Update reveal card styles for full-screen presentation

## Key Files to Modify

1. `views/apply/index-cinematic.ejs`
   - Add `isRevealing` and `showOnboarding` states
   - Create `RevealOverlay` component
   - Update `renderStage` (remove case 5)
   - Update `handleMaverickMessage` (detect reveal trigger)
   - Update main render (conditionally show onboarding/reveal)

2. `public/styles/apply-cinematic.css`
   - Add `.reveal-overlay` styles
   - Add `.onboarding-exit` animation
   - Update reveal card styles for full-screen

## Decision Points

### When to Trigger Reveal?
**Option A:** When Maverick returns `stage: 5` and `action: 'continue'`
- Pros: Simple, aligns with current flow
- Cons: Requires Maverick to explicitly set stage 5

**Option B:** When Stage 4/6 completes (regardless of stage value)
- Pros: More flexible
- Cons: Requires detecting "completion" state

**Recommended: Option A** - Simpler and more explicit

### Stage 7 Removal?
**Current:** Stage 7 is FinalizationStage
**Options:**
1. Keep Stage 7 for backward compatibility
2. Remove Stage 7, finalization happens after reveal
3. Rename Stage 7 to "Completion" or merge with reveal

**Recommended: Option 1** - Keep for now, can refactor later

## Testing Checklist

- [ ] Reveal overlay appears full-screen (covers entire viewport)
- [ ] Onboarding UI is hidden when revealing
- [ ] Animation sequence: Hero → Score → Radar → Button
- [ ] Celebration animation works for all scores
- [ ] "Go to Dashboard" button redirects correctly
- [ ] Back button/navigation doesn't break
- [ ] Mobile responsive (full-screen works on mobile)
- [ ] Synthesis triggers before reveal (backend check)



