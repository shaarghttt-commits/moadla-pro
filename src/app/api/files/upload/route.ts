import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/auth';
import { BLOCKED_EXTENSIONS } from '@/lib/social';

function getExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() || '';
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    if (user.role !== 'ADMIN') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const folder = String(form.get('folder') || 'general').replace(/[^a-zA-Z0-9-%_\u0600-\u06FF.-]/g, '-');

    if (!file) return NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 });
    const ext = getExtension(file.name);
    if (BLOCKED_EXTENSIONS.has(ext)) return NextResponse.json({ error: 'نوع الملف غير مسموح' }, { status: 400 });

    if (ext !== 'pdf') return NextResponse.json({ error: 'مسموح فقط PDF' }, { status: 400 });

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) return NextResponse.json({ error: 'حجم الملف أكبر من 25MB' }, { status: 400 });

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'files', folder);
    await mkdir(uploadDir, { recursive: true });

    const safeBase = file.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF.-]/g, '_');
    const fileName = `${Date.now()}-${safeBase}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/uploads/files/${folder}/${fileName}`;
    return NextResponse.json({ success: true, fileUrl: url, fileName: file.name });
  } catch (error) {
    console.error('files upload error', error);
    return NextResponse.json({ error: 'خطأ أثناء رفع الملف' }, { status: 500 });
  }
}
