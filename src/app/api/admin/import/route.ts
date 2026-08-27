import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { analyzeExternalImportUrl, ensureImportedMediaDownloads, persistImportedContent } from '@/lib/site-import';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'يرجى إدخال رابط الموقع' }, { status: 400 });
    }

    const preview = await analyzeExternalImportUrl(url);
    return NextResponse.json({ preview });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء تحليل الموقع' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { preview, selectedPageIds, selectedFileIds, selectedImageIds } = await req.json();
    if (!preview) {
      return NextResponse.json({ error: 'لا توجد بيانات لاستيرادها' }, { status: 400 });
    }

    const saved = await persistImportedContent(preview, [
      ...(selectedPageIds || []),
      ...(selectedFileIds || []),
      ...(selectedImageIds || []),
    ]);

    await ensureImportedMediaDownloads(preview);

    return NextResponse.json({
      success: true,
      message: saved.skipped ? 'تم اكتشاف محتوى مشابه، ولم يتم تكرار الاستيراد.' : 'تم حفظ المحتوى المستورد بنجاح.',
      saved,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء حفظ المحتوى' }, { status: 500 });
  }
}
