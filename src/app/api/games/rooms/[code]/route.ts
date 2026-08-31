import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  try {
    const params = await props.params;
    const code = params.code;

    const room = await prisma.gameRoom.findUnique({
      where: { code },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, department: true, seatNumber: true, gamePoints: true },
        },
        opponent: {
          select: { id: true, name: true, avatar: true, department: true, seatNumber: true, gamePoints: true },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'الغرفة غير موجودة' }, { status: 404 });
    }

    let parsedData = null;
    try {
      parsedData = room.questionsJson ? JSON.parse(room.questionsJson) : null;
    } catch {
      parsedData = null;
    }

    return NextResponse.json({
      room: {
        ...room,
        gameState: parsedData,
        questions: Array.isArray(parsedData) ? parsedData : (parsedData?.questions || []),
      },
    });
  } catch (error) {
    console.error('GET /api/games/rooms/[code] error:', error);
    return NextResponse.json({ error: 'خطأ في جلب بيانات الغرفة' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  try {
    const params = await props.params;
    const code = params.code;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }

    const room = await prisma.gameRoom.findUnique({
      where: { code },
    });

    if (!room) {
      return NextResponse.json({ error: 'الغرفة غير موجودة' }, { status: 404 });
    }

    const body = await request.json();
    const { action, score, winnerId, gameState } = body;

    if (action === 'join') {
      if (room.creatorId === currentUser.id) {
        return NextResponse.json({ room, message: 'أنت منشئ الغرفة' });
      }

      const updated = await prisma.gameRoom.update({
        where: { id: room.id },
        data: {
          opponentId: currentUser.id,
          status: 'PLAYING',
        },
        include: {
          creator: { select: { id: true, name: true, avatar: true, seatNumber: true } },
          opponent: { select: { id: true, name: true, avatar: true, seatNumber: true } },
        },
      });

      return NextResponse.json({ room: updated });
    }

    if (action === 'update_state') {
      const updated = await prisma.gameRoom.update({
        where: { id: room.id },
        data: {
          questionsJson: typeof gameState === 'object' ? JSON.stringify(gameState) : String(gameState),
        },
      });

      return NextResponse.json({ room: updated });
    }

    if (action === 'update_score') {
      const isCreator = room.creatorId === currentUser.id;
      const updateData: any = {};

      if (isCreator) {
        updateData.creatorScore = score;
      } else {
        updateData.opponentScore = score;
      }

      const updated = await prisma.gameRoom.update({
        where: { id: room.id },
        data: updateData,
      });

      return NextResponse.json({ room: updated });
    }

    if (action === 'finish') {
      const finalWinnerId = winnerId || (room.creatorScore > room.opponentScore ? room.creatorId : room.opponentId);

      const updated = await prisma.gameRoom.update({
        where: { id: room.id },
        data: {
          status: 'FINISHED',
          winnerId: finalWinnerId,
        },
      });

      // Award XP points to winner and increment wins
      if (finalWinnerId) {
        await prisma.user.update({
          where: { id: finalWinnerId },
          data: {
            gamePoints: { increment: 50 },
            gameWins: { increment: 1 },
          },
        });

        const loserId = finalWinnerId === room.creatorId ? room.opponentId : room.creatorId;
        if (loserId) {
          await prisma.user.update({
            where: { id: loserId },
            data: {
              gamePoints: { increment: 15 },
              gameLosses: { increment: 1 },
            },
          });
        }
      }

      return NextResponse.json({ room: updated });
    }

    return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/games/rooms/[code] error:', error);
    return NextResponse.json({ error: 'فشل تحديث حالة الغرفة' }, { status: 500 });
  }
}
