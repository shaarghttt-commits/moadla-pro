import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: currentUser.id },
        },
      },
      include: {
        participants: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: true, attachments: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    const output = conversations.map((conversation: any) => {
      const otherParticipant = conversation.participants.find((p: any) => p.userId !== currentUser.id)?.user;
      const lastMessage = conversation.messages[0];
      const unread = conversation.participants.find((p: any) => p.userId === currentUser.id)?.unreadCount || 0;

      return {
        id: conversation.id,
        title: conversation.title || otherParticipant?.name || 'محادثة',
        otherParticipant,
        lastMessage,
        unread,
        updatedAt: conversation.lastMessageAt || conversation.updatedAt,
      };
    });

    return NextResponse.json({ conversations: output });
  } catch (error) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المحادثات' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId) return NextResponse.json({ error: 'معرف المستخدم غير صحيح' }, { status: 400 });

    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: currentUser.id } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: { participants: true },
    });

    if (existing) {
      return NextResponse.json({ conversation: existing, created: false });
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: 'محادثة',
        participants: {
          create: [
            { userId: currentUser.id },
            { userId: targetUserId },
          ],
        },
      },
      include: { participants: true },
    });

    return NextResponse.json({ conversation, created: true });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء المحادثة' }, { status: 500 });
  }
}
