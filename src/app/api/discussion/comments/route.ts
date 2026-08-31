import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const { postId, content, parentId } = body as { postId?: string; content?: string; parentId?: string };
    if (!postId || !content) return NextResponse.json({ error: 'بيانات التعليق ناقصة' }, { status: 400 });

    const post = await prisma.discussionPost.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });

    const comment = await prisma.discussionComment.create({
      data: {
        postId,
        content: String(content).slice(0, 5000),
        authorId: currentUser.id,
        parentId: parentId || null,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('POST /api/discussion/comments error', error);
    return NextResponse.json({ error: 'خطأ في إنشاء التعليق' }, { status: 500 });
  }
}
