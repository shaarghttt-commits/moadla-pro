'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  Clock,
  Users,
  Swords,
  BookOpen,
  Trophy,
  Filter,
  TrendingUp,
  Image as ImageIcon,
  Compass,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StoriesTray from '@/components/stories/StoriesTray';
import CreateFeedPost from './CreateFeedPost';
import FeedPostCard, { FeedPost } from './FeedPostCard';
import StudyStreakWidget from '@/components/common/StudyStreakWidget';

export default function CommunityFeedClient() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'friends' | 'media'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [suggestedGroups, setSuggestedGroups] = useState<any[]>([]);
  const [trendingTags, setTrendingTags] = useState<any[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Record<string, boolean>>({});

  const fetchFeed = async () => {
    setLoadingPosts(true);
    try {
      const query = new URLSearchParams();
      query.set('tab', activeTab);
      if (selectedSubject !== 'ALL') {
        query.set('subject', selectedSubject);
      }

      const res = await fetch(`/api/feed?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setPosts(data.posts || []);
        if (data.topStudents) setTopStudents(data.topStudents);
        if (data.suggestedGroups) setSuggestedGroups(data.suggestedGroups);
        if (data.trendingTags) setTrendingTags(data.trendingTags);
      }
    } catch (e) {
      console.error('Error fetching feed:', e);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [activeTab, selectedSubject]);

  const handlePostCreated = (newPost: FeedPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleJoinGroup = async (groupSlug: string, groupId: string) => {
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }

    try {
      const res = await fetch(`/api/groups/${groupSlug}/join`, { method: 'POST' });
      if (res.ok) {
        setJoinedGroups((prev) => ({ ...prev, [groupId]: true }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Welcome & Stories Hero Bar */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 text-xs font-black border border-brand-200/60 dark:border-brand-800/60 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>مجتمع طلاب معادلة الهندسة</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">
              الرئيسية والمجتمع الطلابي 🌐
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              تصفح قصص زملائك اليومية، شارك استفساراتك ومسائلك، وتفاعل مع المتفوقين في المعادلة.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/games"
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-2 transition hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              <span>مبارزة سريعة 🎮</span>
            </Link>
            <Link
              href="/groups"
              className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center gap-2 transition"
            >
              <Users className="w-4 h-4" />
              <span>المجموعات</span>
            </Link>
          </div>
        </div>

        {/* Stories Horizontal Tray */}
        <StoriesTray />
      </div>

      {/* 3-Column Feed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= RIGHT SIDEBAR: Profile Card & Shortcuts (3 cols) ================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          {/* User Mini Profile Card */}
          {user ? (
            <div className="glass-card rounded-[28px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 overflow-hidden flex items-center justify-center text-white font-black text-base shadow-md">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || 'U'
                  )}
                </div>
                <div className="overflow-hidden">
                  <Link
                    href="/profile"
                    className="font-black text-sm text-slate-900 dark:text-white font-tajawal hover:text-brand-600 truncate block"
                  >
                    {user.name}
                  </Link>
                  <p className="text-[11px] text-slate-400 font-medium truncate">
                    {user.department || 'طالب معادلة الهندسة'}
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <p className="text-[10px] text-slate-400 font-bold">نقاط الألعاب</p>
                  <p className="text-base font-black text-amber-500 font-tajawal">
                    {user.gamePoints || 0} ⚡
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                  <p className="text-[10px] text-slate-400 font-bold">انتصارات</p>
                  <p className="text-base font-black text-emerald-500 font-tajawal">
                    {user.gameWins || 0} 🏆
                  </p>
                </div>
              </div>

              <Link
                href="/profile"
                className="w-full py-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/80 hover:bg-brand-600 hover:text-white text-brand-600 dark:text-brand-400 text-xs font-black flex items-center justify-center gap-2 transition-all"
              >
                <span>عرض ملفي الشخصي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : null}

          {/* Study Streaks Widget */}
          <StudyStreakWidget />

          {/* Quick Shortcuts */}
          <div className="glass-card rounded-[28px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 px-1">
              روابط ومسارات سريعة
            </h3>

            <Link
              href="/games"
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center font-bold">
                🎮
              </div>
              <span className="text-xs font-black group-hover:text-brand-600 transition">
                ساحة الألعاب والمبارزات
              </span>
            </Link>

            <Link
              href="/groups"
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-brand-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-xs font-black group-hover:text-brand-600 transition">
                المجموعات الدراسية
              </span>
            </Link>

            <Link
              href="/exams"
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-black group-hover:text-brand-600 transition">
                بنك الامتحانات الشاملة
              </span>
            </Link>
          </div>
        </aside>

        {/* ================= CENTER COLUMN: Main Feed Stream (6 cols) ================= */}
        <main className="lg:col-span-6 space-y-6">
          {/* Post Creator Box */}
          <CreateFeedPost onPostCreated={handlePostCreated} />

          {/* Feed Filter Tabs */}
          <div className="glass-card rounded-[24px] p-2 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>الكل</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'trending'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>الأكثر تفاعلاً</span>
              </button>

              {user && (
                <button
                  type="button"
                  onClick={() => setActiveTab('friends')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'friends'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>الزملاء</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>صور ومذكرات</span>
              </button>
            </div>

            {/* Subject Filter Tag Dropdown */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border-none focus:outline-none cursor-pointer shrink-0"
            >
              <option value="ALL">جميع المواد</option>
              <option value="calculus">تفاضل وتكامل</option>
              <option value="physics">فيزياء</option>
              <option value="mechanics">ميكانيكا</option>
              <option value="algebra">جبر وفراغية</option>
              <option value="exams">امتحانات وتوقعات</option>
            </select>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {loadingPosts ? (
              // Skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[28px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 h-48 animate-pulse"
                />
              ))
            ) : posts.length === 0 ? (
              <div className="glass-card rounded-[28px] p-12 text-center border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-3xl">
                  ✨
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal">
                  لا توجد منشورات في هذا القسم حالياً
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  كن أول من يبدأ النقاش في مجتمع طلاب المعادلة واطرح سؤالاً أو معلومة تهم زملائك!
                </p>
              </div>
            ) : (
              posts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                />
              ))
            )}
          </div>
        </main>

        {/* ================= LEFT SIDEBAR: Top Active Students & Trending Groups (3 cols) ================= */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 sticky top-24">
          {/* Top Students / Leaderboard Widget */}
          <div className="glass-card rounded-[28px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                  نجوم الأسبوع المتفوقون
                </h3>
              </div>
              <Link href="/games" className="text-[10px] font-bold text-brand-600 hover:underline">
                الترتيب الكامل ←
              </Link>
            </div>

            <div className="space-y-2.5">
              {topStudents.map((st, idx) => (
                <Link
                  key={st.id}
                  href={`/user/${st.id}`}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-center text-xs font-black text-slate-400 group-hover:text-amber-500">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-brand-500 overflow-hidden flex items-center justify-center text-white font-bold text-xs">
                      {st.avatar ? (
                        <img src={st.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        st.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600">
                        {st.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {st.department || 'طالب معادلة'}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 text-[10px] font-black shrink-0">
                    {st.gamePoints || 0} نقطة
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Trending Topics & Hashtags */}
          <div className="glass-card rounded-[28px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <h3 className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                مواضيع دراسية متداولة
              </h3>
            </div>

            <div className="space-y-1.5">
              {trendingTags.map((tag) => (
                <button
                  key={tag.tag}
                  type="button"
                  onClick={() => setSelectedSubject(tag.tag)}
                  className="w-full p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-right flex items-center justify-between transition group"
                >
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition">
                      {tag.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{tag.count} منشور ونقاش</p>
                  </div>
                  <span className="text-slate-300 group-hover:text-brand-500">←</span>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Study Groups */}
          <div className="glass-card rounded-[28px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                  مجموعات دراسية مقترحة
                </h3>
              </div>
              <Link href="/groups" className="text-[10px] font-bold text-brand-600 hover:underline">
                استعراض الكل ←
              </Link>
            </div>

            <div className="space-y-3">
              {suggestedGroups.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                      {g.icon || '📚'}
                    </div>
                    <div className="overflow-hidden">
                      <Link
                        href={`/groups/${g.slug}`}
                        className="text-xs font-black text-slate-900 dark:text-white truncate block hover:text-brand-600"
                      >
                        {g.name}
                      </Link>
                      <p className="text-[10px] text-slate-400">
                        {g._count?.members || 0} عضو
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleJoinGroup(g.slug, g.id)}
                    disabled={joinedGroups[g.id]}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition shrink-0 ${
                      joinedGroups[g.id]
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
                        : 'bg-brand-600 hover:bg-brand-700 text-white'
                    }`}
                  >
                    {joinedGroups[g.id] ? 'منضم ✓' : 'انضمام +'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
