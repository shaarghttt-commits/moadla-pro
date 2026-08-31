import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, context: any) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const params = await (context.params as any);
    const { id } = params;
    const comment = await prisma.discussionComment.findUnique({ where: { id } });
    if (!comment) return NextResponse.json({ error: 'التعليق غير موجود' }, { status: 404 });

    if (comment.authorId !== currentUser.id && currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بحذف هذا التعليق' }, { status: 403 });
    }

    await prisma.discussionComment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/discussion/comments/[id] error', error);
    return NextResponse.json({ error: 'خطأ في حذف التعليق' }, { status: 500 });
  }
}
