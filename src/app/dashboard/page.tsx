import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  BookOpen,
  FileCheck2,
  Trophy,
  Clock,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Award,
  Bookmark,
  PlayCircle,
  Bell,
  Sparkles,
  ChevronLeft,
  Users,
  MessageSquare,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'لوحة تحكم الطالب | Moadla Pro',
  description: 'متابعة شاملة لتقدم الطالب، الدروس المكتملة، نتائج الامتحانات، والمواد الدراسية.',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/dashboard');
  }

  // 1. Fetch student completed lessons
  const completedLessons = await prisma.lessonProgress.findMany({
    where: { userId: user.id, isCompleted: true },
    include: {
      lesson: {
        include: {
          unit: {
            include: {
              subject: true,
            },
          },
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  // 2. Fetch exam attempts
  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    include: {
      exam: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
  });

  // 3. Fetch subjects and calculate individual progress
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    include: {
      section: true,
      units: {
        include: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });

  const completedLessonIdSet = new Set(completedLessons.map((cl: any) => cl.lessonId));

  const subjectsWithProgress = subjects.map((sub: any) => {
    const allLessonIds = sub.units.flatMap((u: any) => u.lessons.map((l: any) => l.id));
    const totalCount = allLessonIds.length;
    const completedCount = allLessonIds.filter((id: any) => completedLessonIdSet.has(id)).length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return {
      ...sub,
      totalLessons: totalCount,
      completedLessons: completedCount,
      progressPercentage: progress,
    };
  });

  // 4. Calculate overall stats
  const totalCompletedLessons = completedLessons.length;
  const totalAttempts = attempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(attempts.reduce((acc: number, a: any) => acc + a.percentage, 0) / totalAttempts)
      : 0;

  // 5. Fetch favorites
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  // 6. Fetch recent unread notifications
  const recentNotifications = await prisma.notification.findMany({
    where: { userId: user.id, isRead: false },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  // 7. Fetch successful students in engineering equivalence
  const successfulEngineeringStudents = await prisma.examAttempt.findMany({
    where: { isPassed: true },
    include: {
      user: true,
      exam: {
        include: {
          section: true,
        },
      },
    },
    orderBy: { completedAt: 'desc' },
    take: 12,
  });

  const engineeringSuccessNames = successfulEngineeringStudents
    .filter((attempt: any) => attempt.exam.section?.slug === 'engineering')
    .map((attempt: any) => attempt.user.name)
    .filter((name: any, index: number, arr: any[]) => name && arr.indexOf(name) === index)
    .slice(0, 8);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Welcome Banner */}
      <div className="rounded-[28px] bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1e40af] text-white p-6 sm:p-10 shadow-2xl border border-brand-700/30 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(37,99,235,0.12),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-200 text-xs font-black border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-brand-300" />
            <span>لوحة المتابعة الأكاديمية</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-tajawal leading-tight">
            مرحبًا، <span className="text-brand-300">{user.name}</span> 👋
          </h1>
          <p className="text-sm text-blue-200/80 leading-relaxed">
            استمر في التحصيل والمذاكرة بثبات. إليك نظرة شاملة على مستواك الدراسي ونسب إنجازك في المواد.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 flex-wrap">
          <Link
            href="/exams"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-lg shadow-emerald-700/30 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>خوض امتحان جديد</span>
          </Link>
          <Link
            href="/games"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <span>🎮</span>
            <span>ألعاب تعليمية</span>
          </Link>
          <Link
            href="/groups"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <Users className="w-4 h-4" />
            <span>المجموعات</span>
          </Link>
          <Link
            href="/subjects"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>المواد الدراسية</span>
          </Link>
        </div>
      </div>

      {/* Notifications Warning if unread */}
      {recentNotifications.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                لديك {recentNotifications.length} إشعارات وتنبيهات جديدة غير مقروءة
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {recentNotifications[0].title}
              </p>
            </div>
          </div>
          <Link
            href="/notifications"
            className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline shrink-0"
          >
            عرض الكل ←
          </Link>
        </div>
      )}

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50/60 to-transparent dark:from-brand-950/40 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-500/30 flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-0.5">الدروس المكتملة</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-tajawal leading-none">
              {totalCompletedLessons}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">درس تعليمي</p>
          </div>
        </div>

        <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/60 to-transparent dark:from-emerald-950/40 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 flex-shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-0.5">الامتحانات المنجزة</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-tajawal leading-none">
              {totalAttempts}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">امتحان تفاعلي</p>
          </div>
        </div>

        <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent dark:from-amber-950/40 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30 flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-0.5">متوسط الدرجات</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-tajawal leading-none">
              {avgScore}%
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">في الامتحانات</p>
          </div>
        </div>

        <div className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/60 to-transparent dark:from-purple-950/40 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 text-white flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mb-0.5">المحفوظات</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-tajawal leading-none">
              {favorites.length}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">عنصر في المفضلة</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Subjects Progress (Left/Right) & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Subjects Progress Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>نسب الإنجاز في المواد الدراسية</span>
            </h2>
            <Link
              href="/subjects"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              جميع المواد ←
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjectsWithProgress.map((sub: any) => (
              <div
                key={sub.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4 hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      {sub.section.title}
                    </span>
                    <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                      {sub.progressPercentage}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
                    {sub.title}
                  </h3>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-600 to-accent-emerald h-full rounded-full transition-all duration-500"
                      style={{ width: `${sub.progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{sub.completedLessons} من {sub.totalLessons} درس منجز</span>
                    <span>{sub.units.length} وحدات</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href={`/subjects/${sub.slug}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>متابعة المذاكرة</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Last Completed Lessons */}
          {completedLessons.length > 0 && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
                <span>آخر الدروس التي أتممتها مؤخراً</span>
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {completedLessons.slice(0, 4).map((record: any) => (
                  <div
                    key={record.id}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
                      <div className="truncate">
                        <Link
                          href={
                            user.role === 'ADMIN'
                              ? `/subjects/${record.lesson.unit.subject.slug}/units/${record.lesson.unit.id}/lessons/${record.lessonId}/manage`
                              : `/lessons/${record.lessonId}`
                          }
                          className="font-bold text-slate-800 dark:text-slate-200 hover:text-brand-600 truncate block"
                        >
                          {record.lesson.title}
                        </Link>
                        <span className="text-[11px] text-slate-400">
                          {record.lesson.unit.subject.title}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={
                        user.role === 'ADMIN'
                          ? `/subjects/${record.lesson.unit.subject.slug}/units/${record.lesson.unit.id}/lessons/${record.lessonId}/manage`
                          : `/lessons/${record.lessonId}`
                      }
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-600 dark:text-slate-300 font-semibold shrink-0"
                    >
                      مراجعة الدرس
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Recent Exam Attempts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-accent-emerald" />
                <span>آخر الامتحانات والدرجات</span>
              </h3>
              <Link
                href="/dashboard/exams"
                className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
              >
                السجل الكامل
              </Link>
            </div>

            {attempts.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  لم تقم بخوض أي امتحانات تفاعلية بعد.
                </p>
                <Link
                  href="/exams"
                  className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm"
                >
                  اختر امتحان وابدأ الآن
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {attempts.slice(0, 5).map((att: any) => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                        {att.exam.title}
                      </h4>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          att.isPassed
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                        }`}
                      >
                        {Math.round(att.percentage)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>الدرجة: {att.score} / {att.totalPossible}</span>
                      <Link
                        href={`/exams/${att.examId}/results/${att.id}`}
                        className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                      >
                        عرض التقرير ←
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-brand-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-brand-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>طلاب نجحوا في معادلة كلية الهندسة</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                {engineeringSuccessNames.length} اسم
              </span>
            </div>

            {engineeringSuccessNames.length > 0 ? (
              <div className="space-y-2">
                {engineeringSuccessNames.map((name: string, index: number) => (
                  <div
                    key={`${name}-${index}`}
                    className="flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-800/50 px-3 py-2.5"
                  >
                    <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-300 bg-white/60 dark:bg-slate-900/50 p-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  لا توجد بيانات ناجحين متاحة حاليًا في معادلة كلية الهندسة.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
