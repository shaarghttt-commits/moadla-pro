import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const subjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
      include: {
        section: true,
        _count: {
          select: { units: true, exams: true },
        },
      },
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Admin subjects error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { title, slug, description, image, sectionId, order } = await req.json();

    if (!title || !slug || !description || !sectionId) {
      return NextResponse.json({ error: 'يرجى إكمال جميع الحقول المطلوبة' }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        image: image || null,
        sectionId,
        order: Number(order) || 0,
      },
    });

    return NextResponse.json({ subject });
  } catch (error: any) {
    console.error('Create subject error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'الاسم اللطيف (Slug) مستخدم بالفعل' }, { status: 409 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة المادة' }, { status: 500 });
  }
}
