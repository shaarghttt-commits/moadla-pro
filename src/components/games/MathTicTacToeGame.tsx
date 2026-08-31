'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Trophy,
  Users,
  Check,
  X,
  Swords,
  Copy,
  Share2,
  Send,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';

interface GridCell {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
  examTitle?: string;
  owner: 'X' | 'O' | null;
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6],           // Diagonals
];

export default function MathTicTacToeGame({
  roomCode: initialRoomCode,
  onExit,
}: {
  roomCode?: string;
  onExit: () => void;
}) {
  const { user } = useAuth();
  const { questions: examQuestions, loading, refetch } = useExamGameQuestions('all', 20);

  const [roomCode, setRoomCode] = useState<string | null>(initialRoomCode || null);
  const [isCopied, setIsCopied] = useState(false);
  const [board, setBoard] = useState<GridCell[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'X' | 'O'>('X');
  const [activeCellId, setActiveCellId] = useState<number | null>(null);
  const [winner, setWinner] = useState<'X' | 'O' | 'DRAW' | null>(null);
  const [player1Name, setPlayer1Name] = useState(user?.name || 'اللاعب 1 (X)');
  const [player2Name, setPlayer2Name] = useState('اللاعب 2 (O)');
  const [scores, setScores] = useState({ X: 0, O: 0 });

  useEffect(() => {
    if (examQuestions.length >= 9) {
      const initialCells: GridCell[] = examQuestions.slice(0, 9).map((q, idx) => ({
        id: idx,
        question: q.q,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
        examTitle: q.examTitle,
        owner: null,
      }));
      setBoard(initialCells);
    }
  }, [examQuestions]);

  const checkWinner = (currentBoard: GridCell[]) => {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (
        currentBoard[a] &&
        currentBoard[a].owner &&
        currentBoard[a].owner === currentBoard[b]?.owner &&
        currentBoard[a].owner === currentBoard[c]?.owner
      ) {
        return currentBoard[a].owner;
      }
    }
    if (currentBoard.length === 9 && currentBoard.every((cell) => cell.owner !== null)) {
      return 'DRAW';
    }
    return null;
  };

  const handleCellClick = (cell: GridCell) => {
    if (cell.owner !== null || winner !== null) return;
    setActiveCellId(cell.id);
  };

  const handleAnswerQuestion = (optionIdx: number) => {
    if (activeCellId === null) return;

    const cell = board[activeCellId];
    const isCorrect = optionIdx === cell.correct;

    if (isCorrect) {
      const updatedBoard = board.map((c) =>
        c.id === activeCellId ? { ...c, owner: currentTurn } : c
      );
      setBoard(updatedBoard);

      const winResult = checkWinner(updatedBoard);
      if (winResult) {
        setWinner(winResult);
        if (winResult === 'X' || winResult === 'O') {
          setScores((prev) => ({ ...prev, [winResult]: prev[winResult] + 1 }));
        }
      } else {
        setCurrentTurn((t) => (t === 'X' ? 'O' : 'X'));
      }
    } else {
      // Wrong answer -> Turn passes to the other player!
      alert(`إجابة خاطئة! ضاعت فرصتك في هذا المربع وانتقل الدور إلى ${currentTurn === 'X' ? player2Name : player1Name}`);
      setCurrentTurn((t) => (t === 'X' ? 'O' : 'X'));
    }

    setActiveCellId(null);
  };

  const resetGame = () => {
    refetch();
    setCurrentTurn('X');
    setActiveCellId(null);
    setWinner(null);
  };

  const copyLink = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/games?room=${roomCode}&game=tictactoe`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/games?room=${roomCode}&game=tictactoe`;
    const text = `دعاك ${user?.name || 'صديقك'} لتحدي تيك تاك تو المعادلات ❌⭕! اضغط هنا للانضمام للغرفة: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const activeQuestionCell = activeCellId !== null ? board[activeCellId] : null;

  if (loading || board.length < 9) {
    return (
      <div className="py-20 text-center space-y-4 font-tajawal">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
          جاري استيراد أسئلة الامتحانات الرسمية لشبكة X-O...
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-4xl mx-auto px-4 space-y-6 animate-fade-in font-tajawal">
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
              <span>تيك تاك تو المعادلات X-O ❌⭕</span>
            </h2>
            <p className="text-xs text-slate-400">
              اضغط على أي مربع وحل مسألة الامتحان للاستيلاء عليه وتحقيق صف ثلاثي!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetGame}
          className="px-4 py-2 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center gap-1.5 hover:bg-brand-100 transition border border-brand-200 dark:border-brand-800"
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
            <span className="font-mono font-black text-brand-600">{roomCode}</span>
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

      {/* Turn & Score Banner */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`p-4 rounded-3xl border transition-all text-center space-y-1 ${
            currentTurn === 'X' && !winner
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-md ring-2 ring-blue-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="text-2xl font-black text-blue-600">❌ {scores.X}</div>
          <div className="text-xs font-black text-slate-800 dark:text-slate-200">{player1Name}</div>
          {currentTurn === 'X' && !winner && (
            <span className="inline-block text-[10px] font-bold text-blue-600 animate-pulse">الدور الحالي 🎯</span>
          )}
        </div>

        <div
          className={`p-4 rounded-3xl border transition-all text-center space-y-1 ${
            currentTurn === 'O' && !winner
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 shadow-md ring-2 ring-rose-400'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="text-2xl font-black text-rose-600">⭕ {scores.O}</div>
          <div className="text-xs font-black text-slate-800 dark:text-slate-200">{player2Name}</div>
          {currentTurn === 'O' && !winner && (
            <span className="inline-block text-[10px] font-bold text-rose-600 animate-pulse">الدور الحالي 🎯</span>
          )}
        </div>
      </div>

      {/* 3x3 Interactive Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto aspect-square p-4 rounded-[36px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner">
        {board.map((cell) => (
          <button
            key={cell.id}
            type="button"
            onClick={() => handleCellClick(cell)}
            disabled={cell.owner !== null || winner !== null}
            className={`rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-3 text-center transition-all duration-200 relative overflow-hidden ${
              cell.owner === 'X'
                ? 'bg-blue-600 text-white shadow-md scale-95'
                : cell.owner === 'O'
                ? 'bg-rose-600 text-white shadow-md scale-95'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:scale-102 hover:shadow-lg'
            }`}
          >
            {cell.owner ? (
              <span className="text-4xl sm:text-6xl font-black animate-scale-up">
                {cell.owner === 'X' ? '✕' : '◯'}
              </span>
            ) : (
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-slate-400 block">#{cell.id + 1}</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-tight">
                  {cell.question}
                </span>
                <span className="text-[9px] text-brand-600 dark:text-brand-400 font-bold block pt-1">
                  اضغط للحل ⚡
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Question Solving Modal */}
      {activeQuestionCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 text-right space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                مربع رقم #{activeQuestionCell.id + 1} • دور ({currentTurn === 'X' ? player1Name : player2Name})
              </span>
              <button
                type="button"
                onClick={() => setActiveCellId(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                إلغاء ✕
              </button>
            </div>

            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-relaxed">
              {activeQuestionCell.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {activeQuestionCell.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerQuestion(idx)}
                  className="py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-800 dark:text-slate-100 text-xs font-bold transition text-right border border-slate-200 dark:border-slate-700"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[36px] p-8 text-center space-y-5 shadow-2xl animate-scale-up">
            <div className="text-5xl animate-bounce">
              {winner === 'DRAW' ? '🤝' : '🏆'}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {winner === 'DRAW'
                  ? 'تعادل حماسي بين البطلين!'
                  : `فوز كاسح للاعب ${winner === 'X' ? player1Name : player2Name} 🎉`}
              </h3>
              <p className="text-xs text-slate-400">
                {winner === 'DRAW' ? 'كلاكما يستحق التقدير!' : 'أداء هندسي ممتاز وسرعة بديهة فائقة!'}
              </p>
            </div>

            <button
              type="button"
              onClick={resetGame}
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md transition"
            >
              جولة جديدة 🔄
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
