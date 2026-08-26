'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ConfirmModal from '@/components/admin/ConfirmModal';
import {
  Navigation2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon?: string | null;
  order: number;
  isVisible: boolean;
  openInNewTab: boolean;
  parentId?: string | null;
  children?: NavItem[];
}

const ICON_OPTIONS = ['Home','BookOpen','Layers','FileCheck2','Info','Mail','User','Settings','Search','Star','Award','HelpCircle'];

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<NavItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', href: '/', icon: 'Home', isVisible: true, openInNewTab: false, parentId: '' });
  const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/navigation');
      const data = await res.json();
      setItems(data.navItems || []);
    } catch {
      showToast('error', 'حدث خطأ أثناء تحميل عناصر القائمة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async () => {
    if (!newItem.title || !newItem.href) return showToast('error', 'العنوان والرابط مطلوبان');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, order: items.length, parentId: newItem.parentId || null }),
      });
      if (res.ok) {
        showToast('success', 'تم إضافة عنصر جديد للقائمة');
        setShowAddForm(false);
        setNewItem({ title: '', href: '/', icon: 'Home', isVisible: true, openInNewTab: false, parentId: '' });
        fetchItems();
      } else {
        showToast('error', 'فشل إضافة العنصر');
      }
    } catch {
      showToast('error', 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/navigation/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        showToast('success', 'تم تحديث عنصر القائمة');
        setEditingId(null);
        fetchItems();
      } else {
        showToast('error', 'فشل التحديث');
      }
    } catch {
      showToast('error', 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: NavItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'حذف عنصر من القائمة',
      message: `هل تريد حذف "${item.title}" من شريط التنقل؟`,
      onConfirm: async () => {
        const res = await fetch(`/api/admin/navigation/${item.id}`, { method: 'DELETE' });
        if (res.ok) { showToast('success', 'تم الحذف'); fetchItems(); }
        else showToast('error', 'فشل الحذف');
      },
    });
  };

  const handleToggleVisibility = async (item: NavItem) => {
    const res = await fetch(`/api/admin/navigation/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !item.isVisible }),
    });
    if (res.ok) { showToast('success', item.isVisible ? 'تم إخفاء العنصر' : 'تم إظهار العنصر'); fetchItems(); }
  };

  const handleMove = async (item: NavItem, dir: 'up' | 'down', siblings: NavItem[]) => {
    const idx = siblings.findIndex((s) => s.id === item.id);
    const target = dir === 'up' ? siblings[idx - 1] : siblings[idx + 1];
    if (!target) return;
    await Promise.all([
      fetch(`/api/admin/navigation/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: target.order }) }),
      fetch(`/api/admin/navigation/${target.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: item.order }) }),
    ]);
    fetchItems();
  };

  const startEdit = (item: NavItem) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, href: item.href, icon: item.icon || '', isVisible: item.isVisible, openInNewTab: item.openInNewTab });
  };

  const renderItem = (item: NavItem, level: number, siblings: NavItem[]) => {
    const idx = siblings.findIndex((s) => s.id === item.id);
    const isEditing = editingId === item.id;

    return (
      <div key={item.id} className={`${level > 0 ? 'mr-6 border-r-2 border-brand-100 dark:border-brand-900 pr-4' : ''}`}>
        <div className={`rounded-2xl border ${!item.isVisible ? 'opacity-60 border-dashed' : 'border-slate-200 dark:border-slate-800'} bg-white dark:bg-slate-900 overflow-hidden mb-2`}>
          {isEditing ? (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">الاسم</label>
                  <input type="text" value={editForm.title || ''} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">الرابط</label>
                  <input type="text" value={editForm.href || ''} onChange={(e) => setEditForm({ ...editForm, href: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={editForm.isVisible ?? true} onChange={(e) => setEditForm({ ...editForm, isVisible: e.target.checked })} className="rounded" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">مرئي</span>
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={editForm.openInNewTab ?? false} onChange={(e) => setEditForm({ ...editForm, openInNewTab: e.target.checked })} className="rounded" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">فتح في نافذة جديدة</span>
                </label>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => handleUpdate(item.id)} disabled={saving}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>حفظ</span>
                </button>
                <button onClick={() => setEditingId(null)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-bold">
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button disabled={idx === 0} onClick={() => handleMove(item, 'up', siblings)} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button disabled={idx === siblings.length - 1} onClick={() => handleMove(item, 'down', siblings)} className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-7 h-7 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-black flex-shrink-0">
                {item.order + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                <p className="text-[10px] text-slate-400 font-mono">{item.href}</p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.openInNewTab && (
                  <span title="يفتح في نافذة جديدة">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                )}
                {(item.children?.length || 0) > 0 && (
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400">
                    {item.children!.length} عناصر فرعية
                  </span>
                )}
                <button onClick={() => handleToggleVisibility(item)} title={item.isVisible ? 'إخفاء' : 'إظهار'} className={`p-1.5 rounded-lg ${item.isVisible ? 'text-slate-400 hover:text-brand-600' : 'text-amber-500'}`}>
                  {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(item)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Children */}
        {item.children && item.children.length > 0 && (
          <div className="mb-2">
            {item.children.map((child, _) => renderItem(child, level + 1, item.children!))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayoutClient>
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-fade-in ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
      <ConfirmModal {...confirmModal} onClose={() => setConfirmModal((p: any) => ({ ...p, isOpen: false }))} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-tajawal">إدارة شريط التنقل (Navbar)</h2>
            <p className="text-xs text-slate-500 mt-0.5">أضف وعدّل وأعد ترتيب روابط القائمة العلوية بشكل كامل</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5">
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'إلغاء' : 'إضافة عنصر جديد'}</span>
          </button>
        </div>

        {showAddForm && (
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-brand-200 dark:border-brand-900 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-tajawal">إضافة عنصر جديد للقائمة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">اسم العنصر *</label>
                <input type="text" placeholder="مثال: الرئيسية" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">الرابط *</label>
                <input type="text" placeholder="مثال: /sections" value={newItem.href} onChange={(e) => setNewItem({ ...newItem, href: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">عنصر فرعي داخل (اختياري)</label>
                <select value={newItem.parentId} onChange={(e) => setNewItem({ ...newItem, parentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <option value="">— عنصر رئيسي (قائمة رئيسية) —</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.title} (Dropdown)</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={newItem.isVisible} onChange={(e) => setNewItem({ ...newItem, isVisible: e.target.checked })} className="rounded" />
                <span className="font-bold">ظاهر في الموقع</span>
              </label>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={newItem.openInNewTab} onChange={(e) => setNewItem({ ...newItem, openInNewTab: e.target.checked })} className="rounded" />
                <span className="font-bold">يفتح في نافذة جديدة</span>
              </label>
            </div>
            <button onClick={handleAdd} disabled={saving} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>إضافة إلى القائمة</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">جاري تحميل عناصر القائمة...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Navigation2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-500">لا توجد عناصر في القائمة</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => renderItem(item, 0, items))}
          </div>
        )}
      </div>
    </AdminLayoutClient>
  );
}
