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

    const sections = await prisma.section.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { subjects: true, exams: true },
        },
      },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Admin sections error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { title, slug, description, icon, color, order } = await req.json();

    if (!title || !slug || !description) {
      return NextResponse.json({ error: 'يرجى إدخال البيانات الأساسية' }, { status: 400 });
    }

    const section = await prisma.section.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        icon: icon || 'Cpu',
        color: color || 'blue',
        order: Number(order) || 0,
      },
    });

    return NextResponse.json({ section });
  } catch (error: any) {
    console.error('Create section error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'الاسم اللطيف (Slug) مستخدم بالفعل' }, { status: 409 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة القسم' }, { status: 500 });
  }
}
