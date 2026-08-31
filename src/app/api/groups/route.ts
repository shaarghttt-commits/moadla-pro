import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || undefined;
    const category = url.searchParams.get('category') || undefined;
    const myGroupsOnly = url.searchParams.get('my') === 'true';

    const where: Prisma.GroupWhereInput = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: q, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (myGroupsOnly && currentUser) {
      where.members = {
        some: { userId: currentUser.id },
      };
    }

    const groups = await prisma.group.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: {
            members: true,
            posts: true,
            files: true,
          },
        },
        members: currentUser
          ? {
              where: { userId: currentUser.id },
              select: { role: true },
            }
          : false,
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });

    const formattedGroups = groups.map((g: any) => ({
      ...g,
      isMember: currentUser ? (g.members as any)?.length > 0 : false,
      myRole: currentUser && (g.members as any)?.length > 0 ? (g.members as any)[0]?.role : null,
    }));

    return NextResponse.json({ groups: formattedGroups });
  } catch (error) {
    console.error('GET /api/groups error:', error);
    return NextResponse.json({ error: 'خطأ في جلب المجموعات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'يرجى تسجيل الدخول لإنشاء مجموعة' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, isPrivate, icon, coverImage } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'اسم المجموعة مطلوب' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u0621-\u064A]+/g, '-')
      .replace(/^-+|-+$/g, '') || `group-${Date.now()}`;

    let slug = baseSlug;
    let count = 1;
    while (await prisma.group.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const group = await prisma.group.create({
      data: {
        name: String(name).trim().slice(0, 100),
        slug,
        description: description ? String(description).slice(0, 500) : null,
        category: category || 'GENERAL',
        isPrivate: !!isPrivate,
        icon: icon || null,
        coverImage: coverImage || null,
        creatorId: currentUser.id,
        members: {
          create: {
            userId: currentUser.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { members: true, posts: true },
        },
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error('POST /api/groups error:', error);
    return NextResponse.json({ error: 'فشل إنشاء المجموعة' }, { status: 500 });
  }
}
