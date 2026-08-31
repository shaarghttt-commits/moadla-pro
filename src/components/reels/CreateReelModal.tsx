'use client';

import React, { useState, useRef } from 'react';
import {
  Film,
  Upload,
  Video,
  X,
  Sparkles,
  Music,
  Hash,
  Loader2,
  Check,
  Play,
  Pause,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReelCreated: (newReel: any) => void;
}

export default function CreateReelModal({
  isOpen,
  onClose,
  onReelCreated,
}: CreateReelModalProps) {
  const { user } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('math');
  const [audioTitle, setAudioTitle] = useState('الصوت الأصلي');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [previewStream, setPreviewStream] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('حجم الفيديو يجب ألا يتجاوز 50 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setVideoUrl(reader.result);
        setPreviewStream(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      setErrorMsg('يرجى رفع ملف فيديو أو إدخال رابط الفيديو');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          content,
          tag,
          audioTitle: audioTitle || 'الصوت الأصلي',
        }),
      });

      const data = await res.json();
      if (res.ok && data.reel) {
        onReelCreated(data.reel);
        onClose();
      } else {
        setErrorMsg(data.error || 'فشل نشر مقطع الريلز');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('حدث خطأ أثناء الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const TAGS = [
    { id: 'math', label: '📐 تفاضل وتكامل', hashtag: '#تفاضل_وتكامل' },
    { id: 'physics', label: '⚡ فيزياء كهربية', hashtag: '#فيزياء' },
    { id: 'mechanics', label: '⚙️ ميكانيكا', hashtag: '#ميكانيكا' },
    { id: 'tips', label: '💡 نصائح وبابل شيت', hashtag: '#نصائح_تفوق' },
    { id: 'motivation', label: '🔥 تحفيز وتشجيع', hashtag: '#عافر_توصل' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-tajawal">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-purple-500 rounded-[36px] p-6 sm:p-8 text-white text-right space-y-5 shadow-2xl animate-scale-up max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-purple-400">إضافة مقطع ريلز تعليمي جديد</h3>
            <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Film className="w-4 h-4" />
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Video File / URL Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-300">
              ملف مقطع الفيديو (MP4 / WebM / Shorts):
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* File Upload Button */}
              <label className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs shadow-lg transition hover:scale-105 shrink-0">
                <Upload className="w-4 h-4" />
                <span>رفع فيديو من الجهاز</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-slate-500 font-bold">أو</span>

              <input
                type="url"
                value={videoUrl.startsWith('data:') ? 'تم تحميل ملف فيديو محلي ✓' : videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  setPreviewStream(e.target.value);
                }}
                placeholder="رابط فيديو مباشر https://...mp4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Video Preview Box (9:16 Vertical Aspect) */}
          {previewStream && (
            <div className="relative mx-auto w-48 aspect-[9/16] rounded-2xl overflow-hidden bg-black border-2 border-purple-500/60 shadow-xl group">
              <video
                ref={videoRef}
                src={previewStream}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) videoRef.current.pause();
                    else videoRef.current.play();
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover:opacity-100 transition"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Description & Hashtags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-300">
              عنوان ووصف الفيديو والهاشتاجات:
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب شرحاً مختصراً للمسألة أو الفكرة والهاشتاجات مثلاً: #تفاضل_وتكامل #معادلة_هندسة..."
              className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          {/* Category / Topic Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-300">
              تصنيف المقطع:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {TAGS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTag(t.id);
                    if (!content.includes(t.hashtag)) {
                      setContent((prev) => `${prev} ${t.hashtag}`.trim());
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    tag === t.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound / Music Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-300 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-pink-400" />
              <span>اسم الصوت أو المقطع الصوتي المصاحب:</span>
            </label>
            <input
              type="text"
              value={audioTitle}
              onChange={(e) => setAudioTitle(e.target.value)}
              placeholder="مثال: الصوت الأصلي - معادلة برو"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-purple-500"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={submitting || !videoUrl}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black shadow-lg transition flex items-center gap-2 disabled:opacity-50 hover:scale-105"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>نشر مقطع الريلز 🎬🚀</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
