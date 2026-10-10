-- ============================================================
-- VERIFY AND CREATE UNIQUE INDEX FOR DOUBLE-BOOKING PREVENTION
-- ============================================================

-- Drop existing index if it exists (to ensure clean state)
DROP INDEX IF EXISTS unique_active_booking_slot;

-- Create unique constraint for active bookings only
-- This prevents two confirmed bookings for the same provider/date/time
-- Cancelled bookings do NOT block the slot
CREATE UNIQUE INDEX unique_active_booking_slot
ON bookings (provider_id, appointment_date, appointment_slot)
WHERE status = 'confirmed';

-- Verify the index was created
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'bookings' 
  AND indexname = 'unique_active_booking_slot';

-- Show current bookings to verify setup
SELECT 
    id,
    provider_id,
    hospital_name,
    appointment_date,
    appointment_slot,
    status,
    created_at
FROM bookings
ORDER BY appointment_date, appointment_slot, created_at;
