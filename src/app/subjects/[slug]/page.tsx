import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SubjectDetailClient from '@/components/subjects/SubjectDetailClient';
import { getCurrentUser } from '@/lib/auth';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

const fallbackSubjects: Record<string, { title: string; desc: string }> = {
  mechanics: {
    title: 'الميكانيكا (استاتيكا وديناميكا)',
    desc: 'شرح كامل للاستاتيكا والديناميكا، بنك أسئلة MCQ، وامتحانات الأعوام السابقة مع الحلول.',
  },
  english: {
    title: 'اللغة الإنجليزية',
    desc: 'شرح شامل لقواعد اللغة الإنجليزية والأزمنة وملازم الكلمات والترجمة وامتحانات الأعوام السابقة.',
  },
  physics: {
    title: 'الفيزياء الحديثة والكهربية',
    desc: 'شرح منهج الفيزياء الكهربية والمغناطيسية والفيزياء الحديثة مع نماذج الامتحانات.',
  },
  chemistry: {
    title: 'الكيمياء العامة والعضوية',
    desc: 'شرح العناصر الانتقالية والاتزان والأحماض والقواعد والكيمياء العضوية.',
  },
  calculus: {
    title: 'التفاضل والتكامل',
    desc: 'شرح اشتقاق وتكامل الدوال المثلثية والأسية واللوغاريتمية وتطبيقات القيم العظمى والمساحات.',
  },
  'algebra-and-geometry': {
    title: 'الجبر والهندسة الفراغية',
    desc: 'التباديل والتوافيق، نظرية ذات الحدين، الأعداد المركبة، والمحددات والمصفوفات والهندسة الفراغية.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const subject = await prisma.subject.findUnique({
      where: { slug },
    });

    const title = subject?.title || fallbackSubjects[slug]?.title || slug;
    const description = subject?.description || fallbackSubjects[slug]?.desc || 'تفاصيل المادة';

    return {
      title: `${title} | Moadla Pro`,
      description,
    };
  } catch (error) {
    const title = fallbackSubjects[slug]?.title || slug;
    const description = fallbackSubjects[slug]?.desc || 'تفاصيل المادة';
    return {
      title: `${title} | Moadla Pro`,
      description,
    };
  }
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let subject: any = null;
  let units: any[] = [];
  let exams: any[] = [];
  let completedLessonIds: string[] = [];
  let isFavorite = false;
  let user: any = null;

  try {
    user = await getCurrentUser();
  } catch (e) {
    console.error('Error fetching current user:', e);
  }

  try {
    subject = await prisma.subject.findUnique({
      where: { slug },
      include: {
        section: true,
      },
    });

    if (subject) {
      units = await prisma.unit.findMany({
        where: { subjectId: subject.id },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { files: true },
          },
        },
      });

      exams = await prisma.exam.findMany({
        where: { subjectId: subject.id },
        orderBy: { year: 'desc' },
      });

      if (user) {
        const [progress, fav] = await Promise.all([
          prisma.lessonProgress.findMany({
            where: {
              userId: user.id,
              isCompleted: true,
              lesson: { unit: { subjectId: subject.id } },
            },
            select: { lessonId: true },
          }),
          prisma.favorite.findUnique({
            where: {
              userId_targetType_targetId: {
                userId: user.id,
                targetType: 'SUBJECT',
                targetId: subject.id,
              },
            },
          }),
        ]);
        completedLessonIds = progress.map((p) => p.lessonId);
        isFavorite = !!fav;
      }
    }
  } catch (err) {
    console.error('Database connection error in SubjectDetailPage, using fallback:', err);
  }

  if (!subject) {
    if (fallbackSubjects[slug]) {
      subject = {
        id: slug,
        slug,
        title: fallbackSubjects[slug].title,
        description: fallbackSubjects[slug].desc,
        section: { title: 'معادلة كلية الهندسة' },
      };
    } else {
      notFound();
    }
  }

  const totalLessonsCount = units.reduce((s: number, u: any) => s + (u.lessons?.length || 0), 0);

  return (
    <SubjectDetailClient
      subject={subject as any}
      units={units as any}
      exams={exams as any}
      initialIsFavorite={isFavorite}
      completedLessonIds={completedLessonIds}
      totalLessonsCount={totalLessonsCount}
    />
  );
}
