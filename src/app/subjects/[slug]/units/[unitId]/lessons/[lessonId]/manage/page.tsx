import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import LessonAdminManager from '@/components/lessons/LessonAdminManager';

interface PageProps {
  params: Promise<{ slug: string; unitId: string; lessonId: string }>;
}

export const revalidate = 0;

export default async function LessonManagePage({ params }: PageProps) {
  const { slug, unitId, lessonId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { files: true },
  });
  if (!lesson) notFound();

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-lg font-bold mb-4">إدارة الدرس: {lesson.title}</h2>
      <LessonAdminManager lesson={lesson} />
    </div>
  );
}
