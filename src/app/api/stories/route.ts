import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET active stories
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('userId');

    const now = new Date();

    const whereClause: any = {
      expiresAt: { gt: now },
    };

    if (targetUserId) {
      whereClause.userId = targetUserId;
    }

    const stories = await prisma.story.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            department: true,
            role: true,
            currentStreak: true,
          },
        },
        views: currentUser
          ? {
              where: { viewerId: currentUser.id },
              select: { id: true, viewedAt: true },
            }
          : false,
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
        votes: {
          select: {
            optionId: true,
            userId: true,
          },
        },
        _count: {
          select: {
            views: true,
            reactions: true,
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group stories by user for the Stories tray
    const userMap = new Map<string, any>();

    stories.forEach((story: any) => {
      const uId = story.userId;
      const isViewed = currentUser ? (story.views as any)?.length > 0 : false;
      const myVote = currentUser && story.type === 'POLL'
        ? story.votes.find((v: any) => v.userId === currentUser.id)?.optionId
        : null;

      // Calculate vote counts and percentages for quizzes
      const totalVotes = story.votes.length;
      const optionCounts: Record<string, number> = {};
      story.votes.forEach((v: any) => {
        optionCounts[v.optionId] = (optionCounts[v.optionId] || 0) + 1;
      });

      const percentages: Record<string, number> = {};
      if (totalVotes > 0) {
        Object.keys(optionCounts).forEach((optId) => {
          percentages[optId] = Math.round((optionCounts[optId] / totalVotes) * 100);
        });
      }

      const parsedOptions = story.quizOptions
        ? JSON.parse(story.quizOptions)
        : null;

      if (!userMap.has(uId)) {
        userMap.set(uId, {
          user: story.user,
          stories: [],
          hasUnviewed: false,
          totalStories: 0,
          latestCreatedAt: story.createdAt,
        });
      }

      const userGroup = userMap.get(uId);
      userGroup.stories.push({
        ...story,
        isViewedByMe: isViewed,
        myVote,
        totalVotes,
        optionCounts,
        percentages,
        quizOptionsList: parsedOptions,
        viewsCount: story._count.views,
        reactionsCount: story._count.reactions,
      });
      userGroup.totalStories += 1;
      userGroup.latestCreatedAt = story.createdAt;
      if (!isViewed && (!currentUser || currentUser.id !== uId)) {
        userGroup.hasUnviewed = true;
      }
    });

    const groupedStories = Array.from(userMap.values()).sort((a, b) => {
      // Put currentUser's story first if exists, then unviewed stories first, then by latest creation
      if (currentUser) {
        if (a.user.id === currentUser.id) return -1;
        if (b.user.id === currentUser.id) return 1;
      }
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime();
    });

    return NextResponse.json({
      groupedStories,
      rawStories: stories,
    });
  } catch (error: any) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ error: 'فشل في تحميل القصص' }, { status: 500 });
  }
}

// POST create story
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type = 'TEXT',
      content,
      mediaUrl,
      audioUrl,
      audioDuration,
      quizQuestion,
      quizOptions,
      musicTitle,
      musicArtist,
      musicUrl,
      bgColor,
      fontFamily,
    } = body;

    if (type === 'TEXT' && (!content || !content.trim())) {
      return NextResponse.json({ error: 'محتوى القصة لا يمكن أن يكون فارغاً' }, { status: 400 });
    }

    if (type === 'IMAGE' && !mediaUrl) {
      return NextResponse.json({ error: 'يرجى إرفاق صورة القصة' }, { status: 400 });
    }

    if (type === 'QUIZ' && (!quizQuestion || !quizQuestion.trim() || !quizOptions || quizOptions.length < 2)) {
      return NextResponse.json({ error: 'يرجى كتابة السؤال وخيارين على الأقل' }, { status: 400 });
    }

    if (type === 'AUDIO' && !audioUrl) {
      return NextResponse.json({ error: 'يرجى تسجيل الملاحظة الصوتية' }, { status: 400 });
    }

    // Expiration: 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        userId: user.id,
        type,
        content: content ? content.trim() : null,
        mediaUrl: mediaUrl || null,
        audioUrl: audioUrl || null,
        audioDuration: audioDuration ? parseInt(audioDuration, 10) : null,
        musicTitle: musicTitle ? musicTitle.trim() : null,
        musicArtist: musicArtist ? musicArtist.trim() : null,
        musicUrl: musicUrl || null,
        quizQuestion: quizQuestion ? quizQuestion.trim() : null,
        quizOptions: quizOptions ? JSON.stringify(quizOptions) : null,
        bgColor: bgColor || 'from-blue-600 to-indigo-900',
        fontFamily: fontFamily || 'tajawal',
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            currentStreak: true,
          },
        },
      },
    });

    return NextResponse.json({ story, message: 'تم نشر القصة بنجاح' });
  } catch (error: any) {
    console.error('Error creating story:', error);
    return NextResponse.json({ error: 'فشل في نشر القصة' }, { status: 500 });
  }
}
