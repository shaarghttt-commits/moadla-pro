import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import MessagesPageClient from '@/components/social/MessagesPageClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'الرسائل | Moadla Pro' };

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?callbackUrl=/messages');
  return <MessagesPageClient />;
}
