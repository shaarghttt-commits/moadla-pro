import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import MessagesPageClient from '@/components/social/MessagesPageClient';

export const dynamic = 'force-dynamic';

export default async function MessageDetailPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const { conversationId } = await params;
  if (!conversationId) {
    redirect('/messages');
  }

  return <MessagesPageClient initialConversationId={conversationId} />;
}
