'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Send,
  Loader2,
  CornerDownLeft,
  X,
  ExternalLink,
  Flame,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CommentAuthor {
  id: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  role?: string;
  department?: string | null;
}

interface WallComment {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  replies?: WallComment[];
}

export interface WallPost {
  id: string;
  content: string;
  imageUrl?: string | null;
  images?: string[];
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
  targetUser?: {
    id: string;
    name: string;
    username?: string | null;
    avatar?: string | null;
  } | null;
  _count: {
    comments: number;
    likes: number;
  };
  isLikedByMe?: boolean;
  myReaction?: string | null;
  comments?: WallComment[];
}

interface WallPostCardProps {
  post: WallPost;
  onDelete?: (postId: string) => void;
}

export default function WallPostCard({ post, onDelete }: WallPostCardProps) {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(!!post.isLikedByMe);
  const [reactionType, setReactionType] = useState<string | null>(post.myReaction || (post.isLikedByMe ? 'LIKE' : null));
  const [showReactionsMenu, setShowReactionsMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<WallComment[]>(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post._count.comments);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<WallComment | null>(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const images = post.images && post.images.length > 0
    ? post.images
    : post.imageUrl
    ? [post.imageUrl]
    : [];

  const isAuthor = user?.id === post.author.id;
  const isAdmin = user?.role === 'ADMIN';
  const canDelete = isAuthor || isAdmin || (post.targetUser && user?.id === post.targetUser.id);

  const handleLike = async (type: string = 'LIKE') => {
    if (!user) {
      alert('يرجى تسجيل الدخول للتفاعل مع المنشور');
      return;
    }

    const prevLiked = isLiked;
    const prevType = reactionType;
    const prevCount = likesCount;

    if (prevLiked && prevType === type) {
      setIsLiked(false);
      setReactionType(null);
      setLikesCount((c) => Math.max(0, c - 1));
    } else {
      setIsLiked(true);
      setReactionType(type);
      if (!prevLiked) setLikesCount((c) => c + 1);
    }
    setShowReactionsMenu(false);

    try {
      const res = await fetch(`/api/users/wall/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsLiked(data.isLiked);
        setReactionType(data.reactionType);
        setLikesCount(data.likesCount);
      }
    } catch {
      // Revert on error
      setIsLiked(prevLiked);
      setReactionType(prevType);
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
      const res = await fetch(`/api/users/wall/posts/${post.id}/comments`);
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
    if (!user) {
      alert('يرجى تسجيل الدخول للتعليق');
      return;
    }
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/users/wall/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          parentId: replyingTo?.id || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.comment) {
        if (replyingTo) {
          // Add reply to target parent comment
          setComments((prev) =>
            prev.map((c) =>
              c.id === replyingTo.id
                ? { ...c, replies: [...(c.replies || []), data.comment] }
                : c
            )
          );
          setReplyingTo(null);
        } else {
          setComments((prev) => [...prev, data.comment]);
        }
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

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/wall/posts/${post.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete?.(post.id);
      } else {
        alert('فشل حذف المنشور');
      }
    } catch {
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(false);
      setShowOptionsMenu(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/user/${post.author.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getReactionIcon = () => {
    if (!isLiked) return <Heart className="w-4 h-4" />;
    switch (reactionType) {
      case 'LOVE':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'FIRE':
        return <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'WOW':
        return <Sparkles className="w-4 h-4 text-purple-500 fill-purple-500" />;
      default:
        return <ThumbsUp className="w-4 h-4 text-brand-600 fill-brand-600" />;
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
    <article className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden transition-all hover:shadow-soft-lg">
      {/* Header: Author + Meta */}
      <div className="p-5 pb-3 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Link
            href={`/user/${post.author.id}`}
            className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-50 dark:bg-brand-950/60 border border-slate-200 dark:border-slate-700 shrink-0 block hover:ring-2 hover:ring-brand-500 transition"
          >
            {post.author.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-brand-600 dark:text-brand-400">
                {post.author.name.charAt(0)}
              </div>
            )}
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/user/${post.author.id}`}
                className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition"
              >
                {post.author.name}
              </Link>

              {post.author.role === 'ADMIN' && (
                <span className="px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-[10px] font-extrabold border border-brand-200 dark:border-brand-800">
                  مشرف
                </span>
              )}

              {post.targetUser && post.targetUser.id !== post.author.id && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <span>◀</span>
                  <Link
                    href={`/user/${post.targetUser.id}`}
                    className="font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600"
                  >
                    {post.targetUser.name}
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{timeAgo(post.createdAt)}</span>
              {post.author.department && (
                <>
                  <span>•</span>
                  <span>{post.author.department}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showOptionsMenu && (
            <div className="absolute left-0 top-9 w-40 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 z-20 animate-fadeIn">
              <button
                type="button"
                onClick={handleShare}
                className="w-full px-3 py-2 rounded-xl text-right text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>

              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full px-3 py-2 rounded-xl text-right text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deleting ? 'جاري الحذف...' : 'حذف المنشور'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <div className="px-5 py-2 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line break-words font-medium">
          {post.content}
        </div>
      )}

      {/* Post Images Grid (Facebook Style) */}
      {images.length > 0 && (
        <div className="mt-3 px-5">
          {images.length === 1 ? (
            <div
              onClick={() => setActiveLightboxImg(images[0])}
              className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer max-h-[450px] flex items-center justify-center group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0]}
                alt="Post attachment"
                className="w-full h-auto max-h-[450px] object-contain group-hover:scale-[1.01] transition duration-300"
              />
            </div>
          ) : images.length === 2 ? (
            <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden">
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveLightboxImg(img)}
                  className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              {images.slice(0, 3).map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveLightboxImg(img)}
                  className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer relative group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Attachment ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {i === 2 && images.length > 3 && (
                    <div className="absolute inset-0 bg-slate-900/70 text-white flex items-center justify-center font-black text-lg">
                      +{images.length - 3}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
        >
          <button
            type="button"
            onClick={() => setActiveLightboxImg(null)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeLightboxImg}
            alt="Full preview"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

      {/* Likes & Comments Counters */}
      <div className="px-5 py-2.5 mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {likesCount > 0 && (
            <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">
                ❤️
              </span>
              <span>{likesCount} تفاعل</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleFetchComments}
            className="hover:underline font-semibold"
          >
            {commentsCount} تعليق
          </button>
        </div>
      </div>

      {/* Interactive Action Bar (Like, Comment, Share) */}
      <div className="px-3 py-1.5 flex items-center justify-around relative">
        {/* Reactions floating tooltip menu */}
        {showReactionsMenu && (
          <div
            onMouseLeave={() => setShowReactionsMenu(false)}
            className="absolute bottom-11 right-4 flex items-center gap-2 p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl z-30 animate-bounce-short"
          >
            <button
              type="button"
              onClick={() => handleLike('LIKE')}
              className="hover:scale-125 transition text-lg"
              title="أعجبني"
            >
              👍
            </button>
            <button
              type="button"
              onClick={() => handleLike('LOVE')}
              className="hover:scale-125 transition text-lg"
              title="أحببته"
            >
              ❤️
            </button>
            <button
              type="button"
              onClick={() => handleLike('FIRE')}
              className="hover:scale-125 transition text-lg"
              title="نار / حماس"
            >
              🔥
            </button>
            <button
              type="button"
              onClick={() => handleLike('WOW')}
              className="hover:scale-125 transition text-lg"
              title="مبهر"
            >
              💡
            </button>
          </div>
        )}

        {/* Like Button */}
        <button
          type="button"
          onClick={() => handleLike(reactionType || 'LIKE')}
          onMouseEnter={() => setShowReactionsMenu(true)}
          className={`flex-1 py-2 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
            isLiked
              ? 'text-brand-600 dark:text-brand-400'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {getReactionIcon()}
          <span>{isLiked ? (reactionType === 'LOVE' ? 'أحببته' : reactionType === 'FIRE' ? 'حماسي' : 'معجب') : 'إعجاب'}</span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={handleFetchComments}
          className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
        >
          <MessageCircle className="w-4 h-4 text-blue-500" />
          <span>تعليق</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
        >
          <Share2 className="w-4 h-4 text-emerald-500" />
          <span>{copied ? 'تم النسخ' : 'مشاركة'}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 py-4 bg-slate-50/70 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="space-y-2">
            {replyingTo && (
              <div className="flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 p-2 rounded-xl">
                <span>الرد على تعليق: <strong>{replyingTo.author.name}</strong></span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="hover:opacity-70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900 text-brand-600 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'أ'
                )}
              </div>

              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? `اكتب ردك هنا...` : `اكتب تعليقاً...`}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400"
              />

              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="p-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-40"
              >
                {submittingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {loadingComments ? (
            <div className="py-4 text-center">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin mx-auto" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">كن أول من يعلق على هذا المنشور!</p>
          ) : (
            <div className="space-y-3 pt-1">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Link
                      href={`/user/${comment.author.id}`}
                      className="w-7 h-7 rounded-full overflow-hidden bg-brand-50 dark:bg-brand-950 shrink-0 block"
                    >
                      {comment.author.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={comment.author.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-brand-600">
                          {comment.author.name.charAt(0)}
                        </div>
                      )}
                    </Link>

                    <div className="flex-1">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 inline-block max-w-full">
                        <Link
                          href={`/user/${comment.author.id}`}
                          className="font-bold text-xs text-slate-900 dark:text-white hover:text-brand-600 block"
                        >
                          {comment.author.name}
                        </Link>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 px-2 mt-1 text-[10px] text-slate-400">
                        <span>{timeAgo(comment.createdAt)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(comment);
                          }}
                          className="font-bold text-slate-500 hover:text-brand-600"
                        >
                          رد
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mr-8 space-y-2 border-r-2 border-slate-200 dark:border-slate-700 pr-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <Link
                            href={`/user/${reply.author.id}`}
                            className="w-6 h-6 rounded-full overflow-hidden bg-brand-50 shrink-0 block"
                          >
                            {reply.author.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={reply.author.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-[9px] text-brand-600">
                                {reply.author.name.charAt(0)}
                              </div>
                            )}
                          </Link>
                          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 inline-block">
                            <Link
                              href={`/user/${reply.author.id}`}
                              className="font-bold text-[11px] text-slate-900 dark:text-white hover:text-brand-600 block"
                            >
                              {reply.author.name}
                            </Link>
                            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
