'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import SplashScreen from '../common/SplashScreen';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/context/AuthContext';

const SPLASH_STORAGE_KEY = 'moadla_splash_seen';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSeenSplash = window.sessionStorage.getItem(SPLASH_STORAGE_KEY) === 'true';
    setHydrated(true);

    if (hasSeenSplash) {
      setShowSplash(false);
      return;
    }

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(SPLASH_STORAGE_KEY, 'true');
      setShowSplash(false);
    }, 10000);

    return () => window.clearTimeout(timer);
  }, []);

  if (!hydrated) return null;

  const shouldShowLoginGate = !showSplash && !authLoading && !user && pathname === '/';

  return (
    <>
      {showSplash ? <SplashScreen /> : null}

      {!showSplash && shouldShowLoginGate ? (
        <LoginPage />
      ) : null}

      {!showSplash && !shouldShowLoginGate ? (
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      ) : null}
    </>
  );
}
