import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { DEFAULT_FOOTER_COLUMNS } from '@/lib/constants';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    let columns = await prisma.footerColumn.findMany({
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    if (columns.length === 0) {
      for (const col of DEFAULT_FOOTER_COLUMNS) {
        await prisma.footerColumn.create({
          data: {
            title: col.title,
            order: col.order,
            isVisible: col.isVisible,
            links: {
              create: col.links,
            },
          },
        });
      }
      columns = await prisma.footerColumn.findMany({
        include: { links: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      });
    }

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Error fetching admin footer:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب إعدادات التذييل' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const { columns } = body;

    if (!Array.isArray(columns)) {
      return NextResponse.json({ error: 'البيانات غير صالحة' }, { status: 400 });
    }

    await prisma.footerLink.deleteMany();
    await prisma.footerColumn.deleteMany();

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      await prisma.footerColumn.create({
        data: {
          title: col.title,
          order: i,
          isVisible: col.isVisible !== false,
          links: {
            create: (col.links || []).map((link: any, linkIdx: number) => ({
              title: link.title,
              href: link.href,
              icon: link.icon || null,
              order: linkIdx,
              isVisible: link.isVisible !== false,
              openInNewTab: link.openInNewTab || false,
            })),
          },
        },
      });
    }

    return NextResponse.json({ success: true, message: 'تم حفظ إعدادات التذييل بنجاح' });
  } catch (error) {
    console.error('Error updating footer:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ التذييل' }, { status: 500 });
  }
}
