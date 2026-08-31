import prisma from '@/lib/prisma';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { BookOpen, ArrowLeft, FileText, PlayCircle } from 'lucide-react';
import SubjectCardClient from '@/components/subjects/SubjectCardClient';

export const revalidate = 0;

export const metadata = {
  title: 'المواد الدراسية | Moadla Pro',
  description: 'استعرض المواد الدراسية وادخل إلى كل مادة لرؤية الوحدات والدروس والفيديوهات.',
};

export default async function SubjectsPage() {
  const user = await getCurrentUser();
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      section: true,
      units: {
        include: {
          lessons: true,
        },
      },
      exams: true,
    },
  });

  return (
    <div className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand-600">المواد الدراسية</p>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white font-tajawal">
            استكشف المواد المتاحة
          </h1>
        </div>
        {user?.role === 'ADMIN' && (
          <Link
            href="/admin/lessons"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            <PlayCircle className="w-4 h-4" />
            إدارة الدروس
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {subjects.map((subject) => (
          <div key={subject.id}>
            <SubjectCardClient subject={subject} userRole={user?.role ?? null} />
          </div>
        ))}
      </div>
    </div>
  );
}
