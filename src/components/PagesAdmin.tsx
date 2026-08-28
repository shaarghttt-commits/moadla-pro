"use client";
import { useEffect, useState } from 'react';

type Page = { slug: string; title: string; updatedAt?: number };

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => { fetchList(); }, []);

  async function fetchList() {
    const r = await fetch('/api/admin/pages');
    const j = await r.json();
    setPages(j.pages || []);
  }

  async function save() {
    if (!slug) return alert('ادخل slug');
    await fetch('/api/admin/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, title, content }) });
    fetchList();
    setSlug(''); setTitle(''); setContent('');
  }

  async function loadPage(s: string) {
    const r = await fetch(`/api/admin/pages/${s}.json`);
    if (!r.ok) return alert('فشل التحميل');
    const j = await r.json();
    setSlug(s); setTitle(j.title || ''); setContent(j.content || '');
  }

  async function del(s: string) {
    if (!confirm('هل تريد حذف الصفحة؟')) return;
    await fetch(`/api/admin/pages?slug=${encodeURIComponent(s)}`, { method: 'DELETE' });
    fetchList();
  }

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-slate-900 rounded-md border">
      <h3 className="font-semibold">إدارة الصفحات</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <h4 className="text-sm font-medium mb-2">قائمة الصفحات</h4>
          <ul className="space-y-2 text-sm">
            {pages.map(p => (
              <li key={p.slug} className="flex items-center justify-between">
                <button className="text-sm text-slate-700 hover:underline" onClick={() => loadPage(p.slug)}>{p.title || p.slug}</button>
                <button className="text-xs text-red-600" onClick={() => del(p.slug)}>حذف</button>
              </li>
            ))}
          </ul>
          <button className="mt-3 text-xs text-slate-500" onClick={fetchList}>تحديث</button>
        </div>

        <div className="md:col-span-2">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug (مثال: subjects)" className="w-full px-2 py-1 border rounded mb-2" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الصفحة" className="w-full px-2 py-1 border rounded mb-2" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="محتوى HTML أو نص" className="w-full h-40 px-2 py-2 border rounded mb-2" />
          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-1 bg-indigo-600 text-white rounded">حفظ الصفحة</button>
            <button onClick={() => {
              const url = prompt('ضع رابط (https://...)');
              if (!url) return;
              const text = prompt('نص الرابط (سيظهر للمستخدم)') || url;
              setContent(prev => prev + `\n<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
            }} className="px-3 py-1 bg-slate-200 dark:bg-slate-800 rounded">أدخل رابط</button>
            <label className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded cursor-pointer text-sm">
              رفع ملف
              <input type="file" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                const reader = new FileReader();
                reader.onload = async () => {
                  const data = reader.result as string;
                  const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: f.name, data }) });
                  const j = await r.json();
                  if (j.ok) setContent(prev => prev + `\n<a href="${j.url}" target="_blank">${f.name}</a>`);
                };
                reader.readAsDataURL(f);
              }} />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
