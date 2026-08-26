'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  LayoutTemplate,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  Loader2,
  Save,
  X,
  Globe,
  FileText,
  ChevronRight,
} from 'lucide-react';
import PageBuilderEditor, { PageBlock } from '@/components/admin/PageBuilderEditor';
import ImageUpload from '@/components/admin/ImageUpload';

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImage?: string | null;
  isPublished: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  blocksJson?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

type View = 'list' | 'create' | 'edit';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('list');
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', description: '', coverImage: '', seoTitle: '', seoDescription: '', seoKeywords: '', isPublished: true,
  });
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'seo' | 'settings'>('builder');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pages?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setPages(data.pages || []);
    } catch {
      showToast('error', 'حدث خطأ أثناء تحميل الصفحات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, [search]);

  const resetForm = () => {
    setForm({ title: '', slug: '', description: '', coverImage: '', seoTitle: '', seoDescription: '', seoKeywords: '', isPublished: true });
    setBlocks([]);
    setEditingPage(null);
    setActiveTab('builder');
  };

  const startCreate = () => {
    resetForm();
    setView('create');
  };

  const startEdit = (page: CustomPage) => {
    setEditingPage(page);
    setForm({
      title: page.title,
      slug: page.slug,
      description: page.description || '',
      coverImage: page.coverImage || '',
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      seoKeywords: '',
      isPublished: page.isPublished,
    });
    try {
      setBlocks(page.blocksJson ? JSON.parse(page.blocksJson) : []);
    } catch { setBlocks([]); }
    setActiveTab('builder');
    setView('edit');
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '').substring(0, 60);

  const handleSave = async () => {
    if (!form.title || !form.slug) return showToast('error', 'العنوان والرابط (Slug) مطلوبان');
    setSaving(true);
    try {
      const payload = { ...form, blocksJson: JSON.stringify(blocks) };
      const url = view === 'edit' && editingPage ? `/api/admin/pages/${editingPage.id}` : '/api/admin/pages';
      const method = view === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('success', view === 'edit' ? 'تم تحديث الصفحة بنجاح' : 'تم إنشاء الصفحة بنجاح');
        setView('list');
        resetForm();
        fetchPages();
      } else {
        const err = await res.json();
        showToast('error', err.error || 'فشل الحفظ');
      }
    } catch {
      showToast('error', 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (page: CustomPage) => {
    setConfirmModal({
      isOpen: true,
      title: 'تأكيد حذف الصفحة',
      message: `هل أنت متأكد من حذف الصفحة "${page.title}"؟ لا يمكن التراجع.`,
      onConfirm: async () => {
        const res = await fetch(`/api/admin/pages/${page.id}`, { method: 'DELETE' });
        if (res.ok) { showToast('success', 'تم حذف الصفحة'); fetchPages(); }
        else showToast('error', 'فشل الحذف');
      },
    });
  };

  const handleTogglePublish = async (page: CustomPage) => {
    const res = await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !page.isPublished }),
    });
    if (res.ok) { showToast('success', page.isPublished ? 'تم إخفاء الصفحة (مسودة)' : 'تم نشر الصفحة'); fetchPages(); }
  };

  const isFormView = view === 'create' || view === 'edit';

  return (
    <AdminLayoutClient>
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fade-in ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal((p: any) => ({ ...p, isOpen: false }))} />

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">إدارة الصفحات المخصصة</h2>
              <p className="text-xs text-slate-500 mt-0.5">أنشئ صفحات جديدة بمُنشئ المحتوى المرئي (Page Builder) دون كتابة كود</p>
            </div>
            <button onClick={startCreate} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>إنشاء صفحة جديدة</span>
            </button>
          </div>

          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="ابحث بالعنوان..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs" />
          </div>

          {loading ? (
            <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" /><p className="text-xs text-slate-400">جاري التحميل...</p></div>
          ) : pages.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
              <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-500 mb-1">لا توجد صفحات مخصصة حتى الآن</p>
              <p className="text-xs text-slate-400 mb-4">ابدأ بإنشاء صفحتك الأولى باستخدام Page Builder</p>
              <button onClick={startCreate} className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow">
                إنشاء أول صفحة
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pages.map((page) => (
                <div key={page.id} className={`rounded-3xl bg-white dark:bg-slate-900 border ${page.isPublished ? 'border-slate-200 dark:border-slate-800' : 'border-dashed border-amber-300 dark:border-amber-700'} shadow-sm overflow-hidden group`}>
                  {page.coverImage && (
                    <div className="h-32 overflow-hidden">
                      <img src={page.coverImage} alt={page.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white font-tajawal truncate">{page.title}</h3>
                        <code className="text-[10px] text-brand-600 dark:text-brand-400">/{page.slug}</code>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${page.isPublished ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'}`}>
                        {page.isPublished ? 'منشورة' : 'مسودة'}
                      </span>
                    </div>

                    {page.description && <p className="text-[11px] text-slate-500 line-clamp-2">{page.description}</p>}

                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={() => startEdit(page)} className="flex-1 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-brand-100">
                        <Edit3 className="w-3.5 h-3.5" /><span>تعديل</span>
                      </button>
                      <button onClick={() => handleTogglePublish(page)} className={`px-2.5 py-1.5 rounded-xl text-xs font-bold ${page.isPublished ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                        {page.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <a href={`/${page.slug}?preview=true`} target="_blank" className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs font-bold hover:bg-slate-100">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button onClick={() => handleDelete(page)} className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Form View */}
      {isFormView && (
        <div className="space-y-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <button onClick={() => { setView('list'); resetForm(); }} className="hover:text-brand-600 font-bold">الصفحات</button>
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            <span className="font-bold text-slate-900 dark:text-white">{view === 'create' ? 'صفحة جديدة' : `تعديل: ${editingPage?.title}`}</span>
          </div>

          {/* Form Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
              {view === 'create' ? 'إنشاء صفحة جديدة' : `تعديل: ${editingPage?.title}`}
            </h2>
            <div className="flex items-center gap-2">
              {editingPage && (
                <a href={`/${editingPage.slug}?preview=true`} target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /><span>معاينة</span>
                </a>
              )}
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>حفظ الصفحة</span>
              </button>
              <button onClick={() => { setView('list'); resetForm(); }} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-tajawal">معلومات الصفحة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">عنوان الصفحة *</label>
                <input type="text" value={form.title} onChange={(e) => {
                  const title = e.target.value;
                  setForm({ ...form, title, slug: view === 'create' ? generateSlug(title) : form.slug });
                }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">رابط الصفحة (Slug) *</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 font-mono">/</span>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 mb-1 block">وصف مختصر</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
                <span className="font-bold">نشر الصفحة الآن (Published)</span>
              </label>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {['builder', 'seo', 'settings'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === tab ? 'bg-brand-600 text-white shadow' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}>
                {tab === 'builder' ? '🧱 Page Builder' : tab === 'seo' ? '🔍 إعدادات SEO' : '🖼 الصورة والمظهر'}
              </button>
            ))}
          </div>

          {/* Page Builder Tab */}
          {activeTab === 'builder' && (
            <PageBuilderEditor blocks={blocks} onChange={setBlocks} />
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-tajawal">إعدادات محركات البحث (SEO)</h3>
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">عنوان الصفحة في محركات البحث (Title Tag)</label>
                <input type="text" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder={form.title || 'عنوان الصفحة'}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">الوصف في محركات البحث (Meta Description)</label>
                <textarea rows={3} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="اكتب وصفاً قصيراً في 155 حرف..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>
            </div>
          )}

          {/* Settings / Cover Image Tab */}
          {activeTab === 'settings' && (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-tajawal">صورة الغلاف والمظهر</h3>
              <ImageUpload
                label="صورة غلاف الصفحة (Cover Image)"
                currentImageUrl={form.coverImage}
                onUploadSuccess={(url) => setForm({ ...form, coverImage: url })}
                onRemove={() => setForm({ ...form, coverImage: '' })}
                aspectRatio="video"
              />
            </div>
          )}
        </div>
      )}
    </AdminLayoutClient>
  );
}
