'use client';

import { useMemo, useState } from 'react';
import { BookOpen, Download, Eye, Search, Layers, Calendar, Sparkles } from 'lucide-react';

interface FileRecord {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
  createdAt: string;
  subjectId?: string | null;
  unitId?: string | null;
  lessonId?: string | null;
  subject?: { id: string; title: string; section?: { id: string; title: string } | null } | null;
  unit?: { id: string; title: string; subject?: { id: string; title: string; section?: { id: string; title: string } | null } | null } | null;
  lesson?: {
    id: string;
    title: string;
    unit?: { id: string; title: string; subject?: { id: string; title: string; section?: { id: string; title: string } | null } | null } | null;
  } | null;
}

interface FilesFilterClientProps {
  files: FileRecord[];
  sections: Array<{ id: string; title: string }>;
  subjects: Array<{ id: string; title: string; sectionId?: string | null }>;
  settings?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    lastUpdateLabel?: string;
    subjectCountLabel?: string;
    equationTypeLabel?: string;
    emptyTitle?: string;
    emptyDescription?: string;
  };
}

const getCategory = (file: FileRecord) =>
  file.subject?.section?.title ||
  file.unit?.subject?.section?.title ||
  file.lesson?.unit?.subject?.section?.title ||
  'عام';

const getSubjectTitle = (file: FileRecord) =>
  file.subject?.title ||
  file.unit?.subject?.title ||
  file.lesson?.unit?.subject?.title ||
  'مادة عامة';

export default function FilesFilterClient({ files, sections, subjects, settings }: FilesFilterClientProps) {
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const sectionMatch =
        selectedSection === 'all' ||
        file.subject?.section?.id === selectedSection ||
        file.unit?.subject?.section?.id === selectedSection ||
        file.lesson?.unit?.subject?.section?.id === selectedSection;

      const subjectMatch =
        selectedSubject === 'all' ||
        file.subjectId === selectedSubject ||
        file.unit?.subject?.id === selectedSubject ||
        file.lesson?.unit?.subject?.id === selectedSubject;

      const year = new Date(file.createdAt).getFullYear();
      const yearMatch = selectedYear === 'all' || String(year) === selectedYear;

      const q = searchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        file.title.toLowerCase().includes(q) ||
        getSubjectTitle(file).toLowerCase().includes(q) ||
        getCategory(file).toLowerCase().includes(q) ||
        String(year).includes(q);

      return sectionMatch && subjectMatch && yearMatch && searchMatch;
    });
  }, [files, selectedSection, selectedSubject, selectedYear, searchQuery]);

  const years = useMemo(
    () => Array.from(new Set(files.map((file) => new Date(file.createdAt).getFullYear()))).sort((a, b) => b - a),
    [files]
  );

  const subjectGroups = useMemo(() => {
    const groups = new Map<string, { category: string; subject: string; items: FileRecord[] }>();

    filteredFiles.forEach((file) => {
      const category = getCategory(file);
      const subject = getSubjectTitle(file);
      const key = `${category}::${subject}`;

      if (!groups.has(key)) {
        groups.set(key, { category, subject, items: [] });
      }

      groups.get(key)?.items.push(file);
    });

    return Array.from(groups.values()).sort((a, b) => a.subject.localeCompare(b.subject));
  }, [filteredFiles]);

  const equationTypeCount = new Set(files.map((file) => getCategory(file))).size;
  const subjectCount = new Set(files.map((file) => getSubjectTitle(file))).size;

  return (
    <div className="min-h-screen bg-slate-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-xs font-extrabold uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 ml-1" />
            {settings?.badge || 'بنك الملفات والامتحانات السابقة'}
          </span>

          <h1 className="text-3xl sm:text-6xl font-black text-slate-900 font-tajawal leading-[1.1]">
            {settings?.title || 'الامتحانات السابقة والملاحظات التعليمية'}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto">
            {settings?.subtitle || 'تصفح الملفات المصنفة حسب نوع المعادلة، ثم داخل كل مادة ستجد الامتحانات السابقة الخاصة بها فقط.'}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-[28px] bg-white border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.06)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{settings?.lastUpdateLabel || 'آخر تحديث'}</span>
              <Calendar className="w-5 h-5 text-brand-600" />
            </div>
            <p className="mt-5 text-4xl font-black text-slate-900">{files[0] ? new Date(files[0].createdAt).getFullYear() : '—'}</p>
          </div>

            <div className="rounded-[28px] bg-white border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.06)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{settings?.subjectCountLabel || 'المواد المتاحة'}</span>
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="mt-5 text-4xl font-black text-slate-900">{subjectCount}</p>
          </div>

            <div className="rounded-[28px] bg-white border border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.06)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{settings?.equationTypeLabel || 'أنواع المواد'}</span>
              <Layers className="w-5 h-5 text-amber-500" />
            </div>
            <p className="mt-5 text-4xl font-black text-slate-900">{equationTypeCount}</p>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في عناوين الملفات والمواد والسنة..."
                className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium border border-transparent focus:border-brand-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">القسم الأكاديمي:</label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setSelectedSubject('all');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">جميع الأقسام</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">المادة الدراسية:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">جميع المواد</option>
                  {subjects
                    .filter((subject) => selectedSection === 'all' || subject.sectionId === selectedSection)
                    .map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.title}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">سنة الامتحان:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="all">جميع السنوات</option>
                  {years.map((year) => (
                    <option key={year} value={String(year)}>
                      عام {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>نتائج البحث: ({filteredFiles.length} ملف متاح)</span>
            {(selectedSection !== 'all' || selectedSubject !== 'all' || selectedYear !== 'all' || searchQuery) && (
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
        </div>

        {filteredFiles.length === 0 ? (
          <div className="mt-10 rounded-[30px] bg-white border border-slate-200 p-12 text-center shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
            <Search className="w-12 h-12 text-slate-300 mx-auto" />
            <h2 className="mt-4 text-2xl font-black text-slate-900 font-tajawal">{settings?.emptyTitle || 'لا توجد ملفات منشورة حالياً'}</h2>
            <p className="mt-2 text-sm text-slate-500">{settings?.emptyDescription || 'سيتم إضافة الملفات والملخصات هنا فور نشرها من لوحة الإدارة.'}</p>
          </div>
        ) : (
          <div className="mt-12 space-y-8">
            {subjectGroups.map(({ subject, category, items }) => (
              <section key={`${category}-${subject}`} className="rounded-[32px] bg-white border border-slate-200 shadow-[0_18px_45px_rgba(15,23,42,0.04)] p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-50 text-brand-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500">المادة</p>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-tajawal">{subject}</h2>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase">
                    <Layers className="w-3.5 h-3.5" />
                    {category}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {items.map((file) => {
                    const year = new Date(file.createdAt).getFullYear();
                    const isPreviewable = (file.fileType || '').toLowerCase() === 'pdf' || file.fileUrl.toLowerCase().includes('.pdf');

                    return (
                      <article
                        key={file.id}
                        className="rounded-[26px] border border-slate-200 bg-slate-50 p-4 sm:p-5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase">
                            {file.fileType}
                          </span>
                          <span className="text-[11px] text-slate-400">{file.fileSize || 'ملف'}</span>
                        </div>

                        <h3 className="mt-4 text-xl font-black text-slate-900 font-tajawal leading-[1.4]">
                          {file.title}
                        </h3>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                          <div className="rounded-2xl bg-white border border-slate-200 px-3 py-2">
                            <div className="text-[10px] font-bold text-slate-500">اسم المادة</div>
                            <div className="mt-1 font-black text-slate-900">{subject}</div>
                          </div>
                          <div className="rounded-2xl bg-white border border-slate-200 px-3 py-2">
                            <div className="text-[10px] font-bold text-slate-500">السنة</div>
                            <div className="mt-1 font-black text-slate-900">{year}</div>
                          </div>
                        </div>

                        {isPreviewable ? (
                          <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-200 bg-white">
                            <iframe src={file.fileUrl} title={file.title} className="w-full h-52 border-0" />
                          </div>
                        ) : (
                          <div className="mt-4 rounded-[20px] border border-dashed border-slate-300 bg-white p-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-brand-50 mx-auto flex items-center justify-center text-brand-600">
                              <Eye className="w-5 h-5" />
                            </div>
                            <p className="mt-2 text-xs font-bold text-slate-600">يمكن معاينة هذا الملف من خلال زر التحميل</p>
                          </div>
                        )}

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-2xl bg-white text-slate-800 text-xs font-bold hover:bg-brand-50 hover:text-brand-600 transition-all border border-slate-200"
                          >
                            <Eye className="w-4 h-4" />
                            <span>معاينة</span>
                          </a>

                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-2xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all"
                          >
                            <Download className="w-4 h-4" />
                            <span>تحميل</span>
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
