import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import {
  BookOpen,
  FileCheck2,
  Clock,
  ArrowLeft,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronLeft,
} from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = await prisma.section.findUnique({
    where: { slug },
  });

  if (!section) return { title: 'القسم غير موجود | Moadla Pro' };

  return {
    title: `${section.title} | Moadla Pro`,
    description: section.description,
  };
}

export default async function SectionDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const section = await prisma.section.findUnique({
    where: { slug },
    include: {
      subjects: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          units: {
            include: {
              _count: {
                select: { lessons: true },
              },
            },
          },
          exams: {
            where: { isPublished: true },
          },
        },
      },
      exams: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        include: {
          subject: true,
          _count: {
            select: { questions: true },
          },
        },
      },
    },
  });

  if (!section) {
    notFound();
  }

  // Calculate total lessons in this section
  const totalLessons = section.subjects.reduce((acc: number, sub: any) => {
    return (
      acc +
      sub.units.reduce((uAcc: number, unit: any) => uAcc + unit._count.lessons, 0)
    );
  }, 0);

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-brand-600 transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/sections" className="hover:text-brand-600 transition-colors">
          الأقسام
        </Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-slate-200 font-bold">{section.title}</span>
      </nav>

      {/* Hero Section Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-brand-700/40 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-bold border border-white/10">
            <GraduationCap className="w-4 h-4" />
            <span>مسار معتمد رسمياً</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-tajawal">
            {section.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {section.description}
          </p>

          {/* Quick Stats in Hero */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-white font-tajawal">
                {section.subjects.length}
              </p>
              <p className="text-xs text-slate-400">مواد دراسية</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-brand-400 font-tajawal">
                {totalLessons}
              </p>
              <p className="text-xs text-slate-400">درساً مشروحاً</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-tajawal">
                {section.exams.length}
              </p>
              <p className="text-xs text-slate-400">امتحاناً تفاعلياً</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            <span>المواد الدراسية المقررة</span>
          </h2>
          <span className="text-xs text-slate-500 font-bold">
            {section.subjects.length} مواد متاحة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {section.subjects.map((sub) => {
            const lessonsCount = sub.units.reduce(
              (acc, u) => acc + u._count.lessons,
              0
            );
            return (
              <div
                key={sub.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                {sub.image && (
                  <div className="h-44 w-full overflow-hidden relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sub.image}
                      alt={sub.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                      {sub.units.length} وحدات • {lessonsCount} دروس
                    </span>
                  </div>
                )}

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {sub.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {sub.exams.length} امتحانات مرتبطة
                    </span>
                    <Link
                      href={`/subjects/${sub.slug}`}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <span>دخول المادة</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Associated Exams */}
      {section.exams.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-accent-emerald" />
              <span>امتحانات هذا القسم</span>
            </h2>
            <Link
              href="/exams"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              جميع الامتحانات ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.exams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-accent-emerald text-xs font-bold">
                      {exam.subject?.title || section.title}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      عام {exam.year || 2024}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {exam.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-500" />
                      <span>{exam.durationMinutes} دقيقة</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{exam._count.questions} أسئلة</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <Link
                    href={`/exams/${exam.id}`}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>خوض الامتحان التجريبي</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Computer Science Equivalency Guide & FAQ (Shown for computer-science section) */}
      {slug === 'computer-science' && (
        <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-sky-500" />
              <span>دليل وشروط معادلة كلية الحاسبات والمعلومات 2025</span>
            </h2>
            <span className="text-xs font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-800">
              المجلس الأعلى للجامعات
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Guide Card 1 */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-lg">🏫</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">المدارس المؤهلة للتقديم</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-900 dark:text-white">مدارس WE للتكنولوجيا التطبيقية</strong> (اتصالات، شبكات وأمن معلومات، تطوير مواقع وبرمجيات).</li>
                <li><strong className="text-slate-900 dark:text-white">مدرسة I-Tech للتكنولوجيا التطبيقية</strong> (جميع التخصصات).</li>
                <li><strong className="text-slate-900 dark:text-white">مدرسة تكنولوجيا المعلومات بالإسماعيلية</strong> (جميع التخصصات).</li>
                <li><strong className="text-slate-900 dark:text-white">مدرسة الشهيد عمرو مصطفى حسني</strong> ومدرسة السويدي الدولية للتكنولوجيا.</li>
                <li><strong className="text-slate-900 dark:text-white">مدرسة HST للتكنولوجيا</strong> (الذكاء الاصطناعي في المراقبة والإنذار) ومدرسة حلوان وظهر للتكنولوجيا.</li>
              </ul>
            </div>

            {/* Guide Card 2 */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-lg">📋</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">شروط القبول والنجاح</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>الحصول على <strong className="text-slate-900 dark:text-white">75% فأكثر</strong> في المجموع الكلي للمؤهل الدراسي.</li>
                <li>أن يكون المتقدم <strong className="text-slate-900 dark:text-white">خريجاً حديثاً (آخر عامين فقط)</strong> وفرصة دخول واحدة فقط.</li>
                <li>الامتحان في <strong className="text-slate-900 dark:text-white">4 مواد فقط</strong>: الفيزياء، الإنجليزي، الجبر والفراغية، والتفاضل والتكامل (معفى من الميكانيكا والكيمياء).</li>
                <li>شرط النجاح: الحصول على <strong className="text-slate-900 dark:text-white">50% في كل مادة</strong> بدون رسوب في أي مادة.</li>
              </ul>
            </div>

            {/* Guide Card 3 */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-lg">🏛️</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">التوزيع الجغرافي للامتحانات</h3>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
                <p>📍 <strong>قطاع القاهرة الكبرى:</strong> كلية الهندسة - جامعة القاهرة (القاهرة، الجيزة، القليوبية، الفيوم، بني سويف، حلوان).</p>
                <p>📍 <strong>قطاع الدلتا والقناة:</strong> كلية الهندسة - جامعة الزقازيق (الشرقية، الدقهلية، المنوفية، الإسماعيلية، السويس، بورسعيد، دمياط، سيناء).</p>
                <p>📍 <strong>قطاع بحري:</strong> كلية الهندسة - جامعة كفر الشيخ (الإسكندرية، البحيرة، كفر الشيخ، مطروح، الغربية).</p>
                <p>📍 <strong>قطاع قبلي:</strong> كلية الهندسة - جامعة أسيوط (المنيا، سوهاج، أسيوط، قنا، أسوان، الأقصر، الوادي، البحر الأحمر).</p>
              </div>
            </div>

            {/* Guide Card 4 */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-lg">💡</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">التقديم المشترك ونظام البابل شيت</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-900 dark:text-white">التقديم المشترك:</strong> يحق للطالب التقديم في معادلتي (حاسبات وهندسة) بالتوازي وخوض نفس الامتحانات.</li>
                <li>إذا رسب في الكيمياء أو الميكانيكا ونجح في باقي المواد، يُقبل في <strong className="text-slate-900 dark:text-white">كلية الحاسبات والمعلومات</strong>.</li>
                <li>إذا نجح في جميع المواد، يحق له <strong className="text-slate-900 dark:text-white">الاختيار بين هندسة أو حاسبات</strong>.</li>
                <li><strong className="text-slate-900 dark:text-white">الآلة الحاسبة المعتمدة:</strong> يُوصى باستخدام <span className="font-mono font-bold text-brand-600">Casio fx-991 ARX</span> المعتمدة رسمياً.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Commerce Equivalency Guide & FAQ (Shown for commerce section) */}
      {slug === 'commerce' && (
        <div className="space-y-6 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-500" />
              <span>دليل وشروط والأسئلة الشائعة لمعادلة كلية التجارة 2025</span>
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              المجلس الأعلى للجامعات
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Commerce Guide Card 1 */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-lg">🎓</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">شروط التقديم والحد الأدنى</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li><strong className="text-slate-900 dark:text-white">دبلوم التجارة نظام 3 سنوات:</strong> الحصول على مجموع <strong className="text-emerald-600">70% فأكثر</strong> لدخول الاختبارات.</li>
                <li><strong className="text-slate-900 dark:text-white">دبلوم 5 سنوات والمعاهد الفنية التجارية (سنتين):</strong> الحصول على مجموع <strong className="text-emerald-600">50% فأكثر</strong>.</li>
                <li>أن يكون الطالب <strong className="text-slate-900 dark:text-white">خريجاً حديثاً (آخر عامين فقط)</strong> وفرصة دخول واحدة فقط، ولا يوجد دور ثانٍ.</li>
              </ul>
            </div>

            {/* Commerce Guide Card 2 */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-lg">⚖️</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">شروط النجاح ونظام القبول (انتظام / انتساب)</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>شرط النجاح في المعادلة: الحصول على <strong className="text-slate-900 dark:text-white">50% في كل مادة</strong> (النجاح في المواد الـ 4 معاً).</li>
                <li><strong className="text-slate-900 dark:text-white">القبول بنظام الانتظام:</strong> في حال حصول الطالب على <strong className="text-blue-600">320 درجة فأكثر (80% فأكثر)</strong>.</li>
                <li><strong className="text-slate-900 dark:text-white">القبول بنظام الانتساب:</strong> في حال حصول الطالب على <strong className="text-blue-600">من 200 إلى أقل من 320 درجة (50% إلى 80%)</strong>.</li>
              </ul>
            </div>

            {/* Commerce Guide Card 3 */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-lg">🏛️</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">الجامعات الـ 6 المعتمدة لعقد الامتحانات</h3>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
                <p>📍 <strong>جامعة القاهرة</strong> (طلاب القاهرة، الجيزة، الفيوم، بني سويف، القليوبية، حلوان).</p>
                <p>📍 <strong>جامعة الإسكندرية</strong> (طلاب الإسكندرية، البحيرة، مطروح).</p>
                <p>📍 <strong>جامعة طنطا</strong> (طلاب الغربية، كفر الشيخ، المنوفية).</p>
                <p>📍 <strong>جامعة الزقازيق</strong> (طلاب الشرقية، الدقهلية، دمياط، بورسعيد، الإسماعيلية، السويس، سيناء).</p>
                <p>📍 <strong>جامعة أسيوط</strong> (طلاب محافظات الصعيد: المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان، الوادي).</p>
              </div>
            </div>

            {/* Commerce Guide Card 4 */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-lg">📝</span>
                <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">طبيعة الامتحانات ونظام البابل شيت</h3>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>الامتحان بنظام <strong className="text-slate-900 dark:text-white">البابل شيت (50 سؤال اختيار من متعدد)</strong>.</li>
                <li>زمن الامتحان <strong className="text-slate-900 dark:text-white">ساعتان (120 دقيقة)</strong> لكل مادة دراسية.</li>
                <li>المواد المقررة: <strong className="text-slate-900 dark:text-white">الجغرافيا، الرياضيات، اللغة الإنجليزية، واللغة الفرنسية</strong>.</li>
                <li>يُسمح باستخدام الآلة الحاسبة العلمية في مادة الرياضيات (<span className="font-mono font-bold text-emerald-600">Casio fx-991</span>).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
