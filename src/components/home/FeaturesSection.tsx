import {
  Layers,
  FileCheck2,
  LineChart,
  FileText,
  Sparkles,
  ShieldCheck,
  PlayCircle,
  Clock,
  BarChart2,
  Award,
  Zap,
  CheckCircle2,
  Flame,
} from 'lucide-react';

interface FeatureItem {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

interface FeaturesSectionProps {
  featuresData?: FeatureItem[];
}

const ICON_MAP: Record<string, any> = {
  Layers,
  FileCheck2,
  LineChart,
  FileText,
  Sparkles,
  ShieldCheck,
  PlayCircle,
  Clock,
  BarChart2,
  Award,
  Zap,
};

export default function FeaturesSection({ featuresData }: FeaturesSectionProps) {
  const defaultFeatures: FeatureItem[] = [
    {
      icon: 'Layers',
      title: 'محتوى أكاديمي منظم ومفصل',
      description: 'تقسيم المناهج إلى وحدات ودروس مرتبة تسهل عليك المذاكرة وفق أحدث الخرائط الزمنية للامتحانات.',
    },
    {
      icon: 'FileCheck2',
      title: 'امتحانات تفاعلية تحاكي البابل شيت',
      description: 'نظام امتحانات يحاكي اختبارات البابل شيت مع مؤقت زمني دقيق، تصحيح فوري، وشرح تفصيلي لكل خطأ.',
    },
    {
      icon: 'LineChart',
      title: 'متابعة مستوى وإحصائيات الطالب',
      description: 'لوحة تحكم ذكية ترصد نسب إنجازك لكل مادة، وسجل درجاتك في الامتحانات السابقة لتحسين مستواك.',
    },
    {
      icon: 'FileText',
      title: 'ملفات وتلخيصات PDF عالية الجودة',
      description: 'تحميل مباشر لملخصات القوانين، بنوك الأسئلة، والامتحانات السابقة بصيغة PDF قابلة للطباعة فوراً.',
    },
    {
      icon: 'Zap',
      title: 'شرح مبسط وتطبيقات عملية',
      description: 'شروحات بالفيديو مع أمثلة تطبيقية مكثفة لحل المسائل المعقدة في الرياضيات والفيزياء والميكانيكا.',
    },
    {
      icon: 'ShieldCheck',
      title: 'تحديثات مستمرة ومناهج معتمدة',
      description: 'مناهج متجددة سنوياً متوافقة مع قرارات المجلس الأعلى للجامعات وجميع شروط القبول والتنسيق.',
    },
  ];

  const features = featuresData && featuresData.length > 0 ? featuresData : defaultFeatures;

  const cardAccents = [
    { bg: 'bg-blue-50 dark:bg-blue-950/50', border: 'hover:border-blue-500/50', iconBg: 'bg-blue-500 text-white', glow: 'from-blue-500/10' },
    { bg: 'bg-emerald-50 dark:bg-emerald-950/50', border: 'hover:border-emerald-500/50', iconBg: 'bg-emerald-500 text-white', glow: 'from-emerald-500/10' },
    { bg: 'bg-purple-50 dark:bg-purple-950/50', border: 'hover:border-purple-500/50', iconBg: 'bg-purple-500 text-white', glow: 'from-purple-500/10' },
    { bg: 'bg-amber-50 dark:bg-amber-950/50', border: 'hover:border-amber-500/50', iconBg: 'bg-amber-500 text-white', glow: 'from-amber-500/10' },
    { bg: 'bg-rose-50 dark:bg-rose-950/50', border: 'hover:border-rose-500/50', iconBg: 'bg-rose-500 text-white', glow: 'from-rose-500/10' },
    { bg: 'bg-indigo-50 dark:bg-indigo-950/50', border: 'hover:border-indigo-500/50', iconBg: 'bg-indigo-500 text-white', glow: 'from-indigo-500/10' },
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/70 dark:bg-slate-950/50 border-y border-slate-200/80 dark:border-slate-800/80">
      {/* Background Subtle Gradients */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>لماذا تختار Moadla Pro؟</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-tajawal leading-tight">
            كل ما تحتاجه للتفوق والالتحاق بالكلية التي تحلم بها
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-medium">
            صممنا المنصة لتكون رفيقك الأكاديمي والتقني الموثوق طوال رحلة التحضير لامتحانات المعادلة.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const IconComponent = (feature.icon && ICON_MAP[feature.icon]) || Sparkles;
            const accent = cardAccents[idx % cardAccents.length];

            return (
              <div
                key={feature.id || idx}
                className={`rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-soft hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden flex flex-col justify-between ${accent.border}`}
              >
                {/* Subtle Hover Gradient Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${accent.glow} to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                <div>
                  <div className={`w-14 h-14 rounded-2xl ${accent.iconBg} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-tajawal mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-6 flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>ميزة مدمجة ومجانية</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
