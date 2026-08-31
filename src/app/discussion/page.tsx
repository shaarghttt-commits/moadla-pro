import React from 'react';
import { prisma } from '@/lib/prisma';
import Chat from '@/components/discussion/Chat';
import ConnectedUsers from '@/components/discussion/ConnectedUsers';
import PostCard from '@/components/discussion/PostCard';

export default async function DiscussionPage() {
  const posts = await prisma.discussionPost.findMany({
    where: { isHidden: false },
    include: { author: { select: { id: true, name: true, avatar: true } }, _count: { select: { comments: true, likes: true } } },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: 30,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">المناقشة العامة</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <ConnectedUsers />
        </aside>
        <main className="lg:col-span-3">
          <Chat />
          <div className="space-y-4 mt-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
