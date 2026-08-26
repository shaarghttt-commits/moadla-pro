import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BlockRenderer from '@/components/common/BlockRenderer';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.customPage.findUnique({ where: { slug } });

  if (!page) {
    return { title: 'الصفحة غير موجودة | Moadla Pro' };
  }

  return {
    title: page.seoTitle || `${page.title} | Moadla Pro`,
    description: page.seoDescription || page.description || undefined,
    keywords: page.seoKeywords || undefined,
    openGraph: page.coverImage ? { images: [page.coverImage] } : undefined,
  };
}

export default async function CustomPageView({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === 'true';

  const page = await prisma.customPage.findUnique({
    where: { slug },
  });

  if (!page) {
    notFound();
  }

  if (!page.isPublished && !isPreview) {
    notFound();
  }

  let blocks = [];
  if (page.blocksJson) {
    try {
      blocks = JSON.parse(page.blocksJson);
    } catch {
      blocks = [];
    }
  }

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Draft Banner if previewing */}
      {!page.isPublished && isPreview && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-2xl text-center">
          ⚠️ هذه الصفحة في وضع المسودة (Draft Preview) ولا تظهر للزوار العاديين حتى يتم نشرها.
        </div>
      )}

      {/* Page Header (if no hero block or default header) */}
      {(!blocks.length || blocks[0]?.type !== 'hero') && (
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {page.description}
            </p>
          )}
          {page.coverImage && (
            <div className="pt-4 rounded-3xl overflow-hidden shadow-lg max-w-4xl mx-auto">
              <img src={page.coverImage} alt={page.title} className="w-full max-h-96 object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Render Blocks from Page Builder */}
      {blocks.length > 0 && <BlockRenderer blocks={blocks} />}

      {/* Render Markdown content if exists */}
      {page.contentMarkdown && (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line text-sm sm:text-base">
          {page.contentMarkdown}
        </div>
      )}
    </div>
  );
}
