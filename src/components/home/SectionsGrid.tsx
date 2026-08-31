import Link from 'next/link';
import {
  Cpu,
  Laptop,
  TrendingUp,
  Sprout,
  ArrowLeft,
  BookOpen,
  FileCheck2,
  Sparkles,
  Flame,
} from 'lucide-react';
import { SectionType } from '@/types';

interface SectionsGridProps {
  sections: SectionType[];
}

export default function SectionsGrid({ sections }: SectionsGridProps) {
  const getIcon = (iconName?: string | null) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-8 h-8" />;
      case 'Laptop': return <Laptop className="w-8 h-8" />;
      case 'TrendingUp': return <TrendingUp className="w-8 h-8" />;
      case 'Sprout': return <Sprout className="w-8 h-8" />;
      default: return <Cpu className="w-8 h-8" />;
    }
  };

  const getColorClasses = (color?: string | null) => {
    switch (color) {
      case 'blue':
        return {
          gradient: 'from-blue-600 via-indigo-600 to-blue-700',
          badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
          border: 'hover:border-blue-400/60',
          iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30',
          bar: 'bg-blue-500',
          glow: 'group-hover:shadow-[0_20px_40px_-8px_rgba(59,130,246,0.3)]',
        };
      case 'emerald':
        return {
          gradient: 'from-emerald-600 via-teal-500 to-emerald-700',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
          border: 'hover:border-emerald-400/60',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30',
          bar: 'bg-emerald-500',
          glow: 'group-hover:shadow-[0_20px_40px_-8px_rgba(16,185,129,0.3)]',
        };
      case 'amber':
        return {
          gradient: 'from-amber-500 via-orange-500 to-amber-600',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
          border: 'hover:border-amber-400/60',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30',
          bar: 'bg-amber-500',
          glow: 'group-hover:shadow-[0_20px_40px_-8px_rgba(245,158,11,0.3)]',
        };
      case 'purple':
        return {
          gradient: 'from-purple-600 via-violet-600 to-purple-700',
          badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60',
          border: 'hover:border-purple-400/60',
          iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/30',
          bar: 'bg-purple-500',
          glow: 'group-hover:shadow-[0_20px_40px_-8px_rgba(139,92,246,0.3)]',
        };
      default:
        return {
          gradient: 'from-brand-600 via-brand-500 to-brand-700',
          badge: 'bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border-brand-200/70 dark:border-brand-800/60',
          border: 'hover:border-brand-400/60',
          iconBg: 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/30',
          bar: 'bg-brand-500',
          glow: 'group-hover:shadow-[0_20px_40px_-8px_rgba(37,99,235,0.3)]',
        };
    }
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 text-xs font-black border border-brand-200/70 dark:border-brand-800/70">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>مسارات المواد الجامعية المعتمدة</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-tajawal leading-tight">
          اختر المسار الأكاديمي المناسب لطموحك وقدرتك
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
          نقدم تغطية متكاملة لجميع مسارات المواد المعتمدة بالمجلس الأعلى للجامعات المصرية.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section) => {
          const colors = getColorClasses(section.color);
          return (
            <div
              key={section.id}
              className={`group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-soft flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 ${colors.border} ${colors.glow} overflow-hidden`}
            >
              {/* Subtle gradient hover glow top-right */}
              <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 pointer-events-none`} />

              <div className="space-y-5">
                {/* Icon & Count Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    {getIcon(section.icon)}
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${colors.badge}`}>
                    {section.subjectsCount || 6} مواد
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {section.description}
                  </p>
                </div>

                {/* Meta stats */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  <span className="flex items-center gap-1.5 font-bold">
                    <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                    <span>مناهج رسمية</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>بابل شيت</span>
                  </span>
                </div>
              </div>

              {/* Action Link */}
              <div className="mt-6">
                <Link
                  href={`/sections/${section.slug}`}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black text-white bg-gradient-to-r ${colors.gradient} hover:opacity-90 shadow-md flex items-center justify-between group/btn transition-all hover:scale-[1.02]`}
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
