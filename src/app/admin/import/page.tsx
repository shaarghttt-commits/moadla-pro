'use client';

import { useState } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Download,
  ShieldCheck,
} from 'lucide-react';

export default function AdminImportPage() {
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [selectedPageIds, setSelectedPageIds] = useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const runImport = async () => {
    setLoading(true);
    setError('');
    setStatus('جارٍ تحليل الرابط...');

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل الاستيراد');
      }

      setPreview(data.preview);
      setSelectedPageIds((data.preview?.pages || []).map((p: any) => p.id));
      setSelectedFileIds((data.preview?.files || []).map((f: any) => f.id));
      setSelectedImageIds((data.preview?.images || []).map((i: any) => i.id));
      setStatus('تم تحليل المحتوى بنجاح، يمكنك اختيار العناصر المراد استيرادها.');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التحليل');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const saveSelected = async () => {
    if (!preview) return;

    setLoading(true);
    setStatus('جارٍ حفظ العناصر المحددة...');

    try {
      const res = await fetch('/api/admin/import', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preview,
          selectedPageIds,
          selectedFileIds,
          selectedImageIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ الاستيراد');

      setStatus(data.message || 'تم حفظ المحتوى المستورد بنجاح');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (
    id: string,
    type: 'page' | 'file' | 'image',
    selected: boolean,
  ) => {
    if (type === 'page') {
      setSelectedPageIds((prev) => (selected ? [...prev, id] : prev.filter((item) => item !== id)));
    }
    if (type === 'file') {
      setSelectedFileIds((prev) => (selected ? [...prev, id] : prev.filter((item) => item !== id)));
    }
    if (type === 'image') {
      setSelectedImageIds((prev) => (selected ? [...prev, id] : prev.filter((item) => item !== id)));
    }
  };

  const toggleAll = (type: 'page' | 'file' | 'image') => {
    const all = (preview?.[type === 'page' ? 'pages' : type === 'file' ? 'files' : 'images'] || []).map((item: any) => item.id);
    if (type === 'page') {
      setSelectedPageIds((prev) => (prev.length === all.length ? [] : all));
    }
    if (type === 'file') {
      setSelectedFileIds((prev) => (prev.length === all.length ? [] : all));
    }
    if (type === 'image') {
      setSelectedImageIds((prev) => (prev.length === all.length ? [] : all));
    }
  };

  return (
    <AdminLayoutClient>
      <div className="space-y-6">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">استيراد محتوى من موقع خارجي</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">استيراد نصوص، صفحات، PDF، صور، وروابط من موقع خارجي إلى Moadla Pro</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
              placeholder="https://example.com"
            />
            <button
              onClick={runImport}
              disabled={loading}
              className="rounded-2xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 text-sm font-bold transition-colors disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'جارٍ التحليل...' : 'بدء الاستيراد'}
              </span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 text-xs text-slate-500 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>ضمان الأمان</span>
            </div>
            <p>يتم التحقق من أن الرابط HTTPS/HTTP فقط، وعدم السماح بـ localhost أو IPs خاصة أو SSRF.</p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {status && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
              {status}
            </div>
          )}
        </div>

        {preview && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="عدد الصفحات" value={preview.pagesAnalyzed} icon={<BookOpen className="w-4 h-4" />} />
              <StatCard label="عدد الملفات" value={preview.pdfCount} icon={<FileText className="w-4 h-4" />} />
              <StatCard label="عدد الصور" value={preview.imageCount} icon={<ImageIcon className="w-4 h-4" />} />
              <StatCard label="عدد العناصر" value={preview.totalItems} icon={<CheckCircle2 className="w-4 h-4" />} />
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">Preview للبيانات</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{preview.sourceWebsite}</p>
                </div>
                <button
                  onClick={saveSelected}
                  className="rounded-2xl bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 text-sm font-bold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    استيراد المحدد
                  </span>
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal">معلومات أساسية</h3>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-sm">
                    <p><span className="font-bold">العنوان:</span> {preview.title}</p>
                    <p><span className="font-bold">الوصف:</span> {preview.description}</p>
                    <p><span className="font-bold">الرابط:</span> {preview.sourceUrl}</p>
                    {preview.canonicalUrl && <p><span className="font-bold">Canonical:</span> {preview.canonicalUrl}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal">الأخطاء والتحذيرات</h3>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2 text-sm">
                    {preview.errors?.length ? preview.errors.map((item: string) => <p key={item} className="text-red-600">• {item}</p>) : <p className="text-emerald-600">لا توجد أخطاء.</p>}
                    {preview.warnings?.length ? preview.warnings.map((item: string) => <p key={item} className="text-amber-600">• {item}</p>) : null}
                  </div>
                </div>
              </div>
            </div>

            {preview.pages?.length > 0 && (
              <PreviewSection
                title="الصفحات"
                items={preview.pages}
                selectedIds={selectedPageIds}
                onToggle={(id, checked) => toggleSelect(id, 'page', checked)}
                onToggleAll={() => toggleAll('page')}
              />
            )}

            {preview.files?.length > 0 && (
              <PreviewSection
                title="ملفات PDF"
                items={preview.files}
                selectedIds={selectedFileIds}
                onToggle={(id, checked) => toggleSelect(id, 'file', checked)}
                onToggleAll={() => toggleAll('file')}
              />
            )}

            {preview.images?.length > 0 && (
              <PreviewSection
                title="الصور"
                items={preview.images}
                selectedIds={selectedImageIds}
                onToggle={(id, checked) => toggleSelect(id, 'image', checked)}
                onToggleAll={() => toggleAll('image')}
              />
            )}
          </div>
        )}
      </div>
    </AdminLayoutClient>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-brand-600 dark:text-brand-400">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black text-slate-900 dark:text-white font-tajawal">{value}</p>
    </div>
  );
}

function PreviewSection({
  title,
  items,
  selectedIds,
  onToggle,
  onToggleAll,
}: {
  title: string;
  items: any[];
  selectedIds: string[];
  onToggle: (id: string, checked: boolean) => void;
  onToggleAll: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">{title}</h3>
        <button onClick={onToggleAll} className="text-xs font-bold text-brand-600 dark:text-brand-400">
          {selectedIds.length === items.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={(e) => onToggle(item.id, e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description || item.url}</p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-brand-600 dark:text-brand-400">
                <ArrowRight className="w-3.5 h-3.5" />
                <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline">{item.url}</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
