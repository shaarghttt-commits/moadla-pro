import { NextResponse } from 'next/server';
import { touchUser, getAllPresence } from '@/lib/presenceStore';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const list = getAllPresence();
    return NextResponse.json({ users: list });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => ({}));
    const id = user?.id ?? body.id ?? null;
    const name = user?.name ?? body.name ?? null;
    const list = touchUser(id, name);
    return NextResponse.json({ users: list });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
