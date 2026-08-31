export const revalidate = 0;

import { Metadata } from 'next';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import FileUploadForm from '@/components/files/FileUploadForm';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import {
  FileText,
  Download,
  FileCheck2,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Zap,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'امتحانات المعادلة السابقة PDF وبابل شيت إلكتروني | Moadla Pro',
  description: 'تحميل مباشر لكافة امتحانات السنين السابقة لشهادة معادلة كلية الهندسة PDF مع إمكانية خوض الامتحان إلكترونياً بنظام البابل شيت مع تصحيح فوري.',
};

const FOLDER_TO_SUBJECT_SLUG: Record<string, { slug: string; title: string; icon: string; color: string; desc: string }> = {
  'تفاضل وتكامل': {
    slug: 'calculus',
    title: 'التفاضل والتكامل (رياضيات 2)',
    icon: '∫',
    color: 'from-blue-500 to-indigo-600',
    desc: 'امتحانات السنين السابقة 2011-2025 مع نماذج الحل والامتحانات الإلكترونية',
  },
  'تفاضل-وتكامل': {
    slug: 'calculus',
    title: 'التفاضل والتكامل (رياضيات 2)',
    icon: '∫',
    color: 'from-blue-500 to-indigo-600',
    desc: 'امتحانات السنين السابقة 2011-2025 مع نماذج الحل والامتحانات الإلكترونية',
  },
  'فيزياء': {
    slug: 'physics',
    title: 'الفيزياء العامة (الكهربية والحديثة)',
    icon: '🔭',
    color: 'from-amber-500 to-orange-600',
    desc: 'امتحانات الفيزياء السابقة مع حلول الجهبذ والامتحانات الإلكترونية',
  },
  'جبر وهندسه فراغيه': {
    slug: 'algebra-and-geometry',
    title: 'الجبر والهندسة الفراغية (رياضيات 1)',
    icon: '📐',
    color: 'from-emerald-500 to-teal-600',
    desc: 'امتحانات الجبر والفراغية السابقة ونماذج الوزارة والحلول الكاملة',
  },
  'جبر': {
    slug: 'algebra-and-geometry',
    title: 'الجبر والهندسة الفراغية (رياضيات 1)',
    icon: '📐',
    color: 'from-emerald-500 to-teal-600',
    desc: 'امتحانات الجبر والفراغية السابقة ونماذج الوزارة والحلول الكاملة',
  },
  'ميكانيكا': {
    slug: 'mechanics',
    title: 'الميكانيكا (الاستاتيكا والديناميكا)',
    icon: '⚙️',
    color: 'from-purple-500 to-violet-600',
    desc: 'امتحانات الاستاتيكا والديناميكا لسنوات 2011-2025 ونماذج البابل شيت',
  },
  'كيمياء': {
    slug: 'chemistry',
    title: 'الكيمياء العامة والعضوية',
    icon: '⚗️',
    color: 'from-rose-500 to-pink-600',
    desc: 'امتحانات الكيمياء للأعوام السابقة وحلول الحفّاز وبنك الأسئلة التفاعلي',
  },
  'الانجليزى': {
    slug: 'english',
    title: 'اللغة الإنجليزية التخصصية',
    icon: '🇬🇧',
    color: 'from-cyan-500 to-blue-600',
    desc: 'امتحانات اللغة الإنجليزية السابقة ونماذج القواعد والمصطلحات الهندسية',
  },
  'انجليزى': {
    slug: 'english',
    title: 'اللغة الإنجليزية التخصصية',
    icon: '🇬🇧',
    color: 'from-cyan-500 to-blue-600',
    desc: 'امتحانات اللغة الإنجليزية السابقة ونماذج القواعد والمصطلحات الهندسية',
  },
};

export default async function FilesPage(props: { searchParams?: Promise<{ folder?: string }> }) {
  const searchParams = props?.searchParams ? await props.searchParams : {};
  const user = await getCurrentUser();
  const isAdmin = !!user && user.role === 'ADMIN';

  const folderSlug = searchParams?.folder ? String(searchParams.folder) : null;
  const folders = Object.keys(FOLDER_TO_SUBJECT_SLUG);

  let files: { name: string; url: string; size?: string; mtime?: string; year?: number; cleanTitle: string }[] = [];
  let currentSubjectInfo = null;
  let subjectExams: any[] = [];

  if (folderSlug) {
    // Match decoded slug
    const decodedFolder = decodeURIComponent(folderSlug).replace(/-/g, ' ');
    const matchKey = folders.find(
      (k) => k === decodedFolder || encodeURIComponent(k.replace(/\s+/g, '-')) === folderSlug || k.replace(/\s+/g, '-') === folderSlug
    ) || decodedFolder;

    currentSubjectInfo = FOLDER_TO_SUBJECT_SLUG[matchKey] || {
      slug: 'general',
      title: matchKey,
      icon: '📁',
      color: 'from-slate-600 to-slate-800',
      desc: 'ملفات وامتحانات سابقة',
    };

    // Fetch electronic exams for this subject
    const subject = await prisma.subject.findFirst({
      where: { slug: currentSubjectInfo.slug },
      include: {
        exams: {
          where: { isPublished: true },
          include: {
            _count: { select: { questions: true } },
          },
          orderBy: { year: 'desc' },
        },
      },
    });

    if (subject && subject.exams) {
      subjectExams = subject.exams;
    }

    try {
      // Check both original and encoded path
      const tryPaths = [
        path.join(process.cwd(), 'public', 'uploads', 'files', folderSlug),
        path.join(process.cwd(), 'public', 'uploads', 'files', matchKey),
        path.join(process.cwd(), 'public', 'uploads', 'files', matchKey.replace(/\s+/g, '-')),
      ];

      let items: string[] = [];
      let actualDir = tryPaths[0];

      for (const p of tryPaths) {
        try {
          items = await readdir(p);
          actualDir = p;
          break;
        } catch {
          // try next
        }
      }

      const fileInfos = await Promise.all(
        items.map(async (f) => {
          const p = path.join(actualDir, f);
          const s = await stat(p);

          // Extract year from file name (e.g. 2025, 2024, etc.)
          const yearMatch = f.match(/(201[6-9]|202[0-9])/);
          const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;

          // Clean readable title
          let cleanTitle = f
            .replace(/^1788\d+-/, '')
            .replace(/\.pdf$/i, '')
            .replace(/_/g, ' ')
            .replace(/moadla\.com/gi, '')
            .trim();

          const relativePath = actualDir.includes('files')
            ? `/uploads/files/${path.basename(actualDir)}/${f}`
            : `/uploads/files/${folderSlug}/${f}`;

          return {
            name: f,
            cleanTitle: cleanTitle || f,
            url: relativePath,
            size: `${Math.round(s.size / 1024)} KB`,
            mtime: s.mtime.toISOString(),
            year,
          };
        })
      );

      // Sort files: newest year first
      files = fileInfos.sort((a, b) => (b.year || 0) - (a.year || 0));
    } catch (e) {
      files = [];
    }
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 font-tajawal animate-fade-in">
      {/* Header Banner */}
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>نماذج الامتحانات الرسمية PDF & بابل شيت إلكتروني ⚡</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            {folderSlug && currentSubjectInfo
              ? `امتحانات مادة: ${currentSubjectInfo.title}`
              : 'امتحانات المعادلة السابقة وبنك البابل شيت'}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            {folderSlug && currentSubjectInfo
              ? currentSubjectInfo.desc
              : 'تصفح وحمل كافة امتحانات الأعوام السابقة لشهادة معادلة كلية الهندسة مجاناً، أو خض الامتحان إلكترونياً بنظام البابل شيت الحديث مع التصحيح التلقائي الفوري!'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition hover:scale-105"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>بنك الامتحانات الإلكترونية الشاملة</span>
            </Link>
            <Link
              href="/exams/simulator"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 backdrop-blur-md transition hover:scale-105"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>محاكي تظليل ورقة البابل شيت 2025</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!folderSlug ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                اختر المادة الدراسية
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                تصفح الامتحانات السابقة وحلولها النموذجية والامتحانات الإلكترونية التفاعلية
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
              {folders.length} مواد أساسية
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((name) => {
              const info = FOLDER_TO_SUBJECT_SLUG[name];
              const slug = encodeURIComponent(name.replace(/\s+/g, '-'));

              return (
                <div
                  key={name}
                  className="group relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 shadow-soft hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.color} text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform`}
                      >
                        {info.icon}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                        بابل شيت + PDF
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                        {name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {info.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 mt-5 flex items-center justify-between gap-2">
                    <Link
                      href={`/files?folder=${slug}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white font-black text-xs text-center transition flex items-center justify-center gap-1.5"
                    >
                      <span>عرض الامتحانات</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </Link>

                    {isAdmin && <FileUploadForm folder={slug} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Breadcrumb & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800">
            <div className="space-y-1">
              <Link
                href="/files"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline mb-1"
              >
                <span>← العودة لجميع مجلدات المواد</span>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentSubjectInfo?.icon}</span>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {currentSubjectInfo?.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    يحتوي على {files.length} ملف امتحان ومذكرة سابقة
                  </p>
                </div>
              </div>
            </div>

            {isAdmin && <FileUploadForm folder={folderSlug} />}
          </div>

          {/* Electronic Exams Callout Banner for this Subject */}
          {subjectExams.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-brand-500/15 border-2 border-emerald-500/30 dark:border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-sm font-black shadow-md">
                    ⚡
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200">
                      الامتحانات الإلكترونية التفاعلية المتاحة لهذه المادة ({subjectExams.length})
                    </h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400">
                      يمكنك خوض الامتحانات أونلاين بنظام البابل شيت مع تصحيح فوري وتحليل الدرجات
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {subjectExams.map((ex) => (
                  <Link
                    key={ex.id}
                    href={`/exams/${ex.id}/take`}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 hover:border-emerald-500 shadow-xs hover:shadow-md transition group flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                          دور {ex.year}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {ex._count.questions} أسئلة
                        </span>
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {ex.title}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-[11px] font-black shrink-0 transition">
                      ابدأ الامتحان ✍️
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Files List Header with Link to Dedicated Subject Exams Archive */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                <span>أوراق الامتحانات السابقة وملفات الـ PDF ({files.length})</span>
              </h3>

              {currentSubjectInfo?.slug && currentSubjectInfo.slug !== 'general' && (
                <Link
                  href={`/subjects/${currentSubjectInfo.slug}/exams`}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-black transition border border-brand-200 dark:border-brand-800"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>عرض الأرشيف المنظم مع فيديوهات الحل 🎬</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {files.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  لا توجد ملفات في هذا المجلد حالياً.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {files.map((f) => {
                  // Check if there is an exact matching electronic exam for this year
                  const matchingExam = subjectExams.find(
                    (e) => e.year === f.year || f.name.includes(String(e.year))
                  );

                  return (
                    <div
                      key={f.name}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* File Details */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-black text-xs shrink-0 border border-rose-200/60 dark:border-rose-800/60">
                          PDF
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {f.year && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-black border border-amber-200 dark:border-amber-800">
                                عام {f.year}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-bold">
                              الحجم: {f.size}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                            {f.cleanTitle}
                          </h4>
                        </div>
                      </div>

                      {/* Action Buttons: Download PDF + Take Electronic Exam */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                        {matchingExam ? (
                          <Link
                            href={`/exams/${matchingExam.id}/take`}
                            className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition hover:scale-102"
                            title="خوض هذا الامتحان إلكترونياً بنظام البابل شيت والتصحيح الفوري"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>خوض الامتحان إلكترونياً (بابل شيت) ⚡</span>
                          </Link>
                        ) : subjectExams.length > 0 ? (
                          <Link
                            href={`/exams/${subjectExams[0].id}/take`}
                            className="flex-1 md:flex-none py-2.5 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white font-bold text-xs border border-indigo-200 dark:border-indigo-800 transition flex items-center justify-center gap-1"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>امتحان بابل شيت محاكي</span>
                          </Link>
                        ) : null}

                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>تحميل PDF</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
