-- ============================================================
-- FEMCARE Database Schema
-- Supabase PostgreSQL Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- HELPER FUNCTION: Auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE 1: users
-- Purpose: Store user profile and cycle configuration
-- Links to: auth.users (Supabase Auth)
-- ============================================================
CREATE TABLE users (
  -- Primary Key (links to Supabase Auth)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Profile Information
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 10 AND age <= 100),
  
  -- Cycle Configuration
  cycle_length INTEGER DEFAULT 28 CHECK (cycle_length >= 21 AND cycle_length <= 45),
  last_period_date DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- TABLE 2: cycle_logs
-- Purpose: Daily cycle tracking data
-- Replaces: localStorage 'herhealth_daily_logs'
-- ============================================================
CREATE TABLE cycle_logs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Date
  log_date DATE NOT NULL,
  
  -- Cycle Data (matching frontend structure exactly)
  flow TEXT CHECK (flow IN ('Light', 'Medium', 'Heavy', 'Spotting', '')),
  pain_level TEXT CHECK (pain_level IN ('None', 'Mild', 'Moderate', 'Severe', '')),
  symptoms TEXT[] DEFAULT '{}',
  moods TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: One log per user per date
  UNIQUE(user_id, log_date)
);

-- Indexes for cycle_logs table
CREATE INDEX idx_cycle_logs_user_date ON cycle_logs(user_id, log_date DESC);
CREATE INDEX idx_cycle_logs_user_id ON cycle_logs(user_id);

-- Trigger: Auto-update updated_at
CREATE TRIGGER set_updated_at_cycle_logs
BEFORE UPDATE ON cycle_logs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- TABLE 3: health_assessments
-- Purpose: Store raw PCOS assessment inputs
-- Column names MUST match ML model features exactly
-- ============================================================
CREATE TABLE health_assessments (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- ML Features (EXACT names from pcos_features.pkl)
  age INTEGER,
  height_cm NUMERIC(6,2),
  weight_kg NUMERIC(6,2),
  cycle_length_days INTEGER,
  bleeding_days INTEGER,
  
  -- Binary features (0 or 1)
  insulin_resistance INTEGER CHECK (insulin_resistance IN (0, 1)),
  periods_regular INTEGER CHECK (periods_regular IN (0, 1)),
  dark_patches_neck INTEGER CHECK (dark_patches_neck IN (0, 1)),
  fast_food_frequent INTEGER CHECK (fast_food_frequent IN (0, 1)),
  exercise_regularly INTEGER CHECK (exercise_regularly IN (0, 1)),
  family_history_pcos INTEGER CHECK (family_history_pcos IN (0, 1)),
  skip_periods_months INTEGER CHECK (skip_periods_months IN (0, 1)),
  excess_facial_hair INTEGER CHECK (excess_facial_hair IN (0, 1)),
  severe_acne INTEGER CHECK (severe_acne IN (0, 1)),
  thyroid_status INTEGER CHECK (thyroid_status IN (0, 1)),
  
  -- Hormonal features (optional, can be NULL)
  LH NUMERIC(10,2),
  FSH NUMERIC(10,2),
  LH_FSH_ratio NUMERIC(10,2),
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for health_assessments table
CREATE INDEX idx_assessments_user_created ON health_assessments(user_id, created_at DESC);
CREATE INDEX idx_assessments_user_id ON health_assessments(user_id);

-- ============================================================
-- TABLE 4: assessment_results
-- Purpose: Store ML prediction outputs
-- Links to: health_assessments (1:1)
-- ============================================================
CREATE TABLE assessment_results (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  assessment_id UUID NOT NULL REFERENCES health_assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- ML Prediction Output (matching main.py response format)
  pcos_detected BOOLEAN NOT NULL,
  confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
  risk_level TEXT CHECK (risk_level IN ('Low Risk', 'Moderate Risk', 'High Risk')),
  prediction_label TEXT,
  message TEXT,
  recommendation TEXT,
  
  -- Additional ML output
  cycle_irregular BOOLEAN,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for assessment_results table
CREATE INDEX idx_results_assessment ON assessment_results(assessment_id);
CREATE INDEX idx_results_user_created ON assessment_results(user_id, created_at DESC);
CREATE INDEX idx_results_user_id ON assessment_results(user_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES: users table
-- ============================================================

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can insert their own profile (signup)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================
-- RLS POLICIES: cycle_logs table
-- ============================================================

-- Policy: Users can view their own cycle logs
CREATE POLICY "Users can view own cycle logs"
ON cycle_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own cycle logs
CREATE POLICY "Users can insert own cycle logs"
ON cycle_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own cycle logs
CREATE POLICY "Users can update own cycle logs"
ON cycle_logs FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own cycle logs
CREATE POLICY "Users can delete own cycle logs"
ON cycle_logs FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- RLS POLICIES: health_assessments table
-- ============================================================

-- Policy: Users can view their own assessments
CREATE POLICY "Users can view own assessments"
ON health_assessments FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own assessments
CREATE POLICY "Users can insert own assessments"
ON health_assessments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- NO UPDATE/DELETE - Assessment history is immutable

-- ============================================================
-- RLS POLICIES: assessment_results table
-- ============================================================

-- Policy: Users can view their own results
CREATE POLICY "Users can view own results"
ON assessment_results FOR SELECT
USING (auth.uid() = user_id);

-- Backend service can insert results (uses service_role key, bypasses RLS)
-- NO UPDATE/DELETE - Results are immutable

-- ============================================================
-- END OF MIGRATION
-- ============================================================
