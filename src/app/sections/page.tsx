import prisma from '@/lib/prisma';
import Link from 'next/link';
import {
  Cpu,
  Laptop,
  TrendingUp,
  Sprout,
  BookOpen,
  FileCheck2,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { SectionType } from '@/types';

export const revalidate = 0;

export const metadata = {
  title: 'الأقسام والمسارات الأكاديمية | Moadla Pro',
  description: 'استكشف مسارات امتحانات المعادلات: معادلة الهندسة، الحاسبات، التجارة، والزراعة مع تفاصيل المواد والمناهج.',
};

export default async function SectionsPage() {
  const rawSections = await prisma.section.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      subjects: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { units: true, exams: true },
          },
        },
      },
      _count: {
        select: { exams: true },
      },
    },
  });

  const getIcon = (iconName?: string | null) => {
    switch (iconName) {
      case 'Cpu':
        return <Cpu className="w-8 h-8" />;
      case 'Laptop':
        return <Laptop className="w-8 h-8" />;
      case 'TrendingUp':
        return <TrendingUp className="w-8 h-8" />;
      case 'Sprout':
        return <Sprout className="w-8 h-8" />;
      default:
        return <Cpu className="w-8 h-8" />;
    }
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase">
          <GraduationCap className="w-4 h-4" />
          <span>المسارات الأكاديمية المعتمدة</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-tajawal">
          جميع أقسام امتحانات المعادلات
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          اختر كليتك المستهدفة واطّلع على المواد الدراسية، الوحدات والدروس، والامتحانات التفاعلية المؤهلة للقبول.
        </p>
      </div>

      {/* Sections Cards Full View */}
      <div className="space-y-12">
        {rawSections.map((section) => (
          <div
            key={section.id}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-soft hover:shadow-soft-lg transition-all"
          >
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  {getIcon(section.icon)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
                    {section.title}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    {section.description}
                  </p>
                </div>
              </div>

              <Link
                href={`/sections/${section.slug}`}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 self-start md:self-center transition-all shrink-0"
              >
                <span>دخول القسم الكامل</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>

            {/* Subjects Grid inside section */}
            <div className="mt-8">
              <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>المواد الدراسية المقررة ({section.subjects.length} مواد):</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.subjects.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/subjects/${sub.slug}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-brand-50/50 dark:hover:bg-brand-950/30 border border-slate-200/60 dark:border-slate-800 transition-all hover:border-brand-500/40 group flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {sub.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {sub.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{sub._count.units} وحدات دراسية</span>
                      <span className="text-brand-600 dark:text-brand-400 font-bold group-hover:underline flex items-center gap-1">
                        <span>فتح المادة</span>
                        <ArrowLeft className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
