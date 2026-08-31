'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, MessageSquare, Search, Clock3, Sparkles, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function FriendsPageClient() {
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [sentPending, setSentPending] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [localPendingIds, setLocalPendingIds] = useState<Record<string, boolean>>({});
  const pendingIdsRef = useRef<Record<string, boolean>>({});

  const applyPendingOverlay = (items: any[] = []) => items.map((item) => {
    if (pendingIdsRef.current[item.id]) {
      return { ...item, friendStatus: 'PENDING' };
    }
    return item;
  });

  const markSentRequestPending = (targetUserId: string, metadata?: Partial<any>) => {
    setLocalPendingIds((current) => ({ ...current, [targetUserId]: true }));
    pendingIdsRef.current = { ...pendingIdsRef.current, [targetUserId]: true };
    setSentPending((current) => {
      const exists = current.some((request) => request.receiver?.id === targetUserId || request.sender?.id === targetUserId || request.id === `pending-${targetUserId}`);
      if (exists) return current;
      return [{
        id: `pending-${targetUserId}`,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        receiver: {
          id: targetUserId,
          name: metadata?.name || 'طلب جديد',
          username: metadata?.username || null,
          avatar: metadata?.avatar || null,
        },
      }, ...current];
    });
  };

  const load = async () => {
    setLoading(true);
    const res = await fetch('/api/social/friends', { credentials: 'same-origin' });
    if (res.ok) {
      const data = await res.json();
      setFriends(data.friends || []);
      setPendingReceived(data.pendingReceived || []);
      setSentPending(data.sentPending || []);
      setSuggestions(applyPendingOverlay(data.suggestions || []));
      setSearchResults((current) => applyPendingOverlay(current));
    }
    setLoading(false);
  };

  const searchStudents = async () => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/social/search?q=${encodeURIComponent(query)}`, { credentials: 'same-origin' });
    if (res.ok) {
      const data = await res.json();
      setSearchResults(data.students || []);
    }
  };

  useEffect(() => { load(); }, []);

  const updateFriendStatus = async (targetUserId: string, action: 'accept' | 'reject' | 'cancel' | 'remove' | 'send', metadata?: Partial<any>) => {
    if (action === 'send') {
      const markAsPending = () => {
        const next = { ...pendingIdsRef.current, [targetUserId]: true };
        pendingIdsRef.current = next;
        setLocalPendingIds(next);
        markSentRequestPending(targetUserId, metadata);
        setSuggestions((current) => current.map((student) => student.id === targetUserId ? { ...student, friendStatus: 'PENDING' } : student));
        setSearchResults((current) => current.map((student) => student.id === targetUserId ? { ...student, friendStatus: 'PENDING' } : student));
      };

      markAsPending();

      const res = await fetch('/api/social/friends', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok || res.status === 409) {
        setNotice('تم إرسال الطلب');
        markAsPending();
        await load();
      } else {
        setNotice(data?.error || 'فشل إرسال طلب الصداقة');
      }
      return;
    }

    const res = await fetch('/api/social/friends', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId, action }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setNotice('تم تحديث الطلب بنجاح');
      await load();
    } else {
      setNotice(data?.error || 'فشل تحديث طلب الصداقة');
    }
  };

  const openConversation = async (targetUserId: string) => {
    const res = await fetch('/api/social/conversations', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId }),
    });
    const data = await res.json();
    if (res.ok && data.conversation?.id) {
      window.location.href = `/messages/${data.conversation.id}`;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    const map: Record<string, string> = {
      ACCEPTED: 'مصدّق',
      PENDING: 'قيد الانتظار',
      REJECTED: 'مرفوض',
      CANCELLED: 'ملغي',
    };
    return <span className="text-[10px] bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1">{map[status] || status}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">الأصدقاء</h1>
          <p className="text-xs text-slate-500">إدارة طلبات الصداقة والبحث عن الطلاب</p>
        </div>
        <Link href="/messages" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold">
          <MessageSquare className="w-4 h-4" />
          الرسائل
        </Link>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {notice}
        </div>
      )}

      <div className="rounded-3xl bg-white dark:bg-slate-900 border p-4 shadow-soft">
        <div className="flex gap-2 items-center">
          <Search className="w-4 h-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchStudents()} placeholder="بحث باسم الطالب أو username أو البريد" className="flex-1 bg-transparent text-sm outline-none" />
          <button onClick={searchStudents} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">بحث</button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((student) => (
              <div key={student.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800 p-3"> 
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                    {student.avatar ? <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" /> : student.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{student.name}</p>
                    <p className="text-[11px] text-slate-500">@{student.username || 'unknown'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {student.friendStatus ? getStatusBadge(student.friendStatus) : null}
                  <button
                    onClick={() => updateFriendStatus(student.id, 'send', student)}
                    disabled={student.friendStatus === 'PENDING'}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold ${student.friendStatus === 'PENDING' ? 'bg-emerald-600 text-white opacity-90 cursor-default' : 'bg-brand-600 text-white'}`}
                  >
                    {student.friendStatus === 'PENDING' ? 'تم إرسال الطلب' : 'إضافة صديق'}
                  </button>
                  <button onClick={() => openConversation(student.id)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-xl text-[11px] font-bold">رسالة</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? <div className="text-center py-10">جاري التحميل...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl bg-white dark:bg-slate-900 border p-4 space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-black">جميع الأصدقاء</h2><span className="text-xs text-brand-600">{friends.length}</span></div>
            {friends.length ? friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold">
                      {friend.avatar ? <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" /> : friend.name?.charAt(0)}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${friend.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{friend.name}</p>
                    <p className="text-[11px] text-slate-500">@{friend.username || 'student'}</p>
                    <p className="text-[10px] text-slate-400">{friend.isOnline ? 'متصل الآن' : `آخر ظهور ${friend.lastSeenAt ? new Date(friend.lastSeenAt).toLocaleString() : 'قريباً'}`}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openConversation(friend.id)} className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">رسالة</button>
                  <Link href={`/profile?user=${friend.id}`} className="px-2 py-1 rounded-lg bg-brand-50 text-brand-600 text-[10px] font-bold text-center">عرض</Link>
                </div>
              </div>
            )) : <p className="text-xs text-slate-500">لا توجد أصدقاء حتى الآن.</p>}
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border p-4 space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-black">طلبات معلقة</h2><span className="text-xs text-amber-600">{pendingReceived.length}</span></div>
            {pendingReceived.length ? pendingReceived.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-amber-100 text-amber-600 flex items-center justify-center font-bold">{req.sender.name?.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-sm">{req.sender.name}</p>
                    <p className="text-[11px] text-slate-500">@{req.sender.username || 'student'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateFriendStatus(req.sender.id, 'accept')} className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">قبول</button>
                  <button onClick={() => updateFriendStatus(req.sender.id, 'reject')} className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold">رفض</button>
                </div>
              </div>
            )) : <p className="text-xs text-slate-500">لا توجد طلبات واردة.</p>}
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 border p-4 space-y-4">
            <div className="flex items-center justify-between"><h2 className="font-black">طلبات أرسلت</h2><span className="text-xs text-sky-600">{sentPending.length}</span></div>
            {sentPending.length ? sentPending.map((req) => (
              <div key={req.id} className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-sky-100 text-sky-600 flex items-center justify-center font-bold">{req.receiver.name?.charAt(0)}</div>
                  <div>
                    <p className="font-bold text-sm">{req.receiver.name}</p>
                    <p className="text-[11px] text-slate-500">@{req.receiver.username || 'student'}</p>
                  </div>
                </div>
                <button onClick={() => updateFriendStatus(req.receiver.id, 'cancel')} className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">إلغاء</button>
              </div>
            )) : <p className="text-xs text-slate-500">لا توجد طلبات مرسلة.</p>}
          </div>
        </div>
      )}

      <div className="rounded-3xl bg-white dark:bg-slate-900 border p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-black flex items-center gap-2 font-tajawal text-slate-900 dark:text-white">
              <Sparkles className="w-5 h-5 text-brand-600 animate-pulse" />
              <span>مقترحات للطلاب ({suggestions.length} طالب)</span>
            </h2>
            <p className="text-xs text-slate-500">
              تواصل مع زملائك في المعاهد والدبلومات وتصفح ملفاتهم الشخصية لمتابعة إنجازاتهم
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {suggestions.map((student) => {
            const profileUrl = `/user/${student.username || student.id}`;

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 bg-white dark:bg-slate-900 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <Link href={profileUrl} className="flex items-center gap-3 block group/user">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-brand-50 flex items-center justify-center font-bold text-brand-700 shrink-0 shadow-xs group-hover/user:scale-105 transition-transform">
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        student.name?.charAt(0)
                      )}
                      {student.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white group-hover/user:text-brand-600 transition-colors">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-slate-400">@{student.username || 'student'}</p>
                    </div>
                  </Link>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed min-h-[32px]">
                    {student.bio || 'طالب بمعادلة كلية الهندسة 📐'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <Link
                    href={profileUrl}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1"
                  >
                    <span>الملف الشخصي</span>
                    <span>👤</span>
                  </Link>

                  <button
                    onClick={() => updateFriendStatus(student.id, 'send', student)}
                    disabled={student.friendStatus === 'PENDING'}
                    className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      student.friendStatus === 'PENDING'
                        ? 'bg-emerald-600 text-white opacity-90 cursor-default'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                    }`}
                  >
                    {student.friendStatus === 'PENDING' ? 'تم إرسال الطلب ✓' : 'إضافة صديق +'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
