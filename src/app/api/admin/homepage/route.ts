import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_HOMEPAGE_LAYOUT } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const record = await prisma.siteSetting.findUnique({
      where: { key: 'homepage_layout' },
    });

    let layout = DEFAULT_HOMEPAGE_LAYOUT;
    if (record) {
      try {
        layout = JSON.parse(record.value);
      } catch {
        layout = DEFAULT_HOMEPAGE_LAYOUT;
      }
    }

    return NextResponse.json({ layout });
  } catch (error) {
    console.error('Error fetching homepage layout:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب تخطيط الصفحة الرئيسية' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { layout } = body;

    if (!layout || !Array.isArray(layout.sections)) {
      return NextResponse.json({ error: 'بيانات التخطيط غير صالحة' }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key: 'homepage_layout' },
      update: { value: JSON.stringify(layout) },
      create: { key: 'homepage_layout', value: JSON.stringify(layout) },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('Error saving homepage layout:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ تخطيط الصفحة الرئيسية' }, { status: 500 });
  }
}
