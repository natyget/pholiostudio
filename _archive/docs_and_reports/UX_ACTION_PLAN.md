# Pholio UX Improvement Action Plan
**Date:** February 14, 2026
**Based On:** UX_REPORT.md Analysis
**Timeline:** 90 Days (3 Phases)
**Branch Strategy:** `ux-improvements` → `main`

---

## Executive Summary

This action plan addresses **24 critical UX issues** identified in the platform audit, organized into 3 phases over 90 days. Focus areas: **Data Safety**, **Workflow Completion**, and **Mobile Optimization**.

**Expected Outcomes:**
- Onboarding completion rate: 60% → 80%
- Time to first portfolio: 15 min → 8 min
- Application submission rate: 40% → 70%
- Mobile usage: 30% → 50%
- Critical security issues: 4 → 0

---

## Phase 1: Critical Fixes & Data Safety (Days 1-30)
**Goal:** Fix high-severity issues that pose security/data loss risks

### Sprint 1.1 - Security & Validation (Week 1)

#### Task 1.1.1: Fix Email Verification Bypass 🔴 CRITICAL
**File:** `client/src/routes/casting/CastingEntry.jsx`

**Current Issue:**
```javascript
// Line 114-115
if (devMode) {
  // Skip verification - SECURITY RISK
}
```

**Action Items:**
1. Remove dev mode bypass completely
2. Implement proper email verification flow:
   ```javascript
   // Send verification email via Firebase
   await sendEmailVerification(user);

   // Show verification waiting screen
   setManualStep(STEPS.VERIFICATION_PENDING);

   // Poll for verification status
   const checkVerification = setInterval(async () => {
     await user.reload();
     if (user.emailVerified) {
       clearInterval(checkVerification);
       setManualStep(STEPS.GENDER_SELECTION);
     }
   }, 3000);
   ```

3. Add resend verification link
4. Add verification timeout (15 min) with retry

**Files to Modify:**
- `client/src/routes/casting/CastingEntry.jsx` (lines 114-130)
- `src/routes/auth.js` (add verification check middleware)

**Testing:**
- [ ] Email verification required before proceeding
- [ ] Resend link works after 60 seconds
- [ ] Timeout shows helpful error message
- [ ] Verified users skip straight to next step

**Effort:** 1 day
**Priority:** 🔴 CRITICAL

---

#### Task 1.1.2: Add Confirmation Dialogs for Destructive Actions 🔴 HIGH
**Files:**
- `client/src/features/media/MediaGallery.jsx`
- `client/src/features/applications/ApplicationsView.jsx`

**Current Issue:**
```javascript
// MediaGallery.jsx:120
const handleDelete = (imageId) => {
  deleteImage(imageId); // No confirmation!
};

// ApplicationsView.jsx:71
const handleWithdraw = (appId) => {
  if (window.alert('Are you sure?')) { // Uses alert()
    withdrawApplication(appId);
  }
};
```

**Action Items:**
1. Create reusable `ConfirmDialog` component:
   ```jsx
   // client/src/components/ui/ConfirmDialog.jsx
   export function ConfirmDialog({
     isOpen,
     onClose,
     onConfirm,
     title,
     message,
     confirmText = 'Confirm',
     confirmVariant = 'danger',
     cancelText = 'Cancel'
   }) {
     return (
       <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{title}</DialogTitle>
             <DialogDescription>{message}</DialogDescription>
           </DialogHeader>
           <DialogFooter>
             <Button variant="outline" onClick={onClose}>
               {cancelText}
             </Button>
             <Button variant={confirmVariant} onClick={onConfirm}>
               {confirmText}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     );
   }
   ```

2. Replace all destructive actions:
   - **Image deletion** - "Delete this image? This cannot be undone."
   - **Application withdrawal** - "Withdraw application? Agency will be notified."
   - **Profile deletion** (if exists) - "Delete account? All data will be lost."
   - **Agency reject action** - "Decline application? Talent will be notified."

3. Add optional warning checkbox for high-risk actions:
   ```jsx
   <Checkbox id="understand">
     <label htmlFor="understand">
       I understand this action cannot be undone
     </label>
   </Checkbox>
   ```

**Files to Create:**
- `client/src/components/ui/ConfirmDialog.jsx`

**Files to Modify:**
- `client/src/features/media/MediaGallery.jsx` (handleDelete)
- `client/src/features/applications/ApplicationsView.jsx` (handleWithdraw)
- `client/src/routes/agency/ApplicantsPage.jsx` (bulk decline)

**Testing:**
- [ ] Dialog shows before image deletion
- [ ] Dialog shows before application withdrawal
- [ ] Cancel button works (action aborted)
- [ ] Confirm button works (action proceeds)
- [ ] ESC key closes dialog
- [ ] Click outside closes dialog
- [ ] Focus trapped in dialog (accessibility)

**Effort:** 1 day
**Priority:** 🔴 HIGH

---

#### Task 1.1.3: Implement Undo Functionality
**Files:** `client/src/hooks/useUndo.js` (new)

**Action Items:**
1. Create undo hook:
   ```javascript
   // client/src/hooks/useUndo.js
   export function useUndo({ onUndo, duration = 5000 }) {
     const [pendingAction, setPendingAction] = useState(null);
     const timerRef = useRef(null);

     const executeWithUndo = (action, undoData) => {
       // Show undo toast
       setPendingAction({ action, undoData });

       // Execute action
       action();

       // Start timer
       timerRef.current = setTimeout(() => {
         setPendingAction(null);
       }, duration);
     };

     const undo = () => {
       if (pendingAction && onUndo) {
         onUndo(pendingAction.undoData);
         clearTimeout(timerRef.current);
         setPendingAction(null);
       }
     };

     return { executeWithUndo, undo, canUndo: !!pendingAction };
   }
   ```

2. Integrate with media gallery:
   ```jsx
   // MediaGallery.jsx
   const { executeWithUndo, undo, canUndo } = useUndo({
     onUndo: (imageData) => restoreImage(imageData)
   });

   const handleDelete = (image) => {
     executeWithUndo(
       () => deleteImage(image.id),
       { image } // Undo data
     );

     toast({
       title: "Image deleted",
       action: canUndo ? (
         <Button variant="outline" onClick={undo}>
           Undo
         </Button>
       ) : null
     });
   };
   ```

**Files to Create:**
- `client/src/hooks/useUndo.js`

**Files to Modify:**
- `client/src/features/media/MediaGallery.jsx`
- `client/src/api/talent.js` (add restoreImage endpoint)
- `src/routes/talent/media.js` (add restore endpoint)

**Testing:**
- [ ] Undo appears in toast after deletion
- [ ] Undo button restores deleted image
- [ ] Timer expires after 5 seconds
- [ ] Multiple undos queue correctly

**Effort:** 2 days
**Priority:** 🟡 MEDIUM

---

### Sprint 1.2 - Navigation & Discoverability (Week 2)

#### Task 1.2.1: Add Breadcrumb Navigation
**File:** `client/src/components/Breadcrumbs.jsx` (new)

**Action Items:**
1. Create breadcrumb component:
   ```jsx
   // client/src/components/Breadcrumbs.jsx
   import { Link, useLocation } from 'react-router-dom';

   const routeNames = {
     '/dashboard/talent': 'Dashboard',
     '/dashboard/talent/profile': 'Profile',
     '/dashboard/talent/portfolio': 'Portfolio',
     '/dashboard/talent/analytics': 'Analytics',
     // ... more routes
   };

   export function Breadcrumbs() {
     const location = useLocation();
     const pathParts = location.pathname.split('/').filter(Boolean);

     const breadcrumbs = pathParts.map((_, index) => {
       const path = '/' + pathParts.slice(0, index + 1).join('/');
       return {
         path,
         label: routeNames[path] || pathParts[index]
       };
     });

     return (
       <nav aria-label="Breadcrumb">
         <ol className="flex items-center gap-2 text-sm">
           {breadcrumbs.map((crumb, index) => (
             <li key={crumb.path} className="flex items-center gap-2">
               {index > 0 && <span className="text-gray-400">/</span>}
               {index === breadcrumbs.length - 1 ? (
                 <span className="text-gray-900 font-medium">
                   {crumb.label}
                 </span>
               ) : (
                 <Link
                   to={crumb.path}
                   className="text-gray-500 hover:text-gray-900"
                 >
                   {crumb.label}
                 </Link>
               )}
             </li>
           ))}
         </ol>
       </nav>
     );
   }
   ```

2. Add to all dashboard layouts:
   - `client/src/components/DashboardLayoutShell.jsx`
   - `client/src/routes/agency/AgencyLayout.jsx`

**Files to Create:**
- `client/src/components/Breadcrumbs.jsx`

**Files to Modify:**
- `client/src/components/DashboardLayoutShell.jsx`
- `client/src/routes/agency/AgencyLayout.jsx`

**Testing:**
- [ ] Breadcrumbs show on all pages
- [ ] Click breadcrumb navigates correctly
- [ ] Current page not clickable
- [ ] Responsive on mobile (truncate long paths)

**Effort:** 1 day
**Priority:** 🟡 MEDIUM

---

#### Task 1.2.2: Add Exit Path to Casting Flow
**File:** `client/src/routes/casting/CastingCallPage.jsx`

**Current Issue:** No way to exit casting flow without completing

**Action Items:**
1. Add header with "Save and Exit" button:
   ```jsx
   // CastingCallPage.jsx
   <div className="fixed top-0 left-0 right-0 z-50 bg-ink/95 backdrop-blur">
     <div className="container mx-auto px-4 py-3 flex justify-between items-center">
       <div className="text-sm text-gray-400">
         Step {currentStepIndex + 1} of {steps.length}
       </div>
       <button
         onClick={handleSaveAndExit}
         className="text-sm text-gray-400 hover:text-white"
       >
         Save and Exit
       </button>
     </div>
   </div>
   ```

2. Implement save and exit logic:
   ```javascript
   const handleSaveAndExit = async () => {
     // Save current progress to backend
     await saveCastingProgress({
       currentStep: currentStepIndex,
       formData: {
         ...entryData,
         ...scoutData,
         ...measurementsData,
         ...profileData
       }
     });

     // Show confirmation
     toast({
       title: "Progress saved",
       description: "You can continue later from your dashboard"
     });

     // Redirect after 1 second
     setTimeout(() => {
       navigate('/dashboard/talent');
     }, 1000);
   };
   ```

3. Add resume capability on dashboard:
   ```jsx
   // OverviewPage.jsx
   {incompleteCasting && (
     <Card>
       <CardHeader>
         <CardTitle>Complete Your Profile</CardTitle>
       </CardHeader>
       <CardContent>
         <p>You're {incompleteCasting.progress}% done with setup</p>
         <Button onClick={() => navigate('/casting?resume=true')}>
           Continue Setup
         </Button>
       </CardContent>
     </Card>
   )}
   ```

**Files to Modify:**
- `client/src/routes/casting/CastingCallPage.jsx`
- `client/src/routes/talent/OverviewPage.jsx`
- `src/routes/casting.js` (add save/resume endpoints)

**Database Migration:**
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN casting_progress JSONB;
```

**Testing:**
- [ ] "Save and Exit" button visible on all casting steps
- [ ] Progress saved to database
- [ ] Resume link shows on dashboard
- [ ] Resume loads correct step and data
- [ ] Completed castings don't show resume link

**Effort:** 2 days
**Priority:** 🟡 MEDIUM

---

### Sprint 1.3 - Error Handling (Week 3)

#### Task 1.3.1: Implement Retry Mechanism for Failed Uploads
**File:** `client/src/api/client.js`

**Action Items:**
1. Add retry wrapper:
   ```javascript
   // client/src/api/client.js
   async function fetchWithRetry(url, options, maxRetries = 3) {
     let lastError;

     for (let i = 0; i < maxRetries; i++) {
       try {
         const response = await fetch(url, options);

         if (!response.ok) {
           throw new Error(`HTTP ${response.status}`);
         }

         return response;
       } catch (error) {
         lastError = error;

         // Don't retry on 4xx errors (client errors)
         if (error.message.includes('4')) {
           throw error;
         }

         // Exponential backoff
         if (i < maxRetries - 1) {
           const delay = Math.min(1000 * Math.pow(2, i), 10000);
           await new Promise(resolve => setTimeout(resolve, delay));
         }
       }
     }

     throw lastError;
   }
   ```

2. Add retry UI component:
   ```jsx
   // client/src/components/ui/RetryableAction.jsx
   export function RetryableAction({ error, onRetry, children }) {
     const [retrying, setRetrying] = useState(false);

     const handleRetry = async () => {
       setRetrying(true);
       await onRetry();
       setRetrying(false);
     };

     if (error) {
       return (
         <div className="rounded-lg border border-red-200 bg-red-50 p-4">
           <div className="flex items-start gap-3">
             <AlertCircle className="h-5 w-5 text-red-600" />
             <div className="flex-1">
               <h3 className="font-medium text-red-900">
                 Upload Failed
               </h3>
               <p className="mt-1 text-sm text-red-700">
                 {error.message}
               </p>
               <Button
                 onClick={handleRetry}
                 disabled={retrying}
                 className="mt-3"
                 size="sm"
               >
                 {retrying ? 'Retrying...' : 'Try Again'}
               </Button>
             </div>
           </div>
         </div>
       );
     }

     return children;
   }
   ```

3. Integrate with media upload:
   ```jsx
   // MediaUpload.jsx
   const [uploadError, setUploadError] = useState(null);

   const handleUpload = async (file) => {
     try {
       setUploadError(null);
       await uploadImage(file);
     } catch (error) {
       setUploadError(error);
     }
   };

   return (
     <RetryableAction error={uploadError} onRetry={() => handleUpload(file)}>
       <Dropzone onDrop={handleUpload} />
     </RetryableAction>
   );
   ```

**Files to Create:**
- `client/src/components/ui/RetryableAction.jsx`

**Files to Modify:**
- `client/src/api/client.js`
- `client/src/features/media/MediaUpload.jsx`
- `client/src/routes/casting/CastingScout.jsx`

**Testing:**
- [ ] Failed upload shows retry button
- [ ] Retry button attempts upload again
- [ ] Exponential backoff works (check network timing)
- [ ] 4xx errors don't retry (client errors)
- [ ] 5xx errors retry up to 3 times

**Effort:** 2 days
**Priority:** 🟡 MEDIUM

---

#### Task 1.3.2: Replace Generic Errors with Actionable Messages
**File:** `client/src/lib/errorMessages.js` (new)

**Action Items:**
1. Create error message mapper:
   ```javascript
   // client/src/lib/errorMessages.js
   export const errorMessages = {
     // Network errors
     'NETWORK_ERROR': {
       title: 'Connection Lost',
       message: 'Check your internet connection and try again.',
       action: 'retry'
     },

     // Auth errors
     'INVALID_CREDENTIALS': {
       title: 'Invalid Login',
       message: 'Email or password is incorrect. Try again or reset your password.',
       action: 'forgot_password'
     },
     'EMAIL_NOT_VERIFIED': {
       title: 'Email Not Verified',
       message: 'Please check your email and click the verification link.',
       action: 'resend_verification'
     },

     // File upload errors
     'FILE_TOO_LARGE': {
       title: 'File Too Large',
       message: 'Image must be under 8MB. Try compressing the file.',
       action: 'compress_help'
     },
     'INVALID_FILE_TYPE': {
       title: 'Invalid File Type',
       message: 'Only JPG, PNG, and HEIC images are supported.',
       action: null
     },

     // Business logic errors
     'PROFILE_INCOMPLETE': {
       title: 'Complete Your Profile',
       message: 'Fill out required fields before saving.',
       action: 'highlight_fields'
     },
     'SUBSCRIPTION_REQUIRED': {
       title: 'Upgrade Required',
       message: 'This feature requires a Studio+ subscription.',
       action: 'upgrade_link'
     },

     // Default
     'UNKNOWN': {
       title: 'Something Went Wrong',
       message: 'An unexpected error occurred. Our team has been notified.',
       action: 'contact_support'
     }
   };

   export function getErrorMessage(errorCode, details = {}) {
     const error = errorMessages[errorCode] || errorMessages.UNKNOWN;

     // Replace placeholders in message
     let message = error.message;
     Object.keys(details).forEach(key => {
       message = message.replace(`{${key}}`, details[key]);
     });

     return { ...error, message };
   }
   ```

2. Update error boundary:
   ```jsx
   // ErrorBoundary.jsx
   import { getErrorMessage } from '@/lib/errorMessages';

   function ErrorBoundary({ error }) {
     const errorInfo = getErrorMessage(error.code);

     return (
       <div className="min-h-screen flex items-center justify-center">
         <Card className="max-w-md">
           <CardHeader>
             <CardTitle>{errorInfo.title}</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-gray-600">{errorInfo.message}</p>
             {errorInfo.action === 'retry' && (
               <Button onClick={handleRetry} className="mt-4">
                 Try Again
               </Button>
             )}
             {errorInfo.action === 'contact_support' && (
               <Button variant="outline" onClick={handleContactSupport}>
                 Contact Support
               </Button>
             )}
           </CardContent>
         </Card>
       </div>
     );
   }
   ```

3. Add server-side error codes:
   ```javascript
   // src/middleware/errorHandler.js
   const errorCodes = {
     VALIDATION_ERROR: 400,
     UNAUTHORIZED: 401,
     FORBIDDEN: 403,
     NOT_FOUND: 404,
     FILE_TOO_LARGE: 413,
     INVALID_FILE_TYPE: 415,
     SERVER_ERROR: 500
   };

   function errorHandler(err, req, res, next) {
     const code = err.code || 'SERVER_ERROR';
     const statusCode = errorCodes[code] || 500;

     res.status(statusCode).json({
       error: {
         code,
         message: err.message,
         details: err.details || {}
       }
     });
   }
   ```

**Files to Create:**
- `client/src/lib/errorMessages.js`

**Files to Modify:**
- `client/src/components/ErrorBoundary.jsx`
- `client/src/api/client.js`
- `src/middleware/errorHandler.js`

**Testing:**
- [ ] Network errors show "Connection Lost"
- [ ] Auth errors show specific messages
- [ ] File errors show size/type guidance
- [ ] Each error has appropriate action button
- [ ] Unknown errors show generic fallback

**Effort:** 2 days
**Priority:** 🟡 MEDIUM

---

### Sprint 1.4 - Progress Persistence (Week 4)

#### Task 1.4.1: Add LocalStorage Backup for Casting Flow
**File:** `client/src/hooks/useCastingProgress.js` (new)

**Action Items:**
1. Create progress persistence hook:
   ```javascript
   // client/src/hooks/useCastingProgress.js
   import { useEffect } from 'react';

   const STORAGE_KEY = 'pholio_casting_progress';

   export function useCastingProgress() {
     const saveProgress = (data) => {
       try {
         const progress = {
           timestamp: Date.now(),
           data,
           version: '1.0'
         };
         localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
       } catch (error) {
         console.error('Failed to save progress:', error);
       }
     };

     const loadProgress = () => {
       try {
         const stored = localStorage.getItem(STORAGE_KEY);
         if (!stored) return null;

         const progress = JSON.parse(stored);

         // Check if progress is stale (older than 7 days)
         const age = Date.now() - progress.timestamp;
         if (age > 7 * 24 * 60 * 60 * 1000) {
           clearProgress();
           return null;
         }

         return progress.data;
       } catch (error) {
         console.error('Failed to load progress:', error);
         return null;
       }
     };

     const clearProgress = () => {
       localStorage.removeItem(STORAGE_KEY);
     };

     return { saveProgress, loadProgress, clearProgress };
   }
   ```

2. Integrate with casting flow:
   ```jsx
   // CastingCallPage.jsx
   const { saveProgress, loadProgress, clearProgress } = useCastingProgress();

   // Auto-save on step change
   useEffect(() => {
     saveProgress({
       currentStep: currentStepIndex,
       entryData,
       scoutData,
       measurementsData,
       profileData
     });
   }, [currentStepIndex, entryData, scoutData, measurementsData, profileData]);

   // Load on mount
   useEffect(() => {
     const savedProgress = loadProgress();
     if (savedProgress && !searchParams.get('fresh')) {
       // Show resume dialog
       setShowResumeDialog(true);
       setSavedProgress(savedProgress);
     }
   }, []);

   // Clear on completion
   const handleComplete = async () => {
     await submitProfile();
     clearProgress();
     navigate('/dashboard/talent');
   };
   ```

3. Add resume dialog:
   ```jsx
   <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
     <DialogContent>
       <DialogHeader>
         <DialogTitle>Resume Your Setup?</DialogTitle>
         <DialogDescription>
           You have a saved casting session from {formatDate(savedProgress.timestamp)}.
           Would you like to continue where you left off?
         </DialogDescription>
       </DialogHeader>
       <DialogFooter>
         <Button variant="outline" onClick={handleStartFresh}>
           Start Fresh
         </Button>
         <Button onClick={handleResume}>
           Resume
         </Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
   ```

**Files to Create:**
- `client/src/hooks/useCastingProgress.js`

**Files to Modify:**
- `client/src/routes/casting/CastingCallPage.jsx`

**Testing:**
- [ ] Progress auto-saves every step change
- [ ] Refresh page shows resume dialog
- [ ] Resume loads correct step and data
- [ ] Start fresh clears saved progress
- [ ] Completion clears saved progress
- [ ] Stale progress (>7 days) auto-clears

**Effort:** 2 days
**Priority:** 🔴 HIGH

---

## Phase 2: Workflow Completion (Days 31-60)
**Goal:** Complete missing workflows and improve user engagement

### Sprint 2.1 - Application Submission Flow (Week 5-6)

#### Task 2.1.1: Build Application Submission Form
**File:** `client/src/routes/talent/ApplyPage.jsx` (new)

**Action Items:**
1. Create application form page:
   ```jsx
   // client/src/routes/talent/ApplyPage.jsx
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { applicationSchema } from '@/schemas/applicationSchema';

   export function ApplyPage() {
     const { agencyId } = useParams();
     const { data: agency } = useAgency(agencyId);

     const form = useForm({
       resolver: zodResolver(applicationSchema),
       defaultValues: {
         message: '',
         availability: 'immediate',
         willingToTravel: false,
         preferredRates: { min: '', max: '' }
       }
     });

     const { mutate: submitApplication } = useSubmitApplication();

     const onSubmit = (data) => {
       submitApplication({
         agencyId,
         ...data
       });
     };

     return (
       <div className="container max-w-4xl mx-auto py-8">
         <Card>
           <CardHeader>
             <CardTitle>Apply to {agency.name}</CardTitle>
             <CardDescription>
               Fill out this application to be considered for opportunities
               with {agency.name}.
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)}>
                 {/* Cover Message */}
                 <FormField
                   control={form.control}
                   name="message"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Cover Message</FormLabel>
                       <FormControl>
                         <Textarea
                           placeholder="Tell us why you'd be a great fit..."
                           rows={5}
                           {...field}
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 {/* Availability */}
                 <FormField
                   control={form.control}
                   name="availability"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Availability</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <SelectTrigger>
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="immediate">Immediate</SelectItem>
                           <SelectItem value="within_2_weeks">Within 2 Weeks</SelectItem>
                           <SelectItem value="within_month">Within a Month</SelectItem>
                           <SelectItem value="flexible">Flexible</SelectItem>
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 {/* Willing to Travel */}
                 <FormField
                   control={form.control}
                   name="willingToTravel"
                   render={({ field }) => (
                     <FormItem className="flex items-center justify-between">
                       <div>
                         <FormLabel>Willing to Travel</FormLabel>
                         <FormDescription>
                           Are you available for jobs that require travel?
                         </FormDescription>
                       </div>
                       <FormControl>
                         <Switch
                           checked={field.value}
                           onCheckedChange={field.onChange}
                         />
                       </FormControl>
                     </FormItem>
                   )}
                 />

                 {/* Preferred Rates */}
                 <div className="grid grid-cols-2 gap-4">
                   <FormField
                     control={form.control}
                     name="preferredRates.min"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Min Rate ($/hr)</FormLabel>
                         <FormControl>
                           <Input type="number" placeholder="50" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                   <FormField
                     control={form.control}
                     name="preferredRates.max"
                     render={({ field }) => (
                       <FormItem>
                         <FormLabel>Max Rate ($/hr)</FormLabel>
                         <FormControl>
                           <Input type="number" placeholder="150" {...field} />
                         </FormControl>
                         <FormMessage />
                       </FormItem>
                     )}
                   />
                 </div>

                 {/* Portfolio Selection */}
                 <FormField
                   control={form.control}
                   name="selectedImages"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Select Images to Include</FormLabel>
                       <FormDescription>
                         Choose up to 10 images from your portfolio
                       </FormDescription>
                       <ImageSelector
                         max={10}
                         value={field.value}
                         onChange={field.onChange}
                       />
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 {/* Action Buttons */}
                 <div className="flex gap-3 mt-6">
                   <Button
                     type="button"
                     variant="outline"
                     onClick={() => form.reset()}
                   >
                     Reset
                   </Button>
                   <Button
                     type="button"
                     variant="secondary"
                     onClick={() => saveDraft(form.getValues())}
                   >
                     Save Draft
                   </Button>
                   <Button type="submit">
                     Submit Application
                   </Button>
                 </div>
               </form>
             </Form>
           </CardContent>
         </Card>
       </div>
     );
   }
   ```

2. Create application schema:
   ```typescript
   // client/src/schemas/applicationSchema.ts
   import { z } from 'zod';

   export const applicationSchema = z.object({
     message: z.string().min(50, 'Message must be at least 50 characters'),
     availability: z.enum(['immediate', 'within_2_weeks', 'within_month', 'flexible']),
     willingToTravel: z.boolean(),
     preferredRates: z.object({
       min: z.coerce.number().min(0),
       max: z.coerce.number().min(0)
     }).refine(data => data.max >= data.min, {
       message: 'Max rate must be greater than min rate',
       path: ['max']
     }),
     selectedImages: z.array(z.string()).max(10, 'Select up to 10 images')
   });
   ```

3. Add draft saving:
   ```javascript
   // client/src/hooks/useApplicationDraft.js
   export function useApplicationDraft(agencyId) {
     const key = `application_draft_${agencyId}`;

     const saveDraft = (data) => {
       localStorage.setItem(key, JSON.stringify({
         ...data,
         savedAt: Date.now()
       }));
       toast({ title: 'Draft saved' });
     };

     const loadDraft = () => {
       const saved = localStorage.getItem(key);
       return saved ? JSON.parse(saved) : null;
     };

     const clearDraft = () => {
       localStorage.removeItem(key);
     };

     return { saveDraft, loadDraft, clearDraft };
   }
   ```

**Files to Create:**
- `client/src/routes/talent/ApplyPage.jsx`
- `client/src/schemas/applicationSchema.ts`
- `client/src/hooks/useApplicationDraft.js`
- `client/src/components/ImageSelector.jsx`

**Backend Changes:**
```javascript
// src/routes/applications.js
router.post('/api/applications', requireAuth, async (req, res) => {
  const {
    agencyId,
    message,
    availability,
    willingToTravel,
    preferredRates,
    selectedImages
  } = req.body;

  // Validation
  if (!message || message.length < 50) {
    return res.status(400).json({ error: { code: 'INVALID_MESSAGE' } });
  }

  // Create application
  const application = await db('applications').insert({
    id: uuidv4(),
    talent_id: req.session.userId,
    agency_id: agencyId,
    message,
    availability,
    willing_to_travel: willingToTravel,
    preferred_rate_min: preferredRates.min,
    preferred_rate_max: preferredRates.max,
    selected_images: JSON.stringify(selectedImages),
    status: 'pending',
    created_at: new Date()
  }).returning('*');

  // Notify agency
  await notifyAgency(agencyId, application[0]);

  res.json({ application: application[0] });
});
```

**Database Migration:**
```sql
-- migrations/20260215000000_add_application_fields.js
exports.up = function(knex) {
  return knex.schema.table('applications', function(table) {
    table.text('message');
    table.string('availability');
    table.boolean('willing_to_travel').defaultTo(false);
    table.decimal('preferred_rate_min');
    table.decimal('preferred_rate_max');
    table.jsonb('selected_images');
  });
};
```

**Testing:**
- [ ] Form renders with all fields
- [ ] Validation works (message length, rate comparison)
- [ ] Draft saving works (localStorage)
- [ ] Draft loads on page return
- [ ] Image selector shows portfolio images
- [ ] Max 10 images enforced
- [ ] Submit sends to backend
- [ ] Success redirects to applications page

**Effort:** 4 days
**Priority:** 🔴 HIGH

---

### Sprint 2.2 - Messaging Center (Week 7-8)

#### Task 2.2.1: Complete Chat/Messaging UI
**File:** `client/src/routes/talent/MessagesPage.jsx` (new)

**Note:** Chat foundation exists in `src/routes/chat.js`, needs UI completion.

**Action Items:**
1. Create messages page:
   ```jsx
   // client/src/routes/talent/MessagesPage.jsx
   export function MessagesPage() {
     const [selectedConversation, setSelectedConversation] = useState(null);
     const { data: conversations } = useConversations();

     return (
       <div className="h-[calc(100vh-4rem)] flex">
         {/* Conversations List (Left Sidebar) */}
         <div className="w-80 border-r bg-gray-50">
           <div className="p-4 border-b">
             <Input
               type="search"
               placeholder="Search conversations..."
               className="w-full"
             />
           </div>
           <div className="overflow-y-auto h-full">
             {conversations?.map(conv => (
               <ConversationItem
                 key={conv.id}
                 conversation={conv}
                 isActive={selectedConversation?.id === conv.id}
                 onClick={() => setSelectedConversation(conv)}
               />
             ))}
           </div>
         </div>

         {/* Message Thread (Main Area) */}
         {selectedConversation ? (
           <MessageThread
             conversation={selectedConversation}
             onClose={() => setSelectedConversation(null)}
           />
         ) : (
           <div className="flex-1 flex items-center justify-center text-gray-400">
             <div className="text-center">
               <MessageSquare className="h-12 w-12 mx-auto mb-4" />
               <p>Select a conversation to start messaging</p>
             </div>
           </div>
         )}
       </div>
     );
   }
   ```

2. Create message thread component:
   ```jsx
   // client/src/components/MessageThread.jsx
   export function MessageThread({ conversation, onClose }) {
     const [message, setMessage] = useState('');
     const { data: messages } = useMessages(conversation.id);
     const { mutate: sendMessage } = useSendMessage();
     const messagesEndRef = useRef(null);

     // Auto-scroll to bottom
     useEffect(() => {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
     }, [messages]);

     const handleSend = () => {
       if (!message.trim()) return;

       sendMessage({
         conversationId: conversation.id,
         content: message
       });

       setMessage('');
     };

     return (
       <div className="flex-1 flex flex-col">
         {/* Header */}
         <div className="p-4 border-b flex items-center justify-between">
           <div className="flex items-center gap-3">
             <Avatar>
               <AvatarImage src={conversation.otherUser.avatar} />
               <AvatarFallback>
                 {conversation.otherUser.name[0]}
               </AvatarFallback>
             </Avatar>
             <div>
               <h3 className="font-medium">{conversation.otherUser.name}</h3>
               <p className="text-sm text-gray-500">
                 {conversation.otherUser.role}
               </p>
             </div>
           </div>
           <Button variant="ghost" size="icon" onClick={onClose}>
             <X className="h-4 w-4" />
           </Button>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4">
           {messages?.map(msg => (
             <MessageBubble
               key={msg.id}
               message={msg}
               isOwn={msg.senderId === currentUserId}
             />
           ))}
           <div ref={messagesEndRef} />
         </div>

         {/* Input */}
         <div className="p-4 border-t">
           <div className="flex gap-2">
             <Textarea
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Type a message..."
               rows={1}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSend();
                 }
               }}
             />
             <Button onClick={handleSend} disabled={!message.trim()}>
               <Send className="h-4 w-4" />
             </Button>
           </div>
         </div>
       </div>
     );
   }
   ```

3. Add real-time updates (WebSocket):
   ```javascript
   // client/src/hooks/useRealtimeMessages.js
   import { useEffect } from 'react';
   import { io } from 'socket.io-client';

   export function useRealtimeMessages(conversationId) {
     const queryClient = useQueryClient();

     useEffect(() => {
       if (!conversationId) return;

       const socket = io(import.meta.env.VITE_API_URL, {
         auth: { conversationId }
       });

       socket.on('message', (message) => {
         // Update messages cache
         queryClient.setQueryData(
           ['messages', conversationId],
           (old) => [...old, message]
         );
       });

       return () => {
         socket.disconnect();
       };
     }, [conversationId]);
   }
   ```

**Files to Create:**
- `client/src/routes/talent/MessagesPage.jsx`
- `client/src/routes/agency/MessagesPage.jsx`
- `client/src/components/MessageThread.jsx`
- `client/src/components/MessageBubble.jsx`
- `client/src/components/ConversationItem.jsx`
- `client/src/hooks/useRealtimeMessages.js`

**Backend Changes:**
```javascript
// src/routes/chat.js - Add WebSocket support
const { Server } = require('socket.io');

function setupChatWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.APP_URL,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const { conversationId } = socket.handshake.auth;

    // Join conversation room
    socket.join(`conversation:${conversationId}`);

    // Listen for new messages
    socket.on('message', async (data) => {
      // Save to database
      const message = await saveMessage(data);

      // Broadcast to room
      io.to(`conversation:${conversationId}`).emit('message', message);
    });
  });

  return io;
}
```

**Testing:**
- [ ] Conversations list loads
- [ ] Click conversation opens thread
- [ ] Messages display correctly (own vs. other)
- [ ] Send message works
- [ ] Enter key sends message
- [ ] Real-time updates work (open 2 browsers)
- [ ] Auto-scroll to bottom
- [ ] Search conversations works

**Effort:** 5 days
**Priority:** 🔴 HIGH

---

### Sprint 2.3 - Filter Presets & Onboarding Checklist (Week 9)

#### Task 2.3.1: Build Filter Preset UI
**File:** `client/src/components/FilterPresets.jsx` (new)

**Action Items:**
1. Create preset manager:
   ```jsx
   // client/src/components/FilterPresets.jsx
   export function FilterPresets({ filters, onLoadPreset }) {
     const [presets, setPresets] = useState([]);
     const [showSaveDialog, setShowSaveDialog] = useState(false);
     const [presetName, setPresetName] = useState('');

     const { mutate: savePreset } = useSaveFilterPreset();
     const { mutate: deletePreset } = useDeleteFilterPreset();

     const handleSave = () => {
       savePreset({
         name: presetName,
         filters
       }, {
         onSuccess: () => {
           setShowSaveDialog(false);
           setPresetName('');
           toast({ title: 'Preset saved' });
         }
       });
     };

     return (
       <div className="flex items-center gap-2">
         <Popover>
           <PopoverTrigger asChild>
             <Button variant="outline" size="sm">
               <Bookmark className="h-4 w-4 mr-2" />
               Presets
             </Button>
           </PopoverTrigger>
           <PopoverContent className="w-64">
             <div className="space-y-2">
               <h4 className="font-medium">Saved Filters</h4>
               {presets.length === 0 ? (
                 <p className="text-sm text-gray-500">No saved presets</p>
               ) : (
                 <div className="space-y-1">
                   {presets.map(preset => (
                     <div
                       key={preset.id}
                       className="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
                     >
                       <button
                         onClick={() => onLoadPreset(preset.filters)}
                         className="flex-1 text-left text-sm"
                       >
                         {preset.name}
                       </button>
                       <Button
                         variant="ghost"
                         size="icon"
                         onClick={() => deletePreset(preset.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                   ))}
                 </div>
               )}
               <Button
                 onClick={() => setShowSaveDialog(true)}
                 size="sm"
                 className="w-full"
               >
                 Save Current Filters
               </Button>
             </div>
           </PopoverContent>
         </Popover>

         <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Save Filter Preset</DialogTitle>
             </DialogHeader>
             <Input
               value={presetName}
               onChange={(e) => setPresetName(e.target.value)}
               placeholder="Preset name..."
             />
             <DialogFooter>
               <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                 Cancel
               </Button>
               <Button onClick={handleSave} disabled={!presetName.trim()}>
                 Save
               </Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>
       </div>
     );
   }
   ```

2. Add to applicants page:
   ```jsx
   // ApplicantsPage.jsx
   <div className="flex items-center gap-3 mb-4">
     <FilterPresets
       filters={currentFilters}
       onLoadPreset={(preset) => {
         // Apply all filters from preset
         setSearchTerm(preset.searchTerm || '');
         setCityFilter(preset.city || '');
         // ... apply all filters
       }}
     />
     <Button
       variant="outline"
       onClick={clearAllFilters}
       disabled={!hasActiveFilters}
     >
       Clear Filters
     </Button>
   </div>
   ```

**Files to Create:**
- `client/src/components/FilterPresets.jsx`

**Files to Modify:**
- `client/src/routes/agency/ApplicantsPage.jsx`
- `client/src/routes/agency/DiscoverPage.jsx`

**Backend Changes:**
```javascript
// src/routes/agency/filter-presets.js
router.get('/api/agency/filter-presets', requireAuth, requireRole('AGENCY'), async (req, res) => {
  const presets = await db('filter_presets')
    .where({ agency_id: req.session.userId })
    .orderBy('created_at', 'desc');

  res.json({ presets });
});

router.post('/api/agency/filter-presets', requireAuth, requireRole('AGENCY'), async (req, res) => {
  const { name, filters } = req.body;

  const preset = await db('filter_presets').insert({
    id: uuidv4(),
    agency_id: req.session.userId,
    name,
    filters: JSON.stringify(filters),
    created_at: new Date()
  }).returning('*');

  res.json({ preset: preset[0] });
});

router.delete('/api/agency/filter-presets/:id', requireAuth, requireRole('AGENCY'), async (req, res) => {
  await db('filter_presets')
    .where({ id: req.params.id, agency_id: req.session.userId })
    .delete();

  res.json({ success: true });
});
```

**Database Migration:**
```sql
-- migrations/20260216000000_create_filter_presets.js
exports.up = function(knex) {
  return knex.schema.createTable('filter_presets', function(table) {
    table.uuid('id').primary();
    table.uuid('agency_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.jsonb('filters').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};
```

**Testing:**
- [ ] Save preset button appears
- [ ] Save dialog shows, accepts name
- [ ] Preset saves to database
- [ ] Preset list loads
- [ ] Click preset applies filters
- [ ] Delete preset works
- [ ] Empty state shows when no presets

**Effort:** 2 days
**Priority:** 🟡 MEDIUM

---

#### Task 2.3.2: Add Onboarding Checklist
**File:** `client/src/components/OnboardingChecklist.jsx` (new)

**Action Items:**
1. Create checklist component:
   ```jsx
   // client/src/components/OnboardingChecklist.jsx
   export function OnboardingChecklist({ profile }) {
     const tasks = [
       {
         id: 'email_verified',
         label: 'Verify your email',
         completed: profile.emailVerified,
         action: () => navigate('/settings/account')
       },
       {
         id: 'profile_photo',
         label: 'Add a profile photo',
         completed: !!profile.avatarUrl,
         action: () => navigate('/dashboard/talent/profile')
       },
       {
         id: 'portfolio_images',
         label: 'Upload at least 5 portfolio images',
         completed: profile.imageCount >= 5,
         action: () => navigate('/dashboard/talent/portfolio')
       },
       {
         id: 'bio',
         label: 'Write your bio',
         completed: !!profile.bio && profile.bio.length >= 50,
         action: () => navigate('/dashboard/talent/profile#bio')
       },
       {
         id: 'measurements',
         label: 'Complete measurements',
         completed: profile.measurementsComplete,
         action: () => navigate('/dashboard/talent/profile#measurements')
       },
       {
         id: 'first_application',
         label: 'Submit your first application',
         completed: profile.applicationCount > 0,
         action: () => navigate('/discover')
       }
     ];

     const completedCount = tasks.filter(t => t.completed).length;
     const progress = (completedCount / tasks.length) * 100;

     // Don't show if all completed
     if (completedCount === tasks.length) return null;

     return (
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Complete Your Profile</CardTitle>
               <CardDescription>
                 {completedCount} of {tasks.length} tasks completed
               </CardDescription>
             </div>
             <div className="text-right">
               <div className="text-2xl font-bold text-gold">
                 {Math.round(progress)}%
               </div>
             </div>
           </div>
           <Progress value={progress} className="mt-2" />
         </CardHeader>
         <CardContent>
           <div className="space-y-2">
             {tasks.map(task => (
               <div
                 key={task.id}
                 className={cn(
                   'flex items-center justify-between p-3 rounded-lg',
                   task.completed ? 'bg-green-50' : 'bg-gray-50'
                 )}
               >
                 <div className="flex items-center gap-3">
                   {task.completed ? (
                     <CheckCircle2 className="h-5 w-5 text-green-600" />
                   ) : (
                     <Circle className="h-5 w-5 text-gray-400" />
                   )}
                   <span className={cn(
                     'text-sm',
                     task.completed && 'line-through text-gray-500'
                   )}>
                     {task.label}
                   </span>
                 </div>
                 {!task.completed && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={task.action}
                   >
                     Complete
                   </Button>
                 )}
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
     );
   }
   ```

2. Add to overview page:
   ```jsx
   // OverviewPage.jsx
   <div className="grid gap-6">
     <OnboardingChecklist profile={profile} />
     {/* Rest of dashboard */}
   </div>
   ```

**Files to Create:**
- `client/src/components/OnboardingChecklist.jsx`

**Files to Modify:**
- `client/src/routes/talent/OverviewPage.jsx`
- `client/src/api/talent.js` (add profile completeness fields)

**Testing:**
- [ ] Checklist shows on dashboard
- [ ] Progress updates when tasks completed
- [ ] Click "Complete" navigates to correct page
- [ ] Checklist hides when 100% complete
- [ ] Tasks persist across sessions

**Effort:** 1 day
**Priority:** 🟡 MEDIUM

---

## Phase 3: Mobile & Polish (Days 61-90)
**Goal:** Optimize mobile experience and add final polish

### Sprint 3.1 - Mobile Optimization (Week 10-11)

#### Task 3.1.1: Add Touch Alternatives for Drag-and-Drop
**File:** `client/src/features/media/MediaGallery.jsx`

**Action Items:**
1. Add mobile reorder mode:
   ```jsx
   // MediaGallery.jsx
   const [mobileReorderMode, setMobileReorderMode] = useState(false);
   const [selectedForReorder, setSelectedForReorder] = useState([]);

   const handleMobileReorder = () => {
     if (selectedForReorder.length === 2) {
       const [imageA, imageB] = selectedForReorder;
       swapImages(imageA.id, imageB.id);
       setSelectedForReorder([]);
       setMobileReorderMode(false);
     }
   };

   return (
     <div>
       {/* Mobile: Show reorder button */}
       <div className="md:hidden mb-4">
         <Button
           variant={mobileReorderMode ? 'default' : 'outline'}
           onClick={() => {
             setMobileReorderMode(!mobileReorderMode);
             setSelectedForReorder([]);
           }}
         >
           {mobileReorderMode ? 'Cancel Reorder' : 'Reorder Images'}
         </Button>
       </div>

       {mobileReorderMode && (
         <Alert className="mb-4">
           <Info className="h-4 w-4" />
           <AlertDescription>
             Tap two images to swap their positions
             {selectedForReorder.length === 1 && ' (1 selected)'}
           </AlertDescription>
         </Alert>
       )}

       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
         {images.map(image => (
           <ImageCard
             key={image.id}
             image={image}
             mobileReorderMode={mobileReorderMode}
             isSelected={selectedForReorder.some(img => img.id === image.id)}
             onSelect={(img) => {
               if (selectedForReorder.length < 2) {
                 setSelectedForReorder([...selectedForReorder, img]);
               }
             }}
           />
         ))}
       </div>
     </div>
   );
   ```

**Files to Modify:**
- `client/src/features/media/MediaGallery.jsx`

**Testing:**
- [ ] Reorder button shows on mobile only
- [ ] Tap enables reorder mode
- [ ] Tap 2 images to swap
- [ ] Selection visual feedback
- [ ] Cancel reorder works
- [ ] Desktop drag-and-drop unaffected

**Effort:** 2 days
**Priority:** 🟡 MEDIUM

---

#### Task 3.1.2: Optimize Casting Flow for Mobile
**File:** `client/src/routes/casting/`

**Action Items:**
1. Responsive layout adjustments:
   ```jsx
   // CastingScout.jsx - Make dropzone mobile-friendly
   <div className="relative w-full h-[60vh] md:h-[70vh]">
     <Dropzone
       onDrop={handleDrop}
       className="h-full"
       // Mobile: Support tap to upload
       onClick={() => {
         if (isMobile) {
           fileInputRef.current?.click();
         }
       }}
     >
       <input
         ref={fileInputRef}
         type="file"
         accept="image/*"
         capture="environment" // Mobile: Use camera
         onChange={handleFileSelect}
         className="hidden"
       />
     </Dropzone>
   </div>
   ```

2. Touch-friendly progress bar:
   ```jsx
   // CastingCallPage.jsx
   <div className="fixed top-0 left-0 right-0 h-2 md:h-3 bg-gray-900 z-50">
     <div
       className="h-full bg-gold transition-all duration-300"
       style={{ width: `${progressPercentage}%` }}
     />
   </div>
   ```

**Files to Modify:**
- `client/src/routes/casting/CastingScout.jsx`
- `client/src/routes/casting/CastingCallPage.jsx`
- `client/src/routes/casting/CastingMeasurements.jsx`

**Testing:**
- [ ] Dropzone tap works on mobile
- [ ] Camera capture option appears
- [ ] Progress bar visible and responsive
- [ ] Form inputs large enough for touch
- [ ] Navigation buttons accessible

**Effort:** 2 days
**Priority:** 🟡 MEDIUM

---

### Sprint 3.2 - Accessibility & Polish (Week 12)

#### Task 3.2.1: Keyboard Navigation Audit
**File:** Global

**Action Items:**
1. Add keyboard navigation to modals:
   ```jsx
   // client/src/components/ui/Dialog.jsx
   useEffect(() => {
     if (!open) return;

     const handleKeyDown = (e) => {
       // ESC to close
       if (e.key === 'Escape') {
         onOpenChange(false);
       }

       // Tab trap
       if (e.key === 'Tab') {
         const focusableElements = dialogRef.current.querySelectorAll(
           'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
         );

         const firstElement = focusableElements[0];
         const lastElement = focusableElements[focusableElements.length - 1];

         if (e.shiftKey && document.activeElement === firstElement) {
           e.preventDefault();
           lastElement.focus();
         } else if (!e.shiftKey && document.activeElement === lastElement) {
           e.preventDefault();
           firstElement.focus();
         }
       }
     };

     document.addEventListener('keydown', handleKeyDown);
     return () => document.removeEventListener('keydown', handleKeyDown);
   }, [open]);
   ```

2. Add skip links:
   ```jsx
   // client/src/App.jsx
   <a
     href="#main-content"
     className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black"
   >
     Skip to main content
   </a>
   ```

3. Add ARIA landmarks:
   ```jsx
   // Header.jsx
   <header role="banner">

   // Sidebar.jsx
   <nav role="navigation" aria-label="Main navigation">

   // Main content
   <main id="main-content" role="main">
   ```

**Files to Modify:**
- All modal/dialog components
- `client/src/App.jsx`
- `client/src/components/DashboardLayoutShell.jsx`
- `client/src/components/Header.jsx`

**Testing:**
- [ ] Tab through entire app (logical order)
- [ ] ESC closes all modals
- [ ] Focus trapped in modals
- [ ] Skip link works
- [ ] Screen reader announces landmarks
- [ ] All interactive elements keyboard accessible

**Effort:** 3 days
**Priority:** 🟡 MEDIUM

---

#### Task 3.2.2: Color Contrast & Visual Indicators
**File:** Global CSS/Components

**Action Items:**
1. Audit color contrast:
   ```bash
   # Use automated tools
   npm install -D @axe-core/react
   ```

2. Add icon indicators to status:
   ```jsx
   // ApplicationStatus.jsx
   const statusConfig = {
     pending: {
       color: 'blue',
       icon: Clock,
       label: 'Pending Review'
     },
     accepted: {
       color: 'green',
       icon: CheckCircle,
       label: 'Accepted'
     },
     declined: {
       color: 'red',
       icon: XCircle,
       label: 'Declined'
     }
   };

   const { icon: Icon, color, label } = statusConfig[status];

   return (
     <span className={cn('flex items-center gap-2', `text-${color}-600`)}>
       <Icon className="h-4 w-4" />
       {label}
     </span>
   );
   ```

3. Fix private image indicator:
   ```jsx
   // MediaGallery.jsx - Add icon overlay, not just grayscale
   {!image.isPublic && (
     <div className="absolute top-2 right-2 bg-gray-900/80 rounded-full p-1.5">
       <EyeOff className="h-4 w-4 text-white" />
     </div>
   )}
   ```

**Files to Modify:**
- All status badges
- `client/src/features/media/MediaGallery.jsx`
- `tailwind.config.js` (color palette audit)

**Testing:**
- [ ] All text meets WCAG AA contrast ratio (4.5:1)
- [ ] Status indicators have icons + color
- [ ] Private images have icon, not just gray
- [ ] Focus indicators visible on all elements

**Effort:** 2 days
**Priority:** 🟡 MEDIUM

---

### Sprint 3.3 - Performance & Analytics (Week 13)

#### Task 3.3.1: Add Loading Optimization
**File:** `client/src/App.jsx`

**Action Items:**
1. Implement code splitting:
   ```jsx
   // App.jsx
   import { lazy, Suspense } from 'react';

   const OverviewPage = lazy(() => import('./routes/talent/OverviewPage'));
   const ProfilePage = lazy(() => import('./routes/talent/ProfilePage'));
   const PortfolioPage = lazy(() => import('./routes/talent/PortfolioPage'));

   <Suspense fallback={<LoadingSpinner />}>
     <Routes>
       <Route path="overview" element={<OverviewPage />} />
       <Route path="profile" element={<ProfilePage />} />
       <Route path="portfolio" element={<PortfolioPage />} />
     </Routes>
   </Suspense>
   ```

2. Prefetch critical routes:
   ```jsx
   // Header.jsx
   import { prefetchQuery } from '@tanstack/react-query';

   <Link
     to="/dashboard/talent/portfolio"
     onMouseEnter={() => {
       // Prefetch on hover
       prefetchQuery({ queryKey: ['media'], queryFn: fetchMedia });
     }}
   >
     Portfolio
   </Link>
   ```

3. Image optimization:
   ```jsx
   // ImageCard.jsx
   <img
     src={image.thumbnailUrl} // Use thumbnails in gallery
     srcSet={`${image.thumbnailUrl} 300w, ${image.url} 800w`}
     sizes="(max-width: 768px) 300px, 800px"
     loading="lazy"
     decoding="async"
   />
   ```

**Files to Modify:**
- `client/src/App.jsx`
- `client/src/components/Header.jsx`
- All image components

**Testing:**
- [ ] Bundle size reduced (check with `npm run build`)
- [ ] Initial page load faster (<3s)
- [ ] Images lazy load
- [ ] Prefetch works (check Network tab)
- [ ] Lighthouse score >90

**Effort:** 2 days
**Priority:** 🟢 LOW

---

## Success Metrics & Testing

### Phase 1 Success Criteria (Day 30)
- [ ] Email verification bypass fixed (100% verification rate)
- [ ] Zero accidental deletions reported
- [ ] All errors show actionable messages
- [ ] Progress persistence working (0% data loss)
- [ ] Exit paths available in all flows

**KPIs:**
- Onboarding completion rate: 60% → 70%
- Support tickets (data loss): -80%
- User satisfaction score: 3.2 → 4.0/5

---

### Phase 2 Success Criteria (Day 60)
- [ ] Application submission flow complete
- [ ] Messaging center active with real-time updates
- [ ] Filter presets saving/loading
- [ ] Onboarding checklist guiding new users

**KPIs:**
- Application submission rate: 40% → 60%
- Agency response time: 3 days → 1.5 days
- Active conversations: +200%
- Filter preset usage: 50% of agencies

---

### Phase 3 Success Criteria (Day 90)
- [ ] Mobile experience optimized
- [ ] WCAG AA compliance achieved
- [ ] Performance metrics improved
- [ ] Analytics tracking active

**KPIs:**
- Mobile usage: 30% → 45%
- Lighthouse score: >90 (all categories)
- Accessibility score: 100%
- Page load time: <3 seconds

---

## Risk Management

### High-Risk Tasks
| Task | Risk | Mitigation |
|------|------|------------|
| Email verification | Breaking existing auth | Feature flag, staged rollout |
| Messaging WebSocket | Server scalability | Load testing, connection pooling |
| Mobile reorder | Touch conflicts | Progressive enhancement |
| Database migrations | Data loss | Backup before migration, rollback plan |

---

## Resource Requirements

### Development Team
- **Frontend Developer:** Full-time (90 days)
- **Backend Developer:** 50% (45 days)
- **QA Engineer:** 25% (testing each sprint)
- **Designer:** 10% (mobile layouts, polish)

### Infrastructure
- **Staging environment** for testing
- **WebSocket server** (Phase 2)
- **CDN** for image optimization (Phase 3)
- **Analytics platform** (Mixpanel/Amplitude)

---

## Deployment Strategy

### Sprint Deployments
- Deploy to staging after each sprint
- User acceptance testing (2 days)
- Deploy to production (Friday afternoon)
- Monitor over weekend

### Feature Flags
```javascript
// Use feature flags for high-risk features
const FEATURE_FLAGS = {
  EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
  REALTIME_MESSAGING: process.env.ENABLE_REALTIME_MESSAGING === 'true',
  MOBILE_REORDER: process.env.ENABLE_MOBILE_REORDER === 'true'
};

// Enable progressively
if (FEATURE_FLAGS.EMAIL_VERIFICATION) {
  // New verification flow
} else {
  // Old flow (fallback)
}
```

---

## Rollback Plan

### If Critical Bug in Production
1. **Immediate:** Revert to previous deployment (< 5 min)
2. **Communication:** Notify users via status page
3. **Hotfix:** Fix in staging, fast-track deploy
4. **Post-mortem:** Document root cause

### Database Rollback
```sql
-- Each migration has down() function
npm run migrate:rollback

-- Restore from backup if needed
pg_restore -d pholio production_backup_20260214.dump
```

---

## Next Steps

**To begin Phase 1:**

1. Create branch: `git checkout -b ux-improvements`
2. Start with Task 1.1.1 (Email verification - CRITICAL)
3. Daily standups to track progress
4. Weekly demos to stakeholders
5. Deploy Sprint 1.1 after Week 1

**Should I begin implementing Phase 1, Sprint 1.1?** 🚀
