'use client';

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, UploadCloud, X, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImageUrl?: string;
  onRemove?: () => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  maxSizeMB?: number;
}

export default function ImageUpload({
  onUploadSuccess,
  currentImageUrl,
  onRemove,
  label = 'رفع صورة',
  helperText = 'الأنواع المدعومة: PNG, JPG, WEBP, SVG (أقصى حجم 10MB)',
  aspectRatio = 'video',
  maxSizeMB = 10,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, SVG)');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`حجم الصورة يتجاوز الحد الأقصى (${maxSizeMB} ميجابايت)`);
      return;
    }

    // Local instant preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل رفع الصورة');
      }

      setPreviewUrl(data.fileUrl);
      onUploadSuccess(data.fileUrl);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setError(err.message || 'حدث خطأ أثناء رفع الصورة');
      setPreviewUrl(currentImageUrl || null);
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

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square w-36'
      : aspectRatio === 'banner'
      ? 'aspect-[21/9] w-full max-h-48'
      : aspectRatio === 'video'
      ? 'aspect-video w-full max-h-56'
      : 'min-h-[140px] w-full';

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col items-center justify-center ${aspectClass} ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
            : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          disabled={isUploading}
        />

        {previewUrl ? (
          <div className="relative w-full h-full group">
            {/* Image Preview */}
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />

            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow font-medium">
                تغيير الصورة
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-colors"
                title="حذف الصورة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-400" />
                <span className="text-xs font-medium">جاري الرفع والحفظ...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">جاري رفع الصورة...</p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                  اضغط لاختيار صورة أو اسحبها هنا
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
