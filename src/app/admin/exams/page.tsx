'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  FileCheck2,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Clock,
  Award,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { ExamType, SubjectType, SectionType } from '@/types';

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamType | null>(null);
  const [examToDelete, setExamToDelete] = useState<ExamType | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [year, setYear] = useState('2024');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [totalMarks, setTotalMarks] = useState('100');
  const [passMarks, setPassMarks] = useState('50');

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
      const [examsRes, subsRes, secsRes] = await Promise.all([
        fetch('/api/admin/exams'),
        fetch('/api/admin/subjects'),
        fetch('/api/admin/sections'),
      ]);
      if (examsRes.ok && subsRes.ok && secsRes.ok) {
        const examsData = await examsRes.json();
        const subsData = await subsRes.json();
        const secsData = await secsRes.json();
        setExams(examsData.exams || []);
        setSubjects(subsData.subjects || []);
        setSections(secsData.sections || []);
        if (subsData.subjects?.length > 0 && !subjectId) setSubjectId(subsData.subjects[0].id);
        if (secsData.sections?.length > 0 && !sectionId) setSectionId(secsData.sections[0].id);
      }
    } catch {
      showToast('error', 'فشل جلب الامتحانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingExam(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setSubjectId(subjects[0]?.id || '');
    setSectionId(sections[0]?.id || '');
    setYear('2024');
    setDurationMinutes('30');
    setTotalMarks('100');
    setPassMarks('50');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (exam: ExamType) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setSlug(exam.slug);
    setDescription(exam.description || '');
    setSubjectId(exam.subjectId || '');
    setSectionId(exam.sectionId || '');
    setYear(String(exam.year || 2024));
    setDurationMinutes(String(exam.durationMinutes));
    setTotalMarks(String(exam.totalMarks));
    setPassMarks(String(exam.passMarks));
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const endpoint = editingExam
        ? `/api/admin/exams/${editingExam.id}`
        : '/api/admin/exams';
      const method = editingExam ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          subjectId: subjectId || null,
          sectionId: sectionId || null,
          year: Number(year),
          durationMinutes: Number(durationMinutes),
          totalMarks: Number(totalMarks),
          passMarks: Number(passMarks),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        showToast('success', editingExam ? 'تم تحديث بيانات الامتحان بنجاح' : 'تم إضافة الامتحان بنجاح');
        fetchData();
      } else {
        setFormError(data.error || 'حدث خطأ أثناء حفظ الامتحان');
      }
    } catch {
      setFormError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!examToDelete) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/exams/${examToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'تم حذف الامتحان وجميع أسئلته ومحاولات الطلاب بنجاح');
        setExamToDelete(null);
        fetchData();
      } else {
        showToast('error', 'حدث خطأ أثناء حذف الامتحان');
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
              <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-tajawal">
                إدارة الامتحانات وبنك الأسئلة ({exams.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إنشاء الاختبارات التفاعلية وتعيين الدرجات والمؤقت الزمني وإدارة بنوك الأسئلة.
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
              <span>إنشاء امتحان جديد</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">جاري تحميل الامتحانات...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam: any) => (
              <div
                key={exam.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      {exam.subject?.title || exam.section?.title || 'امتحان شامل'}
                    </span>
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      عام {exam.year || 2024}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-tajawal">
                    {exam.title}
                  </h3>

                  {exam.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-800 text-[11px]">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>{exam.durationMinutes} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{exam.totalMarks} درجة</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{exam._count?.questions || 0} سؤال</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between gap-2">
                  <Link
                    href={`/admin/exams/${exam.id}/questions`}
                    className="px-3 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>إدارة الأسئلة ({exam._count?.questions || 0})</span>
                  </Link>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(exam)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                      title="تعديل"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExamToDelete(exam)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-accent-rose hover:bg-rose-100 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
                  {editingExam ? 'تعديل بيانات الامتحان' : 'إنشاء امتحان إلكتروني جديد'}
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
                    عنوان الامتحان:
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: امتحان التفاضل الشامل - دور أول 2024"
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
                    placeholder="مثال: calculus-final-2024"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      المادة التابع لها (اختياري):
                    </label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">-- بدون مادة محددة --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      القسم الأكاديمي (اختياري):
                    </label>
                    <select
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">-- بدون قسم محدد --</option>
                      {sections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    وصف أو تعليمات الامتحان:
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="تعليمات حل الامتحان وعدد الأسئلة..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      سنة الامتحان:
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المدة (بالدقائق):
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الدرجة الكلية:
                    </label>
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      درجة النجاح:
                    </label>
                    <input
                      type="number"
                      value={passMarks}
                      onChange={(e) => setPassMarks(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
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
                    {submitting ? 'جاري الحفظ...' : 'حفظ الامتحان'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!examToDelete}
          onClose={() => setExamToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف الامتحان الإلكتروني"
          message={`هل أنت متأكد من حذف امتحان "${examToDelete?.title}"؟ سيتم حذف كافة الأسئلة والخيارات وسجلات ودرجات الطلاب المسجلة في هذا الامتحان نهائياً.`}
          confirmText="نعم، حذف الامتحان"
          isLoading={submitting}
          type="danger"
        />
      </div>
    </AdminLayoutClient>
  );
}
