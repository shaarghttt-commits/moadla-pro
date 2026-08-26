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
    // Ignore if file doesn't exist or already removed
    console.warn('Could not delete physical file:', fileUrl, err);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    const file = await prisma.lessonFile.findUnique({
      where: { id },
      include: {
        lesson: true,
        unit: true,
        subject: true,
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ file });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الملف' }, { status: 500 });
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
    const existing = await prisma.lessonFile.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
    }

    const body = await request.json();
    const { title, fileUrl, fileSize, fileType, lessonId, unitId, subjectId } = body;

    // If fileUrl changed (replacement), safely delete old physical file if local
    if (fileUrl && fileUrl !== existing.fileUrl) {
      await safelyDeleteLocalFile(existing.fileUrl);
    }

    const updated = await prisma.lessonFile.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(fileSize !== undefined && { fileSize }),
        ...(fileType !== undefined && { fileType }),
        lessonId: lessonId === '' ? null : lessonId !== undefined ? lessonId : existing.lessonId,
        unitId: unitId === '' ? null : unitId !== undefined ? unitId : existing.unitId,
        subjectId: subjectId === '' ? null : subjectId !== undefined ? subjectId : existing.subjectId,
      },
      include: {
        lesson: {
          select: { id: true, title: true },
        },
        subject: {
          select: { id: true, title: true },
        },
        unit: {
          select: { id: true, title: true },
        },
      },
    });

    return NextResponse.json({ file: updated });
  } catch (error) {
    console.error('Error updating file:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث بيانات الملف' }, { status: 500 });
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
    const existing = await prisma.lessonFile.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: 'الملف غير موجود' }, { status: 404 });
    }

    // Delete record from DB
    await prisma.lessonFile.delete({ where: { id } });

    // Delete physical file from disk
    await safelyDeleteLocalFile(existing.fileUrl);

    return NextResponse.json({ success: true, message: 'تم حذف الملف بنجاح من قاعدة البيانات والقرص' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الملف' }, { status: 500 });
  }
}
