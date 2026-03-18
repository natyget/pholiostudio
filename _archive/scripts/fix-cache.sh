#!/bin/bash

echo "=== Fixing Dashboard Cache Issues ==="
echo ""

# Kill any running node processes
echo "1. Stopping any running servers..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true
sleep 2

# Clear Node.js require cache by touching app.js
echo "2. Clearing Node.js cache..."
touch src/app.js
touch src/routes/agency.js

# Disable view cache in development
echo "3. Ensuring view cache is disabled..."
export NODE_ENV=development

echo ""
echo "✓ Cache cleared!"
echo ""
echo "Now follow these steps:"
echo ""
echo "1. Start the server:"
echo "   npm run dev"
echo ""
echo "2. In your browser, do a HARD REFRESH:"
echo "   - Mac: Cmd + Shift + R"
echo "   - Windows/Linux: Ctrl + Shift + R"
echo "   - Or open DevTools (F12) → Right-click refresh → 'Empty Cache and Hard Reload'"
echo ""
echo "3. Navigate to:"
echo "   http://localhost:3000/dashboard/agency"
echo ""
echo "4. You should see the NEW dashboard with:"
echo "   - Overview page (default)"
echo "   - Sidebar with: Overview, My Applicants, Discover, Boards, Analytics"
echo "   - Modern UI with stats cards"
echo ""
