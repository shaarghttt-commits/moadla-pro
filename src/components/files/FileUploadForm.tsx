"use client";
import React, { useState } from 'react';

export default function FileUploadForm({ folder }: { folder: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMessage('اختر ملف PDF للرفع');
    setLoading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);

      const res = await fetch('/api/files/upload', { method: 'POST', body: form });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'فشل الرفع');
      setMessage('تم رفع الملف بنجاح');
      setFile(null);
      const el = document.querySelector<HTMLInputElement>('#file-input-' + folder);
      if (el) el.value = '';
    } catch (err: any) {
      setMessage(err?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {message && <div className="text-sm text-slate-600 mb-2">{message}</div>}
      <div className="flex items-center gap-2">
        <label className="px-3 py-1 bg-gray-100 border border-gray-200 rounded cursor-pointer text-sm">
          اختر PDF
          <input id={`file-input-${folder}`} onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept="application/pdf" type="file" className="hidden" />
        </label>
        <button disabled={loading} type="submit" className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">
          {loading ? 'جارٍ الرفع...' : 'رفع إلى المجلد'}
        </button>
      </div>
    </form>
  );
}
