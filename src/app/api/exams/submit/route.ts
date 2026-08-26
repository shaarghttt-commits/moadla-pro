import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول لتسجيل نتيجة الامتحان' }, { status: 401 });
    }

    const { examId, answers, timeSpentSeconds } = await req.json();

    if (!examId || !answers) {
      return NextResponse.json({ error: 'بيانات الإجابات غير مكتملة' }, { status: 400 });
    }

    // Fetch exam with questions and correct choices
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'الامتحان غير موجود' }, { status: 404 });
    }

    let score = 0;
    let totalPossible = 0;
    const answerRecords: {
      questionId: string;
      selectedChoiceId: string | null;
      isCorrect: boolean;
    }[] = [];

    exam.questions.forEach((q) => {
      totalPossible += q.marks;
      const selectedChoiceId = answers[q.id] || null;
      const correctChoice = q.choices.find((c) => c.isCorrect);

      const isCorrect = correctChoice && selectedChoiceId === correctChoice.id;
      if (isCorrect) {
        score += q.marks;
      }

      answerRecords.push({
        questionId: q.id,
        selectedChoiceId,
        isCorrect: !!isCorrect,
      });
    });

    const percentage = totalPossible > 0 ? (score / totalPossible) * 100 : 0;
    const isPassed = score >= exam.passMarks;

    // Create attempt and answers in transaction
    const attempt = await prisma.examAttempt.create({
      data: {
        userId: user.id,
        examId: exam.id,
        score,
        totalPossible,
        percentage,
        isPassed,
        timeSpentSeconds: timeSpentSeconds || 0,
        answers: {
          create: answerRecords,
        },
      },
    });

    // Send notification for exam completion
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `نتيجة امتحان: ${exam.title}`,
          message: `لقد أحرزت ${score} من ${totalPossible} (${Math.round(percentage)}%) في امتحان ${exam.title}.`,
          link: `/exams/${exam.id}/results/${attempt.id}`,
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'EXAM_SUBMITTED',
          details: `أنهى امتحان ${exam.title} بنسبة ${Math.round(percentage)}%`,
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score,
      totalPossible,
      percentage,
      isPassed,
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تصحيح الامتحان' }, { status: 500 });
  }
}
