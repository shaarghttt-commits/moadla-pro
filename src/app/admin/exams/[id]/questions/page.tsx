'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  CheckCircle2,
  ArrowRight,
  Award,
} from 'lucide-react';
import { QuestionType, ExamType } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminExamQuestionsPage({ params }: PageProps) {
  const { id } = use(params);
  const [exam, setExam] = useState<ExamType | null>(null);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionType | null>(null);

  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState('4');
  const [choices, setChoices] = useState<
    { id?: string; text: string; isCorrect: boolean }[]
  >([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchExam = async () => {
    try {
      const res = await fetch(`/api/admin/exams/${id}`);
      if (res.ok) {
        const data = await res.json();
        setExam(data.exam);
        setQuestions(data.exam?.questions || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExam();
  }, [id]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setExplanation('');
    setMarks('4');
    setChoices([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (q: QuestionType) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText);
    setExplanation(q.explanation || '');
    setMarks(String(q.marks));
    setChoices(
      q.choices.map((c) => ({
        id: c.id,
        text: c.text,
        isCorrect: c.isCorrect || false,
      }))
    );
    setFormError('');
    setModalOpen(true);
  };

  const updateChoiceText = (index: number, text: string) => {
    setChoices((prev) =>
      prev.map((c, i) => (i === index ? { ...c, text } : c))
    );
  };

  const setCorrectChoice = (index: number) => {
    setChoices((prev) =>
      prev.map((c, i) => ({ ...c, isCorrect: i === index }))
    );
  };

  const addChoice = () => {
    setChoices((prev) => [...prev, { text: '', isCorrect: false }]);
  };

  const removeChoice = (index: number) => {
    if (choices.length <= 2) return;
    setChoices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation
    const emptyChoices = choices.some((c) => !c.text.trim());
    if (emptyChoices) {
      setFormError('يرجى ملء نصوص جميع الخيارات');
      return;
    }

    const hasCorrect = choices.some((c) => c.isCorrect);
    if (!hasCorrect) {
      setFormError('يرجى تحديد الإجابة الصحيحة بالضغط على الدائرة الخضراء');
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId: id,
          questionText,
          explanation,
          marks: Number(marks),
          choices,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchExam();
      } else {
        setFormError(data.error || 'حدث خطأ أثناء حفظ السؤال');
      }
    } catch {
      setFormError('حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    try {
      const res = await fetch(`/api/admin/questions/${questionId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchExam();
      } else {
        alert('حدث خطأ أثناء حذف السؤال');
      }
    } catch {
      alert('حدث خطأ في الاتصال');
    }
  };

  return (
    <AdminLayoutClient>
      <div className="space-y-6">
        {/* Top bar with back to exams */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/admin/exams"
              className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline inline-flex items-center gap-1 mb-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لقائمة الامتحانات</span>
            </Link>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-600" />
              <span>بنك أسئلة: {exam?.title || 'جاري التحميل...'}</span>
            </h2>
            <p className="text-xs text-slate-500">
              إجمالي الأسئلة المضافة: {questions.length} سؤال
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سؤال جديد</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              لم تتم إضافة أي أسئلة لهذا الامتحان بعد
            </h3>
            <button
              onClick={openAddModal}
              className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-sm"
            >
              إضافة أول سؤال الآن
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      الدرجة: {q.marks}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(q)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors"
                      title="تعديل"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-accent-rose hover:bg-rose-100 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-base font-bold text-slate-900 dark:text-white font-tajawal">
                  {q.questionText}
                </p>

                {/* Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {q.choices.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                        c.isCorrect
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{c.text}</span>
                      {c.isCorrect && (
                        <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>صحيحة</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">الشرح: </span>
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-right my-8 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
                  {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد وبنك الخيارات'}
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
                    نص السؤال:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="اكتب نص السؤال الرياضي أو النظري..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    درجة السؤال:
                  </label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-32 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
                  />
                </div>

                {/* Choices Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      الخيارات (حدد الإجابة الصحيحة بالضغط على الدائرة الخضراء):
                    </label>
                    <button
                      type="button"
                      onClick={addChoice}
                      className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة خيار إضافي</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {choices.map((choice, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCorrectChoice(cIdx)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                            choice.isCorrect
                              ? 'bg-emerald-500 text-white ring-2 ring-emerald-500/30'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                          title={choice.isCorrect ? 'الإجابة الصحيحة' : 'تعيين كإجابة صحيحة'}
                        >
                          {choice.isCorrect ? '✓' : cIdx + 1}
                        </button>

                        <input
                          type="text"
                          required
                          value={choice.text}
                          onChange={(e) => updateChoiceText(cIdx, e.target.value)}
                          placeholder={`نص الخيار ${cIdx + 1}...`}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs border ${
                            choice.isCorrect
                              ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'
                          }`}
                        />

                        {choices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeChoice(cIdx)}
                            className="p-2 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    شرح وتفسير الإجابة النموذجية (يظهر للطالب بعد إنهاء الامتحان):
                  </label>
                  <textarea
                    rows={3}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="خطوات الحل النموذجية وتفسير القانون المستخدم..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700"
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
                    {submitting ? 'جاري الحفظ...' : 'حفظ السؤال'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutClient>
  );
}
