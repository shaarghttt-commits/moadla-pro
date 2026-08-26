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
    const { title, description, subjectId, order } = await req.json();

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        title: title?.trim(),
        description: description !== undefined ? description : undefined,
        subjectId: subjectId || undefined,
        order: order !== undefined ? Number(order) : undefined,
      },
    });

    return NextResponse.json({ unit });
  } catch (error) {
    console.error('Update unit error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل الوحدة' }, { status: 500 });
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
    await prisma.unit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete unit error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الوحدة' }, { status: 500 });
  }
}
