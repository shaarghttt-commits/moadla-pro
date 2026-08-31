'use client';

import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Flame,
  Activity,
  Lightbulb,
  Battery,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

const STAGE_NAMES = [
  'محطة كهرباء شبرا (توصيل المقاومات) ⚡',
  'محطة السد العالي (قانون كيرشوف للتيارات) ⚡',
  'محطة الطاقة الكهرومغناطيسية (قانون فاراداي) ⚡',
  'مفاعل الطاقة النووية والحديثة ⚡',
  'محطة محولات التيار المتردد والرنين ⚡',
];

export default function PhysicsCircuitGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('physics', 25);
  const [stageIdx, setStageIdx] = useState(0);
  const [gridPowered, setGridPowered] = useState(false);
  const [isSparking, setIsSparking] = useState(false);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const currentQ = examQuestions[stageIdx % Math.max(1, examQuestions.length)];
  const stageName = STAGE_NAMES[stageIdx % STAGE_NAMES.length];

  const handleConnectWire = (idx: number) => {
    if (gridPowered || !currentQ) return;
    setSelectedOpt(idx);

    if (idx === currentQ.correct) {
      setGridPowered(true);
      setScore((s) => s + 150);

      setTimeout(() => {
        if (stageIdx >= examQuestions.length - 1 || stageIdx >= 10) {
          setGameWon(true);
        } else {
          setStageIdx((i) => i + 1);
          setGridPowered(false);
          setSelectedOpt(null);
        }
      }, 1500);
    } else {
      setIsSparking(true);
      setTimeout(() => {
        setIsSparking(false);
        setSelectedOpt(null);
      }, 800);
    }
  };

  const restart = () => {
    refetch();
    setStageIdx(0);
    setGridPowered(false);
    setScore(0);
    setGameWon(false);
    setSelectedOpt(null);
  };

  if (loading || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-amber-300">
          جاري استيراد أسئلة امتحان الفيزياء العامة الرسمي لتغذية الدوائر الكهربية...
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
          className="px-4 py-2 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs border border-amber-400/40 flex items-center gap-1 shadow-lg shadow-amber-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>مهندس الدوائر الكهربية وقانون كيرشوف ⚡💡</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 font-mono text-xs font-black">
            {score} XP
          </div>
        </div>
      </div>

      {/* Circuit Grid Visual Stage */}
      <div
        className={`relative rounded-[36px] p-6 sm:p-10 bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-white space-y-8 overflow-hidden transition-all duration-300 ${
          isSparking ? 'ring-4 ring-rose-500 animate-shake' : ''
        }`}
      >
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 text-xs font-black">
          <span className="text-amber-400 flex items-center gap-1.5">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>المرحلة {stageIdx + 1}: {stageName}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono">
            {currentQ.examTitle}
          </span>
        </div>

        {/* Central Power Station & Glowing City Light */}
        <div className="relative py-8 flex flex-col items-center justify-center space-y-4">
          <div
            className={`w-32 h-32 rounded-3xl border-2 flex items-center justify-center text-6xl shadow-2xl transition-all duration-500 ${
              gridPowered
                ? 'bg-amber-400 border-amber-200 text-slate-950 shadow-[0_0_60px_#f59e0b] scale-110'
                : isSparking
                ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_40px_#f43f5e]'
                : 'bg-slate-900/90 border-amber-500/40 text-amber-400'
            }`}
          >
            {gridPowered ? '💡' : isSparking ? '💥' : '⚡'}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-black font-tajawal text-amber-300">
              {gridPowered ? 'تم توصيل الدائرة الكهربية وحل المسألة بنجاح! 🏙️' : isSparking ? 'قفلة كهربية! خطأ في الحساب ⚠️' : 'اختر الإجابة الصحيحة لتغذية الدائرة الكهربية'}
            </p>
            <p className="text-[11px] text-slate-400 font-mono">
              حالة التوصيل: {gridPowered ? '100% مستقر ونشط' : 'في انتظار اختيار القيمة الصحيحة...'}
            </p>
          </div>
        </div>

        {/* Question & Interactive Options */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/40 space-y-4 text-right shadow-xl">
          <h3 className="text-base sm:text-lg font-black font-tajawal text-amber-200 leading-relaxed">
            {currentQ.q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentQ.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleConnectWire(idx)}
                disabled={gridPowered}
                className="py-4 px-3 rounded-2xl bg-slate-800/90 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30 hover:border-amber-400 text-white font-black text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md font-mono text-center"
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
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-[36px] p-8 text-center text-white space-y-6 shadow-2xl animate-scale-up">
            <div className="text-6xl animate-bounce">⚡👑</div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-tajawal text-amber-400">
                أسطورة الفيزياء الكهربية! 🎉
              </h3>
              <p className="text-xs text-slate-300">
                أنرت جميع محطات الشبكة القومية وحققت {score} XP في قوانين كيرشوف وأوم وفاراداي!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition hover:scale-105"
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
