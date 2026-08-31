'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  UserPlus,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Users,
  Radio,
  Share2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StudyRoomInviteModal from './StudyRoomInviteModal';

interface StudyMember {
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    currentStreak?: number;
  };
}

interface LiveVideoAudioCallProps {
  roomId: string;
  roomName: string;
  members: StudyMember[];
}

export default function LiveVideoAudioCall({
  roomId,
  roomName,
  members,
}: LiveVideoAudioCallProps) {
  const { user } = useAuth();

  // Media States
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Audio waveform volume level (0-100)
  const [audioLevel, setAudioLevel] = useState(0);

  // Video Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Toggle Microphone
  const toggleMicrophone = async () => {
    try {
      if (isMicOn) {
        // Stop audio tracks
        if (localStreamRef.current) {
          localStreamRef.current.getAudioTracks().forEach((track) => track.stop());
        }
        setIsMicOn(false);
        setAudioLevel(0);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (localStreamRef.current) {
          localStreamRef.current.addTrack(stream.getAudioTracks()[0]);
        } else {
          localStreamRef.current = stream;
        }

        // Setup Audio Analyser for speaking animation
        setupAudioAnalyser(stream);
        setIsMicOn(true);
      }
    } catch (err: any) {
      console.error('Microphone access error:', err);
      alert('يرجى السماح بصلاحية الميكروفون في المتصفح للتحدث مع زميلك');
    }
  };

  // Setup Audio Waveform Analyser
  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.error('Analyser error:', e);
    }
  };

  // Toggle Camera Video
  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach((track) => track.stop());
        }
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
        }
        setIsVideoOn(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        if (localStreamRef.current) {
          localStreamRef.current.addTrack(stream.getVideoTracks()[0]);
        } else {
          localStreamRef.current = stream;
        }

        setIsVideoOn(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      alert('يرجى السماح بصلاحية الكاميرا في المتصفح للمذاكرة بالفيديو');
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((t) => t.stop());
          screenStreamRef.current = null;
        }
        setIsScreenSharing(false);
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (isVideoOn) {
            toggleVideo();
          }
        };
      }
    } catch (err: any) {
      console.warn('Screen share cancelled or denied:', err);
    }
  };

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Filter other room members
  const otherMembers = members.filter((m) => m.user.id !== user?.id);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-[32px] p-4 sm:p-6 shadow-2xl space-y-4 font-tajawal">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>بث حي تفاعلي ⚡</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 font-bold">
            <Users className="w-4 h-4 text-brand-400" />
            <span>{members.length} في الغرفة</span>
          </div>
        </div>

        {/* Invite Friend Button */}
        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>دعوة زميل للمذاكرة 📲</span>
        </button>
      </div>

      {/* Video & Audio Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[220px]">
        {/* 1. Local Student Tile (User) */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center group">
          {/* Live Video Camera Stream */}
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover mirror ${
              isVideoOn || isScreenSharing ? 'block' : 'hidden'
            }`}
          />

          {/* Fallback Avatar when Camera is off */}
          {!isVideoOn && !isScreenSharing && (
            <div className="flex flex-col items-center gap-3">
              <div
                className={`relative w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-xl transition-all duration-150 ${
                  audioLevel > 15 ? 'ring-8 ring-emerald-500/50 scale-105' : ''
                }`}
              >
                {user?.name?.charAt(0) || 'أ'}
                {/* Audio Waveform Pulse Rings */}
                {isMicOn && audioLevel > 10 && (
                  <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none" />
                )}
              </div>

              <div className="text-center">
                <span className="text-sm font-black text-slate-100">{user?.name || 'أنت'}</span>
                <span className="text-[10px] text-slate-400 block font-bold">
                  {isMicOn ? (audioLevel > 15 ? 'يتحدث الآن 🎙️' : 'الميكروفون مفعل 🟢') : 'الميكروفون مغلق 🔇'}
                </span>
              </div>
            </div>
          )}

          {/* Local Stream Overlay Badges */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
              أنت (المضيف 👑)
            </span>
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {/* Audio Indicator */}
            <div
              className={`p-2 rounded-xl backdrop-blur-md border ${
                isMicOn
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                  : 'bg-rose-500/30 border-rose-400 text-rose-300'
              }`}
            >
              {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </div>

            {/* Video Indicator */}
            <div
              className={`p-2 rounded-xl backdrop-blur-md border ${
                isVideoOn
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                  : 'bg-rose-500/30 border-rose-400 text-rose-300'
              }`}
            >
              {isVideoOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
            </div>
          </div>
        </div>

        {/* 2. Remote Classmate / Study Partner Tile */}
        {otherMembers.length > 0 ? (
          otherMembers.map((m, idx) => (
            <div
              key={m.user.id || idx}
              className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                  {m.user.name?.charAt(0) || 'ز'}
                </div>
                <div className="text-center">
                  <span className="text-sm font-black text-slate-100">{m.user.name}</span>
                  <span className="text-[10px] text-emerald-400 block font-bold">
                    متصل ويذاكر معك الآن 🎧
                  </span>
                </div>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-slate-200 text-[11px] font-bold border border-white/10">
                  {m.user.name}
                </span>
              </div>

              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/30 border border-emerald-400 text-emerald-300">
                  <Mic className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty Partner Slot with Invite Callout */
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-950/60 border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
              <Users className="w-7 h-7 text-brand-400" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-200">في انتظار انضمام زميلك 🤝</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                شارك رابط الغرفة أو اضغط زر الدعوة لمذاكرة ومراجعة المواد والامتحانات سوياً عبر الصوت والفيديو.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 border border-brand-500/30 text-xs font-black flex items-center gap-2 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>إرسال دعوة لزميل الآن</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Media Control Bar */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {/* Microphone Toggle */}
        <button
          type="button"
          onClick={toggleMicrophone}
          className={`p-3.5 sm:px-5 sm:py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition hover:scale-105 active:scale-95 ${
            isMicOn
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
          }`}
          title={isMicOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون'}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          <span className="hidden sm:inline">{isMicOn ? 'الميكروفون يعمل' : 'الميكروفون مكتوم'}</span>
        </button>

        {/* Camera Video Toggle */}
        <button
          type="button"
          onClick={toggleVideo}
          className={`p-3.5 sm:px-5 sm:py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition hover:scale-105 active:scale-95 ${
            isVideoOn
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title={isVideoOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          <span className="hidden sm:inline">{isVideoOn ? 'الكاميرا تعمل' : 'تشغيل الكاميرا'}</span>
        </button>

        {/* Screen Share Toggle */}
        <button
          type="button"
          onClick={toggleScreenShare}
          className={`p-3.5 sm:px-5 sm:py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition hover:scale-105 active:scale-95 ${
            isScreenSharing
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title={isScreenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة لمراجعة الشيت والمذكرات'}
        >
          {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          <span className="hidden sm:inline">{isScreenSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}</span>
        </button>

        {/* Speaker Mute */}
        <button
          type="button"
          onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
          className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 shadow-md transition"
          title={isSpeakerMuted ? 'إلغاء كتم الصوت' : 'كتم صوت الغرفة'}
        >
          {isSpeakerMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <StudyRoomInviteModal
          roomId={roomId}
          roomName={roomName}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
