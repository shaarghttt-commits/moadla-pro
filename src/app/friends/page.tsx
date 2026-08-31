import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import FriendsPageClient from '@/components/social/FriendsPageClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'الأصدقاء | Moadla Pro' };

export default async function FriendsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/friends');
  return <FriendsPageClient />;
}
