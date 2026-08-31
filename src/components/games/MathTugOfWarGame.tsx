'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Users,
  Flame,
  Zap,
  Check,
  X,
  Copy,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

export default function MathTugOfWarGame({
  roomCode: initialRoomCode,
  onExit,
}: {
  roomCode?: string;
  onExit: () => void;
}) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('all', 30);

  const [roomCode] = useState<string | null>(initialRoomCode || null);
  const [isCopied, setIsCopied] = useState(false);
  const [ropePosition, setRopePosition] = useState(0); // -4 (P1 wins) to +4 (P2 wins), 0 is center
  const [p1QuestionIdx, setP1QuestionIdx] = useState(0);
  const [p2QuestionIdx, setP2QuestionIdx] = useState(1);
  const [winner, setWinner] = useState<'P1' | 'P2' | null>(null);

  const [p1Name] = useState(user?.name || 'اللاعب 1');
  const [p2Name] = useState('اللاعب 2 (المتحدي)');

  const p1Q = examQuestions[p1QuestionIdx % Math.max(1, examQuestions.length)];
  const p2Q = examQuestions[p2QuestionIdx % Math.max(1, examQuestions.length)];

  const handleP1Answer = (idx: number) => {
    if (winner || !p1Q) return;
    if (idx === p1Q.correct) {
      const nextPos = ropePosition - 1;
      setRopePosition(nextPos);
      if (nextPos <= -4) {
        setWinner('P1');
      }
    }
    setP1QuestionIdx((i) => i + 2);
  };

  const handleP2Answer = (idx: number) => {
    if (winner || !p2Q) return;
    if (idx === p2Q.correct) {
      const nextPos = ropePosition + 1;
      setRopePosition(nextPos);
      if (nextPos >= 4) {
        setWinner('P2');
      }
    }
    setP2QuestionIdx((i) => i + 2);
  };

  const resetGame = () => {
    refetch();
    setRopePosition(0);
    setP1QuestionIdx(0);
    setP2QuestionIdx(1);
    setWinner(null);
  };

  const copyLink = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/games?room=${roomCode}&game=tugofwar`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/games?room=${roomCode}&game=tugofwar`;
    const text = `دعاك ${user?.name || 'صديقك'} لمعركة شد الحبل الرياضي 🪢! اضغط هنا للانضمام للغرفة: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading || examQuestions.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 font-tajawal">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          جاري تجهيز حبل المعركة وأسئلة الامتحانات...
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 space-y-8 animate-fade-in font-tajawal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center gap-1.5 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>خروج</span>
          </button>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>معركة شد الحبل الرياضي 🪢⚡</span>
            </h2>
            <p className="text-xs text-slate-400">
              كل إجابة صحيحة وسريعة تسحب العقدة المركزية خطوة نحو منطقتك!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 hover:bg-amber-600 transition shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>جولة جديدة 🔄</span>
        </button>
      </div>

      {/* Room Share Bar if in room */}
      {roomCode && (
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold">كود الغرفة:</span>
            <span className="font-mono font-black text-amber-600">{roomCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border font-bold flex items-center gap-1"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
            <button
              type="button"
              onClick={shareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
            >
              واتساب 📲
            </button>
          </div>
        </div>
      )}

      {/* Interactive Tug-of-War Rope Visualizer */}
      <div className="p-6 rounded-[36px] bg-gradient-to-r from-blue-950 via-slate-900 to-rose-950 border border-slate-700 shadow-xl text-white space-y-6">
        <div className="flex items-center justify-between text-xs font-bold px-2">
          <div className="flex items-center gap-2 text-blue-400">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
            <span className="font-black text-sm">{p1Name} (منطقة الفوز ⬅️)</span>
          </div>
          <div className="flex items-center gap-2 text-rose-400">
            <span className="font-black text-sm">(➡️ منطقة الفوز) {p2Name}</span>
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          </div>
        </div>

        {/* Rope Track */}
        <div className="relative h-12 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center px-4 overflow-hidden shadow-inner">
          {/* Win Markers */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-blue-500/80 dashed" />
          <div className="absolute right-6 top-0 bottom-0 w-1 bg-rose-500/80 dashed" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-amber-400/50" />

          {/* Sliding Knot Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-amber-500 border-2 border-white shadow-glow flex items-center justify-center text-lg transition-all duration-300 ease-out"
            style={{
              left: `calc(50% + ${ropePosition * 11}% - 20px)`,
            }}
          >
            🪢
          </div>
        </div>

        <div className="text-center">
          <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
            موقع الحبل الحالي: {ropePosition === 0 ? 'في المنتصف تماماً ⚖️' : ropePosition < 0 ? `مائل لـ ${p1Name} بـ ${Math.abs(ropePosition)} نقاط` : `مائل لـ ${p2Name} بـ ${ropePosition} نقاط`}
          </span>
        </div>
      </div>

      {/* Split Screens: Player 1 Question vs Player 2 Question */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player 1 Card */}
        <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border-2 border-blue-300 dark:border-blue-800 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-800/80 pb-3">
            <span className="text-xs font-black text-blue-700 dark:text-blue-300">
              مسألة {p1Name} 🔵
            </span>
            <span className="text-[10px] font-mono text-slate-400">سؤال #{p1QuestionIdx + 1}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-relaxed min-h-[48px]">
            {p1Q?.q}
          </h3>

          <div className="grid grid-cols-1 gap-2 pt-2">
            {p1Q?.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleP1Answer(idx)}
                disabled={Boolean(winner)}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-800 dark:text-slate-100 text-xs font-bold transition text-right border border-blue-200 dark:border-blue-900 shadow-xs active:scale-98 disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Player 2 Card */}
        <div className="p-6 rounded-3xl bg-rose-50/70 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 space-y-4">
          <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-800/80 pb-3">
            <span className="text-xs font-black text-rose-700 dark:text-rose-300">
              مسألة {p2Name} 🔴
            </span>
            <span className="text-[10px] font-mono text-slate-400">سؤال #{p2QuestionIdx + 1}</span>
          </div>

          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-relaxed min-h-[48px]">
            {p2Q?.q}
          </h3>

          <div className="grid grid-cols-1 gap-2 pt-2">
            {p2Q?.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleP2Answer(idx)}
                disabled={Boolean(winner)}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-800 dark:text-slate-100 text-xs font-bold transition text-right border border-rose-200 dark:border-rose-900 shadow-xs active:scale-98 disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[36px] p-8 text-center space-y-5 shadow-2xl animate-scale-up">
            <div className="text-5xl animate-bounce">🪢🏆</div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                فوز ساحق للبطل ({winner === 'P1' ? p1Name : p2Name})! 🎉
              </h3>
              <p className="text-xs text-slate-400">
                سحب الحبل بالكامل بفضل السرعة والدقة في حل مسائل المعادلة!
              </p>
            </div>
            <button
              type="button"
              onClick={resetGame}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
            >
              جولة جديدة 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
