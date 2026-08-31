'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ImageUpload from '@/components/admin/ImageUpload';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Laptop,
  TrendingUp,
  Sprout,
  X,
  RefreshCw,
} from 'lucide-react';
import { SectionType } from '@/types';

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionType | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<SectionType | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Cpu');
  const [color, setColor] = useState('blue');
  const [order, setOrder] = useState('0');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/sections');
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch {
      showToast('error', 'فشل جلب الأقسام');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const openAddModal = () => {
    setEditingSection(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setIcon('Cpu');
    setColor('blue');
    setOrder('0');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (sec: SectionType) => {
    setEditingSection(sec);
    setTitle(sec.title);
    setSlug(sec.slug);
    setDescription(sec.description);
    setIcon(sec.icon || 'Cpu');
    setColor(sec.color || 'blue');
    setOrder(String(sec.order));
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const endpoint = editingSection
        ? `/api/admin/sections/${editingSection.id}`
        : '/api/admin/sections';
      const method = editingSection ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          icon,
          color,
          order: Number(order),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        showToast('success', editingSection ? 'تم تحديث بيانات القسم بنجاح' : 'تم إضافة القسم بنجاح');
        fetchSections();
      } else {
        setFormError(data.error || 'حدث خطأ أثناء حفظ القسم');
      }
    } catch {
      setFormError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sectionToDelete) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/sections/${sectionToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'تم حذف القسم وجميع مواده بنجاح');
        setSectionToDelete(null);
        fetchSections();
      } else {
        showToast('error', 'حدث خطأ أثناء حذف القسم');
      }
    } catch {
      showToast('error', 'حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayoutClient>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Header & Add button */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-tajawal">
                إدارة الأقسام الأكاديمية ({sections.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إضافة وتعديل وحذف مسارات المواد المتاحة بالمنصة (هندسة، تجارة، زراعة، حقوق، إلخ).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSections}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="تحديث"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-brand-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قسم جديد</span>
            </button>
          </div>
        </div>

        {/* Sections Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">جاري تحميل الأقسام...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono">الترتيب: {sec.order}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      {sec.subjectsCount || 0} مواد
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-tajawal">
                    {sec.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {sec.description}
                  </p>

                  <div className="text-[11px] text-slate-400 pt-1">
                    Slug: <code className="text-brand-600 dark:text-brand-400 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded">{sec.slug}</code>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(sec)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                    title="تعديل"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSectionToDelete(sec)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-accent-rose hover:bg-rose-100 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Add / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-right animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-tajawal">
                  {editingSection ? 'تعديل بيانات القسم' : 'إضافة قسم أكاديمي جديد'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-accent-rose text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم القسم:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: معادلة كلية الهندسة"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الاسم اللطيف بالإنجليزية (Slug):
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="مثال: engineering"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الوصف المختصر:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="وصف المسار والمؤهلات المطلوبة..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      الأيقونة:
                    </label>
                    <select
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                    >
                      <option value="Cpu">Cpu (هندسة)</option>
                      <option value="Laptop">Laptop (حاسبات)</option>
                      <option value="TrendingUp">TrendingUp (تجارة)</option>
                      <option value="Sprout">Sprout (زراعة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      اللون المميز:
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                    >
                      <option value="blue">أزرق (Blue)</option>
                      <option value="emerald">أخضر (Emerald)</option>
                      <option value="amber">برتقالي (Amber)</option>
                      <option value="purple">بنفسجي (Purple)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      الترتيب:
                    </label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold disabled:opacity-50"
                  >
                    {submitting ? 'جاري الحفظ...' : 'حفظ القسم'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!sectionToDelete}
          onClose={() => setSectionToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف القسم الأكاديمي"
          message={`هل أنت متأكد من حذف قسم "${sectionToDelete?.title}"؟ تحذير: سيتم حذف جميع المواد والوحدات والدروس والامتحانات التابعة لهذا القسم نهائياً.`}
          confirmText="نعم، حذف القسم بالكامل"
          isLoading={submitting}
          type="danger"
        />
      </div>
    </AdminLayoutClient>
  );
}
