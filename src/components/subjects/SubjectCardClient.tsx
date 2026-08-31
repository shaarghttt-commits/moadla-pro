"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import SubjectAdminShell from './SubjectAdminShell';
import { BookOpen, ArrowLeft, FileText, PlayCircle } from 'lucide-react';

interface Props {
  subject: any;
  userRole?: string | null;
}

export default function SubjectCardClient({ subject, userRole }: Props) {
  const [open, setOpen] = useState(false);

  const unitCount = subject.units?.length ?? 0;
  const lessonCount = subject.units?.reduce((total: number, u: any) => total + (u.lessons?.length ?? 0), 0) ?? 0;
  const examCount = subject.exams?.length ?? 0;

  const handleClick = (e: React.MouseEvent) => {
    if (userRole === 'ADMIN') {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <>
      <div
        data-editable-id={subject.id}
        data-editable-type="SUBJECT"
        data-editable-title={subject.title}
        data-editable-desc={subject.description}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 relative group transition-all"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{subject.section?.title || 'قسم أكاديمي'}</div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{subject.title}</h2>
            </div>
          </div>
        </div>

        <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{subject.description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
            <FileText className="h-3.5 w-3.5" />
            {unitCount} وحدات
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
            <PlayCircle className="h-3.5 w-3.5" />
            {lessonCount} دروس
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
            <BookOpen className="h-3.5 w-3.5" />
            {examCount} امتحانات
          </span>
        </div>

        <a
          href={userRole === 'ADMIN' ? `/subjects/${subject.slug}/manage` : `/subjects/${subject.slug}`}
          onClick={handleClick}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <span>{userRole === 'ADMIN' ? 'إدارة المادة' : 'فتح المادة'}</span>
          <ArrowLeft className="h-4 w-4" />
        </a>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-center p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 dark:bg-slate-900">
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} className="text-sm text-slate-500">إغلاق</button>
            </div>
            <SubjectAdminShell slug={subject.slug} />
          </div>
        </div>
      )}
    </>
  );
}
