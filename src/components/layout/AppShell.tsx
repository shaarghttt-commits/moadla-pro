'use client';

import { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SplashScreen from '../common/SplashScreen';

const SPLASH_STORAGE_KEY = 'moadla_splash_seen';

export default function AppShell({ children }: { children: ReactNode }) {
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
    }, 3600);

    return () => window.clearTimeout(timer);
  }, []);

  if (!hydrated) return null;

  return (
    <>
      {showSplash ? <SplashScreen /> : null}

      {!showSplash ? (
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      ) : null}
    </>
  );
}
