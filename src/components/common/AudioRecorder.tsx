'use client';

import React, { useState, useRef } from 'react';
import { Mic, Square, Trash2, Send, Loader2, Check } from 'lucide-react';

interface AudioRecorderProps {
  onAudioRecorded: (audioUrl: string, durationSeconds: number) => void;
  onCancel?: () => void;
}

export default function AudioRecorder({ onAudioRecorded, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Upload to social upload API
        setIsUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', audioBlob, `voice-${Date.now()}.webm`);

          const res = await fetch('/api/social/upload', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            const audioUrl = data.url || data.secure_url;
            onAudioRecorded(audioUrl, recordingSeconds);
          } else {
            // Fallback to object URL
            const blobUrl = URL.createObjectURL(audioBlob);
            onAudioRecorded(blobUrl, recordingSeconds);
          }
        } catch (e) {
          const blobUrl = URL.createObjectURL(audioBlob);
          onAudioRecorded(blobUrl, recordingSeconds);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('يرجى السماح بالوصول للميكروفون لتسجيل الصوت');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (onCancel) onCancel();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 animate-scale-up">
      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition shadow-sm"
        >
          <Mic className="w-4 h-4" />
          <span>بدء التسجيل الصوتي</span>
        </button>
      ) : (
        <>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="text-xs font-black text-rose-600 font-mono">
              {formatTime(recordingSeconds)}
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            disabled={isUploading}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>إتمام</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={cancelRecording}
            className="p-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-600 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </>
      )}

      {errorMsg && (
        <span className="text-xs font-bold text-rose-600">{errorMsg}</span>
      )}
    </div>
  );
}
