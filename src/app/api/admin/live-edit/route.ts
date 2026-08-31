import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بإجراء هذه العملية' }, { status: 403 });
    }

    const body = await req.json();
    const { action, type, id, data } = body;

    if (!action || !type) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    // 1. UPDATE ITEM ACTION
    if (action === 'UPDATE') {
      let updatedRecord: any = null;

      switch (type) {
        case 'SECTION':
          updatedRecord = await prisma.section.update({
            where: { id },
            data: {
              title: data.title,
              description: data.description,
              color: data.color,
              isActive: data.isActive !== undefined ? data.isActive : true,
            },
          });
          break;

        case 'SUBJECT':
          updatedRecord = await prisma.subject.update({
            where: { id },
            data: {
              title: data.title,
              description: data.description,
              image: data.image,
              isActive: data.isActive !== undefined ? data.isActive : true,
            },
          });
          break;

        case 'UNIT':
          updatedRecord = await prisma.unit.update({
            where: { id },
            data: {
              title: data.title,
              description: data.description,
            },
          });
          break;

        case 'LESSON':
          updatedRecord = await prisma.lesson.update({
            where: { id },
            data: {
              title: data.title,
              description: data.description,
              videoUrl: data.videoUrl,
              contentMarkdown: data.contentMarkdown,
              durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes) : undefined,
              isFree: data.isFree !== undefined ? data.isFree : true,
              isPublished: data.isPublished !== undefined ? data.isPublished : true,
            },
          });
          break;

        case 'SITE_SETTING':
          updatedRecord = await prisma.siteSetting.upsert({
            where: { key: data.key },
            update: { value: typeof data.value === 'string' ? data.value : JSON.stringify(data.value) },
            create: { key: data.key, value: typeof data.value === 'string' ? data.value : JSON.stringify(data.value) },
          });
          break;

        default:
          return NextResponse.json({ error: 'نوع العنصر غير مدعوم' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'تم التعديل بنجاح!', record: updatedRecord });
    }

    // 1.1 UPDATE DIRECT INLINE TEXT ACTION
    if (action === 'UPDATE_TEXT') {
      const { textKey, newText, field } = data || {};
      if (!newText && newText !== '') {
        return NextResponse.json({ error: 'النص غير موجود' }, { status: 400 });
      }

      // If tied to a specific model ID
      if (id && !id.startsWith('elem-')) {
        switch (type) {
          case 'SECTION':
            await prisma.section.update({
              where: { id },
              data: { [field || 'title']: newText },
            });
            break;

          case 'SUBJECT':
            await prisma.subject.update({
              where: { id },
              data: { [field || 'title']: newText },
            });
            break;

          case 'UNIT':
            await prisma.unit.update({
              where: { id },
              data: { [field || 'title']: newText },
            });
            break;

          case 'LESSON':
            await prisma.lesson.update({
              where: { id },
              data: { [field || 'title']: newText },
            });
            break;
        }
      }

      // Also persist to global site_text_overrides for static/homepage texts
      if (textKey) {
        const existingSetting = await prisma.siteSetting.findUnique({
          where: { key: 'site_text_overrides' },
        });
        let overrides: Record<string, string> = {};
        if (existingSetting) {
          try {
            overrides = JSON.parse(existingSetting.value);
          } catch {
            overrides = {};
          }
        }
        overrides[textKey] = newText;

        await prisma.siteSetting.upsert({
          where: { key: 'site_text_overrides' },
          update: { value: JSON.stringify(overrides) },
          create: { key: 'site_text_overrides', value: JSON.stringify(overrides) },
        });
      }

      return NextResponse.json({ success: true, message: 'تم حفظ وتحديث النص بنجاح!' });
    }

    // 2. DELETE ITEM ACTION
    if (action === 'DELETE') {
      try {
        switch (type) {
          case 'SECTION':
            await prisma.section.deleteMany({ where: { id } });
            break;

          case 'SUBJECT': {
            // Delete child units, lessons, files first to prevent FK constraint failures
            const units = await prisma.unit.findMany({ where: { subjectId: id }, select: { id: true } });
            const unitIds = units.map((u: any) => u.id);

            await prisma.lessonFile.deleteMany({
              where: {
                OR: [
                  { lesson: { unitId: { in: unitIds } } },
                  { subjectId: id },
                ],
              },
            });
            await prisma.lesson.deleteMany({ where: { unitId: { in: unitIds } } });
            await prisma.unit.deleteMany({ where: { subjectId: id } });
            await prisma.exam.deleteMany({ where: { subjectId: id } });
            await prisma.subject.deleteMany({ where: { id } });
            break;
          }

          case 'UNIT': {
            const lessons = await prisma.lesson.findMany({ where: { unitId: id }, select: { id: true } });
            const lessonIds = lessons.map((l: any) => l.id);
            await prisma.lessonFile.deleteMany({ where: { lessonId: { in: lessonIds } } });
            await prisma.lesson.deleteMany({ where: { unitId: id } });
            await prisma.unit.deleteMany({ where: { id } });
            break;
          }

          case 'LESSON':
            await prisma.lessonFile.deleteMany({ where: { lessonId: id } });
            await prisma.lesson.deleteMany({ where: { id } });
            break;

          case 'FILE':
            await prisma.lessonFile.deleteMany({ where: { id } });
            break;

          case 'POST':
            await prisma.comment.deleteMany({ where: { postId: id } });
            await prisma.reaction.deleteMany({ where: { postId: id } });
            await prisma.post.deleteMany({ where: { id } });
            break;

          case 'STORY':
            await prisma.story.deleteMany({ where: { id } });
            break;

          default:
            // Generic fallback delete
            break;
        }
      } catch (delErr: any) {
        console.warn('Soft delete warning:', delErr.message);
      }

      return NextResponse.json({ success: true, message: 'تم حذف العنصر بنجاح!' });
    }

    // 2.1 BULK / BATCH DELETE ACTION
    if (action === 'BULK_DELETE') {
      const itemsToDelete: Array<{ id: string; type: string }> = body.items || [];
      if (!Array.isArray(itemsToDelete) || itemsToDelete.length === 0) {
        return NextResponse.json({ error: 'لم يتم تحديد عناصر للحذف' }, { status: 400 });
      }

      let deletedCount = 0;
      for (const item of itemsToDelete) {
        const { id, type } = item;
        if (!id || id.startsWith('elem-')) continue;

        try {
          switch (type) {
            case 'SECTION':
              await prisma.section.deleteMany({ where: { id } });
              deletedCount++;
              break;

            case 'SUBJECT': {
              const units = await prisma.unit.findMany({ where: { subjectId: id }, select: { id: true } });
              const unitIds = units.map((u: any) => u.id);
              await prisma.lessonFile.deleteMany({
                where: { OR: [{ lesson: { unitId: { in: unitIds } } }, { subjectId: id }] },
              });
              await prisma.lesson.deleteMany({ where: { unitId: { in: unitIds } } });
              await prisma.unit.deleteMany({ where: { subjectId: id } });
              await prisma.exam.deleteMany({ where: { subjectId: id } });
              await prisma.subject.deleteMany({ where: { id } });
              deletedCount++;
              break;
            }

            case 'UNIT': {
              const lessons = await prisma.lesson.findMany({ where: { unitId: id }, select: { id: true } });
              const lessonIds = lessons.map((l: any) => l.id);
              await prisma.lessonFile.deleteMany({ where: { lessonId: { in: lessonIds } } });
              await prisma.lesson.deleteMany({ where: { unitId: id } });
              await prisma.unit.deleteMany({ where: { id } });
              deletedCount++;
              break;
            }

            case 'LESSON':
              await prisma.lessonFile.deleteMany({ where: { lessonId: id } });
              await prisma.lesson.deleteMany({ where: { id } });
              deletedCount++;
              break;

            case 'FILE':
              await prisma.lessonFile.deleteMany({ where: { id } });
              deletedCount++;
              break;

            case 'POST':
              await prisma.comment.deleteMany({ where: { postId: id } });
              await prisma.reaction.deleteMany({ where: { postId: id } });
              await prisma.post.deleteMany({ where: { id } });
              deletedCount++;
              break;

            case 'STORY':
              await prisma.story.deleteMany({ where: { id } });
              deletedCount++;
              break;
          }
        } catch (e: any) {
          console.warn('Bulk delete item warning:', e.message);
        }
      }

      return NextResponse.json({ success: true, message: `تم حذف ${deletedCount} عناصر بنجاح!`, deletedCount });
    }

    // 3. CREATE / ADD NEW ITEM ACTION
    if (action === 'CREATE') {
      let createdRecord: any = null;

      switch (type) {
        case 'SECTION':
          createdRecord = await prisma.section.create({
            data: {
              title: data.title || 'قسم جديد',
              slug: data.slug || `section-${Date.now()}`,
              description: data.description || 'وصف القسم الجديد',
              color: data.color || 'blue',
              isActive: true,
            },
          });
          break;

        case 'SUBJECT':
          createdRecord = await prisma.subject.create({
            data: {
              title: data.title || 'مادة جديدة',
              slug: data.slug || `subject-${Date.now()}`,
              description: data.description || 'وصف المادة الجديدة',
              sectionId: data.sectionId,
              isActive: true,
            },
          });
          break;

        case 'UNIT':
          createdRecord = await prisma.unit.create({
            data: {
              title: data.title || 'وحدة دراسية جديدة',
              description: data.description || '',
              subjectId: data.subjectId,
            },
          });
          break;

        case 'LESSON':
          createdRecord = await prisma.lesson.create({
            data: {
              title: data.title || 'درس جديد',
              slug: data.slug || `lesson-${Date.now()}`,
              description: data.description || '',
              videoUrl: data.videoUrl || '',
              durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes) : 30,
              unitId: data.unitId,
              isFree: true,
              isPublished: true,
            },
          });
          break;

        case 'FILE':
          createdRecord = await prisma.lessonFile.create({
            data: {
              title: data.title || 'ملف PDF جديد',
              fileUrl: data.fileUrl,
              fileType: 'pdf',
              fileSize: data.fileSize || '3.5 MB',
              subjectId: data.subjectId || null,
              unitId: data.unitId || null,
              lessonId: data.lessonId || null,
            },
          });
          break;

        default:
          return NextResponse.json({ error: 'نوع العنصر غير مدعوم للإنشاء' }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'تمت إضافة العنصر بنجاح!', record: createdRecord });
    }

    return NextResponse.json({ error: 'إجراء غير صالح' }, { status: 400 });
  } catch (error: any) {
    console.error('Live Edit API Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
