'use client';

import React from 'react';
import Link from 'next/link';
import {
  Swords,
  Users,
  Brain,
  Trophy,
  Zap,
  ArrowLeft,
  Flame,
  Sparkles,
  MessageCircle,
  Share2,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';

export default function SocialShowcaseSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-[#0a0f1d] to-slate-900 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-black border border-brand-500/30 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>مجتمع تفاعلي وقصص يومية لطلاب المعادلة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-tajawal leading-tight">
            لا تدرس بمفردك! انشر قصصك، تفاعل، ونافس زملائك
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            منصة متكاملة تجمع بين التحصيل الأكاديمي، القصص اليومية (Stories 24h)، خلاصة المجتمع الطلابي (Social Feed)، وألعاب المبارزات العلمية الحية 1v1.
          </p>
        </div>

        {/* 4 Showcase Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Card 1: Stories & Community Feed */}
          <div className="rounded-[28px] bg-slate-800/70 border border-slate-700/80 p-6 flex flex-col justify-between hover:border-rose-500/50 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-xl">
            <div className="space-y-4">
              <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
                ✨
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider">جديد وحصري</span>
                <h3 className="text-xl font-black font-tajawal text-white group-hover:text-rose-300 transition-colors">
                  القصص والمجتمع الطلابي
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                انشر قصصك اليومية (Stories) المصورة والنصية بمدة 24 ساعة، وشارك منشوراتك في الصفحة الرئيسية مع تفاعلات فيسبوك الكاملة.
              </p>

              <div className="space-y-2 pt-1 text-xs text-slate-300 font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>قصص 24 ساعة بمؤقت وعداد مشاهدين</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>تفاعلات حية (❤️ 🔥 💡 👏 😂)</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/feed"
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02]"
              >
                <Compass className="w-4 h-4" />
                <span>دخول المجتمع والقصص 🌐</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Live 1v1 Arena */}
          <div className="rounded-[28px] bg-slate-800/70 border border-slate-700/80 p-6 flex flex-col justify-between hover:border-amber-500/50 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shadow-lg">
                ⚔️
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">تحديات 1v1 مباشرة</span>
                <h3 className="text-xl font-black font-tajawal text-white group-hover:text-amber-300 transition-colors">
                  مبارزات ألعاب المعادلات
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                تحدَّ زملاءك في مبارزة تفاضل وفيزياء سريعة، اكسب نقاط XP، واعتلِ لوحة المتفوقين في الترتيب الأسبوعي.
              </p>

              <div className="space-y-2 pt-1 text-xs text-slate-300 font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>مبارزات تفاعلية بمؤقت زمني حقيقي</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>لوحة شرف وتتويج ثلاثية الأبعاد</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/games"
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <Swords className="w-4 h-4" />
                <span>ساحة الألعاب 🎮</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Study Groups Hub */}
          <div className="rounded-[28px] bg-slate-800/70 border border-slate-700/80 p-6 flex flex-col justify-between hover:border-indigo-500/50 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl shadow-lg">
                👥
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-wider">مجموعات المذاكرة</span>
                <h3 className="text-xl font-black font-tajawal text-white group-hover:text-indigo-300 transition-colors">
                  المجموعات الدراسية
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                انضم لمجموعات زملائك أو أنشئ مجموعتك الخاصة لمناقشة المسائل وتبادل مذكرات الـ PDF والملخصات.
              </p>

              <div className="space-y-2 pt-1 text-xs text-slate-300 font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>حائط منشورات ونقاشات مخصص</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>مشاركة مباشرة لملفات الـ PDF</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/groups"
                className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <Users className="w-4 h-4" />
                <span>استكشاف المجموعات 👥</span>
              </Link>
            </div>
          </div>

          {/* Card 4: Facebook-Style Profile Wall */}
          <div className="rounded-[28px] bg-slate-800/70 border border-slate-700/80 p-6 flex flex-col justify-between hover:border-brand-500/50 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center text-xl shadow-lg">
                👤
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-black text-brand-400 uppercase tracking-wider">بروفايل الطالب</span>
                <h3 className="text-xl font-black font-tajawal text-white group-hover:text-brand-300 transition-colors">
                  صفحتك وحائطك الشخصي
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                صفحة شخصية كاملة مع صورة غلاف، حائط منشورات، حلقة القصص اليومية، معرض صور، وشبكة أصدقاء ومحادثات.
              </p>

              <div className="space-y-2 pt-1 text-xs text-slate-300 font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>حلقة القصص التفاعلية على الصورة الشخصية</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>شبكة الأصدقاء والمراسلات الفورية</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/profile"
                className="w-full py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>ملفي الشخصي 👤</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
