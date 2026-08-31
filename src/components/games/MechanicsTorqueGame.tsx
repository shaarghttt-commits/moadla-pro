'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Flame,
  Shield,
  Layers,
  Wrench,
  Anchor,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

const LEVEL_NAMES = [
  'اتزان الرافعة الهندسية (العزم حول نقطة) 🏗️',
  'ازدواج القوى والاتزان التام ⚙️',
  'قوة الاحتكاك السكوني الحرج 🧱',
  'ديناميكا نيوتن والشغل وطاقة الحركة 🚀',
  'مركز الثقل والبكرات والحركة المنتظمة ⚡',
];

export default function MechanicsTorqueGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('mechanics', 25);
  const [levelIdx, setLevelIdx] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(15); // degrees
  const [isBalanced, setIsBalanced] = useState(false);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  const currentQ = examQuestions[levelIdx % Math.max(1, examQuestions.length)];
  const levelName = LEVEL_NAMES[levelIdx % LEVEL_NAMES.length];

  const handleBalance = (idx: number) => {
    if (isBalanced || !currentQ) return;

    if (idx === currentQ.correct) {
      setTiltAngle(0);
      setIsBalanced(true);
      setScore((s) => s + 150);

      setTimeout(() => {
        if (levelIdx >= examQuestions.length - 1 || levelIdx >= 10) {
          setGameWon(true);
        } else {
          setLevelIdx((i) => i + 1);
          setTiltAngle(15);
          setIsBalanced(false);
        }
      }, 1500);
    } else {
      setTiltAngle(-25); // Slams in wrong direction
      setTimeout(() => setTiltAngle(15), 600);
    }
  };

  const restart = () => {
    refetch();
    setLevelIdx(0);
    setTiltAngle(15);
    setIsBalanced(false);
    setScore(0);
    setGameWon(false);
  };

  if (loading || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-purple-300">
          جاري استيراد أسئلة امتحان الميكانيكا الرسمي (الاستاتيكا والديناميكا)...
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
          className="px-4 py-2 rounded-2xl bg-slate-900 border border-purple-500/30 text-purple-400 font-bold text-xs flex items-center gap-1.5 hover:bg-purple-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-400 font-black text-xs border border-purple-400/40 flex items-center gap-1 shadow-lg shadow-purple-500/20">
            <Wrench className="w-3.5 h-3.5" />
            <span>ميزان عزم وقوى الميكانيكا ⚖️⚙️</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 font-mono text-xs font-black">
            {score} XP
          </div>
        </div>
      </div>

      {/* Physics Torque Seesaw Arena */}
      <div className="relative rounded-[36px] p-6 sm:p-10 bg-gradient-to-b from-slate-950 via-slate-900 to-purple-950/40 border-2 border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.15)] text-white space-y-8 overflow-hidden">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3 text-xs font-black">
          <span className="text-purple-400 flex items-center gap-1.5">
            <Anchor className="w-4 h-4 text-purple-400" />
            <span>المستوى {levelIdx + 1}: {levelName}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono">
            {currentQ.examTitle}
          </span>
        </div>

        {/* Seesaw Mechanics Graphic */}
        <div className="relative py-12 flex flex-col items-center justify-center">
          {/* Pivoted Beam with Dynamic Tilt Angle */}
          <div
            className="w-64 sm:w-80 h-4 bg-gradient-to-r from-purple-500 via-amber-400 to-purple-500 rounded-full shadow-2xl transition-transform duration-500 relative flex items-center justify-between px-3"
            style={{ transform: `rotate(${tiltAngle}deg)` }}
          >
            {/* Left Weight */}
            <div className="w-9 h-9 rounded-xl bg-slate-900 border-2 border-purple-400 text-purple-300 font-black text-xs flex items-center justify-center shadow-lg -translate-y-6">
              F₁
            </div>
            {/* Fulcrum Dot */}
            <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-slate-950 shadow-md" />
            {/* Right Weight */}
            <div className="w-9 h-9 rounded-xl bg-slate-900 border-2 border-amber-400 text-amber-300 font-black text-xs flex items-center justify-center shadow-lg -translate-y-6">
              F₂
            </div>
          </div>

          {/* Fulcrum Triangle Base */}
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[36px] border-b-purple-500/80 -mt-1 shadow-lg" />

          <div className="mt-4 space-y-1">
            <p className="text-sm font-black font-tajawal text-purple-300">
              {isBalanced
                ? '⚖️ تم تحقيق شرط الاتزان التام (محصلة العزوم = 0)!'
                : 'احسب العزم أو القوة المطلوبة لإعادة الرافعة لحالة الاتزان'}
            </p>
          </div>
        </div>

        {/* Question & Interactive Options */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-purple-500/40 space-y-4 text-right shadow-xl">
          <h3 className="text-base sm:text-lg font-black font-tajawal text-purple-200 leading-relaxed">
            {currentQ.q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {currentQ.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleBalance(idx)}
                disabled={isBalanced}
                className="py-4 px-3 rounded-2xl bg-slate-800/90 hover:bg-purple-600 hover:text-white border border-purple-500/30 hover:border-purple-400 text-white font-black text-xs sm:text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md font-mono text-center"
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
          <div className="w-full max-w-sm bg-slate-900 border-2 border-purple-400 rounded-[36px] p-8 text-center text-white space-y-6 shadow-2xl animate-scale-up">
            <div className="text-6xl animate-bounce">🏗️👑</div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-tajawal text-purple-400">
                عبقري الميكانيكا والاستاتيكا! 🎉
              </h3>
              <p className="text-xs text-slate-300">
                وازنت جميع الروافع وحللت قوى الاحتكاك والازدواج بنجاح محققاً {score} XP!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={restart}
                className="px-6 py-3 rounded-2xl bg-purple-500 hover:bg-purple-600 text-white font-black text-xs shadow-lg transition hover:scale-105"
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
