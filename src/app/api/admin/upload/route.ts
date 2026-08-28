import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function POST(req: Request) {
  try {
    const { filename, data } = await req.json();
    if (!filename || !data) return NextResponse.json({ ok: false, error: 'missing' }, { status: 400 });

    const match = data.match(/^data:(.+);base64,(.*)$/);
    if (!match) return NextResponse.json({ ok: false, error: 'invalid data' }, { status: 400 });
    const mime = match[1];
    const b64 = match[2];
    const buf = Buffer.from(b64, 'base64');

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const outPath = path.join(UPLOAD_DIR, safeName);
    await fs.writeFile(outPath, buf);

    return NextResponse.json({ ok: true, url: `/uploads/${safeName}`, mime });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
