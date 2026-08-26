import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const settingsRecords = await prisma.siteSetting.findMany();
    const settingsMap: any = { ...DEFAULT_SETTINGS };

    for (const item of settingsRecords) {
      try {
        settingsMap[item.key] = JSON.parse(item.value);
      } catch {
        settingsMap[item.key] = item.value;
      }
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الإعدادات' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'المفتاح والقيمة مطلوبان' }, { status: 400 });
    }

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue },
    });

    return NextResponse.json({ success: true, setting });
  } catch (error) {
    console.error('Error saving admin setting:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ الإعدادات' }, { status: 500 });
  }
}
