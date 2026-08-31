'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  HelpCircle,
  Award,
} from 'lucide-react';
import { ExamType, QuestionType, ChoiceType } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface InteractiveExamEngineProps {
  exam: ExamType & {
    questions: (QuestionType & { choices: ChoiceType[] })[];
  };
}

export default function InteractiveExamEngine({ exam }: InteractiveExamEngineProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(exam.durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const questions = exam.questions || [];
  const currentQuestion = questions[currentIdx];

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: exam.id,
          answers,
          timeSpentSeconds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.attemptId) {
        router.push(`/exams/${exam.id}/results/${data.attemptId}`);
      } else {
        alert(data.error || 'حدث خطأ أثناء تصحيح الامتحان');
        setIsSubmitting(false);
      }
    } catch {
      alert('حدث خطأ في الاتصال بالسيرفر أثناء تسليم الامتحان');
      setIsSubmitting(false);
    }
  }, [exam.id, answers, isSubmitting, router]);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [handleSubmit]);

  const selectChoice = (questionId: string, choiceId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent =
    questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // Format time MM:SS
  // Format time HH:MM:SS or MM:SS
  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = secondsLeft < 300; // less than 5 minutes

  if (questions.length === 0) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          لم تتم إضافة أسئلة لهذا الامتحان بعد
        </h2>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs"
        >
          العودة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Floating Control Bar */}
      <div className="sticky top-20 z-30 p-4 rounded-2xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-tajawal truncate max-w-xs sm:max-w-md">
            {exam.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>السؤال {currentIdx + 1} من {questions.length}</span>
            <span>•</span>
            <span>تمت الإجابة على ({answeredCount} من {questions.length})</span>
            {user?.seatNumber && (
              <>
                <span>•</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">
                  رقم الجلوس: <span className="font-mono text-brand-600 dark:text-brand-400 font-black">{user.seatNumber}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Timer & Submit CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-colors ${
              isLowTime
                ? 'bg-rose-50 dark:bg-rose-950 text-accent-rose animate-pulse border border-rose-300 dark:border-rose-800'
                : 'bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span dir="ltr" className="font-mono">{formatTime(secondsLeft)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 rounded-xl bg-accent-emerald hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إنهاء وتسليم</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-brand-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Question Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-8">
            {/* Question Text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                  سؤال رقم {currentIdx + 1}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {currentQuestion.marks} درجات
                </span>
              </div>

              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed font-tajawal">
                {currentQuestion.questionText}
              </div>
            </div>

            {/* Choices List */}
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, cIdx) => {
                const isSelected = answers[currentQuestion.id] === choice.id;
                const alphabet = ['أ', 'ب', 'ج', 'د', 'هـ'];

                return (
                  <button
                    key={choice.id}
                    onClick={() => selectChoice(currentQuestion.id, choice.id)}
                    className={`w-full p-4 rounded-2xl border text-right flex items-center justify-between gap-4 transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-200 ring-2 ring-brand-500/30'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {alphabet[cIdx] || cIdx + 1}
                      </span>
                      <span className="text-sm font-semibold">{choice.text}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-brand-600 bg-brand-600' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Nav buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-brand-600/20"
                >
                  <span>التالي</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="px-6 py-2.5 rounded-xl bg-accent-emerald hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <span>مراجعة وتسليم</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Questions Navigator Palette Sidebar */}
        <div className="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              شبكة الأسئلة
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {answeredCount} من {questions.length} مجاب
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = currentIdx === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-brand-600 text-white ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900 shadow-md'
                      : isAnswered
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>سؤال تمت الإجابة عليه ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-slate-200 dark:bg-slate-700" />
              <span>سؤال لم تتم الإجابة عليه ({questions.length - answeredCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 text-right">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
                هل أنت متأكد من رغبتك في تسليم الامتحان؟
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                لقد أجبت على <span className="font-bold text-brand-600">{answeredCount}</span> من أصل{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">{questions.length}</span> سؤالاً.
                {questions.length - answeredCount > 0 && (
                  <span className="text-accent-rose block mt-1 font-bold">
                    تنبيه: لديك {questions.length - answeredCount} أسئلة لم تجب عليها بعد.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-accent-emerald hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'جاري التصحيح...' : 'نعم، تسليم وتصحيح'}
              </button>

              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                العودة للأسئلة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
