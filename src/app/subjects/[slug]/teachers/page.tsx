import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SubjectTeachersClient from '@/components/subjects/SubjectTeachersClient';
import {
  physicsCourses,
  chemistryCourses,
  englishCourses,
  mechanicsCourses,
  algebraCourses,
  calculusCourses,
  geographyCourses,
  frenchCourses,
  commerceMathCourses,
} from '@/data/teacherCourses';

export const revalidate = 0;

interface SubjectTeachersPageProps {
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

export async function generateMetadata({ params }: SubjectTeachersPageProps) {
  const { slug } = await params;
  try {
    const subject = await prisma.subject.findUnique({
      where: { slug },
    });

    const title = subject?.title || fallbackSubjects[slug]?.title || slug;
    return {
      title: `مدرسو وقنوات ${title} اونلاين لمعادلة كلية الهندسة | Moadla Pro`,
      description: `دليل أفضل مدرسي وقنوات ${title} مع كورسات فيديو مدمجة بنظام السينما.`,
    };
  } catch (error) {
    const title = fallbackSubjects[slug]?.title || slug;
    return {
      title: `مدرسو وقنوات ${title} اونلاين لمعادلة كلية الهندسة | Moadla Pro`,
      description: `دليل أفضل مدرسي وقنوات ${title} مع كورسات فيديو مدمجة بنظام السينما.`,
    };
  }
}

export default async function SubjectTeachersPage({ params }: SubjectTeachersPageProps) {
  const { slug } = await params;

  let subject: any = null;
  try {
    subject = await prisma.subject.findUnique({
      where: { slug },
      include: {
        section: true,
      },
    });
  } catch (err) {
    console.error('Database connection error in SubjectTeachersPage, using fallback:', err);
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

  const normSlug = slug.startsWith('cs-')
    ? (slug === 'cs-physics'
        ? 'physics'
        : slug === 'cs-english'
        ? 'english'
        : slug === 'cs-algebra-geometry'
        ? 'algebra-and-geometry'
        : slug === 'cs-calculus'
        ? 'calculus'
        : slug)
    : slug;

  const courses =
    normSlug === 'physics'
      ? physicsCourses
      : normSlug === 'chemistry'
      ? chemistryCourses
      : normSlug === 'english' || normSlug === 'commerce-english'
      ? englishCourses
      : normSlug === 'mechanics'
      ? mechanicsCourses
      : normSlug === 'algebra-and-geometry'
      ? algebraCourses
      : normSlug === 'calculus'
      ? calculusCourses
      : normSlug === 'commerce-geography'
      ? geographyCourses
      : normSlug === 'commerce-mathematics'
      ? commerceMathCourses
      : normSlug === 'commerce-french'
      ? frenchCourses
      : [];

  return <SubjectTeachersClient subject={subject} courses={courses} />;
}
