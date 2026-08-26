import prisma from '@/lib/prisma';
import ExamsFilterClient from '@/components/exams/ExamsFilterClient';
import { FileCheck2 } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'بنك الامتحانات التفاعلية | Moadla Pro',
  description: 'امتحانات سابقة وتجريبية تفاعلية بنظام البابل شيت مع تصحيح فوري وشرح تفصيلي للإجابات لمعادلات كليات الهندسة، الحاسبات، التجارة، والزراعة.',
};

export default async function ExamsPage() {
  const rawExams = await prisma.exam.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: {
      subject: true,
      section: true,
      _count: {
        select: { questions: true },
      },
    },
  });

  const rawSections = await prisma.section.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const rawSubjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const exams = rawExams.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    subjectId: e.subjectId,
    sectionId: e.sectionId,
    year: e.year,
    durationMinutes: e.durationMinutes,
    totalMarks: e.totalMarks,
    passMarks: e.passMarks,
    isPublished: e.isPublished,
    questionsCount: e._count.questions,
    subject: e.subject
      ? {
          id: e.subject.id,
          title: e.subject.title,
          slug: e.subject.slug,
          description: e.subject.description,
          sectionId: e.subject.sectionId,
          order: e.subject.order,
          isActive: e.subject.isActive,
        }
      : null,
    section: e.section
      ? {
          id: e.section.id,
          title: e.section.title,
          slug: e.section.slug,
          description: e.section.description,
          order: e.section.order,
          isActive: e.section.isActive,
        }
      : null,
  }));

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-accent-emerald text-xs font-extrabold uppercase">
          <FileCheck2 className="w-4 h-4" />
          <span>نظام البابل شيت المحاكي</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-tajawal">
          بنك الامتحانات التفاعلية
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          اختبر مستواك الحقيقي مع مئات الأسئلة الامتحانية المصنفة، واحصل على تحليل فوري لإجاباتك مع شروحات نموذجية.
        </p>
      </div>

      <ExamsFilterClient
        exams={exams as any}
        sections={rawSections as any}
        subjects={rawSubjects as any}
      />
    </div>
  );
}
