'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, MessageSquare, Swords, Search, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FriendItem {
  id: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  department?: string | null;
  role?: string;
  isOnline?: boolean;
}

interface ProfileFriendsTabProps {
  userId: string;
}

export default function ProfileFriendsTab({ userId }: ProfileFriendsTabProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch('/api/social/friends');
        const data = await res.json();
        if (res.ok && data.friends) {
          setFriends(data.friends);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchFriends();
  }, [userId]);

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.department && f.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>الأصدقاء وزملاء الدراسة ({friends.length})</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">تواصل مع زملائك وتحدَّهم في الألعاب الدراسية</p>
        </div>

        {/* Search Friends Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الأصدقاء..."
            className="w-full pr-10 pl-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {search ? 'لم يتم العثور على أصدقاء يطابقون بحثك' : 'لا يوجد أصدقاء مضافون حالياً'}
          </p>
          <Link
            href="/friends"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition shadow-md shadow-brand-600/20"
          >
            <Users className="w-4 h-4" />
            <span>استكشاف وإضافة زملاء جدد</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredFriends.map((friend) => (
            <div
              key={friend.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-3 hover:border-brand-500/40 transition group"
            >
              <Link href={`/user/${friend.id}`} className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-50 dark:bg-brand-950/60 shrink-0 border border-slate-200 dark:border-slate-700 relative">
                  {friend.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-brand-600 text-sm">
                      {friend.name.charAt(0)}
                    </div>
                  )}
                  {friend.isOnline && (
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 absolute bottom-0 left-0" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600">
                    {friend.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {friend.department || 'طالب معادلة'}
                  </div>
                </div>
              </Link>

              {/* Quick Actions (Chat, Challenge) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/messages"
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-600 dark:text-slate-300 hover:text-brand-600 flex items-center justify-center border border-slate-200 dark:border-slate-600 transition"
                  title="محادثة خاصة"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <Link
                  href={`/games?challenge=${friend.id}`}
                  className="w-8 h-8 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow transition"
                  title="تحدي في لعبة"
                >
                  <Swords className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
