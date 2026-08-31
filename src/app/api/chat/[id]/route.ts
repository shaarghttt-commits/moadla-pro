import { NextRequest, NextResponse } from 'next/server';
import { getMessageById, updateMessage, deleteMessage } from '@/lib/chatStore';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request: NextRequest, context: any) {
  try {
    const params = await (context.params as any);
    const id = params.id;
    const body = await request.json();
    const user = await getCurrentUser();
    const msg = getMessageById(id);
    if (!msg) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    // only owner or admin can edit
    if (msg.userId && user?.id !== msg.userId && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const text = body.text ? String(body.text).trim() : '';
    if (!text) return NextResponse.json({ error: 'empty' }, { status: 400 });
    const updated = updateMessage(id, { text });
    return NextResponse.json({ message: updated });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const params = await (context.params as any);
    const id = params.id;
    const user = await getCurrentUser();
    const msg = getMessageById(id);
    if (!msg) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (msg.userId && user?.id !== msg.userId && user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const ok = deleteMessage(id);
    if (!ok) return NextResponse.json({ error: 'not_deleted' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
