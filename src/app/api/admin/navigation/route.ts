import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_NAV_ITEMS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    let navItems = await prisma.navItem.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Auto-seed default nav items if none exist
    if (navItems.length === 0) {
      for (const item of DEFAULT_NAV_ITEMS) {
        await prisma.navItem.create({ data: item });
      }
      navItems = await prisma.navItem.findMany({
        where: { parentId: null },
        include: {
          children: { orderBy: { order: 'asc' } },
        },
        orderBy: { order: 'asc' },
      });
    }

    return NextResponse.json({ navItems });
  } catch (error) {
    console.error('Error fetching admin nav items:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب عناصر القائمة' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { title, href, icon, order = 0, isVisible = true, openInNewTab = false, parentId = null } = body;

    if (!title || !href) {
      return NextResponse.json({ error: 'العنوان والرابط مطلوبان' }, { status: 400 });
    }

    const item = await prisma.navItem.create({
      data: {
        title,
        href,
        icon: icon || null,
        order: Number(order),
        isVisible,
        openInNewTab,
        parentId: parentId || null,
      },
      include: { children: true },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating nav item:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء عنصر القائمة' }, { status: 500 });
  }
}
