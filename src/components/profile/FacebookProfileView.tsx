'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  UserCheck,
  Clock,
  MessageSquare,
  Swords,
  Camera,
  Image as ImageIcon,
  Edit3,
  Users,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  Share2,
  CheckCircle2,
  FileCheck2,
  Lock,
  Flame,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatTimeAgo } from '@/lib/utils';
import CreateWallPost from './CreateWallPost';
import WallPostCard, { WallPost } from './WallPostCard';
import ProfilePhotoGallery from './ProfilePhotoGallery';
import ProfileFriendsTab from './ProfileFriendsTab';
import ProfileAchievementsTab from './ProfileAchievementsTab';
import StoryCreatorModal from '@/components/stories/StoryCreatorModal';
import StoryViewerModal, { UserStoriesGroup } from '@/components/stories/StoryViewerModal';

interface ProfileUser {
  id: string;
  name: string;
  username?: string | null;
  seatNumber?: string | null;
  avatar?: string | null;
  coverPhoto?: string | null;
  bio?: string | null;
  department?: string | null;
  yearOfStudy?: string | null;
  role?: string;
  isOnline?: boolean;
  gamePoints?: number;
  gameWins?: number;
  gameLosses?: number;
  createdAt: string;
  friendsCount?: number;
  friendshipStatus?: 'SELF' | 'FRIENDS' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'NONE';
  friendRequestId?: string | null;
  _count?: {
    authoredWallPosts?: number;
    attempts?: number;
    progress?: number;
    groupMemberships?: number;
  };
}

interface FacebookProfileViewProps {
  profileUser: ProfileUser;
}

export default function FacebookProfileView({ profileUser: initialUser }: FacebookProfileViewProps) {
  const { user: currentUser, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState<ProfileUser>(initialUser);
  const [activeTab, setActiveTab] = useState<'timeline' | 'stories' | 'photos' | 'friends' | 'achievements'>('timeline');
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(initialUser.friendshipStatus || 'NONE');
  const [requestingFriend, setRequestingFriend] = useState(false);
  
  // Cover modal state
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [savingCover, setSavingCover] = useState(false);

  // Avatar modal state
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [savingAvatar, setSavingAvatar] = useState(false);

  // Stories state
  const [userStories, setUserStories] = useState<any[]>([]);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  const isOwnProfile = currentUser?.id === profileUser.id;

  // Default gradient covers
  const presetCovers = [
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
  ];

  // Preset Avatars
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  ];

  // Fetch wall posts
  useEffect(() => {
    async function fetchWallPosts() {
      setLoadingPosts(true);
      try {
        const res = await fetch(`/api/users/${profileUser.id}/wall`);
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
    fetchWallPosts();

    async function fetchUserStories() {
      try {
        const res = await fetch(`/api/stories?userId=${profileUser.id}`);
        const data = await res.json();
        if (res.ok && data.rawStories) {
          setUserStories(data.rawStories);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchUserStories();
  }, [profileUser.id]);

  const handleFriendAction = async () => {
    if (!currentUser) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }

    setRequestingFriend(true);
    try {
      if (friendshipStatus === 'NONE') {
        const res = await fetch('/api/social/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', receiverId: profileUser.id }),
        });
        if (res.ok) setFriendshipStatus('PENDING_SENT');
      } else if (friendshipStatus === 'PENDING_SENT') {
        const res = await fetch('/api/social/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'cancel', requestId: profileUser.friendRequestId }),
        });
        if (res.ok) setFriendshipStatus('NONE');
      } else if (friendshipStatus === 'PENDING_RECEIVED') {
        const res = await fetch('/api/social/friends', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'accept', requestId: profileUser.friendRequestId }),
        });
        if (res.ok) setFriendshipStatus('FRIENDS');
      } else if (friendshipStatus === 'FRIENDS') {
        if (confirm(`هل تريد إزالة ${profileUser.name} من قائمة الأصدقاء؟`)) {
          const res = await fetch('/api/social/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'remove', friendId: profileUser.id }),
          });
          if (res.ok) setFriendshipStatus('NONE');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequestingFriend(false);
    }
  };

  const handleSaveCover = async (url: string | null) => {
    setSavingCover(true);
    try {
      const res = await fetch(`/api/users/${profileUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverPhoto: url }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileUser((prev) => ({ ...prev, coverPhoto: url }));
        if (currentUser && currentUser.id === profileUser.id) {
          updateUser({ ...currentUser, coverPhoto: url || undefined } as any);
        }
        setShowCoverModal(false);
        setCoverUrlInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCover(false);
    }
  };

  const handleSaveAvatar = async (url: string | null) => {
    setSavingAvatar(true);
    try {
      const res = await fetch(`/api/users/${profileUser.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url }),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileUser((prev) => ({ ...prev, avatar: url }));
        if (currentUser && currentUser.id === profileUser.id) {
          updateUser({ ...currentUser, avatar: url || undefined });
        }
        setShowAvatarModal(false);
        setAvatarUrlInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        handleSaveAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        handleSaveCover(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePostCreated = (newPost: WallPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const formattedJoinDate = new Date(profileUser.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Card with Facebook-style Cover & Avatar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-72 md:h-80 w-full bg-gradient-to-r from-brand-700 via-indigo-600 to-purple-800 overflow-hidden">
          {profileUser.coverPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileUser.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}

          {/* Change Cover Button (if own profile) */}
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setShowCoverModal(true)}
              className="absolute bottom-4 left-4 px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold flex items-center gap-2 backdrop-blur-md transition shadow-lg"
            >
              <Camera className="w-4 h-4" />
              <span>تعديل الغلاف</span>
            </button>
          )}
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-16 sm:-mt-20 md:-mt-24">
            {/* Avatar + Main Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-right">
              {/* Avatar with Stories Glow Ring */}
              <div className="relative group">
                <div
                  onClick={() => {
                    if (userStories.length > 0) setShowStoryViewer(true);
                  }}
                  className={`w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border-2 border-slate-200 dark:border-slate-700 shrink-0 transition-all ${
                    userStories.length > 0
                      ? 'ring-4 ring-offset-2 ring-gradient-to-r from-amber-400 via-rose-500 to-purple-600 ring-rose-500 cursor-pointer hover:scale-105 shadow-glow'
                      : 'ring-4 ring-white dark:ring-slate-900'
                  }`}
                >
                  {profileUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileUser.avatar}
                      alt={profileUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-4xl text-brand-600 bg-brand-50 dark:bg-brand-950">
                      {profileUser.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Camera Edit Button on Avatar */}
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAvatarModal(true);
                    }}
                    className="absolute bottom-1 right-1 p-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white shadow-xl border-2 border-white dark:border-slate-900 transition hover:scale-110 active:scale-95 z-20 flex items-center justify-center"
                    title="تغيير الصورة الشخصية"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}

                {userStories.length > 0 && (
                  <button
                    onClick={() => setShowStoryViewer(true)}
                    className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black text-[10px] shadow-md flex items-center gap-1 hover:scale-105 transition"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>قصة نشطة</span>
                  </button>
                )}

                {profileUser.isOnline && userStories.length === 0 && (
                  <span
                    className="w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900 absolute bottom-2 left-2 shadow"
                    title="متصل الآن"
                  />
                )}
              </div>

              {/* Names & Bio */}
              <div className="space-y-1.5 pt-2 sm:pt-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">
                    {profileUser.name}
                  </h1>
                  {profileUser.role === 'ADMIN' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-500 text-white text-xs font-bold shadow-sm">
                      مشرف المنصة
                    </span>
                  )}
                  {profileUser.seatNumber && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-black border border-indigo-200 dark:border-indigo-800 shadow-xs flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>رقم الجلوس:</span>
                      <span className="font-mono font-black">{profileUser.seatNumber}</span>
                    </span>
                  )}
                </div>

                {profileUser.bio && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium max-w-lg">
                    {profileUser.bio}
                  </p>
                )}

                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 font-semibold pt-1 flex-wrap">
                  {profileUser.department && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                      <span>{profileUser.department}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{profileUser.friendsCount || 0} صديق</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{profileUser.gamePoints || 0} نقطة XP</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center w-full md:w-auto">
              {isOwnProfile ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowStoryCreator(true)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-rose-500/20 transition hover:scale-105"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>إضافة قصة +</span>
                  </button>
                  <Link
                    href="/profile"
                    className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-600/20 transition"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>تعديل الحساب</span>
                  </Link>
                </>
              ) : (
                <>
                  {/* Friend Request Button */}
                  <button
                    type="button"
                    onClick={handleFriendAction}
                    disabled={requestingFriend}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${
                      friendshipStatus === 'FRIENDS'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600'
                        : friendshipStatus === 'PENDING_SENT'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200'
                        : friendshipStatus === 'PENDING_RECEIVED'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/20'
                    }`}
                  >
                    {friendshipStatus === 'FRIENDS' ? (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                        <span>أصدقاء ✓</span>
                      </>
                    ) : friendshipStatus === 'PENDING_SENT' ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>الطلب معلق (إلغاء)</span>
                      </>
                    ) : friendshipStatus === 'PENDING_RECEIVED' ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>قبول طلب الصداقة</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>إضافة صديق</span>
                      </>
                    )}
                  </button>

                  {/* Direct Chat */}
                  <Link
                    href={`/messages`}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>محادثة</span>
                  </Link>

                  {/* Game Duel Challenge */}
                  <Link
                    href={`/games?challenge=${profileUser.id}`}
                    className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 transition shadow-md shadow-amber-500/20"
                  >
                    <Swords className="w-4 h-4" />
                    <span>تحدي مبارزة</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Facebook-style Horizontal Navigation Tabs */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'timeline'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>المنشورات والحائط</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'stories'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>القصص النشطة ({userStories.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'photos'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>الصور والمذكرات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('friends')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'friends'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>الأصدقاء ({profileUser.friendsCount || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('achievements')}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition shrink-0 ${
                activeTab === 'achievements'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>الإنجازات والألعاب</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Tab Contents */}
      {activeTab === 'timeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: About + Quick Highlights */}
          <aside className="lg:col-span-4 space-y-6">
            {/* About Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-4">
              <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">
                نبذة عن الطالب
              </h3>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                {profileUser.department && (
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-brand-500 shrink-0" />
                    <span>يستعد لاختبارات: <strong>{profileUser.department}</strong></span>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>انضم للمنصة في: <strong>{formattedJoinDate}</strong></span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>عدد المنشورات: <strong>{posts.length} منشور</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Photos preview */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">
                  أحدث الصور
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('photos')}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  عرض الكل
                </button>
              </div>

              {posts.some((p) => p.imageUrl || (p.images && p.images.length > 0)) ? (
                <div className="grid grid-cols-3 gap-2">
                  {posts
                    .flatMap((p) => p.images || (p.imageUrl ? [p.imageUrl] : []))
                    .slice(0, 6)
                    .map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveTab('photos')}
                        className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer hover:opacity-90 transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">لا توجد صور بعد</p>
              )}
            </div>
          </aside>

          {/* Right Main Column: Post Publisher + Feed */}
          <main className="lg:col-span-8 space-y-6">
            {/* Create Post Box */}
            <CreateWallPost
              targetUserId={profileUser.id}
              targetUserName={profileUser.name}
              onPostCreated={handlePostCreated}
            />

            {/* Wall Posts Feed */}
            {loadingPosts ? (
              <div className="py-16 text-center">
                <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-3 font-semibold">جاري تحميل منشورات الحائط...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-soft">
                <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
                  الحائط فارغ حالياً
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {isOwnProfile
                    ? 'اكتب أول منشور لك، شارك زملاءك مسألة رياضية أو ملخصاً مفيداً!'
                    : `كن أول من يكتب على حائط ${profileUser.name}!`}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map((post) => (
                  <WallPostCard key={post.id} post={post} onDelete={handlePostDeleted} />
                ))}
              </div>
            )}
          </main>
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
                القصص النشطة ({userStories.length})
              </h3>
              <p className="text-xs text-slate-400">
                القصص اليومية المصورة والنصية التي تنتهي تلقائياً بعد 24 ساعة.
              </p>
            </div>

            {isOwnProfile && (
              <button
                type="button"
                onClick={() => setShowStoryCreator(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white text-xs font-black flex items-center gap-2 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>إضافة قصة +</span>
              </button>
            )}
          </div>

          {userStories.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center text-2xl">
                ✨
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                لا توجد قصص نشطة حالياً
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {isOwnProfile
                  ? 'شارك زملائك معلومة، ملخص، أو لحظة دراسية عبر نشر قصة جديدة!'
                  : 'لم يقم الطالب بنشر قصة خلال الـ 24 ساعة الماضية.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {userStories.map((story, idx) => (
                <div
                  key={story.id}
                  onClick={() => setShowStoryViewer(true)}
                  className={`h-64 rounded-3xl p-4 flex flex-col justify-between cursor-pointer group shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 relative overflow-hidden ${
                    story.type === 'TEXT'
                      ? story.bgColor || 'bg-gradient-to-br from-blue-700 to-indigo-950 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                  style={{
                    background:
                      story.type === 'IMAGE' && story.mediaUrl
                        ? `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url(${story.mediaUrl}) center/cover no-repeat`
                        : undefined,
                  }}
                >
                  <div className="relative z-10 flex items-center justify-between text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-sm text-white">
                      قصة #{idx + 1}
                    </span>
                    <span className="text-white/80">{formatTimeAgo(story.createdAt)}</span>
                  </div>

                  {story.type === 'TEXT' && (
                    <p className="relative z-10 my-auto text-center font-black text-sm text-white line-clamp-4 leading-relaxed">
                      {story.content}
                    </p>
                  )}

                  <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/20 text-[11px]">
                    <span className="font-bold text-white/90">
                      👁️ {story.viewsCount || 0} مشاهدة
                    </span>
                    <span className="font-bold text-amber-300">عرض ←</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'photos' && <ProfilePhotoGallery posts={posts} />}
      {activeTab === 'friends' && <ProfileFriendsTab userId={profileUser.id} />}
      {activeTab === 'achievements' && <ProfileAchievementsTab user={profileUser} />}

      {/* Story Creator Modal */}
      {showStoryCreator && (
        <StoryCreatorModal
          isOpen={showStoryCreator}
          onClose={() => setShowStoryCreator(false)}
          onStoryCreated={(newStory) => {
            setUserStories((prev) => [newStory, ...prev]);
            setActiveTab('stories');
          }}
        />
      )}

      {/* Story Viewer Modal */}
      {showStoryViewer && userStories.length > 0 && (
        <StoryViewerModal
          isOpen={showStoryViewer}
          initialUserIndex={0}
          groupedStories={[
            {
              user: profileUser,
              stories: userStories,
              totalStories: userStories.length,
            },
          ]}
          onClose={() => setShowStoryViewer(false)}
          onStoryDeleted={(deletedId) => {
            setUserStories((prev) => prev.filter((s) => s.id !== deletedId));
          }}
        />
      )}

      {/* Change Cover Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn font-tajawal">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-600" />
                <span>تغيير صورة الغلاف</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCoverModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Direct File Upload From Device */}
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-center space-y-2">
              <label className="block text-xs font-black text-brand-700 dark:text-brand-300">
                رفع صورة غلاف من جهازك / هاتفك:
              </label>
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md transition hover:scale-105">
                <ImageIcon className="w-4 h-4" />
                <span>اختيار صورة من الاستوديو / الملفات</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                أو اختر غلافاً جاهزاً للمذاكرة والتركيز:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presetCovers.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSaveCover(url)}
                    className="h-20 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-brand-500 cursor-pointer transition hover:scale-105"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                أو أدخل رابط صورة مباشر (URL):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={() => coverUrlInput && handleSaveCover(coverUrlInput)}
                  disabled={savingCover || !coverUrlInput}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black disabled:opacity-50 transition"
                >
                  {savingCover ? 'حفظ...' : 'حفظ الغلاف'}
                </button>
              </div>
            </div>

            {/* Remove / Reset Cover */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {profileUser.coverPhoto && (
                <button
                  type="button"
                  onClick={() => handleSaveCover(null)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                >
                  إزالة الغلاف الحالي 🗑️
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCoverModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 mr-auto"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn font-tajawal">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-600" />
                <span>تغيير الصورة الشخصية (الأفاتار)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Direct File Upload From Device */}
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-center space-y-2">
              <label className="block text-xs font-black text-brand-700 dark:text-brand-300">
                رفع صورة شخصية من جهازك / هاتفك:
              </label>
              <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md transition hover:scale-105">
                <ImageIcon className="w-4 h-4" />
                <span>اختيار صورة من الاستوديو / الملفات</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preset Avatars Grid */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                أو اختر صورة جاهزة من شخصيات الطلاب:
              </label>
              <div className="grid grid-cols-4 gap-3">
                {presetAvatars.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSaveAvatar(url)}
                    className="aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-brand-500 cursor-pointer transition hover:scale-105 shadow-sm"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                أو أدخل رابط صورة مباشر (URL):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={() => avatarUrlInput && handleSaveAvatar(avatarUrlInput)}
                  disabled={savingAvatar || !avatarUrlInput}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-black disabled:opacity-50 transition"
                >
                  {savingAvatar ? 'حفظ...' : 'حفظ الصورة'}
                </button>
              </div>
            </div>

            {/* Remove / Reset Avatar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {profileUser.avatar && (
                <button
                  type="button"
                  onClick={() => handleSaveAvatar(null)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                >
                  إزالة الصورة والرجوع للحرف الافتراضي 🗑️
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 mr-auto"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
