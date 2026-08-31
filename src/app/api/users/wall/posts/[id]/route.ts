import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const postId = params.id;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const post = await prisma.userPost.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, targetUserId: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }

    // Allowed to delete if author, wall owner, or admin
    const canDelete =
      post.authorId === currentUser.id ||
      post.targetUserId === currentUser.id ||
      currentUser.role === 'ADMIN';

    if (!canDelete) {
      return NextResponse.json({ error: 'ليس لديك صلاحية لحذف هذا المنشور' }, { status: 403 });
    }

    await prisma.userPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true, message: 'تم حذف المنشور بنجاح' });
  } catch (error) {
    console.error('DELETE /api/users/wall/posts/[id] error:', error);
    return NextResponse.json({ error: 'فشل حذف المنشور' }, { status: 500 });
  }
}
