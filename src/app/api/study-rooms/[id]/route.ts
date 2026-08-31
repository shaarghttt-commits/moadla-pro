import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const room = await prisma.studyRoom.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true, username: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, username: true, currentStreak: true },
            },
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'الغرفة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('Fetch study room error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب بيانات الغرفة' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const room = await prisma.studyRoom.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json({ error: 'الغرفة غير موجودة' }, { status: 404 });
    }

    if (action === 'join') {
      // Add or update member
      await prisma.studyRoomMember.upsert({
        where: {
          roomId_userId: {
            roomId: id,
            userId: user.id,
          },
        },
        create: {
          roomId: id,
          userId: user.id,
        },
        update: {
          lastActiveAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, message: 'تم الانضمام للغرفة بنجاح' });
    }

    if (action === 'leave') {
      await prisma.studyRoomMember.deleteMany({
        where: {
          roomId: id,
          userId: user.id,
        },
      });

      return NextResponse.json({ success: true, message: 'تمت مغادرة الغرفة' });
    }

    if (action === 'invite') {
      const { targetUserId } = body;
      if (!targetUserId) {
        return NextResponse.json({ error: 'يرجى تحديد الطالب المراد دعوته' }, { status: 400 });
      }

      // Create in-app notification for the invited student
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: 'دعوة لمذاكرة حية جماعية 🎧📹',
          message: `دعاك زميلك ${user.name} للانضمام إلى غرفة المذاكرة الحية "${room.name}" للمذاكرة معاً بالصوت والفيديو!`,
          link: `/study-rooms?roomId=${room.id}`,
        },
      });

      return NextResponse.json({ success: true, message: 'تم إرسال دعوة المذاكرة بنجاح' });
    }

    if (action === 'save_whiteboard') {
      const { whiteboardData } = body;
      await prisma.studyRoom.update({
        where: { id },
        data: { whiteboardData: typeof whiteboardData === 'string' ? whiteboardData : JSON.stringify(whiteboardData) },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'إجراء غير مدعوم' }, { status: 400 });
  } catch (error) {
    console.error('Study room action error:', error);
    return NextResponse.json({ error: 'فشل تنفيذ الإجراء' }, { status: 500 });
  }
}
