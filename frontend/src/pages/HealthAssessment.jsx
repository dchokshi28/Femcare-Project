import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Sparkles, BrainCircuit, ShieldCheck, Activity, RefreshCcw, MessageSquareText, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE, apiFetch } from '../lib/api';
import './HealthAssessment.css';
const HealthAssessment = () => {
    const { getAccessToken } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [tipIndex, setTipIndex] = useState(0);
    const [eligibility, setEligibility] = useState(null);
    const [eligibilityLoading, setEligibilityLoading] = useState(true);
    const [quotaBlocked, setQuotaBlocked] = useState(false);

    const quizData = [
        {
            section: "Personal Information",
            id: "age",
            question: "What is your age?",
            type: "number",
            placeholder: "Years",
            required: true
        },
        {
            section: "Personal Information",
            id: "height_cm",
            question: "What is your height in cm?",
            type: "number",
            placeholder: "cm",
            required: true
        },
        {
            section: "Personal Information",
            id: "weight_kg",
            question: "What is your weight in kg?",
            type: "number",
            placeholder: "kg",
            required: true
        },
        {
            section: "Menstrual Cycle",
            id: "cycle_length_days",
            question: "What is your average cycle length?",
            type: "options",
            options: ["21–25 days", "26–30 days", "31–35 days", "More than 35 days"],
            required: true
        },
        {
            section: "Menstrual Cycle",
            id: "bleeding_days",
            question: "How many days does your menstrual bleeding usually last?",
            type: "options",
            options: ["1–3 days", "4–5 days", "6–7 days", "More than 7 days"],
            required: true
        },
        {
            section: "Menstrual Cycle",
            id: "periods_regular",
            question: "Are your periods regular?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Menstrual Cycle",
            id: "skip_periods_months",
            question: "Have you skipped periods for 2 or more months?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Physical Symptoms",
            id: "dark_patches_neck",
            question: "Do you have dark patches on your neck or underarms?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Physical Symptoms",
            id: "excess_facial_hair",
            question: "Do you experience excessive facial or body hair growth?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Physical Symptoms",
            id: "severe_acne",
            question: "Do you frequently experience severe acne?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Lifestyle",
            id: "fast_food_frequent",
            question: "Do you frequently consume fast food or processed foods?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Lifestyle",
            id: "exercise_regularly",
            question: "Do you exercise regularly (3+ times per week)?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Family & Medical History",
            id: "family_history_pcos",
            question: "Does anyone in your family have PCOS?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Family & Medical History",
            id: "insulin_resistance",
            question: "Have you been diagnosed with insulin resistance?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Family & Medical History",
            id: "thyroid_status",
            question: "Have you been diagnosed with a thyroid disorder?",
            type: "options",
            options: [
                { label: "Yes", value: 1 },
                { label: "No", value: 0 }
            ],
            required: true
        },
        {
            section: "Optional Lab Results",
            id: "LH",
            question: "Enter LH hormone level (optional)",
            type: "number",
            placeholder: "mIU/mL",
            required: false
        },
        {
            section: "Optional Lab Results",
            id: "FSH",
            question: "Enter FSH hormone level (optional)",
            type: "number",
            placeholder: "mIU/mL",
            required: false
        },
        {
            section: "Optional Lab Results",
            id: "LH_FSH_ratio",
            question: "LH/FSH Ratio",
            type: "calculated",
            required: false
        }
    ];

    const healthTips = [
        "Regular menstrual cycles usually range between 21–35 days.",
        "Symptoms such as acne, irregular cycles, and excess hair growth can indicate hormonal imbalance.",
        "Tracking your basal body temperature can help identify your ovulation day.",
        "A balanced diet rich in proteins and low in processed sugars supports PCOS management.",
        "Moderate exercise helps improve insulin sensitivity and hormonal health."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % healthTips.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    // Auto-calculate LH/FSH ratio whenever LH or FSH changes
    useEffect(() => {
        const lh = parseFloat(answers.LH);
        const fsh = parseFloat(answers.FSH);

        if (!answers.LH && !answers.FSH) {
            // Both empty — clear the ratio
            setAnswers(prev => {
                const next = { ...prev };
                delete next.LH_FSH_ratio;
                return next;
            });
            return;
        }

        if (!answers.LH || !answers.FSH) {
            // One is missing — clear ratio (partial data)
            setAnswers(prev => {
                const next = { ...prev };
                delete next.LH_FSH_ratio;
                return next;
            });
            return;
        }

        if (isNaN(lh) || isNaN(fsh)) {
            setAnswers(prev => {
                const next = { ...prev };
                delete next.LH_FSH_ratio;
                return next;
            });
            return;
        }

        if (fsh === 0) {
            // Division by zero — store sentinel so UI can display message
            setAnswers(prev => ({ ...prev, LH_FSH_ratio: '__fsh_zero__' }));
            return;
        }

        // Calculate to 2 decimal places, avoid floating-point artifacts
        const ratio = Math.round((lh / fsh) * 100) / 100;
        setAnswers(prev => ({ ...prev, LH_FSH_ratio: ratio }));
    }, [answers.LH, answers.FSH]);

    useEffect(() => {
        let isMounted = true;
        const fetchEligibility = async () => {
            try {
                setEligibilityLoading(true);
                const { data } = await apiFetch('/api/assessment-eligibility');
                if (isMounted && data) {
                    setEligibility(data);
                    if (!data.can_take_quiz) {
                        setQuotaBlocked(true);
                    }
                }
            } catch (err) {
                console.error("Error fetching assessment eligibility:", err);
            } finally {
                if (isMounted) {
                    setEligibilityLoading(false);
                }
            }
        };
        fetchEligibility();
        return () => { isMounted = false; };
    }, []);

    const handleRetake = async () => {
        try {
            const { data } = await apiFetch('/api/assessment-eligibility');
            if (data) {
                setEligibility(data);
                if (!data.can_take_quiz) {
                    setQuotaBlocked(true);
                    setIsCompleted(false);
                    setResult(null);
                    return;
                }
            }
        } catch (err) {
            console.error("Error checking eligibility on retake:", err);
        }
        setIsCompleted(false);
        setCurrentStep(0);
        setAnswers({});
        setResult(null);
    };

    const handleOptionSelect = (value) => {
        const currentQ = quizData[currentStep];
        setAnswers({ ...answers, [currentQ.id]: value });
    };

    const handleInputChange = (e) => {
        const currentQ = quizData[currentStep];
        setAnswers({ ...answers, [currentQ.id]: e.target.value });
    };

    const nextStep = () => {
        if (currentStep < quizData.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const [result, setResult] = useState(null);

    const handleSubmit = async () => {
        setIsAnalyzing(true);
        let isQuotaBlocked = false;
        
        // Safely derive LH_FSH_ratio from LH and FSH
        const lhVal = parseFloat(answers.LH);
        const fshVal = parseFloat(answers.FSH);
        let computedRatio = 0;
        if (!isNaN(lhVal) && !isNaN(fshVal) && fshVal > 0) {
            computedRatio = Math.round((lhVal / fshVal) * 100) / 100;
        }

        // Prepare data for API - ensure numeric values where expected
        const formattedAnswers = {
            age: parseInt(answers.age || 25),
            height_cm: parseFloat(answers.height_cm || 160),
            weight_kg: parseFloat(answers.weight_kg || 60),
            cycle_length_days: parseInt(answers.cycle_length_days?.match(/\d+/)?.[0] || 28),
            bleeding_days: parseInt(answers.bleeding_days?.match(/\d+/)?.[0] || 5),
            insulin_resistance: parseInt(answers.insulin_resistance || 0),
            periods_regular: parseInt(answers.periods_regular || 1),
            dark_patches_neck: parseInt(answers.dark_patches_neck || 0),
            fast_food_frequent: parseInt(answers.fast_food_frequent || 0),
            exercise_regularly: parseInt(answers.exercise_regularly || 1),
            family_history_pcos: parseInt(answers.family_history_pcos || 0),
            skip_periods_months: parseInt(answers.skip_periods_months || 0),
            excess_facial_hair: parseInt(answers.excess_facial_hair || 0),
            severe_acne: parseInt(answers.severe_acne || 0),
            thyroid_status: parseInt(answers.thyroid_status || 0),
            LH: isNaN(lhVal) ? 0 : lhVal,
            FSH: isNaN(fshVal) ? 0 : fshVal,
            LH_FSH_ratio: computedRatio   // always derived, never from user input
        };

        try {
            // Get auth token if user is logged in
            const token = getAccessToken ? getAccessToken() : null;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const { data, error, status } = await apiFetch('/api/predict', {
                method: 'POST',
                headers,
                body: JSON.stringify(formattedAnswers),
            });

            if (status === 403 || (error && (error.includes('free quizzes') || error.includes('subscription')))) {
                isQuotaBlocked = true;
                setQuotaBlocked(true);
                setEligibility(prev => prev ? { ...prev, can_take_quiz: false, used_quizzes: Math.max(prev.used_quizzes || 0, 2), free_exhausted: true } : null);
                return;
            }

            if (data) {
                setResult(data);
                setEligibility(prev => prev ? { ...prev, used_quizzes: (prev.used_quizzes || 0) + 1 } : null);
                console.log("Prediction Result:", data);
            } else {
                setResult({
                    pcos_detected: false,
                    confidence: 0,
                    risk_level: "Service Unavailable",
                    message: error || "We couldn't reach the AI server. Please check your connection and try again."
                });
            }
        } catch (error) {
            console.error("API Error:", error);
            if (error?.status === 403 || error?.response?.status === 403) {
                isQuotaBlocked = true;
                setQuotaBlocked(true);
                return;
            }
            setResult({
                pcos_detected: false,
                confidence: 0,
                risk_level: "Service Offline",
                message: "We couldn't reach the AI server. Please check your connection."
            });
        } finally {
            setIsAnalyzing(false);
            if (!isQuotaBlocked) {
                setIsCompleted(true);
            }
        }
    };

    const currentQ = quizData[currentStep];
    const isAnswered = answers[currentQ.id] !== undefined && answers[currentQ.id] !== "";
    // For optional questions, Next is always enabled. For required questions, answer must be provided.
    const canProceed = !currentQ.required || isAnswered;
    const progress = ((currentStep + 1) / quizData.length) * 100;

    return (
        <div className="assessment-container">
            <div className="assessment-main">
                <header className="assessment-header">
                    <h1>AI Health Assessment</h1>
                    <p>Understand your reproductive and hormonal health through a quick assessment.</p>
                </header>

                <div className="progress-container">
                    <div className="progress-info">
                        <span>{currentStep === quizData.length ? "Done" : `Step ${currentStep + 1} of ${quizData.length}`}</span>
                        <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                {quotaBlocked ? (
                    <div className="quiz-card animate-fade-in text-center p-8">
                        <div className="ai-tip-icon" style={{ background: '#FEF3C7', color: '#D97706', width: 64, height: 64, borderRadius: 20, margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Free Quizzes Limit Reached</h2>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto text-base">
                            You've used your 2 free quizzes. Upgrade your subscription to continue.
                        </p>
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6 max-w-md mx-auto text-left">
                            <div className="flex items-start gap-3">
                                <Sparkles className="text-amber-600 mt-0.5 flex-shrink-0" size={18} />
                                <div className="text-sm text-amber-900">
                                    <p className="font-semibold">Unlock Continued Health Assessments</p>
                                    <p className="text-xs text-amber-800 mt-1">
                                        Subscribers receive unlimited AI health assessments, comprehensive hormone monitoring, and personalized cycle insights.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                            <button 
                                id="upgrade-subscription-btn"
                                className="btn-next" 
                                style={{ minWidth: '240px' }}
                                onClick={() => navigate('/subscription')}
                            >
                                <span className="flex items-center gap-2 justify-center">
                                    <Sparkles size={18} />
                                    <span>Upgrade Subscription</span>
                                </span>
                            </button>
                        </div>
                    </div>
                ) : !isCompleted ? (
                    <div className="quiz-card">
                        {isAnalyzing ? (
                            <div className="completion-content animate-fade-in">
                                <div className="analyzing-loader">
                                    <div className="pulse-circle"></div>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-700">Analyzing your responses with AI...</h2>
                                <p className="text-slate-500 mt-2">We're calculating your hormonal health risk markers.</p>
                            </div>
                        ) : (
                            <div className="quiz-content animate-fade-in" key={currentStep}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="question-section-title">{currentQ.section}</div>
                                    <span className="quiz-quota-badge">
                                        {eligibility?.has_active_subscription 
                                            ? "Premium Active • Unlimited Assessments" 
                                            : `Free Quiz ${Math.min((eligibility?.used_quizzes || 0) + 1, 2)} of 2`}
                                    </span>
                                </div>
                                <h2 className="question-text">{currentQ.question}</h2>

                                {currentQ.type === "options" ? (
                                    <div className="options-grid">
                                        {currentQ.options.map((option, idx) => {
                                            const label = typeof option === 'string' ? option : option.label;
                                            const value = typeof option === 'string' ? option : option.value;
                                            const isSelected = answers[currentQ.id] === value;

                                            return (
                                                <button 
                                                    key={idx}
                                                    className={`option-card ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleOptionSelect(value)}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : currentQ.type === "calculated" ? (
                                    // Read-only auto-calculated field (LH/FSH ratio)
                                    <div className="number-input-wrapper">
                                        {(() => {
                                            const lh = answers.LH;
                                            const fsh = answers.FSH;
                                            const ratio = answers.LH_FSH_ratio;

                                            let displayValue = "";
                                            let helpText = "";
                                            let isError = false;

                                            if (ratio === '__fsh_zero__') {
                                                displayValue = "";
                                                helpText = "Ratio cannot be calculated with FSH = 0";
                                                isError = true;
                                            } else if (ratio !== undefined && ratio !== "") {
                                                displayValue = Number(ratio).toFixed(2);
                                                helpText = `Automatically calculated: ${lh} ÷ ${fsh} = ${displayValue}`;
                                            } else if (lh && !fsh) {
                                                helpText = "Enter both LH and FSH to calculate ratio";
                                            } else if (!lh && fsh) {
                                                helpText = "Enter both LH and FSH to calculate ratio";
                                            } else {
                                                helpText = "Enter LH and FSH values above to auto-calculate";
                                            }

                                            return (
                                                <>
                                                    <input
                                                        type="text"
                                                        className="quiz-number-input"
                                                        value={displayValue}
                                                        readOnly
                                                        placeholder="Auto-calculated"
                                                        style={{ 
                                                            backgroundColor: '#f8fafc',
                                                            cursor: 'not-allowed',
                                                            color: isError ? '#dc2626' : '#334155',
                                                            fontWeight: displayValue ? '600' : '400'
                                                        }}
                                                    />
                                                    <p style={{
                                                        fontSize: '0.78rem',
                                                        color: isError ? '#dc2626' : '#64748b',
                                                        marginTop: '0.5rem',
                                                        textAlign: 'center'
                                                    }}>
                                                        {helpText}
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="number-input-wrapper">
                                        <input 
                                            type="number"
                                            className="quiz-number-input"
                                            placeholder={currentQ.placeholder}
                                            value={answers[currentQ.id] || ""}
                                            onChange={handleInputChange}
                                            style={{ backgroundColor: '#FFFFFF', color: '#334155' }}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                <div className="quiz-nav-buttons">
                                    <button 
                                        className="btn-prev" 
                                        onClick={prevStep}
                                        disabled={currentStep === 0}
                                    >
                                        <span className="flex items-center gap-2">
                                            <ChevronLeft size={20} />
                                            <span>Previous</span>
                                        </span>
                                    </button>
                                    <button 
                                        className="btn-next" 
                                        onClick={nextStep}
                                        disabled={!canProceed}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span>{currentStep === quizData.length - 1 ? "Get My Result" : "Next"}</span>
                                            <ChevronRight size={20} />
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="quiz-card animate-fade-in">
                        <div className="completion-screen text-center py-8">
                            <div className="ai-tip-icon" style={{ 
                                background: result?.pcos_detected ? '#FEE2E2' : '#DCFCE7', 
                                color: result?.pcos_detected ? '#991B1B' : '#166534' 
                            }}>
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Assessment Complete</h2>
                            <p className="text-slate-500 mb-8">Thank you for sharing your information. Here is your preliminary AI health insight.</p>
                            
                            <div className="result-box p-8 rounded-3xl bg-slate-50 border border-slate-100 mb-8">
                                <span className={`risk-badge ${
                                    result?.risk_level === 'High Risk' ? 'risk-high' : 
                                    result?.risk_level === 'Moderate Risk' ? 'risk-moderate' : 'risk-low'
                                }`}>
                                    Risk Level: {result?.risk_level || 'Calculating...'}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">
                                    {result?.pcos_detected ? "Indicators Found" : "Everything looks normal"}
                                </h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {result?.message}
                                </p>
                                {result?.confidence > 0 && (
                                    <p className="text-xs font-bold text-slate-400 mt-6 uppercase tracking-widest">
                                        AI Confidence: {result.confidence}%
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 items-center">
                                    <button 
                                        className="btn-next" 
                                        style={{ maxWidth: '300px', margin: '0 auto' }}
                                        onClick={() => navigate('/chat', {
                                            state: {
                                                openAITab: true,
                                                assessmentResult: result
                                            }
                                        })}
                                    >
                                        <span className="flex items-center gap-2 justify-center">
                                            <MessageSquareText size={18} />
                                            <span>Ask FEMCARE AI</span>
                                        </span>
                                    </button>

                                    <button 
                                        className="btn-prev" 
                                        style={{ maxWidth: '300px', margin: '0 auto', opacity: 0.75 }}
                                        onClick={handleRetake}
                                    >
                                        <span className="flex items-center gap-2 justify-center">
                                            <RefreshCcw size={16} />
                                            <span>Retake Assessment</span>
                                        </span>
                                    </button>
                                </div>
                        </div>
                    </div>
                )}
            </div>

            <aside className="assessment-sidebar">
                <div className="ai-tip-card">
                    <div className="ai-tip-icon">
                        <Sparkles size={28} />
                    </div>
                    <h3>AI Health Tip</h3>
                    <div className="tip-content animate-fade-in" key={tipIndex}>
                        <p>{healthTips[tipIndex]}</p>
                    </div>
                </div>

                <div className="ai-tip-card mt-8" style={{ background: 'linear-gradient(135deg, #FDF2F8 0%, #FAFAFC 100%)' }}>
                    <div className="ai-tip-icon" style={{ background: '#FCE7F3', color: '#F472B6' }}>
                        <BrainCircuit size={28} />
                    </div>
                    <h3>AI Insight</h3>
                    <p>Our AI analyzes 45+ physiological biomarkers to provide you with high-precision cycle insights.</p>
                </div>
            </aside>
        </div>
    );
};

export default HealthAssessment;
