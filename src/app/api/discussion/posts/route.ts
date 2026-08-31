import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || undefined;
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  try {
    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : { isHidden: false };

    const posts = await prisma.discussionPost.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true, role: true } },
        _count: { select: { comments: true, likes: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(limit, 100),
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('GET /api/discussion/posts error', error);
    return NextResponse.json({ error: 'خطأ في جلب المنشورات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const { title: rawTitle, content, imageUrl, fileUrl } = body;
    if (!content) return NextResponse.json({ error: 'المحتوى مطلوب' }, { status: 400 });
    const title = rawTitle ? String(rawTitle).slice(0, 300) : String(content).slice(0, 50);

    const post = await prisma.discussionPost.create({
      data: {
        title,
        content: String(content).slice(0, 20000),
        imageUrl: imageUrl || null,
        fileUrl: fileUrl || null,
        authorId: currentUser.id,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('POST /api/discussion/posts error', error);
    return NextResponse.json({ error: 'خطأ في إنشاء المنشور' }, { status: 500 });
  }
}
