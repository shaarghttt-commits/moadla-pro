'use client';

import React from 'react';

interface YouTubePlayerProps {
  url?: string | null;
  title?: string;
  className?: string;
}

// Try to extract a YouTube video ID from various URL forms
function extractYouTubeId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  const str = urlOrId.trim();

  // If it's already a plain ID (11+ chars, alphanumeric - and _-)
  if (/^[a-zA-Z0-9_-]{6,}$/.test(str) && !str.includes('://')) {
    return str;
  }

  try {
    // Try URL parsing
    const u = new URL(str, 'https://example.com');
    const host = u.hostname.toLowerCase();

    // youtu.be/VIDEO_ID
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split(/\?|&/)[0];
      return id || null;
    }

    // youtube.com or m.youtube.com
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      // /watch?v=VIDEO
      if (u.searchParams.has('v')) return u.searchParams.get('v');

      // /embed/VIDEO or /shorts/VIDEO
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex(Boolean);
      if (parts.includes('embed') || parts.includes('shorts')) {
        return parts[parts.length - 1] || null;
      }

      // sometimes path is just /v/VIDEO
      if (parts.length >= 2) {
        const possible = parts[parts.length - 1];
        if (/^[a-zA-Z0-9_-]{6,}$/.test(possible)) return possible;
      }
    }
  } catch (e) {
    // Not a URL, fall through
  }

  // Last resort: try regex to capture common patterns
  const patterns = [
    /(?:v=|\/videos\/|embed\/|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{6,})/,
    /([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = str.match(p);
    if (m && m[1]) return m[1];
  }

  return null;
}

export default function YouTubePlayer({ url, title, className }: YouTubePlayerProps) {
  const videoId = extractYouTubeId(url || '');

  if (!url) {
    return (
      <div className={`w-full ${className || ''}`}>
        <div className="w-full aspect-video rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <p className="text-sm font-semibold">لا يوجد فيديو مرتبط بهذا الدرس</p>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className={`w-full ${className || ''}`}>
        <div className="w-full aspect-video rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800 flex flex-col items-center justify-center text-rose-700 p-4 gap-2">
          <p className="text-sm font-bold">رابط YouTube غير صالح</p>
          <p className="text-xs">تأكد من لصق رابط فيديو YouTube كامل أو معرف الفيديو فقط.</p>
        </div>
      </div>
    );
  }

  // Use standard embed domain with essential parameters
  const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(
    videoId,
  )}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

  return (
    <div className={`w-full space-y-2 ${className || ''}`}>
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg">
        <iframe
          src={embedUrl}
          title={title || 'YouTube video'}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
        <span>مشغل الفيديو المدمج 🎬</span>
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
          className="hover:text-red-500 hover:underline flex items-center gap-1 font-bold"
        >
          <span>مشاهدة على YouTube إذا تعذر التشغيل ↗</span>
        </a>
      </div>
    </div>
  );
}
