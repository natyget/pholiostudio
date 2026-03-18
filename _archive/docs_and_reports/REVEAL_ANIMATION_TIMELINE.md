# Reveal Dashboard Animation Timeline

## 🎬 Complete Cinematic Sequence

This document provides a frame-by-frame breakdown of the Reveal Dashboard animation sequence.

---

## Stage 6 → Reveal Transition

### T = 0.0s: Maverick Completes Stage 6
```
Maverick: "Everything calibrated, [FirstName]. Let me reveal your Pholio potential."
Action: "reveal"
```

### T = 0.0s - 1.2s: Onboarding Exit (The Slam)
```css
animation: cinematicSlam 1.2s cubic-bezier(0.77, 0, 0.175, 1)

0.0s  ████████████████ Opacity: 1.0, Scale: 1.0, Blur: 0px
      ▼
0.36s ███████████████░ Scale: 0.98, Rotate: -0.5deg, Blur: 5px
      ▼
0.72s ████████░░░░░░░░ Opacity: 0.5, Scale: 1.1, Blur: 30px
      ▼
1.2s  ░░░░░░░░░░░░░░░░ Opacity: 0, Scale: 1.5, Blur: 50px, Brightness: 0
```
**Effect**: Chat interface violently scales up and dissolves into darkness

---

## Card 1: Model Score Reveal

### T = 1.2s - 2.4s: Overlay Entrance
```css
animation: revealOverlayEnter 1.2s ease-out

1.2s  ░░░░░░░░░░░░░░░░ Opacity: 0, Scale: 1.05
      ▼
2.4s  ████████████████ Opacity: 1.0, Scale: 1.0
```
**Effect**: Black background with vignette and film grain fades in

### T = 1.5s - 2.1s: Score Label Entry
```css
animation: cinematicLabelEntry 1s ease-out, delay: 0.3s

1.5s  ░░░░░░░░░░░░░░░░ Opacity: 0, TranslateY: 20px, Letter-spacing: 0.5em
      ▼
2.1s  ████████████████ Opacity: 1.0, TranslateY: 0, Letter-spacing: 0.25em
```
**Text**: "MODEL SCORE"

### T = 2.3s - 3.1s: Gold Underline Expands
```css
animation: underlineExpand 0.8s ease-out, delay: 0.8s

2.3s  ════════════════ ScaleX: 0
      ▼
3.1s  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ ScaleX: 1.0 (60px gold line)
```

### T = 2.4s - 4.4s: Gauge Number Animates In
```css
animation: luxuryGoldShimmer 4s ease-in-out infinite (starts immediately)

2.4s  ░░░░░░░░░░░░░░░░ (Gauge appears, shimmer begins)
      ▼
3.4s  ████████████████ 92 (full brightness, gold gradient shifts)
      ▼
4.4s  ████████████████ (shimmer continues looping)
```
**Number**: "92" (or user's score)
**Size**: 4rem - 6rem responsive

### T = 2.4s onwards: Gauge Float Animation
```css
animation: gaugeFloat 6s ease-in-out infinite

2.4s  ████████████████ TranslateY: 0, Scale: 1.0
      ▼
5.4s  ████████████████ TranslateY: -10px, Scale: 1.02
      ▼
8.4s  ████████████████ TranslateY: 0, Scale: 1.0 (loops)
```

### T = 4.6s - 5.2s: Breakdown Item 1 (Face)
```css
animation: breakdownItemReveal 0.6s ease-out, delay: 2.2s

4.6s  ░░░░░░░░░░░░░░░░ Opacity: 0, TranslateX: -30px
      ▼
5.2s  ████████████████ Opacity: 1.0, TranslateX: 0
```
**Text**: "Face: 94"

### T = 4.8s - 5.4s: Breakdown Item 2 (Body)
```css
delay: 2.4s

4.8s  ░░░░░░░░░░░░░░░░ Opacity: 0, TranslateX: -30px
      ▼
5.4s  ████████████████ Opacity: 1.0, TranslateX: 0
```
**Text**: "Body: 88"

### T = 5.0s - 5.6s: Breakdown Item 3 (Presence)
```css
delay: 2.6s

5.0s  ░░░░░░░░░░░░░░░░ Opacity: 0, TranslateX: -30px
      ▼
5.6s  ████████████████ Opacity: 1.0, TranslateX: 0
```
**Text**: "Presence: 93"

### T = 5.6s: "Next" Button Appears
User can now advance to Card 2

---

## Card 2: Proportions Radar

### T = 0.0s - 0.6s: Card Transition (Score → Radar)
```javascript
// GSAP Timeline
gsap.to(currentCard, { opacity: 0, scale: 0.95, duration: 0.3 })
gsap.fromTo(nextCard, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.3 })
```

### T = 0.3s - 1.3s: Radar Label Entry
```css
animation: cinematicLabelEntry 1s ease-out, delay: 0.3s

0.3s  ░░░░░░░░░░░░░░░░ Opacity: 0, TranslateY: 20px
      ▼
1.3s  ████████████████ Opacity: 1.0, TranslateY: 0
```
**Text**: "PROPORTIONS"

### T = 1.1s - 1.9s: Underline Expands
```css
animation: underlineExpand 0.8s ease-out, delay: 0.8s
```

### T = 1.3s onwards: Radar Chart Draws In
```javascript
// Chart.js custom animation
duration: 2000ms
easing: 'easeOutQuart'

1.3s  Points: 0% ░░░░░░░░░░░░░░░░
      ▼
2.3s  Points: 50% ████████░░░░░░░░
      ▼
3.3s  Points: 100% ████████████████
```
**Effect**: Lines draw from center outward with gold glow

### T = 1.3s onwards: Radar Pulse & Glow
```css
animation: radarPulse 6s ease-in-out infinite
animation: radarGlow 4s ease-in-out infinite
animation: radarRingExpand 6s ease-in-out infinite

1.3s  Scale: 1.0, Filter: drop-shadow(40px)
      ▼
4.3s  Scale: 1.03, Filter: drop-shadow(60px)
      ▼
7.3s  Scale: 1.0, Filter: drop-shadow(40px) (loops)
```

### T = 3.3s: "Next" Button Appears
User can now advance to Card 3

---

## Card 3: Comp Card Preview

### T = 0.0s - 0.6s: Card Transition (Radar → Comp)
```javascript
gsap.to(radarCard, { opacity: 0, scale: 0.95, duration: 0.3 })
gsap.fromTo(compCard, { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.3 })
```

### T = 0.0s - 2.0s: Hero Image Reveal
```css
animation: cinematicImageReveal 2s cubic-bezier(0.16, 1, 0.3, 1)

0.0s  ░░░░░░░░░░░░░░░░ Opacity: 0, Scale: 1.2, Blur: 20px, Brightness: 0.5
      ▼
1.0s  ████████░░░░░░░░ Opacity: 0.7, Scale: 1.05, Blur: 5px, Brightness: 0.8
      ▼
2.0s  ████████████████ Opacity: 1.0, Scale: 1.0, Blur: 0, Brightness: 1.0
```
**Effect**: Photo crossfades in with dramatic zoom and brightness ramp

### T = 0.0s onwards: Frame Shimmer
```css
animation: frameShimmer 8s linear infinite
animation: wrapperGlow 6s ease-in-out infinite

0.0s  Border: rgba(201, 165, 90, 0.6), Glow: 100px
      ▼
3.0s  Border: rgba(255, 215, 120, 0.4), Glow: 120px
      ▼
6.0s  Border: rgba(201, 165, 90, 0.6), Glow: 100px (loops)
```

### T = 1.0s - 2.0s: Bio Section Entry
```css
animation: bioReveal 1s ease-out, delay: 0.5s

1.0s  ░░░░░░░░░░░░░░░░ Opacity: 0, TranslateY: 30px
      ▼
2.0s  ████████████████ Opacity: 1.0, TranslateY: 0
```
**Text**: "MAVERICK'S INSIGHT" + bio paragraph

### T = 2.0s onwards: Bio Shimmer
```css
animation: bioShimmer 5s ease-in-out, delay: 1s, infinite

2.0s  ════════════════ (shimmer starts)
      ▼
4.5s  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ (shimmer passes)
      ▼
7.0s  ════════════════ (loops)
```

### T = 2.3s - 3.1s: Action Item 1
```css
animation: dramaticActionItemReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), delay: 0.3s

2.3s  ░░░░░░░░░░░░░░░░ Opacity: 0, TranslateX: -40px, RotateY: -15deg, Blur: 10px
      ▼
2.8s  ████████░░░░░░░░ TranslateX: 5px, RotateY: 2deg (bounce)
      ▼
3.1s  ████████████████ Opacity: 1.0, TranslateX: 0, RotateY: 0, Blur: 0
```
**Text**: "🎯 Polish your portfolio with..."

### T = 2.5s - 3.3s: Action Item 2
```css
delay: 0.5s
```
**Text**: "📸 Get professionally shot in..."

### T = 2.7s - 3.5s: Action Item 3
```css
delay: 0.7s
```
**Text**: "✨ Practice runway walk and..."

### T = 2.9s - 3.7s: Action Item 4 (if exists)
```css
delay: 0.9s
```

### T = 3.7s: "Enter Dashboard" Button Appears
```css
animation: dramaticGoldShimmer 4s ease-in-out infinite
animation: radianceWave 6s linear infinite
animation: sweepingLight 3s ease-in-out infinite

3.7s  ████████████████ (all 3 shimmer effects loop continuously)
```
**Button**: Large, gold, with triple-layer shimmer effect

---

## Continuous Background Effects

### Film Grain
```css
animation: filmGrainMove 8s steps(10) infinite

Perpetual subtle texture movement across entire overlay
```

### Luxury Sweep (on Score & Radar cards)
```css
animation: luxurySweep 8s ease-in-out infinite

Every 8 seconds, diagonal gold light sweeps across card
```

### Ambient Glow (all cards)
```css
animation: ambientGlow 4s ease-in-out infinite

Box-shadow breathes between subtle and more prominent
```

### Action Plan Container Sweep
```css
animation: planAmbientSweep 6s ease-in-out infinite

Gold glow passes through action plan background
```

---

## User Interaction Timeline

### Hover States (instantaneous)
- **Tags**: 0.4s spring animation (scale up, translate up, intensify glow)
- **Breakdown Items**: 0.3s slide right with border accent
- **Action Items**: 0.4s translate right, icon scale + rotate
- **CTA Button**: 0.4s scale up, intensify multi-layer shimmer

### Click Events
- **Next Button (Card 1 → 2)**: 0.6s crossfade with scale
- **Next Button (Card 2 → 3)**: 0.6s crossfade with scale
- **Enter Dashboard**: Redirect to `/dashboard/talent`

---

## Total Experience Duration

| Sequence | Duration | User Control |
|----------|----------|--------------|
| **Exit Slam** | 1.2s | None (auto) |
| **Card 1 Entry** | 1.2s | None (auto) |
| **Card 1 Complete** | ~5.6s | Click "Next" anytime after animations |
| **Card 2 Complete** | ~3.3s | Click "Next" anytime after animations |
| **Card 3 Complete** | ~3.7s | Click "Enter Dashboard" anytime after animations |
| **Minimum Total** | ~15s | If user clicks immediately after each card completes |
| **Recommended Total** | ~25-30s | Allow user to read content and enjoy animations |

---

## Animation Performance Metrics

### FPS Targets
- **Exit Slam**: 60 FPS (transform + filter)
- **Card Transitions**: 60 FPS (GSAP optimized)
- **Continuous Loops**: 30-60 FPS (depending on device)

### Paint Operations
- **Heavy**: Blur filters, backdrop-filter
- **Medium**: Box-shadow animations, gradient shifts
- **Light**: Transform, opacity, scale, rotate

### GPU Acceleration
All animations use transform/opacity when possible to leverage hardware acceleration

---

## Accessibility Considerations

### Motion Sensitivity
Currently **no** `prefers-reduced-motion` support. Should add:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Experience
- Labels use semantic HTML
- ARIA live regions should announce score/data reveals
- Keyboard focus should be trapped during reveal sequence

---

## Summary

The Reveal Dashboard is a **15-30 second cinematic experience** with:
- **3 major cards** (Score, Radar, Comp)
- **35+ simultaneous animations** at any given time
- **Multi-layer shimmer effects** creating luxury depth
- **Staggered reveals** building anticipation
- **Interactive hover states** rewarding exploration

**Total Keyframes**: ~35 unique sequences  
**Average FPS**: 60 (on modern hardware)  
**Recommended Viewing**: Desktop, 1440px+, high-quality display

🎬 **A truly cinematic onboarding finale!**
