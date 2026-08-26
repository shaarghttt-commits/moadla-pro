'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-16 max-w-md mx-auto px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-500 flex items-center justify-center text-white shadow-glow">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white font-tajawal">
            Moadla <span className="text-brand-600">PRO</span>
          </span>
        </Link>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
          استعادة كلمة المرور
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          أدخل بريدك الإلكتروني المسجل وسنرسل لك تعليمات إعادة التعيين.
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-soft space-y-6">
        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-accent-emerald flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              تم إرسال رابط الاستعادة إلى بريدك بنجاح!
            </p>
            <p className="text-xs text-slate-500">
              يرجى مراجعة صندوق الوارد وصندوق الرسائل غير المرغوب فيها.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                البريد الإلكتروني:
              </label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>إرسال رابط الاستعادة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">
                العودة لصفحة تسجيل الدخول
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
