import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { name, phone, bio, avatar, currentPassword, newPassword } = await req.json();

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (bio !== undefined) updateData.bio = bio ? bio.trim() : null;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور' },
          { status: 400 }
        );
      }

      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
      });

      if (!fullUser) {
        return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(currentPassword, fullUser.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { error: 'كلمة المرور الحالية غير صحيحة' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        bio: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث البيانات' },
      { status: 500 }
    );
  }
}
