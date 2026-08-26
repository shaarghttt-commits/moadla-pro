import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const subjectId = searchParams.get('subjectId');
    const unitId = searchParams.get('unitId');
    const lessonId = searchParams.get('lessonId');
    const fileType = searchParams.get('fileType');

    const where: any = {};

    if (search) {
      where.title = { contains: search };
    }
    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (unitId) {
      where.unitId = unitId;
    }
    if (lessonId) {
      where.lessonId = lessonId;
    }
    if (fileType) {
      where.fileType = fileType;
    }

    const files = await prisma.lessonFile.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            unit: {
              select: {
                id: true,
                title: true,
                subject: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            title: true,
          },
        },
        unit: {
          select: {
            id: true,
            title: true,
            subject: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching admin files:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الملفات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { title, fileUrl, fileType = 'pdf', fileSize, lessonId, unitId, subjectId } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ error: 'اسم الملف ورابط الملف مطلوبان' }, { status: 400 });
    }

    const newFile = await prisma.lessonFile.create({
      data: {
        title,
        fileUrl,
        fileType,
        fileSize: fileSize || null,
        lessonId: lessonId || null,
        unitId: unitId || null,
        subjectId: subjectId || null,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        subject: {
          select: {
            id: true,
            title: true,
          },
        },
        unit: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ file: newFile }, { status: 201 });
  } catch (error) {
    console.error('Error creating file record:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ بيانات الملف' }, { status: 500 });
  }
}
