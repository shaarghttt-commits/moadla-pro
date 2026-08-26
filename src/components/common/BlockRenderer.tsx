'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  FileText,
  Download,
  PlayCircle,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { PageBlock } from '../admin/PageBuilderEditor';

interface BlockRendererProps {
  blocks: PageBlock[];
}

export default function BlockRenderer({ blocks }: BlockRendererProps) {
  const [openFaqIndices, setOpenFaqIndices] = useState<Record<string, boolean>>({});

  const toggleFaq = (key: string) => {
    setOpenFaqIndices((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleBlocks = (blocks || []).filter((b) => b.isVisible !== false);

  return (
    <div className="space-y-16">
      {visibleBlocks.map((block, idx) => {
        switch (block.type) {
          case 'hero':
            return (
              <section
                key={block.id || idx}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 text-white p-8 sm:p-14 shadow-2xl border border-slate-800"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-5 text-right">
                    {block.badge && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold border border-brand-500/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{block.badge}</span>
                      </span>
                    )}

                    {block.title && (
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-tajawal leading-tight">
                        {block.title}
                      </h1>
                    )}

                    {block.subtitle && (
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                        {block.subtitle}
                      </p>
                    )}

                    {block.buttonText && block.buttonLink && (
                      <div className="pt-2">
                        <Link
                          href={block.buttonLink}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition-all hover:scale-105"
                        >
                          <span>{block.buttonText}</span>
                          <ArrowLeft className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {block.imageUrl && (
                    <div className="lg:col-span-5">
                      <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                        <img
                          src={block.imageUrl}
                          alt={block.title || 'Hero block image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );

          case 'heading':
            return (
              <div key={block.id || idx} className="text-center max-w-3xl mx-auto space-y-2">
                {block.title && (
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">
                    {block.title}
                  </h2>
                )}
                {block.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {block.subtitle}
                  </p>
                )}
              </div>
            );

          case 'text':
            return (
              <div
                key={block.id || idx}
                className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line text-sm sm:text-base"
              >
                {block.content}
              </div>
            );

          case 'image':
            return (
              <div key={block.id || idx} className="max-w-5xl mx-auto space-y-2">
                {block.imageUrl && (
                  <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                    <img
                      src={block.imageUrl}
                      alt={block.title || 'Image block'}
                      className="w-full max-h-[500px] object-cover"
                    />
                  </div>
                )}
                {block.title && (
                  <p className="text-xs text-center text-slate-500 dark:text-slate-400">{block.title}</p>
                )}
              </div>
            );

          case 'video':
            return (
              <div key={block.id || idx} className="max-w-4xl mx-auto space-y-3">
                {block.title && (
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal text-center">
                    {block.title}
                  </h3>
                )}
                {block.videoUrl && (
                  <div className="aspect-video w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-black">
                    <iframe
                      src={block.videoUrl}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={block.title || 'Video Embed'}
                    />
                  </div>
                )}
              </div>
            );

          case 'features':
          case 'cards':
            return (
              <div key={block.id || idx} className="space-y-6">
                {(block.title || block.subtitle) && (
                  <div className="text-center max-w-2xl mx-auto space-y-1.5">
                    {block.title && (
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
                        {block.title}
                      </h3>
                    )}
                    {block.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{block.subtitle}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(block.items || []).map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 hover:shadow-md transition-all hover:-translate-y-1"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white font-tajawal">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );

          case 'faq':
            return (
              <div key={block.id || idx} className="max-w-3xl mx-auto space-y-4">
                {(block.title || block.subtitle) && (
                  <div className="text-center mb-6 space-y-1">
                    {block.title && (
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
                        {block.title}
                      </h3>
                    )}
                    {block.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{block.subtitle}</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {(block.items || []).map((faq, faqIdx) => {
                    const key = `${block.id}_${faqIdx}`;
                    const isOpen = !!openFaqIndices[key];

                    return (
                      <div
                        key={faqIdx}
                        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(key)}
                          className="w-full p-4 flex items-center justify-between text-right text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                            <span>{faq.q}</span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 whitespace-pre-line animate-fade-in">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );

          case 'cta':
            return (
              <div
                key={block.id || idx}
                className="rounded-3xl bg-gradient-to-r from-brand-900 to-slate-900 text-white p-8 sm:p-12 text-center space-y-4 shadow-xl border border-brand-800 max-w-4xl mx-auto"
              >
                {block.badge && (
                  <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold">
                    {block.badge}
                  </span>
                )}
                {block.title && (
                  <h3 className="text-2xl sm:text-3xl font-black font-tajawal">{block.title}</h3>
                )}
                {block.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                    {block.subtitle}
                  </p>
                )}
                {block.buttonText && block.buttonLink && (
                  <div className="pt-2">
                    <Link
                      href={block.buttonLink}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-900 hover:bg-slate-100 font-bold text-xs shadow transition-all hover:scale-105"
                    >
                      <span>{block.buttonText}</span>
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            );

          case 'pdf_list':
            return (
              <div key={block.id || idx} className="max-w-3xl mx-auto space-y-3">
                {block.title && (
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-tajawal text-center mb-4">
                    {block.title}
                  </h3>
                )}
                <div className="space-y-2">
                  {(block.items || []).map((pdf, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center font-bold">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{pdf.title}</p>
                          {pdf.fileSize && (
                            <span className="text-[10px] text-slate-400 font-mono">{pdf.fileSize}</span>
                          )}
                        </div>
                      </div>

                      {pdf.fileUrl && (
                        <a
                          href={pdf.fileUrl}
                          download={pdf.title}
                          className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center gap-1.5 hover:bg-brand-100 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
