export const DEFAULT_SETTINGS = {
  branding: {
    siteName: 'معادلة برو | Moadla Pro',
    siteDescription: 'المنصة التعليمية الأولى والمتكاملة لتأهيل طلاب الدبلومات والمعاهد الفنية لاجتياز امتحانات معادلات كليات الهندسة والتجارة والزراعة والحقوق بأعلى الدرجات.',
    logoUrl: '',
    supportPhone: '01070130096',
    supportEmail: 'info@moadla.pro',
    whatsappNumber: '+96601070130096',
    facebookUrl: 'https://facebook.com',
    telegramUrl: 'https://t.me',
    youtubeUrl: 'https://youtube.com',
  },
  hero: {
    badge: '🚀 المنصة الأقوى لمعادلات الجامعات المصرية',
    title: 'طريقك المضمون للالتحاق بكليات القمة',
    subtitle: 'شروحات فيديو تفاعلية، مذكرات وملخصات PDF قابلة للتحميل، وبنك أسئلة وامتحانات سابقة وتجريبية تحاكي نظام البابل شيت الحديث 100%.',
    imageUrl: '',
    studentPhotos: [
      { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&auto=format&fit=crop&q=80', label: 'طالب 1' },
      { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop&q=80', label: 'طالبة 2' },
      { url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=80', label: 'طالب 3' },
      { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&auto=format&fit=crop&q=80', label: 'طالبة 4' },
    ],
    primaryButtonText: 'ابدأ التعلم مجاناً',
    primaryButtonLink: '/sections',
    secondaryButtonText: 'تصفح الامتحانات السابقة',
    secondaryButtonLink: '/exams',
  },
  stats: [
    { id: '1', number: '15,000+', label: 'طالب وطالبة مسجلين', icon: 'Users' },
    { id: '2', number: '96%', label: 'نسبة النجاح والقبول', icon: 'Award' },
    { id: '3', number: '250+', label: 'درس ومحاضرة فيديو', icon: 'BookOpen' },
    { id: '4', number: '5,000+', label: 'سؤال مع حلول نموذجية', icon: 'HelpCircle' },
  ],
  features: [
    {
      id: '1',
      title: 'شروحات تفاعلية مبسطة',
      description: 'دروس فيديو عالية الجودة مع ملفات PDF مرفقة لكل درس وشرح خطوة بخطوة لأدق المسائل.',
      icon: 'PlayCircle',
      color: 'blue',
    },
    {
      id: '2',
      title: 'محاكي امتحانات البابل شيت',
      description: 'امتحانات إلكترونية بمؤقت زمني حقيقي وتصحيح فوري مع تحليل تفصيلي لنقاط القوة والضعف.',
      icon: 'Clock',
      color: 'emerald',
    },
    {
      id: '3',
      title: 'مذكرات وملخصات PDF شاملة',
      description: 'تحميل مباشر لكافة المذكرات ونماذج الامتحانات السابقة المنقحة والمحدثة طبقاً لآخر تعديلات الوزارة.',
      icon: 'FileText',
      color: 'amber',
    },
    {
      id: '4',
      title: 'متابعة وإحصائيات دقيقة',
      description: 'لوحة تحكم ذكية لكل طالب ترصد نسبة إنجاز المواد، متوسط الدرجات، وسجل المحاولات.',
      icon: 'BarChart2',
      color: 'purple',
    },
  ],
  cta: {
    badge: 'انضم الآن مجاناً',
    title: 'مستقبلك يبدأ هنا.. انضم لآلاف الطلاب المتفوقين',
    description: 'سجّل حسابك الآن واحصل على وصول فوري لأقوى شروحات وبنوك أسئلة معادلات الجامعات الحكومية.',
    buttonText: 'إنشاء حساب جديد',
    buttonLink: '/register',
  },
  filesPage: {
    badge: 'بنك الملفات والامتحانات السابقة',
    title: 'الامتحانات السابقة والملاحظات التعليمية',
    subtitle: 'تصفح الملفات المصنفة حسب نوع المعادلة، ثم داخل كل مادة ستجد الامتحانات السابقة الخاصة بها فقط.',
    lastUpdateLabel: 'آخر تحديث',
    subjectCountLabel: 'المواد المتاحة',
    equationTypeLabel: 'أنواع المعادلات',
    emptyTitle: 'لا توجد ملفات منشورة حالياً',
    emptyDescription: 'سيتم إضافة الملفات والملخصات هنا فور نشرها من لوحة الإدارة.',
  },
  successful_students: [
    {
      name: 'عمر خالد الدسوقي',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      year: 2025,
      grades: [
        { label: 'الإنجليزية', value: 92 },
        { label: 'الفيزياء', value: 96 },
        { label: 'الكيمياء', value: 88 },
        { label: 'رياضة 1', value: 98 },
        { label: 'رياضة 2', value: 94 },
        { label: 'الميكانيكا', value: 90 },
      ],
    },
    {
      name: 'سارة محمد عبد الرحمن',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      year: 2025,
      grades: [
        { label: 'الإنجليزية', value: 89 },
        { label: 'الفيزياء', value: 91 },
        { label: 'الكيمياء', value: 93 },
        { label: 'رياضة 1', value: 95 },
        { label: 'رياضة 2', value: 97 },
        { label: 'الميكانيكا', value: 92 },
      ],
    },
    {
      name: 'يوسف محمود القاضي',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      year: 2025,
      grades: [
        { label: 'الإنجليزية', value: 85 },
        { label: 'الفيزياء', value: 89 },
        { label: 'الكيمياء', value: 87 },
        { label: 'رياضة 1', value: 91 },
        { label: 'رياضة 2', value: 90 },
        { label: 'الميكانيكا', value: 88 },
      ],
    },
  ],
};

export const DEFAULT_NAV_ITEMS = [
  { title: 'الرئيسية', href: '/', icon: 'Home', order: 0, isVisible: true },
  { title: 'المعادلات', href: '/sections', icon: 'Layers', order: 1, isVisible: true },
  { title: 'المواد الدراسية', href: '/subjects', icon: 'BookOpen', order: 2, isVisible: true },
  { title: 'الامتحانات التفاعلية', href: '/exams', icon: 'FileCheck2', order: 3, isVisible: true },
  { title: 'الامتحانات السابقة', href: '/files', icon: 'History', order: 4, isVisible: true },
  { title: 'من نحن', href: '/about', icon: 'Info', order: 5, isVisible: true },
  { title: 'تواصل معنا', href: '/contact', icon: 'Mail', order: 6, isVisible: true },
];

export const DEFAULT_FOOTER_COLUMNS = [
  {
    title: 'روابط سريعة',
    order: 0,
    isVisible: true,
    links: [
      { title: 'الرئيسية', href: '/', isVisible: true, order: 0, openInNewTab: false },
      { title: 'المعادلات', href: '/sections', isVisible: true, order: 1, openInNewTab: false },
      { title: 'المواد الدراسية', href: '/subjects', isVisible: true, order: 2, openInNewTab: false },
      { title: 'الامتحانات التفاعلية', href: '/exams', isVisible: true, order: 3, openInNewTab: false },
    ],
  },
  {
    title: 'معلومات ومساعدة',
    order: 1,
    isVisible: true,
    links: [
      { title: 'من نحن', href: '/about', isVisible: true, order: 0, openInNewTab: false },
      { title: 'تواصل معنا', href: '/contact', isVisible: true, order: 1, openInNewTab: false },
      { title: 'الأسئلة الشائعة', href: '/faq', isVisible: true, order: 2, openInNewTab: false },
      { title: 'سياسة الخصوصية', href: '/privacy', isVisible: true, order: 3, openInNewTab: false },
    ],
  },
];

export const DEFAULT_HOMEPAGE_LAYOUT = {
  sections: [
    { id: 'hero', name: 'قسم الواجهة الرئيسي (Hero)', isVisible: true, order: 0 },
    { id: 'successfulStudents', name: 'طلاب نجحوا في معادلة كلية الهندسة', isVisible: true, order: 1 },
    { id: 'search', name: 'شريط البحث الشامل', isVisible: true, order: 2 },
    { id: 'sectionsGrid', name: 'شبكة الأقسام الأكاديمية', isVisible: true, order: 3 },
    { id: 'features', name: 'مميزات المنصة (Features Cards)', isVisible: true, order: 4 },
    { id: 'latestContent', name: 'أحدث الدروس والامتحانات والمذكرات', isVisible: true, order: 5 },
    { id: 'cta', name: 'بانر الدعوة للتسجيل (CTA Banner)', isVisible: true, order: 6 },
  ],
};

export const DEFAULT_SEO = {
  siteTitle: 'معادلة برو | Moadla Pro — منصة تعليم امتحانات المعادلات المصرية',
  metaDescription: 'المنصة التعليمية الأولى لتأهيل طلاب الدبلومات والمعاهد الفنية لاجتياز امتحانات معادلات كليات الهندسة والتجارة والزراعة والحقوق بأحدث الشروحات والامتحانات التفاعلية.',
  keywords: 'معادلة كلية الهندسة, معادلة كلية التجارة, معادلة كلية الزراعة, امتحانات معادلة سابقة, شروحات معادلة الدبلومات',
  ogImage: '',
  twitterHandle: '@moadlapro',
  googleSiteVerification: '',
  robotsIndex: true,
};
