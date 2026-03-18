# 🔍 TALENT DASHBOARD AUDIT - DETAILED FINDINGS
**Date:** February 4, 2026
**Focus:** React Talent Dashboard (`client/src/`)
**Total Issues Found:** 23

---

## ⚠️ CRITICAL ISSUES (8)

### 1. **Hardcoded Stats on Overview Page** 🚨
**File:** `client/src/features/dashboard/OverviewView.jsx:63-69`

```javascript
// Mock stats - replace with real data
const stats = {
  views: 246,        // ❌ FAKE
  downloads: 0,      // ❌ FAKE
  applications: 0,   // ❌ FAKE
  profileStrength: completeness?.percentage || 0
};
```

**Problem:** Every user sees "246 views" regardless of actual traffic
**Expected:** Real data from `/api/talent/analytics/summary`
**Fix:** Replace with API call using `useAnalytics` hook

---

### 2. **Apple Wallet Integration - Dead Button** 🚨
**Files:**
- `client/src/features/dashboard/OverviewView.jsx:43-45`
- `client/src/components/RightSidebar/RightSidebar.jsx:59`

```javascript
const handleAddToWallet = () => {
  toast.info('Apple Wallet integration coming soon!');
};
```

**Problem:** Button shows "Coming Soon" toast instead of working
**User sees:** Prominent button in Overview page
**User expects:** Add comp card to Apple Wallet
**Reality:** Nothing happens

**Fix Options:**
- Remove both buttons entirely
- Add actual Apple Wallet pass generation

---

### 3. **Comp Card Download - Broken** 🚨
**File:** `client/src/features/dashboard/OverviewView.jsx:16`

```javascript
// TODO: Call backend PDF generator endpoint
const response = await fetch('/api/talent/comp-card', {
  method: 'POST',
});
```

**Problem:**
- Has TODO comment indicating unfinished
- Backend at `src/lib/pdf.js:38` returns: `Buffer.from('PDF placeholder for ${slug}')`
- User gets fake PDF with text instead of designed comp card

**Impact:** Primary dashboard action doesn't work
**Appears in:** 3 places (Overview, Quick Actions, Next Steps)

---

### 4. **Pricing Page - 404 Error** 🚨
**4 Broken Links to `/pricing`:**
1. Header "Studio+" pill (`Header.jsx:96`)
2. Profile dropdown "Upgrade to Studio+" (`Header.jsx:226`)
3. Overview upgrade button (`OverviewView.jsx:335`)
4. Sidebar upsell card (`RightSidebar.jsx:106`)

**Problem:** Route doesn't exist in `App.jsx`
**Result:** Users cannot upgrade to paid plan

---

### 5. **PDF Preview Route Missing** 🚨
**File:** `client/src/features/media/MediaGallery.jsx:188`

```javascript
<a href="/pdf/preview" className="action-link">
  <span>View Comp Card</span>
</a>
```

**Problem:** `/pdf/preview` route not defined
**Result:** 404 when clicking "View Comp Card" in media page

---

### 6. **Comp Card Sidebar Link - Dead** 🚨
**File:** `client/src/components/RightSidebar/RightSidebar.jsx:53`

```javascript
<Link to="/dashboard/talent/comp-card">
  Download Comp Card
</Link>
```

**Problem:** Route `/dashboard/talent/comp-card` doesn't exist
**Result:** Clicking does nothing

---

### 7. **Settings Page - Empty Placeholder** 🚨
**File:** `client/src/App.jsx:13`

```javascript
const SettingsPage = () => <div>Settings Page</div>;
```

**Problem:** Route exists but shows only text "Settings Page"
**Linked from:** Header dropdown, sidebar
**Expected:** Full settings interface with account, notifications, privacy
**Reality:** Blank page with text

---

### 8. **PDF Customizer - Empty Placeholder** 🚨
**File:** `client/src/App.jsx:14`

```javascript
const PdfCustomizerPage = () => <div>PDF Customizer Page</div>;
```

**Problem:** Same as Settings - just placeholder text
**Expected:** Theme selector for comp card customization

---

## 🔶 HIGH PRIORITY ISSUES (6)

### 9. **Analytics Charts Show Fake Data**
**Files:**
- `SessionsBarChart.jsx:9-17` - Fake sessions (450, 380, etc.)
- `CohortHeatmap.jsx:8-15` - Fake retention (100%, 5.8%, 3.2%)
- `WeeklyBarChart.jsx:9-17` - Fake weekly activity (12, 19, etc.)

```javascript
const defaultData = [
  { time: 'Mon', value: 450 },  // ❌ Not user's real data
  { time: 'Tue', value: 380 },
  // ...
];
const displayData = data.length > 0 ? data : defaultData;
```

**Problem:** When no data exists, shows fake data instead of empty state
**Impact:** Users think they have analytics when they don't
**Fix:** Show empty state message: "No sessions yet. Share your profile to track analytics."

---

### 10. **Hardcoded Retention Metrics**
**File:** `client/src/hooks/useAnalytics.js:79-83`

```javascript
retention: {
  value: 24,     // ❌ Always 24%
  trend: -2,     // ❌ Always -2
  sparkline: [22, 25, 24, 26, 25, 24, 24],  // ❌ Fake chart data
  chartLabel: 'Retention Rate'
}
```

**Problem:** Retention is completely fake - not fetched from API
**Impact:** Studio+ users see false retention metrics

---

### 11. **Bio AI Refinement - May Not Work**
**File:** `client/src/routes/talent/ProfilePage.jsx:91-101`

```javascript
const response = await fetch('/api/talent/bio/refine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ bio: currentBio, firstName, lastName }),
});
```

**Problem:** Endpoint exists but may not have real AI implementation
**Needs verification:** Check if backend actually calls AI service or returns mock

---

### 12. **Analytics Insights Button Does Nothing**
**File:** `client/src/features/analytics/AnalyticsView.jsx:488-490`

```javascript
<button className="insights-btn">
  Update Portfolio
</button>
```

**Problem:** No `onClick` handler
**Expected:** Navigate to profile/media page
**Reality:** Nothing happens

---

### 13. **"More Options" Button - No Handler**
**File:** `client/src/features/analytics/components/MetricCardDetailed.jsx:36-39`

```javascript
<button className="p-1 hover:bg-slate-100 rounded-lg">
  <MoreHorizontal size={18} />
</button>
```

**Problem:** Three-dot menu button has no onClick
**Impact:** Misleading UI - looks interactive but isn't

---

### 14. **Public Preview Link Broken**
**File:** `client/src/components/RightSidebar/RightSidebar.jsx:47`

```javascript
<Link to="/public/preview">
  View Public Link
</Link>
```

**Problem:** Should be `/talent/${profile.slug}` instead
**Result:** 404 error

---

## 🔸 MEDIUM PRIORITY ISSUES (6)

### 15. **Export Analytics - No Error Handling**
**File:** `client/src/features/analytics/AnalyticsView.jsx:359`

```javascript
onClick={() => window.location.href = `/api/talent/analytics/export${window.location.search}`}
```

**Problem:** Backend returns 403 for free users, but UI doesn't show graceful error
**Fix:** Check subscription before allowing click, show upgrade modal

---

### 16. **Console Errors Throughout**
**Found in:**
- `ProfilePage.jsx` (lines 113, 173, 333, 1024)
- `OverviewView.jsx` (line 36)
- `PhotosTab.jsx` (lines 29, 43, 77)

**Problem:** `console.error()` statements left in production code
**Impact:** Unprofessional, may leak sensitive information
**Fix:** Replace with proper error tracking service (Sentry, etc.)

---

### 17-22. **Other Medium Issues**
- Image upload error handling incomplete
- Profile save error handling incomplete
- Notification mark-read functionality partial
- Analytics date range picker validation missing
- Applications page filter state not persisted

---

## ⚪ LOW PRIORITY ISSUES (3)

### 23. **External Placeholder Image Dependency**
**File:** `client/src/features/profile/ProfilePreview.jsx:10`

```javascript
if (!path) return 'https://via.placeholder.com/400x600?text=No+Image';
```

**Problem:** Relies on external service (via.placeholder.com)
**Risk:** If service goes down, broken images
**Fix:** Use local SVG placeholder or CSS-only placeholder

---

## 📊 SUMMARY TABLE

| Severity | Count | Action Required |
|----------|-------|-----------------|
| 🚨 CRITICAL | 8 | Must fix before launch |
| 🔶 HIGH | 6 | Fix within 1 week |
| 🔸 MEDIUM | 6 | Fix within 2 weeks |
| ⚪ LOW | 3 | Backlog |
| **TOTAL** | **23** | |

---

## ✅ RECOMMENDED FIX ORDER

### **This Week (Critical Path)**
1. ✅ Replace hardcoded Overview stats with real API data
2. ✅ Fix or remove Apple Wallet buttons
3. ✅ Create `/pricing` route or redirect to main site
4. ✅ Fix `/pdf/preview` and `/comp-card` routes
5. ✅ Either implement Settings page or remove link

### **Next Week (High Priority)**
6. ✅ Remove all default mock data from analytics charts
7. ✅ Add onClick handlers to all action buttons
8. ✅ Fix retention metrics in useAnalytics hook
9. ✅ Test Bio AI refinement endpoint
10. ✅ Fix public preview link

### **Week 3 (Medium Priority)**
11. ✅ Add proper error handling for Studio+ features
12. ✅ Remove console.log/error statements
13. ✅ Replace external placeholder image

---

## 🔧 QUICK FIXES (Copy-Paste Ready)

### Fix #1: Replace Hardcoded Overview Stats
```javascript
// BEFORE (OverviewView.jsx)
const stats = {
  views: 246,  // ❌ Hardcoded
  downloads: 0,
  applications: 0,
};

// AFTER
const { summary } = useAnalytics();
const stats = {
  views: summary?.views?.total || 0,
  downloads: summary?.downloads?.total || 0,
  applications: 0, // TODO: Add to API
  profileStrength: completeness?.percentage || 0
};
```

### Fix #2: Remove Apple Wallet Buttons
```javascript
// DELETE these sections from OverviewView.jsx (lines 228-240)
// DELETE from RightSidebar.jsx (lines 58-63)
// OR implement actual Apple Wallet pass generation
```

### Fix #3: Create Pricing Route
```javascript
// Add to App.jsx
import PricingPage from './routes/PricingPage';

// In <Routes>:
<Route path="/pricing" element={<PricingPage />} />
```

---

**Agent ID for resuming:** `a3ae2e7`
**Next Steps:** Would you like me to start implementing these fixes?
