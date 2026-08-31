import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, context: any) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const params = await (context.params as any);
    const postId = params.id;
    const existing = await prisma.discussionLike.findUnique({ where: { postId_userId: { postId, userId: currentUser.id } } }).catch(() => null);

    if (existing) {
      await prisma.discussionLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    const like = await prisma.discussionLike.create({ data: { postId, userId: currentUser.id } });
    return NextResponse.json({ liked: true, likeId: like.id });
  } catch (error) {
    console.error('POST /api/discussion/posts/[id]/like error', error);
    return NextResponse.json({ error: 'خطأ في تسجيل الإعجاب' }, { status: 500 });
  }
}
