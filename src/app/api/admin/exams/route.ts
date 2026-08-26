import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET() {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subject: true,
        section: true,
        _count: { select: { questions: true, attempts: true } },
      },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Admin exams error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const {
      title,
      slug,
      description,
      subjectId,
      sectionId,
      year,
      durationMinutes,
      totalMarks,
      passMarks,
    } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: 'العنوان والاسم اللطيف مطلوبان' }, { status: 400 });
    }

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        description: description ? description.trim() : null,
        subjectId: subjectId || null,
        sectionId: sectionId || null,
        year: year ? Number(year) : 2024,
        durationMinutes: Number(durationMinutes) || 30,
        totalMarks: Number(totalMarks) || 100,
        passMarks: Number(passMarks) || 50,
      },
    });

    return NextResponse.json({ exam });
  } catch (error: any) {
    console.error('Create exam error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'الاسم اللطيف (Slug) مستخدم بالفعل' }, { status: 409 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الامتحان' }, { status: 500 });
  }
}
