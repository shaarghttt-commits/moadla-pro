'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Heart,
  Flame,
  Sparkles,
  Send,
  Eye,
  Trash2,
  Smile,
  Volume2,
  VolumeX,
  Music,
  Disc,
  Clock,
  Play,
  Pause,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatTimeAgo } from '@/lib/utils';
import AudioPlayer from '@/components/common/AudioPlayer';

export interface StoryItem {
  id: string;
  userId: string;
  type: 'TEXT' | 'IMAGE' | 'QUIZ' | 'AUDIO';
  content?: string | null;
  mediaUrl?: string | null;
  audioUrl?: string | null;
  audioDuration?: number | null;
  musicTitle?: string | null;
  musicArtist?: string | null;
  musicUrl?: string | null;
  quizQuestion?: string | null;
  quizOptions?: string | null;
  quizOptionsList?: { id: string; text: string; isCorrect?: boolean }[] | null;
  myVote?: string | null;
  totalVotes?: number;
  percentages?: Record<string, number>;
  optionCounts?: Record<string, number>;
  bgColor?: string | null;
  fontFamily?: string | null;
  createdAt: string;
  expiresAt: string;
  viewsCount?: number;
  reactionsCount?: number;
  isViewedByMe?: boolean;
}

export interface UserStoriesGroup {
  user: {
    id: string;
    name: string;
    username?: string | null;
    avatar?: string | null;
    department?: string | null;
    role?: string;
    currentStreak?: number;
  };
  stories: StoryItem[];
  hasUnviewed?: boolean;
  totalStories: number;
}

interface StoryViewerModalProps {
  isOpen: boolean;
  initialUserIndex: number;
  groupedStories: UserStoriesGroup[];
  onClose: () => void;
  onStoryDeleted?: (storyId: string) => void;
}

const QUICK_REACTIONS = ['❤️', '🔥', '👏', '💡', '😂', '😮'];
const STORY_DURATION_MS = 6000; // 6 seconds per story

export default function StoryViewerModal({
  isOpen,
  initialUserIndex,
  groupedStories,
  onClose,
  onStoryDeleted,
}: StoryViewerModalProps) {
  const { user: currentUser } = useAuth();

  const [currentUserIdx, setCurrentUserIdx] = useState(initialUserIndex);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [activeReactionAnim, setActiveReactionAnim] = useState<string | null>(null);
  const [showViewersSheet, setShowViewersSheet] = useState(false);
  const [viewersList, setViewersList] = useState<any[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  // Voting state
  const [userVotes, setUserVotes] = useState<Record<string, string>>({}); // storyId -> optionId
  const [percentagesMap, setPercentagesMap] = useState<Record<string, Record<string, number>>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  const currentGroup = groupedStories[currentUserIdx];
  const currentStory = currentGroup?.stories[currentStoryIdx];
  const isOwnStory = currentUser && currentGroup && currentUser.id === currentGroup.user.id;

  useEffect(() => {
    if (isOpen) {
      setCurrentUserIdx(Math.min(initialUserIndex, groupedStories.length - 1));
      setCurrentStoryIdx(0);
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
    }
  }, [isOpen, initialUserIndex, groupedStories.length]);

  useEffect(() => {
    if (isOpen && currentStory) {
      fetch(`/api/stories/${currentStory.id}/view`, { method: 'POST' }).catch(() => {});
      if (currentStory.myVote) {
        setUserVotes((prev) => ({ ...prev, [currentStory.id]: currentStory.myVote! }));
      }
      if (currentStory.percentages) {
        setPercentagesMap((prev) => ({ ...prev, [currentStory.id]: currentStory.percentages! }));
      }
    }
  }, [isOpen, currentStory?.id]);

  useEffect(() => {
    if (!isOpen || isPaused || !currentStory) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now() - (elapsedBeforePauseRef.current || 0);

    const interval = 50;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / STORY_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= STORY_DURATION_MS) {
        handleNextStory();
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isPaused, currentUserIdx, currentStoryIdx, currentStory?.id]);

  if (!isOpen || !currentGroup || !currentStory) return null;

  const handleNextStory = () => {
    elapsedBeforePauseRef.current = 0;
    setProgress(0);

    if (currentStoryIdx < currentGroup.stories.length - 1) {
      setCurrentStoryIdx((prev) => prev + 1);
    } else {
      if (currentUserIdx < groupedStories.length - 1) {
        setCurrentUserIdx((prev) => prev + 1);
        setCurrentStoryIdx(0);
      } else {
        onClose();
      }
    }
  };

  const handlePrevStory = () => {
    elapsedBeforePauseRef.current = 0;
    setProgress(0);

    if (currentStoryIdx > 0) {
      setCurrentStoryIdx((prev) => prev - 1);
    } else {
      if (currentUserIdx > 0) {
        const prevGroup = groupedStories[currentUserIdx - 1];
        setCurrentUserIdx((prev) => prev - 1);
        setCurrentStoryIdx(prevGroup.stories.length - 1);
      }
    }
  };

  const handlePause = () => {
    if (!isPaused) {
      elapsedBeforePauseRef.current = (progress / 100) * STORY_DURATION_MS;
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (isPaused) {
      setIsPaused(false);
    }
  };

  const handleReaction = async (emoji: string) => {
    setActiveReactionAnim(emoji);
    setTimeout(() => setActiveReactionAnim(null), 1200);

    try {
      await fetch(`/api/stories/${currentStory.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoteQuiz = async (optionId: string) => {
    if (!currentUser) {
      alert('يرجى تسجيل الدخول للإجابة على السؤال');
      return;
    }

    handlePause();
    setUserVotes((prev) => ({ ...prev, [currentStory.id]: optionId }));

    try {
      const res = await fetch(`/api/stories/${currentStory.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });

      const data = await res.json();
      if (res.ok && data.percentages) {
        setPercentagesMap((prev) => ({ ...prev, [currentStory.id]: data.percentages }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSendingReply(true);
    try {
      const convRes = await fetch('/api/social/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: currentGroup.user.id,
          initialMessage: `رد على قصتك: "${replyText.trim()}"`,
        }),
      });

      if (convRes.ok) {
        setReplyText('');
        alert('تم إرسال ردك كرسالة خاصة بنجاح! 💌');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleOpenViewers = async () => {
    handlePause();
    setShowViewersSheet(true);
    setLoadingViewers(true);
    try {
      const res = await fetch(`/api/stories/${currentStory.id}`);
      const data = await res.json();
      if (res.ok && data.story) {
        setViewersList(data.story.views || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!confirm('هل أنت متأكد من حذف هذه القصة؟')) return;

    try {
      const res = await fetch(`/api/stories/${currentStory.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (onStoryDeleted) onStoryDeleted(currentStory.id);
        handleNextStory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const myCurrentVote = userVotes[currentStory.id];
  const currentPercentages = percentagesMap[currentStory.id] || currentStory.percentages || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in select-none">
      {/* Background Floating Blurred Thumbnail */}
      {currentStory.mediaUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 blur-3xl scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${currentStory.mediaUrl})` }}
        />
      )}

      {/* Main Top Header Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between text-white max-w-xl mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href={`/user/${currentGroup.user.id}`}
            onClick={onClose}
            className="flex items-center gap-2.5 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-brand-500 overflow-hidden bg-brand-600 flex items-center justify-center font-bold text-sm">
              {currentGroup.user.avatar ? (
                <img
                  src={currentGroup.user.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                currentGroup.user.name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-black font-tajawal drop-shadow-md">
                  {currentGroup.user.name}
                </p>
                {currentGroup.user.currentStreak && currentGroup.user.currentStreak > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[10px] font-black">
                    🔥 {currentGroup.user.currentStreak}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/70 font-medium">
                {formatTimeAgo(currentStory.createdAt)}
              </p>
            </div>
          </Link>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isOwnStory && (
            <button
              onClick={handleDeleteStory}
              title="حذف القصة"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600/80 text-white flex items-center justify-center transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {currentStory?.musicTitle && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'تشغيل الموسيقى' : 'كتم الموسيقى'}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          )}

          <button
            onClick={() => (isPaused ? handleResume() : handlePause())}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Next/Prev Floating Chevrons */}
      {currentUserIdx > 0 || currentStoryIdx > 0 ? (
        <button
          onClick={handlePrevStory}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition backdrop-blur-md hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      ) : null}

      <button
        onClick={handleNextStory}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white items-center justify-center transition backdrop-blur-md hover:scale-110"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Story Player Container */}
      <div
        className={`relative w-full max-w-sm sm:max-w-md h-[88vh] max-h-[780px] rounded-[36px] overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10 transition-all ${
          currentStory.type === 'IMAGE'
            ? 'bg-black'
            : currentStory.bgColor || 'bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950'
        }`}
        onMouseDown={handlePause}
        onMouseUp={handleResume}
        onTouchStart={handlePause}
        onTouchEnd={handleResume}
      >
        {/* Floating Music Badge if story has music attached */}
        {currentStory?.musicTitle && (
          <div className="absolute top-7 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-lg animate-fade-in">
            <Disc className={`w-3.5 h-3.5 text-purple-300 ${!isPaused && !isMuted ? 'animate-spin' : ''}`} />
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-black leading-tight max-w-[120px] truncate">{currentStory.musicTitle}</span>
              {currentStory.musicArtist && (
                <span className="text-[8px] text-white/70 max-w-[120px] truncate">{currentStory.musicArtist}</span>
              )}
            </div>
            {!isMuted && (
              <div className="flex items-center gap-0.5 ml-1">
                <span className="w-0.5 h-2.5 bg-purple-400 rounded-full animate-pulse" />
                <span className="w-0.5 h-3.5 bg-pink-400 rounded-full animate-pulse delay-75" />
                <span className="w-0.5 h-2 bg-indigo-400 rounded-full animate-pulse delay-150" />
              </div>
            )}
          </div>
        )}
        {/* Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {currentGroup.stories.map((s, idx) => {
            let width = '0%';
            if (idx < currentStoryIdx) width = '100%';
            else if (idx === currentStoryIdx) width = `${progress}%`;

            return (
              <div
                key={s.id}
                className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{ width }}
                />
              </div>
            );
          })}
        </div>

        {/* Tap zones for Navigation */}
        <div
          onClick={handleNextStory}
          className="absolute left-0 top-16 bottom-24 w-1/2 z-20 cursor-pointer"
        />
        <div
          onClick={handlePrevStory}
          className="absolute right-0 top-16 bottom-24 w-1/2 z-20 cursor-pointer"
        />

        {/* Story Content Area */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
          {/* 1. TEXT STORY */}
          {currentStory.type === 'TEXT' && (
            <div className="my-auto text-center px-4">
              <p className="text-xl sm:text-2xl font-black font-tajawal text-white leading-relaxed whitespace-pre-wrap drop-shadow-lg">
                {currentStory.content}
              </p>
            </div>
          )}

          {/* 2. IMAGE STORY */}
          {currentStory.type === 'IMAGE' && (
            <>
              {currentStory.mediaUrl && (
                <img
                  src={currentStory.mediaUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain sm:object-cover z-0"
                />
              )}
              {currentStory.content && (
                <div className="relative z-10 mt-auto p-4 rounded-2xl bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-black text-center shadow-lg max-w-xs">
                  {currentStory.content}
                </div>
              )}
            </>
          )}

          {/* 3. INTERACTIVE QUIZ & POLL STORY */}
          {currentStory.type === 'QUIZ' && (
            <div className="relative z-30 w-full max-w-xs p-5 rounded-[28px] bg-slate-950/80 backdrop-blur-xl border border-white/20 text-white space-y-4 shadow-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                  ❓
                </div>
                <h4 className="text-sm font-black font-tajawal leading-snug">
                  {currentStory.quizQuestion}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {(currentStory.quizOptionsList || []).map((opt) => {
                  const isSelected = myCurrentVote === opt.id;
                  const hasVoted = !!myCurrentVote;
                  const pct = currentPercentages[opt.id] || 0;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleVoteQuiz(opt.id)}
                      className={`relative w-full py-3 px-4 rounded-2xl text-xs font-black text-right overflow-hidden transition-all duration-300 border ${
                        hasVoted
                          ? opt.isCorrect
                            ? 'border-emerald-400/80 bg-emerald-950/60 text-emerald-200'
                            : isSelected
                            ? 'border-rose-400/80 bg-rose-950/60 text-rose-200'
                            : 'border-white/10 bg-white/5 text-white/80'
                          : 'border-white/20 bg-white/10 hover:bg-white/20 text-white hover:scale-[1.02]'
                      }`}
                    >
                      {/* Vote Percentage fill bar */}
                      {hasVoted && (
                        <div
                          className={`absolute top-0 bottom-0 right-0 opacity-25 rounded-2xl transition-all duration-500 ${
                            opt.isCorrect ? 'bg-emerald-500' : isSelected ? 'bg-rose-500' : 'bg-white'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {hasVoted && opt.isCorrect && (
                            <Check className="w-4 h-4 text-emerald-400" />
                          )}
                          <span>{opt.text}</span>
                        </div>
                        {hasVoted && (
                          <span className="font-mono text-[11px] font-bold">
                            {pct}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {myCurrentVote && (
                <p className="text-center text-[10px] text-emerald-400 font-bold animate-fade-in">
                  تم تسجيل إجابتك بنجاح! ✨
                </p>
              )}
            </div>
          )}

          {/* 4. AUDIO VOICE STORY */}
          {currentStory.type === 'AUDIO' && currentStory.audioUrl && (
            <div className="relative z-30 w-full max-w-xs p-6 rounded-[28px] bg-slate-950/85 backdrop-blur-xl border border-white/20 text-white space-y-4 text-center shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center text-3xl shadow-lg animate-pulse">
                🎙️
              </div>
              <h4 className="text-sm font-black font-tajawal">
                {currentStory.content || 'ملاحظة صوتية دراسية 🎧'}
              </h4>
              <div className="pt-2">
                <AudioPlayer src={currentStory.audioUrl} duration={currentStory.audioDuration || 0} />
              </div>
            </div>
          )}
        </div>

        {/* Floating Animated Reaction Pop */}
        {activeReactionAnim && (
          <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-scale-up">
            <span className="text-7xl drop-shadow-2xl">{activeReactionAnim}</span>
          </div>
        )}

        {/* Story Footer Controls */}
        <div className="relative z-30 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          {!isOwnStory && (
            <div className="flex items-center justify-center gap-3 mb-3">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleReaction(emoji)}
                  className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md text-xl flex items-center justify-center transition-all hover:scale-125 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {isOwnStory ? (
            <div className="flex items-center justify-between pt-1 text-white">
              <button
                onClick={handleOpenViewers}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-bold transition"
              >
                <Eye className="w-4 h-4" />
                <span>{currentStory.viewsCount || 0} مشاهدة</span>
              </button>
              <div className="text-xs font-bold text-white/70">
                {currentGroup.stories.length} قصص نشطة
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={handlePause}
                onBlur={handleResume}
                placeholder={`أرسل رسالة إلى ${currentGroup.user.name}...`}
                className="flex-1 py-2.5 px-4 rounded-full bg-white/20 backdrop-blur-md text-white placeholder-white/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button
                type="submit"
                disabled={!replyText.trim() || sendingReply}
                className="w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white flex items-center justify-center transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Viewers Sheet */}
      {showViewersSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal">
                  مشاهدو القصة ({viewersList.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowViewersSheet(false);
                  handleResume();
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {loadingViewers ? (
                <div className="py-8 text-center text-slate-400 text-xs font-bold">
                  جاري تحميل المشاهدين...
                </div>
              ) : viewersList.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-bold">
                  لا توجد مشاهدات حتى الآن.
                </div>
              ) : (
                viewersList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    <Link
                      href={`/user/${item.viewer.id}`}
                      onClick={onClose}
                      className="flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
                        {item.viewer.avatar ? (
                          <img
                            src={item.viewer.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.viewer.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.viewer.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {formatTimeAgo(item.viewedAt)}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
