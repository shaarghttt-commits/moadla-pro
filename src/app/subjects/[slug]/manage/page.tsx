import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import SubjectAdminShell from '@/components/subjects/SubjectAdminShell';
import { getCurrentUser } from '@/lib/auth';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SubjectManagePage({ params }: PageProps) {
  const { slug } = await params;
  const subject = await prisma.subject.findUnique({ where: { slug } });
  if (!subject) notFound();

  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    // hide admin pages from non-admins
    notFound();
  }

  return <SubjectAdminShell slug={subject.slug} />;
}
