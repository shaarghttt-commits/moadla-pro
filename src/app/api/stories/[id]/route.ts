import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const storyId = params.id;
    const currentUser = await getCurrentUser();

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            department: true,
          },
        },
        views: {
          include: {
            viewer: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { viewedAt: 'desc' },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'القصة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json({ error: 'فشل في جلب القصة' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const storyId = params.id;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, userId: true },
    });

    if (!story) {
      return NextResponse.json({ error: 'القصة غير موجودة' }, { status: 404 });
    }

    if (story.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بحذف هذه القصة' }, { status: 403 });
    }

    await prisma.story.delete({
      where: { id: storyId },
    });

    return NextResponse.json({ success: true, message: 'تم حذف القصة' });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json({ error: 'فشل في حذف القصة' }, { status: 500 });
  }
}
