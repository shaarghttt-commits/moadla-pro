'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Flame, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StoryCreatorModal from './StoryCreatorModal';
import StoryViewerModal, { UserStoriesGroup } from './StoryViewerModal';

interface StoriesTrayProps {
  onStoryCountChange?: (count: number) => void;
}

export default function StoriesTray({ onStoryCountChange }: StoriesTrayProps) {
  const { user } = useAuth();
  const [groupedStories, setGroupedStories] = useState<UserStoriesGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [activeViewerIndex, setActiveViewerIndex] = useState<number | null>(null);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (res.ok && data.groupedStories) {
        setGroupedStories(data.groupedStories);
        if (onStoryCountChange) onStoryCountChange(data.groupedStories.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleStoryCreated = (newStory: any) => {
    fetchStories();
  };

  // Find if current user has an active story
  const myStoryGroup = user
    ? groupedStories.find((g) => g.user.id === user.id)
    : null;

  return (
    <div className="w-full">
      {/* Horizontal Carousel Container */}
      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x">
        {/* 1. Add Story Card */}
        <div
          onClick={() => {
            if (!user) {
              alert('يرجى تسجيل الدخول لنشر قصة');
              return;
            }
            setShowCreatorModal(true);
          }}
          className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-[24px] bg-gradient-to-b from-brand-600 via-brand-700 to-indigo-900 p-3 flex flex-col justify-between shrink-0 cursor-pointer group shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-brand-400/30 snap-start"
        >
          {/* Top User Avatar or Placeholder */}
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-2xl ring-2 ring-white/80 overflow-hidden bg-brand-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
          </div>

          {/* Glowing Plus Icon */}
          <div className="relative z-10 my-auto self-center">
            <div className="w-11 h-11 rounded-2xl bg-white text-brand-700 shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all duration-300">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
          </div>

          {/* Bottom Title */}
          <div className="relative z-10 text-center">
            <p className="text-xs font-black text-white font-tajawal drop-shadow">
              {myStoryGroup ? 'أضف قصة أخرى' : 'إنشاء قصة +'}
            </p>
            <p className="text-[10px] text-blue-200/80 font-medium">تبقى 24 ساعة</p>
          </div>
        </div>

        {/* 2. List of Active Student Stories */}
        {loading ? (
          // Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-28 sm:w-32 h-44 sm:h-48 rounded-[24px] bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0 snap-start"
            />
          ))
        ) : (
          groupedStories.map((group, index) => {
            const isMe = user?.id === group.user.id;
            const firstStory = group.stories[0];
            const hasUnviewed = group.hasUnviewed;

            return (
              <div
                key={group.user.id}
                onClick={() => setActiveViewerIndex(index)}
                className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-[24px] p-3 flex flex-col justify-between shrink-0 cursor-pointer group shadow-soft hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-200/80 dark:border-slate-800 snap-start"
                style={{
                  background: firstStory?.type === 'IMAGE' && firstStory.mediaUrl
                    ? `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%), url(${firstStory.mediaUrl}) center/cover no-repeat`
                    : undefined,
                }}
              >
                {/* Fallback gradient background if text story */}
                {firstStory?.type === 'TEXT' && (
                  <div
                    className={`absolute inset-0 ${
                      firstStory.bgColor || 'bg-gradient-to-br from-purple-700 to-indigo-950'
                    } opacity-95 transition-transform duration-500 group-hover:scale-105`}
                  />
                )}

                {/* Top: Avatar with Instagram/Facebook gradient ring */}
                <div className="relative z-10 flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-2xl p-0.5 shadow-md ${
                      hasUnviewed
                        ? 'bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className="w-full h-full rounded-[14px] overflow-hidden bg-slate-800 flex items-center justify-center text-white font-bold text-xs border border-white dark:border-slate-900">
                      {group.user.avatar ? (
                        <img
                          src={group.user.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        group.user.name?.charAt(0) || 'U'
                      )}
                    </div>
                  </div>

                  {group.totalStories > 1 && (
                    <span className="px-1.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black text-white">
                      {group.totalStories}
                    </span>
                  )}
                </div>

                {/* Middle text snippet if text story */}
                {firstStory?.type === 'TEXT' && (
                  <div className="relative z-10 my-auto text-center px-1">
                    <p className="text-[11px] font-black text-white line-clamp-3 leading-tight drop-shadow-sm">
                      {firstStory.content}
                    </p>
                  </div>
                )}

                {/* Bottom: Student Name */}
                <div className="relative z-10">
                  <p className="text-xs font-black text-white font-tajawal drop-shadow truncate">
                    {isMe ? 'قصتك الشخصية' : group.user.name}
                  </p>
                  <p className="text-[10px] text-white/70 font-medium">
                    {isMe ? `${group.totalStories} نشطة` : group.user.department || 'طالب معادلة'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Creator */}
      {showCreatorModal && (
        <StoryCreatorModal
          isOpen={showCreatorModal}
          onClose={() => setShowCreatorModal(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}

      {/* Modal: Viewer */}
      {activeViewerIndex !== null && (
        <StoryViewerModal
          isOpen={activeViewerIndex !== null}
          initialUserIndex={activeViewerIndex}
          groupedStories={groupedStories}
          onClose={() => setActiveViewerIndex(null)}
          onStoryDeleted={() => fetchStories()}
        />
      )}
    </div>
  );
}
