'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Edit3,
  Trash2,
  Plus,
  X,
  Check,
  Loader2,
  Sparkles,
  Layers,
  Eye,
  Settings,
  AlertTriangle,
  HelpCircle,
  Maximize2,
  Pin,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface EditableTarget {
  id: string;
  type: string;
  title: string;
  description?: string;
  videoUrl?: string;
  parentId?: string;
  domElement: HTMLElement;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface LiveEditorContextType {
  isLiveEditActive: boolean;
  setIsLiveEditActive: (active: boolean) => void;
  openQuickEdit: (target?: any) => void;
  openQuickAdd: (parentType: string, parentId?: string) => void;
}

const LiveEditorContext = createContext<LiveEditorContextType>({
  isLiveEditActive: true,
  setIsLiveEditActive: () => {},
  openQuickEdit: () => {},
  openQuickAdd: () => {},
});

export const useLiveEditor = () => useContext(LiveEditorContext);

export default function LiveVisualEditorProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  // Active state initialized from localStorage/sessionStorage
  const [isLiveEditActive, setIsLiveEditActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('moadla_live_edit_active');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [hoveredTarget, setHoveredTarget] = useState<EditableTarget | null>(null);
  const [isPinned, setIsPinned] = useState<boolean>(false);

  // Toggle helper with persistence
  const toggleLiveEdit = useCallback(() => {
    setIsLiveEditActive((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('moadla_live_edit_active', String(next));
      }
      showToast(next ? '⚡ تم تفعيل وضع التعديل الفوري فوق العناصر (F2)' : '⚪ تم إخفاء وإيقاف وضع التعديل (F2)');
      return next;
    });
  }, []);

  // Keyboard shortcut listener (F2 or Alt + E) - ADMIN ONLY
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'F2' || (e.altKey && (e.key === 'e' || e.key === 'E' || e.key === 'ث'))) {
        e.preventDefault();
        toggleLiveEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleLiveEdit, user]);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  // Add Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<string>('LESSON');
  const [addParentId, setAddParentId] = useState<string>('');
  const [addFormData, setAddFormData] = useState<any>({});

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Bulk Multi-Select State
  const [selectedItems, setSelectedItems] = useState<Map<string, EditableTarget>>(new Map());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const toggleSelectItem = useCallback((target?: EditableTarget | null) => {
    const item = target || hoveredTarget;
    if (!item) return;

    setSelectedItems((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        if (item.domElement) {
          item.domElement.classList.remove('ring-4', 'ring-emerald-500', 'shadow-[0_0_25px_rgba(16,185,129,0.5)]');
        }
      } else {
        next.set(item.id, item);
        if (item.domElement) {
          item.domElement.classList.add('ring-4', 'ring-emerald-500', 'shadow-[0_0_25px_rgba(16,185,129,0.5)]');
        }
      }
      return next;
    });
  }, [hoveredTarget]);

  const clearSelectedItems = useCallback(() => {
    selectedItems.forEach((item) => {
      if (item.domElement) {
        item.domElement.classList.remove('ring-4', 'ring-emerald-500', 'shadow-[0_0_25px_rgba(16,185,129,0.5)]');
      }
    });
    setSelectedItems(new Map());
  }, [selectedItems]);

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // Inline Text Editing State
  const [inlineEditingTarget, setInlineEditingTarget] = useState<EditableTarget | null>(null);
  const originalTextRef = useRef<string>('');

  // Start Inline Text Editing
  const startInlineTextEditing = useCallback((target?: EditableTarget | null) => {
    const item = target || hoveredTarget;
    if (!item || !item.domElement) return;

    const el = (item.domElement.querySelector('h1, h2, h3, h4, h5, p, span') as HTMLElement) || item.domElement;
    originalTextRef.current = el.innerText || '';
    el.contentEditable = 'true';
    el.focus();

    // Select text for easy replacement
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    setInlineEditingTarget({ ...item, domElement: el });
    setHoveredTarget(null);
  }, [hoveredTarget]);

  // Save Inline Text Editing
  const saveInlineTextEditing = useCallback(async () => {
    if (!inlineEditingTarget || !inlineEditingTarget.domElement) return;

    const el = inlineEditingTarget.domElement;
    el.contentEditable = 'false';
    const newText = el.innerText.trim();

    if (!newText) {
      el.innerText = originalTextRef.current;
      setInlineEditingTarget(null);
      return;
    }

    setLoading(true);
    try {
      const textKey = `page_${window.location.pathname.replace(/\//g, '_')}_${inlineEditingTarget.type}_${inlineEditingTarget.id}`;

      await fetch('/api/admin/live-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_TEXT',
          type: inlineEditingTarget.type,
          id: inlineEditingTarget.id,
          data: {
            newText,
            textKey,
            field: el.tagName.startsWith('H') ? 'title' : 'description',
          },
        }),
      });

      showToast('تم حفظ وتحديث النص على الموقع بنجاح! 💾');
    } catch (err: any) {
      showToast('فشل حفظ النص', 'error');
      el.innerText = originalTextRef.current;
    } finally {
      setLoading(false);
      setInlineEditingTarget(null);
    }
  }, [inlineEditingTarget]);

  // Cancel Inline Text Editing
  const cancelInlineTextEditing = useCallback(() => {
    if (inlineEditingTarget && inlineEditingTarget.domElement) {
      inlineEditingTarget.domElement.contentEditable = 'false';
      inlineEditingTarget.domElement.innerText = originalTextRef.current;
    }
    setInlineEditingTarget(null);
  }, [inlineEditingTarget]);

  // Handle double click for instant inline text editing - ADMIN ONLY
  useEffect(() => {
    if (!user || user.role !== 'ADMIN' || !isLiveEditActive) return;

    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('.admin-no-inspect') || target.closest('input, textarea, button')) {
        return;
      }
      if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'DIV'].includes(target.tagName)) {
        originalTextRef.current = target.innerText || '';
        target.contentEditable = 'true';
        target.focus();

        const item: EditableTarget = {
          id: target.getAttribute('data-editable-id') || `text-${Date.now()}`,
          type: 'TEXT',
          title: target.innerText.slice(0, 30),
          domElement: target,
          rect: target.getBoundingClientRect(),
        };

        setInlineEditingTarget(item);
        setHoveredTarget(null);
      }
    };

    window.addEventListener('dblclick', handleDblClick);
    return () => window.removeEventListener('dblclick', handleDblClick);
  }, [isLiveEditActive, user]);

  // Smart Universal Element Inspector - ADMIN ONLY
  useEffect(() => {
    if (!user || user.role !== 'ADMIN' || !isLiveEditActive) {
      setHoveredTarget(null);
      setIsPinned(false);
      return;
    }

    let timeoutId: any = null;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPinned) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      // Ignore admin toolbar and modals themselves
      if (target.closest('.admin-no-inspect') || target.closest('[role="dialog"]') || target.closest('.admin-bar')) {
        return;
      }

      // Check if target is or is inside a meaningful element
      const meaningfulElement =
        (target.closest('[data-editable-id]') as HTMLElement) ||
        (target.closest('.glass-card') as HTMLElement) ||
        (target.closest('article') as HTMLElement) ||
        (target.closest('section > div') as HTMLElement) ||
        (target.closest('h1, h2, h3, p, a, button') as HTMLElement);

      if (!meaningfulElement) return;

      const rect = meaningfulElement.getBoundingClientRect();
      if (rect.width < 30 || rect.height < 15) return;

      const id = meaningfulElement.getAttribute('data-editable-id') || `elem-${meaningfulElement.tagName.toLowerCase()}-${Date.now()}`;
      const type =
        meaningfulElement.getAttribute('data-editable-type') ||
        (meaningfulElement.closest('[data-editable-type]')?.getAttribute('data-editable-type')) ||
        meaningfulElement.tagName;

      const title =
        meaningfulElement.getAttribute('data-editable-title') ||
        meaningfulElement.querySelector('h1, h2, h3, h4')?.textContent ||
        meaningfulElement.textContent?.slice(0, 50) ||
        'عنصر في الصفحة';

      const description =
        meaningfulElement.getAttribute('data-editable-desc') ||
        meaningfulElement.querySelector('p')?.textContent ||
        '';

      const videoUrl = meaningfulElement.getAttribute('data-editable-video') || '';
      const parentId = meaningfulElement.getAttribute('data-editable-parent-id') || '';

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setHoveredTarget({
          id,
          type,
          title: title.trim().replace(/\s+/g, ' '),
          description: description.trim().replace(/\s+/g, ' '),
          videoUrl,
          parentId,
          domElement: meaningfulElement,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        });
      }, 50);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target.closest('.admin-no-inspect') || target.closest('[role="dialog"]') || target.closest('.admin-bar')) {
        return;
      }

      const meaningfulElement =
        (target.closest('[data-editable-id]') as HTMLElement) ||
        (target.closest('.glass-card') as HTMLElement) ||
        (target.closest('article') as HTMLElement) ||
        (target.closest('section > div') as HTMLElement) ||
        (target.closest('h1, h2, h3, p, a, button') as HTMLElement);

      if (meaningfulElement) {
        const rect = meaningfulElement.getBoundingClientRect();
        const id = meaningfulElement.getAttribute('data-editable-id') || `elem-${meaningfulElement.tagName.toLowerCase()}-${Date.now()}`;
        const type =
          meaningfulElement.getAttribute('data-editable-type') ||
          (meaningfulElement.closest('[data-editable-type]')?.getAttribute('data-editable-type')) ||
          meaningfulElement.tagName;

        const title =
          meaningfulElement.getAttribute('data-editable-title') ||
          meaningfulElement.querySelector('h1, h2, h3, h4')?.textContent ||
          meaningfulElement.textContent?.slice(0, 50) ||
          'عنصر في الصفحة';

        const description =
          meaningfulElement.getAttribute('data-editable-desc') ||
          meaningfulElement.querySelector('p')?.textContent ||
          '';

        const videoUrl = meaningfulElement.getAttribute('data-editable-video') || '';
        const parentId = meaningfulElement.getAttribute('data-editable-parent-id') || '';

        setHoveredTarget({
          id,
          type,
          title: title.trim().replace(/\s+/g, ' '),
          description: description.trim().replace(/\s+/g, ' '),
          videoUrl,
          parentId,
          domElement: meaningfulElement,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        });
        setIsPinned(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      clearTimeout(timeoutId);
    };
  }, [isLiveEditActive, isPinned]);

  const handleOpenEdit = useCallback((target?: EditableTarget | null) => {
    const item = target || hoveredTarget;
    if (!item) return;
    setActiveItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      videoUrl: item.videoUrl || '',
    });
    setEditModalOpen(true);
  }, [hoveredTarget]);

  const handleOpenAdd = useCallback((parentType: string, parentId?: string) => {
    setAddType(parentType);
    setAddParentId(parentId || hoveredTarget?.id || '');
    setAddFormData({
      title: '',
      description: '',
      videoUrl: '',
    });
    setAddModalOpen(true);
  }, [hoveredTarget]);

  const handleOpenDelete = useCallback((target?: EditableTarget | null) => {
    const item = target || hoveredTarget;
    if (!item) return;
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  }, [hoveredTarget]);

  // Submit Live Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem) return;

    setLoading(true);
    try {
      // If element has real DB id, update DB
      if (activeItem.id && !activeItem.id.startsWith('elem-')) {
        const res = await fetch('/api/admin/live-edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'UPDATE',
            type: activeItem.type,
            id: activeItem.id,
            data: formData,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'فشل التعديل');
      }

      // Update DOM visually in real-time
      if (activeItem.domElement) {
        const heading = activeItem.domElement.querySelector('h1, h2, h3, h4');
        if (heading && formData.title) heading.textContent = formData.title;
        const p = activeItem.domElement.querySelector('p');
        if (p && formData.description) p.textContent = formData.description;
      }

      showToast('تم تعديل وحفظ العنصر بنجاح! 🎉');
      setEditModalOpen(false);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحفظ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Live Create
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/live-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          type: addType,
          data: {
            ...addFormData,
            sectionId: addType === 'SUBJECT' ? addParentId : undefined,
            subjectId: addType === 'UNIT' || addType === 'FILE' ? addParentId : undefined,
            unitId: addType === 'LESSON' ? addParentId : undefined,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'فشل إضافة العنصر');

      showToast('تمت إضافة العنصر بنجاح! 🚀');
      setAddModalOpen(false);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الإضافة', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Live Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setLoading(true);
    try {
      // If has DB id, delete from DB
      if (itemToDelete.id && !itemToDelete.id.startsWith('elem-')) {
        const res = await fetch('/api/admin/live-edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'DELETE',
            type: itemToDelete.type,
            id: itemToDelete.id,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'فشل الحذف');
      }

      // Remove from DOM with smooth fade-out animation
      if (itemToDelete.domElement) {
        itemToDelete.domElement.style.transition = 'all 0.3s ease';
        itemToDelete.domElement.style.opacity = '0';
        itemToDelete.domElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
          itemToDelete.domElement?.remove();
        }, 300);
      }

      showToast('تم حذف العنصر بنجاح 🗑️');
      setDeleteConfirmOpen(false);
      setHoveredTarget(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحذف', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Bulk Delete
  const handleConfirmBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    setLoading(true);
    try {
      const itemsList = Array.from(selectedItems.values()).map((item) => ({
        id: item.id,
        type: item.type,
      }));

      const res = await fetch('/api/admin/live-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_DELETE',
          items: itemsList,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'فشل الحذف الجماعي');

      // Animate and remove all from DOM
      selectedItems.forEach((item) => {
        if (item.domElement) {
          item.domElement.style.transition = 'all 0.4s ease';
          item.domElement.style.opacity = '0';
          item.domElement.style.transform = 'scale(0.85)';
          setTimeout(() => item.domElement?.remove(), 400);
        }
      });

      const count = selectedItems.size;
      showToast(`تم حذف ${count} عناصر بنجاح دفعة واحدة! 🗑️🚀`);
      clearSelectedItems();
      setBulkDeleteConfirmOpen(false);
      setHoveredTarget(null);
      router.refresh();
    } catch (err: any) {
      showToast(err.message || 'حدث خطأ أثناء الحذف الجماعي', 'error');
    } finally {
      setLoading(false);
    }
  };

  // If user is not logged in or NOT an ADMIN, do not render any admin visual editor overlays or buttons!
  if (!user || user.role !== 'ADMIN') {
    return (
      <LiveEditorContext.Provider
        value={{
          isLiveEditActive: false,
          setIsLiveEditActive: () => {},
          openQuickEdit: () => {},
          openQuickAdd: () => {},
        }}
      >
        {children}
      </LiveEditorContext.Provider>
    );
  }

  return (
    <LiveEditorContext.Provider
      value={{
        isLiveEditActive,
        setIsLiveEditActive,
        openQuickEdit: handleOpenEdit,
        openQuickAdd: handleOpenAdd,
      }}
    >
      {children}

      {/* NEON BOUNDING BOX HIGHLIGHT AROUND HOVERED ELEMENT */}
      {isLiveEditActive && hoveredTarget && (
        <div
          style={{
            top: `${hoveredTarget.rect.top + window.scrollY}px`,
            left: `${hoveredTarget.rect.left + window.scrollX}px`,
            width: `${hoveredTarget.rect.width}px`,
            height: `${hoveredTarget.rect.height}px`,
          }}
          className="admin-no-inspect absolute z-40 pointer-events-none rounded-3xl border-2 border-brand-500 ring-4 ring-brand-500/30 shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-100"
        />
      )}

      {/* FIXED DOCKED INTERACTIVE ACTION PANEL (ثابت على الشاشة) */}
      {isLiveEditActive && hoveredTarget && (
        <div
          className="admin-no-inspect fixed bottom-4 left-4 md:left-6 z-50 p-3.5 rounded-2xl bg-slate-950/95 text-white backdrop-blur-2xl border-2 border-brand-500 shadow-2xl pointer-events-auto select-none font-tajawal min-w-[300px] max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10 mb-1.5">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="w-5 h-5 rounded-lg bg-brand-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 animate-pulse">
                ⚡
              </span>
              <span className="text-[11px] font-black text-white truncate max-w-[150px]">
                {hoveredTarget.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 text-[9px] font-black border border-brand-500/30 shrink-0">
                {hoveredTarget.type}
              </span>
              <button
                type="button"
                onClick={() => setIsPinned((prev) => !prev)}
                className={`p-1 rounded-md transition-colors ${
                  isPinned ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-white'
                }`}
                title={isPinned ? 'العنصر مثبت (انقر لإلغاء التثبيت)' : 'تثبيت هذا العنصر'}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setHoveredTarget(null);
                  setIsPinned(false);
                }}
                className="p-1 rounded-md text-slate-400 hover:text-white"
                title="إغلاق هذا التنبيه"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Prompt Question */}
          <p className="text-[11px] font-black text-amber-300 mb-2 flex items-center gap-1 text-right">
            <span>🎯 هل تريد تعديل هذا العنصر أم حذفه؟</span>
          </p>

          {/* Actions */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => startInlineTextEditing(hoveredTarget)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-md transition hover:scale-102"
                title="تعديل وكتابة النص على الصفحة مباشرة"
              >
                <span>✍️ تعديل النص مباشرة</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(hoveredTarget)}
                className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-md transition hover:scale-102"
                title="تعديل الخصائص والبيانات"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>خصائص ⚙️</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleOpenDelete(hoveredTarget)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-md transition hover:scale-102"
                title="حذف هذا العنصر من الموقع"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف العنصر 🗑️</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAdd('LESSON', hoveredTarget.id)}
                className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-md transition hover:scale-102"
                title="إضافة عنصر فرعي"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة ➕</span>
              </button>
            </div>

            {/* MULTI SELECT TOGGLE BUTTON */}
            <button
              type="button"
              onClick={() => toggleSelectItem(hoveredTarget)}
              className={`w-full py-1.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition-all ${
                selectedItems.has(hoveredTarget.id)
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <span>{selectedItems.has(hoveredTarget.id) ? '✅ محدد للحذف الجماعي (انقر للإلغاء)' : '☑️ تحديد للحذف الجماعي المتعدد'}</span>
            </button>
          </div>
        </div>
      )}

      {/* FLOATING SAVE/CANCEL PILL OVER CURRENTLY EDITED INLINE TEXT */}
      {inlineEditingTarget && inlineEditingTarget.domElement && (
        <div
          style={{
            top: `${Math.max(10, inlineEditingTarget.domElement.getBoundingClientRect().top + window.scrollY - 44)}px`,
            left: `${inlineEditingTarget.domElement.getBoundingClientRect().left + window.scrollX}px`,
          }}
          className="admin-no-inspect absolute z-60 p-1.5 rounded-2xl bg-slate-950 text-white border-2 border-amber-400 shadow-2xl flex items-center gap-2 animate-bounce font-tajawal"
        >
          <span className="text-[10px] font-black text-amber-300 px-2 flex items-center gap-1">
            <span>✍️ جاري التعديل...</span>
          </span>

          <button
            type="button"
            onClick={saveInlineTextEditing}
            disabled={loading}
            className="py-1 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            <span>حفظ النص 💾</span>
          </button>

          <button
            type="button"
            onClick={cancelInlineTextEditing}
            className="py-1 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
          >
            إلغاء ↩️
          </button>
        </div>
      )}

      {/* FLOATING QUICK TOGGLE BUBBLE (استدعاء وإخفاء وضع التعديل) */}
      <div className="admin-no-inspect fixed bottom-4 right-4 z-50 animate-fade-in font-tajawal">
        <button
          type="button"
          onClick={toggleLiveEdit}
          title="اضغط F2 أو انقر هنا لإخفاء / استدعاء وضع التعديل الفوري فوق أي عنصر"
          className={`py-2 px-3.5 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 border-2 transition-all hover:scale-105 active:scale-95 ${
            isLiveEditActive
              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-white shadow-emerald-500/40'
              : 'bg-slate-900/90 hover:bg-slate-900 text-slate-200 border-slate-700 backdrop-blur-md'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isLiveEditActive ? 'bg-slate-950 animate-ping' : 'bg-slate-500'}`} />
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isLiveEditActive ? 'وضع التعديل نشط ⚡ (F2 للإخفاء)' : 'استدعاء وضع التعديل 🎯 (F2)'}</span>
        </button>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div
          className={`admin-no-inspect fixed bottom-20 left-1/2 -translate-x-1/2 z-60 px-5 py-3 rounded-2xl shadow-2xl font-black text-xs flex items-center gap-2 animate-bounce border ${
            toastMsg.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-400'
              : 'bg-rose-600 text-white border-rose-400'
          }`}
        >
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* LIVE QUICK EDIT MODAL */}
      {editModalOpen && activeItem && (
        <div className="admin-no-inspect fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center text-xs font-black">
                  ✏️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    تعديل سريع: {activeItem.type}
                  </h3>
                  <p className="text-[11px] text-slate-400">تعديل مباشر وفوري على الصفحة</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  العنوان / الاسم:
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الوصف / الملاحظات:
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                />
              </div>

              {activeItem.type === 'LESSON' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    رابط فيديو الشرح (YouTube):
                  </label>
                  <input
                    type="text"
                    value={formData.videoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono focus:outline-none"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ التعديل الآن 💾</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE QUICK ADD MODAL */}
      {addModalOpen && (
        <div className="admin-no-inspect fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xs font-black">
                  ➕
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    إضافة عنصر جديد: {addType}
                  </h3>
                  <p className="text-[11px] text-slate-400">إضافة فورية ومباشرة</p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  عنوان العنصر الجديد:
                </label>
                <input
                  type="text"
                  value={addFormData.title || ''}
                  onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })}
                  placeholder="اكتب الاسم أو العنوان..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الوصف / الملاحظات:
                </label>
                <textarea
                  rows={2}
                  value={addFormData.description || ''}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  placeholder="وصف مختصر..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>إضافة ونشر 🚀</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE QUICK DELETE CONFIRM MODAL */}
      {deleteConfirmOpen && itemToDelete && (
        <div className="admin-no-inspect fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-tajawal">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-rose-500/40 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                تأكيد حذف العنصر؟
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                هل أنت متأكد من رغبتك في حذف <strong className="text-rose-500 font-bold">"{itemToDelete.title || itemToDelete.type}"</strong> من الصفحة وقاعدة البيانات؟
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>نعم، احذف فوراً 🗑️</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BULK ACTIONS DOCK (شريط الإجراءات الجماعية عند تحديد عناصر متعددة) */}
      {selectedItems.size > 0 && (
        <div className="admin-no-inspect fixed bottom-6 left-1/2 -translate-x-1/2 z-60 px-5 py-3 rounded-3xl bg-slate-950/95 text-white backdrop-blur-2xl border-2 border-emerald-500 shadow-2xl flex items-center gap-3 animate-bounce font-tajawal">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md">
              {selectedItems.size}
            </span>
            <span className="text-xs font-black text-white whitespace-nowrap">عناصر محددة</span>
          </div>

          <div className="h-6 w-px bg-white/20" />

          <button
            type="button"
            onClick={() => setBulkDeleteConfirmOpen(true)}
            className="py-2 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف المحدد ({selectedItems.size}) دفعة واحدة 🗑️</span>
          </button>

          <button
            type="button"
            onClick={clearSelectedItems}
            className="py-2 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs whitespace-nowrap"
          >
            إلغاء التحديد ✖️
          </button>
        </div>
      )}

      {/* BULK DELETE CONFIRM MODAL (نافذة تأكيد الحذف الجماعي) */}
      {bulkDeleteConfirmOpen && (
        <div className="admin-no-inspect fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-tajawal">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 shadow-2xl border border-rose-500/50 space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center text-2xl animate-bounce">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تأكيد الحذف الجماعي؟
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                أنت على وشك حذف <strong className="text-rose-600 dark:text-rose-400 font-black text-sm">({selectedItems.size}) عناصر</strong> دفعة واحدة من الموقع وقاعدة البيانات.
              </p>
            </div>

            {/* List of items being deleted */}
            <div className="max-h-36 overflow-y-auto space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-right">
              {Array.from(selectedItems.values()).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                    {item.title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkDeleteConfirmOpen(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xl flex items-center justify-center gap-1.5 transition hover:scale-102"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>نعم، احذف الكل فوراً 🗑️</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </LiveEditorContext.Provider>
  );
}
