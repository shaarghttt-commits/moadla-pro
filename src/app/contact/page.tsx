'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase">
          <Sparkles className="w-4 h-4" />
          <span>فريق الدعم الفني والأكاديمي</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
          تواصل معنا في أي وقت
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          لديك استفسار حول المناهج أو شروط التقديم في المعادلات؟ فريقنا جاهز لمساعدتك.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">البريد الإلكتروني</h3>
              <p className="text-xs text-slate-500 mt-0.5">للشؤون الأكاديمية والدعم الفني</p>
              <a href="mailto:support@moadla.pro" className="text-xs text-brand-600 font-bold hover:underline block mt-1">
                support@moadla.pro
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-accent-emerald flex items-center justify-center shrink-0 font-bold">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">واتساب وخدمة الطلاب</h3>
              <p className="text-xs text-slate-500 mt-0.5">متاحون للرد السريع طوال اليوم</p>
              <a href="https://wa.me" target="_blank" rel="noreferrer" className="text-xs text-accent-emerald font-bold hover:underline block mt-1" dir="ltr">
                01070130096
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-accent-purple flex items-center justify-center shrink-0 font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">الموقع الجغرافي</h3>
              <p className="text-xs text-slate-500 mt-0.5">جمهورية مصر العربية - القاهرة والجيزة</p>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          {sent ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-accent-emerald flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                تم إرسال رسالتك بنجاح!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                شكراً لتواصلك معنا. سيقوم أحد مستشارينا الأكاديميين بالرد عليك في أقرب وقت عبر البريد الإلكتروني.
              </p>
              <button
                onClick={() => setSent(false)}
                className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
              >
                إرسال استفسار آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal mb-4">
                أرسل لنا رسالة مباشرة
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الاسم بالكامل:
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="أحمد علي"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    البريد الإلكتروني:
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الموضوع أو المسار:
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="استفسار عن معادلة الهندسة 2025"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  نص الرسالة أو السؤال:
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب استفسارك هنا بكل تفصيل..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 transition-all hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الرسالة الآن</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
