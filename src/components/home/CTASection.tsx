import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface CTASectionProps {
  ctaData?: {
    badge?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  };
}

export default function CTASection({ ctaData }: CTASectionProps) {
  const badge = ctaData?.badge || 'ابدأ مستقبلك الأكاديمي الآن';
  const title = ctaData?.title || 'ابدأ رحلتك التعليمية اليوم واضمن مقعدك في كليتك المنشودة';
  const description =
    ctaData?.description ||
    'انضم إلى آلاف الطلاب الذين يستعدون لمعادلات كليات الهندسة والحاسبات والتجارة والزراعة مع أفضل نظام تعليمي وامتحانات تفاعلية متطورة.';
  const buttonText = ctaData?.buttonText || 'إنشاء حساب مجاني الآن';
  const buttonLink = ctaData?.buttonLink || '/register';

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-brand-700/40">
        {/* Decorative Background Circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent-emerald/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-tajawal leading-tight">
            {title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تسجيل مجاني فوري</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>امتحانات تفاعلية بابل شيت</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>متابعة دقيقة لمستوى تقدمك</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={buttonLink}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-brand-900 hover:bg-slate-100 font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <span>{buttonText}</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <Link
              href="/sections"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base backdrop-blur-sm border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>استكشف المحتوى أولاً</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
