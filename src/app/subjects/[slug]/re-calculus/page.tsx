import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Download, FileText, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';

export const revalidate = 0;

interface ReCalculusPageProps {
  params: Promise<{ slug: string }>;
}

const reviewResources = [
  {
    title: 'المعاصر - المراجعة النهائية في التفاضل والتكامل (2022)',
    href: 'https://drive.google.com/file/d/1VUuJUB2oP2bJLo3JRdGtRKUjFEImiN6J/view?usp=drive_link',
  },
  {
    title: 'مراجعة التفاضل والتكامل - مكتب مستشار الرياضيات',
    href: 'https://drive.google.com/file/d/1VktfEXLjni5uzoyXQCofOerKKlGpZTnw/view?usp=drive_link',
  },
  {
    title: 'مراجعة تفاضل وتكامل - جريدة الجمهورية',
    href: 'https://drive.google.com/file/d/1VmKDCOZEL6afqoQxaBihfHV2b96h5lVh/view?usp=drive_link',
  },
];

export default async function ReCalculusPage({ params }: ReCalculusPageProps) {
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
          <p className="text-[11px] font-bold tracking-[0.2em] text-brand-500 uppercase">final review</p>
          <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white font-tajawal sm:text-4xl">
            مراجعة التفاضل والتكامل
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            مراجعات نهائية، ملخصات، ومصادر معتمدة لطلاب المعادلة
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-200">
          <div className="flex items-center gap-2 font-bold">
            <Sparkles className="h-4 w-4" />
            مراجعات قوية ومفيدة
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviewResources.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-brand-700/60"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                  PDF
                </span>
              </div>

              <h2 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h2>

              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-700"
              >
                <Download className="h-4 w-4" />
                فتح المصدر
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
