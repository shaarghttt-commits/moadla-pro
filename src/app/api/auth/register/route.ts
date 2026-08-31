import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';
import { generateUniqueSeatNumber } from '@/lib/seat-number';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'بيانات التسجيل غير صالحة' },
        { status: 400 }
      );
    }

    const { name, email, password, phone, avatar } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'يرجى إدخال الاسم الكامل' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'يرجى إدخال البريد الإلكتروني' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل' },
        { status: 400 }
      );
    }

    const cleanedName = name.trim().slice(0, 100);
    const safeEmail = email.toLowerCase().trim();
    const safePhone = phone && typeof phone === 'string' ? phone.trim().slice(0, 50) : null;
    const safeAvatar = avatar && typeof avatar === 'string' && avatar.trim() ? avatar.trim() : null;

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: safeEmail,
          mode: 'insensitive',
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول أو استخدام بريد آخر' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with retry logic for unique username/seatNumber collisions
    let user: any = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (!user && attempts < maxAttempts) {
      attempts++;
      try {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const uniqueUsername = `student_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const seatNumber = await generateUniqueSeatNumber();

        user = await prisma.user.create({
          data: {
            name: cleanedName,
            email: safeEmail,
            username: uniqueUsername,
            passwordHash,
            seatNumber,
            phone: safePhone,
            avatar: safeAvatar,
            role: 'STUDENT',
          },
        });
      } catch (createError: any) {
        console.warn(`Registration attempt ${attempts} failed:`, createError?.message);
        // If unique constraint violated on email, break immediately
        if (createError?.code === 'P2002' && createError?.meta?.target?.includes('email')) {
          return NextResponse.json(
            { error: 'البريد الإلكتروني مسجل مسبقاً' },
            { status: 409 }
          );
        }
        // If reached max attempts, rethrow
        if (attempts >= maxAttempts) {
          throw createError;
        }
      }
    }

    if (!user) {
      throw new Error('فشل إنشاء الحساب بعد عدة محاولات');
    }

    // Send welcome notification safely (don't fail registration if notification fails)
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'أهلاً بك في مجتمع Moadla Pro 🎉',
          message: `تم إصدار رقم الجلوس الرسمي الخاص بك (${user.seatNumber}) وتمت إضافة زملائك من طلاب المعادلة إلى قائمة أصدقائك تلقائياً للبدء في المذاكرة والمنافسة معاً!`,
          link: '/friends',
        },
      });

      // Automatically connect new student with active colleagues as mutual friends
      const existingStudents = await prisma.user.findMany({
        where: {
          id: { not: user.id },
          role: 'STUDENT',
          isActive: true,
        },
        select: { id: true },
        take: 60,
        orderBy: [{ isOnline: 'desc' }, { createdAt: 'desc' }],
      });

      if (existingStudents.length > 0) {
        await prisma.friendRequest.createMany({
          data: existingStudents.map((s) => ({
            senderId: s.id,
            receiverId: user.id,
            status: 'ACCEPTED',
          })),
          skipDuplicates: true,
        });
      }

      // Auto-join popular study groups
      const defaultGroups = await prisma.group.findMany({ take: 3 });
      if (defaultGroups.length > 0) {
        await prisma.groupMember.createMany({
          data: defaultGroups.map((g) => ({
            groupId: g.id,
            userId: user.id,
            role: 'MEMBER',
          })),
          skipDuplicates: true,
        });
      }
    } catch (notifErr) {
      console.warn('Welcome social onboarding skipped:', notifErr);
    }

    // Generate session JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      seatNumber: user.seatNumber,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json({
      message: 'تم إنشاء الحساب بنجاح',
      user: userResponse,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error detail:', error);

    // Handle known Prisma errors with human-friendly messages
    if (error?.code === 'P2002') {
      const target = Array.isArray(error?.meta?.target) ? error.meta.target.join(', ') : '';
      if (target.includes('email')) {
        return NextResponse.json(
          { error: 'البريد الإلكتروني مسجل مسبقاً' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: error?.message || 'حدث خطأ غير متوقع أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى' },
      { status: 500 }
    );
  }
}
