import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { API_BASE } from '../lib/api';

const C = { accent:'#E87A9A', soft:'#FFDDE2', primary:'#F7CAD0', border:'#EED9DE', text:'#3A3A3A', sub:'#5A5052', muted:'#8C7A7F', mint:'#DFF3EA', mintText:'#2E7D5A' };

const Quiz = () => {
  const [questions, setQuestions]         = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore]                 = useState(0);
  const [showResults, setShowResults]     = useState(false);
  const [selected, setSelected]           = useState(null);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/api/quiz`)
      .then(res  => { setQuestions(res.data); setLoading(false); })
      .catch(()  => { setLoading(false); });
  }, []);

  const handleAnswer = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[currentQIndex].correctAnswer) setScore(s => s + 1);
    setTimeout(() => {
      setSelected(null);
      const next = currentQIndex + 1;
      if (next < questions.length) setCurrentQIndex(next);
      else setShowResults(true);
    }, 900);
  };

  const restart = () => { setScore(0); setCurrentQIndex(0); setShowResults(false); setSelected(null); };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="dot-loader"><span /><span /><span /></div>
    </div>
  );

  if (questions.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center">
      <p className="text-sm" style={{ color: C.muted }}>Failed to load quiz. Please ensure the backend is running.</p>
    </div>
  );

  const q   = questions[currentQIndex];
  const pct = Math.round((currentQIndex / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-7 animate-fade-in">
      <div className="mb-6 pb-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <h1 className="text-2xl font-bold" style={{ color: C.text, fontFamily: 'Poppins, sans-serif' }}>Health Quiz</h1>
        <p className="text-sm mt-1" style={{ color: C.muted }}>Test your reproductive health knowledge.</p>
      </div>

      {!showResults ? (
        <div className="bg-white rounded-[18px] border shadow-sm overflow-hidden" style={{ borderColor: C.border }}>
          {/* Progress */}
          <div className="h-1.5 w-full" style={{ background: C.primary }}>
            <div className="h-full rounded-full transition-all duration-500"
                 style={{ width: `${pct}%`, background: C.accent }} />
          </div>

          <div className="px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: C.soft, color: C.accent }}>
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: '#FFF9FA', color: C.sub }}>
                Score: {score}
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug" style={{ color: C.text }}>{q.question}</h2>
          </div>

          <div className="p-5 space-y-3">
            {q.options.map((option, idx) => {
              const isCorrect  = idx === q.correctAnswer;
              const isSelected = idx === selected;
              let borderColor = C.border;
              let bg          = '#FFFFFF';
              let textColor   = C.text;
              if (selected !== null) {
                if (isCorrect)       { borderColor = C.accent; bg = C.soft; textColor = C.accent; }
                else if (isSelected) { borderColor = C.primary; bg = '#FFF9FA'; textColor = C.sub; }
              }
              return (
                <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null}
                        className="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-smooth flex items-center gap-3"
                        style={{ borderColor, background: bg, color: textColor }}>
                  {selected !== null && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: C.accent }} />
                  )}
                  {option}
                </button>
              );
            })}
          </div>
        </div>

      ) : (
        <div className="bg-white rounded-[18px] border shadow-sm p-8 text-center animate-fade-in"
             style={{ borderColor: C.border }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
               style={{ background: C.soft }}>
            <Award className="w-10 h-10" style={{ color: C.accent }} />
          </div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: C.text, fontFamily: 'Poppins, sans-serif' }}>
            Quiz Complete!
          </h2>
          <p className="text-sm mb-6" style={{ color: C.muted }}>Here's how you did</p>

          <div className="rounded-[14px] p-5 mb-6" style={{ background: '#FFF9FA', border: `1px solid ${C.border}` }}>
            <p className="text-xs font-semibold mb-1" style={{ color: C.muted }}>YOUR SCORE</p>
            <p className="text-4xl font-bold" style={{ color: C.accent }}>
              {score} <span className="text-xl font-normal" style={{ color: C.muted }}>/ {questions.length}</span>
            </p>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: C.sub }}>
            {score === questions.length
              ? 'Perfect score! You have great knowledge about reproductive health.'
              : score > questions.length / 2
              ? 'Good job! You have a solid understanding of biological cycles.'
              : "There's always more to learn. Check out the Doctor Posts for more information!"}
          </p>

          <button onClick={restart}
                  className="btn-primary text-white font-semibold py-2.5 px-7 rounded-xl flex items-center gap-2 mx-auto">
            <RefreshCcw className="w-4 h-4" /> Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
