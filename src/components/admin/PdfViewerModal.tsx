'use client';

import React from 'react';
import { X, ExternalLink, Download, FileText } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  fileName: string | null;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  fileUrl,
  fileName,
}: PdfViewerModalProps) {
  if (!isOpen || !fileUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white truncate max-w-md">{fileName || 'معاينة ملف PDF'}</h3>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>فتح في نافذة جديدة</span>
            </a>

            <a
              href={fileUrl}
              download={fileName || 'file.pdf'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/50 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 w-full bg-slate-950 p-2">
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0`}
            className="w-full h-full rounded-lg border-0 bg-white"
            title={fileName || 'PDF Preview'}
          />
        </div>
      </div>
    </div>
  );
}
