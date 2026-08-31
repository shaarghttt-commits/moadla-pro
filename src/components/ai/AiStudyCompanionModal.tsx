'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  Loader2,
  BookOpen,
  Zap,
  HelpCircle,
  Check,
  ArrowRight,
  Flame,
  Lightbulb,
  FileText,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PRESET_PROBLEMS = [
  { label: 'تكامل دالة كسرية', subject: 'calculus', text: 'احسب تكامل: \\int \\frac{2x + 3}{x^2 + 3x + 5} dx' },
  { label: 'اشتقاق ضمني', subject: 'calculus', text: 'أوجد مشتقة dy/dx للمعادلة: x^2 + y^2 - 4xy = 0' },
  { label: 'حساب مقاومة مكافئة', subject: 'physics', text: 'احسب المقاومة المكافئة لثلاث مقاومات 6 و 3 و 2 أوم على التوازي.' },
  { label: 'اتزان قوى متلاقية', subject: 'mechanics', text: 'جسم وزنه 20 نيوتن معلق بخيطين يميل كل منهما بزاوية 30 على الرأسي. احسب الشد في الخيطين.' },
];

export default function AiStudyCompanionModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'SOLVER' | 'QUIZ' | 'CHAT'>('SOLVER');

  // Math Solver State
  const [selectedSubject, setSelectedSubject] = useState('calculus');
  const [problemInput, setProblemInput] = useState('');
  const [solving, setSolving] = useState(false);
  const [solution, setSolution] = useState<any>(null);

  // Dynamic Quiz State
  const [quizSubject, setQuizSubject] = useState('calculus');
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{ sender: 'ai' | 'user'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: 'أهلاً بك يا بطل! 🎓 أنا المساعد الذكي لمعادلة الهندسة. اسألني عن أي قانون، نصيحة لتنظيم وقت المذاكرة، أو فكرة مسألة صعبة!',
      time: 'الآن',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Solve problem handler
  const handleSolveProblem = async (textToSolve?: string) => {
    const text = textToSolve || problemInput;
    if (!text.trim()) return;

    setSolving(true);
    setSolution(null);
    try {
      const res = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: text, subject: selectedSubject }),
      });
      const data = await res.json();
      if (res.ok) {
        setSolution(data.solution);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSolving(false);
    }
  };

  // Generate quiz handler
  const handleGenerateQuiz = async () => {
    setLoadingQuiz(true);
    setUserAnswers({});
    setShowResults(false);
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: quizSubject, count: 3 }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuizQuestions(data.questions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Chat message handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingChat) return;

    const userText = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'الآن' },
    ]);
    setChatInput('');
    setSendingChat(true);

    setTimeout(() => {
      let aiReply = 'سؤال ممتاز جداً في منهج المعادلة! 🚀 ';
      if (userText.includes('تفاضل') || userText.includes('تكامل')) {
        aiReply += 'في التفاضل والتكامل، أنصحك بحل مسائل البابل شيت التي تركز على تكامل الدوال المثلثية العكسية واستخدام الآلة الحاسبة للتحقق السريع من المشتقات عند نقطة.';
      } else if (userText.includes('فيزياء') || userText.includes('أوم')) {
        aiReply += 'في الفيزياء، احرص دائماً على رسم الدوائر المعقدة بنقاط الجهد (طريقة النقط) لتبسيط التوالي والتوازي بدقة وبدون أخطاء.';
      } else if (userText.includes('وقت') || userText.includes('جدول') || userText.includes('مذاكرة')) {
        aiReply += 'أفضل استراتيجية الآن هي تقنية البومودورو (25 دقيقة حل امتحانات + 5 دقائق راحة)، مع التركيز على حل النماذج الشاملة للأعوام السابقة.';
      } else {
        aiReply += 'كل نقطة وفكرة بتذاكرها اليوم بتصنع فارق كبير في نتيجة البابل شيت. استمر في الحل والتكرار وأنا دائماً معك!';
      }

      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: aiReply, time: 'الآن' },
      ]);
      setSendingChat(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right Corner */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-black text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group border border-white/20"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>
        <span className="font-tajawal hidden sm:inline">مساعد المسائل الذكي 🤖</span>
        <span className="font-tajawal sm:hidden">AI 🤖</span>
      </button>

      {/* Main AI Companion Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Top Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                  🤖
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black font-tajawal leading-none">
                    المساعد الذكي لمعادلة الهندسة
                  </h3>
                  <p className="text-xs text-white/80 font-medium mt-1">
                    حل المسائل خطوة بخطوة • اختبارات ذكية • نصائح امتحانية
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 p-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 gap-1.5 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('SOLVER')}
                className={`py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'SOLVER'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>حل المسائل 📐</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('QUIZ');
                  if (quizQuestions.length === 0) handleGenerateQuiz();
                }}
                className={`py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'QUIZ'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>اختبرني ذكياً ⚡</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CHAT')}
                className={`py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'CHAT'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>اسأل المعلم 🎓</span>
              </button>
            </div>

            {/* Modal Body Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* ================= TAB 1: MATH SOLVER ================= */}
              {activeTab === 'SOLVER' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Subject selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500">اختر المادة:</span>
                    {[
                      { id: 'calculus', label: '📐 التفاضل والتكامل' },
                      { id: 'physics', label: '⚡ الفيزياء' },
                      { id: 'mechanics', label: '⚙️ الميكانيكا' },
                      { id: 'algebra', label: '🔢 الجبر والهندسة الفراغية' },
                    ].map((subj) => (
                      <button
                        key={subj.id}
                        type="button"
                        onClick={() => setSelectedSubject(subj.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedSubject === subj.id
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {subj.label}
                      </button>
                    ))}
                  </div>

                  {/* Problem Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      اكتب نص المسألة أو المعادلة الرياضية:
                    </label>
                    <textarea
                      value={problemInput}
                      onChange={(e) => setProblemInput(e.target.value)}
                      placeholder="مثال: احسب مشتقة الدالة y = (3x^2 + 1) / (x - 2) ثم أوجد ميل المماس عند x = 3..."
                      rows={3}
                      className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm font-semibold"
                    />
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400">أو جرب مسألة شائعة في الامتحانات:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_PROBLEMS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedSubject(preset.subject);
                            setProblemInput(preset.text);
                            handleSolveProblem(preset.text);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Solve Button */}
                  <button
                    type="button"
                    onClick={() => handleSolveProblem()}
                    disabled={!problemInput.trim() || solving}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-glow flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {solving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التحليل واستنتاج خطوات الحل...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>حل المسألة وشرح الخطوات فورياً 🚀</span>
                      </>
                    )}
                  </button>

                  {/* Solution Output Box */}
                  {solution && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4 animate-scale-up">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                          <Check className="w-4 h-4" />
                          <span>تم استنتاج الحل بنجاح</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          القانون: {solution.formula}
                        </span>
                      </div>

                      {/* Step by step list */}
                      <div className="space-y-2.5">
                        <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                          خطوات الحل النموذجية:
                        </p>
                        {solution.steps.map((step: string, sIdx: number) => (
                          <div key={sIdx} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                            {step}
                          </div>
                        ))}
                      </div>

                      {/* Tip */}
                      {solution.tip && (
                        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs font-bold">
                          {solution.tip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 2: DYNAMIC QUIZ ================= */}
              {activeTab === 'QUIZ' && (
                <div className="space-y-5 animate-fade-in">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {['calculus', 'physics', 'mechanics', 'algebra'].map((subj) => (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => {
                            setQuizSubject(subj);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            quizSubject === subj
                              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {subj === 'calculus' ? 'تفاضل' : subj === 'physics' ? 'فيزياء' : subj === 'mechanics' ? 'ميكانيكا' : 'جبر'}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateQuiz}
                      disabled={loadingQuiz}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>توليد أسئلة جديدة</span>
                    </button>
                  </div>

                  {loadingQuiz ? (
                    <div className="py-12 text-center text-slate-400 space-y-2">
                      <Loader2 className="w-8 h-8 mx-auto animate-spin text-amber-500" />
                      <p className="text-xs font-bold">جاري توليد أسئلة بابل شيت مخصصة بالذكاء الاصطناعي...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quizQuestions.map((q, idx) => (
                        <div key={q.id} className="p-4 sm:p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs">
                              سؤال {idx + 1}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-tajawal leading-relaxed">
                            {q.question}
                          </p>

                          {/* Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt: any) => {
                              const isSelected = userAnswers[q.id] === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => setUserAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                                  className={`p-3 rounded-2xl text-xs font-bold text-right transition-all border ${
                                    showResults
                                      ? opt.isCorrect
                                        ? 'bg-emerald-500 text-white border-emerald-600'
                                        : isSelected
                                        ? 'bg-rose-500 text-white border-rose-600'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 opacity-60'
                                      : isSelected
                                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-sm'
                                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-amber-400'
                                  }`}
                                >
                                  {opt.text}
                                </button>
                              );
                            })}
                          </div>

                          {showResults && q.explanation && (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                              💡 الشرح: {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}

                      {!showResults ? (
                        <button
                          type="button"
                          onClick={() => setShowResults(true)}
                          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
                        >
                          تصحيح إجاباتي وإظهار الشرح ✨
                        </button>
                      ) : (
                        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-center text-xs font-black">
                          أحسنت! تدرب على المزيد من الأسئلة لضمان الدرجة النهائية 💯
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 3: AI CHAT ================= */}
              {activeTab === 'CHAT' && (
                <div className="space-y-4 animate-fade-in flex flex-col h-[380px]">
                  {/* Messages scroll */}
                  <div className="flex-1 overflow-y-auto space-y-3 p-2">
                    {chatMessages.map((msg, mIdx) => (
                      <div
                        key={mIdx}
                        className={`flex items-start gap-2.5 ${
                          msg.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            msg.sender === 'user'
                              ? 'bg-brand-600 text-white'
                              : 'bg-purple-600 text-white'
                          }`}
                        >
                          {msg.sender === 'user' ? 'أنا' : '🤖'}
                        </div>
                        <div
                          className={`max-w-[80%] p-3.5 rounded-2xl text-xs sm:text-sm font-semibold leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-brand-600 text-white rounded-tl-none'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tr-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="اسألني عن نصيحة للمذاكرة، قانون، أو فكرة مسألة..."
                      className="flex-1 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || sendingChat}
                      className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
