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
    const type = searchParams.get('type'); // 'image', 'pdf', 'video', 'doc'

    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }
    if (type && type !== 'all') {
      where.type = type;
    }

    const media = await prisma.mediaItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب عناصر الوسائط' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { name, url, type = 'image', size, mimeType, dimensions } = body;

    if (!name || !url) {
      return NextResponse.json({ error: 'الاسم والرابط مطلوبان' }, { status: 400 });
    }

    const mediaItem = await prisma.mediaItem.create({
      data: {
        name,
        url,
        type,
        size: size || null,
        mimeType: mimeType || null,
        dimensions: dimensions || null,
      },
    });

    return NextResponse.json({ mediaItem }, { status: 201 });
  } catch (error) {
    console.error('Error adding media item:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة العنصر' }, { status: 500 });
  }
}
