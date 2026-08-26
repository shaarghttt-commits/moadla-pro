import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import SubjectDetailClient from '@/components/subjects/SubjectDetailClient';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const subject = await prisma.subject.findUnique({
    where: { slug },
  });

  if (!subject) return { title: 'المادة غير موجودة | Moadla Pro' };

  return {
    title: `${subject.title} | Moadla Pro`,
    description: subject.description,
  };
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const currentUser = await getCurrentUser();

  const subject = await prisma.subject.findUnique({
    where: { slug },
    include: {
      section: true,
      units: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              files: true,
            },
          },
        },
      },
      exams: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  // Fetch completed lesson IDs for current user
  let completedLessonIds: string[] = [];
  let isFavorite = false;

  if (currentUser) {
    const allLessonIds = subject.units.flatMap((u) => u.lessons.map((l) => l.id));
    const completedRecords = await prisma.lessonProgress.findMany({
      where: {
        userId: currentUser.id,
        lessonId: { in: allLessonIds },
        isCompleted: true,
      },
      select: { lessonId: true },
    });
    completedLessonIds = completedRecords.map((r) => r.lessonId);

    const favRecord = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: currentUser.id,
          targetType: 'SUBJECT',
          targetId: subject.id,
        },
      },
    });
    isFavorite = !!favRecord;
  }

  const totalLessonsCount = subject.units.reduce(
    (acc, u) => acc + u.lessons.length,
    0
  );

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/sections" className="hover:text-brand-600 transition-colors">
          الأقسام
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link
          href={`/sections/${subject.section.slug}`}
          className="hover:text-brand-600 transition-colors"
        >
          {subject.section.title}
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">
          {subject.title}
        </span>
      </nav>

      <SubjectDetailClient
        subject={subject as any}
        units={subject.units as any}
        exams={subject.exams as any}
        initialIsFavorite={isFavorite}
        completedLessonIds={completedLessonIds}
        totalLessonsCount={totalLessonsCount}
      />
    </div>
  );
}
