'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Swords,
  Share2,
  Copy,
  Check,
  Zap,
  Sparkles,
  X,
  Crown,
  Search,
  UserPlus,
  Play,
  Send,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface StudentItem {
  id: string;
  name: string;
  avatar?: string | null;
  seatNumber?: string | null;
  department?: string | null;
  gamePoints: number;
  gameWins: number;
  isOnline: boolean;
}

interface GameInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (gameType: string, roomCode: string) => void;
  defaultGameType?: string;
}

const AVAILABLE_1V1_GAMES = [
  { id: 'chess', title: 'الشطرنج التنافسي الاحترافي ♟️', icon: '♟️', desc: 'مبارزة شطرنج كاملة القواعد مع وقت ومكافآت معادلة' },
  { id: 'duel', title: 'مبارزة المعادلات 1v1 ⚔️', icon: '⚔️', desc: 'تحدي سرعة حل أسئلة الامتحانات مباشرة مع صديقك' },
  { id: 'tictactoe', title: 'تيك تاك تو الامتحانات X-O ❌⭕', icon: '❌⭕', desc: 'استولِ على مربعات الشبكة بحل المسائل الرياضية' },
  { id: 'tugofwar', title: 'معركة شد الحبل الرياضي 🪢', icon: '🪢', desc: 'اسحب الحبل لصالحك بالإجابات السريعة الصحيحة' },
];

export default function GameInviteModal({
  isOpen,
  onClose,
  onStartGame,
  defaultGameType = 'chess',
}: GameInviteModalProps) {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState(defaultGameType);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [invitedStudentId, setInvitedStudentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/games/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error('Failed to load students:', e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleCreateRoom = async (targetStudentId?: string) => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/games/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: selectedGame.toUpperCase(),
          opponentId: targetStudentId || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.room) {
        setCreatedRoomCode(data.room.code);
        if (targetStudentId) {
          setInvitedStudentId(targetStudentId);
          setTimeout(() => {
            onStartGame(selectedGame, data.room.code);
            onClose();
          }, 1200);
        }
      }
    } catch (e) {
      console.error('Error creating room:', e);
    } finally {
      setIsCreating(false);
    }
  };

  const copyLink = () => {
    if (!createdRoomCode) return;
    const url = `${window.location.origin}/games?room=${createdRoomCode}&game=${selectedGame}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!createdRoomCode) return;
    const url = `${window.location.origin}/games?room=${createdRoomCode}&game=${selectedGame}`;
    const text = `دعاك ${user?.name || 'صديقك'} لمبارزة ${AVAILABLE_1V1_GAMES.find((g) => g.id === selectedGame)?.title || 'ألعاب'} على منصة معادلة برو! اضغط هنا للانضمام للغرفة: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.seatNumber && s.seatNumber.includes(searchQuery))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[36px] shadow-2xl p-6 sm:p-8 text-right space-y-6 animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5 justify-end">
                <span>دعوة صديق لمبارزة ثنائية 1v1</span>
                <span className="text-xl">📲</span>
              </h3>
              <p className="text-xs text-slate-400">
                أرسل دعوة مباشرة لزملائك الطلاب أو شارك رابط الغرفة السري
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xl shadow-xs">
              <Swords className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 1. Select Game */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-700 dark:text-slate-300 block">
            1. اختر اللعبة التي ترغب في التحدي بها:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {AVAILABLE_1V1_GAMES.map((g) => {
              const isSelected = selectedGame === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setSelectedGame(g.id);
                    setCreatedRoomCode(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 shadow-md scale-[1.01]'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{g.icon}</span>
                  <div>
                    <h4 className={`text-xs font-black ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>
                      {g.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                      {g.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Instant Room Code & Share Link */}
        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              2. إنشاء رابط دعوة ومشاركته (واتساب / نسخ):
            </span>
            {!createdRoomCode && (
              <button
                type="button"
                onClick={() => handleCreateRoom()}
                disabled={isCreating}
                className="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>توليد كود الغرفة ⚡</span>
              </button>
            )}
          </div>

          {createdRoomCode && (
            <div className="space-y-3 pt-1 animate-scale-up">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-brand-300 dark:border-brand-800 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400 font-bold">كود الغرفة:</span>
                <span className="font-mono font-black text-sm text-brand-600 dark:text-brand-400 tracking-wider">
                  {createdRoomCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 font-black text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'تم النسخ!' : 'نسخ رابط التحدي'}</span>
                </button>

                <button
                  type="button"
                  onClick={shareWhatsApp}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  <span>مشاركة واتساب 📲</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onStartGame(selectedGame, createdRoomCode);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2 transition"
              >
                <Play className="w-4 h-4" />
                <span>دخول الغرفة وبدء المباراة الآن 🚀</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Direct Invite to Registered Students */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              3. أو اختر طالباً لإرسال إشعار تحدي مباشر له فوراً:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {filteredStudents.length} طالب متاح
            </span>
          </div>

          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو رقم الجلوس..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-hidden focus:border-brand-500"
            />
          </div>

          {/* Students List */}
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {loadingStudents ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500 mb-1" />
                <span>جاري تحميل قائمة الطلاب...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                لا يوجد طلاب يطابقون بحثك حالياً.
              </p>
            ) : (
              filteredStudents.map((st) => {
                const isInvited = invitedStudentId === st.id;

                return (
                  <div
                    key={st.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 hover:border-slate-400 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {st.avatar ? (
                          <img src={st.avatar} alt={st.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <span>{st.name.charAt(0)}</span>
                        )}
                        {st.isOnline && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {st.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          {st.seatNumber && (
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              جلوس: {st.seatNumber}
                            </span>
                          )}
                          <span>• {st.gamePoints} XP</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCreateRoom(st.id)}
                      disabled={isCreating || isInvited}
                      className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition ${
                        isInvited
                          ? 'bg-emerald-500 text-white'
                          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تم إرسال الدعوة!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال دعوة ⚡</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
