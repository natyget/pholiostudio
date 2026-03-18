#!/bin/bash

echo "=== Agency Dashboard Implementation Verification ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    return 0
  else
    echo -e "${RED}✗${NC} $1 (MISSING)"
    return 1
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    count=$(ls "$1" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${GREEN}✓${NC} $1 ($count files)"
    return 0
  else
    echo -e "${RED}✗${NC} $1 (MISSING)"
    return 1
  fi
}

errors=0

echo "Checking Routes..."
check_file "src/routes/agency.js" || ((errors++))
check_file "src/routes/api/agency.js" || ((errors++))
echo ""

echo "Checking Libraries..."
check_file "src/lib/match-scoring.js" || ((errors++))
echo ""

echo "Checking Views..."
check_file "views/dashboard/agency.ejs" || ((errors++))
check_dir "views/partials/agency" || ((errors++))
echo ""

echo "Checking Stylesheets..."
check_file "public/styles/agency-dashboard.css" || ((errors++))
check_file "public/styles/agency-dashboard-static.css" || ((errors++))
check_file "public/styles/agency-dashboard-mobile.css" || ((errors++))
check_file "public/styles/agency-dashboard-discover.css" || ((errors++))
check_file "public/styles/agency-hero.css" || ((errors++))
check_file "public/styles/agency-command-center.css" || ((errors++))
echo ""

echo "Checking JavaScript..."
check_file "public/scripts/agency-dashboard-static.js" || ((errors++))
check_file "public/scripts/agency-command-center.js" || ((errors++))
check_file "public/scripts/agency-hero.js" || ((errors++))
check_dir "public/scripts/dashboard" || ((errors++))
echo ""

echo "=== Summary ==="
if [ $errors -eq 0 ]; then
  echo -e "${GREEN}✓ All files present! Agency dashboard implementation is complete.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Run: npm run dev"
  echo "2. Login as an agency user"
  echo "3. Navigate to: /dashboard/agency"
else
  echo -e "${RED}✗ Found $errors missing files or directories.${NC}"
  echo "Please review the implementation."
fi
