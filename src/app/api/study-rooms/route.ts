import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const rooms = await prisma.studyRoom.findMany({
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, currentStreak: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // If no rooms exist, seed default featured rooms
    if (rooms.length === 0) {
      const admin = await prisma.user.findFirst();
      if (admin) {
        const defaultRoom1 = await prisma.studyRoom.create({
          data: {
            name: 'غرفة تركيز التفاضل والتكامل 📐',
            description: 'جلسات بومودورو لحل مسائل الشيت والامتحانات السابقة بهدوء وتركيز تام.',
            topic: 'calculus',
            creatorId: admin.id,
            activeTrack: 'rain',
          },
          include: {
            creator: { select: { id: true, name: true, avatar: true } },
            members: { include: { user: { select: { id: true, name: true, avatar: true, currentStreak: true } } } },
          },
        });

        const defaultRoom2 = await prisma.studyRoom.create({
          data: {
            name: 'المكتبة الهادئة للفيزياء والميكانيكا ⚡',
            description: 'مذاكرة جماعية صامتة مع أصوات المكتبة المحفزة للتركيز العميق.',
            topic: 'physics',
            creatorId: admin.id,
            activeTrack: 'library',
          },
          include: {
            creator: { select: { id: true, name: true, avatar: true } },
            members: { include: { user: { select: { id: true, name: true, avatar: true, currentStreak: true } } } },
          },
        });

        return NextResponse.json({ rooms: [defaultRoom1, defaultRoom2] });
      }
    }

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error('Study rooms fetch error:', error);
    return NextResponse.json({ error: 'فشل في جلب غرف المذاكرة' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, topic = 'general', activeTrack = 'rain', isPrivate = false, passcode } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'يرجى كتابة اسم الغرفة' }, { status: 400 });
    }

    const newRoom = await prisma.studyRoom.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        topic,
        activeTrack,
        isPrivate: Boolean(isPrivate),
        passcode: passcode || null,
        creatorId: user.id,
        members: {
          create: {
            userId: user.id,
          },
        },
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true, currentStreak: true } } } },
      },
    });

    return NextResponse.json({ room: newRoom }, { status: 201 });
  } catch (error) {
    console.error('Study room creation error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء غرفة المذاكرة' }, { status: 500 });
  }
}
