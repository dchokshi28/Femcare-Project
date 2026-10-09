-- ============================================================
-- FEMCARE Period Tracking & Symptoms Database Schema
-- Supabase PostgreSQL Migration
-- ============================================================

-- ============================================================
-- TABLE: periods
-- Purpose: Track menstrual period records for each user
-- ============================================================
CREATE TABLE IF NOT EXISTS periods (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Period Data
  start_date DATE NOT NULL,
  end_date DATE,
  flow TEXT CHECK (flow IN ('Light', 'Medium', 'Heavy', 'Spotting', 'Very Heavy')),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: No overlapping periods for same user
  CONSTRAINT no_overlapping_periods UNIQUE(user_id, start_date)
);

-- Indexes for periods table
CREATE INDEX idx_periods_user_date ON periods(user_id, start_date DESC);
CREATE INDEX idx_periods_user_id ON periods(user_id);

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at_periods
BEFORE UPDATE ON periods
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- TABLE: symptoms
-- Purpose: Daily symptom tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS symptoms (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Symptom Data
  symptom_date DATE NOT NULL,
  symptom_name TEXT NOT NULL CHECK (symptom_name IN (
    'Cramps', 'Headache', 'Bloating', 'Mood Changes', 
    'Fatigue', 'Back Pain', 'Nausea', 'Acne',
    'Breast Tenderness', 'Food Cravings', 'Anxiety', 'Depression'
  )),
  severity TEXT CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for symptoms table
CREATE INDEX idx_symptoms_user_date ON symptoms(user_id, symptom_date DESC);
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at_symptoms
BEFORE UPDATE ON symptoms
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- TABLE: cycle_history
-- Purpose: Calculated cycle metrics and history
-- This table stores computed cycle statistics
-- ============================================================
CREATE TABLE IF NOT EXISTS cycle_history (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period_id UUID REFERENCES periods(id) ON DELETE CASCADE,
  
  -- Cycle Metrics
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE,
  cycle_length INTEGER,  -- Days between this period start and next period start
  period_length INTEGER, -- Days of bleeding
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cycle_history table
CREATE INDEX idx_cycle_history_user_date ON cycle_history(user_id, cycle_start_date DESC);
CREATE INDEX idx_cycle_history_user_id ON cycle_history(user_id);
CREATE INDEX idx_cycle_history_period_id ON cycle_history(period_id);

-- Unique constraint for period_id (must be before trigger function that uses it)
ALTER TABLE cycle_history ADD CONSTRAINT unique_period_id UNIQUE (period_id);

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at_cycle_history
BEFORE UPDATE ON cycle_history
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all new tables
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: periods table
-- ============================================================

-- Policy: Users can view their own periods
CREATE POLICY "Users can view own periods"
ON periods FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own periods
CREATE POLICY "Users can insert own periods"
ON periods FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own periods
CREATE POLICY "Users can update own periods"
ON periods FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own periods
CREATE POLICY "Users can delete own periods"
ON periods FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES: symptoms table
-- ============================================================

-- Policy: Users can view their own symptoms
CREATE POLICY "Users can view own symptoms"
ON symptoms FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own symptoms
CREATE POLICY "Users can insert own symptoms"
ON symptoms FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own symptoms
CREATE POLICY "Users can update own symptoms"
ON symptoms FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own symptoms
CREATE POLICY "Users can delete own symptoms"
ON symptoms FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES: cycle_history table
-- ============================================================

-- Policy: Users can view their own cycle history
CREATE POLICY "Users can view own cycle history"
ON cycle_history FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own cycle history
CREATE POLICY "Users can insert own cycle history"
ON cycle_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own cycle history
CREATE POLICY "Users can update own cycle history"
ON cycle_history FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own cycle history
CREATE POLICY "Users can delete own cycle history"
ON cycle_history FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTION: Calculate cycle metrics automatically
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_cycle_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate period length if end_date is set
  IF NEW.end_date IS NOT NULL THEN
    -- Update or insert cycle history for this period
    INSERT INTO cycle_history (
      user_id,
      period_id,
      cycle_start_date,
      period_length
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.start_date,
      (NEW.end_date - NEW.start_date) + 1
    )
    ON CONFLICT ON CONSTRAINT unique_period_id
    DO UPDATE SET
      period_length = (NEW.end_date - NEW.start_date) + 1,
      updated_at = NOW();
    
    -- Calculate cycle length between consecutive periods
    UPDATE cycle_history ch
    SET 
      cycle_length = (
        SELECT (NEW.start_date - p.start_date)
        FROM periods p
        WHERE p.user_id = NEW.user_id
          AND p.start_date < NEW.start_date
        ORDER BY p.start_date DESC
        LIMIT 1
      ),
      cycle_end_date = NEW.start_date,
      updated_at = NOW()
    WHERE ch.user_id = NEW.user_id
      AND ch.cycle_start_date = (
        SELECT p.start_date
        FROM periods p
        WHERE p.user_id = NEW.user_id
          AND p.start_date < NEW.start_date
        ORDER BY p.start_date DESC
        LIMIT 1
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calculate cycle metrics when period is added/updated
CREATE TRIGGER trigger_calculate_cycle_metrics
AFTER INSERT OR UPDATE ON periods
FOR EACH ROW
EXECUTE FUNCTION calculate_cycle_metrics();

-- ============================================================
-- END OF MIGRATION
-- ============================================================
