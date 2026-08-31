"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Msg = {
  id: string;
  userId?: string | null;
  name?: string | null;
  text?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  mimeType?: string | null;
  fileSize?: string | null;
  createdAt: string;
};

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const lastSinceRef = useRef<string | undefined>(undefined);
  const mounted = useRef(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mounted.current = true;
    const t = setInterval(fetchNew, 1000);
    fetchNew();
    // fetch current user info for edit/delete permissions
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        if (!r.ok) return;
        const j = await r.json();
        if (j?.user) {
          setCurrentUserId(j.user.id ?? null);
          setCurrentUserName(j.user.name ?? null);
        }
      } catch (e) {
        // ignore
      }
    })();
    // send initial presence and periodic heartbeat
    fetch('/api/chat/presence', { method: 'POST', body: '{}' }).catch(() => {});
    const hb = setInterval(() => fetch('/api/chat/presence', { method: 'POST', body: '{}' }).catch(() => {}), 15000);
    return () => {
      mounted.current = false;
      clearInterval(t);
      clearInterval(hb);
    };
  }, []);

  async function fetchNew() {
    try {
      const url = '/api/chat' + (lastSinceRef.current ? `?since=${encodeURIComponent(lastSinceRef.current)}` : '');
      const r = await fetch(url);
      if (!r.ok) return;
      const data = await r.json();
      const msgs: Msg[] = data.messages || [];
      if (msgs.length > 0) {
        // dedupe incoming msgs by id (preserve order)
        const seen = new Set<string>();
        const uniqueIncoming: Msg[] = [];
        for (const m of msgs) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            uniqueIncoming.push(m);
          }
        }

        lastSinceRef.current = uniqueIncoming[uniqueIncoming.length - 1].createdAt;
        setMessages((prev) => {
          const existing = new Set(prev.map((m) => m.id));
          const filtered = uniqueIncoming.filter((m) => !existing.has(m.id));
          return [...prev, ...filtered];
        });
        // scroll to bottom
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
      } else if (!lastSinceRef.current && msgs.length === 0 && messages.length === 0) {
        // initial load, get all
        const all = await fetch('/api/chat');
        const j = await all.json();
        const incoming: Msg[] = j.messages || [];
        // dedupe initial list
        const seenInit = new Set<string>();
        const uniqueInit: Msg[] = [];
        for (const m of incoming) {
          if (!seenInit.has(m.id)) {
            seenInit.add(m.id);
            uniqueInit.push(m);
          }
        }
        setMessages(uniqueInit);
      }
    } catch (e) {
      console.error('chat fetch', e);
    }
  }

  async function send() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (r.ok) {
        setText('');
        // optimistic refresh
        await fetchNew();
      }
    } catch (e) {
      console.error('send', e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  // upload file and send message with attachment
  async function handleFileInput(file: File | null) {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const r = await fetch('/api/chat/upload', { method: 'POST', body: fd });
      if (!r.ok) return;
      const j = await r.json();
      if (j.error) return;
      // send chat message referencing uploaded file
      const sendBody: any = { text: '', fileUrl: j.fileUrl, fileName: j.fileName, mediaId: j.mediaId, mimeType: j.mimeType, fileSize: j.fileSize, fileType: j.fileUrl?.includes('chat_images') ? 'image' : 'doc' };
      const r2 = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sendBody) });
      if (r2.ok) {
        await fetchNew();
      }
    } catch (e) {
      console.error('upload', e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }

  // edit message
  function startEdit(m: Msg) {
    if (!m) return;
    setEditingId(m.id);
    setEditText(m.text || '');
  }

  async function saveEdit() {
    if (!editingId) return;
    const textToSave = String(editText || '').trim();
    if (!textToSave) return;
    try {
      const r = await fetch(`/api/chat/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: textToSave }) });
      if (r.ok) {
        const j = await r.json();
        const updated = j.message;
        setMessages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setEditingId(null);
        setEditText('');
      } else {
        console.error('edit failed', await r.text());
      }
    } catch (e) {
      console.error('saveEdit', e);
    }
  }

  async function deleteMsg(id: string) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذه الرسالة؟')) return;
    try {
      const r = await fetch(`/api/chat/${id}`, { method: 'DELETE' });
      if (r.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } else {
        const txt = await r.text();
        let parsed: any = null;
        try {
          parsed = JSON.parse(txt);
        } catch (_) {
          // not JSON
        }
        if (parsed?.error === 'not_found') {
          // message missing on server — remove locally to keep UI consistent
          setMessages((prev) => prev.filter((m) => m.id !== id));
          console.warn('delete: message not found on server, removed locally');
        } else if (parsed?.error === 'forbidden') {
          alert('ليس لديك صلاحية حذف هذه الرسالة');
        } else {
          console.error('delete failed', parsed ?? txt);
        }
      }
    } catch (e) {
      console.error('deleteMsg', e);
    }
  }

  // emoji picker: small set
  const emojiList = ['😀','😂','😍','👍','🎉','😢','🔥','🙏','😎','🤔'];
  const [showEmoji, setShowEmoji] = useState(false);
  function insertEmoji(e: string) {
    setText((t) => (t || '') + e);
    setShowEmoji(false);
  }

  return (
    <div className="border rounded p-3 bg-white max-w-2xl mx-auto">
      <h3 className="font-semibold mb-2">المحادثة الجماعية</h3>
      <div ref={scrollRef} className="h-64 overflow-y-auto border p-2 mb-2 bg-gray-50">
        {(() => {
          const seen = new Set<string>();
          const unique: Msg[] = [];
          for (const m of messages) {
            if (!seen.has(m.id)) {
              seen.add(m.id);
              unique.push(m);
            } else {
              console.warn('Duplicate chat message id filtered:', m.id);
            }
          }
          return unique.map((m) => (
            <div key={m.id} className="mb-2">
              <div className="flex justify-between items-start">
                <div className="text-xs text-gray-500">{m.name ?? 'مستخدم'} · {new Date(m.createdAt).toLocaleTimeString()}</div>
                <div>
                  {m.userId && currentUserId === m.userId && (
                    <>
                      <button onClick={() => startEdit(m)} className="text-xs text-blue-600 mr-2">تعديل</button>
                      <button onClick={() => deleteMsg(m.id)} className="text-xs text-red-600">حذف</button>
                    </>
                  )}
                </div>
              </div>
              {editingId === m.id ? (
                <div className="mt-2">
                  <textarea className="w-full border rounded p-2 mb-2" value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditingId(null); setEditText(''); }} className="px-2 py-1 border rounded">إلغاء</button>
                    <button onClick={saveEdit} className="px-2 py-1 bg-green-600 text-white rounded">حفظ</button>
                  </div>
                </div>
              ) : (
                <>
                  {m.text && <div className="text-sm">{m.text}</div>}
                  {m.fileUrl && (
                    <div className="mt-1">
                      {m.fileType === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.fileUrl} alt={m.fileName || 'image'} className="max-w-full rounded" />
                      ) : (
                        <a className="text-sm text-blue-600 underline" href={m.fileUrl} target="_blank" rel="noreferrer">{m.fileName || 'ملف'}</a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ));
        })()}
        {messages.length === 0 && <div className="text-center text-sm text-gray-500">لا توجد رسائل بعد</div>}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border rounded px-2 py-1" placeholder="اكتب رسالتك..." />
          <div className="relative">
            <button type="button" onClick={() => setShowEmoji((s) => !s)} aria-label="Open emoji picker" className="w-10 h-10 flex items-center justify-center border rounded mr-1 bg-white"> 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="1.5" fill="#FEF3C7" />
                <path d="M8.5 10.5h.01M15.5 10.5h.01" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 15c1-1 3-1 4 0" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showEmoji && (
              <div className="absolute right-0 mt-1 p-2 bg-white border rounded shadow z-50 grid grid-cols-5 gap-1" style={{ minWidth: 160 }}>
                {emojiList.map((e) => (
                  <button key={e} onClick={() => insertEmoji(e)} className="p-1 text-lg">{e}</button>
                ))}
              </div>
            )}
          </div>
          <label className="px-3 py-1 bg-gray-200 border rounded cursor-pointer">
            📎
            <input onChange={(ev) => handleFileInput(ev.target.files?.[0] ?? null)} type="file" className="hidden" />
          </label>
          <button onClick={send} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded">إرسال</button>
        </div>
      </div>
    </div>
  );
}
