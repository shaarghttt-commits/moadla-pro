'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Users,
  Flame,
  Clock,
  Edit3,
  Eraser,
  Trash2,
  Download,
  Plus,
  Radio,
  BookOpen,
  Headphones,
  Check,
  UserPlus,
  Video,
  Mic,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LiveVideoAudioCall from './LiveVideoAudioCall';
import StudyRoomInviteModal from './StudyRoomInviteModal';

interface StudyRoom {
  id: string;
  name: string;
  description?: string | null;
  topic: string;
  creator: { id: string; name: string; avatar?: string | null };
  activeTrack: string;
  members: { user: { id: string; name: string; avatar?: string | null; currentStreak?: number } }[];
}

export default function StudyRoomClient({ initialRooms }: { initialRooms: StudyRoom[] }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const requestedRoomId = searchParams.get('roomId');

  const [rooms, setRooms] = useState<StudyRoom[]>(initialRooms);
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(() => {
    if (requestedRoomId) {
      const found = initialRooms.find((r) => r.id === requestedRoomId);
      if (found) return found;
    }
    return initialRooms[0] || null;
  });

  // Invite Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Pomodoro State
  const [mode, setMode] = useState<'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // Ambient Audio (Web Audio API Noise & Tones)
  const [ambientTrack, setAmbientTrack] = useState<'rain' | 'waves' | 'meditation' | 'none'>('rain');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Whiteboard Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#60a5fa');
  const [penSize, setPenSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Create Room Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomTopic, setNewRoomTopic] = useState('calculus');
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Auto-select room from query param on mount or update
  useEffect(() => {
    if (requestedRoomId) {
      const room = rooms.find((r) => r.id === requestedRoomId);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [requestedRoomId, rooms]);

  // Join selected room in database
  useEffect(() => {
    if (selectedRoom && user) {
      fetch(`/api/study-rooms/${selectedRoom.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join' }),
      }).catch(console.error);
    }
  }, [selectedRoom?.id, user]);

  // Pomodoro Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playChime();
      if (mode === 'FOCUS') {
        setCompletedSessions((c) => c + 1);
        setMode('SHORT_BREAK');
        setTimeLeft(5 * 60);
      } else {
        setMode('FOCUS');
        setTimeLeft(25 * 60);
      }
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  const switchMode = (newMode: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'FOCUS') setTimeLeft(25 * 60);
    else if (newMode === 'SHORT_BREAK') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.error(e);
    }
  };

  // Ambient Sound Synthesizer via Web Audio API
  const startAmbientSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = volume;
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      if (ambientTrack === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 2.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        whiteNoise.connect(filter);
        filter.connect(gain);
        whiteNoise.start();
        noiseNodeRef.current = whiteNoise;
      } else if (ambientTrack === 'waves') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 110;

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1;

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.3;
        lfo.connect(lfoGain.gain);

        osc.connect(gain);
        osc.start();
        lfo.start();
        noiseNodeRef.current = osc;
      } else if (ambientTrack === 'meditation') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 432;
        osc.connect(gain);
        osc.start();
        noiseNodeRef.current = osc;
      }

      setIsPlayingAudio(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        (noiseNodeRef.current as any).stop?.();
        noiseNodeRef.current.disconnect();
      } catch (e) {}
      noiseNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const toggleAmbientSound = () => {
    if (isPlayingAudio) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  // Canvas Whiteboard Functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = isEraser ? '#0f172a' : penColor;
    ctx.lineWidth = isEraser ? penSize * 4 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${selectedRoom?.name || 'study'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 700;
      canvas.height = 360;
      clearCanvas();
    }
  }, [selectedRoom]);

  // Create room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setCreatingRoom(true);
    try {
      const res = await fetch('/api/study-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoomName.trim(), topic: newRoomTopic }),
      });
      const data = await res.json();
      if (res.ok && data.room) {
        setRooms((prev) => [data.room, ...prev]);
        setSelectedRoom(data.room);
        setShowCreateModal(false);
        setNewRoomName('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingRoom(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in font-tajawal">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 text-xs font-black border border-purple-200 dark:border-purple-800 mb-1.5">
            <Radio className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
            <span>غرف المذاكرة الافتراضية الحية بالصوت والفيديو 🎧📹</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-tajawal">
            مذاكرة تفاعلية حية (Study With Me 1v1 & Groups)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ذاكر وتحدث مع زملائك بالصوت والفيديو مع مؤقت بومودورو، أصوات تركيز Lofi، وسبورة رياضية مشتركة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedRoom && (
            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-xs shadow-glow flex items-center gap-2 transition hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>دعوة زميل للغرفة 📲</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md flex items-center gap-2 transition hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء غرفة جديدة</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Rooms Selector & Current Active Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT 4 COLS: Rooms List & Buddies ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Rooms */}
          <div className="glass-card rounded-[32px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                الغرف المتاحة حالياً ({rooms.length})
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="space-y-2">
              {rooms.map((room) => {
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full text-right p-3.5 rounded-2xl transition-all duration-200 border flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 shadow-sm ring-2 ring-purple-500/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        🎧
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal truncate">
                          {room.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          بواسطة: {room.creator?.name || 'طالب معادلة'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 shrink-0">
                      <Users className="w-3.5 h-3.5" />
                      <span>{room.members?.length || 1}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Members & Buddies */}
          {selectedRoom && (
            <div className="glass-card rounded-[32px] p-5 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                  المتواجدون في الغرفة الآن
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(true)}
                  className="text-xs font-black text-brand-500 hover:text-brand-400 flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>دعوة</span>
                </button>
              </div>

              <div className="space-y-2">
                {(selectedRoom.members || []).map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                        {m.user?.avatar ? (
                          <img src={m.user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          m.user?.name?.charAt(0) || 'U'
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white font-tajawal">
                          {m.user?.name}
                        </p>
                        <p className="text-[9px] text-emerald-500 font-bold">يذاكر بتركيز ⏱️</p>
                      </div>
                    </div>

                    {m.user?.currentStreak && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black">
                        🔥 {m.user.currentStreak}d
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT 8 COLS: Live Audio & Video Call, Pomodoro, Ambient Sounds, Whiteboard ================= */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Live Voice & Video Interactive Call Panel */}
          {selectedRoom && (
            <LiveVideoAudioCall
              roomId={selectedRoom.id}
              roomName={selectedRoom.name}
              members={selectedRoom.members || []}
            />
          )}

          {/* 2. Pomodoro Timer Box */}
          <div className="glass-card rounded-[36px] p-6 sm:p-8 shadow-soft border border-slate-200/80 dark:border-slate-800 text-center space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Mode Switchers */}
            <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => switchMode('FOCUS')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  mode === 'FOCUS'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🧠 تركيز (25 دقيقة)
              </button>
              <button
                type="button"
                onClick={() => switchMode('SHORT_BREAK')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  mode === 'SHORT_BREAK'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                ☕ استراحة قصيرة (5 دقائق)
              </button>
              <button
                type="button"
                onClick={() => switchMode('LONG_BREAK')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  mode === 'LONG_BREAK'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🌿 استراحة طويلة (15 دقيقة)
              </button>
            </div>

            {/* Digital Clock Display */}
            <div className="space-y-1">
              <span className="font-mono text-6xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-wider">
                {formatTime(timeLeft)}
              </span>
              <p className="text-xs font-bold text-slate-400">
                جلسات التركيز المكتملة اليوم: <span className="text-purple-600 dark:text-purple-400 font-black">{completedSessions} 🎯</span>
              </p>
            </div>

            {/* Timer Actions */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-8 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 ${
                  isRunning
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-glow'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>إيقاف مؤقت</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>بدء جلسة المذاكرة 🚀</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchMode(mode)}
                className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Ambient Sound Synthesizer Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">أصوات التركيز:</span>
                {[
                  { id: 'rain', label: '🌧️ مطر' },
                  { id: 'waves', label: '🌊 أمواج' },
                  { id: 'meditation', label: '🧘 هدوء' },
                ].map((track) => (
                  <button
                    key={track.id}
                    onClick={() => {
                      setAmbientTrack(track.id as any);
                      if (isPlayingAudio) {
                        stopAmbientSound();
                        setTimeout(startAmbientSound, 100);
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      ambientTrack === track.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {track.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={toggleAmbientSound}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition ${
                  isPlayingAudio
                    ? 'bg-emerald-500 text-white shadow-md animate-pulse'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span>{isPlayingAudio ? 'صوت التركيز يعمل' : 'تشغيل الصوت الهادئ'}</span>
              </button>
            </div>
          </div>

          {/* 3. Interactive Collaborative Whiteboard */}
          <div className="glass-card rounded-[36px] p-5 sm:p-6 shadow-soft border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                  ✏️
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white font-tajawal leading-none">
                    السبورة الرياضية التفاعلية
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    ارسم واكتب خطوات المسألة بالقلم لمشاركتها مع زميلك في الغرفة
                  </p>
                </div>
              </div>

              {/* Whiteboard Controls */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['#60a5fa', '#f59e0b', '#10b981', '#f43f5e', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setPenColor(c);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${
                      penColor === c && !isEraser ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-80'
                    }`}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setIsEraser(!isEraser)}
                  title="ممحاة"
                  className={`p-2 rounded-xl text-xs font-bold transition ${
                    isEraser ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={clearCanvas}
                  title="مسح السبورة"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={downloadCanvas}
                  title="تنزيل الرسمة"
                  className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-[320px] cursor-crosshair touch-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-tajawal">
              إنشاء غرفة مذاكرة جديدة
            </h3>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الغرفة:
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="مثال: مراجعة نهائية في التفاضل والتكامل..."
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المادة:
                </label>
                <select
                  value={newRoomTopic}
                  onChange={(e) => setNewRoomTopic(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  <option value="calculus">تفاضل وتكامل</option>
                  <option value="physics">فيزياء كهربية</option>
                  <option value="mechanics">ميكانيكا واستاتيكا</option>
                  <option value="algebra">جبر وهندسة فراغية</option>
                  <option value="general">مذاكرة عامة</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creatingRoom || !newRoomName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition disabled:opacity-50"
                >
                  {creatingRoom ? 'جاري الإنشاء...' : 'إنشاء الغرفة والدخول 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && selectedRoom && (
        <StudyRoomInviteModal
          roomId={selectedRoom.id}
          roomName={selectedRoom.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
