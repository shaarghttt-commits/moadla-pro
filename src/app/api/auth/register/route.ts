import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد، كلمة المرور)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: 'STUDENT',
      },
    });

    // Send welcome notification
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'أهلاً بك في منصة Moadla Pro 🎉',
          message: 'يسعدنا انضمامك إلى مجتمع طلاب المعادلات. ابدأ الآن باكتشاف المواد والامتحانات التجريبية!',
          link: '/sections',
        },
      });
    } catch {
      // ignore
    }

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
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء إنشاء الحساب' },
      { status: 500 }
    );
  }
}
