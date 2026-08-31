'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageSquareText, Search, SendHorizonal, Paperclip, Smile, ArrowLeft, CheckCheck, CircleDot, Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MessagesPageClient({ initialConversationId }: { initialConversationId?: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [partner, setPartner] = useState<any>(null);
  const [callMode, setCallMode] = useState<'audio' | 'video'>('audio');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [callError, setCallError] = useState('');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const { user: currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const stickers = [
    '�', '😁', '😃', '😄', '😅', '😂', '🤣', '😊', '😇', '😍', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '😤', '😡', '😠', '🤬', '😈', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '🗨️', '🗯️', '💭', '💤', '👋', '🤝', '👍', '👎', '👌', '🖕', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💪', '🦾', '🦿', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👂', '🧢', '🎉', '🎊', '✨', '🔥', '💫', '⚡', '✅', '❌', '⚠️', '🚀', '🌙', '☀️', '🌍', '🌈'
  ];

  const fetchConversations = async () => {
    const res = await fetch('/api/social/conversations');
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations || []);
      if (!selectedConversationId && data.conversations?.[0]?.id) {
        setSelectedConversationId(data.conversations[0].id);
      }
    }
  };

  const fetchConversation = async (conversationId: string) => {
    const res = await fetch(`/api/social/messages/${conversationId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
      setPartner(data.otherUser || null);
    }
  };

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => {
    if (initialConversationId) {
      setSelectedConversationId(initialConversationId);
    }
  }, [initialConversationId]);
  useEffect(() => {
    if (!selectedConversationId) return;
    fetchConversation(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!localVideoRef.current || !localStream) return;
    localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  const startCall = async (mode: 'audio' | 'video') => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCallError('المتصفح الحالي لا يدعم الاتصال بالصوت أو الفيديو في هذه الصفحة.');
      return;
    }

    if (location.protocol !== 'https:' && !/^localhost|127\.0\.0\.1|::1$/.test(location.hostname)) {
      setCallError('يجب استخدام HTTPS أو localhost للسماح بالاتصال بالصوت والفيديو.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mode === 'video',
      });

      setCallError('');
      setCallMode(mode);
      setVideoEnabled(mode === 'video');
      setIsMuted(false);
      setIsCallActive(true);
      setLocalStream(stream);
    } catch (error) {
      console.error('Unable to access microphone/camera:', error);

      const message =
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'تم رفض صلاحية الميكروفون أو الكاميرا. يُرجى السماح بالوصول في إعدادات المتصفح ثم حاول مرة أخرى.'
          : 'تعذّر استخدام الميكروفون أو الكاميرا. تأكد من السماح بالإذن ثم حاول مجددًا.';

      setCallError(message);
      setIsCallActive(false);
      setLocalStream(null);
    }
  };

  const endCall = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setIsCallActive(false);
    setIsMuted(false);
    setVideoEnabled(false);
    setCallError('');
  };

  const toggleMute = () => {
    if (!localStream) return;

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  };

  const toggleVideo = () => {
    if (!localStream) return;

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });

    setVideoEnabled((prev) => !prev);
  };

  const sendMessage = async (type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT', forceBody?: string) => {
    const messageText = (forceBody ?? draft).trim();
    if (!selectedConversationId || (!messageText && type === 'TEXT')) return;
    const formData = new FormData();
    formData.append('conversationId', selectedConversationId);
    formData.append('type', type);
    if (type === 'TEXT') formData.append('body', messageText);
    if (type === 'IMAGE' || type === 'FILE') {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;
      formData.append('file', file);
    }

    const res = await fetch('/api/social/messages', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      setDraft('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchConversation(selectedConversationId);
      await fetchConversations();
    }
  };

  const currentConversation = useMemo(() => conversations.find((c) => c.id === selectedConversationId) || null, [conversations, selectedConversationId]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">الرسائل</h1>
          <p className="text-xs text-slate-500">تواصل مباشر داخل المنصة</p>
        </div>
        <Link href="/friends" className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold">الأصدقاء</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4 rounded-3xl overflow-hidden border bg-white dark:bg-slate-900 shadow-soft">
        <aside className="border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 px-3 py-2">
              <Search className="w-4 h-4" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في المحادثات" className="bg-transparent flex-1 text-xs outline-none" />
            </div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[720px] overflow-y-auto">
            {conversations.filter((conversation) => conversation.title.toLowerCase().includes(search.toLowerCase())).map((conversation) => (
              <button key={conversation.id} onClick={() => setSelectedConversationId(conversation.id)} className={`w-full p-3 text-right transition ${selectedConversationId === conversation.id ? 'bg-brand-50 dark:bg-brand-950/30' : 'hover:bg-white/80 dark:hover:bg-slate-800/60'}`}>
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">
                      {conversation.otherParticipant?.avatar ? <img src={conversation.otherParticipant.avatar} alt={conversation.title} className="w-full h-full object-cover" /> : conversation.title?.charAt(0)}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${conversation.otherParticipant?.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm truncate">{conversation.title}</p>
                      {conversation.unread > 0 && <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{conversation.unread}</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{conversation.lastMessage?.body || 'بدء محادثة جديدة'}</p>
                    <p className="text-[10px] text-slate-400">{conversation.updatedAt ? new Date(conversation.updatedAt).toLocaleString() : 'الآن'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex flex-col min-h-[720px]">
          {currentConversation && partner ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">
                      {partner.avatar ? <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover" /> : partner.name?.charAt(0)}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${partner.isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{partner.name}</p>
                    <p className="text-[11px] text-slate-500">{partner.isOnline ? 'متصل الآن' : 'آخر ظهور قبل قليل'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startCall('audio')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-950/40 transition-colors"
                    aria-label="مكالمة صوتية"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startCall('video')}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-950/40 transition-colors"
                    aria-label="مكالمة فيديو"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {callError && (
                <div className="border-t border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-3">
                  <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                    {callError}
                  </div>
                </div>
              )}

              {isCallActive && (
                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-soft">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {callMode === 'video' ? 'مكالمة فيديو' : 'مكالمة صوتية'}
                        </p>
                        <p className="text-[11px] text-slate-500">جاري الاتصال مع {partner?.name || 'الصديق'}</p>
                      </div>
                      <button
                        onClick={endCall}
                        className="p-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                        aria-label="إنهاء المكالمة"
                      >
                        <PhoneOff className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video">
                        {callMode === 'video' ? (
                          <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-center text-xs text-slate-500">
                            {partner?.name || 'الصديق'}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                        <div className="text-center">
                          <p className="font-bold">انت متصل</p>
                          <p className="mt-1 text-[11px] text-slate-500">{callMode === 'video' ? 'الاتصال المرئي' : 'الاتصال الصوتي'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <button
                        onClick={toggleMute}
                        className={`p-2.5 rounded-xl ${isMuted ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                        aria-label={isMuted ? 'إعادة الصوت' : 'كتم الصوت'}
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      {callMode === 'video' && (
                        <button
                          onClick={toggleVideo}
                          className={`p-2.5 rounded-xl ${videoEnabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-rose-100 text-rose-600'}`}
                          aria-label={videoEnabled ? 'إيقاف الفيديو' : 'إعادة الفيديو'}
                        >
                          {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                {messages.map((message) => {
                  const isMine = message.senderId === currentUser?.id;
                  const isGifMessage = typeof message.body === 'string' && /^https?:\/\/.*\.(gif|webp|png|jpg|jpeg)(\?.*)?$/i.test(message.body.trim());
                  return (
                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${isMine ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}>
                        {message.body && !isGifMessage && <p className="text-sm leading-6 whitespace-pre-wrap">{message.body}</p>}
                        {isGifMessage && (
                          <div className="overflow-hidden rounded-xl">
                            <img src={message.body} alt="GIF" className="max-h-56 rounded-xl object-cover" />
                          </div>
                        )}
                        {message.attachments?.length > 0 && message.attachments.map((att: any) => (
                          <div key={att.id} className="mt-2 rounded-xl bg-white/10 p-2">
                            {att.fileType === 'image' ? <img src={att.fileUrl} alt={att.fileName} className="max-h-56 rounded-xl" /> : <a href={att.fileUrl} target="_blank" className="block text-xs underline">{att.fileName}</a>}
                          </div>
                        ))}
                        <div className="mt-2 flex items-center gap-2 text-[10px] opacity-80">
                          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMine && <CheckCheck className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="relative flex items-end gap-2">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"><Paperclip className="w-4 h-4" /></button>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStickerPicker((prev) => !prev)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    {showStickerPicker && (
                      <div className="absolute bottom-12 left-0 z-20 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 shadow-2xl">
                        <div className="grid grid-cols-5 gap-2">
                          {stickers.map((sticker) => (
                            <button
                              key={sticker}
                              type="button"
                              onClick={() => {
                                setDraft((prev) => `${prev}${prev ? ' ' : ''}${sticker}`);
                                setShowStickerPicker(false);
                              }}
                              className="flex h-12 items-center justify-center rounded-xl bg-slate-50 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-2xl transition-colors"
                            >
                              {sticker}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={() => sendMessage(fileInputRef.current?.files?.[0]?.type?.startsWith('image/') ? 'IMAGE' : 'FILE')} />
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={1} className="flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm outline-none" placeholder="اكتب رسالة..." />
                  <button onClick={() => sendMessage('TEXT')} className="p-3 rounded-2xl bg-brand-600 text-white"><SendHorizonal className="w-4 h-4" /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[720px] text-slate-500">اختر محادثة لبدء التواصل</div>
          )}
        </div>
      </div>
    </div>
  );
}
