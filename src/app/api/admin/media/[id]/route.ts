import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';

async function safelyDeleteLocalFile(fileUrl: string) {
  try {
    if (fileUrl && fileUrl.startsWith('/uploads/')) {
      const relativePath = fileUrl.replace(/^\//, '').replace(/\//g, path.sep);
      const fullPath = path.join(process.cwd(), 'public', relativePath);
      await unlink(fullPath);
    }
  } catch (err) {
    console.warn('Could not delete physical file:', fileUrl, err);
  }
}

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
    const existing = await prisma.mediaItem.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const { name, url, type, size } = body;

    if (url && url !== existing.url) {
      await safelyDeleteLocalFile(existing.url);
    }

    const updated = await prisma.mediaItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(url !== undefined && { url }),
        ...(type !== undefined && { type }),
        ...(size !== undefined && { size }),
      },
    });

    return NextResponse.json({ mediaItem: updated });
  } catch (error) {
    console.error('Error updating media item:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل العنصر' }, { status: 500 });
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
    const existing = await prisma.mediaItem.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 });
    }

    await prisma.mediaItem.delete({ where: { id } });
    await safelyDeleteLocalFile(existing.url);

    return NextResponse.json({ success: true, message: 'تم حذف العنصر بنجاح' });
  } catch (error) {
    console.error('Error deleting media item:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف العنصر' }, { status: 500 });
  }
}
