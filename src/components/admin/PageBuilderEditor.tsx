'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layout,
  Type,
  AlignLeft,
  Image as ImageIcon,
  Video,
  Grid,
  Sparkles,
  HelpCircle,
  Megaphone,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';

export interface PageBlock {
  id: string;
  type:
    | 'hero'
    | 'heading'
    | 'text'
    | 'image'
    | 'video'
    | 'cards'
    | 'features'
    | 'faq'
    | 'cta'
    | 'pdf_list';
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: Array<any>;
  isVisible: boolean;
}

interface PageBuilderEditorProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

const BLOCK_TYPES = [
  { type: 'hero', name: 'بانر رئيسي (Hero)', icon: Layout, desc: 'عنوان كبير مع وصف وصورة وأزرار' },
  { type: 'heading', name: 'عنوان رئيسي / فرعي', icon: Type, desc: 'عنوان جذاب لتقسيم محتوى الصفحة' },
  { type: 'text', name: 'نص مقروء (Markdown)', icon: AlignLeft, desc: 'فقرات نصية مع تنسيقات وقوائم' },
  { type: 'image', name: 'صورة مع شرح', icon: ImageIcon, desc: 'عرض صورة توضيحية أو إنفوجرافيك' },
  { type: 'video', name: 'فيديو تعليمي (Video)', icon: Video, desc: 'تضمين فيديو يوتيوب أو محاضرة' },
  { type: 'features', name: 'شبكة مميزات (Features)', icon: Sparkles, desc: 'بطاقات بأيقونات توضح المميزات' },
  { type: 'cards', name: 'شبكة بطاقات (Cards Grid)', icon: Grid, desc: 'كروت بمحتوى وروابط مخصصة' },
  { type: 'faq', name: 'أسئلة شائعة (FAQ Accordion)', icon: HelpCircle, desc: 'قائمة أسئلة وأجوبة تفاعلية' },
  { type: 'cta', name: 'بانر اتخاذ إجراء (CTA Banner)', icon: Megaphone, desc: 'دعوة للتسجيل أو الاشتراك' },
  { type: 'pdf_list', name: 'قائمة تحميل مذكرات PDF', icon: FileText, desc: 'ملفات قابلة للتحميل المباشر' },
];

export default function PageBuilderEditor({ blocks, onChange }: PageBuilderEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addBlock = (type: PageBlock['type']) => {
    const newBlock: PageBlock = {
      id: 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      type,
      title: type === 'hero' ? 'عنوان رئيسي جذاب' : type === 'heading' ? 'عنوان القسم' : '',
      subtitle: type === 'hero' ? 'اكتب نصاً توضيحياً هنا...' : '',
      content: type === 'text' ? 'اكتب محتوى الفقرة هنا...\n\n- نقطة أولى\n- نقطة ثانية' : '',
      buttonText: type === 'hero' || type === 'cta' ? 'ابدأ الآن' : '',
      buttonLink: type === 'hero' || type === 'cta' ? '/register' : '',
      badge: type === 'hero' || type === 'cta' ? 'جديد المنصة' : '',
      items:
        type === 'faq'
          ? [
              { q: 'ما هي شروط التقديم؟', a: 'الحصول على دبلوم بمجموع 70% فأكثر.' },
              { q: 'متى تبدأ الامتحانات؟', a: 'تبدأ الامتحانات في شهر سبتمبر سنوياً.' },
            ]
          : type === 'features' || type === 'cards'
          ? [
              { title: 'عنصر أول', desc: 'شرح مختصر للعنصر الأول...', icon: 'Sparkles' },
              { title: 'عنصر ثانٍ', desc: 'شرح مختصر للعنصر الثاني...', icon: 'BookOpen' },
            ]
          : type === 'pdf_list'
          ? [{ title: 'مذكرة الشرح الشاملة PDF', fileUrl: '', fileSize: '5 MB' }]
          : [],
      isVisible: true,
    };

    const updated = [...blocks, newBlock];
    onChange(updated);
    setActiveBlockId(newBlock.id);
    setShowAddMenu(false);
  };

  const updateBlock = (id: string, updates: Partial<PageBlock>) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    onChange(updated);
  };

  const deleteBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    onChange(updated);
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;
    onChange(newBlocks);
  };

  const toggleVisibility = (id: string) => {
    const target = blocks.find((b) => b.id === id);
    if (target) {
      updateBlock(id, { isVisible: !target.isVisible });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-tajawal">
            مُنشئ محتوى الصفحة المرئي (Page Blocks: {blocks.length})
          </h4>
          <p className="text-xs text-slate-500">أضف عناصر الصفحة ورتبها بكل سهولة</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة عنصر / Block</span>
        </button>
      </div>

      {/* Add Block Modal / Selector */}
      {showAddMenu && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-500/40 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">اختر نوع العنصر المراد إضافته:</span>
            <button
              type="button"
              onClick={() => setShowAddMenu(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              إلغاء
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {BLOCK_TYPES.map((bt) => {
              const Icon = bt.icon;
              return (
                <button
                  key={bt.type}
                  type="button"
                  onClick={() => addBlock(bt.type as any)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-right transition-all group flex flex-col justify-between h-28"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center transition-colors mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{bt.name}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{bt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Blocks List */}
      {blocks.length === 0 ? (
        <div className="py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <Layout className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">الصفحة لا تحتوي على أي عناصر حالياً</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">اضغط على زر "إضافة عنصر" للبدء في بناء محتوى الصفحة</p>
          <button
            type="button"
            onClick={() => setShowAddMenu(true)}
            className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow"
          >
            إضافة أول عنصر
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => {
            const isExpanded = activeBlockId === block.id;
            const blockMeta = BLOCK_TYPES.find((b) => b.type === block.type) || {
              name: block.type,
              icon: Layout,
            };
            const BlockIcon = blockMeta.icon;

            return (
              <div
                key={block.id}
                className={`rounded-2xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${
                  !block.isVisible
                    ? 'opacity-60 border-dashed border-slate-300 dark:border-slate-700'
                    : isExpanded
                    ? 'border-brand-500 shadow-md ring-1 ring-brand-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Block Header / Bar */}
                <div
                  onClick={() => setActiveBlockId(isExpanded ? null : block.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/70 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                      <BlockIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {blockMeta.name} {block.title ? `— ${block.title}` : ''}
                      </span>
                      <span className="block text-[10px] text-slate-400">عنصر #{index + 1}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, 'up')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg"
                      title="تحريك لأعلى"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, 'down')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg"
                      title="تحريك لأسفل"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      type="button"
                      onClick={() => toggleVisibility(block.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        block.isVisible
                          ? 'text-slate-400 hover:text-brand-600'
                          : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      }`}
                      title={block.isVisible ? 'إخفاء العنصر' : 'إظهار العنصر'}
                    >
                      {block.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => deleteBlock(block.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="حذف العنصر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Expand icon */}
                    <div className="p-1.5 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Block Content Editor Form */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
                    {/* Common fields: Title & Subtitle */}
                    {(block.type === 'hero' ||
                      block.type === 'heading' ||
                      block.type === 'features' ||
                      block.type === 'cards' ||
                      block.type === 'faq' ||
                      block.type === 'cta' ||
                      block.type === 'pdf_list') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            العنوان الرئيسي
                          </label>
                          <input
                            type="text"
                            value={block.title || ''}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            العنوان الفرعي / الوصف المختصر
                          </label>
                          <input
                            type="text"
                            value={block.subtitle || ''}
                            onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Hero & CTA specific fields */}
                    {(block.type === 'hero' || block.type === 'cta') && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">الشارة (Badge)</label>
                          <input
                            type="text"
                            value={block.badge || ''}
                            onChange={(e) => updateBlock(block.id, { badge: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">نص الزر</label>
                          <input
                            type="text"
                            value={block.buttonText || ''}
                            onChange={(e) => updateBlock(block.id, { buttonText: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">رابط الزر</label>
                          <input
                            type="text"
                            value={block.buttonLink || ''}
                            onChange={(e) => updateBlock(block.id, { buttonLink: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}

                    {/* Text / Markdown field */}
                    {(block.type === 'text' || block.type === 'hero') && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          المحتوى والشرح النصي (يدعم Markdown)
                        </label>
                        <textarea
                          rows={4}
                          value={block.content || ''}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder="اكتب النص هنا..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* Image Upload */}
                    {(block.type === 'image' || block.type === 'hero') && (
                      <div>
                        <ImageUpload
                          label="صورة العنصر"
                          currentImageUrl={block.imageUrl}
                          onUploadSuccess={(url) => updateBlock(block.id, { imageUrl: url })}
                          onRemove={() => updateBlock(block.id, { imageUrl: '' })}
                          aspectRatio="video"
                        />
                      </div>
                    )}

                    {/* Video Embed */}
                    {block.type === 'video' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          رابط الفيديو (YouTube Embed URL أو رابط مباشر)
                        </label>
                        <input
                          type="url"
                          value={block.videoUrl || ''}
                          onChange={(e) => updateBlock(block.id, { videoUrl: e.target.value })}
                          placeholder="https://www.youtube.com/embed/..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* FAQ Items Editor */}
                    {block.type === 'faq' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">الأسئلة والأجوبة:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const items = [...(block.items || []), { q: 'سؤال جديد؟', a: 'الإجابة هنا...' }];
                              updateBlock(block.id, { items });
                            }}
                            className="text-xs font-bold text-brand-600 hover:underline"
                          >
                            + إضافة سؤال
                          </button>
                        </div>

                        {(block.items || []).map((faq, fIdx) => (
                          <div
                            key={fIdx}
                            className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const items = block.items?.filter((_, i) => i !== fIdx);
                                updateBlock(block.id, { items });
                              }}
                              className="absolute top-2.5 left-2.5 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="text"
                              value={faq.q}
                              onChange={(e) => {
                                const items = [...(block.items || [])];
                                items[fIdx].q = e.target.value;
                                updateBlock(block.id, { items });
                              }}
                              placeholder="السؤال"
                              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                            />

                            <textarea
                              rows={2}
                              value={faq.a}
                              onChange={(e) => {
                                const items = [...(block.items || [])];
                                items[fIdx].a = e.target.value;
                                updateBlock(block.id, { items });
                              }}
                              placeholder="الإجابة"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Features / Cards Items Editor */}
                    {(block.type === 'features' || block.type === 'cards') && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">البطاقات:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const items = [
                                ...(block.items || []),
                                { title: 'بطاقة جديدة', desc: 'وصف مختصر...', icon: 'Sparkles' },
                              ];
                              updateBlock(block.id, { items });
                            }}
                            className="text-xs font-bold text-brand-600 hover:underline"
                          >
                            + إضافة بطاقة
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(block.items || []).map((card, cIdx) => (
                            <div
                              key={cIdx}
                              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const items = block.items?.filter((_, i) => i !== cIdx);
                                  updateBlock(block.id, { items });
                                }}
                                className="absolute top-2.5 left-2.5 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const items = [...(block.items || [])];
                                  items[cIdx].title = e.target.value;
                                  updateBlock(block.id, { items });
                                }}
                                placeholder="عنوان البطاقة"
                                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                              />

                              <textarea
                                rows={2}
                                value={card.desc}
                                onChange={(e) => {
                                  const items = [...(block.items || [])];
                                  items[cIdx].desc = e.target.value;
                                  updateBlock(block.id, { items });
                                }}
                                placeholder="الوصف"
                                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PDF List Editor */}
                    {block.type === 'pdf_list' && (
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          ملفات PDF في هذا القسم:
                        </span>

                        <FileUpload
                          onUploadSuccess={(data) => {
                            const items = [
                              ...(block.items || []),
                              { title: data.fileName.replace(/\.[^/.]+$/, ''), fileUrl: data.fileUrl, fileSize: data.fileSize },
                            ];
                            updateBlock(block.id, { items });
                          }}
                          label="رفع ملف PDF وإضافته للقائمة"
                        />

                        <div className="space-y-2">
                          {(block.items || []).map((pdf, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {pdf.title}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const items = block.items?.filter((_, i) => i !== pIdx);
                                  updateBlock(block.id, { items });
                                }}
                                className="text-slate-400 hover:text-red-500 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
