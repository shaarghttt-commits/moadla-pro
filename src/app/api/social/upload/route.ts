import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { BLOCKED_EXTENSIONS, SAFE_FILE_EXTENSIONS, SAFE_IMAGE_EXTENSIONS } from '@/lib/social';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

function getExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() || '';
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${(bytes / 1024 ** idx).toFixed(1)} ${sizes[idx]}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const kind = (formData.get('kind') as string) || 'file';

    if (!file) return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });

    const ext = getExtension(file.name);
    const mime = file.type || 'application/octet-stream';
    if (BLOCKED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'نوع الملف غير مسموح به لأسباب أمنية' }, { status: 400 });
    }

    const isImage = kind === 'image' || SAFE_IMAGE_EXTENSIONS.includes(ext) || mime.startsWith('image/');
    const isAllowedFile = SAFE_FILE_EXTENSIONS.includes(ext) || mime.includes('pdf') || mime.includes('document') || mime.includes('sheet') || mime.includes('text') || mime.includes('zip');
    if (!isImage && !isAllowedFile) {
      return NextResponse.json({ error: 'نوع الملف غير مدعوم' }, { status: 400 });
    }

    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `حجم الملف يتجاوز الحد المسموح (${isImage ? '8MB' : '25MB'})` }, { status: 400 });
    }

    const subfolder = isImage ? 'images' : 'files';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'social', subfolder);
    await mkdir(uploadDir, { recursive: true });

    const safeBase = file.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF.-]/g, '_');
    const fileName = `${Date.now()}-${safeBase}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/social/${subfolder}/${fileName}`;
    return NextResponse.json({
      success: true,
      fileUrl: url,
      fileName: file.name,
      mimeType: mime,
      fileType: isImage ? 'image' : 'file',
      fileSize: formatBytes(file.size),
    });
  } catch (error) {
    console.error('social upload error', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء رفع الملف' }, { status: 500 });
  }
}
