-- ============================================================
-- FEMCARE Authentication Fix - Supabase Setup Script
-- SAFE TO RUN: Only adds auth.users trigger, no policy changes
-- ============================================================

-- NOTE: All RLS policies already exist from migrations 001, 002, 003
-- This script ONLY adds the missing auth.users trigger for auto-profile creation

-- ============================================================
-- CREATE TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
-- This is the ONLY missing piece from the existing migrations
-- ============================================================

-- Function to create user profile automatically when auth.users record is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_age INTEGER;
  user_cycle_length INTEGER;
BEGIN
  -- Extract name with better fallbacks
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Extract age with safe conversion
  BEGIN
    user_age := (NEW.raw_user_meta_data->>'age')::int;
  EXCEPTION WHEN OTHERS THEN
    user_age := 25;
  END;
  
  -- Extract cycle_length with safe conversion
  BEGIN
    user_cycle_length := (NEW.raw_user_meta_data->>'cycle_length')::int;
  EXCEPTION WHEN OTHERS THEN
    user_cycle_length := 28;
  END;
  
  -- Insert profile with error handling
  INSERT INTO public.users (id, email, name, age, cycle_length, last_period_date)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_age,
    user_cycle_length,
    NEW.raw_user_meta_data->>'last_period_date'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail the auth.users insertion
  RAISE WARNING 'Failed to create profile for user %: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- VERIFY TRIGGER CREATED
-- ============================================================

-- Check if trigger exists and is enabled
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- ============================================================
-- END OF SCRIPT
-- ============================================================
-- All RLS policies already exist from migrations 001, 002, 003
-- This script only added the auth.users trigger
-- 
-- Test signup now from the FEMCARE UI at http://localhost:3000/signup
