import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Flame, ChevronDown, Calendar as CalendarIcon, X, Smile, Frown, Heart, Zap, Droplet, Activity, Sparkles, Lightbulb, CheckCircle2, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { syncSymptomsForDate } from '../services/symptomService';
import { getPeriods } from '../services/periodService';
import {
  parseLocalDate,
  formatLocalDate,
  calculateNextPeriod,
  predictNextPeriod,
  getCalendarDayState,
  isSameDate
} from '../services/cycleService';

// Master List of Daily Suggestions - Moved outside to avoid re-creation on every render
const suggestionBank = [
  { title: "Light Movement", text: "A 15-minute gentle stretch or yoga flow can ease tension.", icon: Activity, color: "text-[#E6395A]", bg: "bg-[#E6395A]/20" },
  { title: "Stay Hydrated", text: "Drink plenty of water to help reduce fatigue and bloating.", icon: Droplet, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Warm Comfort", text: "A heating pad may help relax abdominal muscles.", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/20" },
  { title: "Deep Breathing", text: "Slow breathing can calm your mind and reduce stress.", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/20" },
  { title: "Healthy Breakfast", text: "Start your day with protein and whole grains.", icon: Coffee, color: "text-amber-600", bg: "bg-amber-600/20" },
  { title: "Iron Boost", text: "Eat iron-rich foods like spinach or lentils.", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/20" },
  { title: "Short Walk", text: "A quick walk can improve mood and circulation.", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/20" },
  { title: "Stretch Break", text: "Take a 5-minute stretch break during long work hours.", icon: Activity, color: "text-[#E6395A]", bg: "bg-[#E6395A]/20" },
  { title: "Good Sleep", text: "Aim for 7–8 hours of restful sleep.", icon: Smile, color: "text-[#8A5AD1]", bg: "bg-[#8A5AD1]/20" },
  { title: "Relaxation Time", text: "Listen to calming music or meditate for a few minutes.", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/20" },
  { title: "Balanced Meals", text: "Eat regular meals to maintain stable energy.", icon: CheckCircle2, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Fresh Fruits", text: "Include fruits for vitamins and natural hydration.", icon: Droplet, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Light Yoga", text: "Gentle yoga can support flexibility and relaxation.", icon: Activity, color: "text-[#E6395A]", bg: "bg-[#E6395A]/20" },
  { title: "Positive Mindset", text: "Practice gratitude or positive thinking.", icon: Smile, color: "text-amber-500", bg: "bg-amber-500/20" },
  { title: "Reduce Caffeine", text: "Limit caffeine if you feel anxious or restless.", icon: Coffee, color: "text-amber-600", bg: "bg-amber-600/20" },
  { title: "Warm Tea", text: "Herbal tea may help soothe your body.", icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/20" },
  { title: "Healthy Snacks", text: "Choose nuts or yogurt instead of processed snacks.", icon: CheckCircle2, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Stay Active", text: "Light activity can improve overall energy levels.", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/20" },
  { title: "Mindful Breathing", text: "Pause and take a few deep breaths during the day.", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/20" },
  { title: "Posture Check", text: "Sit upright to reduce body strain.", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/20" },
  { title: "Outdoor Time", text: "Spend a few minutes in fresh air and sunlight.", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/20" },
  { title: "Creative Activity", text: "Try drawing, journaling, or another creative hobby.", icon: Sparkles, color: "text-[#8A5AD1]", bg: "bg-[#8A5AD1]/20" },
  { title: "Light Cardio", text: "A short cardio session can boost circulation.", icon: Activity, color: "text-[#E6395A]", bg: "bg-[#E6395A]/20" },
  { title: "Stay Organized", text: "Plan your day to reduce stress.", icon: CheckCircle2, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Hydrating Foods", text: "Eat foods like cucumber or watermelon.", icon: Droplet, color: "text-blue-500", bg: "bg-blue-500/20" },
  { title: "Calm Moments", text: "Take small breaks to relax your mind.", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/20" },
  { title: "Gentle Massage", text: "A light self-massage may relieve muscle tension.", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/20" },
  { title: "Healthy Routine", text: "Maintain a consistent daily routine.", icon: CheckCircle2, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Mood Check", text: "Take a moment to notice and accept your feelings.", icon: Smile, color: "text-amber-500", bg: "bg-amber-500/20" },
  { title: "Mindful Eating", text: "Eat slowly and enjoy your meals.", icon: Coffee, color: "text-orange-500", bg: "bg-orange-500/20" },
  { title: "Stretch Your Back", text: "A quick back stretch can reduce stiffness.", icon: Activity, color: "text-[#E6395A]", bg: "bg-[#E6395A]/20" },
  { title: "Stay Motivated", text: "Set small achievable goals for the day.", icon: Sparkles, color: "text-[#8A5AD1]", bg: "bg-[#8A5AD1]/20" },
  { title: "Healthy Smoothie", text: "Blend fruits and yogurt for a quick nutrient boost.", icon: CheckCircle2, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Quiet Time", text: "Spend a few minutes away from screens.", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/20" },
  { title: "Positive Break", text: "Step away from work and relax briefly.", icon: Smile, color: "text-blue-500", bg: "bg-blue-500/20" },
  { title: "Gentle Walk", text: "Walking can help clear your mind.", icon: Activity, color: "text-[#E6395A]", bg: "bg-[#E6395A]/20" },
  { title: "Stay Connected", text: "Talk with a friend or loved one.", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/20" },
  { title: "Hydration Reminder", text: "Keep a water bottle nearby.", icon: Droplet, color: "text-blue-500", bg: "bg-blue-500/20" },
  { title: "Mindful Pause", text: "Take a moment to relax and reset.", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/20" },
  { title: "Comfort Clothing", text: "Wear comfortable clothes that allow easy movement.", icon: CheckCircle2, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Healthy Energy", text: "Choose whole foods for sustained energy.", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/20" },
  { title: "Relax Your Shoulders", text: "Roll your shoulders to release tension.", icon: Activity, color: "text-[#E6395A]", bg: "bg-[#E6395A]/20" },
  { title: "Short Meditation", text: "A 5-minute meditation can improve focus.", icon: Sparkles, color: "text-[#8A5AD1]", bg: "bg-[#8A5AD1]/20" },
  { title: "Stay Balanced", text: "Balance work, rest, and activity.", icon: CheckCircle2, color: "text-[#1B994C]", bg: "bg-[#1B994C]/20" },
  { title: "Healthy Habits", text: "Maintain simple healthy habits daily.", icon: Smile, color: "text-amber-500", bg: "bg-amber-500/20" },
  { title: "Fresh Air Break", text: "Open a window or step outside briefly.", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/20" },
  { title: "Gentle Stretching", text: "Stretch arms and legs to improve circulation.", icon: Activity, color: "text-[#E6395A]", bg: "bg-[#E6395A]/20" },
  { title: "Drink Warm Water", text: "Warm water may help digestion.", icon: Droplet, color: "text-blue-500", bg: "bg-blue-500/20" },
  { title: "Self-Care Moment", text: "Take time for something you enjoy.", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/20" },
  { title: "Listen to Your Body", text: "Rest when you feel tired and stay active when you feel energized.", icon: Sparkles, color: "text-[#8A5AD1]", bg: "bg-[#8A5AD1]/20" },
];

const LogCycle = () => {
  const { user, updateUser } = useAuth();

  const [cycleDay, setCycleDay] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonthView, setCurrentMonthView] = useState(new Date());
  const cycleLength = user?.cycle_length ? parseInt(user.cycle_length, 10) : 28;
  const [isCycleComplete, setIsCycleComplete] = useState(false);
  const [isBeforeCycle, setIsBeforeCycle] = useState(false);

  const userLastPeriodDate = user?.last_period_date || user?.lastPeriod;
  const [predictedCycle, setPredictedCycle] = useState(null);
  const [pastPeriods, setPastPeriods] = useState([]);

  // Daily Logs State - load from Supabase
  const [dailyLogs, setDailyLogs] = useState({});
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Load cycle logs from Supabase on mount
  useEffect(() => {
    if (user?.id) {
      loadCycleLogs();
    }
  }, [user?.id]);

  const loadCycleLogs = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingLogs(true);
      const [logsResult, periodsResult] = await Promise.all([
        supabase
          .from('cycle_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('log_date', { ascending: false }),
        getPeriods()
      ]);

      if (logsResult.error) throw logsResult.error;

      // Convert database format to app format
      const logsMap = {};
      logsResult.data?.forEach(log => {
        const dateKey = new Date(log.log_date).toDateString();
        logsMap[dateKey] = {
          flow: log.flow || '',
          pain: log.pain_level || '',
          moods: log.moods || [],
          symptoms: log.symptoms || []
        };
      });

      setDailyLogs(logsMap);

      if (periodsResult.data) {
        setPastPeriods(periodsResult.data);
      }

      // Fetch ML-backed prediction
      const lastDateCandidate = userLastPeriodDate || periodsResult.data?.[0]?.start_date;
      if (lastDateCandidate) {
        const predRes = await predictNextPeriod({
          last_period_date: lastDateCandidate,
          cycle_length: cycleLength,
          period_duration: 5,
          flow: logsResult.data?.[0]?.flow || 'Medium',
          pain_level: logsResult.data?.[0]?.pain_level || null,
          moods: logsResult.data?.[0]?.moods || [],
          symptoms: logsResult.data?.[0]?.symptoms || []
        });
        if (predRes.data) {
          setPredictedCycle(predRes.data);
        }
      }
    } catch (error) {
      console.error('Error loading cycle logs:', error);
      // Fall back to localStorage if Supabase fails
      const saved = localStorage.getItem('herhealth_daily_logs');
      if (saved) setDailyLogs(JSON.parse(saved));
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Persist logs to localStorage as backup
  useEffect(() => {
    localStorage.setItem('herhealth_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  // Sync recentCycle for Dashboard whenever logs change
  useEffect(() => {
    const dates = Object.keys(dailyLogs).sort((a, b) => new Date(b) - new Date(a));
    const mostRecentDateData = dates.find(date => {
      const log = dailyLogs[date];
      return log.flow || (log.symptoms && log.symptoms.length > 0) || (log.moods && log.moods.length > 0) || log.pain;
    });

    if (mostRecentDateData) {
      const log = dailyLogs[mostRecentDateData];
      const recentData = {
        flow: log.flow,
        symptoms: log.symptoms,
        moods: log.moods,
        pain: log.pain,
        date: mostRecentDateData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('recentCycle', JSON.stringify(recentData));
    }
  }, [dailyLogs, userLastPeriodDate]);

  const handleLogToggle = useCallback(async (category, item) => {
    const dateKey = selectedDate instanceof Date ? selectedDate.toDateString() : new Date(selectedDate).toDateString();
    const logDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
    logDate.setHours(0, 0, 0, 0);

    // If logging a flow, and it's not "Spotting", update the user's last_period_date if it's a new cycle start
    if (category === 'flow' && item !== 'Spotting' && item !== '') {
      const currentUserLastPeriod = user?.last_period_date ? new Date(user.last_period_date) : null;

      // Update global context if this date is NEWER than existing last_period_date
      if (!currentUserLastPeriod || logDate > currentUserLastPeriod) {
        await updateUser({ last_period_date: logDate.toISOString().split('T')[0] });
      }
    }

    setDailyLogs(prev => {
      const log = prev[dateKey] || { flow: '', pain: '', moods: [], symptoms: [] };
      let newLog = { ...log };

      if (category === 'flow' || category === 'pain') {
        newLog[category] = newLog[category] === item ? '' : item;
      } else {
        if (newLog[category].includes(item)) {
          newLog[category] = newLog[category].filter(i => i !== item);
        } else {
          newLog[category] = [...newLog[category], item];
        }
      }
      
      // Save to Supabase (async)
      if (user?.id) {
        saveCycleLog(logDate, newLog);
      }
      
      return { ...prev, [dateKey]: newLog };
    });
  }, [selectedDate, user, updateUser]);

  const saveCycleLog = async (logDate, logData) => {
    if (!user?.id) return;

    try {
      const dbData = {
        user_id: user.id,
        log_date: logDate.toISOString().split('T')[0],
        flow: logData.flow || '',
        pain_level: logData.pain || '',
        symptoms: logData.symptoms || [],
        moods: logData.moods || []
      };

      // Upsert (insert or update if exists)
      const { error } = await supabase
        .from('cycle_logs')
        .upsert(dbData, { onConflict: 'user_id,log_date' });

      if (error) throw error;

      // Sync symptoms array → symptoms table (single source of truth for Dashboard)
      await syncSymptomsForDate(
        logDate.toISOString().split('T')[0],
        logData.symptoms || []
      );

      // If flow is logged and it's not just spotting, create/update period record
      if (logData.flow && logData.flow !== '' && logData.flow !== 'Spotting') {
        await createOrUpdatePeriod(logDate.toISOString().split('T')[0], logData.flow);
      }
    } catch (error) {
      console.error('Error saving cycle log:', error);
    }
  };

  const createOrUpdatePeriod = async (dateStr, flow) => {
    try {
      // Check if there's an existing period within last 7 days
      const sevenDaysAgo = new Date(dateStr);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: existingPeriods } = await supabase
        .from('periods')
        .select('*')
        .gte('start_date', sevenDaysAgo.toISOString().split('T')[0])
        .lte('start_date', dateStr)
        .order('start_date', { ascending: false })
        .limit(1);

      if (existingPeriods && existingPeriods.length > 0) {
        // Update existing period's end_date
        const period = existingPeriods[0];
        const currentDate = new Date(dateStr);
        const existingEndDate = period.end_date ? new Date(period.end_date) : new Date(period.start_date);

        if (currentDate > existingEndDate) {
          await supabase
            .from('periods')
            .update({ end_date: dateStr, flow })
            .eq('id', period.id);
        }
      } else {
        // Create new period
        await supabase
          .from('periods')
          .insert({
            user_id: user.id,
            start_date: dateStr,
            end_date: dateStr,
            flow
          });
      }
    } catch (error) {
      console.error('Error creating/updating period:', error);
    }
  };

  const currentLog = useMemo(() => {
    const key = selectedDate instanceof Date ? selectedDate.toDateString() : new Date(selectedDate).toDateString();
    return dailyLogs[key] || { flow: '', pain: '', moods: [], symptoms: [] };
  }, [dailyLogs, selectedDate]);

  useEffect(() => {
    const rawLastPeriod = userLastPeriodDate || pastPeriods?.[0]?.start_date;
    if (rawLastPeriod && selectedDate) {
      const lastPeriodDate = parseLocalDate(rawLastPeriod);
      const targetDate = parseLocalDate(selectedDate);

      if (lastPeriodDate && targetDate) {
        const diffTime = targetDate.getTime() - lastPeriodDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays < 1) {
          setIsBeforeCycle(true);
          setIsCycleComplete(false);
          setCycleDay(1);
        } else if (diffDays > cycleLength) {
          setCycleDay(diffDays);
          setIsCycleComplete(true);
          setIsBeforeCycle(false);
        } else {
          setCycleDay(diffDays);
          setIsCycleComplete(false);
          setIsBeforeCycle(false);
        }
      }
    }
  }, [userLastPeriodDate, pastPeriods, selectedDate, cycleLength]);

  const nextPeriodDate = useMemo(() => {
    if (predictedCycle?.nextPeriodDate) {
      return parseLocalDate(predictedCycle.nextPeriodDate);
    }
    const rawLastPeriod = userLastPeriodDate || pastPeriods?.[0]?.start_date;
    const lastDate = parseLocalDate(rawLastPeriod);
    if (!lastDate) return null;
    return calculateNextPeriod(lastDate, cycleLength);
  }, [predictedCycle, userLastPeriodDate, pastPeriods, cycleLength]);

  const formattedNextPeriod = useMemo(() => {
    if (!nextPeriodDate) return '--';
    return nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [nextPeriodDate]);

  const todaysSuggestions = useMemo(() => {
    let hash = 0;
    const dateStr = selectedDate instanceof Date ? selectedDate.toDateString() : new Date(selectedDate).toDateString();
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const seed = Math.abs(hash);
    const index1 = seed % suggestionBank.length;
    let index2 = (seed + 3) % suggestionBank.length;
    if (index1 === index2) index2 = (index2 + 1) % suggestionBank.length;

    return [suggestionBank[index1], suggestionBank[index2]];
  }, [selectedDate]);

  const dates = useMemo(() => {
    const ds = [];
    const today = new Date();
    for (let i = -90; i <= 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      ds.push(d);
    }
    return ds;
  }, []);

  const getPhaseData = useCallback((day) => {
    if (isBeforeCycle) return { name: 'No cycle data', color: '#6B7280' };
    if (isCycleComplete) return { name: 'Cycle Ended', color: '#9CA3AF' };
    if (day >= 1 && day <= 2) return { name: 'Heavy Menstrual', color: '#E6395A' };
    if (day >= 3 && day <= 5) return { name: 'Light Menstrual', color: '#E8637E' };
    if (day >= 6 && day <= 8) return { name: 'Early Follicular', color: '#0F7A70' };
    if (day >= 9 && day <= 11) return { name: 'Mid Follicular', color: '#1B994C' };
    if (day >= 12 && day <= 13) return { name: 'Late Follicular', color: '#457A1A' };
    if (day >= 14 && day <= 15) return { name: 'Ovulation', color: '#E69500' };
    if (day >= 16 && day <= 18) return { name: 'Early Luteal', color: '#8A5AD1' };
    if (day >= 19 && day <= 22) return { name: 'Mid Luteal', color: '#7141E8' };
    if (day >= 23 && day <= 26) return { name: 'Late Luteal', color: '#5429E6' };
    return { name: 'PMS Phase', color: '#916BEE' };
  }, [isBeforeCycle, isCycleComplete]);

  const { currentPhase, outerOffset, innerOffset, progressRatio } = useMemo(() => {
    const phase = getPhaseData(cycleDay);
    let ratio = 0;
    if (isCycleComplete) ratio = 1;
    else if (isBeforeCycle) ratio = 0;
    else ratio = Math.min(cycleDay, cycleLength) / cycleLength;

    return {
      currentPhase: phase,
      progressRatio: ratio,
      outerOffset: 753.6 - (753.6 * ratio),
      innerOffset: 596.6 - (596.6 * ratio)
    };
  }, [getPhaseData, cycleDay, cycleLength, isBeforeCycle, isCycleComplete]);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('.active-date');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  const monthFormat = currentMonthView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonthView(new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1));

  const handleSelectFromCalendar = (day) => {
    const newDate = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth(), day);
    setSelectedDate(newDate);
    setIsCalendarOpen(false);
    const index = dates.findIndex(d => d.toDateString() === newDate.toDateString());
    if (index !== -1 && scrollContainerRef.current) {
      setTimeout(() => {
        const children = Array.from(scrollContainerRef.current.children).filter(c => c.hasAttribute('data-index'));
        const el = children[index];
        if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 100);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const centerPoint = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = -1;
    let minDiff = Infinity;
    const children = Array.from(container.children).filter(c => c.hasAttribute('data-index'));
    children.forEach((child) => {
      const index = parseInt(child.getAttribute('data-index'), 10);
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const diff = Math.abs(childCenter - centerPoint);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });
    if (closestIndex !== -1 && dates[closestIndex]) {
      const centeredDate = dates[closestIndex];
      if (centeredDate.getMonth() !== currentMonthView.getMonth() || centeredDate.getFullYear() !== currentMonthView.getFullYear()) {
        setCurrentMonthView(new Date(centeredDate));
      }
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonthView(today);
    setIsCalendarOpen(false);
    const index = dates.findIndex(d => d.toDateString() === today.toDateString());
    if (index !== -1 && scrollContainerRef.current) {
      setTimeout(() => {
        const children = Array.from(scrollContainerRef.current.children).filter(c => c.hasAttribute('data-index'));
        const el = children[index];
        if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fce7f3] via-[#e8c6ef] to-[#d6c1f1] font-sans pb-10 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      <div className="px-6 pt-12 pb-6 flex justify-between items-center z-20 relative">
        <div className="w-16"></div>
        <button
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="flex items-center gap-2 text-gray-800 font-bold text-lg tracking-wide hover:opacity-80 transition-opacity bg-white/40 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          <CalendarIcon className="w-5 h-5 text-[#9d7bd8]" />
          {monthFormat}
          <ChevronDown className={`w-5 h-5 text-[#9d7bd8] transition-transform duration-300 ${isCalendarOpen ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={handleJumpToToday} className="w-auto min-w-[64px] text-right text-sm font-semibold text-[#8a5ad1] hover:text-[#7141e8]">
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
        </button>
      </div>

      {isCalendarOpen && (
        <>
          <div className="absolute top-24 left-0 right-0 mx-auto w-[340px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl z-50 p-6 border border-white/60">
            <div className="flex justify-between items-center mb-4">
              <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronDown className="w-5 h-5 rotate-90" /></button>
              <h3 className="font-bold text-gray-800">{monthFormat}</h3>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-600"><ChevronDown className="w-5 h-5 -rotate-90" /></button>
              <button onClick={() => setIsCalendarOpen(false)} className="absolute top-4 right-4 p-1 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day} className="text-xs font-semibold text-gray-400 py-1">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map(i => <div key={`empty-${i}`} className="w-8 h-8"></div>)}
              {calendarDays.map(day => {
                const dayDate = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth(), day);
                const dayState = getCalendarDayState(dayDate, {
                  lastPeriodDate: userLastPeriodDate || pastPeriods?.[0]?.start_date,
                  cycleLength,
                  nextPeriodDate,
                  pastPeriods,
                  selectedDate
                });

                let cellClasses = 'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all';
                if (dayState.isSelected) {
                  cellClasses += ' bg-[#9d7bd8] text-white font-bold shadow-md';
                } else if (dayState.isPeriodDay) {
                  cellClasses += ' bg-[#F2C5CF] text-[#17213D] font-bold';
                } else if (dayState.isOvulationDay) {
                  cellClasses += ' bg-[#C8B7E8] text-[#17213D] font-bold ring-2 ring-[#6B42A6]';
                } else if (dayState.isFertileDay) {
                  cellClasses += ' bg-[#C8B7E8] text-[#17213D] font-medium';
                } else if (dayState.isPredictedPeriod) {
                  cellClasses += ' border-2 border-dashed border-[#E95A7A] bg-[#FFA6B7]/30 text-[#17213D] font-bold';
                } else {
                  cellClasses += ' text-gray-700 hover:bg-gray-100';
                }

                if (dayState.isToday && !dayState.isSelected) {
                  cellClasses += ' ring-2 ring-[#17213D] font-black';
                }

                return (
                  <button
                    key={day}
                    onClick={() => handleSelectFromCalendar(day)}
                    className={cellClasses}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-1 text-[10px] text-gray-600 font-medium">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F2C5CF]" />Period</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C8B7E8]" />Fertile</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C8B7E8] ring-1 ring-[#6B42A6]" />Ovulation</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-dashed border-[#E95A7A] bg-[#FFA6B7]/40" />Predicted</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border-2 border-[#17213D]" />Today</div>
            </div>
          </div>
          <div className="absolute inset-0 bg-black/10 z-40 backdrop-blur-[1px]" onClick={() => setIsCalendarOpen(false)} />
        </>
      )}

      <div ref={scrollContainerRef} onScroll={handleScroll} className="flex items-center gap-4 px-6 mb-10 overflow-x-auto no-scrollbar snap-x">
        {dates.map((dateObj, i) => {
          const dayState = getCalendarDayState(dateObj, {
            lastPeriodDate: userLastPeriodDate || pastPeriods?.[0]?.start_date,
            cycleLength,
            nextPeriodDate,
            pastPeriods,
            selectedDate
          });
          const isActive = dayState.isSelected;
          const isToday = dayState.isToday;

          let pillClasses = 'w-11 h-16 rounded-full flex flex-col items-center justify-center transition-all';
          if (isActive) {
            pillClasses += ' bg-[#9d7bd8] text-white shadow-lg';
          } else if (dayState.isPeriodDay) {
            pillClasses += ' bg-[#F2C5CF] text-[#17213D] font-bold shadow-sm';
          } else if (dayState.isOvulationDay) {
            pillClasses += ' bg-[#C8B7E8] text-[#17213D] font-bold ring-2 ring-[#6B42A6] shadow-sm';
          } else if (dayState.isFertileDay) {
            pillClasses += ' bg-[#C8B7E8] text-[#17213D] font-medium shadow-sm';
          } else if (dayState.isPredictedPeriod) {
            pillClasses += ' border-2 border-dashed border-[#E95A7A] bg-[#FFA6B7]/30 text-[#17213D] font-bold';
          } else if (isToday) {
            pillClasses += ' bg-[#9d7bd8]/20 border border-[#9d7bd8] text-[#9d7bd8]';
          } else {
            pillClasses += ' text-gray-600 font-medium hover:bg-white/20';
          }

          if (isToday && !isActive) {
            pillClasses += ' ring-2 ring-[#17213D]';
          }

          return (
            <div
              key={i}
              data-index={i}
              onClick={() => {
                setSelectedDate(dateObj);
                if (scrollContainerRef.current) {
                  const el = Array.from(scrollContainerRef.current.children).filter(c => c.hasAttribute('data-index'))[i];
                  if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }
              }}
              className={`flex flex-col items-center gap-2 cursor-pointer snap-center shrink-0 ${isActive ? 'active-date' : ''}`}
            >
              <span className={`text-xs ${isActive ? 'text-gray-800 font-semibold' : isToday ? 'text-gray-700 font-bold' : 'text-gray-500'}`}>
                {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <div className={pillClasses}>
                <span className="font-bold text-lg">{dateObj.toLocaleDateString('en-US', { day: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative flex justify-center flex-col items-center mb-10 z-10">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="10" />
            <circle cx="140" cy="140" r="95" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="10" />
            <circle cx="140" cy="140" r="120" fill="none" stroke={currentPhase.color} strokeWidth="10" strokeLinecap="round" strokeDasharray="753.6" strokeDashoffset={outerOffset} className="transition-all duration-700 ease-in-out" />
            <circle cx="140" cy="140" r="95" fill="none" stroke={currentPhase.color} strokeWidth="10" strokeLinecap="round" strokeDasharray="596.6" strokeDashoffset={innerOffset} className="transition-all duration-700 ease-in-out opacity-40" />
            <circle cx="140" cy="20" r="8" fill="white" stroke={currentPhase.color} strokeWidth="4" className="transition-all duration-700 ease-in-out origin-center" style={{ transform: `rotate(${360 * progressRatio}deg)` }} />
          </svg>
          <div className="flex flex-col items-center justify-center text-center">
            {!isBeforeCycle && <span className="text-gray-500 text-[10px] tracking-widest uppercase font-bold mb-1 opacity-80">Cycle Day {cycleDay}</span>}
            <span className="text-2xl font-bold px-4 leading-tight transition-colors duration-700" style={{ color: currentPhase.color }}>{currentPhase.name}</span>
          </div>
        </div>
      </div>

      {isCycleComplete && (
        <div className="mx-6 mb-8 bg-white/60 backdrop-blur-md border border-white/50 rounded-xl p-4 text-center">
          <p className="text-gray-800 text-sm">Your cycle has ended. Please log your new period start date in Profile.</p>
        </div>
      )}

      {/* Dynamic Statistics Row */}
      <div className="mx-6 mb-8 grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-3 shadow-sm">
          <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Avg Cycle</span>
          <span className="text-xl font-bold text-[#8A5AD1]">{cycleLength}<span className="text-xs font-semibold block">days</span></span>
        </div>
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-3 shadow-sm">
          <span className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Cycle Day</span>
          <span className="text-xl font-bold text-[#E6395A]">{isBeforeCycle ? '--' : cycleDay}<span className="text-xs font-semibold block">today</span></span>
        </div>
        <div className="bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-3 shadow-sm">
          <span className="text-[10px] text-gray-500 font-bold uppercase mb-1 flex items-center justify-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#1B994C]" /> Next Period
          </span>
          <span className="text-lg font-bold text-[#1B994C]">
            {formattedNextPeriod}
          </span>
          {predictedCycle?.daysUntil !== undefined && predictedCycle?.daysUntil !== null && (
            <span className="text-[10px] text-gray-600 block">
              {predictedCycle.daysUntil > 0 ? `in ${predictedCycle.daysUntil}d` : predictedCycle.daysUntil === 0 ? 'Today' : `${Math.abs(predictedCycle.daysUntil)}d past`}
            </span>
          )}
        </div>
      </div>

      {!isBeforeCycle && (
        <div className="px-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-5 border border-white/60">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Droplet className="w-4 h-4 text-[#E6395A]" /> Period Flow</h3>
              <div className="flex flex-wrap gap-2">
                {['Light', 'Medium', 'Heavy', 'Spotting'].map(flow => (
                  <button key={flow} onClick={() => handleLogToggle('flow', flow)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${currentLog.flow === flow ? 'bg-[#E6395A] text-white shadow-md' : 'bg-white/60 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-transparent'}`}>{flow}</button>
                ))}
              </div>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-5 border border-white/60">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-[#1B994C]" /> Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Acne', 'Backache'].map(symp => (
                  <button key={symp} onClick={() => handleLogToggle('symptoms', symp)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${currentLog.symptoms.includes(symp) ? 'bg-[#1B994C] text-white shadow-md' : 'bg-white/60 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 border border-transparent'}`}>{symp}</button>
                ))}
              </div>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-5 border border-white/60">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-[#8A5AD1]" /> Mood</h3>
              <div className="flex flex-wrap gap-3">
                {[{ id: 'happy', label: 'Happy', icon: Smile, color: 'text-amber-500', bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-50', hoverBorder: 'hover:border-amber-200', hoverText: 'hover:text-amber-600' }, { id: 'sad', label: 'Sad', icon: Frown, color: 'text-blue-500', bg: 'bg-blue-500', hoverBg: 'hover:bg-blue-50', hoverBorder: 'hover:border-blue-200', hoverText: 'hover:text-blue-600' }, { id: 'sensitive', label: 'Sensitive', icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500', hoverBg: 'hover:bg-pink-50', hoverBorder: 'hover:border-pink-200', hoverText: 'hover:text-pink-600' }, { id: 'energetic', label: 'Energetic', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500', hoverBg: 'hover:bg-purple-50', hoverBorder: 'hover:border-purple-200', hoverText: 'hover:text-purple-600' }].map(mood => (
                  <button key={mood.id} onClick={() => handleLogToggle('moods', mood.id)} className={`flex items-center gap-2 py-2 px-4 rounded-full border transition-all duration-300 transform hover:scale-105 ${currentLog.moods.includes(mood.id) ? `${mood.bg} text-white shadow-md border-transparent` : `bg-white/60 text-gray-600 border-white/20 ${mood.hoverBg} ${mood.hoverBorder} ${mood.hoverText}`}`}>
                    <mood.icon className={`w-4 h-4 transition-colors ${currentLog.moods.includes(mood.id) ? 'text-white' : mood.color}`} /><span className="text-xs font-semibold">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-5 border border-white/60">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-orange-500" /> Pain Level</h3>
              <div className="flex flex-wrap gap-2">
                {['None', 'Mild', 'Moderate', 'Severe'].map(pain => (
                  <button key={pain} onClick={() => handleLogToggle('pain', pain)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 transform hover:scale-105 ${currentLog.pain === pain ? 'bg-orange-500 text-white shadow-md' : 'bg-white/60 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent'}`}>{pain}</button>
                )) }
              </div>
            </div>
          </div>
          <div className="h-fit sticky top-24 space-y-6">
            <div className="bg-gradient-to-r from-[#9d7bd8]/20 to-[#fce7f3]/50 backdrop-blur-md rounded-3xl p-6 border border-white/80">
              <h3 className="text-sm font-bold text-[#8A5AD1] mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Daily Insight</h3>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">You are in your <strong style={{ color: currentPhase.color }}>{currentPhase.name}</strong>. Based on trends, staying hydrated and light exercise could boost your mood!</p>
            </div>
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/60 shadow-sm">
              <h3 className="text-sm font-bold text-[#8A5AD1] mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Suggestions for Today</h3>
              <ul className="space-y-3">
                {todaysSuggestions.map((suggestion, idx) => (
                  <li key={idx} className="bg-white/50 backdrop-blur-sm rounded-xl p-3 flex items-start gap-3 border border-white/60 hover:-translate-y-0.5 transition-transform">
                    <div className={`${suggestion.bg} p-1.5 rounded-lg shrink-0`}><suggestion.icon className={`w-4 h-4 ${suggestion.color}`} /></div>
                    <div><h4 className="text-xs font-bold text-gray-800">{suggestion.title}</h4><p className="text-[10px] text-gray-600 mt-0.5 leading-tight">{suggestion.text}</p></div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogCycle;
