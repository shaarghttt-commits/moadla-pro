import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const subject = await prisma.subject.findUnique({ where: { slug }, include: { units: { orderBy: { order: 'asc' } } } });
  if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

  return NextResponse.json({ units: subject.units });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { title, description } = body;
  if (!title || typeof title !== 'string') {
    return NextResponse.json({ message: 'Invalid title' }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({ where: { slug } });
  if (!subject) return NextResponse.json({ message: 'Subject not found' }, { status: 404 });

  const maxOrder = await prisma.unit.aggregate({ where: { subjectId: subject.id }, _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? 0) + 1;

  const unit = await prisma.unit.create({
    data: {
      title,
      description: description || null,
      subjectId: subject.id,
      order: nextOrder,
    },
  });

  return NextResponse.json({ unit }, { status: 201 });
}
