import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const targetIdOrUsername = params.id;
    const currentUser = await getCurrentUser();

    // Resolve user ID
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: targetIdOrUsername }, { username: targetIdOrUsername }],
      },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const targetUserId = targetUser.id;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const cursor = url.searchParams.get('cursor') || undefined;

    // Fetch posts: either authored by this user OR posted directly on their wall
    const posts = await prisma.userPost.findMany({
      where: {
        OR: [
          { authorId: targetUserId, targetUserId: null },
          { authorId: targetUserId, targetUserId: targetUserId },
          { targetUserId: targetUserId },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
            department: true,
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
        likes: currentUser
          ? {
              where: { userId: currentUser.id },
              select: { id: true, type: true },
            }
          : false,
        comments: {
          take: 3,
          orderBy: { createdAt: 'desc' },
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
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: Math.min(limit, 50),
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const formattedPosts = posts.map((post: any) => ({
      ...post,
      isLikedByMe: currentUser ? (post.likes as any)?.length > 0 : false,
      myReaction: currentUser && (post.likes as any)?.length > 0 ? (post.likes as any)[0]?.type : null,
      images: post.imagesJson ? JSON.parse(post.imagesJson) : post.imageUrl ? [post.imageUrl] : [],
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('GET /api/users/[id]/wall error:', error);
    return NextResponse.json({ error: 'خطأ في جلب منشورات الحائط' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const targetIdOrUsername = params.id;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول للنشر' }, { status: 401 });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: targetIdOrUsername }, { username: targetIdOrUsername }],
      },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const targetUserId = targetUser.id === currentUser.id ? null : targetUser.id;

    const body = await request.json();
    const { content, imageUrl, images, fileUrl } = body;

    if (!content && !imageUrl && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'محتوى المنشور أو الصورة مطلوبة' }, { status: 400 });
    }

    const imagesJson = images && Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null;

    const post = await prisma.userPost.create({
      data: {
        authorId: currentUser.id,
        targetUserId,
        content: content ? String(content).slice(0, 10000) : '',
        imageUrl: imageUrl || (images && images[0]) || null,
        imagesJson,
        fileUrl: fileUrl || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            role: true,
            department: true,
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
      },
    });

    return NextResponse.json(
      {
        post: {
          ...post,
          isLikedByMe: false,
          myReaction: null,
          images: images || (imageUrl ? [imageUrl] : []),
          comments: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/users/[id]/wall error:', error);
    return NextResponse.json({ error: 'فشل نشر المنشور' }, { status: 500 });
  }
}
