import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  FileCheck2,
  Clock,
  Award,
  AlertCircle,
  PlayCircle,
  History,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!exam) return { title: 'الامتحان غير موجود | Moadla Pro' };

  return {
    title: `${exam.title} | Moadla Pro`,
    description: exam.description || 'امتحان تفاعلي لمعادلات الجامعات مع تصحيح فوري.',
  };
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: true,
      section: true,
      questions: {
        select: { id: true, marks: true },
      },
    },
  });

  if (!exam) {
    notFound();
  }

  // Fetch attempts for current user
  let previousAttempts: any[] = [];
  if (currentUser) {
    previousAttempts = await prisma.examAttempt.findMany({
      where: {
        userId: currentUser.id,
        examId: exam.id,
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  const questionsCount = exam.questions.length;

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
        <span className="text-slate-800 dark:text-slate-200 font-bold truncate">
          {exam.title}
        </span>
      </nav>

      {/* Main Exam Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-soft space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-extrabold">
              {exam.subject?.title || exam.section?.title || 'امتحان شامل'}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
              عام {exam.year || 2024}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
            {exam.title}
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-3xl">
            {exam.description}
          </p>
        </div>

        {/* Exam Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span>مدة الامتحان</span>
            </span>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal">
              {exam.durationMinutes} دقيقة
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>عدد الأسئلة</span>
            </span>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal">
              {questionsCount} سؤال
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>الدرجة الكلية</span>
            </span>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal">
              {exam.totalMarks} درجة
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-rose-500" />
              <span>درجة النجاح</span>
            </span>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal">
              {exam.passMarks} درجة
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 p-6 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-800/40">
          <h3 className="text-sm font-bold text-brand-800 dark:text-brand-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-600" />
            <span>تعليمات وقواعد الاختبار:</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed">
            <li>يبدأ العداد الزمني تلقائياً بمجرد الضغط على زر "بدء الامتحان".</li>
            <li>يتم تسليم الامتحان تلقائياً عند انتهاء الوقت المحدد.</li>
            <li>يمكنك مراجعة جميع الأسئلة والتنقل بينها بحرية قبل تأكيد التسليم النهائي.</li>
            <li>بعد التسليم، ستحصل فوراً على نتيجتك التفصيلية مع شرح وافٍ لجميع الإجابات.</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            href={`/exams/${exam.id}/take`}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 hover:from-brand-800 hover:to-brand-600 text-white font-extrabold text-base shadow-xl shadow-brand-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01]"
          >
            <PlayCircle className="w-5 h-5" />
            <span>بدء الامتحان الآن</span>
          </Link>
        </div>
      </div>

      {/* Previous Attempts History for logged in student */}
      {previousAttempts.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-soft space-y-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
            <History className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>محاولاتك السابقة في هذا الامتحان ({previousAttempts.length})</span>
          </h2>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {previousAttempts.map((att, idx) => (
              <div
                key={att.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {att.isPassed ? (
                    <CheckCircle2 className="w-6 h-6 text-accent-emerald shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-accent-rose shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        المحاولة #{previousAttempts.length - idx}
                      </span>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          att.isPassed
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                        }`}
                      >
                        {att.isPassed ? 'ناجح' : 'لم يجتز'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(att.completedAt)} • استغرقت {Math.round(att.timeSpentSeconds / 60)} دقيقة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-base font-black text-slate-900 dark:text-white font-tajawal">
                      {att.score} / {att.totalPossible}
                    </p>
                    <p className="text-xs text-slate-400">{Math.round(att.percentage)}%</p>
                  </div>

                  <Link
                    href={`/exams/${exam.id}/results/${att.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-200 hover:text-brand-600 text-xs font-bold transition-colors"
                  >
                    مراجعة الإجابات
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
