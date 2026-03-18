# Dead Ends & Placeholders Audit
**Date:** 2026-02-04
**Scope:** User-facing features in Pholio Talent Dashboard

---

## 🚨 CRITICAL DEAD ENDS (User-Facing)

### 1. **Settings Page**
- **Location:** `/dashboard/talent/settings`
- **Status:** ❌ PLACEHOLDER - Shows only "Settings Page" text
- **File:** `client/src/App.jsx:13`
- **Impact:** HIGH - Link in header dropdown (line 216-222)
- **Fix Needed:** Build complete settings page with:
  - Account preferences
  - Notification settings
  - Privacy controls
  - Password change

### 2. **PDF Customizer Page**
- **Location:** `/dashboard/talent/pdf-customizer`
- **Status:** ❌ PLACEHOLDER - Shows only "PDF Customizer Page" text
- **File:** `client/src/App.jsx:14`
- **Impact:** MEDIUM - No visible links to this page yet
- **Fix Needed:** Build PDF theme selector interface

### 3. **Pricing Page** (Studio+ Upgrade)
- **Location:** `/pricing`
- **Status:** ❌ DEAD END - Route doesn't exist in React app
- **Impact:** CRITICAL - Multiple links throughout app:
  - Header upgrade button (`Header.jsx:96`)
  - Profile dropdown upgrade link (`Header.jsx:226`)
  - Overview page upgrade button (`OverviewView.jsx:335`)
  - Right sidebar upsell card (`RightSidebar.jsx:106`)
- **Fix Needed:** Create pricing page route or redirect to main site

### 4. **Apple Wallet Integration**
- **Location:** Multiple places
- **Status:** ❌ NOT IMPLEMENTED
- **Instances:**
  - Overview page: Shows toast "Apple Wallet integration coming soon!" (`OverviewView.jsx:44`)
  - Right sidebar: Shows alert "Apple Wallet Integration Coming Soon" (`RightSidebar.jsx:59`)
- **Impact:** MEDIUM - Users can click but nothing happens
- **Fix Needed:** Either implement or remove buttons

### 5. **Comp Card Download**
- **Location:** Overview page download button
- **Status:** ⚠️ PARTIALLY IMPLEMENTED
- **File:** `client/src/features/dashboard/OverviewView.jsx:16`
- **Code:** Has TODO comment: `// TODO: Call backend PDF generator endpoint`
- **Backend:** `src/lib/pdf.js:38` returns `Buffer.from('PDF placeholder for ${slug}')`
- **Impact:** HIGH - Core feature, generates placeholder instead of real PDF
- **Fix Needed:** Implement actual PDF generation with Puppeteer or similar

### 6. **Email Functionality**
- **Location:** Backend email service
- **Status:** ❌ NOT IMPLEMENTED
- **File:** `src/lib/email.js:16`
- **Code:** `// TODO: Implement actual email sending service (e.g., SendGrid, AWS SES, etc.)`
- **Impact:** HIGH - No emails are sent (password reset, notifications, etc.)
- **Fix Needed:** Integrate email service provider

### 7. **Instagram OAuth**
- **Location:** Onboarding provider
- **Status:** ❌ NOT IMPLEMENTED
- **File:** `src/lib/onboarding/providers/instagram.js:8`
- **Code:** `// TODO: Implement Instagram OAuth code exchange`
- **Impact:** MEDIUM - Instagram login won't work
- **Fix Needed:** Complete Instagram OAuth flow

---

## ⚠️ MOCK DATA & PLACEHOLDERS

### 8. **Notification System**
- **Status:** 🔶 USING MOCK DATA
- **File:** `client/src/components/Header/NotificationDropdown.jsx:35`
- **Issue:** Uses `MOCK_NOTIFICATIONS` combined with real activity logs
- **Impact:** MEDIUM - Users see fake notifications
- **Fix:** Remove mock notifications, use only real data

### 9. **Unread Count**
- **Status:** 🔶 HARDCODED
- **File:** `client/src/components/Header/Header.jsx:35`
- **Code:** `const [unreadCount, setUnreadCount] = useState(2); // Starting with 2 unread mock items`
- **Impact:** LOW - Always shows 2 unread even if none exist
- **Fix:** Calculate from real notification data

### 10. **Overview Stats**
- **Status:** 🔶 MOCK DATA
- **File:** `client/src/features/dashboard/OverviewView.jsx:63`
- **Code:** `// Mock stats - replace with real data`
- **Impact:** MEDIUM - Stats show hardcoded values instead of real analytics
- **Fix:** Connect to real analytics API (already exists at `/api/talent/analytics/summary`)

---

## 🔗 BROKEN/MISSING LINKS

### 11. **Quick Actions - Public Preview**
- **Location:** Right sidebar quick actions
- **Link:** `/public/preview`
- **Status:** ❌ ROUTE NOT DEFINED
- **File:** `client/src/components/RightSidebar/RightSidebar.jsx:47`
- **Impact:** MEDIUM - Dead link in sidebar
- **Fix:** Should link to `/talent/${slug}` instead

### 12. **Quick Actions - Comp Card Download**
- **Location:** Right sidebar quick actions
- **Link:** `/dashboard/talent/comp-card`
- **Status:** ❌ ROUTE NOT DEFINED
- **File:** `client/src/components/RightSidebar/RightSidebar.jsx:53`
- **Impact:** MEDIUM - Dead link in sidebar
- **Fix:** Create route or use same handler as overview page

---

## 📝 IMPLEMENTATION NOTES

### 13. **Subscription Status**
- **File:** `src/routes/talent/profile.api.js:50`
- **Code:** `status: 'active', // Placeholder for now`
- **Impact:** LOW - Hardcoded subscription status
- **Fix:** Connect to real subscription system

### 14. **Notification Settings**
- **File:** `src/routes/talent/settings.api.js:34`
- **Code:** `notifications: {} // Placeholder for future implementation`
- **Impact:** LOW - Settings endpoint incomplete
- **Fix:** Implement notification preferences

---

## ✅ RECOMMENDATIONS (Priority Order)

### **Immediate (Week 1)**
1. ✅ Fix `/pricing` dead end - Create route or redirect
2. ✅ Fix Overview stats to use real analytics API
3. ✅ Fix public preview link to use actual profile slug
4. ✅ Remove or implement Apple Wallet buttons

### **High Priority (Week 2)**
5. ✅ Build Settings page with basic functionality
6. ✅ Implement real PDF generation for comp cards
7. ✅ Fix comp card download route in sidebar
8. ✅ Remove mock notifications, use real data only

### **Medium Priority (Week 3-4)**
9. ✅ Implement email service (SendGrid/AWS SES)
10. ✅ Build PDF Customizer page
11. ✅ Complete Instagram OAuth flow

### **Low Priority (Backlog)**
12. ✅ Connect subscription status to real system
13. ✅ Implement notification settings backend

---

## 📊 SUMMARY

- **Critical Dead Ends:** 7
- **Mock Data Issues:** 3
- **Broken Links:** 2
- **Minor Placeholders:** 2

**Total Issues:** 14 user-facing problems

**Estimated Fix Time:** 2-3 weeks for critical + high priority items
