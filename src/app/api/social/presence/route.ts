import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const online = body.online !== undefined ? Boolean(body.online) : true;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: online,
        lastSeenAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, online });
  } catch (error) {
    console.error('presence update error', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isOnline: true, lastSeenAt: true },
    });
    return NextResponse.json({ isOnline: profile?.isOnline ?? false, lastSeenAt: profile?.lastSeenAt ?? new Date() });
  } catch (error) {
    console.error('presence fetch error', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
