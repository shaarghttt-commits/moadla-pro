import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'ping', ts: Date.now(), userId: user.id })}\n\n`));
        controller.enqueue(encoder.encode(`event: ping\ndata: ${JSON.stringify({ type: 'ping', ts: Date.now(), userId: user.id })}\n\n`));
      };

      send('connected');
      const interval = setInterval(() => send('heartbeat'), 15000);
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
