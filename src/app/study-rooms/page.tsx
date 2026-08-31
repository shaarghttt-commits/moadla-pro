import React from 'react';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import StudyRoomClient from '@/components/study-rooms/StudyRoomClient';

export const metadata: Metadata = {
  title: 'غرف المذاكرة الافتراضية والبومودورو | معادلة برو',
  description: 'غرف مذاكرة جماعية صامتة مع مؤقت بومودورو، أصوات محفزة للتركيز، وسبورة رياضية تفاعلية.',
};

export const dynamic = 'force-dynamic';

export default async function StudyRoomsPage() {
  const rooms = await prisma.studyRoom.findMany({
    include: {
      creator: {
        select: { id: true, name: true, avatar: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true, currentStreak: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return <StudyRoomClient initialRooms={JSON.parse(JSON.stringify(rooms))} />;
}
