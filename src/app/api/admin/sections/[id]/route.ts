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
    const { title, slug, description, icon, color, order, isActive } = await req.json();

    const section = await prisma.section.update({
      where: { id },
      data: {
        title: title?.trim(),
        slug: slug?.trim().toLowerCase(),
        description: description?.trim(),
        icon: icon || undefined,
        color: color || undefined,
        order: order !== undefined ? Number(order) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error('Update section error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل القسم' }, { status: 500 });
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
    await prisma.section.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete section error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف القسم' }, { status: 500 });
  }
}
