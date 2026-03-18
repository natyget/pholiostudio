# Technical Explanation: /apply Page and Talent Dashboard

## Table of Contents
1. [Overview](#overview)
2. [The /apply Page](#the-apply-page)
3. [The Talent Dashboard](#the-talent-dashboard)
4. [Data Flow and Architecture](#data-flow-and-architecture)
5. [Key Technical Components](#key-technical-components)

---

## Overview

This document provides a detailed technical explanation of the `/apply` page and the talent dashboard in the Pholio application. Both systems work together to create a complete onboarding and profile management experience for talent users.

---

## The /apply Page

### Route Structure

The `/apply` page has two main routes:

#### 1. GET `/apply` - Main Application Page
- **File**: `src/routes/apply.js` (lines 151-217)
- **View**: `views/apply/index-cinematic.ejs`
- **Purpose**: Primary entry point for new talent signups
- **Authentication**: Allows both logged-in and logged-out users
- **Features**:
  - Cinematic onboarding UI (React-based)
  - Multi-stage form flow
  - Firebase authentication integration
  - Image upload with visual intelligence analysis

#### 2. GET `/apply/:agencySlug` - Partner-Led Application
- **File**: `src/routes/apply.js` (lines 48-149)
- **View**: `views/apply/index.ejs` (traditional form)
- **Purpose**: Agency-specific application funnel
- **Behavior**:
  - Pre-populates agency information
  - Locks agency selection
  - Redirects authenticated users to dashboard

#### 3. POST `/apply` - Form Submission Handler
- **File**: `src/routes/apply.js` (lines 244-1625)
- **Purpose**: Processes application form submissions
- **Complexity**: ~1,400 lines handling:
  - User authentication (Firebase + email/password)
  - Profile validation and creation
  - Image upload and processing
  - Application creation for partner agencies
  - Transaction management

### Authentication Flow

The `/apply` page supports two authentication methods:

#### Google Sign-In (Firebase)
1. Client-side: User signs in with Google via Firebase SDK
2. Token extraction: Firebase ID token extracted from request body/headers
3. Server verification: `verifyIdToken()` validates token server-side
4. User creation: Creates user with `firebase_uid` linked to Firebase account
5. Session management: Stores user data in session

#### Email/Password Sign-In
1. Client-side: User creates Firebase user via SDK first
2. Token generation: Firebase ID token generated
3. Server verification: Token verified before account creation
4. Password storage: Password hashed (handled by Firebase, not stored in DB)
5. User creation: Creates user with `firebase_uid` from verified token

### Form Processing Pipeline

The POST `/apply` handler follows this flow:

```
1. Request Validation
   ├─ Multer middleware (file upload)
   ├─ Error handling for uploads
   └─ Body parsing

2. Authentication Check
   ├─ Check if user is logged in (req.currentUser)
   ├─ If not logged in: Validate signup (email/password OR Firebase token)
   │  ├─ Firebase token path: Verify token, extract email/UID
   │  └─ Email/password path: Validate credentials, verify Firebase token
   └─ If logged in: Load existing user

3. Data Transformation
   ├─ Convert specialties to array (handle single/multiple values)
   ├─ Convert languages to array (JSON or comma-separated)
   ├─ Parse social media handles
   ├─ Weight conversion (kg ↔ lbs)
   └─ Age calculation from date_of_birth

4. Validation
   ├─ Signup validation (if new user): signupSchema
   ├─ Profile validation: applyProfileSchema
   │  ├─ Required fields: first_name, last_name, city, height_cm, bio
   │  ├─ Optional fields: ~50+ comprehensive fields
   │  └─ Type validation (numbers, strings, arrays, booleans)
   └─ Error aggregation and display

5. Database Operations
   ├─ Check for existing user (by email or firebase_uid)
   ├─ Check for existing profile (by user_id)
   ├─ Transaction (for new signups):
   │  ├─ Create user record
   │  ├─ Generate unique slug
   │  └─ Create profile record
   ├─ Update existing profile (for logged-in users)
   └─ Create application record (if partner_agency_id provided)

6. Image Processing
   ├─ Process uploaded images (up to 12)
   ├─ Store in /uploads directory
   ├─ Create image records in database
   ├─ Set first image as hero (if no hero exists)
   └─ Sort management

7. Response
   ├─ Save session (userId, role, profileId)
   ├─ Set success message
   ├─ Verify profile creation
   └─ Redirect to /apply/success
```

### Validation Schema

The apply form uses Zod schemas defined in `src/lib/validation.js`:

- **signupSchema**: Email, password, first_name, last_name, role
- **applyProfileSchema**: Comprehensive profile fields including:
  - Personal: name, city, phone, gender, date_of_birth
  - Physical: height, weight, measurements (bust/waist/hips), shoe size, eye/hair color
  - Professional: experience_level, training, specialties, languages
  - Social: Instagram, Twitter, TikTok handles
  - References and emergency contacts
  - Work eligibility and status

### Database Tables Involved

1. **users**: User account (email, firebase_uid, role)
2. **profiles**: Talent profile (linked to user_id)
3. **images**: Portfolio images (linked to profile_id)
4. **applications**: Agency applications (linked to profile_id and agency_id)

### Frontend Architecture (Cinematic UI)

The cinematic apply page (`views/apply/index-cinematic.ejs`) uses:

- **React 18** (via CDN)
- **Babel Standalone** (for JSX transformation)
- **GSAP** (animations)
- **Chart.js** (visualizations)
- **Canvas Confetti** (success animations)

**Component Structure**:
- Multi-stage form progression
- Chat-like interface with "Maverick" AI assistant
- Image upload with drag-and-drop
- Visual intelligence analysis display
- Progress tracking

---

## The Talent Dashboard

### Route Structure

#### 1. GET `/dashboard/talent` - Dashboard Display
- **File**: `src/routes/dashboard-talent.js` (lines 23-135)
- **View**: `views/dashboard/talent.ejs`
- **Purpose**: Main dashboard for talent users
- **Authentication**: Requires `TALENT` role (middleware: `requireRole('TALENT')`)
- **Features**:
  - Profile overview and completeness tracking
  - Form sections with accordion UI
  - Media library management
  - Analytics display
  - Applications tracking
  - Activity feed

#### 2. POST `/dashboard/talent` - Profile Update
- **File**: `src/routes/dashboard-talent.js` (lines 137-837)
- **Purpose**: Handles profile updates from dashboard form
- **Complexity**: ~700 lines handling:
  - Form data preprocessing
  - Validation with error handling
  - Profile creation (if doesn't exist)
  - Profile update (if exists)
  - Completeness recalculation

#### 3. POST `/dashboard/talent/media` - Image Upload
- **File**: `src/routes/dashboard-talent.js` (lines 839-1037)
- **Purpose**: Handles image uploads via AJAX
- **Response**: JSON with uploaded image data

#### 4. PUT `/dashboard/talent/media/:id/hero` - Set Hero Image
- **File**: `src/routes/dashboard-talent.js` (lines 1039-1079)
- **Purpose**: Sets an image as the profile hero image

#### 5. DELETE `/dashboard/talent/media/:id` - Delete Image
- **File**: `src/routes/dashboard-talent.js` (lines 1081-1162)
- **Purpose**: Deletes an image and updates hero if needed

#### 6. GET `/dashboard/talent/analytics` - Analytics API
- **File**: `src/routes/dashboard-talent.js` (lines 1164-1271)
- **Response**: JSON with view/download statistics

#### 7. GET `/dashboard/talent/activity` - Activity Feed API
- **File**: `src/routes/dashboard-talent.js` (lines 1273-1336)
- **Response**: JSON with recent activity items

#### 8. GET `/api/talent/applications` - Applications API
- **File**: `src/routes/dashboard-talent.js` (lines 1338-1372)
- **Response**: JSON array of user's applications

### Dashboard Layout Structure

The talent dashboard uses a three-column layout:

```
┌─────────────────────────────────────────────────────────────┐
│ Hero Section (Full Width)                                   │
│ - Profile image/hero                                        │
│ - Name and basic stats                                      │
│ - Quick actions (View Portfolio, Generate PDF)              │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────┬──────────────────┬───────────────┐
│ Left Column              │ Middle Column    │ Right Column  │
│ (Main Content)           │ (Secondary)      │ (Sidebar)     │
├──────────────────────────┼──────────────────┼───────────────┤
│ Profile Form Sections    │ Portfolio        │ Profile       │
│ (Accordion UI):          │ Imagery          │ Status        │
│ - Personal Info          │ - Upload form    │ - Progress    │
│ - Physical Profile       │ - Image grid     │ - Quick stats │
│ - Experience & Training  │                  │ - Checklist   │
│ - Skills & Lifestyle     │                  │               │
│ - Comfort & Boundaries   │                  │ Quick         │
│ - Availability           │ Analytics        │ Analytics     │
│ - Social & Portfolio     │ - Views          │ - Summary     │
│ - Applications & Matches │ - Downloads      │               │
│                          │ - By theme       │ Activity Feed │
│                          │                  │               │
│                          │                  │ Upgrade CTA   │
└──────────────────────────┴──────────────────┴───────────────┘
```

### Profile Form Structure

The dashboard form is organized into accordion sections:

1. **Personal Info**
   - Primary/secondary city
   - Phone (required for agency contact)
   - Personal details (gender, date of birth, age - auto-calculated)
   - Weight (with unit conversion)
   - Dress size (conditional on gender)
   - Bio (raw and AI-curated display)
   - References & emergency contacts
   - Legal & background info

2. **Physical Profile** (High Priority)
   - Height (cm)
   - Measurements (bust, waist, hips)
   - Shoe size (with "Other" option)
   - Eye color (with "Other" option)
   - Hair color (with "Other" option)
   - Hair length
   - Skin tone (with "Other" option)

3. **Experience & Training**
   - Experience level (Beginner → Professional)
   - Training description
   - Specialties (checkboxes: Runway, Acting, Dancing, Music, Art, Content Creation)
   - Experience details (JSON structure)

4. **Skills & Lifestyle**
   - Languages (multi-select with add/remove)
   - Ethnicity (optional)
   - Union membership (optional)
   - Tattoos/piercings (checkboxes)

5. **Comfort & Boundaries**
   - Comfort levels (checkboxes: Swimwear, Lingerie, Implied Nudity, Not Comfortable)

6. **Availability & Locations**
   - Travel availability (checkbox)
   - Schedule availability (dropdown)
   - Secondary city

7. **Social & Portfolio**
   - Instagram, Twitter, TikTok handles
   - Portfolio URL
   - Note: Free users get handles only; Studio+ users get clickable URLs

8. **Applications & Matches**
   - Display-only section showing applications to agencies
   - Status tracking (pending, accepted, declined, archived)

### Profile Completeness System

The dashboard includes a comprehensive completeness tracking system:

**Implementation**: `src/lib/dashboard/completeness.js`

**Sections Tracked**:
1. Personal Info (phone, city, bio, personal details)
2. Physical Profile (height, measurements, physical attributes)
3. Experience & Training (experience level, specialties)
4. Skills & Lifestyle (languages, ethnicity, etc.)
5. Comfort & Boundaries (comfort levels)
6. Availability & Locations (travel, schedule, cities)
7. Social & Portfolio (social handles, portfolio URL)
8. References & Emergency (contacts)

**Calculation Logic**:
- Each section has required/optional fields
- Completeness percentage calculated as: `(completed sections / total sections) * 100`
- Sections marked as "complete" when all required fields filled
- Visual indicators in accordion headers
- Progress bar in sidebar
- Next steps recommendations for incomplete sections

### Form Processing (POST /dashboard/talent)

The profile update handler follows this flow:

```
1. Request Preprocessing
   ├─ Merge "_other" fields into main fields (shoe_size_other → shoe_size)
   ├─ Handle array fields (extract first non-empty value)
   ├─ Convert empty strings to undefined for optional fields
   ├─ Handle boolean checkboxes (convert to true/false)
   └─ Remove non-schema fields

2. Validation
   ├─ talentProfileUpdateSchema (Zod)
   ├─ Error aggregation
   └─ Error display in form

3. Profile Lookup
   ├─ Check if profile exists
   ├─ If no profile: Create minimal profile with placeholders
   └─ If profile exists: Load for update

4. Data Transformation
   ├─ Weight conversion (kg ↔ lbs)
   ├─ Languages array → JSON string (or JSONB for PostgreSQL)
   ├─ Specialties array → JSON string (or JSONB)
   ├─ Social media handle cleaning
   ├─ Bio curation (AI refinement)
   ├─ Slug generation/update (if name changes)
   └─ Age calculation (from date_of_birth)

5. Database Update
   ├─ Build update object (only changed fields)
   ├─ Handle slug update (if name changed)
   ├─ Update profile record
   └─ Recalculate completeness

6. Response
   ├─ Save session
   ├─ Set success message
   └─ Redirect to dashboard
```

### Media Management

#### Image Upload Flow

1. **Client-side** (`public/scripts/dashboard.js`):
   - File selection (multi-select, drag-and-drop)
   - Preview display
   - FormData construction
   - AJAX POST to `/dashboard/talent/media`

2. **Server-side** (POST `/dashboard/talent/media`):
   - Multer middleware (up to 12 images)
   - Image processing (resize, optimize)
   - Database insertion (images table)
   - Hero image assignment (first image if no hero)
   - JSON response with image data

3. **Client-side Response**:
   - Add images to grid
   - Update image count
   - Show success message

#### Hero Image Management

- First uploaded image automatically becomes hero (if no hero exists)
- Users can set any image as hero via "Set Hero" button
- Hero image displayed in dashboard header
- Hero image used as portfolio cover

#### Image Deletion

- DELETE request to `/dashboard/talent/media/:id`
- File deletion from filesystem
- Database record deletion
- Hero image reassignment (if deleted image was hero)

### Analytics System

**Data Collection**:
- Views tracked in `analytics` table (event_type: 'view')
- Downloads tracked (event_type: 'download')
- Theme information stored in metadata (JSONB)

**Display**:
- Total views/downloads
- This week's stats
- This month's stats
- Downloads by theme (breakdown)

**API Endpoint**: GET `/dashboard/talent/analytics`
- Aggregates data from last 30 days
- Groups by time periods
- Returns JSON for client-side rendering

### Activity Feed

**Data Source**: `activities` table

**Activity Types**:
- `profile_updated`: Profile changes
- `image_uploaded`: Image additions
- `pdf_downloaded`: PDF generation
- `portfolio_viewed`: Portfolio views

**Display**:
- Recent activities (last 10)
- Icon indicators
- Time ago formatting
- Metadata display

**API Endpoint**: GET `/dashboard/talent/activity`

### Applications Tracking

**Data Source**: `applications` table joined with `users` (agency info)

**Status Values**:
- `pending`: Awaiting agency response
- `accepted`: Application accepted
- `declined`: Application declined
- `archived`: Application archived

**Features**:
- List all applications with agency names
- Status badges with color coding
- Created date display
- Invite tracking (invited_by_agency_id)

**API Endpoint**: GET `/api/talent/applications`
- Polls every 30 seconds for updates
- Client-side rendering

---

## Data Flow and Architecture

### User Journey: New Signup

```
1. User visits /apply
   └─> GET /apply
       └─> Render index-cinematic.ejs
           └─> React component loads
               └─> Multi-stage form begins

2. User completes form and submits
   └─> POST /apply
       ├─> Authentication check
       │   └─> Firebase token verification
       ├─> Validation (signup + profile)
       ├─> Transaction:
       │   ├─> Create user (users table)
       │   └─> Create profile (profiles table)
       ├─> Image processing (if any)
       ├─> Application creation (if agency specified)
       └─> Redirect to /apply/success

3. Success page
   └─> GET /apply/success
       └─> Redirect to /dashboard/talent

4. Dashboard display
   └─> GET /dashboard/talent
       ├─> Load profile
       ├─> Load images
       ├─> Calculate completeness
       └─> Render dashboard
```

### User Journey: Profile Update

```
1. User views dashboard
   └─> GET /dashboard/talent
       └─> Form pre-populated with profile data

2. User edits form sections
   └─> Client-side: Accordion UI, field validation

3. User submits form
   └─> POST /dashboard/talent
       ├─> Preprocess form data
       ├─> Validate (talentProfileUpdateSchema)
       ├─> Update profile
       ├─> Recalculate completeness
       └─> Redirect to /dashboard/talent (with success message)

4. Dashboard refreshes
   └─> GET /dashboard/talent
       └─> Updated data displayed
```

### Database Relationships

```
users (1) ──< (many) profiles
            │
            ├─> profile_id (UUID)
            ├─> user_id (FK → users.id)
            └─> slug (unique)

profiles (1) ──< (many) images
            │
            ├─> profile_id (FK → profiles.id)
            ├─> path (string)
            └─> sort (integer)

profiles (1) ──< (many) applications
            │
            ├─> profile_id (FK → profiles.id)
            ├─> agency_id (FK → users.id)
            ├─> status (enum)
            └─> Unique constraint: (profile_id, agency_id)

profiles (1) ──< (many) analytics
            │
            ├─> profile_id (FK → profiles.id)
            ├─> event_type (enum)
            └─> metadata (JSONB)

users (1) ──< (many) activities
            │
            ├─> user_id (FK → users.id)
            ├─> activity_type (enum)
            └─> metadata (JSON)
```

---

## Key Technical Components

### Validation System

**Location**: `src/lib/validation.js`

**Schemas**:
- `signupSchema`: User account creation
- `applyProfileSchema`: Application form (comprehensive)
- `talentProfileUpdateSchema`: Dashboard updates (more flexible)

**Features**:
- Zod-based validation
- Type coercion (string → number, etc.)
- Custom refinements (ranges, formats)
- Transform functions (normalization)
- Error aggregation

### Image Processing

**Location**: `src/lib/uploader.js`

**Features**:
- Multer configuration (file upload middleware)
- Image optimization
- Path management
- Multiple image support (up to 12)

### Bio Curation

**Location**: `src/lib/curate.js`

**Function**: `curateBio(bio, first_name, last_name)`
- AI-powered bio refinement
- Maintains original (bio_raw)
- Stores curated version (bio_curated)
- Used in public portfolio display

### Completeness Calculation

**Location**: `src/lib/dashboard/completeness.js`

**Function**: `calculateProfileCompleteness(profile, images)`
- Analyzes all profile sections
- Determines completion status
- Calculates percentage
- Returns structured object with section statuses

### Slug Generation

**Location**: `src/lib/slugify.js`

**Function**: `ensureUniqueSlug(knex, table, baseSlug)`
- Generates URL-friendly slugs
- Handles duplicates (appends number)
- Ensures uniqueness across table

### Session Management

**Session Data Stored**:
- `userId`: User's UUID
- `role`: 'TALENT' or 'AGENCY'
- `profileId`: Profile UUID (if exists)
- `onboardingData`: Google sign-in data (temporary)

**Middleware**:
- `requireRole('TALENT')`: Ensures user is talent
- `extractIdToken`: Extracts Firebase token from request

### Frontend JavaScript

**Main Files**:
- `public/scripts/dashboard.js`: Dashboard interactions (2,000+ lines)
  - Form handling
  - Media management
  - Analytics loading
  - Activity feed
  - Accordion UI
  - Language management
  - Weight conversion
  - PDF theme selector

**Key Features**:
- Client-side validation
- AJAX form submissions (media upload)
- Real-time updates (applications polling)
- Dynamic UI (accordion, tabs)
- Image preview and management

---

## Summary

### /apply Page
- **Purpose**: Onboarding new talent users
- **Complexity**: High (1,400+ line POST handler)
- **Key Features**: Multi-auth, comprehensive validation, image upload, transaction management
- **View**: React-based cinematic UI OR traditional form

### Talent Dashboard
- **Purpose**: Profile management and portfolio building
- **Complexity**: Very High (1,600+ lines, multiple routes)
- **Key Features**: Sectioned form, completeness tracking, media management, analytics, applications
- **View**: EJS template with extensive client-side JavaScript

Both systems work together to provide a complete talent onboarding and management experience, with robust validation, error handling, and user experience features.
