import React from 'react';
import { Metadata } from 'next';
import LeaguesLeaderboard from '@/components/gamification/LeaguesLeaderboard';

export const metadata: Metadata = {
  title: 'لوحة الشرف وتصنيف المتفوقين | معادلة برو',
  description: 'تصنيف الطلاب الأسبوعي وتحديات الدوريات البرونزية والذهبية والماسية في معادلة الهندسة.',
};

export const dynamic = 'force-dynamic';

export default function LeaderboardPage() {
  return <LeaguesLeaderboard />;
}
