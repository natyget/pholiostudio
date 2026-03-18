# Radar Reveal - Quick Start Guide

## What Changed?

The casting flow now includes a **Data-Driven Radar Reveal** that shows talent their fit scores across 5 modeling categories.

---

## Flow Update

**OLD:** Entry → Scout → Measurements → Profile → ~~Badge~~ → Complete

**NEW:** Entry → Scout → Measurements → Profile → **Radar Reveal** → Complete

---

## How to Test

1. **Start the dev servers:**
   ```bash
   npm run dev:all
   ```

2. **Navigate to:** `http://localhost:5173/casting`

3. **Complete the flow:**
   - Entry: Sign in with Google or enter name/DOB
   - Scout: Upload any photo (will get AI predictions)
   - Measurements: Enter these test values:
     ```
     Height: 175 cm
     Weight: 60 kg
     Bust: 86 cm
     Waist: 61 cm
     Hips: 91 cm
     ```
   - Profile: Enter location and experience
   - **Reveal: See your radar chart!**

---

## Expected Output

You should see:

1. **"Analyzing your range..."** (2 second animation)
2. **Radar Chart** with 5 axes:
   - Runway
   - Editorial
   - Commercial
   - Lifestyle
   - Swim/Fitness
3. **Top 3 Categories** as cards with scores
4. **Detailed Insights** for each category
5. **Continue to Dashboard** button

---

## Sample Test Profiles

### Profile A: Runway-Focused
```
Height: 178 cm, Waist: 61 cm, Bust: 86 cm, Hips: 91 cm
Expected: Runway 95, Editorial 88, Commercial 75
```

### Profile B: Commercial-Focused
```
Height: 170 cm, Waist: 66 cm, Bust: 91 cm, Hips: 96 cm
Expected: Commercial 94, Lifestyle 88, Runway 42
```

### Profile C: Athletic
```
Height: 172 cm, Waist: 64 cm, Bust: 84 cm, Hips: 88 cm, Weight: 58 kg
Expected: Swim/Fitness 92, Lifestyle 90, Commercial 81
```

---

## Files to Review

1. **Scoring Logic:** `client/src/utils/fitScoring.js`
   - All algorithms with inline comments
   - Industry standard references

2. **UI Component:** `client/src/routes/casting/CastingRevealRadar.jsx`
   - Recharts radar visualization
   - Animation sequences

3. **Integration:** `client/src/routes/casting/CastingCallPage.jsx`
   - Flow controller
   - Data passing between steps

4. **Documentation:** `docs/RADAR_REVEAL.md`
   - Complete technical spec
   - Scoring breakdowns
   - Industry standards

---

## Customization Points

### Adjust Scoring Weights
Edit `client/src/utils/fitScoring.js`:

```javascript
// Example: Make height more important for editorial
function calculateEditorialScore(profile, ratios) {
  // Change from 40% to 50%
  score += heightScore * 0.5; // Was 0.4
}
```

### Change Visual Style
Edit `client/src/routes/casting/CastingRevealRadar.jsx`:

```javascript
// Change radar fill color
<Radar
  stroke="#C9A55A"     // Border color
  fill="#C9A55A"       // Fill color
  fillOpacity={0.3}    // Transparency
/>
```

### Modify Category Names
Edit the `radarData` array:

```javascript
{ category: 'Runway', score: scores.runway },
// Change to:
{ category: 'High Fashion', score: scores.runway },
```

---

## Troubleshooting

### Issue: Scores all showing 0
**Cause:** Missing height or waist data
**Fix:** Ensure measurements step saves data correctly

### Issue: Radar chart not rendering
**Cause:** Recharts not installed
**Fix:** Run `cd client && npm install recharts`

### Issue: Reveal step skipped
**Cause:** `currentView` state not updated
**Fix:** Check `handleProfileComplete` in CastingCallPage.jsx

---

## Analytics to Monitor

Track these events:
- How many users complete the reveal
- Which categories score highest (distribution)
- Time spent on reveal step
- Does reveal increase dashboard conversion?

---

## Next Steps

1. **Test with real user data** - Beta test with 10-20 talent users
2. **Validate scores** - Compare to actual castings/bookings
3. **Iterate on weights** - Adjust based on real-world feedback
4. **Add save functionality** - Store scores in database
5. **Build agency matching** - Match high scores to seeking agencies

---

## Questions?

See full documentation: `docs/RADAR_REVEAL.md`

**Key Design Principle:**
> "Give talent users a compass, not a judgment. Show them where they fit best in the market based on industry standards, not subjective opinions."
