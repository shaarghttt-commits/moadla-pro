import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://moadla-pro-hr96.vercel.app';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/subjects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/exams`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const [sections, subjects, exams] = await Promise.all([
      prisma.section.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.subject.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      prisma.exam.findMany({
        where: { isPublished: true },
        select: { id: true, updatedAt: true },
      }),
    ]);

    const sectionRoutes = sections.map((s) => ({
      url: `${baseUrl}/sections/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const subjectRoutes = subjects.map((s) => ({
      url: `${baseUrl}/subjects/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const examRoutes = exams.map((e) => ({
      url: `${baseUrl}/exams/${e.id}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [
      ...staticRoutes,
      ...sectionRoutes,
      ...subjectRoutes,
      ...examRoutes,
    ];
  } catch {
    return staticRoutes;
  }
}