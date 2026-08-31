import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const postId = params.id;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول للتفاعل' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reactionType = body?.type || 'LIKE';

    // Check if like exists
    const existingLike = await prisma.userPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: currentUser.id,
        },
      },
    });

    let isLiked = false;
    let currentType = reactionType;

    if (existingLike) {
      if (existingLike.type === reactionType) {
        // Remove like
        await prisma.userPostLike.delete({
          where: { id: existingLike.id },
        });
        isLiked = false;
      } else {
        // Change reaction type
        await prisma.userPostLike.update({
          where: { id: existingLike.id },
          data: { type: reactionType },
        });
        isLiked = true;
      }
    } else {
      // Create like
      await prisma.userPostLike.create({
        data: {
          postId,
          userId: currentUser.id,
          type: reactionType,
        },
      });
      isLiked = true;
    }

    const likesCount = await prisma.userPostLike.count({
      where: { postId },
    });

    return NextResponse.json({
      success: true,
      isLiked,
      reactionType: isLiked ? currentType : null,
      likesCount,
    });
  } catch (error) {
    console.error('POST /api/users/wall/posts/[id]/like error:', error);
    return NextResponse.json({ error: 'فشل التفاعل مع المنشور' }, { status: 500 });
  }
}
