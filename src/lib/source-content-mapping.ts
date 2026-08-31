import prisma from '@/lib/prisma';

const SOURCE_WEBSITE = 'https://www.moadla.com';

const SOURCE_SECTIONS = [
  {
    title: 'معادلة كلية الهندسة',
    slug: 'engineering',
    description:
      'موقع moadla pro يشارك كل ما يتعلق بمعادلات الدبلومات الفنية، ويستهدف طلاب الدبلومات والمعاهد في مسار الهندسة مع مواد مساندة وتحديثات أكاديمية.',
    icon: 'Cpu',
    color: 'blue',
    order: 1,
  },
  {
    title: 'معادلة كلية الحاسبات والمعلومات',
    slug: 'computers',
    description:
      'مسار متخصص في الحاسبات والمعلومات، مع مراجعات وملفات ومسارات تعليمية تواكب احتياجات طلاب معادلات كليات الحاسبات والذكاء الاصطناعي.',
    icon: 'Laptop',
    color: 'emerald',
    order: 2,
  },
  {
    title: 'معادلة كلية التجارة',
    slug: 'commerce',
    description:
      'إعداد أكاديمي لطلاب الدبلومات التجارية لاستكمال مناهج المحاسبة والاقتصاد وإدارة الأعمال ضمن مسارات معادلة التجارة.',
    icon: 'TrendingUp',
    color: 'amber',
    order: 3,
  },
  {
    title: 'معادلة كلية الزراعة',
    slug: 'agriculture',
    description:
      'مسار زراعة شامل للطلاب الراغبين في الالتحاق بكليات الزراعة والبيئة، مع مواد علمية ومراجعات موجهة نحو معادلة التخصص.',
    icon: 'Sprout',
    color: 'purple',
    order: 4,
  },
];

const SOURCE_PAGES = [
  {
    slug: 'about-source',
    title: 'من نحن؟',
    description: 'موقع moadla pro هو موقع إلكتروني يهدف إلى مشاركة كل ما يتعلق بمعادلات الدبلومات الفنية.',
    contentMarkdown: `موقع moadla pro هو موقع إلكتروني يهدف إلى مشاركة كل ما يتعلق بمعادلات الدبلومات الفنية.

يوفر الموقع مذكرات، ملفات تعليمية، ومعلومات موجهة لطلاب الدبلومات والمعاهد الفنية الراغبين في الالتحاق بكليات الهندسة والحاسبات والتجارة والزراعة.

الهدف الرئيسي هو تبسيط المعلومات الأكاديمية وتوفير مصادر تعليمية منظمة ومفيدة في المسارات المعتمدة.`,
    seoTitle: 'من نحن | moadla pro',
    seoDescription: 'موقع moadla pro يهدف إلى مشاركة كل ما يتعلق بمعادلات الدبلومات الفنية والمناهج الأكاديمية.',
    sourceUrl: `${SOURCE_WEBSITE}/Site/About-us`,
    sourceWebsite: SOURCE_WEBSITE,
    canonicalUrl: `${SOURCE_WEBSITE}/Site/About-us`,
  },
  {
    slug: 'contact-source',
    title: 'تواصل معنا',
    description: 'صفحة التواصل الرسمية للموقع، مع روابط التواصل الاجتماعي والدعم عبر الهاتف ووسائل الدفع.',
    contentMarkdown: `تواصل معنا عبر الصفحات الرسمية للموقع ووسائل الدعم المتاحة.

رابط الفيسبوك: https://www.facebook.com/profile.php?id=100095629504638
رابط موقع الدعم: https://www.moadla.com/Site/donate
رابط تقييم الموقع: https://www.moadla.com/Site/Website-rating

للاستفسارات والدعم: 01070130096`,
    seoTitle: 'تواصل معنا | moadla pro',
    seoDescription: 'تواصل مع منصة moadla pro عبر الصفحات الرسمية والدعم المتاح.',
    sourceUrl: `${SOURCE_WEBSITE}/Site/Contact-us`,
    sourceWebsite: SOURCE_WEBSITE,
    canonicalUrl: `${SOURCE_WEBSITE}/Site/Contact-us`,
  },
  {
    slug: 'support-source',
    title: 'دعم الموقع',
    description: 'صفحة دعم لمواصلة المشروع وتقديم المساعدة للطلاب من خلال التبرعات والدعم المباشر.',
    contentMarkdown: `ساعدنا على الاستمرار! الموقع يقدم الدعم للطلاب ونشر المحتوى التعليمي المساند في مسارات المواد.

  يمكن دعم الموقع من خلال رابط التبرع الرسمي ومتابعة الروابط الرسمية المتاحة في الموقع.` ,
    seoTitle: 'دعم الموقع | moadla pro',
    seoDescription: 'معلومات دعم الموقع والجهود المستمرة في نشر محتوى المواد.',
    sourceUrl: `${SOURCE_WEBSITE}/Site/donate`,
    sourceWebsite: SOURCE_WEBSITE,
    canonicalUrl: `${SOURCE_WEBSITE}/Site/donate`,
  },
];

export async function seedSourceWebsiteContent() {
  const result = { sections: 0, customPages: 0 };

  for (const entry of SOURCE_SECTIONS) {
    const section = await prisma.section.upsert({
      where: { slug: entry.slug },
      update: {
        title: entry.title,
        description: entry.description,
        icon: entry.icon,
        color: entry.color,
        order: entry.order,
        isActive: true,
      },
      create: {
        title: entry.title,
        slug: entry.slug,
        description: entry.description,
        icon: entry.icon,
        color: entry.color,
        order: entry.order,
      },
    });

    if (section) {
      result.sections += 1;
    }
  }

  for (const page of SOURCE_PAGES) {
    await prisma.customPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        description: page.description,
        contentMarkdown: page.contentMarkdown,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sourceUrl: page.sourceUrl,
        sourceWebsite: page.sourceWebsite,
        canonicalUrl: page.canonicalUrl,
        isPublished: true,
      },
      create: {
        title: page.title,
        slug: page.slug,
        description: page.description,
        contentMarkdown: page.contentMarkdown,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sourceUrl: page.sourceUrl,
        sourceWebsite: page.sourceWebsite,
        canonicalUrl: page.canonicalUrl,
        isPublished: true,
      },
    });

    result.customPages += 1;
  }

  return result;
}
