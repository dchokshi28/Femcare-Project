-- ============================================================
-- FEMCARE Booking Enhancement Migration
-- Adds provider management and prevents double bookings
-- ============================================================

-- ============================================================
-- 1. ADD PROVIDER_ID TO BOOKINGS
-- ============================================================

-- Add provider_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'provider_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN provider_id TEXT NOT NULL DEFAULT 'unknown';
  END IF;
END $$;

-- Create index on provider_id
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);

-- ============================================================
-- 2. PREVENT DOUBLE BOOKINGS
-- Unique constraint: same provider + date + slot + active status
-- ============================================================

-- Drop existing constraint if it exists
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS unique_active_booking_slot;

-- Create unique constraint for active bookings only
-- This prevents two users from booking the same provider/date/time
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_booking_slot
ON bookings (provider_id, appointment_date, appointment_slot)
WHERE status = 'confirmed';

-- ============================================================
-- 3. ADD APPOINTMENT_TIME COLUMN (SEPARATE FROM SLOT TEXT)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'appointment_time'
  ) THEN
    ALTER TABLE bookings ADD COLUMN appointment_time TIME;
  END IF;
END $$;

-- ============================================================
-- 4. BACKFILL PROVIDER_ID FOR EXISTING BOOKINGS
-- Map hospital_name to stable provider_id
-- ============================================================

UPDATE bookings
SET provider_id = CASE 
  WHEN hospital_name LIKE '%BuildingRace%' THEN 'vadodara-1'
  WHEN hospital_name LIKE '%Jetalpur%' THEN 'vadodara-2'
  WHEN hospital_name LIKE '%Sun-Pharma%' THEN 'vadodara-3'
  WHEN hospital_name LIKE '%Akshar%' THEN 'vadodara-4'
  WHEN hospital_name LIKE '%Dr. Reshmi Banerjee%' THEN 'vadodara-5'
  WHEN hospital_name LIKE '%Waghodia%' THEN 'vadodara-6'
  WHEN hospital_name LIKE '%Shree Krishna%' THEN 'vadodara-7'
  WHEN hospital_name LIKE '%Apex Women%' THEN 'vadodara-8'
  WHEN hospital_name LIKE '%Nandaben%' THEN 'vadodara-9'
  WHEN hospital_name LIKE '%Dr. Meera Shah%' THEN 'vadodara-10'
  ELSE hospital_name
END
WHERE provider_id = 'unknown';

-- ============================================================
-- 5. CREATE VIEW FOR BOOKING AVAILABILITY
-- Query available slots dynamically
-- ============================================================

CREATE OR REPLACE VIEW booking_availability AS
SELECT 
  provider_id,
  appointment_date,
  appointment_slot,
  COUNT(*) as booked_count,
  MAX(status) as booking_status
FROM bookings
WHERE status = 'confirmed'
GROUP BY provider_id, appointment_date, appointment_slot;

-- ============================================================
-- 6. FUNCTION: GET AVAILABLE SLOTS FOR PROVIDER/DATE
-- ============================================================

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
    -- Generate all possible slots (morning + afternoon)
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

-- ============================================================
-- 7. FUNCTION: GET BOOKING STATISTICS
-- ============================================================

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
-- 8. VERIFY SETUP
-- ============================================================

-- Check unique constraint exists
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'bookings' 
  AND indexname = 'unique_active_booking_slot';

-- Check functions exist
SELECT 
  proname,
  prosrc
FROM pg_proc
WHERE proname IN ('get_available_slots', 'get_booking_stats');

-- Show current bookings summary
SELECT 
  provider_id,
  appointment_date,
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
FROM bookings
GROUP BY provider_id, appointment_date
ORDER BY appointment_date DESC;

-- ============================================================
-- INSTRUCTIONS
-- ============================================================
-- This migration:
-- 1. Adds provider_id to bookings
-- 2. Creates unique constraint to prevent double bookings
-- 3. Backfills provider_id for existing bookings
-- 4. Creates view and functions for availability queries
-- 5. Safe to run multiple times (uses IF NOT EXISTS)
--
-- After running, the frontend can query real availability
