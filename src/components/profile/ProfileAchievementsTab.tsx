'use client';

import React from 'react';
import {
  Trophy,
  Award,
  Swords,
  Flame,
  CheckCircle2,
  BookOpen,
  Zap,
  Target,
  Crown,
  Sparkles,
} from 'lucide-react';

interface ProfileAchievementsTabProps {
  user: {
    id: string;
    name: string;
    gamePoints?: number;
    gameWins?: number;
    gameLosses?: number;
    _count?: {
      attempts?: number;
      progress?: number;
      groupMemberships?: number;
      authoredWallPosts?: number;
    };
  };
}

export default function ProfileAchievementsTab({ user }: ProfileAchievementsTabProps) {
  const points = user.gamePoints || 0;
  const wins = user.gameWins || 0;
  const losses = user.gameLosses || 0;
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const badges = [
    {
      title: 'بطل الرياضيات',
      desc: 'حقق أعلى النقاط في تحديات التفاضل والتكامل',
      icon: Crown,
      unlocked: points >= 100,
      color: 'amber',
    },
    {
      title: 'المبارز الذي لا يُهزم',
      desc: 'فاز في أكثر من 5 مبارزات ضد زملائه',
      icon: Swords,
      unlocked: wins >= 5,
      color: 'rose',
    },
    {
      title: 'صاحب الهمة العالية',
      desc: 'أكمل أكثر من 10 دروس واختبارات في المنصة',
      icon: Flame,
      unlocked: (user._count?.progress || 0) >= 5,
      color: 'emerald',
    },
    {
      title: 'عضو نشط ومتميز',
      desc: 'انضم للمجموعات وشارك المذكرات والمنشورات',
      icon: Sparkles,
      unlocked: (user._count?.authoredWallPosts || 0) >= 3,
      color: 'purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mb-3">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">{points}</div>
          <div className="text-xs text-slate-400 font-semibold mt-0.5">نقاط الخبرة (XP)</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center mb-3">
            <Swords className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">{wins}</div>
          <div className="text-xs text-slate-400 font-semibold mt-0.5">انتصارات الألعاب</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center mb-3">
            <Target className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">{winRate}%</div>
          <div className="text-xs text-slate-400 font-semibold mt-0.5">نسبة الفوز والتفوق</div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-500 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
            {user._count?.progress || 0}
          </div>
          <div className="text-xs text-slate-400 font-semibold mt-0.5">دروس مكتملة</div>
        </div>
      </div>

      {/* Badges and Honors */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <span>الأوسمة والشارات الشرفية</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                  b.unlocked
                    ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    b.unlocked
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-300 dark:ring-amber-800'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.title}</h4>
                    {b.unlocked ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        مكتسب ✨
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold">مغلق 🔒</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
