'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import {
  Menu,
  RotateCcw,
  Undo2,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Eye,
  Crown,
  Sparkles,
  Users,
  Bot,
  UserPlus,
  ArrowLeft,
  X,
  Play,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useExamGameQuestions } from '@/hooks/useExamGameQuestions';
import { Chess3dPieceSvg } from './chess/Chess3dPiecesSvg';

// Standard Chess Piece Values
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

// Piece-Square Tables for AI Positional Evaluation
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [-5,  0,  5,  5,  5,  5,  0, -5],
  [0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 20,  0,  0,  0,  0, 20, 20],
  [20, 30, 10,  0,  0, 10, 30, 20]
];

interface ChessMasterGameProps {
  roomCode?: string;
  opponentId?: string | null;
  onExit: () => void;
}

export default function ChessMasterGame({
  roomCode: initialRoomCode,
  opponentId,
  onExit,
}: ChessMasterGameProps) {
  const { user } = useAuth();
  const { questions: examQuestions } = useExamGameQuestions('all', 15);

  // Initialize Chess.js Instance
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(() => chess.fen());
  const [, setRenderTrigger] = useState(0);

  // Game Modes: 'ai' | 'local' | 'invite'
  const [gameMode, setGameMode] = useState<'ai' | 'local' | 'invite'>(initialRoomCode ? 'invite' : 'ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('hard');
  const [is3DView, setIs3DView] = useState(true);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Online Multiplayer State
  const [roomCode, setRoomCode] = useState<string | null>(initialRoomCode || null);
  const [isCopied, setIsCopied] = useState(false);
  const [onlineOpponent, setOnlineOpponent] = useState<any>(null);
  const [myColor, setMyColor] = useState<Color>('w');

  // UI Selection & Visual States
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Captured pieces
  const [capturedWhite, setCapturedWhite] = useState<PieceSymbol[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceSymbol[]>([]);

  // Timers
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes
  const [blackTime, setBlackTime] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  // Tactical Quiz Bonus
  const [tacticalBonusQ, setTacticalBonusQ] = useState<any>(null);
  const [bonusXP, setBonusXP] = useState(0);

  // Audio Synthesizer
  const playSound = (type: 'move' | 'capture' | 'check' | 'castle' | 'win') => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'move') {
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === 'capture') {
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      } else if (type === 'check') {
        osc.frequency.setValueAtTime(780, ctx.currentTime);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'castle') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(420, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.frequency.value = f;
          g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.09);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.25);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(ctx.currentTime + i * 0.09);
          o.stop(ctx.currentTime + i * 0.09 + 0.25);
        });
        return;
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch {}
  };

  // Re-calculate captured pieces from current board state
  const updateCapturedPieces = useCallback(() => {
    const counts: Record<Color, Record<PieceSymbol, number>> = {
      w: { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 },
      b: { p: 8, r: 2, n: 2, b: 2, q: 1, k: 1 },
    };

    chess.board().forEach((row) => {
      row.forEach((piece) => {
        if (piece) {
          counts[piece.color][piece.type]--;
        }
      });
    });

    const capWhite: PieceSymbol[] = [];
    const capBlack: PieceSymbol[] = [];

    (['q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).forEach((t) => {
      for (let i = 0; i < counts.b[t]; i++) capWhite.push(t);
      for (let i = 0; i < counts.w[t]; i++) capBlack.push(t);
    });

    setCapturedWhite(capWhite);
    setCapturedBlack(capBlack);
  }, [chess]);

  // Timers countdown
  useEffect(() => {
    let interval: any = null;
    if (timerActive && !chess.isGameOver()) {
      interval = setInterval(() => {
        if (chess.turn() === 'w') {
          setWhiteTime((t) => Math.max(0, t - 1));
        } else {
          setBlackTime((t) => Math.max(0, t - 1));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, chess]);

  // Online Room Polling / Synchronization
  useEffect(() => {
    if (gameMode !== 'invite' || !roomCode) return;

    const pollRoom = async () => {
      try {
        const res = await fetch(`/api/games/rooms/${roomCode}`);
        if (!res.ok) return;
        const data = await res.json();
        const rm = data.room;

        if (rm) {
          if (rm.creatorId === user?.id) {
            setMyColor('w');
            setOnlineOpponent(rm.opponent);
          } else {
            setMyColor('b');
            setOnlineOpponent(rm.creator);
          }

          if (rm.gameState && rm.gameState.fen && rm.gameState.fen !== chess.fen()) {
            chess.load(rm.gameState.fen);
            setLastMove(rm.gameState.lastMove || null);
            setFen(chess.fen());
            updateCapturedPieces();
            setRenderTrigger((v) => v + 1);
          }
        }
      } catch (err) {
        console.error('Chess room poll error:', err);
      }
    };

    pollRoom();
    const interval = setInterval(pollRoom, 1800);
    return () => clearInterval(interval);
  }, [gameMode, roomCode, user?.id, chess, updateCapturedPieces]);

  // AI Move Engine (Minimax with Positional Evaluation)
  const evaluatePosition = (game: Chess): number => {
    let score = 0;
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        let pieceVal = PIECE_VALUES[piece.type] * 100;
        let posVal = 0;

        const tableRow = piece.color === 'w' ? 7 - r : r;
        if (piece.type === 'p') posVal = PAWN_TABLE[tableRow][c];
        else if (piece.type === 'n') posVal = KNIGHT_TABLE[tableRow][c];
        else if (piece.type === 'b') posVal = BISHOP_TABLE[tableRow][c];
        else if (piece.type === 'r') posVal = ROOK_TABLE[tableRow][c];
        else if (piece.type === 'q') posVal = QUEEN_TABLE[tableRow][c];
        else if (piece.type === 'k') posVal = KING_TABLE[tableRow][c];

        const total = pieceVal + posVal;
        if (piece.color === 'b') score += total;
        else score -= total;
      }
    }

    return score;
  };

  const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
    if (depth === 0 || game.isGameOver()) {
      return evaluatePosition(game);
    }

    const moves = game.moves({ verbose: true });

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const m of moves) {
        game.move(m);
        const evalScore = minimax(game, depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const m of moves) {
        game.move(m);
        const evalScore = minimax(game, depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  // AI Move Runner
  const triggerAiTurn = useCallback(() => {
    if (chess.isGameOver() || chess.turn() !== 'b') return;

    setIsAiThinking(true);

    setTimeout(() => {
      try {
        const moves = chess.moves({ verbose: true });
        if (moves.length === 0) {
          setIsAiThinking(false);
          return;
        }

        let bestMove = moves[0];

        if (aiDifficulty === 'easy') {
          const captures = moves.filter((m) => m.captured);
          bestMove = captures.length > 0 ? captures[Math.floor(Math.random() * captures.length)] : moves[Math.floor(Math.random() * moves.length)];
        } else {
          const searchDepth = aiDifficulty === 'hard' ? 2 : 1;
          let maxScore = -Infinity;

          for (const m of moves) {
            chess.move(m);
            const score = minimax(chess, searchDepth - 1, -Infinity, Infinity, false);
            chess.undo();

            if (score > maxScore) {
              maxScore = score;
              bestMove = m;
            }
          }
        }

        executeChessMove(bestMove.from, bestMove.to, bestMove.promotion);
      } catch (err) {
        console.error('AI Move Error:', err);
      } finally {
        setIsAiThinking(false);
      }
    }, 450);
  }, [chess, aiDifficulty]);

  // Execute Move
  const executeChessMove = (from: Square, to: Square, promotionPiece: PieceSymbol = 'q') => {
    try {
      const move = chess.move({
        from,
        to,
        promotion: promotionPiece,
      });

      if (move) {
        if (!timerActive) setTimerActive(true);

        if (move.flags.includes('k') || move.flags.includes('q')) {
          playSound('castle');
        } else if (move.captured) {
          playSound('capture');
          if (['q', 'r', 'b', 'n'].includes(move.captured) && examQuestions.length > 0) {
            const randomQ = examQuestions[Math.floor(Math.random() * examQuestions.length)];
            setTacticalBonusQ(randomQ);
          }
        } else {
          playSound('move');
        }

        if (chess.inCheck()) {
          playSound('check');
        }

        if (chess.isGameOver()) {
          playSound('win');
        }

        const newFen = chess.fen();
        setFen(newFen);
        setLastMove({ from, to });
        setSelectedSquare(null);
        setValidMoves([]);
        setPendingPromotion(null);
        updateCapturedPieces();
        setRenderTrigger((v) => v + 1);

        // If in AI mode and it's Black's turn, trigger AI move!
        if (gameMode === 'ai' && chess.turn() === 'b' && !chess.isGameOver()) {
          triggerAiTurn();
        }

        // Sync with online room if invite mode
        if (gameMode === 'invite' && roomCode) {
          fetch(`/api/games/rooms/${roomCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'update_state',
              gameState: {
                fen: newFen,
                lastMove: { from, to },
                history: chess.history(),
              },
            }),
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error('Invalid move attempt:', err);
    }
  };

  // Handle Square Click
  const handleSquareClick = (square: Square) => {
    if (chess.isGameOver() || pendingPromotion || isAiThinking) return;

    // Check player's turn in online mode
    if (gameMode === 'invite' && chess.turn() !== myColor) {
      return;
    }

    // Check player's turn in AI mode (human is White)
    if (gameMode === 'ai' && chess.turn() !== 'w') {
      return;
    }

    // If destination square matches one of valid moves
    const move = validMoves.find((m) => m.to === square);
    if (selectedSquare && move) {
      if (move.flags.includes('p')) {
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }
      executeChessMove(selectedSquare, square);
      return;
    }

    // Otherwise select a piece belonging to current turn
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setValidMoves(moves);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // Reset Game
  const resetGame = () => {
    chess.reset();
    setFen(chess.fen());
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setPendingPromotion(null);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setWhiteTime(600);
    setBlackTime(600);
    setTimerActive(false);
    setIsAiThinking(false);
    setTacticalBonusQ(null);
    setRenderTrigger((v) => v + 1);
  };

  const undoMove = () => {
    if (gameMode === 'invite' || isAiThinking) return;
    chess.undo();
    if (gameMode === 'ai') chess.undo(); // Undo AI move as well
    setFen(chess.fen());
    setSelectedSquare(null);
    setValidMoves([]);
    updateCapturedPieces();
    setRenderTrigger((v) => v + 1);
  };

  // Online Room Creation & Link
  const handleCreateInviteRoom = async () => {
    try {
      const res = await fetch('/api/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: 'CHESS',
          opponentId,
          initialData: { fen: chess.fen() },
        }),
      });
      const data = await res.json();
      if (res.ok && data.room) {
        setRoomCode(data.room.code);
        setGameMode('invite');
      }
    } catch (e) {
      console.error('Error creating chess room:', e);
    }
  };

  const copyInviteLink = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/games?room=${roomCode}&game=chess`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/games?room=${roomCode}&game=chess`;
    const text = `دعاك ${user?.name || 'صديقك'} لمبارزة شطرنج 3D واقعية ♟️👑 على منصة معادلة برو! اضغط هنا للانضمام للرقعة: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Build flattened 64-square list
  const baseFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const baseRanks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = isFlipped ? [...baseFiles].reverse() : baseFiles;
  const displayRanks = isFlipped ? [...baseRanks].reverse() : baseRanks;

  const squaresGrid: {
    square: Square;
    rank: string;
    file: string;
    isLight: boolean;
    showFileLabel: boolean;
    showRankLabel: boolean;
  }[] = [];

  displayRanks.forEach((rank, rIdx) => {
    displayFiles.forEach((file, fIdx) => {
      const square = `${file}${rank}` as Square;
      const fileNum = baseFiles.indexOf(file);
      const rankNum = parseInt(rank, 10) - 1;
      const isLight = (fileNum + rankNum) % 2 !== 0;

      squaresGrid.push({
        square,
        rank,
        file,
        isLight,
        showRankLabel: fIdx === 0,
        showFileLabel: rIdx === 7,
      });
    });
  });

  // King In Check Detection
  const inCheck = chess.inCheck();
  let checkedKingSquare: Square | null = null;
  if (inCheck) {
    const turnColor = chess.turn();
    chess.board().forEach((rList, rIdx) => {
      rList.forEach((p, cIdx) => {
        if (p && p.type === 'k' && p.color === turnColor) {
          const colChar = baseFiles[cIdx];
          const rankNum = 8 - rIdx;
          checkedKingSquare = `${colChar}${rankNum}` as Square;
        }
      });
    });
  }

  // Current Move Number for 3D Bevel Plate
  const moveNumber = Math.floor(chess.history().length / 2) + 1;
  const turnLabel = isAiThinking
    ? 'AI is thinking...'
    : chess.turn() === 'w'
    ? "White's move"
    : "Black's move";
  const difficultyTitle = aiDifficulty === 'hard' ? 'GRAND MASTER' : aiDifficulty === 'medium' ? 'INTERMEDIATE' : 'CASUAL';

  return (
    <div
      className="relative min-h-[90vh] w-full rounded-[40px] overflow-hidden p-4 sm:p-8 flex flex-col items-center justify-between font-tajawal select-none shadow-2xl border-4 border-[#3a2010]"
      style={{
        backgroundImage: "url('/images/chess_wooden_table_bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Dark Overlay */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[0.5px] pointer-events-none" />

      {/* Top Floating Control Bar */}
      <div className="relative z-30 w-full max-w-4xl flex items-center justify-between gap-4">
        {/* Menu Button (Top Left) */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="w-12 h-12 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95"
          title="القائمة والإعدادات"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        {/* Top Player Info (Black/AI) */}
        <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 text-white shadow-xl">
          <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center p-1 border border-slate-700">
            <Chess3dPieceSvg type="k" color="b" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-tajawal">
              {gameMode === 'ai' ? `المعلم الذكي (${aiDifficulty === 'hard' ? 'أستاذ كبير 👑' : 'متوسط'})` : onlineOpponent ? onlineOpponent.name : 'اللاعب الأسود'}
            </span>
            {isAiThinking && (
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>يفكر...</span>
              </span>
            )}
          </div>
          <span className="font-mono font-black text-xs text-amber-400 bg-black/50 px-2 py-0.5 rounded-lg">
            {formatTime(isFlipped ? whiteTime : blackTime)}
          </span>
        </div>

        {/* Top Right Action Buttons (Undo & Flip) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undoMove}
            disabled={chess.history().length === 0 || gameMode === 'invite' || isAiThinking}
            className="w-12 h-12 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-40"
            title="تراجع عن النقلة"
          >
            <Undo2 className="w-6 h-6 text-white" />
          </button>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-12 h-12 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95"
            title="قلب الرقعة"
          >
            <div className="w-6 h-6 flex items-center justify-center text-lg">♟</div>
          </button>
        </div>
      </div>

      {/* Center 3D Chessboard Stage */}
      <div className="relative z-20 my-4 flex items-center justify-center w-full max-w-2xl px-2">
        {/* Restart Side Button */}
        <button
          type="button"
          onClick={resetGame}
          className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95"
          title="مباراة جديدة"
        >
          <RotateCcw className="w-6 h-6 text-white" />
        </button>

        {/* 3D Perspective Board Container */}
        <div
          className={`relative w-full max-w-[500px] sm:max-w-[560px] transition-transform duration-500 ease-out ${
            is3DView ? 'perspective-[1200px]' : ''
          }`}
        >
          <div
            className={`relative rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] transition-all ${
              is3DView ? 'rotate-x-[24deg] transform-style-3d' : ''
            }`}
          >
            {/* 3D Beveled Wooden Outer Border */}
            <div className="p-3.5 sm:p-4 bg-gradient-to-b from-[#1c1c1c] via-[#0d0d0d] to-[#000000] border-4 border-[#2b2b2b] rounded-2xl shadow-2xl">
              {/* The 8x8 Glossy Playing Grid */}
              <div
                className="grid grid-cols-8 aspect-square w-full rounded-xl overflow-hidden shadow-inner border border-white/10"
                style={{
                  gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
                }}
              >
                {squaresGrid.map(({ square, rank, file, isLight }) => {
                  const piece = chess.get(square);
                  const isSelected = selectedSquare === square;
                  const isValidTarget = validMoves.some((m) => m.to === square);
                  const isLastMoveSquare = lastMove && (lastMove.from === square || lastMove.to === square);
                  const isCheckedKing = checkedKingSquare === square;

                  return (
                    <button
                      key={square}
                      type="button"
                      onClick={() => handleSquareClick(square)}
                      className={`relative aspect-square w-full h-full flex items-center justify-center transition-all select-none ${
                        isLight ? 'bg-[#ffffff]' : 'bg-[#000000]'
                      } ${
                        isLastMoveSquare ? 'ring-2 ring-inset ring-amber-400/80 bg-amber-200/30' : ''
                      } ${
                        isCheckedKing ? 'bg-rose-600/90 ring-4 ring-inset ring-rose-500 animate-pulse' : ''
                      }`}
                    >
                      {/* Green Selection Box (Matching screenshot on d7!) */}
                      {isSelected && (
                        <div className="absolute inset-1.5 sm:inset-2 border-[3px] border-[#22c55e] rounded-md pointer-events-none z-30 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                      )}

                      {/* Valid Move Target Marker */}
                      {isValidTarget && (
                        <div
                          className={`absolute z-20 pointer-events-none rounded-full ${
                            piece
                              ? 'w-7 h-7 sm:w-11 sm:h-11 border-4 border-[#22c55e] bg-[#22c55e]/25 animate-scale-up'
                              : 'w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#22c55e] shadow-md ring-2 ring-white/50'
                          }`}
                        />
                      )}

                      {/* 3D Realistic Carved Wooden Piece */}
                      {piece && (
                        <div className="w-[88%] h-[88%] z-10 transition-transform duration-150 hover:scale-110">
                          <Chess3dPieceSvg type={piece.type} color={piece.color} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Front Coordinates Row (A B C D E F G H) */}
              <div className="grid grid-cols-8 text-center text-white/90 font-mono font-bold text-[10px] sm:text-xs pt-1.5 tracking-widest">
                {displayFiles.map((f) => (
                  <span key={f}>{f.toUpperCase()}</span>
                ))}
              </div>
            </div>

            {/* Front 3D Bevel Plate */}
            <div className="w-full bg-gradient-to-r from-[#141414] via-[#222222] to-[#141414] text-white/85 px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm font-mono tracking-wider shadow-inner">
              <span className="font-bold text-amber-300/90">{difficultyTitle}</span>
              <span className="text-slate-300 italic">{`${moveNumber}. ${turnLabel}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Bar (White/Human Player) */}
      <div className="relative z-30 w-full max-w-4xl flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white font-bold text-xs backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        {/* White Player Status */}
        <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-black/75 backdrop-blur-md border border-amber-400/40 text-white shadow-xl">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center p-1 border border-amber-300 shadow-xs">
            <Chess3dPieceSvg type="k" color="w" />
          </div>
          <span className="text-xs sm:text-sm font-black font-tajawal text-amber-200">
            {user?.name || 'اللاعب الأبيض (أنت)'}
          </span>
          <span className="font-mono font-black text-xs text-amber-400 bg-black/50 px-2 py-0.5 rounded-lg">
            {formatTime(isFlipped ? blackTime : whiteTime)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSoundOn(!soundOn)}
          className="p-3 rounded-2xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transition"
        >
          {soundOn ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
        </button>
      </div>

      {/* Options & Modes Drawer / Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400/80 rounded-[36px] p-6 text-white text-right space-y-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                <span>إعدادات مباراة الشطرنج 3D</span>
                <span>♟️</span>
              </h3>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-300 block">وضع اللعب:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGameMode('ai');
                    resetGame();
                    setIsMenuOpen(false);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition ${
                    gameMode === 'ai' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  🤖 ضد الذكاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGameMode('local');
                    resetGame();
                    setIsMenuOpen(false);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition ${
                    gameMode === 'local' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  👥 محلي 1v1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGameMode('invite');
                    if (!roomCode) handleCreateInviteRoom();
                    setIsMenuOpen(false);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black transition ${
                    gameMode === 'invite' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  📲 دعوة صديق
                </button>
              </div>
            </div>

            {/* AI Level */}
            {gameMode === 'ai' && (
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 block">مستوى المعلم الذكي:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setAiDifficulty(lvl)}
                      className={`py-2 rounded-xl text-xs font-black transition ${
                        aiDifficulty === lvl ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lvl === 'easy' ? 'مبتدئ' : lvl === 'medium' ? 'متوسط' : 'أستاذ كبير 👑'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Perspective View Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="text-xs font-bold text-slate-300">منظور الرقعة ثلاثي الأبعاد 3D:</span>
              <button
                type="button"
                onClick={() => setIs3DView(!is3DView)}
                className={`px-3 py-1 rounded-xl text-xs font-black ${
                  is3DView ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {is3DView ? 'مفعل 3D' : 'مسطح 2D'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                resetGame();
                setIsMenuOpen(false);
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition"
            >
              بدء مباراة جديدة 🔄
            </button>
          </div>
        </div>
      )}

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-[36px] p-6 text-center text-white space-y-4 shadow-2xl animate-scale-up">
            <Crown className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-lg font-black font-tajawal text-amber-300">
              ترقية البيدق! اختر القطعة الجديدة:
            </h3>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {(['q', 'r', 'b', 'n'] as PieceSymbol[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => executeChessMove(pendingPromotion.from, pendingPromotion.to, t)}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-amber-500 text-white hover:text-slate-950 flex flex-col items-center gap-1 transition group"
                >
                  <div className="w-10 h-10">
                    <Chess3dPieceSvg type={t} color={chess.turn()} />
                  </div>
                  <span className="text-[10px] font-black">
                    {t === 'q' ? 'وزير' : t === 'r' ? 'قلعة' : t === 'b' ? 'فيل' : 'حصان'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tactical Exam Question Bonus Modal */}
      {tacticalBonusQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-[36px] p-6 text-white text-right space-y-4 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
                <span className="text-xs font-black text-amber-300">
                  فرصة تكتيكية: حل مسألة الامتحان لكسب +50 XP ⚡
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTacticalBonusQ(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                تخطي ✕
              </button>
            </div>

            <h3 className="text-sm font-black font-tajawal text-slate-100 leading-relaxed">
              {tacticalBonusQ.q}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {tacticalBonusQ.options.map((opt: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (idx === tacticalBonusQ.correct) {
                      setBonusXP((xp) => xp + 50);
                      alert('إجابة نموذجية صحيحة! حصلت على +50 XP تكتيكي 🏆');
                    } else {
                      alert('إجابة غير صحيحة، ركز في النقلة القادمة!');
                    }
                    setTacticalBonusQ(null);
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-black transition text-right shadow-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {chess.isGameOver() && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-[36px] p-8 text-center text-white space-y-6 shadow-2xl animate-scale-up">
            <div className="text-6xl animate-bounce">
              {chess.isCheckmate() ? '♟️👑' : '🤝'}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-tajawal text-amber-400">
                {chess.isCheckmate()
                  ? `كش مات! فوز ${chess.turn() === 'w' ? 'الأسود ♚' : 'الأبيض ♔'} 👑`
                  : chess.isDraw()
                  ? 'تعادل رسمي 🤝'
                  : 'انتهت المباراة!'}
              </h3>
              <p className="text-xs text-slate-300">
                {chess.isCheckmate()
                  ? 'مباراة شطرنج تكتيكية عبقرية! حصلت على نقاط XP إضافية في لوحة الشرف.'
                  : 'مباراة قوية وتكافؤ استراتيجي رائع بين الطرفين!'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetGame}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg transition hover:scale-105"
              >
                مباراة جديدة 🔄
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
