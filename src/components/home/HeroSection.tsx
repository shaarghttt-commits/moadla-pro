import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Trophy,
  Users,
  PlayCircle,
  FileCheck2,
  Award,
  HelpCircle,
} from 'lucide-react';

interface HeroSectionProps {
  heroData?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };
  statsData?: Array<{
    id: string;
    number: string;
    label: string;
    icon?: string;
  }>;
}

export default function HeroSection({ heroData, statsData }: HeroSectionProps) {
  const badge = heroData?.badge || 'المنصة التعليمية الشاملة لمعادلات الجامعات الحكومية 2025';
  const title = heroData?.title || 'طريقك للنجاح في امتحانات المعادلات يبدأ من هنا';
  const subtitle =
    heroData?.subtitle ||
    'استعد لاجتياز معادلة كلية الهندسة، الحاسبات، التجارة، والزراعة بأقوى نظام تعليمي تفاعلي: دروس فيديو متميزة، بنوك أسئلة محاكية للامتحانات الرسمية، ومتابعة فورية لمستوى تقدمك خطوة بخطوة.';
  const primaryText = heroData?.primaryButtonText || 'ابدأ رحلتك مجاناً';
  const primaryLink = heroData?.primaryButtonLink || '/register';
  const secondaryText = heroData?.secondaryButtonText || 'استكشف الأقسام والمواد';
  const secondaryLink = heroData?.secondaryButtonLink || '/sections';
  const heroImage = heroData?.imageUrl;

  const stats = statsData && statsData.length > 0 ? statsData : [
    { id: '1', number: '+15,000', label: 'طالب متفوق بالمنصة' },
    { id: '2', number: '94.8%', label: 'نسبة اجتياز المعادلة' },
    { id: '3', number: '+500', label: 'سؤال وامتحان تفاعلي' },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-accent-emerald/10 dark:bg-accent-emerald/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Right Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-600 animate-pulse flex-shrink-0" />
              <span>{badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.25] tracking-tight font-tajawal">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href={primaryLink}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 hover:from-brand-800 hover:to-brand-600 shadow-xl shadow-brand-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <span>{primaryText}</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>

              <Link
                href={secondaryLink}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>{secondaryText}</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className={`pt-6 grid grid-cols-2 sm:grid-cols-${Math.min(stats.length, 4)} gap-4 border-t border-slate-200/80 dark:border-slate-800/80 text-right`}>
              {stats.slice(0, 4).map((st, i) => (
                <div key={st.id || i}>
                  <div className="font-black text-2xl sm:text-3xl text-brand-600 dark:text-brand-400 font-tajawal">
                    {st.number}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left Column: Visual Interactive Graphic Cards or Uploaded Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {heroImage ? (
                <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative aspect-video sm:aspect-auto">
                  <img
                    src={heroImage}
                    alt="Moadla Pro Banner"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                </div>
              ) : (
                /* Interactive Fallback Graphic Card */
                <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-2xl border border-slate-800/80 overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/20 rounded-full blur-2xl" />

                  <div className="relative space-y-6">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">معادلة كلية الهندسة 2025</h3>
                          <p className="text-[11px] text-slate-400">جامعة القاهرة • عين شمس • أسيوط</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                        مفتوح للتسجيل
                      </span>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold">مادة التفاضل والتكامل</span>
                        <span className="text-brand-400 font-bold">85% مكتمل</span>
                      </div>
                      <div className="w-full bg-slate-700/50 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-brand-500 to-accent-emerald h-full rounded-full w-[85%]" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>12 من 15 درساً منجزاً</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          اجتزت الامتحان التجريبي
                        </span>
                      </div>
                    </div>

                    {/* Features Mini Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-2.5">
                        <PlayCircle className="w-4 h-4 text-brand-400" />
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">شروحات فيديو</p>
                          <p className="text-[10px] text-slate-400">جودة HD عالية</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center gap-2.5">
                        <FileCheck2 className="w-4 h-4 text-emerald-400" />
                        <div className="text-right">
                          <p className="text-xs font-bold text-white">امتحانات تفاعلية</p>
                          <p className="text-[10px] text-slate-400">تصحيح فوري بابل شيت</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
