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
      return NextResponse.json({ success: false, message: 'Not logged in' });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, userId: true },
    });

    if (!story) {
      return NextResponse.json({ error: 'القصة غير موجودة' }, { status: 404 });
    }

    // Upsert view
    await prisma.storyView.upsert({
      where: {
        storyId_viewerId: {
          storyId,
          viewerId: user.id,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        storyId,
        viewerId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking story viewed:', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
