# Routing Architecture Analysis

**Generated:** 2025-01-27

## Executive Summary

This report analyzes the routing structure, connections, and data flow of the Pholio application. It identifies all route files, their endpoints, middleware usage, and connections to templates, APIs, and database operations.

---

## Table of Contents

1. [Route Registration Overview](#route-registration-overview)
2. [Route Files Inventory](#route-files-inventory)
3. [Endpoint Mapping](#endpoint-mapping)
4. [Middleware Usage](#middleware-usage)
5. [Template Connections](#template-connections)
6. [API Endpoints](#api-endpoints)
7. [Database Connections](#database-connections)
8. [Authentication & Authorization Flow](#authentication--authorization-flow)
9. [Data Flow Diagrams](#data-flow-diagrams)
10. [Potential Issues & Recommendations](#potential-issues--recommendations)

---

## 1. Route Registration Overview

### Main Application File: `src/app.js`

The Express application registers routes in the following order:

```javascript
// Route registration order (critical for middleware and path matching)
app.use('/', authRoutes);              // Authentication routes
app.use('/', applyRoutes);             // Application/onboarding routes
app.use('/', dashboardIndexRoutes);    // Dashboard redirect logic
app.use('/', dashboardTalentRoutes);   // Talent dashboard routes
app.use('/', dashboardAgencyRoutes);   // Agency dashboard routes
app.use('/', portfolioRoutes);         // Public portfolio routes
app.use('/', pdfRoutes);               // PDF generation routes
app.use('/', uploadRoutes);            // File upload routes
app.use('/', agencyRoutes);            // Agency management routes
app.use('/', proRoutes);               // Pro/Studio+ upgrade routes
app.use('/stripe', stripeRoutes);      // Stripe payment routes (prefix: /stripe)
app.use('/', chatRoutes);              // Chat/AI onboarding routes
app.use('/', scoutRoutes);             // Scout image analysis routes
```

**Note:** There is also a `src/routes/dashboard.js` file that appears to be a legacy/duplicate file and is NOT registered in `app.js`. The dashboard routes are handled by `dashboard-index.js`, `dashboard-talent.js`, and `dashboard-agency.js`.

**Route Matching Order:**
- Routes are matched in registration order
- More specific routes should be registered before generic ones
- `/` prefix means routes are mounted at root level

---

## 2. Route Files Inventory

### Core Route Files

| File | Purpose | Endpoints | Auth Required | Registered |
|------|---------|-----------|---------------|------------|
| `src/routes/auth.js` | Authentication (login, signup, Google OAuth) | `/login`, `/signup`, `/logout`, `/partners` | No | ✅ Yes |
| `src/routes/apply.js` | Talent onboarding form | `/apply`, `/apply/:agencySlug`, `/api/agencies/search` | No | ✅ Yes |
| `src/routes/dashboard-index.js` | Dashboard router (redirects based on role) | `/dashboard` | Yes | ✅ Yes |
| `src/routes/dashboard-talent.js` | Talent dashboard (profile management) | `/dashboard/talent`, `/api/talent/*` | Yes (TALENT) | ✅ Yes |
| `src/routes/dashboard-agency.js` | Agency dashboard (applicant management) | `/dashboard/agency`, `/api/agency/*` | Yes (AGENCY) | ✅ Yes |
| `src/routes/portfolio.js` | Public talent portfolios | `/portfolio/:slug` | No | ✅ Yes |
| `src/routes/pdf.js` | PDF comp card generation | `/pdf/:slug`, `/api/pdf/*` | Partial | ✅ Yes |
| `src/routes/upload.js` | File upload handling | `/api/upload/*` | Yes (TALENT) | ✅ Yes |
| `src/routes/agency.js` | Agency management | `/agency/claim` | Yes (AGENCY) | ✅ Yes |
| `src/routes/pro.js` | Pro/Studio+ upgrade | `/pro/upgrade` | Yes (TALENT) | ✅ Yes |
| `src/routes/stripe.js` | Stripe payment routes | `/stripe/*` | Yes (TALENT) | ✅ Yes |
| `src/routes/stripe-webhook.js` | Stripe webhook handler | `/stripe/webhook` | No (signature verified) | ✅ Yes (in app.js directly) |
| `src/routes/chat.js` | AI onboarding chat system | `/api/chat/*` | Session-based | ✅ Yes |
| `src/routes/scout.js` | Image analysis (Scout AI) | `/api/upload` | Session-based | ✅ Yes |
| `src/routes/dashboard.js` | **LEGACY/UNUSED** | Various dashboard routes | Yes | ❌ **NOT REGISTERED** |

---

## 3. Endpoint Mapping

### Public Routes (No Authentication)

#### Authentication Routes (`src/routes/auth.js`)
- `GET /login` - Login page
- `POST /login` - Login form submission
- `GET /signup` - Signup page
- `POST /signup` - Signup form submission
- `POST /logout` - Logout (destroys session)
- `POST /auth/google` - Google OAuth callback

#### Application Routes (`src/routes/apply.js`)
- `GET /apply` - Talent application/onboarding page
- `GET /apply/success` - Application success page

#### Portfolio Routes (`src/routes/portfolio.js`)
- `GET /portfolio/:slug` - Public talent portfolio view

### Protected Routes (Authentication Required)

#### Dashboard Routes (`src/routes/dashboard-index.js`)
- `GET /dashboard` - Redirects to `/dashboard/talent` or `/dashboard/agency` based on user role

#### Talent Dashboard (`src/routes/dashboard-talent.js`)
- `GET /dashboard/talent` - Talent dashboard (profile management)
- `POST /dashboard/talent` - Update talent profile
- `GET /api/talent/*` - Talent-specific API endpoints
- **Middleware:** `requireRole('TALENT')`

#### Agency Dashboard (`src/routes/dashboard-agency.js`)
- `GET /dashboard/agency` - Agency dashboard (applicant management)
- `POST /dashboard/agency/*` - Agency actions (applications, invites)
- `GET /api/agency/*` - Agency-specific API endpoints
- **Middleware:** `requireRole('AGENCY')`

#### PDF Routes (`src/routes/pdf.js`)
- `GET /pdf/:slug` - Generate and download PDF comp card
- `GET /api/pdf/preview/:slug` - PDF preview
- `POST /api/pdf/customize` - PDF customization (Studio+ only)

### API Routes

#### Chat/AI Routes (`src/routes/chat.js`)
- `POST /api/chat` - Maverick chat message
- `POST /api/chat/initialize` - Initialize chat session
- `GET /api/chat/status` - Get chat status
- `POST /api/chat/finalize` - Finalize onboarding
- **Middleware:** Session-based (requires `req.session.userId`)

#### Scout Routes (`src/routes/scout.js`)
- `POST /api/upload` - Upload image for Scout analysis
- **Middleware:** Session-based

#### General API (`src/routes/api.js`)
- Various API endpoints for shared functionality

---

## 4. Middleware Usage

### Authentication Middleware (`src/middleware/auth.js`)

#### `requireRole(role)`
- **Purpose:** Ensures user has specific role (TALENT or AGENCY)
- **Usage:** Applied to dashboard routes
- **Behavior:** 
  - Checks `req.session.userId` and `req.session.role`
  - Redirects to `/login` if not authenticated
  - Returns 403 if wrong role

#### `requireAuth` (if exists)
- General authentication check (may not exist, replaced by `requireRole`)

### Session Middleware
- **Location:** Configured in `src/app.js`
- **Store:** `connect-session-knex` (PostgreSQL session storage)
- **Used By:** All routes for session management

### Other Middleware
- Body parser (JSON, URL-encoded)
- Static file serving (`public/` directory)
- Error handling middleware

---

## 5. Template Connections

### View Templates (`views/`)

| Route | Template | Data Passed |
|-------|----------|-------------|
| `GET /login` | `views/auth/login.ejs` | `title`, `error`, `message` |
| `GET /signup` | `views/auth/signup.ejs` | `title`, `error`, `message` |
| `GET /apply` | `views/apply/index-cinematic.ejs` | `title`, `userId`, `sessionData` |
| `GET /dashboard/talent` | `views/dashboard/talent.ejs` | `profile`, `images`, `completeness`, `stats`, `user`, `themes` |
| `GET /dashboard/agency` | `views/dashboard/agency.ejs` | `profiles`, `stats`, `filters`, `pagination`, `user` |
| `GET /portfolio/:slug` | `views/portfolio/index.ejs` | `profile`, `images`, `theme`, `isDemo` |
| `GET /pdf/:slug` | PDF generation (no template, binary response) | N/A |

### Layout Files
- `views/layouts/dashboard.ejs` - Dashboard layout wrapper
- `views/layout.ejs` - Main application layout

---

## 6. API Endpoints

### Chat/AI Endpoints (`/api/chat/*`)

#### `POST /api/chat`
- **Purpose:** Send message to Maverick AI
- **Request Body:** `{ message, currentStage }`
- **Response:** `{ text, action, tool_trigger, data }`
- **Session Data:** Uses `req.session.onboardingData`, `req.session.currentStage`

#### `POST /api/chat/initialize`
- **Purpose:** Initialize chat session
- **Response:** Initial Maverick message and stage
- **Session Data:** Creates/updates `req.session.onboardingData`

#### `POST /api/chat/finalize`
- **Purpose:** Trigger Librarian synthesis and profile creation
- **Response:** Success/error status
- **Side Effects:** Creates/updates profile in database

### Scout Endpoints (`/api/upload`)

#### `POST /api/upload`
- **Purpose:** Upload image for Scout AI analysis
- **Request:** Multipart form data (image file)
- **Response:** `{ visualIntel, visualEstimates, imagePath }`
- **Session Data:** Stores image path in `req.session.onboardingData.heroImagePath`

### Talent API Endpoints (`/api/talent/*`)
- Profile updates
- Image management
- Theme selection

### Agency API Endpoints (`/api/agency/*`)
- Application management
- Applicant filtering
- Invite sending

---

## 7. Database Connections

### Database Queries (Knex.js)

#### Profile Queries
- **Table:** `profiles`
- **Used By:** Dashboard routes, portfolio routes, chat routes
- **Key Operations:**
  - `knex('profiles').where({ user_id }).first()` - Get user's profile
  - `knex('profiles').where({ slug }).first()` - Get profile by slug
  - `knex('profiles').insert(...)` - Create profile
  - `knex('profiles').where({ id }).update(...)` - Update profile

#### User Queries
- **Table:** `users`
- **Used By:** Auth routes, dashboard routes
- **Key Operations:**
  - `knex('users').where({ email }).first()` - Find user by email
  - `knex('users').insert(...)` - Create user
  - `knex('users').where({ id }).first()` - Get user by ID

#### Image Queries
- **Table:** `images`
- **Used By:** Dashboard routes, portfolio routes
- **Key Operations:**
  - `knex('images').where({ profile_id }).orderBy('sort')` - Get profile images
  - `knex('images').insert(...)` - Upload image
  - `knex('images').where({ id }).delete()` - Delete image

#### Application Queries
- **Table:** `applications`
- **Used By:** Agency dashboard routes
- **Key Operations:**
  - `knex('applications').where({ agency_id })` - Get agency applications
  - `knex('applications').insert(...)` - Create application
  - `knex('applications').where({ id }).update(...)` - Update application status

---

## 8. Authentication & Authorization Flow

### Login Flow
1. User visits `/login` (GET)
2. User submits credentials (POST `/login`)
3. Auth route verifies credentials
4. Creates session with `userId` and `role`
5. Redirects to `/dashboard` (which redirects to role-specific dashboard)

### Google OAuth Flow
1. User clicks Google sign-in
2. Frontend calls Firebase Auth
3. Sends ID token to `POST /auth/google`
4. Server verifies token, extracts user data
5. Creates/updates user in database
6. Creates session
7. Redirects to `/dashboard`

### Role-Based Access
- **TALENT Role:** Can access `/dashboard/talent`, cannot access `/dashboard/agency`
- **AGENCY Role:** Can access `/dashboard/agency`, cannot access `/dashboard/talent`
- **Middleware:** `requireRole('TALENT')` or `requireRole('AGENCY')` enforces this

### Session Management
- **Storage:** PostgreSQL (`sessions` table via `connect-session-knex`)
- **Session Data:**
  - `userId` - User ID
  - `role` - User role (TALENT/AGENCY)
  - `onboardingData` - Onboarding form data (chat system)
  - `currentStage` - Current onboarding stage
  - `onboardingHistory` - Chat history

---

## 9. Data Flow Diagrams

### Talent Onboarding Flow

```
User → GET /apply
  ↓
Server renders views/apply/index-cinematic.ejs
  ↓
User interacts with AI chat (Maverick)
  ↓
POST /api/chat → Maverick AI (Groq)
  ↓
Response updates session (onboardingData, currentStage)
  ↓
User uploads image → POST /api/upload → Scout AI (Groq Vision)
  ↓
Scout analysis stored in session
  ↓
User completes stages → POST /api/chat/finalize
  ↓
Librarian AI synthesizes data → Creates profile in database
  ↓
Redirect to /dashboard/talent
```

### Dashboard Access Flow

```
User → GET /dashboard
  ↓
Check req.session.userId (via requireRole middleware)
  ↓
If not authenticated → Redirect to /login
  ↓
If authenticated → Check req.session.role
  ↓
If TALENT → GET /dashboard/talent
  ↓
Query database: profiles, images
  ↓
Render views/dashboard/talent.ejs with profile data
```

### Agency Application Flow

```
Agency User → GET /dashboard/agency
  ↓
Query database: applications, profiles (with joins)
  ↓
Apply filters (city, status, height, etc.)
  ↓
Render views/dashboard/agency.ejs with applicant list
  ↓
Agency views applicant → GET /portfolio/:slug
  ↓
Agency takes action → POST /dashboard/agency/application/:id/accept
  ↓
Update applications table
  ↓
Send email notification
```

---

## 10. Potential Issues & Recommendations

### Issues Identified

1. **Route Order Dependency**
   - Routes are registered in specific order in `app.js`
   - Generic routes (like `/api/*`) should come after specific routes
   - **Status:** Currently correct, but fragile if order changes

2. **Session Data Management**
   - Multiple routes modify `req.session.onboardingData`
   - No clear schema/documentation for session data structure
   - **Risk:** Session data corruption or inconsistency

3. **Error Handling**
   - Error handling middleware may not catch all edge cases
   - Database errors may not be properly handled in all routes
   - **Risk:** Unhandled exceptions causing 500 errors

4. **Authentication Bypass Risk**
   - Some API endpoints may not properly check authentication
   - **Recommendation:** Audit all `/api/*` routes for proper auth checks

5. **Role-Based Access**
   - `requireRole` middleware is used, but some routes may bypass it
   - **Recommendation:** Ensure all protected routes use `requireRole`

### Recommendations

1. **Route Documentation**
   - Create API documentation for all endpoints
   - Document required middleware for each route
   - Document expected request/response formats

2. **Session Schema**
   - Define TypeScript interfaces or JSDoc for session data structure
   - Validate session data structure in middleware

3. **Error Handling**
   - Implement consistent error handling across all routes
   - Create error response format standard
   - Log all errors with context

4. **Testing**
   - Add route-level tests
   - Test authentication/authorization flows
   - Test session management

5. **Route Organization**
   - Consider organizing routes by domain (auth, dashboard, api)
   - Use route prefixing more consistently (e.g., `/api/v1/`)

---

## Appendix: Route File Details

### Route File: `src/routes/dashboard-talent.js`

**Endpoints:**
- `GET /dashboard/talent` - Main talent dashboard
- `POST /dashboard/talent` - Update profile
- `GET /api/talent/images` - Get images
- `POST /api/talent/images` - Upload image
- `DELETE /api/talent/images/:id` - Delete image
- `POST /api/talent/hero-image` - Set hero image
- `POST /api/talent/theme` - Update PDF theme

**Dependencies:**
- `requireRole('TALENT')` middleware
- `calculateProfileCompleteness` from `lib/dashboard/completeness.js`
- Database: `profiles`, `images`, `users` tables

### Route File: `src/routes/dashboard-agency.js`

**Endpoints:**
- `GET /dashboard/agency` - Main agency dashboard
- `POST /dashboard/agency/application/:id/accept` - Accept application
- `POST /dashboard/agency/application/:id/decline` - Decline application
- `GET /api/agency/applications` - Get applications (JSON)
- `GET /api/agency/stats` - Get dashboard stats

**Dependencies:**
- `requireRole('AGENCY')` middleware
- Database: `applications`, `profiles`, `users` tables
- Email service for notifications

### Route File: `src/routes/chat.js`

**Endpoints:**
- `POST /api/chat` - Send chat message
- `POST /api/chat/initialize` - Initialize chat
- `GET /api/chat/status` - Get status
- `POST /api/chat/finalize` - Finalize onboarding

**Dependencies:**
- Groq SDK (Maverick AI, Librarian AI)
- Session management
- Database: `profiles` table (creates/updates)
- Scout integration (`/api/upload`)

---

**End of Report**


---

## 11. Complete Endpoint Inventory

### Authentication Routes (`src/routes/auth.js`)
- `GET /login` - Login page
- `POST /login` - Login form submission
- `GET /signup` - Signup page
- `POST /signup` - Signup form submission (redirects to `/apply`)
- `GET /partners` - Partner/agency signup page
- `POST /partners` - Partner/agency signup submission
- `POST /logout` - Logout (destroys session)

### Application Routes (`src/routes/apply.js`)
- `GET /apply` - Talent application/onboarding page (cinematic UI)
- `GET /apply/:agencySlug` - Application page with agency context
- `POST /apply` - Legacy form submission (handles file uploads)
- `GET /api/agencies/search` - Search agencies API

### Dashboard Routes

#### Dashboard Index (`src/routes/dashboard-index.js`)
- `GET /dashboard` - Redirects to role-specific dashboard

#### Talent Dashboard (`src/routes/dashboard-talent.js`)
- `GET /dashboard/talent` - Main talent dashboard
- `POST /dashboard/talent` - Update talent profile
- `POST /dashboard/talent/media` - Upload media/images
- `PUT /dashboard/talent/media/:id/hero` - Set hero image
- `DELETE /dashboard/talent/media/:id` - Delete image
- `GET /dashboard/talent/analytics` - Analytics page
- `GET /dashboard/talent/activity` - Activity log page
- `GET /dashboard/pdf-customizer` - PDF theme customizer
- `GET /dashboard/settings` - Settings page
- `GET /dashboard/settings/:section` - Settings section
- `POST /dashboard/settings/slug` - Update profile slug
- `POST /dashboard/settings/visibility` - Update profile visibility
- `GET /api/talent/applications` - Get talent applications (JSON)
- `POST /api/talent/discoverability` - Update discoverability settings

#### Agency Dashboard (`src/routes/dashboard-agency.js`)
- `GET /dashboard/agency` - Main agency dashboard
- `POST /dashboard/agency/applications/:applicationId/:action` - Application actions (accept/decline)
- `POST /dashboard/agency/scout/:profileId/invite` - Send invite to talent
- `GET /api/agency/applications/:applicationId/notes` - Get application notes
- `POST /api/agency/applications/:applicationId/notes` - Create note
- `PUT /api/agency/applications/:applicationId/notes/:noteId` - Update note
- `DELETE /api/agency/applications/:applicationId/notes/:noteId` - Delete note
- `GET /api/agency/applications/:applicationId/tags` - Get application tags
- `POST /api/agency/applications/:applicationId/tags` - Add tag

### Chat/AI Routes (`src/routes/chat.js`)
- `POST /api/chat` - Send message to Maverick AI
- `POST /api/chat/initialize` - Initialize chat session
- `GET /api/chat/status` - Get chat status
- `POST /api/chat/finalize` - Finalize onboarding (triggers Librarian)

### Scout Routes (`src/routes/scout.js`)
- `POST /api/upload` - Upload image for Scout AI analysis

### Portfolio Routes (`src/routes/portfolio.js`)
- `GET /portfolio/:slug` - Public talent portfolio view

### PDF Routes (`src/routes/pdf.js`)
- `GET /pdf/:slug` - Generate and download PDF comp card
- `GET /pdf/view/:slug` - View PDF comp card (browser)
- `GET /api/pdf/customize/:slug` - Get PDF customization data
- `POST /api/pdf/customize/:slug` - Update PDF customization
- `POST /api/pdf/agency-logo/:slug` - Upload agency logo
- `POST /api/pdf/agency-logo-url/:slug` - Set agency logo URL
- `DELETE /api/pdf/agency-logo/:slug` - Delete agency logo

### Other Routes
- `POST /agency/claim` - Claim agency account (`src/routes/agency.js`)
- `GET /pro/upgrade` - Pro/Studio+ upgrade page (`src/routes/pro.js`)
- `POST /stripe/webhook` - Stripe webhook handler (`src/routes/stripe-webhook.js`)
- Various Stripe routes (`/stripe/*`) - Payment processing (`src/routes/stripe.js`)
- File upload routes (`/api/upload/*`) - File handling (`src/routes/upload.js`)

---

## 12. Route Statistics Summary

**Total Route Files:** 15
- **Registered in app.js:** 14
- **Not Registered:** 1 (`dashboard.js` - legacy/unused)

**Total Endpoints:** ~99 routes (across all files)

**By HTTP Method:**
- GET: ~50 routes
- POST: ~35 routes
- PUT: ~8 routes
- DELETE: ~6 routes
- PATCH: 0 routes

**By Authentication:**
- Public (No Auth): ~15 routes
- Session-based: ~10 routes (chat, scout, upload)
- Role-based (TALENT): ~25 routes
- Role-based (AGENCY): ~18 routes
- Mixed/Partial: ~5 routes

**By Response Type:**
- HTML/Render: ~30 routes
- JSON/API: ~50 routes
- File/Binary: ~5 routes
- Redirect: ~10 routes

---

**End of Report**
