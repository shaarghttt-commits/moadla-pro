import Link from 'next/link';
import {
  Cpu,
  Laptop,
  TrendingUp,
  Sprout,
  ArrowLeft,
  BookOpen,
  FileCheck2,
  Users,
} from 'lucide-react';
import { SectionType } from '@/types';

interface SectionsGridProps {
  sections: SectionType[];
}

export default function SectionsGrid({ sections }: SectionsGridProps) {
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

  const getColorClasses = (color?: string | null) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'from-blue-600 to-indigo-700',
          badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
          border: 'hover:border-blue-500/50',
          iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        };
      case 'emerald':
        return {
          bg: 'from-emerald-600 to-teal-700',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          border: 'hover:border-emerald-500/50',
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        };
      case 'amber':
        return {
          bg: 'from-amber-600 to-orange-700',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          border: 'hover:border-amber-500/50',
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        };
      case 'purple':
        return {
          bg: 'from-purple-600 to-pink-700',
          badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
          border: 'hover:border-purple-500/50',
          iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        };
      default:
        return {
          bg: 'from-brand-600 to-brand-800',
          badge: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300',
          border: 'hover:border-brand-500/50',
          iconBg: 'bg-brand-500/10 text-brand-600 dark:text-brand-400',
        };
    }
  };

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase tracking-wider">
          مسارات معادلات الجامعات الحكومية
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
          اختر المسار الأكاديمي المناسب لطموحك
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          نقدم تغطية متكاملة لجميع مسارات المعادلات المعتمدة بالمجلس الأعلى للجامعات المصرية.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section) => {
          const colors = getColorClasses(section.color);
          return (
            <div
              key={section.id}
              className={`group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between ${colors.border}`}
            >
              <div className="space-y-4">
                {/* Icon & Count Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors.iconBg} transition-transform group-hover:scale-110`}>
                    {getIcon(section.icon)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                    {section.subjectsCount || 6} مواد دراسية
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {section.description}
                  </p>
                </div>

                {/* Meta stats */}
                <div className="pt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                    <span>مناهج رسمية</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-accent-emerald" />
                    <span>بابل شيت</span>
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-6 pt-4">
                <Link
                  href={`/sections/${section.slug}`}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white transition-all flex items-center justify-between group/btn"
                >
                  <span>استكشف القسم والمواد</span>
                  <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
