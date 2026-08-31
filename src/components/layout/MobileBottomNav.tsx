'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Compass,
  Film,
  Swords,
  User,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide on auth pages
  if (['/login', '/register', '/forgot-password'].includes(pathname)) {
    return null;
  }

  const NAV_ITEMS = [
    {
      label: 'الرئيسية',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'ريلز',
      href: '/reels',
      icon: Film,
      isActive: pathname.startsWith('/reels'),
      badge: '🎬',
    },
    {
      label: 'المناهج',
      href: '/subjects',
      icon: BookOpen,
      isActive: pathname.startsWith('/subjects') || pathname.startsWith('/sections') || pathname.startsWith('/lessons'),
    },
    {
      label: 'المجتمع',
      href: '/feed',
      icon: Compass,
      isActive: pathname.startsWith('/feed'),
    },
    {
      label: 'الألعاب',
      href: '/games',
      icon: Swords,
      isActive: pathname.startsWith('/games'),
    },
    {
      label: 'حسابي',
      href: user ? '/profile' : '/login',
      icon: User,
      isActive: pathname.startsWith('/profile') || pathname.startsWith('/user'),
      avatar: user?.avatar,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pointer-events-none">
      <nav className="pointer-events-auto max-w-lg mx-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.4)] rounded-[28px] p-1.5 flex items-center justify-around transition-all">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 ${active
                  ? 'text-brand-600 dark:text-brand-400 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
            >
              {/* Active Pill Background */}
              {active && (
                <span className="absolute inset-0 bg-brand-50 dark:bg-brand-950/70 rounded-2xl -z-10 shadow-xs border border-brand-200/60 dark:border-brand-800/50 animate-scale-up" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                {item.avatar && active ? (
                  <div className="w-5 h-5 rounded-full ring-2 ring-brand-500 overflow-hidden">
                    <img src={item.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'hover:scale-105'
                      }`}
                  />
                )}

                {item.badge && !active && (
                  <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-rose-500 text-white text-[8px] font-black animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] mt-1 font-tajawal tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
