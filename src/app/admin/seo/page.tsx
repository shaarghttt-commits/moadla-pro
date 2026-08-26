'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import {
  Search,
  Save,
  Loader2,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';

interface SEOSettings {
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  twitterHandle: string;
  googleSiteVerification: string;
  robotsIndex: boolean;
}

export default function AdminSEOPage() {
  const [seo, setSeo] = useState<SEOSettings>({
    siteTitle: '', metaDescription: '', keywords: '', ogImage: '', twitterHandle: '', googleSiteVerification: '', robotsIndex: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        const res = await fetch('/api/admin/seo');
        const data = await res.json();
        if (data.seo) setSeo(data.seo);
      } catch {
        showToast('error', 'حدث خطأ أثناء تحميل إعدادات SEO');
      } finally {
        setLoading(false);
      }
    };
    fetchSEO();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seo }),
      });
      if (res.ok) showToast('success', 'تم حفظ إعدادات SEO بنجاح');
      else showToast('error', 'فشل الحفظ');
    } catch {
      showToast('error', 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const titleLen = seo.siteTitle.length;
  const descLen = seo.metaDescription.length;

  return (
    <AdminLayoutClient>
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fade-in ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">إعدادات SEO والميتا تاج</h2>
            <p className="text-xs text-slate-500 mt-0.5">تحسين ظهور الموقع في نتائج البحث (Google, Bing, Social Media)</p>
          </div>
          <button onClick={handleSave} disabled={saving || loading}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>حفظ التعديلات</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" /></div>
        ) : (
          <div className="space-y-5">
            {/* Google Search Preview */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-tajawal flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                معاينة نتيجة Google
              </h3>

              {/* Preview card */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl text-right" dir="rtl">
                <p className="text-[11px] text-green-700 font-mono">moadlapro:1999 › ...</p>
                <p className="text-base text-blue-700 font-medium line-clamp-1 hover:underline cursor-pointer">
                  {seo.siteTitle || 'عنوان الصفحة في محركات البحث'}
                </p>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                  {seo.metaDescription || 'وصف الصفحة الذي يظهر في نتائج البحث...'}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">عنوان الصفحة (Title Tag) — مثالياً بين 50-60 حرف</label>
                    <span className={`text-[10px] font-mono ${titleLen > 60 ? 'text-red-500' : titleLen > 40 ? 'text-emerald-600' : 'text-slate-400'}`}>{titleLen} حرف</span>
                  </div>
                  <input type="text" value={seo.siteTitle} onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600">وصف الصفحة (Meta Description) — مثالياً بين 120-155 حرف</label>
                    <span className={`text-[10px] font-mono ${descLen > 160 ? 'text-red-500' : descLen > 100 ? 'text-emerald-600' : 'text-slate-400'}`}>{descLen} حرف</span>
                  </div>
                  <textarea rows={3} value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">الكلمات المفتاحية (Keywords) — مفصولة بفاصلة</label>
                  <input type="text" value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                    placeholder="معادلة كلية الهندسة, امتحانات سابقة, ..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-tajawal flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                Open Graph — صورة مشاركة السوشيال ميديا
              </h3>
              <p className="text-[11px] text-slate-500">الصورة التي تظهر عند مشاركة رابط الموقع على Facebook وTwitter وWhatsApp</p>
              <ImageUpload
                label="OG Image (1200×630 مثالي)"
                currentImageUrl={seo.ogImage}
                onUploadSuccess={(url) => setSeo({ ...seo, ogImage: url })}
                onRemove={() => setSeo({ ...seo, ogImage: '' })}
                aspectRatio="video"
              />
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">حساب Twitter/X</label>
                <input type="text" value={seo.twitterHandle} onChange={(e) => setSeo({ ...seo, twitterHandle: e.target.value })}
                  placeholder="@moadlapro"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>
            </div>

            {/* Advanced */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-tajawal">إعدادات متقدمة</h3>
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">Google Search Console Verification Code</label>
                <input type="text" value={seo.googleSiteVerification} onChange={(e) => setSeo({ ...seo, googleSiteVerification: e.target.value })}
                  placeholder="الكود من Google Search Console"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={seo.robotsIndex} onChange={(e) => setSeo({ ...seo, robotsIndex: e.target.checked })} className="rounded" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">السماح لمحركات البحث بفهرسة الموقع (robots: index, follow)</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutClient>
  );
}
