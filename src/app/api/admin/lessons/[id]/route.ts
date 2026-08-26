import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id } = await params;
    const {
      title,
      slug,
      description,
      contentMarkdown,
      videoUrl,
      durationMinutes,
      order,
      unitId,
    } = await req.json();

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title: title?.trim(),
        slug: slug?.trim().toLowerCase(),
        description: description !== undefined ? description : undefined,
        contentMarkdown: contentMarkdown !== undefined ? contentMarkdown : undefined,
        videoUrl: videoUrl !== undefined ? videoUrl : undefined,
        durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : undefined,
        order: order !== undefined ? Number(order) : undefined,
        unitId: unitId || undefined,
      },
    });

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Update lesson error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل الدرس' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id } = await params;
    await prisma.lesson.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete lesson error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الدرس' }, { status: 500 });
  }
}
