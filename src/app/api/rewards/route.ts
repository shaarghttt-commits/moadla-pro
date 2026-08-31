import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const SHOP_ITEMS = [
  // Avatar Frames
  { id: 'frame-gold', type: 'FRAME', name: 'إطار الذهب الملكي ✨', cost: 100, previewClass: 'ring-4 ring-amber-400 shadow-lg shadow-amber-500/30' },
  { id: 'frame-neon-fire', type: 'FRAME', name: 'إطار الشعلة النارية 🔥', cost: 150, previewClass: 'ring-4 ring-rose-500 shadow-lg shadow-rose-500/40 animate-pulse' },
  { id: 'frame-cyber', type: 'FRAME', name: 'إطار السايبر الكوني ⚡', cost: 200, previewClass: 'ring-4 ring-cyan-400 shadow-lg shadow-cyan-500/40' },
  { id: 'frame-diamond', type: 'FRAME', name: 'إطار الماس الأزرق 💎', cost: 300, previewClass: 'ring-4 ring-blue-500 shadow-lg shadow-blue-500/50' },
  // Honor Titles
  { id: 'title-engineer', type: 'TITLE', name: 'باشمهندس المستقبل ⚡', cost: 80, badgeClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-300' },
  { id: 'title-calculus', type: 'TITLE', name: 'داهية التفاضل والتكامل 📐', cost: 120, badgeClass: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-300' },
  { id: 'title-physics', type: 'TITLE', name: 'عبقري الفيزياء وقانون أوم 💡', cost: 120, badgeClass: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-300' },
  { id: 'title-valedictorian', type: 'TITLE', name: 'أول دفعة معادلة 2025 👑', cost: 250, badgeClass: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300' },
];

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    let myRewards: string[] = [];

    if (user) {
      const dbRewards = await prisma.userReward.findMany({
        where: { userId: user.id },
        select: { rewardKey: true },
      });
      myRewards = dbRewards.map((r: any) => r.rewardKey);
    }

    return NextResponse.json({
      items: SHOP_ITEMS.map((item: any) => ({
        ...item,
        isUnlocked: myRewards.includes(item.id),
        isEquipped: user?.activeFrame === item.id || user?.activeTitle === item.name,
      })),
      userPoints: user?.gamePoints || 0,
      activeFrame: user?.activeFrame || null,
      activeTitle: user?.activeTitle || null,
    });
  } catch (error) {
    console.error('Rewards shop fetch error:', error);
    return NextResponse.json({ error: 'فشل في جلب متجر الجوائز' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول أولاً' }, { status: 401 });
    }

    const body = await req.json();
    const { action, itemId } = body;

    const item = SHOP_ITEMS.find((i: any) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ error: 'العنصر غير موجود' }, { status: 404 });
    }

    // Action 1: Purchase Item
    if (action === 'BUY') {
      if (user.gamePoints < item.cost) {
        return NextResponse.json({ error: `نقاطك (${user.gamePoints} XP) لا تكفي لشراء هذا العنصر (${item.cost} XP)` }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { gamePoints: { decrement: item.cost } },
        }),
        prisma.userReward.create({
          data: {
            userId: user.id,
            rewardType: item.type,
            rewardKey: item.id,
            name: item.name,
            cost: item.cost,
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: `تم شراء ${item.name} بنجاح! 🎉` });
    }

    // Action 2: Equip Item
    if (action === 'EQUIP') {
      const updateData: any = {};
      if (item.type === 'FRAME') {
        updateData.activeFrame = item.id;
      } else if (item.type === 'TITLE') {
        updateData.activeTitle = item.name;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return NextResponse.json({ success: true, message: `تم تفعيل ${item.name} على بروفايلك! ✨` });
    }

    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error) {
    console.error('Reward transaction error:', error);
    return NextResponse.json({ error: 'فشل في إتمام العملية' }, { status: 500 });
  }
}
