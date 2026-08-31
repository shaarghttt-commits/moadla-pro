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
      return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 });
    }

    const myMembership = currentUser
      ? group.members.find((m: any) => m.userId === currentUser.id)
      : null;

    return NextResponse.json({
      group: {
        ...group,
        isMember: !!myMembership,
        myRole: myMembership?.role || null,
      },
    });
  } catch (error) {
    console.error('GET /api/groups/[slug] error:', error);
    return NextResponse.json({ error: 'خطأ في جلب بيانات المجموعة' }, { status: 500 });
  }
}
