import prisma from '@/lib/prisma';
import { DEFAULT_SETTINGS } from '@/lib/constants';
import FilesFilterClient from '@/components/files/FilesFilterClient';

export const revalidate = 0;

export const metadata = {
  title: 'الامتحانات السابقة | Moadla Pro',
  description: 'تصفح ملفات الامتحانات السابقة مع تقسيم حسب نوع المعادلة والمادة والسنة، مع إمكانية المعاينة مباشرة.',
};

export default async function FilesPage() {
  const settingsRecords = await prisma.siteSetting.findMany();
  const settingsMap: any = { ...DEFAULT_SETTINGS };

  for (const item of settingsRecords) {
    try {
      settingsMap[item.key] = JSON.parse(item.value);
    } catch {
      settingsMap[item.key] = item.value;
    }
  }

  const filesPageSettings = settingsMap.filesPage || DEFAULT_SETTINGS.filesPage;

  const files = await prisma.lessonFile.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      lesson: {
        include: {
          unit: {
            include: {
              subject: {
                include: { section: true },
              },
            },
          },
        },
      },
      subject: {
        include: { section: true },
      },
      unit: {
        include: {
          subject: {
            include: { section: true },
          },
        },
      },
    },
  });

  const rawSections = await prisma.section.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const rawSubjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return (
    <FilesFilterClient
      files={files as any}
      sections={rawSections as any}
      subjects={rawSubjects as any}
      settings={filesPageSettings}
    />
  );
}
