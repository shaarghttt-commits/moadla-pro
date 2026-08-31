'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Bell,
  Megaphone,
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Sparkles,
  Check,
  X,
  Loader2,
  FileDown,
  Upload,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLiveEditor } from './LiveVisualEditorProvider';

export default function AdminUniversalControlBar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isLiveEditActive, setIsLiveEditActive } = useLiveEditor();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStudentPreview, setIsStudentPreview] = useState(false);

  // Quick Action Modal States
  const [activeModal, setActiveModal] = useState<
    'ANNOUNCEMENT' | 'NOTIFICATION' | 'QUICK_LESSON' | 'QUICK_FILE' | null
  >(null);

  // Form states
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Only render for ADMIN users
  if (!user || user.role !== 'ADMIN' || isStudentPreview) {
    if (user?.role === 'ADMIN' && isStudentPreview) {
      return (
        <div className="fixed bottom-4 left-4 z-50 animate-bounce">
          <button
            onClick={() => setIsStudentPreview(false)}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border-2 border-white"
          >
            <EyeOff className="w-4 h-4" />
            <span>العودة لوضع الأدمن 🛡️</span>
          </button>
        </div>
      );
    }
    return null;
  }

  // Determine current page context
  const getContextualLinks = () => {
    if (pathname === '/') {
      return {
        label: 'الصفحة الرئيسية',
        editHref: '/admin/homepage',
        addHref: '/admin/sections',
      };
    }
    if (pathname.startsWith('/subjects')) {
      return {
        label: 'المواد والمناهج',
        editHref: '/admin/subjects',
        addHref: '/admin/subjects',
      };
    }
    if (pathname.startsWith('/lessons')) {
      return {
        label: 'شروحات الدروس',
        editHref: '/admin/lessons',
        addHref: '/admin/lessons',
      };
    }
    if (pathname.startsWith('/exams')) {
      return {
        label: 'الامتحانات والبابل شيت',
        editHref: '/admin/exams',
        addHref: '/admin/exams',
      };
    }
    if (pathname.startsWith('/feed')) {
      return {
        label: 'المجتمع والقصص',
        editHref: '/admin/social',
        addHref: '/admin/notifications',
      };
    }
    if (pathname.startsWith('/games')) {
      return {
        label: 'ساحة الألعاب والتحديات',
        editHref: '/admin/settings',
        addHref: '/admin/settings',
      };
    }
    return {
      label: 'لوحة التحكم العامة',
      editHref: '/admin',
      addHref: '/admin',
    };
  };

  const currentContext = getContextualLinks();

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'urgent_announcement',
          value: JSON.stringify({
            text: announcementText.trim(),
            link: announcementLink.trim(),
            isActive: true,
            updatedAt: new Date().toISOString(),
          }),
        }),
      });

      if (!res.ok) throw new Error('فشل حفظ الإعلان');
      setSuccessMsg('تم نشر الإعلان العاجل أعلى الموقع بنجاح!');
      setTimeout(() => {
        setActiveModal(null);
        setSuccessMsg('');
        setAnnouncementText('');
        setAnnouncementLink('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء النشر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendGlobalNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notifTitle.trim(),
          message: notifMessage.trim(),
        }),
      });

      if (!res.ok) throw new Error('فشل إرسال الإشعار');
      setSuccessMsg('تم إرسال الإشعار الفوري لجميع الطلاب المسجلين!');
      setTimeout(() => {
        setActiveModal(null);
        setSuccessMsg('');
        setNotifTitle('');
        setNotifMessage('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Admin Master Bar */}
      <div className="fixed top-20 left-4 z-40 animate-fade-in font-tajawal">
        <div className="bg-slate-950/90 hover:bg-slate-950 text-white backdrop-blur-2xl border-2 border-brand-500/40 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 max-w-sm">
          {/* Header Bar */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-brand-900/60 via-purple-950/60 to-slate-900 flex items-center justify-between gap-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-md animate-pulse">
                🛡️
              </div>
              <div>
                <p className="text-xs font-black text-white leading-tight">
                  تحكم الأدمن الشامل
                </p>
                <p className="text-[9px] text-brand-300 font-bold">
                  {currentContext.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsStudentPreview(true)}
                title="معاينة كطالب عادي"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
              >
                {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Body Controls (Collapsible) */}
          {!isMinimized && (
            <div className="p-3 space-y-2.5 text-xs">
              {/* LIVE VISUAL EDIT TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setIsLiveEditActive(!isLiveEditActive)}
                className={`w-full py-2.5 px-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border transition-all ${
                  isLiveEditActive
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-emerald-400 animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/15'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isLiveEditActive ? '⚡ التعديل البصري (مفعل 🟢)' : 'تفعيل التعديل البصري فوق أي عنصر 🎯'}</span>
              </button>

              {/* Contextual Action Row */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={currentContext.editHref}
                  className="py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition hover:scale-102 text-center"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>تعديل هذا القسم</span>
                </Link>

                <Link
                  href="/admin"
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition hover:scale-102 text-center"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-brand-400" />
                  <span>لوحة الإدارة</span>
                </Link>
              </div>

              {/* Quick Action Badges */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveModal('ANNOUNCEMENT')}
                  className="py-1.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center justify-center gap-1 transition"
                >
                  <Megaphone className="w-3 h-3 text-amber-400" />
                  <span>إعلان عاجل</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal('NOTIFICATION')}
                  className="py-1.5 px-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-[10px] flex items-center justify-center gap-1 transition"
                >
                  <Bell className="w-3 h-3 text-purple-400" />
                  <span>إشعار للكل</span>
                </button>

                <Link
                  href="/admin/lessons"
                  className="py-1.5 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center justify-center gap-1 transition"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>إضافة درس</span>
                </Link>
              </div>

              {/* CMS Sections Quick Access Links */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
                <Link href="/admin/students" className="hover:text-brand-400">
                  👥 الطلاب
                </Link>
                <span>•</span>
                <Link href="/admin/exams" className="hover:text-brand-400">
                  📝 الامتحانات
                </Link>
                <span>•</span>
                <Link href="/admin/files" className="hover:text-brand-400">
                  📁 الملفات
                </Link>
                <span>•</span>
                <Link href="/admin/seo" className="hover:text-brand-400">
                  🌐 SEO
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK ANNOUNCEMENT MODAL */}
      {activeModal === 'ANNOUNCEMENT' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  نشر شريط إعلان عاجل أعلى الموقع 📢
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نص الإعلان العاجل:
                </label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="مثال: تم رفع امتحان التفاضل والتكامل التجريبي 2025 مع نموذج الإجابة الرسمية..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  رابط اختياري عند الضغط على الإعلان:
                </label>
                <input
                  type="text"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                  placeholder="/exams/simulator أو https://..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>نشر الإعلان فوراً 🚀</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK GLOBAL NOTIFICATION MODAL */}
      {activeModal === 'NOTIFICATION' && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-purple-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  إرسال إشعار فوري لجميع الطلاب 🔔
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSendGlobalNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان الإشعار:
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="مثال: تنبيه هام بخصوص موعد اختبارات المعادلة"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نص الرسالة:
                </label>
                <textarea
                  rows={3}
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="اكتب تفاصيل التنبيه أو التوجيه للطلاب..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إرسال الإشعار للجميع 🚀</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
