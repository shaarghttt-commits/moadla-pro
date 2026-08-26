import prisma from '@/lib/prisma';
import HeroSection from '@/components/home/HeroSection';
import SearchBar from '@/components/home/SearchBar';
import SectionsGrid from '@/components/home/SectionsGrid';
import FeaturesSection from '@/components/home/FeaturesSection';
import LatestContentSection from '@/components/home/LatestContentSection';
import CTASection from '@/components/home/CTASection';
import { SectionType, LessonType, ExamType, LessonFileType } from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

// Force dynamic so changes in Admin CMS reflect immediately on live site
export const revalidate = 0;

export default async function HomePage() {
  // Fetch Site Settings from DB
  const settingsRecords = await prisma.siteSetting.findMany().catch(() => []);
  const settingsMap: any = { ...DEFAULT_SETTINGS };

  for (const item of settingsRecords) {
    try {
      settingsMap[item.key] = JSON.parse(item.value);
    } catch {
      settingsMap[item.key] = item.value;
    }
  }

  // Fetch Sections with subjects and exams count
  const rawSections = await prisma.section.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          subjects: true,
          exams: true,
        },
      },
    },
  });

  const sections: SectionType[] = rawSections.map((sec) => ({
    id: sec.id,
    title: sec.title,
    slug: sec.slug,
    description: sec.description,
    icon: sec.icon,
    color: sec.color,
    order: sec.order,
    isActive: sec.isActive,
    subjectsCount: sec._count.subjects,
    examsCount: sec._count.exams,
  }));

  // Fetch latest lessons
  const rawLessons = await prisma.lesson.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      unit: {
        include: {
          subject: true,
        },
      },
    },
  });

  const latestLessons: LessonType[] = rawLessons.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    description: l.description,
    durationMinutes: l.durationMinutes,
    order: l.order,
    isFree: l.isFree,
    unitId: l.unitId,
    unit: l.unit
      ? {
          id: l.unit.id,
          title: l.unit.title,
          order: l.unit.order,
          subjectId: l.unit.subjectId,
        }
      : undefined,
  }));

  // Fetch latest exams
  const rawExams = await prisma.exam.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      subject: true,
      _count: {
        select: { questions: true },
      },
    },
  });

  const latestExams: ExamType[] = rawExams.map((e) => ({
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    subjectId: e.subjectId,
    sectionId: e.sectionId,
    year: e.year,
    durationMinutes: e.durationMinutes,
    totalMarks: e.totalMarks,
    passMarks: e.passMarks,
    isPublished: e.isPublished,
    questionsCount: e._count.questions,
    subject: e.subject
      ? {
          id: e.subject.id,
          title: e.subject.title,
          slug: e.subject.slug,
          description: e.subject.description,
          sectionId: e.subject.sectionId,
          order: e.subject.order,
          isActive: e.subject.isActive,
        }
      : null,
  }));

  // Fetch latest files
  const rawFiles = await prisma.lessonFile.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      lesson: true,
    },
  });

  const latestFiles = rawFiles.map((f) => ({
    id: f.id,
    title: f.title,
    fileUrl: f.fileUrl,
    fileType: f.fileType,
    fileSize: f.fileSize,
    lessonId: f.lessonId || '',
    lesson: f.lesson
      ? {
          id: f.lesson.id,
          title: f.lesson.title,
          slug: f.lesson.slug,
          durationMinutes: f.lesson.durationMinutes,
          order: f.lesson.order,
          isFree: f.lesson.isFree,
          unitId: f.lesson.unitId,
        }
      : undefined,
  }));

  // Dynamic Layout Sections
  const layoutSections = settingsMap.homepage_layout?.sections || [
    { id: 'hero', isVisible: true, order: 0 },
    { id: 'search', isVisible: true, order: 1 },
    { id: 'sectionsGrid', isVisible: true, order: 2 },
    { id: 'features', isVisible: true, order: 3 },
    { id: 'latestContent', isVisible: true, order: 4 },
    { id: 'cta', isVisible: true, order: 5 },
  ];

  const sortedSections = [...layoutSections].sort((a: any, b: any) => a.order - b.order);

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return <HeroSection key="hero" heroData={settingsMap.hero} statsData={settingsMap.stats} />;
      case 'search':
        return <SearchBar key="search" />;
      case 'sectionsGrid':
        return <SectionsGrid key="sectionsGrid" sections={sections} />;
      case 'features':
        return <FeaturesSection key="features" featuresData={settingsMap.features} />;
      case 'latestContent':
        return (
          <LatestContentSection
            key="latestContent"
            latestLessons={latestLessons}
            latestExams={latestExams}
            latestFiles={latestFiles}
          />
        );
      case 'cta':
        return <CTASection key="cta" ctaData={settingsMap.cta} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-12">
      {sortedSections
        .filter((sec: any) => sec.isVisible !== false)
        .map((sec: any) => renderSection(sec.id))}
    </div>
  );
}
