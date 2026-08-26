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
    const student = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bio: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        attempts: {
          orderBy: { completedAt: 'desc' },
          include: {
            exam: true,
          },
        },
        progress: {
          orderBy: { completedAt: 'desc' },
          include: {
            lesson: true,
          },
        },
      },
    });

    if (!student) return NextResponse.json({ error: 'الطالب غير موجود' }, { status: 404 });

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Admin get student error:', error);
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
    const { role, isActive, name, phone } = await req.json();

    const student = await prisma.user.update({
      where: { id },
      data: {
        role: role || undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        name: name?.trim() || undefined,
        phone: phone !== undefined ? phone : undefined,
      },
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Admin update student error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل بيانات الطالب' }, { status: 500 });
  }
}
