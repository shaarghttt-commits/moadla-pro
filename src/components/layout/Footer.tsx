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
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-20">
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
                  منصة معادلات الجامعات الأولى
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              المنصة الأحدث والأشمل لطلاب الدبلومات الفنية والمعاهد للاستعداد والقبول في كليات الهندسة والحاسبات والتجارة والزراعة مع أفضل الأساتذة والامتحانات التفاعلية.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="فيسبوك"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-brand-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="يوتيوب"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                aria-label="تيليجرام"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-sky-500 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noreferrer"
                aria-label="واتساب"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Dynamic Footer Columns from CMS */}
          {columns.map((col, idx) => (
            <div key={col.id || idx} className="space-y-4">
              <h4 className="font-bold text-base text-white font-tajawal">{col.title}</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {(col.links || []).map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link
                      href={link.href}
                      target={link.openInNewTab ? '_blank' : undefined}
                      className="hover:text-brand-400 transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Fallback Contact info Column if fewer than 3 dynamic columns */}
          {columns.length < 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-base text-white font-tajawal">تواصل معنا</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="text-xs">support@moadla.pro</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                  <span className="text-xs" dir="ltr">01070130096</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <span className="text-xs">جمهورية مصر العربية - القاهرة</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Moadla Pro. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              شروط الاستخدام
            </Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              الدعم الفني
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
