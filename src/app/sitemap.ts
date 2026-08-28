import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://moadla-pro-hr96.vercel.app';

  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/sections`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/subjects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/exams`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    const [sections, subjects, exams, lessons] = await Promise.all([
      prisma.section.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.subject.findMany({
        where: {
          isActive: true,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.exam.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      }),

      prisma.lesson.findMany({
        where: {
          isPublished: true,
        },
        select: {
          id: true,
          updatedAt: true,
        },
      }),
    ]);

    const sectionRoutes: MetadataRoute.Sitemap = sections.map((section) => ({
      url: `${baseUrl}/sections/${section.slug}`,
      lastModified: section.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const subjectRoutes: MetadataRoute.Sitemap = subjects.map((subject) => ({
      url: `${baseUrl}/subjects/${subject.slug}`,
      lastModified: subject.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const examRoutes: MetadataRoute.Sitemap = exams.map((exam) => ({
      url: `${baseUrl}/exams/${exam.id}`,
      lastModified: exam.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const lessonRoutes: MetadataRoute.Sitemap = lessons.map((lesson) => ({
      url: `${baseUrl}/lessons/${lesson.id}`,
      lastModified: lesson.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [
      ...staticRoutes,
      ...sectionRoutes,
      ...subjectRoutes,
      ...examRoutes,
      ...lessonRoutes,
    ];
  } catch (error) {
    console.error('Sitemap generation error:', error);

    return staticRoutes;
  }
}