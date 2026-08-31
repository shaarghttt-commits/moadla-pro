'use client';

import { useState, useEffect } from 'react';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  Settings2,
  Sparkles,
  Layout,
  Palette,
  Share2,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  HelpCircle,
  Phone,
  Mail,
  MessageCircle,
  PlayCircle,
  BookOpen,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'filesPage' | 'features' | 'stats' | 'cta' | 'branding' | 'successStudents'>('hero');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      showToast('error', 'فشل تحميل إعدادات الموقع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveKey = async (key: string, value: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل حفظ التعديلات');

      showToast('success', 'تم حفظ التعديلات بنجاح وستظهر مباشرة في الموقع');
    } catch (err: any) {
      showToast('error', err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleHeroChange = (field: string, val: any) => {
    setSettings((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, [field]: val },
    }));
  };

  const normalizeStudentPhotoEntry = (item: any, index: number) => {
    if (typeof item === 'string') {
      return { url: item, label: `طالب ${index + 1}`, details: 'كلية الهندسة - سنة أولى' };
    }

    return {
      url: item?.url || '',
      label: item?.label || item?.title || `طالب ${index + 1}`,
      details: item?.details || 'كلية الهندسة - سنة أولى',
    };
  };

  const addStudentPhoto = () => {
    setSettings((prev: any) => ({
      ...prev,
      hero: {
        ...prev.hero,
        studentPhotos: [...(prev?.hero?.studentPhotos || []), { url: '', label: `طالب ${(prev?.hero?.studentPhotos || []).length + 1}`, details: 'كلية الهندسة - سنة أولى' }],
      },
    }));
  };

  const handleStudentPhotoChange = (index: number, field: 'url' | 'label' | 'details', value: string) => {
    const currentPhotos = [...(settings?.hero?.studentPhotos || [])].map((photo, photoIndex) =>
      normalizeStudentPhotoEntry(photo, photoIndex)
    );

    currentPhotos[index] = {
      ...currentPhotos[index],
      [field]: value,
    };

    setSettings((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, studentPhotos: currentPhotos },
    }));
  };

  const removeStudentPhoto = (index: number) => {
    const filtered = (settings?.hero?.studentPhotos || [])
      .map((photo: any, photoIndex: number) => normalizeStudentPhotoEntry(photo, photoIndex))
      .filter((_: any, i: number) => i !== index);

    setSettings((prev: any) => ({
      ...prev,
      hero: { ...prev.hero, studentPhotos: filtered },
    }));
  };

  const addSuccessfulStudent = () => {
    setSettings((prev: any) => ({
      ...prev,
      successful_students: [
        ...(prev?.successful_students || []),
        {
          name: `طالب ${((prev?.successful_students || []).length || 0) + 1}`,
          avatar: '',
          year: 2025,
          grades: [
            { label: 'الإنجليزية', value: 85 },
            { label: 'الفيزياء', value: 88 },
            { label: 'الكيمياء', value: 86 },
            { label: 'رياضة 1', value: 90 },
            { label: 'رياضة 2', value: 91 },
            { label: 'الميكانيكا', value: 87 },
          ],
        },
      ],
    }));
  };

  const updateSuccessfulStudent = (index: number, field: 'name' | 'avatar' | 'year', value: string | number) => {
    const next = [...(settings?.successful_students || [])];
    next[index] = { ...next[index], [field]: value };
    setSettings((prev: any) => ({ ...prev, successful_students: next }));
  };

  const updateStudentGrade = (studentIndex: number, gradeIndex: number, field: 'label' | 'value', value: string | number) => {
    const next = [...(settings?.successful_students || [])];
    next[studentIndex] = {
      ...next[studentIndex],
      grades: [...(next[studentIndex]?.grades || [])].map((grade, idx) =>
        idx === gradeIndex ? { ...grade, [field]: field === 'value' ? Number(value) || 0 : value } : grade
      ),
    };
    setSettings((prev: any) => ({ ...prev, successful_students: next }));
  };

  const removeSuccessfulStudent = (studentIndex: number) => {
    const next = (settings?.successful_students || []).filter((_: any, i: number) => i !== studentIndex);
    setSettings((prev: any) => ({ ...prev, successful_students: next }));
  };

  const handleBrandingChange = (field: string, val: any) => {
    setSettings((prev: any) => ({
      ...prev,
      branding: { ...prev.branding, [field]: val },
    }));
  };

  const handleCtaChange = (field: string, val: any) => {
    setSettings((prev: any) => ({
      ...prev,
      cta: { ...prev.cta, [field]: val },
    }));
  };

  const handleFeatureChange = (index: number, field: string, val: any) => {
    const newFeatures = [...(settings?.features || [])];
    newFeatures[index] = { ...newFeatures[index], [field]: val };
    setSettings((prev: any) => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    const newFeatures = [
      ...(settings?.features || []),
      {
        id: Date.now().toString(),
        title: 'ميزة جديدة',
        description: 'اكتب وصفاً مختصراً للميزة هنا...',
        icon: 'Sparkles',
        color: 'blue',
      },
    ];
    setSettings((prev: any) => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = (settings?.features || []).filter((_: any, i: number) => i !== index);
    setSettings((prev: any) => ({ ...prev, features: newFeatures }));
  };

  const handleStatChange = (index: number, field: string, val: any) => {
    const newStats = [...(settings?.stats || [])];
    newStats[index] = { ...newStats[index], [field]: val };
    setSettings((prev: any) => ({ ...prev, stats: newStats }));
  };

  if (loading) {
    return (
      <AdminLayoutClient>
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">جاري تحميل إعدادات الموقع والصفحة الرئيسية...</p>
        </div>
      </AdminLayoutClient>
    );
  }

  return (
    <AdminLayoutClient>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Palette className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                إدارة الصفحة الرئيسية والهوية البصرية (CMS)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              عدّل نصوص وصور الواجهة، اللوجو، روابط التواصل، والمميزات بالكامل مباشرة من قاعدة البيانات.
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors self-start sm:self-center"
          >
            <Eye className="w-4 h-4" />
            <span>معاينة الموقع المباشر</span>
          </a>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'hero', label: 'قسم الواجهة (Hero Section)', icon: <Layout className="w-4 h-4" /> },
            { id: 'successStudents', label: 'طلاب النجاح', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'filesPage', label: 'صفحة الامتحانات السابقة', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'features', label: 'المميزات (Features)', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'stats', label: 'أرقام وإحصائيات المنصة', icon: <Palette className="w-4 h-4" /> },
            { id: 'cta', label: 'الدعوة للتسجيل (CTA)', icon: <Save className="w-4 h-4" /> },
            { id: 'branding', label: 'الهوية واللوجو والتواصل', icon: <Share2 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Hero Section */}
        {activeTab === 'hero' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">إعدادات قسم البداية (Hero)</h3>
              <button
                onClick={() => saveKey('hero', settings.hero)}
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ قسم Hero'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الشارة الترحيبية (Badge)
                  </label>
                  <input
                    type="text"
                    value={settings.hero?.badge || ''}
                    onChange={(e) => handleHeroChange('badge', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    العنوان الرئيسي (Main Title)
                  </label>
                  <input
                    type="text"
                    value={settings.hero?.title || ''}
                    onChange={(e) => handleHeroChange('title', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الوصف التوضيحي (Subtitle / Description)
                  </label>
                  <textarea
                    rows={4}
                    value={settings.hero?.subtitle || ''}
                    onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      نص الزر الأساسي
                    </label>
                    <input
                      type="text"
                      value={settings.hero?.primaryButtonText || ''}
                      onChange={(e) => handleHeroChange('primaryButtonText', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      رابط الزر الأساسي
                    </label>
                    <input
                      type="text"
                      value={settings.hero?.primaryButtonLink || ''}
                      onChange={(e) => handleHeroChange('primaryButtonLink', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      نص الزر الثانوي
                    </label>
                    <input
                      type="text"
                      value={settings.hero?.secondaryButtonText || ''}
                      onChange={(e) => handleHeroChange('secondaryButtonText', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      رابط الزر الثانوي
                    </label>
                    <input
                      type="text"
                      value={settings.hero?.secondaryButtonLink || ''}
                      onChange={(e) => handleHeroChange('secondaryButtonLink', e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Image Upload & Preview */}
              <div>
                <ImageUpload
                  label="صورة قسم الواجهة (Hero Image)"
                  helperText="ارفع صورة توضيحية للواجهة أو اتركها لعرض بطاقة الإحصائيات التفاعلية الافتراضية"
                  currentImageUrl={settings.hero?.imageUrl}
                  onUploadSuccess={(url) => handleHeroChange('imageUrl', url)}
                  onRemove={() => handleHeroChange('imageUrl', '')}
                  aspectRatio="video"
                />

                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  💡 عند عدم رفع صورة، ستعرض المنصة بطاقة ذكية تفاعلية تعرض نبذة عن المواد والامتحانات تلقائياً.
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/30 p-4">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">صور الطلاب في السلايدر</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        أضف صور طلابك من عندك وستخدمها تلقائياً في البطاقات المتحركة
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addStudentPhoto}
                      className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold"
                    >
                      + إضافة صورة
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(settings.hero?.studentPhotos || []).length === 0 && (
                      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                        لا توجد صور للطلاب حالياً. اضغط على "إضافة صورة" لبدء الإعداد.
                      </div>
                    )}

                    {(settings.hero?.studentPhotos || []).map((photo: any, index: number) => {
                      const normalized = normalizeStudentPhotoEntry(photo, index);

                      return (
                        <div key={`student-photo-${index}`} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
                          <ImageUpload
                            label={`صورة ${normalized.label || `الطالب ${index + 1}`}`}
                            helperText="يمكنك رفع صورة من جهازك أو نسخ رابط الصورة يدويًا"
                            currentImageUrl={normalized.url || ''}
                            onUploadSuccess={(url) => handleStudentPhotoChange(index, 'url', url)}
                            onRemove={() => removeStudentPhoto(index)}
                            aspectRatio="video"
                          />

                          <div className="mt-3">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                              اسم الطالب
                            </label>
                            <input
                              type="text"
                              value={normalized.label || ''}
                              onChange={(e) => handleStudentPhotoChange(index, 'label', e.target.value)}
                              placeholder="مثال: محمد علي"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="mt-3">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                              الكلية والسنة
                            </label>
                            <input
                              type="text"
                              value={normalized.details || ''}
                              onChange={(e) => handleStudentPhotoChange(index, 'details', e.target.value)}
                              placeholder="مثال: كلية الهندسة - سنة أولى"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                            />
                          </div>

                          <div className="mt-3">
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                              رابط الصورة (اختياري)
                            </label>
                            <input
                              type="text"
                              value={normalized.url || ''}
                              onChange={(e) => handleStudentPhotoChange(index, 'url', e.target.value)}
                              placeholder="https://example.com/student-photo.jpg"
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'successStudents' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">إدارة بطاقات الطلاب الناجحين</h3>
                <p className="text-xs text-slate-500">غير صورة الطالب ودرجاته، وسيتم تحديث الرسم البياني تلقائياً في الصفحة الرئيسية.</p>
              </div>
              <button
                onClick={() => saveKey('successful_students', settings.successful_students || [])}
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ بيانات الطلاب'}</span>
              </button>
            </div>

            <div className="space-y-5">
              {(settings.successful_students || []).map((student: any, studentIndex: number) => (
                <div key={`student-${studentIndex}`} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">طالب {studentIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeSuccessfulStudent(studentIndex)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">اسم الطالب</label>
                      <input
                        type="text"
                        value={student?.name || ''}
                        onChange={(e) => updateSuccessfulStudent(studentIndex, 'name', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">السنة</label>
                      <input
                        type="number"
                        value={student?.year || 2025}
                        onChange={(e) => updateSuccessfulStudent(studentIndex, 'year', Number(e.target.value) || 2025)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-4 items-start">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">رابط صورة الطالب</label>
                      <input
                        type="text"
                        value={student?.avatar || ''}
                        onChange={(e) => updateSuccessfulStudent(studentIndex, 'avatar', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="w-full">
                      <ImageUpload
                        label="تغيير صورة الطالب"
                        helperText="ارفع صورة جديدة مباشرة من جهازك"
                        currentImageUrl={student?.avatar || ''}
                        onUploadSuccess={(url) => updateSuccessfulStudent(studentIndex, 'avatar', url)}
                        onRemove={() => updateSuccessfulStudent(studentIndex, 'avatar', '')}
                        aspectRatio="square"
                      />
                    </div>
                  </div>

                  {student?.avatar && (
                    <div className="flex items-center gap-3">
                      <img src={student.avatar} alt={student.name || 'طالب'} className="h-16 w-16 rounded-full object-cover border-4 border-emerald-100" />
                      <span className="text-[11px] text-slate-500">معاينة الصورة</span>
                    </div>
                  )}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">درجات المواد</h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(student?.grades || []).map((grade: any, gradeIndex: number) => (
                        <div key={`${studentIndex}-grade-${gradeIndex}`} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 space-y-2">
                          <input
                            type="text"
                            value={grade?.label || ''}
                            onChange={(e) => updateStudentGrade(studentIndex, gradeIndex, 'label', e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={grade?.value ?? 0}
                            onChange={(e) => updateStudentGrade(studentIndex, gradeIndex, 'value', Number(e.target.value) || 0)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSuccessfulStudent}
                className="w-full px-4 py-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50 hover:bg-brand-100 text-sm font-bold text-brand-700 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طالب جديد</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'filesPage' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">إعدادات صفحة الامتحانات السابقة</h3>
                <p className="text-xs text-slate-500">تعديل العنوان، الوصف، وعناوين الإحصائيات الظاهرة في الصفحة العامة</p>
              </div>
              <button
                onClick={() => saveKey('filesPage', settings.filesPage)}
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ إعدادات الصفحة'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الشارة (Badge)</label>
                  <input
                    type="text"
                    value={settings.filesPage?.badge || ''}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, filesPage: { ...prev.filesPage, badge: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان الصفحة</label>
                  <input
                    type="text"
                    value={settings.filesPage?.title || ''}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, filesPage: { ...prev.filesPage, title: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الوصف الرئيسي</label>
                  <textarea
                    rows={4}
                    value={settings.filesPage?.subtitle || ''}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, filesPage: { ...prev.filesPage, subtitle: e.target.value } }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان بطاقة "آخر تحديث"</label>
                  <input
                    type="text"
                    value={settings.filesPage?.lastUpdateLabel || ''}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, filesPage: { ...prev.filesPage, lastUpdateLabel: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان بطاقة "المواد المتاحة"</label>
                  <input
                    type="text"
                    value={settings.filesPage?.subjectCountLabel || ''}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, filesPage: { ...prev.filesPage, subjectCountLabel: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان بطاقة "أنواع المواد"</label>
                  <input
                    type="text"
                    value={settings.filesPage?.equationTypeLabel || ''}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, filesPage: { ...prev.filesPage, equationTypeLabel: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">عنوان حالة عدم وجود ملفات</label>
                  <input
                    type="text"
                    value={settings.filesPage?.emptyTitle || ''}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, filesPage: { ...prev.filesPage, emptyTitle: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">وصف حالة عدم وجود ملفات</label>
                  <textarea
                    rows={3}
                    value={settings.filesPage?.emptyDescription || ''}
                    onChange={(e) => setSettings((prev: any) => ({ ...prev, filesPage: { ...prev.filesPage, emptyDescription: e.target.value } }))}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Features */}
        {activeTab === 'features' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">مميزات المنصة (Features Cards)</h3>
                <p className="text-xs text-slate-500">إضافة وتعديل وحذف بطاقات المميزات المعروضة في الصفحة الرئيسية</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={addFeature}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة ميزة</span>
                </button>
                <button
                  onClick={() => saveKey('features', settings.features)}
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ المميزات'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(settings.features || []).map((feat: any, idx: number) => (
                <div
                  key={feat.id || idx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">ميزة #{idx + 1}</span>
                    <button
                      onClick={() => removeFeature(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="حذف الميزة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      عنوان الميزة
                    </label>
                    <input
                      type="text"
                      value={feat.title || ''}
                      onChange={(e) => handleFeatureChange(idx, 'title', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      الوصف
                    </label>
                    <textarea
                      rows={2}
                      value={feat.description || ''}
                      onChange={(e) => handleFeatureChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Stats */}
        {activeTab === 'stats' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">أرقام وإحصائيات المنصة</h3>
                <p className="text-xs text-slate-500">الأرقام المعروضة في شريط الإحصائيات بالصفحة الرئيسية</p>
              </div>

              <button
                onClick={() => saveKey('stats', settings.stats)}
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ الإحصائيات'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(settings.stats || []).map((stat: any, idx: number) => (
                <div
                  key={stat.id || idx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                >
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">إحصائية #{idx + 1}</span>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      الرقم / القيمة (مثال: 15,000+)
                    </label>
                    <input
                      type="text"
                      value={stat.number || ''}
                      onChange={(e) => handleStatChange(idx, 'number', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      النص / التسمية
                    </label>
                    <input
                      type="text"
                      value={stat.label || ''}
                      onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: CTA */}
        {activeTab === 'cta' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                قسم الدعوة للتسجيل (Call To Action Banner)
              </h3>
              <button
                onClick={() => saveKey('cta', settings.cta)}
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ قسم CTA'}</span>
              </button>
            </div>

            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">الشارة</label>
                <input
                  type="text"
                  value={settings.cta?.badge || ''}
                  onChange={(e) => handleCtaChange('badge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  العنوان الرئيسي للبانر
                </label>
                <input
                  type="text"
                  value={settings.cta?.title || ''}
                  onChange={(e) => handleCtaChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  النص التوضيحي
                </label>
                <textarea
                  rows={3}
                  value={settings.cta?.description || ''}
                  onChange={(e) => handleCtaChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">نص الزر</label>
                  <input
                    type="text"
                    value={settings.cta?.buttonText || ''}
                    onChange={(e) => handleCtaChange('buttonText', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    رابط الزر
                  </label>
                  <input
                    type="text"
                    value={settings.cta?.buttonLink || ''}
                    onChange={(e) => handleCtaChange('buttonLink', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Branding & Contact */}
        {activeTab === 'branding' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                الهوية البصرية، اللوجو، وروابط التواصل
              </h3>
              <button
                onClick={() => saveKey('branding', settings.branding)}
                disabled={saving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ الهوية والتواصل'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: General */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    اسم المنصة
                  </label>
                  <input
                    type="text"
                    value={settings.branding?.siteName || ''}
                    onChange={(e) => handleBrandingChange('siteName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    وصف المنصة العام
                  </label>
                  <textarea
                    rows={3}
                    value={settings.branding?.siteDescription || ''}
                    onChange={(e) => handleBrandingChange('siteDescription', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      رقم هاتف الدعم
                    </label>
                    <input
                      type="text"
                      value={settings.branding?.supportPhone || ''}
                      onChange={(e) => handleBrandingChange('supportPhone', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={settings.branding?.supportEmail || ''}
                      onChange={(e) => handleBrandingChange('supportEmail', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">روابط منصات التواصل الاجتماعي</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">رقم الواتساب</label>
                      <input
                        type="text"
                        placeholder="+201000000000"
                        value={settings.branding?.whatsappNumber || ''}
                        onChange={(e) => handleBrandingChange('whatsappNumber', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">رابط فيسبوك</label>
                      <input
                        type="text"
                        placeholder="https://facebook.com/..."
                        value={settings.branding?.facebookUrl || ''}
                        onChange={(e) => handleBrandingChange('facebookUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">قناة تليجرام</label>
                      <input
                        type="text"
                        placeholder="https://t.me/..."
                        value={settings.branding?.telegramUrl || ''}
                        onChange={(e) => handleBrandingChange('telegramUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">قناة يوتيوب</label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/..."
                        value={settings.branding?.youtubeUrl || ''}
                        onChange={(e) => handleBrandingChange('youtubeUrl', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Logo Upload */}
              <div className="space-y-4">
                <ImageUpload
                  label="شعار المنصة (Platform Logo)"
                  helperText="ارفع شعار المنصة بصيغة PNG شفافة أو SVG أو JPG"
                  currentImageUrl={settings.branding?.logoUrl}
                  onUploadSuccess={(url) => handleBrandingChange('logoUrl', url)}
                  onRemove={() => handleBrandingChange('logoUrl', '')}
                  aspectRatio="square"
                />

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p className="font-bold text-slate-700 dark:text-slate-300">معاينة اللوجو:</p>
                  <p>عند رفع لوجو، سيتم استخدامه في شريط التنقل العلوي وتذييل الصفحة الرئيسية مباشرة.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayoutClient>
  );
}
