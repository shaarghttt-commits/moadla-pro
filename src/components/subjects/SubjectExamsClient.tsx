'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  FileText,
  Play,
  FileCheck2,
  Calendar,
  ExternalLink,
  Info,
  Search,
  Zap,
  BookOpen,
  CheckCircle2,
  Youtube,
} from 'lucide-react';
import TeacherVideoCinemaModal, { TeacherCourse } from './TeacherVideoCinemaModal';

export interface ExamVersionItem {
  name: string;
  url: string;
  badge?: string;
  isSolved?: boolean;
  type?: 'drive' | 'local' | 'online';
}

export interface YearExamPackage {
  year: number | string;
  title: string;
  subtitle?: string;
  badge?: string;
  versions: ExamVersionItem[];
  videoSolution?: {
    instructor: string;
    youtubeId: string;
    title: string;
    duration?: string;
  };
  onlineExamUrl?: string;
  notes?: string;
}

const chemistryHistoricalExams: YearExamPackage[] = [
  {
    year: 2024,
    title: 'امتحان الكيمياء لمعادلة كلية الهندسة 2024',
    subtitle: 'أحدث امتحان رسمي للمعادلة مع نسخ التدريب والامتحان الإلكتروني',
    badge: 'الأحدث 🌟',
    versions: [
      {
        name: 'نسخة زد أكاديمي (بدون حل)',
        url: 'https://drive.google.com/file/d/1eNI9Nyyw60O80bAHz3n7mNG9wpJ2qpm3/view?usp=drive_link',
        badge: 'زد أكاديمي',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة المعادلة سايت (بدون حل)',
        url: 'https://drive.google.com/file/d/1i5DjNhII4fzb0jI0NwKF4SJJaZS_1IQN/view?usp=drive_link',
        badge: 'المعادلة سايت',
        isSolved: false,
        type: 'drive',
      },
    ],
    onlineExamUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSdi2_96q0RdK7hsjI5fFEiIWBWJGyWBUf-uvTTvTkUfUAaBWQ/viewform?usp=dialog',
    notes: 'الامتحان الإلكتروني يتيح لك حل الأسئلة بنظام البابل شيت مع ظهور النتيجة الفورية والتصحيح.',
  },
  {
    year: 2023,
    title: 'امتحان الكيمياء لمعادلة كلية الهندسة 2023',
    subtitle: 'نسخة الحَفَّاز ونسخة أكاديمية أوميجا مع فيديو الحل الكامل',
    badge: 'شامل الحل 🎬',
    versions: [
      {
        name: 'نسخة الحَفَّاز (تحميل مباشر PDF)',
        url: '/uploads/files/كيمياء/1788006083509-امتحان_الكيمياء_للمعادلة_لعام_2023_-_نسخة_الحفاز.pdf',
        badge: 'تحميل مباشر',
        isSolved: false,
        type: 'local',
      },
      {
        name: 'نسخة الحَفَّاز (Google Drive)',
        url: 'https://drive.google.com/file/d/1ngWrK5uD0eRJjSniNwgE3ZgW49nRTLkA/view?usp=drivesdk',
        badge: 'الحَفَّاز',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة أكاديمية أوميجا (بالحل)',
        url: 'https://drive.google.com/file/d/139-Yhy5rzPBVrWRcPn0ppKweg6qMH7_1/view?usp=drive_link',
        badge: 'أوميجا • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    videoSolution: {
      instructor: 'أ/ محمد إبراهيم (الحَفَّاز)',
      youtubeId: '7xeXoVbHOdU',
      title: 'حل وتفسير امتحان كيمياء معادلة كلية الهندسة لعام 2023 بالكامل',
      duration: '42 دقيقة',
    },
  },
  {
    year: 2022,
    title: 'امتحان الكيمياء لمعادلة كلية الهندسة 2022',
    subtitle: 'نسخة أ/ محمد إبراهيم (الحَفَّاز) بالحل وفيديو الشرح',
    badge: 'محلول بالكامل ✅',
    versions: [
      {
        name: 'نسخة أ/ محمد إبراهيم - الحَفَّاز (تحميل مباشر PDF)',
        url: '/uploads/files/كيمياء/1788006087477-حل_امتحان_الكيمياء_للمعادلة_لعام_2022_-_نسخة_الحَفَّاز.pdf',
        badge: 'تحميل مباشر',
        isSolved: true,
        type: 'local',
      },
      {
        name: 'نسخة أ/ محمد إبراهيم - الحَفَّاز (Google Drive)',
        url: 'https://drive.google.com/file/d/15DuTqwcJ-rGsj0ErWm5adgRbkd1riBV_/view?usp=drive_link',
        badge: 'الحَفَّاز • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    videoSolution: {
      instructor: 'أ/ محمد إبراهيم (الحَفَّاز)',
      youtubeId: 'l-xVLULWk-A',
      title: 'حل امتحان كيمياء معادلة الهندسة 2022 وتوضيح أهم النقاط',
      duration: '38 دقيقة',
    },
  },
  {
    year: 2021,
    title: 'امتحان الكيمياء لمعادلة كلية الهندسة 2021',
    subtitle: 'نسخة أ/ محمد إبراهيم (الحَفَّاز) بالحل وفيديو الشرح',
    badge: 'محلول بالكامل ✅',
    versions: [
      {
        name: 'نسخة أ/ محمد إبراهيم - الحَفَّاز (تحميل مباشر PDF)',
        url: '/uploads/files/كيمياء/1788006090846-حل_امتحان_الكيمياء_للمعادلة_لعام_2021_-_نسخة_الحَفَّاز.pdf',
        badge: 'تحميل مباشر',
        isSolved: true,
        type: 'local',
      },
      {
        name: 'نسخة أ/ محمد إبراهيم - الحَفَّاز (Google Drive)',
        url: 'https://drive.google.com/file/d/158l3nfSDDnnPir6vOq7OysZ8nKVZUz7f/view?usp=drive_link',
        badge: 'الحَفَّاز • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    videoSolution: {
      instructor: 'أ/ محمد إبراهيم (الحَفَّاز)',
      youtubeId: 'VIdjiFF2vMg',
      title: 'حل نموذج امتحان الكيمياء للمعادلة لعام 2021 مع خطوات التظليل',
      duration: '45 دقيقة',
    },
  },
  {
    year: 2020,
    title: 'امتحان الكيمياء لمعادلة كلية الهندسة 2020',
    subtitle: 'نسخة الحَفَّاز ونسخة أكاديمية أوميجا مع فيديو الحل',
    badge: 'محلول بالكامل ✅',
    versions: [
      {
        name: 'نسخة أ/ محمد إبراهيم - الحَفَّاز (تحميل مباشر PDF)',
        url: '/uploads/files/كيمياء/1788006094825-حل_امتحان_الكيمياء_للمعادلة_لعام_2020_-_نسخة_الحَفَّاز.pdf',
        badge: 'تحميل مباشر',
        isSolved: true,
        type: 'local',
      },
      {
        name: 'نسخة أ/ محمد إبراهيم - الحَفَّاز (Google Drive)',
        url: 'https://drive.google.com/file/d/156HbxZFbzaGKmGO7D4KmJKL-7-ZyXBmm/view?usp=drive_link',
        badge: 'الحَفَّاز • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة أكاديمية أوميجا (بالحل)',
        url: 'https://drive.google.com/file/d/13A7Hlj-lm6CtXb4PHl3wAFtXjPmkgiL3/view?usp=drive_link',
        badge: 'أوميجا • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    videoSolution: {
      instructor: 'أ/ محمد إبراهيم (الحَفَّاز)',
      youtubeId: 'z99hg1qXTYs',
      title: 'حل وتفسير أسئلة امتحان كيمياء المعادلة دور 2020',
      duration: '35 دقيقة',
    },
  },
  {
    year: 2019,
    title: 'امتحان الكيمياء لمعادلة كلية الهندسة 2019',
    subtitle: 'أول امتحان رسمي في تاريخ مادة الكيمياء لمعادلة الهندسة',
    badge: 'أول دور رسمي 🏛️',
    versions: [
      {
        name: 'نسخة أ/ محمد إبراهيم - الحَفَّاز (تحميل مباشر PDF)',
        url: '/uploads/files/كيمياء/1788006099205-حل_امتحان_الكيمياء_للمعادلة_لعام_2019_-_نسخة_الحَفَّاز.pdf',
        badge: 'تحميل مباشر',
        isSolved: true,
        type: 'local',
      },
      {
        name: 'نسخة أ/ محمد إبراهيم - الحَفَّاز (Google Drive)',
        url: 'https://drive.google.com/file/d/154hd-xpthVkr-PovQMt6eI5LVOUys6Ap/view?usp=drive_link',
        badge: 'الحَفَّاز • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة أكاديمية أوميجا (بالحل)',
        url: 'https://drive.google.com/file/d/13ZIqUMkl4k0_NBlMMOYzdhhfSqBuZ-YV/view?usp=drive_link',
        badge: 'أوميجا • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    videoSolution: {
      instructor: 'أ/ محمد إبراهيم (الحَفَّاز)',
      youtubeId: 'd0hxJETbdCQ',
      title: 'حل امتحان كيمياء معادلة الهندسة لعام 2019 بالتفصيل',
      duration: '40 دقيقة',
    },
  },
  {
    year: 'استرشادي',
    title: 'النماذج الاسترشادية الرسمية في الكيمياء',
    subtitle: 'نماذج الوزارة الاسترشادية للتدريب على أسئلة البابل شيت الحديثة',
    badge: 'نماذج تدريبية 📝',
    versions: [
      {
        name: 'النموذج الاسترشادي - نسخة الحَفَّاز (بالحل)',
        url: 'https://drive.google.com/file/d/153Jgz9efI6ZyzTYpeO-lTfMu8Efu5w1G/view?usp=drive_link',
        badge: 'الحَفَّاز • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي - نسخة أكاديمية أوميجا (بالحل)',
        url: 'https://drive.google.com/file/d/13Ep3A9zik7yt_qGNZNE8KsMo_K6hoIX-/view?usp=drive_link',
        badge: 'أوميجا • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    videoSolution: {
      instructor: 'أ/ محمد إبراهيم',
      youtubeId: 'gg9ZXTCxbvI',
      title: 'حل ومناقشة النموذج الاسترشادي الرسمي للكيمياء',
      duration: '50 دقيقة',
    },
  },
];

const englishHistoricalExams: YearExamPackage[] = [
  {
    year: 2024,
    title: 'امتحان اللغة الإنجليزية لمعادلة كلية الهندسة 2024',
    subtitle: 'أحدث امتحان رسمي للمعادلة مع نسخ التدريب المعتمدة',
    badge: 'الأحدث 🌟',
    versions: [
      {
        name: 'نسخة أ/ إبرآم سامي (بدون حل)',
        url: 'https://drive.google.com/file/d/1AoAiIP-hBrF5EHL7rELlhH4BCvrvWzrK/view?usp=drive_link',
        badge: 'إبرآم سامي',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة م/ خالد إبراهيم - مركز المهندس (بدون حل)',
        url: 'https://drive.google.com/file/d/1Aop9JXL2WuYaM-NbkiHDqwhoneFFLTWN/view?usp=drive_link',
        badge: 'مركز المهندس',
        isSolved: false,
        type: 'drive',
      },
    ],
    notes: 'الامتحان يركز على تريكات الأزمنة (Tenses) وقواعد المبني للمجهول والكلام المنقول والمفردات.',
  },
  {
    year: 2023,
    title: 'امتحان اللغة الإنجليزية لمعادلة كلية الهندسة 2023',
    subtitle: 'نسخة أ/ إبرآم سامي ونسخة مركز المهندس',
    badge: 'دورة 2023 📑',
    versions: [
      {
        name: 'نسخة أ/ إبرآم سامي (بدون حل)',
        url: 'https://drive.google.com/file/d/1ArtseR_zsLgouxIpH6l7Hqo7qSb424Bk/view?usp=drive_link',
        badge: 'إبرآم سامي',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة م/ خالد إبراهيم - مركز المهندس (بدون حل)',
        url: 'https://drive.google.com/file/d/1BCn2jztcwi37WMDtzKIWOvUWJcwLv_KN/view?usp=drive_link',
        badge: 'مركز المهندس',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2022,
    title: 'امتحان اللغة الإنجليزية لمعادلة كلية الهندسة 2022',
    subtitle: 'امتحان جامعة القاهرة مع نسخ الحل الكاملة ونسخة أكاديمية نيوتن',
    badge: 'شامل الحل 🎬',
    versions: [
      {
        name: 'نسخة أ/ إبرآم سامي (بالحل)',
        url: 'https://drive.google.com/file/d/1BJ6OweWlHvGf4o7t__8X-IHo5aObkRag/view?usp=drive_link',
        badge: 'محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة أ/ إبرآم سامي (بدون حل)',
        url: 'https://drive.google.com/file/d/1mJp3CmOAuqWgEY61117z_lNi3rzOJACr/view?usp=drive_link',
        badge: 'إبرآم سامي',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة جامعة القاهرة - مركز المهندس (بالحل)',
        url: 'https://drive.google.com/file/d/1BZIlR1LYZNDNKuwHcezd9UuUdeYdTLNm/view?usp=drive_link',
        badge: 'محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة جامعة القاهرة - مركز المهندس (بدون حل)',
        url: 'https://drive.google.com/file/d/1BaDdlBBvGqoATxdtdkqFDBxYSOa2H__q/view?usp=drive_link',
        badge: 'مركز المهندس',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة أكاديمية نيوتن (بالحل)',
        url: 'https://drive.google.com/file/d/1BJAFPlegj0572DwcU2GQ3lG6BDve3fb5/view?usp=drive_link',
        badge: 'نيوتن • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
  },
  {
    year: 2021,
    title: 'امتحان اللغة الإنجليزية لمعادلة كلية الهندسة 2021',
    subtitle: 'نسخة أ/ إبرآم سامي بالحل وبدون حل',
    badge: 'محلول ✅',
    versions: [
      {
        name: 'نسخة أ/ إبرآم سامي (بالحل)',
        url: 'https://drive.google.com/file/d/1C296D0oTjBaKd7cyfyOGEIqHwp2SBm7M/view?usp=drive_link',
        badge: 'محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة أ/ إبرآم سامي (بدون حل)',
        url: 'https://drive.google.com/file/d/1BpeVpfy8iVHktC8GFQyBwskOQ001jNpS/view?usp=drive_link',
        badge: 'إبرآم سامي',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2020,
    title: 'امتحان اللغة الإنجليزية لمعادلة كلية الهندسة 2020',
    subtitle: 'النسخة الأصلية ونسخة مركز المهندس وأ/ إبرآم سامي',
    badge: 'شامل الحل ✅',
    versions: [
      {
        name: 'نسخة أ/ إبرآم سامي (بالحل)',
        url: 'https://drive.google.com/file/d/1CfbNJzHvw-X_ov_vClgpJJThp9KLhymO/view?usp=drive_link',
        badge: 'محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة مركز المهندس - م/ خالد إبراهيم (بالحل)',
        url: 'https://drive.google.com/file/d/1CK66He-LpdGoWg-TlNbN1iz3BM1v3En5/view?usp=drive_link',
        badge: 'محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'النسخة الأصلية (بدون حل)',
        url: 'https://drive.google.com/file/d/1CVNXovje44LaBWmEnjMdDhvuQR6mA3aL/view?usp=drive_link',
        badge: 'أصلية',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة أ/ إبرآم سامي (بدون حل)',
        url: 'https://drive.google.com/file/d/1CSvc0zfStQI1k5dhoePkqlk2t-ibdU3T/view?usp=drive_link',
        badge: 'إبرآم سامي',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2019,
    title: 'امتحان اللغة الإنجليزية لمعادلة كلية الهندسة 2019',
    subtitle: 'النسخة الأصلية المعتمدة لامتحان المعادلة',
    badge: 'نسخة أصلية 🏛️',
    versions: [
      {
        name: 'الامتحان - نسخة أصلية (بدون حل)',
        url: 'https://drive.google.com/file/d/1gUy5J6ZAPvGIQh7flFxaDCy4KVGq7c6F/view?usp=drive_link',
        badge: 'أصلية',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2018,
    title: 'امتحان اللغة الإنجليزية لمعادلة الهندسة 2018 (جامعة القاهرة)',
    subtitle: 'امتحان جامعة القاهرة المعتمد',
    badge: 'جامعة القاهرة',
    versions: [
      {
        name: 'الامتحان (جامعة القاهرة) - نسخة أصلية (بدون حل)',
        url: 'https://drive.google.com/file/d/1gWbeOXwZ98EpiIe0mJ2uap9HvAck7mi0/view?usp=drive_link',
        badge: 'جامعة القاهرة',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2017,
    title: 'امتحان اللغة الإنجليزية لمعادلة الهندسة 2017 (جامعة القاهرة)',
    subtitle: 'نسخة مركز المستقبل المعتمدة',
    badge: 'مركز المستقبل',
    versions: [
      {
        name: 'الامتحان (جامعة القاهرة) - نسخة مركز المستقبل (بدون حل)',
        url: 'https://drive.google.com/file/d/1KSFqyQAehtjomp-QGI9emF1dxsVD-ddA/view?usp=drive_link',
        badge: 'مركز المستقبل',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2016,
    title: 'امتحان اللغة الإنجليزية لمعادلة الهندسة 2016 (جامعة القاهرة)',
    subtitle: 'امتحان جامعة القاهرة المعتمد',
    badge: 'جامعة القاهرة',
    versions: [
      {
        name: 'الامتحان (جامعة القاهرة) - نسخة أصلية (بدون حل)',
        url: 'https://drive.google.com/file/d/1ga6C-Ra89yJirUhgzVsG1X16tDewxaZn/view?usp=drive_link',
        badge: 'جامعة القاهرة',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 'استرشادي',
    title: 'النماذج الاسترشادية الرسمية الـ 10 في اللغة الإنجليزية',
    subtitle: 'حزمة كاملة تضم 10 نماذج استرشادية للتدريب على أسئلة البابل شيت الحديثة',
    badge: '10 نماذج تدريبية 📝',
    versions: [
      {
        name: 'النموذج الاسترشادي 1 (PDF)',
        url: 'https://drive.google.com/file/d/1J7sDRTdbg056IvT9x1FP-wZAtwIusZwH/view?usp=drive_link',
        badge: 'نموذج 1',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 2 (PDF)',
        url: 'https://drive.google.com/file/d/1yq8UKpkuhCBJY3AsFxGDLGujJ3fZ4mHd/view?usp=drive_link',
        badge: 'نموذج 2',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 3 (PDF)',
        url: 'https://drive.google.com/file/d/1_s49Qc1s0m6Yozj2wPBmJVmd46dZ-fiy/view?usp=drive_link',
        badge: 'نموذج 3',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 4 (PDF)',
        url: 'https://drive.google.com/file/d/1xB4thQoU4LZdajChnc62fOOPDcigYeX1/view?usp=drive_link',
        badge: 'نموذج 4',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 5 (PDF)',
        url: 'https://drive.google.com/file/d/1eNd-Udy0dcWTS7jKNJfW6DIH7JW36MKJ/view?usp=drive_link',
        badge: 'نموذج 5',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 6 (PDF)',
        url: 'https://drive.google.com/file/d/1--oHCI6ig8pBqNsX_d5kOjWiS9LHxXlb/view?usp=drive_link',
        badge: 'نموذج 6',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 7 (PDF)',
        url: 'https://drive.google.com/file/d/1yUWDTO475jWDnEIic0qFbNc_SqYusGj7/view?usp=drive_link',
        badge: 'نموذج 7',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 8 (PDF)',
        url: 'https://drive.google.com/file/d/1yr0SRVP06deygYh3BSPwiA_gatoAyTBe/view?usp=drive_link',
        badge: 'نموذج 8',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 9 (PDF)',
        url: 'https://drive.google.com/file/d/1ZGPtyG9LJx-Tg56YWz-ZGctbj6cXfwta/view?usp=drive_link',
        badge: 'نموذج 9',
        type: 'drive',
      },
      {
        name: 'النموذج الاسترشادي 10 (PDF)',
        url: 'https://drive.google.com/file/d/18TK8EI1YVAim4LzcH8kqFALJIirQxDqS/view?usp=drive_link',
        badge: 'نموذج 10',
        type: 'drive',
      },
    ],
  },
  {
    year: 'ثانوية عامة',
    title: 'امتحانات اللغة الإنجليزية للثانوية العامة (2011 - 2024)',
    subtitle: 'تجميعة امتحانات الثانوية العامة دور أول وثاني وتجريبي مع نماذج الإجابة',
    badge: 'ثانوية عامة 🎓',
    versions: [
      {
        name: 'امتحان 2024 - نسخة العمالقة (بالحل)',
        url: 'https://drive.google.com/file/d/1JPrWK72MdlsZagylOsP6mQJKZiyGNc3-/view?usp=drive_link',
        badge: '2024 • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'امتحان 2024 - نسخة العمالقة (بدون حل)',
        url: 'https://drive.google.com/file/d/1JNbcH0BfskhpYfVtQBeGvRS8IG_aAfut/view?usp=drive_link',
        badge: '2024',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'امتحان 2023 - سلسلة أسباير (بدون حل)',
        url: 'https://drive.google.com/file/d/1JYnXRzp8Gi6aIjon7SyR95eY7rFnf_GN/view?usp=drive_link',
        badge: '2023',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'امتحان 2022 - كتاب العباقرة (بالحل)',
        url: 'https://drive.google.com/file/d/1JifJnz0YOD74K41VQoc5RAVACXIGn4gc/view?usp=drive_link',
        badge: '2022 • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'امتحان 2021 (بالحل)',
        url: 'https://drive.google.com/file/d/1Jp3RvPGerAK3S1DnrXEsCgrDtaic3ui_/view?usp=drive_link',
        badge: '2021 • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: '55 امتحان لغة إنجليزية من 2011 إلى 2020 مع نموذج الإجابة',
        url: 'https://drive.google.com/file/d/1MfDn63BPb8xgd6hSxiL8NcUNrpKM0pud/view?usp=drive_link',
        badge: '55 امتحان كامل',
        isSolved: true,
        type: 'drive',
      },
    ],
  },
  {
    year: 'Quizzes',
    title: 'اختبارات سريعة و Quizzes لغة إنجليزية',
    subtitle: 'كويزات واختبارات تفاعلية وأسئلة MCQ على الأساسيات والقواعد',
    badge: 'Quizzes ⚡',
    versions: [
      {
        name: '80 MCQ on basics p1 answered (بالحل)',
        url: 'https://drive.google.com/file/d/1M581rqTrdoDKc2xeCOXFM48s5NG3eb2Z/view?usp=drive_link',
        badge: '80 سؤال محلول',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نموذج إسترشادي 2022 - أ/ إبرآم سامي (PDF)',
        url: 'https://drive.google.com/file/d/1MUx9K6fz7M53O3ffUPJMvZSWhfAanRzN/view?usp=drive_link',
        badge: 'نموذج 2022',
        type: 'drive',
      },
      {
        name: 'امتحان basics 10 نقط - أكاديمية أوميجا (PDF)',
        url: 'https://drive.google.com/file/d/1MU5JtyXeMfoTgcXEmW8tC2ki9ycxzMgT/view?usp=drive_link',
        badge: 'أوميجا',
        type: 'drive',
      },
      {
        name: 'سريع - أحمد عصام فرحات QUIZ (PDF)',
        url: 'https://drive.google.com/file/d/1MMpWVeqyYxvtp5ypPIx9IyhEylcgxCLf/view?usp=drive_link',
        badge: 'كويز سريع',
        type: 'drive',
      },
    ],
  },
];

const mechanicsHistoricalExams: YearExamPackage[] = [
  {
    year: 2025,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2025 (MCQ)',
    subtitle: 'نسخة أكاديمية أوميجا ونسخة وحل منصة المعادلة',
    badge: 'الأحدث 🌟',
    versions: [
      {
        name: 'نسخة أكاديمية أوميجا (بدون حل)',
        url: 'https://drive.google.com/file/d/1_W268qMYrMhN-Is35mmylbQYNWHDhJ_a/view?usp=drive_link',
        badge: 'أوميجا',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة منصة المعادلة (بدون حل)',
        url: 'https://drive.google.com/file/d/1GH6plVo1Xwmiw_bxOSv9BiTdRHBNCNPQ/view?usp=drive_link',
        badge: 'منصة المعادلة',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'حل نسخة منصة المعادلة (PDF)',
        url: 'https://drive.google.com/file/d/1D37cr-JWsdN5XEPzu3416zyPWLhXb1c3/view?usp=drive_link',
        badge: 'محلول بالكامل ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    notes: 'امتحان حديث بنظام الاختيار من متعدد يغطي أحدث أفكار الاستاتيكا والديناميكا.',
  },
  {
    year: 2024,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2024 (MCQ)',
    subtitle: 'نسخة المعادلة سايت بدون حل وحل م/ محمد عبده',
    badge: 'بالحل المعتمد ✅',
    versions: [
      {
        name: 'نسخة المعادلة سايت (بدون حل)',
        url: 'https://drive.google.com/file/d/1-OgyuVV-zJ6oMdBh9-TppVmzU04fegOl/view?usp=drive_link',
        badge: 'بدون حل',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة المعادلة سايت - حل م/ محمد عبده',
        url: 'https://drive.google.com/file/d/1_HdjiCz4jjvjFO61xiAmUVG76_GfQi0q/view?usp=drive_link',
        badge: 'حل م/ محمد عبده ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    videoSolution: {
      instructor: 'م/ محمد عبده',
      youtubeId: 'hY3hN8R4pB0',
      title: 'حل وتفسير امتحان الميكانيكا لمعادلة هندسة 2024 بالكامل',
      duration: '1 ساعة و30 دقيقة',
    },
  },
  {
    year: 2023,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2023 (MCQ)',
    subtitle: 'نسخة م/ أحمد أبوزيد (الميكانيكي) وجزء الديناميكا م/ علي مصطفى',
    badge: 'محلول 🎬',
    versions: [
      {
        name: 'نسخة م/ أحمد أبوزيد - الميكانيكي (بدون حل)',
        url: 'https://drive.google.com/file/d/1-t2z1MEL1Q-WiEAyAo-csdcqALDPgiU6/view?usp=drive_link',
        badge: 'بدون حل',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة م/ أحمد أبوزيد - الميكانيكي (بالحل)',
        url: 'https://drive.google.com/file/d/1-z0typkAlmgbDpdHCtOzv5-PQLdf9Qx7/view?usp=drive_link',
        badge: 'الميكانيكي • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'جزء الديناميكا - نسخة م/ علي مصطفى (بالحل)',
        url: 'https://drive.google.com/file/d/15Mtjac1gjWALQeM6CChA3qe_m7J91DIO/view?usp=drive_link',
        badge: 'م/ علي مصطفى • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
    videoSolution: {
      instructor: 'م/ أحمد أبوزيد (الميكانيكي)',
      youtubeId: 'fT1mB9X4pW8',
      title: 'حل امتحان ميكانيكا معادلة هندسة 2023 بالتفصيل',
      duration: '1 ساعة و45 دقيقة',
    },
  },
  {
    year: 2022,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2022 (MCQ)',
    subtitle: 'نسخة أصلية ونسخة م/ أحمد أبوزيد (الميكانيكي) بالحل',
    badge: 'محلول بالكامل ✅',
    versions: [
      {
        name: 'نسخة أصلية (بدون حل)',
        url: 'https://drive.google.com/file/d/1DnvsQS0wdxz3EGDkSL84J8LK5FsKjGvL/view?usp=drive_link',
        badge: 'أصلية',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة م/ أحمد أبوزيد - الميكانيكي (بالحل)',
        url: 'https://drive.google.com/file/d/1hQyY9zuMKhpgMmbUtXW3ZLyd2nAbvRiJ/view?usp=drive_link',
        badge: 'الميكانيكي • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
  },
  {
    year: 2021,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2021 (MCQ)',
    subtitle: 'نسخة الجهبذ بدون حل ونسخة م/ أحمد أبوزيد بالحل',
    badge: 'شامل الحل ✅',
    versions: [
      {
        name: 'نسخة الجهبذ (بدون حل)',
        url: 'https://drive.google.com/file/d/1DsRQDtT7OZaIn7jzaMWw7jNF3fL0f3nK/view?usp=drive_link',
        badge: 'الجهبذ',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة م/ أحمد أبوزيد - الميكانيكي (بالحل)',
        url: 'https://drive.google.com/file/d/1hVyfM6LjJN8LJFpMoOPjZ0F9oXlFVLF3/view?usp=drive_link',
        badge: 'الميكانيكي • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
  },
  {
    year: 2020,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2020 (MCQ)',
    subtitle: 'نسخة الجهبذ ونسخة م/ أحمد أبوزيد (الميكانيكي) بالحل',
    badge: 'محلول بالكامل ✅',
    versions: [
      {
        name: 'نسخة الجهبذ (بدون حل)',
        url: 'https://drive.google.com/file/d/1DwvT2e58KR0XTyVZU35VK46hIwmi5Sb4/view?usp=drive_link',
        badge: 'الجهبذ',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة م/ أحمد أبوزيد - الميكانيكي (بالحل)',
        url: 'https://drive.google.com/file/d/1DuKbEaSbLTaOXnFKqR0BxX4IvbSb0vr2/view?usp=drive_link',
        badge: 'الميكانيكي • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
  },
  {
    year: 2019,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2019 (MCQ)',
    subtitle: 'نسخ م/ أحمد أبوزيد، م/ علي مصطفى، أكاديمية نيوتن، ومركز STP',
    badge: '6 نسخ متنوعة 🔥',
    versions: [
      {
        name: 'نسخة م/ أحمد أبوزيد (بالحل)',
        url: 'https://drive.google.com/file/d/1E2T5l64OGGeih3UbRvnCF2ZTBZGbPoPv/view?usp=drive_link',
        badge: 'الميكانيكي • محلول',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة م/ علي مصطفى (بالحل)',
        url: 'https://drive.google.com/file/d/1EI60WQho5hCgCEEXUkyeMQs1ALWe9YHy/view?usp=drive_link',
        badge: 'م/ علي مصطفى • محلول',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة أكاديمية نيوتن (بالحل)',
        url: 'https://drive.google.com/file/d/1EDw75gupqO26yLrCcQA0opWg9nSlWoah/view?usp=drive_link',
        badge: 'أكاديمية نيوتن',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة مركز STP - م/ سليمان سيد (بالحل)',
        url: 'https://drive.google.com/file/d/1ELsJlmdFRGV5DWxBvOlXx80ybxIPXFVT/view?usp=drive_link',
        badge: 'مركز STP',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة الجهبذ (بدون حل)',
        url: 'https://drive.google.com/file/d/1EZWnNHVzXl-x-EvaHM1AQS4d3Pc-0S6X/view?usp=drive_link',
        badge: 'الجهبذ',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة م/ أحمد أبوزيد (بدون حل)',
        url: 'https://drive.google.com/file/d/1EVckSCoKVUDadH1VnncLcLpuTZTVp5M1/view?usp=drive_link',
        badge: 'الميكانيكي',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2018,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2018',
    subtitle: 'النموذج الاسترشادي ونسخ الإمبراطور وم/ علي مصطفى والجهبذ',
    badge: 'شامل الحلول 📄',
    versions: [
      {
        name: 'النموذج الاسترشادي - أكاديمية أوميجا (بدون حل)',
        url: 'https://drive.google.com/file/d/1EJQKEZumaTs6yJeKlNWoAiPTVbSaiZy3/view?usp=drive_link',
        badge: 'استرشادي أوميجا',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة مركز الامبراطور - م/ أحمد أبوزيد (بالحل)',
        url: 'https://drive.google.com/file/d/1EmRJ1iLY24i5Y5DfodUo-iiXGqLbgjI9/view?usp=drive_link',
        badge: 'مركز الامبراطور • محلول',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة م/ علي مصطفى (بالحل)',
        url: 'https://drive.google.com/file/d/1EjNk2i31L9Rnzw-KN1nHFmmW6FqfmSHJ/view?usp=drive_link',
        badge: 'م/ علي مصطفى • محلول',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة أصلية (بدون حل)',
        url: 'https://drive.google.com/file/d/1hXzGe2E6gEHxSYnE8SlI9FDwXpdzOy9n/view?usp=drive_link',
        badge: 'أصلية',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة جامعة أخرى (بدون حل)',
        url: 'https://drive.google.com/file/d/1hbcgXALn440SMoINZMsXeM5BSiOTahY-/view?usp=drive_link',
        badge: 'جامعة أخرى',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة الجهبذ (بدون حل)',
        url: 'https://drive.google.com/file/d/1EjrBTmEJh8PFZiGnf72z99xyGaaN7w_g/view?usp=drive_link',
        badge: 'الجهبذ',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2017,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2017',
    subtitle: 'النموذج الاسترشادي وامتحانات الاستاتيكا والديناميكا دور أول وثان',
    badge: 'دور أول وثان 📄',
    versions: [
      {
        name: 'النموذج الاسترشادي - أكاديمية أوميجا (بالحل)',
        url: 'https://drive.google.com/file/d/1EoiBO0eHcimQgQsaRM-mk4KlAAUL8Etf/view?usp=drive_link',
        badge: 'استرشادي محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'نسخة م/ أحمد أبوزيد (بدون حل)',
        url: 'https://drive.google.com/file/d/1KIck0nU3-kVajAu2TQDw4oY9rx6JgeKt/view?usp=drive_link',
        badge: 'الميكانيكي',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'استاتيكا دور أول - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/1JhseYIBhjhu6yLXTW8UijdTu1aWEbOWA/view?usp=drive_link',
        badge: 'استاتيكا دور أول',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'ديناميكا دور أول - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/1JkEX7kijXtN1YmayU3vW5hTBVeLRJ6fh/view?usp=drive_link',
        badge: 'ديناميكا دور أول',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'استاتيكا دور ثاني - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/1JkujhqyEtb8NZqKlSP9aAdMPFnNyzRv-/view?usp=drive_link',
        badge: 'استاتيكا دور ثان',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'ديناميكا دور ثاني - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/1JrAD-43STkvIYUKFWJCTgKRmU1kyRNsb/view?usp=drive_link',
        badge: 'ديناميكا دور ثان',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2016,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2016',
    subtitle: 'نسخة أصلية ونسخة م/ أحمد أبوزيد (الميكانيكي)',
    badge: 'معادلة 2016',
    versions: [
      {
        name: 'نسخة أصلية (بدون حل)',
        url: 'https://drive.google.com/file/d/1JuTSphe2kGV5SmqqYB6WGVcMFvxyTVdl/view?usp=drive_link',
        badge: 'أصلية',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'نسخة م/ أحمد أبوزيد - الميكانيكي (بدون حل)',
        url: 'https://drive.google.com/file/d/1KFSoZX2Ipj_Gsnhh_Fh1zENzZBrR9bAb/view?usp=drive_link',
        badge: 'الميكانيكي',
        isSolved: false,
        type: 'drive',
      },
    ],
  },
  {
    year: 2015,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2015',
    subtitle: 'نسخة م/ أحمد أبوزيد - الميكانيكي',
    badge: 'معادلة 2015',
    versions: [
      {
        name: 'امتحان 2015 - نسخة م/ أحمد أبوزيد (PDF)',
        url: 'https://drive.google.com/file/d/1KCQLz7Tg7N6F4tqAlSkuMIPTVpMc65PC/view?usp=drive_link',
        badge: 'الميكانيكي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2014,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2014',
    subtitle: 'نسخة م/ أحمد أبوزيد - الميكانيكي',
    badge: 'معادلة 2014',
    versions: [
      {
        name: 'امتحان 2014 - نسخة م/ أحمد أبوزيد (PDF)',
        url: 'https://drive.google.com/file/d/1KBBJeqY3bdU0ElvFFkxnBT2dbL5nSwV1/view?usp=drive_link',
        badge: 'الميكانيكي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2013,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2013',
    subtitle: 'نسخة م/ أحمد أبوزيد - الميكانيكي',
    badge: 'معادلة 2013',
    versions: [
      {
        name: 'امتحان 2013 - نسخة م/ أحمد أبوزيد (PDF)',
        url: 'https://drive.google.com/file/d/1K8PnUudnit4cK3lPUGqbO-WVYEr-QTzg/view?usp=drive_link',
        badge: 'الميكانيكي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2012,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2012',
    subtitle: 'نسخة م/ أحمد أبوزيد - الميكانيكي',
    badge: 'معادلة 2012',
    versions: [
      {
        name: 'امتحان 2012 - نسخة م/ أحمد أبوزيد (PDF)',
        url: 'https://drive.google.com/file/d/1K6wgrGgc3-QOUnnG_-VX05DU4x96j8dM/view?usp=drive_link',
        badge: 'الميكانيكي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2011,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2011',
    subtitle: 'نسخة م/ أحمد أبوزيد - الميكانيكي',
    badge: 'معادلة 2011',
    versions: [
      {
        name: 'امتحان 2011 - نسخة م/ أحمد أبوزيد (PDF)',
        url: 'https://drive.google.com/file/d/1K13h7vUoROVaPGJqp8d0irECZvBnpZKv/view?usp=drive_link',
        badge: 'الميكانيكي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2010,
    title: 'امتحان الميكانيكا لمعادلة كلية الهندسة 2010',
    subtitle: 'نسخة م/ أحمد أبوزيد - الميكانيكي',
    badge: 'معادلة 2010',
    versions: [
      {
        name: 'امتحان 2010 - نسخة م/ أحمد أبوزيد (PDF)',
        url: 'https://drive.google.com/file/d/1JzilibyanC7pk2ecXwYOFRkJe2sJWG-m/view?usp=drive_link',
        badge: 'الميكانيكي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2000,
    title: 'امتحانات سابقة ثانوية عامة في الميكانيكا',
    subtitle: 'امتحانات الاستاتيكا والديناميكا ونماذج البوكليت التجريبية',
    badge: 'ثانوية عامة 🎓',
    versions: [
      {
        name: 'امتحان الاستاتيكا ثانوية عامة 2021 (PDF)',
        url: 'https://drive.google.com/file/d/1TKVxyjhkEJp_SMvVzHqcerWVsd1D6hkq/view?usp=drive_link',
        badge: 'استاتيكا 2021',
        type: 'drive',
      },
      {
        name: '4 نماذج امتحانات ديناميكا بالإجابات - أ/ حسام الدين',
        url: 'https://drive.google.com/file/d/1TIbCzX-86FI09p32f1sjezPYZOSLIrFq/view?usp=drive_link',
        badge: 'أ/ حسام الدين • محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: '23 امتحان ديناميكا بنظام البوكليت بالإجابات',
        url: 'https://drive.google.com/file/d/1TIOq2XAn9qg7X9w4Bi5Pkzt6UUI4XVQz/view?usp=drive_link',
        badge: '23 بوكليت محلول ✅',
        isSolved: true,
        type: 'drive',
      },
      {
        name: 'امتحان استرشادي يونيو 2021 (بدون حل)',
        url: 'https://drive.google.com/file/d/1TVCXhj8FT-ga0whEPBsGbBrHIE_I9DfS/view?usp=drive_link',
        badge: 'استرشادي',
        isSolved: false,
        type: 'drive',
      },
      {
        name: 'إجابة الامتحان الاسترشادي يونيو 2021 (PDF)',
        url: 'https://drive.google.com/file/d/1TTNpY9S1KzSeWwGTrvPcADvP1r7IkM9z/view?usp=drive_link',
        badge: 'نموذج الإجابة ✅',
        isSolved: true,
        type: 'drive',
      },
    ],
  },
  {
    year: 1999,
    title: 'بنوك الأسئلة والمراجعات وليالي الامتحان الشاملة',
    subtitle: '250 سؤال MCQ، بنك كتاب الامتحان، وملخصات كبار الأساتذة',
    badge: 'بنوك أسئلة 🏆',
    versions: [
      {
        name: '250 سؤال استاتيكا بنظام MCQ - م/ أحمد أبوزيد (الميكانيكي)',
        url: 'https://drive.google.com/file/d/1U-0-1S2-TbDE0wgZE_gLJDw3AMZQSQVp/view?usp=drive_link',
        badge: '250 MCQ الميكانيكي',
        type: 'drive',
      },
      {
        name: 'بنك الأسئلة والامتحانات التدريبية - كتاب الامتحان استاتيكا 2022',
        url: 'https://drive.google.com/file/d/1Tzt_iFH2eCM-XCUKJNORMV7lrI553cfI/view?usp=drive_link',
        badge: 'كتاب الامتحان',
        type: 'drive',
      },
      {
        name: 'بنك الأسئلة والامتحانات التدريبية - كتاب الامتحان ديناميكا 2022',
        url: 'https://drive.google.com/file/d/1Tvgjz2DQicvhEZlhPzTVN2nR70juCfYW/view?usp=drive_link',
        badge: 'كتاب الامتحان',
        type: 'drive',
      },
      {
        name: 'ملخص استاتيكا 3 ث - أ/ سعد عبدالموجود',
        url: 'https://drive.google.com/file/d/1U7Zv3lcFkVkc-i3J0Z6oqrGeq4wY9uK2/view?usp=drive_link',
        badge: 'أ/ سعد عبدالموجود',
        type: 'drive',
      },
      {
        name: 'مراجعة ديناميكا - أ/ ناصر أبوزيد',
        url: 'https://drive.google.com/file/d/1U4tXOTz6P9ZFnnNUpgRubD066POd5pdp/view?usp=drive_link',
        badge: 'أ/ ناصر أبوزيد',
        type: 'drive',
      },
      {
        name: 'ملخص قوانين وملاحظات الديناميكا في 7 ورقات',
        url: 'https://drive.google.com/file/d/1UKXkYunNqaS9ZVDc6vFaDPqCI16z9c8g/view?usp=drive_link',
        badge: '7 ورقات ديناميكا',
        type: 'drive',
      },
      {
        name: 'ملخص الاستاتيكا في ورقتين - أ/ عبدالله وجدي',
        url: 'https://drive.google.com/file/d/1U9X5a4PhMmWieyi6X0Fq8vt_oWd42pqc/view?usp=drive_link',
        badge: 'ورقتين استاتيكا',
        type: 'drive',
      },
      {
        name: 'ملخص نظري الديناميكا للثانوية العامة - أ/ إسماعيل محمود',
        url: 'https://drive.google.com/file/d/1ULwqDtGkqJm9FyYMRYmGxtSz1WbligDg/view?usp=drive_link',
        badge: 'نظري الديناميكا',
        type: 'drive',
      },
    ],
  },
];

const algebraHistoricalExams: YearExamPackage[] = [
  {
    year: 2025,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2025',
    subtitle: 'أحدث نماذج امتحانات معادلة كلية الهندسة المنعقدة لعام 2025',
    type: 'original',
    notes: 'الامتحان الرسمي الشامل لجبر وفراغية المعادلة مع إجابات ونماذج زد أكاديمي وأوميجا.',
    versions: [
      {
        name: 'نسخة زد أكاديمي (الأصلية)',
        url: 'https://drive.google.com/file/d/1grDbaPbqdcb5XGMWW38bnD1tV1DuEgyQ/view?usp=drive_link',
        badge: 'نسخة أصلية 2025',
        type: 'drive',
      },
    ],
  },
  {
    year: 2024,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2024',
    subtitle: 'الامتحان الرسمي لجامعة القاهرة وجامعات مصر + الحل النموذجي',
    type: 'original',
    notes: 'نسخة غير محلولة للتدريب الذاتي + الحل بالتفصيل وخطوات الناتج من م/ محمد عبده.',
    versions: [
      {
        name: 'الامتحان بدون حل - نسخة مركز المتفوقين',
        url: 'https://drive.google.com/file/d/1LDbNUzQEaYctRiwBmPVi4WRcU8FPjceP/view?usp=drive_link',
        badge: 'غير محلول',
        type: 'drive',
      },
      {
        name: 'حل الامتحان بالتفصيل - م/ محمد عبده',
        url: 'https://drive.google.com/file/d/1L6-_-d6--AxqfR3lPVrJLi6WVaMvrylR/view?usp=drive_link',
        badge: 'محلول نموذجي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2023,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2023',
    subtitle: 'امتحان المعادلة 2023 بنظام البابل شيت الحديث',
    type: 'original',
    notes: 'النسخة الأصلية للتدريب + نموذج الحل المعتمد من م/ أحمد إسماعيل.',
    versions: [
      {
        name: 'الامتحان بدون حل - نسخة أوميجا',
        url: 'https://drive.google.com/file/d/1KywnCVhHiWHLqs9t7Qe0dvN9DbyPusnJ/view?usp=drive_link',
        badge: 'غير محلول',
        type: 'drive',
      },
      {
        name: 'حل الامتحان بالتفصيل - م/ أحمد إسماعيل',
        url: 'https://drive.google.com/file/d/1KucCfVQqX7VUK4_yaroE8kqSQlk2KHE_/view?usp=drive_link',
        badge: 'محلول نموذجي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2022,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2022',
    subtitle: 'امتحان المعادلة 2022 مع نماذج الإجابة وشرح الخطوات',
    type: 'original',
    notes: 'نسخة مركز ألفا بالحل + الحل التفصيلي لمسائل ذات الحدين والأعداد المركبة من م/ محمد عبده.',
    versions: [
      {
        name: 'الامتحان نسخة مركز ألفا (بالحل)',
        url: 'https://drive.google.com/file/d/1LYWjjF1M_avLVCrwXmF2eCvAy_uJqkz4/view?usp=drive_link',
        badge: 'نسخة ألفا بالحل',
        type: 'drive',
      },
      {
        name: 'حل الامتحان بالتفصيل - م/ محمد عبده',
        url: 'https://drive.google.com/file/d/1KpMhv8TTGoPQdn_B93YqbabFlopfP0wG/view?usp=drive_link',
        badge: 'محلول نموذجي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2021,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2021',
    subtitle: 'امتحان جامعة القاهرة الرسمي لعام 2021 (محلول وغير محلول)',
    type: 'original',
    notes: 'الامتحان الأصلي لجامعة القاهرة مع نموذج الإجابة وتوزيع الدرجات.',
    versions: [
      {
        name: 'الامتحان (جامعة القاهرة) - نسخة أصلية بدون حل',
        url: 'https://drive.google.com/file/d/1grDbaPbqdcb5XGMWW38bnD1tV1DuEgyQ/view?usp=drive_link',
        badge: 'بدون حل',
        type: 'drive',
      },
      {
        name: 'حل الامتحان (جامعة القاهرة) - نسخة أصلية بالحل',
        url: 'https://drive.google.com/file/d/1ggLCIDpfRGxU9pSwPPvpjz8zVOr8WDOR/view?usp=drive_link',
        badge: 'محلول بالكامل',
        type: 'drive',
      },
    ],
  },
  {
    year: 2020,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2020',
    subtitle: 'امتحان جامعة القاهرة لمعادلة 2020',
    type: 'original',
    notes: 'النسخة الأصلية المعتمدة لاختبارات جامعة القاهرة مع الحل.',
    versions: [
      {
        name: 'الامتحان (جامعة القاهرة) - بدون حل',
        url: 'https://drive.google.com/file/d/1gt66AyTG8z1IliLMUIxvjJCqInQNH-G5/view?usp=drive_link',
        badge: 'بدون حل',
        type: 'drive',
      },
      {
        name: 'حل الامتحان (جامعة القاهرة) - بالحل',
        url: 'https://drive.google.com/file/d/1gpuLpRDlMWP6CL6GOOPEDglPBt3O8oY1/view?usp=drive_link',
        badge: 'محلول',
        type: 'drive',
      },
    ],
  },
  {
    year: 2019,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2019',
    subtitle: 'نسخة أكاديمية أوميجا بالحل النموذجي',
    type: 'original',
    notes: 'شامل أسئلة التباديل والتوافيق والمحددات ومعادلات المستويات في الفضاء.',
    versions: [
      {
        name: 'امتحان 2019 بالحل - أكاديمية أوميجا',
        url: 'https://drive.google.com/file/d/1gpuLpRDlMWP6CL6GOOPEDglPBt3O8oY1/view?usp=drive_link',
        badge: 'محلول 2019',
        type: 'drive',
      },
    ],
  },
  {
    year: 2018,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2018',
    subtitle: 'نسخة أكاديمية أوميجا بالحل',
    type: 'original',
    notes: 'أهم أفكار الامتحانات في الجبر والهندسة الفراغية وحلول المسائل.',
    versions: [
      {
        name: 'امتحان 2018 بالحل - أكاديمية أوميجا',
        url: 'https://drive.google.com/file/d/1gpuLpRDlMWP6CL6GOOPEDglPBt3O8oY1/view?usp=drive_link',
        badge: 'محلول 2018',
        type: 'drive',
      },
    ],
  },
  {
    year: 2017,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2017',
    subtitle: 'امتحان 2017 بالحل المعتمد',
    type: 'original',
    notes: 'تطبيقات الأعداد المركبة ونظرية ديموافر والمحددات.',
    versions: [
      {
        name: 'امتحان 2017 بالحل - أكاديمية أوميجا',
        url: 'https://drive.google.com/file/d/1gpuLpRDlMWP6CL6GOOPEDglPBt3O8oY1/view?usp=drive_link',
        badge: 'محلول 2017',
        type: 'drive',
      },
    ],
  },
  {
    year: 2016,
    title: 'امتحان الجبر والهندسة الفراغية لمعادلة 2016',
    subtitle: 'نسخة أكاديمية ناسا بالحل الكامل',
    type: 'original',
    notes: 'الأسئلة المقالية والاختيارية لنظام المعادلة الكلاسيكي مع الحل.',
    versions: [
      {
        name: 'امتحان 2016 بالحل - أكاديمية ناسا',
        url: 'https://drive.google.com/file/d/1gpuLpRDlMWP6CL6GOOPEDglPBt3O8oY1/view?usp=drive_link',
        badge: 'محلول 2016',
        type: 'drive',
      },
    ],
  },
  {
    year: 2000,
    title: 'نماذج امتحانات الثانوية العامة والوزارة في الجبر والفراغية',
    subtitle: 'النماذج الرسمية الاسترشادية وامتحانات الدور الأول والثاني',
    type: 'mock',
    notes: 'نماذج وزارة التربية والتعليم الرسمية والامتحانات التجريبية المعتمدة.',
    versions: [
      {
        name: 'امتحان تجريبي يونيو 2021 (بدون حل)',
        url: 'https://drive.google.com/file/d/1eYbrj0WZM3dj3i-0zwuuPMvFlxLnyTFV/view?usp=drive_link',
        badge: 'تجريبي 2021',
        type: 'drive',
      },
      {
        name: 'حل امتحان تجريبي يونيو 2021 بالتفصيل',
        url: 'https://drive.google.com/file/d/1eSz3Fr1qxIjfc3TwL4PGAU2LY2WPmHpx/view?usp=drive_link',
        badge: 'محلول 2021',
        type: 'drive',
      },
      {
        name: 'نماذج امتحانات كتاب الوزارة الرسمي (بالحل الكامل)',
        url: 'https://drive.google.com/file/d/1ePTB3j5xBDnlGKAX5eup4Wsw2sLI6QJt/view?usp=drive_link',
        badge: 'نماذج الوزارة',
        type: 'drive',
      },
    ],
  },
  {
    year: 1999,
    title: 'بنوك الأسئلة والمراجعات النهائية ودليل الآلة الحاسبة',
    subtitle: 'المعاصر مراجعة نهائية، الجمهورية، وأقوى مذكرات ليلة الامتحان',
    type: 'mock',
    notes: 'تجميعة شاملة لأهم مذكرات المراجعة النهائية وبنوك الأسئلة والآلة الحاسبة في الجبر والهندسة الفراغية.',
    versions: [
      {
        name: 'المعاصر في الجبر والهندسة الفراغية مراجعة نهائية 2022',
        url: 'https://drive.google.com/file/d/1fqTFvCJAdeGOTL1kbv7aTNyEs93SNTFG/view?usp=drive_link',
        badge: 'المعاصر مراجعة',
        type: 'drive',
      },
      {
        name: 'مراجعة جريدة الجمهورية التعليمية في الجبر والفراغية',
        url: 'https://drive.google.com/file/d/1fowqbHGZMdfvgTdCRhFaj2PyH0S6YuXI/view?usp=drive_link',
        badge: 'الجمهورية',
        type: 'drive',
      },
      {
        name: 'مراجعة ليلة الامتحان في الجبر - أ/ علي الدين يحيى',
        url: 'https://drive.google.com/file/d/1fUiwSiT3mgwa0mldOo6jUVt4m2Ri2w_n/view?usp=drive_link',
        badge: 'ليلة الامتحان جبر',
        type: 'drive',
      },
      {
        name: 'مراجعة نهائية في الهندسة الفراغية (الجزء الأول)',
        url: 'https://drive.google.com/file/d/1frQIlfc0_F7J-lESYFs5oNLsO3K3PyI0/view?usp=drive_link',
        badge: 'فراغية جزء 1',
        type: 'drive',
      },
      {
        name: 'مراجعة نهائية في الهندسة الفراغية (الجزء الثاني)',
        url: 'https://drive.google.com/file/d/1fsTOY9xVrItrm4nISpHxGCnxMLLcShxa/view?usp=drive_link',
        badge: 'فراغية جزء 2',
        type: 'drive',
      },
      {
        name: 'ملخص قوانين الجبر في 8 ورقات',
        url: 'https://drive.google.com/file/d/1ejYoVUXZMs2-ZdD5WBD-TUvjeHQ-E8Nv/view?usp=drive_link',
        badge: 'ملخص 8 ورقات',
        type: 'drive',
      },
      {
        name: 'دليل استخدامات الآلة الحاسبة في الجبر والمصفوفات - م/ محمد أبوضيف',
        url: 'https://drive.google.com/file/d/13gk-kAmWLiBZ9Fir7x4bE29GhX1TJ8qN/view?usp=drive_link',
        badge: 'الآلة الحاسبة',
        type: 'drive',
      },
    ],
  },
];

const calculusHistoricalExams: YearExamPackage[] = [
  {
    year: 2025,
    title: 'امتحان التفاضل والتكامل لمعادلة 2025',
    subtitle: 'أحدث نماذج امتحانات معادلة كلية الهندسة المنعقدة لعام 2025',
    type: 'original',
    notes: 'الامتحان الرسمي المعتمد في التفاضل والتكامل لعام 2025 مع نموذج البابل شيت الأصلي.',
    versions: [
      {
        name: 'نسخة الامتحان الأصلية 2025',
        url: 'https://drive.google.com/file/d/1uFzdqlmeSzu8Yp4WpSSFaPp8L47pofSl/view?usp=drive_link',
        badge: 'نسخة أصلية 2025',
        type: 'drive',
      },
    ],
  },
  {
    year: 2024,
    title: 'امتحان التفاضل والتكامل لمعادلة 2024',
    subtitle: 'الامتحان الرسمي لجامعة القاهرة وجامعات مصر + الحل النموذجي',
    type: 'original',
    notes: 'نسخ متعددة غير محلولة للتدريب + نموذج الحل المعتمد من م/ أحمد إسماعيل.',
    versions: [
      {
        name: 'الامتحان بدون حل - نسخة أكاديمية أوميجا',
        url: 'https://drive.google.com/file/d/1NwvpSmCQ7iF4k3BCKk6Lw8s8EEtJ1uKy/view?usp=drive_link',
        badge: 'غير محلول',
        type: 'drive',
      },
      {
        name: 'الامتحان بدون حل - نسخة تطبيق معادلة هندسة',
        url: 'https://drive.google.com/file/d/1Pbw5b2esbeUR5iCTIcfRwEvyT_O6fZ6d/view?usp=drive_link',
        badge: 'تطبيق المعادلة',
        type: 'drive',
      },
      {
        name: 'حل الامتحان بالتفصيل - م/ أحمد إسماعيل',
        url: 'https://drive.google.com/file/d/1-6oQR4xBqrTPHE8AVE-LK5OKHZm7vwKW/view?usp=drive_link',
        badge: 'محلول نموذجي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2023,
    title: 'امتحان التفاضل والتكامل لمعادلة 2023',
    subtitle: 'امتحان المعادلة 2023 بنظام البابل شيت الحديث',
    type: 'original',
    notes: 'النسخة الأصلية غير محلولة + الحل التفصيلي لم/ علي مصطفى (دروس ميكانيكا ورياضيات).',
    versions: [
      {
        name: 'الامتحان بدون حل - م/ محمد عبده',
        url: 'https://drive.google.com/file/d/176EfWA3bl8T3XaNdEwhhULRZ9jPEncn4/view?usp=drive_link',
        badge: 'غير محلول',
        type: 'drive',
      },
      {
        name: 'حل الامتحان بالتفصيل - م/ علي مصطفى',
        url: 'https://drive.google.com/file/d/174zqBvpAFZYaTIbV4qKynxFj4MvRhDo1/view?usp=drive_link',
        badge: 'محلول نموذجي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2022,
    title: 'امتحان التفاضل والتكامل لمعادلة 2022',
    subtitle: 'امتحان المعادلة 2022 مع نماذج الإجابة وشرح الخطوات',
    type: 'original',
    notes: 'نسخ أوميجا ودريم مع الحل النموذجي لمسائل التكامل والمعدلات الزمنية من م/ محمد عبده.',
    versions: [
      {
        name: 'الامتحان بدون حل - نسخة أوميجا م/ محمد عبده',
        url: 'https://drive.google.com/file/d/177VTXD-W9VU_L4y_l7opuFmVWiIfOO45/view?usp=drive_link',
        badge: 'غير محلول',
        type: 'drive',
      },
      {
        name: 'الامتحان بدون حل - نسخة أكاديمية دريم',
        url: 'https://drive.google.com/file/d/1NoRKUw0EfmU6a672wfXAMs_ZBxscY19C/view?usp=drive_link',
        badge: 'أكاديمية دريم',
        type: 'drive',
      },
      {
        name: 'حل الامتحان بالتفصيل - أكاديمية أوميجا م/ محمد عبده',
        url: 'https://drive.google.com/file/d/17F5pXCy2qqEbeyPvPpBiIt-udf3sSeuU/view?usp=drive_link',
        badge: 'محلول نموذجي',
        type: 'drive',
      },
    ],
  },
  {
    year: 2021,
    title: 'امتحان التفاضل والتكامل لمعادلة 2021',
    subtitle: 'امتحان جامعة القاهرة الرسمي لعام 2021 (محلول وغير محلول)',
    type: 'original',
    notes: 'النسخة الأصلية لجامعة القاهرة ونسخة الجهبذ مع الحل الكامل من م/ محمد عبده.',
    versions: [
      {
        name: 'الامتحان (جامعة القاهرة) - بدون حل',
        url: 'https://drive.google.com/file/d/17eCBUqTqyscRBIP2CRjt_unARTCBbtnn/view?usp=drive_link',
        badge: 'بدون حل',
        type: 'drive',
      },
      {
        name: 'الامتحان نسخة الجهبذ - بدون حل',
        url: 'https://drive.google.com/file/d/17NyWMfXwejIWmG2mxIcJ_-F-VTznp9JN/view?usp=drive_link',
        badge: 'نسخة الجهبذ',
        type: 'drive',
      },
      {
        name: 'حل الامتحان (جامعة القاهرة) - م/ محمد عبده',
        url: 'https://drive.google.com/file/d/17XDjQAzZ2hwRrT1s2LwH3-EYCXH9o4ev/view?usp=drive_link',
        badge: 'محلول بالكامل',
        type: 'drive',
      },
    ],
  },
  {
    year: 2020,
    title: 'امتحان التفاضل والتكامل لمعادلة 2020',
    subtitle: 'امتحان جامعة القاهرة لمعادلة 2020 مع الحلول النموذجية',
    type: 'original',
    notes: 'حلول معتمدة من م/ علي مصطفى وأكاديمية أوميجا.',
    versions: [
      {
        name: 'حل الامتحان بالتفصيل - م/ علي مصطفى',
        url: 'https://drive.google.com/file/d/1hN64CB2ukzVSIR9Mz4Cmt1TDU1bnFf0V/view?usp=drive_link',
        badge: 'حل م/ علي مصطفى',
        type: 'drive',
      },
      {
        name: 'حل الامتحان بالتفصيل - أكاديمية أوميجا',
        url: 'https://drive.google.com/file/d/17tLHYL2ghd6dl0heuHVV_-Qw5aGBguOK/view?usp=drive_link',
        badge: 'حل أوميجا',
        type: 'drive',
      },
    ],
  },
  {
    year: 2019,
    title: 'امتحان التفاضل والتكامل لمعادلة 2019',
    subtitle: 'امتحان جامعة القاهرة 2019 (محلول وغير محلول)',
    type: 'original',
    notes: 'النسخة الأصلية غير محلولة + الحل المعتمد من أكاديمية أوميجا.',
    versions: [
      {
        name: 'الامتحان - نسخة أصلية بدون حل',
        url: 'https://drive.google.com/file/d/1hO5dgmk4KmAwN6qv_19GFtaSkSLfJUQn/view?usp=drive_link',
        badge: 'بدون حل',
        type: 'drive',
      },
      {
        name: 'حل الامتحان - أكاديمية أوميجا',
        url: 'https://drive.google.com/file/d/18JvLOfShXMAUyZZpneJ_z_WjVBn8ccXE/view?usp=drive_link',
        badge: 'محلول 2019',
        type: 'drive',
      },
    ],
  },
  {
    year: 2018,
    title: 'امتحان التفاضل والتكامل لمعادلة 2018',
    subtitle: 'نسخة أكاديمية أوميجا بالحل الكامل',
    type: 'original',
    notes: 'شامل أسئلة الاشتقاق الضمني والتكامل المحدد وتطبيقات المساحات.',
    versions: [
      {
        name: 'امتحان 2018 بالحل - أكاديمية أوميجا',
        url: 'https://drive.google.com/file/d/18QZJUQQ6m5xjDq3cixWAzZEYKK4SzB-E/view?usp=drive_link',
        badge: 'محلول 2018',
        type: 'drive',
      },
    ],
  },
  {
    year: 2017,
    title: 'النموذج الاسترشادي وامتحان التفاضل والتكامل لمعادلة 2017',
    subtitle: 'النموذج الرسمي الاسترشادي (محلول وغير محلول)',
    type: 'original',
    notes: 'النموذج الاسترشادي لوزارة التعليم العالي مع الحل الكامل من أوميجا.',
    versions: [
      {
        name: 'النموذج الاسترشادي - نسخة أصلية بدون حل',
        url: 'https://drive.google.com/file/d/1hM2Euh2mNbXEIajICfyyPa96C5FWxsyq/view?usp=drive_link',
        badge: 'استرشادي أصلي',
        type: 'drive',
      },
      {
        name: 'حل النموذج الاسترشادي - أكاديمية أوميجا',
        url: 'https://drive.google.com/file/d/18QhmTX1qIyNUwphvTEJfFPXEK3PC7-Ph/view?usp=drive_link',
        badge: 'محلول 2017',
        type: 'drive',
      },
    ],
  },
  {
    year: 2016,
    title: 'امتحانات التفاضل والتكامل السابقة (2011 - 2016)',
    subtitle: 'أرشيف امتحانات المعادلة لسنوات 2016، 2015، 2014، 2013، 2012، 2011',
    type: 'original',
    notes: 'أرشيف مركز المتفوقين لسنوات المعادلة الكلاسيكية.',
    versions: [
      {
        name: 'امتحان تفاضل وتكامل معادلة 2016 - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/18zU4En1oDdbkA9Gsw8XHWFLwnuX7UnEN/view?usp=drive_link',
        badge: 'معادلة 2016',
        type: 'drive',
      },
      {
        name: 'امتحان تفاضل وتكامل معادلة 2015 - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/191an7jrzfLjO5ZfePFi4aEps5e9K25l4/view?usp=drive_link',
        badge: 'معادلة 2015',
        type: 'drive',
      },
      {
        name: 'امتحان تفاضل وتكامل معادلة 2014 - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/192LXZUNRuw8dt2TI59j8b8-Svy_apO0Q/view?usp=drive_link',
        badge: 'معادلة 2014',
        type: 'drive',
      },
      {
        name: 'امتحان تفاضل وتكامل معادلة 2013 - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/194SLRhNbmXtSsdDPB5Z7vD4IRUeJpGpG/view?usp=drive_link',
        badge: 'معادلة 2013',
        type: 'drive',
      },
      {
        name: 'امتحان تفاضل وتكامل معادلة 2012 - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/1973oLV9jwpSH2fbWjL_PvZfZ_tPF38tM/view?usp=drive_link',
        badge: 'معادلة 2012',
        type: 'drive',
      },
      {
        name: 'امتحان تفاضل وتكامل معادلة 2011 - مركز المتفوقين',
        url: 'https://drive.google.com/file/d/198eK7pEIpTJtIqUf8YIvw-p_Elc9R5K6/view?usp=drive_link',
        badge: 'معادلة 2011',
        type: 'drive',
      },
    ],
  },
  {
    year: 2000,
    title: 'نماذج امتحانات الثانوية العامة في التفاضل والتكامل',
    subtitle: 'النماذج الرسمية الاسترشادية وامتحانات الدور الأول والثاني',
    type: 'mock',
    notes: '24 امتحان تفاضل وتكامل بالإجابات النموذجية + امتحانات الثانوية العامة الدور الأول والثاني 2017.',
    versions: [
      {
        name: '24 امتحان تفاضل وتكامل بالإجابات النموذجية',
        url: 'https://drive.google.com/file/d/1UiddtkhgWJBEYNK2rZfh-EmrOd-IEXcb/view?usp=drive_link',
        badge: '24 امتحان بالحل',
        type: 'drive',
      },
      {
        name: 'نموذج اختبار تفاضل وتكامل بالإجابة دور أول ودور ثانٍ 2017',
        url: 'https://drive.google.com/file/d/1UupmPPCF0AMfwDBk8h3vju580wtVOzsN/view?usp=drive_link',
        badge: 'امتحان 2017',
        type: 'drive',
      },
    ],
  },
  {
    year: 1999,
    title: 'بنوك الأسئلة والمراجعات النهائية ودليل الآلة الحاسبة',
    subtitle: 'المعاصر مراجعة نهائية، مكتب المستشار، الجمهورية، وأقوى مذكرات القوانين',
    type: 'mock',
    notes: 'تجميعة شاملة لأهم مذكرات المراجعة النهائية وبنوك أسئلة التفاضل والتكامل ودليل الآلة الحاسبة.',
    versions: [
      {
        name: 'المعاصر في التفاضل والتكامل مراجعة نهائية 2022',
        url: 'https://drive.google.com/file/d/1VUuJUB2oP2bJLo3JRdGtRKUjFEImiN6J/view?usp=drive_link',
        badge: 'المعاصر مراجعة',
        type: 'drive',
      },
      {
        name: 'مراجعة التفاضل والتكامل - مكتب مستشار الرياضيات',
        url: 'https://drive.google.com/file/d/1VktfEXLjni5uzoyXQCofOerKKlGpZTnw/view?usp=drive_link',
        badge: 'مكتب المستشار',
        type: 'drive',
      },
      {
        name: 'مراجعة تفاضل وتكامل - جريدة الجمهورية التعليمية',
        url: 'https://drive.google.com/file/d/1VmKDCOZEL6afqoQxaBihfHV2b96h5lVh/view?usp=drive_link',
        badge: 'الجمهورية',
        type: 'drive',
      },
      {
        name: 'ملخص قوانين التفاضل والتكامل - أ/ أسامة فتحي',
        url: 'https://drive.google.com/file/d/1V8CiO3Rg4jmRu2aOadT6ZjIAfaAdVNFT/view?usp=drive_link',
        badge: 'قوانين تفاضل',
        type: 'drive',
      },
      {
        name: 'ملخص قوانين وقواعد التفاضل والتكامل - أ/ محمد المغاوري',
        url: 'https://drive.google.com/file/d/1VSGnj28VssAekybBkJ4tijVHP-NxbpUG/view?usp=drive_link',
        badge: 'قوانين وقواعد',
        type: 'drive',
      },
      {
        name: 'دليل استخدامات الآلة الحاسبة في التفاضل والتكامل - م/ محمد أبوضيف',
        url: 'https://drive.google.com/file/d/13gk-kAmWLiBZ9Fir7x4bE29GhX1TJ8qN/view?usp=drive_link',
        badge: 'الآلة الحاسبة',
        type: 'drive',
      },
    ],
  },
];

interface SubjectExamsClientProps {
  subject: {
    id: string;
    title: string;
    slug: string;
    section: {
      title: string;
    };
  };
  diskFiles?: {
    title: string;
    fileUrl: string;
    fileSize?: string;
    year?: number;
  }[];
}

export default function SubjectExamsClient({ subject, diskFiles = [] }: SubjectExamsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideoModal, setActiveVideoModal] = useState<TeacherCourse | null>(null);
  const isChemistry = subject.slug === 'chemistry';
  const isEnglish = subject.slug === 'english';
  const isMechanics = subject.slug === 'mechanics';
  const isAlgebra = subject.slug === 'algebra-and-geometry';
  const isCalculus = subject.slug === 'calculus';
  const examsList = isChemistry
    ? chemistryHistoricalExams
    : isEnglish
    ? englishHistoricalExams
    : isMechanics
    ? mechanicsHistoricalExams
    : isAlgebra
    ? algebraHistoricalExams
    : isCalculus
    ? calculusHistoricalExams
    : [];

  const filteredExams = examsList.filter((exam) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      String(exam.year).toLowerCase().includes(q) ||
      exam.title.toLowerCase().includes(q) ||
      (exam.subtitle && exam.subtitle.toLowerCase().includes(q)) ||
      (exam.notes && exam.notes.toLowerCase().includes(q))
    );
  });

  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-tajawal space-y-8">
      {/* Header Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={`/subjects/${subject.slug}`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-brand-500 hover:text-brand-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>العودة لصفحة المادة</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400">
          <span>{subject.section.title}</span>
          <span>/</span>
          <span>{subject.title}</span>
        </div>
      </div>

      {/* Main Title Hero Banner */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-10 shadow-soft space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-black border border-rose-200 dark:border-rose-800">
                بنك الامتحانات السابقة 📚
              </span>
              <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold">
                {isChemistry ? 'من 2019 حتى 2024' : 'كافة الأعوام'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-tajawal">
              امتحانات الأعوام السابقة لمادة {subject.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              تحميل ومراجعة كافة نماذج امتحانات معادلة كلية الهندسة السابقة مع نسخ الحلول المعتمدة، الامتحانات الإلكترونية التفاعلية، وفيديوهات الشرح والتفسير التفصيلي.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="w-full md:w-72 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن سنة أو نموذج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-500 transition shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Historical Note Callout Banner for Chemistry */}
        {isChemistry && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm font-black shrink-0 mt-0.5 shadow-sm">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold block text-sm">
                ملاحظة هامة بشأن تاريخ امتحانات الكيمياء:
              </span>
              <p className="leading-relaxed">
                قامت وزارة التعليم العالي بإضافة مادة الكيمياء إلى اختبارات معادلة كلية الهندسة لأول مرة عام <strong>2019</strong> بموجب القرار الوزاري الصادر بتاريخ 20 سبتمبر 2018، وهذا ما يفسر عدم وجود امتحانات لمادة الكيمياء قبل عام 2019.
              </p>
              <a
                href="https://drive.google.com/file/d/1IoMc6M7VU_uslGP9R8dC8erCwSAxZkRG/view?usp=drive_link"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-black text-amber-700 dark:text-amber-300 hover:underline pt-1"
              >
                <span>تحميل نص القرار الوزاري الرسمي PDF</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Chemistry Structured Year Packages */}
      {isChemistry ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-600" />
              <span>أرشيف الامتحانات السابقة مرتبة حسب العام:</span>
            </h2>
            <span className="text-xs text-slate-400 font-bold">
              {filteredExams.length} نماذج متوفرة
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={String(exam.year)}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-soft hover:shadow-card-hover transition-all space-y-6 group"
              >
                {/* Year Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white flex flex-col items-center justify-center font-black shadow-md shadow-brand-500/20">
                      <span className="text-sm leading-none">{typeof exam.year === 'number' ? 'عام' : 'نموذج'}</span>
                      <span className="text-lg leading-none mt-0.5">{exam.year}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-tajawal group-hover:text-brand-600 transition-colors">
                          {exam.title}
                        </h3>
                        {exam.badge && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-accent-emerald text-[11px] font-bold">
                            {exam.badge}
                          </span>
                        )}
                      </div>
                      {exam.subtitle && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {exam.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions (Video Solution Modal or Online Exam Button) */}
                  <div className="flex flex-wrap items-center gap-2">
                    {exam.videoSolution && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setActiveVideoModal({
                              name: exam.videoSolution!.instructor,
                              title: `فيديو حل امتحان ${exam.title}`,
                              channelName: exam.videoSolution!.instructor,
                              channelUrl: `https://www.youtube.com/watch?v=${exam.videoSolution!.youtubeEmbedId}`,
                              playlistUrl: `https://www.youtube.com/watch?v=${exam.videoSolution!.youtubeEmbedId}`,
                              specialty: `حل مفصل لجميع أسئلة امتحان ${exam.year} مع استعراض خطوات الحل الرياضية.`,
                              isPopular: true,
                              videos: [
                                {
                                  id: `exam-${exam.year}`,
                                  title: `حل امتحان ${exam.title}`,
                                  youtubeEmbedId: exam.videoSolution!.youtubeEmbedId,
                                  chapter: `حل امتحان ${exam.year}`,
                                  duration: exam.videoSolution!.duration || '1 ساعة',
                                  notes: 'حل نموذجي لجميع أسئلة الامتحان بالخطوات.',
                                },
                              ],
                            })
                          }
                          className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition hover:scale-102 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>تشغيل فيديو الحل 🎬</span>
                        </button>

                        <a
                          href={exam.videoSolution.youtubeEmbedId ? `https://www.youtube.com/watch?v=${exam.videoSolution.youtubeEmbedId}` : 'https://www.youtube.com'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 transition"
                          title="مشاهدة على YouTube"
                        >
                          <Youtube className="w-4 h-4 fill-current" />
                        </a>
                      </div>
                    )}

                    {exam.onlineExamUrl && (
                      <a
                        href={exam.onlineExamUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition hover:scale-102"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>امتحان إلكتروني (بابل شيت) ⚡</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Available Versions Cards */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                    النسخ المتاحة للتحميل والمذاكرة:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {exam.versions.map((ver) => (
                      <a
                        key={ver.name}
                        href={ver.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-850 hover:border-brand-500 hover:shadow-xs transition-all flex items-center justify-between gap-3 group/ver"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-xs shrink-0">
                            {ver.type === 'local' ? '💾' : '📄'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-900 dark:text-white group-hover/ver:text-brand-600 block truncate">
                              {ver.name}
                            </span>
                            {ver.badge && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {ver.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <Download className="w-4 h-4 text-slate-400 group-hover/ver:text-brand-600 shrink-0 transition-transform group-hover/ver:-translate-y-0.5" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Optional Notes */}
                {exam.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                    💡 {exam.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Fallback for other subjects with diskFiles */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diskFiles.map((file) => (
            <div
              key={file.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-black text-xs">
                  PDF
                </div>
                {file.year && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                    عام {file.year}
                  </span>
                )}
              </div>

              <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-2">
                {file.title}
              </h3>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{file.fileSize || 'PDF'}</span>
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Teacher Video Cinema Modal */}
      {activeVideoModal && (
        <TeacherVideoCinemaModal
          isOpen={Boolean(activeVideoModal)}
          onClose={() => setActiveVideoModal(null)}
          teacher={activeVideoModal}
        />
      )}
    </div>
  );
}
