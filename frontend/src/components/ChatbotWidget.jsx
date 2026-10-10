import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import './ChatbotWidget.css';

const INITIAL_MESSAGE = {
  id: 'init-msg',
  role: 'assistant',
  text: "Hello! 👋 I'm **FemCare Assistant**, your AI companion for menstrual health, cycle tracking, and navigating FemCare features.\n\nHow can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const SUGGESTIONS = [
  "Normal cycle lengths?",
  "How do I log my period?",
  "Take PCOS assessment quiz",
  "How to book an appointment?",
  "Remedies for period cramps"
];

// Simple helper to format basic markdown (**bold**, newlines, bullets)
const FormattedMessage = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />;

        // Format **bold** text
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-bold">{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-[#FB7185] font-bold">•</span>
              <span>{formattedLine}</span>
            </div>
          );
        }

        return <p key={idx} className="m-0 leading-relaxed">{formattedLine}</p>;
      })}
    </div>
  );
};

const ChatbotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat when new message arrives
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || inputValue).trim();
    if (!messageText || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageText,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Build user cycle context if available
    const context = {};
    if (user) {
      if (user.cycle_length) context.cycleLength = user.cycle_length;
      if (user.last_period_date) context.lastPeriod = user.last_period_date;
    }

    try {
      const { data, error } = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: messageText, context })
      });

      let assistantText = '';
      let isError = false;

      if (data && data.reply) {
        assistantText = data.reply;
        if (data.error) {
          // LLM service unavailable warning from backend
          isError = true;
        }
      } else {
        assistantText = error || "The FemCare AI assistant is temporarily unavailable. Please try again in a moment.";
        isError = true;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: assistantText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: "Unable to connect to the FemCare server. Please check your internet connection or try again later.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: `init-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        className={`femcare-chat-fab ${!isOpen ? 'pulse-anim' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close FemCare Assistant" : "Chat with FemCare"}
        title="Chat with FemCare"
        data-tooltip="Chat with FemCare"
      >
        {isOpen ? (
          <X size={26} strokeWidth={2.5} />
        ) : (
          <MessageCircle size={28} strokeWidth={2.3} />
        )}
      </button>

      {/* Floating Chat Panel Window */}
      {isOpen && (
        <div className="femcare-chat-panel" role="dialog" aria-label="FemCare Assistant">
          {/* Header */}
          <div className="femcare-chat-header">
            <div className="femcare-chat-header-info">
              <div className="femcare-chat-avatar">
                <Bot size={22} strokeWidth={2.2} />
                <span className="femcare-chat-online-dot" />
              </div>
              <div className="femcare-chat-header-titles">
                <h3>FemCare Assistant</h3>
                <p>AI Health & Care Companion</p>
              </div>
            </div>

            <div className="femcare-chat-header-actions">
              <button
                type="button"
                className="femcare-chat-icon-btn"
                onClick={handleResetChat}
                title="Start new conversation"
                aria-label="Start new conversation"
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                className="femcare-chat-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="femcare-chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`femcare-msg-row ${msg.role}`}>
                <div
                  className={`femcare-msg-bubble ${msg.role} ${
                    msg.isError ? 'error-bubble' : ''
                  }`}
                >
                  <FormattedMessage text={msg.text} />
                  <div
                    className="text-[0.6rem] mt-1 opacity-70 text-right"
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Suggestion Chips (Shown initially or whenever conversation is fresh) */}
            {messages.length <= 2 && !isLoading && (
              <div className="femcare-suggestions-bar">
                <span className="femcare-suggestions-label">Suggested Questions</span>
                <div className="femcare-chips-grid">
                  {SUGGESTIONS.map((suggestion, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      className="femcare-chip-btn"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Thinking indicator */}
            {isLoading && (
              <div className="femcare-msg-row assistant">
                <div className="femcare-thinking">
                  <span>FemCare Assistant is thinking</span>
                  <span className="femcare-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Footer / Input */}
          <div className="femcare-chat-footer">
            <div className="femcare-input-row">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about periods, symptoms, or FemCare..."
                disabled={isLoading}
                className="femcare-chat-input"
                aria-label="Ask FemCare Assistant"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="femcare-send-btn"
                aria-label="Send message"
                title="Send"
              >
                <Send size={16} strokeWidth={2.4} />
              </button>
            </div>
            <p className="femcare-disclaimer-text">
              Educational reference only • Not medical diagnosis • Emergency call 102 / 1091 / 112
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
