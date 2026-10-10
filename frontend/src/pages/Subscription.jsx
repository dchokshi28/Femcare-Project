import { CheckCircle2, Star, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../lib/api';

const MONTHLY_FEATURES = [
  'Cycle Tracking',
  'Health Insights',
  'Detailed Reproductive Health Information & Monitoring',
  'Health Assessment - 2 free quizzes, then continued access with plan',
  'Appointment Booking - 1 free appointment, then continued booking with plan',
  'Simple Cycle Insights',
  'Period Reminders & Notifications',
];

const ANNUAL_FEATURES = [
  'Cycle Tracking',
  'Health Insights',
  'Detailed Reproductive Health Information & Monitoring',
  'Health Assessment - 2 free quizzes, then continued access with plan',
  'Appointment Booking - 1 free appointment, then continued booking with plan',
  'Simple Cycle Insights',
  'Period Reminders & Notifications',
];

export const SubscriptionPlansSection = ({ onPlanActivated }) => {
  const { user, refreshSubscription } = useAuth();
  const isPaidActive = Boolean(
    user?.is_premium &&
    (!user?.subscriptionExpiresAt || new Date(user.subscriptionExpiresAt).getTime() > Date.now())
  );
  const currentPlan = isPaidActive ? (user?.subscriptionPlan || user?.subscription)?.toLowerCase() : null;
  const isMonthly = currentPlan === 'monthly';
  const isAnnual = currentPlan === 'annual';

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');

  const demoQrUrl = selectedPlan
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(`FEMCARE DEMO ONLY - NOT A REAL PAYMENT - ${selectedPlan.toUpperCase()}`)}`
    : '';

  const choosePlan = plan => {
    setSelectedPlan(plan);
    setCheckoutError('');
  };

  const payForPlan = async () => {
    if (!selectedPlan || processingPlan) return;
    const plan = selectedPlan;
    setProcessingPlan(plan);
    setCheckoutError('');
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/demo/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      if (!response.ok) throw new Error('Demo activation failed. Please try again.');
      const entitlement = await refreshSubscription();
      if (!entitlement) throw new Error('Premium access could not be refreshed. Please try again.');
      setSelectedPlan(null);
      if (onPlanActivated) onPlanActivated(plan);
    } catch {
      setCheckoutError('Demo activation failed. Please try again.');
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 py-12 md:p-8 animate-fade-in">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">Choose Your Health Journey</h1>
        <p className="text-lg text-gray-500">Unlock advanced insights and connect with verified medical professionals.</p>
      </div>

      {/* Subscription Status Indicator */}
      <div className="mx-auto mb-10 max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-center">
        <p className="text-xs uppercase font-bold tracking-wider text-gray-500">Your Current Status</p>
        <div className="mt-1 text-base font-bold text-gray-800">
          {isPaidActive ? (
            <span className="text-[#15965c] inline-flex items-center gap-1.5 justify-center">
              <CheckCircle2 className="h-4 w-4" />
              {isAnnual ? 'Annual Plan (Active)' : 'Monthly Plan (Active)'}
              {user?.subscriptionExpiresAt && (
                <span className="text-xs font-normal text-gray-500 ml-1">
                  · Valid until {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                </span>
              )}
            </span>
          ) : (
            <span className="text-gray-700">Free Plan · No Active Paid Subscription</span>
          )}
        </div>
      </div>


      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        {/* Monthly Plan */}
        <div className="relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          {isMonthly && (
            <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-3xl bg-gray-200 px-4 py-1 text-sm font-bold text-gray-700 shadow-sm">
              Current Plan
            </div>
          )}

          <h2 className="mb-2 text-2xl font-bold text-gray-800">Monthly Plan</h2>
          <div className="mb-6 flex items-baseline gap-2 text-gray-800">
            <span className="text-4xl font-extrabold">₹179</span>
            <span className="text-gray-500">/ month</span>
          </div>

          <ul className="mb-8 space-y-4">
            {MONTHLY_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gray-500" />
                <span className="font-semibold text-gray-800">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => choosePlan('monthly')}
            disabled={isMonthly || !!processingPlan}
            className={`w-full rounded-xl border-2 border-gray-300 py-3 px-4 font-bold text-gray-700 ${
              isMonthly ? 'cursor-default bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {isMonthly ? 'Current Plan' : 'Choose Monthly'}
          </button>
        </div>

        {/* Annual Plan */}
        <div className="relative transform rounded-3xl border border-deep-pink/30 bg-gradient-to-br from-soft-pink/30 to-soft-lavender/30 p-8 shadow-lg md:-translate-y-4">
          <div className="absolute -top-4 left-1/2 flex -translate-x-1/2 transform items-center gap-2 rounded-full bg-[#F472B6] px-6 py-2 text-sm font-black text-white shadow-lg ring-2 ring-white">
            <Star className="h-4 w-4 fill-white" /> Best Value
          </div>

          {isAnnual && (
            <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-3xl bg-[#F472B6] px-4 py-1 text-sm font-bold text-white shadow-sm">
              Current Plan
            </div>
          )}

          <h2 className="mb-2 text-2xl font-bold text-gray-800">Annual Plan</h2>
          <div className="mb-6 flex items-baseline gap-2 text-gray-800">
            <span className="text-4xl font-extrabold">₹1,299</span>
            <span className="text-gray-500">/ year</span>
          </div>
          <p className="-mt-4 mb-6 text-gray-500">Save more with annual billing</p>

          <ul className="mb-8 space-y-4">
            {ANNUAL_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#F472B6]" />
                <span className="font-bold text-gray-900">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => choosePlan('annual')}
            disabled={isAnnual || !!processingPlan}
            className={`w-full rounded-xl py-3 px-4 font-bold text-white shadow-md transition-smooth ${
              isAnnual ? 'cursor-default bg-gray-400' : 'bg-[#F472B6] hover:bg-[#E11D48]'
            }`}
          >
            {isAnnual ? 'Current Plan' : 'Choose Annual'}
          </button>
        </div>
      </div>

      {/* Demo Payment QR Modal */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#20273A]/40 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !processingPlan) setSelectedPlan(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-payment-title"
            className="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-xl border border-[#E8E8EE] bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 id="demo-payment-title" className="text-lg font-bold text-[#263445]">Demo Activation</h2>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-[#7B8790]">FemCare Premium Access</p>

            <div className="my-4 rounded-lg border border-[#E8E5EC] bg-[#FCF8FB] p-4 text-center">
              <p className="font-semibold text-[#263445]">{selectedPlan === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}</p>
              <p className="mt-1 text-2xl font-extrabold text-[#263445]">
                {selectedPlan === 'monthly' ? '₹179' : '₹1,299'}
                <span className="ml-1 text-xs font-normal text-[#7B8790]">
                  / {selectedPlan === 'monthly' ? 'month' : 'year'}
                </span>
              </p>
            </div>

            <div className="mx-auto my-3 flex w-fit flex-col items-center rounded-lg border border-[#E8E5EC] bg-white p-3">
              <img src={demoQrUrl} alt={`Demo QR for ${selectedPlan} plan`} className="h-[200px] w-[200px]" />
              <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7779AD]">
                Demo QR · No charge
              </span>
            </div>

            <p className="text-center text-xs leading-relaxed text-[#7B8790]">
              Click confirm below to activate your premium demo plan.
            </p>

            {checkoutError && <p role="alert" className="mt-2 text-center text-xs text-red-600">{checkoutError}</p>}

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                disabled={!!processingPlan}
                className="w-1/2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-700 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={payForPlan}
                disabled={!!processingPlan}
                className="w-1/2 rounded-lg bg-[#F472B6] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#E11D48] disabled:opacity-70"
              >
                {processingPlan ? 'Activating…' : 'Confirm'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

const Subscription = () => {
  const navigate = useNavigate();

  return (
    <SubscriptionPlansSection
      onPlanActivated={() => {
        navigate('/awareness');
      }}
    />
  );
};

export default Subscription;
