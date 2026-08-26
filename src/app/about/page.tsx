import Link from 'next/link';
import {
  GraduationCap,
  Target,
  Trophy,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'من نحن ورؤيتنا | Moadla Pro',
  description: 'تعرف على رسالة ورؤية منصة Moadla Pro في تأهيل طلاب الدبلومات والمعاهد الفنية لاجتياز امتحانات معادلات كليات الهندسة والحاسبات والتجارة والزراعة.',
};

export default function AboutPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase">
          <Sparkles className="w-4 h-4" />
          <span>عن منصة Moadla Pro</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-tajawal">
          شريكك الموثوق لتحقيق حلمك الجامعي
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          انطلقت منصة Moadla Pro برؤية واضحة: تمكين كل طالب طموح من الدبلومات الفنية والمعاهد من اجتياز امتحانات المعادلة بجدارة والالتحاق بكبرى كليات الجامعات الحكومية المصرية.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">
            رؤيتنا
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            أن نكون المنصة التعليمية الرقمية الرائدة في الوطن العربي في تأهيل وتدريب الطلاب لاختبارات القبول والمعادلات الجامعية، مع تقديم تجربة تعليمية حديثة وذكية ترتكز على التفاعل والتقييم المستمر.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-accent-emerald flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">
            رسالتنا
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            توفير بيئة تعليمية متكاملة تضم أفضل الكوادر التدريسية، مع تبسيط العلوم الهندسية والتطبيقية، وتقديم بنوك أسئلة محاكية للامتحانات الرسمية تعزز ثقة الطالب وتضمن تفوقه.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="p-8 sm:p-12 rounded-3xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-6">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal text-center">
          قيمنا الجوهرية
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2 text-center sm:text-right">
            <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white justify-center sm:justify-start">
              <CheckCircle2 className="w-5 h-5 text-brand-600" />
              <span>الجودة الأكاديمية</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              محتوى مدقق بعناية يتطابق بنسبة 100% مع مناهج المجلس الأعلى للجامعات.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-right">
            <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white justify-center sm:justify-start">
              <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
              <span>الابتكار والتفاعل</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              استخدام تقنيات البابل شيت الحديثة والمؤقتات لكسر رهبة الامتحان.
            </p>
          </div>

          <div className="space-y-2 text-center sm:text-right">
            <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white justify-center sm:justify-start">
              <CheckCircle2 className="w-5 h-5 text-accent-purple" />
              <span>دعم الطالب أولاً</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              المتابعة المستمرة وتوفير كافة الإجابات والشروحات والتوجيهات الأكاديمية.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white font-tajawal">
          هل أنت مستعد لبدء مسيرتك نحو كليتك المنشودة؟
        </h3>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all hover:scale-105"
        >
          <span>انضم إلينا الآن مجاناً</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
