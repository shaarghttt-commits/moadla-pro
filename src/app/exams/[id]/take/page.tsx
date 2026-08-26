import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import InteractiveExamEngine from '@/components/exams/InteractiveExamEngine';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id },
  });

  if (!exam) return { title: 'الامتحان غير موجود | Moadla Pro' };

  return {
    title: `جاري أداء: ${exam.title} | Moadla Pro`,
    description: 'امتحان تفاعلي محاكي للبابل شيت مع عداد زمني.',
  };
}

export default async function ExamTakePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?callbackUrl=/exams/${id}/take`);
  }

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      subject: true,
      section: true,
      questions: {
        orderBy: { order: 'asc' },
        include: {
          choices: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!exam || !exam.isPublished) {
    notFound();
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <InteractiveExamEngine exam={exam as any} />
    </div>
  );
}
