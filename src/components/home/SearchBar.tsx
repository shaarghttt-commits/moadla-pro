'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowLeft, Sparkles, Zap, TrendingUp } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const quickKeywords = [
    { text: 'تفاضل وتكامل', icon: '📐' },
    { text: 'امتحان الهندسة 2024', icon: '📋' },
    { text: 'الفيزياء وقانون أوم', icon: '⚡' },
    { text: 'جبر وهندسة فراغية', icon: '🔢' },
    { text: 'ميكانيكا', icon: '⚙️' },
    { text: 'أساسيات البرمجة', icon: '💻' },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
      <div className={`bg-white dark:bg-slate-900 rounded-[28px] p-4 sm:p-5 border transition-all duration-300 ${
        isFocused
          ? 'border-brand-500/60 shadow-[0_8px_40px_-4px_rgba(37,99,235,0.25)] dark:shadow-[0_8px_40px_-4px_rgba(37,99,235,0.2)]'
          : 'border-slate-200/80 dark:border-slate-800 shadow-[0_4px_30px_-4px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_30px_-4px_rgba(0,0,0,0.4)]'
      }`}>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-200 ${isFocused ? 'text-brand-500' : 'text-slate-400'}`}>
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="ابحث عن مادة، درس، امتحان، أو ملخص PDF..."
              className="w-full pr-12 pl-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm font-medium border border-slate-200/80 dark:border-slate-700/60 focus:border-brand-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-black text-sm shadow-glow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>بحث فوري</span>
          </button>
        </form>

        {/* Quick Suggestion Tags */}
        <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
            <span>الأكثر بحثاً:</span>
          </div>
          {quickKeywords.map((kw) => (
            <button
              key={kw.text}
              type="button"
              onClick={() => router.push(`/search?q=${encodeURIComponent(kw.text)}`)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/70 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-semibold text-xs flex items-center gap-1.5 border border-transparent hover:border-brand-200 dark:hover:border-brand-800"
            >
              <span>{kw.icon}</span>
              <span>{kw.text}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
