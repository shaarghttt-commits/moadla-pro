import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import RealisticBubbleSheetSimulator from '@/components/exams/RealisticBubbleSheetSimulator';

export const metadata: Metadata = {
  title: 'محاكي ورقة البابل شيت الرسمية 2025 | معادلة برو',
  description: 'محاكي ورقة البابل شيت والتظليل الإلكتروني لجامعات القاهرة وعين شمس مع تقرير تحليل نقاط الضعف الذكي لكافة امتحانات السنين السابقة.',
};

export const dynamic = 'force-dynamic';

export default async function ExamSimulatorPage() {
  const availableExams = await prisma.exam.findMany({
    where: {
      isPublished: true,
      questions: {
        some: {},
      },
    },
    include: {
      subject: true,
      questions: {
        orderBy: { order: 'asc' },
        include: {
          choices: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
    orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
  });

  return <RealisticBubbleSheetSimulator availableExams={availableExams as any} />;
}
