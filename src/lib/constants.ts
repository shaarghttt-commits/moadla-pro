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
    badge: '🚀 المنصة الأقوى لمعادلات الجامعات المصرية 2024 - 2025',
    title: 'طريقك المضمون للالتحاق بكليات القمة',
    subtitle: 'شروحات فيديو تفاعلية، مذكرات وملخصات PDF قابلة للتحميل، وبنك أسئلة وامتحانات سابقة وتجريبية تحاكي نظام البابل شيت الحديث 100%.',
    imageUrl: '',
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
};

export const DEFAULT_NAV_ITEMS = [
  { title: 'الرئيسية', href: '/', icon: 'Home', order: 0, isVisible: true },
  { title: 'المعادلات', href: '/sections', icon: 'Layers', order: 1, isVisible: true },
  { title: 'المواد الدراسية', href: '/subjects', icon: 'BookOpen', order: 2, isVisible: true },
  { title: 'الامتحانات التفاعلية', href: '/exams', icon: 'FileCheck2', order: 3, isVisible: true },
  { title: 'الامتحانات السابقة', href: '/admin/files', icon: 'History', order: 4, isVisible: true },
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
    { id: 'search', name: 'شريط البحث الشامل', isVisible: true, order: 1 },
    { id: 'sectionsGrid', name: 'شبكة الأقسام الأكاديمية', isVisible: true, order: 2 },
    { id: 'features', name: 'مميزات المنصة (Features Cards)', isVisible: true, order: 3 },
    { id: 'latestContent', name: 'أحدث الدروس والامتحانات والمذكرات', isVisible: true, order: 4 },
    { id: 'cta', name: 'بانر الدعوة للتسجيل (CTA Banner)', isVisible: true, order: 5 },
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
