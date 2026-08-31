import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ currentStreak: 0, isCheckedInToday: false, activeDays: [] });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ currentStreak: 1, isCheckedInToday: true, activeDays: [] });
    }

    const now = new Date();
    const lastActive = dbUser.lastActiveDate ? new Date(dbUser.lastActiveDate) : null;

    let isCheckedInToday = false;
    let currentStreak = dbUser.currentStreak || 1;

    if (lastActive) {
      const isSameDay =
        now.getFullYear() === lastActive.getFullYear() &&
        now.getMonth() === lastActive.getMonth() &&
        now.getDate() === lastActive.getDate();

      if (isSameDay) {
        isCheckedInToday = true;
      } else {
        const diffDays = Math.floor(
          (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          // yesterday -> streak is active but not checked in yet today
          isCheckedInToday = false;
        } else if (diffDays > 1) {
          // missed more than 1 day -> reset streak to 1
          currentStreak = 1;
        }
      }
    }

    // Weekly day dots (Saturday to Friday)
    const daysOfWeek = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
    const currentDayIndex = (now.getDay() + 1) % 7; // Convert JS 0(Sun) to Sat-indexed

    const weeklyProgress = daysOfWeek.map((day: any, idx: number) => ({
      day,
      isActive: idx <= currentDayIndex && idx >= currentDayIndex - (currentStreak - 1),
      isToday: idx === currentDayIndex,
    }));

    return NextResponse.json({
      currentStreak,
      longestStreak: dbUser.longestStreak || currentStreak,
      isCheckedInToday,
      weeklyProgress,
    });
  } catch (error) {
    console.error('GET /api/streak error:', error);
    return NextResponse.json({ error: 'فشل في جلب سلسلة المذاكرة' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
    });

    const now = new Date();
    let newStreak = (dbUser?.currentStreak || 0) + 1;

    if (dbUser?.lastActiveDate) {
      const lastActive = new Date(dbUser.lastActiveDate);
      const isSameDay =
        now.getFullYear() === lastActive.getFullYear() &&
        now.getMonth() === lastActive.getMonth() &&
        now.getDate() === lastActive.getDate();

      if (isSameDay) {
        return NextResponse.json({
          success: true,
          currentStreak: dbUser.currentStreak,
          message: 'تم تسجيل نشاطك اليومي بالفعل! استمر في التميز 🔥',
        });
      }

      const diffDays = Math.floor(
        (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays > 1) {
        newStreak = 1;
      }
    }

    const longestStreak = Math.max(newStreak, dbUser?.longestStreak || 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: now,
      },
    });

    return NextResponse.json({
      success: true,
      currentStreak: newStreak,
      longestStreak,
      message: `أحسنت! أتممت ${newStreak} أيام متتالية من المذاكرة والتحصيل 🔥`,
    });
  } catch (error) {
    console.error('POST /api/streak error:', error);
    return NextResponse.json({ error: 'فشل في تسجيل اليوم' }, { status: 500 });
  }
}
