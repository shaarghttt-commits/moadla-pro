'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Flame,
  Globe,
  Radio,
  Boxes,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

const TARGET_NAMES = [
  'كويكب الضرب القياسي والمتجهات ☄️',
  'محطة المصفوفات والمحددات الفضائية 🛸',
  'كويكب معادلة الخط المستقيم والمستوى في الفراغ 🪐',
  'عملاق نظرية ذات الحدين والتباديل والتوافيق 👑',
  'محطة الأعداد المركبة والصورة المثلثية ⚡',
];

export default function AlgebraVectorGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('algebra-and-geometry', 25);
  const [missionIdx, setMissionIdx] = useState(0);
  const [asteroidDestroyed, setAsteroidDestroyed] = useState(false);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const currentQ = examQuestions[missionIdx % Math.max(1, examQuestions.length)];
  const targetName = TARGET_NAMES[missionIdx % TARGET_NAMES.length];

  const handleShoot = (idx: number) => {
    if (asteroidDestroyed || !currentQ) return;

    if (idx === currentQ.correct) {
      setAsteroidDestroyed(true);
      setScore((s) => s + 150);

      setTimeout(() => {
        if (missionIdx >= examQuestions.length - 1 || missionIdx >= 10) {
          setGameWon(true);
        } else {
          setMissionIdx((i) => i + 1);
          setAsteroidDestroyed(false);
        }
      }, 1500);
    } else {
      alert('إحداثيات التصويب غير دقيقة! أعد حساب المتجه أو محدد المصفوفة.');
    }
  };

  const restart = () => {
    refetch();
    setMissionIdx(0);
    setAsteroidDestroyed(false);
    setScore(0);
    setGameWon(false);
  };

  if (loading || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-emerald-300">
          جاري استيراد أسئلة امتحان الجبر والهندسة الفراغية الرسمي لتوجيه الليزر الفضائي...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-5xl mx-auto px-4 space-y-6 animate-fade-in select-none text-center">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-xs border border-emerald-400/40 flex items-center gap-1 shadow-lg shadow-emerald-500/20">
            <Boxes className="w-3.5 h-3.5" />
            <span>حرب المتجهات ثلاثية الأبعاد والمصفوفات 🔢🚀</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 font-mono text-xs font-black">
            {score} XP
          </div>
        </div>
      </div>

      {/* Cosmic 3D Space Arena */}
      <div className="relative rounded-[36px] p-6 sm:p-10 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-white space-y-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 text-xs font-black">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>المهمة {missionIdx + 1}: {targetName}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            {currentQ.examTitle}
          </span>
        </div>

        {/* Space Asteroid Target */}
        <div className="relative py-8 flex flex-col items-center justify-center space-y-4">
          <div
            className={`w-32 h-32 rounded-full border-2 flex items-center justify-center text-6xl shadow-2xl transition-all duration-500 ${
              asteroidDestroyed
                ? 'bg-emerald-400 border-emerald-200 text-slate-950 shadow-[0_0_60px_#10b981] scale-125 rotate-45'
                : 'bg-slate-900/90 border-emerald-500/40 text-emerald-400 animate-pulse'
            }`}
          >
            {asteroidDestroyed ? '💥' : '☄️'}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-black font-tajawal text-emerald-300">
              {asteroidDestroyed ? 'تم تفجير الكويكب بنجاح وتصحيح المسار الفضائي! 🚀' : 'حدد قيمة المتجه أو حل المعادلة لتوجيه صاروخ الليزر الفضائي'}
            </p>
          </div>
        </div>

        {/* Question & Interactive Options */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/40 space-y-4 text-right shadow-xl">
          <h3 className="text-base sm:text-lg font-black font-tajawal text-emerald-200 leading-relaxed">
            {currentQ.q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentQ.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleShoot(idx)}
                disabled={asteroidDestroyed}
                className="py-4 px-3 rounded-2xl bg-slate-800/90 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-400 text-white font-black text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md font-mono text-center"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Won Modal */}
      {gameWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-emerald-400 rounded-[36px] p-8 text-center text-white space-y-6 shadow-2xl animate-scale-up">
            <div className="text-6xl animate-bounce">🪐👑</div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-tajawal text-emerald-400">
                سيد الجبر والهندسة الفراغية! 🎉
              </h3>
              <p className="text-xs text-slate-300">
                دمرت جميع كويكبات المصفوفات وحللت المتجهات بنجاح محققاً {score} XP!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg transition hover:scale-105"
              >
                لعب مرة أخرى 🔄
              </button>
              <button
                type="button"
                onClick={onExit}
                className="px-6 py-3 rounded-2xl bg-slate-800 text-white font-bold text-xs"
              >
                الخروج
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
