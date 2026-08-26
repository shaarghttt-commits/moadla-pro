'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PlayCircle,
  FileDown,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Clock,
  ExternalLink,
  Menu,
  X,
  Bookmark,
  Share2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LessonType, UnitType, LessonFileType, SubjectType } from '@/types';
import { formatDuration } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface LessonViewClientProps {
  lesson: LessonType & {
    unit: UnitType & {
      subject: SubjectType & {
        units: (UnitType & {
          lessons: LessonType[];
        })[];
      };
    };
    files: LessonFileType[];
  };
  initialIsCompleted: boolean;
  initialIsFavorite: boolean;
  completedLessonIds: string[];
  prevLesson: LessonType | null;
  nextLesson: LessonType | null;
}

export default function LessonViewClient({
  lesson,
  initialIsCompleted,
  initialIsFavorite,
  completedLessonIds,
  prevLesson,
  nextLesson,
}: LessonViewClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleComplete = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/progress/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsCompleted(data.completed);
        if (data.completed) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'LESSON', targetId: lesson.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.favorited);
      }
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Main Content (Video, Description, Markdown, Files, Navigation) */}
      <div className="lg:col-span-8 space-y-8">
        {/* Top Header info */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold">
              {lesson.unit?.title}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(lesson.durationMinutes)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500'
              }`}
              title="إضافة للمفضلة"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-brand-600 transition-colors"
              title="مشاركة رابط الدرس"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {copied && <span className="text-xs text-brand-600 font-bold">تم النسخ!</span>}

            {/* Mobile Drawer Trigger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
              aria-label="قائمة الدروس"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">
          {lesson.title}
        </h1>

        {/* Video Player Container */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800 aspect-video">
          {lesson.videoUrl ? (
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <PlayCircle className="w-16 h-16 text-slate-600" />
              <p className="text-sm font-semibold">الشرح النصي متاح بالأسفل</p>
            </div>
          )}
        </div>

        {/* Action Bar: Mark as Completed & Prev/Next Navigation */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleToggleComplete}
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
              isCompleted
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'تم إكمال الدرس بنجاح ✓' : 'تحديد كـ "تم إكمال الدرس"'}</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {prevLesson ? (
              <Link
                href={`/lessons/${prevLesson.id}`}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>الدرس السابق</span>
              </Link>
            ) : (
              <div />
            )}

            {nextLesson ? (
              <Link
                href={`/lessons/${nextLesson.id}`}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>الدرس التالي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                href={`/subjects/${lesson.unit?.subject?.slug}`}
                className="px-4 py-2.5 rounded-xl bg-accent-emerald text-white hover:bg-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <span>نهاية الوحدة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Text / Markdown Content */}
        {lesson.contentMarkdown && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>الشرح النصي والملاحظات الهامة</span>
            </h2>

            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
              {lesson.contentMarkdown}
            </div>
          </div>
        )}

        {/* Attached Files & PDFs */}
        {lesson.files && lesson.files.length > 0 && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <FileDown className="w-5 h-5 text-accent-emerald" />
              <span>الملفات والمرفقات والملخصات</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lesson.files.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {file.title}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {file.fileSize || 'ملف PDF جاهز للتحميل'}
                    </span>
                  </div>

                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors shrink-0"
                    title="تحميل الملف"
                  >
                    <FileDown className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Sidebar (Desktop & Mobile Drawer) */}
      <div
        className={`lg:col-span-4 space-y-6 ${
          sidebarOpen
            ? 'fixed inset-0 z-50 bg-black/60 p-4 overflow-y-auto block'
            : 'hidden lg:block'
        }`}
      >
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-6 relative max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                منهج المادة
              </span>
              <h3 className="font-black text-lg text-slate-900 dark:text-white font-tajawal">
                {lesson.unit?.subject?.title}
              </h3>
            </div>

            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Units and Lessons Tree */}
          <div className="space-y-6">
            {(lesson.unit?.subject?.units || []).map((unit) => (
              <div key={unit.id} className="space-y-2">
                <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {unit.title}
                </p>

                <div className="space-y-1">
                  {(unit.lessons || []).map((l) => {
                    const isCurrent = l.id === lesson.id;
                    const isDone = completedLessonIds.includes(l.id);
                    return (
                      <Link
                        key={l.id}
                        href={`/lessons/${l.id}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isDone ? (
                            <CheckCircle2
                              className={`w-4 h-4 shrink-0 ${
                                isCurrent ? 'text-white' : 'text-accent-emerald'
                              }`}
                            />
                          ) : (
                            <Circle
                              className={`w-4 h-4 shrink-0 ${
                                isCurrent ? 'text-white/60' : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          )}
                          <span className="truncate">{l.title}</span>
                        </div>

                        <span
                          className={`text-[10px] shrink-0 font-medium ${
                            isCurrent ? 'text-white/80' : 'text-slate-400'
                          }`}
                        >
                          {l.durationMinutes} د
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
