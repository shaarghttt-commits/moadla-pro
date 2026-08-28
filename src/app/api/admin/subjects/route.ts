import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'subjects.json');

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const json = JSON.parse(raw);
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json({ sections: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
// Note: this route intentionally uses the local filesystem to store a simple
// JSON representation for the `/subjects` admin editor. Removed Prisma-based
// handlers to avoid duplicate exports in this environment.
