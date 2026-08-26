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
    const unitId = searchParams.get('unitId');

    const lessons = await prisma.lesson.findMany({
      where: unitId ? { unitId } : undefined,
      orderBy: { order: 'asc' },
      include: {
        unit: {
          include: {
            subject: true,
          },
        },
        files: true,
      },
    });

    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Admin lessons error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const {
      title,
      slug,
      description,
      contentMarkdown,
      videoUrl,
      durationMinutes,
      order,
      unitId,
      fileTitle,
      fileUrl,
    } = await req.json();

    if (!title || !slug || !unitId) {
      return NextResponse.json({ error: 'العنوان والاسم اللطيف والوحدة مطلوبون' }, { status: 400 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description ? description.trim() : null,
        contentMarkdown: contentMarkdown ? contentMarkdown.trim() : null,
        videoUrl: videoUrl ? videoUrl.trim() : null,
        durationMinutes: Number(durationMinutes) || 15,
        order: Number(order) || 0,
        unitId,
        files: fileTitle && fileUrl ? {
          create: [{
            title: fileTitle.trim(),
            fileUrl: fileUrl.trim(),
            fileType: 'pdf',
          }]
        } : undefined,
      },
      include: {
        files: true,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Create lesson error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الدرس' }, { status: 500 });
  }
}
