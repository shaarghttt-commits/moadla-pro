import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import GroupDetailsPageClient from '@/components/groups/GroupDetailsPageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const group = await prisma.group.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true },
  });

  if (!group) return { title: 'المجموعة غير موجودة | Moadla Pro' };

  return {
    title: `${group.name} | المجموعات - Moadla Pro`,
    description: group.description || `مجموعة دراسية على منصة معادلة برو`,
  };
}

export default async function GroupPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const currentUser = await getCurrentUser();

  const group = await prisma.group.findUnique({
    where: { slug: params.slug },
    include: {
      creator: {
        select: { id: true, name: true, avatar: true, department: true },
      },
      _count: {
        select: {
          members: true,
          posts: true,
          files: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
              department: true,
              role: true,
              isOnline: true,
            },
          },
        },
        orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
        take: 50,
      },
    },
  });

  if (!group) {
    notFound();
  }

  const myMembership = currentUser
    ? group.members.find((m) => m.userId === currentUser.id)
    : null;

  const formattedGroup = {
    ...group,
    createdAt: group.createdAt.toISOString(),
    members: group.members.map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
    })),
    isMember: !!myMembership,
    myRole: myMembership?.role || null,
  };

  return <GroupDetailsPageClient initialGroup={formattedGroup as any} />;
}
