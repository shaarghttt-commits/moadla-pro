import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_SEO } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const record = await prisma.siteSetting.findUnique({
      where: { key: 'site_seo' },
    });

    let seo = DEFAULT_SEO;
    if (record) {
      try {
        seo = { ...DEFAULT_SEO, ...JSON.parse(record.value) };
      } catch {
        seo = DEFAULT_SEO;
      }
    }

    return NextResponse.json({ seo });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب إعدادات SEO' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { seo } = body;

    if (!seo) {
      return NextResponse.json({ error: 'البيانات غير صالحة' }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key: 'site_seo' },
      update: { value: JSON.stringify(seo) },
      create: { key: 'site_seo', value: JSON.stringify(seo) },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('Error saving SEO settings:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ إعدادات SEO' }, { status: 500 });
  }
}
