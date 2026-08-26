import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    const units = await prisma.unit.findMany({
      where: subjectId ? { subjectId } : undefined,
      orderBy: { order: 'asc' },
      include: {
        subject: true,
        _count: { select: { lessons: true } },
      },
    });

    return NextResponse.json({ units });
  } catch (error) {
    console.error('Admin units error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { title, description, subjectId, order } = await req.json();

    if (!title || !subjectId) {
      return NextResponse.json({ error: 'العنوان والمادة مطلوبان' }, { status: 400 });
    }

    const unit = await prisma.unit.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        subjectId,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Create unit error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الوحدة' }, { status: 500 });
  }
}
