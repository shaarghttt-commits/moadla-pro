'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Youtube,
  Send,
  MessageCircle,
  Swords,
  Users,
  ShieldCheck,
  Sparkles,
  Heart,
} from 'lucide-react';
import { DEFAULT_FOOTER_COLUMNS } from '@/lib/constants';

interface FooterLink {
  title: string;
  href: string;
  order?: number;
  isVisible?: boolean;
  openInNewTab?: boolean;
}

interface FooterColumn {
  id?: string;
  title: string;
  order?: number;
  isVisible?: boolean;
  links: FooterLink[];
}

export default function Footer() {
  const [columns, setColumns] = useState<FooterColumn[]>(DEFAULT_FOOTER_COLUMNS);
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [footerRes, settingsRes] = await Promise.all([
          fetch('/api/footer'),
          fetch('/api/settings'),
        ]);
        const footerData = await footerRes.json();
        if (footerData.columns && footerData.columns.length > 0) {
          setColumns(footerData.columns);
        }
        const settingsData = await settingsRes.json();
        if (settingsData.settings?.branding) {
          setBranding(settingsData.settings.branding);
        }
      } catch {
        // use default fallback
      }
    };
    fetchData();
  }, []);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/80 mt-24 relative overflow-hidden">
      {/* Subtle Ambient Background Light */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Interactive Community Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="rounded-3xl bg-gradient-to-r from-brand-900/60 via-indigo-950/70 to-slate-900/90 border border-brand-700/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl">
          <div className="space-y-1.5 text-center md:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>مجتمع Moadla Pro التفاعلي</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-tajawal">
              جاهز لتجربة الألعاب والمبارزات العلمية مع زملائك؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              انضم لآلاف الطلاب في مجموعات المذاكرة التفاعلية وساحة التحديات 1v1 الآن!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/games"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              <span>ساحة الألعاب 🎮</span>
            </Link>
            <Link
              href="/groups"
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all hover:scale-105"
            >
              <Users className="w-4 h-4 text-indigo-400" />
              <span>المجموعات 👥</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-glow">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-white font-tajawal">
                    Moadla
                  </span>
                  <span className="bg-gradient-to-r from-brand-400 to-accent-emerald bg-clip-text text-transparent font-black text-xl">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium -mt-1">
                  منصة معادلات الجامعات الأولى بمصر
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              المنصة الأحدث والأشمل لطلاب الدبلومات الفنية والمعاهد للاستعداد والقبول في كليات الهندسة والحاسبات والتجارة والزراعة مع أفضل الأساتذة والامتحانات التفاعلية.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://www.facebook.com/4543534543hjhg?locale=ar_AR"
                target="_blank"
                rel="noreferrer"
                aria-label="فيسبوك"
                className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="يوتيوب"
                className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="تيليجرام"
                className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-sky-500 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/201070130096?text=%D8%A7%D9%84%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85"
                target="_blank"
                rel="noreferrer"
                aria-label="واتساب"
                className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white flex items-center justify-center transition-all border border-slate-800"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Dynamic Footer Columns from CMS */}
          {columns.map((col, idx) => (
            <div key={col.id || idx} className="space-y-4">
              <h4 className="font-black text-base text-white font-tajawal">{col.title}</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {(col.links || []).map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      target={link.openInNewTab ? '_blank' : undefined}
                      className="hover:text-brand-400 transition-colors font-medium text-xs sm:text-sm"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact info Column */}
          <div className="space-y-4">
            <h4 className="font-black text-base text-white font-tajawal">تواصل مع الإدارة</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-xs">info@moadla.pro</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-xs" dir="ltr">01070130096</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span className="text-xs">جمهورية مصر العربية</span>
              </li>
              <li className="flex items-center gap-2.5 pt-2 text-[11px] text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>منصة موثقة ومعتمدة 100%</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Moadla Pro. جميع الحقوق محفوظة لتأهيل طلاب المعادلات.</p>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              شروط الاستخدام
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              مركز المساعدة
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
