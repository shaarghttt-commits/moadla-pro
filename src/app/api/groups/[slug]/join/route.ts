import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const slug = params.slug;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { slug },
      select: { id: true, creatorId: true },
    });

    if (!group) {
      return NextResponse.json({ error: 'المجموعة غير موجودة' }, { status: 404 });
    }

    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: currentUser.id,
        },
      },
    });

    if (existing) {
      // Cannot leave if creator and sole admin
      if (group.creatorId === currentUser.id) {
        return NextResponse.json({ error: 'لا يمكن لمنشئ المجموعة مغادرتها' }, { status: 400 });
      }

      await prisma.groupMember.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ isMember: false, message: 'تمت مغادرة المجموعة' });
    } else {
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: currentUser.id,
          role: 'MEMBER',
        },
      });

      return NextResponse.json({ isMember: true, message: 'تم الانضمام للمجموعة بنجاح!' });
    }
  } catch (error) {
    console.error('POST /api/groups/[slug]/join error:', error);
    return NextResponse.json({ error: 'فشل الانضمام أو المغادرة' }, { status: 500 });
  }
}
