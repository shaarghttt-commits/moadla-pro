'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Flame,
  Gauge,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

export default function FormulaMathRacerGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('all', 35);
  const [playerProgress, setPlayerProgress] = useState(0); // 0 - 100%
  const [aiProgress, setAiProgress] = useState(0); // 0 - 100%
  const [speed, setSpeed] = useState(120); // km/h
  const [streakCombo, setStreakCombo] = useState(0);
  const [nitroActive, setNitroActive] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [raceFinished, setRaceFinished] = useState(false);
  const [playerWon, setPlayerWon] = useState(false);
  const [lapTime, setLapTime] = useState(0);

  // Lap timer
  useEffect(() => {
    let timer: any = null;
    if (!raceFinished) {
      timer = setInterval(() => setLapTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [raceFinished]);

  // AI Opponent auto driving
  useEffect(() => {
    let aiInterval: any = null;
    if (!raceFinished) {
      aiInterval = setInterval(() => {
        setAiProgress((prev) => {
          const next = prev + Math.random() * 2.5 + 1.2;
          if (next >= 100) {
            setRaceFinished(true);
            setPlayerWon(false);
            return 100;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(aiInterval);
  }, [raceFinished]);

  const currentQ = examQuestions[questionIdx % Math.max(1, examQuestions.length)];

  const handleAnswer = (optionIdx: number) => {
    if (raceFinished || !currentQ) return;

    const isCorrect = optionIdx === currentQ.correct;

    if (isCorrect) {
      const newCombo = streakCombo + 1;
      setStreakCombo(newCombo);

      let boost = 14;
      let newSpeed = Math.min(340, speed + 25);

      // Check Nitro
      if (newCombo >= 3) {
        setNitroActive(true);
        boost = 26;
        newSpeed = 380;
        setTimeout(() => setNitroActive(false), 2000);
      }

      setSpeed(newSpeed);

      setPlayerProgress((prev) => {
        const next = prev + boost;
        if (next >= 100) {
          setRaceFinished(true);
          setPlayerWon(true);
          return 100;
        }
        return next;
      });
    } else {
      setStreakCombo(0);
      setSpeed(Math.max(80, speed - 30));
    }

    setQuestionIdx((i) => i + 1);
  };

  const restartRace = () => {
    refetch();
    setPlayerProgress(0);
    setAiProgress(0);
    setSpeed(120);
    setStreakCombo(0);
    setNitroActive(false);
    setQuestionIdx(0);
    setRaceFinished(false);
    setPlayerWon(false);
    setLapTime(0);
  };

  if (loading || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4 font-tajawal">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          جاري استيراد أسئلة الامتحانات لتزويد محرك سيارة السباق بالوقود...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-5xl mx-auto px-4 space-y-6 animate-fade-in select-none font-tajawal">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-black">
            ⏱️ {lapTime} ثانية
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs">
            <Gauge className="w-4 h-4" />
            <span>{speed} كم/س</span>
          </div>
        </div>
      </div>

      {/* Race Track Animation Arena */}
      <div className="relative rounded-[36px] p-6 sm:p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-slate-700 shadow-2xl text-white space-y-6 overflow-hidden">
        {/* Track Header */}
        <div className="flex items-center justify-between text-xs font-black text-slate-400">
          <span>🏁 نقطة الانطلاق</span>
          <span className="text-amber-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>تيربو المعادلات: {streakCombo}x متتالي</span>
          </span>
          <span>🏆 خط النهاية</span>
        </div>

        {/* Lanes */}
        <div className="space-y-4 py-4">
          {/* Player Lane */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-amber-400">🏎️ سيارتك (المركز {Math.round(playerProgress)}%)</span>
              {nitroActive && (
                <span className="text-xs text-cyan-400 font-mono font-black animate-pulse">
                  ⚡ NITRO ACTIVE +380 KM/H!
                </span>
              )}
            </div>
            <div className="h-6 bg-slate-800/80 rounded-2xl p-1 relative border border-amber-500/30 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-xl transition-all duration-300 relative shadow-lg"
                style={{ width: `${Math.max(4, playerProgress)}%` }}
              >
                <div className="absolute right-1 top-1/2 -translate-y-1/2 text-xs">🏎️</div>
              </div>
            </div>
          </div>

          {/* AI Bot Lane */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>🤖 المتحدي الذكي ({Math.round(aiProgress)}%)</span>
            </div>
            <div className="h-5 bg-slate-800/60 rounded-2xl p-1 relative border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-slate-600 rounded-xl transition-all duration-500 relative"
                style={{ width: `${Math.max(4, aiProgress)}%` }}
              >
                <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px]">🚗</div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Panel */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700 space-y-4 text-right shadow-xl">
          <div className="flex items-center justify-between text-xs text-amber-400 font-bold border-b border-slate-800 pb-2">
            <span>سؤال الامتحان للتسارع ⚡</span>
            <span className="text-[10px] text-slate-400">{currentQ.examTitle}</span>
          </div>

          <h3 className="text-base sm:text-lg font-black font-tajawal text-amber-200 leading-relaxed">
            {currentQ.q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswer(idx)}
                disabled={raceFinished}
                className="py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 hover:border-amber-400 text-white font-black text-xs sm:text-sm transition-all duration-150 hover:scale-102 active:scale-95 shadow-md text-right"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Race Finished Modal */}
      {raceFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-[36px] p-8 text-center text-white space-y-6 shadow-2xl animate-scale-up">
            <div className="text-6xl animate-bounce">{playerWon ? '🏆🥇' : '🥈'}</div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-tajawal text-amber-400">
                {playerWon ? 'فوز ساحق بالمركز الأول!' : 'وصلت في المركز الثاني!'}
              </h3>
              <p className="text-xs text-slate-300">
                {playerWon
                  ? `قطعت خط النهاية في ${lapTime} ثانية بفضل سرعتك في حل أسئلة الامتحان!`
                  : `قدمت سباقاً رائعاً في ${lapTime} ثانية. أعد المحاولة لتخطي الذكاء الاصطناعي!`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={restartRace}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition hover:scale-105"
              >
                سباق جديد 🏎️
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
