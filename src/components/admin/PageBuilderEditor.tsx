'use client';

import React, { useMemo, useState } from 'react';
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
  Rows3,
  Columns3,
  Square,
  Link2,
  Files,
  PanelTopClose,
} from 'lucide-react';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';

export interface PageBlock {
  id: string;
  type:
    | 'section'
    | 'row'
    | 'column'
    | 'hero'
    | 'heading'
    | 'text'
    | 'image'
    | 'video'
    | 'button'
    | 'icon'
    | 'file'
    | 'divider'
    | 'spacer'
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
  fileUrl?: string;
  badge?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: Array<any>;
  isVisible?: boolean;
  children?: PageBlock[];
  columns?: number;
  style?: Record<string, any>;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
}

interface PageBuilderEditorProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

const BLOCK_TYPES = [
  { type: 'section', name: 'Section', icon: PanelTopClose, desc: 'حاوية رأسية كاملة' },
  { type: 'row', name: 'Row', icon: Rows3, desc: 'سطر داخل القسم' },
  { type: 'column', name: 'Column', icon: Columns3, desc: 'عمود داخل السطر' },
  { type: 'hero', name: 'بانر رئيسي (Hero)', icon: Layout, desc: 'عنوان كبير مع وصف وصورة وأزرار' },
  { type: 'heading', name: 'عنوان رئيسي / فرعي', icon: Type, desc: 'عنوان جذاب لتقسيم محتوى الصفحة' },
  { type: 'text', name: 'نص مقروء (Markdown)', icon: AlignLeft, desc: 'فقرات نصية مع تنسيقات وقوائم' },
  { type: 'image', name: 'صورة مع شرح', icon: ImageIcon, desc: 'عرض صورة توضيحية أو إنفوجرافيك' },
  { type: 'video', name: 'فيديو تعليمي (Video)', icon: Video, desc: 'تضمين فيديو يوتيوب أو محاضرة' },
  { type: 'button', name: 'زر / رابط', icon: Link2, desc: 'أزرار وروابط' },
  { type: 'file', name: 'ملف / PDF', icon: Files, desc: 'ملف قابل للتحميل' },
  { type: 'features', name: 'شبكة مميزات (Features)', icon: Sparkles, desc: 'بطاقات بأيقونات توضح المميزات' },
  { type: 'cards', name: 'شبكة بطاقات (Cards Grid)', icon: Grid, desc: 'كروت بمحتوى وروابط مخصصة' },
  { type: 'faq', name: 'أسئلة شائعة (FAQ Accordion)', icon: HelpCircle, desc: 'قائمة أسئلة وأجوبة تفاعلية' },
  { type: 'cta', name: 'بانر اتخاذ إجراء (CTA Banner)', icon: Megaphone, desc: 'دعوة للتسجيل أو الاشتراك' },
  { type: 'pdf_list', name: 'قائمة تحميل مذكرات PDF', icon: FileText, desc: 'ملفات قابلة للتحميل المباشر' },
  { type: 'divider', name: 'Divider', icon: Square, desc: 'خط فاصل' },
  { type: 'spacer', name: 'Spacer', icon: Square, desc: 'مسافة فارغة' },
];

const makeId = () => 'block_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

const createDefaultBlock = (type: PageBlock['type']): PageBlock => {
  switch (type) {
    case 'section':
      return { id: makeId(), type: 'section', title: 'قسم جديد', subtitle: 'وصف القسم', isVisible: true, children: [], style: { padding: '64px 0', backgroundColor: '#ffffff', borderRadius: '24px' } };
    case 'row':
      return { id: makeId(), type: 'row', title: 'Row', isVisible: true, columns: 2, children: [], style: { gap: '24px' } };
    case 'column':
      return { id: makeId(), type: 'column', title: 'Column', isVisible: true, children: [], style: { padding: '16px' } };
    case 'hero':
      return {
        id: makeId(),
        type: 'hero',
        title: 'عنوان رئيسي جذاب',
        subtitle: 'اكتب نصاً توضيحياً هنا...',
        badge: 'جديد المنصة',
        buttonText: 'ابدأ الآن',
        buttonLink: '/register',
        imageUrl: '',
        isVisible: true,
      };
    case 'heading':
      return { id: makeId(), type: 'heading', title: 'عنوان القسم', subtitle: 'وصف مختصر', isVisible: true };
    case 'text':
      return { id: makeId(), type: 'text', title: 'نص', content: 'اكتب نصك هنا...', isVisible: true };
    case 'image':
      return { id: makeId(), type: 'image', title: 'وصف الصورة', imageUrl: '', isVisible: true };
    case 'video':
      return { id: makeId(), type: 'video', title: 'فيديو', videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4', isVisible: true };
    case 'button':
      return { id: makeId(), type: 'button', title: 'عنوان الزر', buttonText: 'انقر هنا', buttonLink: '#', isVisible: true };
    case 'file':
      return { id: makeId(), type: 'file', title: 'اسم الملف', fileUrl: '', subtitle: 'ملف PDF قابل للتحميل', isVisible: true };
    case 'divider':
      return { id: makeId(), type: 'divider', isVisible: true, style: { height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' } };
    case 'spacer':
      return { id: makeId(), type: 'spacer', isVisible: true, style: { height: '32px' } };
    case 'features':
      return { id: makeId(), type: 'features', title: 'مزايا المنصة', subtitle: 'اشرح الفوائد', items: [{ title: 'ميزة 1', desc: 'وصف الميزة' }], isVisible: true };
    case 'cards':
      return { id: makeId(), type: 'cards', title: 'بطاقات', subtitle: 'شرح مختصر', items: [{ title: 'بطاقة أولى', desc: 'وصف مختصر' }], isVisible: true };
    case 'faq':
      return { id: makeId(), type: 'faq', title: 'الأسئلة الشائعة', items: [{ q: 'السؤال الأول؟', a: 'الإجابة الأولى.' }], isVisible: true };
    case 'cta':
      return { id: makeId(), type: 'cta', title: 'ابدأ رحلتك الآن', subtitle: 'أضف شرحًا مختصرًا', buttonText: 'تسجيل الآن', buttonLink: '/register', isVisible: true };
    case 'pdf_list':
      return { id: makeId(), type: 'pdf_list', title: 'ملفات PDF', items: [{ title: 'ملف PDF 1', fileUrl: '', fileSize: '5 MB' }], isVisible: true };
    default:
      return { id: makeId(), type: 'text', content: '...', isVisible: true };
  }
};

const updateBlockInTree = (items: PageBlock[], id: string, updater: (block: PageBlock) => PageBlock): PageBlock[] =>
  items.map((item) => {
    if (item.id === id) return updater(item);
    if (item.children && item.children.length) {
      return { ...item, children: updateBlockInTree(item.children, id, updater) };
    }
    return item;
  });

const deleteBlockFromTree = (items: PageBlock[], id: string): PageBlock[] =>
  items.filter((item) => item.id !== id).map((item) => ({
    ...item,
    children: item.children ? deleteBlockFromTree(item.children, id) : item.children,
  }));

const moveBlockInList = (items: PageBlock[], index: number, direction: 'up' | 'down') => {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  const temp = next[index];
  next[index] = next[targetIndex];
  next[targetIndex] = temp;
  return next;
};

const moveBlockInTree = (items: PageBlock[], id: string, direction: 'up' | 'down'): PageBlock[] =>
  items.map((item) => {
    if (item.children && item.children.length) {
      const childIndex = item.children.findIndex((child) => child.id === id);
      if (childIndex >= 0) {
        return { ...item, children: moveBlockInList(item.children, childIndex, direction) };
      }
      return { ...item, children: moveBlockInTree(item.children, id, direction) };
    }
    return item;
  });

const addBlockToTree = (items: PageBlock[], parentId: string | null, block: PageBlock): PageBlock[] => {
  if (!parentId) return [...items, block];

  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...(item.children || []), block] };
    }
    if (item.children && item.children.length) {
      return { ...item, children: addBlockToTree(item.children, parentId, block) };
    }
    return item;
  });
};

export default function PageBuilderEditor({ blocks, onChange }: PageBuilderEditorProps) {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const activeBlock = useMemo(() => {
    const find = (items: PageBlock[]): PageBlock | null => {
      for (const item of items) {
        if (item.id === activeBlockId) return item;
        if (item.children?.length) {
          const child = find(item.children);
          if (child) return child;
        }
      }
      return null;
    };
    return find(blocks);
  }, [activeBlockId, blocks]);

  const addBlock = (type: PageBlock['type'], parentId: string | null = null) => {
    const newBlock = createDefaultBlock(type);
    onChange(addBlockToTree(blocks, parentId, newBlock));
    setActiveBlockId(newBlock.id);
    setShowAddMenu(false);
  };

  const updateBlock = (id: string, updates: Partial<PageBlock>) => {
    onChange(updateBlockInTree(blocks, id, (block) => ({ ...block, ...updates })));
  };

  const deleteBlock = (id: string) => {
    const next = deleteBlockFromTree(blocks, id);
    onChange(next);
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    let next = blocks;
    const moveInArray = (items: PageBlock[]): PageBlock[] => {
      const index = items.findIndex((item) => item.id === id);
      if (index >= 0) return moveBlockInList(items, index, direction);
      return items.map((item) => {
        if (item.children && item.children.length) {
          return { ...item, children: moveInArray(item.children) };
        }
        return item;
      });
    };
    next = moveInArray(blocks);
    onChange(next);
  };

  const toggleVisibility = (id: string) => {
    const next = updateBlockInTree(blocks, id, (block) => ({ ...block, isVisible: !(block.isVisible ?? true) }));
    onChange(next);
  };

  const renderBlockList = (items: PageBlock[], depth = 0) => items.map((block, index) => {
    const isExpanded = activeBlockId === block.id;
    const meta = BLOCK_TYPES.find((item) => item.type === block.type) || { name: block.type, icon: Layout };
    const Icon = meta.icon;
    const hasChildren = !!block.children?.length;

    return (
      <div
        key={block.id}
        draggable
        onDragStart={() => setDraggedId(block.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (!draggedId || draggedId === block.id) return;
          const findAndMove = (items: PageBlock[]): PageBlock[] => {
            const currentIndex = items.findIndex((item) => item.id === draggedId);
            if (currentIndex >= 0) {
              const next = [...items];
              const [moved] = next.splice(currentIndex, 1);
              const insertAt = items.findIndex((item) => item.id === block.id);
              next.splice(insertAt >= 0 ? insertAt : next.length, 0, moved);
              return next;
            }
            return items.map((item) => ({
              ...item,
              children: item.children ? findAndMove(item.children) : item.children,
            }));
          };
          onChange(findAndMove(blocks));
          setDraggedId(null);
        }}
        className={`rounded-2xl border transition-all overflow-hidden bg-white dark:bg-slate-900 ${
          !(block.isVisible ?? true)
            ? 'opacity-60 border-dashed border-slate-300 dark:border-slate-700'
            : isExpanded
            ? 'border-brand-500 shadow-md ring-1 ring-brand-500/20'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
        }`}
        style={{ marginRight: depth * 16 }}
      >
        <div onClick={() => setActiveBlockId(isExpanded ? null : block.id)} className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{meta.name}{block.title ? ` — ${block.title}` : ''}</span>
              <span className="block text-[10px] text-slate-400">عنصر #{index + 1}</span>
            </div>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button type="button" disabled={index === 0} onClick={() => moveBlock(block.id, 'up')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg" title="تحريك لأعلى"><ArrowUp className="w-4 h-4" /></button>
            <button type="button" disabled={index === items.length - 1} onClick={() => moveBlock(block.id, 'down')} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg" title="تحريك لأسفل"><ArrowDown className="w-4 h-4" /></button>
            <button type="button" onClick={() => toggleVisibility(block.id)} className={`p-1.5 rounded-lg transition-colors ${block.isVisible === false ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-400 hover:text-brand-600'}`} title={block.isVisible === false ? 'إظهار العنصر' : 'إخفاء العنصر'}>{block.isVisible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            <button type="button" onClick={() => deleteBlock(block.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors" title="حذف العنصر"><Trash2 className="w-4 h-4" /></button>
            <button type="button" onClick={() => addBlock('section', block.id)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg" title="إضافة قسم فرعي"><Plus className="w-4 h-4" /></button>
            <div className="p-1.5 text-slate-400">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
            <div className="flex flex-wrap gap-2 mb-3">
              {['text', 'image', 'button', 'file', 'video', 'divider', 'spacer', 'heading'].map((type) => (
                <button key={type} type="button" onClick={() => addBlock(type as PageBlock['type'], block.id)} className="px-2.5 py-1.5 text-[10px] font-bold rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                  + {type}
                </button>
              ))}
            </div>

            {(block.type === 'section' || block.type === 'row' || block.type === 'column') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
                  <input value={block.title || ''} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">عرض الأعمدة</label>
                  <input type="number" min={1} max={4} value={block.columns || 2} onChange={(e) => updateBlock(block.id, { columns: Number(e.target.value) })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
              </div>
            )}

            {(block.type === 'hero' || block.type === 'heading' || block.type === 'features' || block.type === 'cards' || block.type === 'faq' || block.type === 'cta' || block.type === 'pdf_list') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان</label>
                  <input value={block.title || ''} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان الفرعي</label>
                  <input value={block.subtitle || ''} onChange={(e) => updateBlock(block.id, { subtitle: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
              </div>
            )}

            {(block.type === 'text' || block.type === 'hero') && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">المحتوى</label>
                <textarea rows={5} value={block.content || ''} onChange={(e) => updateBlock(block.id, { content: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>
            )}

            {(block.type === 'image' || block.type === 'hero') && (
              <div>
                <ImageUpload label="صورة العنصر" currentImageUrl={block.imageUrl} onUploadSuccess={(url) => updateBlock(block.id, { imageUrl: url })} onRemove={() => updateBlock(block.id, { imageUrl: '' })} aspectRatio="video" />
              </div>
            )}

            {(block.type === 'hero' || block.type === 'cta') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="block text-[11px] font-medium text-slate-500 mb-1">الشارة</label><input value={block.badge || ''} onChange={(e) => updateBlock(block.id, { badge: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" /></div>
                <div><label className="block text-[11px] font-medium text-slate-500 mb-1">نص الزر</label><input value={block.buttonText || ''} onChange={(e) => updateBlock(block.id, { buttonText: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" /></div>
                <div><label className="block text-[11px] font-medium text-slate-500 mb-1">رابط الزر</label><input value={block.buttonLink || ''} onChange={(e) => updateBlock(block.id, { buttonLink: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" /></div>
              </div>
            )}

            {block.type === 'video' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">رابط الفيديو</label>
                <input type="url" value={block.videoUrl || ''} onChange={(e) => updateBlock(block.id, { videoUrl: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>
            )}

            {block.type === 'button' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div><label className="block text-[11px] font-medium text-slate-500 mb-1">عنوان الزر</label><input value={block.title || ''} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" /></div>
                <div><label className="block text-[11px] font-medium text-slate-500 mb-1">نص الزر</label><input value={block.buttonText || ''} onChange={(e) => updateBlock(block.id, { buttonText: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" /></div>
                <div><label className="block text-[11px] font-medium text-slate-500 mb-1">الرابط</label><input value={block.buttonLink || ''} onChange={(e) => updateBlock(block.id, { buttonLink: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" /></div>
              </div>
            )}

            {block.type === 'file' && (
              <div className="space-y-3">
                <div><label className="block text-[11px] font-medium text-slate-500 mb-1">اسم الملف</label><input value={block.title || ''} onChange={(e) => updateBlock(block.id, { title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" /></div>
                <div><label className="block text-[11px] font-medium text-slate-500 mb-1">رابط الملف</label><input value={block.fileUrl || ''} onChange={(e) => updateBlock(block.id, { fileUrl: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" /></div>
              </div>
            )}

            {block.type === 'faq' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between"><span className="text-xs font-bold">الأسئلة والأجوبة</span><button type="button" onClick={() => updateBlock(block.id, { items: [...(block.items || []), { q: 'سؤال جديد؟', a: 'الإجابة هنا...' }] })} className="text-xs font-bold text-brand-600 hover:underline">+ إضافة سؤال</button></div>
                {(block.items || []).map((faq, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative">
                    <button type="button" onClick={() => updateBlock(block.id, { items: (block.items || []).filter((_, i) => i !== idx) })} className="absolute left-2.5 top-2.5 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    <input type="text" value={faq.q} onChange={(e) => { const items = [...(block.items || [])]; items[idx].q = e.target.value; updateBlock(block.id, { items }); }} className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                    <textarea rows={2} value={faq.a} onChange={(e) => { const items = [...(block.items || [])]; items[idx].a = e.target.value; updateBlock(block.id, { items }); }} className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                ))}
              </div>
            )}

            {(block.type === 'features' || block.type === 'cards') && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between"><span className="text-xs font-bold">البطاقات</span><button type="button" onClick={() => updateBlock(block.id, { items: [...(block.items || []), { title: 'بطاقة جديدة', desc: 'وصف مختصر...', icon: 'Sparkles' }] })} className="text-xs font-bold text-brand-600 hover:underline">+ إضافة بطاقة</button></div>
                {(block.items || []).map((card, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative">
                    <button type="button" onClick={() => updateBlock(block.id, { items: (block.items || []).filter((_, i) => i !== idx) })} className="absolute left-2.5 top-2.5 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    <input type="text" value={card.title} onChange={(e) => { const items = [...(block.items || [])]; items[idx].title = e.target.value; updateBlock(block.id, { items }); }} className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                    <textarea rows={2} value={card.desc} onChange={(e) => { const items = [...(block.items || [])]; items[idx].desc = e.target.value; updateBlock(block.id, { items }); }} className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" />
                  </div>
                ))}
              </div>
            )}

            {block.type === 'pdf_list' && (
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">ملفات PDF في هذا القسم</span>
                <FileUpload onUploadSuccess={(data) => updateBlock(block.id, { items: [...(block.items || []), { title: data.fileName.replace(/\.[^/.]+$/, ''), fileUrl: data.fileUrl, fileSize: data.fileSize }] })} label="رفع ملف PDF وإضافته للقائمة" />
                <div className="space-y-2">
                  {(block.items || []).map((pdf, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center gap-2 truncate"><FileText className="w-4 h-4 text-red-500 flex-shrink-0" /><span className="font-bold truncate">{pdf.title}</span></div>
                      <button type="button" onClick={() => updateBlock(block.id, { items: (block.items || []).filter((_, i) => i !== idx) })} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasChildren && <div className="mt-4 space-y-3">{renderBlockList(block.children || [], depth + 1)}</div>}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white font-tajawal">مُنشئ الصفحات المرئي</h4>
          <p className="text-xs text-slate-500">Section → Row → Column → Blocks</p>
        </div>
        <button type="button" onClick={() => setShowAddMenu(!showAddMenu)} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5">
          <Plus className="w-4 h-4" /><span>إضافة عنصر</span>
        </button>
      </div>

      {showAddMenu && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-brand-500/40 shadow-xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">اختر نوع العنصر</span>
            <button type="button" onClick={() => setShowAddMenu(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">إلغاء</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {BLOCK_TYPES.map((bt) => {
              const Icon = bt.icon;
              return (
                <button key={bt.type} type="button" onClick={() => { addBlock(bt.type as PageBlock['type']); setShowAddMenu(false); }} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-right transition-all group flex flex-col justify-between h-28">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center transition-colors mb-2"><Icon className="w-4 h-4" /></div>
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

      {blocks.length === 0 ? (
        <div className="py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <Layout className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد عناصر في الصفحة الآن</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">ابدأ بإضافة Section أو أي Block آخر</p>
          <button type="button" onClick={() => addBlock('section')} className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow">إضافة أول Section</button>
        </div>
      ) : (
        <div className="space-y-3">{renderBlockList(blocks)}</div>
      )}

      {activeBlock && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">خصائص العنصر المحدد</h4>
            <span className="text-[10px] font-bold uppercase text-brand-600">{activeBlock.type}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">عنوان</label>
              <input value={activeBlock.title || ''} onChange={(e) => updateBlock(activeBlock.id, { title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Visibility</label>
              <div className="flex items-center gap-2 h-[42px] px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <input type="checkbox" checked={activeBlock.isVisible !== false} onChange={(e) => updateBlock(activeBlock.id, { isVisible: e.target.checked })} />
                <span>مرئي</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
