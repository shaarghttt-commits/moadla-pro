'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Trophy,
  Users,
  PlayCircle,
  FileCheck2,
  Award,
  HelpCircle,
  Swords,
  Flame,
  Star,
  ShieldCheck,
  Zap,
} from 'lucide-react';

type StudentPhotoItem = {
  url?: string;
  label?: string;
  title?: string;
  details?: string;
};

interface HeroSectionProps {
  heroData?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    studentPhotos?: Array<string | StudentPhotoItem>;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
  };
  statsData?: Array<{
    id: string;
    number: string;
    label: string;
    icon?: string;
  }>;
}

export default function HeroSection({ heroData, statsData }: HeroSectionProps) {
  const badge = heroData?.badge || 'المنصة التعليمية الأولى والذكية لمعادلات الجامعات المصرية 🚀';
  const title = heroData?.title || 'طريقك المضمون للالتحاق بكليات القمة والنجاح في المعادلة';
  const subtitle =
    heroData?.subtitle ||
    'استعد لمعادلة كلية الهندسة والتجارة والحاسبات بأقوى شروحات تفاعلية، بنك أسئلة امتحانية ذكية تحاكي البابل شيت 100%، وتحديات وألعاب دراسية تجمعك مع نخبة الطلاب.';
  const primaryText = heroData?.primaryButtonText || 'ابدأ التعلم الآن مجاناً';
  const primaryLink = heroData?.primaryButtonLink || '/register';
  const secondaryText = heroData?.secondaryButtonText || 'استكشف المواد والأقسام';
  const secondaryLink = heroData?.secondaryButtonLink || '/sections';
  const heroImage = heroData?.imageUrl;

  const defaultStudentPhotos: StudentPhotoItem[] = [
    { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=80', label: 'مريم علي السيد', details: 'كلية الهندسة - جامعة الزقازيق 🏆' },
    { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&auto=format&fit=crop&q=80', label: 'عمر خالد الدسوقي', details: 'كلية الهندسة - جامعة القاهرة 📐' },
    { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80', label: 'سارة محمد عبد الرحمن', details: 'كلية الهندسة - جامعة عين شمس ✨' },
    { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80', label: 'يوسف محمود القاضي', details: 'كلية الهندسة - جامعة أسيوط 🎯' },
  ];

  const normalizeStudentPhotos = (photos?: Array<string | StudentPhotoItem>) => {
    const source = Array.isArray(photos) && photos.length > 0 ? photos : defaultStudentPhotos;
    return source
      .map((item, index) => {
        if (typeof item === 'string') {
          return { url: item, label: `طالب ${index + 1}`, details: 'كلية الهندسة' };
        }
        const url = item?.url || '';
        if (!url) return null;
        return {
          url,
          label: item?.label || item?.title || `طالب ${index + 1}`,
          details: item?.details || 'كلية الهندسة',
        };
      })
      .filter((item): item is StudentPhotoItem & { url: string; label: string; details: string } => Boolean(item && item.url));
  };

  const studentPhotos = normalizeStudentPhotos(heroData?.studentPhotos);
  const hasStudentCarousel = studentPhotos.length > 1;

  const [activeStudentIndex, setActiveStudentIndex] = useState(0);

  useEffect(() => {
    if (!hasStudentCarousel) return;
    const intervalId = window.setInterval(() => {
      setActiveStudentIndex((current) => (current + 1) % studentPhotos.length);
    }, 4500);
    return () => window.clearInterval(intervalId);
  }, [hasStudentCarousel, studentPhotos.length]);

  const stats = statsData && statsData.length > 0 ? statsData : [
    { id: '1', number: '15,000+', label: 'طالب وطالبة مسجلين' },
    { id: '2', number: '96.4%', label: 'نسبة النجاح والقبول' },
    { id: '3', number: '500+', label: 'شرح ومذكرة PDF' },
    { id: '4', number: '5,000+', label: 'سؤال مع حل نموذجي' },
  ];

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/2 -left-20 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/3 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Right Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            {/* Top Pill with live active status dot */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900/90 border border-brand-200/80 dark:border-slate-700/80 shadow-soft text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-bold backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span>{badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.22] tracking-tight font-tajawal">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
              {subtitle}
            </p>

            {/* Trust highlights with micro-icons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/70 dark:border-brand-800/70 text-xs font-bold text-brand-700 dark:text-brand-300">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>امتحانات المعادلة الإلكترونية 100%</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/70 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>امتحانات المعادلة السابقة PDF</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200/70 dark:border-purple-800/70 text-xs font-bold text-purple-700 dark:text-purple-300">
                <Swords className="w-3.5 h-3.5 text-purple-500" />
                <span>مبارزات ألعاب ومجموعات دراسية</span>
              </span>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <Link
                href={primaryLink}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 shadow-xl shadow-brand-600/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <span>{primaryText}</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
              </Link>

              <Link
                href={secondaryLink}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-soft flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>{secondaryText}</span>
              </Link>
            </div>

            {/* Active Students Social Proof */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
              <div className="flex -space-x-2.5">
                {studentPhotos.slice(0, 4).map((student, idx) => (
                  <img
                    key={`${student.label}-${idx}`}
                    src={student.url}
                    alt={student.label}
                    className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-sm"
                  />
                ))}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
                انضم لأكثر من <strong className="font-black text-slate-900 dark:text-white">+15,000 طالب</strong> يحققون أحلامهم الآن!
              </div>
            </div>

            {/* Platform Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-200/80 dark:border-slate-800/80 pt-6 text-right">
              {stats.slice(0, 4).map((st, i) => (
                <div key={st.id || i} className="space-y-0.5">
                  <div className="font-black text-2xl sm:text-3xl text-brand-600 dark:text-brand-400 font-tajawal">
                    {st.number}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left Column: Visual Interactive Graphic Cards with Floating Badges */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Floating Glass Badge 1: Success Rate */}
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 z-20 p-3.5 rounded-2xl glass-card text-slate-900 dark:text-white shadow-xl flex items-center gap-3 animate-float border border-white/40">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">نسبة القبول في الهندسة</div>
                  <div className="text-base font-black text-amber-500 font-tajawal">96.4% قبول سنوي 🏆</div>
                </div>
              </div>

              {/* Floating Glass Badge 2: Live Duel Challenge */}
              <div className="absolute -bottom-5 -left-4 sm:-bottom-6 sm:-left-6 z-20 p-3.5 rounded-2xl glass-card text-slate-900 dark:text-white shadow-xl flex items-center gap-3 animate-float border border-white/40" style={{ animationDelay: '2s' }}>
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-brand-600/30">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">مبارزات ألعاب حية</div>
                  <div className="text-base font-black text-brand-600 dark:text-brand-400 font-tajawal">تحديات 1v1 مباشرة ⚔️</div>
                </div>
              </div>

              {/* Main Photo Carousel */}
              <div className="relative overflow-hidden rounded-[36px] border-2 border-slate-200/80 dark:border-slate-700/80 bg-slate-950 shadow-[0_30px_70px_rgba(15,23,42,0.22)] ring-1 ring-white/10">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-indigo-500/10 to-emerald-500/10" />

                <div className="relative aspect-[4/5] sm:aspect-[4/5] overflow-hidden">
                  {studentPhotos.map((photo, index) => (
                    <div
                      key={`${photo.url}-${index}`}
                      className={`absolute inset-0 transition-all duration-1000 ease-out ${
                        index === activeStudentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.label || `طالب ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {photo.label && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-6 pb-6 pt-16 text-white space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black font-tajawal leading-tight">{photo.label}</span>
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                              ✓
                            </span>
                          </div>
                          {photo.details && (
                            <div className="text-xs text-slate-300 font-semibold">{photo.details}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {studentPhotos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-10">
                    {studentPhotos.map((photo, index) => (
                      <button
                        key={`${photo.url}-dot-${index}`}
                        type="button"
                        aria-label={`عرض صورة الطالب ${index + 1}`}
                        onClick={() => setActiveStudentIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === activeStudentIndex ? 'w-8 bg-brand-500' : 'w-2 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
