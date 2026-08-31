'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Crown,
  Medal,
  Swords,
  Users,
  Flame,
  Award,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  department?: string | null;
  gamePoints: number;
  gameWins: number;
  gameLosses: number;
  isOnline?: boolean;
}

interface GameLeaderboardTabProps {
  onChallengePlayer?: (playerId: string) => void;
}

export default function GameLeaderboardTab({ onChallengePlayer }: GameLeaderboardTabProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/games/leaderboard');
        const data = await res.json();
        if (res.ok && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-3 font-semibold">جاري جلب لوحة الشرف والمتصدرين...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Top 3 Podium */}
      {top3.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-b from-brand-900 via-slate-900 to-slate-900 border border-brand-800/60 p-6 sm:p-10 shadow-2xl text-white">
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>منصة التتويج لأبطال المنصة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-tajawal">
              المتصدرون في ألعاب وتحديات معادلة برو
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-6">
            {/* 2nd Place (Silver) */}
            {top3[1] && (
              <div className="text-center space-y-3 flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden bg-slate-800 ring-4 ring-slate-400 shadow-xl border-2 border-slate-600">
                    {top3[1].avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={top3[1].avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                        {top3[1].name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center font-black text-xs shadow-md">
                    2
                  </span>
                </div>

                <div className="space-y-0.5">
                  <Link href={`/user/${top3[1].id}`} className="font-bold text-xs sm:text-sm truncate max-w-[100px] block hover:text-brand-300">
                    {top3[1].name}
                  </Link>
                  <div className="text-xs font-black text-slate-300">{top3[1].gamePoints} XP</div>
                  <div className="text-[10px] text-slate-400">{top3[1].gameWins} فوز</div>
                </div>

                <div className="w-full h-24 sm:h-32 rounded-t-3xl bg-slate-800/80 border-t-2 border-slate-400 flex items-center justify-center font-black text-xl text-slate-400">
                  🥈
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {top3[0] && (
              <div className="text-center space-y-3 flex flex-col items-center">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-slate-800 ring-4 ring-amber-400 shadow-2xl border-2 border-amber-300">
                    {top3[0].avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={top3[0].avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-amber-400 text-xl">
                        {top3[0].name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="absolute -top-4 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-black text-sm shadow-md ring-2 ring-amber-200">
                    👑
                  </span>
                </div>

                <div className="space-y-0.5">
                  <Link href={`/user/${top3[0].id}`} className="font-bold text-sm sm:text-base text-amber-300 truncate max-w-[120px] block hover:underline">
                    {top3[0].name}
                  </Link>
                  <div className="text-sm font-black text-amber-400 font-tajawal">{top3[0].gamePoints} XP</div>
                  <div className="text-[10px] text-slate-400">{top3[0].gameWins} فوز 🏆</div>
                </div>

                <div className="w-full h-32 sm:h-44 rounded-t-3xl bg-amber-500/20 border-t-4 border-amber-400 flex items-center justify-center font-black text-2xl text-amber-400">
                  🥇
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {top3[2] && (
              <div className="text-center space-y-3 flex flex-col items-center">
                <div className="relative">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden bg-slate-800 ring-4 ring-amber-700 shadow-xl border-2 border-amber-600">
                    {top3[2].avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={top3[2].avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-amber-700">
                        {top3[2].name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="absolute -top-3 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-xs shadow-md">
                    3
                  </span>
                </div>

                <div className="space-y-0.5">
                  <Link href={`/user/${top3[2].id}`} className="font-bold text-xs sm:text-sm truncate max-w-[100px] block hover:text-brand-300">
                    {top3[2].name}
                  </Link>
                  <div className="text-xs font-black text-amber-600">{top3[2].gamePoints} XP</div>
                  <div className="text-[10px] text-slate-400">{top3[2].gameWins} فوز</div>
                </div>

                <div className="w-full h-20 sm:h-24 rounded-t-3xl bg-amber-900/40 border-t-2 border-amber-700 flex items-center justify-center font-black text-xl text-amber-600">
                  🥉
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Leaderboard Table (Rest of Players) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
          ترتيب بقية المتنافسين
        </h3>

        <div className="space-y-2">
          {leaderboard.map((student, idx) => (
            <div
              key={student.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-brand-500/40 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600">
                  {idx + 1}
                </span>

                <Link href={`/user/${student.id}`} className="w-10 h-10 rounded-2xl overflow-hidden bg-brand-50 shrink-0 border border-slate-200 relative block">
                  {student.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-brand-600 text-xs">
                      {student.name.charAt(0)}
                    </div>
                  )}
                  {student.isOnline && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white absolute bottom-0 left-0" />
                  )}
                </Link>

                <div className="min-w-0">
                  <Link href={`/user/${student.id}`} className="font-bold text-xs text-slate-900 dark:text-white truncate block hover:text-brand-600">
                    {student.name}
                  </Link>
                  <div className="text-[11px] text-slate-400 truncate">
                    {student.department || 'طالب معادلة'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-xs font-black text-brand-600 dark:text-brand-400 font-tajawal">
                    {student.gamePoints} XP
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {student.gameWins} انتصار
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onChallengePlayer?.(student.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-sm"
                  title="تحدي في مبارزة"
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">تحدي</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
