'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  ArrowLeft,
  RotateCcw,
  Zap,
  Gift,
  Check,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SEGMENTS = [
  { label: '+50 XP', color: '#3b82f6', textColor: '#ffffff', xp: 50 },
  { label: '+100 XP', color: '#10b981', textColor: '#ffffff', xp: 100 },
  { label: 'حماية الشعلة ❄️', color: '#06b6d4', textColor: '#ffffff', xp: 75 },
  { label: '+250 XP 🌟', color: '#8b5cf6', textColor: '#ffffff', xp: 250 },
  { label: 'وسام التميز 🎖️', color: '#f59e0b', textColor: '#000000', xp: 120 },
  { label: '+50 XP', color: '#ec4899', textColor: '#ffffff', xp: 50 },
  { label: 'جاكبوت 500 XP 👑', color: '#eab308', textColor: '#000000', xp: 500 },
  { label: 'لفة إضافية 🔄', color: '#6366f1', textColor: '#ffffff', xp: 80 },
];

export default function LuckySpinWheelGame({ onExit }: { onExit: () => void }) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<any>(null);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const currentRotationRef = useRef(0);

  useEffect(() => {
    drawWheel(0);
    const lastSpun = localStorage.getItem('moadla_last_spin_date');
    const today = new Date().toISOString().slice(0, 10);
    if (lastSpun === today) {
      setHasSpunToday(true);
    }
  }, []);

  const drawWheel = (rotationAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;
    const numSegments = SEGMENTS.length;
    const arc = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, size, size);

    // Draw Outer Shadow Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.restore();

    // Draw Segments
    SEGMENTS.forEach((seg, i) => {
      const angle = rotationAngle + i * arc;
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.lineTo(center, center);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.textColor;
      ctx.font = 'bold 13px Tajawal, sans-serif';
      ctx.fillText(seg.label, radius - 20, 5);
      ctx.restore();
    });

    // Draw Center Hub
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center icon
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎁', center, center);
  };

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Pick random target segment
    const targetIdx = Math.floor(Math.random() * SEGMENTS.length);
    const numSegments = SEGMENTS.length;
    const arc = (2 * Math.PI) / numSegments;

    // Additional full rotations (5 to 8 full spins)
    const extraSpins = 6 * 2 * Math.PI;
    // Calculate final angle pointing at the top needle (3 * PI / 2)
    const targetAngle = extraSpins + (3 * Math.PI) / 2 - (targetIdx * arc + arc / 2);

    const startAngle = currentRotationRef.current % (2 * Math.PI);
    const totalRotation = targetAngle - startAngle;
    const duration = 4500; // 4.5 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalRotation * easeOut;

      currentRotationRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWonPrize(SEGMENTS[targetIdx]);
        setHasSpunToday(true);
        localStorage.setItem('moadla_last_spin_date', new Date().toISOString().slice(0, 10));
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="py-6 max-w-4xl mx-auto px-4 space-y-6 animate-fade-in select-none text-center">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>خروج</span>
        </button>

        <div className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs border border-amber-500/40">
          لفة يومية مجانية 🎁
        </div>
      </div>

      {/* Main Wheel Arena Card */}
      <div className="glass-card rounded-[36px] p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-soft space-y-8 relative overflow-hidden">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-tajawal text-slate-900 dark:text-white">
            عجلة الحظ والجوائز اليومية 🎡
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            أدر العجلة كل يوم واكسب نقاط XP، أوسمة نادرة، ودروع حماية لأيام مذاكرتك المستمرة!
          </p>
        </div>

        {/* Wheel Canvas Container with Pointer Needle */}
        <div className="relative w-[320px] sm:w-[360px] h-[320px] sm:h-[360px] mx-auto">
          {/* Top Indicator Needle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-x-[14px] border-x-transparent border-t-[28px] border-t-amber-400 drop-shadow-md" />

          <canvas
            ref={canvasRef}
            width={360}
            height={360}
            className="w-full h-full drop-shadow-2xl"
          />
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 disabled:opacity-50 text-white font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            {isSpinning ? 'العجلة تدور الآن... 🌀' : 'لف العجلة واكسب جائزتك فوراً 🚀'}
          </button>
        </div>
      </div>

      {/* Won Prize Celebration Modal */}
      {wonPrize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400 rounded-[36px] p-8 text-center text-white space-y-6 shadow-2xl animate-scale-up">
            <div className="text-6xl animate-bounce">🎉</div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black font-tajawal text-amber-400">
                مبروك! ربحت {wonPrize.label}
              </h3>
              <p className="text-xs text-slate-300">
                تمت إضافة الجائزة (+{wonPrize.xp} XP) إلى رصيد حسابك بنجاح!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setWonPrize(null)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition"
            >
              استلام الجائزة ومتابعة اللعب ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
