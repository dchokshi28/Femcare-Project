/**
 * Period Service
 * Handles all period-related database operations
 */

import { supabase, getCurrentUser } from '../lib/supabase';

/**
 * Get all periods for the authenticated user
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getPeriods = async () => {
  try {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching periods:', error);
    return { data: null, error };
  }
};

/**
 * Get latest period for the authenticated user
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getLatestPeriod = async () => {
  try {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching latest period:', error);
    return { data: null, error };
  }
};

/**
 * Add a new period
 * @param {Object} periodData - Period information
 * @param {string} periodData.start_date - Start date (YYYY-MM-DD)
 * @param {string} periodData.end_date - End date (YYYY-MM-DD, optional)
 * @param {string} periodData.flow - Flow intensity
 * @param {string} periodData.notes - Additional notes
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const addPeriod = async (periodData) => {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('periods')
      .insert({
        user_id: user.id,
        start_date: periodData.start_date,
        end_date: periodData.end_date || null,
        flow: periodData.flow || null,
        notes: periodData.notes || null
      })
      .select()
      .single();

    if (error) throw error;

    // Update user's last_period_date
    await supabase
      .from('users')
      .update({ last_period_date: periodData.start_date })
      .eq('id', user.id);

    return { data, error: null };
  } catch (error) {
    console.error('Error adding period:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing period
 * @param {string} periodId - Period ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updatePeriod = async (periodId, updates) => {
  try {
    const { data, error } = await supabase
      .from('periods')
      .update(updates)
      .eq('id', periodId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating period:', error);
    return { data: null, error };
  }
};

/**
 * Delete a period
 * @param {string} periodId - Period ID
 * @returns {Promise<{data: boolean, error: Object}>}
 */
export const deletePeriod = async (periodId) => {
  try {
    const { error } = await supabase
      .from('periods')
      .delete()
      .eq('id', periodId);

    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    console.error('Error deleting period:', error);
    return { data: false, error };
  }
};

/**
 * Get periods within a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getPeriodsInRange = async (startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('periods')
      .select('*')
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching periods in range:', error);
    return { data: null, error };
  }
};
