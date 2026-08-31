"use client";

import React, { useEffect, useState } from 'react';
import { PlayCircle, FileDown } from 'lucide-react';

interface FileRecord {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
}

export default function UnitPublicView({ unitId }: { unitId: string }) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<FileRecord | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/files?unitId=${encodeURIComponent(unitId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setFiles(data.files || []);
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (unitId) load();
    return () => {
      cancelled = true;
    };
  }, [unitId]);

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h2 className="text-lg font-bold">محتوى الوحدة</h2>

      <section>
        <h3 className="font-medium">الملفات والمصادر</h3>
        {loading ? (
          <div className="text-sm text-slate-500">جارٍ التحميل...</div>
        ) : files.length === 0 ? (
          <div className="text-sm text-slate-500">لا توجد ملفات بعد.</div>
        ) : (
          <ul className="mt-2 space-y-2">
            {files.map((f) => (
              <li key={f.id} className="p-3 rounded-md border bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                <div>
                  <div className="font-medium">{f.title}</div>
                  <div className="text-sm text-slate-500">{f.fileType} {f.fileSize ? `· ${f.fileSize}` : ''}</div>
                </div>
                <div>
                  {f.fileType === 'video' ? (
                    <button onClick={() => setPlaying(f)} className="text-sm text-brand-600 hover:underline flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" /> فتح
                    </button>
                  ) : (
                    <a href={f.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline flex items-center gap-2">
                      <FileDown className="w-4 h-4" /> فتح
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {playing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPlaying(null)} />
          <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">{playing.title}</div>
              <button onClick={() => setPlaying(null)} className="text-sm text-slate-500">إغلاق</button>
            </div>
            <div className="aspect-video">
              <iframe
                src={playing.fileUrl.includes('youtube') ? playing.fileUrl.replace('watch?v=', 'embed/') : playing.fileUrl}
                title={playing.title}
                className="w-full h-full rounded"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
