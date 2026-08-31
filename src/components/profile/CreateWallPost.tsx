'use client';

import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Send,
  Smile,
  X,
  Sparkles,
  Paperclip,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CreateWallPostProps {
  targetUserId?: string | null;
  targetUserName?: string;
  onPostCreated: (post: any) => void;
}

export default function CreateWallPost({
  targetUserId,
  targetUserName,
  onPostCreated,
}: CreateWallPostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showFeelings, setShowFeelings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const feelings = [
    { label: 'يذاكر بتركيز', emoji: '📚' },
    { label: 'متحمس للنجاح', emoji: '🔥' },
    { label: 'مستعد للامتحان', emoji: '✍️' },
    { label: 'فخور بالإنجاز', emoji: '🏆' },
    { label: 'يتحدى الصعاب', emoji: '💪' },
    { label: 'متفائل', emoji: '✨' },
  ];

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImageUrls((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
      setShowImageInput(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload using /api/upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrls((prev) => [...prev, data.url]);
      } else {
        alert(data.error || 'فشل رفع الصورة');
      }
    } catch {
      alert('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && imageUrls.length === 0) return;

    setSubmitting(true);
    try {
      let finalContent = content.trim();
      if (selectedFeeling) {
        finalContent = `${selectedFeeling} — ${finalContent}`;
      }

      const endpoint = targetUserId
        ? `/api/users/${targetUserId}/wall`
        : `/api/users/${user.id}/wall`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: finalContent,
          imageUrl: imageUrls[0] || null,
          images: imageUrls,
        }),
      });

      const data = await res.json();
      if (res.ok && data.post) {
        onPostCreated(data.post);
        setContent('');
        setImageUrls([]);
        setSelectedFeeling(null);
        setShowFeelings(false);
      } else {
        alert(data.error || 'فشل نشر المنشور');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  const placeholderText = targetUserId && targetUserId !== user.id
    ? `اكتب شيئاً على حائط ${targetUserName || 'زميلك'}...`
    : `بماذا تفكر اليوم يا ${user.name?.split(' ')[0] || 'طالب'}؟ شارك زملاءك ملاحظة أو سؤالاً أو صورة...`;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-soft">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top: Avatar + Input */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-brand-50 dark:bg-brand-950/60 border border-slate-200 dark:border-slate-700 shrink-0">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-sm">
                {user.name?.charAt(0) || 'ط'}
              </div>
            )}
          </div>

          <div className="flex-1">
            {selectedFeeling && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-100 dark:border-brand-900">
                <span>{selectedFeeling}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFeeling(null)}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholderText}
              rows={3}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-800 transition resize-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Selected Images Preview Grid */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-2 left-2 w-7 h-7 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-rose-600 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Image URL Input Form */}
        {showImageInput && (
          <div className="flex gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <input
              type="url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="ضع رابط الصورة هنا (مثال: https://...)"
              className="flex-1 px-3 py-2 text-xs bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition"
            >
              إضافة
            </button>
            <button
              type="button"
              onClick={() => setShowImageInput(false)}
              className="px-2 py-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Feelings Popover */}
        {showFeelings && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 animate-fadeIn">
            {feelings.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedFeeling(`${item.emoji} ${item.label}`);
                  setShowFeelings(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-950/50 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center gap-1.5 transition"
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1">
            {/* Upload image from device */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
              title="رفع صورة من الجهاز"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
              ) : (
                <ImageIcon className="w-4 h-4 text-emerald-500" />
              )}
              <span className="hidden sm:inline">صورة / مذكرة</span>
            </button>

            {/* Image link button */}
            <button
              type="button"
              onClick={() => setShowImageInput(!showImageInput)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Paperclip className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">رابط صورة</span>
            </button>

            {/* Feelings / Status button */}
            <button
              type="button"
              onClick={() => setShowFeelings(!showFeelings)}
              className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Smile className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">الشعور / الحالة</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || (!content.trim() && imageUrls.length === 0)}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-brand-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>نشر</span>
          </button>
        </div>
      </form>
    </div>
  );
}
