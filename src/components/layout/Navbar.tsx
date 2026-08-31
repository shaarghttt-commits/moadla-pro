'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Search,
  BookOpen,
  Layers,
  FileCheck2,
  ChevronDown,
  ExternalLink,
  Users,
  MessageSquare,
  Compass,
  Flame,
  Swords,
  History,
  Sparkles,
  ArrowLeft,
  Trophy,
  Zap,
  CheckCircle2,
  Film,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import NotificationsDropdown from '@/components/common/NotificationsDropdown';
import MessagesDropdown from '@/components/common/MessagesDropdown';
import CommandSearchModal from '@/components/common/CommandSearchModal';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [commandSearchOpen, setCommandSearchOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const isGroupActive = (paths: string[]) => {
    return paths.some((p) => (p === '/' ? pathname === '/' : pathname.startsWith(p)));
  };

  const handleMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(name);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 180);
  };

  if (pathname === '/login') return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-white/90 dark:bg-slate-950/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
        {/* Top Accent Gradient Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-brand-600 via-indigo-500 to-amber-500" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* ================= 1. Brand Logo & Online Badge ================= */}
            <div className="flex items-center gap-6 lg:gap-8">
              <Link href="/" className="flex items-center gap-3.5 group shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 group-hover:rotate-2 transition-all duration-300">
                  <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white font-tajawal">
                      معادلة
                    </span>
                    <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-emerald-500 bg-clip-text text-transparent font-black text-xl">
                      برو
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                    منصة معادلات الجامعات الأولى
                  </span>
                </div>
              </Link>

              {/* ================= 2. Desktop Navigation with Mega Menus ================= */}
              <nav className="hidden lg:flex items-center gap-1">
                {/* الرئيسية */}
                <Link
                  href="/"
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 ${
                    pathname === '/'
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/90 dark:bg-brand-950/60 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  الرئيسية
                </Link>

                {/* المجتمع والقصص 🌐 */}
                <Link
                  href="/feed"
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 ${
                    isActive('/feed')
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/90 dark:bg-brand-950/60 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Compass className="w-4 h-4 text-brand-500 animate-spin-slow" />
                  <span>المجتمع والقصص</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                    24h 🔥
                  </span>
                </Link>

                {/* ريلز الطلاب 🎬 */}
                <Link
                  href="/reels"
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 ${
                    isActive('/reels')
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50/90 dark:bg-purple-950/60 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Film className="w-4 h-4 text-purple-500 animate-pulse" />
                  <span>ريلز</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black shadow-xs">
                    🎬
                  </span>
                </Link>

                {/* المناهج والامتحانات 📚 Mega Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('study')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 ${
                      isGroupActive(['/sections', '/subjects', '/exams', '/files', '/lessons'])
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50/90 dark:bg-brand-950/60 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>المناهج والامتحانات</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        openDropdown === 'study' ? 'rotate-180 text-brand-600' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* Mega Menu Container */}
                  {openDropdown === 'study' && (
                    <div className="absolute right-0 top-full mt-2 w-[440px] rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200 space-y-3">
                      {/* Grid Items */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/sections"
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 font-tajawal">
                              المواد الدراسية
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              هندسة، حاسبات، تجارة، زراعة
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/exams"
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 font-tajawal">
                              امتحانات البابل شيت
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              تصحيح فوري ومؤقت
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/exams/simulator"
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 group border border-transparent hover:border-emerald-200 dark:hover:border-emerald-700"
                        >
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-500 font-tajawal">
                              امتحانات المعادلة السابقة بابل شيت
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              تظليل إلكتروني 50 سؤال وتحليل الضعف
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/files"
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <History className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 font-tajawal">
                              تحميل الامتحانات السابقة PDF
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              تحميل مباشر مجاني لجميع المواد
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Featured Highlight Footer */}
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-brand-50 via-indigo-50 to-purple-50 dark:from-brand-950/60 dark:via-indigo-950/60 dark:to-purple-950/60 border border-brand-200/60 dark:border-brand-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">⚡</span>
                          <div>
                            <p className="text-xs font-black text-brand-900 dark:text-brand-200 font-tajawal">
                              امتحانات المعادلة السابقة بابل شيت
                            </p>
                            <p className="text-[10px] text-brand-700 dark:text-brand-400">
                              تدرب على تظليل ورقة امتحانات الجامعات بدقة 100%
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/exams/simulator"
                          className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-[10px] shadow-sm transition"
                        >
                          ابدأ الامتحان ←
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* الأنشطة والتحديات 🎮 Mega Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('activities')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 ${
                      isGroupActive(['/games', '/groups', '/discussion', '/friends'])
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50/90 dark:bg-brand-950/60 shadow-xs'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Swords className="w-4 h-4 text-amber-500" />
                    <span>الأنشطة والألعاب 🎮</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        openDropdown === 'activities' ? 'rotate-180 text-brand-600' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* Mega Menu Container */}
                  {openDropdown === 'activities' && (
                    <div className="absolute right-0 top-full mt-2 w-[440px] rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-200 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href="/games"
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 group border border-transparent hover:border-amber-200 dark:hover:border-amber-800/50"
                        >
                          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            🎮
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-500 font-tajawal">
                              ساحة المبارزات 1v1
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              تحديات حية ونقاط XP
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/groups"
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 group border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800/50"
                        >
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <Users className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-500 font-tajawal">
                              المجموعات الدراسية
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              نقاشات وتبادل ملفات
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/study-rooms"
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 group border border-transparent hover:border-purple-200 dark:hover:border-purple-800/50"
                        >
                          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            🎧
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-purple-500 font-tajawal">
                              غرف المذاكرة الحية ⏱️
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              بومودورو وسبورة مشتركة
                            </p>
                          </div>
                        </Link>

                        <Link
                          href="/leaderboard"
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-200 group border border-transparent hover:border-amber-200 dark:hover:border-amber-800/50"
                        >
                          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-500 font-tajawal">
                              لوحة الشرف والدوريات 🏆
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                              تصنيف الطلاب الأسبوعي
                            </p>
                          </div>
                        </Link>
                      </div>

                      {/* Featured Highlight Footer */}
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/20 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Trophy className="w-5 h-5 text-amber-500" />
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                              دوري المتفوقين وسوق الجوائز
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              اربح نقاط XP وافتح إطارات وألقاب حصرية
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/rewards-shop"
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] shadow-sm transition"
                        >
                          متجر الجوائز ←
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* ================= 3. Left Controls: Quick Search Cmd+K, Flame Streak, Notifications, User Profile ================= */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search Trigger with Cmd+K badge */}
              <button
                type="button"
                onClick={() => setCommandSearchOpen(true)}
                className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 transition-all shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-brand-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    بحث سريع...
                  </span>
                </div>
                <kbd className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 text-[10px] font-black text-slate-500 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Ctrl K
                </kbd>
              </button>

              {/* Mobile Search Button */}
              <button
                type="button"
                onClick={() => setCommandSearchOpen(true)}
                aria-label="البحث"
                className="md:hidden p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Gamified Streak & XP Pill (Logged In) */}
              {user && (
                <Link
                  href="/feed"
                  title="سلسلة المذاكرة اليومية"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-700/60 text-xs font-black hover:scale-105 transition shadow-xs"
                >
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
                  <span>{user.currentStreak || 1}d</span>
                  <span className="opacity-40">•</span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-300">
                    {user.gamePoints || 0} XP
                  </span>
                </Link>
              )}

              {/* Notifications */}
              <NotificationsDropdown />

              {/* Messages (Logged In) */}
              {user && <MessagesDropdown />}

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Account / Auth Profile Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-right shadow-xs"
                  >
                    <div className="hidden xl:block">
                      <p className="text-xs font-black text-slate-900 dark:text-white line-clamp-1 max-w-[110px] font-tajawal">
                        {user.name}
                      </p>
                      <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                        {user.role === 'ADMIN' ? 'مشرف المنصة' : 'طالب متميز ⚡'}
                      </span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md overflow-hidden ring-2 ring-transparent hover:ring-brand-500 transition-all">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="absolute left-0 mt-2 w-64 rounded-[28px] bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-slate-800 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      {/* User Info Header with Level */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 mb-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                            {user.name}
                          </p>
                          <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-600 dark:text-brand-400 text-[10px] font-black">
                            مستوى 3
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        {/* Level Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 w-3/4 rounded-full" />
                        </div>
                      </div>

                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>لوحة تحكم الإدارة (CMS)</span>
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <User className="w-4 h-4 text-brand-500" />
                        <span>صفحتي الشخصية والقصص</span>
                      </Link>

                      <Link
                        href="/feed"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Compass className="w-4 h-4 text-rose-500" />
                        <span>المجتمع والمنشورات</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>لوحة متابعة الطالب</span>
                      </Link>

                      <Link
                        href="/games"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Layers className="w-4 h-4 text-amber-500" />
                        <span>ساحة الألعاب والتحديات 🎮</span>
                      </Link>

                      <Link
                        href="/messages"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span>المحادثات والرسائل</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-right transition"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800"
                aria-label="القائمة الرئيسية"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ================= 4. Mobile Drawer Menu ================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 pt-4 pb-8 animate-in slide-in-from-top duration-200 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Main Links */}
              <div className="space-y-1">
                <Link
                  href="/"
                  className={`px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-3 transition ${
                    pathname === '/'
                      ? 'text-brand-600 bg-brand-50 dark:bg-brand-950/50'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>الرئيسية</span>
                </Link>

                <Link
                  href="/feed"
                  className={`px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition ${
                    isActive('/feed')
                      ? 'text-brand-600 bg-brand-50 dark:bg-brand-950/50'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4 text-brand-500" />
                    <span>المجتمع والقصص اليومية 🌐</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 text-[10px] font-black">
                    24h
                  </span>
                </Link>

                <Link
                  href="/reels"
                  className={`px-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition ${
                    isActive('/reels')
                      ? 'text-purple-600 bg-purple-50 dark:bg-purple-950/50'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-4 h-4 text-purple-500" />
                    <span>ريلز الطلاب والفيديوهات 🎬</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black">
                    جديد
                  </span>
                </Link>
              </div>

              {/* Study Sections */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                <p className="text-[11px] font-black text-slate-400 px-3 uppercase tracking-wider">
                  المناهج والامتحانات
                </p>

                <Link
                  href="/sections"
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>المواد الدراسية (هندسة، تجارة، زراعة)</span>
                </Link>

                <Link
                  href="/exams/simulator"
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  <span>امتحانات المعادلة السابقة بابل شيت</span>
                </Link>

                <Link
                  href="/files"
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <History className="w-4 h-4 text-amber-500" />
                  <span>امتحانات المعادلة السابقة PDF</span>
                </Link>
              </div>

              {/* Interactive & Social */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                <p className="text-[11px] font-black text-slate-400 px-3 uppercase tracking-wider">
                  الألعاب والأنشطة الطلابية
                </p>

                <Link
                  href="/games"
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 flex items-center gap-2.5"
                >
                  <Swords className="w-4 h-4" />
                  <span>ساحة ألعاب المبارزات 1v1 🎮</span>
                </Link>

                <Link
                  href="/groups"
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>المجموعات الدراسية</span>
                </Link>

                <Link
                  href="/discussion"
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                >
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span>المنتدى والمناقشة العامة</span>
                </Link>

                {user && (
                  <Link
                    href="/friends"
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                  >
                    <Users className="w-4 h-4 text-rose-500" />
                    <span>الأصدقاء والزملاء</span>
                  </Link>
                )}
              </div>

              {/* Auth Buttons on Mobile */}
              {!user && (
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href="/login"
                    className="w-full py-3 rounded-2xl text-center text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    className="w-full py-3 rounded-2xl text-center text-xs font-black text-white bg-gradient-to-r from-brand-600 to-indigo-600 shadow-md"
                  >
                    إنشاء حساب جديد
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette Search Modal */}
      <CommandSearchModal
        isOpen={commandSearchOpen}
        onClose={() => setCommandSearchOpen(false)}
      />
    </>
  );
}
