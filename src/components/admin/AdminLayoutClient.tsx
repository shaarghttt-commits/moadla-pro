'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  FolderTree,
  PlayCircle,
  FileCheck2,
  Users,
  Bell,
  ArrowRight,
  ShieldCheck,
  FileText,
  Settings2,
  Image as ImageIcon,
  Navigation2,
  Globe,
  LayoutTemplate,
  PanelBottom,
  Search,
  Home,
} from 'lucide-react';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname();

  const linkGroups = [
    {
      label: 'الإدارة العامة',
      links: [
        { href: '/admin', label: 'الإحصائيات', icon: <LayoutDashboard className="w-4 h-4" /> },
        { href: '/admin/students', label: 'الطلاب', icon: <Users className="w-4 h-4" /> },
        { href: '/admin/notifications', label: 'الإشعارات', icon: <Bell className="w-4 h-4" /> },
      ],
    },
    {
      label: 'إدارة الموقع (CMS)',
      links: [
        { href: '/admin/homepage', label: 'الصفحة الرئيسية', icon: <Home className="w-4 h-4" /> },
        { href: '/admin/settings', label: 'هوية المنصة والمحتوى', icon: <Settings2 className="w-4 h-4" /> },
        { href: '/admin/navigation', label: 'شريط التنقل (Navbar)', icon: <Navigation2 className="w-4 h-4" /> },
        { href: '/admin/footer', label: 'تذييل الصفحة (Footer)', icon: <PanelBottom className="w-4 h-4" /> },
        { href: '/admin/pages', label: 'الصفحات المخصصة', icon: <LayoutTemplate className="w-4 h-4" /> },
        { href: '/admin/seo', label: 'إعدادات SEO والميتا تاج', icon: <Search className="w-4 h-4" /> },
      ],
    },
    {
      label: 'المحتوى التعليمي',
      links: [
        { href: '/admin/sections', label: 'الأقسام', icon: <Layers className="w-4 h-4" /> },
        { href: '/admin/subjects', label: 'المواد', icon: <BookOpen className="w-4 h-4" /> },
        { href: '/admin/units', label: 'الوحدات', icon: <FolderTree className="w-4 h-4" /> },
        { href: '/admin/lessons', label: 'الدروس', icon: <PlayCircle className="w-4 h-4" /> },
        { href: '/admin/exams', label: 'الامتحانات', icon: <FileCheck2 className="w-4 h-4" /> },
      ],
    },
    {
      label: 'مكتبة الملفات',
      links: [
        { href: '/admin/media', label: 'مكتبة الوسائط (Media Library)', icon: <ImageIcon className="w-4 h-4" /> },
        { href: '/admin/files', label: 'مذكرات PDF', icon: <FileText className="w-4 h-4" /> },
      ],
    },
  ];

  const allLinks = linkGroups.flatMap((g) => g.links);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Admin Top Header Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-5 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-600 flex items-center justify-center font-bold text-white shadow-glow">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black font-tajawal">لوحة تحكم المشرف — Full CMS</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                Admin Panel
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              نظام إدارة المحتوى الكامل — تحكم بالموقع بالكامل دون تعديل أي كود.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>عرض الموقع</span>
          </a>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>عرض كطالب</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Tabs Navigation — grouped */}
      <div className="space-y-2">
        {linkGroups.map((group) => (
          <div key={group.label} className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-1 pr-3 shrink-0 py-1">
              {group.label}:
            </span>
            {group.links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Main Admin Content */}
      <div className="min-h-[500px]">{children}</div>
    </div>
  );
}
