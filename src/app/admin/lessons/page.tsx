'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import FileUpload from '@/components/admin/FileUpload';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  PlayCircle,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
  Clock,
  RefreshCw,
  Video,
} from 'lucide-react';
import { LessonType, UnitType, SubjectType } from '@/types';
import { formatDuration } from '@/lib/utils';
import YouTubePlayer from '@/components/YouTubePlayer';

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonType[]>([]);
  const [units, setUnits] = useState<UnitType[]>([]);
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonType | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<LessonType | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [contentMarkdown, setContentMarkdown] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('20');
  const [order, setOrder] = useState('0');
  const [unitId, setUnitId] = useState('');
  const [fileTitle, setFileTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('');

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
      const [lessonsRes, unitsRes, subsRes] = await Promise.all([
        fetch('/api/admin/lessons'),
        fetch('/api/admin/units'),
        fetch('/api/admin/subjects'),
      ]);
      if (lessonsRes.ok && unitsRes.ok && subsRes.ok) {
        const lessonsData = await lessonsRes.json();
        const unitsData = await unitsRes.json();
        const subsData = await subsRes.json();
        setLessons(lessonsData.lessons || []);
        setUnits(unitsData.units || []);
        setSubjects(subsData.subjects || []);
        if (unitsData.units?.length > 0 && !unitId) {
          setUnitId(unitsData.units[0].id);
        }
      }
    } catch {
      showToast('error', 'فشل جلب الدروس');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingLesson(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setContentMarkdown('# شرح الدرس\n\nاكتب تفاصيل الشرح والقوانين هنا...');
    setVideoUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
    setDurationMinutes('25');
    setOrder('0');
    setUnitId(units[0]?.id || '');
    setFileTitle('');
    setFileUrl('');
    setFileSize('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (lesson: LessonType) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setSlug(lesson.slug);
    setDescription(lesson.description || '');
    setContentMarkdown(lesson.contentMarkdown || '');
    setVideoUrl(lesson.videoUrl || '');
    setDurationMinutes(String(lesson.durationMinutes));
    setOrder(String(lesson.order));
    setUnitId(lesson.unitId);
    setFileTitle('');
    setFileUrl('');
    setFileSize('');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const endpoint = editingLesson
        ? `/api/admin/lessons/${editingLesson.id}`
        : '/api/admin/lessons';
      const method = editingLesson ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          description,
          contentMarkdown,
          videoUrl,
          durationMinutes: Number(durationMinutes),
          order: Number(order),
          unitId,
          fileTitle: fileTitle || undefined,
          fileUrl: fileUrl || undefined,
          fileSize: fileSize || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        showToast('success', editingLesson ? 'تم تحديث بيانات الدرس بنجاح' : 'تم إضافة الدرس بنجاح');
        fetchData();
      } else {
        setFormError(data.error || 'حدث خطأ أثناء حفظ الدرس');
      }
    } catch {
      setFormError('حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!lessonToDelete) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/lessons/${lessonToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'تم حذف الدرس ومرفقاته بنجاح');
        setLessonToDelete(null);
        fetchData();
      } else {
        showToast('error', 'حدث خطأ أثناء حذف الدرس');
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
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <PlayCircle className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-tajawal">
                إدارة الدروس والمحتوى التعليمي ({lessons.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إضافة وتعديل شروحات الفيديو والملفات النصية والـ PDF المرفقة لكل درس.
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
              <span>إضافة درس جديد</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">جاري تحميل الدروس...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson: any) => (
              <div
                key={lesson.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 truncate max-w-[170px]">
                      {lesson.unit?.subject?.title} • {lesson.unit?.title}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                      <Clock className="w-3 h-3" />
                      <span>{formatDuration(lesson.durationMinutes)}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-tajawal">
                    {lesson.title}
                  </h3>

                  {lesson.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                    <span className="font-mono">الترتيب: {lesson.order}</span>
                    {lesson.files && lesson.files.length > 0 && (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{lesson.files.length} ملفات PDF</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditModal(lesson)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                    title="تعديل"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLessonToDelete(lesson)}
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-right my-8 max-h-[90vh] overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-tajawal">
                  {editingLesson ? 'تعديل بيانات الدرس' : 'إضافة درس تعليمي جديد'}
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
                    الوحدة التابع لها الدرس:
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {units.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.title} ({u.subject?.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      عنوان الدرس:
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: اشتقاق الدوال المثلثية"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      الاسم اللطيف (Slug):
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="مثال: trig-derivatives"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      رابط فيديو الدرس (YouTube / Embed URL):
                    </label>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      معاينة الفيديو:
                    </label>
                    <div className="w-full">
                      {/* Dynamically show preview using YouTubePlayer */}
                      {/* Import is client-side; file is in components */}
                      {/* @ts-ignore-next-line */}
                      <YouTubePlayer url={videoUrl} title={title} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      مدة الفيديو التقديرية (بالدقائق):
                    </label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    وصف مختصر للدرس:
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="نبذة عن موضوع ومحتوى الدرس..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    المحتوى والشرح النصي (Markdown):
                  </label>
                  <textarea
                    rows={5}
                    value={contentMarkdown}
                    onChange={(e) => setContentMarkdown(e.target.value)}
                    placeholder="# شرح الدرس وملاحظات هامة..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {/* PDF File Uploader inside Lesson form */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>إرفاق مذكرة أو ملف PDF من جهازك:</span>
                  </p>

                  <FileUpload
                    onUploadSuccess={(data) => {
                      setFileUrl(data.fileUrl);
                      setFileSize(data.fileSize);
                      if (!fileTitle) {
                        setFileTitle(data.fileName.replace(/\.[^/.]+$/, ''));
                      }
                    }}
                    currentFileUrl={fileUrl}
                    currentFileName={fileTitle}
                    onRemoveCurrent={() => {
                      setFileUrl('');
                      setFileSize('');
                      setFileTitle('');
                    }}
                    label=""
                    helperText="ارفع مذكرة الشرح أو بنك أسئلة الدرس بصيغة PDF"
                  />

                  {fileUrl && (
                    <input
                      type="text"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      placeholder="عنوان ملف الـ PDF (مثال: مذكرة شرح الباب الأول)"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  )}
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
                    {submitting ? 'جاري الحفظ...' : 'حفظ الدرس'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!lessonToDelete}
          onClose={() => setLessonToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف الدرس التعليمي"
          message={`هل أنت متأكد من حذف درس "${lessonToDelete?.title}"؟ سيتم حذف شروحات الفيديو والملفات والتقدم المسجل للطلاب في هذا الدرس.`}
          confirmText="نعم، حذف الدرس"
          isLoading={submitting}
          type="danger"
        />
      </div>
    </AdminLayoutClient>
  );
}
