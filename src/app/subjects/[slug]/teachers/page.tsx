import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, BookOpen, GraduationCap, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';

export const revalidate = 0;

interface SubjectTeachersPageProps {
  params: Promise<{ slug: string }>;
}

const teacherList = [
  'م/ أحمد عصام',
  'أ/ سعد عبدالموجود',
  'أ/ أحمد سرور (يلا نفهم Math)',
  'م/ أحمد ابوزيد (الميكانيكي)',
  'أ/ لطفي زهران',
  'م/ محمد عبده',
  'أ/ فتحي رمسيس',
  'أ/ احمد الفواخري (ذاكر لي رياضيات)',
  'أ/ محمد الديب',
  'أ/ محمد الدميني (المؤسس في الرياضيات)',
  'م/ محمد إبراهيم (Mo Academy)',
  'م/ أحمد فتح الله',
  'أ/ محمود الشامي (السير الشامي)',
  'م/ هشام الخرصاوي',
  'أ/ اسامة سعدالله',
  'أ/ عماد العجلوني (موسوعة الرياضيات)',
  'م/ محمد أمين',
  'أ/ حسام شكري',
  'أ/ أحمد عبدالمجيد',
  'أ/ حسن ممدوح',
  'أ/ أحمد عبدالعظيم (مقهى الرياضيات)',
  'أ/ محمد سعد (سلسلة كنوز في الرياضيات)',
  'أ/ حسام مراح',
  'أ/ سعد حجازى محمد (الحـوت فى الرياضيات البحته والتطبيقيه)',
  'أ/ محمود رجب (التميز في الرياضيات)',
];

export default async function SubjectTeachersPage({ params }: SubjectTeachersPageProps) {
  const { slug } = await params;

  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: {
      section: true,
    },
  });

  if (!subject) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between gap-3">
        <Link
          href={`/subjects/${subject.slug}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للمادة
        </Link>

        <div className="text-xs font-bold text-brand-600 dark:text-brand-400">
          {subject.section.title} / {subject.title}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-bold tracking-[0.2em] text-brand-500 uppercase">online teachers</p>
          <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white font-tajawal sm:text-4xl">
            مدرسين اونلاين لمواد الرياضيات
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            (الجبر والهندسة الفراغية، التفاضل والتكامل، الميكانيكا)
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4" />
            ملاحظة:
          </div>
          <ul className="mt-3 space-y-2 list-disc pr-5 leading-relaxed">
            <li>تم اختيار المدرسين التاليين من قبل طلاب سابقين نجحوا بالفعل في المعادلة.</li>
            <li>يجب الاعتماد على مصادر متعددة لأن بعض المدرسين يحذفون الفيديوهات بعد فترة.</li>
            <li>لا تفترض أن مدرسًا واحدًا هو الأنسب لك؛ ابحث عن طريقة الشرح المناسبة لك.</li>
          </ul>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teacherList.map((teacher, index) => (
            <div
              key={teacher}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-brand-700/60"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
                  <GraduationCap className="h-5 w-5" />
                </div>
                {index < 3 && (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700 dark:bg-amber-900/50 dark:text-amber-200">
                    Popular
                  </span>
                )}
              </div>

              <h2 className="text-lg font-black text-slate-900 dark:text-white">{teacher}</h2>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>مدرس مميز في الرياضيات</span>
              </div>

              <button
                type="button"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-700"
              >
                <BookOpen className="h-4 w-4" />
                مشاهدة الملف
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
