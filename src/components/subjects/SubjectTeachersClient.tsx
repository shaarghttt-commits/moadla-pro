'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  Film,
  GraduationCap,
  Play,
  Sparkles,
  Youtube,
  Zap,
} from 'lucide-react';
import TeacherVideoCinemaModal, { TeacherCourse } from './TeacherVideoCinemaModal';

interface SubjectTeachersClientProps {
  subject: {
    id: string;
    title: string;
    slug: string;
    section?: { title: string } | null;
  };
  courses: TeacherCourse[];
}

export default function SubjectTeachersClient({
  subject,
  courses,
}: SubjectTeachersClientProps) {
  const [activeTeacherModal, setActiveTeacherModal] = useState<TeacherCourse | null>(null);

  const isPhysics = subject.slug === 'physics';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-tajawal">
      {/* Top Breadcrumb Nav */}
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link
          href={`/subjects/${subject.slug}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:text-brand-600 hover:border-brand-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>العودة لمادة {subject.title}</span>
        </Link>

        <div className="text-xs font-black text-brand-600 dark:text-brand-400">
          {subject.section?.title || 'معادلة كلية الهندسة'} / {subject.title}
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-[36px] border border-slate-200/80 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-10 space-y-8">
        {/* Header Title Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400 text-xs font-black border border-red-200/60 dark:border-red-800/60">
            <Youtube className="w-3.5 h-3.5 fill-current" />
            <span>دليل قنوات ومدرسي المادة على YouTube 🔴</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
            أفضل مدرسي وقنوات شرح {subject.title} اونلاين
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            اختر مدرسك المفضل واضغط على البطاقة للانتقال فوراً لقناته وقوائم تشغيل الشروحات الكاملة على YouTube!
          </p>
        </div>

        {/* Teachers Courses Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const targetUrl = course.channelUrl || course.playlistUrl || 'https://www.youtube.com';

            return (
              <div
                key={course.name}
                className={`rounded-[28px] border p-6 shadow-sm transition-all duration-300 flex flex-col justify-between group ${
                  course.isPopular
                    ? 'border-brand-400/80 dark:border-brand-600/80 bg-gradient-to-b from-brand-50/50 via-white to-white dark:from-brand-950/40 dark:via-slate-900 dark:to-slate-900 shadow-md ring-2 ring-brand-500/20 hover:scale-[1.02]'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70 hover:scale-[1.01]'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Avatar / Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                      {isPhysics ? '⚡' : '📐'}
                    </div>

                    {course.isPopular && (
                      <span className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-1 text-xs font-black shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Popular ⭐</span>
                      </span>
                    )}
                  </div>

                  {/* Teacher Name & Title */}
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group/title"
                  >
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal group-hover/title:text-red-600 dark:group-hover/title:text-red-400 transition-colors">
                      {course.name}
                    </h2>
                    <p className="text-xs text-red-600 dark:text-red-400 font-bold mt-0.5">
                      {course.channelName} ↗
                    </p>
                  </a>

                  {/* Description & Specialty */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[44px]">
                    {course.specialty}
                  </p>

                  {/* Verified Badge & Videos Count */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <BadgeCheck className="w-4 h-4" />
                      <span>متاح {course.videos.length} حصص كاملة</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">HD 1080p</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-2">
                  {/* 1. Main Direct YouTube Channel Button */}
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 text-center"
                  >
                    <Youtube className="w-4 h-4 fill-white" />
                    <span>🔴 الانتقال لقناة المدرس على YouTube</span>
                  </a>

                  {/* 2. Direct Playlist Link Button if available */}
                  {course.playlistUrl && course.playlistUrl !== targetUrl && (
                    <a
                      href={course.playlistUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 text-center"
                    >
                      <span>📺 تصفح قائمة الشروحات وقوائم التشغيل ↗</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher Video Cinema Modal */}
      {activeTeacherModal && (
        <TeacherVideoCinemaModal
          isOpen={Boolean(activeTeacherModal)}
          onClose={() => setActiveTeacherModal(null)}
          teacher={activeTeacherModal}
        />
      )}
    </div>
  );
}
