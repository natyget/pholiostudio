# RevealOverlay CSS Class Reference Guide

Quick reference for all CSS classes used in the RevealOverlay component.

---

## 🎯 Core Classes

### `.reveal-overlay`
**Purpose**: Full-screen container for entire reveal experience  
**Key Features**:
- Gradient background (#000 → #0a0a0a → #050)
- Vignette overlay (::before)
- Film grain texture (::after)
- Entry animation (1.2s)

**Usage**:
```jsx
<div className="reveal-overlay">
  {/* All reveal cards go here */}
</div>
```

---

## 🎴 Card Classes

### `.reveal-card`
**Purpose**: Base class for all reveal cards  
**Key Features**: Position absolute, fade transitions

### `.reveal-score-card-full`
**Purpose**: Model Score display card (Card 1)  
**Key Features**:
- Full-screen backdrop blur
- Luxury shimmer sweep (::before)
- Ambient glow pulse

### `.reveal-radar-card-full`
**Purpose**: Proportions Radar chart card (Card 2)  
**Key Features**:
- Same as score card
- Optimized for chart display

### `.reveal-comp-card-full`
**Purpose**: Comp card preview (Card 3)  
**Key Features**:
- Scrollable content
- No shimmer sweep (has individual elements)

**Usage**:
```jsx
<div className="reveal-card reveal-score-card-full">
  {/* Score content */}
</div>
```

---

## 📊 Score Card Components

### `.reveal-gauge-container`
**Purpose**: Contains gauge chart canvas  
**Key Features**:
- Max-width: 320px
- Floating animation (6s loop)
- Drop shadow glow

### `.reveal-gauge-value`
**Purpose**: Wrapper for score number and label

### `.reveal-gauge-number`
**Purpose**: Large animated score number (e.g., "92")  
**Key Features**:
- Font: 4-6rem Cormorant Garamond
- 5-color gold gradient shimmer
- Blur glow duplicate (::before)
- Pulse animation

**Usage**:
```jsx
<div className="reveal-gauge-value">
  <span className="reveal-gauge-number" data-score="92">92</span>
</div>
```

### `.reveal-gauge-breakdown`
**Purpose**: Container for Face/Body/Presence scores

### `.gauge-breakdown-item`
**Purpose**: Individual breakdown row  
**Key Features**:
- Slide-in animation (staggered delays)
- Left border accent on hover (::before)
- Translate right on hover

### `.breakdown-label`
**Purpose**: Label text (e.g., "Face")

### `.breakdown-value`
**Purpose**: Score value (e.g., "94")  
**Key Features**:
- Gold color with glow
- Scale up on hover

**Usage**:
```jsx
<div className="reveal-gauge-breakdown">
  <div className="gauge-breakdown-item">
    <span className="breakdown-label">Face</span>
    <span className="breakdown-value">94</span>
  </div>
</div>
```

---

## 📡 Radar Card Components

### `.reveal-radar-container`
**Purpose**: Contains radar chart canvas  
**Key Features**:
- Max-width: 380px
- Pulse animation (6s loop)
- Concentric glow rings (::before, ::after)

### `.reveal-radar-chart`
**Purpose**: Canvas element for Chart.js

**Usage**:
```jsx
<div className="reveal-radar-container">
  <canvas id="radarChart" className="reveal-radar-chart"></canvas>
</div>
```

---

## 🏷️ Market Tags Components

### `.reveal-market-tags`
**Purpose**: Container for market fit section  
**Key Features**:
- Radial gradient background
- Rounded corners

### `.reveal-market-label`
**Purpose**: "MARKET FIT" heading  
**Key Features**:
- Wide letter spacing (0.25em)
- Gold underline (::after)

### `.reveal-tags-container`
**Purpose**: Flex container for tags

### `.reveal-tag`
**Purpose**: Individual market tag (e.g., "Editorial", "Runway")  
**Key Features**:
- 3D rotateX entry animation
- Shimmer sweep on hover (::before)
- Scale up and glow on hover
- Staggered delays (0.2s, 0.35s, 0.5s, 0.65s)

**Usage**:
```jsx
<div className="reveal-market-tags">
  <div className="reveal-market-label">Market Fit</div>
  <div className="reveal-tags-container">
    <span className="reveal-tag">Editorial</span>
    <span className="reveal-tag">Runway</span>
    <span className="reveal-tag">Commercial</span>
  </div>
</div>
```

---

## 🖼️ Comp Card Components

### `.reveal-comp-image-wrapper`
**Purpose**: Frame for hero image  
**Key Features**:
- Aspect ratio 3:4
- Gold border with shimmer (::before)
- Light sweep overlay (::after)
- Glow pulse animation

### `.reveal-comp-image`
**Purpose**: Hero image element  
**Key Features**:
- 2s cinematic reveal (blur dissolve + zoom)
- Cover object-fit

**Usage**:
```jsx
<div className="reveal-comp-image-wrapper">
  <img src={heroImage} alt="Hero" className="reveal-comp-image" />
</div>
```

### `.reveal-comp-bio`
**Purpose**: Biography section container  
**Key Features**:
- Gradient background
- Shimmer sweep (::before)
- Slide-up entry (1s delay)

### `.reveal-comp-bio-label`
**Purpose**: "MAVERICK'S INSIGHT" heading  
**Key Features**:
- Wide letter spacing
- Left-aligned gold underline (::after)

### `.reveal-comp-bio-text`
**Purpose**: Bio paragraph text

**Usage**:
```jsx
<div className="reveal-comp-bio">
  <div className="reveal-comp-bio-label">Maverick's Insight</div>
  <p className="reveal-comp-bio-text">{bioText}</p>
</div>
```

---

## 📋 Action Plan Components

### `.reveal-comp-action-plan`
**Purpose**: Container for action items  
**Key Features**:
- Gradient background
- Ambient sweep (::before)

### `.reveal-comp-action-label`
**Purpose**: "YOUR ACTION PLAN" heading  
**Key Features**:
- Wide letter spacing
- Left-aligned gold underline (::after)

### `.reveal-comp-action-list`
**Purpose**: List container

### `.reveal-comp-action-item`
**Purpose**: Individual action item  
**Key Features**:
- 3D rotateY entry with bounce
- Left gold border accent
- Hover: translate right, intensify glow
- Staggered delays (0.3s, 0.5s, 0.7s, 0.9s, 1.1s)

### `.action-item-icon`
**Purpose**: Icon/emoji at left of item  
**Key Features**:
- Large size (1.5-2rem)
- Gold color with text-shadow
- Breathing animation (3s pulse)
- Scale and rotate on hover

### `.action-item-text`
**Purpose**: Action item text content

**Usage**:
```jsx
<div className="reveal-comp-action-plan">
  <div className="reveal-comp-action-label">Your Action Plan</div>
  <div className="reveal-comp-action-list">
    <div className="reveal-comp-action-item">
      <span className="action-item-icon">🎯</span>
      <span className="action-item-text">Polish your portfolio...</span>
    </div>
  </div>
</div>
```

---

## 🎯 Button Classes

### `.reveal-button`
**Purpose**: Base class for all reveal buttons  
**Key Features**:
- Backdrop blur
- Gold border
- Smooth transitions

### `.reveal-next-button`
**Purpose**: "Next" button (Cards 1 & 2)  
**Inherits**: `.reveal-button`

### `.reveal-finish-button`
**Purpose**: "Enter Dashboard" button (Card 3)  
**Inherits**: `.reveal-button`

### `.reveal-gold-shimmer`
**Purpose**: Premium shimmer effect for final CTA  
**Key Features**:
- 5-color gradient background animation
- Radiant border glow (::before)
- Sweeping light effect (::after)
- Dramatic hover: scale 1.05, translate up, intensify glow

**Usage**:
```jsx
<button className="reveal-button reveal-finish-button reveal-gold-shimmer">
  Enter Dashboard
</button>
```

---

## 🔄 Loading States

### `.reveal-loading`
**Purpose**: Container for loading spinner and text  
**Key Features**: Flex column, centered, pulse animation

### `.reveal-loading-spinner`
**Purpose**: Animated dual-ring spinner  
**Key Features**:
- Outer ring rotates clockwise
- Inner ring (::before) rotates counter-clockwise
- Glow ring (::after) pulses
- Elastic easing

### `.reveal-loading-text`
**Purpose**: "Calculating..." text  
**Key Features**: Text shimmer animation

**Usage**:
```jsx
<div className="reveal-loading">
  <div className="reveal-loading-spinner"></div>
  <div className="reveal-loading-text">Calculating your Pholio potential...</div>
</div>
```

---

## 🏷️ Label Classes (Shared)

### `.reveal-gauge-label`
**Purpose**: Label for gauge chart

### `.reveal-radar-label`
**Purpose**: Label for radar chart

### `.reveal-score-label`
**Purpose**: Generic score label

**All label classes share**:
- Montserrat font
- Uppercase
- Wide letter spacing (0.25em)
- Cinematic entry animation
- Gold underline (::after)

**Usage**:
```jsx
<div className="reveal-score-label">Model Score</div>
```

---

## 🚪 Exit Animation Class

### `.onboarding-exit`
**Purpose**: Applied to `.onboarding-container` when transitioning to reveal  
**Key Features**:
- 1.2s cinematic slam
- Scale up to 1.5x
- Blur to 50px
- Brightness to 0
- Subtle rotation

**Usage** (applied by JavaScript):
```javascript
onboardingContainer.classList.add('onboarding-exit');
```

---

## 🎨 Modifier Classes

### Stagger Delays (nth-child selectors)

**Breakdown Items**:
```css
.gauge-breakdown-item:nth-child(1) { animation-delay: 2.2s; }
.gauge-breakdown-item:nth-child(2) { animation-delay: 2.4s; }
.gauge-breakdown-item:nth-child(3) { animation-delay: 2.6s; }
```

**Market Tags**:
```css
.reveal-tag:nth-child(1) { animation-delay: 0.2s; }
.reveal-tag:nth-child(2) { animation-delay: 0.35s; }
.reveal-tag:nth-child(3) { animation-delay: 0.5s; }
.reveal-tag:nth-child(4) { animation-delay: 0.65s; }
```

**Action Items**:
```css
.reveal-comp-action-item:nth-child(1) { animation-delay: 0.3s; }
.reveal-comp-action-item:nth-child(2) { animation-delay: 0.5s; }
.reveal-comp-action-item:nth-child(3) { animation-delay: 0.7s; }
.reveal-comp-action-item:nth-child(4) { animation-delay: 0.9s; }
.reveal-comp-action-item:nth-child(5) { animation-delay: 1.1s; }
```

---

## 📝 CSS Custom Properties (Variables)

Reference from main CSS file:

```css
--apply-spacing-sm: 0.5rem;
--apply-spacing-md: 1rem;
--apply-spacing-lg: 1.5rem;
--apply-spacing-xl: 2rem;
--apply-spacing-2xl: 3rem;
--apply-spacing-3xl: 4rem;
--apply-spacing-4xl: 6rem;

--apply-font-instruction: 'Montserrat', sans-serif;
--apply-font-display: 'Cormorant Garamond', serif;

--apply-text-primary: rgba(250, 249, 247, 1);
--apply-text-secondary: rgba(250, 249, 247, 0.8);

--apply-accent-gold: rgba(201, 165, 90, 1);
```

---

## 🎯 Common Usage Patterns

### Full Score Card Structure
```jsx
<div className="reveal-card reveal-score-card-full">
  <div className="reveal-score-label">Model Score</div>
  <div className="reveal-gauge-container">
    <canvas id="gaugeChart"></canvas>
    <div className="reveal-gauge-value">
      <span className="reveal-gauge-number">92</span>
    </div>
  </div>
  <div className="reveal-gauge-breakdown">
    <div className="gauge-breakdown-item">
      <span className="breakdown-label">Face</span>
      <span className="breakdown-value">94</span>
    </div>
    {/* More items... */}
  </div>
  <button className="reveal-button reveal-next-button">Next</button>
</div>
```

### Full Radar Card Structure
```jsx
<div className="reveal-card reveal-radar-card-full">
  <div className="reveal-radar-label">Proportions</div>
  <div className="reveal-radar-container">
    <canvas id="radarChart" className="reveal-radar-chart"></canvas>
  </div>
  <div className="reveal-market-tags">
    <div className="reveal-market-label">Market Fit</div>
    <div className="reveal-tags-container">
      <span className="reveal-tag">Editorial</span>
      {/* More tags... */}
    </div>
  </div>
  <button className="reveal-button reveal-next-button">Next</button>
</div>
```

### Full Comp Card Structure
```jsx
<div className="reveal-card reveal-comp-card-full">
  <div className="reveal-comp-image-wrapper">
    <img src={hero} className="reveal-comp-image" />
  </div>
  <div className="reveal-comp-bio">
    <div className="reveal-comp-bio-label">Maverick's Insight</div>
    <p className="reveal-comp-bio-text">{bio}</p>
  </div>
  <div className="reveal-comp-action-plan">
    <div className="reveal-comp-action-label">Your Action Plan</div>
    <div className="reveal-comp-action-list">
      <div className="reveal-comp-action-item">
        <span className="action-item-icon">🎯</span>
        <span className="action-item-text">{action}</span>
      </div>
      {/* More items... */}
    </div>
  </div>
  <button className="reveal-button reveal-finish-button reveal-gold-shimmer">
    Enter Dashboard
  </button>
</div>
```

---

## 🔍 Animation Names Reference

Quick lookup of all `@keyframes` used:

| Animation Name | Used By | Duration | Loop |
|----------------|---------|----------|------|
| `revealOverlayEnter` | `.reveal-overlay` | 1.2s | No |
| `filmGrainMove` | `.reveal-overlay::after` | 8s | Yes |
| `cinematicSlam` | `.onboarding-exit` | 1.2s | No |
| `luxurySweep` | Card `::before` | 8s | Yes |
| `ambientGlow` | Cards | 4s | Yes |
| `luxuryGoldShimmer` | `.reveal-gauge-number` | 4s | Yes |
| `pulseGlow` | Gauge number `::before` | 2s | Yes |
| `gaugeFloat` | `.reveal-gauge-container` | 6s | Yes |
| `breakdownItemReveal` | `.gauge-breakdown-item` | 0.6s | No |
| `cinematicLabelEntry` | Label classes | 1s | No |
| `underlineExpand` | Label `::after` | 0.8s | No |
| `radarPulse` | `.reveal-radar-container` | 6s | Yes |
| `radarGlow` | Radar `::before` | 4s | Yes |
| `radarRingExpand` | Radar `::after` | 6s | Yes |
| `luxuryTagEntry` | `.reveal-tag` | 0.8s | No |
| `cinematicImageReveal` | `.reveal-comp-image` | 2s | No |
| `compWrapperGlow` | Image wrapper | 6s | Yes |
| `frameShimmerEffect` | Wrapper `::before` | 8s | Yes |
| `compLightSweep` | Wrapper `::after` | 4s | Yes |
| `bioReveal` | `.reveal-comp-bio` | 1s | No |
| `bioShimmer` | Bio `::before` | 5s | Yes |
| `dramaticActionItemReveal` | Action items | 0.8s | No |
| `iconBreathing` | `.action-item-icon` | 3s | Yes |
| `dramaticGoldShimmer` | `.reveal-gold-shimmer` | 4s | Yes |
| `radianceWave` | Shimmer `::before` | 6s | Yes |
| `sweepingLight` | Shimmer `::after` | 3s | Yes |
| `luxurySpinGlow` | Loading spinner | 1.2s | Yes |
| `glowPulse` | Spinner `::after` | 2s | Yes |
| `textShimmer` | Loading text | 3s | Yes |

---

## 🎨 Color Reference

### Gold Variants (Most Used)
```css
/* Ultra Subtle */
rgba(201, 165, 90, 0.03)
rgba(201, 165, 90, 0.05)
rgba(201, 165, 90, 0.08)

/* Subtle */
rgba(201, 165, 90, 0.1)
rgba(201, 165, 90, 0.15)
rgba(201, 165, 90, 0.2)

/* Medium */
rgba(201, 165, 90, 0.3)
rgba(201, 165, 90, 0.4)
rgba(201, 165, 90, 0.5)

/* Strong */
rgba(201, 165, 90, 0.6)
rgba(201, 165, 90, 0.8)
rgba(201, 165, 90, 0.9)

/* Full */
rgba(201, 165, 90, 1)

/* Bright Variants */
rgba(255, 215, 120, 1)  /* Warm gold */
rgba(255, 223, 128, 1)  /* Bright gold */
```

---

## 📚 Quick Tips

### Adding a New Reveal Card
1. Create card with class `reveal-card reveal-yourcardname-full`
2. Add to card container in overlay
3. Implement GSAP transition in JavaScript
4. Add staggered animations with delays

### Customizing Animation Speed
All animations use CSS variables or can be easily modified:
```css
/* Find animation in CSS */
animation: luxurySweep 8s ease-in-out infinite;

/* Adjust duration (second value) */
animation: luxurySweep 12s ease-in-out infinite; /* Slower */
animation: luxurySweep 4s ease-in-out infinite;  /* Faster */
```

### Adjusting Stagger Delays
Modify nth-child selectors:
```css
/* Current: 0.2s increments */
.reveal-tag:nth-child(1) { animation-delay: 0.2s; }
.reveal-tag:nth-child(2) { animation-delay: 0.4s; }  /* Change to 0.35s for tighter */
.reveal-tag:nth-child(3) { animation-delay: 0.6s; }  /* Change to 0.5s for tighter */
```

### Disabling Specific Animations
Comment out animation property:
```css
.reveal-gauge-number {
  /* animation: luxuryGoldShimmer 4s ease-in-out infinite; */
}
```

---

## ✅ Checklist for Implementation

- [ ] Ensure all class names match exactly (case-sensitive)
- [ ] Include Chart.js library for gauge and radar
- [ ] Implement GSAP for card transitions
- [ ] Add data-score attribute to gauge number
- [ ] Handle loading state before data loads
- [ ] Add onClick handlers to buttons
- [ ] Fetch data from `/api/chat/reveal`
- [ ] Handle error states gracefully
- [ ] Test on mobile (responsive clamp() values)
- [ ] Add `prefers-reduced-motion` support (future)

---

**Total Classes**: 40+ unique classes  
**Total Animations**: 25+ keyframe sequences  
**File**: `/public/styles/apply-cinematic.css`  

🎯 **Use this guide as your quick reference when building or modifying the RevealOverlay component!**

