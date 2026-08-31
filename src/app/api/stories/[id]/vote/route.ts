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
      return NextResponse.json({ error: 'يرجى تسجيل الدخول للتصويت' }, { status: 401 });
    }

    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return NextResponse.json({ error: 'يرجى تحديد الإجابة أو الخيار' }, { status: 400 });
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        votes: true,
      },
    });

    if (!story) {
      return NextResponse.json({ error: 'القصة غير موجودة' }, { status: 404 });
    }

    // Upsert vote
    await prisma.storyVote.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId: user.id,
        },
      },
      update: {
        optionId,
      },
      create: {
        storyId,
        userId: user.id,
        optionId,
      },
    });

    // Fetch all votes to calculate updated percentages
    const allVotes = await prisma.storyVote.findMany({
      where: { storyId },
      select: { optionId: true, userId: true },
    });

    const totalVotes = allVotes.length;
    const optionCounts: Record<string, number> = {};
    allVotes.forEach((v: any) => {
      optionCounts[v.optionId] = (optionCounts[v.optionId] || 0) + 1;
    });

    const percentages: Record<string, number> = {};
    Object.keys(optionCounts).forEach((optId) => {
      percentages[optId] = Math.round((optionCounts[optId] / totalVotes) * 100);
    });

    return NextResponse.json({
      success: true,
      myVote: optionId,
      totalVotes,
      optionCounts,
      percentages,
    });
  } catch (error: any) {
    console.error('POST /api/stories/[id]/vote error:', error);
    return NextResponse.json({ error: 'فشل تسجيل التصويت' }, { status: 500 });
  }
}
