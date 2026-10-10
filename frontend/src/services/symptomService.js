/**
 * Symptom Service
 * Handles all symptom-related database operations
 */

import { supabase, getCurrentUser } from '../lib/supabase';

/**
 * Get all symptoms for the authenticated user
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getSymptoms = async () => {
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .order('symptom_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    return { data: null, error };
  }
};

/**
 * Get symptoms for a specific date
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getSymptomsForDate = async (date) => {
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .eq('symptom_date', date);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching symptoms for date:', error);
    return { data: null, error };
  }
};

/**
 * Get symptoms within a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getSymptomsInRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .gte('symptom_date', startDate)
      .lte('symptom_date', endDate)
      .order('symptom_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching symptoms in range:', error);
    return { data: null, error };
  }
};

/**
 * Add a new symptom
 * @param {Object} symptomData - Symptom information
 * @param {string} symptomData.symptom_date - Symptom date (YYYY-MM-DD)
 * @param {string} symptomData.symptom_name - Symptom name
 * @param {string} symptomData.severity - Severity (Mild/Moderate/Severe)
 * @param {string} symptomData.notes - Additional notes
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const addSymptom = async (symptomData) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('symptoms')
      .insert({
        user_id: user.id,
        symptom_date: symptomData.symptom_date,
        symptom_name: symptomData.symptom_name,
        severity: symptomData.severity || 'Moderate',
        notes: symptomData.notes || null
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error adding symptom:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing symptom
 * @param {string} symptomId - Symptom ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateSymptom = async (symptomId, updates) => {
  try {
    const { data, error } = await supabase
      .from('symptoms')
      .update(updates)
      .eq('id', symptomId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating symptom:', error);
    return { data: null, error };
  }
};

/**
 * Delete a symptom
 * @param {string} symptomId - Symptom ID
 * @returns {Promise<{data: boolean, error: Object}>}
 */
export const deleteSymptom = async (symptomId) => {
  try {
    const { error } = await supabase
      .from('symptoms')
      .delete()
      .eq('id', symptomId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    console.error('Error deleting symptom:', error);
    return { data: false, error };
  }
};

/**
 * Get recent symptoms (last 30 days)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getRecentSymptoms = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('symptoms')
      .select('*')
      .gte('symptom_date', startDate)
      .order('symptom_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching recent symptoms:', error);
    return { data: null, error };
  }
};

/**
 * Delete all symptom rows for a specific date (used before re-syncing from cycle_logs)
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<{data: boolean, error: Object}>}
 */
export const deleteSymptomsForDate = async (date) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('symptoms')
      .delete()
      .eq('user_id', user.id)
      .eq('symptom_date', date);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    console.error('Error deleting symptoms for date:', error);
    return { data: false, error };
  }
};

/**
 * Maps LogCycle display names to the symptom_name CHECK constraint values
 * in the symptoms table (002_period_tracking_schema.sql).
 * LogCycle uses 'Backache'; the DB CHECK allows 'Back Pain'.
 */
const SYMPTOM_NAME_MAP = {
  'Backache':     'Back Pain',   // LogCycle → DB
  'Mood Changes': 'Mood Changes',
  // All others match exactly:
  'Cramps':       'Cramps',
  'Headache':     'Headache',
  'Bloating':     'Bloating',
  'Fatigue':      'Fatigue',
  'Acne':         'Acne',
  'Nausea':       'Nausea',
  'Back Pain':    'Back Pain',
  'Breast Tenderness': 'Breast Tenderness',
  'Food Cravings': 'Food Cravings',
  'Anxiety':      'Anxiety',
  'Depression':   'Depression',
};

/**
 * Sync a symptom name array for a specific date to the symptoms table.
 * Replaces any existing rows for that date with the new set.
 * Maps LogCycle display names to DB CHECK-constraint-allowed values.
 * @param {string} date       - Date string YYYY-MM-DD
 * @param {string[]} names    - Array of symptom name strings e.g. ['Cramps', 'Fatigue']
 * @returns {Promise<void>}
 */
export const syncSymptomsForDate = async (date, names) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Remove existing rows for this date
    await supabase
      .from('symptoms')
      .delete()
      .eq('user_id', user.id)
      .eq('symptom_date', date);

    // 2. Insert one row per symptom (skip if empty list)
    if (!names || names.length === 0) return;

    // Map names to DB-allowed values; skip any that have no valid mapping
    const rows = names
      .map((name) => SYMPTOM_NAME_MAP[name] || null)
      .filter(Boolean)
      .map((dbName) => ({
        user_id:      user.id,
        symptom_date: date,
        symptom_name: dbName,
        severity:     'Moderate',
        notes:        null,
      }));

    if (rows.length === 0) return;

    const { error } = await supabase.from('symptoms').insert(rows);
    if (error) throw error;
  } catch (error) {
    console.error('Error syncing symptoms for date:', error);
  }
};
