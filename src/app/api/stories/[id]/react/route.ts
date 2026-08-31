import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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

    const body = await request.json();
    const { emoji = '❤️' } = body;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'القصة غير موجودة' }, { status: 404 });
    }

    // Upsert reaction
    const reaction = await prisma.storyReaction.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId: user.id,
        },
      },
      update: {
        emoji,
      },
      create: {
        storyId,
        userId: user.id,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Optionally notify the story author if it's someone else
    if (story.userId !== user.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: story.userId,
            title: 'تفاعل جديد على قصتك',
            message: `تفاعل ${user.name} بـ ${emoji} على قصتك اليومية`,
            link: `/user/${story.userId}?storyId=${storyId}`,
          },
        });
      } catch (e) {
        // notification failure shouldn't fail reaction
      }
    }

    return NextResponse.json({ success: true, reaction });
  } catch (error) {
    console.error('Error reacting to story:', error);
    return NextResponse.json({ error: 'فشل التفاعل مع القصة' }, { status: 500 });
  }
}
