import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest, context: any) {
  try {
    const params = await (context.params as any);
    const { id } = params;
    const post = await prisma.discussionPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        comments: { include: { author: { select: { id: true, name: true, avatar: true } }, replies: true } },
        likes: true,
      },
    });

    if (!post) return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    return NextResponse.json({ post });
  } catch (error) {
    console.error('GET /api/discussion/posts/[id] error', error);
    return NextResponse.json({ error: 'خطأ في جلب المنشور' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const params = await (context.params as any);
    const { id } = params;
    const post = await prisma.discussionPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });

    if (post.authorId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بحذف هذا المنشور' }, { status: 403 });
    }

    await prisma.discussionPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/discussion/posts/[id] error', error);
    return NextResponse.json({ error: 'خطأ في حذف المنشور' }, { status: 500 });
  }
}
