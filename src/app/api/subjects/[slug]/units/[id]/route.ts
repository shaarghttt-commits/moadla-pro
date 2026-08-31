import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const subject = await prisma.subject.findUnique({ where: { slug } });
  if (!subject) return NextResponse.json({ message: 'Subject not found' }, { status: 404 });

  const unit = await prisma.unit.findUnique({ where: { id } });
  if (!unit || unit.subjectId !== subject.id) {
    return NextResponse.json({ message: 'Unit not found' }, { status: 404 });
  }

  // Delete unit (cascade will remove lessons)
  await prisma.unit.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
