# 🔧 Scholarship Service Migration Fix

## 🚨 Problem Identified

The migration `2025_01_15_100002_add_soft_deletes_to_applications_table.php` was trying to modify a table called `applications`, but the actual table is named `scholarship_applications`.

**Error:** `Table 'scholarship_service.applications' doesn't exist`

## ✅ Solution Applied

I've fixed the migration file to reference the correct table name:

### Before (❌ Incorrect):
```php
Schema::table('applications', function (Blueprint $table) {
    $table->softDeletes();
    // ...
});
```

### After (✅ Fixed):
```php
Schema::table('scholarship_applications', function (Blueprint $table) {
    $table->softDeletes();
    // ...
});
```

## 🚀 How to Fix Your Deployment

### Option 1: Quick Fix (Recommended)
1. **The migration file is already fixed** - just redeploy your service
2. **Redeploy to Railway** - the fixed migration will run correctly

### Option 2: Manual Fix (If needed)
1. **SSH into your Railway deployment** or access your database
2. **Run the migration reset and re-run:**
   ```bash
   php artisan migrate:reset --force
   php artisan migrate --force
   ```

### Option 3: Database Fix (If migrations are stuck)
1. **Manually create the missing columns:**
   ```sql
   ALTER TABLE scholarship_applications 
   ADD COLUMN deleted_at TIMESTAMP NULL,
   ADD COLUMN deleted_by VARCHAR(255) NULL,
   ADD COLUMN deletion_reason TEXT NULL;
   ```

2. **Mark the migration as run:**
   ```bash
   php artisan migrate:status
   # Find the migration and mark it as completed
   ```

## 🔍 Verification Steps

### 1. Check Migration Status
```bash
php artisan migrate:status
```

### 2. Verify Table Structure
```sql
DESCRIBE scholarship_applications;
```
You should see:
- `deleted_at` (timestamp, nullable)
- `deleted_by` (varchar, nullable) 
- `deletion_reason` (text, nullable)

### 3. Test the Service
```bash
curl https://scholarship-gsph.up.railway.app/api/health
```

## 📋 Migration Order

The migrations should run in this order:
1. ✅ Create base tables (`scholarship_applications`, `documents`, etc.)
2. ✅ Add soft deletes to existing tables
3. ✅ Add other modifications

## 🛠️ Additional Fixes Included

I've also created helper scripts:

### 1. Migration Fix Script
- **File:** `fix-migrations.sh`
- **Usage:** Run from scholarship service directory
- **What it does:** Resets and re-runs all migrations

### 2. Migration Status Checker
- **File:** `check-migrations.php`
- **Usage:** `php check-migrations.php`
- **What it does:** Checks migration status and identifies issues

## 🎯 Expected Results

After applying the fix:
- ✅ All migrations should run successfully
- ✅ `scholarship_applications` table should have soft delete columns
- ✅ Scholarship service should be accessible
- ✅ CORS errors should be resolved (if CORS is configured)
- ✅ 401 errors should be resolved (if authentication is working)

## 🚨 If You Still Have Issues

### Check These Common Problems:

1. **Database Connection Issues**
   - Verify `.env` database credentials
   - Check if database server is running
   - Ensure database exists

2. **Permission Issues**
   - Check if user has CREATE/ALTER permissions
   - Verify database user privileges

3. **Migration Conflicts**
   - Check if migrations have been partially run
   - Reset migrations if needed: `php artisan migrate:reset`

4. **Table Name Mismatches**
   - Verify all migrations use correct table names
   - Check for typos in table references

## 📞 Support

If you continue to have issues:
1. Check the Railway logs for specific error messages
2. Run the migration status checker: `php check-migrations.php`
3. Verify your database connection and permissions

The fix should resolve your migration issues! 🎉
