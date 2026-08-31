import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const params = await props.params;
    const postId = params.postId;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }

    const existing = await prisma.groupPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
    });

    let isLiked = false;
    if (existing) {
      await prisma.groupPostLike.delete({ where: { id: existing.id } });
      isLiked = false;
    } else {
      await prisma.groupPostLike.create({
        data: { postId, userId: currentUser.id },
      });
      isLiked = true;
    }

    const likesCount = await prisma.groupPostLike.count({ where: { postId } });

    return NextResponse.json({ isLiked, likesCount });
  } catch (error) {
    console.error('POST group post like error:', error);
    return NextResponse.json({ error: 'فشل التفاعل' }, { status: 500 });
  }
}
