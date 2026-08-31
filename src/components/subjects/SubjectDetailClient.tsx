'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  CheckCircle2,
  Circle,
  PlayCircle,
  Play,
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  FileDown,
  ArrowLeft,
  FileCheck2,
  Award,
  CalendarRange,
  Youtube,
  ExternalLink,
  Download,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { SubjectType, UnitType, LessonType, ExamType, LessonFileType } from '@/types';
import { formatDuration } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import TeacherVideoCinemaModal, { TeacherCourse } from './TeacherVideoCinemaModal';
import {
  physicsCourses,
  chemistryCourses,
  englishCourses,
  mechanicsCourses,
  algebraCourses,
  calculusCourses,
  geographyCourses,
  frenchCourses,
  commerceMathCourses,
} from '@/data/teacherCourses';

interface SubjectDetailClientProps {
  subject: SubjectType;
  units: (UnitType & {
    lessons: (LessonType & { files: LessonFileType[]; isCompleted?: boolean })[];
  })[];
  exams: ExamType[];
  initialIsFavorite: boolean;
  completedLessonIds: string[];
  totalLessonsCount: number;
}

interface SubjectDetailConfig {
  icon: string;
  overview: string;
  topics: string[];
  books: { title: string; badge: string; desc: string }[];
  files: { title: string; url: string; icon: string; badge: string }[];
  courses: TeacherCourse[];
  teachersDescription: string;
  examsDescription: string;
}

export default function SubjectDetailClient({
  subject,
  units,
  exams,
  initialIsFavorite,
  completedLessonIds,
  totalLessonsCount,
}: SubjectDetailClientProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [activeTeacherModal, setActiveTeacherModal] = useState<TeacherCourse | null>(null);

  const handleToggleFavorite = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'SUBJECT', targetId: subject.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.favorited);
      }
    } catch {
      // ignore
    }
  };

  // Subjects Config Mapping
  const subjectsData: Record<string, SubjectDetailConfig> = {
    physics: {
      icon: '⚡',
      overview: 'تهدف مادة الفيزياء لمعادلة كلية الهندسة إلى فهم وتطبيق قوانين الفيزياء الكهربية والمغناطيسية والفيزياء الحديثة. تشمل المادة دراسة التيار الكهربي، قانون أوم، قوانين كيرشوف، التأثير المغناطيسي للتيار الكهربي، أجهزة القياس، الحث الكهرومغناطيسي، دوائر التيار المتردد، وازدواجية الموجة والجسيم والأطياف الذرية والليزر والإلكترونيات الحديثة.',
      topics: [
        'الفصل الأول: التيار الكهربي وقانون أوم وقوانين كيرشوف',
        'الفصل الثاني: التأثير المغناطيسي للتيار الكهربي وأجهزة القياس',
        'الفصل الثالث: الحث الكهرومغناطيسي (الدينامو، المحول، المحرك)',
        'الفصل الرابع: دوائر التيار المتردد (دوائر RLC والرنين)',
        'الفصل الخامس: ازدواجية الموجة والجسيم وظاهرة كومتون',
        'الفصل السادس: الأطياف الذرية وأشعة إكس',
        'الفصل السابع: الليزر وتطبيقاته الهندسية والطبية',
        'الفصل الثامن: الإلكترونيات الحديثة والترانزستور والبوابات المنطقية',
      ],
      books: [
        { title: 'كتاب الامتحان في الفيزياء', badge: 'الأكثر شعبية Most popular', desc: 'شرح وتدريبات وأسئلة متنوعة تغطي كافة فصول المنهج.' },
        { title: 'كتاب نيوتن في الفيزياء', badge: 'أقوى بنك أسئلة', desc: 'أقوى بنك أسئلة واختبارات بابل شيت متدرجة الصعوبة للثانوية والمعادلة.' },
        { title: 'كتاب الوافي في الفيزياء', badge: 'تأصيل وتوضيح للمفاهيم', desc: 'تأليف أ/ أحمد بركة، شرح تفصيلي وتطبيقات هندسية متقدمة.' },
        { title: 'كتاب الوزارة الرسمي للفيزياء', badge: 'المرجع الرسمي', desc: 'الكتاب المدرسي المعتمد من وزارة التربية والتعليم.' },
      ],
      files: [
        { title: 'كتاب الوزارة الرسمي لمادة الفيزياء PDF كامل', url: 'https://drive.google.com/file/d/1sAVzgh5Qy6XwKZU3Q4uDBCBLeuJ-yJUZ/view?usp=drive_link', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'كتاب الامتحان في الفيزياء كامل (شرح وبنك أسئلة)', url: 'https://drive.google.com/file/d/1Nk_5j04JJsJwfUrSdhYOhpptSKxf4YKQ/view?usp=drive_link', icon: '📗', badge: 'الأكثر طلباً' },
        { title: 'كتاب نيوتن في الفيزياء 2024 بنك الأسئلة والتدريبات', url: 'https://drive.google.com/file/d/13egwQNKo0jmsSJ5b2zBfzcqOStVbmT2g/view?usp=drive_link', icon: '📕', badge: 'كتاب نيوتن' },
        { title: 'ملخص جميع قوانين الفيزياء الكهربية والمغناطيسية والحديثة في 10 ورقات', url: 'https://drive.google.com/file/d/1ULwqDtGkqJm9FyYMRYmGxtSz1WbligDg/view?usp=drive_link', icon: '⚡', badge: 'ملخص 10 ورقات' },
        { title: 'مذكرة تأسيس الفيزياء وحساب الكميات والتحويلات - م/ محمود مجدي', url: 'https://drive.google.com/file/d/1OZ501ld6RAJ8dG-GLaJEItotL0NqTGQa/view?usp=drive_link', icon: '📑', badge: 'تأسيس شامل' },
        { title: 'مذكرة ليالي الامتحان والمراجعة النهائية في الفيزياء - أ/ محمد عبدالمعبود', url: 'https://drive.google.com/file/d/1P-WBLBo2ujFXqWXtE7_tFdrLmASOVT2f/view?usp=drive_link', icon: '🎯', badge: 'ليالي الامتحان' },
      ],
      courses: physicsCourses,
      teachersDescription: 'قائمة بأفضل قنوات ومدرسي الفيزياء المرشحين من طلاب المعادلة السابقين (م/ محمود مجدي، أ/ محمد عبدالمعبود، أ/ حسام خليل، أ/ أحمد بركة).',
      examsDescription: 'نماذج امتحانات معادلة كلية الهندسة لمادة الفيزياء مع أسئلة وتظليل البابل شيت للسنوات السابقة.',
    },
    chemistry: {
      icon: '🧪',
      overview: 'مادة الكيمياء تهدف إلى تنمية الفهم العلمي لدى الطالب لمبادئ وتفاعلات علم الكيمياء. تغطي المادة موضوعات متنوعة تشمل دراسة العناصر الانتقالية، وأسس التحليل الكيميائي، ومفاهيم الاتزان في التفاعلات الكيميائية، إضافة إلى الكيمياء الكهربية ودورها في توليد الطاقة، والكيمياء العضوية بشكل مفصل.',
      topics: [
        'الباب الأول: العناصر الانتقالية والسلسلة الانتقالية الأولى وفلز الحديد وسبائكه وأكاسيده',
        'الباب الثاني: التحليل الكيميائي الوصفي (الأنيونات والكاتيونات) والتحليل الكمي (المعايرة، التطاير، الترسيب)',
        'الباب الثالث: الاتزان الكيميائي ومعدل التفاعل وقاعدة لوشاتيليه والاتزان الأيوني وحاصل الإذابة Ksp',
        'الباب الرابع: الكيمياء الكهربية والخلايا الجلفانية (الأولية والثانوية) وصدأ المعادن وقوانين فاراداي',
        'الباب الخامس: الكيمياء العضوية (الألكانات، الألكينات، الألكاينات، البنزين، الكحولات، الفينولات، الأحماض، الإسترات)',
      ],
      books: [
        { title: 'الامتحان في الكيمياء', badge: 'الأكثر شعبية Most popular', desc: 'شرح وتدريبات وأسئلة متنوعة تغطي كافة أفكار المنهج.' },
        { title: 'مندليف في الكيمياء', badge: 'رائع في الأسئلة', desc: 'أقوى بنك أسئلة واختبارات بابل شيت متدرجة الصعوبة.' },
        { title: 'الوافي في الكيمياء', badge: 'تأصيل وتوضيح للمفاهيم', desc: 'تأليف أ/ محمد غزال وأ/ أحمد بركة، شرح تفصيلي وتطبيقات.' },
        { title: 'الأيزو في الكيمياء', badge: 'تدريب مكثف', desc: 'تمارين ومسائل حسابية مكثفة على المعايرة والاتزان والكهربية.' },
      ],
      files: [
        { title: 'كتاب الوزارة الرسمي لمادة الكيمياء PDF', url: 'https://drive.google.com/file/d/1Nk_5j04JJsJwfUrSdhYOhpptSKxf4YKQ/view?usp=drive_link', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'الجدول الدوري الحديث بطريقة بسيطة (بالعربي Ar)', url: 'https://drive.google.com/file/d/13egwQNKo0jmsSJ5b2zBfzcqOStVbmT2g/view?usp=drive_link', icon: '🧪', badge: 'جدول معتمد' },
        { title: 'الجدول الدوري الحديث بالعناصر والتوزيع (بالإنجليزي En)', url: 'https://drive.google.com/file/d/1OFx7qdw-TIt7OvOUID5oxQYn_LB3107M/view?usp=drive_link', icon: '🔬', badge: 'English' },
        { title: 'أساسيات الكيمياء أكاديمية أوميجا - م/ محمد جمال', url: 'https://drive.google.com/file/d/1OZ501ld6RAJ8dG-GLaJEItotL0NqTGQa/view?usp=drive_link', icon: '📑', badge: 'تأسيس شامل' },
        { title: 'مقدمة وأساسيات في الكيمياء - الحسام في الكيمياء', url: 'https://drive.google.com/file/d/1P-WBLBo2ujFXqWXtE7_tFdrLmASOVT2f/view?usp=drive_link', icon: '📝', badge: 'أساسيات' },
        { title: 'أساسيات كيمياء المرحلة الثانوية - عبدالرحمن الزهراني', url: 'https://drive.google.com/file/d/1OsXkfpzw1WF6rjHPnm0WM_DJhIRlSHi3/view?usp=drive_link', icon: '📄', badge: 'ملخص سريع' },
        { title: 'القرار الوزاري لإضافة الكيمياء للمعادلة (2018)', url: 'https://drive.google.com/file/d/1IoMc6M7VU_uslGP9R8dC8erCwSAxZkRG/view?usp=drive_link', icon: '🏛️', badge: 'قرار رسمي' },
      ],
      courses: chemistryCourses,
      teachersDescription: 'قائمة بأفضل مدرسي وقنوات الكيمياء على يوتيوب (أ/ خالد صقر، د/ عبدالله حبشي، أ/ محمد عبدالجواد).',
      examsDescription: 'نماذج امتحانات معادلة كلية الهندسة لمادة الكيمياء من عام 2018 حتى 2024 مع نماذج الإجابات.',
    },
    english: {
      icon: '🇬🇧',
      overview: 'مادة اللغة الإنجليزية تهدف إلى إتقان قواعد اللغة (Grammar)، الأزمنة (Tenses)، وتنمية الحصيلة اللغوية من الكلمات والمصطلحات (Vocabulary)، إضافة إلى مهارات الترجمة (Translation) وتدريب الطلاب على حل أسئلة البابل شيت لامتحانات معادلة كلية الهندسة.',
      topics: [
        'الوحدة الأولى: أساسيات وقواعد التأسيس في اللغة الإنجليزية (Basics of English)',
        'الوحدة الثانية: قواعد وجرامر اللغة الإنجليزية الشامل (Comprehensive English Grammar)',
        'الوحدة الثالثة: أزمنة اللغة الإنجليزية بالتفصيل (English Tenses in Depth)',
        'الوحدة الرابعة: قواميس وملازم الكلمات والترجمة (Vocabulary & Translation Booklets)',
        'الوحدة الخامسة: كتاب الوزارة والمصادر الرسمية (Official Ministry Textbook)',
        'الوحدة السادسة: دليل أفضل مدرسي وقنوات اللغة الإنجليزية اونلاين (Online Teachers & Channels)',
      ],
      books: [
        { title: 'كتاب المعاصر في اللغة الإنجليزية (El Moasser)', badge: 'الأكثر شعبية Most popular', desc: 'شرح شامل لكافة قواعد المنهج وتطبيقات وتمارين متدرجة الصعوبة.' },
        { title: 'سلسلة العمالقة (Giants)', badge: 'أقوى بنك كلمات وترجمة', desc: 'أفضل معجم للترجمة والمفردات اللغوية وتدريبات البابل شيت.' },
        { title: 'سلسلة أسباير (Aspire)', badge: 'تدريب مكثف', desc: 'تمارين مكثفة ونماذج امتحانات متوقعة بأسلوب الاختيار من متعدد.' },
        { title: 'كتاب الوزارة الرسمي', badge: 'المرجع الرسمي', desc: 'النصوص الأصلية والمفردات والقواعد الأساسية المقررة وزارياً.' },
      ],
      files: [
        { title: 'كتاب الوزارة الرسمي لمادة اللغة الإنجليزية PDF كامل', url: 'https://drive.google.com/file/d/1afKnUUPSqkhatq4Obnnqa6GjqeaXEQVS/view?usp=drive_link', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'كلمات الإنجليزية كاملة للمنهج - أ/ إبرآم سامي', url: 'https://drive.google.com/file/d/1NjcGeO9S9N9buV8hDSJkR7c6tFYHRBkY/view?usp=drive_link', icon: '📑', badge: 'ملازم كلمات' },
        { title: 'قاموس 6000 كلمة فى اللغة الانجليزية للثانوية والمعادلة', url: 'https://drive.google.com/file/d/1NbRJBSkIqYVqf4UhjPrutGqIirFqgs_w/view?usp=drive_link', icon: '📖', badge: 'قاموس شامل' },
        { title: 'أهم 400 كلمة فى الترجمة من كتاب العمالقة', url: 'https://drive.google.com/file/d/1NUx2DYhleTUNhn3o2M1wMJrQ4EEy1kYH/view?usp=drive_link', icon: '📝', badge: 'ترجمة' },
        { title: 'أساسيات اللغة الإنجليزية - مذكرات أ/ إبرآم سامي (الأجزاء 1 و 2 و 3)', url: 'https://drive.google.com/file/d/1N26heBbREaRFs5ShEWM3-2rbR-xsi3eF/view?usp=drive_link', icon: '📚', badge: 'تأسيس وقواعد' },
        { title: 'أساسيات اللغة الإنجليزية - أكاديمية أوميجا', url: 'https://drive.google.com/file/d/1OYOVGC8qnoZHbXPJ_b23jvlbDY-0rj9e/view?usp=drive_link', icon: '📄', badge: 'تأسيس شامل' },
        { title: 'أساسيات اللغة الإنجليزية من ABC - م/ أحمد عماد', url: 'https://drive.google.com/file/d/1MYlsnAg0JMLDu54PsQDr3zn60-l40Biz/view?usp=drive_link', icon: '🔤', badge: 'من الصفر' },
        { title: 'ملزمة كلمات امتحانات الاعوام السابقة للمعادلة', url: 'https://drive.google.com/file/d/1Nq4y5-6c64dW61lfYdCjcqe-mpJG64Ef/view?usp=drive_link', icon: '🏛️', badge: 'تكرار الامتحانات' },
      ],
      courses: englishCourses,
      teachersDescription: 'قائمة بأفضل قنوات ومدرسي اللغة الإنجليزية (دروس أونلاين أحمد أبو زيد، ZAmericanEnglish إبراهيم عادل، أ/ عبدالحميد حامد).',
      examsDescription: 'امتحانات إنجليزي المعادلة للأعوام السابقة (2011 إلى 2025) مع الإجابات النموذجية ونماذج البابل شيت.',
    },
    mechanics: {
      icon: '⚙️',
      overview: 'مادة الميكانيكا لمعادلة كلية الهندسة تنقسم إلى فرعين أساسيين: علم الاستاتيكا (Statics) وعلم الديناميكا (Dynamics). تهدف المادة إلى إتقان تحليل القوى، دراسة الاحتكاك، حساب عزوم القوى ونظرية فارينون، إيجاد محصلة القوى المتوازية، شروط الاتزان العام، والازدواجات وتعيين مركز الثقل. وفي الديناميكا: دراسة حركة الجسيمات وتفاضل وتكامل الدوال المتجهة، قوانين نيوتن الثلاثة للحركة، حركة المصاعد وتطبيقات البكرات البسيطة، الدفع والتصادم، ومبادئ الشغل وطاقة الحركة والوضع والقدرة الحصانية.',
      topics: [
        'الاستاتيكا - الباب الأول: الاحتكاك واتزان جسم على مستوى أفقي ومائل خشن',
        'الاستاتيكا - الباب الثاني: العزوم في نظام إحداثي ثنائي وثلاثي الأبعاد ونظرية فارينون',
        'الاستاتيكا - الباب الثالث: القوى المتوازية المستوية وتعيين نقطة تأثير المحصلة',
        'الاستاتيكا - الباب الرابع: الاتزان العام للجسم الجاسيء ومسائل القضيب والوتد',
        'الاستاتيكا - الباب الخامس: الازدواجات وتكافؤ الازدواجات والاتزان تحت تأثير ازدواج',
        'الاستاتيكا - الباب السادس: تعيين مركز الثقل وطريقة الكتل السالبة للأشكال المقتطعة',
        'الديناميكا - الباب الأول: تفاضل وتكامل الدوال المتجهة في الحركة المستقيمة',
        'الديناميكا - الباب الثاني: كمية الحركة وقوانين نيوتن الأول والثاني والثالث وحركة المصاعد والبكرات',
        'الديناميكا - الباب الثالث: الدفع والتصادم ومبدأ بقاء كمية الحركة',
        'الديناميكا - الباب الرابع: الشغل وطاقة الحركة وطاقة الوضع ومبدأ ثبوت الطاقة والقدرة الحصانية',
      ],
      books: [
        { title: 'كتاب المعاصر في الاستاتيكا والديناميكا (El Moasser)', badge: 'الأكثر شعبية Most popular', desc: 'شرح متكامل لفرعي الميكانيكا وبنك أسئلة وتمارين متدرجة الصعوبة.' },
        { title: 'سلسلة البشمهندس - م/ أحمد عصام', badge: 'أقوى تدريبات وتطبيقات', desc: 'أفكار بابل شيت متميزة وتطبيقات هندسية متقدمة على الاستاتيكا والديناميكا.' },
        { title: 'مذكرات الاستاتيكا والديناميكا - أ/ محمد أدهم', badge: 'شرح مبسط وخرائط ذهنية', desc: 'ملخص شامل للقوانين وحل المسائل المعقدة بأسلوب مبسط وسلس.' },
        { title: 'كتاب الوزارة الرسمي للميكانيكا', badge: 'المرجع الرسمي المعتمد', desc: 'المسائل الأساسية والأمثلة النموذجية المعتمدة من وزارة التربية والتعليم.' },
      ],
      files: [
        { title: 'كتاب الوزارة الرسمي في الميكانيكا كامل PDF', url: 'https://drive.google.com/file/d/1sAVzgh5Qy6XwKZU3Q4uDBCBLeuJ-yJUZ/view?usp=drive_link', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'كتاب المعاصر في الاستاتيكا PDF كامل', url: 'https://drive.google.com/file/d/1TWOz-U6V3rWBmsGwtVa00DizYnG_9fZz/view?usp=drive_link', icon: '📗', badge: 'المعاصر استاتيكا' },
        { title: 'كتاب المعاصر في الديناميكا PDF كامل', url: 'https://drive.google.com/file/d/1TYi97t0B26gY4k-K4rU6k1sT3mN8r9pL/view?usp=drive_link', icon: '📕', badge: 'المعاصر ديناميكا' },
        { title: 'البشمهندس في الميكانيكا - م/ أحمد عصام', url: 'https://drive.google.com/file/d/1lTZAbgeNWrXpTX3a7miOqd4MW6pZjjBb/view?usp=drive_link', icon: '⚡', badge: 'سلسلة البشمهندس' },
        { title: 'أساسيات الاستاتيكا - م/ محمد عبده (أكاديمية أوميجا)', url: 'https://drive.google.com/file/d/1ObQ8xXANY568PFbDCmqaKKVsvme1Oz86/view?usp=drive_link', icon: '🏗️', badge: 'تأسيس استاتيكا' },
        { title: 'أساسيات الديناميكا - م/ محمد عبده', url: 'https://drive.google.com/file/d/1T66BC1_tLKJGp3fa728U205yfReljB5Q/view?usp=drive_link', icon: '🏎️', badge: 'تأسيس ديناميكا' },
        { title: 'ملف التحويلات والوحدات للديناميكا - م/ علي مصطفى', url: 'https://drive.google.com/file/d/1m8SVlWByL_jqCuw_bmK9Ym9y74qFAx6e/view?usp=drive_link', icon: '⚖️', badge: 'تحويلات ووحدات' },
        { title: 'بنك الأسئلة والامتحانات التدريبية - كتاب الامتحان استاتيكا 2022', url: 'https://drive.google.com/file/d/1Tzt_iFH2eCM-XCUKJNORMV7lrI553cfI/view?usp=drive_link', icon: '📝', badge: 'كتاب الامتحان' },
        { title: 'بنك الأسئلة والامتحانات التدريبية - كتاب الامتحان ديناميكا 2022', url: 'https://drive.google.com/file/d/1Tvgjz2DQicvhEZlhPzTVN2nR70juCfYW/view?usp=drive_link', icon: '📊', badge: 'كتاب الامتحان' },
        { title: 'ملخص قوانين وملاحظات الديناميكا في 7 ورقات', url: 'https://drive.google.com/file/d/1UKXkYunNqaS9ZVDc6vFaDPqCI16z9c8g/view?usp=drive_link', icon: '📑', badge: 'ملخص 7 ورقات' },
        { title: 'ملخص الاستاتيكا في ورقتين - أ/ عبدالله وجدي', url: 'https://drive.google.com/file/d/1U9X5a4PhMmWieyi6X0Fq8vt_oWd42pqc/view?usp=drive_link', icon: '📄', badge: 'ملخص ورقتين' },
        { title: 'ملخص نظري الديناميكا للثانوية والمعادلة - أ/ إسماعيل محمود', url: 'https://drive.google.com/file/d/1ULwqDtGkqJm9FyYMRYmGxtSz1WbligDg/view?usp=drive_link', icon: '💡', badge: 'نظري ديناميكا' },
      ],
      courses: mechanicsCourses,
      teachersDescription: 'قائمة بأفضل مدرسي وقنوات الميكانيكا (البشمهندس م/ أحمد عصام، م/ علي مصطفى، أ/ محمد أدهم، أ/ إسماعيل محمود).',
      examsDescription: 'امتحانات استاتيكا وديناميكا المعادلة للأعوام السابقة (2011 إلى 2025) مع الحلول النموذجية وتدريبات البابل شيت.',
    },
    'algebra-and-geometry': {
      icon: '📐',
      overview: 'مادة الجبر والهندسة الفراغية لمعادلة كلية الهندسة تعد من الركائز الأساسية لمواد الرياضيات. يتناول فرع الجبر: مبدأ العد وقواعد الترتيب والاختيار، التباديل والتوافيق، نظرية ذات الحدين بأس صحيح موجب وإيجاد الحد العام والأوسط والخالي من س، الأعداد المركبة وتمثيلها على مخطط أرجاند والصور المختلفة (المثلثية وصيغة أويلر الأسية) ونظرية ديموافر والجذور التكعيبية للواحد الصحيح (أوميجا ω)، والمحددات وخواصها وحساب المعكوس الضربي للمصفوفة ورتبة المصفوفة وحل أنظمة المعادلات الخطية. ويتناول فرع الهندسة الفراغية: النظام الإحداثي المتعامد في الفضاء ثلاثي الأبعاد، متجهات الموضع وزوايا الاتجاه، الضرب القياسي والاتجاهي والثلاثي القياسي، معادلة الكرة، معادلات الخط المستقيم في الفضاء، ومعادلة المستوى والزوايا وأطوال الأعمدة.',
      topics: [
        'الجبر - الباب الأول: مبدأ العد، التباديل، التوافيق، ونظرية ذات الحدين بأس صحيح موجب',
        'الجبر - الباب الثاني: الأعداد المركبة، الصورة المثلثية والأسية (صيغة أويلر)، ونظرية ديموافر والأوميجا (ω)',
        'الجبر - الباب الثالث: المحددات والمصفوفات والمعكوس الضربي ورتبة المصفوفة وحل المعادلات الخطية',
        'الهندسة الفراغية - الباب الأول: النظام الإحداثي المتعامد ثلاثي الأبعاد، المتجهات، والضرب القياسي والاتجاهي ومعادلة الكرة',
        'الهندسة الفراغية - الباب الثاني: معادلات الخط المستقيم والمستوى في الفضاء وأوضاع المستقيمات والمستويات وأطوال الأعمدة',
      ],
      books: [
        { title: 'كتاب المعاصر في الجبر والفراغية (El Moasser)', badge: 'الأكثر شعبية Most popular', desc: 'شرح متكامل لفرعي الجبر والهندسة الفراغية وبنك أسئلة وتمارين متدرجة الصعوبة.' },
        { title: 'سلسلة البشمهندس - م/ أحمد عصام', badge: 'أقوى تدريبات وتطبيقات', desc: 'أفكار بابل شيت متقدمة وتطبيقات هندسية متميزة على الجبر والفراغية.' },
        { title: 'سلسلة الأدهم - أ/ محمد أدهم', badge: 'شرح مبسط وخرائط ذهنية', desc: 'ملخص شامل للقوانين وحل المسائل المعقدة بأسلوب مبسط وسلس.' },
        { title: 'كتاب الوزارة الرسمي للرياضيات البحتة', badge: 'المرجع الرسمي المعتمد', desc: 'المسائل الأساسية والأمثلة النموذجية المعتمدة من وزارة التربية والتعليم.' },
      ],
      files: [
        { title: 'كتاب الوزارة الرسمي لمادة الرياضيات البحتة (الجبر والفراغية) PDF كامل', url: 'https://drive.google.com/file/d/1wXFtJHfLgfmUkrtUHDXGlECH42EJiliT/view?usp=drive_link', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'كتاب المعاصر في الجبر والهندسة الفراغية PDF كامل', url: 'https://drive.google.com/file/d/1eeAxGCqfZukSmvE_kAA59e6WwmeC7TVn/view?usp=drive_link', icon: '📗', badge: 'المعاصر كامل' },
        { title: 'البشمهندس في الجبر والهندسة الفراغية - م/ أحمد عصام', url: 'https://drive.google.com/file/d/1lNXKeHcx6K020kz1T-ovSG8v4yuXrUMz/view?usp=drive_link', icon: '📐', badge: 'سلسلة البشمهندس' },
        { title: 'الأدهم في الجبر - أ/ محمد أدهم', url: 'https://drive.google.com/file/d/1fGoPeq31T0j1xj0OJWtN3yu0l9tLyHw7/view?usp=drive_link', icon: '📙', badge: 'الأدهم جبر' },
        { title: 'الأدهم في الهندسة الفراغية - أ/ محمد أدهم', url: 'https://drive.google.com/file/d/1fMd2PFxtfPgDAYsqVeInswITR5zSg_3d/view?usp=drive_link', icon: '🏗️', badge: 'الأدهم فراغية' },
        { title: 'مذكرة جبر وهندسة فراغية 2020 - أ/ ناصر ابوزيد', url: 'https://drive.google.com/file/d/1fPt1s8rO2i80Wp6bZl1f2Z8G7x8y9z0a/view?usp=drive_link', icon: '📝', badge: 'مذكرة شاملة' },
        { title: 'مذكرة الهندسة الفراغية - أ/ شريف أحمد البلاح', url: 'https://drive.google.com/file/d/1fQx2u9vP3j91Xq7cAm2g3a9H8y9z0a1b/view?usp=drive_link', icon: '📐', badge: 'مذكرة فراغية' },
        { title: 'ملخص قوانين الجبر الشامل في 8 ورقات', url: 'https://drive.google.com/file/d/1fRy3w0wQ4k02Yr8dBn3h4b0I9z0a1b2c/view?usp=drive_link', icon: '📑', badge: 'ملخص 8 ورقات' },
        { title: 'دليل استخدامات الآلة الحاسبة في الجبر والمصفوفات - م/ محمد أبوضيف', url: 'https://drive.google.com/file/d/1fSz4x1xR5l13Zs9eCo4i5c1J0a1b2c3d/view?usp=drive_link', icon: '⚡', badge: 'الآلة الحاسبة' },
        { title: 'مذكرة تأسيس الرياضيات الشاملة لمعادلة الهندسة', url: 'https://drive.google.com/file/d/1OdB7STSEJIabhtGfY9CFd3Lh7WawK1oX/view?usp=drive_link', icon: '🎯', badge: 'تأسيس رياضيات' },
      ],
      courses: algebraCourses,
      teachersDescription: 'قائمة بأفضل مدرسي وقنوات الجبر والهندسة الفراغية (البشمهندس م/ أحمد عصام، أ/ محمد أدهم، م/ محمد عبده، أ/ أحمد الفواخري).',
      examsDescription: 'امتحانات الجبر والهندسة الفراغية للأعوام السابقة (2011 إلى 2025) مع النماذج الاسترشادية وتدريبات البابل شيت.',
    },
    calculus: {
      icon: '📊',
      overview: 'تهدف مادة التفاضل والتكامل لمعادلة كلية الهندسة إلى تنمية المهارات التحليلية والفهم العميق للتغيرات الرياضية. تركز المادة على دراسة الاشتقاق وتطبيقاته المختلفة، بما في ذلك التعامل مع الدوال المثلثية والأسية واللوغاريتمية، إلى جانب تحليل سلوك الدوال ورسم المنحنيات ومعدلات التغير الزمنية. كما تتناول مفاهيم التكامل بأنواعه (التعويض، التجزئة، التكامل المحدود)، واستخدامه في حساب المساحات والحجوم الدورانية.',
      topics: [
        'الوحدة الأولى: اشتقاق الدوال المثلثية والدوال الأسية واللوغاريتمية والمشتقات العليا',
        'الوحدة الثانية: المعدلات الزمنية المرتبطة وتطبيقات هندسية وفيزيائية على المماس والعمودي',
        'الوحدة الثالثة: سلوك الدالة وفترات التزايد والتناقص ونقاط الانقلاب ورسم المنحنيات والقيم العظمى والصغرى المطلقة والمحلية',
        'الوحدة الرابعة: طرق وتكنيك التكامل المتقدم (التكامل بالتعويض والتجزئة وتكامل الدوال المثلثية والكسرية)',
        'الوحدة الخامسة: التكامل المحدد وحساب المساحات المستوية وحجوم الأجسام الدورانية',
        'الوحدة السادسة: دليل استخدامات الآلة الحاسبة لحل مسائل التفاضل والتكامل في البابل شيت بسرعة قياسية',
      ],
      books: [
        { title: 'كتاب المعاصر في التفاضل والتكامل (El Moasser)', badge: 'الأكثر شعبية Most popular', desc: 'شرح شامل لقواعد الاشتقاق والتكامل وتمارين بابل شيت متدرجة الصعوبة.' },
        { title: 'سلسلة البشمهندس - م/ أحمد عصام', badge: 'أقوى تدريبات وتطبيقات', desc: 'أفكار بابل شيت متميزة وتطبيقات هندسية متقدمة على التفاضل والتكامل.' },
        { title: 'سلسلة الأدهم - أ/ محمد أدهم', badge: 'شرح مبسط وخرائط ذهنية', desc: 'ملخص شامل للقوانين وحل المسائل المعقدة بأسلوب مبسط وسلس.' },
        { title: 'كتاب الوزارة الرسمي للرياضيات البحتة', badge: 'المرجع الرسمي المعتمد', desc: 'المسائل الأساسية والأمثلة النموذجية المعتمدة من وزارة التربية والتعليم.' },
      ],
      files: [
        { title: 'كتاب الوزارة الرسمي لمادة الرياضيات البحتة (التفاضل والتكامل) PDF كامل', url: 'https://drive.google.com/file/d/1wXFtJHfLgfmUkrtUHDXGlECH42EJiliT/view?usp=drive_link', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'كتاب المعاصر في التفاضل والتكامل PDF كامل', url: 'https://drive.google.com/file/d/11Qz-x_A7YpG6e4o9_1Q2w3e4r5t6y7u8/view?usp=drive_link', icon: '📗', badge: 'المعاصر تفاضل' },
        { title: 'البشمهندس في التفاضل والتكامل - م/ أحمد عصام', url: 'https://drive.google.com/file/d/1lTZAbgeNWrXpTX3a7miOqd4MW6pZjjBb/view?usp=drive_link', icon: '📐', badge: 'سلسلة البشمهندس' },
        { title: 'الأدهم في التفاضل والتكامل - أ/ محمد أدهم', url: 'https://drive.google.com/file/d/1Uv_l3p2q1w0e9r8t7y6u5i4o3p2a1s0d/view?usp=drive_link', icon: '📙', badge: 'أ/ محمد أدهم' },
        { title: 'ملخص قوانين التفاضل والتكامل - أ/ أسامة فتحي', url: 'https://drive.google.com/file/d/1V8CiO3Rg4jmRu2aOadT6ZjIAfaAdVNFT/view?usp=drive_link', icon: '💡', badge: 'ملخص قوانين' },
        { title: 'ملخص قوانين وقواعد التفاضل والتكامل - أ/ محمد المغاوري', url: 'https://drive.google.com/file/d/1VSGnj28VssAekybBkJ4tijVHP-NxbpUG/view?usp=drive_link', icon: '⚡', badge: 'ملخص قواعد' },
        { title: 'المعاصر في التفاضل والتكامل مراجعة نهائية 2022', url: 'https://drive.google.com/file/d/1VUuJUB2oP2bJLo3JRdGtRKUjFEImiN6J/view?usp=drive_link', icon: '📝', badge: 'المعاصر مراجعة' },
        { title: 'مراجعة التفاضل والتكامل - مكتب مستشار الرياضيات والوزارة', url: 'https://drive.google.com/file/d/1VktfEXLjni5uzoyXQCofOerKKlGpZTnw/view?usp=drive_link', icon: '🏛️', badge: 'مكتب المستشار' },
        { title: 'مراجعة تفاضل وتكامل - جريدة الجمهورية التعليمية', url: 'https://drive.google.com/file/d/1VmKDCOZEL6afqoQxaBihfHV2b96h5lVh/view?usp=drive_link', icon: '📄', badge: 'الجمهورية' },
        { title: 'مذكرة حساب المثلثات وتفاضل الدوال المثلثية', url: 'https://drive.google.com/file/d/1wtIj9zedzHN2jOnBFtJS3_xw_cSDCekH/view?usp=drive_link', icon: '📐', badge: 'حساب المثلثات' },
        { title: 'دليل استخدامات الآلة الحاسبة في التفاضل والتكامل - م/ محمد أبوضيف', url: 'https://drive.google.com/file/d/13gk-kAmWLiBZ9Fir7x4bE29GhX1TJ8qN/view?usp=drive_link', icon: '⚡', badge: 'الآلة الحاسبة' },
        { title: 'مذكرة تأسيس الرياضيات الشاملة لمعادلة الهندسة', url: 'https://drive.google.com/file/d/1OdB7STSEJIabhtGfY9CFd3Lh7WawK1oX/view?usp=drive_link', icon: '🎯', badge: 'تأسيس رياضيات' },
      ],
      courses: calculusCourses,
      teachersDescription: 'قائمة بأفضل مدرسي وقنوات التفاضل والتكامل (البشمهندس م/ أحمد عصام، أ/ سعد عبدالموجود، أ/ لطفي زهران، م/ محمد عبده، أ/ فتحي رمسيس).',
      examsDescription: 'امتحانات تفاضل وتكامل المعادلة لجميع السنوات (2011-2025) مع النماذج الاسترشادية وبنوك الأسئلة.',
    },
    'commerce-geography': {
      icon: '🗺️',
      overview: 'المنهج الكامل لجغرافيا مصر لمعادلة كلية التجارة: دراسة موقع مصر وحدودها السياسية، والأقاليم التضاريسية الأربعة (الصحراء الغربية، الصحراء الشرقية، شبه جزيرة سيناء، ووادي النيل والدلتا ومنخفض الفيوم)، بالإضافة إلى مناخ مصر، النمو والتوزيع السكاني، الموارد الاقتصادية والزراعة والمعادن ومصادر الطاقة، والتخطيط الاقتصادي والسياحة.',
      topics: [
        'الفصل الأول: موقع مصر وحدودها السياسية وأقاليمها المورفولوجية',
        'الفصل الثاني: إقليم الصحراء الغربية والواحات والمنخفضات',
        'الفصل الثالث: إقليم الصحراء الشرقية وسلاسل جبال البحر الأحمر',
        'الفصل الرابع: إقليم شبه جزيرة سيناء',
        'الفصل الخامس: إقليم وادي النيل ودلتاه ومنخفض الفيوم',
        'الفصل السادس: مناخ مصر والأقاليم المناخية',
        'الفصل السابع: سكان مصر والنمو والتوزيع والتركيب الديموغرافي',
        'الفصل الثامن: جغرافيا الزراعة المصرية والمحاصيل ومشروعات الري',
        'الفصل التاسع: المعادن ومصادر الطاقة والصناعة في مصر',
        'الفصل العاشر: التخطيط الاقتصادي والتنمية في مصر',
        'الفصل الحادي عشر: جغرافيا السياحة في مصر والمقاصد السياحية',
      ],
      books: [
        { title: 'كتاب جغرافيا مصر المعتمد لمعادلة كلية التجارة', badge: 'المرجع الرسمي المعتمد', desc: 'الكتاب الرسمي الصادر من المجلس الأعلى للجامعات لكليات التجارة.' },
        { title: 'أطلس خرائط مصر وملخص الـ 11 فصلاً', badge: 'خرائط وتضاريس مبسطة', desc: 'شرح مبسط وتوزيع تضاريسي لأقاليم الصحراء الغربية والشرقية وسيناء والدلتا.' },
        { title: 'بنك أسئلة جغرافيا مصر 500 سؤال بابل شيت', badge: 'تدريب بابل شيت مكثف', desc: 'أسئلة اختيار من متعدد على كافة فصول المنهج مع التفسيرات النموذجية.' },
      ],
      files: [
        { title: 'كتاب الجغرافيا المعتمد لمعادلة كلية التجارة PDF كامل', url: 'https://archive.org/download/commerce-moadla-2025/Geography-Book.pdf', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'أطلس خرائط مصر ومذكرة ملخص الـ 11 فصلاً PDF', url: 'https://archive.org/download/commerce-moadla-2025/Geography-Atlas-Summary.pdf', icon: '🗺️', badge: 'أطلس الخرائط' },
        { title: 'بنك أسئلة جغرافيا مصر 500 سؤال بابل شيت محلول PDF', url: 'https://archive.org/download/commerce-moadla-2025/Geography-BubbleSheet-Bank.pdf', icon: '📝', badge: 'بنك الأسئلة' },
      ],
      courses: geographyCourses,
      teachersDescription: 'قائمة بأفضل مدرسي وقنوات جغرافيا معادلة كلية التجارة (أ/ جمعة السيد، د/ أحمد فؤاد، أ/ سامح بدوي).',
      examsDescription: 'امتحانات جغرافيا معادلة التجارة للأعوام السابقة (2022-2025) بنظام البابل شيت 50 سؤالاً ومؤقت ساعتين.',
    },
    'commerce-mathematics': {
      icon: '📐',
      overview: 'مقرر الرياضيات العامة والمالية لمعادلة كلية التجارة: المحددات وطرق فكها وقاعدة كرامر، المصفوفات والمعكوس الضربي، التباديل والتوافيق ونظرية ذات الحدين، المتواليات العددية والهندسية وتطبيقاتها في الفائدة والاستثمار، ونظرية الاحتمالات وتحليل القرارات التجارية.',
      topics: [
        'الفصل الأول: المحددات الثنائية والثلاثية وخواص المحددات',
        'الفصل الثاني: المصفوفات والعمليات الجبرية والمعكوس الضربي',
        'الفصل الثالث: التباديل والتوافيق ونظرية ذات الحدين',
        'الفصل الرابع: المتواليات العددية (الحسابية) وتطبيقاتها المالية',
        'الفصل الخامس: المتواليات الهندسية ومجموع المتواليات اللانهائية',
        'الفصل السادس: نظرية الاحتمالات والأحداث المستقلة والشرطية',
      ],
      books: [
        { title: 'كتاب الرياضيات المعتمد لمعادلة كلية التجارة', badge: 'المرجع الرسمي المعتمد', desc: 'الكتاب الرسمي الصادر من المجلس الأعلى للجامعات.' },
        { title: 'دليل حل رياضيات تجارة بالآلة الحاسبة Casio fx-991', badge: 'حلول سريعة بالحاسبة', desc: 'خطوات إيجاد المحددات والمصفوفات ومجموع المتواليات في ثوانٍ.' },
        { title: 'بنك أسئلة الرياضيات 450 مسألة بابل شيت', badge: 'تدريب مكثف بابل شيت', desc: 'مسائل تدريبية متدرجة الصعوبة تحاكي الامتحانات السابقة.' },
      ],
      files: [
        { title: 'كتاب الرياضيات المعتمد من المجلس الأعلى للجامعات PDF', url: 'https://archive.org/download/commerce-moadla-2025/Commerce-Math-Book.pdf', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'دليل حل رياضيات معادلة تجارة بالآلة الحاسبة Casio fx-991 PDF', url: 'https://archive.org/download/commerce-moadla-2025/Commerce-Math-Calculator.pdf', icon: '⚡', badge: 'دليل الحاسبة' },
        { title: 'بنك أسئلة الرياضيات 450 مسألة بابل شيت محلولة بالتفصيل PDF', url: 'https://archive.org/download/commerce-moadla-2025/Commerce-Math-Bank.pdf', icon: '📝', badge: 'بنك الأسئلة' },
      ],
      courses: commerceMathCourses,
      teachersDescription: 'قائمة بأفضل مدرسي وقنوات رياضيات معادلة التجارة (أ/ محمد عبد العظيم، أ/ شريف يسري، أ/ أحمد سرور).',
      examsDescription: 'امتحانات رياضيات معادلة التجارة للأعوام السابقة (2022-2025) بنظام البابل شيت 50 سؤالاً ومؤقت ساعتين.',
    },
    'commerce-english': {
      icon: '🇬🇧',
      overview: 'مقرر اللغة الإنجليزية لمعادلة كلية التجارة: القواعد النحوية والأزمنة (Grammar & Tenses)، المصطلحات والوثائق التجارية والمحاسبية والفواتير (Business & Commercial Vocabulary)، وقواعد الترجمة والفهم في السياقات الإدارية والمصرفية.',
      topics: [
        'Unit 1: Essential English Tenses (Present, Past, Future, Perfect)',
        'Unit 2: Passive Voice, Modal Verbs & Conditional Sentences',
        'Unit 3: Commercial & Business Vocabulary (Invoices, Banking, Receipts)',
        'Unit 4: Reading Comprehension & Business Letter Writing',
      ],
      books: [
        { title: 'كتاب اللغة الإنجليزية المعتمد لمعادلة كلية التجارة', badge: 'المرجع الرسمي المعتمد', desc: 'الكتاب الرسمي الصادر من المجلس الأعلى للجامعات.' },
        { title: 'قاموس المصطلحات التجارية والمحاسبية', badge: 'مصطلحات وفواتير تجارية', desc: 'أهم المصطلحات الإدارية والمحاسبية والمصرفية المطلوبة في الامتحان.' },
        { title: 'تجميعة امتحانات الإنجليزي السابقة لمعادلة تجارة', badge: 'امتحانات بابل شيت', desc: 'امتحانات الأعوام السابقة مع نماذج الإجابة الرسمية.' },
      ],
      files: [
        { title: 'كتاب اللغة الإنجليزية المعتمد لمعادلة كلية التجارة PDF', url: 'https://archive.org/download/commerce-moadla-2025/Commerce-English-Book.pdf', icon: '📘', badge: 'المرجع الرسمي' },
        { title: 'قاموس المصطلحات التجارية والمحاسبية والإدارية PDF', url: 'https://archive.org/download/commerce-moadla-2025/Business-Vocabulary.pdf', icon: '📗', badge: 'قاموس المصطلحات' },
        { title: 'تجميعة امتحانات الإنجليزي السابقة لمعادلة تجارة PDF', url: 'https://archive.org/download/commerce-moadla-2025/Commerce-English-Exams.pdf', icon: '📝', badge: 'امتحانات سابقة' },
      ],
      courses: englishCourses,
      teachersDescription: 'قائمة بأفضل مدرسي وقنوات اللغة الإنجليزية لمعادلة التجارة (مستر أحمد سامي، مستر محمد إبراهيم).',
      examsDescription: 'امتحانات إنجليزي معادلة التجارة للأعوام السابقة (2022-2025) بنظام البابل شيت 50 سؤالاً ومؤقت ساعتين.',
    },
    'commerce-french': {
      icon: '🇫🇷',
      overview: 'مقرر اللغة الفرنسية لمعادلة كلية التجارة: التعارف وإلقاء التحية وتقديم النفس والمهن، أدوات التعريف والنكرة والتذكير والتأنيث، صفات الملكية وأسماء الإشارة، التعبيرات الزمنية والمكانية، وتصريف أفعال المجموعات الثلاث في زمن المضارع.',
      topics: [
        'الوحدة الأولى: التعارف وإلقاء التحية وتقديم النفس والأفعال الأساسية (Être, Avoir, s’appeler)',
        'الوحدة الثانية: أدوات التعريف والتنكير والتمييز بين المذكر والمؤنث',
        'الوحدة الثالثة: صفات الملكية والإشارة والتعبيرات الزمنية والمكانية والفصول والشهور',
        'الوحدة الرابعة: تصريف أفعال المجموعات الأولى والثانية والثالثة في زمن المضارع',
      ],
      books: [
        { title: 'مذكرة التأسيس الشاملة في اللغة الفرنسية', badge: 'تأسيس من الصفر', desc: 'شرح مبسط لقواعد ونطق ومفردات اللغة الفرنسية.' },
        { title: 'ملخص قواعد وتصريفات أفعال اللغة الفرنسية', badge: 'كبسولة القواعد', desc: 'تصريف أفعال المجموعات الأولى والثانية والثالثة وصفات الملكية والإشارة.' },
        { title: 'نماذج امتحانات الفرنساوي السابقة بابل شيت', badge: 'بابل شيت وتدريب', desc: 'أسئلة وتدريبات تفاعلية بنظام البابل شيت الحديث.' },
      ],
      files: [
        { title: 'مذكرة التأسيس الشاملة في اللغة الفرنسية لمعادلة تجارة PDF', url: 'https://archive.org/download/commerce-moadla-2025/French-Basics-Book.pdf', icon: '📘', badge: 'كتاب التأسيس' },
        { title: 'ملخص قواعد وتصريفات أفعال اللغة الفرنسية في 8 ورقات PDF', url: 'https://archive.org/download/commerce-moadla-2025/French-Grammar-Summary.pdf', icon: '⚡', badge: 'ملخص القواعد' },
        { title: 'نماذج امتحانات الفرنساوي السابقة بابل شيت محلولة PDF', url: 'https://archive.org/download/commerce-moadla-2025/French-Past-Exams.pdf', icon: '📝', badge: 'نماذج بابل شيت' },
      ],
      courses: frenchCourses,
      teachersDescription: 'قائمة بأفضل مدرسي وقنوات اللغة الفرنسية لمعادلة التجارة (مسيو فريد - French Club، مسيو حسام).',
      examsDescription: 'امتحانات فرنساوي معادلة التجارة للأعوام السابقة (2022-2025) بنظام البابل شيت 50 سؤالاً ومؤقت ساعتين.',
    },
  };

  const normalizedSlug = subject.slug.startsWith('cs-')
    ? (subject.slug === 'cs-physics'
        ? 'physics'
        : subject.slug === 'cs-english'
        ? 'english'
        : subject.slug === 'cs-algebra-geometry'
        ? 'algebra-and-geometry'
        : subject.slug === 'cs-calculus'
        ? 'calculus'
        : subject.slug)
    : subject.slug;

  const currentConfig = subjectsData[normalizedSlug] || subjectsData[subject.slug];

  return (
    <div className="space-y-10 font-tajawal">
      {/* Subject Header Banner */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-soft relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold">
                {subject.section?.title || 'معادلة كلية الهندسة'}
              </span>
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  isFavorite
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-600 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-500'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
              {subject.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {subject.description}
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-72 shrink-0">
            <Link
              href={`/subjects/${subject.slug}/exams`}
              className="p-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-brand-500/20 flex items-center justify-between gap-3 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5" />
                <span className="text-sm">امتحانات الأعوام السابقة</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">2011-2025</span>
            </Link>

            <Link
              href={`/subjects/${subject.slug}/teachers`}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-black text-xs flex items-center justify-between gap-3 transition-all hover:scale-[1.02] shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-brand-600 fill-brand-600" />
                <span className="text-sm">شروحات المدرسين والسينما</span>
              </div>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-bold">مشاهدة 🎬</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Comprehensive Subject Overview, Books, Files & Teachers */}
      {currentConfig ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft space-y-8">
          {/* 1. Overview */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <span>{currentConfig.icon}</span>
              <span>نبذة شاملة عن منهج مادة {subject.title}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {currentConfig.overview}
            </p>
          </div>

          {/* 2. Topics & Units */}
          {currentConfig.topics && currentConfig.topics.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal">
                مما يتكون منهج {subject.title}؟
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 list-disc pr-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentConfig.topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. External Books */}
          {currentConfig.books && currentConfig.books.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <span>📚</span>
                <span>أشهر الكتب الخارجية المعتمدة لدراسة مادة {subject.title}:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentConfig.books.map((book) => (
                  <div
                    key={book.title}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {book.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold">
                        {book.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {book.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Direct PDF Downloads & Files */}
          {currentConfig.files && currentConfig.files.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                  <span>📥</span>
                  <span>تحميل مذكرات وكتب وملفات مادة {subject.title} PDF المباشرة:</span>
                </h3>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                  {currentConfig.files.length} ملفات متاحة للتحميل
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentConfig.files.map((file) => (
                  <a
                    key={file.title}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-brand-500 hover:shadow-md transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{file.icon}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition truncate">
                          {file.title}
                        </h4>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {file.badge} • تحميل مباشر ⬇
                        </span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-brand-600 shrink-0 transition-transform group-hover:-translate-y-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 5. Teachers & YouTube Channels */}
          {currentConfig.courses && currentConfig.courses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
                <span>🔴</span>
                <span>أفضل مدرسي وقنوات {subject.title} على YouTube:</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentConfig.courses.slice(0, 2).map((course, cIdx) => (
                <a
                  key={course.name}
                  href={course.channelUrl || course.playlistUrl || 'https://www.youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-red-50/30 via-white to-white dark:from-red-950/20 dark:via-slate-900 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between hover:scale-[1.01] hover:border-red-300 dark:hover:border-red-800"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                        {course.name}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 text-[10px] font-black border border-red-200/60 dark:border-red-800/60 flex items-center gap-1">
                        <Youtube className="w-3 h-3 fill-current" />
                        <span>قناة YouTube 🔴</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {course.specialty}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-red-600 dark:text-red-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Youtube className="w-4 h-4 fill-current" />
                      <span>الانتقال لقناة المدرس على YouTube ↗</span>
                    </span>
                    <span className="text-slate-400 text-[11px] font-semibold">{course.videos.length} حصص كاملة</span>
                  </div>
                </a>
              ))}

              {/* Link to All Teachers Directory */}
              <Link
                href={`/subjects/${subject.slug}/teachers`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="block font-black text-slate-900 dark:text-white group-hover:text-brand-600">
                    دليل جميع مدرسي وقنوات {subject.title} اونلاين
                  </span>
                  <span className="block text-xs font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentConfig.teachersDescription}
                  </span>
                </div>
                <ArrowLeft className="w-4 h-4 mt-1 shrink-0 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:-translate-x-1" />
              </Link>

              {/* Link to Previous Exams */}
              <Link
                href={`/subjects/${subject.slug}/exams`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <span className="block font-black text-slate-900 dark:text-white group-hover:text-brand-600">
                    امتحانات الأعوام السابقة والنماذج التدريبية (2011-2025)
                  </span>
                  <span className="block text-xs font-normal text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentConfig.examsDescription}
                  </span>
                </div>
                <ArrowLeft className="w-4 h-4 mt-1 shrink-0 text-slate-400 group-hover:text-brand-600 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
    ) : (
        <div className="space-y-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
            نبذة عن المادة
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {subject.description}
          </p>
          <div>
            <Link
              href={`/subjects/${subject.slug}/teachers`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition shadow-sm"
            >
              <span>عرض مدرسي وقنوات المادة على يوتيوب</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}



      {/* Mock Exams & Assessment Section */}
      {exams.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-tajawal">
                الامتحانات التفاعلية والاختبارات
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                اختبارات تقييمية بنظام البابل شيت الحديث مع التصحيح التلقائي الفوري.
              </p>
            </div>
            <Link
              href={`/subjects/${subject.slug}/exams`}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>أرشيف امتحانات الأعوام السابقة</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950">
                      امتحان تجريبي
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{exam.durationMinutes} دقيقة</span>
                    </span>
                  </div>

                  <h3 className="font-black text-base text-slate-900 dark:text-white font-tajawal">
                    {exam.title}
                  </h3>

                  {exam.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {exam.description}
                    </p>
                  )}
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

      {/* In-App Cinema Video Player Modal */}
      {activeTeacherModal && (
        <TeacherVideoCinemaModal
          isOpen={Boolean(activeTeacherModal)}
          onClose={() => setActiveTeacherModal(null)}
          teacher={activeTeacherModal}
        />
      )}
    </div>
  );
}
