/**
 * Cycle Service
 * Handles cycle history and calculations
 */

import { supabase } from '../lib/supabase';

/**
 * Get cycle history for the authenticated user
 * @returns {Promise<{data: Array, error: Object}>}
 */
export const getCycleHistory = async () => {
  try {
    const { data, error} = await supabase
      .from('cycle_history')
      .select(`
        *,
        periods (
          id,
          start_date,
          end_date,
          flow,
          notes
        )
      `)
      .order('cycle_start_date', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching cycle history:', error);
    return { data: null, error };
  }
};

/**
 * Get cycle statistics
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCycleStats = async () => {
  try {
    const { data: cycles, error } = await supabase
      .from('cycle_history')
      .select('cycle_length, period_length')
      .not('cycle_length', 'is', null)
      .not('period_length', 'is', null);

    if (error) throw error;

    if (!cycles || cycles.length === 0) {
      return {
        data: {
          avgCycleLength: null,
          avgPeriodLength: null,
          totalCycles: 0,
          shortest: null,
          longest: null
        },
        error: null
      };
    }

    const cycleLengths = cycles.filter(c => c.cycle_length).map(c => c.cycle_length);
    const periodLengths = cycles.filter(c => c.period_length).map(c => c.period_length);

    const avgCycle = cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : null;

    const avgPeriod = periodLengths.length > 0
      ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
      : null;

    const stats = {
      avgCycleLength: avgCycle,
      avgPeriodLength: avgPeriod,
      totalCycles: cycles.length,
      shortest: cycleLengths.length > 0 ? Math.min(...cycleLengths) : null,
      longest: cycleLengths.length > 0 ? Math.max(...cycleLengths) : null
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error calculating cycle stats:', error);
    return { data: null, error };
  }
};

/**
 * Parse date safely into local midnight Date to avoid UTC timezone shifts.
 * Handles Date objects, 'YYYY-MM-DD', and ISO strings.
 * @param {string|Date} dateInput
 * @returns {Date|null}
 */
export const parseLocalDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    const d = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    return isNaN(d.getTime()) ? null : d;
  }
  const str = String(dateInput).split('T')[0].trim();
  const parts = str.split('-').map(Number);
  if (parts.length === 3 && !parts.some(isNaN)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Format date to 'YYYY-MM-DD' using local date components
 * @param {string|Date} dateInput
 * @returns {string}
 */
export const formatLocalDate = (dateInput) => {
  const d = parseLocalDate(dateInput);
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if two dates represent the exact same calendar day
 * @param {string|Date} d1
 * @param {string|Date} d2
 * @returns {boolean}
 */
export const isSameDate = (d1, d2) => {
  const date1 = parseLocalDate(d1);
  const date2 = parseLocalDate(d2);
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Calculate current cycle day (1-indexed)
 * @param {string|Date} lastPeriodDate - Last period start date
 * @returns {number|null} Current cycle day or null
 */
export const calculateCycleDay = (lastPeriodDate) => {
  const lastPeriod = parseLocalDate(lastPeriodDate);
  if (!lastPeriod) return null;

  try {
    const today = parseLocalDate(new Date());
    const diffTime = today.getTime() - lastPeriod.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : null;
  } catch (error) {
    console.error('Error calculating cycle day:', error);
    return null;
  }
};

/**
 * Calculate next period date via arithmetic addition of cycleLength
 * @param {string|Date} lastPeriodDate - Last period start date
 * @param {number} cycleLength - Average cycle length in days
 * @returns {Date|null} Next period date or null
 */
export const calculateNextPeriod = (lastPeriodDate, cycleLength = 28) => {
  const lastPeriod = parseLocalDate(lastPeriodDate);
  if (!lastPeriod) return null;

  try {
    const nextPeriod = new Date(lastPeriod);
    nextPeriod.setDate(nextPeriod.getDate() + (Number(cycleLength) || 28));
    return nextPeriod;
  } catch (error) {
    console.error('Error calculating next period:', error);
    return null;
  }
};

/**
 * Fetch ML-backed Next Period Prediction from backend XGBoost pipeline.
 * Converts predicted next cycle length into an exact calendar date.
 * If API fails or backend is unreachable, gracefully falls back to calculateNextPeriod.
 * @param {Object} params
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const predictNextPeriod = async (params = {}) => {
  const lastDate = parseLocalDate(params.last_period_date || params.lastPeriodDate);
  if (!lastDate) {
    return {
      data: null,
      error: { message: 'Last period start date is required for prediction.' }
    };
  }

  const payload = {
    last_period_date: formatLocalDate(lastDate),
    cycle_length: Number(params.cycle_length || params.cycleLength || 28),
    period_duration: Number(params.period_duration || params.periodDuration || 5),
    flow: params.flow || 'Medium',
    pain_level: params.pain_level || params.pain || null,
    moods: Array.isArray(params.moods) ? params.moods : [],
    symptoms: Array.isArray(params.symptoms) ? params.symptoms : [],
    previous_cycle_1: params.previous_cycle_1 || null,
    previous_cycle_average: params.previous_cycle_average || null,
    cycle_number: params.cycle_number || 1
  };

  try {
    const { API_BASE, apiFetch } = await import('../lib/api');
    const { data, error } = await apiFetch('/api/predict-cycle', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!error && data && data.success && data.next_period_date) {
      return {
        data: {
          nextPeriodDate: parseLocalDate(data.next_period_date),
          predictedCycleLength: data.predicted_cycle_length,
          daysUntil: data.days_until,
          isRegular: data.is_regular_cycle,
          cycleStatus: data.cycle_status,
          modelUsed: data.model_used,
          lastPeriodDate: lastDate
        },
        error: null
      };
    }
  } catch (fetchErr) {
    console.warn('Backend prediction endpoint unavailable, using mathematical calculation:', fetchErr);
  }

  // Graceful fallback: arithmetic date projection using cycle length
  const fallbackDate = calculateNextPeriod(lastDate, payload.cycle_length);
  const today = parseLocalDate(new Date());
  const daysUntil = fallbackDate ? Math.round((fallbackDate.getTime() - today.getTime()) / 86400000) : null;

  return {
    data: {
      nextPeriodDate: fallbackDate,
      predictedCycleLength: payload.cycle_length,
      daysUntil,
      isRegular: payload.cycle_length >= 21 && payload.cycle_length <= 35,
      cycleStatus: payload.cycle_length >= 21 && payload.cycle_length <= 35 ? 'Regular' : (payload.cycle_length < 21 ? 'Short Cycle' : 'Long Cycle'),
      modelUsed: 'heuristic',
      lastPeriodDate: lastDate
    },
    error: null
  };
};

/**
 * Calculate Fertile Window and Ovulation Date for calendar highlighting.
 * Clinical standard: Ovulation occurs ~14 days before next period.
 * Fertile window spans 5 days prior to ovulation through ovulation day.
 * @param {string|Date} lastPeriodDate
 * @param {number} cycleLength
 * @returns {{fertileDays: Array<Date>, ovulationDate: Date|null}}
 */
export const calculateFertileWindow = (lastPeriodDate, cycleLength = 28) => {
  const start = parseLocalDate(lastPeriodDate);
  if (!start) return { fertileDays: [], ovulationDate: null };

  const len = Math.max(20, Math.min(45, Number(cycleLength) || 28));
  // Ovulation offset (0-indexed days from lastPeriod start)
  const ovulationDayOffset = Math.max(7, len - 14);
  const ovulationDate = new Date(start);
  ovulationDate.setDate(start.getDate() + ovulationDayOffset);

  // Fertile window: 5 days before ovulation up to ovulation day
  const fertileDays = [];
  for (let i = ovulationDayOffset - 5; i <= ovulationDayOffset; i++) {
    if (i >= 0) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      fertileDays.push(day);
    }
  }

  return { fertileDays, ovulationDate };
};

/**
 * Get period days for calendar display
 * @param {string|Date} lastPeriodDate - Last period start date
 * @param {number} periodLength - Typical period length (default 5)
 * @returns {Array<Date>} Array of period dates
 */
export const getPeriodDays = (lastPeriodDate, periodLength = 5) => {
  const start = parseLocalDate(lastPeriodDate);
  if (!start) return [];

  try {
    const len = Math.max(1, Math.min(10, Number(periodLength) || 5));
    const days = [];
    for (let i = 0; i < len; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  } catch (error) {
    console.error('Error getting period days:', error);
    return [];
  }
};

/**
 * Single Source of Truth for Calendar Day Highlighting and Classification.
 * Determines whether a date is a period day, fertile window, estimated ovulation,
 * predicted next period, today, or selected date.
 * @param {Date|string} date
 * @param {Object} options
 * @returns {Object}
 */
export const getCalendarDayState = (date, {
  lastPeriodDate,
  cycleLength = 28,
  periodLength = 5,
  nextPeriodDate = null,
  pastPeriods = [],
  selectedDate = null
} = {}) => {
  const d = parseLocalDate(date);
  const today = parseLocalDate(new Date());
  if (!d) return { isToday: false, isPeriodDay: false, isFertileDay: false, isOvulationDay: false, isPredictedPeriod: false, isSelected: false };

  const isToday = isSameDate(d, today);
  const isSelected = selectedDate ? isSameDate(d, selectedDate) : false;

  // 1. Period Days (current active period)
  const currentPeriodDays = getPeriodDays(lastPeriodDate, periodLength);
  let isPeriodDay = currentPeriodDays.some(pd => isSameDate(pd, d));

  // Check any historical periods logged in database
  if (!isPeriodDay && Array.isArray(pastPeriods) && pastPeriods.length > 0) {
    isPeriodDay = pastPeriods.some(p => {
      const pStart = parseLocalDate(p.start_date);
      const pEnd = parseLocalDate(p.end_date || p.start_date);
      return pStart && pEnd && d >= pStart && d <= pEnd;
    });
  }

  // 2. Fertile Window & Ovulation
  const { fertileDays, ovulationDate } = calculateFertileWindow(lastPeriodDate, cycleLength);
  const isOvulationDay = ovulationDate ? isSameDate(d, ovulationDate) : false;
  // Exclude actual period days if overlapping
  const isFertileDay = !isPeriodDay && fertileDays.some(fd => isSameDate(fd, d));

  // 3. Predicted Next Period Day
  const predictedDate = parseLocalDate(nextPeriodDate);
  const isPredictedPeriod = predictedDate ? isSameDate(d, predictedDate) : false;

  return {
    isToday,
    isSelected,
    isPeriodDay,
    isFertileDay,
    isOvulationDay,
    isPredictedPeriod
  };
};

/**
 * Get current cycle phase
 * @param {number} cycleDay - Current day of cycle
 * @returns {Object} Phase information {name, color, message}
 */
export const getCyclePhase = (cycleDay) => {
  if (!cycleDay || cycleDay <= 0) {
    return {
      name: 'Unknown',
      color: '#667085',
      message: 'Log your cycle to track your phase'
    };
  }

  if (cycleDay <= 5) {
    return {
      name: 'Menstrual',
      color: '#F2C5CF',
      message: 'Rest and replenish.'
    };
  }

  if (cycleDay <= 13) {
    return {
      name: 'Follicular',
      color: '#D9E7F4',
      message: 'Energy and focus are on the rise.'
    };
  }

  if (cycleDay <= 16) {
    return {
      name: 'Ovulation',
      color: '#C8B7E8',
      message: 'This is your fertile window.'
    };
  }

  return {
    name: 'Luteal',
    color: '#F5D7CF',
    message: 'PMS and recovery may begin.'
  };
};

/**
 * Get the most recent cycle log entry for the authenticated user.
 * Returns flow, symptoms[], moods[], pain_level, log_date from cycle_logs.
 * This is the single source of truth for Dashboard flow/mood/pain display.
 * @returns {Promise<{data: Object|null, error: Object}>}
 */
export const getLatestCycleLog = async () => {
  try {
    const { data, error } = await supabase
      .from('cycle_logs')
      .select('log_date, flow, pain_level, symptoms, moods')
      .order('log_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return { data: data ?? null, error: null };
  } catch (error) {
    console.error('Error fetching latest cycle log:', error);
    return { data: null, error };
  }
};
