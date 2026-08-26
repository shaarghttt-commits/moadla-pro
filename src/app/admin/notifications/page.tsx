'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function AdminNotificationsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [targetUserId, setTargetUserId] = useState('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('/exams');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((data) => setStudents(data.students || []))
      .catch(() => {});
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          link: link || null,
          targetUserId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          text: targetUserId === 'all' ? 'تم إرسال الإشعار لجميع الطلاب بنجاح! 🚀' : 'تم إرسال الإشعار للطالب المحدد بنجاح!',
        });
        setTitle('');
        setMessage('');
      } else {
        setFeedback({ type: 'error', text: data.error || 'حدث خطأ أثناء إرسال الإشعار' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayoutClient>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" />
            <span>مركز إرسال وبث الإشعارات</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            إرسال إشعارات جماعية فورية لجميع الطلاب المسجلين بالمنصة أو لطالب محدد.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-accent-emerald'
                : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-accent-rose'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الجمهور المستهدف:
              </label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold border border-slate-200 dark:border-slate-700"
              >
                <option value="all">📢 بث عام لجميع الطلاب المسجلين ({students.length} طالب)</option>
                {students.map((stu) => (
                  <option key={stu.id} value={stu.id}>
                    👤 {stu.name} ({stu.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                عنوان الإشعار:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تم نشر امتحان تجريبي جديد في الرياضيات! 📝"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نص الرسالة:
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="تفاصيل التنبيه أو التوجيهات للطلاب..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                رابط التوجيه عند الضغط على الإشعار (اختياري):
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/exams أو /lessons/..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'جاري الإرسال...' : 'إرسال الإشعار الآن'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayoutClient>
  );
}
