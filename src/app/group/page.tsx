import React from 'react';
import { prisma } from '@/lib/prisma';
import NewPostForm from '@/components/discussion/NewPostForm';
import PostCard from '@/components/discussion/PostCard';
import ConnectedUsers from '@/components/discussion/ConnectedUsers';

export default async function GroupPage() {
  const posts = await prisma.discussionPost.findMany({
    where: { isHidden: false },
    include: {
      author: { select: { id: true, name: true, avatar: true } },
      _count: { select: { comments: true, likes: true } },
      comments: { include: { author: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: 'asc' } },
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    take: 50,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">الجروب العام</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <ConnectedUsers />
          </div>
        </aside>
        <main className="lg:col-span-3">
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <NewPostForm />
            </div>
          </div>

          <div className="space-y-5">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
