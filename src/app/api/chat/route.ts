import { NextResponse } from 'next/server';
import { addMessage, getMessages, getAllMessages } from '@/lib/chatStore';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const since = url.searchParams.get('since') || undefined;
    const msgs = getMessages(since);
    return NextResponse.json({ messages: msgs });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await getCurrentUser();
    const text = body.text ? String(body.text).trim() : '';
    const hasAttachment = body.fileUrl || body.mediaId;
    if (!text && !hasAttachment) return NextResponse.json({ error: 'empty' }, { status: 400 });

    const msgData: any = {
      userId: user?.id ?? null,
      name: user?.name ?? null,
    };
    if (text) msgData.text = text;
    if (body.fileUrl) msgData.fileUrl = String(body.fileUrl);
    if (body.fileName) msgData.fileName = String(body.fileName);
    if (body.fileType) msgData.fileType = body.fileType;
    if (body.mediaId) msgData.mediaId = String(body.mediaId);
    if (body.mimeType) msgData.mimeType = String(body.mimeType);
    if (body.fileSize) msgData.fileSize = String(body.fileSize);

    const created = addMessage(msgData);
    return NextResponse.json({ message: created });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
