-- ============================================================
-- Disable Email Confirmation via SQL
-- Run this in Supabase SQL Editor
-- ============================================================

-- Update auth config to disable email confirmation
UPDATE auth.config
SET email_confirm_required = false
WHERE id = 'email';

-- Alternative: Update auth schema directly
-- This forces all new signups to be auto-confirmed
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify the setting
SELECT * FROM auth.config WHERE id = 'email';
