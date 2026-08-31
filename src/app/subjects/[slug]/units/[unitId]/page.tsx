import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import UnitAdminManager from '@/components/subjects/UnitAdminManager';
import UnitPublicView from '@/components/subjects/UnitPublicView';
import { getCurrentUser } from '@/lib/auth';

interface PageProps {
  params: Promise<{ slug: string; unitId: string }>;
}

export const revalidate = 0;

export default async function UnitPage({ params }: PageProps) {
  const { slug, unitId } = await params;

  const subject = await prisma.subject.findUnique({ where: { slug } });
  if (!subject) notFound();

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });
  if (!unit || unit.subjectId !== subject.id) notFound();

  const user = await getCurrentUser();
  if (user && user.role === 'ADMIN') {
    return <UnitAdminManager unitId={unit.id} subjectSlug={subject.slug} />;
  }

  // Public student view
  return <UnitPublicView unitId={unit.id} />;
}
