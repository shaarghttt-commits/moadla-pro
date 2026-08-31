import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PAGES_DIR = path.join(process.cwd(), 'src', 'data', 'pages');

export async function GET() {
  try {
    await fs.mkdir(PAGES_DIR, { recursive: true });
    const files = await fs.readdir(PAGES_DIR);
    const pages = await Promise.all(
      files.filter((f: any) => f.endsWith('.json')).map(async (f: any) => {
        const raw = await fs.readFile(path.join(PAGES_DIR, f), 'utf-8');
        const json = JSON.parse(raw);
        return { slug: f.replace(/\.json$/, ''), title: json.title || '', updatedAt: (await fs.stat(path.join(PAGES_DIR, f))).mtime.getTime() };
      })
    );
    return NextResponse.json({ pages });
  } catch (err) {
    return NextResponse.json({ pages: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, title, content } = body;
    if (!slug) return NextResponse.json({ ok: false, error: 'missing slug' }, { status: 400 });
    await fs.mkdir(PAGES_DIR, { recursive: true });
    const file = path.join(PAGES_DIR, `${slug}.json`);
    await fs.writeFile(file, JSON.stringify({ title: title || '', content: content || '' }, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    if (!slug) return NextResponse.json({ ok: false, error: 'missing' }, { status: 400 });
    const file = path.join(PAGES_DIR, `${slug}.json`);
    await fs.unlink(file);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
// End of filesystem-based pages API
