import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  LayoutDashboard,
  HelpCircle,
  ArrowLeft,
  ChevronLeft,
  BookOpen,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string; attemptId: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'نتيجة وتحليل الامتحان | Moadla Pro',
    description: 'عرض النتيجة التفصيلية ومراجعة الأسئلة مع الإجابات النموذجية والشروحات.',
  };
}

export default async function ExamResultsPage({ params }: PageProps) {
  const { id, attemptId } = await params;

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          subject: true,
          questions: {
            orderBy: { order: 'asc' },
            include: {
              choices: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      },
      answers: {
        include: {
          selectedChoice: true,
        },
      },
    },
  });

  if (!attempt || attempt.examId !== id) {
    notFound();
  }

  const exam = attempt.exam;
  const correctCount = attempt.answers.filter((a) => a.isCorrect).length;
  const totalQuestions = exam.questions.length;
  const incorrectCount = totalQuestions - correctCount;

  // Map answers by questionId for fast lookup
  const answersMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/exams" className="hover:text-brand-600 transition-colors">
          الامتحانات
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href={`/exams/${exam.id}`} className="hover:text-brand-600 transition-colors truncate max-w-xs">
          {exam.title}
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">تقرير النتيجة</span>
      </nav>

      {/* Hero Score Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-soft text-center space-y-6">
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg ${
            attempt.isPassed
              ? 'bg-emerald-500 text-white shadow-emerald-500/25'
              : 'bg-rose-500 text-white shadow-rose-500/25'
          }`}
        >
          {attempt.isPassed ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <XCircle className="w-10 h-10" />
          )}
        </div>

        <div className="space-y-2">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-block ${
              attempt.isPassed
                ? 'bg-emerald-50 dark:bg-emerald-950 text-accent-emerald'
                : 'bg-rose-50 dark:bg-rose-950 text-accent-rose'
            }`}
          >
            {attempt.isPassed ? 'تم اجتياز الامتحان بنجاح 🎉' : 'لم يتم اجتياز درجة النجاح ⚠️'}
          </span>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
            {exam.title}
          </h1>
        </div>

        {/* Score & Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-400 font-semibold">الدرجة المحرزة</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-tajawal mt-1">
              {attempt.score} <span className="text-xs text-slate-400">/ {attempt.totalPossible}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-400 font-semibold">النسبة المئوية</span>
            <p
              className={`text-2xl font-black font-tajawal mt-1 ${
                attempt.isPassed ? 'text-accent-emerald' : 'text-accent-rose'
              }`}
            >
              {Math.round(attempt.percentage)}%
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-400 font-semibold">إجابات صحيحة</span>
            <p className="text-2xl font-black text-accent-emerald font-tajawal mt-1">
              {correctCount} <span className="text-xs text-slate-400">من {totalQuestions}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs text-slate-400 font-semibold">الوقت المستغرق</span>
            <p className="text-2xl font-black text-brand-600 dark:text-brand-400 font-tajawal mt-1">
              {Math.round(attempt.timeSpentSeconds / 60)} <span className="text-xs text-slate-400">دقيقة</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={`/exams/${exam.id}/take`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة الامتحان</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة تحكم الطالب</span>
          </Link>
        </div>
      </div>

      {/* Detailed Question by Question Review */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          <span>مراجعة الأسئلة والشروحات النموذجية</span>
        </h2>

        <div className="space-y-6">
          {exam.questions.map((question, qIdx) => {
            const userAnswer = answersMap.get(question.id);
            const isCorrect = userAnswer?.isCorrect ?? false;
            const correctChoice = question.choices.find((c) => c.isCorrect);

            return (
              <div
                key={question.id}
                className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-soft space-y-6 ${
                  isCorrect
                    ? 'border-emerald-200 dark:border-emerald-950/60'
                    : 'border-rose-200 dark:border-rose-950/60'
                }`}
              >
                {/* Question Header & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {question.marks} درجات
                    </span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-accent-emerald'
                        : 'bg-rose-50 dark:bg-rose-950 text-accent-rose'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>إجابة صحيحة</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>إجابة خاطئة</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Question text */}
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-tajawal leading-relaxed">
                  {question.questionText}
                </div>

                {/* Choices breakdown */}
                <div className="space-y-2.5">
                  {question.choices.map((choice) => {
                    const isUserPick = userAnswer?.selectedChoiceId === choice.id;
                    const isTheCorrectOne = choice.isCorrect;

                    let choiceStyle = 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';

                    if (isTheCorrectOne) {
                      choiceStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20';
                    } else if (isUserPick && !isTheCorrectOne) {
                      choiceStyle = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold ring-2 ring-rose-500/20';
                    }

                    return (
                      <div
                        key={choice.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 text-xs sm:text-sm ${choiceStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{choice.text}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isUserPick && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
                              إجابتك
                            </span>
                          )}
                          {isTheCorrectOne && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
                              الإجابة النموذجية الصحيحة ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Step-by-step Explanation Box */}
                {question.explanation && (
                  <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/40 space-y-2">
                    <p className="text-xs font-black text-brand-800 dark:text-brand-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-brand-600" />
                      <span>شرح وتفسير الإجابة:</span>
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
