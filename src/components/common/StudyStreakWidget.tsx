'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Check, Trophy, Calendar, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StudyStreakWidget() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<{
    currentStreak: number;
    longestStreak: number;
    isCheckedInToday: boolean;
    weeklyProgress: { day: string; isActive: boolean; isToday: boolean }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState('');

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/streak');
      const data = await res.json();
      if (res.ok) {
        setStreakData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStreak();
    }
  }, [user]);

  const handleDailyCheckIn = async () => {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/streak', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setCelebrationMsg(data.message || 'تم تسجيل حضورك بنجاح! 🔥');
        fetchStreak();
        setTimeout(() => setCelebrationMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingIn(false);
    }
  };

  if (!user || loading || !streakData) return null;

  return (
    <div className="glass-card rounded-[28px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-4 relative overflow-hidden">
      {/* Ambient Flame Glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
            <Flame className="w-5 h-5 fill-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white font-tajawal leading-none">
              سلسلة المذاكرة اليومية
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              الأعلى: {streakData.longestStreak} يوم متتالي
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60 flex items-center gap-1 font-black text-xs">
          <span>{streakData.currentStreak}</span>
          <span>أيام 🔥</span>
        </div>
      </div>

      {/* Weekly Days Dots */}
      <div className="grid grid-cols-7 gap-1 text-center pt-1">
        {streakData.weeklyProgress.map((d, i) => (
          <div key={i} className="space-y-1">
            <div
              className={`h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                d.isActive
                  ? 'bg-gradient-to-br from-amber-500 to-rose-600 text-white shadow-sm scale-105'
                  : d.isToday
                  ? 'bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-amber-500 text-amber-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {d.isActive ? '🔥' : d.isToday ? '⏳' : '•'}
            </div>
            <p className="text-[9px] font-bold text-slate-400 truncate">{d.day.slice(0, 3)}</p>
          </div>
        ))}
      </div>

      {/* Celebration Notification */}
      {celebrationMsg && (
        <div className="p-3 rounded-2xl bg-amber-500 text-white text-xs font-black text-center shadow-lg animate-scale-up">
          {celebrationMsg}
        </div>
      )}

      {/* Action Button */}
      {!streakData.isCheckedInToday ? (
        <button
          type="button"
          onClick={handleDailyCheckIn}
          disabled={checkingIn}
          className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          {checkingIn ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>تسجيل نشاط ومذاكرة اليوم (+20 XP)</span>
            </>
          )}
        </button>
      ) : (
        <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-center text-xs font-bold flex items-center justify-center gap-1.5">
          <Check className="w-4 h-4" />
          <span>تم تسجيل حضورك ومذاكرتك اليوم بنجاح! 🎉</span>
        </div>
      )}
    </div>
  );
}
