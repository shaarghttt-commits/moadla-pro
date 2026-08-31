'use client';

import React, { useState } from 'react';
import {
  X,
  Type,
  Image as ImageIcon,
  HelpCircle,
  Mic,
  Sparkles,
  Send,
  Loader2,
  Check,
  Smile,
  Palette,
  Upload,
  Clock,
  Plus,
  Trash2,
  Music,
  Disc,
  Play,
  Volume2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AudioRecorder from '@/components/common/AudioRecorder';
import { PRESET_MUSIC_TRACKS, MusicTrack } from '@/lib/musicTracks';

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (newStory: any) => void;
}

const GRADIENT_PRESETS = [
  { id: 'grad-blue', label: 'أزرق كوني', class: 'bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-950 text-white' },
  { id: 'grad-purple', label: 'بنفسجي ملكي', class: 'bg-gradient-to-br from-purple-700 via-fuchsia-800 to-indigo-950 text-white' },
  { id: 'grad-fire', label: 'حماس ناري', class: 'bg-gradient-to-br from-amber-500 via-orange-600 to-rose-700 text-white' },
  { id: 'grad-emerald', label: 'أخضر تفوق', class: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white' },
  { id: 'grad-sunset', label: 'غروب هادئ', class: 'bg-gradient-to-br from-rose-500 via-pink-600 to-purple-900 text-white' },
  { id: 'grad-dark', label: 'فخم ليلي', class: 'bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white' },
  { id: 'grad-cyber', label: 'سايبر', class: 'bg-gradient-to-br from-cyan-600 via-blue-700 to-violet-950 text-white' },
  { id: 'grad-gold', label: 'ذهبي ناصع', class: 'bg-gradient-to-br from-yellow-500 via-amber-600 to-stone-900 text-white' },
];

const STICKERS = ['🎓', '🔥', '📚', '💡', '🚀', '💯', '✨', '⚡', '💪', '🏆', '🎯', '❤️'];

interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export default function StoryCreatorModal({
  isOpen,
  onClose,
  onStoryCreated,
}: StoryCreatorModalProps) {
  const { user } = useAuth();
  const [storyType, setStoryType] = useState<'TEXT' | 'IMAGE' | 'QUIZ' | 'AUDIO'>('TEXT');
  const [content, setContent] = useState('');
  const [selectedBg, setSelectedBg] = useState(GRADIENT_PRESETS[0]);
  const [fontFamily, setFontFamily] = useState<'tajawal' | 'cairo'>('tajawal');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Music state 🎵
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [customSongTitle, setCustomSongTitle] = useState('');

  // Quiz / Poll state
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<QuizOption[]>([
    { id: 'opt-1', text: '', isCorrect: true },
    { id: 'opt-2', text: '', isCorrect: false },
  ]);

  // Audio voice note state
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddSticker = (sticker: string) => {
    setContent((prev) => prev + ' ' + sticker);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setUploadingImage(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/social/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('فشل رفع الصورة');
      const data = await res.json();
      setImageUrl(data.url || data.secure_url || preview);
    } catch (err: any) {
      console.error(err);
      setImageUrl(preview);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddQuizOption = () => {
    if (quizOptions.length >= 4) return;
    setQuizOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, text: '', isCorrect: false },
    ]);
  };

  const handleRemoveQuizOption = (id: string) => {
    if (quizOptions.length <= 2) return;
    setQuizOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleOptionTextChange = (id: string, text: string) => {
    setQuizOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, text } : o))
    );
  };

  const handleSetCorrectOption = (id: string) => {
    setQuizOptions((prev) =>
      prev.map((o) => ({ ...o, isCorrect: o.id === id }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (storyType === 'TEXT' && !content.trim()) {
      setErrorMsg('يرجى كتابة نص القصة');
      return;
    }

    if (storyType === 'IMAGE' && !imageUrl && !imagePreview) {
      setErrorMsg('يرجى اختيار صورة للقصة');
      return;
    }

    if (storyType === 'QUIZ') {
      if (!quizQuestion.trim()) {
        setErrorMsg('يرجى كتابة السؤال التفاعلي');
        return;
      }
      if (quizOptions.some((o) => !o.text.trim())) {
        setErrorMsg('يرجى ملء جميع الخيارات');
        return;
      }
    }

    if (storyType === 'AUDIO' && !audioUrl) {
      setErrorMsg('يرجى تسجيل الملاحظة الصوتية أولاً');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: storyType,
          content: content.trim(),
          mediaUrl: storyType === 'IMAGE' ? imageUrl || imagePreview : null,
          audioUrl: storyType === 'AUDIO' ? audioUrl : null,
          audioDuration: storyType === 'AUDIO' ? audioDuration : null,
          musicTitle: selectedMusic ? selectedMusic.title : null,
          musicArtist: selectedMusic ? selectedMusic.artist : null,
          musicUrl: selectedMusic ? selectedMusic.previewUrl : null,
          quizQuestion: storyType === 'QUIZ' ? quizQuestion.trim() : null,
          quizOptions: storyType === 'QUIZ' ? quizOptions : null,
          bgColor: selectedBg.class,
          fontFamily,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء نشر القصة');
      }

      onStoryCreated(data.story);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل في نشر القصة');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left/Main: Controls Panel */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[92vh]">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>القصص التفاعلية 24h</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
                إنشاء قصة جديدة
              </h2>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-4 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1 text-center">
              <button
                type="button"
                onClick={() => setStoryType('TEXT')}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  storyType === 'TEXT'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>نصية</span>
              </button>

              <button
                type="button"
                onClick={() => setStoryType('IMAGE')}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  storyType === 'IMAGE'
                    ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>مصورة</span>
              </button>

              <button
                type="button"
                onClick={() => setStoryType('QUIZ')}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  storyType === 'QUIZ'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>كويز / تصويت</span>
              </button>

              <button
                type="button"
                onClick={() => setStoryType('AUDIO')}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
                  storyType === 'AUDIO'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>صوتية</span>
              </button>
            </div>

            {/* MUSIC ATTACHMENT BAR 🎵 */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal truncate">
                    {selectedMusic ? selectedMusic.title : 'موسيقى / أغنية القصة 🎵'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {selectedMusic ? `${selectedMusic.artist} • ${selectedMusic.genre}` : 'أضف لحناً أو أغنية محفزة للقصة'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedMusic ? (
                  <button
                    type="button"
                    onClick={() => setSelectedMusic(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 text-xs"
                    title="حذف الأغنية"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => setShowMusicModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-sm transition"
                >
                  {selectedMusic ? 'تغيير' : 'اختيار أغنية 🎧'}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 dark:text-rose-300 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* TAB 1: TEXT STORY */}
            {storyType === 'TEXT' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اكتب نص القصة:
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="شارك إنجازك اليومي، أو فكرة، أو سؤالاً للمناقشة..."
                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Stickers row */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    <span>إضافة ملصق سريع:</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {STICKERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddSticker(s)}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-sm transition hover:scale-110"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5 text-purple-500" />
                    <span>نمط وتدرج الخلفية:</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {GRADIENT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedBg(preset)}
                        className={`h-10 rounded-xl ${preset.class} flex items-center justify-center text-xs font-bold transition-all ${
                          selectedBg.id === preset.id
                            ? 'ring-2 ring-brand-500 ring-offset-2 scale-105 shadow-md'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {selectedBg.id === preset.id && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: IMAGE STORY */}
            {storyType === 'IMAGE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-brand-500" />
                    <span>اختر صورة القصة:</span>
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-500 rounded-3xl p-6 text-center cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-2 pointer-events-none">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {uploadingImage ? 'جاري رفع الصورة...' : 'اضغط لاختيار صورة من جهازك'}
                      </p>
                      <p className="text-[11px] text-slate-400">PNG, JPG, WEBP حتى 5MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    نص توضيحي على الصورة:
                  </label>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="اكتب تعليقاً يظهر أسفل القصة..."
                    maxLength={150}
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: QUIZ & POLL STORY */}
            {storyType === 'QUIZ' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    نص السؤال أو الاستطلاع:
                  </label>
                  <input
                    type="text"
                    value={quizQuestion}
                    onChange={(e) => setQuizQuestion(e.target.value)}
                    placeholder="مثال: ما ناتج تكامل دالة e^(2x)؟"
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      الخيارات (حدد الإجابة الصحيحة بالضغط على الدائرة):
                    </label>
                    {quizOptions.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddQuizOption}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة خيار</span>
                      </button>
                    )}
                  </div>

                  {quizOptions.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(opt.id)}
                        title="تحديد كإجابة صحيحة"
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          opt.isCorrect
                            ? 'bg-emerald-500 text-white shadow-md'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {opt.isCorrect ? <Check className="w-4 h-4" /> : idx + 1}
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                        placeholder={`الخيار ${idx + 1}...`}
                        className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                      />
                      {quizOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuizOption(opt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Background selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    خلفية بطاقة السؤال:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {GRADIENT_PRESETS.slice(0, 4).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedBg(preset)}
                        className={`h-9 rounded-xl ${preset.class} flex items-center justify-center text-xs font-bold ${
                          selectedBg.id === preset.id ? 'ring-2 ring-amber-500 scale-105' : 'opacity-80'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AUDIO VOICE STORY */}
            {storyType === 'AUDIO' && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  سجل ملاحظة صوتية سريعة لشرح مسألة أو تقديم نصيحة دراسية لزملائك:
                </p>

                <AudioRecorder
                  onAudioRecorded={(url, dur) => {
                    setAudioUrl(url);
                    setAudioDuration(dur);
                  }}
                />

                {audioUrl && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>تم حفظ التسجيل الصوتي بنجاح! ({audioDuration} ثانية)</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عنوان أو وصف الملاحظة الصوتية:
                  </label>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="مثال: فكرة مسألة صعبة في الفيزياء الكهربية..."
                    className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || uploadingImage}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-black text-xs shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>نشر في قصتي الآن 🚀</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Mock Preview */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 mb-3">معاينة شكل القصة:</p>

          <div
            className={`w-64 sm:w-72 h-96 sm:h-[420px] rounded-[28px] p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 ${
              storyType === 'IMAGE' ? 'bg-slate-900 text-white' : selectedBg.class
            }`}
          >
            {/* Top Bar */}
            <div className="relative z-10 space-y-2">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-white rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full ring-2 ring-white/60 overflow-hidden bg-brand-500 flex items-center justify-center text-white font-bold text-xs">
                    {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white">{user?.name || 'طالب متميز'}</p>
                    <p className="text-[9px] text-white/75">الآن • عام</p>
                  </div>
                </div>

                {/* Spinning Music Badge if Attached */}
                {selectedMusic && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[9px] font-black text-white border border-white/20 animate-pulse">
                    <Disc className="w-3 h-3 text-purple-300 animate-spin" />
                    <span className="truncate max-w-[90px]">{selectedMusic.title}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Center Content Preview */}
            <div className="relative z-10 my-auto text-center px-2">
              {storyType === 'TEXT' && (
                <p className="text-base font-black text-white whitespace-pre-wrap leading-relaxed">
                  {content.trim() || 'اكتب نص القصة لتشاهده هنا مباشرة...'}
                </p>
              )}

              {storyType === 'IMAGE' && (
                <>
                  {imagePreview || imageUrl ? (
                    <img src={imagePreview || imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
                  ) : (
                    <div className="text-white/40 text-xs font-bold flex flex-col items-center gap-1">
                      <ImageIcon className="w-8 h-8" />
                      <span>ستظهر الصورة هنا</span>
                    </div>
                  )}
                  {content && (
                    <div className="relative z-10 mt-auto p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-bold text-center">
                      {content}
                    </div>
                  )}
                </>
              )}

              {storyType === 'QUIZ' && (
                <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white space-y-3">
                  <p className="text-xs font-black leading-snug">
                    {quizQuestion.trim() || 'سؤال أو استطلاع اليوم ❓'}
                  </p>
                  <div className="space-y-1.5">
                    {quizOptions.map((o, idx) => (
                      <div
                        key={o.id}
                        className="py-2 px-3 rounded-xl bg-white/20 text-xs font-bold text-right flex items-center justify-between"
                      >
                        <span>{o.text || `الخيار ${idx + 1}`}</span>
                        {o.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {storyType === 'AUDIO' && (
                <div className="p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white space-y-3 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-rose-500 text-white flex items-center justify-center text-xl shadow-lg animate-pulse">
                    🎙️
                  </div>
                  <p className="text-xs font-black">
                    {content || 'ملاحظة صوتية لشرح مسألة 🎧'}
                  </p>
                  <div className="text-[10px] text-white/80">
                    {audioDuration > 0 ? `${audioDuration} ثانية` : 'تسجيل صوتي'}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/20">
              <div className="px-2.5 py-0.5 rounded-full bg-white/20 text-[9px] font-bold text-white">
                إرسال رسالة...
              </div>
              <div className="flex items-center gap-1 text-xs">
                <span>❤️</span>
                <span>🔥</span>
                <span>👏</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MUSIC SELECTION MODAL POPUP 🎧 */}
      {showMusicModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal">
                  اختر موسيقى أو أغنية للقصة 🎵
                </h3>
              </div>
              <button
                onClick={() => setShowMusicModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              اختر لحناً دراسياً أو أغنية حماسية تعزف في خلفية قصتك:
            </p>

            {/* Preset Tracks List */}
            <div className="space-y-2">
              {PRESET_MUSIC_TRACKS.map((track) => {
                const isSelected = selectedMusic?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      setSelectedMusic(track);
                      setShowMusicModal(false);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg font-bold">
                        {track.emoji}
                      </span>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                          {track.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {track.artist} • {track.genre}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px]"
                    >
                      {isSelected ? 'محدد ✅' : 'اختيار'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Custom Song Title Input */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                أو اكتب اسم أغنية مخصصة:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customSongTitle}
                  onChange={(e) => setCustomSongTitle(e.target.value)}
                  placeholder="مثال: أغنية حماسية - اسم الفنان..."
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customSongTitle.trim()) {
                      setSelectedMusic({
                        id: `custom-${Date.now()}`,
                        title: customSongTitle.trim(),
                        artist: 'موسيقى مخصصة',
                        genre: 'موسيقى',
                        duration: 15,
                        emoji: '🎵',
                      });
                      setShowMusicModal(false);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
