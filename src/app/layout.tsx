import type { Metadata } from 'next';
import Script from 'next/script';
import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Moadla Pro | منصة المواد الجامعية الأولى في مصر والعالم العربي',
  description:
    'المنصة التعليمية المتكاملة والشاملة للاستعداد لامتحانات المواد لكليات الهندسة، الحاسبات والمعلومات، التجارة، والزراعة مع امتحانات تفاعلية وشروحات وافية ومتابعة دقيقة لمستوى الطالب.',
  keywords: [
    'معادلة كلية الهندسة',
    'معادلة الحاسبات والمعلومات',
    'معادلة التجارة',
    'امتحانات معادلة الهندسة',
    'تفاضل وتكامل معادلة',
    'فيزياء معادلة الهندسة',
    'Moadla Pro',
  ],
  authors: [{ name: 'Moadla Pro Team' }],
  openGraph: {
    title: 'Moadla Pro | منصة المواد الجامعية الأولى',
    description:
      'طريقك للنجاح في امتحانات المواد يبدأ من هنا. دروس، فيديوهات، امتحانات تفاعلية، وملفات PDF.',
    siteName: 'Moadla Pro',
    locale: 'ar_EG',
    type: 'website',
  },
  verification: {
    google: 'Uw5ISsaH9J-tJjYoCFANTdfYxIrZpy4EfGarcK5FQZ4',
    other: {
      monetag: '0cd17785708b28986a9f7457698e78a6',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-brand-500 selection:text-white">
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="274884"
          strategy="afterInteractive"
          data-cfasync="false"
        />

        <ThemeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
