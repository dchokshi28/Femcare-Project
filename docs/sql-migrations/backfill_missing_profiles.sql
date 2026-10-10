-- ============================================================
-- BACKFILL MISSING PROFILES
-- Creates profiles for existing auth users who don't have one
-- ============================================================

-- Function to backfill missing profiles from existing auth.users
DO $$
DECLARE
  auth_user RECORD;
  profile_exists BOOLEAN;
  user_name TEXT;
BEGIN
  -- Loop through all auth.users
  FOR auth_user IN 
    SELECT id, email, raw_user_meta_data 
    FROM auth.users
  LOOP
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE id = auth_user.id) INTO profile_exists;
    
    -- If profile doesn't exist, create it
    IF NOT profile_exists THEN
      -- Extract name from metadata or use email
      user_name := COALESCE(
        auth_user.raw_user_meta_data->>'full_name',
        auth_user.raw_user_meta_data->>'name',
        split_part(auth_user.email, '@', 1)
      );
      
      -- Insert profile with ON CONFLICT to be safe
      INSERT INTO public.users (id, email, name, age, cycle_length, last_period_date)
      VALUES (
        auth_user.id,
        auth_user.email,
        user_name,
        COALESCE((auth_user.raw_user_meta_data->>'age')::int, 25),
        COALESCE((auth_user.raw_user_meta_data->>'cycle_length')::int, 28),
        auth_user.raw_user_meta_data->>'last_period_date'
      )
      ON CONFLICT (id) DO NOTHING;
      
      RAISE NOTICE 'Created profile for user: % (%)', auth_user.email, auth_user.id;
    END IF;
  END LOOP;
END $$;

-- ============================================================
-- VERIFY RESULTS
-- ============================================================

-- Show counts
SELECT 
  (SELECT COUNT(*) FROM auth.users) AS auth_users_count,
  (SELECT COUNT(*) FROM public.users) AS profile_count;

-- Show any remaining mismatches (should be 0)
SELECT 
  au.email,
  au.id,
  'Missing in public.users' AS issue
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================================
-- VERIFY TRIGGER EXISTS
-- ============================================================

-- Check if trigger exists and is enabled
SELECT 
  tgname AS trigger_name,
  CASE tgenabled
    WHEN 'O' THEN 'Enabled'
    WHEN 'D' THEN 'Disabled'
    ELSE 'Unknown'
  END AS status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- ============================================================
-- INSTRUCTIONS
-- ============================================================
-- This script:
-- 1. Backfills missing profiles for existing auth users
-- 2. Uses ON CONFLICT DO NOTHING for safety
-- 3. Extracts data from auth.users.raw_user_meta_data
-- 4. Verifies the trigger exists
--
-- Safe to run multiple times - won't create duplicates
