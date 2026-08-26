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
    const { title, slug, description, image, sectionId, order, isActive } = await req.json();

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        title: title?.trim(),
        slug: slug?.trim().toLowerCase(),
        description: description?.trim(),
        image: image !== undefined ? image : undefined,
        sectionId: sectionId || undefined,
        order: order !== undefined ? Number(order) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ subject });
  } catch (error) {
    console.error('Update subject error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل المادة' }, { status: 500 });
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
    await prisma.subject.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete subject error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف المادة' }, { status: 500 });
  }
}
