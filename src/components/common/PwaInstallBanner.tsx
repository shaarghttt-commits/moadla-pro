'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Check if user dismissed recently
    const dismissed = localStorage.getItem('moadla_pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If iOS and not standalone, show banner after 4 seconds
    if (isIosDevice) {
      const timer = setTimeout(() => setShowBanner(true), 4000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      alert('لتثبيت التطبيق على الآيفون: اضغط على زر المشاركة (Share ⬆️) بالأسفل ثم اختر "إضافة إلى الشاشة الرئيسية (Add to Home Screen)"');
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('moadla_pwa_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40 animate-slide-up">
      <div className="glass-card rounded-[28px] p-4 shadow-2xl border border-brand-200/80 dark:border-brand-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
            📱
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                تطبيق معادلة برو
              </p>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              ثبته على هاتفك لتجربة أسرع بدون متجر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md transition hover:scale-105 active:scale-95"
          >
            تثبيت
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
