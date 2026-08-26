'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ConfirmModal from '@/components/admin/ConfirmModal';
import MediaPickerModal from '@/components/admin/MediaPickerModal';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Search,
  Filter,
  Eye,
  Download,
  FileText,
  RefreshCw,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import FileUpload from '@/components/admin/FileUpload';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: string | null;
  mimeType?: string | null;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/media?type=${typeFilter === 'all' ? '' : typeFilter}&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();
      setMedia(data.media || []);
    } catch {
      showToast('error', 'حدث خطأ أثناء تحميل مكتبة الوسائط');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [search, typeFilter]);

  const handleDelete = (item: MediaItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد حذف الملف',
      message: `هل أنت متأكد من حذف "${item.name}"؟ سيتم حذف الملف نهائياً من السيرفر ولا يمكن التراجع.`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('success', 'تم حذف الملف بنجاح');
            fetchMedia();
          } else {
            showToast('error', 'فشل حذف الملف');
          }
        } catch {
          showToast('error', 'حدث خطأ أثناء حذف الملف');
        }
      },
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleUploadSuccess = (data: any) => {
    showToast('success', `تم رفع "${data.fileName}" بنجاح وإضافته إلى المكتبة`);
    fetchMedia();
  };

  const isImage = (item: MediaItem) =>
    item.type === 'image' || item.url.match(/\.(jpg|jpeg|png|webp|svg|gif)$/i);

  return (
    <AdminLayoutClient>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 transition-all animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <ConfirmModal
        {...confirmModal}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{previewItem.name}</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewItem.url}
                  download={previewItem.name}
                  className="px-3 py-1.5 text-xs font-bold bg-brand-600 text-white rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </a>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[70vh] overflow-auto">
              {isImage(previewItem) ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.name}
                  className="w-full object-contain max-h-[60vh] rounded-2xl"
                />
              ) : (
                <iframe
                  src={previewItem.url}
                  className="w-full h-[60vh] rounded-2xl border border-slate-200 dark:border-slate-800"
                  title={previewItem.name}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">
              مكتبة الوسائط (Media Library)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              إدارة جميع الصور والملفات المرفوعة — اختر من المكتبة بدلاً من إعادة الرفع
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 font-tajawal">رفع ملفات جديدة</h3>
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            accept="image/*,.pdf,.doc,.docx,.zip"
            label="اسحب الملفات هنا أو اضغط للاختيار (صور، PDF، مستندات)"
            helperText="الحد الأقصى: 10MB للصور، 50MB للملفات الأخرى"
          />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            {['all', 'image', 'pdf', 'doc'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  typeFilter === t
                    ? 'bg-brand-600 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {t === 'all' ? 'الكل' : t === 'image' ? '🖼 صور' : t === 'pdf' ? '📄 PDF' : '📝 مستندات'}
              </button>
            ))}

            <button
              onClick={fetchMedia}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-600 hover:border-brand-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">جاري تحميل مكتبة الوسائط...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-500">لا توجد وسائط مطابقة للبحث</p>
            <p className="text-xs text-slate-400 mt-1">ارفع ملفات جديدة أو غيّر معايير البحث</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400">{media.length} عنصر في المكتبة</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {isImage(item) ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                        <FileText className="w-10 h-10 text-red-500 mb-2" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate w-full px-1">
                          {item.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-slate-400 font-mono">{item.size || '—'}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          item.type === 'image'
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
                            : item.type === 'pdf'
                            ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Action Overlay */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
                    <button
                      onClick={() => setPreviewItem(item)}
                      title="معاينة"
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyUrl(item.url)}
                      title="نسخ الرابط"
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={item.url}
                      download={item.name}
                      title="تحميل"
                      className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDelete(item)}
                      title="حذف"
                      className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayoutClient>
  );
}
