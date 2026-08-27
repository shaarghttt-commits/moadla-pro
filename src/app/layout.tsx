import type { Metadata } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SplashScreen from '@/components/common/SplashScreen';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Moadla Pro | منصة معادلات الجامعات الأولى في مصر والعالم العربي',
  description: 'المنصة التعليمية المتكاملة والشاملة للاستعداد لامتحانات معادلة كليات الهندسة، الحاسبات والمعلومات، التجارة، والزراعة مع امتحانات تفاعلية وشروحات وافية ومتابعة دقيقة لمستوى الطالب.',
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
    title: 'Moadla Pro | منصة معادلات الجامعات الأولى',
    description: 'طريقك للنجاح في امتحانات المعادلات يبدأ من هنا. دروس، فيديوهات، امتحانات تفاعلية، وملفات PDF.',
    siteName: 'Moadla Pro',
    locale: 'ar_EG',
    type: 'website',
  },
  verification: {
    google: 'Uw5ISsaH9J-tJjYoCFANTdfYxIrZpy4EfGarcK5FQZ4',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-brand-500 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <SplashScreen />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
