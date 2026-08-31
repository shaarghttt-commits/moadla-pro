import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const slug = params.slug;
    const currentUser = await getCurrentUser();

    const group = await prisma.group.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 });
    }

    const posts = await prisma.groupPost.findMany({
      where: { groupId: group.id },
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
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        likes: currentUser
          ? {
              where: { userId: currentUser.id },
              select: { id: true },
            }
          : false,
        comments: {
          take: 5,
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });

    const formattedPosts = posts.map((post: any) => ({
      ...post,
      isLikedByMe: currentUser ? (post.likes as any)?.length > 0 : false,
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error('GET /api/groups/[slug]/posts error:', error);
    return NextResponse.json({ error: 'خطأ في جلب منشورات المجموعة' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const slug = params.slug;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول للنشر' }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 });
    }

    // Check membership
    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: currentUser.id,
        },
      },
    });

    if (!isMember && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'يجب الانضمام للمجموعة أولاً للنشر بها' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, imageUrl, fileUrl } = body;

    if (!content && !imageUrl) {
      return NextResponse.json({ error: 'المحتوى مطلوب' }, { status: 400 });
    }

    const post = await prisma.groupPost.create({
      data: {
        groupId: group.id,
        authorId: currentUser.id,
        title: title ? String(title).slice(0, 200) : null,
        content: String(content || '').slice(0, 10000),
        imageUrl: imageUrl || null,
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
          comments: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/groups/[slug]/posts error:', error);
    return NextResponse.json({ error: 'فشل إنشاء المنشور' }, { status: 500 });
  }
}
