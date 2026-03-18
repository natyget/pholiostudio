# Pholio

Pholio is a full-stack talent portfolio and agency management platform with separate domain architecture for optimal performance and SEO.

## Architecture

### Separate Domain Strategy

| App | Tech | Port | Domain |
|-----|------|------|--------|
| Marketing | Next.js 16 (SSG/SSR) | 3001 | www.pholio.studio |
| React SPA | Vite + React 19 | 5173 | app.pholio.studio |
| Express API | Node.js 20, Express 5 | 3000 | app.pholio.studio |

Both the React SPA and Express API are deployed together on **Netlify** (Express as a serverless function via `serverless-http`). The marketing site deploys separately.

### Tech Stack

- **Marketing:** Next.js 16, TypeScript, Tailwind 4, Framer Motion, GSAP, Lenis
- **Backend:** Node.js 20, Express 5, CommonJS modules
- **Frontend:** React 19, Vite, React Router 7, TailwindCSS 4
- **Database:** SQLite3 (local dev) or PostgreSQL/Neon (production), via Knex.js
- **Auth:** Firebase (Web SDK + Admin SDK) + Express sessions
- **Payments:** Stripe (subscriptions, webhooks)
- **PDF:** Puppeteer + `@sparticuz/chromium` + EJS templates
- **Image Processing:** Sharp
- **AI:** Groq SDK for photo analysis
- **Serverless:** `serverless-http` v3.2.0 wraps Express for Netlify Functions

## Quick Start

### Prerequisites

- Node.js 20+
- Git

### Installation

```bash
# Clone repository
git clone <repository-url>
cd pholio

# Install all dependencies
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

```bash
# Recommended: run everything at once
npm run dev:all    # Express :3000 + Vite :5173

# Or individually:
npm run dev        # Express backend on :3000
npm run client:dev # Vite React SPA on :5173 (proxies /api to :3000)
cd landing && npm run dev  # Next.js marketing site on :3001
```

**Access URLs:**
- Marketing Site: http://localhost:3001
- Web Application: http://localhost:5173
- API: http://localhost:3000/api

### Testing the Flow

1. Visit Next.js landing: `http://localhost:3001`
2. Click "Get Started" → redirects to `http://localhost:3000/signup`
3. Sign up → onboarding flow → `http://localhost:5173/dashboard/talent`

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

### Production (Netlify Environment Variables)

Set these in **Netlify UI → Site settings → Environment variables**:

```bash
NODE_ENV=production
DB_CLIENT=pg
DATABASE_URL=postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require
SESSION_SECRET=<long-random-string>

MARKETING_SITE_URL=https://www.pholio.studio
APP_URL=https://app.pholio.studio
COOKIE_DOMAIN=.pholio.studio

# Firebase (same keys as dev)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...

# Optional
COMMISSION_RATE=0.25
MAX_UPLOAD_MB=8
```

## Database

### Local Development (SQLite)

```bash
npm run migrate
npm run seed  # Load sample data
```

**Sample Accounts:**
- Talent: `talent@example.com` / `password123`
- Agency: `agency@example.com` / `password123`

### Production (PostgreSQL/Neon)

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Copy the connection string — hostname must start with `ep-`
3. Set `DB_CLIENT=pg` and `DATABASE_URL=postgresql://...` in Netlify env vars
4. After first deploy, run migrations via the API endpoint:
   ```
   POST https://app.pholio.studio/api/migrate?secret=YOUR_MIGRATION_SECRET
   ```

## Deployment

### Web Application (app.pholio.studio) — Netlify

The Express API + React SPA deploy together as a single Netlify site.

**How it works:**
- `netlify/function/server.js` wraps the Express app with `serverless-http` v3.2.0
- Netlify builds the React SPA (`public/dashboard-app/`) via `npm run client:build`
- Static files are served from `public/` by Netlify CDN
- All other requests (`/*`) proxy to the `server` Netlify Function
- The function runs with 26s timeout and 3008 MB memory (Pro tier required for Puppeteer)

**Deploy steps:**
1. Connect the repo to a Netlify site
2. Set all production environment variables in the Netlify UI
3. Deploy — Netlify runs `npm run client:build` automatically
4. Run migrations via `POST /api/migrate?secret=...`

**DNS:**
```
Type: CNAME
Name: app
Value: <your-site>.netlify.app
```

### Marketing Site (www.pholio.studio)

Deploy the `landing/` directory as a separate site (Vercel or Netlify).

**Required env vars:**
- `NEXT_PUBLIC_APP_URL=https://app.pholio.studio`
- `NEXT_PUBLIC_API_URL=https://app.pholio.studio/api`

**DNS:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com  (Vercel) or <site>.netlify.app (Netlify)
```

## Scripts

### Root (Backend + Orchestration)
- `npm start` - Start Express server
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run dev:all` - Run Express + Vite concurrently
- `npm test` - Run Jest + Supertest integration tests
- `npm run test:db` - Test database connection

### Frontend
- `npm run client:dev` - Start Vite dev server (:5173)
- `npm run client:build` - Build React SPA to `public/dashboard-app/`

### Database
- `npm run migrate` - Apply pending migrations
- `npm run migrate:status` - Check migration status
- `npm run migrate:rollback` - Rollback last batch
- `npm run seed` - Load seed data

### Landing Page
- `cd landing && npm run dev` - Start Next.js dev server (:3001)
- `cd landing && npm run build` - Build for production

## Project Structure

```
pholio/
├── landing/              # Next.js 16 marketing site (www.pholio.studio)
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (Studio+, Agency scenes)
│   └── public/           # Static assets
│
├── client/               # React 19 SPA (app.pholio.studio dashboard)
│   ├── src/
│   │   ├── routes/       # Page-level components (talent/, agency/)
│   │   ├── components/   # Shared UI components
│   │   ├── api/          # API client (fetch wrapper + named methods)
│   │   ├── features/     # Feature modules (media, applications, analytics)
│   │   └── hooks/        # Custom hooks (useAuth, useProfile, useMedia)
│   └── vite.config.js    # Vite config (base: /dashboard-app/ in prod)
│
├── src/                  # Express 5 backend
│   ├── app.js            # Express app + middleware chain
│   ├── routes/           # Route handlers (auth, talent/, agency/, api/)
│   ├── middleware/        # requireAuth, requireRole, etc.
│   └── lib/              # Business logic (pdf, uploader, ai/, onboarding/)
│
├── views/                # EJS templates
│   ├── auth/             # Login/signup pages
│   ├── pdf/              # Comp card PDF template
│   └── portfolio/        # Public portfolio pages
│
├── migrations/           # Knex database migrations
├── seeds/                # Knex seed files
├── netlify/
│   └── function/
│       └── server.js     # Netlify Function entry point (serverless-http)
├── netlify.toml          # Netlify build + function config
├── public/               # Static files (Netlify publish dir)
│   └── dashboard-app/    # Built React SPA (generated by client:build)
└── uploads/              # Local file uploads (dev only; use S3 in prod)
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npx jest path/to/test.js

# Test database connection
npm run test:db
```

## Troubleshooting

### Netlify Function crashes on boot

**Symptom:** `Cannot find module './get-event-type'` in function logs

**Solution:** Ensure `serverless-http` is pinned to `3.2.0` in `package.json`. v4.x has a module resolution bug with the `nft` bundler.

### CORS Errors

**Symptom:** "blocked by CORS policy" in browser console

**Solution:**
1. Check `NODE_ENV` is set correctly
2. Verify origin is in `allowedOrigins` (`src/app.js`)
3. Ensure API calls include `credentials: 'include'`

### Session Not Persisting

**Symptom:** User logged out between `www` and `app` subdomains

**Solution:**
1. `COOKIE_DOMAIN=.pholio.studio` (leading dot required)
2. `NODE_ENV=production`
3. Both domains must use HTTPS

### PDF Generation Fails

**Symptom:** 500 error on `/pdf/preview`

**Solution:**
1. Verify `views/pdf/compcard.ejs` exists
2. Netlify Pro tier required (26s timeout, 3GB memory for Puppeteer)
3. Confirm `@sparticuz/chromium` is installed

### Build Errors

**React SPA:**
```bash
cd client
rm -rf dist node_modules
npm install
npm run build
```

**Next.js:**
```bash
cd landing
rm -rf .next node_modules
npm install
npm run build
```

## Documentation

- **CLAUDE.md** — Architecture overview and development guide for AI assistants
- **PHOLIO_OVERVIEW.md** — Product overview and feature summary
- **PHOLIO_BRAND_GUIDELINES.md** — Visual design system and brand standards

## License

Private — All rights reserved
