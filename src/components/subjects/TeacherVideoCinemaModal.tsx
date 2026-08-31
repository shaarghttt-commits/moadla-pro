'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  Film,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Share2,
  FileText,
  Youtube,
  Zap,
  GraduationCap,
  MessageSquare,
  ListVideo,
  ExternalLink,
  RefreshCw,
  Tv,
} from 'lucide-react';

export interface TeacherLessonVideo {
  id: string;
  title: string;
  duration?: string;
  youtubeEmbedId: string;
  chapter: string;
  notes?: string;
  keyFormulas?: string[];
}

export interface TeacherCourse {
  name: string;
  title: string;
  specialty: string;
  channelName: string;
  channelUrl?: string;
  playlistUrl?: string;
  playlistId?: string;
  isPopular?: boolean;
  avatar?: string;
  videos: TeacherLessonVideo[];
}

interface TeacherVideoCinemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: TeacherCourse | null;
}

export default function TeacherVideoCinemaModal({
  isOpen,
  onClose,
  teacher,
}: TeacherVideoCinemaModalProps) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [studentNotes, setStudentNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'playlist' | 'notes'>('playlist');
  const [isPlaylistMode, setIsPlaylistMode] = useState(false);
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string>('all');

  if (!isOpen || !teacher) return null;

  const currentVideo = teacher.videos[selectedVideoIndex] || teacher.videos[0];
  const embedId = currentVideo.youtubeEmbedId || 'tyEOkAd5Dpk';

  // If in playlist mode and teacher has playlistId, embed the playlist
  const embedUrl = isPlaylistMode && teacher.playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${teacher.playlistId}&rel=0&modestbranding=1&playsinline=1`
    : `https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  const youtubeWatchUrl = isPlaylistMode && teacher.playlistUrl
    ? teacher.playlistUrl
    : `https://www.youtube.com/watch?v=${embedId}`;

  const channelUrl =
    teacher.channelUrl ||
    (teacher.name.includes('محمود مجدي')
      ? 'https://www.youtube.com/@PhysicsMahmoudMagdy'
      : teacher.name.includes('عبد المعبود') || teacher.name.includes('عبدالمعبود')
        ? 'https://www.youtube.com/@mr.abdelmaaboud'
        : `https://www.youtube.com/results?search_query=${encodeURIComponent(teacher.name)}`);

  const [iframeKey, setIframeKey] = useState(0);

  // Filter lessons by chapter if selected
  const filteredVideos = selectedChapterFilter === 'all'
    ? teacher.videos
    : teacher.videos.filter((v) => v.chapter.includes(selectedChapterFilter));

  const chapters = Array.from(new Set(teacher.videos.map((v) => v.chapter)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-xl animate-fade-in font-tajawal">
      <div className="relative w-full max-w-6xl h-[94vh] max-h-[900px] bg-slate-900 border-2 border-brand-500/50 rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col text-white">

        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-tajawal">
                  {teacher.name}
                </h3>
                {teacher.isPopular && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs">
                    Popular ⭐
                  </span>
                )}
                {teacher.playlistId && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-black">
                    بلاك ليست المنهج كامل 🎬
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {teacher.channelName} • {teacher.specialty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {teacher.playlistId && (
              <button
                type="button"
                onClick={() => {
                  setIsPlaylistMode(!isPlaylistMode);
                  setIframeKey((prev) => prev + 1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition border ${isPlaylistMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                title="التبديل بين مشغل الحصص المنظمة وقائمة تشغيل YouTube الكاملة"
              >
                <ListVideo className="w-4 h-4" />
                <span>{isPlaylistMode ? 'العودة لفهرس الحصص' : 'تشغيل البلايلست كاملة 📑'}</span>
              </button>
            )}

            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition shadow-sm"
              title="فتح هذا الفيديو أو البلايلست مباشرة على يوتيوب"
            >
              <Youtube className="w-4 h-4" />
              <span>فتح في YouTube ↗</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Cinema Player & Playlist Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">

          {/* Left / Main Section: Embedded Video Cinema Arena (Takes 2 Columns on Desktop) */}
          <div className="lg:col-span-2 flex flex-col bg-black overflow-y-auto">

            {/* Live Video Player Iframe - Plays Directly on Platform */}
            <div className="relative w-full aspect-video bg-black shrink-0 border-b border-slate-800/80">
              <iframe
                key={`${embedUrl}-${iframeKey}`}
                src={embedUrl}
                title={isPlaylistMode ? `${teacher.name} - قائمة تشغيل المنهج كامل` : currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full object-cover"
              />
            </div>

            {/* Video Details, Formulas & Notes */}
            <div className="p-5 sm:p-6 space-y-5 flex-1 bg-slate-900/70">
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950 text-brand-400 border border-brand-800 text-[11px] font-black">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isPlaylistMode ? 'قائمة تشغيل المنهج الكاملة' : currentVideo.chapter}</span>
                  </span>

                  <span className="text-xs text-slate-400 font-bold">
                    {isPlaylistMode
                      ? `تشغيل متسلسل لجميع الحصص (${teacher.videos.length} حصة)`
                      : `حصة ${selectedVideoIndex + 1} من ${teacher.videos.length}`}
                  </span>
                </div>

                <h1 className="text-base sm:text-xl font-black text-white font-tajawal pt-1">
                  {isPlaylistMode ? `بلايلست مادة الفيزياء كاملة - ${teacher.name}` : currentVideo.title}
                </h1>

                {currentVideo.notes && !isPlaylistMode && (
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>أهم نقاط وأفكار الحصة:</span>
                    </div>
                    {currentVideo.notes}
                  </div>
                )}

                {currentVideo.keyFormulas && currentVideo.keyFormulas.length > 0 && !isPlaylistMode && (
                  <div className="p-4 rounded-2xl bg-brand-950/40 border border-brand-800/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-brand-400 font-bold text-xs">
                      <Zap className="w-4 h-4" />
                      <span>أهم القوانين الرياضية في هذه الحصة:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      {currentVideo.keyFormulas.map((f, i) => (
                        <div key={i} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200">
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Student Study Companion Controls */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <GraduationCap className="w-4 h-4 text-brand-400" />
                  <span>معادلة كلية الهندسة • مشاهدة مباشرة على المنصة 🎬</span>
                </div>

                {!isPlaylistMode && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedVideoIndex > 0) setSelectedVideoIndex(selectedVideoIndex - 1);
                      }}
                      disabled={selectedVideoIndex === 0}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold transition"
                    >
                      السابق ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedVideoIndex < teacher.videos.length - 1) setSelectedVideoIndex(selectedVideoIndex + 1);
                      }}
                      disabled={selectedVideoIndex === teacher.videos.length - 1}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-xs font-bold transition"
                    >
                      التالي ▶
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Playlist & Interactive Notes (1 Column) */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-r border-slate-800 bg-slate-950/90 overflow-hidden">

            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 p-2 bg-slate-900/60 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('playlist')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${activeTab === 'playlist'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <ListVideo className="w-4 h-4" />
                <span>فهرس الحصص ({teacher.videos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${activeTab === 'notes'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
              >
                <FileText className="w-4 h-4" />
                <span>مفكرتي 📝</span>
              </button>
            </div>

            {/* Tab 1: Video Playlist */}
            {activeTab === 'playlist' ? (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {/* Chapter Filter Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSelectedChapterFilter('all')}
                    className={`px-2.5 py-1 rounded-lg shrink-0 font-bold transition ${selectedChapterFilter === 'all'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      }`}
                  >
                    الكل ({teacher.videos.length})
                  </button>
                  {chapters.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSelectedChapterFilter(ch)}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-bold transition ${selectedChapterFilter === ch
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                {filteredVideos.map((vid) => {
                  const originalIdx = teacher.videos.findIndex((v) => v.id === vid.id);
                  const isCurrent = originalIdx === selectedVideoIndex && !isPlaylistMode;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => {
                        setSelectedVideoIndex(originalIdx);
                        setIsPlaylistMode(false);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right space-y-1.5 ${isCurrent
                          ? 'bg-brand-950/80 border-brand-500 text-white shadow-md ring-1 ring-brand-500/40'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold">
                          حصة {originalIdx + 1}
                        </span>
                        {isCurrent ? (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>قيد التشغيل</span>
                          </span>
                        ) : (
                          <Play className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </div>

                      <h4 className="text-xs font-bold line-clamp-2 leading-relaxed">
                        {vid.title}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{vid.chapter}</span>
                        {vid.duration && (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{vid.duration}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Tab 2: Student Note-Taking Pad */
              <div className="flex-1 p-4 flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>سجل ملاحظاتك وأهم القوانين أثناء الشرح:</span>
                  <span className="text-amber-400">💡 محفوظة بجهازك</span>
                </div>

                <textarea
                  rows={10}
                  value={studentNotes}
                  onChange={(e) => {
                    setStudentNotes(e.target.value);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem(`moadla_notes_${teacher.name}`, e.target.value);
                    }
                  }}
                  placeholder="اكتب هنا القوانين والمسائل المهمة أثناء مذاكرتك لحصة المدرس..."
                  className="flex-1 w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-brand-500 leading-relaxed resize-none"
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStudentNotes('')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                  >
                    مسح الملاحظات 🗑️
                  </button>
                  <span className="text-[11px] text-emerald-400 font-bold">
                    تم الحفظ التلقائي ✓
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
