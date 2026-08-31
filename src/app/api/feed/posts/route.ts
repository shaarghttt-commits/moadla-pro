import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً للمشاركة' }, { status: 401 });
    }

    const body = await request.json();
    const { content, imageUrl, images, fileUrl, subjectTag, moodEmoji } = body;

    if (!content && !imageUrl && (!images || images.length === 0)) {
      return NextResponse.json({ error: 'محتوى المنشور أو الصورة مطلوب' }, { status: 400 });
    }

    const imagesJson =
      images && Array.isArray(images) && images.length > 0
        ? JSON.stringify(images)
        : null;

    const post = await prisma.userPost.create({
      data: {
        authorId: currentUser.id,
        targetUserId: null, // Public feed post
        content: content ? String(content).slice(0, 10000) : '',
        imageUrl: imageUrl || (images && images[0]) || null,
        imagesJson,
        fileUrl: fileUrl || null,
        subjectTag: subjectTag || 'general',
        moodEmoji: moodEmoji || null,
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
            yearOfStudy: true,
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
          reactionCounts: {},
          topReactions: [],
          images: images || (imageUrl ? [imageUrl] : []),
          comments: [],
          likes: [],
        },
        message: 'تم نشر منشورك في المجتمع بنجاح!',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/feed/posts error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المنشور' }, { status: 500 });
  }
}
