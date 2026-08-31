"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';

interface Unit {
  id: string;
  title: string;
  description?: string | null;
}

export default function SubjectAdminShell({ slug }: { slug: string }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openUnitId, setOpenUnitId] = useState<string | null>(null);
  const [unitLessons, setUnitLessons] = useState<Record<string, any[]>>({});
  const [newLessonTitle, setNewLessonTitle] = useState<string>('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState<string>('');
  const [creatingLessonFor, setCreatingLessonFor] = useState<string | null>(null);
  const [editingVideoFor, setEditingVideoFor] = useState<string | null>(null);
  const [editingVideoUrl, setEditingVideoUrl] = useState<string>('');

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function fetchUnits() {
    try {
      const res = await fetch(`/api/subjects/${encodeURIComponent(slug)}/units`);
      if (!res.ok) throw new Error("Failed to fetch units");
      const data = await res.json();
      setUnits(data.units || []);
    } catch (err: any) {
      setError(err.message || "Error");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subjects/${encodeURIComponent(slug)}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create unit");
      }
      setTitle("");
      setDescription("");
      await fetchUnits();
    } catch (err: any) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(unitId: string) {
    if (!confirm('هل أنت متأكد من حذف الوحدة؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/subjects/${encodeURIComponent(slug)}/units/${encodeURIComponent(unitId)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'فشل الحذف');
      }
      await fetchUnits();
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchLessonsForUnit(unitId: string) {
    try {
      const res = await fetch(`/api/admin/lessons?unitId=${encodeURIComponent(unitId)}`);
      if (!res.ok) throw new Error('فشل جلب الدروس');
      const data = await res.json();
      setUnitLessons((prev) => ({ ...prev, [unitId]: data.lessons || [] }));
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء جلب الدروس');
    }
  }

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h2 className="text-lg font-bold">إدارة الوحدات (الفولدرات)</h2>

      <form onSubmit={handleCreate} className="space-y-2">
        <div>
          <label className="block text-sm text-slate-700 dark:text-slate-300">عنوان الوحدة</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            placeholder="مثال: الوحدة الأولى"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-slate-700 dark:text-slate-300">وصف اختياري</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2"
            placeholder="وصف الوحدة"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand-600 text-white rounded-md disabled:opacity-50"
          >
            إضافة فولدر
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold">الوحدات الحالية</h3>
        <ul className="mt-2 space-y-2">
          {units.length === 0 && <li className="text-sm text-slate-500">لا توجد وحدات حتى الآن.</li>}
          {units.map((u) => (
            <li key={u.id} className="p-3 rounded-md border bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{u.title}</div>
                  {u.description && <div className="text-sm text-slate-500">{u.description}</div>}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/subjects/${encodeURIComponent(slug)}/units/${encodeURIComponent(u.id)}`}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    فتح وحدة
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      // toggle lessons dropdown
                      if (openUnitId === u.id) {
                        setOpenUnitId(null);
                      } else {
                        setOpenUnitId(u.id);
                        // fetch lessons for unit if not loaded
                        if (!unitLessons[u.id]) fetchLessonsForUnit(u.id);
                      }
                    }}
                    className="text-sm text-slate-600 hover:underline"
                  >
                    الدروس
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(u.id);
                    }}
                    className="text-sm text-red-600 hover:underline"
                    disabled={loading}
                  >
                    حذف
                  </button>
                </div>
              </div>

              {openUnitId === u.id && (
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-semibold mb-2">الدروس في هذه الوحدة</h4>
                  <ul className="space-y-2 mb-3">
                    {(unitLessons[u.id] || []).map((lesson: any) => (
                      <li key={lesson.id} className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-slate-900 border">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/subjects/${encodeURIComponent(slug)}/units/${encodeURIComponent(u.id)}/lessons/${encodeURIComponent(lesson.id)}/manage`}
                            className="text-sm font-medium"
                          >
                            {lesson.title}
                          </Link>
                          <div className="text-xs text-slate-500">{lesson.durationMinutes || ''}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingVideoFor === lesson.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                value={editingVideoUrl}
                                onChange={(e) => setEditingVideoUrl(e.target.value)}
                                placeholder="رابط YouTube"
                                className="px-2 py-1 rounded-md border text-sm"
                              />
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ videoUrl: editingVideoUrl.trim() || null }),
                                    });
                                    if (!res.ok) throw new Error('فشل حفظ رابط الفيديو');
                                    const data = await res.json();
                                    setUnitLessons((prev) => ({
                                      ...prev,
                                      [u.id]: (prev[u.id] || []).map((ls: any) => (ls.id === lesson.id ? data.lesson : ls)),
                                    }));
                                    setEditingVideoFor(null);
                                    setEditingVideoUrl('');
                                  } catch (err: any) {
                                    setError(err.message || 'حدث خطأ');
                                  }
                                }}
                                className="text-sm text-emerald-600 hover:underline"
                              >
                                حفظ
                              </button>
                              <button onClick={() => setEditingVideoFor(null)} className="text-sm text-slate-600 hover:underline">إلغاء</button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingVideoFor(lesson.id);
                                  setEditingVideoUrl(lesson.videoUrl || '');
                                }}
                                className="text-sm text-sky-600 hover:underline"
                              >
                                رابط يوتيوب
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                    {(!unitLessons[u.id] || unitLessons[u.id].length === 0) && (
                      <li className="text-sm text-slate-500">لا توجد دروس حتى الآن.</li>
                    )}
                  </ul>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newLessonTitle.trim()) return;
                      setCreatingLessonFor(u.id);
                      try {
                        const slugVal = newLessonTitle.trim().toLowerCase().replace(/\s+/g, '-');
                        const res = await fetch('/api/admin/lessons', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: newLessonTitle.trim(),
                            slug: slugVal,
                            unitId: u.id,
                            videoUrl: newLessonVideoUrl.trim() || undefined,
                          }),
                        });
                        if (!res.ok) throw new Error('فشل إضافة الدرس');
                        const data = await res.json();
                        setUnitLessons((prev) => ({ ...prev, [u.id]: [...(prev[u.id] || []), data.lesson] }));
                        setNewLessonTitle('');
                        setNewLessonVideoUrl('');
                      } catch (err: any) {
                        setError(err.message || 'حدث خطأ');
                      } finally {
                        setCreatingLessonFor(null);
                      }
                    }}
                    className="flex gap-2"
                  >
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder="عنوان الدرس الجديد"
                        className="w-full px-3 py-2 rounded-md border"
                      />
                      <input
                        value={newLessonVideoUrl}
                        onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                        placeholder="رابط YouTube (اختياري) - https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 rounded-md border text-sm"
                      />
                    </div>
                    <button type="submit" disabled={creatingLessonFor === u.id} className="px-3 py-2 bg-brand-600 text-white rounded-md text-sm">
                      إضافة
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
