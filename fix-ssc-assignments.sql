-- Fix SSC Member Assignments
-- This script creates missing SSC member assignments based on user roles
-- Run this on the scholarship_service database after identifying missing assignments

-- Step 1: Check current assignments
SELECT 
    sma.id,
    sma.user_id,
    sma.ssc_role,
    sma.review_stage,
    sma.is_active,
    sma.assigned_at
FROM ssc_member_assignments sma
WHERE sma.is_active = 1
ORDER BY 
    FIELD(sma.review_stage, 'document_verification', 'financial_review', 'academic_review', 'final_approval'),
    sma.ssc_role;

-- Step 2: Identify what assignments should exist
-- You need to get user IDs from the auth service first
-- Expected mappings:
--   ssc_city_council -> city_council, document_verification
--   ssc_budget_dept -> budget_dept, financial_review  
--   ssc_education_affairs -> education_affairs, academic_review
--   ssc -> chairperson, final_approval

-- Step 3: Create missing assignments (TEMPLATE - Replace USER_IDs with actual IDs)
-- Run these INSERT statements for each user that's missing an assignment

-- Example for Budget Department user (user_id = 5):
-- INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
-- VALUES (5, 'budget_dept', 'financial_review', 1, NOW(), NOW(), NOW())
-- ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Example for Education Affairs user (user_id = 8):
-- INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
-- VALUES (8, 'education_affairs', 'academic_review', 1, NOW(), NOW(), NOW())
-- ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Example for Chairperson (user_id = 1):
-- INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
-- VALUES (1, 'chairperson', 'final_approval', 1, NOW(), NOW(), NOW())
-- ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Step 4: Insert actual assignments based on your auth service users
-- IMPORTANT: Query your auth service to get the actual user IDs for each SSC role
-- Then uncomment and modify the following INSERT statements

-- For City Council users (document_verification):
-- INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
-- SELECT id, 'city_council', 'document_verification', 1, NOW(), NOW(), NOW()
-- FROM auth_service.users 
-- WHERE role = 'ssc_city_council' AND is_active = 1
-- ON DUPLICATE KEY UPDATE updated_at = NOW();

-- For Budget Department users (financial_review):
-- INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
-- SELECT id, 'budget_dept', 'financial_review', 1, NOW(), NOW(), NOW()
-- FROM auth_service.users 
-- WHERE role = 'ssc_budget_dept' AND is_active = 1
-- ON DUPLICATE KEY UPDATE updated_at = NOW();

-- For Education Affairs users (academic_review):
-- INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
-- SELECT id, 'education_affairs', 'academic_review', 1, NOW(), NOW(), NOW()
-- FROM auth_service.users 
-- WHERE role = 'ssc_education_affairs' AND is_active = 1
-- ON DUPLICATE KEY UPDATE updated_at = NOW();

-- For Chairperson users (final_approval):
-- INSERT INTO ssc_member_assignments (user_id, ssc_role, review_stage, is_active, assigned_at, created_at, updated_at)
-- SELECT id, 'chairperson', 'final_approval', 1, NOW(), NOW(), NOW()
-- FROM auth_service.users 
-- WHERE role = 'ssc' AND is_active = 1
-- ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Step 5: Verify the results
SELECT 
    sma.review_stage,
    sma.ssc_role,
    COUNT(*) as member_count,
    GROUP_CONCAT(sma.user_id ORDER BY sma.user_id) as user_ids
FROM ssc_member_assignments sma
WHERE sma.is_active = 1
GROUP BY sma.review_stage, sma.ssc_role
ORDER BY 
    FIELD(sma.review_stage, 'document_verification', 'financial_review', 'academic_review', 'final_approval');

-- Expected output should show at least one user for each stage:
-- document_verification | city_council | 1+ | user_ids
-- financial_review | budget_dept | 1+ | user_ids  
-- academic_review | education_affairs | 1+ | user_ids
-- final_approval | chairperson | 1+ | user_ids

-- Step 6: Check for any users who might need multiple assignments
-- (Some users might serve in multiple SSC roles)
SELECT 
    user_id,
    COUNT(*) as assignment_count,
    GROUP_CONCAT(ssc_role ORDER BY ssc_role) as roles,
    GROUP_CONCAT(review_stage ORDER BY review_stage) as stages
FROM ssc_member_assignments
WHERE is_active = 1
GROUP BY user_id
HAVING COUNT(*) > 1;

