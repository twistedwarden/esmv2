<!-- 53af6642-e8d5-4dfa-92a0-3fed218c3994 ca12b12b-5375-4376-bedd-13576554a0f0 -->
# Interview to SSC Endorsement Workflow

## Overview

After an interviewer submits an interview evaluation, the application should move from Interview Schedules to Endorse SSC, where staff can review the evaluation scores and endorse to SSC for final approval.

## Backend Changes

### 1. Database Migration - Store Interview Evaluation Data

**File**: `microservices/scholarship_service/database/migrations/YYYY_MM_DD_add_interview_evaluation_to_applications.php`

Create new migration to add interview evaluation fields to `scholarship_applications` table:

- `interview_evaluation` (JSON) - stores all evaluation scores and data
- `interview_summary_score` (decimal) - calculated average of all scores

### 2. Update ScholarshipApplication Model

**File**: `microservices/scholarship_service/app/Models/ScholarshipApplication.php`

- Add `interview_evaluation` and `interview_summary_score` to `$fillable` array
- Add `interview_evaluation` to `$casts` as 'array'
- Update `completeInterview()` method to accept and store evaluation data

### 3. Update ScholarshipApplicationController

**File**: `microservices/scholarship_service/app/Http/Controllers/ScholarshipApplicationController.php`

Update `completeInterview()` method (around line 1061):

- Accept `evaluation_data` parameter
- Calculate summary score from evaluation scores
- Store evaluation data in application record
- Change status to `interview_completed`

### 4. Create EndorseToSSC API Endpoints

**File**: `microservices/scholarship_service/routes/api.php`

Add new routes:

```php
Route::get('/applications/endorse-to-ssc', [ScholarshipApplicationController::class, 'getEndorseToSSCApplications']);
Route::post('/applications/{application}/endorse-to-ssc', [ScholarshipApplicationController::class, 'endorseApplicationToSSC']);
```

### 5. Add Controller Methods

**File**: `microservices/scholarship_service/app/Http/Controllers/ScholarshipApplicationController.php`

Add two new methods:

- `getEndorseToSSCApplications()` - fetch applications with status `interview_completed`
- `endorseApplicationToSSC()` - change status from `interview_completed` to `endorsed_to_ssc`

## Frontend Changes

### 6. Update API Service

**File**: `GSM/src/services/scholarshipApiService.ts`

Add new methods:

- `getEndorseToSSCApplications()` - fetch interview_completed applications
- `endorseApplicationToSSC(applicationId, notes)` - endorse application to SSC

### 7. Update InterviewSchedules Component

**File**: `GSM/src/admin/components/modules/scholarship/application/InterviewSchedules.jsx`

In `handleEvaluationSubmit()` function (around line 814):

- Keep the API call to `completeApplicationInterview()` with evaluation data
- Remove schedule from list after successful submission (already implemented)
- Application status changes to `interview_completed` (backend handles this)

### 8. Update EndorseToSSC Component

**File**: `GSM/src/admin/components/modules/scholarship/application/EndorseToSSC.jsx`

Major updates:

- Replace mock data with real API call to fetch `interview_completed` applications
- Add interview evaluation display section in application details modal
- Display evaluation scores:
  - Academic Motivation Score
  - Leadership & Involvement Score
  - Financial Need Score
  - Character & Values Score
  - Summary Score (calculated average)
  - Overall Recommendation
  - Remarks
- Update `handleEndorse()` to call API and change status to `endorsed_to_ssc`
- Remove application from list after successful endorsement

### 9. Update SSC ApplicationReview Component

**File**: `GSM/src/admin/components/modules/scholarship/ssc/ApplicationReview.jsx`

- Update to fetch applications with status `endorsed_to_ssc`
- Add interview evaluation display in application details
- Show same evaluation scores as EndorseToSSC component
- SSC can view evaluation data (read-only) and make final approval decision

### 10. Update Status Handling

**Files**:

- `GSM/src/admin/components/modules/scholarship/application/ScholarshipApplications.jsx`
- `GSM/src/pages/scholarshipDashboard/ScholarshipDashboard.tsx`
- `GSM/src/pages/Portal.tsx`

Add status handling for:

- `interview_completed` - show in EndorseToSSC
- `endorsed_to_ssc` - show in SSC ApplicationReview

## Workflow Summary

1. Interviewer submits evaluation → Application status: `interview_completed`
2. Application appears in EndorseToSSC component with evaluation data
3. Staff reviews evaluation and endorses → Application status: `endorsed_to_ssc`
4. Application appears in SSC ApplicationReview component
5. SSC reviews and makes final approval decision

## Key Features

- Interview evaluation data persists with application
- Summary score calculated automatically
- Applications flow through proper approval chain
- Each stage can view previous evaluation data
- Clean separation between endorsement and final approval

### To-dos

- [ ] Create database migrations for partner_school_enrollment_data table and update existing tables
- [ ] Create PartnerSchoolEnrollmentData model with relationships and scopes
- [ ] Create EnrollmentVerificationService for automatic verification logic
- [ ] Create CSVImportService for handling CSV file uploads and parsing
- [ ] Create PartnerSchoolEnrollmentController with upload, search, and management endpoints
- [ ] Update ScholarshipApplicationController to trigger automatic verification on review
- [ ] Add API routes for enrollment data management and verification
- [ ] Create enrollmentApiService.ts with methods for enrollment data operations
- [ ] Create EnrollmentDataUpload component for CSV file uploads
- [ ] Create EnrollmentDataManagement component for admin portal
- [ ] Update VerifiedEnrolledStudents to show auto-verification status and details
- [ ] Add notification methods for verification events
- [ ] Create enrollment.php config file with verification settings
- [ ] Create CSV format documentation and admin guide
- [ ] Create sample CSV files and unit tests for verification service