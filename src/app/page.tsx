import prisma from '@/lib/prisma';

import HeroSection from '@/components/home/HeroSection';
import SuccessfulStudentsPanel from '@/components/home/SuccessfulStudentsPanel';
import SearchBar from '@/components/home/SearchBar';
import SectionsGrid from '@/components/home/SectionsGrid';
import FeaturesSection from '@/components/home/FeaturesSection';
import LatestContentSection from '@/components/home/LatestContentSection';
import CTASection from '@/components/home/CTASection';

import AdsterraAd from '@/components/ads/AdsterraAd';
import AdsterraAd2 from '@/components/ads/AdsterraAd2';
import AdsterraAd3 from '@/components/ads/AdsterraAd3';

import {
  SectionType,
  LessonType,
  ExamType,
} from '@/types';

import { DEFAULT_SETTINGS } from '@/lib/constants';

// Force dynamic so changes in Admin CMS reflect immediately on live site
export const revalidate = 0;

export default async function HomePage() {
  // =========================================================
  // SITE SETTINGS
  // =========================================================

  const settingsRecords = await prisma.siteSetting
    .findMany()
    .catch(() => []);

  const settingsMap: any = {
    ...DEFAULT_SETTINGS,
  };

  for (const item of settingsRecords) {
    try {
      settingsMap[item.key] = JSON.parse(item.value);
    } catch {
      settingsMap[item.key] = item.value;
    }
  }

  // =========================================================
  // SECTIONS
  // =========================================================

  const rawSections = await prisma.section.findMany({
    where: {
      isActive: true,
    },

    orderBy: {
      order: 'asc',
    },

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

  // =========================================================
  // LATEST LESSONS
  // =========================================================

  const rawLessons = await prisma.lesson.findMany({
    orderBy: {
      createdAt: 'desc',
    },

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

  // =========================================================
  // LATEST EXAMS
  // =========================================================

  const rawExams = await prisma.exam.findMany({
    where: {
      isPublished: true,
    },

    orderBy: {
      createdAt: 'desc',
    },

    take: 6,

    include: {
      subject: true,

      _count: {
        select: {
          questions: true,
        },
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

  // =========================================================
  // LATEST FILES
  // =========================================================

  const rawFiles = await prisma.lessonFile.findMany({
    orderBy: {
      createdAt: 'desc',
    },

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

  // =========================================================
  // SUCCESSFUL STUDENTS
  // =========================================================

  const successfulEngineeringStudents =
    await prisma.examAttempt.findMany({
      where: {
        isPassed: true,
      },

      include: {
        user: true,

        exam: {
          include: {
            section: true,
          },
        },
      },

      orderBy: {
        completedAt: 'desc',
      },

      take: 50,
    });

  const defaultSuccessfulStudents = Array.isArray(
    DEFAULT_SETTINGS.successful_students
  )
    ? DEFAULT_SETTINGS.successful_students
    : [];

  const customSuccessfulStudents = Array.isArray(
    settingsMap.successful_students
  )
    ? settingsMap.successful_students
    : defaultSuccessfulStudents;

  const studentProfiles = customSuccessfulStudents
    .map((student: any) => ({
      name: String(
        student?.name || 'طالب جديد'
      ),

      avatar:
        student?.avatar ||
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',

      year:
        Number(student?.year) || 2025,

      grades:
        Array.isArray(student?.grades) &&
        student.grades.length > 0
          ? student.grades.map((grade: any) => ({
              label: String(
                grade?.label || 'مادة'
              ),

              value:
                Number(grade?.value) || 0,
            }))
          : [
              {
                label: 'الإنجليزية',
                value: 88,
              },

              {
                label: 'الفيزياء',
                value: 90,
              },

              {
                label: 'الكيمياء',
                value: 86,
              },

              {
                label: 'رياضة 1',
                value: 94,
              },

              {
                label: 'رياضة 2',
                value: 92,
              },

              {
                label: 'الميكانيكا',
                value: 89,
              },
            ],
    }))

    .filter(
      (
        student: { name: string },
        index: number,
        arr: { name: string }[]
      ) =>
        arr.findIndex(
          (item) =>
            item.name === student.name
        ) === index
    )

    .slice(0, 8);

  // =========================================================
  // HOMEPAGE LAYOUT
  // =========================================================

  const defaultLayoutSections = [
    {
      id: 'hero',
      isVisible: true,
      order: 0,
    },

    // ADVERTISEMENT 1
    {
      id: 'adsterra',
      isVisible: true,
      order: 1,
    },

    {
      id: 'successfulStudents',
      isVisible: true,
      order: 2,
    },

    {
      id: 'search',
      isVisible: true,
      order: 3,
    },

    {
      id: 'sectionsGrid',
      isVisible: true,
      order: 4,
    },

    {
      id: 'features',
      isVisible: true,
      order: 5,
    },

    {
      id: 'latestContent',
      isVisible: true,
      order: 6,
    },

    // ADVERTISEMENT 2
    {
      id: 'adsterra2',
      isVisible: true,
      order: 7,
    },

    // ADVERTISEMENT 3
    {
      id: 'adsterra3',
      isVisible: true,
      order: 8,
    },

    {
      id: 'cta',
      isVisible: true,
      order: 9,
    },
  ];

  const homepageLayoutSections =
    Array.isArray(
      settingsMap.homepage_layout?.sections
    )
      ? settingsMap.homepage_layout.sections
      : defaultLayoutSections;

  // =========================================================
  // MERGE CMS SETTINGS WITH DEFAULT SECTIONS
  // =========================================================

  const mergedLayoutSections =
    defaultLayoutSections.map(
      (defaultSection) => {
        const saved =
          homepageLayoutSections.find(
            (section: any) =>
              section.id ===
              defaultSection.id
          );

        return saved
          ? {
              ...defaultSection,
              ...saved,
            }
          : defaultSection;
      }
    );

  const extraSections =
    homepageLayoutSections.filter(
      (section: any) =>
        !defaultLayoutSections.some(
          (defaultSection) =>
            defaultSection.id ===
            section.id
        )
    );

  const layoutSections = [
    ...mergedLayoutSections,
    ...extraSections,
  ];

  const sortedSections = [
    ...layoutSections,
  ].sort(
    (a: any, b: any) =>
      a.order - b.order
  );

  // =========================================================
  // RENDER HOMEPAGE SECTIONS
  // =========================================================

  const renderSection = (id: string) => {
    switch (id) {
      // -----------------------------------------------------
      // HERO
      // -----------------------------------------------------

      case 'hero':
        return (
          <HeroSection
            key="hero"
            heroData={
              settingsMap.hero
            }
            statsData={
              settingsMap.stats
            }
          />
        );

      // -----------------------------------------------------
      // ADVERTISEMENT 1
      // -----------------------------------------------------

      case 'adsterra':
        return (
          <AdsterraAd
            key="adsterra"
          />
        );

      // -----------------------------------------------------
      // SUCCESSFUL STUDENTS
      // -----------------------------------------------------

      case 'successfulStudents':
        return (
          <SuccessfulStudentsPanel
            key="successfulStudents"
            students={
              studentProfiles
            }
          />
        );

      // -----------------------------------------------------
      // SEARCH
      // -----------------------------------------------------

      case 'search':
        return (
          <SearchBar
            key="search"
          />
        );

      // -----------------------------------------------------
      // SECTIONS GRID
      // -----------------------------------------------------

      case 'sectionsGrid':
        return (
          <SectionsGrid
            key="sectionsGrid"
            sections={sections}
          />
        );

      // -----------------------------------------------------
      // FEATURES
      // -----------------------------------------------------

      case 'features':
        return (
          <FeaturesSection
            key="features"
            featuresData={
              settingsMap.features
            }
          />
        );

      // -----------------------------------------------------
      // LATEST CONTENT
      // -----------------------------------------------------

      case 'latestContent':
        return (
          <LatestContentSection
            key="latestContent"
            latestLessons={
              latestLessons
            }
            latestExams={
              latestExams
            }
            latestFiles={
              latestFiles
            }
          />
        );

      // -----------------------------------------------------
      // ADVERTISEMENT 2
      // -----------------------------------------------------

      case 'adsterra2':
        return (
          <AdsterraAd2
            key="adsterra2"
          />
        );

      // -----------------------------------------------------
      // ADVERTISEMENT 3
      // -----------------------------------------------------

      case 'adsterra3':
        return (
          <AdsterraAd3
            key="adsterra3"
          />
        );

      // -----------------------------------------------------
      // CTA
      // -----------------------------------------------------

      case 'cta':
        return (
          <CTASection
            key="cta"
            ctaData={
              settingsMap.cta
            }
          />
        );

      default:
        return null;
    }
  };

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="space-y-12">
      {sortedSections
        .filter(
          (sec: any) =>
            sec.isVisible !== false
        )
        .map(
          (sec: any) =>
            renderSection(sec.id)
        )}
    </div>
  );
}

