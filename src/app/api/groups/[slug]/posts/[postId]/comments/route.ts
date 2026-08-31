import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const params = await props.params;
    const postId = params.postId;

    const comments = await prisma.groupPostComment.findMany({
      where: { postId, parentId: null },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, role: true, department: true },
        },
        replies: {
          include: {
            author: { select: { id: true, name: true, avatar: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('GET group post comments error:', error);
    return NextResponse.json({ error: 'خطأ في جلب التعليقات' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug: string; postId: string }> }
) {
  try {
    const params = await props.params;
    const postId = params.postId;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول للتعليق' }, { status: 401 });
    }

    const body = await request.json();
    const { content, parentId } = body;

    if (!content || !String(content).trim()) {
      return NextResponse.json({ error: 'نص التعليق مطلوب' }, { status: 400 });
    }

    const comment = await prisma.groupPostComment.create({
      data: {
        postId,
        authorId: currentUser.id,
        content: String(content).trim().slice(0, 3000),
        parentId: parentId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, role: true, department: true },
        },
        replies: true,
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('POST group post comment error:', error);
    return NextResponse.json({ error: 'فشل إضافة التعليق' }, { status: 500 });
  }
}
