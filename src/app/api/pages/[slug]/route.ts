import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';

    const page = await prisma.customPage.findUnique({
      where: { slug },
    });

    if (!page) {
      return NextResponse.json({ error: 'الصفحة غير موجودة' }, { status: 404 });
    }

    if (!page.isPublished && !preview) {
      return NextResponse.json({ error: 'هذه الصفحة في وضع المسودة' }, { status: 403 });
    }

    let parsedBlocks = [];
    if (page.blocksJson) {
      try {
        parsedBlocks = JSON.parse(page.blocksJson);
      } catch {
        parsedBlocks = [];
      }
    }

    return NextResponse.json({
      page: {
        ...page,
        blocks: parsedBlocks,
      },
    });
  } catch (error) {
    console.error('Error fetching public custom page:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الصفحة' }, { status: 500 });
  }
}
