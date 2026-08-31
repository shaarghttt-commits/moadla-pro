import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.userPostComment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, username: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Fetch comments error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب التعليقات' }, { status: 500 });
  }
}

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
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'لا يمكن إرسال تعليق فارغ' }, { status: 400 });
    }

    const comment = await prisma.userPostComment.create({
      data: {
        postId,
        authorId: user.id,
        content: content.trim(),
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, username: true },
        },
      },
    });

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Post comment error:', error);
    return NextResponse.json({ error: 'فشل إرسال التعليق' }, { status: 500 });
  }
}
