# Reveal Dashboard Flow - Visual Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         ONBOARDING STAGES 0-6                              │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ User completes Stage 6
                                     ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                         STAGE 6: COMPLETION                                 │
│                                                                            │
│  Maverick Response:                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ "Everything calibrated, [FirstName].                             │    │
│  │  Let me reveal your Pholio potential."                           │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│  Backend Logic:                                                            │
│  • Detects: currentStage === 6 && action === 'continue'                   │
│  • Modifies response: action → 'reveal'                                   │
│  • Returns to frontend with reveal trigger                                │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ action === 'reveal'
                                     ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                    FRONTEND: TRANSITION SEQUENCE                           │
│                                                                            │
│  1. setIsRevealing(true)                                                   │
│  2. setShowOnboarding(false)                                               │
│  3. Trigger "Onboarding Slam" Animation                                    │
│     ┌────────────────────────────────────────┐                            │
│     │ • Blur: 0px → 20px                     │                            │
│     │ • Opacity: 1 → 0                       │  Duration: 0.8s            │
│     │ • Background: Obsidian Black (#050505) │                            │
│     └────────────────────────────────────────┘                            │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ 0.8s delay
                                     ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                     REVEAL OVERLAY: FULL SCREEN                            │
│                                                                            │
│  API Call: POST /api/chat/reveal                                           │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ • Fetches reveal data from backend                               │    │
│  │ • Triggers Librarian synthesis if needed                         │    │
│  │ • Returns: modelScore, radarData, marketTags, bioPreview, etc.  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ Data loaded
                                     ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                           CARD 1: MODEL SCORE                               │
│ ╔════════════════════════════════════════════════════════════════════════╗ │
│ ║                                                                        ║ │
│ ║                         MODEL SCORE                                    ║ │
│ ║                                                                        ║ │
│ ║              ┌─────────────────────────────────┐                       ║ │
│ ║              │                                 │                       ║ │
│ ║              │         ╱─────────╲             │                       ║ │
│ ║              │       ╱             ╲           │                       ║ │
│ ║              │      │       87      │          │  ← Gold Shimmer       ║ │
│ ║              │      │      ────      │          │     (continuous)     ║ │
│ ║              │       ╲     100     ╱           │                       ║ │
│ ║              │         ╲─────────╱             │                       ║ │
│ ║              │                                 │                       ║ │
│ ║              └─────────────────────────────────┘                       ║ │
│ ║                    ↑ Gauge Chart (1.5s fill)                          ║ │
│ ║                                                                        ║ │
│ ║              Score Breakdown:                                          ║ │
│ ║              • Completeness: 35                                        ║ │
│ ║              • Proportions: 28                                         ║ │
│ ║              • Photo Quality: 24                                       ║ │
│ ║                                                                        ║ │
│ ║              [ Next ] ←────────────────────────────────────────────   ║ │
│ ╚════════════════════════════════════════════════════════════════════════╝ │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ User clicks "Next"
                                     ↓
                          Card 1 Exit (0.4s) + Card 2 Enter (0.6s)
                                     │
                                     ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                      CARD 2: RADAR CHART + TAGS                             │
│ ╔════════════════════════════════════════════════════════════════════════╗ │
│ ║                                                                        ║ │
│ ║                    PROPORTIONS ANALYSIS                                ║ │
│ ║                                                                        ║ │
│ ║                      Height                                            ║ │
│ ║                         •                                              ║ │
│ ║                       ╱   ╲                                            ║ │
│ ║                     ╱       ╲                                          ║ │
│ ║         Shoe •────┼─────────┼────• Bust                               ║ │
│ ║                   │    87   │            ← Radar Chart                ║ │
│ ║                   │         │               (1.5s draw)               ║ │
│ ║            Hips •─┴─────────┴─• Waist                                 ║ │
│ ║                                                                        ║ │
│ ║              Market Potential:                                         ║ │
│ ║              ┌──────────────┐ ┌──────────────┐                        ║ │
│ ║              │ Runway Viable │ │ Editorial Fit│  ← Pulse Animation    ║ │
│ ║              └──────────────┘ └──────────────┘     (staggered)        ║ │
│ ║                                                                        ║ │
│ ║              [ Next ] ←────────────────────────────────────────────   ║ │
│ ╚════════════════════════════════════════════════════════════════════════╝ │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ User clicks "Next"
                                     ↓
                          Card 2 Exit (0.4s) + Card 3 Enter (0.6s)
                                     │
                                     ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                    CARD 3: COMP CARD PREVIEW                                │
│ ╔════════════════════════════════════════════════════════════════════════╗ │
│ ║                                                                        ║ │
│ ║              ┌────────────────────────────────┐                        ║ │
│ ║              │                                │                        ║ │
│ ║              │     [HERO IMAGE]               │  ← Crossfade + Zoom   ║ │
│ ║              │                                │     (0.8s)             ║ │
│ ║              │    3:4 Aspect Ratio            │                        ║ │
│ ║              │                                │                        ║ │
│ ║              │  ┌──────────────────────────┐ │                        ║ │
│ ║              │  │ Your Comp Card Preview   │ │  ← Overlay Fade        ║ │
│ ║              │  └──────────────────────────┘ │                        ║ │
│ ║              └────────────────────────────────┘                        ║ │
│ ║                                                                        ║ │
│ ║              AI-CURATED BIO PREVIEW:                                   ║ │
│ ║              "Leul is an emerging editorial talent with strong         ║ │
│ ║               runway proportions and commercial appeal..."             ║ │
│ ║                                            ↑ Fade Up (0.5s)            ║ │
│ ║                                                                        ║ │
│ ║              YOUR ACTION PLAN:                                         ║ │
│ ║              → Add 3 more photos to complete portfolio                 ║ │
│ ║              → Complete social links for discoverability               ║ │
│ ║              → Add professional references                             ║ │
│ ║                         ↑ Slide In (staggered 0.1s each)              ║ │
│ ║                                                                        ║ │
│ ║              ┌──────────────────────────────────────┐                 ║ │
│ ║              │      Enter Dashboard       ✨        │  ← Gold Shimmer ║ │
│ ║              └──────────────────────────────────────┘     (continuous) ║ │
│ ╚════════════════════════════════════════════════════════════════════════╝ │
└────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ User clicks "Enter Dashboard"
                                     ↓
┌────────────────────────────────────────────────────────────────────────────┐
│                       REDIRECT TO DASHBOARD                                 │
│                                                                            │
│  window.location.href = '/dashboard/talent';                               │
│                                                                            │
│  User sees their complete profile with:                                    │
│  • Profile completeness score                                              │
│  • Hero image                                                              │
│  • Curated bio                                                             │
│  • All profile data from onboarding                                        │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Decision Points

```
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Decision Tree                        │
└─────────────────────────────────────────────────────────────────┘

Stage 6 Complete?
    │
    ├─ Yes → action === 'continue'?
    │          │
    │          ├─ Yes → Modify: action = 'reveal'
    │          │          ↓
    │          │       Frontend triggers Reveal Overlay
    │          │
    │          └─ No → Continue normal flow
    │
    └─ No → Continue to next stage

┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Decision Tree                       │
└─────────────────────────────────────────────────────────────────┘

Receive response from backend
    │
    └─ action === 'reveal'?
         │
         ├─ Yes → setIsRevealing(true)
         │          ↓
         │       Hide onboarding UI (slam animation)
         │          ↓
         │       Show Reveal Overlay
         │          ↓
         │       Fetch reveal data from /api/chat/reveal
         │          ↓
         │       Show Card 1 → Card 2 → Card 3
         │          ↓
         │       Redirect to /dashboard/talent
         │
         └─ No → Continue normal onboarding flow
```

---

## Animation State Machine

```
State 0: ONBOARDING_ACTIVE
    │
    ↓ [Stage 6 Complete + Maverick Message]
    │
State 1: ONBOARDING_SLAM (0.8s)
    │ • Blur: 0→20px
    │ • Opacity: 1→0
    │
    ↓ [Transition Complete]
    │
State 2: REVEAL_LOADING (variable)
    │ • Fetch reveal data
    │ • Show spinner
    │
    ↓ [Data Loaded]
    │
State 3: REVEAL_CARD_1 (user controlled)
    │ • Show Model Score
    │ • Animate gauge
    │ • Gold shimmer loop
    │
    ↓ [User clicks "Next"]
    │
State 4: REVEAL_CARD_2 (user controlled)
    │ • Show Radar Chart
    │ • Animate market tags
    │
    ↓ [User clicks "Next"]
    │
State 5: REVEAL_CARD_3 (user controlled)
    │ • Show Comp Card Preview
    │ • Animate action plan
    │ • Show CTA with shimmer
    │
    ↓ [User clicks "Enter Dashboard"]
    │
State 6: REDIRECT_TO_DASHBOARD
    │ • window.location.href = '/dashboard/talent'
    │
    ↓
State 7: DASHBOARD_ACTIVE
```

---

## Data Flow

```
┌──────────┐
│  User    │
│ Submits  │
│ Stage 6  │
└────┬─────┘
     │
     ↓
┌─────────────────────────────────────┐
│ Backend: /api/chat (POST)           │
│ • Maverick generates response       │
│ • Detects Stage 6 complete          │
│ • Modifies action to 'reveal'       │
└────┬────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────┐
│ Frontend: Receives response         │
│ • Detects action === 'reveal'       │
│ • Triggers transition to Reveal     │
└────┬────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────┐
│ Backend: /api/chat/reveal (POST)    │
│ • Checks stage >= 4                 │
│ • Triggers Librarian if needed      │
│ • Calculates model score            │
│ • Generates radar data              │
│ • Generates market tags             │
│ • Returns reveal data               │
└────┬────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────┐
│ Frontend: RevealOverlay             │
│ • Shows 3 sequential cards          │
│ • Animates charts with Chart.js    │
│ • Uses GSAP for transitions         │
│ • CSS keyframes for shimmer         │
└────┬────────────────────────────────┘
     │
     ↓
┌─────────────────────────────────────┐
│ User clicks "Enter Dashboard"       │
│ • Redirects to /dashboard/talent    │
└─────────────────────────────────────┘
```

---

**Status:** ✅ Complete - Ready for testing

