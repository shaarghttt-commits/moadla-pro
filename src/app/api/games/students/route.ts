import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    const students = await prisma.user.findMany({
      where: {
        id: currentUser ? { not: currentUser.id } : undefined,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        seatNumber: true,
        department: true,
        yearOfStudy: true,
        gamePoints: true,
        gameWins: true,
        isOnline: true,
        league: true,
      },
      orderBy: [
        { isOnline: 'desc' },
        { gamePoints: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 25,
    });

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error('Error fetching students for game challenges:', error);
    return NextResponse.json(
      { error: 'فشل جلب قائمة الطلاب' },
      { status: 500 }
    );
  }
}
