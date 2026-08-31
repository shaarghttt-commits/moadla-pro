import Link from 'next/link';
import { MessageSquareText, Search, MoreHorizontal } from 'lucide-react';

interface OnlineFriend {
  id: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  isOnline?: boolean;
}

export default function OnlineFriendsSidebar({ friends }: { friends: OnlineFriend[] }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 w-[310px] rounded-[28px] border border-slate-200/80 bg-white/80 p-3 shadow-soft backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="المزيد">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <button className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="البحث">
              <Search className="h-5 w-5" />
            </button>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-white">جهات الاتصال</h3>
        </div>

        {friends.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">لا يوجد أصدقاء متصلين الآن</p>
            <Link href="/friends" className="mt-3 inline-flex items-center justify-center rounded-full bg-brand-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-500">
              ابدأ بإضافة أصدقاء
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div key={friend.id} className="group flex items-center justify-between gap-3 rounded-2xl px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-slate-900/60">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-black text-brand-700 dark:from-brand-900 dark:to-brand-800 dark:text-brand-300">
                      {friend.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={friend.avatar} alt={friend.name} className="h-full w-full object-cover" />
                      ) : (
                        friend.name.charAt(0)
                      )}
                    </div>
                    {friend.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-slate-900 dark:text-white">{friend.name}</p>
                    {friend.username && (
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">@{friend.username}</p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/messages?friend=${friend.id}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-400 dark:hover:bg-brand-900"
                  aria-label={`دردشة مع ${friend.name}`}
                >
                  <MessageSquareText className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
