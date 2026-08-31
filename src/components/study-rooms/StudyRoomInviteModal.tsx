'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Send,
  Loader2,
  X,
  Sparkles,
  Search,
  Radio,
  Video,
  Mic,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Student {
  id: string;
  name: string;
  avatar?: string | null;
  seatNumber?: number | null;
  score?: number;
}

interface StudyRoomInviteModalProps {
  roomId: string;
  roomName: string;
  onClose: () => void;
}

export default function StudyRoomInviteModal({
  roomId,
  roomName,
  onClose,
}: StudyRoomInviteModalProps) {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingToId, setSendingToId] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/games/students');
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/study-rooms?roomId=${roomId}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `دعاك ${user?.name || 'زميلك'} للانضمام لغرفة المذاكرة الحية بالصوت والفيديو 🎧📹 "${roomName}" على منصة معادلة برو! اضغط هنا للانضمام فوراً: ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendDirectInvite = async (targetStudent: Student) => {
    setSendingToId(targetStudent.id);
    try {
      const res = await fetch(`/api/study-rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite',
          targetUserId: targetStudent.id,
        }),
      });

      if (res.ok) {
        setInvitedIds((prev) => new Set(prev).add(targetStudent.id));
      }
    } catch (err) {
      console.error('Error inviting student:', err);
    } finally {
      setSendingToId(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.id !== user?.id &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.seatNumber && String(s.seatNumber).includes(searchQuery)))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-brand-500 rounded-[36px] p-6 text-white text-right space-y-5 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-brand-400">دعوة زميل للمذاكرة الحية</h3>
            <span className="p-1.5 rounded-xl bg-brand-500/20 text-brand-400">
              <Radio className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Room Info Tag */}
        <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Video className="w-4 h-4" />
            </span>
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
              <Mic className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-300">مذاكرة تفاعلية صوت وفيديو</span>
          </div>
          <span className="text-xs font-black text-brand-300 truncate max-w-[200px]">{roomName}</span>
        </div>

        {/* Quick Invite Link & WhatsApp */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-300 block">رابط الدعوة المباشر:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-black text-xs flex items-center gap-1.5 transition shadow-sm shrink-0"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'تم النسخ!' : 'نسخ'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition shadow-md"
          >
            <Share2 className="w-4 h-4" />
            <span>إرسال دعوة سريعة عبر الواتساب (WhatsApp) 💬</span>
          </button>
        </div>

        {/* Direct Student Selector */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-400" />
              <span>دعوة مباشرة لزملائك الطلاب:</span>
            </span>
            <span className="text-[11px] text-slate-400">{filteredStudents.length} طالب</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو رقم الجلوس..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-brand-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {loading ? (
              <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري تحميل قائمة الطلاب...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                لا يوجد طلاب مطابقين للبحث
              </div>
            ) : (
              filteredStudents.map((stu) => {
                const isInvited = invitedIds.has(stu.id);
                const isSending = sendingToId === stu.id;

                return (
                  <div
                    key={stu.id}
                    className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between hover:border-slate-600 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-xs">
                        {stu.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{stu.name}</div>
                        {stu.seatNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            رقم الجلوس: #{stu.seatNumber}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isInvited || isSending}
                      onClick={() => handleSendDirectInvite(stu)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
                        isInvited
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
                      }`}
                    >
                      {isSending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isInvited ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تمت الدعوة ✓</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال دعوة</span>
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
