import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import ReelsFeedClient, { ReelItem } from '@/components/reels/ReelsFeedClient';

export const metadata: Metadata = {
  title: 'ريلز الطلاب والفيديوهات التعليمية | معادلة برو',
  description: 'شاهد وشارك مقاطع ريلز وفيديوهات تعليمية قصيرة لشرح مسائل التفاضل والتكامل، الفيزياء، والميكانيكا ونصائح البابل شيت.',
};

export const dynamic = 'force-dynamic';

export default async function ReelsPage() {
  const user = await getCurrentUser();

  const posts = await prisma.userPost.findMany({
    where: {
      OR: [
        { subjectTag: 'reel' },
        { fileUrl: { contains: 'mp4' } },
        { fileUrl: { contains: 'video' } },
        { fileUrl: { contains: 'webm' } },
      ],
    },
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

  const initialReels: ReelItem[] = posts.map((p) => ({
    id: p.id,
    content: p.content,
    fileUrl: p.fileUrl || '',
    subjectTag: p.subjectTag || undefined,
    moodEmoji: p.moodEmoji || undefined,
    imagesJson: p.imagesJson || undefined,
    likesCount: p.likes.length,
    commentsCount: p.comments.length,
    isLiked: user ? p.likes.some((l) => l.userId === user.id) : false,
    createdAt: p.createdAt.toISOString(),
    author: p.author,
    comments: p.comments,
  }));

  return <ReelsFeedClient initialReels={initialReels} />;
}
