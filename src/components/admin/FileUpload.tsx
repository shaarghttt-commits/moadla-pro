'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: (data: {
    fileUrl: string;
    fileName: string;
    fileSize: string;
    fileType: string;
  }) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  currentFileUrl?: string;
  currentFileName?: string;
  onRemoveCurrent?: () => void;
}

export default function FileUpload({
  onUploadSuccess,
  accept = '.pdf,.doc,.docx,.zip',
  maxSizeMB = 50,
  label = 'رفع ملف PDF أو مستند',
  helperText = 'الحد الأقصى 50 ميجابايت (PDF, Word, Zip)',
  currentFileUrl,
  currentFileName,
  onRemoveCurrent,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<{
    name: string;
    size: string;
    url: string;
  } | null>(currentFileUrl ? { name: currentFileName || 'ملف مرفق', size: '', url: currentFileUrl } : null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`حجم الملف يتجاوز الحد الأقصى المسموح (${maxSizeMB} ميجابايت)`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'file');

      // Simulate step progress while uploading
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev >= 85 ? prev : prev + 15));
      }, 150);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل رفع الملف');
      }

      setUploadedInfo({
        name: data.fileName,
        size: data.fileSize,
        url: data.fileUrl,
      });

      onUploadSuccess(data);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'حدث خطأ أثناء رفع الملف، حاول مرة أخرى');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setUploadedInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemoveCurrent) {
      onRemoveCurrent();
    }
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}

      {uploadedInfo ? (
        <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{uploadedInfo.name}</p>
              {uploadedInfo.size && <p className="text-xs text-slate-500 dark:text-slate-400">{uploadedInfo.size}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={uploadedInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1"
            >
              معاينة
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              title="إزالة الملف"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-white dark:bg-slate-900'
          } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="py-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                جاري رفع الملف إلى السيرفر... ({uploadProgress}%)
              </p>
              <div className="w-48 mx-auto bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                اضغط لاختيار ملف من جهازك أو اسحبه وأفلته هنا
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
