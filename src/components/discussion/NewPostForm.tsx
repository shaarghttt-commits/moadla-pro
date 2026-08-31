"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPostForm() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'file' | null>(null);
  const [mediaInfo, setMediaInfo] = useState<{ fileUrl: string; fileName?: string; mimeType?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content) return setError('المحتوى مطلوب');
    setLoading(true);
    try {
      const body: any = { content };
      if (mediaInfo?.fileUrl) {
        if (mediaType === 'image') body.imageUrl = mediaInfo.fileUrl;
        else body.fileUrl = mediaInfo.fileUrl;
      }

      const res = await fetch('/api/discussion/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'خطأ');
      setContent('');
      setMediaInfo(null);
      setMediaPreview(null);
      setMediaType(null);
      // Refresh server-rendered data on this route
      try {
        router.refresh();
      } catch (_) {
        // fallback: navigate to same page
        router.push('/discussion');
      }
    } catch (err: any) {
      setError(err.message || 'خطأ');
    } finally {
      setLoading(false);
    }
  }

  async function handleMediaFile(file: File | null) {
    if (!file) return;
    setError(null);
    setMediaUploading(true);
    try {
      const form = new FormData();
      // detect image or video
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      form.append('file', file);
      form.append('kind', isImage ? 'image' : 'file');

      const res = await fetch('/api/social/upload', { method: 'POST', body: form });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'فشل رفع الملف');

      setMediaInfo({ fileUrl: j.fileUrl, fileName: j.fileName, mimeType: j.mimeType });
      setMediaType(isImage ? 'image' : isVideo ? 'video' : 'file');
      // show local preview if image/video
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    } catch (e: any) {
      console.error('media upload', e);
      setError(e?.message || 'خطأ في رفع الملف');
    } finally {
      setMediaUploading(false);
    }
  }

  function removeMedia() {
    setMediaInfo(null);
    setMediaPreview(null);
    setMediaType(null);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white">
      {error && <div className="text-red-600 mb-3">{error}</div>}
      {/* Media uploader */}
      <div className="mb-3">
        {mediaPreview ? (
          <div className="mb-2">
            {mediaType === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaPreview} alt="preview" className="max-w-full rounded mb-2" />
            ) : mediaType === 'video' ? (
              <video src={mediaPreview} controls className="max-w-full rounded mb-2" />
            ) : mediaType === 'file' && mediaInfo?.mimeType?.includes('pdf') ? (
              <div className="mb-2">
                <iframe src={mediaPreview} className="w-full h-48 border rounded" title="PDF preview" />
                <div className="mt-2">
                  <a href={mediaPreview} target="_blank" rel="noreferrer" className="text-sm text-sky-600">افتح ملف PDF في تبويب جديد</a>
                </div>
              </div>
            ) : null}
            <div className="flex gap-2">
              <button type="button" onClick={removeMedia} className="px-3 py-1 border rounded text-sm">إزالة</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end">
            <label className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded cursor-pointer text-sm hover:bg-gray-200">
              <span>رفع صورة/فيديو/ملف</span>
              <input
                onChange={(ev) => handleMediaFile(ev.target.files?.[0] ?? null)}
                type="file"
                accept="image/*,video/*,application/pdf"
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="اكتب سؤالك أو مشاركتك هنا"
        className="w-full p-4 border border-gray-200 rounded-md mb-3 min-h-[120px] resize-y"
        rows={4}
      />
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">يمكنك إرفاق صورة أو فيديو مع المشاركة</div>
        <div>
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md shadow" disabled={loading}>
            {loading ? 'جارٍ النشر...' : 'نشر'}
          </button>
        </div>
      </div>
    </form>
  );
}
