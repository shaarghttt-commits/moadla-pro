'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Music,
  Send,
  Loader2,
  Sparkles,
  UserCheck,
  UserPlus,
  Compass,
  Film,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CreateReelModal from './CreateReelModal';

export interface ReelItem {
  id: string;
  content: string;
  fileUrl: string;
  subjectTag?: string;
  moodEmoji?: string;
  imagesJson?: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string | null;
    username?: string | null;
    department?: string | null;
    role?: string;
  };
  comments?: any[];
}

export default function ReelsFeedClient({ initialReels }: { initialReels: ReelItem[] }) {
  const { user } = useAuth();
  const [reels, setReels] = useState<ReelItem[]>(initialReels);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState('all');

  // Comments Sheet State
  const [activeCommentsReelId, setActiveCommentsReelId] = useState<string | null>(null);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Like animation trigger
  const [likeHeartAnim, setLikeHeartAnim] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Fetch reels when tag filter changes
  useEffect(() => {
    if (selectedTag === 'all') {
      setReels(initialReels);
      return;
    }
    const fetchFiltered = async () => {
      try {
        const res = await fetch(`/api/reels?tag=${selectedTag}`);
        if (res.ok) {
          const data = await res.json();
          setReels(data.reels || []);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchFiltered();
  }, [selectedTag, initialReels]);

  // Handle active video playback
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentIndex) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
        setIsPlaying(true);
      } else {
        vid.pause();
      }
    });
  }, [currentIndex, reels]);

  // Key navigation (Arrow Up / Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        scrollNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length]);

  const scrollNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const scrollPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (currentVideo.paused) {
        currentVideo.play();
        setIsPlaying(true);
      } else {
        currentVideo.pause();
        setIsPlaying(false);
      }
    }
  };

  // Toggle Like Action
  const handleToggleLike = async (reelId: string, index: number) => {
    if (!user) {
      alert('يرجى تسجيل الدخول للإعجاب بالمقطع');
      return;
    }

    const currentReel = reels[index];
    const newLikedState = !currentReel.isLiked;
    const newLikesCount = newLikedState
      ? currentReel.likesCount + 1
      : Math.max(0, currentReel.likesCount - 1);

    // Optimistic UI update
    setReels((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, isLiked: newLikedState, likesCount: newLikesCount } : r
      )
    );

    if (newLikedState) {
      setLikeHeartAnim(reelId);
      setTimeout(() => setLikeHeartAnim(null), 800);
    }

    try {
      await fetch(`/api/reels/${reelId}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  // Open Comments Drawer
  const handleOpenComments = async (reelId: string) => {
    setActiveCommentsReelId(reelId);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/reels/${reelId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data.comments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit New Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentsReelId || !user) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/reels/${activeCommentsReelId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newCommentText }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setCommentsList((prev) => [...prev, data.comment]);
        setNewCommentText('');
        // Update comments count on reel
        setReels((prev) =>
          prev.map((r) =>
            r.id === activeCommentsReelId ? { ...r, commentsCount: r.commentsCount + 1 } : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShareReel = (reel: ReelItem) => {
    const url = `${window.location.origin}/reels?reelId=${reel.id}`;
    if (navigator.share) {
      navigator.share({
        title: `ريلز تعليمي من ${reel.author.name}`,
        text: reel.content,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ رابط مقطع الريلز بنجاح! 🔗');
    }
  };

  const handleReelCreated = (newReel: ReelItem) => {
    setReels((prev) => [newReel, ...prev]);
    setCurrentIndex(0);
  };

  const currentReel = reels[currentIndex];

  return (
    <div className="relative min-h-[92vh] w-full bg-slate-950 flex flex-col items-center justify-between font-tajawal select-none overflow-hidden">
      {/* Top Floating Header & Filter Tabs */}
      <div className="w-full max-w-lg z-30 pt-4 px-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-white leading-tight">ريلز الطلاب 🎬</h1>
              <span className="text-[10px] text-purple-400 font-bold">فيديوهات وشروحات سريعة</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة ريلز +</span>
          </button>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'الكل ✨' },
            { id: 'math', label: '📐 تفاضل وتكامل' },
            { id: 'physics', label: '⚡ فيزياء' },
            { id: 'mechanics', label: '⚙️ ميكانيكا' },
            { id: 'tips', label: '💡 نصائح وبابل شيت' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTag(t.id)}
              className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 transition ${
                selectedTag === t.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reels Vertical Player Container */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[78vh] sm:h-[82vh] rounded-[36px] overflow-hidden bg-black border-2 border-slate-800/80 shadow-2xl my-2 flex items-center justify-center">
        {reels.length === 0 ? (
          <div className="text-center p-8 space-y-4 text-slate-400">
            <Film className="w-12 h-12 mx-auto text-purple-400 animate-bounce" />
            <h3 className="text-sm font-black text-slate-200">لا توجد مقاطع ريلز في هذا القسم بعد</h3>
            <p className="text-xs text-slate-500">كن أول من يشارك زملاءه مقطع فيديو تعليمي أو نصيحة!</p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-black text-xs shadow-md"
            >
              نشر أول مقطع ريلز 🚀
            </button>
          </div>
        ) : (
          reels.map((reel, idx) => {
            const isActiveReel = idx === currentIndex;
            let soundMeta = { audioTitle: 'الصوت الأصلي', soundAuthor: reel.author.name };
            try {
              if (reel.imagesJson) soundMeta = JSON.parse(reel.imagesJson);
            } catch {}

            return (
              <div
                key={reel.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                  isActiveReel ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* 1. The Video Player */}
                <video
                  ref={(el) => {
                    videoRefs.current[idx] = el;
                  }}
                  src={reel.fileUrl}
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={togglePlayPause}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {/* Double-tap / Heart Pop Animation */}
                {likeHeartAnim === reel.id && (
                  <div className="absolute inset-0 m-auto w-24 h-24 flex items-center justify-center pointer-events-none z-30 animate-scale-up">
                    <Heart className="w-20 h-20 text-rose-500 fill-rose-500 filter drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
                  </div>
                )}

                {/* Top Overlay Actions: Mute / Sound Toggle */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-md"
                    title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>

                {/* Right Floating Actions Bar (Instagram / TikTok Style) */}
                <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4">
                  {/* Author Avatar */}
                  <Link
                    href={`/profile?userId=${reel.author.id}`}
                    className="relative group"
                  >
                    <div className="w-11 h-11 rounded-full ring-2 ring-purple-500 overflow-hidden bg-slate-800 shadow-md">
                      {reel.author.avatar ? (
                        <img src={reel.author.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-white text-xs bg-purple-600">
                          {reel.author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                      +
                    </span>
                  </Link>

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleLike(reel.id, idx)}
                    className="flex flex-col items-center gap-1 group transition hover:scale-110 active:scale-90"
                  >
                    <div
                      className={`p-3 rounded-full backdrop-blur-md transition ${
                        reel.isLiked
                          ? 'bg-rose-500/80 text-white shadow-rose-500/40 shadow-lg'
                          : 'bg-black/50 text-white hover:bg-black/70'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${reel.isLiked ? 'fill-white' : ''}`} />
                    </div>
                    <span className="text-[11px] font-black text-white drop-shadow-md">
                      {reel.likesCount}
                    </span>
                  </button>

                  {/* Comments Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenComments(reel.id)}
                    className="flex flex-col items-center gap-1 group transition hover:scale-110 active:scale-90"
                  >
                    <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md shadow-lg">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-black text-white drop-shadow-md">
                      {reel.commentsCount}
                    </span>
                  </button>

                  {/* Share Button */}
                  <button
                    type="button"
                    onClick={() => handleShareReel(reel)}
                    className="flex flex-col items-center gap-1 group transition hover:scale-110 active:scale-90"
                  >
                    <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md shadow-lg">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-white drop-shadow-md">مشاركة</span>
                  </button>

                  {/* Spinning Music Vinyl Disc */}
                  <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-pink-400 animate-spin-slow shadow-lg">
                    <Music className="w-4 h-4" />
                  </div>
                </div>

                {/* Bottom Video Meta Information Overlay */}
                <div className="absolute left-0 right-14 bottom-3 p-4 z-20 text-right space-y-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent rounded-b-[36px]">
                  {/* Author Name */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile?userId=${reel.author.id}`}
                      className="font-black text-sm text-white hover:text-purple-300 font-tajawal drop-shadow-md"
                    >
                      {reel.author.name}
                    </Link>
                    {reel.author.role === 'ADMIN' && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-bold shadow-xs">
                        مشرف المنصة
                      </span>
                    )}
                  </div>

                  {/* Caption */}
                  <p className="text-xs text-slate-100 font-medium leading-relaxed drop-shadow-sm line-clamp-3">
                    {reel.content}
                  </p>

                  {/* Audio Track Tag Marquee */}
                  <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-bold">
                    <Music className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{soundMeta.audioTitle} • {soundMeta.soundAuthor}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Up / Down Navigation Chevrons */}
        {reels.length > 1 && (
          <div className="hidden sm:flex absolute left-4 bottom-1/2 translate-y-1/2 flex-col gap-2 z-30">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-full bg-black/60 text-white hover:bg-purple-600 disabled:opacity-30 backdrop-blur-md transition shadow-md"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={currentIndex === reels.length - 1}
              className="p-2 rounded-full bg-black/60 text-white hover:bg-purple-600 disabled:opacity-30 backdrop-blur-md transition shadow-md"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Counter */}
      {reels.length > 0 && (
        <div className="pb-3 text-center text-xs text-slate-500 font-bold z-20">
          مقطع {currentIndex + 1} من {reels.length} (استخدم الأسهم ⬆️ ⬇️ للتنقل)
        </div>
      )}

      {/* Comments Bottom Drawer / Modal */}
      {activeCommentsReelId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
          <div className="w-full max-w-md bg-slate-900 border-t-2 sm:border-2 border-purple-500 rounded-t-[36px] sm:rounded-[36px] p-6 text-white text-right space-y-4 shadow-2xl animate-slide-up max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveCommentsReelId(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-black text-purple-300">
                التعليقات ({commentsList.length})
              </h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[180px] max-h-[360px]">
              {loadingComments ? (
                <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تحميل التعليقات...</span>
                </div>
              ) : commentsList.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  لا توجد تعليقات بعد، كن أول من يعلق على هذا المقطع! 💬
                </div>
              ) : (
                commentsList.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                      {c.author?.avatar ? (
                        <img src={c.author.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        c.author?.name?.charAt(0) || 'ط'
                      )}
                    </div>
                    <div className="flex-1 bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60">
                      <span className="text-[11px] font-black text-purple-300 block">
                        {c.author?.name}
                      </span>
                      <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="اكتب تعليقك هنا..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !newCommentText.trim()}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition shadow-sm"
              >
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Reel Modal */}
      {showCreateModal && (
        <CreateReelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onReelCreated={handleReelCreated}
        />
      )}
    </div>
  );
}
