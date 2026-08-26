'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import {
  PanelBottom,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Loader2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';

interface FooterLink {
  title: string;
  href: string;
  icon?: string;
  order: number;
  isVisible: boolean;
  openInNewTab: boolean;
}

interface FooterColumn {
  title: string;
  order: number;
  isVisible: boolean;
  links: FooterLink[];
}

export default function AdminFooterPage() {
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await fetch('/api/admin/footer');
        const data = await res.json();
        if (data.columns) setColumns(data.columns);
      } catch {
        showToast('error', 'حدث خطأ أثناء تحميل إعدادات التذييل');
      } finally {
        setLoading(false);
      }
    };
    fetchFooter();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns }),
      });
      if (res.ok) showToast('success', 'تم حفظ إعدادات تذييل الصفحة بنجاح');
      else showToast('error', 'فشل الحفظ');
    } catch {
      showToast('error', 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const addColumn = () => {
    setColumns([...columns, { title: 'عمود جديد', order: columns.length, isVisible: true, links: [] }]);
  };

  const removeColumn = (idx: number) => {
    setColumns(columns.filter((_, i) => i !== idx));
  };

  const updateColumn = (idx: number, updates: Partial<FooterColumn>) => {
    setColumns(columns.map((c, i) => (i === idx ? { ...c, ...updates } : c)));
  };

  const addLink = (colIdx: number) => {
    const col = columns[colIdx];
    const updated = { ...col, links: [...col.links, { title: 'رابط جديد', href: '/', isVisible: true, order: col.links.length, openInNewTab: false }] };
    updateColumn(colIdx, updated);
  };

  const updateLink = (colIdx: number, linkIdx: number, updates: Partial<FooterLink>) => {
    const col = columns[colIdx];
    const links = col.links.map((l, i) => (i === linkIdx ? { ...l, ...updates } : l));
    updateColumn(colIdx, { links });
  };

  const removeLink = (colIdx: number, linkIdx: number) => {
    const col = columns[colIdx];
    updateColumn(colIdx, { links: col.links.filter((_, i) => i !== linkIdx) });
  };

  const moveColumn = (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= columns.length) return;
    const newCols = [...columns];
    [newCols[idx], newCols[target]] = [newCols[target], newCols[idx]];
    setColumns(newCols.map((c, i) => ({ ...c, order: i })));
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
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">إدارة تذييل الصفحة (Footer)</h2>
            <p className="text-xs text-slate-500 mt-0.5">تعديل أعمدة الروابط في تذييل الموقع</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addColumn} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200">
              <Plus className="w-3.5 h-3.5" /><span>إضافة عمود</span>
            </button>
            <button onClick={handleSave} disabled={saving || loading}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>حفظ التذييل</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {columns.map((col, colIdx) => (
              <div key={colIdx} className={`rounded-3xl bg-white dark:bg-slate-900 border shadow-sm overflow-hidden ${!col.isVisible ? 'border-dashed border-slate-300 dark:border-slate-700 opacity-70' : 'border-slate-200 dark:border-slate-800'}`}>
                {/* Column Header */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col gap-0.5">
                    <button disabled={colIdx === 0} onClick={() => moveColumn(colIdx, 'up')} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button disabled={colIdx === columns.length - 1} onClick={() => moveColumn(colIdx, 'down')} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <input
                    type="text"
                    value={col.title}
                    onChange={(e) => updateColumn(colIdx, { title: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                  <button onClick={() => updateColumn(colIdx, { isVisible: !col.isVisible })} className={`p-1.5 rounded-lg ${col.isVisible ? 'text-slate-400' : 'text-amber-500'}`}>
                    {col.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => removeColumn(colIdx)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>

                {/* Links */}
                <div className="p-3 space-y-2">
                  {col.links.map((link, linkIdx) => (
                    <div key={linkIdx} className="flex items-center gap-2">
                      <input type="text" value={link.title} onChange={(e) => updateLink(colIdx, linkIdx, { title: e.target.value })}
                        placeholder="اسم الرابط" className="flex-1 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold" />
                      <input type="text" value={link.href} onChange={(e) => updateLink(colIdx, linkIdx, { href: e.target.value })}
                        placeholder="/رابط" className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono" />
                      <button onClick={() => updateLink(colIdx, linkIdx, { isVisible: !link.isVisible })} className={`p-1 rounded ${link.isVisible ? 'text-slate-400' : 'text-amber-500'}`}>
                        {link.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button onClick={() => removeLink(colIdx, linkIdx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}

                  <button onClick={() => addLink(colIdx)} className="w-full mt-1 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-[11px] text-slate-500 font-bold hover:border-brand-400 hover:text-brand-600 transition-colors flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /><span>إضافة رابط</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add Column Card */}
            <button onClick={addColumn} className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 min-h-[150px] flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-400 hover:text-brand-600 transition-colors">
              <Plus className="w-7 h-7" />
              <span className="text-xs font-bold">إضافة عمود جديد</span>
            </button>
          </div>
        )}
      </div>
    </AdminLayoutClient>
  );
}
