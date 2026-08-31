import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType');

    const whereCondition: any = {
      status: { in: ['WAITING', 'PLAYING'] },
    };

    if (gameType && gameType !== 'all') {
      whereCondition.gameType = gameType;
    }

    const rooms = await prisma.gameRoom.findMany({
      where: whereCondition,
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, department: true, seatNumber: true, gamePoints: true },
        },
        opponent: {
          select: { id: true, name: true, avatar: true, department: true, seatNumber: true, gamePoints: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('GET /api/games/rooms error:', error);
    return NextResponse.json({ error: 'خطأ في جلب الغرف' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }

    const body = await request.json();
    const { subject = 'all', gameType = 'CHESS', opponentId, initialData } = body;

    // Generate readable random room code (e.g. CHESS-7391)
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const code = `${gameType.toUpperCase()}-${randomDigits}`;

    const gameNames: Record<string, string> = {
      CHESS: 'الشطرنج التنافسي ♟️👑',
      DUEL: 'مبارزة المعادلات ⚔️',
      TICTACTOE: 'تيك تاك تو المعادلات ❌⭕',
      TUGOFWAR: 'شد الحبل الرياضي 🪢',
    };

    const gameTitle = gameNames[gameType.toUpperCase()] || 'تحدي الألعاب';

    const room = await prisma.gameRoom.create({
      data: {
        code,
        gameType: gameType.toUpperCase(),
        subject,
        status: 'WAITING',
        creatorId: currentUser.id,
        opponentId: opponentId || null,
        questionsJson: initialData ? JSON.stringify(initialData) : null,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, department: true, seatNumber: true },
        },
        opponent: {
          select: { id: true, name: true, avatar: true, department: true, seatNumber: true },
        },
      },
    });

    // If a specific opponent was invited, send them a high-priority notification!
    if (opponentId && opponentId !== currentUser.id) {
      try {
        await prisma.notification.create({
          data: {
            userId: opponentId,
            title: `دعوة تحدي: ${gameTitle} 🎮⚡`,
            message: `دعاك الطالب (${currentUser.name}) لمبارزة في لعبة ${gameTitle}! اضغط هنا لدخول الغرفة وبدء التحدي فوراً.`,
            link: `/games?room=${code}&game=${gameType.toLowerCase()}`,
          },
        });
      } catch (notifErr) {
        console.warn('Failed to send challenge notification:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      room,
      inviteUrl: `/games?room=${code}&game=${gameType.toLowerCase()}`,
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/games/rooms error:', error);
    return NextResponse.json({ error: 'فشل إنشاء غرفة التحدي' }, { status: 500 });
  }
}
