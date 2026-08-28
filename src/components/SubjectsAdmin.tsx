"use client";
import { useEffect, useState } from 'react';

type Section = { id: string; title: string; html: string };

export default function SubjectsAdmin() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');

  useEffect(() => {
    fetch('/api/admin/subjects')
      .then((r) => r.json())
      .then((j) => {
        setSections(j.sections || []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function uploadFile(file: File) {
    const reader = new FileReader();
    return new Promise<string>((res, rej) => {
      reader.onload = async () => {
        const data = reader.result as string;
        const r = await fetch('/api/admin/upload', { method: 'POST', body: JSON.stringify({ filename: file.name, data }), headers: { 'Content-Type': 'application/json' } });
        const j = await r.json();
        if (j.ok) res(j.url);
        else rej(j.error || 'upload failed');
      };
      reader.onerror = () => rej('read error');
      reader.readAsDataURL(file);
    });
  }

  async function addSection() {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `s-${Date.now()}`;
    const s = { id, title, html };
    const newSections = [...sections, s];
    setSections(newSections);
    await save(newSections);
    setTitle('');
    setHtml('');
  }

  async function save(data: Section[]) {
    await fetch('/api/admin/subjects', { method: 'POST', body: JSON.stringify({ sections: data }), headers: { 'Content-Type': 'application/json' } });
  }

  return (
    <div className="mt-4 p-4 border rounded-md bg-white dark:bg-slate-900">
      <h3 className="font-semibold">أدوات المالك</h3>
      <div className="mt-3 space-y-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الفقرة" className="w-full px-2 py-1 border rounded" />
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} placeholder="محتوى HTML مبسّط" className="w-full px-2 py-1 border rounded h-28" />
        <div className="flex gap-2">
          <button onClick={addSection} className="px-3 py-1 bg-indigo-600 text-white rounded">أضف فقرة</button>
          <label className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded cursor-pointer text-sm">
            رفع ملف
            <input onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const url = await uploadFile(f);
                setHtml((prev) => prev + `\n<a href="${url}" target="_blank" rel="noreferrer">${f.name}</a>`);
              } catch (err) { alert(String(err)); }
            }} type="file" className="hidden" />
          </label>
        </div>
        <div className="pt-3">
          <h4 className="text-sm font-medium">المعاينة</h4>
          <div className="prose mt-2" dangerouslySetInnerHTML={{ __html: sections.map(s => `<h3 id="${s.id}">${s.title}</h3>${s.html}`).join('\n') }} />
        </div>
      </div>
    </div>
  );
}
