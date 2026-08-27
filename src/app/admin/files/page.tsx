'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import FileUpload from '@/components/admin/FileUpload';
import ConfirmModal from '@/components/admin/ConfirmModal';
import PdfViewerModal from '@/components/admin/PdfViewerModal';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Download,
  Trash2,
  Edit3,
  RefreshCw,
  Plus,
  BookOpen,
  FolderTree,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
} from 'lucide-react';

interface FileItem {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
  createdAt: string;
  subjectId?: string | null;
  unitId?: string | null;
  lessonId?: string | null;
  subject?: { id: string; title: string } | null;
  unit?: { id: string; title: string; subject?: { id: string; title: string } | null } | null;
  lesson?: {
    id: string;
    title: string;
    unit?: { id: string; title: string; subject?: { id: string; title: string } | null } | null;
  } | null;
}

export default function AdminFilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');

  // Modals & Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [fileToReplace, setFileToReplace] = useState<FileItem | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string } | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [formFileType, setFormFileType] = useState('pdf');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formUnitId, setFormUnitId] = useState('');
  const [formLessonId, setFormLessonId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [filesRes, subjectsRes, unitsRes, lessonsRes] = await Promise.all([
        fetch('/api/admin/files').then((r) => r.json()),
        fetch('/api/admin/subjects').then((r) => r.json()),
        fetch('/api/admin/units').then((r) => r.json()),
        fetch('/api/admin/lessons').then((r) => r.json()),
      ]);

      setFiles(filesRes.files || []);
      setSubjects(subjectsRes.subjects || []);
      setUnits(unitsRes.units || []);
      setLessons(lessonsRes.lessons || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'فشل تحميل قائمة الملفات والبيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Units based on Selected Subject in Modal
  const modalAvailableUnits = useMemo(() => {
    if (!formSubjectId) return units;
    return units.filter((u) => u.subjectId === formSubjectId);
  }, [units, formSubjectId]);

  // Filtered Lessons based on Selected Unit in Modal
  const modalAvailableLessons = useMemo(() => {
    if (!formUnitId) return lessons;
    return lessons.filter((l) => l.unitId === formUnitId);
  }, [lessons, formUnitId]);

  // Filtered Files List
  const filteredFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch =
        !searchQuery ||
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.lesson?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.subject?.title.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        !selectedSubjectFilter ||
        f.subjectId === selectedSubjectFilter ||
        f.unit?.subject?.id === selectedSubjectFilter ||
        f.lesson?.unit?.subject?.id === selectedSubjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [files, searchQuery, selectedSubjectFilter]);

  const subjectFolders = useMemo(() => {
    const groups = new Map<string, { id: string; title: string; files: FileItem[] }>();

    filteredFiles.forEach((file) => {
      const subjectId = file.subjectId || file.unit?.subject?.id || file.lesson?.unit?.subject?.id || 'general';
      const subjectTitle = file.subject?.title || file.unit?.subject?.title || file.lesson?.unit?.subject?.title || 'ملف عام';

      if (!groups.has(subjectId)) {
        groups.set(subjectId, { id: subjectId, title: subjectTitle, files: [] });
      }

      groups.get(subjectId)?.files.push(file);
    });

    return Array.from(groups.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredFiles]);

  const openAddModal = () => {
    setEditingFile(null);
    setFormTitle('');
    setFormFileUrl('');
    setFormFileSize('');
    setFormFileType('pdf');
    setFormSubjectId('');
    setFormUnitId('');
    setFormLessonId('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (file: FileItem) => {
    setEditingFile(file);
    setFormTitle(file.title);
    setFormFileUrl(file.fileUrl);
    setFormFileSize(file.fileSize || '');
    setFormFileType(file.fileType || 'pdf');
    setFormSubjectId(file.subjectId || file.unit?.subject?.id || file.lesson?.unit?.subject?.id || '');
    setFormUnitId(file.unitId || file.lesson?.unit?.id || '');
    setFormLessonId(file.lessonId || '');
    setIsAddModalOpen(true);
  };

  const handleSaveFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('error', 'يرجى إدخال اسم الملف');
      return;
    }
    if (!formFileUrl) {
      showToast('error', 'يرجى رفع ملف أولاً');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingFile ? `/api/admin/files/${editingFile.id}` : '/api/admin/files';
      const method = editingFile ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          fileUrl: formFileUrl,
          fileSize: formFileSize,
          fileType: formFileType,
          subjectId: formSubjectId || null,
          unitId: formUnitId || null,
          lessonId: formLessonId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشلت العملية');

      showToast('success', editingFile ? 'تم تحديث بيانات الملف بنجاح' : 'تم إضافة الملف بنجاح');
      setIsAddModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'حدث خطأ أثناء حفظ الملف');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplaceFile = async (data: { fileUrl: string; fileName: string; fileSize: string; fileType: string }) => {
    if (!fileToReplace) return;

    try {
      const res = await fetch(`/api/admin/files/${fileToReplace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          fileType: data.fileType,
        }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'فشل استبدال الملف');

      showToast('success', 'تم استبدال الملف بملف جديد بنجاح');
      setFileToReplace(null);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'حدث خطأ أثناء استبدال الملف');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/files/${fileToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حذف الملف');

      showToast('success', 'تم حذف ملف PDF بالكامل من قاعدة البيانات والقرص');
      setFileToDelete(null);
      fetchData();
    } catch (err: any) {
      showToast('error', err.message || 'حدث خطأ أثناء حذف الملف');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayoutClient>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all animate-bounce ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">إدارة ملفات ومذكرات PDF</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              رفع ملفات PDF وتخزينها على السيرفر، ربطها بالمواد والدروس، وتعديلها واستبدالها وحذفها.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="تحديث القائمة"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>رفع ملف PDF جديد</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث باسم الملف أو اسم الدرس أو المادة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            >
              <option value="">جميع المواد الدراسية</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Files Grid / List */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">جاري تحميل ملفات PDF من السيرفر...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">لا توجد ملفات حالياً</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
              لم يتم العثور على أي ملفات مطابقة لبحثك. يمكنك رفع أول ملف PDF الآن.
            </p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>رفع ملف جديد</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {subjectFolders.map((folder) => (
              <div
                key={folder.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FolderTree className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500">مجلد المادة</p>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{folder.title}</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {folder.files.length} ملف
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folder.files.map((file) => {
                    const isPdf = file.fileType === 'pdf' || file.fileUrl.endsWith('.pdf');
                    const parentTitle =
                      file.lesson?.title ||
                      file.unit?.title ||
                      file.subject?.title ||
                      'ملف عام غير مربوط';

                    return (
                      <div
                        key={file.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                                  isPdf
                                    ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                                    : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                }`}
                              >
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 transition-colors">
                                  {file.title}
                                </h4>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {file.fileSize || (isPdf ? 'PDF' : 'مستند')}
                                </span>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                              {file.fileType}
                            </span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 mb-4 space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                              {file.lesson ? (
                                <PlayCircle className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                              ) : file.unit ? (
                                <FolderTree className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              ) : file.subject ? (
                                <BookOpen className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                              ) : (
                                <FileCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              )}
                              <span className="truncate">{parentTitle}</span>
                            </div>
                            {file.lesson?.unit?.subject?.title && (
                              <p className="text-[11px] text-slate-400 truncate pr-5">
                                المادة: {file.lesson.unit.subject.title}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewPdf({ url: file.fileUrl, title: file.title })}
                              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl transition-colors"
                              title="معاينة سريعة"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                              title="فتح في نافذة جديدة"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            <a
                              href={file.fileUrl}
                              download={file.title}
                              className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
                              title="تحميل الملف"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setFileToReplace(file)}
                              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors"
                              title="استبدال بملف جديد"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openEditModal(file)}
                              className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl transition-colors"
                              title="تعديل الاسم والربط"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                              title="حذف الملف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add / Edit File Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingFile ? 'تعديل بيانات الملف' : 'رفع ملف PDF جديد'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFile} className="space-y-4">
                {/* File Uploader */}
                <div>
                  <FileUpload
                    onUploadSuccess={(data) => {
                      setFormFileUrl(data.fileUrl);
                      setFormFileSize(data.fileSize);
                      setFormFileType(data.fileType);
                      if (!formTitle) {
                        setFormTitle(data.fileName.replace(/\.[^/.]+$/, ''));
                      }
                    }}
                    currentFileUrl={formFileUrl}
                    currentFileName={formTitle}
                    onRemoveCurrent={() => {
                      setFormFileUrl('');
                      setFormFileSize('');
                    }}
                  />
                </div>

                {/* File Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم / عنوان الملف (يظهر للطلاب) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مذكرة مراجعة ليلة الامتحان - الباب الأول"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Linking Hierarchy (Subject -> Unit -> Lesson) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ربط الملف بالمحتوى الأكاديمي (اختياري)
                  </p>

                  {/* Subject */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      المادة الدراسية
                    </label>
                    <select
                      value={formSubjectId}
                      onChange={(e) => {
                        setFormSubjectId(e.target.value);
                        setFormUnitId('');
                        setFormLessonId('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                    >
                      <option value="">-- بدون تحديد مادة --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.title} ({sub.section?.title || 'عام'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      الوحدة التعليمية
                    </label>
                    <select
                      value={formUnitId}
                      onChange={(e) => {
                        setFormUnitId(e.target.value);
                        setFormLessonId('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                    >
                      <option value="">-- بدون تحديد وحدة --</option>
                      {modalAvailableUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lesson */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      الدرس المحدد (للظهور داخل صفحة الدرس)
                    </label>
                    <select
                      value={formLessonId}
                      onChange={(e) => setFormLessonId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                    >
                      <option value="">-- بدون تحديد درس --</option>
                      {modalAvailableLessons.map((les) => (
                        <option key={les.id} value={les.id}>
                          {les.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 disabled:opacity-50"
                  >
                    {submitting ? 'جاري الحفظ...' : editingFile ? 'تحديث الملف' : 'حفظ الملف'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Replace File Modal */}
        {fileToReplace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">استبدال ملف PDF</h3>
                </div>
                <button
                  onClick={() => setFileToReplace(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                اختر ملف PDF جديد لاستبدال الملف الحالي ({fileToReplace.title}). سيتم تحديث الرابط وحذف الملف القديم.
              </p>

              <FileUpload
                onUploadSuccess={handleReplaceFile}
                label="اختر الملف الجديد"
              />

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setFileToReplace(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Delete */}
        <ConfirmModal
          isOpen={!!fileToDelete}
          onClose={() => setFileToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="حذف ملف PDF نهائياً"
          message={`هل أنت متأكد من رغبتك في حذف ملف "${fileToDelete?.title}"؟ سيتم حذف الملف فيزيائياً من السيرفر وإزالته من كافة الدروس والمواد المرتبطة به ولا يمكن التراجع.`}
          confirmText="نعم، حذف الملف"
          isLoading={submitting}
          type="danger"
        />

        {/* PDF Viewer Preview Modal */}
        <PdfViewerModal
          isOpen={!!previewPdf}
          onClose={() => setPreviewPdf(null)}
          fileUrl={previewPdf?.url || null}
          fileName={previewPdf?.title || null}
        />
      </div>
    </AdminLayoutClient>
  );
}
