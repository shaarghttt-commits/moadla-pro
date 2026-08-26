import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_FOOTER_COLUMNS } from '@/lib/constants';

export async function GET() {
  try {
    const columns = await prisma.footerColumn.findMany({
      where: { isVisible: true },
      include: {
        links: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    if (columns.length === 0) {
      return NextResponse.json({ columns: DEFAULT_FOOTER_COLUMNS });
    }

    return NextResponse.json({ columns });
  } catch (error) {
    console.error('Error fetching public footer:', error);
    return NextResponse.json({ columns: DEFAULT_FOOTER_COLUMNS });
  }
}
