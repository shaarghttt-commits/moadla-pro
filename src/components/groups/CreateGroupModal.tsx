'use client';

import React, { useState } from 'react';
import { X, Users, Lock, Globe, Sparkles, Loader2, BookOpen, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (group: any) => void;
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ENGINEERING');
  const [isPrivate, setIsPrivate] = useState(false);
  const [icon, setIcon] = useState('📐');
  const [coverImage, setCoverImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { value: 'ENGINEERING', label: 'معادلة كلية الهندسة 📐' },
    { value: 'MATH', label: 'الرياضيات والتفاضل والجبر 🔢' },
    { value: 'PHYSICS', label: 'الفيزياء والميكانيكا ⚡' },
    { value: 'COMMERCE', label: 'معادلة كلية التجارة 📊' },
    { value: 'EXAM_PREP', label: 'مراجعات وبنك الأسئلة ✍️' },
    { value: 'GENERAL', label: 'عام ومناقشات طلابية 💬' },
  ];

  const iconOptions = ['📐', '⚡', '⚗️', '📚', '🎯', '🚀', '💡', '🏆', '🔥', '💻', '🇬🇧', '⚙️'];

  const coverOptions = [
    'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          isPrivate,
          icon,
          coverImage: coverImage || coverOptions[0],
        }),
      });

      const data = await res.json();
      if (res.ok && data.group) {
        onGroupCreated(data.group);
        onClose();
        router.push(`/groups/${data.group.slug}`);
      } else {
        setError(data.error || 'فشل إنشاء المجموعة');
      }
    } catch {
      setError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
                إنشاء مجموعة دراسية جديدة
              </h2>
              <p className="text-xs text-slate-400">كوّن مجتمعك الخاص وذاكر مع زملائك</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              أيقونة المجموعة:
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {iconOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition ${
                    icon === emoji
                      ? 'bg-brand-500 text-white ring-2 ring-brand-400 shadow-md scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم المجموعة:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مجموعة أبطال هندسة القاهرة 2025"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              التصنيف والمجال:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              وصف المجموعة وأهدافها:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة عن المجموعة وما تقدمه للطلاب..."
              rows={3}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Cover Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              صورة غلاف المجموعة:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {coverOptions.map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setCoverImage(url)}
                  className={`h-16 rounded-2xl overflow-hidden border-2 cursor-pointer transition ${
                    (coverImage || coverOptions[0]) === url
                      ? 'border-brand-600 ring-2 ring-brand-500/40'
                      : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPrivate ? (
                <Lock className="w-5 h-5 text-amber-500" />
              ) : (
                <Globe className="w-5 h-5 text-brand-500" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isPrivate ? 'مجموعة خاصة' : 'مجموعة عامة ومفتوحة'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isPrivate ? 'المنشورات للأعضاء فقط' : 'يمكن لجميع الطلاب رؤية المنشورات والانضمام'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isPrivate ? 'bg-amber-500' : 'bg-brand-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  isPrivate ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>إنشاء المجموعة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
