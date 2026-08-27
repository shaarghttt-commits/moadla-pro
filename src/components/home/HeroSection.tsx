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
  const badge = heroData?.badge || 'المنصة التعليمية الشاملة لمعادلات الجامعات الحكومية';
  const title = heroData?.title || 'أقوى طريق نحو نجاحك في معادلة الجامعات';
  const subtitle =
    heroData?.subtitle ||
    'استعد لاجتياز معادلة كلية الهندسة، الحاسبات، التجارة، والزراعة بأقوى نظام تعليمي تفاعلي: دروس فيديو احترافية، أسئلة محاكية للامتحانات الرسمية، ومتابعة يومية لتحسين مستواك خطوة بخطوة.';
  const primaryText = heroData?.primaryButtonText || 'ابدأ الآن مجاناً';
  const primaryLink = heroData?.primaryButtonLink || '/register';
  const secondaryText = heroData?.secondaryButtonText || 'استكشف المواد';
  const secondaryLink = heroData?.secondaryButtonLink || '/sections';
  const heroImage = heroData?.imageUrl;

  const defaultStudentPhotos: StudentPhotoItem[] = [
    { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=80', label: 'أحمد محمد', details: 'كلية الهندسة - سنة أولى' },
    { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80', label: 'سارة علي', details: 'كلية الهندسة - سنة ثانية' },
    { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80', label: 'يوسف خالد', details: 'كلية الهندسة - سنة ثالثة' },
    { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80', label: 'ليلى محمود', details: 'كلية الهندسة - سنة رابعة' },
    { url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&auto=format&fit=crop&q=80', label: 'محمد حسن', details: 'كلية الهندسة - سنة أولى' },
    { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop&q=80', label: 'نورهان سامي', details: 'كلية الهندسة - سنة ثانية' },
    { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&auto=format&fit=crop&q=80', label: 'محمود أسامة', details: 'كلية الهندسة - سنة ثالثة' },
    { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&auto=format&fit=crop&q=80', label: 'زينب رامي', details: 'كلية الهندسة - سنة رابعة' },
    { url: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=1200&auto=format&fit=crop&q=80', label: 'إبراهيم فتحي', details: 'كلية الهندسة - سنة أولى' },
    { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&auto=format&fit=crop&q=80', label: 'سلمى أحمد', details: 'كلية الهندسة - سنة ثانية' },
  ];

  const normalizeStudentPhotos = (photos?: Array<string | StudentPhotoItem>) => {
    const source = Array.isArray(photos) && photos.length > 0 ? photos : defaultStudentPhotos;

    return source
      .map((item, index) => {
        if (typeof item === 'string') {
          return { url: item, label: `طالب ${index + 1}`, details: 'كلية الهندسة - سنة أولى' };
        }

        const url = item?.url || '';
        if (!url) return null;

        return {
          url,
          label: item?.label || item?.title || `طالب ${index + 1}`,
          details: item?.details || 'كلية الهندسة - سنة أولى',
        };
      })
      .filter((item): item is StudentPhotoItem & { url: string; label: string; details: string } => Boolean(item && item.url));
  };

  const studentPhotos = normalizeStudentPhotos(heroData?.studentPhotos);

  const [activeStudentIndex, setActiveStudentIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveStudentIndex((current) => (current + 1) % studentPhotos.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [studentPhotos.length]);

  const stats = statsData && statsData.length > 0 ? statsData : [
    { id: '1', number: '+15,000', label: 'طالب يثق بالمنصة' },
    { id: '2', number: '94.8%', label: 'متوسط النجاح' },
    { id: '3', number: '+500', label: 'اختبار وملف تدريبي' },
    { id: '4', number: '24/7', label: 'دعم ومتابعة' },
  ];

  const trustPills = ['دروس فيديو احترافية', 'أسئلة امتحانية حقيقية', 'متابعة مستمرة'];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background Gradients */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-accent-emerald/10 dark:bg-accent-emerald/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Right Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs sm:text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-brand-600 animate-pulse flex-shrink-0" />
              <span>{badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.25] tracking-tight font-tajawal">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
              {trustPills.map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm dark:border-brand-900/70 dark:bg-brand-950/60 dark:text-brand-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {pill}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3">
              <Link
                href={primaryLink}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 hover:from-brand-800 hover:to-brand-600 shadow-xl shadow-brand-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <span>{primaryText}</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>

              <Link
                href={secondaryLink}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <span>{secondaryText}</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-right lg:justify-start">
              <div className="flex -space-x-2">
                {studentPhotos.slice(0, 4).map((student, idx) => (
                  <img
                    key={`${student.label}-${idx}`}
                    src={student.url}
                    alt={student.label}
                    className="h-9 w-9 rounded-full border-2 border-white object-cover dark:border-slate-900"
                  />
                ))}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-black text-slate-900 dark:text-white">+15,000</span> طالب يعتمدون على المنصة
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-6 text-right dark:border-slate-800/80 sm:grid-cols-4">
              {stats.slice(0, 4).map((st, i) => (
                <div key={st.id || i}>
                  <div className="font-black text-2xl text-brand-600 dark:text-brand-400 sm:text-3xl font-tajawal">
                    {st.number}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Left Column: Visual Interactive Graphic Cards or Uploaded Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {heroImage ? (
                <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative aspect-video sm:aspect-auto">
                  <img
                    src={heroImage}
                    alt="Moadla Pro Banner"
                    className="w-full h-full object-cover rounded-3xl"
                  />
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-slate-950 shadow-[0_35px_80px_rgba(15,23,42,0.18)] ring-1 ring-white/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-500/15 via-sky-500/10 to-emerald-500/10" />

                  <div className="relative aspect-[4/6] overflow-hidden">
                    {studentPhotos.map((photo, index) => (
                      <div
                        key={`${photo.url}-${index}`}
                        className={`absolute inset-0 transition-all duration-1500 ease-out ${
                          index === activeStudentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.label || `طالب ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {photo.label && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-4 pb-5 pt-12 text-white">
                            <div className="text-lg font-black leading-tight">{photo.label}</div>
                            {photo.details && (
                              <div className="text-xs text-white/85 mt-1">{photo.details}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
