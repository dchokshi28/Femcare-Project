-- ============================================================
-- FEMCARE Signup Fix — Supabase SQL Editor
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- ============================================================
-- Root cause: handle_new_user() SECURITY DEFINER function
-- lacks explicit SET search_path, causing Supabase to reject
-- the trigger when it tries to resolve public.users.
-- Also hardens NULL/type handling for all optional fields.
-- ============================================================

-- ============================================================
-- STEP 1: Drop existing trigger first (order matters)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================
-- STEP 2: Replace handle_new_user() with hardened version
--   - Explicit SET search_path = public (fixes SECURITY DEFINER)
--   - Uses || '' coercion for null-safe text
--   - Guards all numeric casts individually
--   - ON CONFLICT (id) DO NOTHING prevents duplicate profile errors
--   - RAISE WARNING so trigger never causes auth.users INSERT to fail
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name         TEXT;
  v_age          INTEGER;
  v_cycle_length INTEGER;
  v_last_period  DATE;
BEGIN
  -- ── Name ─────────────────────────────────────────────────
  v_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'),      ''),
    split_part(NEW.email, '@', 1)
  );

  -- ── Age (optional, must satisfy CHECK age >= 10 AND age <= 100) ──
  BEGIN
    v_age := (NEW.raw_user_meta_data->>'age')::integer;
    -- Clamp to valid range; NULL is allowed (column has no NOT NULL)
    IF v_age IS NOT NULL AND (v_age < 10 OR v_age > 100) THEN
      v_age := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_age := NULL;
  END;

  -- ── Cycle length (optional, must satisfy CHECK 21–45; DEFAULT 28) ──
  BEGIN
    v_cycle_length := (NEW.raw_user_meta_data->>'cycle_length')::integer;
    IF v_cycle_length IS NOT NULL AND (v_cycle_length < 21 OR v_cycle_length > 45) THEN
      v_cycle_length := 28;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_cycle_length := 28;
  END;

  -- ── Last period date (optional) ─────────────────────────
  BEGIN
    v_last_period := (NEW.raw_user_meta_data->>'last_period_date')::date;
  EXCEPTION WHEN OTHERS THEN
    v_last_period := NULL;
  END;

  -- ── Insert profile ───────────────────────────────────────
  INSERT INTO public.users (id, email, name, age, cycle_length, last_period_date)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_age,
    COALESCE(v_cycle_length, 28),
    v_last_period
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log but never block auth.users INSERT
  RAISE WARNING 'handle_new_user failed for %: % (SQLSTATE: %)',
    NEW.email, SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;

-- ============================================================
-- STEP 3: Re-create the trigger on auth.users
-- ============================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 4: Verify trigger is registered and enabled
-- ============================================================
SELECT
  tgname        AS trigger_name,
  tgenabled     AS enabled,
  tgtype        AS trigger_type
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ============================================================
-- STEP 5: Verify function exists with correct security
-- ============================================================
SELECT
  p.proname                            AS function_name,
  p.prosecdef                          AS security_definer,
  array_to_string(p.proconfig, ', ')   AS config   -- should contain search_path=public
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'handle_new_user';

-- ============================================================
-- STEP 6: Quick schema check — confirm users columns
-- ============================================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'users'
ORDER BY ordinal_position;

-- ============================================================
-- DONE — now test signup at http://localhost:3000/signup
-- ============================================================
