import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import {
  Users,
  BookOpen,
  Layers,
  FileCheck2,
  TrendingUp,
  Award,
  Plus,
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'لوحة تحكم الإدارة | Moadla Pro',
  description: 'إحصائيات المنصة وإدارة المحتوى والطلاب.',
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin');
  }

  // Fetch metrics in parallel
  const [
    totalStudents,
    totalSections,
    totalSubjects,
    totalLessons,
    totalExams,
    totalAttempts,
    recentStudents,
    recentAttempts,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.section.count(),
    prisma.subject.count(),
    prisma.lesson.count(),
    prisma.exam.count(),
    prisma.examAttempt.count(),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.examAttempt.findMany({
      orderBy: { completedAt: 'desc' },
      take: 6,
      include: {
        user: true,
        exam: true,
      },
    }),
  ]);

  return (
    <AdminLayoutClient>
      <div className="space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold pt-2">إجمالي الطلاب</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
              {totalStudents}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold pt-2">الأقسام التعليمية</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
              {totalSections}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold pt-2">المواد الدراسية</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
              {totalSubjects}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <PlayCircle className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold pt-2">الدروس المشروحة</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
              {totalLessons}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-accent-emerald flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold pt-2">الامتحانات المتاحة</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
              {totalExams}
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-[11px] text-slate-400 font-semibold pt-2">إجمالي المحاولات</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
              {totalAttempts}
            </p>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white font-tajawal">
            إجراءات سريعة:
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/sections"
              className="px-4 py-2.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد</span>
            </Link>

            <Link
              href="/admin/subjects"
              className="px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مادة جديدة</span>
            </Link>

            <Link
              href="/admin/lessons"
              className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة درس جديد</span>
            </Link>

            <Link
              href="/admin/exams"
              className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-accent-emerald hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء امتحان تفاعلي جديد</span>
            </Link>

            <Link
              href="/admin/files"
              className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة امتحان سابق/ملف</span>
            </Link>

            <Link
              href="/admin/notifications"
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-700 hover:text-white dark:hover:bg-slate-700 dark:hover:text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إرسال إشعار للطلاب</span>
            </Link>
          </div>
        </div>

        {/* Tables Grid: Recent Students & Recent Exam Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Recent Registrations (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                <span>أحدث الطلاب المسجلين</span>
              </h3>
              <Link
                href="/admin/students"
                className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                عرض كل الطلاب
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentStudents.map((stu) => (
                <div key={stu.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                      {stu.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{stu.name}</p>
                      <p className="text-[11px] text-slate-400">{stu.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{formatDate(stu.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Exam Attempts (6 cols) */}
          <div className="lg:col-span-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-accent-emerald" />
                <span>أحدث نتائج الامتحانات</span>
              </h3>
              <Link
                href="/admin/exams"
                className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                إدارة الامتحانات التفاعلية
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentAttempts.map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 truncate">
                    {att.isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-accent-rose shrink-0" />
                    )}
                    <div className="truncate">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {att.user.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{att.exam.title}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        att.isPassed
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {Math.round(att.percentage)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutClient>
  );
}
