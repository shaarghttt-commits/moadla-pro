'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  PlayCircle,
  FileCheck2,
  FileDown,
  ArrowLeft,
  Clock,
  Award,
  Flame,
  Sparkles,
  BookOpen,
  FileText,
} from 'lucide-react';
import { LessonType, ExamType, LessonFileType } from '@/types';
import { formatDuration } from '@/lib/utils';

interface LatestContentSectionProps {
  latestLessons: LessonType[];
  latestExams: ExamType[];
  latestFiles: (LessonFileType & { lesson?: LessonType })[];
}

type TabKey = 'lessons' | 'exams' | 'files';

export default function LatestContentSection({
  latestLessons,
  latestExams,
  latestFiles,
}: LatestContentSectionProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('lessons');
  const { user } = useAuth();

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; count: number; color: string }[] = [
    {
      key: 'lessons',
      label: 'أحدث الدروس',
      icon: <PlayCircle className="w-4 h-4" />,
      count: latestLessons.length,
      color: 'brand',
    },
    {
      key: 'exams',
      label: 'الامتحانات التفاعلية',
      icon: <FileCheck2 className="w-4 h-4" />,
      count: latestExams.length,
      color: 'emerald',
    },
    {
      key: 'files',
      label: 'ملفات الـ PDF',
      icon: <FileDown className="w-4 h-4" />,
      count: latestFiles.length,
      color: 'amber',
    },
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 text-xs font-black border border-brand-200/70 dark:border-brand-800/70">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>محتوى تعليمي متجدد يومياً</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal leading-tight">
            أحدث الدروس والامتحانات المضافة على المنصة
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
            يضيف أساتذتنا محتوى جديداً كل يوم — دروس فيديو، امتحانات تفاعلية، وملفات ملخصات PDF احترافية.
          </p>
        </div>

        {/* Tab Switcher - Glass Pill Style */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl self-start lg:self-auto shadow-inner flex-wrap sm:flex-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-soft'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-black ${
                  activeTab === tab.key
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* === LESSONS GRID === */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestLessons.length === 0 ? (
            <EmptyState message="لا توجد دروس حالياً. سيتم إضافة دروس جديدة قريباً!" icon={<BookOpen className="w-10 h-10" />} />
          ) : latestLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Top Glow on Hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-200/70 dark:border-brand-800/60">
                    {lesson.unit?.title || 'وحدة تعليمية'}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>{formatDuration(lesson.durationMinutes)}</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
                  {lesson.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100/80 dark:border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  <PlayCircle className="w-4 h-4" />
                  <span>مشاهدة الدرس</span>
                </div>

                <Link
                  href={
                    user?.role === 'ADMIN'
                      ? `/subjects/${lesson.unit?.subject?.slug}/units/${lesson.unit?.id}/lessons/${lesson.id}/manage`
                      : `/lessons/${lesson.id}`
                  }
                  className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/80 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === EXAMS GRID === */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestExams.length === 0 ? (
            <EmptyState message="لا توجد امتحانات منشورة حتى الآن." icon={<FileCheck2 className="w-10 h-10" />} />
          ) : latestExams.map((exam) => (
            <div
              key={exam.id}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/70 dark:border-emerald-800/60">
                    {exam.subject?.title || 'امتحان شامل'}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold">
                    {exam.year || 2024}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>{exam.durationMinutes} دقيقة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{exam.totalMarks} درجة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{exam.questionsCount || 0} سؤال</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100/80 dark:border-slate-800/60">
                <Link
                  href={`/exams/${exam.id}`}
                  className="w-full py-3 px-5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-glow flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Flame className="w-4 h-4" />
                  <span>ابدأ الامتحان التفاعلي الآن</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === FILES GRID === */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestFiles.length === 0 ? (
            <EmptyState message="لا توجد ملفات PDF منشورة بعد." icon={<FileText className="w-10 h-10" />} />
          ) : latestFiles.map((file) => (
            <div
              key={file.id}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-xs font-black border border-amber-200/70 dark:border-amber-800/60 uppercase">
                    {file.fileType}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{file.fileSize || '3.2 MB'}</span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {file.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ملحق بدرس: <span className="font-semibold">{file.lesson?.title || 'الدرس المخصص'}</span>
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100/80 dark:border-slate-800/60">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-5 rounded-xl text-xs font-black text-slate-800 dark:text-slate-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-500 hover:text-white border border-amber-200 dark:border-amber-800/60 hover:border-amber-500 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] hover:shadow-amber-glow"
                >
                  <FileDown className="w-4 h-4" />
                  <span>تحميل الملف PDF الآن</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <div className="col-span-full py-20 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
      <div className="text-slate-300 dark:text-slate-600">{icon}</div>
      <p className="text-sm font-semibold">{message}</p>
    </div>
  );
}
