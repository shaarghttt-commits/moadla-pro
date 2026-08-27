import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_NAV_ITEMS } from '@/lib/constants';

export async function GET() {
  try {
    const navItems = await prisma.navItem.findMany({
      where: {
        parentId: null,
        isVisible: true,
      },
      include: {
        children: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    const normalizedNavItems = navItems.map((item) => ({
      ...item,
      href: item.href === '/admin/files' ? '/files' : item.href,
      children: (item.children || []).map((child) => ({
        ...child,
        href: child.href === '/admin/files' ? '/files' : child.href,
      })),
    }));

    if (navItems.length === 0) {
      return NextResponse.json({ navItems: DEFAULT_NAV_ITEMS.map((item) => ({
        ...item,
        href: item.href === '/admin/files' ? '/files' : item.href,
      })) });
    }

    return NextResponse.json({ navItems: normalizedNavItems });
  } catch (error) {
    console.error('Error fetching public nav items:', error);
    return NextResponse.json({ navItems: DEFAULT_NAV_ITEMS });
  }
}
