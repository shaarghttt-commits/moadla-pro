import { ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | Moadla Pro',
  description: 'سياسة حماية البيانات وخصوصية المستخدمين في منصة Moadla Pro.',
};

export default function PrivacyPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-tajawal flex items-center justify-center gap-2">
          <ShieldCheck className="w-8 h-8 text-brand-600" />
          <span>سياسة الخصوصية وحماية البيانات</span>
        </h1>
        <p className="text-xs text-slate-400">آخر تحديث: يناير 2025</p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
            1. جمع المعلومات
          </h2>
          <p>
            نقوم بجمع المعلومات الأساسية مثل الاسم، البريد الإلكتروني، ورقم الهاتف عند التسجيل بالمنصة، وذلك لإنشاء حساب الطالب ومتابعة تقدمه الدراسي ونتائج اختباراته.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
            2. استخدام البيانات
          </h2>
          <p>
            تُستخدم بياناتك فقط لتحسين تجربتك التعليمية، وعرض تقارير الأداء، وإرسال إشعارات بالامتحانات الجديدة، ولا نقوم أبداً ببيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض دعائية.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
            3. أمان وحماية الحساب
          </h2>
          <p>
            نطبق أعلى معايير التشفير لكلمات المرور والجلسات لضمان أمان حسابك وسجلاتك الأكاديمية بالكامل.
          </p>
        </section>
      </div>
    </div>
  );
}
