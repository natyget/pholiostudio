# Pholio

Pholio is a full-stack talent portfolio and agency management platform with separate domain architecture for optimal performance and SEO.

## Architecture

### Separate Domain Strategy

- **Marketing Site:** `www.pholio.studio` - Next.js 16 (deployed on Vercel)
- **Web Application:** `app.pholio.studio` - Express + React SPA (deployed on Netlify/Railway/Render)

### Tech Stack

- **Marketing:** Next.js 16, TypeScript, Tailwind 4, Framer Motion
- **Backend:** Node.js 20, Express 4, EJS templates
- **Frontend:** React 19, Vite, React Router 7, TailwindCSS
- **Database:** SQLite3 (local) or PostgreSQL/Neon (production)
- **Auth:** Firebase (Web SDK + Admin SDK) + Express sessions
- **Payments:** Stripe
- **PDF:** Puppeteer + EJS templates
- **Image Processing:** Sharp
- **AI:** Groq SDK for photo analysis

## Quick Start

### Prerequisites

- Node.js 20+
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd pholio

# Install dependencies
npm install
cd client && npm install && cd ..
cd landing && npm install && cd ..

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# (Optional) Load seed data
npm run seed
```

### Development

Run all three servers for full-stack development:

```bash
# Terminal 1: Express Backend (Port 3000)
npm run dev

# Terminal 2: React SPA (Port 5173)
npm run client:dev

# Terminal 3: Next.js Landing (Port 3001)
cd landing && npm run dev
```

**Access URLs:**
- Marketing Site: http://localhost:3001
- Web Application: http://localhost:5173 or http://localhost:3000
- API: http://localhost:3000/api

### Testing the Flow

1. Visit Next.js landing: `http://localhost:3001`
2. Click "Get Started" → redirects to `http://localhost:3000/signup`
3. Sign up → redirected to `http://localhost:3000/casting` (onboarding)
4. Complete onboarding → `http://localhost:3000/dashboard/talent`

## Environment Variables

### Development (.env)

```bash
# Database
DB_CLIENT=sqlite3
DATABASE_URL=sqlite://./dev.sqlite3

# Session
SESSION_SECRET=your-random-secret-here

# Domain Configuration
NODE_ENV=development
PORT=3000
MARKETING_SITE_URL=http://localhost:3001
APP_URL=http://localhost:3000
COOKIE_DOMAIN=localhost

# Firebase (get from Firebase Console)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Business Logic
COMMISSION_RATE=0.25
MAX_UPLOAD_MB=8
PDF_BASE_URL=http://localhost:3000
```

### Production

See `.env.production.example` for production configuration template.

**Key differences:**
- `NODE_ENV=production`
- `DB_CLIENT=pg` with PostgreSQL/Neon
- `MARKETING_SITE_URL=https://www.pholio.studio`
- `APP_URL=https://app.pholio.studio`
- `COOKIE_DOMAIN=.pholio.studio`

## Database

### Local Development (SQLite)

Default configuration uses SQLite:
```bash
npm run migrate
npm run seed  # Load sample data
```

**Sample Accounts:**
- Talent: `talent@example.com` / `password123`
- Agency: `agency@example.com` / `password123`

### Production (PostgreSQL/Neon)

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Update `.env`:
   ```bash
   DB_CLIENT=pg
   DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
3. Run migrations: `npm run migrate`

See [NEON_SETUP.md](./NEON_SETUP.md) for detailed guide.

## Deployment

### Marketing Site (www.pholio.studio)

**Platform:** Vercel

```bash
cd landing

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Configuration in Vercel Dashboard:**
- Domain: `www.pholio.studio`
- Environment Variables:
  - `NEXT_PUBLIC_APP_URL=https://app.pholio.studio`
  - `NEXT_PUBLIC_API_URL=https://app.pholio.studio/api`
- Build: Automatic from `main` branch

**DNS (at your domain registrar):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Web Application (app.pholio.studio)

**Platform:** Netlify/Railway/Render (current host)

```bash
# Build React SPA
npm run client:build

# Deploy (example for Netlify)
netlify deploy --prod
```

**Configuration:**
- Domain: `app.pholio.studio`
- Environment Variables: (see `.env.production.example`)
- Build Command: `npm run client:build`
- Start Command: `npm start`

**Post-Deployment:**
```bash
# Run migrations
npm run migrate
```

**DNS (at your domain registrar):**
```
Type: CNAME
Name: app
Value: <your-site>.netlify.app (or your host's DNS target)
```

## Scripts

### Backend
- `npm start` - Start Express server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm test` - Run Jest + Supertest tests

### Frontend
- `npm run client:dev` - Start Vite dev server
- `npm run client:build` - Build React SPA to `public/dashboard-app/`
- `npm run client:lint` - Lint React code

### Database
- `npm run migrate` - Apply pending migrations
- `npm run migrate:status` - Check migration status
- `npm run migrate:rollback` - Rollback last batch
- `npm run seed` - Load seed data
- `npm run test:db` - Test database connection

### Landing Page
- `cd landing && npm run dev` - Start Next.js dev server
- `cd landing && npm run build` - Build for production

## Project Structure

```
pholio/
├── landing/                 # Next.js marketing site
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   ├── public/              # Static assets
│   └── vercel.json          # Vercel deployment config
│
├── client/                  # React SPA (dashboard)
│   ├── src/
│   │   ├── routes/          # Dashboard pages
│   │   ├── components/      # React components
│   │   ├── api/             # API client
│   │   └── hooks/           # React hooks
│   └── vite.config.js       # Vite configuration
│
├── src/                     # Express backend
│   ├── app.js               # Express app setup
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   └── lib/                 # Business logic
│
├── views/                   # EJS templates
│   ├── auth/                # Login/signup pages
│   ├── pdf/                 # PDF templates
│   └── portfolio/           # Public portfolio pages
│
├── migrations/              # Database migrations
├── public/                  # Static assets
│   └── dashboard-app/       # Built React SPA
└── uploads/                 # User uploads
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Test database connection
npm run test:db
```

Tests cover:
- Authentication (login/logout)
- Talent onboarding flow
- File upload and processing
- PDF generation
- Agency commission tracking

## Troubleshooting

### CORS Errors

**Symptom:** "blocked by CORS policy" in browser console

**Solution:**
1. Check `NODE_ENV` is set correctly
2. Verify origin is in `allowedOrigins` (src/app.js)
3. Ensure API calls include `credentials: 'include'`

### Session Not Persisting

**Symptom:** User logged out when navigating between www and app

**Solution:**
1. Check `COOKIE_DOMAIN=.pholio.studio` (with dot)
2. Verify `NODE_ENV=production`
3. Ensure both domains use HTTPS

### PDF Generation Fails

**Symptom:** 500 error on `/pdf/preview`

**Solution:**
1. Verify `views/pdf/compcard.ejs` exists
2. Check Puppeteer/Chromium is installed
3. In serverless, ensure Chromium layer is added

### Build Errors

**Next.js:**
```bash
cd landing
rm -rf .next node_modules
npm install
npm run build
```

**React:**
```bash
cd client
rm -rf dist node_modules
npm install
npm run build
```

## Documentation

- **CLAUDE.md** - Architecture overview and development guide
- **RESTRUCTURE_PLAN_FINAL.md** - Detailed restructuring plan
- **PHASE_X_COMPLETE.md** - Phase completion summaries
- **NEON_SETUP.md** - Database setup guide
- **NETLIFY_DEPLOYMENT.md** - Deployment guide

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team.
