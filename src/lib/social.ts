import prisma from '@/lib/prisma';

export const SAFE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
// include common video extensions to allow uploads for posts (mp4, webm, mov, mkv, avi)
export const SAFE_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'txt', 'mp4', 'webm', 'mov', 'mkv', 'avi'];
export const BLOCKED_EXTENSIONS = new Set(['exe', 'bat', 'cmd', 'scr', 'ps1', 'js', 'jar', 'msi', 'dll', 'com']);

export function formatRelativeTime(date: Date | string | null) {
  if (!date) return 'غير متصل';
  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 60000));
  if (diffMinutes < 1) return 'الآن';
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return 'منذ فترة طويلة';
}

export function getUserDisplayName(user: { name?: string | null; username?: string | null }) {
  return user.username || user.name || 'طالب';
}

export async function getFriendRelation(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) return null;

  const relation = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { senderId: currentUserId, receiverId: targetUserId },
        { senderId: targetUserId, receiverId: currentUserId },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return relation;
}

export async function isUserBlocked(blockerId: string, blockedUserId: string) {
  if (blockerId === blockedUserId) return false;
  const block = await prisma.userBlock.findFirst({
    where: {
      blockerId,
      blockedUserId,
    },
  });
  return !!block;
}

export async function getFriendStatsForUser(userId: string) {
  const [friendsCount, pendingCount, sentCount] = await Promise.all([
    prisma.friendRequest.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'ACCEPTED',
      },
    }),
    prisma.friendRequest.count({
      where: {
        receiverId: userId,
        status: 'PENDING',
      },
    }),
    prisma.friendRequest.count({
      where: {
        senderId: userId,
        status: 'PENDING',
      },
    }),
  ]);

  return { friendsCount, pendingCount, sentCount };
}
