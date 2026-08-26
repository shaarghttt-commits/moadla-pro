import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const { targetType, targetId } = await req.json();

    if (!targetType || !targetId) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType,
          targetId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ favorited: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          targetType,
          targetId,
        },
      });
      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
