import CommunityFeedClient from '@/components/feed/CommunityFeedClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المجتمع والقصص الطلابية | Moadla Pro',
  description: 'الصفحة الرئيسية لمجتمع طلاب معادلة الهندسة والجامعات. تصفح قصص الطلاب، شارك في النقاشات والمسائل، وتفاعل مع المتفوقين.',
};

export default function FeedPage() {
  return <CommunityFeedClient />;
}
