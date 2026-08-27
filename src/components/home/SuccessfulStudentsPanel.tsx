'use client';

import { useEffect, useState } from 'react';

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
  const visibleStudents = students.slice(0, 6);

  useEffect(() => {
    if (visibleStudents.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % visibleStudents.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [visibleStudents.length]);

  const student = visibleStudents[activeIndex] ?? visibleStudents[0];

  if (!student) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-brand-50 shadow-[0_20px_50px_rgba(16,185,129,0.08)] p-5 sm:p-7">
          <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
            لا توجد بيانات ناجحين متاحة حاليًا.
          </div>
        </div>
      </section>
    );
  }

  const chartWidth = 420;
  const chartHeight = 220;
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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-[30px] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-white to-brand-50 shadow-[0_20px_50px_rgba(16,185,129,0.08)] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-emerald-700/80">
              success stories
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 font-tajawal">
              طلاب نجحوا في معادلة كلية الهندسة
            </h2>
          </div>

          <span className="inline-flex items-center justify-center min-w-[90px] px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-black">
            {visibleStudents.length} اسم
          </span>
        </div>

        <div className="rounded-[26px] border border-emerald-200/80 bg-white/80 p-4 shadow-[0_12px_30px_rgba(16,185,129,0.08)]">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 items-center">
            <div className="rounded-[22px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
                  اسم {activeIndex + 1}
                </span>
                <span className="text-[10px] font-bold text-slate-500">مؤشرات الأداء</span>
              </div>

              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-40 w-full overflow-visible">
                {[0, 25, 50, 75, 100].map((tick) => {
                  const y = chartHeight - padding - ((tick / maxValue) * (chartHeight - padding * 2));

                  return (
                    <g key={tick}>
                      <line x1={padding} x2={chartWidth - padding} y1={y} y2={y} stroke="#dbeafe" strokeDasharray="4 6" />
                      <text x={8} y={y + 4} fontSize="10" fill="#64748b" textAnchor="start">
                        {tick}
                      </text>
                    </g>
                  );
                })}

                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
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
                      <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={chartHeight - 4} fontSize="10" textAnchor="middle" fill="#64748b">
                        {grade.label.replace('رياضة ', 'ر')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-4 border-b border-emerald-100 pb-4">
                <div className="relative">
                  <img
                    src={student.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'}
                    alt={student.name}
                    className="h-20 w-20 rounded-full object-cover border-4 border-emerald-100 shadow-md"
                  />
                  <span className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-black text-white shadow-sm">
                    {activeIndex + 1}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-tajawal break-words">
                    {student.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    معادلة كلية الهندسة • سنة {student.year || 2025}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {student.grades.map((grade) => (
                  <div
                    key={`${student.name}-${grade.label}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      {grade.label}
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-900 font-tajawal">
                      {grade.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
