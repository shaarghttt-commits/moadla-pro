import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  Bookmark,
  BookOpen,
  PlayCircle,
  FileCheck2,
  ArrowLeft,
  ChevronLeft,
} from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'قائمتي المفضلة | Moadla Pro',
  description: 'المواد والدروس والامتحانات التي أضفتها إلى المفضلة للرجوع إليها سريعاً.',
};

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/favorites');
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  const subjectIds = favorites
    .filter((f) => f.targetType === 'SUBJECT')
    .map((f) => f.targetId);
  const lessonIds = favorites
    .filter((f) => f.targetType === 'LESSON')
    .map((f) => f.targetId);
  const examIds = favorites
    .filter((f) => f.targetType === 'EXAM')
    .map((f) => f.targetId);

  const [favSubjects, favLessons, favExams] = await Promise.all([
    prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      include: { section: true },
    }),
    prisma.lesson.findMany({
      where: { id: { in: lessonIds } },
      include: {
        unit: {
          include: { subject: true },
        },
      },
    }),
    prisma.exam.findMany({
      where: { id: { in: examIds } },
      include: { subject: true },
    }),
  ]);

  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
        <span className="text-slate-800 dark:text-slate-200 font-bold">المفضلة</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-3">
          <Bookmark className="w-7 h-7 text-amber-500 fill-current" />
          <span>المواد والدروس والامتحانات المفضلة</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          عناصرك المحفوظة للوصول إليها والمذاكرة بنقرة واحدة.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            قائمة المفضلة فارغة حالياً
          </h3>
          <p className="text-xs text-slate-500">
            يمكنك حفظ أي مادة أو درس أو امتحان بالضغط على زر المفضلة (⭐).
          </p>
          <Link
            href="/sections"
            className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm"
          >
            استكشاف المحتوى
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Favorite Subjects */}
          {favSubjects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>المواد الدراسية المحفوظة ({favSubjects.length})</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favSubjects.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/subjects/${sub.slug}`}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 shadow-soft transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                        {sub.section.title}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-2 group-hover:text-brand-600 transition-colors">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {sub.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-bold">
                      <span>فتح المادة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Lessons */}
          {favLessons.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-accent-emerald" />
                <span>الدروس المحفوظة ({favLessons.length})</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favLessons.map((l) => (
                  <Link
                    key={l.id}
                    href={`/lessons/${l.id}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-soft transition-all group flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        {l.unit.subject.title} • {l.unit.title}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                        {l.title}
                      </h3>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-accent-emerald flex items-center justify-center shrink-0">
                      <PlayCircle className="w-5 h-5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Exams */}
          {favExams.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                <span>الامتحانات المحفوظة ({favExams.length})</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favExams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/exams/${exam.id}`}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 shadow-soft transition-all group flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        عام {exam.year || 2024} • {exam.durationMinutes} دقيقة
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                        {exam.title}
                      </h3>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
