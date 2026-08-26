'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  FileDown,
  ArrowLeft,
  FileCheck2,
  Award,
} from 'lucide-react';
import { SubjectType, UnitType, LessonType, ExamType, LessonFileType } from '@/types';
import { formatDuration } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface SubjectDetailClientProps {
  subject: SubjectType;
  units: (UnitType & {
    lessons: (LessonType & { files: LessonFileType[]; isCompleted?: boolean })[];
  })[];
  exams: ExamType[];
  initialIsFavorite: boolean;
  completedLessonIds: string[];
  totalLessonsCount: number;
}

export default function SubjectDetailClient({
  subject,
  units,
  exams,
  initialIsFavorite,
  completedLessonIds,
  totalLessonsCount,
}: SubjectDetailClientProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [openUnits, setOpenUnits] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    units.forEach((u, i) => {
      map[u.id] = i === 0 || i === 1; // open first two units by default
    });
    return map;
  });

  const toggleUnit = (unitId: string) => {
    setOpenUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'SUBJECT', targetId: subject.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.favorited);
      }
    } catch {
      // ignore
    }
  };

  const completedCount = completedLessonIds.length;
  const progressPercent =
    totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* Subject Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-soft relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold">
                {subject.section?.title || 'معادلة الجامعات'}
              </span>
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  isFavorite
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
              {subject.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {subject.description}
            </p>
          </div>

          {/* Student Progress Card */}
          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 w-full lg:w-80 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                نسبة إنجازك في المادة
              </span>
              <span className="text-sm font-black text-brand-600 dark:text-brand-400">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-600 to-accent-emerald h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>{completedCount} من {totalLessonsCount} درس مكتمل</span>
              <span className="font-semibold">{units.length} وحدات</span>
            </div>
          </div>
        </div>
      </div>

      {/* Units and Lessons Accordions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
          الوحدات والدروس التعليمية
        </h2>

        <div className="space-y-4">
          {units.map((unit, uIdx) => {
            const isOpen = openUnits[unit.id] ?? false;
            const unitLessons = unit.lessons || [];
            const unitCompletedCount = unitLessons.filter((l) =>
              completedLessonIds.includes(l.id)
            ).length;

            return (
              <div
                key={unit.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
              >
                {/* Unit Header Bar */}
                <button
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full p-5 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-black text-xs flex items-center justify-center">
                      {uIdx + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
                        {unit.title}
                      </h3>
                      {unit.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {unit.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {unitCompletedCount} / {unitLessons.length} منجز
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Lessons inside unit */}
                {isOpen && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2 sm:p-4">
                    {unitLessons.map((lesson) => {
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className="p-3.5 sm:p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                              )}
                            </div>
                            <div>
                              <Link
                                href={`/lessons/${lesson.id}`}
                                className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                              >
                                {lesson.title}
                              </Link>
                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{formatDuration(lesson.durationMinutes)}</span>
                                </span>
                                {lesson.files && lesson.files.length > 0 && (
                                  <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{lesson.files.length} ملفات مرفقة</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Link
                              href={`/lessons/${lesson.id}`}
                              className="px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-600 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>مشاهدة الدرس</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Associated Exams Section */}
      {exams.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-accent-emerald" />
            <span>امتحانات تفاعلية لمادة {subject.title}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-accent-emerald text-xs font-bold">
                      عام {exam.year || 2024}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {exam.durationMinutes} دقيقة
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
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
