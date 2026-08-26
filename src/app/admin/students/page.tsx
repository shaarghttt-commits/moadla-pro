'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Eye,
  ShieldCheck,
  UserCheck,
  Power,
  X,
  BookOpen,
  FileCheck2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/admin/students?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const viewStudentDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/students/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedStudent(data.student);
        setDetailsModalOpen(true);
      }
    } catch {
      showToast('error', 'حدث خطأ أثناء تحميل بيانات الطالب');
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        showToast('success', currentStatus ? 'تم تجميد حساب الطالب' : 'تم تفعيل حساب الطالب');
        fetchStudents();
      }
    } catch {
      showToast('error', 'حدث خطأ أثناء تعديل حالة الحساب');
    }
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    setConfirmModal({
      isOpen: true,
      title: 'تغيير صلاحية المستخدم',
      message: `هل أنت متأكد من تغيير صلاحيات هذا الحساب إلى "${newRole === 'ADMIN' ? 'مشرف عام (Admin)' : 'طالب (Student)'}"؟`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
          });
          if (res.ok) {
            showToast('success', `تم تغيير الصلاحية إلى ${newRole} بنجاح`);
            fetchStudents();
          }
        } catch {
          showToast('error', 'حدث خطأ أثناء تغيير الصلاحية');
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <AdminLayoutClient>
      <div className="space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              <span>إدارة الطلاب والمستخدمين ({students.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              متابعة سجلات الطلاب، درجات الامتحانات، وتعديل الصلاحيات والحسابات.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم، البريد أو الهاتف..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="p-4">الطالب</th>
                    <th className="p-4">الهاتف</th>
                    <th className="p-4">الصلاحية</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">الدروس المكتملة</th>
                    <th className="p-4">الامتحانات</th>
                    <th className="p-4">تاريخ التسجيل</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                            {stu.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={stu.avatar} alt={stu.name} className="w-full h-full object-cover" />
                            ) : (
                              stu.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{stu.name}</p>
                            <p className="text-[11px] text-slate-400">{stu.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500" dir="ltr">
                        {stu.phone || '-'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            stu.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400'
                              : 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                          }`}
                        >
                          {stu.role === 'ADMIN' ? 'مشرف (Admin)' : 'طالب (Student)'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            stu.isActive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                          }`}
                        >
                          {stu.isActive ? 'مفعّل' : 'معطّل'}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {stu._count?.progress || 0} درس
                      </td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {stu._count?.attempts || 0} امتحان
                      </td>
                      <td className="p-4 text-slate-400">{formatDate(stu.createdAt)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => viewStudentDetails(stu.id)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                            title="عرض التفاصيل وسجل النتائج"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStatus(stu.id, stu.isActive)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              stu.isActive
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                            title={stu.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleRole(stu.id, stu.role)}
                            className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 hover:bg-purple-100 transition-colors"
                            title="ترقية / تغيير الصلاحية"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {detailsModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-right my-8 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
                  الملف الأكاديمي وسجل الطالب
                </h3>
                <button onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white font-black text-xl flex items-center justify-center overflow-hidden">
                  {selectedStudent.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedStudent.name.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{selectedStudent.name}</h4>
                  <p className="text-xs text-slate-400">{selectedStudent.email} • {selectedStudent.phone || 'بدون هاتف'}</p>
                  {selectedStudent.bio && <p className="text-xs text-slate-500 mt-1">{selectedStudent.bio}</p>}
                </div>
              </div>

              {/* Exam Attempts List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-500" />
                  <span>سجل نتائج الامتحانات ({selectedStudent.attempts?.length || 0})</span>
                </h4>

                <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 p-2">
                  {selectedStudent.attempts?.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center">لا توجد محاولات امتحانية مسجلة</p>
                  ) : (
                    selectedStudent.attempts?.map((att: any) => (
                      <div key={att.id} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{att.exam?.title}</p>
                          <span className="text-[10px] text-slate-400">{formatDate(att.completedAt)}</span>
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full ${
                            att.isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {att.score} / {att.totalPossible} ({Math.round(att.percentage)}%)
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-2 text-left">
                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
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

        {/* Role Change Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="تأكيد التغيير"
          type="warning"
        />
      </div>
    </AdminLayoutClient>
  );
}
