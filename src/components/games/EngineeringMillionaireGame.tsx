'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  HelpCircle,
  Users,
  Sparkles,
  RotateCcw,
  Check,
  X,
  ArrowLeft,
  Volume2,
  VolumeX,
  Crown,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

const PRIZE_LADDER = [
  { level: 1, prize: '100 XP', isCheckpoint: false },
  { level: 2, prize: '200 XP', isCheckpoint: false },
  { level: 3, prize: '300 XP', isCheckpoint: false },
  { level: 4, prize: '500 XP', isCheckpoint: false },
  { level: 5, prize: '1,000 XP 🛡️', isCheckpoint: true },
  { level: 6, prize: '2,000 XP', isCheckpoint: false },
  { level: 7, prize: '4,000 XP', isCheckpoint: false },
  { level: 8, prize: '8,000 XP', isCheckpoint: false },
  { level: 9, prize: '16,000 XP', isCheckpoint: false },
  { level: 10, prize: '32,000 XP 🛡️', isCheckpoint: true },
  { level: 11, prize: '64,000 XP', isCheckpoint: false },
  { level: 12, prize: '125,000 XP', isCheckpoint: false },
  { level: 13, prize: '250,000 XP', isCheckpoint: false },
  { level: 14, prize: '500,000 XP', isCheckpoint: false },
  { level: 15, prize: '1,000,000 XP 👑', isCheckpoint: true },
];

export default function EngineeringMillionaireGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('all', 15);
  const [currentLevel, setCurrentLevel] = useState(0); // 0-14
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Lifelines
  const [used5050, setUsed5050] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [usedAudience, setUsedAudience] = useState(false);
  const [audienceVotes, setAudienceVotes] = useState<number[] | null>(null);
  const [usedAI, setUsedAI] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);

  const currentQ = examQuestions[currentLevel] || examQuestions[0];

  const playTone = (freq: number, dur: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  };

  const handleSelectOption = (idx: number) => {
    if (isLocked || hiddenOptions.includes(idx)) return;

    setSelectedOption(idx);
    setIsLocked(true);
    playTone(440, 0.4);

    // Tension delay before showing answer
    setTimeout(() => {
      const isCorrect = idx === currentQ.correct;
      setIsAnswerCorrect(isCorrect);

      if (isCorrect) {
        playTone(880, 0.6);
        if (currentLevel === 14) {
          // WON 1 MILLION!
          setGameWon(true);
        } else {
          setTimeout(() => {
            setCurrentLevel((l) => l + 1);
            setSelectedOption(null);
            setIsLocked(false);
            setIsAnswerCorrect(null);
            setHiddenOptions([]);
            setAudienceVotes(null);
            setAiHint(null);
          }, 1800);
        }
      } else {
        playTone(220, 0.8);
        setTimeout(() => setGameOver(true), 1500);
      }
    }, 1500);
  };

  // 1. 50:50 Lifeline
  const handleUse5050 = () => {
    if (used5050 || isLocked) return;
    setUsed5050(true);
    playTone(600, 0.3);

    const wrongIndexes = [0, 1, 2, 3].filter((i) => i !== currentQ.correct);
    // Shuffle and pick 2 wrong options to hide
    const toHide = wrongIndexes.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptions(toHide);
  };

  // 2. Audience Poll Lifeline
  const handleUseAudience = () => {
    if (usedAudience || isLocked) return;
    setUsedAudience(true);
    playTone(700, 0.3);

    // Generate realistic audience percentage favoring the correct answer
    const votes = [10, 10, 10, 10];
    votes[currentQ.correct] += 50;
    const remaining = 20;
    votes[0] += Math.floor(Math.random() * remaining);
    setAudienceVotes(votes);
  };

  // 3. Ask AI Genius
  const handleUseAI = () => {
    if (usedAI || isLocked) return;
    setUsedAI(true);
    playTone(750, 0.3);

    const letters = ['أ', 'ب', 'ج', 'د'];
    setAiHint(
      `🤖 المعلم الذكي: قمت بتحليل معطيات المسألة، وأنا واثق بنسبة 95% أن الإجابة الصحيحة هي الخيار (${letters[currentQ.correct]})، تذكر تطبيق القانون الأساسي!`
    );
  };

  const restartGame = () => {
    refetch();
    setCurrentLevel(0);
    setSelectedOption(null);
    setIsLocked(false);
    setIsAnswerCorrect(null);
    setGameOver(false);
    setGameWon(false);
    setUsed5050(false);
    setHiddenOptions([]);
    setUsedAudience(false);
    setAudienceVotes(null);
    setUsedAI(false);
    setAiHint(null);
  };

  const letters = ['أ', 'ب', 'ج', 'د'];

  if (loading || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          جاري استيراد وتجهيز أسئلة الامتحانات الرسمية لمسابقة المليون...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-6xl mx-auto px-4 space-y-6 animate-fade-in select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج من اللعبة</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs border border-amber-500/40">
            السؤال رقم {currentLevel + 1} من 15 💰
          </div>
        </div>
      </div>

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Stage (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Lifelines Bar */}
          <div className="glass-card rounded-[28px] p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-around gap-2">
            <button
              onClick={handleUse5050}
              disabled={used5050 || isLocked}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
                used5050
                  ? 'opacity-30 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:scale-105'
              }`}
            >
              <span>50:50</span>
              <span className="text-[10px] hidden sm:inline">حذف إجابتين</span>
            </button>

            <button
              onClick={handleUseAudience}
              disabled={usedAudience || isLocked}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
                usedAudience
                  ? 'opacity-30 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md hover:scale-105'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">رأي الجمهور</span>
            </button>

            <button
              onClick={handleUseAI}
              disabled={usedAI || isLocked}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
                usedAI
                  ? 'opacity-30 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md hover:scale-105'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[10px] hidden sm:inline">المعلم الذكي AI</span>
            </button>
          </div>

          {/* AI Hint Box if used */}
          {aiHint && (
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-bold animate-scale-up">
              {aiHint}
            </div>
          )}

          {/* Audience Poll Graph if used */}
          {audienceVotes && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-2 animate-scale-up">
              <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                نتائج تصويت جمهور طلاب المنصة:
              </p>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-black">
                {audienceVotes.map((pct, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-end overflow-hidden p-1">
                      <div
                        className="w-full bg-emerald-500 rounded-lg transition-all duration-500"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      ({letters[idx]}) {pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Millionaire Question Card */}
          <div className="relative rounded-[36px] p-6 sm:p-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-2 border-amber-500/40 shadow-2xl text-center space-y-8 overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-black">
              <span>جائزة السؤال: {PRIZE_LADDER[currentLevel].prize}</span>
            </div>

            <h2 className="text-lg sm:text-2xl font-black text-white font-tajawal leading-relaxed min-h-[70px] flex items-center justify-center">
              {currentQ.q}
            </h2>

            {/* 4 Hexagonal/Rounded Millionaire Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {currentQ.options.map((opt, idx) => {
                const isHidden = hiddenOptions.includes(idx);
                const isSelected = selectedOption === idx;
                const isCorrect = isAnswerCorrect !== null && idx === currentQ.correct;
                const isWrong = isAnswerCorrect === false && isSelected;

                if (isHidden) {
                  return <div key={idx} className="h-14 rounded-2xl opacity-0" />;
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isLocked}
                    className={`py-4 px-5 rounded-2xl text-xs sm:text-sm font-black text-right transition-all duration-200 border-2 flex items-center justify-between ${
                      isCorrect
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40 animate-pulse'
                        : isWrong
                        ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/40'
                        : isSelected
                        ? 'bg-amber-500 border-amber-300 text-slate-950 shadow-lg shadow-amber-500/50 scale-102'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-white border-amber-500/30 hover:border-amber-400 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {letters[idx]}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prize Ladder (4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-[32px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider text-center pb-2 border-b border-slate-100 dark:border-slate-800">
            سلم الجوائز والنقاط 🏆
          </h3>

          <div className="space-y-1">
            {[...PRIZE_LADDER].reverse().map((step, idx) => {
              const actualLevel = 14 - idx;
              const isCurrent = actualLevel === currentLevel;
              const isPassed = actualLevel < currentLevel;

              return (
                <div
                  key={step.level}
                  className={`flex items-center justify-between py-1.5 px-3 rounded-xl font-mono text-xs font-black transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 shadow-md scale-105 font-black'
                      : isPassed
                      ? 'text-emerald-500 opacity-60'
                      : step.isCheckpoint
                      ? 'text-amber-400 font-bold bg-amber-500/10'
                      : 'text-slate-400'
                  }`}
                >
                  <span className="text-[11px]">{step.level}</span>
                  <span>{step.prize}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Over / Won Modals */}
      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-[36px] p-8 text-center text-white space-y-6 shadow-2xl animate-scale-up">
            <div className="text-6xl animate-bounce">{gameWon ? '👑' : '👏'}</div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-tajawal text-amber-400">
                {gameWon ? 'مبروك! ربحت المليون نقطة! 🎉' : 'انتهت اللعبة!'}
              </h3>
              <p className="text-xs text-slate-300">
                {gameWon
                  ? 'أنت رسمياً أسطورة وعبقري معادلة الهندسة 2025!'
                  : `وصلت للسؤال رقم ${currentLevel + 1} وحققت ${
                      currentLevel >= 10 ? '32,000 XP (محطة الأمان)' : currentLevel >= 5 ? '1,000 XP (محطة الأمان)' : '0 XP'
                    }`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={restartGame}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition hover:scale-105"
              >
                لعب مرة أخرى 🔄
              </button>
              <button
                type="button"
                onClick={onExit}
                className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                العودة لساحة الألعاب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
