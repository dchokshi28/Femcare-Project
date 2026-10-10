-- Create a test user for FEMCARE Supabase integration
-- Run this in Supabase SQL Editor

-- First, check if user already exists
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'femcare.test@example.com';

-- If the above returns nothing, you need to create the user via Supabase Dashboard:
-- 1. Go to Authentication → Users → Add User
-- 2. Email: femcare.test@example.com
-- 3. Password: FemcareTest123!
-- 4. ✅ CHECK "Auto Confirm User"
-- 5. Click Create User
-- 6. Copy the UUID that is generated

-- Then run this to create the profile (replace UUID):
INSERT INTO users (id, name, email, age, cycle_length)
VALUES (
  '00000000-0000-0000-0000-000000000000',  -- REPLACE with actual UUID from auth.users
  'Femcare Test User',
  'femcare.test@example.com',
  25,
  28
);

-- Verify both were created:
SELECT 
  u.id,
  u.email as user_email,
  u.name,
  u.age,
  au.email_confirmed_at
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.email = 'femcare.test@example.com';
