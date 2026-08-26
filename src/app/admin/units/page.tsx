'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { UnitType, SubjectType } from '@/types';

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<UnitType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitType | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<UnitType | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
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
      const [unitsRes, subsRes] = await Promise.all([
        fetch('/api/admin/units'),
        fetch('/api/admin/subjects'),
      ]);
      if (unitsRes.ok && subsRes.ok) {
        const unitsData = await unitsRes.json();
        const subsData = await subsRes.json();
        setUnits(unitsData.units || []);
        setSubjects(subsData.subjects || []);
        if (subsData.subjects?.length > 0 && !subjectId) {
          setSubjectId(subsData.subjects[0].id);
        }
      }
    } catch {
      showToast('error', 'فشل جلب الوحدات الدراسية');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingUnit(null);
    setTitle('');
    setDescription('');
    setSubjectId(subjects[0]?.id || '');
    setOrder('0');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (unit: UnitType) => {
    setEditingUnit(unit);
    setTitle(unit.title);
    setDescription(unit.description || '');
    setSubjectId(unit.subjectId);
    setOrder(String(unit.order));
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const endpoint = editingUnit
        ? `/api/admin/units/${editingUnit.id}`
        : '/api/admin/units';
      const method = editingUnit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          subjectId,
          order: Number(order),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        showToast('success', editingUnit ? 'تم تحديث بيانات الوحدة بنجاح' : 'تم إضافة الوحدة بنجاح');
        fetchData();
      } else {
        setFormError(data.error || 'حدث خطأ أثناء حفظ الوحدة');
      }
    } catch {
      setFormError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!unitToDelete) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/units/${unitToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'تم حذف الوحدة وجميع دروسها بنجاح');
        setUnitToDelete(null);
        fetchData();
      } else {
        showToast('error', 'حدث خطأ أثناء حذف الوحدة');
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
              <span className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <FolderTree className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-tajawal">
                إدارة الوحدات الدراسية ({units.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تنظيم وتقسيم مناهج المواد إلى وحدات وأبواب تعليمية متسلسلة.
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
              <span>إضافة وحدة جديدة</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">جاري تحميل الوحدات...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit: any) => (
              <div
                key={unit.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      {unit.subject?.title}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      الترتيب: {unit.order}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-tajawal">
                    {unit.title}
                  </h3>

                  {unit.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {unit.description}
                    </p>
                  )}

                  <div className="text-xs text-slate-400 font-semibold pt-1">
                    {unit._count?.lessons || 0} دروس تابعة
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(unit)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                    title="تعديل"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setUnitToDelete(unit)}
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

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-right animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-tajawal">
                  {editingUnit ? 'تعديل بيانات الوحدة' : 'إضافة وحدة دراسية جديدة'}
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
                    المادة التابعة لها:
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.title} ({sub.section?.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عنوان الوحدة:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: الوحدة الأولى: التفاضل والاشتقاق"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الوصف (اختياري):
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="موجز عن محاور هذه الوحدة..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ترتيب الوحدة:
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
                    {submitting ? 'جاري الحفظ...' : 'حفظ الوحدة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!unitToDelete}
          onClose={() => setUnitToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف الوحدة الدراسية"
          message={`هل أنت متأكد من حذف وحدة "${unitToDelete?.title}"؟ سيتم حذف جميع الدروس والملفات التابعة لها نهائياً.`}
          confirmText="نعم، حذف الوحدة"
          isLoading={submitting}
          type="danger"
        />
      </div>
    </AdminLayoutClient>
  );
}
