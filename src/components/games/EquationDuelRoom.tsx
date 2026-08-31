'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Swords,
  Clock,
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Volume2,
  VolumeX,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

interface DuelQuestion {
  text: string;
  choices: string[];
  answerIndex: number;
  examTitle?: string;
}

interface DuelRoomProps {
  roomCode?: string;
  opponentId?: string | null;
  onExit: () => void;
}

export default function EquationDuelRoom({ roomCode, opponentId, onExit }: DuelRoomProps) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('all', 10);
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [mySelectedChoice, setMySelectedChoice] = useState<number | null>(null);
  const [opponentSelectedChoice, setOpponentSelectedChoice] = useState<number | null>(null);
  const [timer, setTimer] = useState(15);
  const [combo, setCombo] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [opponentName, setOpponentName] = useState('المنافس');
  const [opponentAvatar, setOpponentAvatar] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  useEffect(() => {
    if (examQuestions.length > 0) {
      const formatted: DuelQuestion[] = examQuestions.map((q) => ({
        text: q.q,
        choices: q.options,
        answerIndex: q.correct,
        examTitle: q.examTitle,
      }));
      setQuestions(formatted);
    }
    setOpponentName(opponentId ? 'زميلك المتحدي' : 'المنافس الذكي 🤖');
  }, [examQuestions, opponentId]);

  // Question countdown timer
  useEffect(() => {
    if (isFinished || isAnswerRevealed) return;

    if (timer <= 0) {
      handleTimeExpired();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isFinished, isAnswerRevealed]);

  const handleTimeExpired = () => {
    handleAnswerSubmit(-1); // Timed out
  };

  const handleAnswerSubmit = (choiceIdx: number) => {
    if (isAnswerRevealed || isFinished) return;

    setMySelectedChoice(choiceIdx);
    setIsAnswerRevealed(true);

    const currentQ = questions[currentIndex];
    const isCorrect = choiceIdx === currentQ.answerIndex;

    // Simulate opponent action with realistic delay & accuracy
    const opponentIsCorrect = Math.random() > 0.35;
    const oppChoice = opponentIsCorrect
      ? currentQ.answerIndex
      : (currentQ.answerIndex + 1) % currentQ.choices.length;
    setOpponentSelectedChoice(oppChoice);

    // Calculate score with speed bonus
    if (isCorrect) {
      const speedBonus = Math.max(10, timer * 5);
      const comboBonus = combo * 20;
      const totalGained = 100 + speedBonus + comboBonus;
      setMyScore((s) => s + totalGained);
      setCombo((c) => c + 1);
      setFeedbackText(`إجابة صحيحة وسريعة! +${totalGained} نقطة 🔥`);
    } else {
      setCombo(0);
      setFeedbackText(choiceIdx === -1 ? 'انتهى الوقت! ⏳' : 'إجابة خاطئة! ❌');
    }

    if (opponentIsCorrect) {
      setOpponentScore((s) => s + 100 + Math.floor(Math.random() * 30));
    }

    // Wait 2.5 seconds to show results then advance to next question
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setIsFinished(true);
        if (myScore >= opponentScore) {
          try {
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (e) {
            console.error(e);
          }
        }
        // Save score API
        fetch('/api/games/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameType: 'DUEL',
            score: myScore,
            pointsWon: myScore > opponentScore ? 50 : 20,
          }),
        }).catch(console.error);
      } else {
        setCurrentIndex((i) => i + 1);
        setTimer(15);
        setMySelectedChoice(null);
        setOpponentSelectedChoice(null);
        setIsAnswerRevealed(false);
        setFeedbackText(null);
      }
    }, 2400);
  };

  const restartGame = () => {
    refetch();
    setCurrentIndex(0);
    setMyScore(0);
    setOpponentScore(0);
    setMySelectedChoice(null);
    setOpponentSelectedChoice(null);
    setTimer(15);
    setCombo(0);
    setIsFinished(false);
    setIsAnswerRevealed(false);
    setFeedbackText(null);
  };

  const currentQ = questions[currentIndex];

  if (loading || questions.length === 0 || !currentQ) {
    return (
      <div className="py-20 text-center space-y-4 font-tajawal">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          جاري استيراد أسئلة الامتحانات الرسمية لمبارزة المعادلات...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn font-tajawal">
      {/* Top Duel Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>مغادرة المبارزة</span>
          </button>

          <div className="flex items-center gap-2 font-black text-sm text-brand-600 dark:text-brand-400 font-tajawal">
            <Swords className="w-5 h-5" />
            <span>ساحة مبارزة المعادلات (1v1)</span>
          </div>

          <div className="text-xs font-bold text-slate-400">
            السؤال {currentIndex + 1} من {questions.length}
          </div>
        </div>

        {/* Head-to-Head Live Scoreboard */}
        <div className="grid grid-cols-3 items-center pt-4 gap-4">
          {/* Player 1 (Me) */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-brand-500/30 ring-2 ring-brand-300 shrink-0">
              {user?.name?.charAt(0) || 'أ'}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {user?.name || 'أنت'}
              </div>
              <div className="text-xl font-black text-brand-600 dark:text-brand-400 font-tajawal">
                {myScore} <span className="text-[10px] font-normal text-slate-400">نقطة</span>
              </div>
            </div>
          </div>

          {/* Center Timer & VS */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-brand-500 font-black text-base text-slate-800 dark:text-slate-100 shadow-inner">
              {timer}s
            </div>
            {combo > 1 && (
              <div className="text-[10px] font-extrabold text-amber-500 mt-1 animate-bounce">
                🔥 كومبو x{combo}
              </div>
            )}
          </div>

          {/* Player 2 (Opponent) */}
          <div className="flex items-center justify-end gap-3 text-left">
            <div className="min-w-0 text-right">
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {opponentName}
              </div>
              <div className="text-xl font-black text-rose-600 dark:text-rose-400 font-tajawal">
                {opponentScore} <span className="text-[10px] font-normal text-slate-400">نقطة</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-rose-500/30 ring-2 ring-rose-300 shrink-0">
              {opponentName.charAt(0)}
            </div>
          </div>
        </div>

        {/* Real-time score bar comparison */}
        <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div
            className="bg-brand-500 transition-all duration-500"
            style={{ width: `${myScore + opponentScore === 0 ? 50 : (myScore / (myScore + opponentScore)) * 100}%` }}
          />
          <div
            className="bg-rose-500 transition-all duration-500"
            style={{ width: `${myScore + opponentScore === 0 ? 50 : (opponentScore / (myScore + opponentScore)) * 100}%` }}
          />
        </div>
      </div>

      {/* Duel Arena Card */}
      {!isFinished ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-soft space-y-6">
          {/* Question Text */}
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 text-xs font-bold border border-brand-200 dark:border-brand-800">
              سؤال السرعة والدقة 🎯
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-tajawal leading-relaxed">
              {currentQ.text}
            </h2>
          </div>

          {/* Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {currentQ.choices.map((choice, idx) => {
              const isSelectedByMe = mySelectedChoice === idx;
              const isCorrect = currentQ.answerIndex === idx;

              let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-800 dark:text-slate-100';

              if (isAnswerRevealed) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400 font-bold';
                } else if (isSelectedByMe) {
                  btnStyle = 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400';
                } else {
                  btnStyle = 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 opacity-40';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerSubmit(idx)}
                  disabled={isAnswerRevealed}
                  className={`p-5 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 text-sm font-semibold shadow-sm ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-black flex items-center justify-center">
                      {['أ', 'ب', 'ج', 'د'][idx]}
                    </span>
                    <span>{choice}</span>
                  </div>

                  {isAnswerRevealed && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isAnswerRevealed && isSelectedByMe && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Banner */}
          {feedbackText && (
            <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-bold text-center text-xs animate-fadeIn">
              {feedbackText}
            </div>
          )}
        </div>
      ) : (
        /* Victory / Game Over Screen */
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 shadow-soft text-center space-y-6 animate-scaleUp">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto text-4xl shadow-lg ring-4 ring-amber-200 dark:ring-amber-900">
            {myScore > opponentScore ? '🏆' : myScore === opponentScore ? '🤝' : '⚔️'}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">
              {myScore > opponentScore
                ? 'مبروك! لقد فزت بالمبارزة 👑'
                : myScore === opponentScore
                ? 'تعادل حماسي ومثير!'
                : 'مبارزة قوية! حظاً أفضل في الجولة القادمة'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {myScore > opponentScore
                ? `حصلت على +50 نقطة XP لتفوقك على ${opponentName}`
                : `حصلت على +20 نقطة XP لمشاركتك في التحدي`}
            </p>
          </div>

          {/* Final Score Cards */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950 border border-brand-200 text-center">
              <div className="text-xs font-bold text-brand-600">نقاطك</div>
              <div className="text-3xl font-black text-brand-700 dark:text-brand-300 font-tajawal mt-1">{myScore}</div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950 border border-rose-200 text-center">
              <div className="text-xs font-bold text-rose-600">{opponentName}</div>
              <div className="text-3xl font-black text-rose-700 dark:text-rose-300 font-tajawal mt-1">{opponentScore}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={restartGame}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-600/20 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>إعادة المبارزة</span>
            </button>
            <button
              type="button"
              onClick={onExit}
              className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition"
            >
              العودة للألعاب
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
