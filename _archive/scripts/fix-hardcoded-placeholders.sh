#!/bin/bash

# Fix Hardcoded Placeholders - Critical Issues
# This script removes all P0 (CRITICAL) hardcoded values

echo "🔧 Fixing Critical Hardcoded Placeholders..."

# Fix #2: SidebarProfile.jsx - Avatar initial 'T'
echo "Fixing SidebarProfile.jsx..."
sed -i '' "s/const initial = profile\?\.first_name\?\.\[0\] || 'T';/const initial = profile?.first_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?';/" \
  "client/src/components/RightSidebar/SidebarProfile.jsx"

# Fix #3: OverviewPage.jsx - "Talent" greeting
echo "Fixing OverviewPage.jsx..."
sed -i '' "s/profile\?\.first_name || 'Talent'/profile?.first_name || 'there'/" \
  "client/src/routes/talent/OverviewPage.jsx"

# Fix #4: HeroCard.jsx - "Talent" greeting
echo "Fixing HeroCard.jsx..."
sed -i '' "s/firstName || 'Talent'/firstName || 'there'/" \
  "client/src/components/HeroCard/HeroCard.jsx"

# Fix #5: OverviewView.jsx - "Talent" in hero-name
echo "Fixing OverviewView.jsx..."
sed -i '' "s/profile\?\.first_name || 'Talent'/profile?.first_name || 'there'/" \
  "client/src/features/dashboard/OverviewView.jsx"

# Fix #6: ProfilePage.jsx - "Your Name" placeholders
echo "Fixing ProfilePage.jsx name placeholders..."
sed -i '' "s/const firstName = values.first_name || 'Your';/const firstName = values.first_name || '';/" \
  "client/src/routes/talent/ProfilePage.jsx"
sed -i '' "s/const lastName = values.last_name || 'Name';/const lastName = values.last_name || '';/" \
  "client/src/routes/talent/ProfilePage.jsx"

# Fix #7: ProfilePage.jsx - "LOS ANGELES" location
echo "Fixing ProfilePage.jsx location..."
sed -i '' "s/\].filter(Boolean).join(' • ') || 'LOS ANGELES'/].filter(Boolean).join(' • ') || ''/" \
  "client/src/routes/talent/ProfilePage.jsx"

# Fix #8: ProfilePage.jsx - "Talent" work status
echo "Fixing ProfilePage.jsx work status..."
sed -i '' "s/const talentType = values.work_status || 'Talent';/const talentType = values.work_status || '';/" \
  "client/src/routes/talent/ProfilePage.jsx"

# Fix #9: ProfilePage.jsx - "Talent" in AI bio
echo "Fixing ProfilePage.jsx AI bio firstName..."
sed -i '' "s/firstName: watch('first_name') || 'Talent',/firstName: watch('first_name') || '',/" \
  "client/src/routes/talent/ProfilePage.jsx"

# Fix #10: CRITICAL - Remove database corruption in casting.js
echo "🚨 CRITICAL: Removing database auto-fill of 'Talent'..."
sed -i '' "/if (!profile.first_name) updatePayload.first_name = 'New';/d" \
  "src/routes/casting.js"
sed -i '' "/if (!profile.last_name) updatePayload.last_name = 'Talent';/d" \
  "src/routes/casting.js"

# Fix #11: SidebarProfile.jsx - Hardcoded progress 75%
echo "Fixing SidebarProfile.jsx progress..."
sed -i '' "s/const targetProgress = 75;/const targetProgress = completeness?.percentage || 0;/" \
  "client/src/components/RightSidebar/SidebarProfile.jsx"

# Fix #12: Header.jsx - Mock notification count
echo "Fixing Header.jsx notification count..."
sed -i '' "s/const \[unreadCount, setUnreadCount\] = useState(2);/const [unreadCount, setUnreadCount] = useState(0);/" \
  "client/src/components/Header/Header.jsx"

echo "✅ All critical fixes applied!"
echo ""
echo "Files modified:"
echo "  - client/src/components/Header/Header.jsx"
echo "  - client/src/components/RightSidebar/SidebarProfile.jsx"
echo "  - client/src/routes/talent/OverviewPage.jsx"
echo "  - client/src/routes/talent/ProfilePage.jsx"
echo "  - client/src/components/HeroCard/HeroCard.jsx"
echo "  - client/src/features/dashboard/OverviewView.jsx"
echo "  - src/routes/casting.js (DATABASE CORRUPTION FIX)"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Test manually with real user data"
echo "  3. Commit: git commit -am 'fix: Remove all hardcoded placeholders'"
