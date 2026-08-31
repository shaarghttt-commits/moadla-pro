import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject'); // e.g. 'calculus', 'physics', 'algebra-and-geometry', 'mechanics', 'chemistry', 'english'
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(100, Math.max(5, parseInt(limitParam, 10))) : 20;

    const whereCondition: any = {
      exam: {
        isPublished: true,
      },
      choices: {
        some: {},
      },
    };

    if (subject && subject !== 'all') {
      whereCondition.exam.subject = {
        slug: subject,
      };
    }

    const rawQuestions = await prisma.question.findMany({
      where: whereCondition,
      include: {
        choices: {
          orderBy: { order: 'asc' },
        },
        exam: {
          select: {
            title: true,
            year: true,
            subject: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (rawQuestions.length === 0) {
      // Fallback: fetch any published questions
      const fallbackQuestions = await prisma.question.findMany({
        where: {
          choices: { some: {} },
        },
        include: {
          choices: { orderBy: { order: 'asc' } },
          exam: {
            select: {
              title: true,
              year: true,
              subject: { select: { title: true, slug: true } },
            },
          },
        },
        take: limit,
      });

      return formatAndReturnQuestions(fallbackQuestions, limit);
    }

    return formatAndReturnQuestions(rawQuestions, limit);
  } catch (error) {
    console.error('Error fetching game questions from exams:', error);
    return NextResponse.json(
      { error: 'فشل جلب أسئلة الامتحانات للألعاب' },
      { status: 500 }
    );
  }
}

function formatAndReturnQuestions(rawQuestions: any[], limit: number) {
  // Shuffle questions randomly
  const shuffled = [...rawQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, limit);

  const formatted = selected.map((q: any, idx: number) => {
    // Determine choices and correct index
    const choices = q.choices || [];
    const options = choices.map((c: any) => c.text);
    const correctIdx = choices.findIndex((c: any) => c.isCorrect);

    return {
      id: q.id,
      q: q.questionText,
      options: options.length >= 2 ? options : ['صواب', 'خطأ'],
      correct: correctIdx >= 0 ? correctIdx : 0,
      explanation: q.explanation || '',
      subject: q.exam?.subject?.title || 'عام',
      subjectSlug: q.exam?.subject?.slug || 'general',
      examTitle: q.exam?.title || '',
      year: q.exam?.year || 2025,
      marks: q.marks || 2,
    };
  });

  return NextResponse.json({
    success: true,
    totalAvailable: rawQuestions.length,
    count: formatted.length,
    questions: formatted,
  });
}
