import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import LessonViewClient from '@/components/lessons/LessonViewClient';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
  });

  if (!lesson) return { title: 'الدرس غير موجود | Moadla Pro' };

  return {
    title: `${lesson.title} | Moadla Pro`,
    description: lesson.description || 'شرح الدرس التعليمي مع الفيديو والمذكرات وملفات الـ PDF.',
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      files: true,
      unit: {
        include: {
          subject: {
            include: {
              section: true,
              units: {
                orderBy: { order: 'asc' },
                include: {
                  lessons: {
                    orderBy: { order: 'asc' },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Determine prev and next lesson
  const allSubjectLessons = lesson.unit.subject.units.flatMap((u) => u.lessons);
  const currentIndex = allSubjectLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = currentIndex > 0 ? allSubjectLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allSubjectLessons.length - 1 ? allSubjectLessons[currentIndex + 1] : null;

  // Check progress and favorite for current user
  let isCompleted = false;
  let isFavorite = false;
  let completedLessonIds: string[] = [];

  if (currentUser) {
    const allLessonIds = allSubjectLessons.map((l) => l.id);
    const completedRecords = await prisma.lessonProgress.findMany({
      where: {
        userId: currentUser.id,
        lessonId: { in: allLessonIds },
        isCompleted: true,
      },
      select: { lessonId: true },
    });
    completedLessonIds = completedRecords.map((r) => r.lessonId);
    isCompleted = completedLessonIds.includes(lesson.id);

    const favRecord = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: currentUser.id,
          targetType: 'LESSON',
          targetId: lesson.id,
        },
      },
    });
    isFavorite = !!favRecord;
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto pb-2">
        <Link href="/" className="hover:text-brand-600 transition-colors shrink-0">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
        <Link
          href={`/sections/${lesson.unit.subject.section.slug}`}
          className="hover:text-brand-600 transition-colors shrink-0"
        >
          {lesson.unit.subject.section.title}
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
        <Link
          href={`/subjects/${lesson.unit.subject.slug}`}
          className="hover:text-brand-600 transition-colors shrink-0"
        >
          {lesson.unit.subject.title}
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 shrink-0" />
        <span className="text-slate-800 dark:text-slate-200 font-bold truncate">
          {lesson.title}
        </span>
      </nav>

      <LessonViewClient
        lesson={lesson as any}
        initialIsCompleted={isCompleted}
        initialIsFavorite={isFavorite}
        completedLessonIds={completedLessonIds}
        prevLesson={prevLesson as any}
        nextLesson={nextLesson as any}
      />
    </div>
  );
}
