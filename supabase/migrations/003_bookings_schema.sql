-- ============================================================
-- FEMCARE Bookings Database Schema
-- Supabase PostgreSQL Migration
-- ============================================================

-- ============================================================
-- TABLE: bookings
-- Purpose: Track appointment bookings with clinics/hospitals
-- ============================================================
CREATE TABLE IF NOT EXISTS bookings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Booking Details
  hospital_name TEXT NOT NULL,
  doctor_specialty TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_slot TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('confirmed', 'cancelled', 'completed', 'rescheduled')) DEFAULT 'confirmed',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for bookings table
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, appointment_date DESC);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at_bookings
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own bookings
CREATE POLICY "Users can insert own bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bookings
CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own bookings
CREATE POLICY "Users can delete own bookings"
ON bookings FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- END OF MIGRATION
-- ============================================================
