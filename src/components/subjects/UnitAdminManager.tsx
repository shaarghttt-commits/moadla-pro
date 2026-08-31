"use client";

import React, { useEffect, useState } from 'react';
import FileUpload from '@/components/admin/FileUpload';

interface FileRecord {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize?: string | null;
}

function getYouTubeEmbedUrl(url: string) {
  try {
    // extract video id by regex to support many url shapes
    const patterns = [
      /(?:v=|vi=)([0-9A-Za-z_-]{11})/, // v=VIDEO_ID
      /youtu\.be\/([0-9A-Za-z_-]{11})/, // youtu.be/ID
      /embed\/([0-9A-Za-z_-]{11})/, // /embed/ID
      /v\/([0-9A-Za-z_-]{11})/, // /v/ID
      /watch\?.*v=([0-9A-Za-z_-]{11})/, // watch?v=ID
    ];
    let id = '';
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) {
        id = m[1];
        break;
      }
    }
    if (!id) return url;
    // use nocookie domain for better privacy and embed compatibility
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`;
  } catch (e) {
    return url;
  }
}

export default function UnitAdminManager({ unitId, subjectSlug }: { unitId: string; subjectSlug: string }) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [ytUrl, setYtUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const [playingVideo, setPlayingVideo] = useState<{ url: string; title: string } | null>(null);
  const [embedAllowed, setEmbedAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  async function fetchFiles() {
    try {
      setError(null);
      const res = await fetch(`/api/admin/files?unitId=${encodeURIComponent(unitId)}`);
      if (!res.ok) throw new Error('فشل جلب الملفات');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message || 'Error');
    }
  }

  async function handleYtSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ytUrl) return;
    setLoading(true);
    setError(null);
    try {
      // Normalize YouTube URL to full link (store as-is)
      const body = { title: 'رابط فيديو يوتيوب', fileUrl: ytUrl, fileType: 'video', unitId };
      const res = await fetch('/api/admin/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل إضافة رابط');
      setYtUrl('');
      await fetchFiles();
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function checkOEmbed() {
      if (!playingVideo) {
        setEmbedAllowed(null);
        return;
      }
      setEmbedAllowed(null);
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(playingVideo.url)}&format=json`;
        const res = await fetch(oembedUrl);
        if (cancelled) return;
        setEmbedAllowed(res.ok);
      } catch (err) {
        if (cancelled) return;
        setEmbedAllowed(false);
      }
    }
    checkOEmbed();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingVideo]);

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h2 className="text-lg font-bold">محتوى الوحدة</h2>

      <section className="space-y-4">
        <h3 className="font-medium">أضف رابط YouTube</h3>
        <form onSubmit={handleYtSubmit} className="flex gap-2">
          <input
            value={ytUrl}
            onChange={(e) => setYtUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 rounded-md border px-3 py-2"
            required
          />
          <button type="submit" disabled={loading} className="px-4 py-2 bg-brand-600 text-white rounded-md">
            إضافة
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="font-medium">رفع ملف PDF</h3>
        <FileUpload
          accept=".pdf"
          label="رفع ملف PDF للوحدة"
          helperText="PDF فقط - الحد الأقصى 50 ميجابايت"
          onUploadSuccess={async (data) => {
            try {
              const body = {
                title: data.fileName.replace(/\.[^/.]+$/, ''),
                fileUrl: data.fileUrl,
                fileType: 'pdf',
                fileSize: data.fileSize,
                unitId,
              };
              const res = await fetch('/api/admin/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              });
              const resp = await res.json();
              if (!res.ok) throw new Error(resp.error || 'فشل حفظ ملف');
              await fetchFiles();
            } catch (err: any) {
              setError(err.message || 'Error');
            }
          }}
        />
      </section>

      <section>
        <h3 className="font-medium">الملفات والمصادر</h3>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <ul className="mt-2 space-y-2">
          {files.length === 0 && <li className="text-sm text-slate-500">لا توجد ملفات بعد.</li>}
          {files.map((f) => (
            <li key={f.id} className="p-3 rounded-md border bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
              <div>
                <div className="font-medium">
                  {editingFileId === f.id ? (
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="rounded-md border px-2 py-1"
                    />
                  ) : (
                    f.title
                  )}
                </div>
                <div className="text-sm text-slate-500">{f.fileType} {f.fileSize ? `· ${f.fileSize}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                {f.fileType === 'video' ? (
                  <button
                    onClick={() => {
                      // open embedded player
                      setPlayingVideo({ url: f.fileUrl, title: f.title });
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    فتح
                  </button>
                ) : (
                  <a href={f.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">فتح</a>
                )}
                {f.fileType === 'video' && (
                  editingFileId === f.id ? (
                    <>
                      <button
                        onClick={async () => {
                          if (!editingTitle.trim()) return setError('العنوان لا يمكن أن يكون فارغاً');
                          setLoading(true);
                          setError(null);
                          try {
                            const res = await fetch(`/api/admin/files/${f.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ title: editingTitle.trim() }),
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || 'فشل تحديث العنوان');
                            setEditingFileId(null);
                            setEditingTitle('');
                            await fetchFiles();
                          } catch (err: any) {
                            setError(err.message || 'Error');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => {
                          setEditingFileId(null);
                          setEditingTitle('');
                        }}
                        className="text-sm text-slate-600 hover:underline"
                      >
                        إلغاء
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingFileId(f.id);
                        setEditingTitle(f.title || '');
                      }}
                      className="text-sm text-sky-600 hover:underline"
                    >
                      تعديل
                    </button>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
      {playingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setPlayingVideo(null)} />
          <div className="relative z-10 w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold">{playingVideo.title}</div>
              <button onClick={() => setPlayingVideo(null)} className="text-sm text-slate-500">إغلاق</button>
            </div>
            {embedAllowed === null ? (
              <div className="py-20 text-center">جارٍ التحقق من إمكانية التضمين...</div>
            ) : embedAllowed ? (
              <>
                <div className="aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(playingVideo.url)}
                    title={playingVideo.title}
                    className="w-full h-full rounded"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="mt-3 flex gap-3">
                  <a href={playingVideo.url} target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:underline">
                    افتح الفيديو في YouTube
                  </a>
                  <a href={getYouTubeEmbedUrl(playingVideo.url)} target="_blank" rel="noreferrer" className="text-sm text-slate-600 hover:underline">
                    افتح رابط التضمين
                  </a>
                </div>
              </>
            ) : (
              <div>
                <div className="mb-2 text-sm text-slate-600">التضمين غير مسموح لهذا الفيديو. يمكنك فتحه على YouTube.</div>
                <div className="flex gap-3">
                  <a href={playingVideo.url} target="_blank" rel="noreferrer" className="text-sm text-sky-600 hover:underline">
                    افتح الفيديو في YouTube
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
