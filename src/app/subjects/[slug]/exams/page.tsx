import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, FileText, Search } from 'lucide-react';
import prisma from '@/lib/prisma';

export const revalidate = 0;

interface SubjectExamsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubjectExamsPage({ params }: SubjectExamsPageProps) {
  const { slug } = await params;

  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: {
      section: true,
      files: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  const pdfFiles = subject.files.filter((file) =>
    file.fileType?.toLowerCase() === 'pdf' || file.fileUrl.toLowerCase().includes('.pdf')
  );

  const historicalExamYears = [
    2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016,
    2015, 2014, 2013, 2012, 2011, 2010, 2008, 2007, 2006, 2005,
    2004, 2003, 2001,
  ];

  const examEntries = historicalExamYears.map((year) => {
    const matchingFile = pdfFiles.find((file) => new Date(file.createdAt).getFullYear() === year);
    return {
      year,
      file: matchingFile ?? null,
    };
  });

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
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-brand-500 uppercase">Previous Exams</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-tajawal sm:text-3xl">
              امتحانات الأعوام السابقة للمعادلة
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
            <Search className="h-3.5 w-3.5" />
            <span>{pdfFiles.length} ملف</span>
          </div>
        </div>

        {examEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <FileText className="mx-auto mb-3 h-10 w-10 text-slate-400" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              لا توجد ملفات PDF لهذه المادة حالياً.
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              يمكن رفع الملفات من لوحة الإدارة لاحقاً.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {examEntries.map(({ year, file }) => (
              <div
                key={year}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-brand-700/60"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-300">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                    {file ? 'PDF' : 'قريباً'}
                  </span>
                </div>

                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  {file?.title || `${subject.title} - امتحان ${year}`}
                </h2>

                <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                  {file?.fileSize ? <span>{file.fileSize}</span> : <span>امتحان سنوي</span>}
                  <span>{year}</span>
                </div>

                {file ? (
                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-700"
                  >
                    <Download className="h-4 w-4" />
                    تحميل الملف
                  </a>
                ) : (
                  <div className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    سيتم إضافة الملف قريباً
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
