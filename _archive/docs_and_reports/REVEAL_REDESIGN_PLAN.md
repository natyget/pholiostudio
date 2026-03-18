# Personalized Reveal Redesign Plan
**The 3-Screen Architecture: Onboarding → Reveal → Dashboard**

## Problem Analysis

### Current Failure Mode

1. **Single-Page Congestion**
   - Reveal is just another stage in the scrolling container
   - No sense of separation between "The Work" (onboarding) and "The Reward" (reveal)
   - Stats appear like a receipt, not a presentation

2. **Aesthetic Issues**
   - Orange placeholder blocks clash with Obsidian/Gold branding
   - Low scores (e.g., 5/100) shown without context or celebration
   - Feels like a form, not a luxury experience

3. **UX Friction**
   - No cinematic transition from onboarding to reveal
   - User sees "failing grade" immediately without celebration
   - Reveal doesn't feel like a reward moment

## Solution: 3-Screen Architecture

### Phase 1: Onboarding (Stages 0-4)
- **Purpose:** Data collection (The Work)
- **UI:** Scrolling chat interface, Maverick conversation
- **Exit:** "The Slam" - Screen blurs, fade to black, cinematic audio cue

### Phase 2: The Reveal (Full-Screen Overlay)
- **Purpose:** Cinematic stat visualization (The Reward)
- **UI:** Full-screen overlay with sequential card reveals
- **Structure:**
  - Card 1: Model Score (full-screen, animated gauge)
  - Card 2: Proportions Analysis (full-screen radar)
  - Card 3: Comp Card Preview + "Finish Profile" button
- **Transition:** "The Unfold" - GSAP sequenced animations

### Phase 3: The Landing (Dashboard)
- **Purpose:** Utility and management
- **UI:** Standard dashboard interface
- **Entry:** "The Entry" - Final wipe transition after reveal completion

## Technical Implementation

### 1. Full-Screen Reveal Wrapper

Instead of `PersonalizedRevealStage` being a stage component, create a **full-screen overlay** that:

```jsx
// New component structure
function RevealOverlay({ isActive, onComplete }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [revealData, setRevealData] = useState(null);
  
  // Cards: 0 = Score, 1 = Radar, 2 = Comp Card Preview
  // GSAP animations between cards
  // Full-screen, z-index: 9999, covers entire viewport
}
```

### 2. Stage 5 Trigger Logic

**Current:** Stage 5 renders PersonalizedRevealStage component
**New:** Stage 5 triggers `isRevealing: true` state, which shows RevealOverlay

```jsx
// In ApplyCinematic component
const [isRevealing, setIsRevealing] = useState(false);

// When Stage 4 completes and Maverick says "continue" to Stage 5
if (response.stage === 5) {
  // Trigger "The Slam" transition
  setIsRevealing(true);
  // Hide onboarding UI
  setShowOnboarding(false);
}
```

### 3. Sequential Card Reveals

**Card 1: Model Score (Full-Screen)**
- Full viewport height/width
- Animated gauge in center
- Score breakdown below
- "Continue" button advances to Card 2
- Celebration animation for ANY score (not just 100%)

**Card 2: Proportions Analysis (Full-Screen)**
- Full viewport height/width
- Radar chart in center
- Market tags displayed
- "Continue" button advances to Card 3

**Card 3: Comp Card Preview (Full-Screen)**
- Hero image as comp card preview
- Bio preview
- Action plan
- "Finish Profile" button (triggers finalization)

### 4. Transitions

**"The Slam" (Onboarding → Reveal):**
```css
.onboarding-exit {
  animation: slamToBlack 0.8s ease-in forwards;
}

@keyframes slamToBlack {
  0% { opacity: 1; filter: blur(0px); }
  50% { filter: blur(20px); }
  100% { opacity: 0; }
}
```

**"The Unfold" (Between Cards):**
```jsx
// GSAP timeline for card transitions
gsap.timeline()
  .to(currentCard, { opacity: 0, scale: 0.95, duration: 0.4 })
  .to(nextCard, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" });
```

**"The Entry" (Reveal → Dashboard):**
- After "Finish Profile" clicked
- Call `/api/chat/finalize`
- Wipe transition to dashboard
- `window.location.href = '/dashboard/talent'`

### 5. Celebration Animation

**Problem:** Low scores (5/100) feel like failure
**Solution:** Every score gets a celebration, but with different intensity:

```jsx
// Score-based celebration
if (score >= 90) {
  // Triple confetti burst
  confetti({ particleCount: 200, spread: 90 });
} else if (score >= 70) {
  // Double confetti burst
  confetti({ particleCount: 150, spread: 70 });
} else {
  // Single confetti burst (even for low scores)
  confetti({ particleCount: 100, spread: 50, colors: ['#C9A55A'] });
}
```

### 6. State Management

**New State Variables:**
- `isRevealing: boolean` - Controls reveal overlay visibility
- `revealCardIndex: number` - Current card (0-2)
- `showOnboarding: boolean` - Controls onboarding UI visibility

**Stage Flow:**
- Stages 0-4: Normal onboarding (showOnboarding: true, isRevealing: false)
- Stage 5: Trigger reveal (showOnboarding: false, isRevealing: true)
- Reveal Complete: Finalize and redirect to dashboard

## File Structure Changes

### New Files:
```
views/apply/
  └── reveal-overlay.ejs (or component in index-cinematic.ejs)
```

### Modified Files:
```
views/apply/index-cinematic.ejs
  - Add isRevealing state
  - Add RevealOverlay component
  - Remove PersonalizedRevealStage from stage switch
  - Update Stage 5 logic to trigger reveal

public/styles/apply-cinematic.css
  - Add .reveal-overlay styles (full-screen, z-index: 9999)
  - Add .reveal-card styles (full-screen cards)
  - Add slamToBlack animation
  - Add card transition animations
```

## Implementation Steps

### Phase 1: Create Reveal Overlay Component
1. Extract PersonalizedRevealStage logic
2. Create full-screen overlay wrapper
3. Break into 3 sequential cards
4. Add card navigation (Next button)

### Phase 2: Update Stage Flow Logic
1. Add `isRevealing` state to ApplyCinematic
2. Modify Stage 5 trigger to set `isRevealing: true`
3. Hide onboarding UI when revealing
4. Add "The Slam" transition

### Phase 3: Card Implementations
1. Card 1: Model Score (full-screen, animated)
2. Card 2: Proportions Radar (full-screen, animated)
3. Card 3: Comp Card Preview + Finish button

### Phase 4: Transitions & Animations
1. "The Slam" (onboarding exit)
2. "The Unfold" (card transitions)
3. Celebration animations (all scores)
4. "The Entry" (dashboard redirect)

### Phase 5: Finalization Logic
1. Move finalization to Card 3 "Finish Profile" button
2. Update Stage 7 logic (or remove if not needed)
3. Add loading state during finalization
4. Redirect to dashboard after completion

## Design Specifications

### Reveal Overlay
- Position: `fixed`, top: 0, left: 0, width: 100vw, height: 100vh
- Z-index: 9999 (above everything)
- Background: `#050505` (Obsidian)
- Overflow: hidden (no scrolling)

### Reveal Cards
- Position: `absolute`, full viewport
- Display: flex, center content
- Transition: GSAP opacity + scale animations
- Padding: 5% viewport

### Typography
- Score Display: `clamp(4rem, 8vw, 6rem)` - Massive, celebratory
- Card Titles: `clamp(2rem, 4vw, 3rem)` - Bold, cinematic
- Body Text: `clamp(1rem, 2vw, 1.25rem)` - Readable, elegant

### Colors
- Background: `#050505` (Obsidian)
- Text: `#FAF9F7` (Stone-50)
- Accent: `#C9A55A` (Pholio Gold)
- No orange placeholders - use subtle gray or gold accents

## Success Criteria

1. ✅ Reveal feels like a separate experience (not part of onboarding)
2. ✅ Full-screen cards create cinematic presentation
3. ✅ Smooth transitions between cards
4. ✅ Every score gets celebration (no "failing grade" feeling)
5. ✅ Clear progression: Card 1 → Card 2 → Card 3 → Dashboard
6. ✅ No scrolling - each card is self-contained
7. ✅ "Finish Profile" only appears on final card

## Timeline Estimate

- **Phase 1-2:** 1-2 days (Overlay + Stage logic)
- **Phase 3:** 1 day (Card implementations)
- **Phase 4:** 1 day (Animations & transitions)
- **Phase 5:** 0.5 days (Finalization logic)

**Total: 3.5-4.5 days**



