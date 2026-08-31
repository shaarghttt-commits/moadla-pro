import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_PDF_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-zip-compressed'];

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'image';

    if (!file) {
      return NextResponse.json({ error: 'لم يتم اختيار أي ملف' }, { status: 400 });
    }

    const mimeType = file.type;
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isPdf = mimeType === 'application/pdf';
    const isOtherFile = ALLOWED_FILE_TYPES.includes(mimeType);

    if (!currentUser && type !== 'image') {
      return NextResponse.json({ error: 'يسمح فقط برفع الصور أثناء إنشاء الحساب' }, { status: 400 });
    }

    if (currentUser && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    if (!isImage && !isPdf && !isOtherFile) {
      return NextResponse.json(
        { error: 'نوع الملف غير مدعوم. الأنواع المدعومة: PDF, صور (PNG/JPG/WEBP/SVG), مستندات' },
        { status: 400 }
      );
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'حجم الصورة يتجاوز الحد الأقصى (10 ميجابايت)' }, { status: 400 });
    }

    if ((isPdf || isOtherFile) && file.size > MAX_PDF_SIZE) {
      return NextResponse.json({ error: 'حجم الملف يتجاوز الحد الأقصى (50 ميجابايت)' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const subFolder = isImage ? 'images' : 'files';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
    await mkdir(uploadDir, { recursive: true });

    const originalName = file.name;
    const ext = path.extname(originalName) || (isPdf ? '.pdf' : isImage ? '.png' : '');
    const cleanBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const uniqueFileName = `${cleanBaseName}_${timestamp}_${randomSuffix}${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${subFolder}/${uniqueFileName}`;
    const formattedSize = formatBytes(file.size);
    const fileType = isPdf ? 'pdf' : isImage ? 'image' : 'doc';

    const mediaItem = await prisma.mediaItem.create({
      data: {
        name: originalName,
        url: fileUrl,
        type: fileType,
        size: formattedSize,
        mimeType: mimeType || null,
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: originalName,
      fileSize: formattedSize,
      fileType,
      mimeType,
      mediaId: mediaItem?.id,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء رفع وحفظ الملف على السيرفر' },
      { status: 500 }
    );
  }
}
