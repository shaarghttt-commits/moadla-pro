'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Clock,
  Check,
  RotateCcw,
  Sparkles,
  BarChart3,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Zap,
  HelpCircle,
  Award,
  ChevronDown,
  Layers,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ExamQuestionChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface ExamQuestion {
  id: string;
  questionText: string;
  explanation?: string | null;
  marks: number;
  order: number;
  choices: ExamQuestionChoice[];
}

interface ExamItem {
  id: string;
  title: string;
  slug: string;
  year?: number | null;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  subject?: { id: string; title: string; slug: string } | null;
  questions: ExamQuestion[];
}

interface RealisticBubbleSheetSimulatorProps {
  availableExams?: ExamItem[];
}

const LETTER_MAP: Record<number, 'A' | 'B' | 'C' | 'D'> = {
  0: 'A',
  1: 'B',
  2: 'C',
  3: 'D',
};

const ARABIC_LETTERS: Record<'A' | 'B' | 'C' | 'D', string> = {
  A: 'أ',
  B: 'ب',
  C: 'ج',
  D: 'د',
};

const SUBJECT_META: Record<string, { icon: string; color: string; desc: string }> = {
  calculus: {
    icon: '∫',
    color: 'from-blue-600 to-indigo-700',
    desc: 'التفاضل والتكامل، النهايات، سلوك الدوال، والمساحات والحجوم الدورانية',
  },
  physics: {
    icon: '🔭',
    color: 'from-amber-500 to-orange-600',
    desc: 'الكهربية والتيار المتردد، المغناطيسية، كيرشوف، والفيزياء الحديثة والليزر',
  },
  'algebra-and-geometry': {
    icon: '📐',
    color: 'from-emerald-500 to-teal-700',
    desc: 'التباديل والتوافيق، ذات الحدين، الأعداد المركبة، المصفوفات والهندسة الفراغية',
  },
  mechanics: {
    icon: '⚙️',
    color: 'from-purple-600 to-violet-800',
    desc: 'الاستاتيكا، العزوم والازدواج، قوانين نيوتن، الدفع والتصادم والشغل والطاقة',
  },
  chemistry: {
    icon: '⚗️',
    color: 'from-rose-500 to-pink-700',
    desc: 'العناصر الانتقالية، الحديد والسبائك، التحليل الكيميائي، والاتزان والعضوية',
  },
  english: {
    icon: '🇬🇧',
    color: 'from-cyan-600 to-blue-700',
    desc: 'القواعد الإنجليزية الهندسية، المصطلحات التخصصية، والقطع الفنية',
  },
};

export default function RealisticBubbleSheetSimulator({ availableExams = [] }: RealisticBubbleSheetSimulatorProps) {
  const { user } = useAuth();

  // Stage: 'select-subject' first, then 'taking-exam'
  const [stage, setStage] = useState<'select-subject' | 'taking-exam'>('select-subject');

  // Active selected exam
  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    return availableExams[0]?.id || '';
  });

  const currentExam = availableExams.find((e) => e.id === selectedExamId) || availableExams[0];
  const questions = currentExam?.questions || [];

  const [selectedModel, setSelectedModel] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [seatNumber, setSeatNumber] = useState(() => user?.seatNumber || '14028');
  const [bubbles, setBubbles] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120 * 60); // 2 Hours (ساعتان)
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    if (user?.seatNumber) {
      setSeatNumber(user.seatNumber);
    }
  }, [user?.seatNumber]);

  // Handle start exam for a chosen exam
  const handleStartExam = (examId: string) => {
    setSelectedExamId(examId);
    setBubbles({});
    setSubmitted(false);
    setSecondsRemaining(120 * 60);
    setStage('taking-exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    let interval: any = null;
    if (stage === 'taking-exam' && timerActive && !submitted) {
      interval = setInterval(() => {
        setSecondsRemaining((s) => {
          if (s <= 1) {
            setSubmitted(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, timerActive, submitted]);

  const handleBubble = (qOrder: number, opt: 'A' | 'B' | 'C' | 'D') => {
    if (submitted) return;
    setBubbles((prev) => ({ ...prev, [qOrder]: opt }));
  };

  const calculateResults = () => {
    let score = 0;
    let totalMarks = currentExam?.totalMarks || 100;
    const perQuestionMarks = questions.length > 0 ? totalMarks / questions.length : 1;

    const questionResults: {
      question: ExamQuestion;
      studentChoiceLetter?: 'A' | 'B' | 'C' | 'D';
      correctChoiceLetter: 'A' | 'B' | 'C' | 'D';
      isCorrect: boolean;
    }[] = [];

    questions.forEach((q, idx) => {
      const qOrder = q.order || idx + 1;
      const studentLetter = bubbles[qOrder];

      // Find which choice is correct
      const correctIdx = q.choices.findIndex((c) => c.isCorrect);
      const correctLetter: 'A' | 'B' | 'C' | 'D' = LETTER_MAP[correctIdx >= 0 ? correctIdx : 0];

      const isCorrect = studentLetter === correctLetter;
      if (isCorrect) {
        score += perQuestionMarks;
      }

      questionResults.push({
        question: q,
        studentChoiceLetter: studentLetter,
        correctChoiceLetter: correctLetter,
        isCorrect,
      });
    });

    const finalScore = Math.round(score);
    const percentage = Math.round((finalScore / totalMarks) * 100);

    return {
      score: finalScore,
      total: totalMarks,
      percentage,
      questionResults,
      answeredCount: Object.keys(bubbles).length,
    };
  };

  const results = submitted ? calculateResults() : null;

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Group available exams by subject
  const subjectsMap: Record<string, { title: string; slug: string; exams: ExamItem[] }> = {};

  availableExams.forEach((exam) => {
    const slug = exam.subject?.slug || 'general';
    const title = exam.subject?.title || 'عام';
    if (!subjectsMap[slug]) {
      subjectsMap[slug] = { title, slug, exams: [] };
    }
    subjectsMap[slug].exams.push(exam);
  });

  const subjectKeys = Object.keys(subjectsMap);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-tajawal animate-fade-in">
      {/* ----------------- STAGE 1: SELECT SUBJECT ----------------- */}
      {stage === 'select-subject' && (
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black border border-brand-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>الخطوة 1: اختيار المادة الدراسية ورقم الجلوس 📋</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
                امتحانات المعادلة السابقة بابل شيت
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                اختر المادة والدور الذي ترغب في أدائه (2021 إلى 2025)، وسيتم نقلك مباشرة إلى ورقة الامتحان الإلكترونية الرسمية (50 سؤالاً - مؤقت ساعتان كاملتان - وتصحيح بابل شيت فوري).
              </p>

              {/* Student Seat Number Card */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                    📋
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300 block font-bold">رقم الجلوس الرسمي للطالب:</span>
                    <span className="font-mono font-black text-base text-emerald-300 tracking-wider">
                      {seatNumber}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-300 block font-bold">نموذج ورقة الإجابة:</span>
                    <span className="font-black text-xs text-amber-300">النموذج ({selectedModel})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['A', 'B', 'C', 'D'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSelectedModel(m)}
                        className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition ${
                          selectedModel === m
                            ? 'bg-emerald-500 text-white shadow-md scale-110'
                            : 'bg-white/20 text-slate-200 hover:bg-white/30'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subjects Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  اختر المادة لبدء الامتحان الإلكتروني
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  جميع الامتحانات معتمدة رسمياً بـ 50 سؤالاً ومؤقت ساعتان (120 دقيقة)
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                {subjectKeys.length} مواد متاحة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectKeys.map((slug) => {
                const sub = subjectsMap[slug];
                const meta = SUBJECT_META[slug] || {
                  icon: '📚',
                  color: 'from-slate-700 to-slate-900',
                  desc: 'امتحان شامل للمادة وفق نماذج بابل شيت السابقة',
                };
                const defaultExam = sub.exams[0];

                return (
                  <div
                    key={slug}
                    className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-soft hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.color} text-white flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform`}
                        >
                          {meta.icon}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                            50 سؤال • ساعتان ⏱️
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            الدرجة: 100
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                          {sub.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                          {meta.desc}
                        </p>
                      </div>

                      {/* Available Exam Years */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] text-slate-400 font-bold block">
                          النماذج الامتحانية المتاحة:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {sub.exams.map((ex) => (
                            <button
                              key={ex.id}
                              type="button"
                              onClick={() => handleStartExam(ex.id)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 text-slate-700 dark:text-slate-300 hover:text-white text-[10px] font-black transition border border-slate-200 dark:border-slate-700"
                            >
                              دور {ex.year || 2025}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Start Action Button */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-5">
                      <button
                        type="button"
                        onClick={() => handleStartExam(defaultExam.id)}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition hover:scale-102 active:scale-95"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span>بدء الامتحان الإلكتروني الآن ⚡</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- STAGE 2: TAKING EXAM & RESULTS ----------------- */}
      {stage === 'taking-exam' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top Floating Control Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft">
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setStage('select-subject')}
                className="inline-flex items-center gap-1.5 text-xs font-black text-brand-600 hover:underline mb-1"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>← اختيار مادة أخرى</span>
              </button>

              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center font-black text-sm">
                  📝
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {currentExam?.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    النموذج ({selectedModel}) • {questions.length} سؤال بابل شيت
                  </p>
                </div>
              </div>
            </div>

            {/* Timer & Seat Box */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-900 dark:text-indigo-200 shadow-xs">
                <span className="text-[10px] text-indigo-500 block">رقم الجلوس:</span>
                <span className="font-mono font-black text-sm">{seatNumber}</span>
              </div>

              {!submitted && (
                <div
                  className={`flex items-center gap-2 p-3 sm:p-3.5 rounded-2xl font-mono text-sm font-black shadow-md border ${
                    secondsRemaining < 600
                      ? 'bg-rose-600 text-white animate-pulse border-rose-700'
                      : 'bg-slate-900 text-white dark:bg-slate-800 border-slate-700'
                  }`}
                >
                  <Clock className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                  <span>الوقت المتبقي: {formatTimer(secondsRemaining)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Testing View */}
          {!submitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Questions Paper (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-[32px] p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-brand-500" />
                      <span>ورقة الأسئلة الرسمية ({questions.length} سؤال)</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-bold">
                      تمت الإجابة: {Object.keys(bubbles).length} من {questions.length}
                    </span>
                  </div>

                  {questions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <p>لا توجد أسئلة مضافة في هذا النموذج بعد.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((q, idx) => {
                        const qOrder = q.order || idx + 1;
                        const studentShade = bubbles[qOrder];

                        return (
                          <div
                            key={q.id}
                            id={`question-${qOrder}`}
                            className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3 transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-black text-xs text-brand-600 dark:text-brand-400">
                                سؤال ({qOrder})
                              </span>
                              {studentShade && (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                                  تم التظليل: ({studentShade}) {ARABIC_LETTERS[studentShade]}
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                              {q.questionText}
                            </p>

                            {/* Choices Preview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.choices.map((c, cIdx) => {
                                const choiceLetter = LETTER_MAP[cIdx];
                                const isSelected = studentShade === choiceLetter;

                                return (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleBubble(qOrder, choiceLetter)}
                                    className={`p-2.5 rounded-xl border text-right text-xs font-bold transition flex items-center gap-2.5 ${
                                      isSelected
                                        ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-200 shadow-xs'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                                    }`}
                                  >
                                    <span
                                      className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 border ${
                                        isSelected
                                          ? 'bg-brand-600 text-white border-brand-600'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                                      }`}
                                    >
                                      {ARABIC_LETTERS[choiceLetter]}
                                    </span>
                                    <span className="flex-1 leading-snug">{c.text}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Physical Bubble Sheet Replica (5 cols) */}
              <div className="lg:col-span-5 space-y-4 sticky top-24">
                <div className="bg-amber-50/70 dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border-2 border-dashed border-amber-300 dark:border-slate-700 space-y-5">
                  {/* Sheet Header */}
                  <div className="text-center space-y-1 pb-4 border-b-2 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-black text-slate-800 dark:text-slate-200">
                      <span>المجلس الأعلى للجامعات • ورقة بابل شيت المعادلة الرسمية</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      ورقة إجابة البابل شيت (BUBBLE SHEET)
                    </h4>
                  </div>

                  {/* Model & Seat Number */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">رقم الجلوس:</span>
                      <input
                        type="text"
                        value={seatNumber}
                        onChange={(e) => setSeatNumber(e.target.value)}
                        className="w-full bg-transparent font-mono font-black text-slate-900 dark:text-white outline-hidden text-xs"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">النموذج:</span>
                        <span className="font-black text-brand-600 font-mono">({selectedModel})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['A', 'B', 'C', 'D'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSelectedModel(m)}
                            className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                              selectedModel === m ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress Count */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>المظلل: {Object.keys(bubbles).length} من {questions.length}</span>
                    <span className="text-emerald-600 font-mono">
                      {questions.length > 0 ? Math.round((Object.keys(bubbles).length / questions.length) * 100) : 0}%
                    </span>
                  </div>

                  {/* Bubble Grid */}
                  <div className="space-y-2 pt-1 max-h-[480px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-5 text-center text-[10px] font-black text-slate-400 pb-1 sticky top-0 bg-amber-50/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
                      <span>س</span>
                      <span>(أ) A</span>
                      <span>(ب) B</span>
                      <span>(ج) C</span>
                      <span>(د) D</span>
                    </div>

                    {questions.map((q, idx) => {
                      const qOrder = q.order || idx + 1;
                      return (
                        <div
                          key={q.id}
                          className="grid grid-cols-5 items-center text-center p-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                        >
                          <a
                            href={`#question-${qOrder}`}
                            className="font-mono font-black text-xs text-slate-600 dark:text-slate-300 hover:text-brand-600"
                          >
                            {qOrder}
                          </a>

                          {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                            const isShaded = bubbles[qOrder] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleBubble(qOrder, opt)}
                                className="flex items-center justify-center py-1 group/btn"
                                title={`تظليل الخيار (${opt}) للسؤال ${qOrder}`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${
                                    isShaded
                                      ? 'bg-slate-900 dark:bg-emerald-500 text-white border-slate-900 dark:border-emerald-400 shadow-inner scale-110'
                                      : 'border-slate-400 dark:border-slate-500 text-slate-600 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white'
                                  }`}
                                >
                                  {opt}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Sheet Button */}
                  <button
                    type="button"
                    onClick={() => setSubmitted(true)}
                    disabled={questions.length === 0}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>تسليم وتصحيح ورقة البابل شيت إلكترونياً 🚀</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Post-Exam Smart Analytics & Explanations Report */
            <div className="space-y-8 animate-scale-up">
              {/* Score Card */}
              <div className="rounded-[36px] bg-white dark:bg-slate-900 p-8 text-center space-y-4 border border-slate-200 dark:border-slate-800 shadow-soft">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                  🏆
                </div>

                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                    درجتك النهائية: {results?.score} من {results?.total} ({results?.percentage}%)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    تم التصحيح الفوري لنموذج {currentExam?.title} (النموذج {selectedModel})
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setBubbles({});
                      setSecondsRemaining(120 * 60);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة أداء هذا الامتحان</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStage('select-subject');
                      setSubmitted(false);
                      setBubbles({});
                    }}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md transition"
                  >
                    اختيار مادة أخرى 📋
                  </button>
                </div>
              </div>

              {/* Detailed Question by Question Solution & Explanations */}
              <div className="rounded-[36px] bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-soft">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-brand-600" />
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      مراجعة تفصيلية لجميع الـ 50 سؤالاً مع خطوات الحل النموذجية
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {results?.questionResults.filter((r) => r.isCorrect).length} صحيحة من {results?.questionResults.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {results?.questionResults.map((r, idx) => {
                    const qOrder = r.question.order || idx + 1;
                    return (
                      <div
                        key={r.question.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          r.isCorrect
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            سؤال ({qOrder})
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                              r.isCorrect
                                ? 'bg-emerald-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            {r.isCorrect ? '✅ إجابة صحيحة' : '❌ إجابة خاطئة'}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                          {r.question.questionText}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block">إجابتك التي ظللتها:</span>
                            <span className={`font-black ${r.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {r.studentChoiceLetter
                                ? `(${r.studentChoiceLetter}) ${ARABIC_LETTERS[r.studentChoiceLetter]}`
                                : 'لم تقم بتظليل إجابة'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">الإجابة النموذجية الصحيحة:</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-300">
                              ({r.correctChoiceLetter}) {ARABIC_LETTERS[r.correctChoiceLetter]}
                            </span>
                          </div>
                        </div>

                        {r.question.explanation && (
                          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                            <span className="font-black flex items-center gap-1">
                              <span>💡 شرح طريقة الحل النموذجية:</span>
                            </span>
                            <p className="font-medium leading-relaxed">
                              {r.question.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
