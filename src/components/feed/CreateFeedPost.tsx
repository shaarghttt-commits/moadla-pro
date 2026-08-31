'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Smile,
  Tag,
  Send,
  Loader2,
  X,
  Sparkles,
  Flame,
  BookOpen,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CreateFeedPostProps {
  onPostCreated: (post: any) => void;
}

const SUBJECT_OPTIONS = [
  { id: 'general', label: '🌐 نقاش عام' },
  { id: 'calculus', label: '📐 تفاضل وتكامل' },
  { id: 'physics', label: '⚡ فيزياء' },
  { id: 'mechanics', label: '⚙️ ميكانيكا' },
  { id: 'algebra', label: '🔢 جبر وفراغية' },
  { id: 'exams', label: '📋 امتحانات وتوقعات' },
];

const MOOD_OPTIONS = [
  { id: '🔥 متحمس ومستعد', label: '🔥 حماس' },
  { id: '💡 فكرة أو استفسار', label: '💡 استفسار' },
  { id: '📚 بذاكر بتركيز', label: '📚 مذاكرة' },
  { id: '🏆 حققت إنجاز', label: '🏆 إنجاز' },
  { id: '🤔 محتاج توضيح', label: '🤔 سؤال' },
];

export default function CreateFeedPost({ onPostCreated }: CreateFeedPostProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [subjectTag, setSubjectTag] = useState('general');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!user) {
    return (
      <div className="glass-card rounded-[28px] p-6 text-center border border-slate-200/80 dark:border-slate-800 space-y-3">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          انضم إلى مجتمع طلاب معادلة الهندسة وشارك منشوراتك وأسئلتك
        </p>
        <a
          href="/login?callbackUrl=/feed"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition"
        >
          <span>تسجيل الدخول للمشاركة</span>
        </a>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMsg('');

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/social/upload', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedUrls.push(data.url || data.secure_url);
        } else {
          // Fallback object URL
          uploadedUrls.push(URL.createObjectURL(file));
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 4));
    } catch (err: any) {
      console.error(err);
      setErrorMsg('فشل رفع بعض الصور');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          images,
          subjectTag,
          moodEmoji: selectedMood,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل في نشر المنشور');
      }

      onPostCreated(data.post);
      setContent('');
      setImages([]);
      setSelectedMood(null);
      setIsExpanded(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء النشر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card rounded-[28px] p-5 sm:p-6 shadow-soft border border-slate-200/80 dark:border-slate-800 transition-all duration-300">
      {/* Collapsed view */}
      {!isExpanded ? (
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-500 overflow-hidden flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              user.name?.charAt(0) || 'U'
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex-1 py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-right text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium transition"
          >
            ماذا يدور في ذهنك يا {user.name}؟ شارك سؤالاً أو معلومة...
          </button>
        </div>
      ) : (
        /* Expanded Form view */
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0) || 'U'
                )}
              </div>
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                  {user.name}
                </p>
                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                  منشور عام في مجتمع الطلاب
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب سؤالك، ملخص درس، فكرة مسألة، أو نقاش مع زملائك في المعادلة..."
            rows={4}
            autoFocus
            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white text-sm font-semibold resize-none"
          />

          {/* Uploaded Images Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl overflow-hidden h-24 bg-slate-900 group"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, i) => i !== idx))}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subject & Mood Selectors */}
          <div className="space-y-2.5 pt-2">
            {/* Subject Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0">المادة:</span>
              {SUBJECT_OPTIONS.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSubjectTag(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    subjectTag === sub.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Mood Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 shrink-0">الحالة:</span>
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(selectedMood === m.id ? null : m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedMood === m.id
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 hover:text-brand-600 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-2 cursor-pointer transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <ImageIcon className="w-4 h-4 text-brand-500" />
                <span>{uploadingImage ? 'جاري الرفع...' : 'إرفاق صور (حتى 4)'}</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={(!content.trim() && images.length === 0) || submitting || uploadingImage}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-xs shadow-glow flex items-center gap-2 transition disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>نشر في المجتمع 🚀</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
