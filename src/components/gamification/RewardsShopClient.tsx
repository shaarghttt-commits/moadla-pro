'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Trophy,
  Zap,
  Check,
  Loader2,
  Crown,
  Medal,
  Shield,
  ArrowLeft,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RewardsShopClient() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const fetchShop = async () => {
    try {
      const res = await fetch('/api/rewards');
      const data = await res.json();
      if (res.ok) {
        setItems(data.items || []);
        setUserPoints(data.userPoints || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleAction = async (itemId: string, action: 'BUY' | 'EQUIP') => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }

    setActionLoading(itemId);
    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, action }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMsg(data.message || 'تمت العملية بنجاح! ✨');
        fetchShop();
        setTimeout(() => setToastMsg(''), 4000);
      } else {
        alert(data.error || 'فشلت العملية');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Shop Header */}
      <div className="relative rounded-[36px] p-6 sm:p-10 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-700 text-white border border-amber-400/30 shadow-2xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center sm:text-right z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>سوق الجوائز والأوسمة 🛍️</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black font-tajawal">
            استبدل نقاطك بإطارات وألقاب حصرية
          </h1>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed">
            زين حسابك الشخصي بإطارات ذهبية ونارية وألقاب علمية تظهر بجوار اسمك في المجتمع وغرف المذاكرة!
          </p>
        </div>

        {/* User Balance Card */}
        <div className="p-5 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/20 text-center z-10 shrink-0 space-y-1">
          <p className="text-xs font-bold text-slate-400">رصيدك الحالي</p>
          <div className="flex items-center justify-center gap-1.5 font-mono text-2xl font-black text-amber-400">
            <Zap className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{userPoints} XP</span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white text-xs font-black text-center shadow-lg animate-scale-up">
          {toastMsg}
        </div>
      )}

      {/* Catalog Grid */}
      <div className="space-y-6">
        {/* Section 1: Avatar Frames */}
        <div className="space-y-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
            <span>إطارات الحساب الشخصي (Avatar Frames)</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items
              .filter((i) => i.type === 'FRAME')
              .map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-[28px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 text-center space-y-4 flex flex-col justify-between hover:scale-102 transition-transform"
                >
                  <div className="space-y-3">
                    {/* Frame Preview */}
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl relative">
                      <div className={`absolute inset-0 rounded-2xl ${item.previewClass}`} />
                      <span>{user?.name?.charAt(0) || 'U'}</span>
                    </div>

                    <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                      {item.name}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                      {item.cost} XP
                    </p>

                    {item.isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleAction(item.id, 'EQUIP')}
                        disabled={actionLoading === item.id || item.isEquipped}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                          item.isEquipped
                            ? 'bg-emerald-500 text-white'
                            : 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white'
                        }`}
                      >
                        {item.isEquipped ? 'مفعل حالياً ✓' : 'تفعيل الإطار ✨'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(item.id, 'BUY')}
                        disabled={actionLoading === item.id || userPoints < item.cost}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-xs shadow-sm transition"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                        ) : (
                          'شراء الآن 🔓'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section 2: Honor Titles */}
        <div className="space-y-3 pt-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
            <span>الألقاب العلمية الشرفية (Prestige Titles)</span>
            <Medal className="w-4 h-4 text-indigo-500" />
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {items
              .filter((i) => i.type === 'TITLE')
              .map((item) => (
                <div
                  key={item.id}
                  className="glass-card rounded-[28px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 text-center space-y-4 flex flex-col justify-between hover:scale-102 transition-transform"
                >
                  <div className="space-y-3">
                    <div className={`p-2.5 rounded-xl text-xs font-black ${item.badgeClass}`}>
                      {item.name}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono">
                      {item.cost} XP
                    </p>

                    {item.isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleAction(item.id, 'EQUIP')}
                        disabled={actionLoading === item.id || item.isEquipped}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                          item.isEquipped
                            ? 'bg-emerald-500 text-white'
                            : 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white'
                        }`}
                      >
                        {item.isEquipped ? 'مفعل حالياً ✓' : 'تفعيل اللقب ✨'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(item.id, 'BUY')}
                        disabled={actionLoading === item.id || userPoints < item.cost}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-xs shadow-sm transition"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                        ) : (
                          'شراء الآن 🔓'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
