'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { useEffect, useState } from 'react';

const SPLASH_STORAGE_KEY = 'moadla_splash_seen';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.sessionStorage.getItem(SPLASH_STORAGE_KEY) !== 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSeenSplash = window.sessionStorage.getItem(SPLASH_STORAGE_KEY) === 'true';
    if (hasSeenSplash) {
      setShouldRender(false);
      return;
    }

    const hideSplash = () => {
      setIsVisible(false);
      window.setTimeout(() => {
        window.sessionStorage.setItem(SPLASH_STORAGE_KEY, 'true');
        setShouldRender(false);
      }, 700);
    };

    const playAudioGreeting = () => {
      const audio = new Audio('/audio/moadla-welcome.mp3');
      audio.volume = 1;
      audio.onended = hideSplash;
      audio.onerror = hideSplash;
      audio.play().catch(() => hideSplash());
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealDelay = prefersReducedMotion ? 80 : 300;
    const fallbackSplashDuration = prefersReducedMotion ? 2200 : 6000;

    const revealTimer = window.setTimeout(() => {
      setIsVisible(true);
      window.setTimeout(playAudioGreeting, 450);
    }, revealDelay);

    const fallbackHideTimer = window.setTimeout(hideSplash, fallbackSplashDuration);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(fallbackHideTimer);
    };
  }, []);

  if (!shouldRender) return null;

  const particles = Array.from({ length: 18 });

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isVisible ? 1 : 1 }}
          exit={{ opacity: 0, filter: 'blur(16px)' }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#020817]"
          aria-live="polite"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.38),_transparent_34%),radial-gradient(circle_at_70%_28%,_rgba(16,185,129,0.15),_transparent_23%),linear-gradient(135deg,_#010b16_0%,_#071821_30%,_#0b1020_100%)]" />
          <div className="absolute inset-0 opacity-100"
            style={{
              backgroundImage:
                'linear-gradient(125deg, rgba(59,130,246,0.10) 0%, rgba(96,165,250,0.04) 18%, rgba(15,118,110,0.07) 35%, rgba(59,130,246,0.08) 58%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.06, 0.22, 0.10] }}
            transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0.04) 26%, rgba(255,255,255,0.01) 42%, rgba(96,165,250,0.06) 100%)',
            }}
          />

          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 1.15 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -top-24 left-1/2 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-brand-500/30 blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ duration: 2.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-[-9rem] right-[-3rem] h-[22rem] w-[22rem] rounded-full bg-emerald-400/20 blur-3xl"
            />
          </div>

          {particles.map((_, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full bg-white/25"
              style={{
                width: 5 + (index % 3) * 4,
                height: 5 + (index % 3) * 4,
                left: `${(index * 13) % 100}%`,
                top: `${(index * 17) % 100}%`,
              }}
              animate={{ opacity: [0.12, 0.7, 0.14], scale: [0.9, 1.2, 0.9], y: [0, -14, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 5.8 + (index % 5) * 0.8,
                ease: 'easeInOut',
                delay: index * 0.22,
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, scale: 0.84, filter: 'blur(14px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(16px)' }}
            transition={{ duration: 2.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex h-full items-center justify-center"
          >
            <div className="relative flex flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.64, opacity: 0, y: 28 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1], delay: 0.34 }}
                className="relative mb-7"
              >
                <div className="absolute inset-[-1.2rem] rounded-[2.7rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm" />
                <motion.div
                  animate={{ boxShadow: ['0 0 0 rgba(59,130,246,0)', '0 0 64px rgba(59,130,246,0.30)', '0 0 0 rgba(59,130,246,0)'] }}
                  transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/15 bg-gradient-to-tr from-brand-700 via-brand-600 to-brand-500 shadow-[0_20px_72px_rgba(37,99,235,0.38)] sm:h-28 sm:w-28"
                >
                  <GraduationCap className="h-12 w-12 text-white sm:h-14 sm:w-14" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.15, 0.58, 0.18] }}
                  transition={{ duration: 2.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  className="absolute inset-[-0.8rem] rounded-[2.5rem] bg-brand-400/12 blur-3xl"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <span className="font-black tracking-tight text-[2.2rem] text-white sm:text-[3.25rem]" style={{ fontFamily: 'var(--font-tajawal), sans-serif' }}>
                  Moadla
                </span>
                <span className="bg-gradient-to-r from-brand-100 via-brand-50 to-emerald-100 bg-clip-text text-transparent text-[2.2rem] font-black tracking-tight sm:text-[3.25rem]" style={{ fontFamily: 'var(--font-tajawal), sans-serif' }}>
                  PRO
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1], delay: 0.82 }}
                className="mt-4 text-[0.66rem] tracking-[0.32em] text-slate-200 uppercase sm:text-[0.74rem]"
              >
                منصة معادلات الجامعات الأولى
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6 }}
            className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-900/35 via-transparent to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
