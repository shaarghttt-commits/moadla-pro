'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import FileUpload from './FileUpload';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: string | null;
  createdAt: string;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, item?: MediaItem) => void;
  filterType?: 'image' | 'pdf' | 'all';
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  filterType = 'all',
  title = 'اختر من مكتبة الوسائط',
}: MediaPickerModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [showUploadTab, setShowUploadTab] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/media?type=${filterType === 'all' ? '' : filterType}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setMedia(data.media || []);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, search, filterType]);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl, selectedItem || undefined);
      onClose();
    }
  };

  const handleUploadSuccess = (data: { fileUrl: string; fileName: string; fileSize: string; fileType: string }) => {
    onSelect(data.fileUrl, {
      id: '',
      name: data.fileName,
      url: data.fileUrl,
      type: data.fileType,
      size: data.fileSize,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-tajawal">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadTab(!showUploadTab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
                showUploadTab
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{showUploadTab ? 'استعراض المكتبة' : 'رفع ملف جديد'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {showUploadTab ? (
            <div className="max-w-md mx-auto py-6">
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                accept={filterType === 'image' ? 'image/*' : filterType === 'pdf' ? '.pdf' : 'image/*,.pdf,.doc,.docx'}
                label="رفع ملف جديد إلى المكتبة"
                helperText="سيتم حفظ الملف في المكتبة واختياره مباشرة"
              />
            </div>
          ) : (
            <>
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث في مكتبة الوسائط بالاسم..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Media Grid */}
              {loading ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-400">جاري تحميل الوسائط...</p>
                </div>
              ) : media.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">لا توجد وسائط مسبقة</p>
                  <p className="text-[11px] text-slate-400 mt-1">اضغط على زر "رفع ملف جديد" لإضافة أول ملف</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {media.map((item) => {
                    const isSelected = selectedUrl === item.url;
                    const isImg = item.type === 'image' || item.url.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i);

                    return (
                      <div
                        key={item.id || item.url}
                        onClick={() => {
                          setSelectedUrl(item.url);
                          setSelectedItem(item);
                        }}
                        className={`relative rounded-2xl overflow-hidden border cursor-pointer aspect-square group transition-all ${
                          isSelected
                            ? 'border-brand-600 ring-2 ring-brand-500 shadow-md'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {isImg ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center p-2 text-center">
                            <FileText className="w-8 h-8 text-red-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                              {item.name}
                            </span>
                          </div>
                        )}

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {/* Bottom Name Overlay on Hover */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity truncate">
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 truncate max-w-xs">
            {selectedItem ? `تم اختيار: ${selectedItem.name}` : 'اختر عنصراً من الشبكة'}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              إلغاء
            </button>
            <button
              onClick={handleSelect}
              disabled={!selectedUrl}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 disabled:opacity-50 transition-all"
            >
              استخدام العنصر المختار
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
