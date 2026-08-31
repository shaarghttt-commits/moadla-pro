'use client';

import { useEffect, useState } from 'react';
import { Trophy, Award, Sparkles, TrendingUp, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

type StudentGrade = {
  label: string;
  value: number;
};

type SuccessfulStudent = {
  name: string;
  avatar?: string;
  year?: number;
  grades: StudentGrade[];
};

interface SuccessfulStudentsPanelProps {
  students: SuccessfulStudent[];
}

export default function SuccessfulStudentsPanel({ students }: SuccessfulStudentsPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleStudents = students.slice(0, 8);

  useEffect(() => {
    if (visibleStudents.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % visibleStudents.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [visibleStudents.length]);

  const student = visibleStudents[activeIndex] ?? visibleStudents[0];

  if (!student) {
    return null;
  }

  const chartWidth = 420;
  const chartHeight = 200;
  const padding = 24;
  const maxValue = 100;
  const chartPoints = student.grades.map((grade, gradeIndex) => {
    const x =
      padding +
      (gradeIndex * (chartWidth - padding * 2)) / Math.max(student.grades.length - 1, 1);
    const y =
      chartHeight -
      padding -
      ((grade.value - 0) / maxValue) * (chartHeight - padding * 2);

    return `${x},${y}`;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-[36px] border border-emerald-200/80 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/90 via-white to-brand-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 shadow-soft p-6 sm:p-10 relative overflow-hidden backdrop-blur-xl">
        {/* Background glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-black">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>قصص نجاح ملهمة من طلابنا</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">
              أوائل الطلاب الذين التحقوا بكليات الهندسة عبر المنصة
            </h2>
          </div>

          {/* Student Selector Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {visibleStudents.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeIndex === idx
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {s.name.split(' ')[0]} {s.name.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-soft">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Student Info & Grades */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={student.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'}
                    alt={student.name}
                    className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md ring-4 ring-emerald-100 dark:ring-emerald-950"
                  />
                  <span className="absolute -bottom-2 -left-2 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-600 text-xs font-black text-white shadow-sm">
                    🥇
                  </span>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-tajawal truncate">
                      {student.name}
                    </h3>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    معادلة كلية الهندسة • دفعة {student.year || 2025}
                  </p>
                </div>
              </div>

              {/* Grades Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {student.grades.map((grade) => (
                  <div
                    key={`${student.name}-${grade.label}`}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 p-3 text-center"
                  >
                    <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                      {grade.label}
                    </p>
                    <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400 font-tajawal">
                      {grade.value}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance SVG Curve */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4">
              <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>المنحنى التراكمي لدرجات المواد</span>
                </span>
                <span>المجموع الكلي: 94.6%</span>
              </div>

              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-44 w-full overflow-visible">
                {[0, 50, 100].map((tick) => {
                  const y = chartHeight - padding - ((tick / maxValue) * (chartHeight - padding * 2));
                  return (
                    <g key={tick}>
                      <line x1={padding} x2={chartWidth - padding} y1={y} y2={y} stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeDasharray="4 6" />
                      <text x={8} y={y + 4} fontSize="10" fill="currentColor" className="text-slate-400" textAnchor="start">
                        {tick}%
                      </text>
                    </g>
                  );
                })}

                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={chartPoints.join(' ')}
                />

                {student.grades.map((grade, gradeIndex) => {
                  const x =
                    padding +
                    (gradeIndex * (chartWidth - padding * 2)) / Math.max(student.grades.length - 1, 1);
                  const y =
                    chartHeight -
                    padding -
                    ((grade.value - 0) / maxValue) * (chartHeight - padding * 2);

                  return (
                    <g key={`${student.name}-${grade.label}`}>
                      <circle cx={x} cy={y} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                      <text x={x} y={chartHeight - 4} fontSize="9" textAnchor="middle" fill="currentColor" className="text-slate-500 dark:text-slate-400 font-bold">
                        {grade.label.replace('رياضة ', 'ر')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
