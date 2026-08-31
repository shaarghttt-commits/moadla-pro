'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Flame,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Crown,
  Medal,
  Award,
  Swords,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const TIERS = [
  { id: 'BRONZE', name: 'الدوري البرونزي', icon: '🥉', color: 'from-amber-700 to-amber-900', border: 'border-amber-700' },
  { id: 'SILVER', name: 'الدوري الفضي', icon: '🥈', color: 'from-slate-400 to-slate-600', border: 'border-slate-400' },
  { id: 'GOLD', name: 'الدوري الذهبي', icon: '🥇', color: 'from-amber-400 to-yellow-600', border: 'border-yellow-500' },
  { id: 'DIAMOND', name: 'الدوري الماسي', icon: '💎', color: 'from-cyan-400 to-blue-600', border: 'border-cyan-500' },
  { id: 'MASTER', name: 'نخبة المهندسين', icon: '👑', color: 'from-purple-600 to-fuchsia-700', border: 'border-purple-500' },
];

export default function LeaguesLeaderboard() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState('BRONZE');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async (tier: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leagues?tier=${tier}`);
      const data = await res.json();
      if (res.ok) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(selectedTier);
  }, [selectedTier]);

  const currentTierInfo = TIERS.find((t) => t.id === selectedTier) || TIERS[0];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative rounded-[36px] p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-right z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/30 text-xs font-black">
            <Trophy className="w-3.5 h-3.5" />
            <span>دوريات المتفوقين الأسبوعية 🏆</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-tajawal">
            لوحة الشرف وتصنيف الطلاب
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            اكسب نقاط XP من حل الامتحانات والمبارزات وتسجيل الحضور اليومي لتصعد إلى الدوري الماسي ونخبة المهندسين!
          </p>
        </div>

        {/* Action Link to Rewards Shop */}
        <div className="z-10 shrink-0">
          <Link
            href="/rewards-shop"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>متجر الجوائز والأوسمة 🛍️</span>
          </Link>
        </div>
      </div>

      {/* League Tier Tabs Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {TIERS.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`p-4 rounded-3xl text-center transition-all duration-300 border flex flex-col items-center gap-2 ${
                isSelected
                  ? `bg-gradient-to-br ${tier.color} text-white ${tier.border} shadow-xl scale-105 ring-2 ring-white/40`
                  : 'glass-card text-slate-700 dark:text-slate-300 hover:scale-102 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-3xl">{tier.icon}</span>
              <span className="text-xs font-black font-tajawal">{tier.name}</span>
            </button>
          );
        })}
      </div>

      {/* Promotion Zone Explainer */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ArrowUp className="w-4 h-4 text-emerald-500" />
          <span>منطقة الصعود (المراتب من 1 إلى 5): تصعد تلقائياً للدوري الأعلى بنهاية الأسبوع! 🚀</span>
        </div>
        <span className="font-mono font-black">متبقي 3 أيام</span>
      </div>

      {/* Leaderboard Table List */}
      <div className="glass-card rounded-[32px] overflow-hidden shadow-soft border border-slate-200/80 dark:border-slate-800">
        {loading ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">
            جاري تحميل قائمة المتصدرين...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-bold text-xs">
            كن أول من ينضم ويحقق نقاط في هذا الدوري! ⚡
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leaderboard.map((student, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const isPromotion = rank <= 5;
              const isMe = user?.id === student.id;

              return (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 sm:p-5 transition-colors ${
                    isMe
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 font-black'
                      : isPromotion
                      ? 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Rank & Student Info */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                          : rank === 2
                          ? 'bg-slate-300 text-slate-900 shadow-md'
                          : rank === 3
                          ? 'bg-amber-700 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                    </div>

                    {/* Avatar with optional equipped frame */}
                    <Link href={`/user/${student.id}`} className="shrink-0 relative">
                      <div
                        className={`w-11 h-11 rounded-2xl overflow-hidden bg-brand-500 flex items-center justify-center text-white font-bold text-sm ${
                          student.activeFrame === 'frame-gold'
                            ? 'ring-2 ring-amber-400 shadow-md shadow-amber-400/30'
                            : student.activeFrame === 'frame-neon-fire'
                            ? 'ring-2 ring-rose-500 shadow-md shadow-rose-500/30'
                            : ''
                        }`}
                      >
                        {student.avatar ? (
                          <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          student.name?.charAt(0) || 'U'
                        )}
                      </div>
                    </Link>

                    {/* Name & Subtitles */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/user/${student.id}`}
                          className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-tajawal hover:text-brand-600 transition"
                        >
                          {student.name}
                        </Link>
                        {isMe && (
                          <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[9px] font-black">
                            أنت
                          </span>
                        )}
                        {student.activeTitle && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-600 dark:text-blue-300 text-[10px] font-bold">
                            {student.activeTitle}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                        <span>{student.department || 'طالب معادلة'}</span>
                        {student.currentStreak > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-500 font-bold">🔥 {student.currentStreak}d</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Points & XP Column */}
                  <div className="text-left shrink-0">
                    <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                      <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{student.gamePoints || 0} XP</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {isPromotion ? 'صعود مضمون 🟢' : 'في المنافسة ⚡'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
