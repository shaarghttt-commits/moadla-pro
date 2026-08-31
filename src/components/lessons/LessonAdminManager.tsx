"use client";

import React, { useState } from 'react';
import FileUpload from '@/components/admin/FileUpload';

export default function LessonAdminManager({ lesson }: { lesson: any }) {
  const [videoUrl, setVideoUrl] = useState<string>(lesson.videoUrl || '');
  const [fileUrl, setFileUrl] = useState<string>(lesson.files?.[0]?.fileUrl || '');
  const [fileTitle, setFileTitle] = useState<string>(lesson.files?.[0]?.title || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lesson.title,
          slug: lesson.slug,
          description: lesson.description,
          contentMarkdown: lesson.contentMarkdown,
          videoUrl: videoUrl || null,
          durationMinutes: lesson.durationMinutes || 15,
          order: lesson.order || 0,
          unitId: lesson.unitId,
          fileTitle: fileTitle || undefined,
          fileUrl: fileUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error('فشل حفظ التعديلات');
      setMessage('تم الحفظ بنجاح');
    } catch (err: any) {
      setMessage(err.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold">رابط فيديو اليوتيوب (Embed)</label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className="mt-1 w-full px-3 py-2 rounded-md border"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">مذكرة/ملف PDF</label>
          <FileUpload
            onUploadSuccess={(data) => {
              setFileUrl(data.fileUrl);
              if (!fileTitle) setFileTitle(data.fileName.replace(/\.[^/.]+$/, ''));
            }}
            currentFileUrl={fileUrl}
            currentFileName={fileTitle}
            onRemoveCurrent={() => {
              setFileUrl('');
              setFileTitle('');
            }}
            label=""
            helperText="ارفع ملف PDF للدرس"
          />

          {fileUrl && (
            <input
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="عنوان الملف"
              className="mt-2 w-full px-3 py-2 rounded-md border"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded-md">
            {saving ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          {message && <div className="text-sm text-slate-600">{message}</div>}
        </div>
      </form>
    </div>
  );
}
