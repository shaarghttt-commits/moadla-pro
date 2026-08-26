'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickKeywords = [
    'تفاضل وتكامل',
    'امتحان الهندسة 2024',
    'الفيزياء وقانون أوم',
    'جبر وهندسة فراغية',
    'محاسبة مالية',
    'أساسيات البرمجة',
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-200/80 dark:border-slate-800 transition-all hover:border-brand-500/50">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن مادة، درس، امتحان، أو ملخص PDF..."
              className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium border border-transparent focus:border-brand-500 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shrink-0"
          >
            <span>بحث فوري</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Suggestion Tags */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium shrink-0">الأكثر بحثاً:</span>
          {quickKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => router.push(`/search?q=${encodeURIComponent(kw)}`)}
              className="shrink-0 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-medium"
            >
              {kw}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
