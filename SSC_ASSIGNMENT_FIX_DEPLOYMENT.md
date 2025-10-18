# SSC Assignment Fix - Deployment Guide

## Problem Summary

The SSC member assignment system was only creating assignments for City Council (document verification) users. When users with other SSC roles (Budget Department, Education Affairs, Chairperson) were created, no records were being added to the `ssc_member_assignments` table.

### Root Cause

In `UserManagementController.php`, the `createSSCAssignment()` method was checking if a user had **any** active SSC assignment before creating a new one. This meant:

1. First user created (e.g., City Council) → assignment created ✅
2. Same user assigned another role (e.g., Budget Dept) → assignment NOT created ❌ (because they already had one assignment)

The check should have been: does this user already have an assignment for **this specific role**?

## Expected Behavior

Each SSC role should map to its corresponding review stage:

| User Role               | SSC Role            | Review Stage            |
| ----------------------- | ------------------- | ----------------------- |
| `ssc_city_council`      | `city_council`      | `document_verification` |
| `ssc_budget_dept`       | `budget_dept`       | `financial_review`      |
| `ssc_education_affairs` | `education_affairs` | `academic_review`       |
| `ssc` (Chairperson)     | `chairperson`       | `final_approval`        |

## Files Changed

1. **`microservices/scholarship_service/app/Http/Controllers/Api/UserManagementController.php`**

   - Fixed the `createSSCAssignment()` method to check for specific role assignments instead of any assignment
   - Line 510-512: Added `ssc_role` to the query filter

2. **`microservices/scholarship_service/fix_ssc_assignments.php`** (NEW)
   - Script to backfill missing SSC assignments for existing users

## Deployment Steps for Railway

### Step 1: Deploy Code Changes

```bash
# Commit and push changes
git add microservices/scholarship_service/app/Http/Controllers/Api/UserManagementController.php
git add microservices/scholarship_service/fix_ssc_assignments.php
git add SSC_ASSIGNMENT_FIX_DEPLOYMENT.md
git commit -m "Fix: SSC member assignments not created for all roles"
git push origin main
```

Railway will automatically deploy the changes.

### Step 2: Run Fix Script on Railway

**Option A: Using Railway CLI**

```bash
# Install Railway CLI if not already installed
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run the fix script
railway run php microservices/scholarship_service/fix_ssc_assignments.php
```

**Option B: Using Railway Web Interface**

1. Go to your Railway project dashboard
2. Select the scholarship service
3. Go to the "Variables" tab and add if needed:
   - `AUTH_SERVICE_URL` (should already exist)
4. Go to the "Settings" tab
5. In "Custom Start Command" section, temporarily change the command to:
   ```bash
   php microservices/scholarship_service/fix_ssc_assignments.php && php artisan serve --host=0.0.0.0 --port=$PORT
   ```
6. Redeploy
7. Check the logs to see the script output
8. **IMPORTANT:** After the script runs successfully, revert the start command to the original

**Option C: Using Database Console (Manual SQL)**

If you have direct database access:

```sql
-- First, check current assignments
SELECT
    sma.id,
    sma.user_id,
    sma.ssc_role,
    sma.review_stage,
    sma.is_active
FROM ssc_member_assignments sma
WHERE sma.is_active = 1
ORDER BY sma.review_stage, sma.ssc_role;

-- Check users with SSC roles from auth service
-- Then manually insert missing assignments:

INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
VALUES
-- Budget Department users
(5, 'budget_dept', 'financial_review', 1, NOW(), NOW(), NOW()),
-- Education Affairs users
(8, 'education_affairs', 'academic_review', 1, NOW(), NOW(), NOW()),
-- Chairperson users
(1, 'chairperson', 'final_approval', 1, NOW(), NOW(), NOW());

-- Replace user IDs above with actual user IDs from your auth service
```

### Step 3: Verify the Fix

After deployment and running the fix script:

```bash
# Check the assignments via API (if you have access)
curl -X GET "https://your-scholarship-service.railway.app/api/ssc/assignments" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or check via database
SELECT
    sma.id,
    sma.user_id,
    sma.ssc_role,
    sma.review_stage,
    COUNT(*) as count
FROM ssc_member_assignments sma
WHERE sma.is_active = 1
GROUP BY sma.review_stage
ORDER BY sma.review_stage;
```

Expected results:

- `document_verification` stage: 1+ users (city_council)
- `financial_review` stage: 1+ users (budget_dept)
- `academic_review` stage: 1+ users (education_affairs)
- `final_approval` stage: 1+ users (chairperson)

### Step 4: Test New User Creation

Create a new test user with an SSC role:

```json
POST /api/users
{
  "citizen_id": "SSC-TEST-001",
  "email": "test.budget@test.com",
  "role": "ssc_budget_dept",
  "first_name": "Test",
  "last_name": "Budget User"
}
```

Verify that the assignment is created:

1. Check the `ssc_member_assignments` table for the new user
2. User should have `budget_dept` role with `financial_review` stage

## Verification Checklist

- [ ] Code deployed to Railway
- [ ] Fix script executed successfully
- [ ] All four review stages have at least one assigned user:
  - [ ] `document_verification` (city_council)
  - [ ] `financial_review` (budget_dept)
  - [ ] `academic_review` (education_affairs)
  - [ ] `final_approval` (chairperson)
- [ ] New SSC user creation creates assignment record
- [ ] Existing SSC workflow works correctly

## Troubleshooting

### Script Fails to Fetch Users

**Error:** "Failed to fetch users from auth service"

**Solution:** Check that `AUTH_SERVICE_URL` environment variable is set correctly in Railway:

```bash
railway variables
# Should show AUTH_SERVICE_URL with correct value
```

### Duplicate Key Error

**Error:** "Duplicate entry for key 'user_id_ssc_role'"

**Solution:** This is expected if assignments already exist. The script will skip them and continue.

### No SSC Users Found

**Error:** "Found 0 SSC users"

**Solution:**

1. Verify users exist in auth service with roles: `ssc`, `ssc_city_council`, `ssc_budget_dept`, `ssc_education_affairs`
2. Check auth service is accessible from scholarship service
3. Verify auth service API endpoint: `/api/internal/users`

## Rollback Plan

If issues occur:

1. **Rollback code:**

   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Remove incorrect assignments:**
   ```sql
   -- Only if needed - be careful!
   DELETE FROM ssc_member_assignments
   WHERE created_at > '2025-10-18 00:00:00'  -- Adjust date
   AND id NOT IN (
     SELECT MIN(id) FROM ssc_member_assignments
     GROUP BY user_id, ssc_role
   );
   ```

## Future Considerations

1. **Add Migration:** Consider creating a Laravel migration for this fix to ensure it runs automatically in future deployments
2. **Add Tests:** Add unit tests for the `createSSCAssignment()` method
3. **Add Validation:** Add checks to ensure all required SSC roles have at least one active member
4. **Add Monitoring:** Add alerts if any review stage has no active members

## Related Files

- `microservices/scholarship_service/app/Models/SscMemberAssignment.php`
- `microservices/scholarship_service/app/Http/Controllers/Api/SSCAssignmentController.php`
- `microservices/scholarship_service/database/seeders/SscMemberAssignmentSeeder.php`
- `SSC_PARALLEL_WORKFLOW_GUIDE.md`

## Support

If you encounter issues:

1. Check Railway logs for error messages
2. Verify database connections
3. Check auth service connectivity
4. Review the fix script output for specific errors
