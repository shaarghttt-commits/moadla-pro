'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ConversationPreview {
  id: string;
  title: string;
  unread: number;
  updatedAt?: string;
  lastMessage?: {
    body?: string | null;
    createdAt?: string;
  } | null;
  otherParticipant?: {
    name?: string | null;
    avatar?: string | null;
    isOnline?: boolean | null;
  } | null;
}

export default function MessagesDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/social/conversations');
      if (!res.ok) return;

      const data = await res.json();
      const items = data.conversations || [];
      setConversations(items);
      setUnreadCount(items.reduce((sum: number, item: ConversationPreview) => sum + (item.unread || 0), 0));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="الرسائل"
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <MessageSquare className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">الرسائل</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} جديدة
                </span>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {conversations.length === 0 ? (
              <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                لا توجد رسائل جديدة حالياً
              </div>
            ) : (
              conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/messages?friend=${conversation.otherParticipant?.name ? conversation.id : conversation.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-right"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200">
                        {conversation.otherParticipant?.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={conversation.otherParticipant.avatar} alt={conversation.title} className="w-full h-full object-cover" />
                        ) : (
                          conversation.title?.charAt(0) || 'م'
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${conversation.otherParticipant?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {conversation.title}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                            {conversation.unread}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed truncate">
                        {conversation.lastMessage?.body || 'ابدأ محادثة جديدة'}
                      </p>

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-[10px] text-slate-400">
                          {conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleString() : 'الآن'}
                        </p>
                        {conversation.unread > 0 && (
                          <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">جديدة</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 p-2 text-center bg-slate-50 dark:bg-slate-900/80">
            <Link
              href="/messages"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
            >
              <span>عرض كل الرسائل</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
