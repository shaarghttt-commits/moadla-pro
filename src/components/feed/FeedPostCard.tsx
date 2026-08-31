'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Trash2,
  Pin,
  Flame,
  Lightbulb,
  ThumbsUp,
  Smile,
  Send,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Check,
  Award,
  Mic,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatTimeAgo } from '@/lib/utils';
import AudioPlayer from '@/components/common/AudioPlayer';
import AudioRecorder from '@/components/common/AudioRecorder';

export interface FeedPost {
  id: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    username?: string | null;
    avatar?: string | null;
    role?: string;
    department?: string | null;
    yearOfStudy?: string | null;
    currentStreak?: number;
  };
  targetUserId?: string | null;
  targetUser?: {
    id: string;
    name: string;
    username?: string | null;
    avatar?: string | null;
  } | null;
  content: string;
  imageUrl?: string | null;
  images?: string[];
  fileUrl?: string | null;
  audioUrl?: string | null;
  audioDuration?: number | null;
  subjectTag?: string | null;
  moodEmoji?: string | null;
  isPinned?: boolean;
  createdAt: string;
  _count: {
    comments: number;
    likes: number;
  };
  isLikedByMe?: boolean;
  myReaction?: string | null;
  reactionCounts?: Record<string, number>;
  topReactions?: string[];
  comments?: any[];
}

interface FeedPostCardProps {
  post: FeedPost;
  onPostDeleted?: (postId: string) => void;
}

const REACTIONS_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  LIKE: { label: 'إعجاب', emoji: '👍', color: 'text-blue-500' },
  LOVE: { label: 'أحببته', emoji: '❤️', color: 'text-rose-500' },
  FIRE: { label: 'رائع', emoji: '🔥', color: 'text-amber-500' },
  GENIUS: { label: 'عبقري', emoji: '💡', color: 'text-yellow-400' },
  CLAP: { label: 'تصفيق', emoji: '👏', color: 'text-emerald-500' },
  LAUGH: { label: 'مضحك', emoji: '😂', color: 'text-amber-400' },
};

const SUBJECT_TAGS_MAP: Record<string, { label: string; color: string }> = {
  calculus: { label: '📐 تفاضل وتكامل', color: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  physics: { label: '⚡ فيزياء', color: 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  mechanics: { label: '⚙️ ميكانيكا', color: 'bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  algebra: { label: '🔢 جبر وفراغية', color: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  exams: { label: '📋 امتحانات وتوقعات', color: 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800' },
  general: { label: '🌐 نقاش عام', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
};

export default function FeedPostCard({ post, onPostDeleted }: FeedPostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLikedByMe || false);
  const [myReaction, setMyReaction] = useState<string | null>(post.myReaction || (post.isLikedByMe ? 'LIKE' : null));
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isAuthor = user?.id === post.authorId;
  const images = post.images || (post.imageUrl ? [post.imageUrl] : []);

  const handleReact = async (type: string) => {
    setShowReactionPicker(false);

    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }

    const prevLiked = isLiked;
    const prevReaction = myReaction;
    const prevCount = likesCount;

    if (isLiked && myReaction === type) {
      setIsLiked(false);
      setMyReaction(null);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      if (!isLiked) setLikesCount((c) => c + 1);
      setIsLiked(true);
      setMyReaction(type);
    }

    try {
      const res = await fetch(`/api/users/wall/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!res.ok) {
        setIsLiked(prevLiked);
        setMyReaction(prevReaction);
        setLikesCount(prevCount);
      }
    } catch {
      setIsLiked(prevLiked);
      setMyReaction(prevReaction);
      setLikesCount(prevCount);
    }
  };

  const handleToggleComments = async () => {
    setShowComments((prev) => !prev);
    if (!showComments && comments.length === 0) {
      try {
        const res = await fetch(`/api/users/wall/posts/${post.id}/comments`);
        const data = await res.json();
        if (res.ok && data.comments) {
          setComments(data.comments);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!user) {
      alert('يرجى تسجيل الدخول للتعليق');
      return;
    }

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/users/wall/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setCommentInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAddVoiceComment = async (audioUrl: string, duration: number) => {
    if (!user) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/users/wall/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '🎙️ ملاحظة صوتية',
          audioUrl,
          audioDuration: duration,
        }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setShowVoiceRecorder(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المنشور؟')) return;

    try {
      const res = await fetch(`/api/users/wall/posts/${post.id}`, {
        method: 'DELETE',
      });
      if (res.ok && onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/user/${post.authorId}#post-${post.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentReactionInfo = myReaction ? REACTIONS_MAP[myReaction] : REACTIONS_MAP.LIKE;
  const tagInfo = post.subjectTag ? SUBJECT_TAGS_MAP[post.subjectTag] || SUBJECT_TAGS_MAP.general : null;

  return (
    <article
      id={`post-${post.id}`}
      className="glass-card rounded-[28px] p-5 sm:p-6 shadow-soft hover:shadow-card-hover transition-all duration-300 relative border border-slate-200/80 dark:border-slate-800"
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/user/${post.author.id}`} className="group/avatar relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 overflow-hidden flex items-center justify-center text-white font-bold text-base shadow-sm ring-2 ring-transparent group-hover/avatar:ring-brand-500 transition-all">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                post.author.name?.charAt(0) || 'U'
              )}
            </div>
          </Link>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/user/${post.author.id}`}
                className="font-black text-sm text-slate-900 dark:text-white font-tajawal hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                {post.author.name}
              </Link>
              {post.author.role === 'ADMIN' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                  مشرف
                </span>
              )}
              {post.author.currentStreak && post.author.currentStreak > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-black flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{post.author.currentStreak}d</span>
                </span>
              )}
              {post.moodEmoji && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {post.moodEmoji}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
              <span>{formatTimeAgo(post.createdAt)}</span>
              <span>•</span>
              <span>{post.author.department || 'طالب معادلة'}</span>
            </div>
          </div>
        </div>

        {/* Right tags / options */}
        <div className="flex items-center gap-2">
          {tagInfo && (
            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border ${tagInfo.color}`}>
              {tagInfo.label}
            </span>
          )}

          {(isAuthor || user?.role === 'ADMIN') && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showOptions && (
                <div className="absolute left-0 top-full mt-1 w-36 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30 animate-fade-in">
                  <button
                    onClick={handleDeletePost}
                    className="w-full px-3 py-2 text-right text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف المنشور</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-3 mb-4">
        <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-semibold leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Audio Player if post has audio */}
        {post.audioUrl && (
          <div className="pt-2">
            <AudioPlayer src={post.audioUrl} duration={post.audioDuration || 0} />
          </div>
        )}

        {/* Multi-Image Gallery Grid */}
        {images.length > 0 && (
          <div
            className={`rounded-2xl overflow-hidden gap-1.5 mt-3 ${
              images.length === 1
                ? 'grid grid-cols-1 max-h-[480px]'
                : images.length === 2
                ? 'grid grid-cols-2 max-h-80'
                : 'grid grid-cols-2 sm:grid-cols-3 max-h-96'
            }`}
          >
            {images.map((img, idx) => (
              <a
                key={idx}
                href={img}
                target="_blank"
                rel="noreferrer"
                className="relative group/img block overflow-hidden bg-slate-950 h-full"
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary Bar */}
      <div className="flex items-center justify-between py-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 font-bold">
        <div className="flex items-center gap-1.5">
          {likesCount > 0 && (
            <div className="flex items-center -space-x-1">
              <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                👍
              </span>
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                ❤️
              </span>
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                🔥
              </span>
            </div>
          )}
          <span>{likesCount} تفاعل</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleToggleComments} className="hover:underline">
            {comments.length || post._count?.comments || 0} تعليق
          </button>
          <span>•</span>
          <span>مشاركة</span>
        </div>
      </div>

      {/* Action Buttons with Facebook-style Reaction Picker */}
      <div className="relative flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
        {/* Reactions Popover */}
        {showReactionPicker && (
          <div
            onMouseLeave={() => setShowReactionPicker(false)}
            className="absolute bottom-full right-0 mb-2 p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center gap-1.5 z-40 animate-scale-up"
          >
            {Object.entries(REACTIONS_MAP).map(([key, r]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleReact(key)}
                title={r.label}
                className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-2xl flex items-center justify-center transition-transform hover:scale-130 active:scale-95"
              >
                {r.emoji}
              </button>
            ))}
          </div>
        )}

        {/* 1. Like / React Button */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionPicker(true)}
        >
          <button
            type="button"
            onClick={() => handleReact(myReaction || 'LIKE')}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition hover:bg-slate-100 dark:hover:bg-slate-800/60 ${
              isLiked ? currentReactionInfo.color : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <span className="text-base">{isLiked ? currentReactionInfo.emoji : '👍'}</span>
            <span>{isLiked ? currentReactionInfo.label : 'إعجاب'}</span>
          </button>
        </div>

        {/* 2. Comment Button */}
        <button
          type="button"
          onClick={handleToggleComments}
          className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2 transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>تعليق</span>
        </button>

        {/* 3. Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-center gap-2 transition"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">تم النسخ!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>مشاركة</span>
            </>
          )}
        </button>
      </div>

      {/* Expandable Threaded Comments Section with Voice Notes */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-fade-in">
          {/* Add Comment / Voice Note Box */}
          {showVoiceRecorder ? (
            <div className="p-2">
              <AudioRecorder
                onAudioRecorded={handleAddVoiceComment}
                onCancel={() => setShowVoiceRecorder(false)}
              />
            </div>
          ) : (
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="اكتب تعليقاً..."
                className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              {/* Voice Note Button */}
              <button
                type="button"
                onClick={() => setShowVoiceRecorder(true)}
                title="تسجيل ملاحظة صوتية"
                className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-950/70 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition shrink-0"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!commentInput.trim() || submittingComment}
                className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال</span>
              </button>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-2.5 pt-2">
            {comments.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-3">
                لا توجد تعليقات بعد. كن أول من يعلق! ✍️
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2.5">
                  <Link href={`/user/${comment.author.id}`} className="shrink-0 mt-1">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-[10px]">
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        comment.author.name?.charAt(0) || 'U'
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/user/${comment.author.id}`}
                          className="text-xs font-black text-slate-900 dark:text-white font-tajawal hover:underline"
                        >
                          {comment.author.name}
                        </Link>
                        {comment.author.currentStreak && comment.author.currentStreak > 0 && (
                          <span className="text-[10px] text-amber-500 font-bold">
                            🔥 {comment.author.currentStreak}d
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>

                    {comment.content && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {comment.content}
                      </p>
                    )}

                    {/* Voice Comment Audio Player */}
                    {comment.audioUrl && (
                      <div className="pt-1">
                        <AudioPlayer src={comment.audioUrl} duration={comment.audioDuration || 0} compact />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
}
