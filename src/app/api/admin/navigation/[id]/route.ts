import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, href, icon, order, isVisible, openInNewTab, parentId } = body;

    const item = await prisma.navItem.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(href !== undefined && { href }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isVisible !== undefined && { isVisible }),
        ...(openInNewTab !== undefined && { openInNewTab }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
      include: { children: true },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating nav item:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل عنصر القائمة' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.navItem.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'تم حذف عنصر القائمة بنجاح' });
  } catch (error) {
    console.error('Error deleting nav item:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف عنصر القائمة' }, { status: 500 });
  }
}
