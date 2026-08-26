import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  BookOpen,
  FileCheck2,
  Clock,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = await prisma.section.findUnique({
    where: { slug },
  });

  if (!section) return { title: 'القسم غير موجود | Moadla Pro' };

  return {
    title: `${section.title} | Moadla Pro`,
    description: section.description,
  };
}

export default async function SectionDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const section = await prisma.section.findUnique({
    where: { slug },
    include: {
      subjects: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          units: {
            include: {
              _count: {
                select: { lessons: true },
              },
            },
          },
          exams: {
            where: { isPublished: true },
          },
        },
      },
      exams: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        include: {
          subject: true,
          _count: {
            select: { questions: true },
          },
        },
      },
    },
  });

  if (!section) {
    notFound();
  }

  // Calculate total lessons in this section
  const totalLessons = section.subjects.reduce((acc, sub) => {
    return (
      acc +
      sub.units.reduce((uAcc, unit) => uAcc + unit._count.lessons, 0)
    );
  }, 0);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/sections" className="hover:text-brand-600 transition-colors">
          الأقسام
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">{section.title}</span>
      </nav>

      {/* Hero Section Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-brand-700/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-bold border border-white/10">
            <GraduationCap className="w-4 h-4" />
            <span>مسار معتمد رسمياً</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-tajawal">
            {section.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {section.description}
          </p>

          {/* Quick Stats in Hero */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white font-tajawal">
                {section.subjects.length}
              </p>
              <p className="text-xs text-slate-400">مواد دراسية</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-brand-400 font-tajawal">
                {totalLessons}
              </p>
              <p className="text-xs text-slate-400">درساً مشروحاً</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-tajawal">
                {section.exams.length}
              </p>
              <p className="text-xs text-slate-400">امتحاناً تفاعلياً</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>المواد الدراسية المقررة</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold">
            {section.subjects.length} مواد متاحة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {section.subjects.map((sub) => {
            const lessonsCount = sub.units.reduce(
              (acc, u) => acc + u._count.lessons,
              0
            );
            return (
              <div
                key={sub.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                {sub.image && (
                  <div className="h-44 w-full overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sub.image}
                      alt={sub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                      {sub.units.length} وحدات • {lessonsCount} دروس
                    </span>
                  </div>
                )}

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {sub.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {sub.exams.length} امتحانات مرتبطة
                    </span>
                    <Link
                      href={`/subjects/${sub.slug}`}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>دخول المادة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Associated Exams */}
      {section.exams.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-accent-emerald" />
              <span>امتحانات هذا القسم</span>
            </h2>
            <Link
              href="/exams"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              جميع الامتحانات ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.exams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-accent-emerald text-xs font-bold">
                      {exam.subject?.title || section.title}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      عام {exam.year || 2024}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>{exam.durationMinutes} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{exam._count.questions} أسئلة</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href={`/exams/${exam.id}`}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>خوض الامتحان التجريبي</span>
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
