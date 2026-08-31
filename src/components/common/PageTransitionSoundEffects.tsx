'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Sparkles, Star } from 'lucide-react';

const MASCOT_PROFILES = [
  {
    type: 'boy',
    name: 'المهندس أحمد 👨‍🎓',
    role: 'طالب معادلة هندسة',
    image: '/images/disney_student_boy.jpg',
    glow: 'from-blue-500 via-indigo-500 to-purple-600',
    bubbleBorder: 'border-blue-400',
    titleColor: 'text-blue-400',
  },
  {
    type: 'girl',
    name: 'المهندسة سارة 👩‍🎓',
    role: 'طالبة متفوقة',
    image: '/images/disney_student_girl.jpg',
    glow: 'from-amber-400 via-rose-500 to-pink-600',
    bubbleBorder: 'border-rose-400',
    titleColor: 'text-rose-400',
  },
];

export default function PageTransitionSoundEffects() {
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);
  const isFirstRenderRef = useRef(true);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('moadla_nav_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentMascot, setCurrentMascot] = useState(MASCOT_PROFILES[0]);
  const [speechQuote, setSpeechQuote] = useState('');
  const [destinationTitle, setDestinationTitle] = useState('');

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('moadla_nav_sound_enabled', String(next));
      }
      return next;
    });
  };

  // Disney-Style Magical Fairy Chime Harp Glissando via Web Audio API
  const playDisneyMagicSound = (destination: string) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Magical Disney pentatonic ascending glissando
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.045);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.045 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.045);
        osc.stop(ctx.currentTime + i * 0.045 + 0.4);
      });
    } catch {}
  };

  // Listen to pathname changes
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (pathname !== prevPathnameRef.current) {
      prevPathnameRef.current = pathname;

      // Randomly choose alternating Disney character
      const chosen = MASCOT_PROFILES[Math.floor(Math.random() * MASCOT_PROFILES.length)];
      setCurrentMascot(chosen);

      // Section Speech Quote
      let quote = 'يلا يا بطل.. طريقك لهندسة يبدأ من هنا! 🚀✨';
      let title = 'معادلة برو';

      if (pathname.startsWith('/exams/simulator')) {
        quote = 'جهز قلمك وركز.. يلا نظلل البابل شيت ونجيب 100%! 📝🎯';
        title = 'محاكي امتحانات المعادلة';
      } else if (pathname.startsWith('/exams')) {
        quote = 'امتحانات جديدة وتصحيح فوري ومؤقت.. وريني شطارتك! 🎯✨';
        title = 'بنك الامتحانات والبابل شيت';
      } else if (pathname.startsWith('/games')) {
        quote = 'تحدي جديد وشطرنج 1v1.. مين هيكسب نقاط XP النهاردة؟ 🎮🏆';
        title = 'ساحة المبارزات والألعاب';
      } else if (pathname.startsWith('/reels')) {
        quote = 'فيديوهات وشروحات سريعة.. أفكار عبقرية في ثواني! 🎬💡';
        title = 'ريلز الطلاب والفيديوهات';
      } else if (pathname.startsWith('/study-rooms')) {
        quote = 'جلسة تركيز وبومودورو مع زمايلك.. شد حيلك يا باشمهندس! 🎧⏱️';
        title = 'غرف المذاكرة الحية';
      } else if (pathname.startsWith('/subjects') || pathname.startsWith('/sections')) {
        quote = 'تفاضل وتكامل وميكانيكا وفيزياء.. كل القوانين هنا! 📐📚';
        title = 'المناهج والمقررات الدراسية';
      } else if (pathname.startsWith('/feed')) {
        quote = 'شوف قصص وبوستات زمايلك وشارك إنجازاتك! 🌐🔥';
        title = 'مجتمع الطلاب والقصص';
      } else if (pathname.startsWith('/profile')) {
        quote = 'ملفك الشخصي وإنجازاتك.. منور يا فنان! 👤🌟';
        title = 'الصفحة الشخصية';
      }

      setSpeechQuote(quote);
      setDestinationTitle(title);

      // Play Disney magic audio chime
      playDisneyMagicSound(pathname);

      // Trigger animated Disney running mascot
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1050);

      return () => clearTimeout(timer);
    }
  }, [pathname, soundEnabled]);

  return (
    <>
      {/* 1. Full-Screen Active Moving Disney Mascot Transition Overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4 overflow-hidden font-tajawal select-none">
          {/* Dreamy Twilight Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300" />

          {/* Twinkling Magical Golden Stars in Background */}
          <div className="absolute top-1/6 left-1/4 text-amber-300 animate-twinkle text-2xl">✨</div>
          <div className="absolute top-1/3 right-1/4 text-pink-300 animate-twinkle text-xl" style={{ animationDelay: '0.2s' }}>⭐</div>
          <div className="absolute bottom-1/3 left-1/5 text-cyan-300 animate-twinkle text-3xl" style={{ animationDelay: '0.4s' }}>✨</div>
          <div className="absolute bottom-1/5 right-1/3 text-purple-300 animate-twinkle text-2xl" style={{ animationDelay: '0.1s' }}>🌟</div>

          {/* Main Running Disney Mascot & Speech Container with Active Sprinting Motion */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 max-w-xl mx-auto animate-disney-sprint">
            
            {/* The Animated Running Mascot (Bobs up and down with running stride steps) */}
            <div className="relative group shrink-0">
              
              {/* Active Running Step Stride Animation */}
              <div className="animate-disney-step relative">
                {/* Outer Radiant Glow Aura */}
                <div className={`absolute -inset-4 rounded-full bg-gradient-to-tr ${currentMascot.glow} opacity-85 blur-xl animate-pulse`} />

                {/* 3D Character Circular Portrait with High-End Lighting */}
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-white/40 backdrop-blur-2xl border-4 border-white shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentMascot.image}
                    alt={currentMascot.name}
                    className="w-full h-full object-cover rounded-full transform scale-105"
                  />
                </div>

                {/* Swirling Orbiting Math Symbol 1 (Fast Clockwise) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="animate-orbit-fast text-2xl filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">
                    📐
                  </div>
                </div>

                {/* Swirling Orbiting Physics Symbol 2 (Reverse Counter-Clockwise) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="animate-orbit-reverse text-2xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                    ⚡
                  </div>
                </div>

                {/* Sneaker Running Dust & Sparkle Puffs Behind Shoes */}
                <div className="absolute -bottom-4 right-2 text-2xl opacity-90 animate-dust-burst pointer-events-none">
                  💨✨
                </div>
              </div>

              {/* Cheerful Name Pill Badge */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 text-white font-black text-xs shadow-xl border-2 border-white whitespace-nowrap flex items-center gap-1">
                <span>{currentMascot.name}</span>
              </div>
            </div>

            {/* Bouncy Cartoon Speech Bubble */}
            <div className={`relative bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 sm:p-6 rounded-[32px] border-2 ${currentMascot.bubbleBorder} shadow-2xl max-w-xs sm:max-w-sm text-right space-y-2 animate-speech-bubble`}>
              {/* Speech Bubble Triangular Pointer Arrow */}
              <div className="hidden sm:block absolute -left-3.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-slate-900" />
              
              <div className={`flex items-center gap-1.5 text-xs font-black ${currentMascot.titleColor}`}>
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>{destinationTitle}</span>
              </div>

              <p className="text-xs sm:text-sm font-black leading-relaxed font-tajawal text-slate-800 dark:text-slate-100">
                {speechQuote}
              </p>

              {/* Animated Running Dots */}
              <div className="flex items-center gap-1.5 pt-1.5 justify-end">
                <span className="text-[10px] text-slate-400 font-bold">جاري فتح الصفحة...</span>
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Glowing Progress Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-60 pointer-events-none transition-opacity duration-300 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="h-[3.5px] w-full bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500 shadow-[0_0_18px_rgba(236,72,153,0.9)] animate-pulse" />
      </div>

      {/* 3. Subtle Floating Sound Toggle Button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          type="button"
          onClick={toggleSound}
          className={`p-2.5 rounded-2xl backdrop-blur-xl border shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 flex items-center gap-1.5 font-tajawal text-xs font-bold ${
            soundEnabled
              ? 'bg-slate-900/90 hover:bg-slate-900 text-emerald-400 border-slate-700/80 shadow-emerald-500/10'
              : 'bg-slate-900/90 hover:bg-slate-900 text-slate-500 border-slate-800'
          }`}
          title={soundEnabled ? 'صوت ديزني السحري مفعل (انقر للكتم)' : 'الصوت مكتوم (انقر للتفعيل)'}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline text-[11px] text-slate-200 font-bold">صوت ديزني 🎵</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline text-[11px] text-slate-400 font-bold">صامت 🔇</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
