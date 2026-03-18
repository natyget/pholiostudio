# Casting Call Phase 3 - Installation Instructions

## Required NPM Packages

The following packages need to be installed in the `client/` directory:

```bash
cd client

# Core dependencies
npm install firebase
npm install react-dropzone
npm install chart.js react-chartjs-2

# Already installed (verify):
# - @tanstack/react-query (React Query)
# - react-router-dom
# - sonner (toast notifications)
```

## Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Authentication** → **Sign-in method** → **Google**
4. Get your Firebase config from Project Settings

### 2. Add Environment Variables

Create `client/.env.local`:

```bash
# Firebase Client Config
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**IMPORTANT:** Add `.env.local` to `.gitignore` if not already there.

### 3. Backend Firebase Admin SDK

Ensure your backend `.env` has:

```bash
FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json
# OR
FIREBASE_SERVICE_ACCOUNT_JSON='{"type": "service_account", ...}'
```

## Verify Installation

```bash
# In client/ directory
npm run dev

# Visit http://localhost:5173/casting
# Should see the Casting Entry page
```

## Troubleshooting

### Firebase Auth Errors

- **"auth/popup-blocked"**: Enable pop-ups in browser
- **"auth/invalid-api-key"**: Check `VITE_FIREBASE_API_KEY` in `.env.local`
- **"auth/configuration-not-found"**: Enable Google sign-in in Firebase Console

### Chart.js Issues

If radar chart doesn't render, ensure Chart.js v4+ is installed:

```bash
npm list chart.js
# Should show ^4.0.0
```

### React Query Issues

If API hooks fail, verify React Query is set up in `main.jsx`:

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## Next Steps

1. Install dependencies
2. Configure Firebase
3. Test `/casting` route
4. Deploy to staging/production

**Phase 3 Complete!** 🎉
