import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { prisma } from '@/lib/prisma';

export type ImportItemType = 'page' | 'pdf' | 'image' | 'link';

export interface ImportedItem {
  id: string;
  type: ImportItemType;
  title: string;
  description: string;
  url: string;
  sourceUrl: string;
  canonicalUrl?: string;
  content?: string;
  selected?: boolean;
}

export interface ImportPreview {
  sourceUrl: string;
  sourceWebsite: string;
  canonicalUrl?: string;
  title: string;
  description: string;
  keywords: string[];
  pagesAnalyzed: number;
  pdfCount: number;
  imageCount: number;
  lessonCount: number;
  totalItems: number;
  pages: ImportedItem[];
  files: ImportedItem[];
  images: ImportedItem[];
  warnings: string[];
  errors: string[];
  content?: string;
}

const DEFAULT_MAX_PAGES = 10;
const MAX_HTML_BYTES = 500 * 1024;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'imported-content';
}

function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return false;

  if (ip.startsWith('10.') || ip.startsWith('127.') || ip.startsWith('169.254.') || ip.startsWith('0.') || ip === '::1') {
    return true;
  }

  if (ip.startsWith('192.168.')) return true;

  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      const second = Number(parts[1]);
      if (!Number.isNaN(second) && second >= 16 && second <= 31) {
        return true;
      }
    }
  }

  return false;
}

function truncate(value: string, max = 220) {
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

function cleanText(value: string | null | undefined) {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelyPdf(url: string) {
  return /\.(pdf)(\?.*)?$/i.test(url) || /pdf/i.test(url);
}

function isLikelyImage(url: string) {
  return /\.(png|jpg|jpeg|webp|gif|svg|avif)(\?.*)?$/i.test(url);
}

function hashContent(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 24);
}

function sameDomain(a: string, b: string) {
  try {
    return new URL(a).hostname === new URL(b).hostname;
  } catch {
    return false;
  }
}

export async function validateImportUrl(rawUrl: string) {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    throw new Error('يرجى إدخال رابط صحيح');
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('الرابط غير صحيح');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('يسمح فقط بـ http و https');
  }

  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) {
    throw new Error('لا يسمح بالرابط المحلي أو localhost');
  }

  const blockedPatterns = [
    '127.0.0.1',
    'localhost',
    '::1',
    '.local',
    '10.',
    '192.168.',
    '172.16.',
    '172.17.',
    '172.18.',
    '172.19.',
    '172.20.',
    '172.21.',
    '172.22.',
    '172.23.',
    '172.24.',
    '172.25.',
    '172.26.',
    '172.27.',
    '172.28.',
    '172.29.',
    '172.30.',
    '172.31.',
    '169.254.',
    '0.0.0.0',
  ];

  if (blockedPatterns.some((pattern) => host.includes(pattern))) {
    throw new Error('تم حظر هذا الرابط بسبب سياسة الأمان');
  }

  const ipResult = await dns.lookup(host).catch(() => null);
  const ip = ipResult?.address || null;
  if (ip && isPrivateOrLocalIp(ip)) {
    throw new Error('تم حظر عنوان IP خاص أو داخلي');
  }

  if (['/metadata', '/wp-json', '/api/metadata', '/.well-known'].some((segment) => parsed.pathname.includes(segment))) {
    throw new Error('تم حظر روابط metadata والواجهات الداخلية');
  }

  return parsed;
}

function dedupeLinks(items: ImportedItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractMeta(html: string, name: string) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`, 'i');
  const match = html.match(pattern);
  return match ? cleanText(match[1] || match[2]) : '';
}

function extractLinks(html: string, baseUrl: string) {
  const pattern = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  const results: { href: string; text: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const href = (match[1] || '').trim();
    const text = cleanText(match[2] || '');
    if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    let fullUrl = href;
    try {
      fullUrl = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }
    results.push({ href: fullUrl, text });
  }

  return results;
}

function extractImages(html: string, baseUrl: string) {
  const pattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const results: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html)) !== null) {
    const src = (match[1] || '').trim();
    if (!src || src.startsWith('data:')) continue;

    try {
      results.push(new URL(src, baseUrl).toString());
    } catch {
      // ignore invalid images
    }
  }

  return [...new Set(results)];
}

function extractCanonical(html: string, baseUrl: string) {
  const canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i.exec(html);
  if (canonical?.[1]) {
    try {
      return new URL(canonical[1], baseUrl).toString();
    } catch {
      return canonical[1];
    }
  }
  return undefined;
}

function parseHtmlPage(html: string, sourceUrl: string) {
  const title = cleanText((/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || extractMeta(html, 'og:title') || 'محتوى مستورد');
  const description = cleanText(extractMeta(html, 'description') || extractMeta(html, 'og:description') || '');
  const keywords = (extractMeta(html, 'keywords') || '')
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 10);

  const headings = [...html.matchAll(/<(h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((entry) => cleanText(entry[2]))
    .filter(Boolean)
    .slice(0, 10);

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((entry) => cleanText(entry[1]))
    .filter((paragraph) => paragraph.length > 20)
    .slice(0, 20);

  const links = extractLinks(html, sourceUrl).filter((link) => {
    const target = link.href;
    const isExternal = !sameDomain(target, sourceUrl);
    const isHashOnly = target.startsWith('#');
    const isBad = target.includes('javascript:') || target.includes('mailto:') || target.includes('tel:');
    return !isHashOnly && !isBad && (isExternal || sameDomain(target, sourceUrl));
  });

  const pdfLinks = dedupeLinks(
    links
      .filter((link) => isLikelyPdf(link.href) || /pdf/i.test(link.text))
      .map((link) => ({
        id: `pdf-${hashContent(link.href)}`,
        type: 'pdf' as const,
        title: cleanText(link.text) || 'ملف PDF مستورد',
        description: 'ملف PDF تم اكتشافه من الموقع الخارجي.',
        url: link.href,
        sourceUrl: sourceUrl,
        canonicalUrl: extractCanonical(html, sourceUrl),
        selected: true,
      }))
  );

  const imageLinks = extractImages(html, sourceUrl)
    .filter((image) => !image.includes('data:'))
    .slice(0, 20)
    .map((image) => ({
      id: `img-${hashContent(image)}`,
      type: 'image' as const,
      title: 'صورة مستوردة',
      description: 'صورة تم اكتشافها من الموقع المصدر.',
      url: image,
      sourceUrl: sourceUrl,
      canonicalUrl: extractCanonical(html, sourceUrl),
      selected: true,
    }));

  const content = [...headings, ...paragraphs].join('\n\n');
  const previewPage: ImportedItem = {
    id: `page-${hashContent(sourceUrl)}`,
    type: 'page',
    title: title || 'صفحة مستوردة',
    description: description || (paragraphs[0] ? truncate(paragraphs[0], 220) : 'محتوى مستورد من موقع خارجي.'),
    url: sourceUrl,
    sourceUrl,
    canonicalUrl: extractCanonical(html, sourceUrl),
    content: content || paragraphs.join('\n\n'),
    selected: true,
  };

  return {
    title,
    description,
    keywords,
    canonicalUrl: extractCanonical(html, sourceUrl),
    page: previewPage,
    pdfLinks,
    imageLinks,
    links,
    headings,
    paragraphs,
    content,
  };
}

async function fetchHtml(url: URL) {
  const response = await fetch(url.toString(), {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MoadlaImportBot/1.0; +https://moadla.com)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`تعذر جلب الصفحة: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    throw new Error('الرابط لا يحتوي على محتوى HTML قابل للتحليل');
  }

  const html = await response.text();
  if (Buffer.byteLength(html) > MAX_HTML_BYTES) {
    throw new Error('حجم المحتوى أكبر من الحد المسموح');
  }

  return html;
}

export async function analyzeExternalImportUrl(rawUrl: string): Promise<ImportPreview> {
  const parsedUrl = await validateImportUrl(rawUrl);
  const queue: string[] = [parsedUrl.toString()];
  const visited = new Set<string>();
  const pageItems: ImportedItem[] = [];
  const fileItems: ImportedItem[] = [];
  const imageItems: ImportedItem[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  while (queue.length > 0 && pageItems.length + fileItems.length + imageItems.length < 200) {
    const currentUrl = queue.shift();
    if (!currentUrl || visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      const html = await fetchHtml(new URL(currentUrl));
      const parsed = parseHtmlPage(html, currentUrl);

      pageItems.push(parsed.page);
      fileItems.push(...parsed.pdfLinks);
      imageItems.push(...parsed.imageLinks);

      const relatedLinks = parsed.links
        .map((link) => link.href)
        .filter((href) => !href.includes('#'))
        .filter((href) => href.startsWith('http'))
        .filter((href) => sameDomain(href, parsedUrl.origin))
        .filter((href) => !visited.has(href));

      for (const item of relatedLinks.slice(0, 10)) {
        if (queue.length < DEFAULT_MAX_PAGES) {
          queue.push(item);
        }
      }
    } catch (error: any) {
      errors.push(error?.message || 'تعذر قراءة الرابط');
    }
  }

  const uniquePages = dedupeLinks(pageItems);
  const uniqueFiles = dedupeLinks(fileItems);
  const uniqueImages = dedupeLinks(imageItems);
  const firstPage = uniquePages[0] || {
    id: `page-${hashContent(parsedUrl.toString())}`,
    type: 'page' as const,
    title: 'استيراد محتوى جديد',
    description: 'تم تحليل الموقع بنجاح، ولكن لم يتم العثور على نصوص كافية في الصفحة الحالية.',
    url: parsedUrl.toString(),
    sourceUrl: parsedUrl.toString(),
    selected: true,
  };

  const summary: ImportPreview = {
    sourceUrl: parsedUrl.toString(),
    sourceWebsite: parsedUrl.origin,
    canonicalUrl: firstPage.canonicalUrl,
    title: firstPage.title,
    description: firstPage.description,
    keywords: [],
    pagesAnalyzed: uniquePages.length,
    pdfCount: uniqueFiles.length,
    imageCount: uniqueImages.length,
    lessonCount: Math.max(0, uniquePages.length - 1),
    totalItems: uniquePages.length + uniqueFiles.length + uniqueImages.length,
    pages: uniquePages,
    files: uniqueFiles,
    images: uniqueImages,
    warnings,
    errors,
    content: firstPage.content || firstPage.description,
  };

  if (!summary.pages.length && !summary.files.length && !summary.images.length) {
    warnings.push('تم العثور على رابط صحيح، لكن الموقع لا يحتوي على عناصر نصية أو ملفات قابلة للاستيراد بشكل مباشر.');
  }

  return summary;
}

export async function persistImportedContent(preview: ImportPreview, selectedIds: string[] = []) {
  const selectedSet = new Set(selectedIds.length ? selectedIds : preview.pages.map((page) => page.id).concat(preview.files.map((file) => file.id), preview.images.map((image) => image.id)));
  const saved: { pages: string[]; files: string[]; images: string[] } = { pages: [], files: [], images: [] };

  const existingPage = await prisma.customPage.findFirst({
    where: {
      OR: [
        { sourceUrl: preview.sourceUrl },
        { canonicalUrl: preview.canonicalUrl || undefined },
      ],
    },
  });

  if (existingPage) {
    return { saved, skipped: true, message: 'تم اكتشاف محتوى مماثل مسبقًا، ولم يتم تكرار الاستيراد.' };
  }

  for (const page of preview.pages) {
    if (!selectedSet.has(page.id)) continue;
    const slug = slugify(page.title || preview.sourceWebsite);
    const existing = await prisma.customPage.findFirst({
      where: {
        OR: [
          { slug },
          { sourceUrl: page.sourceUrl },
          { canonicalUrl: page.canonicalUrl || undefined },
        ],
      },
    });
    if (existing) continue;

    const created = await prisma.customPage.create({
      data: {
        title: page.title || 'صفحة مستوردة',
        slug,
        description: page.description || preview.description || 'محتوى مستورد من مصدر خارجي',
        contentMarkdown: page.content || preview.content || '',
        sourceUrl: page.sourceUrl,
        sourceWebsite: preview.sourceWebsite,
        canonicalUrl: page.canonicalUrl || preview.canonicalUrl || null,
        importedAt: new Date(),
        isPublished: true,
      },
    });

    saved.pages.push(created.id);
  }

  for (const file of preview.files) {
    if (!selectedSet.has(file.id)) continue;
    const existing = await prisma.lessonFile.findFirst({
      where: {
        OR: [
          { sourceUrl: file.sourceUrl },
          { fileUrl: file.url },
          { canonicalUrl: file.canonicalUrl || undefined },
        ],
      },
    });
    if (existing) continue;

    const created = await prisma.lessonFile.create({
      data: {
        title: file.title || 'ملف مستورد',
        fileUrl: file.url,
        fileType: 'pdf',
        sourceUrl: file.sourceUrl,
        sourceWebsite: preview.sourceWebsite,
        canonicalUrl: file.canonicalUrl || preview.canonicalUrl || null,
        importedAt: new Date(),
      },
    });

    saved.files.push(created.id);
  }

  for (const image of preview.images) {
    if (!selectedSet.has(image.id)) continue;
    const existing = await prisma.mediaItem.findFirst({
      where: {
        OR: [
          { sourceUrl: image.sourceUrl },
          { url: image.url },
          { canonicalUrl: image.canonicalUrl || undefined },
        ],
      },
    });
    if (existing) continue;

    const created = await prisma.mediaItem.create({
      data: {
        name: image.title || 'صورة مستوردة',
        url: image.url,
        type: 'image',
        sourceUrl: image.sourceUrl,
        sourceWebsite: preview.sourceWebsite,
        canonicalUrl: image.canonicalUrl || preview.canonicalUrl || null,
        importedAt: new Date(),
      },
    });

    saved.images.push(created.id);
  }

  return { saved, skipped: false };
}

export async function ensureImportedMediaDownloads(preview: ImportPreview) {
  try {
    const rootDir = path.join(process.cwd(), 'public', 'uploads', 'imported');
    await fs.mkdir(rootDir, { recursive: true });

    for (const file of preview.files.slice(0, 5)) {
      if (!file.url) continue;
      const targetName = `${hashContent(file.url)}.pdf`;
      const targetPath = path.join(rootDir, targetName);
      try {
        const response = await fetch(file.url, { signal: AbortSignal.timeout(10000) });
        if (!response.ok || !response.headers.get('content-type')?.includes('pdf')) continue;
        const bytes = Buffer.from(await response.arrayBuffer());
        await fs.writeFile(targetPath, bytes);
      } catch {
        // ignore optional downloads
      }
    }
  } catch {
    // ignore filesystem issues on serverless environments
  }
}
