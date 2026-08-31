import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');

    const whereClause: any = {
      OR: [
        { subjectTag: 'reel' },
        { fileUrl: { contains: 'mp4' } },
        { fileUrl: { contains: 'video' } },
        { fileUrl: { contains: 'webm' } },
      ],
    };

    if (tag && tag !== 'all') {
      whereClause.moodEmoji = tag;
    }

    const posts = await prisma.userPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, name: true, avatar: true, username: true, department: true, role: true },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        likes: {
          select: { userId: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    // Seed default engaging educational reels if empty
    if (posts.length === 0) {
      const admin = await prisma.user.findFirst();
      if (admin) {
        const seedReel1 = await prisma.userPost.create({
          data: {
            authorId: admin.id,
            content: 'خدعة عبقرية لحل تكامل الدوال المثلثية في 10 ثوانٍ فقط بدون خطوات معقدة! 📐🔥 #تفاضل_وتكامل #معادلة_هندسة #نصائح_تفوق',
            fileUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-student-taking-notes-on-a-notebook-42880-large.mp4',
            subjectTag: 'reel',
            moodEmoji: 'math',
            imagesJson: JSON.stringify({ audioTitle: 'شرح رياضي سريع 🎵', soundAuthor: 'معادلة برو' }),
          },
          include: {
            author: { select: { id: true, name: true, avatar: true, username: true, department: true, role: true } },
            comments: { include: { author: { select: { id: true, name: true, avatar: true } } } },
            likes: { select: { userId: true, type: true } },
          },
        });

        const seedReel2 = await prisma.userPost.create({
          data: {
            authorId: admin.id,
            content: 'إزاي تنظم وقتك وتخلص 50 سؤال بابل شيت في ساعتين في امتحان الفيزياء؟ ⚡⏱️ #فيزياء #بابل_شيت #تنظيم_الوقت',
            fileUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-studying-with-a-laptop-and-taking-notes-42882-large.mp4',
            subjectTag: 'reel',
            moodEmoji: 'physics',
            imagesJson: JSON.stringify({ audioTitle: 'تحفيز ومذاكرة 🎧', soundAuthor: 'د. مصطفى' }),
          },
          include: {
            author: { select: { id: true, name: true, avatar: true, username: true, department: true, role: true } },
            comments: { include: { author: { select: { id: true, name: true, avatar: true } } } },
            likes: { select: { userId: true, type: true } },
          },
        });

        const mappedSeeds = [seedReel1, seedReel2].map((p: any) => ({
          ...p,
          isLikedByMe: false,
          likeCount: p.likes?.length || 0,
          commentCount: p.comments?.length || 0,
          author: p.author || { name: 'معادلة برو', username: 'moadla_official', avatar: null, role: 'ADMIN' },
        }));

        return NextResponse.json({ reels: mappedSeeds });
      }
    }

    const mappedPosts = posts.map((p: any) => ({
      ...p,
      likesCount: p.likes.length,
      commentsCount: p.comments.length,
      isLiked: user ? p.likes.some((l: any) => l.userId === user.id) : false,
    }));

    return NextResponse.json({ reels: mappedPosts });
  } catch (error) {
    console.error('Fetch reels error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الريلز' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await req.json();
    const { content, videoUrl, tag = 'general', audioTitle = 'الصوت الأصلي' } = body;

    if (!videoUrl || typeof videoUrl !== 'string' || videoUrl.trim().length === 0) {
      return NextResponse.json({ error: 'يرجى إرفاق رابط أو ملف مقطع الفيديو' }, { status: 400 });
    }

    const newReel = await prisma.userPost.create({
      data: {
        authorId: user.id,
        content: content ? content.trim() : 'مقطع ريلز تعليمي جديد 🎬✨',
        fileUrl: videoUrl.trim(),
        subjectTag: 'reel',
        moodEmoji: tag,
        imagesJson: JSON.stringify({ audioTitle, soundAuthor: user.name }),
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, username: true, department: true, role: true },
        },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
        },
        likes: {
          select: { userId: true, type: true },
        },
      },
    });

    return NextResponse.json({
      reel: {
        ...newReel,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      },
    });
  } catch (error) {
    console.error('Create reel error:', error);
    return NextResponse.json({ error: 'فشل نشر مقطع الريلز' }, { status: 500 });
  }
}
