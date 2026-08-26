'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import {
  Home,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  Loader2,
  LayoutGrid,
} from 'lucide-react';

interface HomepageSection {
  id: string;
  name: string;
  isVisible: boolean;
  order: number;
}

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const res = await fetch('/api/admin/homepage');
        const data = await res.json();
        if (data.layout?.sections) {
          setSections(data.layout.sections.sort((a: HomepageSection, b: HomepageSection) => a.order - b.order));
        }
      } catch {
        showToast('error', 'حدث خطأ أثناء جلب إعدادات الصفحة الرئيسية');
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, []);

  const moveSection = (index: number, dir: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIdx = dir === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    [newSections[index], newSections[targetIdx]] = [newSections[targetIdx], newSections[index]];
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
  };

  const toggleVisibility = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: { sections } }),
      });
      if (res.ok) {
        showToast('success', 'تم حفظ ترتيب وحالة أقسام الصفحة الرئيسية بنجاح');
      } else {
        showToast('error', 'فشل الحفظ');
      }
    } catch {
      showToast('error', 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const SECTION_DESCRIPTIONS: Record<string, string> = {
    hero: 'البانر الرئيسي الضخم أعلى الصفحة مع العنوان والصورة والأزرار',
    search: 'شريط البحث الشامل في المواد والدروس والامتحانات',
    sectionsGrid: 'شبكة عرض الأقسام الأكاديمية الرئيسية',
    features: 'بطاقات مميزات المنصة والخدمات المقدمة',
    latestContent: 'أحدث الدروس والامتحانات والمذكرات المضافة',
    cta: 'بانر الدعوة للتسجيل في المنصة (Call To Action)',
  };

  return (
    <AdminLayoutClient>
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fade-in ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">
              إدارة الصفحة الرئيسية (Homepage Layout)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تحكم في ترتيب وظهور أقسام الصفحة الرئيسية. للتحكم في محتوى كل قسم استخدم صفحة "هوية المنصة والمحتوى".
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة الرئيسية</span>
            </a>
            <button onClick={handleSave} disabled={saving || loading}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>حفظ الترتيب</span>
            </button>
          </div>
        </div>

        {/* Tip */}
        <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-2xl border border-brand-100 dark:border-brand-900 text-xs text-brand-700 dark:text-brand-400">
          💡 <strong>تلميح:</strong> استخدم أسهم الترتيب لإعادة ترتيب الأقسام، واضغط على أيقونة العين لإخفاء/إظهار أي قسم. بعد الانتهاء اضغط "حفظ الترتيب".
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">جاري تحميل إعدادات الصفحة الرئيسية...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`rounded-2xl border transition-all bg-white dark:bg-slate-900 overflow-hidden ${
                  !section.isVisible
                    ? 'border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                    : 'border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Order Number */}
                  <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-black flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Move Buttons */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button disabled={index === 0} onClick={() => moveSection(index, 'up')}
                      className="p-0.5 text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button disabled={index === sections.length - 1} onClick={() => moveSection(index, 'down')}
                      className="p-0.5 text-slate-300 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 transition-colors">
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <LayoutGrid className="w-4 h-4 text-slate-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-tajawal">{section.name}</p>
                    <p className="text-[11px] text-slate-400">{SECTION_DESCRIPTIONS[section.id] || 'قسم في الصفحة الرئيسية'}</p>
                  </div>

                  {/* Status badge */}
                  <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    section.isVisible
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    {section.isVisible ? 'ظاهر' : 'مخفي'}
                  </span>

                  {/* Toggle */}
                  <button onClick={() => toggleVisibility(section.id)}
                    className={`p-2 rounded-xl transition-colors ${
                      section.isVisible
                        ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        : 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                    }`}
                    title={section.isVisible ? 'إخفاء القسم' : 'إظهار القسم'}>
                    {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links to content editing */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white font-tajawal mb-3">تعديل محتوى الأقسام</h3>
          <div className="flex flex-wrap gap-2">
            <a href="/admin/settings" className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-brand-400 transition-colors">
              ✏️ تعديل Hero & Features & CTA
            </a>
            <a href="/admin/sections" className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-brand-400 transition-colors">
              📚 إدارة الأقسام الأكاديمية
            </a>
            <a href="/admin/lessons" className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-brand-400 transition-colors">
              🎬 إدارة الدروس الأخيرة
            </a>
          </div>
        </div>
      </div>
    </AdminLayoutClient>
  );
}
