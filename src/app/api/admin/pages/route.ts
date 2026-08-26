import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const pages = await prisma.customPage.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching admin pages:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الصفحات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      coverImage,
      contentMarkdown,
      blocksJson,
      isPublished = true,
      seoTitle,
      seoDescription,
      seoKeywords,
      order = 0,
    } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: 'عنوان الصفحة والاسم اللطيف (Slug) مطلوبان' }, { status: 400 });
    }

    // Clean slug
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');

    // Check unique slug
    const existing = await prisma.customPage.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json({ error: 'هذا الرابط (Slug) مستخدم بالفعل، اختر اسماً آخر' }, { status: 400 });
    }

    const newPage = await prisma.customPage.create({
      data: {
        title,
        slug: cleanSlug,
        description: description || null,
        coverImage: coverImage || null,
        contentMarkdown: contentMarkdown || null,
        blocksJson: typeof blocksJson === 'string' ? blocksJson : blocksJson ? JSON.stringify(blocksJson) : null,
        isPublished,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        order: Number(order),
      },
    });

    return NextResponse.json({ page: newPage }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom page:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الصفحة' }, { status: 500 });
  }
}
