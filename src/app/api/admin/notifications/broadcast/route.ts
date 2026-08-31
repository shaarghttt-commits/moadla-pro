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

    const { title, message, link, targetUserId } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'العنوان والرسالة مطلوبان' }, { status: 400 });
    }

    if (targetUserId && targetUserId !== 'all') {
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: title.trim(),
          message: message.trim(),
          link: link ? link.trim() : null,
        },
      });
    } else {
      // Send to all active users
      const allUsers = await prisma.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      const records = allUsers.map((u: any) => ({
        userId: u.id,
        title: title.trim(),
        message: message.trim(),
        link: link ? link.trim() : null,
      }));

      await prisma.notification.createMany({
        data: records,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إرسال الإشعار' }, { status: 500 });
  }
}
