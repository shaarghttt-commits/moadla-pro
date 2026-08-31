import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') || 'all'; // all, trending, friends, media, subject
    const subject = url.searchParams.get('subject') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const cursor = url.searchParams.get('cursor') || undefined;

    // Build where clause
    let whereClause: any = {};

    if (subject && subject !== 'ALL') {
      whereClause.subjectTag = subject;
    }

    if (tab === 'media') {
      whereClause.OR = [
        { imageUrl: { not: null } },
        { imagesJson: { not: null } },
      ];
    } else if (tab === 'friends' && currentUser) {
      // Find accepted friends IDs
      const friendships = await prisma.friendRequest.findMany({
        where: {
          status: 'ACCEPTED',
          OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
        },
        select: { senderId: true, receiverId: true },
      });

      const friendIds = friendships.map((f: any) =>
        f.senderId === currentUser.id ? f.receiverId : f.senderId
      );
      friendIds.push(currentUser.id); // Include user's own posts

      whereClause.authorId = { in: friendIds };
    }

    let orderBy: any = [{ createdAt: 'desc' }];
    if (tab === 'trending') {
      // For trending, we order by recent and take top
      orderBy = [{ createdAt: 'desc' }];
    }

    // Fetch posts
    const posts = await prisma.userPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
            department: true,
            yearOfStudy: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
            type: true,
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        comments: {
          take: 4,
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy,
      take: Math.min(limit, 50),
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const formattedPosts = posts.map((post: any) => {
      const myLike = currentUser
        ? post.likes.find((l: any) => l.userId === currentUser.id)
        : null;

      // Group reactions by type (LIKE, LOVE, FIRE, GENIUS, CLAP, LAUGH)
      const reactionCounts: Record<string, number> = {};
      post.likes.forEach((l: any) => {
        const t = l.type || 'LIKE';
        reactionCounts[t] = (reactionCounts[t] || 0) + 1;
      });

      return {
        ...post,
        isLikedByMe: !!myLike,
        myReaction: myLike?.type || null,
        reactionCounts,
        topReactions: Object.entries(reactionCounts)
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3)
          .map(([type]) => type),
        images: post.imagesJson
          ? JSON.parse(post.imagesJson)
          : post.imageUrl
          ? [post.imageUrl]
          : [],
      };
    });

    // If trending tab, sort by engagement score = (likes * 2 + comments * 3)
    if (tab === 'trending') {
      formattedPosts.sort((a: any, b: any) => {
        const scoreA = a._count.likes * 2 + a._count.comments * 3;
        const scoreB = b._count.likes * 2 + b._count.comments * 3;
        return scoreB - scoreA;
      });
    }

    // Fetch sidebar data (Top active students & suggested groups)
    const [topStudents, suggestedGroups] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          department: true,
          gamePoints: true,
          gameWins: true,
          role: true,
        },
        orderBy: [{ gamePoints: 'desc' }, { gameWins: 'desc' }],
        take: 5,
      }),
      prisma.group.findMany({
        where: { isPrivate: false },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          category: true,
          coverImage: true,
          _count: {
            select: { members: true, posts: true },
          },
        },
        orderBy: { members: { _count: 'desc' } },
        take: 4,
      }),
    ]);

    const trendingTags = [
      { tag: 'معادلة_هندسة', label: '📐 معادلة الهندسة 2025', count: 124 },
      { tag: 'تفاضل_وتكامل', label: '📈 التفاضل والتكامل', count: 89 },
      { tag: 'فيزياء_كهربية', label: '⚡ الفيزياء وقانون أوم', count: 76 },
      { tag: 'ميكانيكا_استاتيكا', label: '⚙️ استاتيكا وعزوم', count: 58 },
      { tag: 'نصائح_مذاكرة', label: '💡 نصائح تنظيم الوقت', count: 45 },
    ];

    return NextResponse.json({
      posts: formattedPosts,
      topStudents,
      suggestedGroups,
      trendingTags,
    });
  } catch (error: any) {
    console.error('GET /api/feed error:', error);
    return NextResponse.json({ error: 'فشل في جلب منشورات المجتمع' }, { status: 500 });
  }
}
