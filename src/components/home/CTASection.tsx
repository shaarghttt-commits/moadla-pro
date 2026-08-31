import Link from 'next/link';
import { ArrowLeft, Sparkles, CheckCircle2, Zap, Swords } from 'lucide-react';

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
  const badge = ctaData?.badge || 'ابدأ مستقبلك الأكاديمي اليوم 🚀';
  const title = ctaData?.title || 'ابدأ رحلتك التعليمية الآن واضمن مقعدك في كلية أحلامك';
  const description =
    ctaData?.description ||
    'انضم إلى آلاف الطلاب الذين يستعدون لمعادلات كليات الهندسة والحاسبات والتجارة والزراعة مع أفضل نظام تعليمي ذكي، مبارزات حية، وامتحانات تفاعلية متطورة.';
  const buttonText = ctaData?.buttonText || 'إنشاء حساب جديد مجاناً';
  const buttonLink = ctaData?.buttonLink || '/register';

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-[40px] bg-gradient-to-r from-brand-950 via-brand-900 to-indigo-950 text-white p-8 sm:p-16 overflow-hidden shadow-2xl border border-brand-700/50">
        {/* Background Glowing Ambient Elements */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-tajawal leading-tight text-white">
            {title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            {description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>تسجيل فوري ومجاني</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>امتحانات بابل شيت ذكية</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>مبارزات ومجموعات طلابية</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={buttonLink}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white text-brand-950 hover:bg-slate-100 font-black text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all hover:scale-105"
            >
              <span>{buttonText}</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              href="/games"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm backdrop-blur-md border border-white/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Swords className="w-4 h-4 text-amber-400" />
              <span>جرب ساحة الألعاب 🎮</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
