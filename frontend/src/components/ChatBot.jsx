import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageSquareText } from 'lucide-react';

/**
 * Shared FEMCARE AI Chatbot Component
 *
 * Entry points:
 *   1. Dashboard         — compact=true, onNavigateToFull callback
 *   2. Support Community — compact=false, initialMessages from location.state
 *   3. Assessment Result — compact=false, assessmentContext + initialContext
 *
 * All instances: same /api/chat backend, same Groq LLM, same FEMCARE system prompt.
 */
import { API_BASE, apiFetch } from '../lib/api';

const ChatBot = ({
    initialContext    = null,       // pre-filled assistant opening text
    initialMessages   = null,       // full conversation array handed off from Dashboard
    cycleContext      = null,
    assessmentContext = null,
    compact           = false,
    onNavigateToFull  = null,       // compact only — called with conversation after first reply
    className         = ""
}) => {
    const buildInitialMessages = () => {
        // If a full conversation was passed in (Dashboard → Community hand-off), use it
        if (initialMessages && initialMessages.length > 0) return initialMessages;
        const base = [{
            role: 'assistant',
            text: "Hi! I'm FEMCARE AI, your women's health assistant. I can help with questions about periods, menstrual cycles, symptoms, PCOS, fertility, and reproductive health.",
        }];
        return base;
    };

    const [chatInput, setChatInput]     = useState('');
    const [chatMessages, setChatMessages] = useState(buildInitialMessages);
    const [isLoading, setIsLoading]     = useState(false);
    const messagesEndRef                = useRef(null);
    const pendingHandoffRef              = useRef(false);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Navigate only after the assistant reply has committed to state. Calling
    // the parent router from a state updater runs during render and triggers
    // React's cross-component update warning.
    useEffect(() => {
        if (!pendingHandoffRef.current) return;
        pendingHandoffRef.current = false;
        if (compact && onNavigateToFull) onNavigateToFull(chatMessages);
    }, [chatMessages, compact, onNavigateToFull]);

    // Append context message once (assessment result arrival)
    useEffect(() => {
        if (initialContext) {
            setChatMessages(prev => [...prev, { role: 'assistant', text: initialContext }]);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const sendChat = async (overrideInput) => {
        const trimmed = (overrideInput ?? chatInput).trim();
        if (!trimmed || isLoading) return;

        const context = { ...cycleContext, ...assessmentContext };
        const userMsg = { role: 'user', text: trimmed };

        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsLoading(true);

        let assistantMsg = { role: 'assistant', text: '' };

        try {
            const { data, error } = await apiFetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ message: trimmed, context }),
            });
            if (data?.reply) {
                assistantMsg = { role: 'assistant', text: data.reply };
            } else {
                assistantMsg = { role: 'assistant', text: error || 'Sorry, I could not get a response. Please try again.' };
            }
        } catch {
            assistantMsg = {
                role: 'assistant',
                text: 'I am currently offline. Please try again later or contact a healthcare professional if you have urgent concerns.',
            };
        } finally {
            setIsLoading(false);
        }

        if (compact && onNavigateToFull) pendingHandoffRef.current = true;
        setChatMessages(prev => [...prev, assistantMsg]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChat();
        }
    };

    /* ─── COMPACT MODE (Dashboard card) ─────────────────────────────── */
    if (compact) {
        return (
            <div className={`flex flex-col justify-between ${className}`}>
                <div className="mb-1 flex items-center justify-between">
                    <div className="text-[0.92rem] font-black tracking-[-0.03em] text-[#17213D]">AI Chatbot</div>
                    <MessageSquareText className="h-3.5 w-3.5 text-[#C8B7E8]" />
                </div>

                <div className="space-y-1 rounded-[14px] bg-[#F5F0F7] p-1.5 max-h-[78px] overflow-y-auto flex-1 border border-[#F5F0F7]">
                    {chatMessages.slice(-2).map((message, index) => (
                        <motion.div
                            key={`${message.role}-${index}`}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`max-w-[92%] rounded-[10px] px-2 py-1 text-[0.65rem] ${
                                message.role === 'assistant'
                                    ? 'bg-[#FFFDFC] text-[#17213D] shadow-sm'
                                    : 'ml-auto bg-[#D9E7F4] text-[#17213D]'
                            }`}
                        >
                            {message.text}
                        </motion.div>
                    ))}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-[#FFFDFC] text-[#17213D] shadow-sm max-w-[92%] rounded-[10px] px-2 py-1 text-[0.65rem]"
                        >
                            <span className="animate-pulse">Thinking...</span>
                        </motion.div>
                    )}
                </div>

                <div className="mt-1.5 flex gap-1.5">
                    <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your question..."
                        disabled={isLoading}
                        className="w-full rounded-full border border-[#F5F0F7] bg-[#FFFDFC] px-2.5 py-1 text-[0.68rem] text-[#17213D] outline-none focus:border-[#C8B7E8] transition-colors disabled:opacity-50"
                    />
                    <button
                        onClick={() => sendChat()}
                        disabled={isLoading || !chatInput.trim()}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#17213D] text-[#FFFDFC] hover:bg-[#17213D]/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        );
    }

    /* ─── FULL MODE (Support Community AI tab / Assessment result) ───── */
    return (
        <div className={`flex flex-col h-full overflow-hidden ${className}`}>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50">
                {chatMessages.map((message, index) => (
                    <motion.div
                        key={`${message.role}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === 'user'
                                ? 'bg-deep-pink text-white rounded-tr-sm'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                        }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white border border-gray-100 text-gray-800 rounded-tl-sm max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm">
                            <span className="animate-pulse">FEMCARE AI is thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about periods, cycles, symptoms, PCOS, fertility..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-deep-pink/50 focus:border-transparent transition-smooth disabled:opacity-50"
                    />
                    <button
                        onClick={() => sendChat()}
                        disabled={isLoading || !chatInput.trim()}
                        className="bg-deep-pink hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-smooth shadow-sm flex items-center justify-center min-w-[50px]"
                    >
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Educational information only • Not medical advice • Consult healthcare professionals for diagnosis
                </p>
            </div>
        </div>
    );
};

export default ChatBot;
