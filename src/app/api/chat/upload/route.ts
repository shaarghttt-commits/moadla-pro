import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-zip-compressed'];

export async function POST(request: Request) {
  try {
    const req = request as any;
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no_file' }, { status: 400 });

    const mimeType = file.type;
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    const isFile = ALLOWED_FILE_TYPES.includes(mimeType) || mimeType === 'application/pdf';

    if (!isImage && !isFile) {
      return NextResponse.json({ error: 'unsupported' }, { status: 400 });
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) return NextResponse.json({ error: 'toobig' }, { status: 400 });
    if (isFile && file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'toobig' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const subFolder = isImage ? 'chat_images' : 'chat_files';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
    await mkdir(uploadDir, { recursive: true });

    const originalName = file.name;
    const ext = path.extname(originalName) || (isImage ? '.png' : '');
    const cleanBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
    const uniqueFileName = `${cleanBaseName}_${Date.now()}_${Math.random().toString(36).slice(2,7)}${ext}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${subFolder}/${uniqueFileName}`;

    // try to create mediaItem if prisma available
    let mediaItem = null;
    try {
      mediaItem = await prisma.mediaItem.create({ data: { name: originalName, url: fileUrl, type: isImage ? 'image' : 'doc', size: String(file.size), mimeType } });
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ success: true, fileUrl, fileName: originalName, mediaId: mediaItem?.id ?? null, mimeType, fileSize: String(file.size) });
  } catch (err) {
    console.error('chat upload error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
