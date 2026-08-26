import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({
        subjects: [],
        lessons: [],
        exams: [],
        files: [],
      });
    }

    const [subjects, lessons, exams, files] = await Promise.all([
      prisma.subject.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        include: { section: true },
        take: 8,
      }),
      prisma.lesson.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { contentMarkdown: { contains: q } },
          ],
        },
        include: {
          unit: {
            include: { subject: true },
          },
        },
        take: 12,
      }),
      prisma.exam.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
          isPublished: true,
        },
        include: { subject: true },
        take: 8,
      }),
      prisma.lessonFile.findMany({
        where: {
          title: { contains: q },
        },
        include: {
          lesson: true,
        },
        take: 8,
      }),
    ]);

    return NextResponse.json({
      subjects,
      lessons,
      exams,
      files,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { subjects: [], lessons: [], exams: [], files: [] },
      { status: 500 }
    );
  }
}
