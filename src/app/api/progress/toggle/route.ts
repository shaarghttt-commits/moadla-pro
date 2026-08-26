import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
    }

    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: 'معرّف الدرس مطلوب' }, { status: 400 });
    }

    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId,
        },
      },
    });

    if (existingProgress) {
      await prisma.lessonProgress.delete({
        where: { id: existingProgress.id },
      });
      return NextResponse.json({ completed: false });
    } else {
      await prisma.lessonProgress.create({
        data: {
          userId: user.id,
          lessonId,
          isCompleted: true,
        },
      });

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            userId: user.id,
            action: 'LESSON_COMPLETED',
            details: `أتم الدرس: ${lessonId}`,
          },
        });
      } catch {
        // ignore
      }

      return NextResponse.json({ completed: true });
    }
  } catch (error) {
    console.error('Error toggling lesson progress:', error);
    return NextResponse.json({ error: 'حدث خطأ في تحديث التقدم' }, { status: 500 });
  }
}
