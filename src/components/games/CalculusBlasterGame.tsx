'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Sparkles,
  RotateCcw,
  Trophy,
  ArrowLeft,
  Flame,
  Gauge,
  Target,
  Shield,
  Award,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

const BOSS_NAMES = [
  'وحش الاشتقاق الأسي 👾',
  'تنين التكامل المحدد 🐉',
  'غول سلوك الدوال ونقاط الانقلاب 👹',
  'زعيم المساحات والحجوم الدورانية 👑',
  'عملاق النهايات وقاعدة لوبيتال ⚡',
];

export default function CalculusBlasterGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('calculus', 25);
  const [missionIdx, setMissionIdx] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [laserFired, setLaserFired] = useState(false);
  const [bossHit, setBossHit] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  const currentQ = examQuestions[missionIdx % Math.max(1, examQuestions.length)];
  const targetName = BOSS_NAMES[missionIdx % BOSS_NAMES.length];

  const playSynthLaser = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  const handleShoot = (idx: number) => {
    if (gameOver || gameWon || !currentQ) return;

    if (idx === currentQ.correct) {
      playSynthLaser();
      setLaserFired(true);
      setBossHit(true);

      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 100 * newCombo;
      setScore((s) => s + points);

      setTimeout(() => {
        setLaserFired(false);
        setBossHit(false);

        const newHp = Math.max(0, bossHp - 35);
        setBossHp(newHp);

        if (newHp <= 0) {
          if (missionIdx >= examQuestions.length - 1 || missionIdx >= 10) {
            setGameWon(true);
          } else {
            setMissionIdx((i) => i + 1);
            setBossHp(100);
          }
        }
      }, 500);
    } else {
      setCombo(0);
      setPlayerHit(true);
      setTimeout(() => setPlayerHit(false), 400);

      const newPlayerHp = Math.max(0, playerHp - 25);
      setPlayerHp(newPlayerHp);
      if (newPlayerHp <= 0) {
        setGameOver(true);
      }
    }
  };

  const restartGame = () => {
    refetch();
    setMissionIdx(0);
    setBossHp(100);
    setPlayerHp(100);
    setScore(0);
    setCombo(0);
    setGameOver(false);
    setGameWon(false);
  };

  if (loading || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-cyan-300">
          جاري استيراد أسئلة امتحان التفاضل والتكامل الرسمي لمدفع الليزر...
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-5xl mx-auto px-4 space-y-6 animate-fade-in select-none text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-400 font-black text-xs border border-cyan-400/40 flex items-center gap-1 shadow-lg shadow-cyan-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>صائد أسئلة التفاضل والتكامل 📐⚡</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-400 font-mono text-xs font-black">
            {score} XP
          </div>
        </div>
      </div>

      {/* Cyber Battle Arena */}
      <div
        className={`relative rounded-[36px] p-6 sm:p-10 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-white space-y-8 overflow-hidden transition-all duration-300 ${
          playerHit ? 'ring-4 ring-rose-500 animate-shake' : ''
        }`}
      >
        {/* Ambient Grid Glow Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Health Bars Row */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 relative z-10">
          {/* Player HP */}
          <div className="space-y-1.5 text-right">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-cyan-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>مركبتك النفاثة 🚀</span>
              </span>
              <span className="font-mono text-cyan-300">{playerHp} / 100 HP</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/40 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300 shadow-md shadow-cyan-500/50"
                style={{ width: `${playerHp}%` }}
              />
            </div>
          </div>

          {/* Boss HP */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="font-mono text-rose-400">{bossHp} HP</span>
              <span className="text-rose-400 font-bold">{targetName}</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-rose-500/40 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-300 shadow-md shadow-rose-500/50"
                style={{ width: `${bossHp}%` }}
              />
            </div>
          </div>
        </div>

        {/* Boss Visual Monster in Center */}
        <div className="relative py-6 z-10 flex flex-col items-center justify-center">
          <div
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-rose-600/30 via-purple-600/20 to-cyan-600/30 border-2 border-cyan-400/60 backdrop-blur-xl flex items-center justify-center text-6xl sm:text-7xl shadow-[0_0_40px_rgba(244,63,94,0.3)] transition-all duration-300 ${
              bossHit ? 'scale-90 opacity-80 brightness-200' : 'animate-bounce'
            }`}
          >
            {missionIdx % 4 === 0 ? '👾' : missionIdx % 4 === 1 ? '🐉' : missionIdx % 4 === 2 ? '👹' : '👑'}
          </div>

          {/* Laser Particle Beam Effect */}
          {laserFired && (
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-cyan-400 shadow-[0_0_25px_#22d3ee] animate-pulse z-20" />
          )}

          {combo >= 2 && (
            <div className="mt-3 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-black animate-pulse">
              ⚡ ضربة خارقة {combo}x كومبو متتالي!
            </div>
          )}
        </div>

        {/* Question Panel */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/40 space-y-4 shadow-xl relative z-10">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-black">
            <span>سؤال من امتحانات التفاضل والتكامل الرسمية</span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/20">{currentQ.examTitle}</span>
          </div>

          <h3 className="text-base sm:text-lg font-black font-tajawal text-cyan-100 leading-relaxed">
            {currentQ.q}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleShoot(idx)}
                className="py-3.5 px-4 rounded-2xl bg-slate-800/90 hover:bg-cyan-600 hover:text-white border border-cyan-500/30 hover:border-cyan-400 text-slate-100 font-black text-xs sm:text-sm transition-all duration-200 hover:scale-102 active:scale-95 shadow-md text-right"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Won / Game Over Modal */}
      {(gameOver || gameWon) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-cyan-400 rounded-[36px] p-8 text-center text-white space-y-6 shadow-2xl animate-scale-up">
            <div className="text-6xl animate-bounce">{gameWon ? '👑' : '💥'}</div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-tajawal text-cyan-400">
                {gameWon ? 'انتصار أسطوري في التفاضل! 🎉' : 'تدمرت مركبتك!'}
              </h3>
              <p className="text-xs text-slate-300">
                {gameWon
                  ? `هزمت جميع وحوش وزعماء التفاضل والتكامل وحققت ${score} XP!`
                  : `قاتلت ببسالة وجمعت ${score} XP. تدرب على قوانين الاشتقاق والتكامل وأعد المحاولة!`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={restartGame}
                className="px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs shadow-lg transition hover:scale-105"
              >
                محاولة جديدة 🔄
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
