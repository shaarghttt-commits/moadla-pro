import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }

    const { id: postId } = await params;

    const existingLike = await prisma.userPostLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.userPostLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      return NextResponse.json({ liked: false });
    } else {
      await prisma.userPostLike.create({
        data: {
          postId,
          userId: user.id,
          type: 'LIKE',
        },
      });
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Like reel error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الإعجاب' }, { status: 500 });
  }
}
