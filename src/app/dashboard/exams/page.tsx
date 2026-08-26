import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  RotateCcw,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'سجل امتحاناتي ونتائجي | Moadla Pro',
  description: 'سجل كامل لجميع المحاولات والامتحانات التفاعلية التي أداها الطالب مع التقارير والدرجات.',
};

export default async function StudentExamsHistoryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/dashboard/exams');
  }

  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    include: {
      exam: {
        include: {
          subject: true,
          section: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/dashboard" className="hover:text-brand-600 transition-colors">
          لوحة تحكم الطالب
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">سجل الامتحانات</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">
            سجل اختباراتي السابقة
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            استعرض جميع محاولاتك السابقة وراجع إجاباتك بالتفصيل.
          </p>
        </div>

        <Link
          href="/exams"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto transition-all"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>خوض امتحان جديد</span>
        </Link>
      </div>

      {/* List of Attempts */}
      {attempts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            لم تقم بخوض أي امتحانات تفاعلية بعد
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            تصفح بنك الامتحانات الآن وجرّب نظام البابل شيت الحديث مع التصحيح التلقائي.
          </p>
          <Link
            href="/exams"
            className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-600/20"
          >
            استعراض الامتحانات المتاحة
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((att, idx) => (
            <div
              key={att.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                    att.isPassed
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  }`}
                >
                  {att.isPassed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      {att.exam.subject?.title || att.exam.section?.title}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-400">
                      {formatDate(att.completedAt)}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal">
                    {att.exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    استغرقت {Math.round(att.timeSpentSeconds / 60)} دقيقة في الإجابة
                  </p>
                </div>
              </div>

              {/* Score & Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
                      {att.score}
                    </span>
                    <span className="text-xs text-slate-400">/ {att.totalPossible}</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      att.isPassed ? 'text-accent-emerald' : 'text-accent-rose'
                    }`}
                  >
                    {Math.round(att.percentage)}% ({att.isPassed ? 'ناجح' : 'راسب'})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/exams/${att.examId}/results/${att.id}`}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-200 hover:text-brand-600 text-xs font-bold transition-colors"
                  >
                    مراجعة الإجابات
                  </Link>

                  <Link
                    href={`/exams/${att.examId}/take`}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-brand-600 transition-colors"
                    title="إعادة الامتحان"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
