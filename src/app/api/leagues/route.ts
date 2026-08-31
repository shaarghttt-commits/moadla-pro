import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const LEAGUE_TIERS = [
  { id: 'BRONZE', name: 'الدوري البرونزي', icon: '🥉', color: 'from-amber-700 to-amber-900', minXp: 0 },
  { id: 'SILVER', name: 'الدوري الفضي', icon: '🥈', color: 'from-slate-400 to-slate-600', minXp: 150 },
  { id: 'GOLD', name: 'الدوري الذهبي', icon: '🥇', color: 'from-amber-400 to-yellow-600', minXp: 400 },
  { id: 'DIAMOND', name: 'الدوري الماسي', icon: '💎', color: 'from-cyan-400 to-blue-600', minXp: 800 },
  { id: 'MASTER', name: 'نخبة المهندسين 👑', icon: '👑', color: 'from-purple-600 to-fuchsia-700', minXp: 1500 },
];

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const { searchParams } = new URL(req.url);
    const selectedLeague = searchParams.get('tier') || user?.league || 'BRONZE';

    const students = await prisma.user.findMany({
      where: {
        league: selectedLeague,
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        department: true,
        role: true,
        currentStreak: true,
        gamePoints: true,
        weeklyXp: true,
        activeFrame: true,
        activeTitle: true,
      },
      orderBy: [
        { weeklyXp: 'desc' },
        { gamePoints: 'desc' },
      ],
      take: 50,
    });

    // If few students in league, supplement with all students sorted by gamePoints
    let leaderboard = students;
    if (leaderboard.length < 5) {
      leaderboard = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          department: true,
          role: true,
          currentStreak: true,
          gamePoints: true,
          weeklyXp: true,
          activeFrame: true,
          activeTitle: true,
        },
        orderBy: [
          { gamePoints: 'desc' },
          { weeklyXp: 'desc' },
        ],
        take: 50,
      });
    }

    return NextResponse.json({
      tiers: LEAGUE_TIERS,
      currentTier: selectedLeague,
      leaderboard,
      myRank: user ? leaderboard.findIndex((s: any) => s.id === user.id) + 1 : null,
    });
  } catch (error) {
    console.error('Leagues fetch error:', error);
    return NextResponse.json({ error: 'فشل في جلب قائمة المتصدرين' }, { status: 500 });
  }
}
