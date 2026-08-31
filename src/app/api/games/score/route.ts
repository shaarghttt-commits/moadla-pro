import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول لحفظ النقاط' }, { status: 401 });
    }

    const body = await request.json();
    const { gameType, score, pointsWon = 20 } = body;

    if (!gameType || score === undefined) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    const gameScore = await prisma.gameScore.create({
      data: {
        userId: currentUser.id,
        gameType,
        score: parseInt(score, 10),
        pointsWon: parseInt(pointsWon, 10),
      },
    });

    // Increment user gamePoints
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        gamePoints: { increment: parseInt(pointsWon, 10) },
      },
      select: {
        id: true,
        gamePoints: true,
      },
    });

    return NextResponse.json({
      success: true,
      gameScore,
      newPoints: updatedUser.gamePoints,
    });
  } catch (error) {
    console.error('POST /api/games/score error:', error);
    return NextResponse.json({ error: 'فشل حفظ نتيجة اللعبة' }, { status: 500 });
  }
}
