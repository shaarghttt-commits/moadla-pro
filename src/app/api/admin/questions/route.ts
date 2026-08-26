import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { examId, questionText, explanation, marks, choices } = await req.json();

    if (!examId || !questionText || !choices || choices.length < 2) {
      return NextResponse.json(
        { error: 'يرجى إدخال نص السؤال وخيارين على الأقل' },
        { status: 400 }
      );
    }

    // Verify at least one correct choice exists
    const hasCorrect = choices.some((c: any) => c.isCorrect);
    if (!hasCorrect) {
      return NextResponse.json(
        { error: 'يرجى تحديد إجابة صحيحة واحدة على الأقل' },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        examId,
        questionText: questionText.trim(),
        explanation: explanation ? explanation.trim() : null,
        marks: Number(marks) || 1,
        choices: {
          create: choices.map((c: any, idx: number) => ({
            text: c.text.trim(),
            isCorrect: Boolean(c.isCorrect),
            order: idx + 1,
          })),
        },
      },
      include: {
        choices: true,
      },
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Create question error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة السؤال' }, { status: 500 });
  }
}
