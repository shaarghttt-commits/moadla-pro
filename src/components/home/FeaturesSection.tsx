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
};

export default function FeaturesSection({ featuresData }: FeaturesSectionProps) {
  const defaultFeatures: FeatureItem[] = [
    {
      icon: 'Layers',
      title: 'محتوى أكاديمي منظم',
      description: 'تقسيم المناهج إلى وحدات ودروس مرتبة تسهل عليك المذاكرة وفق أحدث الخرائط الزمنية للامتحانات.',
    },
    {
      icon: 'FileCheck2',
      title: 'امتحانات تفاعلية محاكية',
      description: 'نظام امتحانات يحاكي اختبارات البابل شيت مع عداد زمني، تصحيح فوري، وشرح تفصيلي لكل خطأ.',
    },
    {
      icon: 'LineChart',
      title: 'متابعة مستوى وتقدم الطالب',
      description: 'لوحة تحكم ذكية ترصد نسب إنجازك لكل مادة، وسجل درجاتك في الامتحانات السابقة لتحسين مستواك.',
    },
    {
      icon: 'FileText',
      title: 'ملفات وتلخيصات PDF عالية الجودة',
      description: 'تحميل مباشر لملخصات القوانين، بنوك الأسئلة، والامتحانات السابقة بصيغة PDF قابلة للطباعة.',
    },
    {
      icon: 'Sparkles',
      title: 'شرح مبسط وتطبيقات عملية',
      description: 'شروحات بالفيديو مع أمثلة تطبيقية مكثفة لحل المسائل المعقدة في الرياضيات والفيزياء والمحاسبة.',
    },
    {
      icon: 'ShieldCheck',
      title: 'تحديثات مستمرة وتوافق كامل',
      description: 'مناهج متجددة سنوياً متوافقة مع قرارات المجلس الأعلى للجامعات وجميع شروط القبول والتنسيق.',
    },
  ];

  const features = featuresData && featuresData.length > 0 ? featuresData : defaultFeatures;

  return (
    <section className="py-20 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-accent-emerald text-xs font-extrabold uppercase">
            لماذا تختار Moadla Pro؟
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
            كل ما تحتاجه للالتحاق بالكلية التي تحلم بها
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            صممنا المنصة لتكون دليلك ورفيقك الأكاديمي الموثوق طوال فترة التحضير لامتحانات المعادلة.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const IconComponent = (feature.icon && ICON_MAP[feature.icon]) || Sparkles;

            return (
              <div
                key={feature.id || idx}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-7 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
