'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  RotateCcw,
  Flame,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useExamGameQuestions, GameExamQuestion } from '@/hooks/useExamGameQuestions';

export default function SpeedMathGame({ onExit }: { onExit: () => void }) {
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('all', 50);

  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentQ = examQuestions[questionIdx % Math.max(1, examQuestions.length)];

  const startGame = () => {
    refetch();
    setTimeLeft(60);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setQuestionIdx(0);
    setIsActive(true);
    setIsGameOver(false);
  };

  useEffect(() => {
    if (!loading && examQuestions.length > 0) {
      setIsActive(true);
    }
  }, [loading, examQuestions]);

  // Timer
  useEffect(() => {
    if (!isActive || isGameOver) return;

    if (timeLeft <= 0) {
      handleGameOver();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isGameOver, timeLeft]);

  const handleGameOver = () => {
    setIsGameOver(true);
    setIsActive(false);

    if (score >= 300) {
      try {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        console.error(e);
      }
    }

    // Save score
    fetch('/api/games/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameType: 'SPEED_MATH',
        score,
        pointsWon: Math.min(60, Math.floor(score / 15)),
      }),
    }).catch(console.error);
  };

  const handleChoiceClick = (choiceIdx: number) => {
    if (!currentQ || isGameOver) return;

    if (choiceIdx === currentQ.correct) {
      const comboMultiplier = combo >= 5 ? 3 : combo >= 2 ? 2 : 1;
      const pointsGained = 20 * comboMultiplier;
      setScore((s) => s + pointsGained);
      setCombo((c) => {
        const next = c + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setFeedback('correct');
    } else {
      setCombo(0);
      setScore((s) => Math.max(0, s - 5));
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setQuestionIdx((i) => i + 1);
    }, 250);
  };

  if (loading || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4 font-tajawal">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          جاري استيراد أسئلة الامتحانات لتحدي السرعة القياسي...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto px-4 space-y-6 animate-fade-in select-none font-tajawal">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black">
            <Flame className="w-4 h-4" />
            <span>كومبو: {combo}x</span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-black border transition-all ${
              timeLeft <= 10
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Main Playing Field */}
      {!isGameOver ? (
        <div className="glass-card rounded-[36px] p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-soft text-center space-y-8 relative overflow-hidden">
          {/* Feedback Splash Overlay */}
          {feedback === 'correct' && (
            <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex items-center justify-center animate-fade-in">
              <CheckCircle2 className="w-24 h-24 text-emerald-500/40" />
            </div>
          )}
          {feedback === 'wrong' && (
            <div className="absolute inset-0 bg-rose-500/10 pointer-events-none flex items-center justify-center animate-fade-in">
              <XCircle className="w-24 h-24 text-rose-500/40" />
            </div>
          )}

          {/* Current Score Display */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold tracking-wider">النقاط الحالية</span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-brand-600 dark:text-brand-400">
              {score}
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
              {currentQ.examTitle}
            </span>
          </div>

          {/* Question Box */}
          <div className="py-6 px-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
              {currentQ.q}
            </h2>
          </div>

          {/* Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {currentQ.options.map((choice: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChoiceClick(idx)}
                className="py-4 px-6 rounded-2xl bg-white dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-800 dark:text-slate-100 font-black text-sm sm:text-base border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-150 hover:scale-102 active:scale-95 text-right"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Game Over Summary Card */
        <div className="glass-card rounded-[36px] p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-soft text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-4xl shadow-inner">
            🏆
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              انتهى الوقت! أحسنت ⚡
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              أظهرت سرعة فائقة في حل مسائل الامتحانات
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold">النقاط الإجمالية</span>
              <span className="text-2xl font-black text-brand-600 font-mono">{score}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold">أعلى كومبو</span>
              <span className="text-2xl font-black text-amber-500 font-mono">{maxCombo}x</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={startGame}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md transition hover:scale-105"
            >
              <RotateCcw className="w-4 h-4 inline-block ml-1" />
              <span>العب مرة أخرى</span>
            </button>
            <button
              type="button"
              onClick={onExit}
              className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              الخروج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
