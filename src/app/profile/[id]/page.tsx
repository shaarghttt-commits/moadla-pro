import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import FacebookProfileView from '@/components/profile/FacebookProfileView';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const user = await prisma.user.findFirst({
    where: { OR: [{ id: params.id }, { username: params.id }] },
    select: { name: true, bio: true },
  });

  if (!user) return { title: 'المستخدم غير موجود | Moadla Pro' };

  return {
    title: `${user.name} | الملف الشخصي - Moadla Pro`,
    description: user.bio || `الملف الشخصي والمنشورات للطالب ${user.name} على منصة معادلة برو`,
  };
}

export default async function ProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const userIdOrUsername = params.id;
  const currentUser = await getCurrentUser();

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ id: userIdOrUsername }, { username: userIdOrUsername }],
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatar: true,
      coverPhoto: true,
      bio: true,
      department: true,
      yearOfStudy: true,
      role: true,
      isOnline: true,
      gamePoints: true,
      gameWins: true,
      gameLosses: true,
      createdAt: true,
      _count: {
        select: {
          authoredWallPosts: true,
          attempts: true,
          progress: true,
          groupMemberships: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Check friendship status
  let friendshipStatus: 'SELF' | 'FRIENDS' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'NONE' = 'NONE';
  let friendRequestId: string | null = null;

  if (currentUser) {
    if (currentUser.id === user.id) {
      friendshipStatus = 'SELF';
    } else {
      const friendReq = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: currentUser.id, receiverId: user.id },
            { senderId: user.id, receiverId: currentUser.id },
          ],
        },
      });

      if (friendReq) {
        friendRequestId = friendReq.id;
        if (friendReq.status === 'ACCEPTED') {
          friendshipStatus = 'FRIENDS';
        } else if (friendReq.senderId === currentUser.id) {
          friendshipStatus = 'PENDING_SENT';
        } else {
          friendshipStatus = 'PENDING_RECEIVED';
        }
      }
    }
  }

  const friendsCount = await prisma.friendRequest.count({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }],
      status: 'ACCEPTED',
    },
  });

  return (
    <FacebookProfileView
      profileUser={{
        ...user,
        friendsCount,
        friendshipStatus,
        friendRequestId,
        createdAt: user.createdAt.toISOString(),
      }}
      currentUserId={currentUser?.id}
    />
  );
}
