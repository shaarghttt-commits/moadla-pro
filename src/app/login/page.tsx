'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'فشل تسجيل الدخول');
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(135deg,#020817_0%,#0f172a_30%,#111827_100%)]" />
      <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_40px_120px_rgba(15,23,42,0.8)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden overflow-hidden border-b border-white/10 bg-gradient-to-br from-brand-950 via-slate-900 to-slate-950 p-8 lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_25%)]" />

            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-500 text-white shadow-[0_12px_30px_rgba(37,99,235,0.45)] ring-1 ring-white/15">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black tracking-tight text-white font-tajawal">
                    Moadla <span className="text-brand-400">PRO</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="relative z-10 space-y-6 pt-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1.5 text-[11px] font-bold text-brand-100">
                <Sparkles className="h-3.5 w-3.5" />
                تجربة تعليمية متكاملة
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-black leading-tight text-white font-tajawal">
                  ابدأ رحلتك التعليمية
                  <span className="block text-brand-300">بأسلوب احترافي ومتميز.</span>
                </h1>
                <p className="max-w-md text-sm leading-7 text-slate-300">
                  منصة Moadla Pro تزوّدك بأحدث المحتوى، الاختبارات التفاعلية، والتجهيز للمعادلات
                  الجامعية بطريقة منظمة وفعالة.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'اختبارات تفاعلية ودقيقة',
                  'محتوى منظم حسب كل مادة',
                  'تجربة تعلم احترافية وسريعة',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-3 text-sm text-slate-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400">أمان وحماية</p>
                <p className="font-bold text-white">بياناتك محمية بالكامل</p>
              </div>
            </div>
          </div>

          <div className="relative bg-slate-950/80 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 transition-colors hover:text-brand-400"
              >
                <ArrowLeft className="h-4 w-4" />
                العودة للرئيسية
              </Link>

              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-300">
                تسجيل الدخول
              </div>
            </div>

            <div className="mb-8 text-center lg:text-right">
              <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-500 text-white shadow-[0_16px_35px_rgba(37,99,235,0.35)] lg:hidden">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white font-tajawal">
                مرحباً بعودتك
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                دخولك الآمن إلى حسابك التعليمي يفتح لك كل المحتوى والاختبارات.
              </p>
            </div>

            <div className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-300">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@moadla.pro"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pr-11 pl-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-xs font-bold text-slate-300">كلمة المرور</label>
                    <Link href="/forgot-password" className="text-[11px] font-bold text-brand-300 transition-colors hover:text-brand-200 hover:underline">
                      نسيت كلمة المرور؟
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pr-11 pl-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 px-4 py-3.5 text-xs font-black text-white shadow-[0_18px_35px_rgba(37,99,235,0.35)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(37,99,235,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </form>

              <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.8),rgba(15,23,42,0.9))] p-4 shadow-[0_18px_40px_rgba(15,23,42,0.45)]">
                <p className="mb-3 text-center text-[11px] font-bold text-slate-300">
                  أو تابع أحد الخيارات التالية
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    href="/login"
                    className="group flex items-center justify-center gap-2 rounded-2xl border border-brand-400/20 bg-gradient-to-r from-brand-500/10 to-brand-500/5 px-3 py-3 text-[11px] font-black text-slate-100 transition-all duration-200 hover:border-brand-300/40 hover:bg-brand-500/10 hover:shadow-[0_10px_25px_rgba(59,130,246,0.18)]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-300 transition-transform group-hover:scale-110" />
                    تسجيل دخول المالك
                  </Link>

                  <Link
                    href="/register"
                    className="group flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-3 py-3 text-[11px] font-black text-slate-100 transition-all duration-200 hover:border-emerald-300/40 hover:bg-emerald-500/10 hover:shadow-[0_10px_25px_rgba(16,185,129,0.18)]"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-emerald-300 transition-transform group-hover:scale-110" />
                    إنشاء حساب طالب جديد
                  </Link>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-brand-400/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(17,24,39,0.8),rgba(30,41,59,0.85))] p-4 text-center shadow-[0_16px_32px_rgba(15,23,42,0.5)]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/80 to-transparent" />
                <div className="absolute -right-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-brand-500/10 blur-2xl" />
                <div className="absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-2xl" />

                <div className="relative">
                  <p className="text-[10px] font-black tracking-[0.26em] text-brand-300/90">
                    DEVELOPER
                  </p>
                  <p className="mt-2 text-xl font-black text-white font-tajawal">
                    م. عبد الرحمن محمد ياسر
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    مطور المنصة الرقمية ومصمم تجربة المستخدم
                  </p>

                  <a
                    href="https://wa.me/201070130096?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%87%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%20%D9%85%D9%86%20%D9%85%D9%84%D9%85%D8%86%D8%AA%D8%B1%D8%A8%20%D9%86%D9%83%D8%B1%D8%A8%D8%AA%D9%8A%D9%88%20%D9%83%D9%85%D9%87%D9%8A%D9%86%20%D9%85%D9%84%D9%87%D8%8A%D8%8A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold text-emerald-200 transition-all duration-200 hover:border-emerald-300/40 hover:bg-emerald-500/15 shadow-[0_8px_20px_rgba(16,185,129,0.12)]"
                    aria-label="واتساب المطور"
                  >
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400/20 text-[10px] font-black text-emerald-200">
                      W
                    </span>
                    <span>01070130096</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
