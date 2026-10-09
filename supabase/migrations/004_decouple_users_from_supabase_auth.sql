-- Allow MongoDB-authenticated accounts to own their existing Supabase
-- application profile rows. Preserve public.users data and booking references.
-- This migration does not create an auth user, mapping column, or Mongo table.

BEGIN;

DO $$
DECLARE
  constraint_row RECORD;
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RAISE EXCEPTION 'public.users must exist before applying this migration';
  END IF;

  -- Drop only a direct users.id -> auth.users.id foreign key, if present.
  FOR constraint_row IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND confrelid = 'auth.users'::regclass
      AND contype = 'f'
      AND pg_get_constraintdef(oid) LIKE 'FOREIGN KEY (id) REFERENCES auth.users(id)%'
  LOOP
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', constraint_row.conname);
  END LOOP;
END
$$;

-- Guard against accidentally applying this migration to an inconsistent
-- schema: booking ownership must continue to reference public.users(id).
DO $$
DECLARE
  booking_user_attnum SMALLINT;
  profile_id_attnum SMALLINT;
BEGIN
  IF to_regclass('public.bookings') IS NULL THEN
    RAISE EXCEPTION 'public.bookings must exist before applying this migration';
  END IF;

  SELECT attnum INTO booking_user_attnum
  FROM pg_attribute
  WHERE attrelid = 'public.bookings'::regclass AND attname = 'user_id' AND NOT attisdropped;
  SELECT attnum INTO profile_id_attnum
  FROM pg_attribute
  WHERE attrelid = 'public.users'::regclass AND attname = 'id' AND NOT attisdropped;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.bookings'::regclass
      AND confrelid = 'public.users'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[booking_user_attnum]::SMALLINT[]
      AND confkey = ARRAY[profile_id_attnum]::SMALLINT[]
  ) THEN
    RAISE EXCEPTION 'Expected bookings.user_id -> public.users.id foreign key is missing; migration stopped';
  END IF;
END
$$;

COMMIT;
