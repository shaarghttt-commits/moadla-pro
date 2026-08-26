import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  Bell,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'مركز الإشعارات والتنبيهات | Moadla Pro',
  description: 'جميع التنبيهات وإشعارات الامتحانات والدروس الجديدة الخاصة بحساب الطالب.',
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?callbackUrl=/notifications');
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/dashboard" className="hover:text-brand-600 transition-colors">
          لوحة تحكم الطالب
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">الإشعارات</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-3">
          <Bell className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          <span>مركز الإشعارات والتنبيهات</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          تابع كافة المستجدات والامتحانات والدروس المضافة فوراً.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            لا توجد إشعارات حالياً
          </h3>
          <p className="text-xs text-slate-500">
            سيتم إشعارك فور إضافة امتحانات أو دروس جديدة في موادك المسجلة.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-soft">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                !notif.isRead
                  ? 'bg-brand-50/40 dark:bg-brand-950/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span
                  className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                    !notif.isRead ? 'bg-brand-600 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {notif.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-1">
                    {formatDate(notif.createdAt)}
                  </span>
                </div>
              </div>

              {notif.link && (
                <Link
                  href={notif.link}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 text-xs font-bold flex items-center gap-1.5 self-end sm:self-center transition-colors shrink-0"
                >
                  <span>عرض التفاصيل</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
