import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const slug = params.slug;

    const group = await prisma.group.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 });
    }

    const files = await prisma.groupFile.findMany({
      where: { groupId: group.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error('GET group files error:', error);
    return NextResponse.json({ error: 'خطأ في جلب الملفات' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const slug = params.slug;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 });
    }

    const body = await request.json();
    const { title, fileUrl, fileSize, fileType } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ error: 'عنوان ورابط الملف مطلوبان' }, { status: 400 });
    }

    const file = await prisma.groupFile.create({
      data: {
        groupId: group.id,
        title: String(title).slice(0, 200),
        fileUrl,
        fileSize: fileSize || null,
        fileType: fileType || 'pdf',
        uploaderId: currentUser.id,
      },
    });

    return NextResponse.json({ file }, { status: 201 });
  } catch (error) {
    console.error('POST group file error:', error);
    return NextResponse.json({ error: 'فشل إضافة الملف' }, { status: 500 });
  }
}
