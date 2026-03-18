# Cinematic Onboarding Enhancement Plan

## Overview
Enhance the existing 8-stage onboarding flow with a personalized reveal stage, improved animations, and analytics visualization.

## Current State Analysis

### Existing Stages (0-7)
- ✅ **Stage 0**: Social Auth Entry (Welcome/Google/Instagram)
- ✅ **Stage 1**: Profile Foundation (Name, Contact, Location) - Auto-skipped if auth data exists
- ✅ **Stage 2**: Visual Intel (Photo Upload with Scout Analysis)
- ✅ **Stage 3**: Physical Metrics (Height, Weight, Proportions, Shoe Size)
- ⚠️ **Stage 4**: Professional Profile (Experience, Skills, Portfolio) - Needs enhancement
- ⚠️ **Stage 5**: Market Positioning (Specialties, Target Markets) - **TO BE REPLACED**
- ⚠️ **Stage 6**: Additional Details (References, Availability, Preferences)
- ✅ **Stage 7**: Finalization (Review, Submit)

## Proposed Enhancements

### Stage 5: Personalized Reveal (NEW)
**Replaces current Stage 5 (Market Positioning)**

**Visual Components:**
1. **Model Score Gauge** (0-100)
   - Based on: profile completeness, proportions balance, photo quality
   - Animated fill with gold shimmer
   - Use: Chart.js Gauge or custom SVG with GSAP

2. **Proportions Radar Chart**
   - Metrics: Height, Bust-Waist-Hips ratio, Shoe Size
   - Gold fill with shimmer animation on reveal
   - Use: Chart.js Radar Chart

3. **Market Potential Summary**
   - Tags: "High fashion viable", "Commercial strong", "Runway ready"
   - Based on measurements, experience, photo analysis
   - Animated fade-in with stagger

4. **AI-Curated Bio Preview**
   - Display Maverick/Librarian's curated bio
   - Edit/refine option

5. **Action Plan**
   - "Complete social links"
   - "Add references"
   - "Apply to [Agency]"

6. **Hero Image Preview**
   - First uploaded photo as comp card
   - Glass card effect with gold border

7. **Success Animations**
   - Confetti effect on 100% completion
   - Glow pulse on gauge
   - Staggered reveal of all components

**Technical Implementation:**
- Use GSAP for animations (fade, scale, blur transitions)
- Use Chart.js for gauge and radar chart
- Optional: Rive or Lottie for advanced gauge animation
- Dark theme with gold accents

### Stage 4 Enhancement: Essential Details
**Current**: Professional Profile
**Enhanced**: Streamlined conversational inputs with auto-curate preview

- Name, Bio, Experience, Socials
- Fade-in one-by-one
- Client-side bio preview (auto-curate)

### Stage 6 Enhancement: Additional Profile
**Current**: Additional Details
**Enhanced**: Optional but encouraged with multi-select chips

- Gender, Ethnicity, Languages, Comfort Levels
- Multi-select chips with gold borders
- Glass card design
- Progress shows "Optional but recommended"

## Implementation Priority

### Phase 1: Core Reveal Stage (High Priority)
1. ✅ Create Stage 5 component structure
2. ✅ Implement Model Score calculation logic
3. ✅ Add Chart.js for gauge and radar
4. ✅ Create Market Potential algorithm
5. ✅ Build hero image preview card

### Phase 2: Animations (Medium Priority)
1. ✅ GSAP integration for stage transitions
2. ✅ Confetti animation for 100% completion
3. ✅ Staggered component reveals
4. ✅ Gauge fill animation

### Phase 3: Enhancements (Low Priority)
1. ✅ Stage 4 bio auto-curate preview
2. ✅ Stage 6 multi-select chips
3. ✅ Rive/Lottie advanced animations
4. ✅ Enhanced success state

## Technical Dependencies

### New Libraries Needed
- **GSAP** (GreenSock): `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`
- **Chart.js**: `https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js`
- **Confetti**: `https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js`

### Backend Changes Needed
1. **Model Score Calculation** (`src/lib/dashboard/completeness.js`)
   - Enhance `calculateProfileCompleteness` to return score breakdown
   - Add proportions balance calculation
   - Add photo quality proxy score

2. **Market Potential Algorithm** (New: `src/lib/market-potential.js`)
   - Analyze measurements against industry standards
   - Check experience level
   - Consider Scout's visual analysis
   - Generate market tags

3. **API Endpoint** (`src/routes/chat.js`)
   - Add `/api/chat/reveal` endpoint
   - Returns: score, radar data, market tags, bio preview

## File Structure

```
views/apply/index-cinematic.ejs
  - Add: PersonalizedRevealStage component
  - Enhance: Stage 4, Stage 6 components

public/scripts/
  - create: reveal-analytics.js (score calculation, market potential)

src/lib/
  - enhance: dashboard/completeness.js (add score calculation)
  - create: market-potential.js (market analysis)

src/routes/
  - enhance: chat.js (add reveal endpoint)
```

## Design Specifications

### Colors
- Background: `#050505` (Obsidian)
- Gold: `rgba(201, 165, 90, 1)` (Pholio Gold)
- Text: `#FAF9F7` (Stone-50)
- Accent: Gold shimmer on interactive elements

### Typography
- **Insight/Headlines**: Cormorant Garamond, `clamp(2rem, 4vw, 3.5rem)`, Gold gradient
- **Body/Instructions**: Montserrat, `clamp(1rem, 2vw, 1.2rem)`, Muted white
- **Labels**: Montserrat, `0.875rem`, Uppercase, Letter-spacing `0.05em`

### Animations
- **Stage Transition**: 300ms blur fade-out → 500ms wait → fade-in
- **Gauge Fill**: 1.5s ease-out with gold shimmer
- **Component Reveal**: Stagger 100ms, fade + scale
- **Confetti**: 2s duration, triggered at 100%

## Success Metrics
- Completion rate increase
- Time to complete onboarding
- User engagement with reveal stage
- Profile completeness after onboarding



