'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, X, Download, ExternalLink } from 'lucide-react';
import { WallPost } from './WallPostCard';

interface ProfilePhotoGalleryProps {
  posts: WallPost[];
}

export default function ProfilePhotoGallery({ posts }: ProfilePhotoGalleryProps) {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  // Extract all photos from wall posts
  const allPhotos: { url: string; postId: string; createdAt: string }[] = [];
  posts.forEach((p) => {
    if (p.images && p.images.length > 0) {
      p.images.forEach((url) => allPhotos.push({ url, postId: p.id, createdAt: p.createdAt }));
    } else if (p.imageUrl) {
      allPhotos.push({ url: p.imageUrl, postId: p.id, createdAt: p.createdAt });
    }
  });

  if (allPhotos.length === 0) {
    return (
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-12 text-center shadow-soft">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">لا توجد صور منشورة بعد</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          عندما يقوم الطالب بنشر صور ومذكرات ورسومات على حائطه، ستظهر جميعها هنا في معرض الصور.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">
            معرض الصور والمذكرات
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{allPhotos.length} صورة منشورة</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allPhotos.map((photo, idx) => (
          <div
            key={idx}
            onClick={() => setActivePhoto(photo.url)}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-sm hover:shadow-md transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={`Photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 text-xs font-bold shadow">
                عرض مكبر
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn"
        >
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto}
            alt="Enlarged gallery photo"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
