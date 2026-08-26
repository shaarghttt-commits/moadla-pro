'use client';

import { useState, useEffect } from 'react';
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
  Bookmark,
  BookOpen,
  Layers,
  FileCheck2,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ThemeToggle from '@/components/common/ThemeToggle';
import NotificationsDropdown from '@/components/common/NotificationsDropdown';
import { DEFAULT_NAV_ITEMS } from '@/lib/constants';

interface NavItem {
  id?: string;
  title: string;
  href: string;
  icon?: string | null;
  order?: number;
  isVisible?: boolean;
  openInNewTab?: boolean;
  children?: NavItem[];
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [navRes, settingsRes] = await Promise.all([
          fetch('/api/navigation'),
          fetch('/api/settings'),
        ]);
        const navData = await navRes.json();
        if (navData.navItems && navData.navItems.length > 0) {
          setNavLinks(navData.navItems);
        }
        const settingsData = await settingsRes.json();
        if (settingsData.settings?.branding) {
          setBranding(settingsData.settings.branding);
        }
      } catch {
        // use default fallback
      }
    };
    fetchData();
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-slate-950/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-tajawal">
                    Moadla
                  </span>
                  <span className="bg-gradient-to-r from-brand-600 to-accent-emerald bg-clip-text text-transparent font-black text-xl">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1">
                  منصة معادلات الجامعات الأولى
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const hasChildren = link.children && link.children.length > 0;

                if (hasChildren) {
                  return (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(link.title)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                          active
                            ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/50 shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span>{link.title}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      {openDropdown === link.title && (
                        <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                          {link.children!.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              target={child.openInNewTab ? '_blank' : undefined}
                              className="flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                              <span>{child.title}</span>
                              {child.openInNewTab && <ExternalLink className="w-3 h-3 text-slate-400" />}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.openInNewTab ? '_blank' : undefined}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/50 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {link.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Left Actions (Theme, Search, Auth/User) */}
          <div className="flex items-center gap-2.5">
            {/* Search shortcut button */}
            <Link
              href="/search"
              aria-label="البحث في المنصة"
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Notifications Dropdown */}
            <NotificationsDropdown />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Account / Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-right"
                >
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[120px]">
                      {user.name}
                    </p>
                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                      {user.role === 'ADMIN' ? 'مشرف المنصة' : 'طالب'}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40"
                      >
                        <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        لوحة تحكم الإدارة (CMS)
                      </Link>
                    )}

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      لوحة تحكم الطالب
                    </Link>

                    <Link
                      href="/favorites"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Bookmark className="w-4 h-4 text-slate-400" />
                      المفضلة
                    </Link>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      الملف الشخصي
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-accent-rose hover:bg-rose-50 dark:hover:bg-rose-950/30 text-right"
                    >
                      <LogOut className="w-4 h-4 text-accent-rose" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-700 to-brand-500 hover:from-brand-800 hover:to-brand-600 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="القائمة الرئيسية"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200 shadow-xl">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  target={link.openInNewTab ? '_blank' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                    isActive(link.href)
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{link.title}</span>
                  {link.openInNewTab && <ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
                </Link>

                {link.children && link.children.length > 0 && (
                  <div className="pr-6 space-y-1 my-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        target={child.openInNewTab ? '_blank' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 flex items-center justify-between"
                      >
                        <span>{child.title}</span>
                        {child.openInNewTab && <ExternalLink className="w-3 h-3" />}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {!user && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
