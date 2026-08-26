import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    const page = await prisma.customPage.findUnique({ where: { id } });

    if (!page) {
      return NextResponse.json({ error: 'الصفحة غير موجودة' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الصفحة' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      description,
      coverImage,
      contentMarkdown,
      blocksJson,
      isPublished,
      seoTitle,
      seoDescription,
      seoKeywords,
      order,
    } = body;

    const existing = await prisma.customPage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'الصفحة غير موجودة' }, { status: 404 });
    }

    let cleanSlug = existing.slug;
    if (slug && slug !== existing.slug) {
      cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
      const duplicate = await prisma.customPage.findUnique({ where: { slug: cleanSlug } });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json({ error: 'هذا الرابط (Slug) مستخدم بالفعل' }, { status: 400 });
      }
    }

    const updated = await prisma.customPage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        slug: cleanSlug,
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(contentMarkdown !== undefined && { contentMarkdown }),
        ...(blocksJson !== undefined && {
          blocksJson: typeof blocksJson === 'string' ? blocksJson : JSON.stringify(blocksJson),
        }),
        ...(isPublished !== undefined && { isPublished }),
        ...(seoTitle !== undefined && { seoTitle }),
        ...(seoDescription !== undefined && { seoDescription }),
        ...(seoKeywords !== undefined && { seoKeywords }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return NextResponse.json({ page: updated });
  } catch (error) {
    console.error('Error updating custom page:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل الصفحة' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.customPage.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'تم حذف الصفحة بنجاح' });
  } catch (error) {
    console.error('Error deleting custom page:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الصفحة' }, { status: 500 });
  }
}
