'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ImageUpload from '@/components/admin/ImageUpload';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { SubjectType, SectionType } from '@/types';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectType | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<SubjectType | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [order, setOrder] = useState('0');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, secsRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/sections'),
      ]);
      if (subsRes.ok && secsRes.ok) {
        const subsData = await subsRes.json();
        const secsData = await secsRes.json();
        setSubjects(subsData.subjects || []);
        setSections(secsData.sections || []);
        if (secsData.sections?.length > 0 && !sectionId) {
          setSectionId(secsData.sections[0].id);
        }
      }
    } catch {
      showToast('error', 'فشل جلب المواد الدراسية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingSubject(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80');
    setSectionId(sections[0]?.id || '');
    setOrder('0');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (sub: SubjectType) => {
    setEditingSubject(sub);
    setTitle(sub.title);
    setSlug(sub.slug);
    setDescription(sub.description);
    setImage(sub.image || '');
    setSectionId(sub.sectionId);
    setOrder(String(sub.order));
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const endpoint = editingSubject
        ? `/api/admin/subjects/${editingSubject.id}`
        : '/api/admin/subjects';
      const method = editingSubject ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          image,
          sectionId,
          order: Number(order),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        showToast('success', editingSubject ? 'تم تحديث بيانات المادة بنجاح' : 'تم إضافة المادة بنجاح');
        fetchData();
      } else {
        setFormError(data.error || 'حدث خطأ أثناء حفظ المادة');
      }
    } catch {
      setFormError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!subjectToDelete) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/subjects/${subjectToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'تم حذف المادة وجميع وحداتها ودروسها بنجاح');
        setSubjectToDelete(null);
        fetchData();
      } else {
        showToast('error', 'حدث خطأ أثناء حذف المادة');
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

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-tajawal">
                إدارة المواد الدراسية ({subjects.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إضافة وتعديل المواد، رفع صورها، وربطها بالأقسام الأكاديمية المختلفة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
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
              <span>إضافة مادة جديدة</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">جاري تحميل المواد الدراسية...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                {sub.image && (
                  <div className="h-40 w-full overflow-hidden relative">
                    <img src={sub.image} alt={sub.title} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[11px] font-bold">
                      {sub.section?.title}
                    </span>
                  </div>
                )}

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white font-tajawal">
                      {sub.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">الترتيب: {sub.order}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSubjectToDelete(sub)}
                        className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-accent-rose hover:bg-rose-100 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-right max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-tajawal">
                  {editingSubject ? 'تعديل بيانات المادة' : 'إضافة مادة دراسية جديدة'}
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
                {/* Image Upload Component */}
                <ImageUpload
                  label="صورة المادة الدراسية"
                  helperText="ارفع صورة عالية الدقة تعبر عن المادة"
                  currentImageUrl={image}
                  onUploadSuccess={(url) => setImage(url)}
                  onRemove={() => setImage('')}
                  aspectRatio="video"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    القسم التابع له:
                  </label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم المادة:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: التفاضل والتكامل"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
                    placeholder="مثال: calculus"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    وصف المادة والمحتوى:
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="شرح محتوى المادة وفروعها..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ترتيب الظهور:
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
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
                    {submitting ? 'جاري الحفظ...' : 'حفظ المادة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!subjectToDelete}
          onClose={() => setSubjectToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف المادة الدراسية"
          message={`هل أنت متأكد من حذف مادة "${subjectToDelete?.title}"؟ تحذير: سيتم حذف جميع الوحدات والدروس والملفات المرفقة بها نهائياً.`}
          confirmText="نعم، حذف المادة"
          isLoading={submitting}
          type="danger"
        />
      </div>
    </AdminLayoutClient>
  );
}
