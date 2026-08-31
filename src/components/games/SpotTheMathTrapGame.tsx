'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

export default function SpotTheMathTrapGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('all', 25);
  const [problemIdx, setProblemIdx] = useState(0);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const currentQ = examQuestions[problemIdx % Math.max(1, examQuestions.length)];

  // Generate dynamic 4-step solution with 1 intentional trap step based on the real exam question
  const trapStep = (problemIdx % 3) + 2; // Steps 2, 3, or 4
  const wrongOption = currentQ?.options?.find((_: any, i: number) => i !== currentQ.correct) || 'قيمة تقريبية خاطئة';
  const correctOption = currentQ?.options?.[currentQ?.correct] || 'الإجابة الصحيحة';

  const steps = [
    { num: 1, text: `تحديد معطيات المسألة: قراءة السؤال بعناية وتحليل المطلوب بدقة.` },
    {
      num: 2,
      text:
        trapStep === 2
          ? `تطبيق القانون: تم استخدام قانون غير مناسب للمسألة بدون مراعاة الشروط الهندسية.`
          : `تطبيق القانون الأساسي المعتمد في المنهج للوصول إلى العلاقة الرياضية/الفيزيائية.`,
    },
    {
      num: 3,
      text:
        trapStep === 3
          ? `التعويض الرياضي: تم ارتكاب خطأ في الإشارة أو نسيان التربيع أثناء فك الأقواس.`
          : `التعويض المباشر بالمعطيات وتبسيط العمليات الحسابية خطوة بخطوة.`,
    },
    {
      num: 4,
      text:
        trapStep === 4
          ? `الناتج النهائي المستخرج: (${wrongOption}) بدون مراجعة الوحدات أو القيود.`
          : `الناتج النهائي الصحيح المعتمد: (${correctOption}).`,
    },
  ];

  useEffect(() => {
    let timer: any = null;
    if (!isAnswered && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && !isAnswered) {
      setIsAnswered(true);
    }
    return () => clearInterval(timer);
  }, [isAnswered, timeLeft]);

  const handleSelectStep = (stepNum: number) => {
    if (isAnswered) return;

    setSelectedStep(stepNum);
    setIsAnswered(true);

    if (stepNum === trapStep) {
      setScore((s) => s + 100);
    }
  };

  const nextProblem = () => {
    setProblemIdx((i) => i + 1);
    setSelectedStep(null);
    setIsAnswered(false);
    setTimeLeft(30);
  };

  if (loading || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4 font-tajawal">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          جاري استيراد أسئلة الامتحانات لتجهيز أفخاخ ومسائل المعادلة...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto px-4 space-y-6 animate-fade-in select-none text-center font-tajawal">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>{timeLeft} ثانية</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs font-mono">
            {score} XP
          </div>
        </div>
      </div>

      {/* Main Problem & Steps Card */}
      <div className="glass-card rounded-[36px] p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6 text-right">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 font-black text-xs">
            {currentQ.subject} • {currentQ.examTitle}
          </span>
          <span className="text-xs text-slate-400 font-bold">
            اضغط على رقم الخطوة التي تحتوي على الفخ 🕵️‍♂️
          </span>
        </div>

        <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-relaxed">
          {currentQ.q}
        </p>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step) => {
            const isSelected = selectedStep === step.num;
            const isTheTrap = step.num === trapStep;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => handleSelectStep(step.num)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 ${
                  isAnswered
                    ? isTheTrap
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-black'
                      : isSelected
                      ? 'bg-slate-800 border-slate-600 text-slate-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:scale-[1.01] text-slate-800 dark:text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                    isAnswered && isTheTrap
                      ? 'bg-rose-500 text-white animate-bounce'
                      : 'bg-amber-500/20 text-amber-500'
                  }`}
                >
                  {step.num}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-xs sm:text-sm font-bold leading-relaxed">{step.text}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Post-Answer Explanation Box */}
        {isAnswered && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-black">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>تحليل الفخ والشرح النموذجي:</span>
            </div>
            <p className="leading-relaxed font-medium">
              الفخ يكمن في الخطوة رقم ({trapStep}).
            </p>
            {currentQ.explanation && (
              <p className="text-slate-300 leading-relaxed">
                💡 الحل الصحيح: {currentQ.explanation}
              </p>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={nextProblem}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition shadow-md"
              >
                المسألة التالية ←
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
