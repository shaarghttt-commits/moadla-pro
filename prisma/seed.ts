import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Moadla Pro...');

  // 1. Clean existing records
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.examAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.choice.deleteMany();
  await prisma.question.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.lessonFile.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.section.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'د. أحمد الشناوي',
      email: 'admin@moadla.pro',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+201012345678',
      bio: 'المشرف الأكاديمي العام لمنصة Moadla Pro وخبير تدريس مناهج معادلة الهندسة والحاسبات.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
  });

  const student = await prisma.user.create({
    data: {
      name: 'عمر خالد الدسوقي',
      email: 'student@moadla.pro',
      passwordHash: studentPassword,
      role: 'STUDENT',
      phone: '+201198765432',
      bio: 'طالب دبلوم صناعي 3 سنوات متقدم لمعادلة كلية الهندسة بجامعة القاهرة.',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: 'سارة محمد عبد الرحمن',
      email: 'sara@moadla.pro',
      passwordHash: studentPassword,
      role: 'STUDENT',
      phone: '+201234567890',
      bio: 'طالبة متقدمة لمعادلة كلية الحاسبات والمعلومات 2025.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'يوسف محمود القاضي',
      email: 'youssef@moadla.pro',
      passwordHash: studentPassword,
      role: 'STUDENT',
      phone: '+201055566677',
      bio: 'طالب متقدم لمعادلة كلية التجارة.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ Created Demo Users (Admin & Students)');

  // 3. Create Sections
  const secEng = await prisma.section.create({
    data: {
      title: 'معادلة كلية الهندسة',
      slug: 'engineering',
      description: 'المسار الأكاديمي الشامل لطلاب الدبلومات الفنية والمعاهد الفنية الصناعية للالتحاق بكليات الهندسة الحكومية.',
      icon: 'Cpu',
      color: 'blue',
      order: 1,
    },
  });

  const secComp = await prisma.section.create({
    data: {
      title: 'معادلة كلية الحاسبات والمعلومات',
      slug: 'computers',
      description: 'برنامج الإعداد المتخصص في البرمجة والرياضيات المتقطعة وتكنولوجيا المعلومات للالتحاق بكليات الحاسبات والذكاء الاصطناعي.',
      icon: 'Laptop',
      color: 'emerald',
      order: 2,
    },
  });

  const secComm = await prisma.section.create({
    data: {
      title: 'معادلة كلية التجارة',
      slug: 'commerce',
      description: 'شرح متكامل لمواد المحاسبة المالية وإدارة الأعمال والاقتصاد والرياضة المالية لطلاب الدبلومات التجارية.',
      icon: 'TrendingUp',
      color: 'amber',
      order: 3,
    },
  });

  const secAgri = await prisma.section.create({
    data: {
      title: 'معادلة كلية الزراعة',
      slug: 'agriculture',
      description: 'تغطية شاملة لمناهج الكيمياء الزراعية وعلم النبات والحيوان والوراثة للالتحاق بكليات الزراعة.',
      icon: 'Sprout',
      color: 'purple',
      order: 4,
    },
  });

  console.log('✅ Created 4 Main Equivalence Sections');

  // 4. Create Subjects for Engineering
  const subCalculus = await prisma.subject.create({
    data: {
      title: 'التفاضل والتكامل',
      slug: 'calculus',
      description: 'دراسة متعمقة للنهايات والاتصال، قواعد الاشتقاق، وتطبيقات القيم العظمى والصغرى، وتكامل الدوال المثلثية واللوغاريتمية وتطبيقات المساحات والحجوم.',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
      sectionId: secEng.id,
      order: 1,
    },
  });

  const subAlgebra = await prisma.subject.create({
    data: {
      title: 'الجبر والهندسة الفراغية',
      slug: 'algebra-solid-geometry',
      description: 'مبادئ التباديل والتوافيق، نظرية ذات الحدين، الأعداد المركبة ونظرية ديموافر، المصفوفات والمحددات، والمتجهات ومعادلة الخط المستقيم والمستوى في الفراغ.',
      image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
      sectionId: secEng.id,
      order: 2,
    },
  });

  const subMechanics = await prisma.subject.create({
    data: {
      title: 'الميكانيكا (استاتيكا وديناميكا)',
      slug: 'mechanics',
      description: 'الاحتكاك، العزوم، القوى المتوازية، الاتزان العام، مركز الثقل، وقوانين نيوتن للحركة والشغل والطاقة والقدرة والدفع والتصادم.',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      sectionId: secEng.id,
      order: 3,
    },
  });

  const subPhysics = await prisma.subject.create({
    data: {
      title: 'الفيزياء العامة',
      slug: 'physics',
      description: 'التيار الكهربي وقانون أوم وقانونا كيرشوف، التأثير المغناطيسي للتيار، الحث الكهرومغناطيسي، والفيزياء الحديثة وازدواجية الموجة والجسيم.',
      image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80',
      sectionId: secEng.id,
      order: 4,
    },
  });

  const subChemistry = await prisma.subject.create({
    data: {
      title: 'الكيمياء العامة',
      slug: 'chemistry',
      description: 'العناصر الانتقالية، التحليل الكيميائي، الاتزان الكيميائي، الكيمياء الكهربية والخلايا الجلفانية، ومقدمة شاملة في الكيمياء العضوية.',
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=80',
      sectionId: secEng.id,
      order: 5,
    },
  });

  const subEnglish = await prisma.subject.create({
    data: {
      title: 'اللغة الإنجليزية التخصصية',
      slug: 'english',
      description: 'القواعد الأساسية، المصطلحات الهندسية والعلمية، استيعاب المقروء وحل القطع، والترجمة العلمية المتخصصة.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80',
      sectionId: secEng.id,
      order: 6,
    },
  });

  // Subjects for Computers
  const subProg = await prisma.subject.create({
    data: {
      title: 'أساسيات البرمجة والخوارزميات',
      slug: 'programming-fundamentals',
      description: 'مفاهيم البرمجة الهيكلية والكائنية (OOP)، هياكل البيانات الأساسية، وتحليل الخوارزميات وحل المشكلات.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      sectionId: secComp.id,
      order: 1,
    },
  });

  const subDiscrete = await prisma.subject.create({
    data: {
      title: 'الرياضيات المتقطعة',
      slug: 'discrete-mathematics',
      description: 'المنطق الرياضي، نظرية المجموعات، الدوال والعلاقات، نظرية الرسوم البيانية (Graph Theory)، والتوافيقيات.',
      image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
      sectionId: secComp.id,
      order: 2,
    },
  });

  // Subjects for Commerce
  const subAccounting = await prisma.subject.create({
    data: {
      title: 'مبادئ المحاسبة المالية',
      slug: 'financial-accounting',
      description: 'الدورة المحاسبية، قيود اليومية، القوائم المالية، الحسابات الختامية، والتسويات الجردية للأصول والخصوم.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      sectionId: secComm.id,
      order: 1,
    },
  });

  const subEconomics = await prisma.subject.create({
    data: {
      title: 'الاقتصاد الكلي والجزئي',
      slug: 'economics',
      description: 'العرض والطلب، توازن السوق، مرونة الأسعار، الناتج المحلي الإجمالي، التضخم والسياسات النقدية والمالية.',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
      sectionId: secComm.id,
      order: 2,
    },
  });

  console.log('✅ Created Subjects for Engineering, Computers, Commerce');

  // 5. Create Units & Lessons for Calculus
  const unitCalc1 = await prisma.unit.create({
    data: {
      title: 'الوحدة الأولى: اشتقاق الدوال وتطبيقاتها',
      description: 'شرح اشتقاق الدوال المثلثية، الاشتقاق الضمني والبارامتري، والمشتقات العليا.',
      subjectId: subCalculus.id,
      order: 1,
    },
  });

  const unitCalc2 = await prisma.unit.create({
    data: {
      title: 'الوحدة الثانية: سلوك الدالة ورسم المنحنيات',
      description: 'التزايد والتناقص، القيم العظمى والصغرى المحلية والمطلقة، ونقاط الانقلاب والتحدب.',
      subjectId: subCalculus.id,
      order: 2,
    },
  });

  const unitCalc3 = await prisma.unit.create({
    data: {
      title: 'الوحدة الثالثة: التكامل المحدد وتطبيقاته',
      description: 'طرق التكامل بالتعويض والتجزيء، وتطبيقات حساب المساحات والحجوم الدورانية.',
      subjectId: subCalculus.id,
      order: 3,
    },
  });

  // Lessons for Unit 1
  const lessonCalc1 = await prisma.lesson.create({
    data: {
      title: 'الدرس الأول: اشتقاق الدوال المثلثية المقلوبة والأساسية',
      slug: 'trig-derivatives',
      description: 'قوانين اشتقاق (جا، جتا، ظا، ظتا، قا، قتا) مع أمثلة تطبيقية وحلول نموذجية لأسئلة امتحانات سابقة.',
      durationMinutes: 28,
      order: 1,
      unitId: unitCalc1.id,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      contentMarkdown: `
# مقدمة في اشتقاق الدوال المثلثية

في هذا الدرس نتناول القواعد الأساسية لاشتقاق الدوال المثلثية الستة في منهج معادلة كلية الهندسة:

## 1. القوانين الأساسية:
* $\\frac{d}{dx}(\\sin u) = \\cos u \\cdot \\frac{du}{dx}$
* $\\frac{d}{dx}(\\cos u) = -\\sin u \\cdot \\frac{du}{dx}$
* $\\frac{d}{dx}(\\tan u) = \\sec^2 u \\cdot \\frac{du}{dx}$
* $\\frac{d}{dx}(\\cot u) = -\\csc^2 u \\cdot \\frac{du}{dx}$
* $\\frac{d}{dx}(\\sec u) = \\sec u \\tan u \\cdot \\frac{du}{dx}$
* $\\frac{d}{dx}(\\csc u) = -\\csc u \\cot u \\cdot \\frac{du}{dx}$

## 2. مثال تطبيقي من امتحانات سابقة:
**أوجد المشتقة الأولى للدالة:** $y = \\sin(3x^2 + 5x)$

**الحل:**
نطبق قاعدة السلسلة:
$$y' = \\cos(3x^2 + 5x) \\cdot (6x + 5) = (6x + 5)\\cos(3x^2 + 5x)$$

## 3. نصائح هامة للامتحان:
1. انتبه دائماً لإشارة السالب مع الدوال التي تبدأ بحرف (التاء / Co): جتا، قتا، ظتا.
2. لا تنسَ أبداً ضرب الناتج في مشتقة الزاوية.
3. راجع المتطابقات المثلثية الشهيرة مثل: $\\sin^2 x + \\cos^2 x = 1$ و $\\sec^2 x - \\tan^2 x = 1$.
      `,
    },
  });

  const lessonCalc2 = await prisma.lesson.create({
    data: {
      title: 'الدرس الثاني: الاشتقاق الضمني والبارامتري',
      slug: 'implicit-parametric-differentiation',
      description: 'كيفية التعامل مع العلاقات الضمنية والدوال المعرفة وسيطياً بارامترياً وحساب المشتقة الثانية.',
      durationMinutes: 35,
      order: 2,
      unitId: unitCalc1.id,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      contentMarkdown: `
# الاشتقاق الضمني والبارامتري

## أولاً: الاشتقاق الضمني
عندما تكون المعادلة تربط بين $x$ و $y$ بصورة غير صريحة، نشتق كل حد بالنسبة إلى $x$ مع مراعاة أن مشتقة أي حد يحتوي على $y$ تُضرب في $\\frac{dy}{dx}$ أو $y'$.

### مثال:
إذا كان $x^2 + y^2 = 25$، أوجد $\\frac{dy}{dx}$ عند النقطة $(3, 4)$.
**الحل:**
$$2x + 2y \\cdot y' = 0 \\implies y' = -\\frac{x}{y}$$
عند $(3, 4)$: $y' = -\\frac{3}{4}$.

## ثانياً: الاشتقاق البارامتري
إذا كان $x = f(t)$ و $y = g(t)$، فإن:
$$\\frac{dy}{dx} = \\frac{\\frac{dy}{dt}}{\\frac{dx}{dt}}$$
      `,
    },
  });

  const lessonCalc3 = await prisma.lesson.create({
    data: {
      title: 'الدرس الثالث: المعدلات الزمنية المرتبطة',
      slug: 'related-rates',
      description: 'استراتيجيات حل مسائل السلالم، خزانات المياه، الأجسام المتحركة، وتغير المساحات والحجوم مع الزمن.',
      durationMinutes: 42,
      order: 3,
      unitId: unitCalc1.id,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      contentMarkdown: `
# المعدلات الزمنية المرتبطة (Related Rates)

تعتبر المعدلات الزمنية المرتبطة من أهم الأسئلة التي تتكرر سنوياً في امتحانات معادلة كلية الهندسة.

## خطوات الحل النموذجية:
1. رسم شكل تخطيطي للمسألة وتحديد المتغيرات والثوابت.
2. كتابة العلاقة الرياضية الهندسية (فيثاغورس، تشابه مثلثات، قانون حجم أو مساحة).
3. اشتقاق العلاقة بالنسبة للزمن $t$.
4. التعويض بالقيم المعطاة عند اللحظة الزمنية المطلوبة لحساب المعدل المجهول.
      `,
    },
  });

  // Files for Lesson 1
  await prisma.lessonFile.create({
    data: {
      title: 'ملخص قوانين اشتقاق الدوال المثلثية PDF',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: '2.4 MB',
      lessonId: lessonCalc1.id,
    },
  });

  await prisma.lessonFile.create({
    data: {
      title: 'بنك أسئلة الاشتقاق من امتحانات 2018-2024 PDF',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf',
      fileSize: '4.8 MB',
      lessonId: lessonCalc1.id,
    },
  });

  // Units & Lessons for Physics
  const unitPhys1 = await prisma.unit.create({
    data: {
      title: 'الوحدة الأولى: الكهربية التيارية وقانونا كيرشوف',
      description: 'شدة التيار، فرق الجهد، المقاومة النوعية والتوصيلية الكهربية، وقوانين كيرشوف للدوائر المعقدة.',
      subjectId: subPhysics.id,
      order: 1,
    },
  });

  const lessonPhys1 = await prisma.lesson.create({
    data: {
      title: 'الدرس الأول: قانون أوم للدائرة المغلقة وحساب القدرة والطاقة',
      slug: 'ohms-law-closed-circuit',
      description: 'شرح مفصل للقوة الدافعة الكهربية والمقاومة الداخلية وقراءة الفولتميتر في الحالات المختلفة.',
      durationMinutes: 30,
      order: 1,
      unitId: unitPhys1.id,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      contentMarkdown: `
# قانون أوم للدائرة المغلقة

القوة الدافعة الكهربية للمصدر ($V_B$) هي الشغل الكلي المبذول لنقل كمية كهربية مقدارها 1 كولوم في الدائرة كلها (داخل المصدر وخارجه).

## القانون:
$$I = \\frac{V_B}{R_{eq} + r}$$
حيث:
* $V_B$: القوة الدافعة الكهربية للبطارية (فولت).
* $R_{eq}$: المقاومة المكافئة للدائرة الخارجية (أوم).
* $r$: المقاومة الداخلية للبطارية (أوم).
      `,
    },
  });

  console.log('✅ Created Units, Lessons, and Files for Calculus and Physics');

  // 6. Create Comprehensive Exams & Questions
  const examCalc2024 = await prisma.exam.create({
    data: {
      title: 'امتحان معادلة الهندسة التجريبي 2024 - التفاضل والتكامل',
      slug: 'calculus-mock-exam-2024',
      description: 'امتحان شامل يحاكي نظام البابل شيت الحديث لمعادلة كلية الهندسة بجامعة القاهرة وأسيوط وكفر الشيخ.',
      subjectId: subCalculus.id,
      sectionId: secEng.id,
      year: 2024,
      durationMinutes: 30,
      totalMarks: 20,
      passMarks: 10,
      isPublished: true,
    },
  });

  // Question 1
  const q1 = await prisma.question.create({
    data: {
      examId: examCalc2024.id,
      questionText: 'إذا كان $y = \\tan(2x)$، فإن المشتقة الأولى $\\frac{dy}{dx}$ تساوي:',
      explanation: 'مشتقة دالة الظل $\\tan(u)$ هي $\\sec^2(u) \\cdot u\'$. وبالتالي مشتقة $\\tan(2x)$ هي $2\\sec^2(2x)$.',
      marks: 4,
      order: 1,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: q1.id, text: '$2 \\sec^2(2x)$', isCorrect: true, order: 1 },
      { questionId: q1.id, text: '$\\sec^2(2x)$', isCorrect: false, order: 2 },
      { questionId: q1.id, text: '$2 \\tan^2(2x)$', isCorrect: false, order: 3 },
      { questionId: q1.id, text: '$-2 \\csc^2(2x)$', isCorrect: false, order: 4 },
    ],
  });

  // Question 2
  const q2 = await prisma.question.create({
    data: {
      examId: examCalc2024.id,
      questionText: 'نهاية الدالة $\\lim_{x \\to 0} \\frac{\\sin(5x)}{3x}$ تساوي:',
      explanation: 'باستخدام النظرية الأساسية لنهايات الدوال المثلثية $\\lim_{x \\to 0} \\frac{\\sin(ax)}{bx} = \\frac{a}{b}$، إذن الناتج هو $5/3$.',
      marks: 4,
      order: 2,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: q2.id, text: '$\\frac{5}{3}$', isCorrect: true, order: 1 },
      { questionId: q2.id, text: '$\\frac{3}{5}$', isCorrect: false, order: 2 },
      { questionId: q2.id, text: '$0$', isCorrect: false, order: 3 },
      { questionId: q2.id, text: '$1$', isCorrect: false, order: 4 },
    ],
  });

  // Question 3
  const q3 = await prisma.question.create({
    data: {
      examId: examCalc2024.id,
      questionText: 'ميل المماس للمنحنى $y = x^3 - 3x + 2$ عند النقطة التي إحداثيها السيني $x = 2$ هو:',
      explanation: 'المشتقة الأولى تمثل ميل المماس: $y\' = 3x^2 - 3$. بالتعويض عن $x = 2$: $y\' = 3(4) - 3 = 12 - 3 = 9$.',
      marks: 4,
      order: 3,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: q3.id, text: '$9$', isCorrect: true, order: 1 },
      { questionId: q3.id, text: '$6$', isCorrect: false, order: 2 },
      { questionId: q3.id, text: '$12$', isCorrect: false, order: 3 },
      { questionId: q3.id, text: '$3$', isCorrect: false, order: 4 },
    ],
  });

  // Question 4
  const q4 = await prisma.question.create({
    data: {
      examId: examCalc2024.id,
      questionText: 'تكامل $\\int (3x^2 + 4x - 5) \\, dx$ يساوي:',
      explanation: 'نزيد الأس واحداً ونقسم على الأس الجديد: $\\int 3x^2 dx = x^3$ و $\\int 4x dx = 2x^2$ و $\\int -5 dx = -5x$. فالناتج $x^3 + 2x^2 - 5x + c$.',
      marks: 4,
      order: 4,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: q4.id, text: '$x^3 + 2x^2 - 5x + c$', isCorrect: true, order: 1 },
      { questionId: q4.id, text: '$6x + 4 + c$', isCorrect: false, order: 2 },
      { questionId: q4.id, text: '$3x^3 + 4x^2 - 5x + c$', isCorrect: false, order: 3 },
      { questionId: q4.id, text: '$x^3 + 4x^2 - 5 + c$', isCorrect: false, order: 4 },
    ],
  });

  // Question 5
  const q5 = await prisma.question.create({
    data: {
      examId: examCalc2024.id,
      questionText: 'إذا كان $x = t^2$ و $y = 2t^3$، فإن المشتقة الأولى $\\frac{dy}{dx}$ عند $t = 1$ تساوي:',
      explanation: '$\\frac{dx}{dt} = 2t$ و $\\frac{dy}{dt} = 6t^2$. إذن $\\frac{dy}{dx} = \\frac{6t^2}{2t} = 3t$. عند $t = 1$ يكون الناتج $3(1) = 3$.',
      marks: 4,
      order: 5,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: q5.id, text: '$3$', isCorrect: true, order: 1 },
      { questionId: q5.id, text: '$6$', isCorrect: false, order: 2 },
      { questionId: q5.id, text: '$2$', isCorrect: false, order: 3 },
      { questionId: q5.id, text: '$1$', isCorrect: false, order: 4 },
    ],
  });

  // Another Exam for Physics
  const examPhys2024 = await prisma.exam.create({
    data: {
      title: 'امتحان الفيزياء العامة لمعادلة الهندسة - الدور الأول 2023',
      slug: 'physics-past-exam-2023',
      description: 'أسئلة التيار الكهربي وقوانين كيرشوف والحث الكهرومغناطيسي من امتحانات السنوات السابقة الرسمية.',
      subjectId: subPhysics.id,
      sectionId: secEng.id,
      year: 2023,
      durationMinutes: 45,
      totalMarks: 20,
      passMarks: 10,
      isPublished: true,
    },
  });

  const qp1 = await prisma.question.create({
    data: {
      examId: examPhys2024.id,
      questionText: 'إذا زاد طول سلك موصل إلى الضعف وقلت مساحة مقطعه إلى النصف، فإن مقاومته الكهربية:',
      explanation: 'المقاومة $R = \\rho \\frac{L}{A}$. إذا تضاعف الطول $L \\to 2L$ وقلت المساحة $A \\to A/2$ تصبح المقاومة الجديدة $R\' = \\rho \\frac{2L}{A/2} = 4R$ (تزداد إلى أربعة أمثالها).',
      marks: 10,
      order: 1,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: qp1.id, text: 'تزداد إلى 4 أمثالها', isCorrect: true, order: 1 },
      { questionId: qp1.id, text: 'تزداد إلى الضعف', isCorrect: false, order: 2 },
      { questionId: qp1.id, text: 'تقل إلى النصف', isCorrect: false, order: 3 },
      { questionId: qp1.id, text: 'تظل ثابتة', isCorrect: false, order: 4 },
    ],
  });

  const qp2 = await prisma.question.create({
    data: {
      examId: examPhys2024.id,
      questionText: 'وحدة قياس معامل الحث الذاتي (الهنري) تكافئ:',
      explanation: 'الهنري $H = \\text{Volt} \\cdot \\text{sec} / \\text{Ampere} = \\Omega \\cdot \\text{sec}$.',
      marks: 10,
      order: 2,
    },
  });

  await prisma.choice.createMany({
    data: [
      { questionId: qp2.id, text: 'أوم . ثانية', isCorrect: true, order: 1 },
      { questionId: qp2.id, text: 'فولت / ثانية', isCorrect: false, order: 2 },
      { questionId: qp2.id, text: 'أمبير . ثانية', isCorrect: false, order: 3 },
      { questionId: qp2.id, text: 'جول . ثانية', isCorrect: false, order: 4 },
    ],
  });

  console.log('✅ Created Interactive Exams with Questions and Explanations');

  // 7. Seed Student Progress and Exam Attempts
  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: lessonCalc1.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  await prisma.lessonProgress.create({
    data: {
      userId: student.id,
      lessonId: lessonCalc2.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // Attempt for student
  const attempt = await prisma.examAttempt.create({
    data: {
      userId: student.id,
      examId: examCalc2024.id,
      score: 16,
      totalPossible: 20,
      percentage: 80,
      isPassed: true,
      timeSpentSeconds: 745,
      completedAt: new Date(),
    },
  });

  // Fetch created choices for q1, q2, q3, q4, q5
  const choicesQ1 = await prisma.choice.findMany({ where: { questionId: q1.id } });
  const correctChoiceQ1 = choicesQ1.find((c) => c.isCorrect);

  if (correctChoiceQ1) {
    await prisma.examAnswer.create({
      data: {
        attemptId: attempt.id,
        questionId: q1.id,
        selectedChoiceId: correctChoiceQ1.id,
        isCorrect: true,
      },
    });
  }

  // 8. Seed Favorites & Notifications
  await prisma.favorite.create({
    data: {
      userId: student.id,
      targetType: 'SUBJECT',
      targetId: subCalculus.id,
    },
  });

  await prisma.favorite.create({
    data: {
      userId: student.id,
      targetType: 'EXAM',
      targetId: examCalc2024.id,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: 'مرحباً بك في منصة Moadla Pro! 🚀',
        message: 'تم تفعيل حسابك بنجاح. ابدأ الآن باختبار مستواك واستكشاف مواد معادلة الهندسة.',
        link: '/sections/engineering',
        isRead: false,
      },
      {
        userId: student.id,
        title: 'تمت إضافة امتحان تجريبي جديد 📝',
        message: 'تم نشر امتحان التفاضل والتكامل الشامل لعام 2024 مع شروحات نموذجية لجميع الأسئلة.',
        link: `/exams/${examCalc2024.id}`,
        isRead: false,
      },
    ],
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
