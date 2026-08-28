import fs from 'fs/promises';
import path from 'path';

export async function generateStaticParams() {
  // optional: list pages for SSG
  const dir = path.join(process.cwd(), 'src', 'data', 'pages');
  try {
    const files = await fs.readdir(dir);
    return files.filter(f => f.endsWith('.json')).map(f => ({ slug: f.replace(/\.json$/, '') }));
  } catch (e) {
    return [];
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const file = path.join(process.cwd(), 'src', 'data', 'pages', `${slug}.json`);
  try {
    const raw = await fs.readFile(file, 'utf-8');
    const json = JSON.parse(raw);
    return (
      <div className="py-16 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none">
          <h1>{json.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: json.content || '' }} />
        </article>
      </div>
    );
  } catch (e) {
    return (
      <div className="py-16 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <p>الصفحة غير موجودة.</p>
      </div>
    );
  }
}
// (Prisma-backed page view removed to avoid duplicate exports.)
