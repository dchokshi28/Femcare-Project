import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBot from '../components/ChatBot';

/**
 * Chat Support Page
 * Accessible from navbar "Chat Support" link (Bot icon)
 * Also reachable from Assessment Result "Ask FEMCARE AI" button
 *
 * Three entry points all use this same component → same ChatBot → same /api/chat endpoint:
 *   1. Navbar  → /chat-support  (no context)
 *   2. Assessment result → /chat-support  (location.state.assessmentResult)
 *   3. Dashboard compact card → uses ChatBot directly (inline, compact mode)
 */
const ChatSupport = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Assessment result passed via navigate('/chat-support', { state: { assessmentResult: result } })
    const assessmentContext = useMemo(() => {
        const result = location.state?.assessmentResult;
        if (!result) return null;
        return {
            assessmentCompleted: true,
            pcosDetected: result.pcos_detected,
            confidence: result.confidence,
            riskLevel: result.risk_level,
            message: result.message,
        };
    }, [location.state]);

    // Basic cycle context from authenticated user profile
    const cycleContext = useMemo(() => {
        if (!user) return {};
        return {
            cycleLength: user.cycle_length || 28,
            lastPeriod: user.last_period_date || null,
        };
    }, [user]);

    // Pre-fill a contextual opening message when coming from assessment
    const initialContext = useMemo(() => {
        if (!assessmentContext) return null;
        return `I can see you just completed your health assessment. Your result shows ${assessmentContext.riskLevel} with ${assessmentContext.confidence}% AI confidence. How can I help you understand your results or next steps?`;
    }, [assessmentContext]);

    return (
        <div className="max-w-5xl mx-auto h-[calc(100vh-80px)] p-4 md:p-8 animate-fade-in">
            <ChatBot
                cycleContext={cycleContext}
                assessmentContext={assessmentContext}
                initialContext={initialContext}
                compact={false}
                className="h-full"
            />
        </div>
    );
};

export default ChatSupport;
