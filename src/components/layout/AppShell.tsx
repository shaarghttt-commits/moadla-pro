'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import SplashScreen from '../common/SplashScreen';
import LoginPage from '@/app/login/page';
import { useAuth } from '@/context/AuthContext';
import AiStudyCompanionModal from '@/components/ai/AiStudyCompanionModal';
import PwaInstallBanner from '@/components/common/PwaInstallBanner';
import MobileBottomNav from './MobileBottomNav';
import AdminUniversalControlBar from '@/components/admin/AdminUniversalControlBar';
import LiveVisualEditorProvider from '@/components/admin/LiveVisualEditorProvider';
import PageTransitionSoundEffects from '@/components/common/PageTransitionSoundEffects';

const SPLASH_STORAGE_KEY = 'moadla_splash_seen';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }

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
  const shouldHideGlobalShell = ['/login', '/register', '/forgot-password'].includes(pathname);

  return (
    <LiveVisualEditorProvider>
      {showSplash ? <SplashScreen /> : null}

      {!showSplash && shouldShowLoginGate ? (
        <LoginPage />
      ) : null}

      {!showSplash && !shouldShowLoginGate && shouldHideGlobalShell ? (
        <main className="flex-grow">{children}</main>
      ) : null}

      {!showSplash && !shouldShowLoginGate && !shouldHideGlobalShell ? (
        <div className="flex min-h-screen flex-col pb-16 md:pb-0">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <AiStudyCompanionModal />
          <PwaInstallBanner />
          <MobileBottomNav />
          <AdminUniversalControlBar />
          <PageTransitionSoundEffects />
        </div>
      ) : null}
    </LiveVisualEditorProvider>
  );
}
