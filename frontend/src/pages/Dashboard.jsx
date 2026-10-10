import { useMemo, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Flower2, Stethoscope, Sparkles, Clock3, Activity, HeartPulse, CalendarRange, Droplet, TrendingUp, Phone, AlertTriangle, Shield, HeartHandshake, Ambulance } from 'lucide-react';
import { getLatestPeriod, getPeriods, getPeriodsInRange } from '../services/periodService';
import { getRecentSymptoms } from '../services/symptomService';
import {
  getCycleStats,
  calculateCycleDay,
  calculateNextPeriod,
  predictNextPeriod,
  calculateFertileWindow,
  getPeriodDays,
  getCalendarDayState,
  getCyclePhase,
  getLatestCycleLog,
  parseLocalDate,
  formatLocalDate,
  isSameDate
} from '../services/cycleService';
import ChatBot from '../components/ChatBot';

import womanIllustration from '../assets/woman_illustration.png';
import womanIllustration2 from '../assets/woman_illustration_2.png';

const PHASES = [
  { name: 'Menstrual', label: 'Days 1-5', color: '#F2C5CF', accent: '#E95A7A', desc: 'Rest and replenish.' },
  { name: 'Follicular', label: 'Days 6-13', color: '#D9E7F4', accent: '#3B72AF', desc: 'Energy and focus are on the rise.' },
  { name: 'Ovulation', label: 'Days 14-16', color: '#C8B7E8', accent: '#6B42A6', desc: 'This is your fertile window.' },
  { name: 'Luteal', label: 'Days 17-28', color: '#F5D7CF', accent: '#C47051', desc: 'PMS and recovery may begin.' },
];

// Menstrual cycle visualization matching reference image with 2.5D depth & animated path
function CycleVisualization({ phaseColor, cycleDay, cycleLength, activePhaseName, onPhaseSelect }) {
  const shouldReduceMotion = useReducedMotion();
  const activePhase = PHASES.find((p) => p.name === activePhaseName) || PHASES[0];

  const formattedDay = useMemo(() => {
    if (!cycleDay) return '—';
    return String(cycleDay).padStart(2, '0');
  }, [cycleDay]);

  return (
    <div className="relative flex flex-1 flex-col justify-between min-h-0 w-full px-1 py-1">
      {/* Central Interactive Section */}
      <div className="relative flex flex-1 items-center justify-center min-h-[185px] w-full">
        {/* Outer Circular Track & Directional Arrows SVG */}
        <svg viewBox="0 0 320 260" className="absolute inset-0 h-full w-full">
          <defs>
            <filter id="shadowRef" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#E95A7A" floodOpacity="0.25" />
            </filter>
            <linearGradient id="pinkTeardropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA6B7" />
              <stop offset="45%" stopColor="#FA6B8D" />
              <stop offset="100%" stopColor="#E93B66" />
            </linearGradient>
            <marker id="arrowHead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#C8B7E8" />
            </marker>
          </defs>

          {/* Dotted Circular Track */}
          <circle cx="160" cy="130" r="90" fill="none" stroke="#F5F0F7" strokeWidth="2" />

          {/* Thin Animated Cycle Path Ring */}
          <motion.circle
            cx="160"
            cy="130"
            r="90"
            fill="none"
            stroke="#C8B7E8"
            strokeWidth="1.5"
            strokeDasharray="12 12"
            animate={shouldReduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '160px 130px' }}
          />

          {/* Directional Arcs with Arrowheads */}
          <path
            d="M 118 45 A 90 90 0 0 1 202 45"
            fill="none"
            stroke="#17213D"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            markerEnd="url(#arrowHead)"
          />
          <path
            d="M 202 215 A 90 90 0 0 1 118 215"
            fill="none"
            stroke="#17213D"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            markerEnd="url(#arrowHead)"
          />

          {/* Center Teardrop Drop Shadow Floor */}
          <ellipse cx="160" cy="202" rx="30" ry="6" fill="#E93B66" opacity="0.22" filter="blur(5px)" />

          {/* 2.5D Glossy Teardrop Shape */}
          <motion.path
            d="M 160 32 C 183 74 212 116 212 150 C 212 180 189 202 160 202 C 131 202 108 180 108 150 C 108 116 137 74 160 32 Z"
            fill="url(#pinkTeardropGrad)"
            filter="url(#shadowRef)"
            animate={shouldReduceMotion ? {} : { y: [0, -3.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Translucent Inner Glare Highlight */}
          <path
            d="M 152 46 C 168 80 194 116 194 144 C 194 160 187 172 176 172 C 185 162 189 150 185 136 C 180 116 161 84 152 46 Z"
            fill="#FFFFFF"
            opacity="0.35"
          />
        </svg>

        {/* Text inside Teardrop */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center pt-3 pointer-events-none">
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.18em] text-[#17213D]/80">DAY</span>
          <span className="text-2xl font-black font-serif leading-none tracking-[-0.04em] text-[#17213D] my-0.5">{formattedDay}</span>
          <span className="text-[0.62rem] font-semibold text-[#17213D]/70">of {cycleLength || 28}</span>
        </div>

        {/* 4 Cardinal Phase Nodes & Labels matching Reference */}
        {/* Top-Left: Menstrual */}
        <div
          onClick={() => onPhaseSelect('Menstrual')}
          onMouseEnter={() => onPhaseSelect('Menstrual')}
          onMouseLeave={() => onPhaseSelect(null)}
          className="absolute left-[4%] top-[6%] flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-right hidden sm:block">
            <div className="text-[0.75rem] font-bold text-[#17213D]">Menstrual</div>
            <div className="text-[0.62rem] font-medium text-[#667085]">Days 1-5</div>
          </div>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[#FFFDFC] shadow-sm transition-all ${activePhaseName === 'Menstrual' ? 'border-[#E95A7A] ring-4 ring-[#F2C5CF]/70 scale-110' : 'border-[#F2C5CF]'}`}>
            <Droplet className="h-3.5 w-3.5 text-[#E95A7A] fill-[#F2C5CF]" />
          </div>
        </div>

        {/* Top-Right: Follicular */}
        <div
          onClick={() => onPhaseSelect('Follicular')}
          onMouseEnter={() => onPhaseSelect('Follicular')}
          onMouseLeave={() => onPhaseSelect(null)}
          className="absolute right-[4%] top-[6%] flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[#FFFDFC] shadow-sm transition-all ${activePhaseName === 'Follicular' ? 'border-[#3B72AF] ring-4 ring-[#D9E7F4]/70 scale-110' : 'border-[#D9E7F4]'}`}>
            <Droplet className="h-3.5 w-3.5 text-[#3B72AF] fill-[#D9E7F4]" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[0.75rem] font-bold text-[#17213D]">Follicular</div>
            <div className="text-[0.62rem] font-medium text-[#667085]">Days 6-13</div>
          </div>
        </div>

        {/* Bottom-Right: Ovulation */}
        <div
          onClick={() => onPhaseSelect('Ovulation')}
          onMouseEnter={() => onPhaseSelect('Ovulation')}
          onMouseLeave={() => onPhaseSelect(null)}
          className="absolute right-[4%] bottom-[6%] flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[#FFFDFC] shadow-sm transition-all ${activePhaseName === 'Ovulation' ? 'border-[#6B42A6] ring-4 ring-[#C8B7E8]/70 scale-110' : 'border-[#C8B7E8]'}`}>
            <Droplet className="h-3.5 w-3.5 text-[#6B42A6] fill-[#C8B7E8]" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-[0.75rem] font-bold text-[#17213D]">Ovulation</div>
            <div className="text-[0.62rem] font-medium text-[#667085]">Days 14-16</div>
          </div>
        </div>

        {/* Bottom-Left: Luteal */}
        <div
          onClick={() => onPhaseSelect('Luteal')}
          onMouseEnter={() => onPhaseSelect('Luteal')}
          onMouseLeave={() => onPhaseSelect(null)}
          className="absolute left-[4%] bottom-[6%] flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105"
        >
          <div className="text-right hidden sm:block">
            <div className="text-[0.75rem] font-bold text-[#17213D]">Luteal</div>
            <div className="text-[0.62rem] font-medium text-[#667085]">Days 17-28</div>
          </div>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-[#FFFDFC] shadow-sm transition-all ${activePhaseName === 'Luteal' ? 'border-[#C47051] ring-4 ring-[#F5D7CF]/70 scale-110' : 'border-[#F5D7CF]'}`}>
            <Droplet className="h-3.5 w-3.5 text-[#C47051] fill-[#F5D7CF]" />
          </div>
        </div>
      </div>

      {/* Bottom Summary Banner matching Reference Image */}
      <div className="mt-1 flex flex-col justify-center rounded-[16px] border border-[#F5F0F7] bg-[#F5F0F7]/80 px-3 py-1.5 transition-all">
        <div className="flex items-center gap-1.5 text-[0.72rem] font-bold text-[#17213D]">
          <span className="h-2 w-2 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: activePhase.color }} />
          <span>{activePhase.name} Phase</span>
          <span className="text-[#667085]">•</span>
          <span className="font-semibold text-[#667085]">{activePhase.label}</span>
        </div>
        <div className="mt-0.5 text-[0.65rem] font-medium text-[#667085]">
          {activePhase.desc}
        </div>
      </div>
    </div>
  );
}

const formatDate = (date) => {
  if (!date || Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getCycleMeta = (cycleDay, cycleLength, lastPeriodDate, isBeforeCycle) => {
  if (!lastPeriodDate || isBeforeCycle) {
    return { phaseName: 'No cycle data', phaseColor: '#667085', message: 'Log your cycle to generate a personalised pattern.' };
  }

  if (cycleDay <= 5) return { phaseName: 'Menstrual', phaseColor: '#F2C5CF', message: 'Rest and replenish.' };
  if (cycleDay <= 13) return { phaseName: 'Follicular', phaseColor: '#D9E7F4', message: 'Energy and focus are on the rise.' };
  if (cycleDay <= 16) return { phaseName: 'Ovulation', phaseColor: '#C8B7E8', message: 'This is your fertile window.' };
  return { phaseName: 'Luteal', phaseColor: '#F5D7CF', message: 'PMS and recovery may begin.' };
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Real data from Supabase
  const [latestPeriod, setLatestPeriod] = useState(null);
  const [allPeriods, setAllPeriods] = useState([]);
  const [latestCycleLog, setLatestCycleLog] = useState(null);  // flow, mood, pain, symptoms
  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [cycleStats, setCycleStats] = useState(null);
  const [predictedCycle, setPredictedCycle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('femcare_bookings') || '[]');
    setBookings(saved);
  }, []);

  // Load real data from Supabase
  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load latest period, period history, cycle log, symptoms, and statistics in parallel
      const [periodRes, allPeriodsRes, cycleLogRes, symptomsRes, statsRes] = await Promise.all([
        getLatestPeriod(),
        getPeriods(),
        getLatestCycleLog(),
        getRecentSymptoms(),
        getCycleStats()
      ]);

      if (periodRes.data) setLatestPeriod(periodRes.data);
      if (allPeriodsRes.data) setAllPeriods(allPeriodsRes.data);
      if (cycleLogRes.data) setLatestCycleLog(cycleLogRes.data);
      if (symptomsRes.data) setRecentSymptoms(symptomsRes.data);
      if (statsRes.data) setCycleStats(statsRes.data);

      // Fetch ML-backed Next Period Prediction from backend XGBoost pipeline
      const lastDateCandidate = periodRes.data?.start_date || user?.last_period_date || recentCycleData?.date;
      if (lastDateCandidate) {
        const predRes = await predictNextPeriod({
          last_period_date: lastDateCandidate,
          cycle_length: statsRes.data?.avgCycleLength || Number(user?.cycle_length || 28),
          period_duration: statsRes.data?.avgPeriodLength || 5,
          flow: cycleLogRes.data?.flow || recentCycleData?.flow || 'Medium',
          pain_level: cycleLogRes.data?.pain_level || recentCycleData?.pain || null,
          moods: cycleLogRes.data?.moods || recentCycleData?.moods || [],
          symptoms: cycleLogRes.data?.symptoms || recentCycleData?.symptoms || []
        });
        if (predRes.data) {
          setPredictedCycle(predRes.data);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentCycleData = useMemo(() => JSON.parse(localStorage.getItem('recentCycle') || 'null'), []);

  // Use latest period from database or fallback to user data, parsed safely without timezone shift
  const cycleLength = cycleStats?.avgCycleLength || Number(user?.cycle_length || 28);
  const lastPeriodDateStr = latestPeriod?.start_date || user?.last_period_date || recentCycleData?.date;
  const lastPeriodDate = useMemo(() => parseLocalDate(lastPeriodDateStr), [lastPeriodDateStr]);
  const today = useMemo(() => parseLocalDate(new Date()), []);

  const cycleDay = useMemo(() => calculateCycleDay(lastPeriodDate), [lastPeriodDate]);
  const isBeforeCycle = !lastPeriodDate || cycleDay === null || cycleDay <= 0;

  // Next Period: use ML-predicted date from backend XGBoost model, or mathematical fallback
  const nextPeriodDate = useMemo(() => {
    if (predictedCycle?.nextPeriodDate) {
      return parseLocalDate(predictedCycle.nextPeriodDate);
    }
    return calculateNextPeriod(lastPeriodDate, cycleLength);
  }, [predictedCycle, lastPeriodDate, cycleLength]);

  const formattedPredictedDate = useMemo(() => {
    if (!lastPeriodDate || !nextPeriodDate) return 'Log cycle to predict';
    return nextPeriodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [lastPeriodDate, nextPeriodDate]);

  const predictedDaysUntilText = useMemo(() => {
    if (!lastPeriodDate || !nextPeriodDate) return 'No period logged';
    const days = Math.round((nextPeriodDate.getTime() - today.getTime()) / 86400000);
    if (days > 1) return `In ${days} days`;
    if (days === 1) return 'Tomorrow';
    if (days === 0) return 'Today';
    return `${Math.abs(days)}d past predicted`;
  }, [lastPeriodDate, nextPeriodDate, today]);

  const phaseMeta = useMemo(() => getCycleMeta(cycleDay || 1, cycleLength, lastPeriodDate, isBeforeCycle), [cycleDay, cycleLength, lastPeriodDate, isBeforeCycle]);
  const [activePhaseName, setActivePhaseName] = useState(phaseMeta.phaseName);

  useEffect(() => {
    setActivePhaseName(phaseMeta.phaseName);
  }, [phaseMeta.phaseName]);

  const handlePhaseSelect = (phaseName) => {
    if (phaseName) {
      setActivePhaseName(phaseName);
    } else {
      setActivePhaseName(phaseMeta.phaseName);
    }
  };

  const periodDays = useMemo(() => getPeriodDays(lastPeriodDate, cycleLength), [lastPeriodDate, cycleLength]);

  // Dashboard Navigable Month Calendar state
  const [currentMonthView, setCurrentMonthView] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonthView((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonthView((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthLabel = currentMonthView.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthDays = useMemo(() => {
    const year = currentMonthView.getFullYear();
    const month = currentMonthView.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInThisMonth = new Date(year, month + 1, 0).getDate();
    // Support 42 slots when month start offset + days exceeds 35, ensuring leap years & full months render
    const totalSlots = (firstDayIndex + daysInThisMonth > 35) ? 42 : 35;
    return Array.from({ length: totalSlots }, (_, index) => {
      const dayOffset = index - firstDayIndex + 1;
      const date = new Date(year, month, dayOffset);
      return {
        date,
        dayNumber: date.getDate(),
        inMonth: date.getMonth() === month,
      };
    });
  }, [currentMonthView]);

  const healthSummary = useMemo(() => {
    // ── Single source of truth: latest cycle_logs row ──────────────────────
    // All four fields come from the SAME row so dates are always consistent.
    // Falls back to localStorage only when Supabase has no data yet.

    const flow = latestCycleLog?.flow || recentCycleData?.flow || null;

    // Mood — stored as lowercase IDs, display as Title Case
    const MOOD_LABELS = { happy: 'Happy', sad: 'Sad', sensitive: 'Sensitive', energetic: 'Energetic' };
    const rawMoods = latestCycleLog?.moods?.length
      ? latestCycleLog.moods
      : recentCycleData?.moods?.length
        ? recentCycleData.moods
        : [];
    const moodNames = rawMoods.map(m => MOOD_LABELS[m] || m);

    // Pain
    const pain = latestCycleLog?.pain_level || recentCycleData?.pain || null;

    // Symptoms — prefer symptoms table (more reliable, already synced by LogCycle)
    let recentSymptomNames = [];
    let recentSymptomDate = null;
    if (recentSymptoms.length > 0) {
      recentSymptomDate = recentSymptoms[0].symptom_date;
      recentSymptomNames = recentSymptoms
        .filter(s => s.symptom_date === recentSymptomDate)
        .map(s => s.symptom_name);
    }
    const symptomNames = recentSymptomNames.length > 0
      ? recentSymptomNames
      : latestCycleLog?.symptoms?.length
        ? latestCycleLog.symptoms
        : recentCycleData?.symptoms?.length
          ? recentCycleData.symptoms
          : [];

    // Log date for chatbot context
    const logDate = latestCycleLog?.log_date || recentCycleData?.date || null;

    return {
      avgCycle: `${cycleLength} days`,
      flow,                              // e.g. 'Heavy' | null
      moodNames,                         // e.g. ['Sensitive'] | []
      pain,                              // e.g. 'Moderate' | null
      symptomNames,                      // e.g. ['Cramps', 'Fatigue'] | []
      hasFlow: !!flow,
      hasMood: moodNames.length > 0,
      hasPain: !!pain,
      hasSymptoms: symptomNames.length > 0,
      logDate,
      prediction: cycleDay && cycleDay > 0
        ? (cycleDay <= 5 ? 'Menstrual phase'
          : cycleDay <= 13 ? 'Follicular phase'
          : cycleDay <= 16 ? 'Ovulation phase'
          : 'Luteal phase')
        : 'Needs data',
    };
  }, [cycleDay, cycleLength, latestCycleLog, latestPeriod, recentSymptoms, recentCycleData]);

  const bookingDetails = bookings[0];

  return (
    <div className="mx-auto w-full max-w-[1800px] min-h-[calc(100vh-4.25rem)] bg-[#FFFDFC] px-3 sm:px-4 lg:px-6 py-3 text-[#17213D] space-y-4">
      
      {/* Top Row: Woman Image | Your Cycle | Calendar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.15fr_1.1fr_0.95fr]">
        
        {/* Card 1: 2nd Uploaded Woman Illustration Banner */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          className="flex flex-col justify-between rounded-[20px] border border-[#F5F0F7] bg-[#FFFDFC] p-3 shadow-[0_12px_24px_rgba(23,33,61,0.03)] hover:shadow-[0_16px_30px_rgba(23,33,61,0.06)] transition-all duration-200"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#667085]">Good morning,</div>
              <div className="mt-0.5 text-[1.65rem] font-black leading-none tracking-[-0.05em] text-[#17213D]">
                {user?.name?.split(' ')[0]?.toUpperCase() || user?.email?.split('@')[0]?.toUpperCase() || '...'}
              </div>
            </div>
            <button
              onClick={() => navigate('/log-cycle')}
              className="rounded-full border border-[#F5F0F7] bg-[#F5F0F7] px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-[#17213D] hover:bg-[#F2C5CF] hover:border-[#F2C5CF] transition-all duration-200 shadow-sm shrink-0"
            >
              Log cycle
            </button>
          </div>

          {/* 2nd Uploaded Illustration Image Container */}
          <div className="relative flex flex-1 min-h-[155px] items-center justify-center overflow-hidden rounded-[16px] bg-[#F5D7CF]/30 p-1 border border-[#F5D7CF]/40">
            <img
              src={womanIllustration2}
              alt="Woman cycle reflection illustration"
              className="relative z-10 h-full w-full max-h-[160px] object-cover rounded-[14px] shadow-sm transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
        </motion.section>

        {/* Card 2: Your Cycle Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          whileHover={{ y: -2 }}
          className="flex flex-col rounded-[20px] border border-[#F5F0F7] bg-[#FFFDFC] p-3 shadow-[0_12px_24px_rgba(23,33,61,0.03)] hover:shadow-[0_16px_30px_rgba(23,33,61,0.06)] transition-all duration-200"
        >
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <div className="text-xl font-black tracking-[-0.05em] text-[#17213D]">Your Cycle</div>
                  <div className="text-[0.68rem] text-[#667085]">
                    {lastPeriodDate && nextPeriodDate
                      ? `Day ${cycleDay || 1} of ${cycleLength} • Next period ${formattedPredictedDate}`
                      : 'Tap a phase to explore'}
                  </div>
                </div>
              </div>

              <CycleVisualization
                phaseColor={phaseMeta.phaseColor}
                cycleDay={cycleDay}
                cycleLength={cycleLength}
                activePhaseName={activePhaseName}
                onPhaseSelect={handlePhaseSelect}
              />
            </motion.section>

            {/* Card 3: Clickable Calendar Section */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -2 }}
              onClick={() => navigate('/log-cycle')}
              className="flex h-full min-h-0 flex-col justify-between rounded-[20px] border border-[#F5F0F7] bg-[#FFFDFC] p-3 shadow-[0_12px_24px_rgba(23,33,61,0.03)] hover:shadow-[0_16px_30px_rgba(23,33,61,0.06)] cursor-pointer transition-all duration-200 md:col-span-2 lg:col-span-1 group"
              title="Click to open Calendar Page"
            >
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <div className="text-[1.05rem] font-black tracking-[-0.04em] text-[#17213D] group-hover:text-[#E95A7A] transition-colors">{monthLabel}</div>
                  {lastPeriodDate && nextPeriodDate && (
                    <div className="text-[0.62rem] font-semibold text-[#E95A7A] flex items-center gap-1 mt-0.5">
                      <Sparkles className="h-2.5 w-2.5" /> Next: {formattedPredictedDate} ({predictedDaysUntilText})
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevMonth}
                    className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-[#F5F0F7] bg-[#F5F0F7] text-[#17213D] hover:bg-[#F2C5CF] transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="flex h-6.5 w-6.5 items-center justify-center rounded-full border border-[#F5F0F7] bg-[#F5F0F7] text-[#17213D] hover:bg-[#F2C5CF] transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[0.58rem] font-semibold uppercase tracking-[0.06em] text-[#667085]">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1 text-center">
                {monthDays.map(({ date, dayNumber, inMonth }, index) => {
                  const state = getCalendarDayState(date, {
                    lastPeriodDate,
                    cycleLength,
                    periodLength: cycleStats?.avgPeriodLength || 5,
                    nextPeriodDate,
                    pastPeriods: allPeriods
                  });

                  let cellClasses = 'flex h-6 items-center justify-center rounded-full text-[0.68rem] transition-all duration-150 hover:scale-110';

                  if (!inMonth) {
                    cellClasses += ' text-[#667085]/40';
                  } else {
                    cellClasses += ' text-[#17213D]';
                  }

                  if (state.isPeriodDay) {
                    cellClasses += ' bg-[#F2C5CF] text-[#17213D] font-semibold';
                  } else if (state.isOvulationDay) {
                    cellClasses += ' bg-[#C8B7E8] text-[#17213D] font-bold ring-2 ring-[#6B42A6] ring-offset-1';
                  } else if (state.isFertileDay) {
                    cellClasses += ' bg-[#C8B7E8] text-[#17213D] font-medium';
                  } else if (state.isPredictedPeriod) {
                    cellClasses += ' border-2 border-dashed border-[#E95A7A] bg-[#FFA6B7]/30 text-[#17213D] font-bold';
                  }

                  if (state.isToday) {
                    cellClasses += ' ring-2 ring-[#17213D] font-black shadow-sm';
                  }

                  return (
                    <div
                      key={`${date.toDateString()}-${index}`}
                      className={cellClasses}
                    >
                      {dayNumber}
                    </div>
                  );
                })}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.58rem] font-medium text-[#667085]">
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#F2C5CF]" />Period</div>
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#C8B7E8]" />Fertile</div>
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#C8B7E8] ring-1 ring-[#6B42A6]" />Ovulation</div>
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full border border-dashed border-[#E95A7A] bg-[#FFA6B7]/40" />Predicted</div>
                <div className="flex items-center gap-1"><span className="h-2 w-2 rounded-full border-2 border-[#17213D]" />Today</div>
              </div>
            </motion.section>
          </div>

          {/* Second Row: Recent Cycle Insights | Appointment Bookings | AI Chatbot */}
          <div className="grid min-h-0 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Card 4: Recent Cycle Insights */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="flex flex-col justify-between rounded-[18px] border border-[#F5F0F7] bg-[#FFFDFC] p-2.5 shadow-[0_12px_24px_rgba(23,33,61,0.03)] hover:shadow-[0_16px_30px_rgba(23,33,61,0.06)] transition-all duration-200"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[0.92rem] font-black tracking-[-0.03em] text-[#17213D]">Recent Cycle Insights</div>
                <button onClick={() => navigate('/log-cycle')} className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#667085] hover:text-[#17213D]">View all</button>
              </div>

              <div className="grid gap-1.5 sm:grid-cols-3 flex-1">
                <div className="rounded-[14px] bg-[#F5F0F7] p-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[0.65rem] text-[#17213D]">
                    <span className="flex items-center gap-1"><CalendarRange className="h-3 w-3 text-[#C89B7B]" /> Avg Cycle</span>
                    <span className="text-[0.52rem] font-bold uppercase tracking-wider text-[#17213D]/70 bg-[#FFFDFC] px-1.5 py-0.5 rounded-full">
                      {cycleStats?.totalCycles ? `${cycleStats.totalCycles} logged` : '28d Avg'}
                    </span>
                  </div>
                  <div className="my-0.5 text-base font-black tracking-[-0.04em] text-[#17213D]">{healthSummary.avgCycle}</div>
                  {/* Mini cycle progress bar */}
                  <div className="w-full bg-[#FFFDFC] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#C89B7B] h-full rounded-full" style={{ width: `${Math.min(((cycleDay || 14) / cycleLength) * 100, 100)}%` }} />
                  </div>
                </div>

                <div className="rounded-[14px] bg-[#FFF5F7] border border-[#F2C5CF]/60 p-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[0.65rem] text-[#17213D]">
                    <span className="flex items-center gap-1 font-semibold text-[#E95A7A]">
                      <Sparkles className="h-3 w-3 text-[#E95A7A]" /> Next Period
                    </span>
                    <span className="text-[0.52rem] font-bold uppercase tracking-wider text-[#E95A7A] bg-[#FFFDFC] px-1.5 py-0.5 rounded-full border border-[#F2C5CF]">
                      {predictedCycle?.modelUsed === 'xgboost_pipeline' ? 'AI Model' : 'Estimated'}
                    </span>
                  </div>
                  <div className="my-0.5 text-base font-black tracking-[-0.04em] text-[#17213D]">
                    {formattedPredictedDate}
                  </div>
                  <div className="text-[0.58rem] font-semibold text-[#667085] flex items-center justify-between">
                    <span>{predictedDaysUntilText}</span>
                    {predictedCycle?.cycleStatus && (
                      <span className="text-[#E95A7A] font-bold text-[0.52rem]">{predictedCycle.cycleStatus}</span>
                    )}
                  </div>
                </div>

                <div className="rounded-[14px] bg-[#F5F0F7] p-2 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[0.65rem] text-[#17213D]">
                    <span className="flex items-center gap-1"><Activity className="h-3 w-3 text-[#3B72AF]" /> Current Phase</span>
                  </div>
                  <div className="my-0.5 text-base font-black tracking-[-0.04em] text-[#17213D]">{phaseMeta.phaseName}</div>
                  <div className="text-[0.58rem] text-[#667085] truncate">{phaseMeta.message}</div>
                </div>

                <div className="rounded-[14px] border border-[#F5F0F7] bg-[#FFFDFC] p-2 sm:col-span-3">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[0.65rem] text-[#17213D]">
                      <HeartPulse className="h-3 w-3 text-[#E95A7A]" /> Latest Log
                    </div>
                    {(healthSummary.hasFlow || healthSummary.hasSymptoms || healthSummary.hasMood || healthSummary.hasPain) && (
                      <span className="text-[0.52rem] font-bold uppercase tracking-wider text-[#17213D] bg-[#F2C5CF] px-2 py-0.5 rounded-full">Logged</span>
                    )}
                  </div>

                  {/* No data at all */}
                  {!healthSummary.hasFlow && !healthSummary.hasSymptoms && !healthSummary.hasMood && !healthSummary.hasPain && (
                    <div className="text-[0.6rem] text-[#667085] mt-0.5">No cycle data logged yet</div>
                  )}

                  {/* Flow */}
                  {healthSummary.hasFlow && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[0.55rem] font-bold uppercase tracking-wider text-[#667085] w-10 shrink-0">Flow</span>
                      <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-[#F2C5CF]/60 text-[#17213D]">
                        {healthSummary.flow}
                      </span>
                    </div>
                  )}

                  {/* Symptoms */}
                  {healthSummary.hasSymptoms && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <span className="text-[0.55rem] font-bold uppercase tracking-wider text-[#667085] w-10 shrink-0 pt-0.5">Symp</span>
                      <div className="flex flex-wrap gap-1">
                        {healthSummary.symptomNames.map(s => (
                          <span key={s} className="text-[0.55rem] font-semibold px-1.5 py-0.5 rounded-full bg-[#F5F0F7] text-[#17213D] border border-[#E8E0F0]">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mood */}
                  {healthSummary.hasMood && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[0.55rem] font-bold uppercase tracking-wider text-[#667085] w-10 shrink-0">Mood</span>
                      <div className="flex flex-wrap gap-1">
                        {healthSummary.moodNames.map(m => (
                          <span key={m} className="text-[0.55rem] font-semibold px-1.5 py-0.5 rounded-full bg-[#C8B7E8]/40 text-[#17213D]">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pain */}
                  {healthSummary.hasPain && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[0.55rem] font-bold uppercase tracking-wider text-[#667085] w-10 shrink-0">Pain</span>
                      <span className="text-[0.62rem] font-bold px-2 py-0.5 rounded-full bg-[#F5D7CF]/60 text-[#17213D]">
                        {healthSummary.pain}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Card 5: Appointment Bookings */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="flex flex-col justify-between rounded-[18px] border border-[#F5F0F7] bg-[#FFFDFC] p-2.5 shadow-[0_12px_24px_rgba(23,33,61,0.03)] hover:shadow-[0_16px_30px_rgba(23,33,61,0.06)] transition-all duration-200"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[0.92rem] font-black tracking-[-0.03em] text-[#17213D]">Appointment Bookings</div>
                <button onClick={() => navigate('/find-care')} className="text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[#667085] hover:text-[#17213D]">View all</button>
              </div>

              <div className="rounded-[14px] bg-[#F5F0F7] p-2 flex-1 flex items-center border border-[#F5F0F7]">
                {bookingDetails ? (
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[0.68rem] font-bold text-[#17213D]"><Stethoscope className="h-3 w-3 text-[#3B72AF]" />{bookingDetails.doctor}</div>
                      <div className="text-[0.62rem] text-[#667085]">{bookingDetails.hospital}</div>
                      <div className="flex items-center gap-2 text-[0.62rem] text-[#667085]">
                        <span className="flex items-center gap-0.5"><CalendarDays className="h-2.5 w-2.5 text-[#17213D]" />{bookingDetails.date}</span>
                        <span className="flex items-center gap-0.5"><Clock3 className="h-2.5 w-2.5 text-[#17213D]" />{bookingDetails.slot}</span>
                      </div>
                    </div>
                    <div className="rounded-full bg-[#D9E7F4] px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.12em] text-[#17213D]">Booked</div>
                  </div>
                ) : (
                  <div className="text-[0.65rem] text-[#667085]">No upcoming appointments. Book a consultation when needed.</div>
                )}
              </div>

              <button onClick={() => navigate('/find-care')} className="mt-1.5 inline-flex items-center justify-center gap-1 rounded-full bg-[#17213D] px-3 py-1 text-[0.65rem] font-semibold text-[#FFFDFC] hover:bg-[#17213D]/90 transition-all shadow-sm">
                Book now <ArrowRight className="h-3 w-3" />
              </button>
            </motion.section>

            {/* Card 6: AI Chatbot */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -2 }}
              className="flex flex-col justify-between rounded-[18px] border border-[#F5F0F7] bg-[#FFFDFC] p-2.5 shadow-[0_12px_24px_rgba(23,33,61,0.03)] hover:shadow-[0_16px_30px_rgba(23,33,61,0.06)] transition-all duration-200 md:col-span-2 lg:col-span-1"
            >
              <ChatBot
                compact={true}
                cycleContext={{
                  cycleLength,
                  cycleDay: cycleDay || 1,
                  phase: phaseMeta.phaseName,
                  lastPeriod: lastPeriodDate ? lastPeriodDate.toISOString() : null,
                  symptoms: healthSummary.symptomNames,
                  flow: healthSummary.flow || 'not logged',
                  mood: healthSummary.moodNames,
                  pain: healthSummary.pain || 'not logged',
                }}
                onNavigateToFull={(conversation) => {
                  navigate('/chat', {
                    state: {
                      openAITab: true,
                      conversation,
                    },
                  });
                }}
                className="h-full"
              />
            </motion.section>
          </div>

          {/* Third Row: AI Health Assessment Report | Something Worth Noticing */}
          <div className="grid min-h-0 gap-2.5 md:grid-cols-3 lg:grid-cols-[1.5fr_0.9fr]">
            
            {/* Card 7: AI Health Assessment Report */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -2 }}
              className="flex flex-col justify-between rounded-[18px] border border-[#F5F0F7] bg-[#FFFDFC] p-2.5 shadow-[0_12px_24px_rgba(23,33,61,0.03)] hover:shadow-[0_16px_30px_rgba(23,33,61,0.06)] transition-all duration-200 md:col-span-2 lg:col-span-1"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[0.92rem] font-black tracking-[-0.03em] text-[#17213D]">AI Health Assessment Report</div>
                <button onClick={() => navigate('/assessment')} className="rounded-full bg-[#F5F0F7] px-2 py-0.5 text-[0.54rem] font-bold uppercase tracking-[0.1em] text-[#17213D] hover:bg-[#C8B7E8]/30 transition-colors">View report</button>
              </div>

              <div className="grid gap-1.5 grid-cols-2 sm:grid-cols-4">
                {[
                  {
                    label: 'Flow',
                    value: healthSummary.hasFlow ? healthSummary.flow : '—',
                    status: healthSummary.hasFlow ? 'Logged' : 'Not logged',
                    pct: healthSummary.hasFlow
                      ? ({ Light: 25, Medium: 50, Heavy: 80, Spotting: 15 }[healthSummary.flow] ?? 50)
                      : 0,
                    color: '#F2C5CF',
                  },
                  {
                    label: 'Mood',
                    value: healthSummary.hasMood ? healthSummary.moodNames[0] : '—',
                    status: healthSummary.hasMood ? healthSummary.moodNames.join(', ') : 'Not logged',
                    pct: healthSummary.hasMood ? 75 : 0,
                    color: '#C8B7E8',
                  },
                  {
                    label: 'Pain',
                    value: healthSummary.hasPain ? healthSummary.pain : '—',
                    status: healthSummary.hasPain ? 'Logged' : 'Not logged',
                    pct: healthSummary.hasPain
                      ? ({ None: 0, Mild: 25, Moderate: 60, Severe: 95 }[healthSummary.pain] ?? 50)
                      : 0,
                    color: '#F5D7CF',
                  },
                  {
                    label: 'Symptoms',
                    value: healthSummary.hasSymptoms ? `${healthSummary.symptomNames.length}` : '—',
                    status: healthSummary.hasSymptoms ? healthSummary.symptomNames.slice(0, 2).join(', ') : 'None logged',
                    pct: healthSummary.hasSymptoms ? Math.min(healthSummary.symptomNames.length * 20, 100) : 0,
                    color: '#D9E7F4',
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-[12px] bg-[#F5F0F7] p-1.5 text-center flex flex-col justify-between">
                    <div>
                      <div className="text-[0.52rem] uppercase tracking-[0.12em] text-[#667085]">{item.label}</div>
                      <div className="mt-0.5 text-sm font-black tracking-[-0.04em] text-[#17213D]">{item.value}</div>
                    </div>
                    <div className="mt-1">
                      <div className="w-full bg-[#FFFDFC] h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                      </div>
                      <div className="text-[0.52rem] font-semibold text-[#667085] truncate">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Card 8: Something Worth Noticing (Editorial Card - Clickable) */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              whileHover={{ y: -2 }}
              onClick={() => setShowInsightsModal(true)}
              className="flex flex-col justify-between rounded-[18px] border border-[#F5F0F7] bg-[#FFFDFC] p-2.5 shadow-[0_12px_24px_rgba(23,33,61,0.03)] hover:shadow-[0_16px_30px_rgba(23,33,61,0.06)] cursor-pointer transition-all duration-200 md:col-span-1 group"
              title="Click to view verified health insights"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[0.92rem] font-black tracking-[-0.03em] text-[#17213D] group-hover:text-[#3B72AF] transition-colors">Something Worth Noticing</div>
                <span className="flex items-center gap-1 text-[0.52rem] font-bold uppercase tracking-wider text-[#3B72AF] bg-[#D9E7F4] px-2 py-0.5 rounded-full">Tap to view</span>
              </div>
              <div className="flex gap-2 rounded-[14px] bg-[#F5F0F7] p-2 flex-1 items-center border border-[#F5F0F7] group-hover:bg-[#F5F0F7]/90 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#D9E7F4] text-[#17213D] shadow-sm">
                  <Sparkles className="h-4 w-4 text-[#3B72AF]" />
                </div>
                <div>
                  <div className="text-[0.68rem] font-black text-[#17213D]">Iron levels impact energy & mood.</div>
                  <div className="text-[0.58rem] text-[#667085] line-clamp-2">Consider iron-rich foods like spinach, lentils and beans. Educational info, not diagnosis.</div>
                  <div className="text-[0.52rem] font-bold uppercase tracking-[0.1em] text-[#3B72AF] mt-0.5 flex items-center gap-1">
                    <span>Source: WHO & NHS</span>
                    <span>• 5 Verified Insights</span>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

      {/* Verified Health Insights Modal */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17213D]/40 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[24px] border border-[#F5F0F7] bg-[#FFFDFC] p-5 shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F5F0F7] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D9E7F4] text-[#17213D]">
                  <Sparkles className="h-5 w-5 text-[#3B72AF]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#17213D]">Verified Health & Clinical Insights</h3>
                  <p className="text-[0.72rem] text-[#667085]">Evidence-based reproductive wellness guidelines</p>
                </div>
              </div>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F0F7] text-[#17213D] hover:bg-[#F2C5CF] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-3 space-y-3 overflow-y-auto pr-1 flex-1">
              {[
                {
                  title: 'Iron & Hemoglobin Optimization',
                  category: 'Menstrual Phase Nutrition',
                  content: 'Iron loss during menstruation can cause low energy and brain fog. Consuming heme-iron (poultry, fish) or non-heme iron (spinach, lentils) paired with Vitamin C improves absorption by up to 300%.',
                  source: 'World Health Organization (WHO) & NHS Guidelines',
                  badge: 'Nutrition',
                  color: '#F2C5CF',
                },
                {
                  title: 'Magnesium for Cramp & Muscle Recovery',
                  category: 'Luteal Phase Wellness',
                  content: 'Magnesium glycinate (300mg/day) relaxes uterine smooth muscle, reducing prostaglandins that trigger cramping and premenstrual mood fluctuations.',
                  source: 'American College of Obstetricians and Gynecologists (ACOG)',
                  badge: 'Recovery',
                  color: '#C8B7E8',
                },
                {
                  title: 'Hydration & Cervical Mucus Consistency',
                  category: 'Ovulation & Fertility',
                  content: 'Adequate hydration (2.5L daily) maintains optimal cervical fluid viscosity required for sperm motility during the fertile window.',
                  source: 'Mayo Clinic Women’s Health Research',
                  badge: 'Fertility',
                  color: '#D9E7F4',
                },
                {
                  title: 'Sleep Hygiene & Progesterone Synthesis',
                  category: 'Hormonal Stabilization',
                  content: 'Deep slow-wave sleep (7–9 hours) regulates luteinizing hormone (LH) pulses and supports corpus luteum progesterone production.',
                  source: 'National Sleep Foundation & NHS Trust',
                  badge: 'Sleep',
                  color: '#F5D7CF',
                },
                {
                  title: 'Phytoestrogens & Seed Cycling',
                  category: 'Follicular Phase Energy',
                  content: 'Flaxseeds and pumpkin seeds contain lignans and zinc that assist hepatic metabolism of excess estrogen, supporting steady energy levels.',
                  source: 'Harvard T.H. Chan School of Public Health',
                  badge: 'Hormones',
                  color: '#F5F0F7',
                },
              ].map((item, idx) => (
                <div key={idx} className="rounded-[16px] border border-[#F5F0F7] bg-[#F5F0F7]/40 p-3.5 space-y-1.5 hover:bg-[#F5F0F7]/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.62rem] font-bold uppercase tracking-wider text-[#17213D]" style={{ color: '#17213D' }}>
                      {item.category}
                    </span>
                    <span className="text-[0.55rem] font-bold uppercase tracking-wider text-[#17213D] px-2 py-0.5 rounded-full" style={{ backgroundColor: item.color }}>
                      {item.badge}
                    </span>
                  </div>
                  <h4 className="text-[0.9rem] font-bold text-[#17213D]">{item.title}</h4>
                  <p className="text-[0.78rem] text-[#667085] leading-relaxed">{item.content}</p>
                  <div className="text-[0.62rem] font-semibold text-[#3B72AF] pt-1">
                    ✓ Verified Source: {item.source}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 flex items-center justify-between border-t border-[#F5F0F7] pt-3">
              <span className="text-[0.65rem] text-[#667085]">Educational reference only • Consult your physician for medical advice</span>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="rounded-full bg-[#17213D] px-4 py-1.5 text-xs font-semibold text-[#FFFDFC] hover:bg-[#17213D]/90 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Emergency Support Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17213D]/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-lg rounded-[24px] border border-[#F2C5CF] bg-[#FFFDFC] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#F5F0F7] pb-3">
              <div className="flex items-center gap-2 text-[#E95A7A]">
                <AlertTriangle className="h-6 w-6" />
                <h3 className="text-xl font-black text-[#17213D]">24/7 Emergency Support</h3>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F0F7] text-[#17213D] hover:bg-[#F2C5CF]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#667085]">
              If you are experiencing severe pain, excessive bleeding, or a medical crisis, connect immediately with emergency services or your healthcare provider.
            </p>

            <div className="space-y-2.5">
              <a
                href="tel:1091"
                className="flex items-center justify-between rounded-[16px] bg-[#F2C5CF]/40 p-3.5 border border-[#F2C5CF] hover:bg-[#F2C5CF] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E95A7A] text-[#FFFDFC]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#17213D]">Women’s Helpline (India)</div>
                    <div className="text-xs text-[#667085]">24/7 Toll-Free Emergency Support</div>
                  </div>
                </div>
                <span className="text-sm font-black text-[#E95A7A]">1091</span>
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between rounded-[16px] bg-[#D9E7F4]/50 p-3.5 border border-[#D9E7F4] hover:bg-[#D9E7F4] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3B72AF] text-[#FFFDFC]">
                    <Ambulance className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#17213D]">Medical Emergency & Ambulance</div>
                    <div className="text-xs text-[#667085]">Immediate Hospital Dispatch</div>
                  </div>
                </div>
                <span className="text-sm font-black text-[#3B72AF]">108</span>
              </a>

              <a
                href="tel:112"
                className="flex items-center justify-between rounded-[16px] bg-[#C8B7E8]/40 p-3.5 border border-[#C8B7E8] hover:bg-[#C8B7E8] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6B42A6] text-[#FFFDFC]">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#17213D]">National Emergency Number</div>
                    <div className="text-xs text-[#667085]">All Emergency Response Services</div>
                  </div>
                </div>
                <span className="text-sm font-black text-[#6B42A6]">112</span>
              </a>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="rounded-full bg-[#17213D] px-6 py-2 text-xs font-bold text-[#FFFDFC] hover:bg-[#17213D]/90"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
