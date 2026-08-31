import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const topStudents = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        department: true,
        gamePoints: true,
        gameWins: true,
        gameLosses: true,
        isOnline: true,
      },
      orderBy: [{ gamePoints: 'desc' }, { gameWins: 'desc' }],
      take: 20,
    });

    return NextResponse.json({ leaderboard: topStudents });
  } catch (error) {
    console.error('GET /api/games/leaderboard error:', error);
    return NextResponse.json({ error: 'خطأ في جلب لوحة المتصدرين' }, { status: 500 });
  }
}
