import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import SubjectExamsClient from '@/components/subjects/SubjectExamsClient';
import { Metadata } from 'next';

export const revalidate = 0;

interface SubjectExamsPageProps {
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

export async function generateMetadata({ params }: SubjectExamsPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const subject = await prisma.subject.findUnique({
      where: { slug },
    });

    const title = subject?.title || fallbackSubjects[slug]?.title || slug;
    return {
      title: `امتحانات ${title} السابقة لمعادلة كلية الهندسة PDF وبابل شيت | Moadla Pro`,
      description: `كافة امتحانات السنين السابقة لمادة ${title} لمعادلة كلية الهندسة مع نماذج الحلول وفيديوهات الشرح.`,
    };
  } catch (error) {
    const title = fallbackSubjects[slug]?.title || slug;
    return {
      title: `امتحانات ${title} السابقة لمعادلة كلية الهندسة PDF وبابل شيت | Moadla Pro`,
      description: `كافة امتحانات السنين السابقة لمادة ${title} لمعادلة كلية الهندسة مع نماذج الحلول وفيديوهات الشرح.`,
    };
  }
}

export default async function SubjectExamsPage({ params }: SubjectExamsPageProps) {
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
    console.error('Database connection error in SubjectExamsPage, using fallback:', err);
  }

  if (!subject) {
    if (fallbackSubjects[slug]) {
      subject = {
        id: slug,
        slug,
        title: fallbackSubjects[slug].title,
        description: fallbackSubjects[slug].desc,
        units: [],
        exams: [],
        section: { title: 'معادلة كلية الهندسة' },
      };
    } else {
      notFound();
    }
  }

  // Read disk files from public/uploads/files
  const folderNamesMap: Record<string, string[]> = {
    chemistry: ['كيمياء', 'الكيمياء'],
    physics: ['فيزياء', 'الفيزياء', '%D9%81%D9%8A%D8%B2%D9%8A%D8%A7%D8%A1'],
    calculus: ['تفاضل-وتكامل', 'تفاضل وتكامل'],
    mechanics: ['ميكانيكا', 'الميكانيكا'],
    'algebra-and-geometry': ['جبر', 'جبر وهندسه فراغيه'],
    english: ['الانجليزى', 'انجليزي'],
  };

  const candidateFolders = folderNamesMap[slug] || [slug];
  let diskFiles: { title: string; fileUrl: string; fileSize?: string; year?: number }[] = [];

  const fs = await import('fs/promises');
  const path = await import('path');

  for (const folder of candidateFolders) {
    try {
      const folderPath = path.join(process.cwd(), 'public', 'uploads', 'files', folder);
      const items = await fs.readdir(folderPath);
      for (const item of items) {
        if (item.toLowerCase().endsWith('.pdf')) {
          const stat = await fs.stat(path.join(folderPath, item));
          const yearMatch = item.match(/(201[6-9]|202[0-9])/);
          const year = yearMatch ? parseInt(yearMatch[1], 10) : undefined;
          let cleanTitle = item
            .replace(/^1788\d+-/, '')
            .replace(/\.pdf$/i, '')
            .replace(/_/g, ' ')
            .replace(/moadla\.com/gi, '')
            .trim();

          diskFiles.push({
            title: cleanTitle || item,
            fileUrl: `/uploads/files/${folder}/${item}`,
            fileSize: `${Math.round(stat.size / 1024)} KB`,
            year,
          });
        }
      }
      if (diskFiles.length > 0) break;
    } catch {
      // try next
    }
  }

  return <SubjectExamsClient subject={subject} diskFiles={diskFiles} />;
}
