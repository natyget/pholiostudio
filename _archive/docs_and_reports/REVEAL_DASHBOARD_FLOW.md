# Reveal Dashboard Flow - Complete Implementation

## Overview
After Stage 6 (Additional Details) is completed, Maverick triggers a cinematic **Reveal Dashboard** that showcases the user's profile potential with animated charts, scores, and market analysis.

---

## Flow Sequence

### 1. Stage 6 Completion
After user completes Stage 6 (Additional Details), Maverick responds with:

```
"Everything calibrated, [FirstName]. Let me reveal your Pholio potential."
```

**Backend Logic** (`src/routes/chat.js`):
- Maverick sets `action: "continue"` at Stage 6 completion
- Backend detects Stage 6 + continue action → modifies response to `action: "reveal"`
- Frontend receives `action: "reveal"` → triggers transition to Reveal Dashboard

---

## 2. Frontend Transition

**Onboarding Exit Animation** ("The Slam"):
```css
@keyframes slamToBlack {
  0% { opacity: 1; filter: blur(0px); }
  50% { filter: blur(20px); }
  100% { opacity: 0; filter: blur(20px); }
}
```
- Duration: **0.8s**
- Onboarding UI fades out with blur effect
- Background transitions to pure black (#050505)

---

## 3. Reveal Overlay - Full Screen Cards

The Reveal Dashboard consists of **3 full-screen cards** that transition sequentially:

### Card 1: Model Score Gauge
**Content:**
- Large gauge chart (Chart.js doughnut, 180° arc)
- Model Score number (0-100) with gold gradient shimmer
- Score breakdown:
  - Completeness (0-40 points)
  - Proportions (0-30 points)
  - Photo Quality (0-30 points)

**Animations:**
1. Fade in card with blur (0.8s)
2. Gauge animates fill (1.5s, easeOutQuart)
3. Score number shimmers continuously
4. Breakdown items fade in with stagger

**CSS Highlights:**
```css
.reveal-gauge-number {
  animation: goldShimmer 3s ease-in-out infinite;
}

.reveal-score-card-full::before {
  animation: shimmerReveal 3s ease-in-out infinite;
}
```

---

### Card 2: Radar Chart + Market Tags
**Content:**
- Radar chart showing proportions (Height, Bust, Waist, Hips, Shoe)
- Market potential tags (e.g., "Runway Viable", "Commercial Strong")

**Animations:**
1. Card fades in (0.6s)
2. Radar chart draws in line-by-line (1.5s)
3. Each axis gets gold glow effect
4. Market tags fade in with pulse (staggered: 0.1s, 0.2s, 0.3s, 0.4s)

**CSS Highlights:**
```css
.reveal-tag {
  animation: tagFadeIn 0.6s ease-out forwards;
}

.reveal-tag:nth-child(1) { animation-delay: 0.1s; }
.reveal-tag:nth-child(2) { animation-delay: 0.2s; }
/* ... */
```

---

### Card 3: Comp Card Preview + Action Plan
**Content:**
- Hero image with overlay (3:4 aspect ratio)
- AI-curated bio preview
- Action plan bullets (next steps for user)
- Final CTA: **"Enter Dashboard"** with gold shimmer

**Animations:**
1. Hero image crossfades in with subtle zoom (0.6s)
2. Bio preview fades up (0.5s delay)
3. Action plan bullets stagger in (0.1s, 0.2s, 0.3s, 0.4s, 0.5s)
4. CTA button shimmers continuously

**CSS Highlights:**
```css
.reveal-comp-action-item {
  animation: actionItemSlideIn 0.5s ease-out forwards;
}

.reveal-gold-shimmer {
  animation: goldButtonShimmer 3s ease-in-out infinite;
}
```

---

## 4. Backend API Endpoints

### `/api/chat/reveal` (POST)
**Purpose:** Fetch reveal data for frontend

**Required Stage:** Minimum Stage 4 (Professional Profile)

**Response Structure:**
```json
{
  "success": true,
  "firstName": "Leul",
  "modelScore": 87,
  "scoreBreakdown": {
    "completeness": 35,
    "proportions": 28,
    "photoQuality": 24
  },
  "radarData": {
    "labels": ["Height", "Bust", "Waist", "Hips", "Shoe"],
    "values": [92, 85, 90, 88, 75]
  },
  "marketTags": ["Runway Viable", "Editorial Fit"],
  "bioPreview": "AI-curated bio text...",
  "heroImage": "/uploads/hero-image.jpg",
  "actionPlan": [
    "Add 3 more photos to complete your portfolio",
    "Complete social links for better discoverability",
    "Add professional references"
  ]
}
```

**Triggers Librarian Synthesis:**
- If `_synthesis` doesn't exist in session, automatically triggers synthesis
- Ensures reveal data uses synthesized profile data

---

## 5. Animation Timing Breakdown

| Element | Animation | Duration | Delay | Easing |
|---------|-----------|----------|-------|--------|
| Onboarding Exit | Blur + Fade Out | 0.8s | 0s | ease-in |
| Reveal Card Entry | Fade In + Scale | 0.8s | 0s | power3.out |
| Model Score Label | Fade In Up | 0.6s | 0.3s | ease-out |
| Gauge Chart Fill | Arc Draw | 1.5s | 0.3s | easeOutQuart |
| Score Number | Gold Shimmer (loop) | 3s | 0s | ease-in-out |
| Radar Chart Draw | Line Draw | 1.5s | 0s | easeOutQuart |
| Market Tag 1 | Fade In + Scale | 0.6s | 0.1s | ease-out |
| Market Tag 2 | Fade In + Scale | 0.6s | 0.2s | ease-out |
| Action Item 1 | Slide In | 0.5s | 0.1s | ease-out |
| Action Item 2 | Slide In | 0.5s | 0.2s | ease-out |
| CTA Button | Gold Shimmer (loop) | 3s | 0s | ease-in-out |

---

## 6. User Journey

1. **Stage 6 Complete** → Maverick: "Everything calibrated, Leul. Let me reveal your Pholio potential."
2. **Transition** → Onboarding UI slams to black (0.8s blur fade)
3. **Card 1** → Model Score appears, gauge animates, score shimmers
4. **User clicks "Next"** → Card 1 exits (0.4s), Card 2 enters (0.6s)
5. **Card 2** → Radar chart draws, market tags fade in with pulse
6. **User clicks "Next"** → Card 2 exits (0.4s), Card 3 enters (0.6s)
7. **Card 3** → Comp card preview, bio, action plan bullets stagger in
8. **User clicks "Enter Dashboard"** → Redirect to `/dashboard/talent`

---

## 7. Technical Implementation Details

### Frontend Components
- **RevealOverlay** (React component in `views/apply/index-cinematic.ejs`)
  - Manages 3 full-screen cards with sequential navigation
  - Uses GSAP for card transitions
  - Uses Chart.js for gauge and radar charts
  - Fetches data from `/api/chat/reveal`

### Backend Logic
- **Maverick System Prompt** (`src/routes/chat.js`)
  - Stage 6 completion instruction added
  - Backend intercepts Stage 6 + continue action → modifies to `action: "reveal"`
  
- **Reveal API** (`/api/chat/reveal`)
  - Calculates model score (0-100 scale)
  - Generates radar chart data (proportions)
  - Generates market tags (Runway Viable, Commercial Strong, Editorial Fit)
  - Returns hero image, curated bio, and action plan

### Styling
- **apply-cinematic.css** (enhanced with reveal styles)
  - Full-screen reveal overlay
  - Gold shimmer effects (keyframe animations)
  - Card transition animations
  - Responsive breakpoints

---

## 8. Key Features

✅ **Cinematic Transitions:** Smooth blur/fade animations between stages
✅ **Animated Charts:** Gauge and radar charts with gold glow
✅ **Dynamic Scoring:** Real-time calculation based on completeness, proportions, photo quality
✅ **Market Intelligence:** AI-powered market fit tags
✅ **Action Plan:** Personalized next steps
✅ **Gold Shimmer CTA:** Final "Enter Dashboard" button with continuous shimmer effect

---

## 9. Future Enhancements (Optional)

1. **Confetti Animation:** Trigger canvas-confetti on final card reveal
2. **Sound Effects:** Subtle "whoosh" on card transitions
3. **Parallax Scrolling:** Hero image subtle zoom on scroll
4. **3D Card Flip:** Use CSS 3D transforms for card transitions
5. **AI Voice Narration:** Maverick voice reading reveal insights

---

## 10. Testing Checklist

- [ ] Stage 6 completion triggers reveal
- [ ] All 3 cards render correctly
- [ ] Charts animate smoothly (gauge, radar)
- [ ] Market tags appear with stagger
- [ ] Action plan bullets slide in sequentially
- [ ] "Enter Dashboard" button shimmers
- [ ] Clicking "Enter Dashboard" redirects to `/dashboard/talent`
- [ ] Responsive design works on mobile
- [ ] Error handling for missing data
- [ ] Loading state shows spinner with message

---

## Files Modified

1. **Backend:**
   - `src/routes/chat.js` - Maverick prompt + reveal trigger logic
   
2. **Frontend:**
   - `views/apply/index-cinematic.ejs` - RevealOverlay component + animations
   - `public/styles/apply-cinematic.css` - Reveal styles + shimmer effects

---

## Summary

The Reveal Dashboard creates a **cinematic moment** in the onboarding flow, celebrating the user's profile completion with animated data visualization and personalized insights. The gold shimmer effects, smooth transitions, and staggered animations create a premium, high-end experience that reinforces the Pholio brand's sophistication.

