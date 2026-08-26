'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowLeft,
  ShieldCheck,
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
      router.push('/dashboard');
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
    <div className="py-16 max-w-md mx-auto px-4 sm:px-6 space-y-8">
      {/* Brand Header */}
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
          تسجيل الدخول إلى حسابك
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          أهلاً بك مجدداً! أدخل بياناتك للمتابعة إلى حسابك التعليمي.
        </p>
      </div>

      {/* Login Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 shadow-soft space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-accent-rose text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

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
                placeholder="example@moadla.pro"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                كلمة المرور:
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <span>{loading ? 'جاري التحقق...' : 'تسجيل الدخول'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Accounts */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <p className="text-[11px] font-bold text-slate-400 text-center">
            أو تجربة تسجيل الدخول السريع بالحسابات التجريبية:
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student@moadla.pro', 'student123')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>حساب طالب تجريبي</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@moadla.pro', 'admin123')}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>حساب مشرف (Admin)</span>
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="pt-2 text-center text-xs text-slate-500">
          <span>ليس لديك حساب بعد؟ </span>
          <Link href="/register" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
            أنشئ حساباً مجانياً الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
