import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_FILE_SIZE = 25 * 1024 * 1024;

function getExtension(name: string) {
  return name.split('.').pop()?.toLowerCase() || '';
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** idx).toFixed(1)} ${units[idx]}`;
}

const BLOCKED_EXTENSIONS = new Set(['exe', 'bat', 'cmd', 'scr', 'ps1', 'js', 'jar', 'msi', 'dll', 'com']);
const SAFE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const SAFE_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'txt'];

async function saveUploadedFile(file: File, kind: 'image' | 'file') {
  const ext = getExtension(file.name);
  const mime = file.type || 'application/octet-stream';

  if (BLOCKED_EXTENSIONS.has(ext)) {
    throw new Error('نوع الملف غير مسموح به لأسباب أمنية');
  }

  const isImage = kind === 'image' || SAFE_IMAGE_EXTENSIONS.includes(ext) || mime.startsWith('image/');
  const isAllowedFile = SAFE_FILE_EXTENSIONS.includes(ext) || mime.includes('pdf') || mime.includes('document') || mime.includes('sheet') || mime.includes('text') || mime.includes('zip');

  if (!isImage && !isAllowedFile) {
    throw new Error('نوع الملف غير مدعوم');
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    throw new Error(`حجم الملف يتجاوز الحد المسموح (${isImage ? '8MB' : '25MB'})`);
  }

  const subfolder = isImage ? 'images' : 'files';
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'social', subfolder);
  await mkdir(uploadDir, { recursive: true });

  const safeBase = file.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF.-]/g, '_');
  const fileName = `${Date.now()}-${safeBase}`;
  const filePath = path.join(uploadDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return {
    fileUrl: `/uploads/social/${subfolder}/${fileName}`,
    fileName: file.name,
    mimeType: mime,
    fileType: isImage ? 'image' : 'file',
    fileSize: formatBytes(file.size),
  };
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await req.formData();
    const conversationId = String(formData.get('conversationId') || '');
    const typeRaw = String(formData.get('type') || 'TEXT');
    const body = String(formData.get('body') || '').trim();
    const file = formData.get('file') as File | null;

    if (!conversationId) {
      return NextResponse.json({ error: 'معرف المحادثة مفقود' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { participants: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'المحادثة غير موجودة' }, { status: 404 });
    }

    const isParticipant = conversation.participants.some((participant: any) => participant.userId === currentUser.id);
    if (!isParticipant) {
      return NextResponse.json({ error: 'غير مسموح لك بإرسال رسالة في هذه المحادثة' }, { status: 403 });
    }

    const messageType = file
      ? (file.type.startsWith('image/') || typeRaw === 'IMAGE' ? 'IMAGE' : 'FILE')
      : typeRaw === 'LINK' || /^https?:\/\//i.test(body)
        ? 'LINK'
        : 'TEXT';

    const bodyText = messageType === 'LINK' ? (body || 'رابط') : body;
    if (!file && !bodyText) {
      return NextResponse.json({ error: 'لا توجد نصوص أو مرفقات لإرسالها' }, { status: 400 });
    }

    let attachmentPayload: any = undefined;
    if (file) {
      const uploaded = await saveUploadedFile(file, messageType === 'IMAGE' ? 'image' : 'file');
      attachmentPayload = {
        create: [{
          fileName: uploaded.fileName,
          fileUrl: uploaded.fileUrl,
          mimeType: uploaded.mimeType,
          fileType: uploaded.fileType,
          fileSize: uploaded.fileSize,
          uploaderId: currentUser.id,
        }],
      };
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: currentUser.id,
        type: messageType,
        body: bodyText || null,
        attachments: attachmentPayload,
      },
      include: {
        sender: true,
        attachments: true,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: currentUser.id },
      },
      data: {
        unreadCount: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Send social message error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'حدث خطأ أثناء إرسال الرسالة' }, { status: 500 });
  }
}
