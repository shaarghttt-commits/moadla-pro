import { HelpCircle, ChevronDown } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة | Moadla Pro',
  description: 'إجابات على الأسئلة الأكثر تكراراً حول شروط التقديم في امتحانات المعادلات، نظام البابل شيت، والمناهج.',
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'ما هي شروط التقدم لامتحان معادلة كلية الهندسة؟',
      a: 'يشترط للتقدم لمعادلة كلية الهندسة أن يكون الطالب حاصلاً على دبلوم المدارس الثانوية الصناعية (نظام 3 سنوات أو 5 سنوات) أو دبلوم المعاهد الفنية الصناعية بمجموع درجات محدد سنوياً من المجلس الأعلى للجامعات (عادة 70% فأكثر لنظام 3 سنوات أو 75% لنظام المعاهد والخمس سنوات).',
    },
    {
      q: 'ما هو نظام امتحانات المعادلات الحالي؟',
      a: 'تُعقد امتحانات المعادلات بنظام البابل شيت (اختيار من متعدد MCQ) مع استخدام أوراق الإجابة المخصصة للتصحيح الإلكتروني، وهو نفس النظام المطبق تماماً في بنك الامتحانات التفاعلي على منصة Moadla Pro.',
    },
    {
      q: 'هل المحتوى والشروحات على المنصة مجانية؟',
      a: 'نعم، توفر المنصة محتوى غني وشامل مجاناً يشمل الدروس والملخصات وبنوك الأسئلة والامتحانات التفاعلية لتسهيل وصول كل طالب للمعرفة.',
    },
    {
      q: 'كم عدد المواد المقررة في معادلة كلية الهندسة؟',
      a: 'المواد المقررة هي 6 مواد أساسية: (التفاضل والتكامل، الجبر والهندسة الفراغية، الميكانيكا - استاتيكا وديناميكا، الفيزياء العامة، الكيمياء العامة، واللغة الإنجليزية التخصصية). درجة النجاح في كل مادة هي 50%.',
    },
    {
      q: 'كيف يمكنني متابعة مستوى تقدمي في المذاكرة؟',
      a: 'من خلال "لوحة تحكم الطالب"، يمكنك متابعة نسب إنجازك لكل مادة، عدد الدروس المكتملة، سجل درجاتك في جميع الامتحانات السابقة، ومراجعة الأسئلة التي أخطأت فيها مع الشروحات النموذجية.',
    },
  ];

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase">
          <HelpCircle className="w-4 h-4" />
          <span>مركز المساعدة والإرشادات</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
          الأسئلة الأكثر شيوعاً حول المواد
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          إليك أهم الإجابات والمعلومات الأكاديمية التي تهمك في رحلتك للتحضير لامتحانات المعادلة.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-3"
          >
            <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal">
              {faq.q}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
