# Pholio Landing Page (Next.js)

## ✅ What Was Built

A complete Next.js landing page with:

1. **Hero Section** - Copied exactly from ZIPSITE_LOCAL
   - Scrollytelling effect that zooms into the letter "a" in "talent"
   - Word flood animation with positive (gold) and negative (grey) words
   - Full scroll-based interactions with parallax

2. **Features Section** - Custom built for Pholio
   - 6 key features with icons and animations
   - Responsive grid layout
   - Scroll-triggered fade-ins

3. **Agency Section** - For agency partnerships  
   - 3 main benefits for agencies
   - Free tier messaging
   - CTA button to /partners

4. **CTA Section** - Final conversion
   - Dark gradient background
   - Primary + secondary CTAs
   - Trust indicators

## 🚀 Running the Landing Page

```bash
cd landing
npm run dev
```

Visit: **http://localhost:3001**

## 📁 Files Created

```
landing/
├── components/landing/sections/
│   ├── HeroScrollyTalent.tsx    ← Copied from ZIPSITE_LOCAL
│   ├── FeaturesSection.tsx      ← Built for Pholio
│   ├── AgencySection.tsx        ← Built for Pholio
│   └── CTASection.tsx           ← Built for Pholio
├── app/
│   ├── page.tsx                 ← Updated with all sections
│   └── globals.css              ← Pholio theme (cream/ink/gold)
```

## 🎨 Design System

- **Colors:** Cream (#FAF9F6), Ink (#0A0A0A), Gold (#C9A55A)
- **Font:** Noto Serif Display (all weights via Google Fonts)
- **Framework:** Next.js 16 + Tailwind + Framer Motion

## 🎯 Hero Details

The hero was copied exactly from ZIPSITE_LOCAL with:
- 3 scroll phases (0-20%, 20-65%, 65-100%)
- Performance optimizations (pre-generated positions, GPU transforms)
- Mobile responsive (80 words mobile, 180 desktop)
- Respects `prefers-reduced-motion`

---

**Ready to view!** Just run `npm run dev` in the `landing/` directory.
