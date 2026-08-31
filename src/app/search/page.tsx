'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  PlayCircle,
  FileCheck2,
  FileDown,
  ArrowLeft,
  Clock,
  Layers,
} from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';

  // auth for admin links
  const { user } = useAuth();

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'subjects' | 'lessons' | 'exams' | 'files'>('all');
  const [results, setResults] = useState<{
    subjects: any[];
    lessons: any[];
    exams: any[];
    files: any[];
  }>({ subjects: [], lessons: [], exams: [], files: [] });
  const [loading, setLoading] = useState(false);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults({ subjects: [], lessons: [], exams: [], files: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      performSearch(query.trim());
    }
  };

  const totalMatches =
    results.subjects.length +
    results.lessons.length +
    results.exams.length +
    results.files.length;

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-tajawal">
          البحث في المنصة
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          ابحث في جميع المواد والدروس المشروحة والامتحانات والملفات المرفقة.
        </p>

        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="اكتب كلمة البحث هنا..."
            className="w-full pr-12 pl-24 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft text-slate-800 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-all shadow-sm"
          >
            بحث
          </button>
        </form>
      </div>

      {/* Tabs Filter */}
      {query && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            الكل ({totalMatches})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'subjects'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            المواد ({results.subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lessons'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            الدروس ({results.lessons.length})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exams'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            الامتحانات ({results.exams.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'files'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            الملفات ({results.files.length})
          </button>
        </div>
      )}

      {/* Results View */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : query && totalMatches === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            لم يتم العثور على نتائج مطابقة لـ &quot;{query}&quot;
          </h3>
          <p className="text-xs text-slate-500">
            جرب البحث بكلمات عامة مثل (تفاضل، هندسة، فيزياء، ميكانيكا).
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Subjects Results */}
          {(activeTab === 'all' || activeTab === 'subjects') && results.subjects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                <span>المواد الدراسية ({results.subjects.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.subjects.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/subjects/${sub.slug}`}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 shadow-soft transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                        {sub.section?.title}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5 group-hover:text-brand-600 transition-colors">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {sub.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-brand-600 font-bold">
                      <span>دخول المادة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Results */}
          {(activeTab === 'all' || activeTab === 'lessons') && results.lessons.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-accent-emerald" />
                <span>الدروس المشروحة ({results.lessons.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.lessons.map((l) => (
                  <Link
                    key={l.id}
                    href={
                      user?.role === 'ADMIN'
                        ? `/subjects/${l.unit?.subject?.slug}/units/${l.unit?.id}/lessons/${l.id}/manage`
                        : `/lessons/${l.id}`
                    }
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-soft transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {l.unit?.subject?.title} • {l.unit?.title}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5 group-hover:text-emerald-500 transition-colors">
                        {l.title}
                      </h3>
                      {l.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {l.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 font-bold">
                      <span>مشاهدة الدرس ({formatDuration(l.durationMinutes)})</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Exams Results */}
          {(activeTab === 'all' || activeTab === 'exams') && results.exams.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-500" />
                <span>الامتحانات التفاعلية ({results.exams.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.exams.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/exams/${exam.id}`}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/50 shadow-soft transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600">
                        {exam.subject?.title || 'امتحان شامل'} • عام {exam.year || 2024}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5 group-hover:text-amber-500 transition-colors">
                        {exam.title}
                      </h3>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-amber-600 font-bold">
                      <span>بدء الامتحان ({exam.durationMinutes} دقيقة)</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Files Results */}
          {(activeTab === 'all' || activeTab === 'files') && results.files.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <FileDown className="w-5 h-5 text-rose-500" />
                <span>الملفات والملخصات PDF ({results.files.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-rose-500/50 shadow-soft transition-all group flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {file.lesson?.title}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1 group-hover:text-rose-500 transition-colors">
                        {file.title}
                      </h3>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center shrink-0">
                      <FileDown className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
