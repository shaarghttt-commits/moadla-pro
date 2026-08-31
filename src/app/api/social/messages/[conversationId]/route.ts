import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { conversationId } = await params;
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: true,
            attachments: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 });
    }

    const isParticipant = conversation.participants.some((participant: any) => participant.userId === currentUser.id);
    if (!isParticipant) {
      return NextResponse.json({ error: 'غير مسموح لك بعرض هذه المحادثة' }, { status: 403 });
    }

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: currentUser.id,
      },
      data: {
        unreadCount: 0,
        lastReadAt: new Date(),
      },
    });

    const otherUser = conversation.participants.find((participant: any) => participant.userId !== currentUser.id)?.user ?? null;

    return NextResponse.json({
      conversationId,
      otherUser: otherUser ? { ...otherUser, currentUserId: currentUser.id } : null,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error('Fetch social conversation error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الرسائل' }, { status: 500 });
  }
}
