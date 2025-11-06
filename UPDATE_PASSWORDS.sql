-- ============================================================================
-- UPDATE USER PASSWORDS - Run this in Supabase SQL Editor
-- ============================================================================
-- This updates existing users with the correct password hashes
-- 
-- ADMIN: immerseindia@admin.com / ZNM8B4naq&
-- USERS: *@immerseindia.com / immerse@2025
-- ============================================================================

-- Update Admin password (ZNM8B4naq&)
UPDATE users 
SET password = '$2b$10$UsHJBYZHxwa98OqK163duuKNLJc/I9lHaN8f/yYZhPMypcsJk7vpK',
    name = 'Admin',
    role = 'admin'
WHERE email = 'immerseindia@admin.com';

-- Update all regular users with the standard password (immerse@2025)
UPDATE users 
SET password = '$2b$10$/Bi4fk.fHmbgBdAVyTUmw.g01R09/YggHjCGF6EKZ7e3xv9ED7Cqi',
    role = 'user'
WHERE email LIKE '%@immerseindia.com' 
  AND email != 'immerseindia@admin.com';

-- Verify the update
SELECT id, name, email, role, created_at, updated_at 
FROM users 
ORDER BY role DESC, email;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this, you should be able to login with:
--
-- ADMIN:
--   Email: immerseindia@admin.com
--   Password: ZNM8B4naq&
--
-- ANY USER (existing or new):
--   Email: ravi@immerseindia.com (or shivansh@, user@, yourname@, etc.)
--   Password: immerse@2025
--
-- Note: New users with @immerseindia.com emails will be auto-created on login!
-- ============================================================================
