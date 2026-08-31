'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  Clock,
  Award,
  Filter,
  Search,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';
import { ExamType, SectionType, SubjectType } from '@/types';

interface ExamsFilterClientProps {
  exams: ExamType[];
  sections: SectionType[];
  subjects: SubjectType[];
}

export default function ExamsFilterClient({
  exams,
  sections,
  subjects,
}: ExamsFilterClientProps) {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredExams = exams.filter((exam) => {
    if (selectedSection !== 'all' && exam.sectionId !== selectedSection) return false;
    if (selectedSubject !== 'all' && exam.subjectId !== selectedSubject) return false;
    if (selectedYear !== 'all' && String(exam.year) !== selectedYear) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = exam.title.toLowerCase().includes(q);
      const matchDesc = exam.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Fixed year range 2016..2026 (descending)
  const years = Array.from({ length: 2026 - 2016 + 1 }, (_, i) => 2026 - i);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في عناوين الامتحانات والمواد والسنوات..."
            className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium border border-transparent focus:border-brand-500 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Section Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              القسم الأكاديمي:
            </label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedSubject('all');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">جميع الأقسام</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.title}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              المادة الدراسية:
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">جميع المواد</option>
              {subjects
                .filter((sub) => selectedSection === 'all' || sub.sectionId === selectedSection)
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.title}
                  </option>
                ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              سنة الامتحان:
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">جميع السنوات</option>
              {years.map((y) => (
                <option key={String(y)} value={String(y)}>
                  عام {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
        <span>نتائج البحث: ({filteredExams.length} امتحان متاح)</span>
        {(selectedSection !== 'all' ||
          selectedSubject !== 'all' ||
          selectedYear !== 'all' ||
          searchQuery) && (
          <button
            onClick={() => {
              setSelectedSection('all');
              setSelectedSubject('all');
              setSelectedYear('all');
              setSearchQuery('');
            }}
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Grid of Exams */}
      {filteredExams.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            لا توجد امتحانات مطابقة لمعايير البحث
          </h3>
          <p className="text-xs text-slate-500">
            جرب تغيير الفلاتر أو البحث بكلمات أخرى.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold">
                    {exam.subject?.title || exam.section?.title || 'امتحان شامل'}
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
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-3.5 h-3.5 text-brand-500" />
                    <span>{exam.durationMinutes === 120 ? 'ساعتان (120 د)' : `${exam.durationMinutes} دقيقة`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>الدرجة: {exam.totalMarks}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                  {exam.questionsCount || (exam.questions ? exam.questions.length : 50)} سؤال بابل شيت
                </span>
                <Link
                  href={`/exams/${exam.id}/take`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>دخول الامتحان ⚡</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
