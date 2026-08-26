import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id } = await params;
    const { questionText, explanation, marks, choices } = await req.json();

    // Update question
    await prisma.question.update({
      where: { id },
      data: {
        questionText: questionText?.trim(),
        explanation: explanation !== undefined ? explanation : undefined,
        marks: marks !== undefined ? Number(marks) : undefined,
      },
    });

    // If choices provided, replace them
    if (choices && Array.isArray(choices) && choices.length >= 2) {
      await prisma.choice.deleteMany({ where: { questionId: id } });
      await prisma.choice.createMany({
        data: choices.map((c: any, idx: number) => ({
          questionId: id,
          text: c.text.trim(),
          isCorrect: Boolean(c.isCorrect),
          order: idx + 1,
        })),
      });
    }

    const updatedQuestion = await prisma.question.findUnique({
      where: { id },
      include: { choices: true },
    });

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    console.error('Update question error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل السؤال' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id } = await params;
    await prisma.question.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete question error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف السؤال' }, { status: 500 });
  }
}
