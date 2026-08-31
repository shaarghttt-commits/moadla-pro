'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  BookOpen,
  Layers,
  FileCheck2,
  Users,
  Swords,
  Compass,
  History,
  Sparkles,
  ArrowRight,
  X,
  Flame,
  User,
  Zap,
  Radio,
  Trophy,
  Crown,
  Headphones,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  // المناهج والامتحانات
  { id: 'c1', title: 'التفاضل والتكامل', subtitle: 'شروحات الفيديو وبنك مسائل الاشتقاق والتكامل', category: 'المواد الدراسية', href: '/subjects/calculus', icon: <BookOpen className="w-4 h-4 text-blue-500" />, badge: 'شائع' },
  { id: 'c2', title: 'الفيزياء وقانون أوم', subtitle: 'الدوائر الكهربية والمغناطيسية والفيزياء الحديثة', category: 'المواد الدراسية', href: '/subjects/physics', icon: <Zap className="w-4 h-4 text-amber-500" /> },
  { id: 'c3', title: 'الميكانيكا والاستاتيكا', subtitle: 'العزوم والاتزان العام والاحتكاك والديناميكا', category: 'المواد الدراسية', href: '/subjects/mechanics', icon: <Layers className="w-4 h-4 text-purple-500" /> },
  { id: 'c4', title: 'الجبر والهندسة الفراغية', subtitle: 'المصفوفات والمتجهات ومعادلات الخط والمستوى', category: 'المواد الدراسية', href: '/subjects/algebra', icon: <BookOpen className="w-4 h-4 text-emerald-500" /> },
  { id: 'e1', title: 'امتحانات المعادلة الإلكترونية 2025', subtitle: 'امتحانات وتظليل إلكتروني مع تقرير تحليل الضعف', category: 'الامتحانات', href: '/exams/simulator', icon: <FileCheck2 className="w-4 h-4 text-emerald-500" />, badge: 'امتحانات إلكترونية 📋' },
  { id: 'e2', title: 'امتحانات إلكترونية تفاعلية', subtitle: 'بنك الامتحانات الإلكترونية الشاملة بتصحيح فوري', category: 'الامتحانات', href: '/exams', icon: <FileCheck2 className="w-4 h-4 text-indigo-500" /> },
  { id: 'e3', title: 'امتحانات المعادلة السابقة PDF', subtitle: 'تحميل مباشر لكافة امتحانات الأعوام السابقة', category: 'الامتحانات', href: '/files', icon: <History className="w-4 h-4 text-amber-500" /> },
  // الأنشطة والابتكارات الجديدة
  { id: 'r1', title: 'غرف المذاكرة الحية وبومودورو 🎧', subtitle: 'مذاكرة جماعية صامتة مع أصوات تركيز Lofi وسبورة رياضية', category: 'المذاكرة الجماعية', href: '/study-rooms', icon: <Radio className="w-4 h-4 text-purple-500" />, badge: 'جديد ⏱️' },
  { id: 'l1', title: 'لوحة الشرف وتصنيف الدوريات 🏆', subtitle: 'تصنيف الطلاب الأسبوعي وتحديات الدوري الماسي ونخبة المهندسين', category: 'التنافس والألعاب', href: '/leaderboard', icon: <Trophy className="w-4 h-4 text-amber-500" />, badge: 'دوريات ⚡' },
  { id: 'l2', title: 'متجر الجوائز والأوسمة 🛍️', subtitle: 'استبدال نقاط XP بإطارات حساب حصرية وألقاب شرفية', category: 'التنافس والألعاب', href: '/rewards-shop', icon: <Crown className="w-4 h-4 text-amber-400" /> },
  { id: 's1', title: 'المجتمع والقصص الطلابية 🌐', subtitle: 'خلاصة المنشورات، القصص اليومية، والتعليقات الصوتية', category: 'المجتمع والأنشطة', href: '/feed', icon: <Compass className="w-4 h-4 text-rose-500" />, badge: '24h 🔥' },
  { id: 's2', title: 'ساحة الألعاب والمبارزات 1v1', subtitle: 'تحدي الطلاب في مبارزات علمية سريعة واكسب نقاط XP', category: 'التنافس والألعاب', href: '/games', icon: <Swords className="w-4 h-4 text-amber-500" />, badge: '1v1 🎮' },
  { id: 's3', title: 'المجموعات الدراسية', subtitle: 'انضم لمجموعات زملائك وشارك مذكراتك', category: 'المجتمع والأنشطة', href: '/groups', icon: <Users className="w-4 h-4 text-indigo-500" /> },
  { id: 's4', title: 'ملفي الشخصي وحائطي', subtitle: 'استعراض صفحتك الشخصية والقصص والأوسمة', category: 'حسابي', href: '/profile', icon: <User className="w-4 h-4 text-brand-500" /> },
];

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandSearchModal({ isOpen, onClose }: CommandSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = query.trim() === ''
    ? COMMAND_ITEMS
    : COMMAND_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        router.push(filteredItems[selectedIndex].href);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-scale-up">
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="ابحث عن مادة، امتحان، غرفة مذاكرة، دوريات، أو قسم... (ESC للإغلاق)"
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <p className="text-sm font-bold">لا توجد نتائج مطابقة لـ &quot;{query}&quot;</p>
              <p className="text-xs">جرب البحث بكلمات مثل: غرف المذاكرة، بابل شيت، دوريات، تفاضل...</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 translate-x-1'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-tajawal truncate">
                          {item.title}
                        </p>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-black">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-medium">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-2 flex items-center gap-1">
                    <span>{item.category}</span>
                    <ArrowRight className="w-3 h-3 rotate-180 opacity-60" />
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-400 font-bold">
          <div className="flex items-center gap-3">
            <span>↑↓ للتنقل</span>
            <span>•</span>
            <span>↵ للفتح</span>
          </div>
          <span className="text-brand-600 dark:text-brand-400">معادلة برو 2025 🚀</span>
        </div>
      </div>
    </div>
  );
}
