'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Clock,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowLeft,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

interface CardItem {
  id: number;
  pairId: number;
  text: string;
  isFormula: boolean;
  flipped: boolean;
  matched: boolean;
}

const formulaPairs = [
  { id: 1, name: 'قانون نيوتن الثاني', formula: 'F = m · a' },
  { id: 2, name: 'قانون أوم الكهربي', formula: 'V = I · R' },
  { id: 3, name: 'مشتقة sin(x)', formula: 'cos(x)' },
  { id: 4, name: 'تكامل eˣ بالنسبة لـ x', formula: 'eˣ + C' },
  { id: 5, name: 'طاقة الحركة (KE)', formula: '½ m v²' },
  { id: 6, name: 'نظرية فيثاغورس', formula: 'a² + b² = c²' },
  { id: 7, name: 'مساحة الدائرة', formula: 'π · r²' },
  { id: 8, name: 'تسارع الجاذبية الأرضية', formula: 'g ≈ 9.8 m/s²' },
];

export default function MemoryMatchGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [gameMode, setGameMode] = useState<'solo' | 'duo'>('solo');
  const [turn, setTurn] = useState<1 | 2>(1);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  const initGame = () => {
    const rawCards: CardItem[] = [];
    let idx = 0;
    formulaPairs.forEach((pair) => {
      rawCards.push({
        id: idx++,
        pairId: pair.id,
        text: pair.name,
        isFormula: false,
        flipped: false,
        matched: false,
      });
      rawCards.push({
        id: idx++,
        pairId: pair.id,
        text: pair.formula,
        isFormula: true,
        flipped: false,
        matched: false,
      });
    });

    // Shuffle cards
    const shuffled = [...rawCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedCards([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setIsPlaying(true);
    setIsWon(false);
    setTurn(1);
    setP1Score(0);
    setP2Score(0);
  };

  useEffect(() => {
    initGame();
  }, [gameMode]);

  // Timer
  useEffect(() => {
    if (!isPlaying || isWon) return;
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isWon]);

  const handleCardClick = (cardIndex: number) => {
    if (
      selectedCards.length === 2 ||
      cards[cardIndex].flipped ||
      cards[cardIndex].matched ||
      isWon
    ) {
      return;
    }

    const newCards = [...cards];
    newCards[cardIndex].flipped = true;
    setCards(newCards);

    const newSelected = [...selectedCards, cardIndex];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newSelected;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Matched!
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx].matched = true;
            updated[secondIdx].matched = true;
            return updated;
          });
          setSelectedCards([]);
          setMatches((m) => {
            const newM = m + 1;
            if (newM === formulaPairs.length) {
              handleWin();
            }
            return newM;
          });

          if (gameMode === 'duo') {
            if (turn === 1) setP1Score((s) => s + 1);
            else setP2Score((s) => s + 1);
          }
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx].flipped = false;
            updated[secondIdx].flipped = false;
            return updated;
          });
          setSelectedCards([]);
          if (gameMode === 'duo') {
            setTurn((t) => (t === 1 ? 2 : 1));
          }
        }, 1100);
      }
    }
  };

  const handleWin = () => {
    setIsWon(true);
    setIsPlaying(false);
    try {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } catch (e) {
      console.error(e);
    }

    // Award XP
    fetch('/api/games/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gameType: 'MEMORY',
        score: Math.max(10, 200 - moves * 5),
        pointsWon: 35,
      }),
    }).catch(console.error);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>خروج</span>
          </button>

          <div className="flex items-center gap-2 font-black text-sm text-purple-600 dark:text-purple-400 font-tajawal">
            <Brain className="w-5 h-5" />
            <span>لعبة الذاكرة والمطابقة العلمية</span>
          </div>

          <button
            type="button"
            onClick={initGame}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 transition"
            title="إعادة توزيع البطاقات"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-around pt-4 text-center">
          <div>
            <div className="text-xs text-slate-400 font-bold">الوقت المستغرق</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-brand-500" />
              <span>{formatTime(timer)}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-bold">الحركات</div>
            <div className="text-xl font-black text-slate-900 dark:text-white font-tajawal">
              {moves}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-bold">التطابقات المكتملة</div>
            <div className="text-xl font-black text-emerald-600 font-tajawal">
              {matches} / {formulaPairs.length}
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, idx) => {
            const isFlipped = card.flipped || card.matched;

            return (
              <div
                key={card.id}
                onClick={() => handleCardClick(idx)}
                className={`aspect-[4/3] sm:aspect-square rounded-2xl cursor-pointer select-none transition-all duration-300 flex items-center justify-center p-3 text-center ${
                  card.matched
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-400/40 shadow-sm'
                    : isFlipped
                    ? 'bg-brand-50 dark:bg-brand-950/80 border-2 border-brand-500 text-brand-700 dark:text-brand-300 shadow-md scale-95'
                    : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-brand-600 text-white shadow hover:scale-105'
                }`}
              >
                {isFlipped ? (
                  <div className="space-y-1 animate-fadeIn">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {card.isFormula ? 'القانون' : 'المفهوم'}
                    </span>
                    <span className={`font-black font-tajawal text-xs sm:text-sm ${card.isFormula ? 'font-mono text-base' : ''}`}>
                      {card.text}
                    </span>
                  </div>
                ) : (
                  <div className="text-2xl opacity-80">⚛️</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Win Modal */}
        {isWon && (
          <div className="mt-8 p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 animate-scaleUp">
            <div className="text-4xl">🎉</div>
            <h3 className="text-xl font-black text-emerald-800 dark:text-emerald-200 font-tajawal">
              أحسنت صنعاً! أتممت مطابقة جميع القوانين
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-300">
              في زمن قدره {formatTime(timer)} وخلال {moves} حركة فقط. تم إضافة +35 نقطة XP لحسابك!
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={initGame}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow"
              >
                لعب مرة أخرى
              </button>
              <button
                type="button"
                onClick={onExit}
                className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition"
              >
                العودة لساحة الألعاب
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
