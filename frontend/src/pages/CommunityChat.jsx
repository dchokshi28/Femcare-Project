import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { Send, UserCircle2, MessageSquareText, Users } from 'lucide-react';
import ChatBot from '../components/ChatBot';

const CommunityChat = () => {
  const { user } = useAuth();
  const location = useLocation();

  // ── Tab state ──────────────────────────────────────────────────────────
  // If arriving from Dashboard or Assessment with AI context, open AI tab
  const defaultTab = location.state?.openAITab ? 'ai' : 'community';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // ── AI Assistant — restore conversation handed off from Dashboard / Assessment ──
  // location.state.conversation  = full message array from Dashboard compact chat
  // location.state.assessmentResult = ML result object from HealthAssessment
  const handedOffMessages = location.state?.conversation ?? null;

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initialContext = useMemo(() => {
    // Only show contextual opener when coming from Assessment (not Dashboard hand-off,
    // which already has the full conversation)
    if (assessmentContext && !handedOffMessages) {
      return `I can see you just completed your health assessment. Your result shows ${assessmentContext.riskLevel} with ${assessmentContext.confidence}% AI confidence. How can I help you understand your results or next steps?`;
    }
    return null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cycleContext = useMemo(() => {
    if (!user) return {};
    return {
      cycleLength: user.cycle_length || 28,
      lastPeriod: user.last_period_date || null,
    };
  }, [user]);

  // ── Community chat state ───────────────────────────────────────────────
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Sarah T.',  text: 'Does anyone else get crazy sugar cravings a week before?', isCurrentUser: false, time: '10:00 AM' },
    { id: 2, user: 'Emma W.',   text: 'Yes! Dark chocolate is my go-to remedy.',                  isCurrentUser: false, time: '10:05 AM' },
    { id: 3, user: 'Chloe M.', text: 'Magnesium supplements helped me a lot with cravings.',      isCurrentUser: false, time: '10:15 AM' },
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMsg = {
      id: Date.now(),
      user: user?.name || 'You',
      text: message,
      isCurrentUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    setMessage('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        user: 'System Admin',
        text: 'This is a mock chat instance. Real-time sockets will be in v2!',
        isCurrentUser: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] p-4 flex flex-col md:p-8 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-50 to-soft-lavender/20 p-4 md:p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Support Community</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                1,245 Members Online • Safe Space
              </p>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <img
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white"
                  src={`https://i.pravatar.cc/100?img=${i + 10}`}
                  alt="avatar"
                />
              ))}
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────────── */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'community'
                  ? 'bg-[#17213D] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="w-4 h-4" />
              Community
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-deep-pink text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquareText className="w-4 h-4" />
              FEMCARE AI Assistant
            </button>
          </div>
        </div>

        {/* ── Community Tab ──────────────────────────────────────────────── */}
        {activeTab === 'community' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${msg.isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!msg.isCurrentUser && (
                      <div className="flex-shrink-0 mt-1">
                        <UserCircle2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className={`flex flex-col ${msg.isCurrentUser ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-500 mb-1 ml-1">{msg.user} • {msg.time}</span>
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.isCurrentUser
                          ? 'bg-deep-pink text-white rounded-tr-sm'
                          : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your experience or ask a question..."
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-deep-pink/50 focus:border-transparent transition-smooth"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-deep-pink hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-smooth shadow-sm flex items-center justify-center min-w-[50px]"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── AI Assistant Tab ────────────────────────────────────────────── */}
        {activeTab === 'ai' && (
          <ChatBot
            key="community-ai"
            compact={false}
            initialMessages={handedOffMessages}
            initialContext={initialContext}
            cycleContext={cycleContext}
            assessmentContext={assessmentContext}
            className="flex-1 min-h-0"
          />
        )}

      </div>
    </div>
  );
};

export default CommunityChat;
