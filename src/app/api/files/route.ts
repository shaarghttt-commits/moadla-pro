import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const unitId = searchParams.get('unitId');
    const lessonId = searchParams.get('lessonId');

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (unitId) where.unitId = unitId;
    if (lessonId) where.lessonId = lessonId;

    const files = await prisma.lessonFile.findMany({
      where,
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
      },
      orderBy: { createdAt: 'desc' },
    });

      // If a unitId was requested, also include lessons that have a videoUrl
      // so that videos attached directly to lessons (lesson.videoUrl) are
      // visible to students in the public unit listing.
      let merged = files;
      if (unitId) {
        const lessonsWithVideo = await prisma.lesson.findMany({
          where: { unitId, videoUrl: { not: null } },
          select: { id: true, title: true, videoUrl: true },
        });

        const mapped = lessonsWithVideo.map((ls: any) => ({
          id: `lesson:${ls.id}`,
          title: ls.title,
          fileUrl: ls.videoUrl as string,
          fileType: 'video',
          fileSize: null,
        }));

        // Merge lesson videos with unit files and let the client dedupe by id/fileUrl
        merged = [...mapped, ...files];
      }

      return NextResponse.json({ files: merged });
  } catch (error) {
    console.error('Error fetching public files:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الملفات' }, { status: 500 });
  }
}
