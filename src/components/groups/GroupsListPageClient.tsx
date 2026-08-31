'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  PlusCircle,
  Search,
  Lock,
  Globe,
  Sparkles,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  Flame,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CreateGroupModal from './CreateGroupModal';

interface GroupItem {
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
  };
  _count: {
    members: number;
    posts: number;
    files: number;
  };
  isMember?: boolean;
}

export default function GroupsListPageClient() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const categories = [
    { value: 'ALL', label: 'الكل' },
    { value: 'ENGINEERING', label: 'معادلة الهندسة' },
    { value: 'MATH', label: 'الرياضيات' },
    { value: 'PHYSICS', label: 'الفيزياء' },
    { value: 'COMMERCE', label: 'التجارة' },
    { value: 'EXAM_PREP', label: 'المراجعات' },
    { value: 'GENERAL', label: 'عام' },
  ];

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
      if (activeTab === 'my') params.set('my', 'true');

      const res = await fetch(`/api/groups?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.groups) {
        setGroups(data.groups);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [search, selectedCategory, activeTab]);

  const handleGroupCreated = (newGroup: GroupItem) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 overflow-hidden shadow-soft">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-bold backdrop-blur-md border border-white/10">
              <Users className="w-3.5 h-3.5" />
              <span>مجتمعات ومجموعات المذاكرة</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-tajawal leading-tight">
              انضم لمجموعات الطلاب وذاكر مع زملائك في نفس الشعبة
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              تبادل الأسئلة والملخصات، اطرح استفساراتك، وأنشئ مجموعتك الخاصة لمعادلة الهندسة أو التجارة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) alert('يرجى تسجيل الدخول لإنشاء مجموعة');
              else setShowCreateModal(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/30 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إنشاء مجموعة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Main Tabs (All Groups vs My Groups) */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              جميع المجموعات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('my')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'my'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              مجموعاتي
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن اسم مجموعة أو مادة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setSelectedCategory(c.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedCategory === c.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-3 font-semibold">جاري استعراض المجموعات...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-16 text-center shadow-soft">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
            👥
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'my' ? 'لم تنضم إلى أي مجموعة بعد' : 'لا توجد مجموعات تطابق البحث'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            كن أول من ينشئ مجموعة لشعبتك أو مادتك وادعُ أصدقاءك للمذاكرة المشتركة!
          </p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-5 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition shadow-md shadow-brand-600/20"
          >
            إنشاء مجموعة الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-soft-lg transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-32 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  {group.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-brand-600 to-indigo-600" />
                  )}

                  {/* Icon badge */}
                  <div className="absolute -bottom-4 right-4 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center text-xl shadow-md">
                    {group.icon || '📚'}
                  </div>

                  {/* Privacy badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-md flex items-center gap-1">
                    {group.isPrivate ? <Lock className="w-3 h-3 text-amber-400" /> : <Globe className="w-3 h-3 text-emerald-400" />}
                    <span>{group.isPrivate ? 'خاصة' : 'عامة'}</span>
                  </div>
                </div>

                {/* Group Details */}
                <div className="p-5 pt-7 space-y-2.5">
                  <Link
                    href={`/groups/${group.slug}`}
                    className="font-black text-base text-slate-900 dark:text-white font-tajawal hover:text-brand-600 transition block line-clamp-1"
                  >
                    {group.name}
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                    {group.description || 'مجموعة دراسية لمشاركة الملاحظات ومراجعات الامتحانات.'}
                  </p>

                  <div className="flex items-center gap-3 pt-2 text-xs text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-brand-500" />
                      <span>{group._count.members} عضو</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                      <span>{group._count.posts} منشور</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{group._count.files} ملف</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer CTA */}
              <div className="p-5 pt-0">
                <Link
                  href={`/groups/${group.slug}`}
                  className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-brand-600 hover:text-white text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200/60 dark:border-slate-700 transition"
                >
                  <span>{group.isMember ? 'دخول المجموعة' : 'عرض المجموعة والانضمام'}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}
