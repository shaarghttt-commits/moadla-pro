"use client";
import React, { useState } from 'react';

export default function PostCard({ post, onLiked }: { post: any; onLiked?: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  async function toggleLike() {
    try {
      const res = await fetch(`/api/discussion/posts/${post.id}/like`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'error');
      setLiked(data.liked);
      setLikesCount((c: number) => (data.liked ? c + 1 : Math.max(0, c - 1)));
      onLiked?.();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <article className="bg-white rounded-lg p-4 shadow-sm mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600">{
            post.author?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              (post.author?.name || 'مستخدم').charAt(0)
            )
          }</div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-base">{post.author?.name || 'مستخدم'}</div>
              <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-sm text-gray-500">{likesCount} إعجاب · {post._count?.comments || 0} تعليق</div>
          </div>
          {post.title ? <h3 className="mt-3 text-lg font-medium">{post.title}</h3> : null}
          <p className="mt-2 text-gray-800 whitespace-pre-wrap">{post.content}</p>
          {/* media rendering */}
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.imageUrl} alt="post-image" className="mt-3 max-w-full rounded" />
          ) : post.fileUrl ? (
            <div className="mt-3 border p-3 rounded bg-gray-50">
              {(() => {
                const parts = String(post.fileUrl).split('.');
                const ext = parts.length ? parts.pop()?.toLowerCase() : '';
                if (ext === 'pdf') {
                  return (
                    <div>
                      <iframe src={post.fileUrl} className="w-full h-56" title="pdf-preview" />
                      <div className="mt-2 text-sm">
                        <a href={post.fileUrl} target="_blank" rel="noreferrer" className="text-sky-600">فتح / تحميل الملف (PDF)</a>
                      </div>
                    </div>
                  );
                }
                return (
                  <a href={post.fileUrl} target="_blank" rel="noreferrer" className="text-sky-600">تحميل الملف</a>
                );
              })()}
            </div>
          ) : null}
          <div className="mt-4 flex gap-3">
            <button onClick={toggleLike} className="text-sm text-emerald-600 hover:underline">
              {liked ? 'إلغاء الإعجاب' : 'أعجبني'}
            </button>
            <button onClick={() => setShowComments((s) => !s)} className="text-sm text-slate-600 hover:underline">
              {post._count?.comments || comments.length} تعليق
            </button>
          </div>
        </div>
      </div>
      {showComments && (
        <div className="mt-3 border-t pt-3">
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 p-2 rounded">
                <div className="text-xs text-gray-600">{c.author?.name || 'مستخدم'} · {new Date(c.createdAt).toLocaleString()}</div>
                <div className="mt-1">{c.content}</div>
              </div>
            ))}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!commentText.trim()) return;
              setPostingComment(true);
              try {
                const res = await fetch('/api/discussion/comments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ postId: post.id, content: commentText }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || 'خطأ');
                // refresh comments by fetching post
                const p = await fetch(`/api/discussion/posts/${post.id}`);
                const pj = await p.json();
                setComments(pj.post?.comments || []);
                setCommentText('');
              } catch (err) {
                console.error('comment submit', err);
                const msg = (err as any)?.message || 'خطأ في إضافة التعليق';
                alert(msg);
              } finally {
                setPostingComment(false);
              }
            }}
            className="mt-3"
          >
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-2 border rounded" rows={2} placeholder="اكتب تعليقًا..." />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={postingComment} className="px-3 py-1 bg-sky-600 text-white rounded text-sm">
                {postingComment ? 'جارٍ...' : 'أضف تعليق'}
              </button>
            </div>
          </form>
        </div>
      )}
    </article>
  );
}
