import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id } = await params;
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: {
        subject: true,
        section: true,
        questions: {
          orderBy: { order: 'asc' },
          include: {
            choices: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!exam) return NextResponse.json({ error: 'الامتحان غير موجود' }, { status: 404 });

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Admin get exam error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdmin();
    if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id } = await params;
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
      isPublished,
    } = await req.json();

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        title: title?.trim(),
        slug: slug?.trim().toLowerCase(),
        description: description !== undefined ? description : undefined,
        subjectId: subjectId !== undefined ? subjectId : undefined,
        sectionId: sectionId !== undefined ? sectionId : undefined,
        year: year !== undefined ? Number(year) : undefined,
        durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : undefined,
        totalMarks: totalMarks !== undefined ? Number(totalMarks) : undefined,
        passMarks: passMarks !== undefined ? Number(passMarks) : undefined,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
      },
    });

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Update exam error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل الامتحان' }, { status: 500 });
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
    await prisma.exam.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete exam error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الامتحان' }, { status: 500 });
  }
}
