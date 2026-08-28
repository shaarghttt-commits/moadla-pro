export const revalidate = 0;

export const metadata = {
  title: 'المواد الدراسية | Moadla Pro',
  description: 'محتوى مستورد من صفحة خارجيّة حسب الطلب',
};

// Sidebar components removed per owner request

export default function SubjectsPage() {
  return (
    <div className="py-16 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,240px] gap-10 lg:gap-12">
        <main>
          <article className="prose prose-slate dark:prose-invert prose-lg max-w-none leading-relaxed">
            {/* المحتوى محذوف حسب طلب المالك */}
          </article>
        </main>

        {/* sidebar removed */}
      </div>
    </div>
  );
}
