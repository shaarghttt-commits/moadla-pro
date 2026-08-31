'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  duration?: number;
  compact?: boolean;
}

export default function AudioPlayer({ src, duration: initialDuration, compact = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(Math.floor(audio.duration));
      }
    };

    audio.ontimeupdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const togglePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.5, 2];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    audioRef.current.playbackRate = nextRate;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={`rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 p-2.5 sm:p-3 flex items-center gap-3 backdrop-blur-md ${compact ? 'max-w-xs' : 'w-full max-w-sm'}`}>
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
      </button>

      {/* Progress & Waveform Track */}
      <div className="flex-1 space-y-1">
        {/* Animated wave bars mock when playing */}
        <div className="flex items-center gap-0.5 h-4 px-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const progressRatio = duration > 0 ? currentTime / duration : 0;
            const barIndexRatio = i / 24;
            const isPassed = barIndexRatio <= progressRatio;
            const waveHeight = isPlaying ? (Math.sin(i * 0.8 + currentTime * 4) * 0.5 + 0.5) * 12 + 4 : (i % 3 === 0 ? 12 : i % 2 === 0 ? 8 : 4);

            return (
              <span
                key={i}
                style={{ height: `${waveHeight}px` }}
                className={`flex-1 rounded-full transition-all duration-75 ${
                  isPassed
                    ? 'bg-brand-600 dark:bg-brand-400'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Time slider */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || 0)}</span>
        </div>
      </div>

      {/* Playback Speed Multiplier */}
      <button
        type="button"
        onClick={togglePlaybackRate}
        className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-brand-50 hover:text-brand-600 text-[10px] font-black text-slate-700 dark:text-slate-200 transition shrink-0"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
