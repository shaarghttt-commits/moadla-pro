'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Lock,
  Globe,
  UserPlus,
  UserCheck,
  Send,
  Loader2,
  FileText,
  Upload,
  Swords,
  Sparkles,
  ShieldCheck,
  Download,
  Share2,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GroupPostCard, { GroupPostItem } from './GroupPostCard';

interface GroupMemberItem {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    username?: string | null;
    avatar?: string | null;
    department?: string | null;
    role?: string;
    isOnline?: boolean;
  };
}

interface GroupFileItem {
  id: string;
  title: string;
  fileUrl: string;
  fileSize?: string | null;
  fileType: string;
  createdAt: string;
}

interface GroupDetails {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  icon?: string | null;
  category: string;
  isPrivate: boolean;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    avatar?: string | null;
    department?: string | null;
  };
  _count: {
    members: number;
    posts: number;
    files: number;
  };
  members: GroupMemberItem[];
  isMember?: boolean;
  myRole?: string | null;
}

interface GroupDetailsPageClientProps {
  initialGroup: GroupDetails;
}

export default function GroupDetailsPageClient({ initialGroup }: GroupDetailsPageClientProps) {
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupDetails>(initialGroup);
  const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'files' | 'games'>('feed');
  const [posts, setPosts] = useState<GroupPostItem[]>([]);
  const [files, setFiles] = useState<GroupFileItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [joining, setJoining] = useState(false);

  // New Post state
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Upload file modal/state
  const [fileTitle, setFileTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submittingFile, setSubmittingFile] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      setLoadingPosts(true);
      try {
        const res = await fetch(`/api/groups/${group.slug}/posts`);
        const data = await res.json();
        if (res.ok && data.posts) {
          setPosts(data.posts);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPosts(false);
      }
    }
    fetchPosts();
  }, [group.slug]);

  const handleFetchFiles = async () => {
    setActiveTab('files');
    setLoadingFiles(true);
    try {
      const res = await fetch(`/api/groups/${group.slug}/files`);
      const data = await res.json();
      if (res.ok && data.files) {
        setFiles(data.files);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleToggleJoin = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/groups/${group.slug}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setGroup((prev) => ({
          ...prev,
          isMember: data.isMember,
          _count: {
            ...prev._count,
            members: data.isMember ? prev._count.members + 1 : Math.max(0, prev._count.members - 1),
          },
        }));
      } else {
        alert(data.error || 'فشلت العملية');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setJoining(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postImageUrl.trim()) return;

    setSubmittingPost(true);
    try {
      const res = await fetch(`/api/groups/${group.slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim() || undefined,
          content: postContent.trim(),
          imageUrl: postImageUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.post) {
        setPosts((prev) => [data.post, ...prev]);
        setPostTitle('');
        setPostContent('');
        setPostImageUrl('');
      } else {
        alert(data.error || 'فشل نشر المنشور');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle.trim() || !fileUrl.trim()) return;

    setSubmittingFile(true);
    try {
      const res = await fetch(`/api/groups/${group.slug}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fileTitle.trim(),
          fileUrl: fileUrl.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.file) {
        setFiles((prev) => [data.file, ...prev]);
        setFileTitle('');
        setFileUrl('');
        setShowUploadModal(false);
      } else {
        alert(data.error || 'فشل إضافة الملف');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setSubmittingFile(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Group Header Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        {/* Cover */}
        <div className="relative h-44 sm:h-64 w-full bg-gradient-to-r from-brand-800 to-indigo-900 overflow-hidden">
          {group.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={group.coverImage} alt={group.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-brand-700" />
          )}

          {/* Privacy badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
            {group.isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Globe className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{group.isPrivate ? 'مجموعة خاصة' : 'مجموعة عامة'}</span>
          </div>
        </div>

        {/* Info & Join Action */}
        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 sm:-mt-20">
            {/* Icon + Title + Meta */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-right">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-slate-900 ring-4 ring-white dark:ring-slate-900 shadow-xl flex items-center justify-center text-4xl border border-slate-200 dark:border-slate-700 shrink-0">
                {group.icon || '📚'}
              </div>

              <div className="space-y-1 pt-2 sm:pt-0">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-tajawal">
                  {group.name}
                </h1>
                {group.description && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 font-semibold pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand-500" />
                    <span>{group._count.members} عضو مسجل</span>
                  </span>
                  <span>•</span>
                  <span>أنشأها: <strong>{group.creator.name}</strong></span>
                </div>
              </div>
            </div>

            {/* Join / Leave Action */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleToggleJoin}
                disabled={joining}
                className={`px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition ${
                  group.isMember
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
                }`}
              >
                {group.isMember ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span>أنت عضو بالمجموعة (مغادرة)</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>الانضمام للمجموعة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('feed')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'feed'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>الحائط والنقاشات ({posts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'members'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>الأعضاء ({group._count.members})</span>
            </button>

            <button
              type="button"
              onClick={handleFetchFiles}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'files'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>الملفات والمذكرات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('games')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'games'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Swords className="w-4 h-4" />
              <span>تحديات المجموعة ⚔️</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Feed Tab */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Feed */}
          <main className="lg:col-span-8 space-y-6">
            {/* Create Post Box */}
            {group.isMember ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft">
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="عنوان السؤال أو الموضوع (اختياري)..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="اطرح سؤالاً، شارك مسألة رياضية أو فكرة مع أعضاء المجموعة..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="url"
                    value={postImageUrl}
                    onChange={(e) => setPostImageUrl(e.target.value)}
                    placeholder="رابط صورة توضيحية / مسألة (اختياري): https://..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={submittingPost || (!postContent.trim() && !postImageUrl.trim())}
                      className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                    >
                      {submittingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>نشر بالمجموعة</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold text-center">
                انضم إلى المجموعة لتتمكن من كتابة المنشورات والمشاركة في النقاشات.
              </div>
            )}

            {/* Posts List */}
            {loadingPosts ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2 font-semibold">جاري جلب المنشورات...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-soft">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد منشورات في هذه المجموعة بعد</p>
                <p className="text-xs text-slate-400 mt-1">كن أول من يطرح سؤالاً أو مسألة!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <GroupPostCard key={post.id} post={post} groupSlug={group.slug} />
                ))}
              </div>
            )}
          </main>

          {/* Sidebar: Group Rules & Admins */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-tajawal">
                إرشادات المجموعة 📜
              </h3>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>الالتزام بالاحترام المتبادل بين جميع الطلاب.</li>
                <li>طرح الأسئلة المتعلقة بالمواد والمنهج.</li>
                <li>مشاركة الشروحات والملخصات لتعم الفائدة.</li>
                <li>يمنع نشر أي روابط دعائية أو غير تعليمية.</li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      {/* 3. Members Tab */}
      {activeTab === 'members' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
            أعضاء المجموعة ({group.members.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {group.members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3"
              >
                <Link href={`/user/${m.user.id}`} className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl overflow-hidden bg-brand-50 shrink-0 border border-slate-200 relative">
                    {m.user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.user.avatar} alt={m.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-brand-600">
                        {m.user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate hover:text-brand-600">
                      {m.user.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {m.role === 'ADMIN' ? '👑 منشئ / مسؤول' : 'عضو'}
                    </div>
                  </div>
                </Link>

                <Link
                  href={`/games?challenge=${m.user.id}`}
                  className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center hover:bg-brand-600 hover:text-white transition"
                  title="تحدي في لعبة"
                >
                  <Swords className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Files Tab */}
      {activeTab === 'files' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
                ملفات ومذكرات المجموعة ({files.length})
              </h2>
              <p className="text-xs text-slate-400">ملخصات PDF ومذكرات مشتركة بين الطلاب</p>
            </div>

            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Upload className="w-4 h-4" />
              <span>مشاركة ملف</span>
            </button>
          </div>

          {loadingFiles ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              لم يتم مشاركة أي ملفات في هذه المجموعة بعد. شارك أول ملف الآن!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{file.title}</div>
                      <div className="text-[11px] text-slate-400">{new Date(file.createdAt).toLocaleDateString('ar-EG')}</div>
                    </div>
                  </div>

                  <a
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-brand-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Group Games Challenges Tab */}
      {activeTab === 'games' && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mx-auto text-3xl shadow-sm">
            ⚔️
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">
              تحديات ومبارزات المجموعة
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تحدَّ زملاءك في المجموعة في مبارزة مباشرة في الرياضيات أو الفيزياء وحقق أعلى نتيجة في لوحة الشرف!
            </p>
          </div>

          <Link
            href="/games"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/30 transition"
          >
            <Swords className="w-4 h-4" />
            <span>الانتقال لساحة الألعاب والتحديات 🚀</span>
          </Link>
        </div>
      )}

      {/* Share File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-tajawal">
                مشاركة مذكرة أو ملف PDF بالمجموعة
              </h3>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUploadFile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم أو عنوان الملف:
                </label>
                <input
                  type="text"
                  required
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  placeholder="مثال: ملخص قوانين التكامل 2025"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رابط الملف (Google Drive / Direct Link):
                </label>
                <input
                  type="url"
                  required
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingFile}
                  className="px-5 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs"
                >
                  {submittingFile ? 'جاري المشاركة...' : 'مشاركة الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
