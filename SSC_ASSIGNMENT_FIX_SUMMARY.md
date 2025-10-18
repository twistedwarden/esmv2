# SSC Assignment Fix Summary

## Problem

SSC member assignments were not being created for Budget Department, Education Affairs, and Chairperson roles. Only City Council (document verification) assignments were being created.

## Root Cause

The `createSSCAssignment()` method in `UserManagementController.php` was checking if a user had **any** active SSC assignment, instead of checking if they had an assignment for the **specific role** being assigned.

## What Was Fixed

### 1. Code Fix

**File:** `microservices/scholarship_service/app/Http/Controllers/Api/UserManagementController.php`

**Changed:** Line 510-512

```php
// OLD - Wrong: checks for ANY assignment
$existingAssignment = \App\Models\SscMemberAssignment::where('user_id', $userId)
    ->where('is_active', true)
    ->first();

// NEW - Correct: checks for THIS SPECIFIC role assignment
$existingAssignment = \App\Models\SscMemberAssignment::where('user_id', $userId)
    ->where('ssc_role', $mapping['ssc_role'])
    ->where('is_active', true)
    ->first();
```

**Also Fixed:** Corrected `budget_department` to `budget_dept` to match database enum values.

### 2. Role Mappings (Corrected)

```php
'ssc' => ['ssc_role' => 'chairperson', 'review_stage' => 'final_approval']
'ssc_city_council' => ['ssc_role' => 'city_council', 'review_stage' => 'document_verification']
'ssc_budget_dept' => ['ssc_role' => 'budget_dept', 'review_stage' => 'financial_review']
'ssc_education_affairs' => ['ssc_role' => 'education_affairs', 'review_stage' => 'academic_review']
```

## Files Created

1. **`fix_ssc_assignments.php`** - PHP script to backfill missing assignments
2. **`fix-ssc-assignments.sql`** - SQL script for manual database fixes
3. **`SSC_ASSIGNMENT_FIX_DEPLOYMENT.md`** - Detailed deployment guide for Railway
4. **`SSC_ASSIGNMENT_FIX_SUMMARY.md`** - This summary document

## Quick Deployment Steps

### 1. Deploy Code

```bash
git add .
git commit -m "Fix: SSC member assignments for all roles"
git push origin main
```

### 2. Run Fix Script on Railway

**Option A: Railway CLI**

```bash
railway login
railway link
railway run php microservices/scholarship_service/fix_ssc_assignments.php
```

**Option B: Direct SQL (if you have database access)**

```sql
-- Check current assignments
SELECT user_id, ssc_role, review_stage
FROM ssc_member_assignments
WHERE is_active = 1;

-- Insert missing assignments (replace USER_IDs with actual IDs)
INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
VALUES
  (5, 'budget_dept', 'financial_review', 1, NOW(), NOW(), NOW()),
  (8, 'education_affairs', 'academic_review', 1, NOW(), NOW(), NOW()),
  (1, 'chairperson', 'final_approval', 1, NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

### 3. Verify

```sql
SELECT
    review_stage,
    ssc_role,
    COUNT(*) as member_count
FROM ssc_member_assignments
WHERE is_active = 1
GROUP BY review_stage, ssc_role;
```

Expected output:

- `document_verification` | `city_council` | 1+
- `financial_review` | `budget_dept` | 1+
- `academic_review` | `education_affairs` | 1+
- `final_approval` | `chairperson` | 1+

## Impact

✅ **Before Fix:**

- Only City Council users got SSC assignments
- Budget Dept, Education Affairs, Chairperson users had NO assignments
- SSC workflow would fail at financial_review and later stages

✅ **After Fix:**

- All SSC roles get proper assignments
- Complete SSC workflow from document verification → financial review → academic review → final approval
- Future SSC users will automatically get correct assignments

## Testing Checklist

- [ ] Create new SSC Budget Dept user → assignment created with `budget_dept` role
- [ ] Create new SSC Education Affairs user → assignment created with `education_affairs` role
- [ ] Create new SSC Chairperson user → assignment created with `chairperson` role
- [ ] Existing assignments remain intact
- [ ] SSC workflow completes all stages successfully

## Related Documentation

- `SSC_ASSIGNMENT_FIX_DEPLOYMENT.md` - Full deployment guide
- `SSC_PARALLEL_WORKFLOW_GUIDE.md` - SSC workflow documentation
- `SSC_DOCUMENT_VERIFICATION_FIX.md` - Previous SSC fixes

## Contact

If you encounter issues during deployment:

1. Check Railway logs for errors
2. Verify database schema matches expected structure
3. Ensure AUTH_SERVICE_URL is configured correctly
4. Review the detailed deployment guide
