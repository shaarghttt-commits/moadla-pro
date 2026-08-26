import prisma from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Layers, FileCheck2, Clock } from 'lucide-react';
import { SubjectType, SectionType } from '@/types';

export const revalidate = 0;

export const metadata = {
  title: 'المواد الدراسية | Moadla Pro',
  description: 'تصفح جميع المواد والمناهج المقررة لامتحانات معادلات كليات الهندسة، الحاسبات، التجارة، والزراعة.',
};

export default async function SubjectsPage() {
  const sections = await prisma.section.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      subjects: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          units: {
            include: {
              _count: { select: { lessons: true } },
            },
          },
          _count: {
            select: { exams: true },
          },
        },
      },
    },
  });

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase">
          دليل المناهج الكامل
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-tajawal">
          المواد الدراسية والمناهج
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          اختر المادة للاطلاع على الوحدات، الدروس المشروحة بالفيديو، الملخصات وملفات الـ PDF، والامتحانات التفاعلية.
        </p>
      </div>

      {/* Sections & their Subjects */}
      <div className="space-y-14">
        {sections.map((section) => (
          <div key={section.id} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 rounded-full bg-brand-600" />
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
                  {section.title}
                </h2>
              </div>

              <Link
                href={`/sections/${section.slug}`}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <span>استعراض القسم</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.subjects.map((sub) => {
                const totalLessons = sub.units.reduce(
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
                          {sub.units.length} وحدات • {totalLessons} دروس
                        </span>
                      </div>
                    )}

                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {sub.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {sub._count.exams} امتحانات
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
        ))}
      </div>
    </div>
  );
}
