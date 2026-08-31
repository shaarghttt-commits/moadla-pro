import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const userId = params.id;
    const currentUser = await getCurrentUser();

    // Find user by ID or by username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { username: userId }],
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        coverPhoto: true,
        bio: true,
        department: true,
        yearOfStudy: true,
        role: true,
        isOnline: true,
        lastSeenAt: true,
        gamePoints: true,
        gameWins: true,
        gameLosses: true,
        createdAt: true,
        _count: {
          select: {
            authoredWallPosts: true,
            attempts: true,
            progress: true,
            groupMemberships: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // Check friendship status if logged in
    let friendshipStatus: 'SELF' | 'FRIENDS' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'NONE' = 'NONE';
    let friendRequestId: string | null = null;

    if (currentUser) {
      if (currentUser.id === user.id) {
        friendshipStatus = 'SELF';
      } else {
        const friendReq = await prisma.friendRequest.findFirst({
          where: {
            OR: [
              { senderId: currentUser.id, receiverId: user.id },
              { senderId: user.id, receiverId: currentUser.id },
            ],
          },
        });

        if (friendReq) {
          friendRequestId = friendReq.id;
          if (friendReq.status === 'ACCEPTED') {
            friendshipStatus = 'FRIENDS';
          } else if (friendReq.senderId === currentUser.id) {
            friendshipStatus = 'PENDING_SENT';
          } else {
            friendshipStatus = 'PENDING_RECEIVED';
          }
        }
      }
    }

    // Count friends
    const friendsCount = await prisma.friendRequest.count({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
        status: 'ACCEPTED',
      },
    });

    return NextResponse.json({
      user: {
        ...user,
        friendsCount,
        friendshipStatus,
        friendRequestId,
      },
    });
  } catch (error) {
    console.error('GET /api/users/[id]/profile error:', error);
    return NextResponse.json({ error: 'خطأ في جلب بيانات الملف الشخصي' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const userId = params.id;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    if (currentUser.id !== userId && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مسموح لك بتعديل هذا الحساب' }, { status: 403 });
    }

    const body = await request.json();
    const { name, bio, department, yearOfStudy, avatar, coverPhoto, username } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name: String(name).trim() } : {}),
        ...(bio !== undefined ? { bio: String(bio).slice(0, 500) } : {}),
        ...(department !== undefined ? { department: String(department) } : {}),
        ...(yearOfStudy !== undefined ? { yearOfStudy: String(yearOfStudy) } : {}),
        ...(avatar !== undefined ? { avatar: avatar ? String(avatar) : null } : {}),
        ...(coverPhoto !== undefined ? { coverPhoto: coverPhoto ? String(coverPhoto) : null } : {}),
        ...(username ? { username: String(username).trim().toLowerCase() } : {}),
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        coverPhoto: true,
        bio: true,
        department: true,
        yearOfStudy: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('PUT /api/users/[id]/profile error:', error);
    return NextResponse.json({ error: 'فشل تحديث الملف الشخصي' }, { status: 500 });
  }
}
