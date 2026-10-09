import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, AlertCircle, AlertTriangle, Apple, Bookmark, BookOpen, CalendarDays,
  Check, CheckCircle2, ChevronRight, Droplets, Heart, HeartPulse,
  Info, LockKeyhole, MapPin, MessageSquareText, Shield, ShieldAlert, ShieldCheck,
  Sparkles, Syringe, Users, X, Zap,
} from 'lucide-react';
import { CATEGORIES, CONDITIONS } from '../data/awarenessData';
import pcosIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_27_00 PM.png';
import breastCancerIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_27_41 PM.png';
import cervicalCancerIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_29_37 PM (1).png';
import endometriosisIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_31_20 PM.png';
import thyroidIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_32_11 PM.png';
import womanReadingIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_36_18 PM.png';
import womanMeditatingIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_37_34 PM.png';
import anemiaIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_44_00 PM.png';
import pidIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_45_53 PM.png';
import fibroidsIllustration from '../assets/ChatGPT Image Sep 24, 2026, 12_47_35 PM.png';
import {
  USERS_FAVORITES_ARTICLES as USERS_FAVORITES_TOOLS,
  LATE_PERIODS_ARTICLES as LATE_PERIODS_TOOLS,
  SYNC_CYCLE_ARTICLES as SYNC_CYCLE_TOOLS,
  FEMCARE_RECOMMENDATIONS_ARTICLES as FEMCARE_RECOMMENDATIONS_TOOLS,
} from '../data/awarenessArticlesData';
import {
  REPRODUCTIVE_HEALTH_101_ARTICLES as REPRODUCTIVE_TOOLS,
  PRE_PERIOD_DAYS_ARTICLES as PRE_PERIOD_TOOLS,
  LATEST_ARTICLES as LATEST_TOOLS,
} from '../data/reproductivePrePeriodLatestData';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../lib/api';

const ICONS = {
  Activity, AlertCircle, AlertTriangle, Apple, BookOpen, CalendarDays, Check,
  CheckCircle2, Droplets, Heart, HeartPulse, Shield, ShieldAlert, ShieldCheck,
  Sparkles, Syringe, Users, Zap, MessageSquareText,
};

const CONDITION_OVERVIEW = [
  { id: 'pcos', copy: 'A hormonal disorder affecting ovulation.', illustration: pcosIllustration },
  { id: 'breast-cancer', copy: 'Early detection can save lives.', illustration: breastCancerIllustration },
  { id: 'cervical-cancer', copy: 'Preventable with HPV vaccine & screening.', illustration: cervicalCancerIllustration },
  { id: 'endometriosis', copy: 'Occurs when tissue like the uterus grows outside it.', illustration: endometriosisIllustration },
  { id: 'thyroid', copy: 'Affects metabolism and energy levels.', illustration: thyroidIllustration },
  { id: 'anemia', copy: 'Low iron levels can contribute to tiredness and weakness.', illustration: anemiaIllustration },
  { id: 'pid', copy: 'An infection affecting the female reproductive organs.', illustration: pidIllustration },
  { id: 'fibroids', copy: 'Non-cancerous growths that develop in or around the uterus.', illustration: fibroidsIllustration },
];

const CONDITION_ILLUSTRATIONS = Object.fromEntries(CONDITION_OVERVIEW.map(item => [item.id, item.illustration]));
const CONDITION_DETAIL_ILLUSTRATIONS = {
  anemia: { src: anemiaIllustration, alt: 'Illustration for anemia awareness' },
  pid: { src: pidIllustration, alt: 'Illustration for pelvic inflammatory disease awareness' },
  fibroids: { src: fibroidsIllustration, alt: 'Illustration showing uterine fibroids' },
};

const QUICK_TIPS = [
  { icon: 'Heart', text: 'Do self-breast exams monthly.' },
  { icon: 'Apple', text: 'Eat a balanced diet and stay active.' },
  { icon: 'Activity', text: 'Manage stress and get enough sleep.' },
  { icon: 'CalendarDays', text: 'Get regular screenings based on your age.' },
];

const WHY_ITEMS = [
  { icon: 'Heart', text: 'Early detection improves treatment outcomes.' },
  { icon: 'ShieldCheck', text: 'Regular check-ups can prevent complications.' },
  { icon: 'Users', text: 'Stay informed. Stay empowered.' },
];

function Icon({ name, className = '' }) {
  const Component = ICONS[name] || Activity;
  return <Component className={className} aria-hidden="true" />;
}

function ConditionCard({ condition, detail, onOpen, saved, onSave, isLocked }) {
  const CardIcon = ICONS[detail.icon] || HeartPulse;
  const illustration = detail.illustration || CONDITION_ILLUSTRATIONS[condition.id];
  return (
    <article className="flex h-[276px] min-w-0 flex-col items-center border-r border-[#F1F1F4] px-3 py-1.5 text-center last:border-r-0">
      <button
        type="button"
        onClick={() => onOpen(condition)}
        className="mb-1 flex h-[144px] w-full items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#A6A0CF]"
        aria-label={`Learn about ${condition.shortName}`}
      >
        {illustration
          ? <img src={illustration} alt="" className="h-[136px] w-[136px] object-contain" />
          : <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full" style={{ backgroundColor: detail.bg }}><CardIcon className="h-[38px] w-[38px]" strokeWidth={1.45} style={{ color: detail.color }} aria-hidden="true" /></span>}
      </button>
      <h3 className="min-h-[22px] text-[12px] font-semibold leading-5 text-[#364155]">{condition.shortName}</h3>
      <p className="mt-1 line-clamp-2 min-h-[40px] max-w-[160px] text-[10.5px] leading-[1.45] text-[#7A8495]">{detail.copy}</p>
      <div className="mt-auto flex w-full items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onOpen(condition)}
          className="inline-flex items-center gap-1 rounded-sm bg-[#F0F0F4] px-3 py-1.5 text-[10px] font-medium text-[#777A9D] hover:bg-[#E9E7F2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#AAA3CF]"
        >
          Learn More
          {isLocked && <LockKeyhole className="h-2.5 w-2.5 text-[#888AAB]" />}
        </button>
        <button
          type="button"
          onClick={() => onSave(condition)}
          title={saved ? 'Remove saved condition' : 'Save condition'}
          aria-label={saved ? `Remove ${condition.shortName} from saved` : `Save ${condition.shortName}`}
          className="rounded p-1 text-[#9294A8] hover:bg-[#F2F0F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#AAA3CF]"
        >
          <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-[#8B86B6] text-[#8B86B6]' : ''}`} />
        </button>
      </div>
    </article>
  );
}

function SectionTitle({ children, action, onAction }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#4A5568]">{children}</h2>
      {action && (
        <button type="button" onClick={onAction} className="shrink-0 text-[10px] font-medium text-[#777A9D] hover:text-[#59557F]">
          {action} <ChevronRight className="ml-0.5 inline h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function EditorialCardRow({ tools, onSelect, hasActivePremium }) {
  return (
    <div className="flex w-full flex-nowrap gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth">
      {tools.map(tool => (
        <button
          key={tool.id}
          type="button"
          aria-label={tool.title}
          onClick={() => onSelect(tool)}
          className="group relative h-[300px] w-[230px] flex-none shrink-0 overflow-hidden rounded-2xl border border-[#ECECF0] bg-[#F7F5F7] p-0 text-left shadow-sm transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#AAA6C8]"
        >
          {tool.image ? (
            <img
              src={tool.image}
              alt={tool.alt || tool.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F1EFF5] px-4 text-center">
              <span className="text-xs font-semibold text-[#8583AF]">Image to be added</span>
            </div>
          )}
          {!hasActivePremium && (
            <span
              className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white shadow backdrop-blur-sm"
              title="Premium Clinical Guide"
              aria-label="Premium content"
            >
              <LockKeyhole className="h-3.5 w-3.5 text-white/90" />
            </span>
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 via-black/40 to-transparent"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-left text-base font-semibold leading-snug text-white drop-shadow">
            {tool.title}
          </span>
        </button>
      ))}
    </div>
  );
}

function DetailModal({ condition, onClose, onAskAI, onFindCare, saved, onSave }) {
  if (!condition) return null;
  const detailIllustration = CONDITION_DETAIL_ILLUSTRATIONS[condition.id];
  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-[#20273A]/35 p-4 backdrop-blur-[2px]"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="my-8 w-full max-w-2xl overflow-hidden rounded-xl border border-[#E8E8EE] bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={condition.name}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#EEEEF2] px-5 py-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8988A6]">
              {condition.tagText}
            </div>
            <h2 className="mt-1 text-xl font-semibold text-[#364155]">{condition.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="rounded-full p-2 text-[#7B8190] hover:bg-[#F3F3F6]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-start gap-2 bg-[#F4F6FA] px-5 py-3 text-xs leading-relaxed text-[#5F6D82]">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#7888A7]" />
          <p>
            <strong>Educational information only.</strong> A qualified healthcare professional can diagnose this condition.
          </p>
        </div>

        {detailIllustration && (
          <div className="flex justify-center border-b border-[#EEEEF2] bg-[#FFFDFE] px-5 py-3">
            <img
              src={detailIllustration.src}
              alt={detailIllustration.alt}
              className="max-h-40 w-full max-w-md object-contain"
            />
          </div>
        )}

        <div className="max-h-[55vh] space-y-4 overflow-y-auto px-5 py-4 text-[13px] leading-relaxed text-[#697486]">
          {condition.what && (
            <section>
              <h3 className="mb-1 font-semibold text-[#404B60]">Overview</h3>
              <p>{condition.what}</p>
            </section>
          )}

          {condition.riskFactors && (
            <section>
              <h3 className="mb-1 font-semibold text-[#404B60]">Risk Factors</h3>
              {Array.isArray(condition.riskFactors) ? (
                <ul className="list-disc space-y-1 pl-5">
                  {condition.riskFactors.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p>{condition.riskFactors}</p>
              )}
            </section>
          )}

          {condition.symptoms?.length > 0 && (
            <section>
              <h3 className="mb-1 font-semibold text-[#404B60]">Symptoms &amp; Signs</h3>
              <ul className="list-disc space-y-1 pl-5">
                {condition.symptoms.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          )}

          {condition.prevention && (
            <section>
              <h3 className="mb-1 font-semibold text-[#404B60]">Prevention / Management</h3>
              {Array.isArray(condition.prevention) ? (
                <ul className="list-disc space-y-1 pl-5">
                  {condition.prevention.map(x => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p>{condition.prevention}</p>
              )}
            </section>
          )}

          {condition.screening && (
            <section>
              <h3 className="mb-1 font-semibold text-[#404B60]">Screening &amp; Tests</h3>
              <p>{condition.screening}</p>
            </section>
          )}

          {condition.treatment && (
            <section>
              <h3 className="mb-1 font-semibold text-[#404B60]">Treatment Overview</h3>
              <p>{condition.treatment}</p>
            </section>
          )}

          {condition.whenToSeeDoctor && (
            <section>
              <h3 className="mb-1 font-semibold text-[#404B60]">When to See a Doctor</h3>
              <p>{condition.whenToSeeDoctor}</p>
            </section>
          )}

          {condition.warningSigns?.length > 0 && (
            <section className="rounded-lg border border-[#F1DCDC] bg-[#FFF8F8] p-3">
              <h3 className="mb-1 font-semibold text-[#995F69]">Warning Signs</h3>
              <ul className="list-disc space-y-1 pl-5">
                {condition.warningSigns.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
          )}

          {condition.guides?.length > 0 && (
            <section>
              <h3 className="mb-1 font-semibold text-[#404B60]">Relevant Guides</h3>
              <div className="space-y-2">
                {condition.guides.map(guide => (
                  <div key={guide.title} className="rounded-md border border-[#E8E8EE] bg-[#F9F9FB] p-3">
                    <p className="font-semibold text-xs text-[#404B60]">{guide.title}</p>
                    <p className="mt-0.5 text-[11px] text-[#697486]">{guide.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#EEEEF2] px-5 py-3">
          <button
            type="button"
            onClick={() => onAskAI(condition)}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#7E7CA8] px-3 py-2 text-xs font-semibold text-white hover:bg-[#6F6D98]"
          >
            <MessageSquareText className="h-3.5 w-3.5" /> Ask FEMCARE AI
          </button>
          <button
            type="button"
            onClick={onFindCare}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E2EA] px-3 py-2 text-xs font-medium text-[#596477] hover:bg-[#F7F7FA]"
          >
            <MapPin className="h-3.5 w-3.5" /> Find Care
          </button>
          <button
            type="button"
            onClick={() => onSave(condition)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E2EA] px-3 py-2 text-xs font-medium text-[#596477] hover:bg-[#F7F7FA]"
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-[#8580AD]' : ''}`} /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Awareness() {
  const navigate = useNavigate();
  const { user, refreshSubscription } = useAuth();

  useEffect(() => {
    refreshSubscription?.();
  }, [refreshSubscription]);

  const hasActivePremium = Boolean(
    user?.is_premium &&
    (user?.subscription === 'monthly' || user?.subscription === 'annual' || user?.subscriptionPlan) &&
    user?.subscriptionStatus !== 'expired' &&
    user?.subscriptionStatus !== 'cancelled' &&
    (!user?.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt).getTime() > Date.now())
  );
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [activeSide, setActiveSide] = useState('overview');
  const [savedIds, setSavedIds] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [showPlanPrompt, setShowPlanPrompt] = useState(false);

  const filtered = useMemo(() => {
    return CONDITIONS.filter(condition => {
      const categoryMatches = category === 'all' || condition.category === category;
      return categoryMatches;
    });
  }, [category]);

  const showAll = () => {
    setCategory('all');
    setActiveSide('all');
    document.getElementById('conditions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleSaved = condition =>
    setSavedIds(ids =>
      ids.includes(condition.id) ? ids.filter(id => id !== condition.id) : [...ids, condition.id]
    );

  const openConditionDetails = async condition => {
    if (!hasActivePremium) {
      setShowPlanPrompt(true);
      return;
    }
    // Verify server-side authorization as well
    try {
      const res = await fetch(`${API_BASE}/api/awareness/conditions/${condition.id}/details`, {
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) {
        setShowPlanPrompt(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSelected({ ...condition, ...(data.condition || {}) });
        return;
      }
    } catch (err) {
      console.warn('Backend condition details check error:', err);
    }
    setSelected(condition);
  };

  const handleAskAI = condition => {
    setSelected(null);
    navigate('/chat', {
      state: {
        openAITab: true,
        conversation: [
          {
            role: 'assistant',
            text: "Hi! I'm FEMCARE AI, your women's health assistant. I can help with questions about periods, menstrual cycles, symptoms, PCOS, fertility, and reproductive health.",
          },
          { role: 'user', text: `I'd like to learn more about ${condition.name}.` },
        ],
      },
    });
  };

  const shownOverview = (activeSide === 'all' || category !== 'all'
    ? [...filtered]
        .sort(
          (a, b) =>
            CONDITION_OVERVIEW.findIndex(item => item.id === a.id) -
            CONDITION_OVERVIEW.findIndex(item => item.id === b.id)
        )
        .map(condition => ({
          ...(CONDITION_OVERVIEW.find(item => item.id === condition.id) || {
            icon: condition.icon,
            color: condition.iconColor,
            bg: condition.iconBg,
            copy: condition.description,
            illustration: CONDITION_ILLUSTRATIONS[condition.id],
          }),
          condition,
        }))
    : CONDITION_OVERVIEW.map(item => ({
        ...item,
        condition: CONDITIONS.find(condition => condition.id === item.id),
      }))
  ).filter(item => item.condition);

  return (
    <div className="awareness-page mx-auto min-h-[calc(100vh-4.25rem)] w-full max-w-[1800px] bg-[#FFFDFC] px-3 py-3 text-[#3E4A5F] sm:px-4 lg:px-6">
      <main className="min-w-0 pb-2">
        {/* Header */}
        <div className="flex min-h-[81px] flex-wrap items-start justify-between gap-3 border-b border-[#E8E9EE] pb-3 pt-2">
          <div className="min-w-[220px] flex-1">
            <h2 className="text-[19px] font-semibold leading-6 tracking-[-0.02em] text-[#68758A]">
              Women's Health Awareness
            </h2>
            <p className="mt-1 text-[11px] text-[#A1A7B1]">
              Learn about common women's health conditions, prevention and early detection.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              aria-label="Close awareness"
              className="rounded p-1 text-[#A1A6B0] hover:bg-[#F1F1F4]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 1. Common Women's Health Conditions */}
        <section id="conditions" className="scroll-mt-4 pt-4">
          <SectionTitle action="View all" onAction={showAll}>
            Common Women's Health Conditions
          </SectionTitle>
          {activeSide === 'all' && (
            <div className="mb-2 flex flex-wrap gap-1">
              {CATEGORIES.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`rounded-sm px-2 py-1 text-[9px] ${
                    category === item.id
                      ? 'bg-[#ECEBF4] font-semibold text-[#74739A]'
                      : 'text-[#888F9B] hover:bg-[#F6F6F8]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
          <div className="relative">
            {shownOverview.length > 0 ? (
              <>
                <div
                  id="condition-card-track"
                  className="flex min-w-0 overflow-x-auto scroll-smooth rounded-sm border border-[#ECECF0] bg-white"
                >
                  {shownOverview.map(item => (
                    <div
                      key={item.id}
                      className="flex-[0_0_50%] border-r border-[#F1F1F4] sm:flex-[0_0_33.333%] lg:flex-[0_0_20%]"
                    >
                      <ConditionCard
                        condition={item.condition}
                        detail={item}
                        onOpen={openConditionDetails}
                        saved={savedIds.includes(item.id)}
                        onSave={toggleSaved}
                        isLocked={!hasActivePremium}
                      />
                    </div>
                  ))}
                </div>
                {shownOverview.length > 2 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('condition-card-track')?.scrollBy({ left: -360, behavior: 'smooth' })
                      }
                      aria-label="Previous conditions"
                      className="absolute -left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E8ED] bg-white text-[#8B91A0] shadow-sm hover:bg-[#F7F7F9]"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById('condition-card-track')?.scrollBy({ left: 360, behavior: 'smooth' })
                      }
                      aria-label="Next conditions"
                      className="absolute -right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7E8ED] bg-white text-[#8B91A0] shadow-sm hover:bg-[#F7F7F9]"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-md border border-[#ECECF0] bg-white px-4 py-8 text-center text-xs text-[#7D8796]">
                No matching conditions. Try another search.
              </div>
            )}
          </div>
        </section>

        {/* 2. Why Awareness Matters & Quick Tips */}
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.08fr_0.72fr]">
          <section className="min-h-[193px] rounded-sm border border-[#ECECF0] bg-white p-4">
            <SectionTitle action="View all" onAction={showAll}>
              Why Awareness Matters?
            </SectionTitle>
            <div className="space-y-2.5">
              {WHY_ITEMS.map(item => (
                <div key={item.text} className="flex items-center gap-3 text-[10.5px] text-[#858E9B]">
                  <span className="flex h-5 w-5 items-center justify-center text-[#9294B7]">
                    <Icon name={item.icon} className="h-[15px] w-[15px]" />
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={showAll}
              className="mt-3 inline-flex items-center gap-1 rounded-sm bg-[#F0F0F4] px-3 py-1.5 text-[10px] font-medium text-[#777A9D] hover:bg-[#E8E7F0]"
            >
              Explore All Topics <ChevronRight className="h-3 w-3" />
            </button>
          </section>

          <section className="relative min-h-[193px] overflow-hidden rounded-sm border border-[#ECECF0] bg-white p-4">
            <SectionTitle>Quick Tips for You</SectionTitle>
            <div className="relative z-10 w-[72%] space-y-2.5">
              {QUICK_TIPS.map(tip => (
                <div key={tip.text} className="flex items-center gap-2.5 text-[10px] text-[#858E9B]">
                  <Icon name={tip.icon} className="h-[13px] w-[13px] shrink-0 text-[#999ABB]" />
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
            <img
              src={womanMeditatingIllustration}
              alt="Illustration of a woman meditating"
              className="pointer-events-none absolute bottom-2 right-1 h-[136px] w-[110px] object-contain object-bottom sm:right-3 sm:w-[126px]"
            />
          </section>

          <section className="flex min-h-[193px] items-center justify-center overflow-hidden rounded-sm border border-[#ECECF0] bg-[#F5F5F8] p-3">
            <img
              src={womanReadingIllustration}
              alt="Knowledge is power. Stay informed, stay protected."
              className="h-full max-h-[170px] w-full object-contain"
            />
          </section>
        </div>

        {/* 3. Take Health Assessment */}
        <section className="mt-5 flex min-h-[67px] flex-wrap items-center justify-between gap-3 rounded-sm border border-[#E8E7F0] bg-[#F1F0F7] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#D7D5E6] text-[#8583AF]">
              <ShieldCheck className="h-6 w-6" strokeWidth={1.6} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#6F7B91]">Your health is your most valuable asset.</p>
              <p className="mt-0.5 text-[9.5px] text-[#969DA9]">Stay aware. Take action. Live healthier.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/assessment')}
            className="inline-flex h-[31px] items-center gap-2 rounded-sm bg-[#7779AD] px-3 text-[9.5px] font-medium text-white hover:bg-[#696B9F]"
          >
            Take Health Assessment <ChevronRight className="h-3 w-3" />
          </button>
        </section>
      </main>

      {/* 4. Reproductive Health 101 */}
      <section aria-label="Reproductive Health 101" className="mt-6 border-t border-[#E8E9EE] pt-5">
        <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[#4A5568]">
          Reproductive Health 101
        </h2>
        <EditorialCardRow tools={REPRODUCTIVE_TOOLS} onSelect={setSelectedTool} hasActivePremium={hasActivePremium} />
      </section>

      {/* 5. Your Pre-Period Days */}
      <section aria-label="Your Pre-Period Days" className="mt-6 border-t border-[#E8E9EE] pt-5">
        <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[#4A5568]">
          Your Pre-Period Days
        </h2>
        <EditorialCardRow tools={PRE_PERIOD_TOOLS} onSelect={setSelectedTool} hasActivePremium={hasActivePremium} />
      </section>

      {/* 6. Latest */}
      <section aria-label="Latest" className="mt-6 border-t border-[#E8E9EE] pt-5">
        <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[#4A5568]">
          Latest
        </h2>
        <EditorialCardRow tools={LATEST_TOOLS} onSelect={setSelectedTool} hasActivePremium={hasActivePremium} />
      </section>

      {/* 7. User's Favorites */}
      <section aria-label="User's Favorites" className="mt-6 border-t border-[#E8E9EE] pt-5">
        <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[#4A5568]">
          User's Favorites
        </h2>
        <EditorialCardRow tools={USERS_FAVORITES_TOOLS} onSelect={setSelectedTool} hasActivePremium={hasActivePremium} />
      </section>

      {/* 8. The Lowdown on Late Periods */}
      <section aria-label="The Lowdown on Late Periods" className="mt-6 border-t border-[#E8E9EE] pt-5">
        <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[#4A5568]">
          The Lowdown on Late Periods
        </h2>
        <EditorialCardRow tools={LATE_PERIODS_TOOLS} onSelect={setSelectedTool} hasActivePremium={hasActivePremium} />
      </section>

      {/* 9. Live in Sync With Your Cycle */}
      <section aria-label="Live in Sync With Your Cycle" className="mt-6 border-t border-[#E8E9EE] pt-5">
        <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[#4A5568]">
          Live in Sync With Your Cycle
        </h2>
        <EditorialCardRow tools={SYNC_CYCLE_TOOLS} onSelect={setSelectedTool} hasActivePremium={hasActivePremium} />
      </section>

      {/* 10. FemCare's Recommendations */}
      <section aria-label="FemCare's Recommendations" className="mt-6 border-t border-[#E8E9EE] pt-5">
        <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[#4A5568]">
          FemCare's Recommendations
        </h2>
        <EditorialCardRow tools={FEMCARE_RECOMMENDATIONS_TOOLS} onSelect={setSelectedTool} hasActivePremium={hasActivePremium} />
      </section>

      {/* 7. Premium locked entry as appropriate */}
      {!hasActivePremium && (
        <section
          aria-label="FemCare Premium Access"
          className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E8E7F0] bg-[#F7F6FA] px-5 py-4"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#8583AF]">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-[#4A5568]">FemCare Premium Access</p>
              <p className="mt-0.5 text-[11px] text-[#858E9B]">
                Unlock detailed disease clinical guides, symptoms, risk factors, screening pathways, and personalized AI consultations.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/subscription')}
            className="rounded-md bg-[#7779AD] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#696B9F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#AAA6C8]"
          >
            Unlock Now
          </button>
        </section>
      )}

      {/* Condition Learn More Modal (Premium Gated) */}
      {selected && hasActivePremium && (
        <DetailModal
          condition={selected}
          onClose={() => setSelected(null)}
          onAskAI={handleAskAI}
          onFindCare={() => {
            setSelected(null);
            navigate('/find-care');
          }}
          saved={savedIds.includes(selected.id)}
          onSave={toggleSaved}
        />
      )}

      {/* Free User Prompt when clicking condition Learn More */}
      {showPlanPrompt && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#20273A]/35 p-4 backdrop-blur-[2px]"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowPlanPrompt(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-md rounded-xl border border-[#E8E8EE] bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="awareness-plan-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F1F8] text-[#8583AF]">
                  <LockKeyhole className="h-4 w-4" />
                </span>
                <div>
                  <h2 id="awareness-plan-title" className="text-base font-semibold text-[#364155]">
                    Unlock detailed health guides
                  </h2>
                  <p className="mt-2 text-[12px] leading-relaxed text-[#697486]">
                    Condition details, risk factors, screening pathways, and specialist guides are available with an active Premium plan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPlanPrompt(false)}
                aria-label="Close plan information"
                className="rounded-full p-2 text-[#7B8190] hover:bg-[#F3F3F6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPlanPrompt(false)}
                className="rounded-sm border border-[#E2E2EA] px-3 py-2 text-xs font-medium text-[#596477] hover:bg-[#F7F7FA]"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPlanPrompt(false);
                  navigate('/subscription');
                }}
                className="rounded-sm bg-[#7779AD] px-3 py-2 text-xs font-medium text-white hover:bg-[#696B9F]"
              >
                Unlock Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Educational Tool / Guide Viewer Modal */}
      {selectedTool && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-[#20273A]/35 p-4 backdrop-blur-[2px]"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelectedTool(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="my-8 w-full max-w-2xl overflow-hidden rounded-xl border border-[#E8E8EE] bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reproductive-tool-title"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#EEEEF2] px-6 py-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8988A6]">
                  {selectedTool.category || "Women's Health Guide"}
                </span>
                <h2 id="reproductive-tool-title" className="mt-0.5 text-lg font-semibold text-[#364155]">
                  {selectedTool.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTool(null)}
                aria-label="Close guide"
                className="rounded-full p-2 text-[#7B8190] hover:bg-[#F3F3F6]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedTool.image ? (
              <div className="flex max-h-[300px] justify-center overflow-hidden border-b border-[#F0F0F4] bg-[#FFFDFE] p-4">
                <img
                  src={selectedTool.image}
                  alt={selectedTool.alt || selectedTool.title}
                  className="max-h-[260px] w-auto max-w-full rounded-xl object-contain shadow-sm"
                />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center bg-[#F1EFF5] text-xs font-semibold text-[#8583AF]">
                Image to be added
              </div>
            )}

            <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5 text-[13px] leading-relaxed text-[#596477]">
              {/* Short introductory description - Free for all */}
              {selectedTool.description && (
                <div className="rounded-lg border border-[#E9E8F2] bg-[#F9F8FD] p-3.5 text-[12.5px] font-medium leading-relaxed text-[#4A476F]">
                  {selectedTool.description}
                </div>
              )}

              {/* Legacy guidance if description is absent */}
              {selectedTool.guidance && !selectedTool.description && (
                <p className="text-[12.5px] leading-relaxed text-[#596477]">{selectedTool.guidance}</p>
              )}

              {/* Restricted clinical details: only for active Premium users */}
              {hasActivePremium ? (
                <>
                  {/* Structured detailed content sections */}
                  {selectedTool.sections?.map((sec, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <h3 className="text-[13.5px] font-semibold text-[#364155]">{sec.heading}</h3>
                      <p className="text-[12.5px] leading-relaxed text-[#596477]">{sec.content}</p>
                      {sec.points && (
                        <ul className="list-disc space-y-1 pl-5 text-[12px] text-[#697486]">
                          {sec.points.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {/* When to consult a healthcare professional */}
                  {selectedTool.whenToSeeDoctor && (
                    <div className="rounded-lg border border-[#F1DCDC] bg-[#FFF8F8] p-3.5">
                      <h4 className="mb-1 text-xs font-semibold text-[#995F69]">When to Consult a Healthcare Professional</h4>
                      <p className="text-[12px] leading-relaxed text-[#8C5560]">{selectedTool.whenToSeeDoctor}</p>
                    </div>
                  )}

                  {/* Sources / References */}
                  {selectedTool.sources?.length > 0 && (
                    <div className="border-t border-[#EEEEF2] pt-4">
                      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#858E9B]">
                        Sources &amp; Clinical References
                      </h4>
                      <ul className="space-y-2 text-[11px] text-[#7E8898]">
                        {selectedTool.sources.map((src, sIdx) => (
                          <li key={sIdx} className="leading-relaxed">
                            <span className="font-semibold text-[#4A5568]">{src.org || src.authors}</span> ({src.year}) —{' '}
                            <em className="text-[#596477]">{src.title}</em>.
                            {src.doi && <span className="ml-1 text-[#8A94A6]">DOI: {src.doi}</span>}
                            {src.url && (
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1.5 inline-flex items-center gap-0.5 text-[#74739A] underline hover:text-[#525175]"
                              >
                                Source link
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                /* Locked-content state with upgrade prompt for free users */
                <div className="my-3 rounded-xl border border-[#E8E6F0] bg-gradient-to-br from-[#FAF8FC] to-[#F5F2F9] p-5 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#7779AD] shadow-sm">
                    <LockKeyhole className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-[14px] font-bold text-[#364155]">Premium Clinical Research Breakdown</h4>
                  <p className="mx-auto mt-1 max-w-sm text-[11.5px] leading-relaxed text-[#697486]">
                    Full clinical subsections, evidence-based management points, and peer-reviewed medical citations are reserved for FemCare Premium members.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTool(null);
                      navigate('/subscription');
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#7779AD] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#696B9F]"
                  >
                    Unlock with Premium <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Standard Educational Disclaimer */}
              <div className="rounded-md bg-[#F4F6FA] p-3 text-[10.5px] text-[#5F6D82]">
                <strong>Educational information only:</strong> This guide synthesizes peer-reviewed medical research and authoritative clinical guidelines from organizations including ACOG, NIH, and WHO. It is provided for educational purposes and does not substitute for personalized medical diagnosis or treatment from a qualified healthcare professional.
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Awareness;
