-- ============================================================
-- FEMCARE Booking Enhancement Migration (Fixed)
-- Handles existing bookings safely
-- Idempotent - safe to run multiple times
-- ============================================================

-- ============================================================
-- STEP 1: ADD PROVIDER_ID COLUMN (nullable initially)
-- ============================================================

-- Add provider_id as nullable first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
      AND table_name = 'bookings' 
      AND column_name = 'provider_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN provider_id TEXT;
    RAISE NOTICE 'Added provider_id column';
  ELSE
    RAISE NOTICE 'provider_id column already exists';
  END IF;
END $$;

-- Create index on provider_id
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);

-- ============================================================
-- STEP 2: BACKFILL PROVIDER_ID FOR EXISTING BOOKINGS
-- Map hospital_name to real provider IDs from FindCare
-- ============================================================

-- Map existing bookings to their correct provider IDs
UPDATE bookings
SET provider_id = CASE 
  WHEN hospital_name LIKE '%BuildingRace%' THEN 'vadodara-1'
  WHEN hospital_name LIKE '%Jetalpur%' THEN 'vadodara-2'
  WHEN hospital_name LIKE '%Sun-Pharma%' THEN 'vadodara-3'
  WHEN hospital_name LIKE '%Akshar%' THEN 'vadodara-4'
  WHEN hospital_name LIKE '%Reshmi Banerjee%' THEN 'vadodara-5'
  WHEN hospital_name LIKE '%Waghodia%' THEN 'vadodara-6'
  WHEN hospital_name LIKE '%Shree Krishna%' THEN 'vadodara-7'
  WHEN hospital_name LIKE '%Apex Women%' THEN 'vadodara-8'
  WHEN hospital_name LIKE '%Nandaben%' THEN 'vadodara-9'
  WHEN hospital_name LIKE '%Meera Shah%' THEN 'vadodara-10'
  ELSE hospital_name -- Fallback to hospital_name if no match
END
WHERE provider_id IS NULL;

-- ============================================================
-- STEP 3: HANDLE TRUE DUPLICATES
-- If the same user booked the same provider/date/slot twice,
-- keep the first one and cancel the duplicates
-- ============================================================

-- Find and mark duplicate bookings as cancelled (keep earliest)
WITH ranked_bookings AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY provider_id, appointment_date, appointment_slot, user_id
      ORDER BY created_at ASC
    ) as rn
  FROM bookings
  WHERE status = 'confirmed'
)
UPDATE bookings
SET status = 'cancelled',
    notes = COALESCE(notes || ' | ', '') || 'Auto-cancelled duplicate booking'
FROM ranked_bookings
WHERE bookings.id = ranked_bookings.id
  AND ranked_bookings.rn > 1
  AND bookings.status = 'confirmed';

-- Show what was updated
DO $$
DECLARE
  cancelled_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cancelled_count
  FROM bookings
  WHERE notes LIKE '%Auto-cancelled duplicate%';
  
  IF cancelled_count > 0 THEN
    RAISE NOTICE 'Cancelled % duplicate booking(s)', cancelled_count;
  ELSE
    RAISE NOTICE 'No duplicate bookings found';
  END IF;
END $$;

-- ============================================================
-- STEP 4: CREATE UNIQUE CONSTRAINT
-- Now safe to create because duplicates are cancelled
-- ============================================================

-- Drop existing constraint if it exists
DROP INDEX IF EXISTS unique_active_booking_slot;

-- Create unique constraint for active bookings only
-- This prevents two users from booking the same provider/date/time
CREATE UNIQUE INDEX unique_active_booking_slot
ON bookings (provider_id, appointment_date, appointment_slot)
WHERE status = 'confirmed';

-- ============================================================
-- STEP 5: CREATE AVAILABILITY FUNCTIONS
-- ============================================================

-- Function to get available slots for a provider on a date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_provider_id TEXT,
  p_date DATE
)
RETURNS TABLE(
  slot_time TEXT,
  is_available BOOLEAN,
  booked_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH all_slots AS (
    -- All possible appointment slots
    SELECT UNNEST(ARRAY[
      '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
      '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
      '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
    ]) AS slot
  ),
  booked_slots AS (
    SELECT 
      appointment_slot,
      COUNT(*) as count
    FROM bookings
    WHERE provider_id = p_provider_id
      AND appointment_date = p_date
      AND status = 'confirmed'
    GROUP BY appointment_slot
  )
  SELECT 
    s.slot,
    COALESCE(b.count, 0) = 0 AS is_available,
    COALESCE(b.count, 0)::INTEGER
  FROM all_slots s
  LEFT JOIN booked_slots b ON s.slot = b.appointment_slot
  ORDER BY s.slot;
END;
$$ LANGUAGE plpgsql;

-- Function to get booking statistics
CREATE OR REPLACE FUNCTION get_booking_stats(
  p_provider_id TEXT,
  p_date DATE
)
RETURNS TABLE(
  total_slots INTEGER,
  booked_slots INTEGER,
  available_slots INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    16::INTEGER AS total,
    COALESCE(COUNT(*)::INTEGER, 0) AS booked,
    (16 - COALESCE(COUNT(*), 0))::INTEGER AS available
  FROM bookings
  WHERE provider_id = p_provider_id
    AND appointment_date = p_date
    AND status = 'confirmed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 6: VERIFY MIGRATION
-- ============================================================

-- Show summary
DO $$
DECLARE
  total_bookings INTEGER;
  confirmed_bookings INTEGER;
  cancelled_bookings INTEGER;
  bookings_with_provider INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_bookings FROM bookings;
  SELECT COUNT(*) INTO confirmed_bookings FROM bookings WHERE status = 'confirmed';
  SELECT COUNT(*) INTO cancelled_bookings FROM bookings WHERE status = 'cancelled';
  SELECT COUNT(*) INTO bookings_with_provider FROM bookings WHERE provider_id IS NOT NULL;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== MIGRATION SUMMARY ===';
  RAISE NOTICE 'Total bookings: %', total_bookings;
  RAISE NOTICE 'Confirmed bookings: %', confirmed_bookings;
  RAISE NOTICE 'Cancelled bookings: %', cancelled_bookings;
  RAISE NOTICE 'Bookings with provider_id: %', bookings_with_provider;
  RAISE NOTICE '';
END $$;

-- Show current bookings
SELECT 
  id,
  user_id,
  provider_id,
  hospital_name,
  appointment_date,
  appointment_slot,
  status,
  created_at
FROM bookings
ORDER BY created_at DESC;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- This migration:
-- 1. ✓ Added provider_id column (nullable for legacy data)
-- 2. ✓ Mapped existing bookings to real provider IDs
-- 3. ✓ Cancelled genuine duplicates (same user, same slot)
-- 4. ✓ Created unique constraint to prevent double bookings
-- 5. ✓ Created availability query functions
-- 6. ✓ Preserved all booking history
--
-- Safe to run multiple times (idempotent)
-- No data deleted
-- Duplicates marked as cancelled, not deleted
