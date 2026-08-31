'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Loader2,
  MoreVertical,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface GroupPostItem {
  id: string;
  title?: string | null;
  content: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  isPinned?: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username?: string | null;
    avatar?: string | null;
    role?: string;
    department?: string | null;
  };
  _count: {
    comments: number;
    likes: number;
  };
  isLikedByMe?: boolean;
  comments?: any[];
}

interface GroupPostCardProps {
  post: GroupPostItem;
  groupSlug: string;
}

export default function GroupPostCard({ post, groupSlug }: GroupPostCardProps) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(!!post.isLikedByMe);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post._count.comments);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleLike = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`/api/groups/${groupSlug}/posts/${post.id}/like`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleFetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/groups/${groupSlug}/posts/${post.id}/comments`);
      const data = await res.json();
      if (res.ok && data.comments) {
        setComments(data.comments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/groups/${groupSlug}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setCommentsCount((c) => c + 1);
        setCommentText('');
        if (!showComments) setShowComments(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  return (
    <article className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href={`/user/${post.author.id}`}
            className="w-11 h-11 rounded-2xl overflow-hidden bg-brand-50 dark:bg-brand-950/60 border border-slate-200 dark:border-slate-700 shrink-0 block hover:ring-2 hover:ring-brand-500 transition"
          >
            {post.author.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-sm">
                {post.author.name.charAt(0)}
              </div>
            )}
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/user/${post.author.id}`}
                className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 transition"
              >
                {post.author.name}
              </Link>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{timeAgo(post.createdAt)}</div>
          </div>
        </div>
      </div>

      {/* Post Title & Content */}
      <div className="px-5 py-2 space-y-2">
        {post.title && (
          <h4 className="text-base font-black text-slate-900 dark:text-white font-tajawal">
            {post.title}
          </h4>
        )}
        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Attached Image */}
      {post.imageUrl && (
        <div className="mt-3 px-5">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt="Attachment"
              className="w-full h-auto max-h-[450px] object-contain"
            />
          </div>
        </div>
      )}

      {/* Attached File */}
      {post.fileUrl && (
        <div className="mt-3 px-5">
          <a
            href={post.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 hover:bg-brand-50/50 transition"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-brand-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                تحميل المرفق / المذكرة
              </span>
            </div>
            <Download className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      )}

      {/* Like and comment counters */}
      <div className="px-5 py-2.5 mt-2 flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
        <span>{likesCount} إعجاب</span>
        <span>{commentsCount} تعليق</span>
      </div>

      {/* Actions */}
      <div className="px-3 py-1.5 flex items-center justify-around">
        <button
          type="button"
          onClick={handleLike}
          className={`flex-1 py-2 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
            isLiked ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          <span>{isLiked ? 'معجب' : 'إعجاب'}</span>
        </button>

        <button
          type="button"
          onClick={handleFetchComments}
          className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
        >
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <span>تعليق</span>
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-5 py-4 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="اكتب تعليقاً على هذا المنشور..."
              className="flex-1 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="p-2 rounded-2xl bg-brand-600 text-white disabled:opacity-40"
            >
              {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>

          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 pt-2">
              <Link href={`/user/${c.author.id}`} className="w-7 h-7 rounded-full overflow-hidden bg-brand-50 shrink-0 block">
                {c.author.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.author.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-brand-600">
                    {c.author.name.charAt(0)}
                  </div>
                )}
              </Link>
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs">
                <Link href={`/user/${c.author.id}`} className="font-bold block hover:text-brand-600">
                  {c.author.name}
                </Link>
                <p className="mt-0.5 text-slate-700 dark:text-slate-300">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
