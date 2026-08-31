import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getFriendRelation, isUserBlocked } from '@/lib/social';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const acceptedRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
        status: 'ACCEPTED',
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    const friends = acceptedRequests.map((request: any) => {
      const friend = request.senderId === currentUser.id ? request.receiver : request.sender;
      return {
        ...friend,
        friendshipId: request.id,
        friendStatus: 'ACCEPTED',
      };
    });

    const pendingReceived = await prisma.friendRequest.findMany({
      where: { receiverId: currentUser.id, status: 'PENDING' },
      include: { sender: true },
      orderBy: { createdAt: 'desc' },
    });

    const sentPending = await prisma.friendRequest.findMany({
      where: { senderId: currentUser.id, status: 'PENDING' },
      include: { receiver: true },
      orderBy: { createdAt: 'desc' },
    });

    const pendingRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
        status: 'PENDING',
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const userIds = new Set<string>([currentUser.id]);
    acceptedRequests.forEach((r: any) => {
      userIds.add(r.senderId);
      userIds.add(r.receiverId);
    });

    pendingRequests.forEach((r: any) => {
      userIds.add(r.senderId);
      userIds.add(r.receiverId);
    });

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: [...userIds] },
        role: 'STUDENT',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        department: true,
        isOnline: true,
        lastSeenAt: true,
      },
      take: 250,
      orderBy: [{ isOnline: 'desc' }, { createdAt: 'desc' }],
    });

    const userBlocks = await prisma.userBlock.findMany({
      where: {
        OR: [
          { blockerId: currentUser.id },
          { blockedUserId: currentUser.id },
        ],
      },
      select: { blockerId: true, blockedUserId: true },
    });

    const blockedSet = new Set<string>();
    userBlocks.forEach((b) => {
      blockedSet.add(b.blockerId);
      blockedSet.add(b.blockedUserId);
    });

    const filteredSuggestions = suggestions
      .filter((u) => !blockedSet.has(u.id))
      .slice(0, 200)
      .map((u) => ({ ...u, friendStatus: null }));

    return NextResponse.json({
      friends,
      pendingReceived,
      sentPending,
      suggestions: filteredSuggestions,
      counts: {
        friends: friends.length,
        pendingReceived: pendingReceived.length,
        sentPending: sentPending.length,
      },
    });
  } catch (error) {
    console.error('Fetch friends error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الأصدقاء' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId || targetUserId === currentUser.id) {
      return NextResponse.json({ error: 'لا يمكن إرسال طلب لصديق نفسك' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser || !targetUser.isActive) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    if (await isUserBlocked(currentUser.id, targetUserId) || await isUserBlocked(targetUserId, currentUser.id)) {
      return NextResponse.json({ error: 'لا يمكنك التواصل مع هذا المستخدم بسبب الحظر' }, { status: 403 });
    }

    const existingRelation = await getFriendRelation(currentUser.id, targetUserId);
    if (existingRelation) {
      return NextResponse.json({ error: 'يوجد طلب صداقة أو علاقة صداقة سابقة' }, { status: 409 });
    }

    const request = await prisma.friendRequest.create({
      data: {
        senderId: currentUser.id,
        receiverId: targetUserId,
        status: 'PENDING',
      },
      include: {
        sender: true,
        receiver: true,
      },
    });

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: 'طلب صداقة جديد',
        message: `${currentUser.name} أرسل لك طلب صداقة`,
        link: '/friends',
      },
    });

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error('Create friend request error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إرسال طلب الصداقة' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { targetUserId, action } = await req.json();
    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'بيانات الطلب غير مكتملة' }, { status: 400 });
    }

    const request = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUser.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUser.id },
        ],
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'لم يتم العثور على طلب الصداقة' }, { status: 404 });
    }

    const validStatuses = ['accept', 'reject', 'cancel', 'remove'];
    if (!validStatuses.includes(action)) {
      return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
    }

    if (action === 'accept') {
      await prisma.friendRequest.update({
        where: { id: request.id },
        data: { status: 'ACCEPTED' },
      });

      await prisma.notification.create({
        data: {
          userId: request.senderId,
          title: 'تم قبول طلبك',
          message: `${currentUser.name} قبل طلبك للصداقة`,
          link: '/friends',
        },
      });

      return NextResponse.json({ success: true, status: 'ACCEPTED' });
    }

    if (action === 'reject') {
      await prisma.friendRequest.update({
        where: { id: request.id },
        data: { status: 'REJECTED' },
      });
      return NextResponse.json({ success: true, status: 'REJECTED' });
    }

    if (action === 'cancel') {
      await prisma.friendRequest.update({
        where: { id: request.id },
        data: { status: 'CANCELLED' },
      });
      return NextResponse.json({ success: true, status: 'CANCELLED' });
    }

    await prisma.friendRequest.delete({ where: { id: request.id } });
    return NextResponse.json({ success: true, status: 'REMOVED' });
  } catch (error) {
    console.error('Update friend request error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث طلب الصداقة' }, { status: 500 });
  }
}
