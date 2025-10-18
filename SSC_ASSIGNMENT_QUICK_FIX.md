# SSC Assignment Quick Fix Guide

## 🚨 Problem

Users with SSC Budget Dept, Education Affairs, and Chairperson roles were NOT getting records in `ssc_member_assignments` table.

## ✅ Solution Applied

### Code Change

File: `microservices/scholarship_service/app/Http/Controllers/Api/UserManagementController.php`

Changed the assignment check from "any assignment" to "specific role assignment":

```diff
- $existingAssignment = \App\Models\SscMemberAssignment::where('user_id', $userId)
-     ->where('is_active', true)
-     ->first();

+ $existingAssignment = \App\Models\SscMemberAssignment::where('user_id', $userId)
+     ->where('ssc_role', $mapping['ssc_role'])
+     ->where('is_active', true)
+     ->first();
```

## 🚀 Deploy to Railway NOW

### Step 1: Push Code (30 seconds)

```bash
git add microservices/scholarship_service/app/Http/Controllers/Api/UserManagementController.php
git add microservices/scholarship_service/fix_ssc_assignments.php
git add *.md
git commit -m "Fix: SSC member assignments now created for all roles"
git push origin main
```

Railway will auto-deploy.

### Step 2: Fix Existing Data (2 minutes)

**Method 1: Run PHP Script via Railway CLI**

```bash
# One-time setup
npm i -g @railway/cli
railway login
railway link

# Run the fix
railway run php microservices/scholarship_service/fix_ssc_assignments.php
```

**Method 2: Direct Database Insert**

First, identify your SSC users:

```sql
-- Check users from auth service that have SSC roles
-- You need user_id for: ssc, ssc_budget_dept, ssc_education_affairs
```

Then insert missing assignments:

```sql
INSERT INTO ssc_member_assignments
  (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
VALUES
  -- Budget Dept (replace 5 with actual user_id)
  (5, 'budget_dept', 'financial_review', 1, NOW(), NOW(), NOW()),

  -- Education Affairs (replace 8 with actual user_id)
  (8, 'education_affairs', 'academic_review', 1, NOW(), NOW(), NOW()),

  -- Chairperson (replace 1 with actual user_id)
  (1, 'chairperson', 'final_approval', 1, NOW(), NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();
```

### Step 3: Verify (1 minute)

```sql
SELECT
    review_stage,
    COUNT(*) as count
FROM ssc_member_assignments
WHERE is_active = 1
GROUP BY review_stage;
```

✅ You should see:

- `document_verification`: 1+
- `financial_review`: 1+
- `academic_review`: 1+
- `final_approval`: 1+

## 🎯 Role Mapping Reference

| Auth Service Role       | →   | SSC Role            | →   | Review Stage            |
| ----------------------- | --- | ------------------- | --- | ----------------------- |
| `ssc_city_council`      | →   | `city_council`      | →   | `document_verification` |
| `ssc_budget_dept`       | →   | `budget_dept`       | →   | `financial_review`      |
| `ssc_education_affairs` | →   | `education_affairs` | →   | `academic_review`       |
| `ssc`                   | →   | `chairperson`       | →   | `final_approval`        |

## 🧪 Test It Works

1. **Create a test SSC user:**

```bash
# Via your admin UI or API:
POST /api/users
{
  "citizen_id": "SSC-TEST-999",
  "email": "test.ssc@example.com",
  "role": "ssc_budget_dept",
  "first_name": "Test",
  "last_name": "User"
}
```

2. **Verify assignment was created:**

```sql
SELECT * FROM ssc_member_assignments
WHERE user_id = [new_user_id];
```

Should show: `budget_dept` | `financial_review` | `1` (is_active)

## ⚠️ Common Issues

### Issue: "Duplicate key error"

**Solution:** Assignment already exists. This is OK - script will skip it.

### Issue: "No users found with SSC roles"

**Solution:** Check your auth service has users with roles: `ssc`, `ssc_city_council`, `ssc_budget_dept`, `ssc_education_affairs`

### Issue: Script can't connect to auth service

**Solution:** Verify `AUTH_SERVICE_URL` environment variable is set in Railway

## 📊 Impact

**Before Fix:**

- ❌ Only city_council assignments created
- ❌ Financial review stage had NO reviewers
- ❌ Academic review stage had NO reviewers
- ❌ Final approval stage had NO approvers
- ❌ Applications stuck at document verification

**After Fix:**

- ✅ All SSC roles get assignments
- ✅ Complete workflow coverage
- ✅ Applications can flow through all stages
- ✅ Future SSC users auto-assigned correctly

## 📝 Files Changed

1. ✅ `UserManagementController.php` - Fixed assignment logic
2. ✅ `fix_ssc_assignments.php` - Backfill script
3. ✅ `fix-ssc-assignments.sql` - SQL alternative
4. ✅ Documentation files

## ⏱️ Total Time to Fix: ~5 minutes

1. Push code: 30 sec
2. Run fix script: 2 min
3. Verify: 1 min
4. Test new user: 1-2 min

---

**Need detailed instructions?** See: `SSC_ASSIGNMENT_FIX_DEPLOYMENT.md`

**Questions?** Check: `SSC_ASSIGNMENT_FIX_SUMMARY.md`
