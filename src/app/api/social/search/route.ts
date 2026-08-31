import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getFriendRelation, isUserBlocked } from '@/lib/social';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query) {
      return NextResponse.json({ students: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } },
          { role: 'STUDENT' },
          { isActive: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { username: { contains: query, mode: 'insensitive' } },
              { id: { contains: query } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        department: true,
        isOnline: true,
        lastSeenAt: true,
      },
      take: 25,
    });

    const safeUsers = [] as any[];
    for (const user of users) {
      const blocked = await isUserBlocked(currentUser.id, user.id);
      const blockedBy = await isUserBlocked(user.id, currentUser.id);
      if (blocked || blockedBy) continue;

      const relation = await getFriendRelation(currentUser.id, user.id);
      safeUsers.push({
        ...user,
        friendStatus: relation?.status || null,
      });
    }

    return NextResponse.json({ students: safeUsers });
  } catch (error) {
    console.error('Social search error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء البحث' }, { status: 500 });
  }
}
