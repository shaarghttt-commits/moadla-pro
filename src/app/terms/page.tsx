import { BookOpen } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | Moadla Pro',
  description: 'الشروط والأحكام الخاصة باستخدام منصة Moadla Pro التعليمية.',
};

export default function TermsPage() {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-tajawal flex items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-brand-600" />
          <span>شروط وأحكام الاستخدام</span>
        </h1>
        <p className="text-xs text-slate-400">آخر تحديث: يناير 2025</p>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
            1. الاستخدام الشخصي الأكاديمي
          </h2>
          <p>
            المحتوى التعليمي والامتحانات وملفات الـ PDF المعروضة على المنصة مخصصة للأغراض التعليمية الشخصية للطلاب المسجلين.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
            2. حقوق الملكية الفكرية
          </h2>
          <p>
            كافة الشروحات وبنوك الأسئلة والتصميمات محمية بحقوق الطبع والنشر لمنصة Moadla Pro ويُحظر إعادة بيعها أو نشرها تجارياً دون تصريح مسبق.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
            3. السلوك والاستخدام العادل
          </h2>
          <p>
            يُتوقع من جميع المستخدمين الالتزام بآداب الحوار الأكاديمي وتجنب أي محاولة للتلاعب بنظام الامتحانات أو محاولة إساءة استخدام المنظومة.
          </p>
        </section>
      </div>
    </div>
  );
}
