'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  FileCheck2,
  FileDown,
  ArrowLeft,
  Clock,
  Award,
  ChevronLeft,
} from 'lucide-react';
import { LessonType, ExamType, LessonFileType } from '@/types';
import { formatDuration } from '@/lib/utils';

interface LatestContentSectionProps {
  latestLessons: LessonType[];
  latestExams: ExamType[];
  latestFiles: (LessonFileType & { lesson?: LessonType })[];
}

export default function LatestContentSection({
  latestLessons,
  latestExams,
  latestFiles,
}: LatestContentSectionProps) {
  const [activeTab, setActiveTab] = useState<'lessons' | 'exams' | 'files'>('lessons');

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <span className="px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase">
            محتوى متجدد باستمرار
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
            أحدث الدروس والامتحانات المضافة
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            تصفح أحدث ما أضافه الأساتذة والمشرفون لمساعدتك في المذاكرة.
          </p>
        </div>

        {/* Tabs Control */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'lessons'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            أحدث الدروس
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'exams'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            أحدث الامتحانات
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'files'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            الملفات والـ PDF
          </button>
        </div>
      </div>

      {/* Content for Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold">
                    {lesson.unit?.title || 'وحدة تعليمية'}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDuration(lesson.durationMinutes)}</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                  {lesson.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  <PlayCircle className="w-4 h-4" />
                  <span>مشاهدة الدرس</span>
                </div>

                <Link
                  href={`/lessons/${lesson.id}`}
                  className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-brand-600 group-hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content for Exams Tab */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestExams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-accent-emerald text-xs font-bold">
                    {exam.subject?.title || 'امتحان شامل'}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    عام {exam.year || 2024}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>{exam.durationMinutes} دقيقة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>الدرجة: {exam.totalMarks}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href={`/exams/${exam.id}`}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>بدء الامتحان الآن</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content for Files Tab */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestFiles.map((file) => (
            <div
              key={file.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-accent-rose text-xs font-bold uppercase">
                    {file.fileType}
                  </span>
                  <span className="text-xs text-slate-400">{file.fileSize || '3.2 MB'}</span>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {file.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ملحق بدرس: {file.lesson?.title || 'الدرس المخصص'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  <span>تحميل الملف PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
