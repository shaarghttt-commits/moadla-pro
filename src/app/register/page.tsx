'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Phone,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password, phone);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'فشل إنشاء الحساب');
      setLoading(false);
    }
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
          إنشاء حساب طالب جديد
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          انضم إلينا وابدأ المذاكرة وخوض الامتحانات التجريبية فوراً.
        </p>
      </div>

      {/* Register Card */}
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
              الاسم الكامل:
            </label>
            <div className="relative">
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد محمد السيد"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              رقم الهاتف / واتساب (اختياري):
            </label>
            <div className="relative">
              <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01012345678"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              كلمة المرور:
            </label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (6 خانات على الأقل)"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 text-xs font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <span>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>لديك حساب بالفعل؟ </span>
          <Link href="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
