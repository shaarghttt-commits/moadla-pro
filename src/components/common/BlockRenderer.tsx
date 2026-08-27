'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  HelpCircle,
  FileText,
  Download,
  PlayCircle,
  ChevronDown,
  ImageIcon,
  Link2,
  DownloadIcon,
  File,
  Minus,
} from 'lucide-react';
import { PageBlock } from '../admin/PageBuilderEditor';

interface BlockRendererProps {
  blocks: PageBlock[];
}

const ICON_MAP: Record<string, any> = {
  Sparkles,
  ImageIcon,
  Link2,
  DownloadIcon,
  File,
  PlayCircle,
};

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  const [openFaqIndices, setOpenFaqIndices] = useState<Record<string, boolean>>({});

  const toggleFaq = (key: string) => {
    setOpenFaqIndices((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderBlock = (block: PageBlock, idx: number): React.ReactNode => {
    const visibleChildren = (block.children || []).filter((item) => item.isVisible !== false);

    if (block.type === 'section') {
      return (
        <section
          key={block.id || idx}
          className="rounded-[28px] border border-slate-200 bg-white/80 dark:bg-slate-900/60 shadow-sm"
          style={{
            ...(typeof block.style === 'object' ? block.style : {}),
            padding: String(block.style?.padding || '64px 0'),
            backgroundColor: String(block.style?.backgroundColor || '#ffffff'),
            borderRadius: String(block.style?.borderRadius || '28px'),
          }}
        >
          {(block.title || block.subtitle) && (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
              {block.title && <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">{block.title}</h2>}
              {block.subtitle && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{block.subtitle}</p>}
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {visibleChildren.length > 0 ? (
              <div className="space-y-6">{visibleChildren.map((child, childIndex) => renderBlock(child, childIndex))}</div>
            ) : null}
          </div>
        </section>
      );
    }

    if (block.type === 'row') {
      const columnCount = Math.max(1, Math.min(Number(block.columns) || 2, 4));
      return (
        <div key={block.id || idx} className={`grid gap-6 md:gap-8 ${columnCount === 1 ? 'grid-cols-1' : columnCount === 2 ? 'grid-cols-1 md:grid-cols-2' : columnCount === 3 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
          {visibleChildren.map((child, childIndex) => renderBlock(child, childIndex))}
        </div>
      );
    }

    if (block.type === 'column') {
      return (
        <div key={block.id || idx} className="space-y-4" style={{ ...(typeof block.style === 'object' ? block.style : {}) }}>
          {visibleChildren.length > 0 ? visibleChildren.map((child, childIndex) => renderBlock(child, childIndex)) : null}
        </div>
      );
    }

    if (block.type === 'divider') {
      return <div key={block.id || idx} className="w-full" style={{ ...(typeof block.style === 'object' ? block.style : {}), height: String(block.style?.height || '1px'), backgroundColor: String(block.style?.backgroundColor || '#e2e8f0') }} />;
    }

    if (block.type === 'spacer') {
      return <div key={block.id || idx} style={{ ...(typeof block.style === 'object' ? block.style : {}), height: block.style?.height || '32px' }} />;
    }

    if (block.type === 'heading') {
      return (
        <div key={block.id || idx} className="text-center max-w-3xl mx-auto space-y-2">
          {block.title && <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">{block.title}</h2>}
          {block.subtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{block.subtitle}</p>}
        </div>
      );
    }

    if (block.type === 'text') {
      return (
        <div key={block.id || idx} className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line text-sm sm:text-base">
          {block.content}
        </div>
      );
    }

    if (block.type === 'image') {
      return (
        <div key={block.id || idx} className="max-w-5xl mx-auto space-y-2">
          {block.imageUrl && (
            <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
              <img src={block.imageUrl} alt={block.title || 'Image block'} className="w-full max-h-[500px] object-cover" />
            </div>
          )}
          {block.title && <p className="text-xs text-center text-slate-500 dark:text-slate-400">{block.title}</p>}
        </div>
      );
    }

    if (block.type === 'button') {
      return (
        <div key={block.id || idx} className="flex justify-center">
          {block.buttonLink ? (
            <Link href={block.buttonLink} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all hover:scale-105">
              <span>{block.buttonText || block.title || 'Button'}</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          ) : (
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-lg">
              {block.buttonText || block.title || 'Button'}
            </button>
          )}
        </div>
      );
    }

    if (block.type === 'icon') {
      const IconComponent = ICON_MAP[block.iconName || 'Sparkles'] || Sparkles;
      return (
        <div key={block.id || idx} className="flex justify-center">
          {block.buttonLink ? (
            <Link href={block.buttonLink} className="inline-flex items-center justify-center rounded-2xl bg-brand-50 p-4 text-brand-600 hover:bg-brand-100" style={{ color: block.iconColor || '#2563eb', width: block.iconSize ? block.iconSize + 28 : 52, height: block.iconSize ? block.iconSize + 28 : 52 }}>
              <IconComponent size={block.iconSize || 24} />
            </Link>
          ) : (
            <div className="inline-flex items-center justify-center rounded-2xl bg-brand-50 p-4 text-brand-600" style={{ color: block.iconColor || '#2563eb', width: block.iconSize ? block.iconSize + 28 : 52, height: block.iconSize ? block.iconSize + 28 : 52 }}>
              <IconComponent size={block.iconSize || 24} />
            </div>
          )}
        </div>
      );
    }

    if (block.type === 'file') {
      return (
        <div key={block.id || idx} className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"><FileText className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{block.title || 'ملف'}</p>
              {block.subtitle && <p className="text-[10px] text-slate-500">{block.subtitle}</p>}
            </div>
          </div>
          {block.fileUrl ? (
            <a href={block.fileUrl} target="_blank" rel="noreferrer" download className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 text-brand-600 px-3 py-2 text-xs font-bold">
              <Download className="w-3.5 h-3.5" />
              تحميل
            </a>
          ) : null}
        </div>
      );
    }

    if (block.type === 'video') {
      return (
        <div key={block.id || idx} className="max-w-4xl mx-auto space-y-3">
          {block.title && <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal text-center">{block.title}</h3>}
          {block.videoUrl && (
            <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-black">
              <iframe src={block.videoUrl} className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={block.title || 'Video Embed'} />
            </div>
          )}
        </div>
      );
    }

    if (block.type === 'hero') {
      return (
        <section key={block.id || idx} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 text-white p-8 sm:p-14 shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5 text-right">
              {block.badge && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30"><Sparkles className="w-3.5 h-3.5" /><span>{block.badge}</span></span>}
              {block.title && <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-tajawal leading-tight">{block.title}</h1>}
              {block.subtitle && <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">{block.subtitle}</p>}
              {block.buttonText && block.buttonLink && (<div className="pt-2"><Link href={block.buttonLink} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all hover:scale-105"><span>{block.buttonText}</span><ArrowLeft className="w-4 h-4" /></Link></div>)}
            </div>
            {block.imageUrl && (<div className="lg:col-span-5"><div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800"><img src={block.imageUrl} alt={block.title || 'Hero block image'} className="w-full h-full object-cover" /></div></div>)}
          </div>
        </section>
      );
    }

    if (block.type === 'features' || block.type === 'cards') {
      return (
        <div key={block.id || idx} className="space-y-6">
          {(block.title || block.subtitle) && (
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              {block.title && <h3 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">{block.title}</h3>}
              {block.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{block.subtitle}</p>}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(block.items || []).map((item, iIdx) => (
              <div key={iIdx} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold"><Sparkles className="w-5 h-5" /></div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white font-tajawal">{item.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'faq') {
      return (
        <div key={block.id || idx} className="max-w-3xl mx-auto space-y-4">
          {(block.title || block.subtitle) && (
            <div className="text-center mb-6 space-y-1">
              {block.title && <h3 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">{block.title}</h3>}
              {block.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{block.subtitle}</p>}
            </div>
          )}
          <div className="space-y-3">
            {(block.items || []).map((faq, faqIdx) => {
              const key = `${block.id}_${faqIdx}`;
              const isOpen = !!openFaqIndices[key];
              return (
                <div key={faqIdx} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
                  <button type="button" onClick={() => toggleFaq(key)} className="w-full p-4 flex items-center justify-between text-right text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <span className="flex items-center gap-2"><HelpCircle className="w-4 h-4 text-brand-500 flex-shrink-0" /><span>{faq.q}</span></span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <div className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 whitespace-pre-line animate-fade-in">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (block.type === 'cta') {
      return (
        <div key={block.id || idx} className="rounded-3xl bg-gradient-to-r from-brand-900 to-slate-900 text-white p-8 sm:p-12 text-center space-y-4 shadow-xl border border-brand-800 max-w-4xl mx-auto">
          {block.badge && <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">{block.badge}</span>}
          {block.title && <h3 className="text-2xl sm:text-3xl font-black font-tajawal">{block.title}</h3>}
          {block.subtitle && <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">{block.subtitle}</p>}
          {block.buttonText && block.buttonLink && <div className="pt-2"><Link href={block.buttonLink} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-900 hover:bg-slate-100 font-bold text-xs shadow transition-all hover:scale-105"><span>{block.buttonText}</span><ArrowLeft className="w-4 h-4" /></Link></div>}
        </div>
      );
    }

    if (block.type === 'pdf_list') {
      return (
        <div key={block.id || idx} className="max-w-3xl mx-auto space-y-3">
          {block.title && <h3 className="text-lg font-bold text-slate-900 dark:text-white font-tajawal text-center mb-4">{block.title}</h3>}
          <div className="space-y-2">
            {(block.items || []).map((pdf, pIdx) => (
              <div key={pIdx} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold"><FileText className="w-5 h-5" /></div>
                  <div><p className="text-xs font-bold text-slate-900 dark:text-white">{pdf.title}</p>{pdf.fileSize && <span className="text-[10px] text-slate-400 font-mono">{pdf.fileSize}</span>}</div>
                </div>
                {pdf.fileUrl && <a href={pdf.fileUrl} download={pdf.title} className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center gap-1.5 hover:bg-brand-100 transition-colors"><Download className="w-3.5 h-3.5" />تحميل</a>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const visibleBlocks = (blocks || []).filter((b) => b.isVisible !== false);

  return <div className="space-y-16">{visibleBlocks.map((block, idx) => renderBlock(block, idx))}</div>;
}
